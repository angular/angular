import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {ApplicationRef, Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatButtonModule, MatButton, MatFabDefaultOptions, MAT_FAB_DEFAULT_OPTIONS} from './index';
import {MatRipple, ThemePalette} from '@angular/material/core';
import {createMouseEvent, dispatchEvent} from '@angular/cdk/testing/private';

describe('MDC-based MatButton', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatButtonModule],
      declarations: [TestApp],
    });

    TestBed.compileComponents();
  }));

  // General button tests
  it('should apply class based on color attribute', () => {
    let fixture = TestBed.createComponent(TestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let buttonDebugElement = fixture.debugElement.query(By.css('button'))!;
    let aDebugElement = fixture.debugElement.query(By.css('a'))!;

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

  it('should expose the ripple instance', () => {
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.directive(MatButton))!.componentInstance;
    expect(button.ripple).toBeTruthy();
  });

  it('should not clear previous defined classes', () => {
    let fixture = TestBed.createComponent(TestApp);
    let testComponent = fixture.debugElement.componentInstance;
    let buttonDebugElement = fixture.debugElement.query(By.css('button'))!;

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

  describe('button[mat-fab] extended', () => {
    it('should be extended', () => {
      const fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
      const extendedFabButtonDebugEl = fixture.debugElement.query(By.css('.extended-fab-test'))!;

      expect(
        extendedFabButtonDebugEl.nativeElement.classList.contains('mat-mdc-extended-fab'),
      ).toBeFalse();

      fixture.componentInstance.extended = true;

      fixture.detectChanges();
      expect(extendedFabButtonDebugEl.nativeElement.classList).toContain('mat-mdc-extended-fab');
    });
  });

  // Regular button tests
  describe('button[mat-button]', () => {
    it('should handle a click on the button', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('button'))!;

      buttonDebugElement.nativeElement.click();
      expect(testComponent.clickCount).toBe(1);
    });

    it('should not increment if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('button'))!;

      testComponent.isDisabled = true;
      fixture.detectChanges();

      buttonDebugElement.nativeElement.click();

      expect(testComponent.clickCount).toBe(0);
    });

    it('should disable the native button element', () => {
      let fixture = TestBed.createComponent(TestApp);
      let buttonNativeElement = fixture.nativeElement.querySelector('button');
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
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'))!;

      testComponent.isDisabled = true;
      fixture.detectChanges();

      buttonDebugElement.nativeElement.click();
    });

    it('should remove tabindex if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'))!;
      fixture.detectChanges();

      expect(buttonDebugElement.nativeElement.hasAttribute('tabindex')).toBe(false);

      testComponent.isDisabled = true;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('tabindex')).toBe('-1');
    });

    it('should add aria-disabled attribute if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'))!;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled')).toBe('false');

      testComponent.isDisabled = true;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not add aria-disabled attribute if disabled is false', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'))!;
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
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonElement = fixture.debugElement.query(By.css('a'))!.nativeElement;

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
      expect(buttonRippleInstance.disabled).toBeFalsy(
        'Expected an enabled button[mat-button] to have an enabled ripple',
      );
      expect(anchorRippleInstance.disabled).toBeFalsy(
        'Expected an enabled a[mat-button] to have an enabled ripple',
      );

      testComponent.isDisabled = true;
      fixture.detectChanges();

      expect(buttonRippleInstance.disabled).toBeTruthy(
        'Expected a disabled button[mat-button] not to have an enabled ripple',
      );
      expect(anchorRippleInstance.disabled).toBeTruthy(
        'Expected a disabled a[mat-button] not to have an enabled ripple',
      );
    });
  });

  it('should have a focus indicator', () => {
    const fixture = TestBed.createComponent(TestApp);
    const buttonNativeElements = [
      ...fixture.debugElement.nativeElement.querySelectorAll('a, button'),
    ];

    expect(
      buttonNativeElements.every(element => !!element.querySelector('.mat-mdc-focus-indicator')),
    ).toBe(true);
  });
});

describe('MatFabDefaultOptions', () => {
  function configure(defaults: MatFabDefaultOptions) {
    TestBed.configureTestingModule({
      imports: [MatButtonModule],
      declarations: [TestApp],
      providers: [{provide: MAT_FAB_DEFAULT_OPTIONS, useValue: defaults}],
    });

    TestBed.compileComponents();
  }

  it('should override default color in component', () => {
    configure({color: 'primary'});
    const fixture: ComponentFixture<TestApp> = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    const fabButtonDebugEl = fixture.debugElement.query(By.css('button[mat-fab]'))!;
    expect(fabButtonDebugEl.nativeElement.classList).toContain('mat-primary');
  });

  it('should default to accent if config does not specify color', () => {
    configure({});
    const fixture: ComponentFixture<TestApp> = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    const fabButtonDebugEl = fixture.debugElement.query(By.css('button[mat-fab]'))!;
    expect(fabButtonDebugEl.nativeElement.classList).toContain('mat-accent');
  });
});

/** Test component that contains an MatButton. */
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
    <button mat-fab [extended]="extended" class="extended-fab-test">Extended</button>
    <button mat-mini-fab>Mini Fab Button</button>
  `,
})
class TestApp {
  clickCount: number = 0;
  isDisabled: boolean = false;
  rippleDisabled: boolean = false;
  buttonColor: ThemePalette;
  tabIndex: number;
  extended: boolean = false;

  increment() {
    this.clickCount++;
  }
}
