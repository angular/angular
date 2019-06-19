import {dispatchFakeEvent} from '@angular/cdk/testing';
import {ChangeDetectionStrategy, Component, DebugElement, Type} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  flushMicrotasks,
  TestBed,
} from '@angular/core/testing';
import {FormControl, FormsModule, NgModel, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {
  MAT_CHECKBOX_CLICK_ACTION,
  MatCheckbox,
  MatCheckboxChange,
  MatCheckboxModule
} from './index';


describe('MatCheckbox', () => {
  let fixture: ComponentFixture<any>;

  function createComponent<T>(componentType: Type<T>, extraDeclarations: Type<any>[] = []) {
    TestBed
        .configureTestingModule({
          imports: [MatCheckboxModule, FormsModule, ReactiveFormsModule],
          declarations: [componentType, ...extraDeclarations],
        })
        .compileComponents();

    return TestBed.createComponent<T>(componentType);
  }

  describe('basic behaviors', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let checkboxInstance: MatCheckbox;
    let testComponent: SingleCheckbox;
    let inputElement: HTMLInputElement;
    let labelElement: HTMLLabelElement;

    beforeEach(() => {
      fixture = createComponent(SingleCheckbox);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      checkboxInstance = checkboxDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
      labelElement = <HTMLLabelElement>checkboxNativeElement.querySelector('label');
    });

    it('should add and remove the checked state', fakeAsync(() => {
         expect(checkboxInstance.checked).toBe(false);
         expect(inputElement.checked).toBe(false);

         testComponent.isChecked = true;
         fixture.detectChanges();

         expect(checkboxInstance.checked).toBe(true);
         expect(inputElement.checked).toBe(true);

         testComponent.isChecked = false;
         fixture.detectChanges();

         expect(checkboxInstance.checked).toBe(false);
         expect(inputElement.checked).toBe(false);
       }));


    it('should toggle checkbox ripple disabledness correctly', fakeAsync(() => {
      const rippleSelector = '.mat-ripple-element:not(.mat-checkbox-persistent-ripple)';

      testComponent.isDisabled = true;
      fixture.detectChanges();
      dispatchFakeEvent(labelElement, 'mousedown');
      dispatchFakeEvent(labelElement, 'mouseup');
      labelElement.click();
      expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(0);

      flush();
      testComponent.isDisabled = false;
      fixture.detectChanges();
      dispatchFakeEvent(labelElement, 'mousedown');
      dispatchFakeEvent(labelElement, 'mouseup');
      labelElement.click();
      expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(1);

      flush();
    }));

    it('should add and remove indeterminate state', fakeAsync(() => {
         expect(inputElement.checked).toBe(false);
         expect(inputElement.indeterminate).toBe(false);
         expect(inputElement.getAttribute('aria-checked'))
             .toBe('false', 'Expect aria-checked to be false');

         testComponent.isIndeterminate = true;
         fixture.detectChanges();

         expect(inputElement.checked).toBe(false);
         expect(inputElement.indeterminate).toBe(true);
         expect(inputElement.getAttribute('aria-checked'))
             .toBe('mixed', 'Expect aria checked to be mixed for indeterminate checkbox');

         testComponent.isIndeterminate = false;
         fixture.detectChanges();

         expect(inputElement.checked).toBe(false);
         expect(inputElement.indeterminate).toBe(false);
       }));

    it('should set indeterminate to false when input clicked', fakeAsync(() => {
         testComponent.isIndeterminate = true;
         fixture.detectChanges();

         expect(checkboxInstance.indeterminate).toBe(true);
         expect(inputElement.indeterminate).toBe(true);
         expect(testComponent.isIndeterminate).toBe(true);

         inputElement.click();
         fixture.detectChanges();

         // Flush the microtasks because the forms module updates the model state asynchronously.
         flush();

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
         flush();

         // The checked property has been updated from the model and now the view needs
         // to reflect the state change.
         fixture.detectChanges();

         expect(checkboxInstance.checked).toBe(false);
         expect(inputElement.indeterminate).toBe(false);
         expect(inputElement.checked).toBe(false);
         expect(testComponent.isIndeterminate).toBe(false);
       }));

    it('should not set indeterminate to false when checked is set programmatically',
       fakeAsync(() => {
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

    it('should toggle checked state on click', fakeAsync(() => {
         expect(checkboxInstance.checked).toBe(false);

         labelElement.click();
         fixture.detectChanges();
         flush();

         expect(checkboxInstance.checked).toBe(true);

         labelElement.click();
         fixture.detectChanges();
         flush();

         expect(checkboxInstance.checked).toBe(false);
       }));

    it('should change from indeterminate to checked on click', fakeAsync(() => {
         testComponent.isChecked = false;
         testComponent.isIndeterminate = true;
         fixture.detectChanges();

         expect(checkboxInstance.checked).toBe(false);
         expect(checkboxInstance.indeterminate).toBe(true);

         inputElement.click();
         fixture.detectChanges();
         flush();

         expect(checkboxInstance.checked).toBe(true);
         expect(checkboxInstance.indeterminate).toBe(false);

         inputElement.click();
         fixture.detectChanges();
         flush();

         expect(checkboxInstance.checked).toBe(false);
         expect(checkboxInstance.indeterminate).toBe(false);
       }));

    it('should add and remove disabled state', fakeAsync(() => {
         expect(checkboxInstance.disabled).toBe(false);
         expect(inputElement.tabIndex).toBe(0);
         expect(inputElement.disabled).toBe(false);

         testComponent.isDisabled = true;
         fixture.detectChanges();

         expect(checkboxInstance.disabled).toBe(true);
         expect(inputElement.disabled).toBe(true);

         testComponent.isDisabled = false;
         fixture.detectChanges();

         expect(checkboxInstance.disabled).toBe(false);
         expect(inputElement.tabIndex).toBe(0);
         expect(inputElement.disabled).toBe(false);
       }));

    it('should not toggle `checked` state upon interation while disabled', fakeAsync(() => {
         testComponent.isDisabled = true;
         fixture.detectChanges();

         checkboxNativeElement.click();
         expect(checkboxInstance.checked).toBe(false);
       }));

    it('should overwrite indeterminate state when clicked', fakeAsync(() => {
         testComponent.isIndeterminate = true;
         fixture.detectChanges();

         inputElement.click();
         fixture.detectChanges();

         // Flush the microtasks because the indeterminate state will be updated in the next tick.
         flush();

         expect(checkboxInstance.checked).toBe(true);
         expect(checkboxInstance.indeterminate).toBe(false);
       }));

    it('should preserve the user-provided id', fakeAsync(() => {
         expect(checkboxNativeElement.id).toBe('simple-check');
         expect(inputElement.id).toBe('simple-check-input');
       }));

    it('should generate a unique id for the checkbox input if no id is set', fakeAsync(() => {
         testComponent.checkboxId = null;
         fixture.detectChanges();

         expect(checkboxInstance.inputId).toMatch(/mat-mdc-checkbox-\d+/);
         expect(inputElement.id).toBe(checkboxInstance.inputId);
       }));

    it('should project the checkbox content into the label element', fakeAsync(() => {
         let label = <HTMLLabelElement>checkboxNativeElement.querySelector('label');
         expect(label.textContent!.trim()).toBe('Simple checkbox');
       }));

    it('should make the host element a tab stop', fakeAsync(() => {
         expect(inputElement.tabIndex).toBe(0);
       }));

    it('should add a css class to position the label before the checkbox', fakeAsync(() => {
         testComponent.labelPos = 'before';
         fixture.detectChanges();

         expect(checkboxNativeElement.querySelector('.mdc-form-field')!.classList)
             .toContain('mdc-form-field--align-end');
       }));

    it('should not trigger the click event multiple times', fakeAsync(() => {
         // By default, when clicking on a label element, a generated click will be dispatched
         // on the associated input element.
         // Since we're using a label element and a visual hidden input, this behavior can led
         // to an issue, where the click events on the checkbox are getting executed twice.

         spyOn(testComponent, 'onCheckboxClick');

         expect(inputElement.checked).toBe(false);

         labelElement.click();
         fixture.detectChanges();
         flush();

         expect(inputElement.checked).toBe(true);
         expect(testComponent.onCheckboxClick).toHaveBeenCalledTimes(1);
       }));

    it('should trigger a change event when the native input does', fakeAsync(() => {
         spyOn(testComponent, 'onCheckboxChange');

         expect(inputElement.checked).toBe(false);

         labelElement.click();
         fixture.detectChanges();
         flush();

         expect(inputElement.checked).toBe(true);
         expect(testComponent.onCheckboxChange).toHaveBeenCalledTimes(1);
       }));

    it('should not trigger the change event by changing the native value', fakeAsync(() => {
         spyOn(testComponent, 'onCheckboxChange');

         expect(inputElement.checked).toBe(false);

         testComponent.isChecked = true;
         fixture.detectChanges();
         flush();

         expect(inputElement.checked).toBe(true);
         expect(testComponent.onCheckboxChange).not.toHaveBeenCalled();
       }));

    it('should forward the required attribute', fakeAsync(() => {
         testComponent.isRequired = true;
         fixture.detectChanges();

         expect(inputElement.required).toBe(true);

         testComponent.isRequired = false;
         fixture.detectChanges();

         expect(inputElement.required).toBe(false);
       }));

    it('should focus on underlying input element when focus() is called', fakeAsync(() => {
         expect(document.activeElement).not.toBe(inputElement);

         checkboxInstance.focus();
         fixture.detectChanges();

         expect(document.activeElement).toBe(inputElement);
       }));

    it('should forward the value to input element', fakeAsync(() => {
         testComponent.checkboxValue = 'basic_checkbox';
         fixture.detectChanges();

         expect(inputElement.value).toBe('basic_checkbox');
       }));

    it('should remove the SVG checkmark from the tab order', fakeAsync(() => {
         expect(checkboxNativeElement.querySelector('svg')!.getAttribute('focusable'))
             .toBe('false');
       }));

    describe('ripple elements', () => {
      it('should show ripples on label mousedown', fakeAsync(() => {
           const rippleSelector = '.mat-ripple-element:not(.mat-checkbox-persistent-ripple)';

           expect(checkboxNativeElement.querySelector(rippleSelector)).toBeFalsy();

           dispatchFakeEvent(labelElement, 'mousedown');
           dispatchFakeEvent(labelElement, 'mouseup');
           labelElement.click();

           expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(1);

           flush();
         }));

      it('should not show ripples when disabled', fakeAsync(() => {
           const rippleSelector = '.mat-ripple-element:not(.mat-checkbox-persistent-ripple)';
           testComponent.isDisabled = true;
           fixture.detectChanges();

           dispatchFakeEvent(labelElement, 'mousedown');
           dispatchFakeEvent(labelElement, 'mouseup');
           labelElement.click();

           expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(0);

           flush();
           testComponent.isDisabled = false;
           fixture.detectChanges();

           dispatchFakeEvent(labelElement, 'mousedown');
           dispatchFakeEvent(labelElement, 'mouseup');
           labelElement.click();

           expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(1);

           flush();
         }));

      it('should remove ripple if matRippleDisabled input is set', fakeAsync(() => {
           const rippleSelector = '.mat-ripple-element:not(.mat-checkbox-persistent-ripple)';
           testComponent.disableRipple = true;
           fixture.detectChanges();

           dispatchFakeEvent(labelElement, 'mousedown');
           dispatchFakeEvent(labelElement, 'mouseup');
           labelElement.click();

           expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(0);

           flush();
           testComponent.disableRipple = false;
           fixture.detectChanges();

           dispatchFakeEvent(labelElement, 'mousedown');
           dispatchFakeEvent(labelElement, 'mouseup');
           labelElement.click();

           expect(checkboxNativeElement.querySelectorAll(rippleSelector).length).toBe(1);

           flush();
         }));
    });

    describe('color behaviour', () => {
      it('should apply class based on color attribute', fakeAsync(() => {
           testComponent.checkboxColor = 'primary';
           fixture.detectChanges();
           expect(checkboxNativeElement.classList.contains('mat-primary')).toBe(true);

           testComponent.checkboxColor = 'accent';
           fixture.detectChanges();
           expect(checkboxNativeElement.classList.contains('mat-accent')).toBe(true);
         }));

      it('should not clear previous defined classes', fakeAsync(() => {
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
         }));
    });

    describe(`when MAT_CHECKBOX_CLICK_ACTION is 'check'`, () => {
      beforeEach(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [MatCheckboxModule, FormsModule, ReactiveFormsModule],
          declarations: [SingleCheckbox],
          providers: [{provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'check'}]
        });

        fixture = createComponent(SingleCheckbox);
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
           flush();

           expect(inputElement.checked).toBe(true);
           expect(inputElement.indeterminate).toBe(true);
         }));
    });

    describe(`when MAT_CHECKBOX_CLICK_ACTION is 'noop'`, () => {
      beforeEach(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [MatCheckboxModule, FormsModule, ReactiveFormsModule],
          declarations: [SingleCheckbox],
          providers: [{provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'noop'}]
        });

        fixture = createComponent(SingleCheckbox);
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
           flush();

           expect(inputElement.checked).toBe(false);
           expect(inputElement.indeterminate).toBe(true);
         }));


      it(`should not change 'checked' or 'indeterminate' on click if noop is set`, fakeAsync(() => {
           testComponent.isChecked = true;
           testComponent.isIndeterminate = true;
           inputElement.click();
           fixture.detectChanges();
           flush();

           expect(inputElement.checked).toBe(true);
           expect(inputElement.indeterminate).toBe(true);

           testComponent.isChecked = false;
           inputElement.click();
           fixture.detectChanges();
           flush();

           expect(inputElement.checked).toBe(false);
           expect(inputElement.indeterminate).toBe(true, 'indeterminate should not change');
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
      fixture = createComponent(CheckboxWithChangeEvent);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      checkboxInstance = checkboxDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
      labelElement = <HTMLLabelElement>checkboxNativeElement.querySelector('label');
    });

    it('should emit the event to the change observable', fakeAsync(() => {
         let changeSpy = jasmine.createSpy('onChangeObservable');

         checkboxInstance.change.subscribe(changeSpy);

         fixture.detectChanges();
         expect(changeSpy).not.toHaveBeenCalled();

         // When changing the native `checked` property the checkbox will not fire a change event,
         // because the element is not focused and it's not the native behavior of the input
         // element.
         labelElement.click();
         fixture.detectChanges();
         flush();

         expect(changeSpy).toHaveBeenCalledTimes(1);
       }));

    it('should not emit a DOM event to the change output', fakeAsync(() => {
         fixture.detectChanges();
         expect(testComponent.lastEvent).toBeUndefined();

         // Trigger the click on the inputElement, because the input will probably
         // emit a DOM event to the change output.
         inputElement.click();
         fixture.detectChanges();
         flush();

         // We're checking the arguments type / emitted value to be a boolean, because sometimes the
         // emitted value can be a DOM Event, which is not valid.
         // See angular/angular#4059
         expect(testComponent.lastEvent.checked).toBe(true);
       }));
  });

  describe('aria-label', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let inputElement: HTMLInputElement;

    it('should use the provided aria-label', fakeAsync(() => {
         fixture = createComponent(CheckboxWithAriaLabel);
         checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
         checkboxNativeElement = checkboxDebugElement.nativeElement;
         inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

         fixture.detectChanges();
         expect(inputElement.getAttribute('aria-label')).toBe('Super effective');
       }));

    it('should not set the aria-label attribute if no value is provided', fakeAsync(() => {
         fixture = createComponent(SingleCheckbox);
         fixture.detectChanges();

         expect(fixture.nativeElement.querySelector('input').hasAttribute('aria-label'))
             .toBe(false);
       }));
  });

  describe('with provided aria-labelledby ', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let inputElement: HTMLInputElement;

    it('should use the provided aria-labelledby', fakeAsync(() => {
         fixture = createComponent(CheckboxWithAriaLabelledby);
         checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
         checkboxNativeElement = checkboxDebugElement.nativeElement;
         inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

         fixture.detectChanges();
         expect(inputElement.getAttribute('aria-labelledby')).toBe('some-id');
       }));

    it('should not assign aria-labelledby if none is provided', fakeAsync(() => {
         fixture = createComponent(SingleCheckbox);
         checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
         checkboxNativeElement = checkboxDebugElement.nativeElement;
         inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');

         fixture.detectChanges();
         expect(inputElement.getAttribute('aria-labelledby')).toBe(null);
       }));
  });

  describe('with provided tabIndex', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let testComponent: CheckboxWithTabIndex;
    let inputElement: HTMLInputElement;

    beforeEach(() => {
      fixture = createComponent(CheckboxWithTabIndex);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
    });

    it('should preserve any given tabIndex', fakeAsync(() => {
         expect(inputElement.tabIndex).toBe(7);
       }));

    it('should preserve given tabIndex when the checkbox is disabled then enabled',
       fakeAsync(() => {
         testComponent.isDisabled = true;
         fixture.detectChanges();

         testComponent.customTabIndex = 13;
         fixture.detectChanges();

         testComponent.isDisabled = false;
         fixture.detectChanges();

         expect(inputElement.tabIndex).toBe(13);
       }));
  });

  describe('with native tabindex attribute', () => {
    it('should properly detect native tabindex attribute', fakeAsync(() => {
         fixture = createComponent(CheckboxWithTabindexAttr);
         fixture.detectChanges();

         const checkbox =
             fixture.debugElement.query(By.directive(MatCheckbox)).componentInstance as MatCheckbox;

         expect(checkbox.tabIndex)
             .toBe(5, 'Expected tabIndex property to have been set based on the native attribute');
       }));

    it('should clear the tabindex attribute from the host element', fakeAsync(() => {
         fixture = createComponent(CheckboxWithTabindexAttr);
         fixture.detectChanges();

         const checkbox = fixture.debugElement.query(By.directive(MatCheckbox)).nativeElement;
         expect(checkbox.getAttribute('tabindex')).toBeFalsy();
       }));
  });

  describe('with multiple checkboxes', () => {
    beforeEach(() => {
      fixture = createComponent(MultipleCheckboxes);
      fixture.detectChanges();
    });

    it('should assign a unique id to each checkbox', fakeAsync(() => {
         let [firstId, secondId] =
             fixture.debugElement.queryAll(By.directive(MatCheckbox))
                 .map(debugElement => debugElement.nativeElement.querySelector('input').id);

         expect(firstId).toMatch(/mat-mdc-checkbox-\d+-input/);
         expect(secondId).toMatch(/mat-mdc-checkbox-\d+-input/);
         expect(firstId).not.toEqual(secondId);
       }));
  });

  describe('with ngModel', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxNativeElement: HTMLElement;
    let checkboxInstance: MatCheckbox;
    let inputElement: HTMLInputElement;
    let ngModel: NgModel;

    beforeEach(() => {
      fixture = createComponent(CheckboxWithNgModel);

      fixture.componentInstance.isRequired = false;
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
      checkboxNativeElement = checkboxDebugElement.nativeElement;
      checkboxInstance = checkboxDebugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
      ngModel = checkboxDebugElement.injector.get<NgModel>(NgModel);
    });

    it('should be pristine, untouched, and valid initially', fakeAsync(() => {
         expect(ngModel.valid).toBe(true);
         expect(ngModel.pristine).toBe(true);
         expect(ngModel.touched).toBe(false);
       }));

    it('should have correct control states after interaction', fakeAsync(() => {
         inputElement.click();
         fixture.detectChanges();

         // Flush the timeout that is being created whenever a `click` event has been fired by
         // the underlying input.
         flush();

         // After the value change through interaction, the control should be dirty, but remain
         // untouched as long as the focus is still on the underlying input.
         expect(ngModel.pristine).toBe(false);
         expect(ngModel.touched).toBe(false);

         // If the input element loses focus, the control should remain dirty but should
         // also turn touched.
         dispatchFakeEvent(inputElement, 'blur');
         fixture.detectChanges();
         flushMicrotasks();

         expect(ngModel.pristine).toBe(false);
         expect(ngModel.touched).toBe(true);
       }));

    it('should mark the element as touched on blur when inside an OnPush parent', fakeAsync(() => {
         fixture.destroy();
         TestBed.resetTestingModule();
         fixture = createComponent(CheckboxWithNgModelAndOnPush);
         fixture.detectChanges();

         checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
         checkboxNativeElement = checkboxDebugElement.nativeElement;
         checkboxInstance = checkboxDebugElement.componentInstance;
         inputElement = <HTMLInputElement>checkboxNativeElement.querySelector('input');
         ngModel = checkboxDebugElement.injector.get<NgModel>(NgModel);

         inputElement.click();
         fixture.detectChanges();
         flush();

         expect(checkboxNativeElement.classList).not.toContain('ng-touched');

         dispatchFakeEvent(inputElement, 'blur');
         fixture.detectChanges();
         flushMicrotasks();
         fixture.detectChanges();

         expect(checkboxNativeElement.classList).toContain('ng-touched');
       }));


    it('should not throw an error when disabling while focused', fakeAsync(() => {
         expect(() => {
           // Focus the input element because after disabling, the `blur` event should automatically
           // fire and not result in a changed after checked exception. Related: #12323
           inputElement.focus();

           fixture.componentInstance.isDisabled = true;
           fixture.detectChanges();

           flushMicrotasks();
         }).not.toThrow();
       }));

    it('should toggle checked state on click', fakeAsync(() => {
         expect(checkboxInstance.checked).toBe(false);

         inputElement.click();
         fixture.detectChanges();
         flush();

         expect(checkboxInstance.checked).toBe(true);

         inputElement.click();
         fixture.detectChanges();
         flush();

         expect(checkboxInstance.checked).toBe(false);
       }));

    it('should validate with RequiredTrue validator', fakeAsync(() => {
         fixture.componentInstance.isRequired = true;
         inputElement.click();
         fixture.detectChanges();
         flush();

         expect(checkboxInstance.checked).toBe(true);
         expect(ngModel.valid).toBe(true);

         inputElement.click();
         fixture.detectChanges();
         flush();

         expect(checkboxInstance.checked).toBe(false);
         expect(ngModel.valid).toBe(false);
       }));
  });

  describe('with name attribute', () => {
    beforeEach(() => {
      fixture = createComponent(CheckboxWithNameAttribute);
      fixture.detectChanges();
    });

    it('should forward name value to input element', fakeAsync(() => {
         let checkboxElement = fixture.debugElement.query(By.directive(MatCheckbox));
         let inputElement = <HTMLInputElement>checkboxElement.nativeElement.querySelector('input');

         expect(inputElement.getAttribute('name')).toBe('test-name');
       }));
  });

  describe('with form control', () => {
    let checkboxDebugElement: DebugElement;
    let checkboxInstance: MatCheckbox;
    let testComponent: CheckboxWithFormControl;
    let inputElement: HTMLInputElement;

    beforeEach(() => {
      fixture = createComponent(CheckboxWithFormControl);
      fixture.detectChanges();

      checkboxDebugElement = fixture.debugElement.query(By.directive(MatCheckbox));
      checkboxInstance = checkboxDebugElement.componentInstance;
      testComponent = fixture.debugElement.componentInstance;
      inputElement = <HTMLInputElement>checkboxDebugElement.nativeElement.querySelector('input');
    });

    it('should toggle the disabled state', fakeAsync(() => {
         expect(checkboxInstance.disabled).toBe(false);

         testComponent.formControl.disable();
         fixture.detectChanges();

         expect(checkboxInstance.disabled).toBe(true);
         expect(inputElement.disabled).toBe(true);

         testComponent.formControl.enable();
         fixture.detectChanges();

         expect(checkboxInstance.disabled).toBe(false);
         expect(inputElement.disabled).toBe(false);
       }));
  });

  describe('without label', () => {
    let checkboxInnerContainer: HTMLElement;

    beforeEach(() => {
      fixture = createComponent(CheckboxWithoutLabel);
      const checkboxDebugEl = fixture.debugElement.query(By.directive(MatCheckbox));
      checkboxInnerContainer = checkboxDebugEl.query(By.css('.mdc-form-field')).nativeElement;
    });

    it('should not add the "name" attribute if it is not passed in', fakeAsync(() => {
         fixture.detectChanges();
         expect(checkboxInnerContainer.querySelector('input')!.hasAttribute('name')).toBe(false);
       }));

    it('should not add the "value" attribute if it is not passed in', fakeAsync(() => {
         fixture.detectChanges();
         expect(checkboxInnerContainer.querySelector('input')!.hasAttribute('value')).toBe(false);
       }));
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
  labelPos: 'before'|'after' = 'after';
  isChecked: boolean = false;
  isRequired: boolean = false;
  isIndeterminate: boolean = false;
  isDisabled: boolean = false;
  disableRipple: boolean = false;
  parentElementClicked: boolean = false;
  parentElementKeyedUp: boolean = false;
  checkboxId: string|null = 'simple-check';
  checkboxColor: string = 'primary';
  checkboxValue: string = 'single_checkbox';

  onCheckboxClick: (event?: Event) => void = () => {};
  onCheckboxChange: (event?: MatCheckboxChange) => void = () => {};
}

/** Simple component for testing an MatCheckbox with required ngModel. */
@Component({
  template: `<mat-checkbox [required]="isRequired" [(ngModel)]="isGood"
                           [disabled]="isDisabled">Be good</mat-checkbox>`,
})
class CheckboxWithNgModel {
  isGood: boolean = false;
  isRequired: boolean = true;
  isDisabled: boolean = false;
}

@Component({
  template: `<mat-checkbox [required]="isRequired" [(ngModel)]="isGood">Be good</mat-checkbox>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CheckboxWithNgModelAndOnPush extends CheckboxWithNgModel {
}

/** Simple test component with multiple checkboxes. */
@Component(({
  template: `
    <mat-checkbox>Option 1</mat-checkbox>
    <mat-checkbox>Option 2</mat-checkbox>
  `
}))
class MultipleCheckboxes {
}


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
@Component({template: `<mat-checkbox aria-label="Super effective"></mat-checkbox>`})
class CheckboxWithAriaLabel {
}

/** Simple test component with an aria-label set. */
@Component({template: `<mat-checkbox aria-labelledby="some-id"></mat-checkbox>`})
class CheckboxWithAriaLabelledby {
}

/** Simple test component with name attribute */
@Component({template: `<mat-checkbox name="test-name"></mat-checkbox>`})
class CheckboxWithNameAttribute {
}

/** Simple test component with change event */
@Component({template: `<mat-checkbox (change)="lastEvent = $event"></mat-checkbox>`})
class CheckboxWithChangeEvent {
  lastEvent: MatCheckboxChange;
}

/** Test component with reactive forms */
@Component({template: `<mat-checkbox [formControl]="formControl"></mat-checkbox>`})
class CheckboxWithFormControl {
  formControl = new FormControl();
}

/** Test component without label */
@Component({template: `<mat-checkbox>{{ label }}</mat-checkbox>`})
class CheckboxWithoutLabel {
  label: string;
}

/** Test component with the native tabindex attribute. */
@Component({template: `<mat-checkbox tabindex="5"></mat-checkbox>`})
class CheckboxWithTabindexAttr {
}
