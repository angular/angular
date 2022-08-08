import {BidiModule, Direction} from '@angular/cdk/bidi';
import {dispatchFakeEvent} from '../../cdk/testing/private';
import {Component} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  flushMicrotasks,
  inject,
  TestBed,
  tick,
} from '@angular/core/testing';
import {FormControl, FormsModule, NgModel, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {FocusMonitor} from '@angular/cdk/a11y';
import {MatSlideToggle, MatSlideToggleChange, MatSlideToggleModule} from './index';
import {MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS} from './slide-toggle-config';

describe('MDC-based MatSlideToggle without forms', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSlideToggleModule, BidiModule],
      declarations: [
        SlideToggleBasic,
        SlideToggleCheckedAndDisabledAttr,
        SlideToggleWithTabindexAttr,
        SlideToggleWithoutLabel,
        SlideToggleProjectedLabel,
        TextBindingComponent,
        SlideToggleWithStaticAriaAttributes,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('basic behavior', () => {
    let fixture: ComponentFixture<any>;

    let testComponent: SlideToggleBasic;
    let slideToggle: MatSlideToggle;
    let slideToggleElement: HTMLElement;
    let labelElement: HTMLLabelElement;
    let buttonElement: HTMLButtonElement;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(SlideToggleBasic);

      // Enable jasmine spies on event functions, which may trigger at initialization
      // of the slide-toggle component.
      spyOn(fixture.debugElement.componentInstance, 'onSlideChange').and.callThrough();
      spyOn(fixture.debugElement.componentInstance, 'onSlideClick').and.callThrough();

      // Initialize the slide-toggle component, by triggering the first change detection cycle.
      fixture.detectChanges();

      const slideToggleDebug = fixture.debugElement.query(By.css('mat-slide-toggle'))!;

      testComponent = fixture.debugElement.componentInstance;
      slideToggle = slideToggleDebug.componentInstance;
      slideToggleElement = slideToggleDebug.nativeElement;
      buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
      labelElement = fixture.debugElement.query(By.css('label'))!.nativeElement;
    }));

    it('should apply class based on color attribute', fakeAsync(() => {
      testComponent.slideColor = 'primary';
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('mat-primary');

      testComponent.slideColor = 'accent';
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('mat-accent');
    }));

    it('should correctly update the disabled property', fakeAsync(() => {
      expect(buttonElement.disabled).toBeFalsy();

      testComponent.isDisabled = true;
      fixture.detectChanges();

      expect(buttonElement.disabled).toBeTruthy();
    }));

    it('should correctly update the checked property', fakeAsync(() => {
      expect(slideToggle.checked).toBeFalsy();
      expect(buttonElement.getAttribute('aria-checked')).toBe('false');

      testComponent.slideChecked = true;
      fixture.detectChanges();

      expect(buttonElement.getAttribute('aria-checked')).toBe('true');
    }));

    it('should set the toggle to checked on click', fakeAsync(() => {
      expect(slideToggle.checked).toBe(false);
      expect(buttonElement.getAttribute('aria-checked')).toBe('false');
      expect(slideToggleElement.classList).not.toContain('mat-mdc-slide-toggle-checked');

      labelElement.click();
      fixture.detectChanges();
      flush();

      expect(slideToggleElement.classList).toContain('mat-mdc-slide-toggle-checked');
      expect(slideToggle.checked).toBe(true);
      expect(buttonElement.getAttribute('aria-checked')).toBe('true');
    }));

    it('should not trigger the click event multiple times', fakeAsync(() => {
      // By default, when clicking on a label element, a generated click will be dispatched
      // on the associated button element.
      // Since we're using a label element and a visual hidden button, this behavior can led
      // to an issue, where the click events on the slide-toggle are getting executed twice.

      expect(slideToggle.checked).toBe(false);
      expect(slideToggleElement.classList).not.toContain('mat-mdc-slide-toggle-checked');

      labelElement.click();
      fixture.detectChanges();
      tick();

      expect(slideToggleElement.classList).toContain('mat-mdc-slide-toggle-checked');
      expect(slideToggle.checked).toBe(true);
      expect(testComponent.onSlideClick).toHaveBeenCalledTimes(1);
    }));

    it('should trigger the change event properly', fakeAsync(() => {
      expect(slideToggleElement.classList).not.toContain('mat-mdc-slide-toggle-checked');

      labelElement.click();
      fixture.detectChanges();
      flush();

      expect(slideToggleElement.classList).toContain('mat-mdc-slide-toggle-checked');
      expect(testComponent.onSlideChange).toHaveBeenCalledTimes(1);
    }));

    it('should not trigger the change event by changing the native value', fakeAsync(() => {
      expect(slideToggleElement.classList).not.toContain('mat-mdc-slide-toggle-checked');

      testComponent.slideChecked = true;
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('mat-mdc-slide-toggle-checked');
      tick();

      expect(testComponent.onSlideChange).not.toHaveBeenCalled();
    }));

    it('should add a suffix to the element id', fakeAsync(() => {
      testComponent.slideId = 'myId';
      fixture.detectChanges();

      expect(slideToggleElement.id).toBe('myId');
      expect(buttonElement.id).toBe(`${slideToggleElement.id}-button`);

      testComponent.slideId = 'nextId';
      fixture.detectChanges();

      expect(slideToggleElement.id).toBe('nextId');
      expect(buttonElement.id).toBe(`${slideToggleElement.id}-button`);

      testComponent.slideId = null;
      fixture.detectChanges();

      // Once the id binding is set to null, the id property should auto-generate a unique id.
      expect(buttonElement.id).toMatch(/mat-mdc-slide-toggle-\d+-button/);
    }));

    it('should forward the tabIndex to the underlying element', fakeAsync(() => {
      fixture.detectChanges();

      expect(buttonElement.tabIndex).toBe(0);

      testComponent.slideTabindex = 4;
      fixture.detectChanges();

      expect(buttonElement.tabIndex).toBe(4);
    }));

    it('should forward the specified name to the element', fakeAsync(() => {
      testComponent.slideName = 'myName';
      fixture.detectChanges();

      expect(buttonElement.name).toBe('myName');

      testComponent.slideName = 'nextName';
      fixture.detectChanges();

      expect(buttonElement.name).toBe('nextName');

      testComponent.slideName = null;
      fixture.detectChanges();

      expect(buttonElement.name).toBe('');
    }));

    it('should forward the aria-label attribute to the element', fakeAsync(() => {
      testComponent.slideLabel = 'ariaLabel';
      fixture.detectChanges();

      expect(buttonElement.getAttribute('aria-label')).toBe('ariaLabel');

      testComponent.slideLabel = null;
      fixture.detectChanges();

      expect(buttonElement.hasAttribute('aria-label')).toBeFalsy();
    }));

    it('should forward the aria-labelledby attribute to the element', fakeAsync(() => {
      testComponent.slideLabelledBy = 'ariaLabelledBy';
      fixture.detectChanges();

      expect(buttonElement.getAttribute('aria-labelledby')).toBe('ariaLabelledBy');

      testComponent.slideLabelledBy = null;
      fixture.detectChanges();

      // We fall back to pointing to the label if a value isn't provided.
      expect(buttonElement.getAttribute('aria-labelledby')).toMatch(
        /mat-mdc-slide-toggle-\d+-label/,
      );
    }));

    it('should forward the aria-describedby attribute to the element', fakeAsync(() => {
      testComponent.slideAriaDescribedBy = 'some-element';
      fixture.detectChanges();

      expect(buttonElement.getAttribute('aria-describedby')).toBe('some-element');

      testComponent.slideAriaDescribedBy = null;
      fixture.detectChanges();

      expect(buttonElement.hasAttribute('aria-describedby')).toBe(false);
    }));

    it('should set the `for` attribute to the id of the element', fakeAsync(() => {
      expect(labelElement.getAttribute('for')).toBeTruthy();
      expect(buttonElement.getAttribute('id')).toBeTruthy();
      expect(labelElement.getAttribute('for')).toBe(buttonElement.getAttribute('id'));
    }));

    it('should emit the new values properly', fakeAsync(() => {
      labelElement.click();
      fixture.detectChanges();
      tick();

      // We're checking the arguments type / emitted value to be a boolean, because sometimes the
      // emitted value can be a DOM Event, which is not valid.
      // See angular/angular#4059
      expect(testComponent.lastEvent.checked).toBe(true);
    }));

    it('should support subscription on the change observable', fakeAsync(() => {
      const spy = jasmine.createSpy('change spy');
      const subscription = slideToggle.change.subscribe(spy);

      labelElement.click();
      fixture.detectChanges();
      tick();

      expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({checked: true}));
      subscription.unsubscribe();
    }));

    it('should forward the required attribute', () => {
      testComponent.isRequired = true;
      fixture.detectChanges();

      expect(buttonElement.getAttribute('aria-required')).toBe('true');

      testComponent.isRequired = false;
      fixture.detectChanges();

      expect(buttonElement.getAttribute('aria-required')).toBe(null);
    });

    it('should focus on underlying element when focus() is called', fakeAsync(() => {
      expect(document.activeElement).not.toBe(buttonElement);

      slideToggle.focus();
      fixture.detectChanges();
      flush();

      expect(document.activeElement).toBe(buttonElement);
    }));

    it('should not manually move focus to underlying when focus comes from mouse or touch', fakeAsync(
      inject([FocusMonitor], (focusMonitor: FocusMonitor) => {
        expect(document.activeElement).not.toBe(buttonElement);

        focusMonitor.focusVia(slideToggleElement, 'mouse');
        fixture.detectChanges();
        flush();
        expect(document.activeElement).not.toBe(buttonElement);

        focusMonitor.focusVia(slideToggleElement, 'touch');
        fixture.detectChanges();
        flush();
        expect(document.activeElement).not.toBe(buttonElement);
      }),
    ));

    it('should set a element class if labelPosition is set to before', fakeAsync(() => {
      const formField = slideToggleElement.querySelector('.mdc-form-field')!;

      expect(formField.classList).not.toContain('mdc-form-field--align-end');

      testComponent.labelPosition = 'before';
      fixture.detectChanges();

      expect(formField.classList).toContain('mdc-form-field--align-end');
    }));

    it('should show ripples', fakeAsync(() => {
      const rippleSelector = '.mat-ripple-element';
      const switchElement = slideToggleElement.querySelector('.mdc-switch')!;

      expect(slideToggleElement.querySelectorAll(rippleSelector).length).toBe(0);

      dispatchFakeEvent(switchElement, 'mousedown');
      dispatchFakeEvent(switchElement, 'mouseup');

      expect(slideToggleElement.querySelectorAll(rippleSelector).length).toBe(1);
      flush();
    }));

    it('should not show ripples when disableRipple is set', fakeAsync(() => {
      const switchElement = slideToggleElement.querySelector('.mdc-switch')!;
      const rippleSelector = '.mat-ripple-element';
      testComponent.disableRipple = true;
      fixture.detectChanges();

      expect(slideToggleElement.querySelectorAll(rippleSelector).length).toBe(0);

      dispatchFakeEvent(switchElement, 'mousedown');
      dispatchFakeEvent(switchElement, 'mouseup');

      expect(slideToggleElement.querySelectorAll(rippleSelector).length).toBe(0);
      flush();
    }));

    it('should have a focus indicator', fakeAsync(() => {
      const rippleElement = slideToggleElement.querySelector('.mat-mdc-slide-toggle-ripple')!;
      expect(rippleElement.classList).toContain('mat-mdc-focus-indicator');
    }));
  });

  describe('custom template', () => {
    it('should not trigger the change event on initialization', fakeAsync(() => {
      const fixture = TestBed.createComponent(SlideToggleBasic);

      fixture.componentInstance.slideChecked = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.lastEvent).toBeFalsy();
    }));

    it('should be able to set the tabindex via the native attribute', fakeAsync(() => {
      const fixture = TestBed.createComponent(SlideToggleWithTabindexAttr);

      fixture.detectChanges();

      const slideToggle = fixture.debugElement.query(By.directive(MatSlideToggle))!
        .componentInstance as MatSlideToggle;

      expect(slideToggle.tabIndex)
        .withContext('Expected tabIndex property to have been set based on the native attribute')
        .toBe(5);
    }));

    it('should add the disabled class if disabled through attribute', fakeAsync(() => {
      const fixture = TestBed.createComponent(SlideToggleCheckedAndDisabledAttr);
      fixture.detectChanges();

      const switchEl = fixture.nativeElement.querySelector('.mdc-switch');
      expect(switchEl.classList).toContain('mdc-switch--disabled');
    }));

    it('should add the checked class if checked through attribute', fakeAsync(() => {
      const fixture = TestBed.createComponent(SlideToggleCheckedAndDisabledAttr);
      fixture.detectChanges();

      const switchEl = fixture.nativeElement.querySelector('.mdc-switch');
      expect(switchEl.classList).toContain('mdc-switch--checked');
    }));

    it('should remove the tabindex from the host node', fakeAsync(() => {
      const fixture = TestBed.createComponent(SlideToggleWithTabindexAttr);

      fixture.detectChanges();

      const slideToggle = fixture.debugElement.query(By.directive(MatSlideToggle))!.nativeElement;
      expect(slideToggle.hasAttribute('tabindex')).toBe(false);
    }));

    it('should remove the tabindex from the host element when disabled', fakeAsync(() => {
      const fixture = TestBed.createComponent(SlideToggleWithTabindexAttr);

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();

      const slideToggle = fixture.debugElement.query(By.directive(MatSlideToggle))!.nativeElement;
      expect(slideToggle.hasAttribute('tabindex')).toBe(false);
    }));
  });

  it(
    'should not change value on click when click action is noop when using custom a ' +
      'action configuration',
    fakeAsync(() => {
      TestBed.resetTestingModule().configureTestingModule({
        imports: [MatSlideToggleModule],
        declarations: [SlideToggleBasic],
        providers: [
          {
            provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS,
            useValue: {disableToggleValue: true},
          },
        ],
      });
      const fixture = TestBed.createComponent(SlideToggleBasic);
      fixture.detectChanges();

      const testComponent = fixture.debugElement.componentInstance;
      const slideToggleDebug = fixture.debugElement.query(By.css('mat-slide-toggle'))!;

      const slideToggle = slideToggleDebug.componentInstance;
      const buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
      const labelElement = fixture.debugElement.query(By.css('label'))!.nativeElement;

      expect(testComponent.toggleTriggered).toBe(0);
      expect(testComponent.dragTriggered).toBe(0);
      expect(slideToggle.checked).withContext('Expect slide toggle value not changed').toBe(false);

      labelElement.click();
      fixture.detectChanges();
      tick();

      expect(slideToggle.checked).withContext('Expect slide toggle value not changed').toBe(false);
      expect(testComponent.toggleTriggered).withContext('Expect toggle once').toBe(1);
      expect(testComponent.dragTriggered).toBe(0);

      buttonElement.click();
      fixture.detectChanges();
      tick();

      expect(slideToggle.checked).withContext('Expect slide toggle value not changed').toBe(false);
      expect(testComponent.toggleTriggered).withContext('Expect toggle twice').toBe(2);
      expect(testComponent.dragTriggered).toBe(0);
    }),
  );

  it('should be able to change the default color', fakeAsync(() => {
    TestBed.resetTestingModule().configureTestingModule({
      imports: [MatSlideToggleModule],
      declarations: [SlideToggleWithForm],
      providers: [{provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: {color: 'warn'}}],
    });
    const fixture = TestBed.createComponent(SlideToggleWithForm);
    fixture.detectChanges();
    const slideToggle = fixture.nativeElement.querySelector('.mat-mdc-slide-toggle');
    expect(slideToggle.classList).toContain('mat-warn');
  }));

  it('should clear static aria attributes from the host node', fakeAsync(() => {
    const fixture = TestBed.createComponent(SlideToggleWithStaticAriaAttributes);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement.querySelector('mat-slide-toggle');
    expect(host.hasAttribute('aria-label')).toBe(false);
    expect(host.hasAttribute('aria-labelledby')).toBe(false);
  }));
});

describe('MDC-based MatSlideToggle with forms', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSlideToggleModule, FormsModule, ReactiveFormsModule],
      declarations: [
        SlideToggleWithForm,
        SlideToggleWithModel,
        SlideToggleWithFormControl,
        SlideToggleWithModelAndChangeEvent,
      ],
    });

    TestBed.compileComponents();
  }));

  describe('using ngModel', () => {
    let fixture: ComponentFixture<SlideToggleWithModel>;

    let testComponent: SlideToggleWithModel;
    let slideToggle: MatSlideToggle;
    let slideToggleElement: HTMLElement;
    let slideToggleModel: NgModel;
    let buttonElement: HTMLButtonElement;
    let labelElement: HTMLLabelElement;

    // This initialization is async() because it needs to wait for ngModel to set the initial value.
    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(SlideToggleWithModel);
      fixture.detectChanges();

      const slideToggleDebug = fixture.debugElement.query(By.directive(MatSlideToggle))!;

      testComponent = fixture.debugElement.componentInstance;
      slideToggle = slideToggleDebug.componentInstance;
      slideToggleElement = slideToggleDebug.nativeElement;
      slideToggleModel = slideToggleDebug.injector.get<NgModel>(NgModel);
      buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
      labelElement = fixture.debugElement.query(By.css('label'))!.nativeElement;
    }));

    it('should be initially set to ng-pristine', fakeAsync(() => {
      expect(slideToggleElement.classList).toContain('ng-pristine');
      expect(slideToggleElement.classList).not.toContain('ng-dirty');
    }));

    it('should update the model programmatically', fakeAsync(() => {
      expect(slideToggleElement.classList).not.toContain('mat-mdc-slide-toggle-checked');

      testComponent.modelValue = true;
      fixture.detectChanges();

      // Flush the microtasks because the forms module updates the model state asynchronously.
      flushMicrotasks();

      fixture.detectChanges();
      expect(slideToggleElement.classList).toContain('mat-mdc-slide-toggle-checked');
    }));

    it('should have the correct control state initially and after interaction', fakeAsync(() => {
      // The control should start off valid, pristine, and untouched.
      expect(slideToggleModel.valid).toBe(true);
      expect(slideToggleModel.pristine).toBe(true);
      expect(slideToggleModel.touched).toBe(false);

      // After changing the value from the view, the control should
      // become dirty (not pristine), but remain untouched if focus is still there.
      slideToggle.checked = true;

      dispatchFakeEvent(buttonElement, 'focus');
      buttonElement.click();
      flush();

      expect(slideToggleModel.valid).toBe(true);
      expect(slideToggleModel.pristine).toBe(false);
      expect(slideToggleModel.touched).toBe(false);

      // Once the button element loses focus, the control should remain dirty but should
      // also turn touched.
      dispatchFakeEvent(buttonElement, 'blur');
      fixture.detectChanges();
      flushMicrotasks();

      expect(slideToggleModel.valid).toBe(true);
      expect(slideToggleModel.pristine).toBe(false);
      expect(slideToggleModel.touched).toBe(true);
    }));

    it('should not throw an error when disabling while focused', fakeAsync(() => {
      expect(() => {
        // Focus the button element because after disabling, the `blur` event should automatically
        // fire and not result in a changed after checked exception. Related: #12323
        buttonElement.focus();
        tick();

        fixture.componentInstance.isDisabled = true;
        fixture.detectChanges();

        flushMicrotasks();
      }).not.toThrow();
    }));

    it('should not set the control to touched when changing the state programmatically', fakeAsync(() => {
      // The control should start off with being untouched.
      expect(slideToggleModel.touched).toBe(false);

      testComponent.isChecked = true;
      fixture.detectChanges();

      expect(slideToggleModel.touched).toBe(false);
      expect(slideToggleElement.classList).toContain('mat-mdc-slide-toggle-checked');

      // Once the button element loses focus, the control should remain dirty but should
      // also turn touched.
      dispatchFakeEvent(buttonElement, 'blur');
      fixture.detectChanges();
      flushMicrotasks();

      expect(slideToggleModel.touched).toBe(true);
      expect(slideToggleElement.classList).toContain('mat-mdc-slide-toggle-checked');
    }));

    it('should not set the control to touched when changing the model', fakeAsync(() => {
      // The control should start off with being untouched.
      expect(slideToggleModel.touched).toBe(false);

      testComponent.modelValue = true;
      fixture.detectChanges();

      // Flush the microtasks because the forms module updates the model state asynchronously.
      flushMicrotasks();

      // The checked property has been updated from the model and now the view needs
      // to reflect the state change.
      fixture.detectChanges();

      expect(slideToggleModel.touched).toBe(false);
      expect(slideToggle.checked).toBe(true);
      expect(slideToggleElement.classList).toContain('mat-mdc-slide-toggle-checked');
    }));

    it('should update checked state on click if control is checked initially', fakeAsync(() => {
      fixture = TestBed.createComponent(SlideToggleWithModel);
      slideToggle = fixture.debugElement.query(By.directive(MatSlideToggle))!.componentInstance;
      labelElement = fixture.debugElement.query(By.css('label'))!.nativeElement;

      fixture.componentInstance.modelValue = true;
      fixture.detectChanges();

      // Flush the microtasks because the forms module updates the model state asynchronously.
      flushMicrotasks();

      // Now the new checked variable has been updated in the slide-toggle and the slide-toggle
      // is marked for check because it still needs to update the underlying button.
      fixture.detectChanges();

      expect(slideToggle.checked)
        .withContext('Expected slide-toggle to be checked initially')
        .toBe(true);

      labelElement.click();
      fixture.detectChanges();
      tick();

      expect(slideToggle.checked)
        .withContext('Expected slide-toggle to be no longer checked after label click.')
        .toBe(false);
    }));

    it('should be pristine if initial value is set from NgModel', fakeAsync(() => {
      fixture = TestBed.createComponent(SlideToggleWithModel);

      fixture.componentInstance.modelValue = true;
      fixture.detectChanges();

      const debugElement = fixture.debugElement.query(By.directive(MatSlideToggle))!;
      const modelInstance = debugElement.injector.get<NgModel>(NgModel);

      // Flush the microtasks because the forms module updates the model state asynchronously.
      flushMicrotasks();

      expect(modelInstance.pristine).toBe(true);
    }));

    it('should set the model value when toggling via the `toggle` method', fakeAsync(() => {
      expect(testComponent.modelValue).toBe(false);

      fixture.debugElement.query(By.directive(MatSlideToggle))!.componentInstance.toggle();
      fixture.detectChanges();
      flushMicrotasks();

      fixture.detectChanges();
      expect(testComponent.modelValue).toBe(true);
    }));
  });

  describe('with a FormControl', () => {
    let fixture: ComponentFixture<SlideToggleWithFormControl>;

    let testComponent: SlideToggleWithFormControl;
    let slideToggle: MatSlideToggle;
    let buttonElement: HTMLButtonElement;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(SlideToggleWithFormControl);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      slideToggle = fixture.debugElement.query(By.directive(MatSlideToggle))!.componentInstance;
      buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
    }));

    it('should toggle the disabled state', fakeAsync(() => {
      expect(slideToggle.disabled).toBe(false);
      expect(buttonElement.disabled).toBe(false);

      testComponent.formControl.disable();
      fixture.detectChanges();

      expect(slideToggle.disabled).toBe(true);
      expect(buttonElement.disabled).toBe(true);

      testComponent.formControl.enable();
      fixture.detectChanges();

      expect(slideToggle.disabled).toBe(false);
      expect(buttonElement.disabled).toBe(false);
    }));
  });

  describe('with form element', () => {
    let fixture: ComponentFixture<any>;
    let testComponent: SlideToggleWithForm;
    let buttonElement: HTMLButtonElement;

    // This initialization is async() because it needs to wait for ngModel to set the initial value.
    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(SlideToggleWithForm);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
    }));

    it('should not submit the form when clicked', fakeAsync(() => {
      expect(testComponent.isSubmitted).toBe(false);

      buttonElement.click();
      fixture.detectChanges();
      flush();

      expect(testComponent.isSubmitted).toBe(false);
    }));

    it('should have proper invalid state if unchecked', fakeAsync(() => {
      testComponent.isRequired = true;
      fixture.detectChanges();

      const slideToggleEl = fixture.nativeElement.querySelector('.mat-mdc-slide-toggle');

      expect(slideToggleEl.classList).toContain('ng-invalid');
      expect(slideToggleEl.classList).not.toContain('ng-valid');

      // The required slide-toggle will be checked and the form control
      // should become valid.
      buttonElement.click();
      fixture.detectChanges();
      flush();

      expect(slideToggleEl.classList).not.toContain('ng-invalid');
      expect(slideToggleEl.classList).toContain('ng-valid');

      // The required slide-toggle will be unchecked and the form control
      // should become invalid.
      buttonElement.click();
      fixture.detectChanges();
      flush();

      expect(slideToggleEl.classList).toContain('ng-invalid');
      expect(slideToggleEl.classList).not.toContain('ng-valid');
    }));

    it('should clear static name attribute from the slide toggle host node', () => {
      const hostNode = fixture.nativeElement.querySelector('.mat-mdc-slide-toggle');
      expect(buttonElement.getAttribute('name')).toBeTruthy();
      expect(hostNode.hasAttribute('name')).toBe(false);
    });
  });

  describe('with model and change event', () => {
    it('should report changes to NgModel before emitting change event', fakeAsync(() => {
      const fixture = TestBed.createComponent(SlideToggleWithModelAndChangeEvent);
      fixture.detectChanges();

      const labelEl = fixture.debugElement.query(By.css('label'))!.nativeElement;

      spyOn(fixture.componentInstance, 'onChange').and.callFake(() => {
        expect(fixture.componentInstance.checked)
          .withContext('Expected the model value to have changed before the change event fired.')
          .toBe(true);
      });

      labelEl.click();
      flush();

      expect(fixture.componentInstance.onChange).toHaveBeenCalledTimes(1);
    }));
  });
});

@Component({
  template: `
    <mat-slide-toggle [dir]="direction" [required]="isRequired"
                     [disabled]="isDisabled"
                     [color]="slideColor"
                     [id]="slideId"
                     [checked]="slideChecked"
                     [name]="slideName"
                     [aria-label]="slideLabel"
                     [aria-labelledby]="slideLabelledBy"
                     [aria-describedby]="slideAriaDescribedBy"
                     [tabIndex]="slideTabindex"
                     [labelPosition]="labelPosition"
                     [disableRipple]="disableRipple"
                     (toggleChange)="onSlideToggleChange()"
                     (dragChange)="onSlideDragChange()"
                     (change)="onSlideChange($event)"
                     (click)="onSlideClick($event)">
      <span>Test Slide Toggle</span>
    </mat-slide-toggle>`,
})
class SlideToggleBasic {
  isDisabled: boolean = false;
  isRequired: boolean = false;
  disableRipple: boolean = false;
  slideChecked: boolean = false;
  slideColor: string;
  slideId: string | null;
  slideName: string | null;
  slideLabel: string | null;
  slideLabelledBy: string | null;
  slideAriaDescribedBy: string | null;
  slideTabindex: number;
  lastEvent: MatSlideToggleChange;
  labelPosition: string;
  toggleTriggered: number = 0;
  dragTriggered: number = 0;
  direction: Direction = 'ltr';

  onSlideClick: (event?: Event) => void = () => {};
  onSlideChange = (event: MatSlideToggleChange) => (this.lastEvent = event);
  onSlideToggleChange = () => this.toggleTriggered++;
  onSlideDragChange = () => this.dragTriggered++;
}

@Component({
  template: `
    <form ngNativeValidate (ngSubmit)="isSubmitted = true">
      <mat-slide-toggle name="slide" ngModel [required]="isRequired">Required</mat-slide-toggle>
      <button type="submit"></button>
    </form>`,
})
class SlideToggleWithForm {
  isSubmitted: boolean = false;
  isRequired: boolean = false;
}

@Component({
  template: `<mat-slide-toggle [(ngModel)]="modelValue" [disabled]="isDisabled"
                               [checked]="isChecked"></mat-slide-toggle>`,
})
class SlideToggleWithModel {
  modelValue = false;
  isChecked = false;
  isDisabled = false;
}

@Component({
  template: `<mat-slide-toggle checked disabled>Label</mat-slide-toggle>`,
})
class SlideToggleCheckedAndDisabledAttr {}

@Component({
  template: `
    <mat-slide-toggle [formControl]="formControl">
      <span>Test Slide Toggle</span>
    </mat-slide-toggle>`,
})
class SlideToggleWithFormControl {
  formControl = new FormControl(false);
}

@Component({template: `<mat-slide-toggle tabindex="5" [disabled]="disabled"></mat-slide-toggle>`})
class SlideToggleWithTabindexAttr {
  disabled = false;
}

@Component({
  template: `<mat-slide-toggle>{{label}}</mat-slide-toggle>`,
})
class SlideToggleWithoutLabel {
  label: string;
}

@Component({
  template: `<mat-slide-toggle [(ngModel)]="checked" (change)="onChange()"></mat-slide-toggle>`,
})
class SlideToggleWithModelAndChangeEvent {
  checked: boolean;
  onChange: () => void = () => {};
}

@Component({
  template: `<mat-slide-toggle><some-text></some-text></mat-slide-toggle>`,
})
class SlideToggleProjectedLabel {}

@Component({
  selector: 'some-text',
  template: `<span>{{text}}</span>`,
})
class TextBindingComponent {
  text: string = 'Some text';
}

@Component({
  template: `
    <mat-slide-toggle aria-label="Slide toggle" aria-labelledby="something"></mat-slide-toggle>
  `,
})
class SlideToggleWithStaticAriaAttributes {}
