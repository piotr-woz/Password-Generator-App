import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MainComponent } from './main.component';
import { By } from '@angular/platform-browser';
import { Renderer2, ElementRef } from '@angular/core';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('default state of a properties in the component class', () => {
    it('should initially return empty string - inputValue and password', () => {
      expect(component.inputValue()).toEqual('');
      expect(component.password()).toEqual('');
    });

    it('should initially return zero - passwordLength', () => {
      expect(component.passwordLength()).toEqual(0);
    });

    it('should initially return false - passwordIsCopied and checkboxState', () => {
      expect(component.passwordIsCopied()).toBeFalse();
      expect(component.checkboxState().includeLetters).toBeFalse();
      expect(component.checkboxState().includeNumbers).toBeFalse();
      expect(component.checkboxState().includeSymbols).toBeFalse();
    });

    it('should initially return "copy" - passwordIsCopiedText', () => {
      expect(component.passwordIsCopiedText()).toEqual('copy');
    });
  });

  describe('ngOnInit()', () => {
    afterEach(() => {
      sessionStorage.clear();
    });

    it('should load checkbox state from sessionStorage', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(
        JSON.stringify({
          includeLetters: true,
          includeNumbers: true,
          includeSymbols: true,
        })
      );
      component.ngOnInit();
      expect(component.checkboxState().includeLetters).toBeTrue();
      expect(component.checkboxState().includeNumbers).toBeTrue();
      expect(component.checkboxState().includeSymbols).toBeTrue();
    });

    it('should keep checkboxState() unchanged when checkboxState is invalid JSON', () => {
      sessionStorage.setItem('checkboxState', 'invalid_json');
      expect(() => component.ngOnInit()).toThrowError(SyntaxError);
    });
  });

  describe('saveCheckboxState()', () => {
    it('should save checkbox state to sessionStorage', () => {
      spyOn(sessionStorage, 'setItem');
      component['saveCheckboxState']();
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'checkboxState',
        jasmine.any(String)
      );
    });
  });

  describe('ngAfterViewInit', () => {
    let component: MainComponent;
    let rendererMock: jasmine.SpyObj<Renderer2>;
    let elementRefMock: ElementRef;

    beforeEach(() => {
      rendererMock = jasmine.createSpyObj('Renderer2', ['listen']);
      elementRefMock = {
        nativeElement: document.createElement('div'),
      };

      rendererMock.listen.and.callFake((target, eventName, callback) => {
        if (target === 'document' && eventName === 'keydown') {
          document.addEventListener('keydown', callback as EventListener);
        }
        return () =>
          document.removeEventListener('keydown', callback as EventListener);
      });

      component = new MainComponent(rendererMock, elementRefMock);
    });

    afterEach(() => {
      rendererMock.listen.calls.reset();
    });

    it('should focus and click the generate button when Enter is pressed', () => {
      const button = document.createElement('button');
      button.classList.add('generate-button');
      elementRefMock.nativeElement.appendChild(button);
      spyOn(button, 'focus');
      spyOn(button, 'click');

      component.ngAfterViewInit();

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);

      expect(button.focus).toHaveBeenCalled();
      expect(button.click).toHaveBeenCalled();
    });

    it('should reload the app when Escape is pressed', () => {
      spyOn(history, 'go');

      component.ngAfterViewInit();

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(history.go).toHaveBeenCalled();
    });
  });

  describe('resetApp()', () => {
    it('should reload the app', () => {
      spyOn(history, 'go');
      component.resetApp();
      expect(history.go).toHaveBeenCalled();
    });
  });

  describe('onEnterPasswordLength()', () => {
    it('should set password length if valid input is provided', () => {
      const event = { target: { value: '10' } } as unknown as Event;
      component.onEnterPasswordLength(event);
      expect(component.passwordLength()).toBe(10);
    });

    it('should not set password length if invalid input is provided', () => {
      let event = { target: { value: '101' } } as unknown as Event;
      component.onEnterPasswordLength(event);
      expect(component.passwordLength()).toBe(0);
      event = { target: { value: '-1' } } as unknown as Event;
      component.onEnterPasswordLength(event);
      expect(component.passwordLength()).toBe(0);
      event = { target: { value: '010' } } as unknown as Event;
      component.onEnterPasswordLength(event);
      expect(component.passwordLength()).toBe(0);
      event = { target: { value: 'abc' } } as unknown as Event;
      component.onEnterPasswordLength(event);
      expect(component.passwordLength()).toBe(0);
    });

    it('should bind input value correctly', () => {
      spyOn(component, 'inputValue').and.returnValue('expected value');
      fixture.detectChanges();

      const inputElement: HTMLInputElement = fixture.debugElement.query(
        By.css('.input-password-length__input')
      ).nativeElement;
      expect(inputElement.value).toBe('expected value');
    });
  });

  describe('onClearPasswordLength()', () => {
    it('should clear password and input fields', () => {
      component.inputValue.set('4');
      component.passwordLength.set(4);
      component.password.set('test');
      component.onClearPasswordLength();
      expect(component.inputValue()).toBe('');
      expect(component.passwordLength()).toBe(0);
      expect(component.password()).toBe('');
    });
  });

  describe('onChangeCheckboxState', () => {
    it('should toggle checkbox state and save to sessionStorage', () => {
      spyOn(sessionStorage, 'setItem');
      component.onChangeCheckboxState('Letters');
      expect(component.checkboxState().includeLetters).toBeTrue();
      expect(sessionStorage.setItem).toHaveBeenCalled();
      component.onChangeCheckboxState('Letters');
      expect(component.checkboxState().includeLetters).toBeFalse();
      expect(sessionStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('shuffleString', () => {
    it('should shuffle string correctly', () => {
      const input = 'abcdef';
      const shuffled = component.shuffleString(input);
      expect(shuffled.length).toBe(input.length);
      expect(shuffled).not.toBe(input);
      expect([...shuffled].sort()).toEqual([...input].sort());
    });
  });

  describe('onGeneratePassword()', () => {
    it('should generate a password of the correct length', () => {
      component.passwordLength.set(10);
      component.checkboxState.set({
        includeLetters: true,
        includeNumbers: true,
        includeSymbols: true,
      });
      component.onGeneratePassword();
      expect(component.password().length).toBe(10);
    });

    it('should include letters when enabled', () => {
      component.passwordLength.set(10);
      component.checkboxState.set({
        includeLetters: true,
        includeNumbers: false,
        includeSymbols: false,
      });
      component.onGeneratePassword();
      expect(/[a-zA-Z]/.test(component.password())).toBeTrue();
    });

    it('should include numbers when enabled', () => {
      component.passwordLength.set(10);
      component.checkboxState.set({
        includeLetters: false,
        includeNumbers: true,
        includeSymbols: false,
      });
      component.onGeneratePassword();
      expect(/[0-9]/.test(component.password())).toBeTrue();
    });

    it('should include symbols when enabled', () => {
      component.passwordLength.set(10);
      component.checkboxState.set({
        includeLetters: false,
        includeNumbers: false,
        includeSymbols: true,
      });
      component.onGeneratePassword();
      expect(/[!@#$%^&*()[\]]/.test(component.password())).toBeTrue();
    });

    describe('onCopyToClipboard()', () => {
      it('should copy the password to the clipboard and update the UI state accordingly', fakeAsync(() => {
        spyOn(navigator.clipboard, 'writeText').and.returnValue(
          Promise.resolve()
        );
        component.password.set('TestPassword123');
        component.onCopyToClipboard();
        tick();
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'TestPassword123'
        );
        expect(component.passwordIsCopied()).toBeTrue();
        expect(component.passwordIsCopiedText()).toEqual('copied');
        tick(1000);
        expect(component.passwordIsCopied()).toBeFalse();
        expect(component.passwordIsCopiedText()).toEqual('copy');
      }));
    });
  });
});
