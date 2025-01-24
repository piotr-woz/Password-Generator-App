import { Component, signal } from '@angular/core';
import { CheckboxState } from './input-state.model';
import { NgClass } from '@angular/common';

const passwordChars = {
  letters: 'abcdefghijklmnopqrstuvwyz',
  numbers: '1234567890',
  symbols: '!@#$%^&*()[]',
};

@Component({
  selector: 'app-root',
  imports: [NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  passwordLength = signal<number>(0);
  password = signal<string>('');
  passwordIsCopied = signal<boolean>(false);

  checkboxState = signal<CheckboxState>({
    includeLetters: false,
    includeNumbers: false,
    includeSymbols: false,
  });

  // password length input - changing password length according to entered value with appropriate validation
  onChangePasswordLength(event: any): void {
    const parsedValue = parseInt(event.target.value);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      this.passwordLength.set(parsedValue);
    } else {
      this.passwordLength.set(0);
    }
  }

  // password length input - taking reset actions on input focus
  onClearPasswordLengthInput() {
    this.passwordLength.set(0);
    this.password.set('');
  }

  // changing state of three checkboxes - each separately
  onChangeCheckboxState(inputType: string): void {
    const key = `include${inputType}` as keyof CheckboxState;
    this.checkboxState.set({
      ...this.checkboxState(),
      [key]: !this.checkboxState()[key],
    });
  }

  // additional string mixing using Knuth Shuffle (Fisher-Yates Shuffle) Algorithm
  shuffleString(validChars: string): string {
    const arr = validChars.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  // generating a random password according to selected checkboxes after click
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

  // copying password to clipboard after click
  onCopyToClipboard() {
    navigator.clipboard
      .writeText(this.password())
      .then(() => {
        this.passwordIsCopied.set(true);
        setTimeout(() => {
          this.passwordIsCopied.set(false);
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }
}
