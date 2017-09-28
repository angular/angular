import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {FakeViewportRuler} from '@angular/cdk/testing';
import {MatButtonModule} from './index';
import {MatRipple} from '@angular/material/core';


describe('MatButton', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatButtonModule],
      declarations: [TestApp],
      providers: [
        {provide: ViewportRuler, useClass: FakeViewportRuler},
      ]
    });

    TestBed.compileComponents();
  }));

  // General button tests
  it('should apply class based on color attribute', () => {
    let fixture = TestBed.createComponent(TestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let buttonDebugElement = fixture.debugElement.query(By.css('button'));
    let aDebugElement = fixture.debugElement.query(By.css('a'));

    testComponent.buttonColor = 'primary';
    fixture.detectChanges();
    expect(buttonDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);
    expect(aDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);

    testComponent.buttonColor = 'accent';
    fixture.detectChanges();
    expect(buttonDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);
    expect(aDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);

    testComponent.buttonColor = null;
    fixture.detectChanges();

    expect(buttonDebugElement.nativeElement.classList).not.toContain('mat-accent');
    expect(aDebugElement.nativeElement.classList).not.toContain('mat-accent');
  });

  it('should should not clear previous defined classes', () => {
    let fixture = TestBed.createComponent(TestApp);
    let testComponent = fixture.debugElement.componentInstance;
    let buttonDebugElement = fixture.debugElement.query(By.css('button'));

    buttonDebugElement.nativeElement.classList.add('custom-class');

    testComponent.buttonColor = 'primary';
    fixture.detectChanges();

    expect(buttonDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);
    expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

    testComponent.buttonColor = 'accent';
    fixture.detectChanges();

    expect(buttonDebugElement.nativeElement.classList.contains('mat-primary')).toBe(false);
    expect(buttonDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);
    expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);
  });

  describe('button[mat-fab]', () => {
    it('should have accent palette by default', () => {
      const fixture = TestBed.createComponent(TestApp);
      const fabButtonDebugEl = fixture.debugElement.query(By.css('button[mat-fab]'));

      fixture.detectChanges();

      expect(fabButtonDebugEl.nativeElement.classList)
        .toContain('mat-accent', 'Expected fab buttons to use accent palette by default');
    });
  });

  describe('button[mat-mini-fab]', () => {
    it('should have accent palette by default', () => {
      const fixture = TestBed.createComponent(TestApp);
      const miniFabButtonDebugEl = fixture.debugElement.query(By.css('button[mat-mini-fab]'));

      fixture.detectChanges();

      expect(miniFabButtonDebugEl.nativeElement.classList)
        .toContain('mat-accent', 'Expected mini-fab buttons to use accent palette by default');
    });
  });

  // Regular button tests
  describe('button[mat-button]', () => {
    it('should handle a click on the button', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('button'));

      buttonDebugElement.nativeElement.click();
      expect(testComponent.clickCount).toBe(1);
    });

    it('should not increment if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('button'));

      testComponent.isDisabled = true;
      fixture.detectChanges();

      buttonDebugElement.nativeElement.click();

      expect(testComponent.clickCount).toBe(0);
    });

    it('should disable the native button element', () => {
      let fixture = TestBed.createComponent(TestApp);
      let buttonNativeElement = fixture.nativeElement.querySelector('button');
      expect(buttonNativeElement.disabled).toBeFalsy('Expected button not to be disabled');

      fixture.componentInstance.isDisabled = true;
      fixture.detectChanges();
      expect(buttonNativeElement.disabled).toBeTruthy('Expected button to be disabled');
    });

  });

  // Anchor button tests
  describe('a[mat-button]', () => {
    it('should not redirect if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'));

      testComponent.isDisabled = true;
      fixture.detectChanges();

      buttonDebugElement.nativeElement.click();
    });

    it('should remove tabindex if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'));
      expect(buttonDebugElement.nativeElement.getAttribute('tabIndex')).toBe(null);

      testComponent.isDisabled = true;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('tabIndex')).toBe('-1');
    });

    it('should add aria-disabled attribute if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'));
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled')).toBe('false');

      testComponent.isDisabled = true;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not add aria-disabled attribute if disabled is false', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'));
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled'))
        .toBe('false', 'Expect aria-disabled="false"');
      expect(buttonDebugElement.nativeElement.getAttribute('disabled'))
        .toBeNull('Expect disabled="false"');

      testComponent.isDisabled = false;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled'))
        .toBe('false', 'Expect no aria-disabled');
      expect(buttonDebugElement.nativeElement.getAttribute('disabled'))
        .toBeNull('Expect no disabled');
    });
  });

  // Ripple tests.
  describe('button ripples', () => {
    let fixture: ComponentFixture<TestApp>;
    let testComponent: TestApp;
    let buttonDebugElement: DebugElement;
    let buttonRippleDebugElement: DebugElement;
    let buttonRippleInstance: MatRipple;
    let anchorDebugElement: DebugElement;
    let anchorRippleDebugElement: DebugElement;
    let anchorRippleInstance: MatRipple;

    beforeEach(() => {
      fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;

      buttonDebugElement = fixture.debugElement.query(By.css('button[mat-button]'));
      buttonRippleDebugElement = buttonDebugElement.query(By.directive(MatRipple));
      buttonRippleInstance = buttonRippleDebugElement.injector.get<MatRipple>(MatRipple);

      anchorDebugElement = fixture.debugElement.query(By.css('a[mat-button]'));
      anchorRippleDebugElement = anchorDebugElement.query(By.directive(MatRipple));
      anchorRippleInstance = anchorRippleDebugElement.injector.get<MatRipple>(MatRipple);
    });

    it('should disable the ripple if matRippleDisabled input is set', () => {
      expect(buttonRippleInstance.disabled).toBeFalsy();

      testComponent.rippleDisabled = true;
      fixture.detectChanges();

      expect(buttonRippleInstance.disabled).toBeTruthy();
    });

    it('should disable the ripple when the button is disabled', () => {
      expect(buttonRippleInstance.disabled).toBeFalsy(
        'Expected an enabled button[mat-button] to have an enabled ripple'
      );
      expect(anchorRippleInstance.disabled).toBeFalsy(
        'Expected an enabled a[mat-button] to have an enabled ripple'
      );

      testComponent.isDisabled = true;
      fixture.detectChanges();

      expect(buttonRippleInstance.disabled).toBeTruthy(
        'Expected a disabled button[mat-button] not to have an enabled ripple'
      );
      expect(anchorRippleInstance.disabled).toBeTruthy(
        'Expected a disabled a[mat-button] not to have an enabled ripple'
      );
    });
  });
});

/** Test component that contains an MatButton. */
@Component({
  selector: 'test-app',
  template: `
    <button mat-button type="button" (click)="increment()"
      [disabled]="isDisabled" [color]="buttonColor" [disableRipple]="rippleDisabled">
      Go
    </button>
    <a href="http://www.google.com" mat-button [disabled]="isDisabled" [color]="buttonColor">
      Link
    </a>
    <button mat-fab>Fab Button</button>
    <button mat-mini-fab>Mini Fab Button</button>
  `
})
class TestApp {
  clickCount: number = 0;
  isDisabled: boolean = false;
  rippleDisabled: boolean = false;

  increment() {
    this.clickCount++;
  }
}
