import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  describe('isIntro() with ngOnInit()', () => {
    it('should react to isIntro signal change', () => {
      app.isIntro.set(false);
      expect(app.isIntro()).toBeFalse();
      app.isIntro.set(true);
      expect(app.isIntro()).toBeTrue();
    });

    it(`should keep isIntro as false when savedIntroState has value 'false'`, () => {
      sessionStorage.setItem('introSignalState', 'false');
      app.ngOnInit();
      expect(app.isIntro()).toBeFalse();
    });

    it('should keep isIntro as true when savedIntroState is null', () => {
      sessionStorage.removeItem('introSignalState');
      app.ngOnInit();
      expect(app.isIntro()).toBeTrue();
    });

    it('should keep isIntro as true when savedIntroState is invalid JSON', () => {
      sessionStorage.setItem('introSignalState', 'invalid_json');
      expect(() => app.ngOnInit()).toThrowError(SyntaxError);
    });
  });

  describe('onCloseIntro()', () => {
    it('should call onCloseIntro when <app-intro> emits (closed) if isIntro is true', () => {
      app.isIntro.set(true);
      fixture.detectChanges();
      spyOn(app, 'onCloseIntro');

      const introComponent =
        fixture.debugElement.nativeElement.querySelector('app-intro');
      const event = new Event('closed');
      introComponent.dispatchEvent(event);

      expect(app.onCloseIntro).toHaveBeenCalled();
    });

    it('should set isIntro to false and store it in sessionStorage when onCloseIntro is called', () => {
      app.onCloseIntro();
      expect(app.isIntro()).toBeFalse();
      expect(sessionStorage.getItem('introSignalState')).toEqual('false');
    });
  });
});
