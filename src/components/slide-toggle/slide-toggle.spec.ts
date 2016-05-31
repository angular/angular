import {
  it,
  describe,
  expect,
  beforeEach,
  inject,
  async
} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {By} from '@angular/platform-browser';
import {Component} from '@angular/core';
import {MdSlideToggle, MdSlideToggleChange} from './slide-toggle';
import {NgControl} from '@angular/common';

describe('MdSlideToggle', () => {
  let builder: TestComponentBuilder;

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
        fixture.detectChanges();

        let slideToggleDebug = fixture.debugElement.query(By.css('md-slide-toggle'));

        testComponent = fixture.debugElement.componentInstance;
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

    it('should have the correct ngControl state initially and after interaction', () => {
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

    it('should not set the ngControl to touched when changing the state programmatically', () => {
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

    it('should not set the ngControl to touched when changing the model', () => {
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
                     [ariaLabelledby]="slideLabelledBy" (change)="lastEvent = $event">
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
}
