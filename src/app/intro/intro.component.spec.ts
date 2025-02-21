import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IntroComponent } from './intro.component';
import { By } from '@angular/platform-browser';

describe('IntroComponent', () => {
  let component: IntroComponent;
  let fixture: ComponentFixture<IntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IntroComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('isIntroHidden()', () => {
    it('should react to isIntroHidden signal change', () => {
      component.isIntroHidden.set(true);
      expect(component.isIntroHidden()).toBeTrue();
      component.isIntroHidden.set(false);
      expect(component.isIntroHidden()).toBeFalse();
    });

    it('should initially return false', () => {
      expect(component.isIntroHidden()).toBeFalse();
    });

    it('should return true after calling onHideIntro()', () => {
      component.onHideIntro();
      expect(component.isIntroHidden()).toBeTrue();
    });
  });

  describe('ngClass binding', () => {
    it('should set "container--paused" class if isIntroHidden is false', () => {
      fixture.detectChanges();

      // First option:
      const container: HTMLElement = fixture.debugElement.query(
        By.css('.container')
      ).nativeElement;

      // Second option:
      // const compiled = fixture.nativeElement as HTMLElement;
      // const container = compiled.querySelector('.container');

      expect(container.classList).toContain('container--paused');
    });

    it('should set "container--running" class if isIntroHidden is true', () => {
      component.onHideIntro();
      fixture.detectChanges();

      const container: HTMLElement = fixture.debugElement.query(
        By.css('.container')
      ).nativeElement;
      expect(container.classList).toContain('container--running');
    });
  });

  describe('onCloseIntro()', () => {
    function createAnimationEvent(name: string): AnimationEvent {
      return { animationName: name, type: 'animationend' } as AnimationEvent;
    }

    it('should emit closed event when the animation ends and the event name includes "hide"', () => {
      spyOn(component.closed, 'emit');

      const animationEvent = createAnimationEvent('hide');
      component.onCloseIntro(animationEvent);
      expect(component.closed.emit).toHaveBeenCalled();
    });

    it('should not emit closed event when the animation name does not include "hide"', () => {
      spyOn(component.closed, 'emit');

      const animationEvent = createAnimationEvent('shuffleCharsEven');
      component.onCloseIntro(animationEvent);
      expect(component.closed.emit).not.toHaveBeenCalled();
    });
  });

  describe('HTML template rendering with @defer', () => {
    it('should render char-boxes with correct chars', async () => {
      await fixture.whenStable();

      const charBoxes = fixture.debugElement.queryAll(By.css('.char-box'));
      expect(charBoxes.length).toBe(2);

      const firstBoxChars =
        charBoxes[0].nativeElement.querySelectorAll('.char-box__char1');
      expect(firstBoxChars.length).toBe(8);
      expect(firstBoxChars[0].textContent).toBe('P');
      expect(firstBoxChars[1].textContent).toBe('a');
      expect(firstBoxChars[2].textContent).toBe('s');
      expect(firstBoxChars[3].textContent).toBe('s');
      expect(firstBoxChars[4].textContent).toBe('w');
      expect(firstBoxChars[5].textContent).toBe('o');
      expect(firstBoxChars[6].textContent).toBe('r');
      expect(firstBoxChars[7].textContent).toBe('d');

      const secondBoxChars =
        charBoxes[1].nativeElement.querySelectorAll('.char-box__char2');
      expect(secondBoxChars.length).toBe(9);
      expect(secondBoxChars[0].textContent).toBe('G');
      expect(secondBoxChars[1].textContent).toBe('e');
      expect(secondBoxChars[2].textContent).toBe('n');
      expect(secondBoxChars[3].textContent).toBe('e');
      expect(secondBoxChars[4].textContent).toBe('r');
      expect(secondBoxChars[5].textContent).toBe('a');
      expect(secondBoxChars[6].textContent).toBe('t');
      expect(secondBoxChars[7].textContent).toBe('o');
      expect(secondBoxChars[8].textContent).toBe('r');
    });
  });
});
