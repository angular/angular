import {
  async,
  fakeAsync,
  flushMicrotasks,
  ComponentFixture,
  TestBed,
  tick,
} from '@angular/core/testing';
import {NgControl, FormsModule, ReactiveFormsModule, FormControl} from '@angular/forms';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdCheckbox, MdCheckboxChange, MdCheckboxModule} from './index';
import {ViewportRuler} from '../core/overlay/position/viewport-ruler';
import {FakeViewportRuler} from '../core/overlay/position/fake-viewport-ruler';
import {dispatchFakeEvent} from '../core/testing/dispatch-events';
import {FocusOriginMonitor, FocusOrigin} from '../core';
import {RIPPLE_FADE_IN_DURATION, RIPPLE_FADE_OUT_DURATION} from '../core/ripple/ripple-renderer';
import {Subject} from 'rxjs/Subject';


describe('MdCheckbox', () => {
  let fixture: ComponentFixture<any>;
  let fakeFocusOriginMonitorSubject: Subject<FocusOrigin> = new Subject();
  let fakeFocusOriginMonitor = {
    monitor: () => fakeFocusOriginMonitorSubject.asObservable(),
    unmonitor: () => {},
    focusVia: (element: HTMLElement, renderer: any, focusOrigin: FocusOrigin) => {
      element.focus();
      fakeFocusOriginMonitorSubject.next(focusOrigin);
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdCheckboxModule.forRoot(), FormsModule, ReactiveFormsModule],
      declarations: [
        SingleCheckbox,
        CheckboxWithFormDirectives,
        MultipleCheckboxes,
        CheckboxWithTabIndex,
        CheckboxWithAriaLabel,
        CheckboxWithAriaLabelledby,
        CheckboxWithNameAttribute,
        CheckboxWithChangeEvent,
        CheckboxWithFormControl,
      ],
      providers: [
        {provide: ViewportRuler, useClass: FakeViewportRuler},
        {provide: FocusOriginMonitor, useValue: fakeFocusOriginMonitor}
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic behaviors', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let checkboxInstance: MdCheckbox;
    let testComponent: SingleCheckbox;
    let inputElement: HTMLInputElement;
    let labelElement: HTMLLabelElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleCheckbox);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MdCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      checkboxInstance = checkboxDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
      labelElement = <HTMLLabelElement>checkboxNativeElement.querySelector('label');
    });

    it('should add and remove the checked state', () => {
      expect(checkboxInstance.checked).toBe(false);
      expect(checkboxNativeElement.classList).not.toContain('mat-checkbox-checked');
      expect(inputElement.checked).toBe(false);

      testComponent.isChecked = true;
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);
      expect(checkboxNativeElement.classList).toContain('mat-checkbox-checked');
      expect(inputElement.checked).toBe(true);

      testComponent.isChecked = false;
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(checkboxNativeElement.classList).not.toContain('mat-checkbox-checked');
      expect(inputElement.checked).toBe(false);
    });

    it('should add and remove indeterminate state', () => {
      expect(checkboxNativeElement.classList).not.toContain('mat-checkbox-checked');
      expect(inputElement.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(false);

      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).toContain('mat-checkbox-indeterminate');
      expect(inputElement.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(true);

      testComponent.isIndeterminate = false;
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).not.toContain('mat-checkbox-indeterminate');
      expect(inputElement.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(false);
    });

    it('should set indeterminate to false when set checked', () => {
      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      expect(checkboxInstance.indeterminate).toBe(true);
      expect(inputElement.indeterminate).toBe(true);
      expect(testComponent.isIndeterminate).toBe(true);

      testComponent.isChecked = true;
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);
      expect(inputElement.indeterminate).toBe(false);
      expect(inputElement.checked).toBe(true);
      expect(testComponent.isIndeterminate).toBe(false);

      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      expect(checkboxInstance.indeterminate).toBe(true);
      expect(inputElement.indeterminate).toBe(true);
      expect(inputElement.checked).toBe(true);
      expect(testComponent.isIndeterminate).toBe(true);

      testComponent.isChecked = false;
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(false);
      expect(inputElement.checked).toBe(false);
      expect(testComponent.isIndeterminate).toBe(false);
    });

    it('should change native element checked when check programmatically', () => {
      expect(inputElement.checked).toBe(false);

      checkboxInstance.checked = true;
      fixture.detectChanges();

      expect(inputElement.checked).toBe(true);
    });

    it('should toggle checked state on click', () => {
      expect(checkboxInstance.checked).toBe(false);

      labelElement.click();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);

      labelElement.click();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
    });

    it('should change from indeterminate to checked on click', () => {
      testComponent.isChecked = false;
      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(checkboxInstance.indeterminate).toBe(true);

      checkboxInstance._onInputClick(<Event>{stopPropagation: () => {}});

      expect(checkboxInstance.checked).toBe(true);
      expect(checkboxInstance.indeterminate).toBe(false);

      checkboxInstance._onInputClick(<Event>{stopPropagation: () => {}});
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(checkboxInstance.indeterminate).toBe(false);
    });

    it('should add and remove disabled state', () => {
      expect(checkboxInstance.disabled).toBe(false);
      expect(checkboxNativeElement.classList).not.toContain('mat-checkbox-disabled');
      expect(inputElement.tabIndex).toBe(0);
      expect(inputElement.disabled).toBe(false);

      testComponent.isDisabled = true;
      fixture.detectChanges();

      expect(checkboxInstance.disabled).toBe(true);
      expect(checkboxNativeElement.classList).toContain('mat-checkbox-disabled');
      expect(inputElement.disabled).toBe(true);

      testComponent.isDisabled = false;
      fixture.detectChanges();

      expect(checkboxInstance.disabled).toBe(false);
      expect(checkboxNativeElement.classList).not.toContain('mat-checkbox-disabled');
      expect(inputElement.tabIndex).toBe(0);
      expect(inputElement.disabled).toBe(false);
    });

    it('should not toggle `checked` state upon interation while disabled', () => {
      testComponent.isDisabled = true;
      fixture.detectChanges();

      checkboxNativeElement.click();
      expect(checkboxInstance.checked).toBe(false);
    });

    it('should overwrite indeterminate state when checked is re-set', () => {
      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      testComponent.isChecked = true;
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);
      expect(checkboxInstance.indeterminate).toBe(false);
    });

    it('should preserve the user-provided id', () => {
      expect(checkboxNativeElement.id).toBe('simple-check');
    });

    it('should project the checkbox content into the label element', () => {
      let label = <HTMLLabelElement>checkboxNativeElement.querySelector('.mat-checkbox-label');
      expect(label.textContent.trim()).toBe('Simple checkbox');
    });

    it('should make the host element a tab stop', () => {
      expect(inputElement.tabIndex).toBe(0);
    });

    it('should add a css class to position the label before the checkbox', () => {
      testComponent.labelPos = 'before';
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).toContain('mat-checkbox-label-before');
    });

    it('should not trigger the click event multiple times', () => {
      // By default, when clicking on a label element, a generated click will be dispatched
      // on the associated input element.
      // Since we're using a label element and a visual hidden input, this behavior can led
      // to an issue, where the click events on the checkbox are getting executed twice.

      spyOn(testComponent, 'onCheckboxClick');

      expect(inputElement.checked).toBe(false);
      expect(checkboxNativeElement.classList).not.toContain('mat-checkbox-checked');

      labelElement.click();
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).toContain('mat-checkbox-checked');
      expect(inputElement.checked).toBe(true);

      expect(testComponent.onCheckboxClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger a change event when the native input does', async(() => {
      spyOn(testComponent, 'onCheckboxChange');

      expect(inputElement.checked).toBe(false);
      expect(checkboxNativeElement.classList).not.toContain('mat-checkbox-checked');

      labelElement.click();
      fixture.detectChanges();

      expect(inputElement.checked).toBe(true);
      expect(checkboxNativeElement.classList).toContain('mat-checkbox-checked');

      // Wait for the fixture to become stable, because the EventEmitter for the change event,
      // will only fire after the zone async change detection has finished.
      fixture.whenStable().then(() => {
        // The change event shouldn't fire, because the value change was not caused
        // by any interaction.
        expect(testComponent.onCheckboxChange).toHaveBeenCalledTimes(1);
      });
    }));

    it('should not trigger the change event by changing the native value', async(() => {
      spyOn(testComponent, 'onCheckboxChange');

      expect(inputElement.checked).toBe(false);
      expect(checkboxNativeElement.classList).not.toContain('mat-checkbox-checked');

      testComponent.isChecked = true;
      fixture.detectChanges();

      expect(inputElement.checked).toBe(true);
      expect(checkboxNativeElement.classList).toContain('mat-checkbox-checked');

      // Wait for the fixture to become stable, because the EventEmitter for the change event,
      // will only fire after the zone async change detection has finished.
      fixture.whenStable().then(() => {
        // The change event shouldn't fire, because the value change was not caused
        // by any interaction.
        expect(testComponent.onCheckboxChange).not.toHaveBeenCalled();
      });

    }));

    it('should forward the required attribute', () => {
      testComponent.isRequired = true;
      fixture.detectChanges();

      expect(inputElement.required).toBe(true);

      testComponent.isRequired = false;
      fixture.detectChanges();

      expect(inputElement.required).toBe(false);
    });

    it('should focus on underlying input element when focus() is called', () => {
      expect(document.activeElement).not.toBe(inputElement);

      checkboxInstance.focus();
      fixture.detectChanges();

      expect(document.activeElement).toBe(inputElement);
    });

    it('should forward the value to input element', () => {
      testComponent.checkboxValue = 'basic_checkbox';
      fixture.detectChanges();

      expect(inputElement.value).toBe('basic_checkbox');
    });

    it('should show a ripple when focused by a keyboard action', fakeAsync(() => {
      expect(fixture.nativeElement.querySelectorAll('.mat-ripple-element').length)
          .toBe(0, 'Expected no ripples on load.');

      fakeFocusOriginMonitorSubject.next('keyboard');
      tick(RIPPLE_FADE_IN_DURATION);

      expect(fixture.nativeElement.querySelectorAll('.mat-ripple-element').length)
          .toBe(1, 'Expected ripple after element is focused.');

      dispatchFakeEvent(checkboxInstance._inputElement.nativeElement, 'blur');
      tick(RIPPLE_FADE_OUT_DURATION);

      expect(fixture.nativeElement.querySelectorAll('.mat-ripple-element').length)
          .toBe(0, 'Expected no ripple after element is blurred.');
    }));

    describe('ripple elements', () => {

      it('should show ripples on label mousedown', () => {
        expect(checkboxNativeElement.querySelector('.mat-ripple-element')).toBeFalsy();

        dispatchFakeEvent(labelElement, 'mousedown');
        dispatchFakeEvent(labelElement, 'mouseup');

        expect(checkboxNativeElement.querySelectorAll('.mat-ripple-element').length).toBe(1);
      });

      it('should not have a ripple when disabled', () => {
        let rippleElement = checkboxNativeElement.querySelector('[md-ripple]');
        expect(rippleElement).toBeTruthy('Expected an enabled checkbox to have a ripple');

        testComponent.isDisabled = true;
        fixture.detectChanges();

        rippleElement = checkboxNativeElement.querySelector('[md-ripple]');
        expect(rippleElement).toBeFalsy('Expected a disabled checkbox not to have a ripple');
      });

      it('should remove ripple if mdRippleDisabled input is set', async(() => {
        testComponent.disableRipple = true;
        fixture.detectChanges();

        expect(checkboxNativeElement.querySelectorAll('[md-ripple]').length)
          .toBe(0, 'Expect no [md-ripple] in checkbox');

        testComponent.disableRipple = false;
        fixture.detectChanges();

        expect(checkboxNativeElement.querySelectorAll('[md-ripple]').length)
          .toBe(1, 'Expect [md-ripple] in checkbox');
      }));
    });

    describe('color behaviour', () => {
      it('should apply class based on color attribute', () => {
        testComponent.checkboxColor = 'primary';
        fixture.detectChanges();
        expect(checkboxDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);

        testComponent.checkboxColor = 'accent';
        fixture.detectChanges();
        expect(checkboxDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);
      });

      it('should should not clear previous defined classes', () => {
        checkboxDebugElement.nativeElement.classList.add('custom-class');

        testComponent.checkboxColor = 'primary';
        fixture.detectChanges();

        expect(checkboxDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);
        expect(checkboxDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

        testComponent.checkboxColor = 'accent';
        fixture.detectChanges();

        expect(checkboxDebugElement.nativeElement.classList.contains('mat-primary')).toBe(false);
        expect(checkboxDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);
        expect(checkboxDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

      });
    });

    describe('state transition css classes', () => {
      it('should transition unchecked -> checked -> unchecked', () => {
        inputElement.click();
        fixture.detectChanges();
        expect(checkboxNativeElement.classList).toContain('mat-checkbox-anim-unchecked-checked');

        inputElement.click();
        fixture.detectChanges();
        expect(checkboxNativeElement.classList)
            .not.toContain('mat-checkbox-anim-unchecked-checked');
        expect(checkboxNativeElement.classList)
            .toContain('mat-checkbox-anim-checked-unchecked');
      });

      it('should transition unchecked -> indeterminate -> unchecked', () => {
        testComponent.isIndeterminate = true;
        fixture.detectChanges();

        expect(checkboxNativeElement.classList)
            .toContain('mat-checkbox-anim-unchecked-indeterminate');

        testComponent.isIndeterminate = false;
        fixture.detectChanges();

        expect(checkboxNativeElement.classList)
            .not.toContain('mat-checkbox-anim-unchecked-indeterminate');
        expect(checkboxNativeElement.classList)
            .toContain('mat-checkbox-anim-indeterminate-unchecked');
      });

      it('should transition indeterminate -> checked', () => {
        testComponent.isIndeterminate = true;
        fixture.detectChanges();

        inputElement.click();
        fixture.detectChanges();

        expect(checkboxNativeElement.classList).not.toContain(
            'mat-checkbox-anim-unchecked-indeterminate');
        expect(checkboxNativeElement.classList)
            .toContain('mat-checkbox-anim-indeterminate-checked');
      });

      it('should not apply transition classes when there is no state change', () => {
        testComponent.isChecked = checkboxInstance.checked;
        fixture.detectChanges();
        expect(checkboxNativeElement).not.toMatch(/^md\-checkbox\-anim/g);

        testComponent.isIndeterminate = checkboxInstance.indeterminate;
        expect(checkboxNativeElement).not.toMatch(/^md\-checkbox\-anim/g);
      });

      it('should not initially have any transition classes', () => {
        expect(checkboxNativeElement).not.toMatch(/^md\-checkbox\-anim/g);
      });
    });
  });

  describe('with change event and no initial value', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let checkboxInstance: MdCheckbox;
    let testComponent: CheckboxWithChangeEvent;
    let inputElement: HTMLInputElement;
    let labelElement: HTMLLabelElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxWithChangeEvent);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MdCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      checkboxInstance = checkboxDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
      labelElement = <HTMLLabelElement>checkboxNativeElement.querySelector('label');
    });

    it('should emit the event to the change observable', () => {
      let changeSpy = jasmine.createSpy('onChangeObservable');

      checkboxInstance.change.subscribe(changeSpy);

      fixture.detectChanges();
      expect(changeSpy).not.toHaveBeenCalled();

      // When changing the native `checked` property the checkbox will not fire a change event,
      // because the element is not focused and it's not the native behavior of the input element.
      labelElement.click();
      fixture.detectChanges();

      expect(changeSpy).toHaveBeenCalledTimes(1);
    });

    it('should not emit a DOM event to the change output', async(() => {
      fixture.detectChanges();
      expect(testComponent.lastEvent).toBeUndefined();

      // Trigger the click on the inputElement, because the input will probably
      // emit a DOM event to the change output.
      inputElement.click();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        // We're checking the arguments type / emitted value to be a boolean, because sometimes the
        // emitted value can be a DOM Event, which is not valid.
        // See angular/angular#4059
        expect(testComponent.lastEvent.checked).toBe(true);
      });

    }));
  });

  describe('with provided aria-label ', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let inputElement: HTMLInputElement;

    it('should use the provided aria-label', () => {
      fixture = TestBed.createComponent(CheckboxWithAriaLabel);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MdCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-label')).toBe('Super effective');
    });
  });

  describe('with provided aria-labelledby ', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let inputElement: HTMLInputElement;

    it('should use the provided aria-labelledby', () => {
      fixture = TestBed.createComponent(CheckboxWithAriaLabelledby);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MdCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-labelledby')).toBe('some-id');
    });

    it('should not assign aria-labelledby if none is provided', () => {
      fixture = TestBed.createComponent(SingleCheckbox);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MdCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-labelledby')).toBe(null);
    });
  });

  describe('with provided tabIndex', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let testComponent: CheckboxWithTabIndex;
    let inputElement: HTMLInputElement;
    let labelElement: HTMLLabelElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxWithTabIndex);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      checkboxDebugElement = fixture.debugElement.query(By.directive(MdCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
      labelElement = <HTMLLabelElement>checkboxNativeElement.querySelector('label');
    });

    it('should preserve any given tabIndex', () => {
      expect(inputElement.tabIndex).toBe(7);
    });

    it('should preserve given tabIndex when the checkbox is disabled then enabled', () => {
      testComponent.isDisabled = true;
      fixture.detectChanges();

      testComponent.customTabIndex = 13;
      fixture.detectChanges();

      testComponent.isDisabled = false;
      fixture.detectChanges();

      expect(inputElement.tabIndex).toBe(13);
    });

  });

  describe('with multiple checkboxes', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(MultipleCheckboxes);
      fixture.detectChanges();
    });

    it('should assign a unique id to each checkbox', () => {
      let [firstId, secondId] =
          fixture.debugElement.queryAll(By.directive(MdCheckbox))
          .map(debugElement => debugElement.nativeElement.querySelector('input').id);

      expect(firstId).toBeTruthy();
      expect(secondId).toBeTruthy();
      expect(firstId).not.toEqual(secondId);
    });
  });

  describe('with ngModel', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let checkboxInstance: MdCheckbox;
    let inputElement: HTMLInputElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxWithFormDirectives);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MdCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      checkboxInstance = checkboxDebugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
    });

    it('should be in pristine, untouched, and valid states initially', fakeAsync(() => {
      flushMicrotasks();

      let checkboxElement = fixture.debugElement.query(By.directive(MdCheckbox));
      let ngControl = <NgControl> checkboxElement.injector.get(NgControl);

      expect(ngControl.valid).toBe(true);
      expect(ngControl.pristine).toBe(true);
      expect(ngControl.touched).toBe(false);

      // TODO(jelbourn): test that `touched` and `pristine` state are modified appropriately.
      // This is currently blocked on issues with async() and fakeAsync().
    }));

    it('should toggle checked state on click', () => {
      expect(checkboxInstance.checked).toBe(false);

      inputElement.click();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);

      inputElement.click();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
    });
  });

  describe('with name attribute', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxWithNameAttribute);
      fixture.detectChanges();
    });

    it('should forward name value to input element', () => {
      let checkboxElement = fixture.debugElement.query(By.directive(MdCheckbox));
      let inputElement = <HTMLInputElement> checkboxElement.nativeElement.querySelector('input');

      expect(inputElement.getAttribute('name')).toBe('test-name');
    });
  });


  describe('with form control', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxInstance: MdCheckbox;
    let testComponent: CheckboxWithFormControl;

    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxWithFormControl);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MdCheckbox));
      checkboxInstance = checkboxDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
    });

    it('should toggle the disabled state', () => {
      expect(checkboxInstance.disabled).toBe(false);

      testComponent.formControl.disable();
      fixture.detectChanges();

      expect(checkboxInstance.disabled).toBe(true);

      testComponent.formControl.enable();
      fixture.detectChanges();

      expect(checkboxInstance.disabled).toBe(false);
    });
  });
});

/** Simple component for testing a single checkbox. */
@Component({
  template: `
  <div (click)="parentElementClicked = true" (keyup)="parentElementKeyedUp = true">
    <md-checkbox
        id="simple-check"
        [required]="isRequired"
        [labelPosition]="labelPos"
        [checked]="isChecked"
        [(indeterminate)]="isIndeterminate"
        [disabled]="isDisabled"
        [color]="checkboxColor"
        [disableRipple]="disableRipple"
        [value]="checkboxValue"
        (change)="changeCount = changeCount + 1"
        (click)="onCheckboxClick($event)"
        (change)="onCheckboxChange($event)">
      Simple checkbox
    </md-checkbox>
  </div>`
})
class SingleCheckbox {
  labelPos: 'before' | 'after' = 'after';
  isChecked: boolean = false;
  isRequired: boolean = false;
  isIndeterminate: boolean = false;
  isDisabled: boolean = false;
  disableRipple: boolean = false;
  parentElementClicked: boolean = false;
  parentElementKeyedUp: boolean = false;
  lastKeydownEvent: Event = null;
  changeCount: number = 0;
  checkboxColor: string = 'primary';
  checkboxValue: string = 'single_checkbox';

  onCheckboxClick(event: Event) {}
  onCheckboxChange(event: MdCheckboxChange) {}
}

/** Simple component for testing an MdCheckbox with ngModel. */
@Component({
  template: `
    <form>
      <md-checkbox name="cb" [(ngModel)]="isGood">Be good</md-checkbox>
    </form>
  `,
})
class CheckboxWithFormDirectives {
  isGood: boolean = false;
}

/** Simple test component with multiple checkboxes. */
@Component(({
  template: `
    <md-checkbox>Option 1</md-checkbox>
    <md-checkbox>Option 2</md-checkbox>
  `
}))
class MultipleCheckboxes { }


/** Simple test component with tabIndex */
@Component({
  template: `
    <md-checkbox
        [tabIndex]="customTabIndex"
        [disabled]="isDisabled">
    </md-checkbox>`,
})
class CheckboxWithTabIndex {
  customTabIndex: number = 7;
  isDisabled: boolean = false;
}

/** Simple test component with an aria-label set. */
@Component({
  template: `<md-checkbox aria-label="Super effective"></md-checkbox>`
})
class CheckboxWithAriaLabel { }

/** Simple test component with an aria-label set. */
@Component({
  template: `<md-checkbox aria-labelledby="some-id"></md-checkbox>`
})
class CheckboxWithAriaLabelledby {}

/** Simple test component with name attribute */
@Component({
  template: `<md-checkbox name="test-name"></md-checkbox>`
})
class CheckboxWithNameAttribute {}

/** Simple test component with change event */
@Component({
  template: `<md-checkbox (change)="lastEvent = $event"></md-checkbox>`
})
class CheckboxWithChangeEvent {
  lastEvent: MdCheckboxChange;
}

/** Test component with reactive forms */
@Component({
  template: `<md-checkbox [formControl]="formControl"></md-checkbox>`
})
class CheckboxWithFormControl {
  formControl = new FormControl();
}
