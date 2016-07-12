import {
  addProviders,
  inject,
  async
} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {By} from '@angular/platform-browser';
import {Component} from '@angular/core';
import {MdSlideToggle, MdSlideToggleChange} from './slide-toggle';
import {NgControl, disableDeprecatedForms, provideForms} from '@angular/forms';

describe('MdSlideToggle', () => {
  let builder: TestComponentBuilder;

  beforeEach(() => {
    addProviders([
      disableDeprecatedForms(),
      provideForms(),
    ]);
  });

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  describe('basic behavior', () => {

    let fixture: ComponentFixture<any>;

    let testComponent: SlideToggleTestApp;
    let slideToggle: MdSlideToggle;
    let slideToggleElement: HTMLElement;
    let slideToggleControl: NgControl;
    let labelElement: HTMLLabelElement;
    let inputElement: HTMLInputElement;

    beforeEach(async(() => {
      builder.createAsync(SlideToggleTestApp).then(f => {
        fixture = f;

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
      });
    }));


    it('should update the model correctly', () => {
      expect(slideToggleElement.classList).not.toContain('md-checked');

      testComponent.slideModel = true;
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('md-checked');
    });

    it('should apply class based on color attribute', () => {
      testComponent.slideColor = 'primary';
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('md-primary');

      testComponent.slideColor = 'accent';
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('md-accent');
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
      expect(slideToggleElement.classList).not.toContain('md-checked');

      labelElement.click();
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('md-checked');
      expect(slideToggle.checked).toBe(true);
    });

    it('should not trigger the click event multiple times', () => {
      // By default, when clicking on a label element, a generated click will be dispatched
      // on the associated input element.
      // Since we're using a label element and a visual hidden input, this behavior can led
      // to an issue, where the click events on the slide-toggle are getting executed twice.

      expect(slideToggle.checked).toBe(false);
      expect(slideToggleElement.classList).not.toContain('md-checked');

      labelElement.click();
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('md-checked');
      expect(slideToggle.checked).toBe(true);

      expect(testComponent.onSlideClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger the change event multiple times', async(() => {
      expect(inputElement.checked).toBe(false);
      expect(slideToggleElement.classList).not.toContain('md-checked');

      testComponent.slideChecked = true;
      fixture.detectChanges();

      expect(inputElement.checked).toBe(true);
      expect(slideToggleElement.classList).toContain('md-checked');

      // Wait for the fixture to become stable, because the EventEmitter for the change event,
      // will only fire after the zone async change detection has finished.
      fixture.whenStable().then(() => {
        expect(testComponent.onSlideChange).toHaveBeenCalledTimes(1);
      });

    }));

    it('should not trigger the change event on initialization', async(() => {
      expect(inputElement.checked).toBe(false);
      expect(slideToggleElement.classList).not.toContain('md-checked');

      testComponent.slideChecked = true;
      fixture.detectChanges();

      expect(inputElement.checked).toBe(true);
      expect(slideToggleElement.classList).toContain('md-checked');

      // Wait for the fixture to become stable, because the EventEmitter for the change event,
      // will only fire after the zone async change detection has finished.
      fixture.whenStable().then(() => {
        expect(testComponent.onSlideChange).toHaveBeenCalledTimes(1);
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
      expect(slideToggleElement.classList).toContain('md-checked');

      // After a user interaction occurs (such as a click), the control should remain dirty and
      // now also be touched.
      inputElement.click();
      fixture.detectChanges();

      expect(slideToggleControl.touched).toBe(true);
      expect(slideToggleElement.classList).not.toContain('md-checked');
    });

    it('should not set the control to touched when changing the model', () => {
      // The control should start off with being untouched.
      expect(slideToggleControl.touched).toBe(false);

      testComponent.slideModel = true;
      fixture.detectChanges();

      expect(slideToggleControl.touched).toBe(false);
      expect(slideToggle.checked).toBe(true);
      expect(slideToggleElement.classList).toContain('md-checked');
    });

    it('should correctly set the slide-toggle to checked on focus', () => {
      expect(slideToggleElement.classList).not.toContain('md-slide-toggle-focused');

      dispatchFocusChangeEvent('focus', inputElement);
      fixture.detectChanges();

      expect(slideToggleElement.classList).toContain('md-slide-toggle-focused');
    });

  });

  describe('custom template', () => {

    let testComponent: SlideToggleTestApp;
    let slideToggle: MdSlideToggle;
    let slideToggleElement: HTMLElement;
    let labelElement: HTMLLabelElement;
    let inputElement: HTMLInputElement;

    it('should not trigger the change event on initialization', async(() => {
      builder
        .overrideTemplate(SlideToggleTestApp, `
          <md-slide-toggle checked="true" (change)="onSlideChange($event)"></md-slide-toggle>
        `)
        .createAsync(SlideToggleTestApp)
        .then(fixture => {
          // Initialize the variables for our test.
          initializeTest(fixture);

          // Enable jasmine spies on event functions, which may trigger at initialization
          // of the slide-toggle component.
          spyOn(fixture.debugElement.componentInstance, 'onSlideChange').and.callThrough();

          fixture.detectChanges();

          fixture.whenStable().then(() => {
            expect(testComponent.onSlideChange).not.toHaveBeenCalled();
          });
        });
    }));

    /**
     * Initializes the suites variables, to allow developers to easily access the several variables
     * without loading / querying them always again.
     * @param fixture Custom fixture, which contains the slide-toggle component.
     */
    function initializeTest(fixture: ComponentFixture<any>) {
      testComponent = fixture.debugElement.componentInstance;

      // Initialize the slide-toggle component, by triggering the first change detection cycle.
      fixture.detectChanges();

      let slideToggleDebug = fixture.debugElement.query(By.css('md-slide-toggle'));

      slideToggle = slideToggleDebug.componentInstance;
      slideToggleElement = slideToggleDebug.nativeElement;
      inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
      labelElement = fixture.debugElement.query(By.css('label')).nativeElement;
    }
  });

});

/**
 * Dispatches a focus change event from an element.
 * @param eventName Name of the event, either 'focus' or 'blur'.
 * @param element The element from which the event will be dispatched.
 */
function dispatchFocusChangeEvent(eventName: string, element: HTMLElement): void {
  let event  = document.createEvent('Event');
  event.initEvent(eventName, true, true);
  element.dispatchEvent(event);
}

@Component({
  selector: 'slide-toggle-test-app',
  template: `
    <md-slide-toggle [(ngModel)]="slideModel" [disabled]="isDisabled" [color]="slideColor" 
                     [id]="slideId" [checked]="slideChecked" [name]="slideName" 
                     [aria-label]="slideLabel" [ariaLabel]="slideLabel" 
                     [ariaLabelledby]="slideLabelledBy" (change)="onSlideChange($event)"
                     (click)="onSlideClick($event)">
      <span>Test Slide Toggle</span>
    </md-slide-toggle>
  `,
  directives: [MdSlideToggle]
})
class SlideToggleTestApp {
  isDisabled: boolean = false;
  slideModel: boolean = false;
  slideChecked: boolean = false;
  slideColor: string;
  slideId: string;
  slideName: string;
  slideLabel: string;
  slideLabelledBy: string;
  lastEvent: MdSlideToggleChange;

  onSlideClick(event: Event) {}
  onSlideChange(event: MdSlideToggleChange) {
    this.lastEvent = event;
  }
}
