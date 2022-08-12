import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {ApplicationRef, Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatLegacyButtonModule, MatLegacyButton} from './index';
import {MatRipple, ThemePalette} from '@angular/material/core';
import {createMouseEvent, dispatchEvent} from '@angular/cdk/testing/private';

describe('MatLegacyButton', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatLegacyButtonModule],
      declarations: [TestApp],
    });

    TestBed.compileComponents();
  }));

  // General button tests
  it('should apply class based on color attribute', () => {
    const fixture = TestBed.createComponent(TestApp);

    const testComponent = fixture.debugElement.componentInstance;
    const buttonDebugElement = fixture.debugElement.query(By.css('button'))!;
    const attributeDebugElement = fixture.debugElement.query(By.css('a'))!;

    testComponent.buttonColor = 'primary';
    fixture.detectChanges();
    expect(buttonDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);
    expect(attributeDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);

    testComponent.buttonColor = 'accent';
    fixture.detectChanges();
    expect(buttonDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);
    expect(attributeDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);

    testComponent.buttonColor = null;
    fixture.detectChanges();

    expect(buttonDebugElement.nativeElement.classList).not.toContain('mat-accent');
    expect(attributeDebugElement.nativeElement.classList).not.toContain('mat-accent');
  });

  it('should expose the ripple instance', () => {
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.directive(MatLegacyButton))!.componentInstance;
    expect(button.ripple).toBeTruthy();
  });

  it('should not clear previous defined classes', () => {
    const fixture = TestBed.createComponent(TestApp);
    const testComponent = fixture.debugElement.componentInstance;
    const buttonDebugElement = fixture.debugElement.query(By.css('button'))!;

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

  it('should be able to focus button with a specific focus origin', () => {
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    const buttonDebugEl = fixture.debugElement.query(By.css('button'));
    const buttonInstance = buttonDebugEl.componentInstance as MatLegacyButton;

    expect(buttonDebugEl.nativeElement.classList).not.toContain('cdk-focused');

    buttonInstance.focus('touch');

    expect(buttonDebugEl.nativeElement.classList).toContain('cdk-focused');
    expect(buttonDebugEl.nativeElement.classList).toContain('cdk-touch-focused');
  });

  it('should not change focus origin if origin not specified', () => {
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    const fabButtonDebugEl = fixture.debugElement.query(By.css('button[mat-fab]'))!;
    const fabButtonInstance = fabButtonDebugEl.componentInstance as MatLegacyButton;
    fabButtonInstance.focus('mouse');

    const miniFabButtonDebugEl = fixture.debugElement.query(By.css('button[mat-mini-fab]'))!;
    const miniFabButtonInstance = miniFabButtonDebugEl.componentInstance as MatLegacyButton;

    miniFabButtonInstance.focus();

    expect(miniFabButtonDebugEl.nativeElement.classList).toContain('cdk-focused');
    expect(miniFabButtonDebugEl.nativeElement.classList).toContain('cdk-mouse-focused');
  });

  describe('button[mat-fab]', () => {
    it('should have accent palette by default', () => {
      const fixture = TestBed.createComponent(TestApp);
      const fabButtonDebugEl = fixture.debugElement.query(By.css('button[mat-fab]'))!;

      fixture.detectChanges();

      expect(fabButtonDebugEl.nativeElement.classList)
        .withContext('Expected fab buttons to use accent palette by default')
        .toContain('mat-accent');
    });
  });

  describe('button[mat-mini-fab]', () => {
    it('should have accent palette by default', () => {
      const fixture = TestBed.createComponent(TestApp);
      const miniFabButtonDebugEl = fixture.debugElement.query(By.css('button[mat-mini-fab]'))!;

      fixture.detectChanges();

      expect(miniFabButtonDebugEl.nativeElement.classList)
        .withContext('Expected mini-fab buttons to use accent palette by default')
        .toContain('mat-accent');
    });
  });

  // Regular button tests
  describe('button[mat-button]', () => {
    it('should handle a click on the button', () => {
      const fixture = TestBed.createComponent(TestApp);
      const testComponent = fixture.debugElement.componentInstance;
      const buttonDebugElement = fixture.debugElement.query(By.css('button'))!;

      buttonDebugElement.nativeElement.click();
      expect(testComponent.clickCount).toBe(1);
    });

    it('should not increment if disabled', () => {
      const fixture = TestBed.createComponent(TestApp);
      const testComponent = fixture.debugElement.componentInstance;
      const buttonDebugElement = fixture.debugElement.query(By.css('button'))!;

      testComponent.isDisabled = true;
      fixture.detectChanges();

      buttonDebugElement.nativeElement.click();

      expect(testComponent.clickCount).toBe(0);
    });

    it('should disable the native button element', () => {
      const fixture = TestBed.createComponent(TestApp);
      const buttonNativeElement = fixture.nativeElement.querySelector('button');
      expect(buttonNativeElement.disabled)
        .withContext('Expected button not to be disabled')
        .toBeFalsy();

      fixture.componentInstance.isDisabled = true;
      fixture.detectChanges();
      expect(buttonNativeElement.disabled)
        .withContext('Expected button to be disabled')
        .toBeTruthy();
    });
  });

  // Anchor button tests
  describe('a[mat-button]', () => {
    it('should not redirect if disabled', () => {
      const fixture = TestBed.createComponent(TestApp);
      const testComponent = fixture.debugElement.componentInstance;
      const buttonDebugElement = fixture.debugElement.query(By.css('a'))!;

      testComponent.isDisabled = true;
      fixture.detectChanges();

      buttonDebugElement.nativeElement.click();
    });

    it('should remove tabindex if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'))!;
      expect(buttonDebugElement.nativeElement.hasAttribute('tabindex')).toBe(false);

      testComponent.isDisabled = true;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('tabindex')).toBe('-1');
    });

    it('should add aria-disabled attribute if disabled', () => {
      const fixture = TestBed.createComponent(TestApp);
      const testComponent = fixture.debugElement.componentInstance;
      const buttonDebugElement = fixture.debugElement.query(By.css('a'))!;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled')).toBe('false');

      testComponent.isDisabled = true;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not add aria-disabled attribute if disabled is false', () => {
      const fixture = TestBed.createComponent(TestApp);
      const testComponent = fixture.debugElement.componentInstance;
      const buttonDebugElement = fixture.debugElement.query(By.css('a'))!;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled'))
        .withContext('Expect aria-disabled="false"')
        .toBe('false');
      expect(buttonDebugElement.nativeElement.getAttribute('disabled'))
        .withContext('Expect disabled="false"')
        .toBeNull();

      testComponent.isDisabled = false;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled'))
        .withContext('Expect no aria-disabled')
        .toBe('false');
      expect(buttonDebugElement.nativeElement.getAttribute('disabled'))
        .withContext('Expect no disabled')
        .toBeNull();
    });

    it('should be able to set a custom tabindex', () => {
      const fixture = TestBed.createComponent(TestApp);
      const testComponent = fixture.debugElement.componentInstance;
      const buttonElement = fixture.debugElement.query(By.css('a'))!.nativeElement;

      fixture.componentInstance.tabIndex = 3;
      fixture.detectChanges();

      expect(buttonElement.getAttribute('tabindex'))
        .withContext('Expected custom tabindex to be set')
        .toBe('3');

      testComponent.isDisabled = true;
      fixture.detectChanges();

      expect(buttonElement.getAttribute('tabindex'))
        .withContext('Expected custom tabindex to be overwritten when disabled.')
        .toBe('-1');
    });

    it('should not set a default tabindex on enabled links', () => {
      const fixture = TestBed.createComponent(TestApp);
      const buttonElement = fixture.debugElement.query(By.css('a'))!.nativeElement;
      fixture.detectChanges();

      expect(buttonElement.hasAttribute('tabindex')).toBe(false);
    });

    describe('change detection behavior', () => {
      it('should not run change detection for disabled anchor but should prevent the default behavior and stop event propagation', () => {
        const appRef = TestBed.inject(ApplicationRef);
        const fixture = TestBed.createComponent(TestApp);
        fixture.componentInstance.isDisabled = true;
        fixture.detectChanges();
        const anchorElement = fixture.debugElement.query(By.css('a'))!.nativeElement;

        spyOn(appRef, 'tick');

        const event = createMouseEvent('click');
        spyOn(event, 'preventDefault').and.callThrough();
        spyOn(event, 'stopImmediatePropagation').and.callThrough();

        dispatchEvent(anchorElement, event);

        expect(appRef.tick).not.toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopImmediatePropagation).toHaveBeenCalled();
      });
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

      buttonDebugElement = fixture.debugElement.query(By.css('button[mat-button]'))!;
      buttonRippleDebugElement = buttonDebugElement.query(By.directive(MatRipple))!;
      buttonRippleInstance = buttonRippleDebugElement.injector.get<MatRipple>(MatRipple);

      anchorDebugElement = fixture.debugElement.query(By.css('a[mat-button]'))!;
      anchorRippleDebugElement = anchorDebugElement.query(By.directive(MatRipple))!;
      anchorRippleInstance = anchorRippleDebugElement.injector.get<MatRipple>(MatRipple);
    });

    it('should disable the ripple if matRippleDisabled input is set', () => {
      expect(buttonRippleInstance.disabled).toBeFalsy();

      testComponent.rippleDisabled = true;
      fixture.detectChanges();

      expect(buttonRippleInstance.disabled).toBeTruthy();
    });

    it('should disable the ripple when the button is disabled', () => {
      expect(buttonRippleInstance.disabled)
        .withContext('Expected an enabled button[mat-button] to have an enabled ripple')
        .toBeFalsy();
      expect(anchorRippleInstance.disabled)
        .withContext('Expected an enabled a[mat-button] to have an enabled ripple')
        .toBeFalsy();

      testComponent.isDisabled = true;
      fixture.detectChanges();

      expect(buttonRippleInstance.disabled)
        .withContext('Expected a disabled button[mat-button] not to have an enabled ripple')
        .toBeTruthy();
      expect(anchorRippleInstance.disabled)
        .withContext('Expected a disabled a[mat-button] not to have an enabled ripple')
        .toBeTruthy();
    });
  });

  it('should have a focus indicator', () => {
    const fixture = TestBed.createComponent(TestApp);
    const buttonNativeElements = [
      ...fixture.debugElement.nativeElement.querySelectorAll('a, button'),
    ];

    expect(
      buttonNativeElements.every(element => element.classList.contains('mat-focus-indicator')),
    ).toBe(true);
  });
});

/** Test component that contains an MatLegacyButton. */
@Component({
  selector: 'test-app',
  template: `
    <button [tabIndex]="tabIndex" mat-button type="button" (click)="increment()"
      [disabled]="isDisabled" [color]="buttonColor" [disableRipple]="rippleDisabled">
      Go
    </button>
    <a [tabIndex]="tabIndex" href="http://www.google.com" mat-button [disabled]="isDisabled"
      [color]="buttonColor">
      Link
    </a>
    <button mat-fab>Fab Button</button>
    <button mat-mini-fab>Mini Fab Button</button>
  `,
})
class TestApp {
  clickCount: number = 0;
  isDisabled: boolean = false;
  rippleDisabled: boolean = false;
  buttonColor: ThemePalette;
  tabIndex: number;

  increment() {
    this.clickCount++;
  }
}
