import {
  async,
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  tick,
} from '@angular/core/testing';
import {FormControl, FormsModule, NgModel, ReactiveFormsModule} from '@angular/forms';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent} from '@angular/cdk/testing';
import {MatCheckbox, MatCheckboxChange, MatCheckboxModule} from './index';
import {RIPPLE_FADE_IN_DURATION, RIPPLE_FADE_OUT_DURATION} from '@angular/material/core';
import {MAT_CHECKBOX_CLICK_ACTION} from './checkbox-config';


describe('MatCheckbox', () => {
  let fixture: ComponentFixture<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatCheckboxModule, FormsModule, ReactiveFormsModule],
      declarations: [
        SingleCheckbox,
        CheckboxWithFormDirectives,
        MultipleCheckboxes,
        CheckboxWithNgModel,
        CheckboxWithTabIndex,
        CheckboxWithAriaLabel,
        CheckboxWithAriaLabelledby,
        CheckboxWithNameAttribute,
        CheckboxWithChangeEvent,
        CheckboxWithFormControl,
        CheckboxWithoutLabel,
        CheckboxWithTabindexAttr,
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic behaviors', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let checkboxInstance: MatCheckbox;
    let testComponent: SingleCheckbox;
    let inputElement: HTMLInputElement;
    let labelElement: HTMLLabelElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SingleCheckbox);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
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
      expect(inputElement.getAttribute('aria-checked'))
          .toBe('false', 'Expect aria-checked to be false');

      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).toContain('mat-checkbox-indeterminate');
      expect(inputElement.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(true);
      expect(inputElement.getAttribute('aria-checked'))
          .toBe('mixed', 'Expect aria checked to be mixed for indeterminate checkbox');

      testComponent.isIndeterminate = false;
      fixture.detectChanges();

      expect(checkboxNativeElement.classList).not.toContain('mat-checkbox-indeterminate');
      expect(inputElement.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(false);
    });

    it('should set indeterminate to false when input clicked', fakeAsync(() => {
      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      expect(checkboxInstance.indeterminate).toBe(true);
      expect(inputElement.indeterminate).toBe(true);
      expect(testComponent.isIndeterminate).toBe(true);

      inputElement.click();
      fixture.detectChanges();

      // Flush the microtasks because the forms module updates the model state asynchronously.
      flushMicrotasks();

      // The checked property has been updated from the model and now the view needs
      // to reflect the state change.
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
      expect(inputElement.getAttribute('aria-checked'))
          .toBe('true', 'Expect aria checked to be true');

      inputElement.click();
      fixture.detectChanges();

      // Flush the microtasks because the forms module updates the model state asynchronously.
      flushMicrotasks();

      // The checked property has been updated from the model and now the view needs
      // to reflect the state change.
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(false);
      expect(inputElement.checked).toBe(false);
      expect(testComponent.isIndeterminate).toBe(false);
    }));

    it('should not set indeterminate to false when checked is set programmatically', async(() => {
      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      expect(checkboxInstance.indeterminate).toBe(true);
      expect(inputElement.indeterminate).toBe(true);
      expect(testComponent.isIndeterminate).toBe(true);

      testComponent.isChecked = true;
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);
      expect(inputElement.indeterminate).toBe(true);
      expect(inputElement.checked).toBe(true);
      expect(testComponent.isIndeterminate).toBe(true);

      testComponent.isChecked = false;
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(inputElement.indeterminate).toBe(true);
      expect(inputElement.checked).toBe(false);
      expect(testComponent.isIndeterminate).toBe(true);
    }));

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

    it('should change from indeterminate to checked on click', fakeAsync(() => {
      testComponent.isChecked = false;
      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(checkboxInstance.indeterminate).toBe(true);

      checkboxInstance._onInputClick(<Event>{stopPropagation: () => {}});

      // Flush the microtasks because the indeterminate state will be updated in the next tick.
      flushMicrotasks();

      expect(checkboxInstance.checked).toBe(true);
      expect(checkboxInstance.indeterminate).toBe(false);

      checkboxInstance._onInputClick(<Event>{stopPropagation: () => {}});
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(checkboxInstance.indeterminate).toBe(false);
    }));

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

    it('should overwrite indeterminate state when clicked', fakeAsync(() => {
      testComponent.isIndeterminate = true;
      fixture.detectChanges();

      inputElement.click();
      fixture.detectChanges();

      // Flush the microtasks because the indeterminate state will be updated in the next tick.
      flushMicrotasks();

      expect(checkboxInstance.checked).toBe(true);
      expect(checkboxInstance.indeterminate).toBe(false);
    }));

    it('should preserve the user-provided id', () => {
      expect(checkboxNativeElement.id).toBe('simple-check');
      expect(inputElement.id).toBe('simple-check-input');
    });

    it('should generate a unique id for the checkbox input if no id is set', () => {
      testComponent.checkboxId = null;
      fixture.detectChanges();

      expect(checkboxInstance.inputId).toMatch(/mat-checkbox-\d+/);
      expect(inputElement.id).toBe(checkboxInstance.inputId);
    });

    it('should project the checkbox content into the label element', () => {
      let label = <HTMLLabelElement>checkboxNativeElement.querySelector('.mat-checkbox-label');
      expect(label.textContent!.trim()).toBe('Simple checkbox');
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

      dispatchFakeEvent(inputElement, 'keydown');
      dispatchFakeEvent(inputElement, 'focus');

      tick(RIPPLE_FADE_IN_DURATION);

      expect(fixture.nativeElement.querySelectorAll('.mat-ripple-element').length)
          .toBe(1, 'Expected ripple after element is focused.');

      dispatchFakeEvent(checkboxInstance._inputElement.nativeElement, 'blur');
      tick(RIPPLE_FADE_OUT_DURATION);

      expect(fixture.nativeElement.querySelectorAll('.mat-ripple-element').length)
          .toBe(0, 'Expected no ripple after element is blurred.');
    }));

    it('should remove the SVG checkmark from the tab order', () => {
      expect(checkboxNativeElement.querySelector('svg')!.getAttribute('focusable')).toBe('false');
    });

    describe('ripple elements', () => {

      it('should show ripples on label mousedown', () => {
        expect(checkboxNativeElement.querySelector('.mat-ripple-element')).toBeFalsy();

        dispatchFakeEvent(labelElement, 'mousedown');
        dispatchFakeEvent(labelElement, 'mouseup');

        expect(checkboxNativeElement.querySelectorAll('.mat-ripple-element').length).toBe(1);
      });

      it('should not show ripples when disabled', () => {
        testComponent.isDisabled = true;
        fixture.detectChanges();

        dispatchFakeEvent(labelElement, 'mousedown');
        dispatchFakeEvent(labelElement, 'mouseup');

        expect(checkboxNativeElement.querySelectorAll('.mat-ripple-element').length).toBe(0);

        testComponent.isDisabled = false;
        fixture.detectChanges();

        dispatchFakeEvent(labelElement, 'mousedown');
        dispatchFakeEvent(labelElement, 'mouseup');

        expect(checkboxNativeElement.querySelectorAll('.mat-ripple-element').length).toBe(1);
      });

      it('should remove ripple if matRippleDisabled input is set', () => {
        testComponent.disableRipple = true;
        fixture.detectChanges();

        dispatchFakeEvent(labelElement, 'mousedown');
        dispatchFakeEvent(labelElement, 'mouseup');

        expect(checkboxNativeElement.querySelectorAll('.mat-ripple-element').length).toBe(0);

        testComponent.disableRipple = false;
        fixture.detectChanges();

        dispatchFakeEvent(labelElement, 'mousedown');
        dispatchFakeEvent(labelElement, 'mouseup');

        expect(checkboxNativeElement.querySelectorAll('.mat-ripple-element').length).toBe(1);
      });
    });

    describe('color behaviour', () => {
      it('should apply class based on color attribute', () => {
        testComponent.checkboxColor = 'primary';
        fixture.detectChanges();
        expect(checkboxNativeElement.classList.contains('mat-primary')).toBe(true);

        testComponent.checkboxColor = 'accent';
        fixture.detectChanges();
        expect(checkboxNativeElement.classList.contains('mat-accent')).toBe(true);
      });

      it('should should not clear previous defined classes', () => {
        checkboxNativeElement.classList.add('custom-class');

        testComponent.checkboxColor = 'primary';
        fixture.detectChanges();

        expect(checkboxNativeElement.classList.contains('mat-primary')).toBe(true);
        expect(checkboxNativeElement.classList.contains('custom-class')).toBe(true);

        testComponent.checkboxColor = 'accent';
        fixture.detectChanges();

        expect(checkboxNativeElement.classList.contains('mat-primary')).toBe(false);
        expect(checkboxNativeElement.classList.contains('mat-accent')).toBe(true);
        expect(checkboxNativeElement.classList.contains('custom-class')).toBe(true);

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
        expect(checkboxNativeElement).not.toMatch(/^mat\-checkbox\-anim/g);

        testComponent.isIndeterminate = checkboxInstance.indeterminate;
        expect(checkboxNativeElement).not.toMatch(/^mat\-checkbox\-anim/g);
      });

      it('should not initially have any transition classes', () => {
        expect(checkboxNativeElement).not.toMatch(/^mat\-checkbox\-anim/g);
      });
    });

    describe(`when MAT_CHECKBOX_CLICK_ACTION is 'check'`, () => {
      beforeEach(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [MatCheckboxModule, FormsModule, ReactiveFormsModule],
          declarations: [
            SingleCheckbox,
          ],
          providers: [
            {provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'check'}
          ]
        });

        fixture = TestBed.createComponent(SingleCheckbox);
        fixture.detectChanges();

        checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
        checkboxNativeElement = checkboxDebugElement.nativeElement;
        checkboxInstance = checkboxDebugElement.componentInstance;
        testComponent = fixture.debugElement.componentInstance;

        inputElement = checkboxNativeElement.querySelector('input') as HTMLInputElement;
        labelElement = checkboxNativeElement.querySelector('label') as HTMLLabelElement;
      });

      it('should not set `indeterminate` to false on click if check is set', fakeAsync(() => {
        testComponent.isIndeterminate = true;
        inputElement.click();

        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
        expect(inputElement.checked).toBe(true);
        expect(checkboxNativeElement.classList).toContain('mat-checkbox-checked');
        expect(inputElement.indeterminate).toBe(true);
        expect(checkboxNativeElement.classList).toContain('mat-checkbox-indeterminate');
      }));
    });

    describe(`when MAT_CHECKBOX_CLICK_ACTION is 'noop'`, () => {
      beforeEach(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [MatCheckboxModule, FormsModule, ReactiveFormsModule],
          declarations: [
            SingleCheckbox,
          ],
          providers: [
            {provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'noop'}
          ]
        });

        fixture = TestBed.createComponent(SingleCheckbox);
        fixture.detectChanges();

        checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
        checkboxNativeElement = checkboxDebugElement.nativeElement;
        checkboxInstance = checkboxDebugElement.componentInstance;
        testComponent = fixture.debugElement.componentInstance;
        inputElement = checkboxNativeElement.querySelector('input') as HTMLInputElement;
        labelElement = checkboxNativeElement.querySelector('label') as HTMLLabelElement;
      });

      it('should not change `indeterminate` on click if noop is set', fakeAsync(() => {
        testComponent.isIndeterminate = true;
        inputElement.click();

        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();

        expect(inputElement.checked).toBe(false);
        expect(checkboxNativeElement.classList).not.toContain('mat-checkbox-checked');
        expect(inputElement.indeterminate).toBe(true);
        expect(checkboxNativeElement.classList).toContain('mat-checkbox-indeterminate');
      }));


      it(`should not change 'checked' or 'indeterminate' on click if noop is set`, fakeAsync(() => {
        testComponent.isChecked = true;
        testComponent.isIndeterminate = true;
        inputElement.click();

        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();

        expect(inputElement.checked).toBe(true);
        expect(checkboxNativeElement.classList).toContain('mat-checkbox-checked');
        expect(inputElement.indeterminate).toBe(true);
        expect(checkboxNativeElement.classList).toContain('mat-checkbox-indeterminate');

        testComponent.isChecked = false;
        inputElement.click();

        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();

        expect(inputElement.checked).toBe(false);
        expect(checkboxNativeElement.classList).not.toContain('mat-checkbox-checked');
        expect(inputElement.indeterminate).toBe(true, 'indeterminate should not change');
        expect(checkboxNativeElement.classList).toContain('mat-checkbox-indeterminate');
      }));
    });
  });

  describe('with change event and no initial value', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let checkboxInstance: MatCheckbox;
    let testComponent: CheckboxWithChangeEvent;
    let inputElement: HTMLInputElement;
    let labelElement: HTMLLabelElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxWithChangeEvent);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
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
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
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
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

      fixture.detectChanges();
      expect(inputElement.getAttribute('aria-labelledby')).toBe('some-id');
    });

    it('should not assign aria-labelledby if none is provided', () => {
      fixture = TestBed.createComponent(SingleCheckbox);
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
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
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
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

  describe('with native tabindex attribute', () => {

    it('should properly detect native tabindex attribute', async(() => {
      fixture = TestBed.createComponent(CheckboxWithTabindexAttr);
      fixture.detectChanges();

      const checkbox = fixture.debugElement
        .query(By.directive(MatCheckbox)).componentInstance as MatCheckbox;

      expect(checkbox.tabIndex)
        .toBe(5, 'Expected tabIndex property to have been set based on the native attribute');
    }));
  });

  describe('with multiple checkboxes', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(MultipleCheckboxes);
      fixture.detectChanges();
    });

    it('should assign a unique id to each checkbox', () => {
      let [firstId, secondId] =
          fixture.debugElement.queryAll(By.directive(MatCheckbox))
          .map(debugElement => debugElement.nativeElement.querySelector('input').id);

      expect(firstId).toMatch(/mat-checkbox-\d+-input/);
      expect(secondId).toMatch(/mat-checkbox-\d+-input/);
      expect(firstId).not.toEqual(secondId);
    });
  });

  describe('with ngModel', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let checkboxInstance: MatCheckbox;
    let inputElement: HTMLInputElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxWithFormDirectives);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      checkboxInstance = checkboxDebugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
    });

    it('should be in pristine, untouched, and valid states initially', fakeAsync(() => {
      flushMicrotasks();

      let checkboxElement = fixture.debugElement.query(By.directive(MatCheckbox));
      let ngModel = checkboxElement.injector.get<NgModel>(NgModel);

      expect(ngModel.valid).toBe(true);
      expect(ngModel.pristine).toBe(true);
      expect(ngModel.touched).toBe(false);

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

  describe('with required ngModel', () => {
    let checkboxInstance: MatCheckbox;
    let inputElement: HTMLInputElement;
    let testComponent: CheckboxWithNgModel;

    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxWithNgModel);
      fixture.detectChanges();

      let checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
      let checkboxNativeElement = checkboxDebugElement.nativeElement;
      testComponent = fixture.debugElement.componentInstance;
      checkboxInstance = checkboxDebugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
    });

    it('should validate with RequiredTrue validator', () => {
      let checkboxElement = fixture.debugElement.query(By.directive(MatCheckbox));
      let ngModel = checkboxElement.injector.get<NgModel>(NgModel);

      testComponent.isRequired = true;
      inputElement.click();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(true);
      expect(ngModel.valid).toBe(true);

      inputElement.click();
      fixture.detectChanges();

      expect(checkboxInstance.checked).toBe(false);
      expect(ngModel.valid).toBe(false);
    });
  });

  describe('with name attribute', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxWithNameAttribute);
      fixture.detectChanges();
    });

    it('should forward name value to input element', () => {
      let checkboxElement = fixture.debugElement.query(By.directive(MatCheckbox));
      let inputElement = <HTMLInputElement> checkboxElement.nativeElement.querySelector('input');

      expect(inputElement.getAttribute('name')).toBe('test-name');
    });
  });

  describe('with form control', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxInstance: MatCheckbox;
    let testComponent: CheckboxWithFormControl;
    let inputElement: HTMLInputElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxWithFormControl);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
      checkboxInstance = checkboxDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxDebugElement.nativeElement.querySelector('input');
    });

    it('should toggle the disabled state', () => {
      expect(checkboxInstance.disabled).toBe(false);

      testComponent.formControl.disable();
      fixture.detectChanges();

      expect(checkboxInstance.disabled).toBe(true);
      expect(inputElement.disabled).toBe(true);

      testComponent.formControl.enable();
      fixture.detectChanges();

      expect(checkboxInstance.disabled).toBe(false);
      expect(inputElement.disabled).toBe(false);
    });
  });

  describe('without label', () => {
    let testComponent: CheckboxWithoutLabel;
    let checkboxElement: HTMLElement;
    let checkboxInnerContainer: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(CheckboxWithoutLabel);

      const checkboxDebugEl = fixture.debugElement.query(By.directive(MatCheckbox));

      testComponent = fixture.componentInstance;
      checkboxElement = checkboxDebugEl.nativeElement;
      checkboxInnerContainer = checkboxDebugEl
        .query(By.css('.mat-checkbox-inner-container')).nativeElement;
    });

    it('should remove margin for checkbox without a label', () => {
      fixture.detectChanges();

      expect(checkboxInnerContainer.classList)
        .toContain('mat-checkbox-inner-container-no-side-margin');
    });

    it('should not remove margin if initial label is set through binding', async(() => {
      testComponent.label = 'Some content';
      fixture.detectChanges();

      expect(checkboxInnerContainer.classList)
        .not.toContain('mat-checkbox-inner-container-no-side-margin');
    }));

    it('should re-add margin if label is added asynchronously', async(() => {
      fixture.detectChanges();

      expect(checkboxInnerContainer.classList)
        .toContain('mat-checkbox-inner-container-no-side-margin');

      testComponent.label = 'Some content';
      fixture.detectChanges();

      // Wait for the MutationObserver to detect the content change and for the cdkObserveContent
      // to emit the change event to the checkbox.
      setTimeout(() => {
        // The MutationObserver from the cdkObserveContent directive detected the content change
        // and notified the checkbox component. The checkbox then marks the component as dirty
        // by calling `markForCheck()`. This needs to be reflected by the component template then.
        fixture.detectChanges();

        expect(checkboxInnerContainer.classList)
          .not.toContain('mat-checkbox-inner-container-no-side-margin');
      }, 1);
    }));

    it('should not add the "name" attribute if it is not passed in', () => {
      fixture.detectChanges();
      expect(checkboxInnerContainer.querySelector('input')!.hasAttribute('name')).toBe(false);
    });

    it('should not add the "value" attribute if it is not passed in', () => {
      fixture.detectChanges();
      expect(checkboxInnerContainer.querySelector('input')!.hasAttribute('value')).toBe(false);
    });

  });
});

/** Simple component for testing a single checkbox. */
@Component({
  template: `
  <div (click)="parentElementClicked = true" (keyup)="parentElementKeyedUp = true">
    <mat-checkbox
        [id]="checkboxId"
        [required]="isRequired"
        [labelPosition]="labelPos"
        [checked]="isChecked"
        [(indeterminate)]="isIndeterminate"
        [disabled]="isDisabled"
        [color]="checkboxColor"
        [disableRipple]="disableRipple"
        [value]="checkboxValue"
        (click)="onCheckboxClick($event)"
        (change)="onCheckboxChange($event)">
      Simple checkbox
    </mat-checkbox>
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
  checkboxId: string | null = 'simple-check';
  checkboxColor: string = 'primary';
  checkboxValue: string = 'single_checkbox';

  onCheckboxClick: (event?: Event) => void = () => {};
  onCheckboxChange: (event?: MatCheckboxChange) => void = () => {};
}

/** Simple component for testing an MatCheckbox with ngModel in a form. */
@Component({
  template: `
    <form>
      <mat-checkbox name="cb" [(ngModel)]="isGood">Be good</mat-checkbox>
    </form>
  `,
})
class CheckboxWithFormDirectives {
  isGood: boolean = false;
}

/** Simple component for testing an MatCheckbox with required ngModel. */
@Component({
  template: `<mat-checkbox [required]="isRequired" [(ngModel)]="isGood">Be good</mat-checkbox>`,
})
class CheckboxWithNgModel {
  isGood: boolean = false;
  isRequired: boolean = true;
}

/** Simple test component with multiple checkboxes. */
@Component(({
  template: `
    <mat-checkbox>Option 1</mat-checkbox>
    <mat-checkbox>Option 2</mat-checkbox>
  `
}))
class MultipleCheckboxes { }


/** Simple test component with tabIndex */
@Component({
  template: `
    <mat-checkbox
        [tabIndex]="customTabIndex"
        [disabled]="isDisabled">
    </mat-checkbox>`,
})
class CheckboxWithTabIndex {
  customTabIndex: number = 7;
  isDisabled: boolean = false;
}

/** Simple test component with an aria-label set. */
@Component({
  template: `<mat-checkbox aria-label="Super effective"></mat-checkbox>`
})
class CheckboxWithAriaLabel { }

/** Simple test component with an aria-label set. */
@Component({
  template: `<mat-checkbox aria-labelledby="some-id"></mat-checkbox>`
})
class CheckboxWithAriaLabelledby {}

/** Simple test component with name attribute */
@Component({
  template: `<mat-checkbox name="test-name"></mat-checkbox>`
})
class CheckboxWithNameAttribute {}

/** Simple test component with change event */
@Component({
  template: `<mat-checkbox (change)="lastEvent = $event"></mat-checkbox>`
})
class CheckboxWithChangeEvent {
  lastEvent: MatCheckboxChange;
}

/** Test component with reactive forms */
@Component({
  template: `<mat-checkbox [formControl]="formControl"></mat-checkbox>`
})
class CheckboxWithFormControl {
  formControl = new FormControl();
}

/** Test component without label */
@Component({
  template: `<mat-checkbox>{{ label }}</mat-checkbox>`
})
class CheckboxWithoutLabel {
  label: string;
}

/** Test component with the native tabindex attribute. */
@Component({
  template: `<mat-checkbox tabindex="5"></mat-checkbox>`
})
class CheckboxWithTabindexAttr {}
