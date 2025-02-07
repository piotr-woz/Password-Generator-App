import {
  Component,
  signal,
  ElementRef,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import { CheckboxState } from './input-state.model';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

const passwordChars = {
  letters: 'abcdefghijklmnopqrstuvwyz',
  numbers: '1234567890',
  symbols: '!@#$%^&*()[]',
};

const numbersArray = ['5', '10', '15', '20', '25'];

@Component({
  selector: 'app-main',
  imports: [NgClass, MatIconModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements AfterViewInit {
  inputValue = signal('');
  passwordLength = signal(0);
  buttonsWithNumbers = numbersArray;
  password = signal('');
  passwordIsCopied = signal(false);
  passwordIsCopiedText = signal('copy');

  checkboxState = signal<CheckboxState>({
    includeLetters: false,
    includeNumbers: false,
    includeSymbols: false,
  });

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  // Listens for the "Enter" key press on the entire document
  // If the generate button is active, it focuses and clicks it
  ngAfterViewInit() {
    this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const button = this.el.nativeElement.querySelector('.generate-button');
        if (button && !button.disabled) {
          button.focus();
          button.click();
        }
      }
    });
  }

  // Fully reloads the app when clicking the title
  resetApp() {
    window.location.reload();
  }

  // Handles password length input: updates the password length with validation
  onEnterPasswordLength(event: Event): void {
    const target = event.target as HTMLInputElement;
    const inputValue = target.value;
    this.inputValue.set(inputValue);

    if (/^[1-9]\d*$/.test(inputValue)) {
      const inputValueInt = parseInt(inputValue, 10);
      this.passwordLength.set(inputValueInt);
    } else {
      this.passwordLength.set(0);
    }
  }

  // Resets password and password length input field on focus
  onClearPasswordLength() {
    this.inputValue.set('');
    this.password.set('');
  }

  // Modifies password length based on button action:
  // - Increments or decrements within limits
  // - Sets predefined values (5, 10, 15, 20, 25)
  onChangePasswordLength(event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    const action = button.dataset['count'];

    if (
      action === 'add' &&
      this.passwordLength() >= 0 &&
      this.passwordLength() < 100
    ) {
      this.passwordLength.update((value) => value + 1);
    } else if (action === 'subtract' && this.passwordLength() > 0) {
      this.passwordLength.update((value) => value - 1);
    } else if (['5', '10', '15', '20', '25'].includes(action!)) {
      this.passwordLength.set(Number(action));
    }

    this.inputValue.set(this.passwordLength().toString());
  }

  // Updates the state of a specific checkbox (letters, numbers, or symbols)
  onChangeCheckboxState(inputType: string): void {
    const key = `include${inputType}` as keyof CheckboxState;
    this.checkboxState.set({
      ...this.checkboxState(),
      [key]: !this.checkboxState()[key],
    });
  }

  // Randomly shuffles characters in a string using the Fisher-Yates algorithm
  shuffleString(validChars: string): string {
    const arr = validChars.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  // Generates a random password based on selected character types and length
  onGeneratePassword() {
    let validChars = '';

    this.checkboxState().includeLetters
      ? (validChars +=
          passwordChars.letters + passwordChars.letters.toUpperCase())
      : null;
    this.checkboxState().includeNumbers
      ? (validChars += passwordChars.numbers + passwordChars.numbers)
      : null;
    this.checkboxState().includeSymbols
      ? (validChars += passwordChars.symbols + passwordChars.symbols)
      : null;

    const shuffleChars = this.shuffleString(validChars);

    let generatedPassword = '';
    for (let i = 0; i < this.passwordLength(); i++) {
      const index = Math.floor(Math.random() * shuffleChars.length);
      generatedPassword += shuffleChars[index];
    }
    this.password.set(generatedPassword);
  }

  // Copies the generated password to the clipboard and shows a confirmation message
  onCopyToClipboard() {
    navigator.clipboard
      .writeText(this.password())
      .then(() => {
        this.passwordIsCopied.set(true);
        this.passwordIsCopiedText.set('copied');
        setTimeout(() => {
          this.passwordIsCopied.set(false);
          this.passwordIsCopiedText.set('copy');
        }, 1000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }
}
