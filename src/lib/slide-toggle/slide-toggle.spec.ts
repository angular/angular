import {Component} from '@angular/core';
import {By, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {async, ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {FormsModule, NgControl, ReactiveFormsModule, FormControl} from '@angular/forms';
import {MdSlideToggle, MdSlideToggleChange, MdSlideToggleModule} from './index';
import {TestGestureConfig} from '../slider/test-gesture-config';
import {dispatchFakeEvent} from '../core/testing/dispatch-events';

describe('MdSlideToggle', () => {

  let gestureConfig: TestGestureConfig;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSlideToggleModule.forRoot(), FormsModule, ReactiveFormsModule],
      declarations: [SlideToggleTestApp, SlideToggleFormsTestApp, SlideToggleWithFormControl],
      providers: [
        {provide: HAMMER_GESTURE_CONFIG, useFactory: () => gestureConfig = new TestGestureConfig()}
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic behavior', () => {
    let fixture: ComponentFixture<any>;

    let testComponent: SlideToggleTestApp;
    let slideToggle: MdSlideToggle;
    let slideToggleElement: HTMLElement;
    let slideToggleControl: NgControl;
    let labelElement: HTMLLabelElement;
    let inputElement: HTMLInputElement;

    // This initialization is async() because it needs to wait for ngModel to set the initial value.
    beforeEach(async(() => {
      fixture = TestBed.createComponent(SlideToggleTestApp);

      testComponent = fixture.debugElement.componentInstance;

      // Enable jasmine spies on event functions, which may trigger at initialization
      // of the slide-toggle component.
      spyOn(fixture.debugElement.componentInstance, 'onSlideChange').and.callThrough();
      spyOn(fixture.debugElement.componentInstance, 'onSlideClick').and.callThrough();

      // Initialize the slide-toggle component, by triggering the first change detection cycle.
      fixture.detectChanges();

      let slideToggleDebug = fixture.debugElement.query(By.css('md-slide-toggle'));

      slideToggle = slideToggleDebug.componentInstance;
      slideToggleElement = slideToggleDebug.nativeElement;
      slideToggleControl = slideToggleDebug.injector.get(NgControl);
      inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
      labelElement = fixture.debugElement.query(By.css('label')).nativeElement;
    }));

    // TODO(kara); update when core/testing adds fix
    it('should update the model correctly', async(() => {
      expect(slideToggleElement.classList).not.toContain('mat-checked');

      testComponent.slideModel = true;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(slideToggleElement.classList).toContain('mat-checked');
      });

    }));

    it('should apply class based on color attribute', () => {
      testComponent.slideColor = 'primary';
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('mat-primary');

      testComponent.slideColor = 'accent';
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('mat-accent');
    });

    it('should correctly update the disabled property', () => {
      expect(inputElement.disabled).toBeFalsy();

      testComponent.isDisabled = true;
      fixture.detectChanges();

      expect(inputElement.disabled).toBeTruthy();
    });

    it('should correctly update the checked property', () => {
      expect(slideToggle.checked).toBeFalsy();

      testComponent.slideChecked = true;
      fixture.detectChanges();

      expect(inputElement.checked).toBeTruthy();
    });

    it('should set the toggle to checked on click', () => {
      expect(slideToggle.checked).toBe(false);
      expect(slideToggleElement.classList).not.toContain('mat-checked');

      labelElement.click();
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('mat-checked');
      expect(slideToggle.checked).toBe(true);
    });

    it('should not trigger the click event multiple times', () => {
      // By default, when clicking on a label element, a generated click will be dispatched
      // on the associated input element.
      // Since we're using a label element and a visual hidden input, this behavior can led
      // to an issue, where the click events on the slide-toggle are getting executed twice.

      expect(slideToggle.checked).toBe(false);
      expect(slideToggleElement.classList).not.toContain('mat-checked');

      labelElement.click();
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('mat-checked');
      expect(slideToggle.checked).toBe(true);
      expect(testComponent.onSlideClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger the change event properly', () => {
      expect(inputElement.checked).toBe(false);
      expect(slideToggleElement.classList).not.toContain('mat-checked');

      labelElement.click();
      fixture.detectChanges();

      expect(inputElement.checked).toBe(true);
      expect(slideToggleElement.classList).toContain('mat-checked');
      expect(testComponent.onSlideChange).toHaveBeenCalledTimes(1);
    });

    it('should not trigger the change event by changing the native value', async(() => {
      expect(inputElement.checked).toBe(false);
      expect(slideToggleElement.classList).not.toContain('mat-checked');

      testComponent.slideChecked = true;
      fixture.detectChanges();

      expect(inputElement.checked).toBe(true);
      expect(slideToggleElement.classList).toContain('mat-checked');

      // The change event shouldn't fire because the value change was not caused
      // by any interaction. Use whenStable to ensure an event isn't fired asynchronously.
      fixture.whenStable().then(() => {
        expect(testComponent.onSlideChange).not.toHaveBeenCalled();
      });
    }));

    it('should not trigger the change event on initialization', async(() => {
      expect(inputElement.checked).toBe(false);
      expect(slideToggleElement.classList).not.toContain('mat-checked');

      testComponent.slideChecked = true;
      fixture.detectChanges();

      expect(inputElement.checked).toBe(true);
      expect(slideToggleElement.classList).toContain('mat-checked');

      // The change event shouldn't fire, because the native input element is not focused.
      // Use whenStable to ensure an event isn't fired asynchronously.
      fixture.whenStable().then(() => {
        expect(testComponent.onSlideChange).not.toHaveBeenCalled();
      });
    }));

    it('should add a suffix to the inputs id', () => {
      testComponent.slideId = 'myId';
      fixture.detectChanges();

      expect(inputElement.id).toBe('myId-input');

      testComponent.slideId = 'nextId';
      fixture.detectChanges();

      expect(inputElement.id).toBe('nextId-input');

      testComponent.slideId = null;
      fixture.detectChanges();

      // Once the id input is falsy, we use a default prefix with a incrementing unique number.
      expect(inputElement.id).toMatch(/md-slide-toggle-[0-9]+-input/g);
    });

    it('should forward the tabIndex to the underlying input', () => {
      fixture.detectChanges();

      expect(inputElement.tabIndex).toBe(0);

      testComponent.slideTabindex = 4;
      fixture.detectChanges();

      expect(inputElement.tabIndex).toBe(4);
    });

    it('should forward the specified name to the input', () => {
      testComponent.slideName = 'myName';
      fixture.detectChanges();

      expect(inputElement.name).toBe('myName');

      testComponent.slideName = 'nextName';
      fixture.detectChanges();

      expect(inputElement.name).toBe('nextName');

      testComponent.slideName = null;
      fixture.detectChanges();

      expect(inputElement.name).toBe('');
    });

    it('should forward the aria-label attribute to the input', () => {
      testComponent.slideLabel = 'ariaLabel';
      fixture.detectChanges();

      expect(inputElement.getAttribute('aria-label')).toBe('ariaLabel');

      testComponent.slideLabel = null;
      fixture.detectChanges();

      expect(inputElement.hasAttribute('aria-label')).toBeFalsy();
    });

    it('should forward the aria-labelledby attribute to the input', () => {
      testComponent.slideLabelledBy = 'ariaLabelledBy';
      fixture.detectChanges();

      expect(inputElement.getAttribute('aria-labelledby')).toBe('ariaLabelledBy');

      testComponent.slideLabelledBy = null;
      fixture.detectChanges();

      expect(inputElement.hasAttribute('aria-labelledby')).toBeFalsy();
    });

    it('should be initially set to ng-pristine', () => {
      expect(slideToggleElement.classList).toContain('ng-pristine');
      expect(slideToggleElement.classList).not.toContain('ng-dirty');
    });

    it('should emit the new values properly', async(() => {
      labelElement.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        // We're checking the arguments type / emitted value to be a boolean, because sometimes the
        // emitted value can be a DOM Event, which is not valid.
        // See angular/angular#4059
        expect(testComponent.lastEvent.checked).toBe(true);
      });
    }));

    it('should support subscription on the change observable', () => {
      slideToggle.change.subscribe((event: MdSlideToggleChange) => {
        expect(event.checked).toBe(true);
      });

      slideToggle.toggle();
      fixture.detectChanges();
    });

    it('should have the correct control state initially and after interaction', () => {
      // The control should start off valid, pristine, and untouched.
      expect(slideToggleControl.valid).toBe(true);
      expect(slideToggleControl.pristine).toBe(true);
      expect(slideToggleControl.touched).toBe(false);

      // After changing the value programmatically, the control should
      // become dirty (not pristine), but remain untouched.
      slideToggle.checked = true;
      fixture.detectChanges();

      expect(slideToggleControl.valid).toBe(true);
      expect(slideToggleControl.pristine).toBe(false);
      expect(slideToggleControl.touched).toBe(false);

      // After a user interaction occurs (such as a click), the control should remain dirty and
      // now also be touched.
      labelElement.click();
      fixture.detectChanges();

      expect(slideToggleControl.valid).toBe(true);
      expect(slideToggleControl.pristine).toBe(false);
      expect(slideToggleControl.touched).toBe(true);
    });

    it('should not set the control to touched when changing the state programmatically', () => {
      // The control should start off with being untouched.
      expect(slideToggleControl.touched).toBe(false);

      testComponent.slideChecked = true;
      fixture.detectChanges();

      expect(slideToggleControl.touched).toBe(false);
      expect(slideToggleElement.classList).toContain('mat-checked');

      // After a user interaction occurs (such as a click), the control should remain dirty and
      // now also be touched.
      inputElement.click();
      fixture.detectChanges();

      expect(slideToggleControl.touched).toBe(true);
      expect(slideToggleElement.classList).not.toContain('mat-checked');
    });

    // TODO(kara): update when core/testing adds fix
    it('should not set the control to touched when changing the model', async(() => {
      // The control should start off with being untouched.
      expect(slideToggleControl.touched).toBe(false);

      testComponent.slideModel = true;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(slideToggleControl.touched).toBe(false);
        expect(slideToggle.checked).toBe(true);
        expect(slideToggleElement.classList).toContain('mat-checked');
      });
    }));

    it('should correctly set the slide-toggle to checked on focus', () => {
      expect(slideToggleElement.classList).not.toContain('mat-slide-toggle-focused');

      dispatchFakeEvent(inputElement, 'focus');
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('mat-slide-toggle-focused');
    });

    it('should forward the required attribute', () => {
      testComponent.isRequired = true;
      fixture.detectChanges();

      expect(inputElement.required).toBe(true);

      testComponent.isRequired = false;
      fixture.detectChanges();

      expect(inputElement.required).toBe(false);
    });

    it('should focus on underlying input element when focus() is called', () => {
      expect(slideToggleElement.classList).not.toContain('mat-slide-toggle-focused');
      expect(document.activeElement).not.toBe(inputElement);

      slideToggle.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(inputElement);
      expect(slideToggleElement.classList).toContain('mat-slide-toggle-focused');
    });

    it('should set a element class if labelPosition is set to before', () => {
      expect(slideToggleElement.classList).not.toContain('mat-slide-toggle-label-before');

      testComponent.labelPosition = 'before';
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('mat-slide-toggle-label-before');
    });

    it('should show ripples on label mousedown', () => {
      expect(slideToggleElement.querySelectorAll('.mat-ripple-element').length).toBe(0);

      dispatchFakeEvent(labelElement, 'mousedown');
      dispatchFakeEvent(labelElement, 'mouseup');

      expect(slideToggleElement.querySelectorAll('.mat-ripple-element').length).toBe(1);
    });

    it('should not show ripples when disableRipple is set', () => {
      testComponent.disableRipple = true;
      fixture.detectChanges();

      expect(slideToggleElement.querySelectorAll('.mat-ripple-element').length).toBe(0);

      dispatchFakeEvent(labelElement, 'mousedown');
      dispatchFakeEvent(labelElement, 'mouseup');

      expect(slideToggleElement.querySelectorAll('.mat-ripple-element').length).toBe(0);
    });

  });

  describe('custom template', () => {
    it('should not trigger the change event on initialization', async(() => {
      let fixture = TestBed.createComponent(SlideToggleTestApp);
      fixture.componentInstance.slideModel = true;
      fixture.componentInstance.slideChecked = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.lastEvent).toBeFalsy();
    }));
  });

  describe('with forms', () => {

    let fixture: ComponentFixture<any>;
    let testComponent: SlideToggleFormsTestApp;
    let buttonElement: HTMLButtonElement;
    let labelElement: HTMLLabelElement;
    let inputElement: HTMLInputElement;

    // This initialization is async() because it needs to wait for ngModel to set the initial value.
    beforeEach(async(() => {
      fixture = TestBed.createComponent(SlideToggleFormsTestApp);

      testComponent = fixture.debugElement.componentInstance;

      fixture.detectChanges();

      buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
      labelElement = fixture.debugElement.query(By.css('label')).nativeElement;
      inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    }));

    it('should prevent the form from submit when being required', () => {

      if ('reportValidity' in inputElement === false) {
        // If the browser does not report the validity then the tests will break.
        // e.g Safari 8 on Mobile.
        return;
      }

      testComponent.isRequired = true;

      fixture.detectChanges();

      buttonElement.click();
      fixture.detectChanges();

      expect(testComponent.isSubmitted).toBe(false);

      testComponent.isRequired = false;
      fixture.detectChanges();

      buttonElement.click();
      fixture.detectChanges();

      expect(testComponent.isSubmitted).toBe(true);
    });

  });

  describe('with dragging', () => {

    let fixture: ComponentFixture<any>;

    let testComponent: SlideToggleTestApp;
    let slideToggle: MdSlideToggle;
    let slideToggleElement: HTMLElement;
    let slideToggleControl: NgControl;
    let slideThumbContainer: HTMLElement;
    let inputElement: HTMLInputElement;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(SlideToggleTestApp);

      testComponent = fixture.debugElement.componentInstance;

      fixture.detectChanges();

      let slideToggleDebug = fixture.debugElement.query(By.css('md-slide-toggle'));
      let thumbContainerDebug = slideToggleDebug.query(By.css('.mat-slide-toggle-thumb-container'));

      slideToggle = slideToggleDebug.componentInstance;
      slideToggleElement = slideToggleDebug.nativeElement;
      slideToggleControl = slideToggleDebug.injector.get(NgControl);
      slideThumbContainer = thumbContainerDebug.nativeElement;

      inputElement = slideToggleElement.querySelector('input');
    }));

    it('should drag from start to end', fakeAsync(() => {
      expect(slideToggle.checked).toBe(false);

      gestureConfig.emitEventForElement('slidestart', slideThumbContainer);

      expect(slideThumbContainer.classList).toContain('mat-dragging');

      gestureConfig.emitEventForElement('slide', slideThumbContainer, {
        deltaX: 200 // Arbitrary, large delta that will be clamped to the end of the slide-toggle.
      });

      gestureConfig.emitEventForElement('slideend', slideThumbContainer);

      // Flush the timeout for the slide ending.
      tick();

      expect(slideToggle.checked).toBe(true);
      expect(slideThumbContainer.classList).not.toContain('mat-dragging');
    }));

    it('should drag from end to start', fakeAsync(() => {
      slideToggle.checked = true;

      gestureConfig.emitEventForElement('slidestart', slideThumbContainer);

      expect(slideThumbContainer.classList).toContain('mat-dragging');

      gestureConfig.emitEventForElement('slide', slideThumbContainer, {
        deltaX: -200 // Arbitrary, large delta that will be clamped to the end of the slide-toggle.
      });

      gestureConfig.emitEventForElement('slideend', slideThumbContainer);

      // Flush the timeout for the slide ending.
      tick();

      expect(slideToggle.checked).toBe(false);
      expect(slideThumbContainer.classList).not.toContain('mat-dragging');
    }));

    it('should not drag when disabled', fakeAsync(() => {
      slideToggle.disabled = true;

      expect(slideToggle.checked).toBe(false);

      gestureConfig.emitEventForElement('slidestart', slideThumbContainer);

      expect(slideThumbContainer.classList).not.toContain('mat-dragging');

      gestureConfig.emitEventForElement('slide', slideThumbContainer, {
        deltaX: 200 // Arbitrary, large delta that will be clamped to the end of the slide-toggle.
      });

      gestureConfig.emitEventForElement('slideend', slideThumbContainer);

      // Flush the timeout for the slide ending.
      tick();

      expect(slideToggle.checked).toBe(false);
      expect(slideThumbContainer.classList).not.toContain('mat-dragging');
    }));

    it('should should emit a change event after drag', fakeAsync(() => {
      expect(slideToggle.checked).toBe(false);

      gestureConfig.emitEventForElement('slidestart', slideThumbContainer);

      expect(slideThumbContainer.classList).toContain('mat-dragging');

      gestureConfig.emitEventForElement('slide', slideThumbContainer, {
        deltaX: 200 // Arbitrary, large delta that will be clamped to the end of the slide-toggle.
      });

      gestureConfig.emitEventForElement('slideend', slideThumbContainer);

      // Flush the timeout for the slide ending.
      tick();

      expect(slideToggle.checked).toBe(true);
      expect(slideThumbContainer.classList).not.toContain('mat-dragging');
      expect(testComponent.lastEvent.checked).toBe(true);
    }));

    it('should not emit a change event when the value did not change', fakeAsync(() => {
      expect(slideToggle.checked).toBe(false);

      gestureConfig.emitEventForElement('slidestart', slideThumbContainer);
      gestureConfig.emitEventForElement('slide', slideThumbContainer, { deltaX: 0 });
      gestureConfig.emitEventForElement('slideend', slideThumbContainer);

      // Flush the timeout for the slide ending.
      tick();

      expect(slideThumbContainer.classList).not.toContain('mat-dragging');
      expect(slideToggle.checked).toBe(false);
      expect(testComponent.lastEvent)
          .toBeFalsy('Expected the slide-toggle to not emit a change event.');
    }));

    it('should update the checked property of the input', fakeAsync(() => {
      expect(inputElement.checked).toBe(false);

      gestureConfig.emitEventForElement('slidestart', slideThumbContainer);

      expect(slideThumbContainer.classList).toContain('mat-dragging');

      gestureConfig.emitEventForElement('slide', slideThumbContainer, {
        deltaX: 200 // Arbitrary, large delta that will be clamped to the end of the slide-toggle.
      });

      gestureConfig.emitEventForElement('slideend', slideThumbContainer);
      fixture.detectChanges();

      expect(inputElement.checked).toBe(true);

      // Flush the timeout for the slide ending.
      tick();

      expect(slideThumbContainer.classList).not.toContain('mat-dragging');
    }));

  });

  describe('with a FormControl', () => {
    let fixture: ComponentFixture<SlideToggleWithFormControl>;

    let testComponent: SlideToggleWithFormControl;
    let slideToggle: MdSlideToggle;

    beforeEach(() => {
      fixture = TestBed.createComponent(SlideToggleWithFormControl);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      slideToggle = fixture.debugElement.query(By.directive(MdSlideToggle)).componentInstance;
    });

    it('should toggle the disabled state', () => {
      expect(slideToggle.disabled).toBe(false);

      testComponent.formControl.disable();
      fixture.detectChanges();

      expect(slideToggle.disabled).toBe(true);

      testComponent.formControl.enable();
      fixture.detectChanges();

      expect(slideToggle.disabled).toBe(false);
    });
  });
});

@Component({
  selector: 'slide-toggle-test-app',
  template: `
    <md-slide-toggle [(ngModel)]="slideModel"
                     [required]="isRequired"
                     [disabled]="isDisabled"
                     [color]="slideColor"
                     [id]="slideId"
                     [checked]="slideChecked"
                     [name]="slideName"
                     [aria-label]="slideLabel"
                     [aria-labelledby]="slideLabelledBy"
                     [tabIndex]="slideTabindex"
                     [labelPosition]="labelPosition"
                     [disableRipple]="disableRipple"
                     (change)="onSlideChange($event)"
                     (click)="onSlideClick($event)">

      <span>Test Slide Toggle</span>

    </md-slide-toggle>`,
})
class SlideToggleTestApp {
  isDisabled: boolean = false;
  isRequired: boolean = false;
  disableRipple: boolean = false;
  slideModel: boolean = false;
  slideChecked: boolean = false;
  slideColor: string;
  slideId: string;
  slideName: string;
  slideLabel: string;
  slideLabelledBy: string;
  slideTabindex: number;
  lastEvent: MdSlideToggleChange;
  labelPosition: string;

  onSlideClick(event: Event) {}
  onSlideChange(event: MdSlideToggleChange) {
    this.lastEvent = event;
  }
}


@Component({
  selector: 'slide-toggle-forms-test-app',
  template: `
    <form (ngSubmit)="isSubmitted = true">
      <md-slide-toggle name="slide" ngModel [required]="isRequired">Required</md-slide-toggle>
      <button type="submit"></button>
    </form>`
})
class SlideToggleFormsTestApp {
  isSubmitted: boolean = false;
  isRequired: boolean = false;
}


@Component({
  template: `
    <md-slide-toggle [formControl]="formControl">
      <span>Test Slide Toggle</span>
    </md-slide-toggle>`,
})
class SlideToggleWithFormControl {
  formControl = new FormControl();
}
