/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';
import {TestBed, async, fakeAsync, tick} from '@angular/core/testing';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgForm} from '@angular/forms';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {dispatchEvent} from '@angular/platform-browser/testing/browser_util';

export function main() {
  describe('template-driven forms integration tests', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [
          StandaloneNgModel, NgModelForm, NgModelGroupForm, NgModelValidBinding, NgModelNgIfForm,
          NgModelRadioForm, NgModelSelectForm, NgNoFormComp, InvalidNgModelNoName,
          NgModelOptionsStandalone, NgModelCustomComp, NgModelCustomWrapper,
          NgModelValidationBindings
        ],
        imports: [FormsModule]
      });
    });

    describe('basic functionality', () => {
      it('should support ngModel for standalone fields', fakeAsync(() => {
           const fixture = TestBed.createComponent(StandaloneNgModel);
           fixture.componentInstance.name = 'oldValue';

           fixture.detectChanges();
           tick();

           // model -> view
           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           expect(input.value).toEqual('oldValue');

           input.value = 'updatedValue';
           dispatchEvent(input, 'input');
           tick();

           // view -> model
           expect(fixture.componentInstance.name).toEqual('updatedValue');
         }));

      it('should support ngModel registration with a parent form', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelForm);
           fixture.componentInstance.name = 'Nancy';

           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.value).toEqual({name: 'Nancy'});
           expect(form.valid).toBe(false);
         }));

      it('should support ngModelGroup', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelGroupForm);
           fixture.componentInstance.first = 'Nancy';
           fixture.componentInstance.last = 'Drew';
           fixture.componentInstance.email = 'some email';

           fixture.detectChanges();
           tick();

           // model -> view
           const inputs = fixture.debugElement.queryAll(By.css('input'));
           expect(inputs[0].nativeElement.value).toEqual('Nancy');
           expect(inputs[1].nativeElement.value).toEqual('Drew');

           inputs[0].nativeElement.value = 'Carson';
           dispatchEvent(inputs[0].nativeElement, 'input');
           tick();

           // view -> model
           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.value).toEqual({name: {first: 'Carson', last: 'Drew'}, email: 'some email'});
         }));

      it('should add controls and control groups to form control model', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelGroupForm);
           fixture.componentInstance.first = 'Nancy';
           fixture.componentInstance.last = 'Drew';
           fixture.componentInstance.email = 'some email';

           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.control.get('name').value).toEqual({first: 'Nancy', last: 'Drew'});
           expect(form.control.get('name.first').value).toEqual('Nancy');
           expect(form.control.get('email').value).toEqual('some email');
         }));

      it('should remove controls and control groups from form control model', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelNgIfForm);
           fixture.componentInstance.emailShowing = true;
           fixture.componentInstance.first = 'Nancy';
           fixture.componentInstance.email = 'some email';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.control.get('email').value).toEqual('some email');
           expect(form.value).toEqual({name: {first: 'Nancy'}, email: 'some email'});

           // should remove individual control successfully
           fixture.componentInstance.emailShowing = false;
           fixture.detectChanges();
           tick();

           expect(form.control.get('email')).toBe(null);
           expect(form.value).toEqual({name: {first: 'Nancy'}});

           expect(form.control.get('name').value).toEqual({first: 'Nancy'});
           expect(form.control.get('name.first').value).toEqual('Nancy');

           // should remove form group successfully
           fixture.componentInstance.groupShowing = false;
           fixture.detectChanges();
           tick();

           expect(form.control.get('name')).toBe(null);
           expect(form.control.get('name.first')).toBe(null);
           expect(form.value).toEqual({});
         }));

      it('should set status classes with ngModel', async(() => {
           const fixture = TestBed.createComponent(NgModelForm);
           fixture.componentInstance.name = 'aa';
           fixture.detectChanges();
           fixture.whenStable().then(() => {
             fixture.detectChanges();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-untouched']);

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-touched']);

             input.value = 'updatedValue';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
           });
         }));

      it('should set status classes with ngModelGroup and ngForm', async(() => {
           const fixture = TestBed.createComponent(NgModelGroupForm);
           fixture.componentInstance.first = '';
           fixture.detectChanges();

           const form = fixture.debugElement.query(By.css('form')).nativeElement;
           const modelGroup = fixture.debugElement.query(By.css('[ngModelGroup]')).nativeElement;
           const input = fixture.debugElement.query(By.css('input')).nativeElement;

           // ngModelGroup creates its control asynchronously
           fixture.whenStable().then(() => {
             fixture.detectChanges();
             expect(sortedClassList(modelGroup)).toEqual([
               'ng-invalid', 'ng-pristine', 'ng-untouched'
             ]);

             expect(sortedClassList(form)).toEqual(['ng-invalid', 'ng-pristine', 'ng-untouched']);

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(sortedClassList(modelGroup)).toEqual([
               'ng-invalid', 'ng-pristine', 'ng-touched'
             ]);
             expect(sortedClassList(form)).toEqual(['ng-invalid', 'ng-pristine', 'ng-touched']);

             input.value = 'updatedValue';
             dispatchEvent(input, 'input');
             fixture.detectChanges();

             expect(sortedClassList(modelGroup)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
             expect(sortedClassList(form)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
           });
         }));

      it('should not create a template-driven form when ngNoForm is used', () => {
        const fixture = TestBed.createComponent(NgNoFormComp);
        fixture.detectChanges();
        expect(fixture.debugElement.children[0].providerTokens.length).toEqual(0);
      });
    });

    describe('name and ngModelOptions', () => {
      it('should throw if ngModel has a parent form but no name attr or standalone label', () => {
        const fixture = TestBed.createComponent(InvalidNgModelNoName);
        expect(() => fixture.detectChanges())
            .toThrowError(new RegExp(`name attribute must be set`));
      });

      it('should not throw if ngModel has a parent form, no name attr, and a standalone label',
         () => {
           const fixture = TestBed.createComponent(NgModelOptionsStandalone);
           expect(() => fixture.detectChanges()).not.toThrow();
         });

      it('should not register standalone ngModels with parent form', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelOptionsStandalone);
           fixture.componentInstance.one = 'some data';
           fixture.componentInstance.two = 'should not show';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           const inputs = fixture.debugElement.queryAll(By.css('input'));
           tick();

           expect(form.value).toEqual({one: 'some data'});
           expect(inputs[1].nativeElement.value).toEqual('should not show');
         }));

      it('should override name attribute with ngModelOptions name if provided', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelForm);
           fixture.componentInstance.options = {name: 'override'};
           fixture.componentInstance.name = 'some data';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.value).toEqual({override: 'some data'});
         }));
    });

    describe('submit and reset events', () => {
      it('should emit ngSubmit event on submit', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelForm);
           fixture.componentInstance.name = 'old';

           const form = fixture.debugElement.query(By.css('form'));
           dispatchEvent(form.nativeElement, 'submit');
           tick();

           expect(fixture.componentInstance.name).toEqual('submitted');
         }));

      it('should mark NgForm as submitted on submit event', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelForm);

           tick();
           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.submitted).toBe(false);

           const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
           dispatchEvent(formEl, 'submit');
           tick();

           expect(form.submitted).toBe(true);
         }));

      it('should reset the form to empty when reset event is fired', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelForm);
           fixture.componentInstance.name = 'should be cleared';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           const formEl = fixture.debugElement.query(By.css('form'));
           const input = fixture.debugElement.query(By.css('input'));

           expect(input.nativeElement.value).toBe('should be cleared');       // view value
           expect(fixture.componentInstance.name).toBe('should be cleared');  // ngModel value
           expect(form.value.name).toEqual('should be cleared');              // control value

           dispatchEvent(formEl.nativeElement, 'reset');
           fixture.detectChanges();
           tick();

           expect(input.nativeElement.value).toBe('');         // view value
           expect(fixture.componentInstance.name).toBe(null);  // ngModel value
           expect(form.value.name).toEqual(null);              // control value
         }));

      it('should reset the form submit state when reset button is clicked', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelForm);
           const form = fixture.debugElement.children[0].injector.get(NgForm);
           const formEl = fixture.debugElement.query(By.css('form'));

           dispatchEvent(formEl.nativeElement, 'submit');
           fixture.detectChanges();
           tick();
           expect(form.submitted).toBe(true);

           dispatchEvent(formEl.nativeElement, 'reset');
           fixture.detectChanges();
           tick();
           expect(form.submitted).toBe(false);
         }));
    });

    describe('valueChange and statusChange events', () => {
      it('should emit valueChanges and statusChanges on init', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelForm);
           const form = fixture.debugElement.children[0].injector.get(NgForm);
           fixture.componentInstance.name = 'aa';
           fixture.detectChanges();

           expect(form.valid).toEqual(true);
           expect(form.value).toEqual({});

           let formValidity: string;
           let formValue: Object;

           form.statusChanges.subscribe((status: string) => formValidity = status);
           form.valueChanges.subscribe((value: string) => formValue = value);

           tick();

           expect(formValidity).toEqual('INVALID');
           expect(formValue).toEqual({name: 'aa'});
         }));

      it('should mark controls dirty before emitting the value change event', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelForm);
           const form = fixture.debugElement.children[0].injector.get(NgForm).form;

           fixture.detectChanges();
           tick();

           form.get('name').valueChanges.subscribe(
               () => { expect(form.get('name').dirty).toBe(true); });

           const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
           inputEl.value = 'newValue';

           dispatchEvent(inputEl, 'input');
         }));

      it('should mark controls pristine before emitting the value change event when resetting ',
         fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelForm);
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm).form;
           const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
           const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

           inputEl.value = 'newValue';
           dispatchEvent(inputEl, 'input');

           expect(form.get('name').pristine).toBe(false);

           form.get('name').valueChanges.subscribe(
               () => { expect(form.get('name').pristine).toBe(true); });

           dispatchEvent(formEl, 'reset');
         }));
    });

    describe('disabled controls', () => {
      it('should not consider disabled controls in value or validation', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelGroupForm);
           fixture.componentInstance.isDisabled = false;
           fixture.componentInstance.first = '';
           fixture.componentInstance.last = 'Drew';
           fixture.componentInstance.email = 'some email';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.value).toEqual({name: {first: '', last: 'Drew'}, email: 'some email'});
           expect(form.valid).toBe(false);
           expect(form.control.get('name.first').disabled).toBe(false);

           fixture.componentInstance.isDisabled = true;
           fixture.detectChanges();
           tick();

           expect(form.value).toEqual({name: {last: 'Drew'}, email: 'some email'});
           expect(form.valid).toBe(true);
           expect(form.control.get('name.first').disabled).toBe(true);
         }));

      it('should add disabled attribute in the UI if disable() is called programmatically',
         fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelGroupForm);
           fixture.componentInstance.isDisabled = false;
           fixture.componentInstance.first = 'Nancy';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           form.control.get('name.first').disable();
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css(`[name="first"]`));
           expect(input.nativeElement.disabled).toBe(true);
         }));

      it('should disable a custom control if disabled attr is added', async(() => {
           const fixture = TestBed.createComponent(NgModelCustomWrapper);
           fixture.componentInstance.name = 'Nancy';
           fixture.componentInstance.isDisabled = true;
           fixture.detectChanges();
           fixture.whenStable().then(() => {
             fixture.detectChanges();
             fixture.whenStable().then(() => {
               const form = fixture.debugElement.children[0].injector.get(NgForm);
               expect(form.control.get('name').disabled).toBe(true);

               const customInput = fixture.debugElement.query(By.css('[name="custom"]'));
               expect(customInput.nativeElement.disabled).toEqual(true);
             });
           });
         }));

      it('should disable a control with unbound disabled attr', fakeAsync(() => {
           TestBed.overrideComponent(NgModelForm, {
             set: {
               template: `
            <form>
             <input name="name" [(ngModel)]="name" disabled>
            </form>
          `,
             }
           });
           const fixture = TestBed.createComponent(NgModelForm);
           fixture.detectChanges();
           tick();
           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.control.get('name').disabled).toBe(true);

           const input = fixture.debugElement.query(By.css('input'));
           expect(input.nativeElement.disabled).toEqual(true);

           form.control.enable();
           fixture.detectChanges();
           tick();
           expect(input.nativeElement.disabled).toEqual(false);
         }));

      it('should disable radio controls properly with programmatic call', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelRadioForm);
           fixture.componentInstance.food = 'fish';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           form.control.get('food').disable();
           tick();

           const inputs = fixture.debugElement.queryAll(By.css('input'));
           expect(inputs[0].nativeElement.disabled).toBe(true);
           expect(inputs[1].nativeElement.disabled).toBe(true);
           expect(inputs[2].nativeElement.disabled).toBe(false);
           expect(inputs[3].nativeElement.disabled).toBe(false);

           form.control.disable();
           tick();

           expect(inputs[0].nativeElement.disabled).toBe(true);
           expect(inputs[1].nativeElement.disabled).toBe(true);
           expect(inputs[2].nativeElement.disabled).toBe(true);
           expect(inputs[3].nativeElement.disabled).toBe(true);

           form.control.enable();
           tick();

           expect(inputs[0].nativeElement.disabled).toBe(false);
           expect(inputs[1].nativeElement.disabled).toBe(false);
           expect(inputs[2].nativeElement.disabled).toBe(false);
           expect(inputs[3].nativeElement.disabled).toBe(false);
         }));

    });

    describe('radio controls', () => {
      it('should support <type=radio>', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelRadioForm);
           fixture.componentInstance.food = 'fish';
           fixture.detectChanges();
           tick();

           // model -> view
           const inputs = fixture.debugElement.queryAll(By.css('input'));
           expect(inputs[0].nativeElement.checked).toEqual(false);
           expect(inputs[1].nativeElement.checked).toEqual(true);

           dispatchEvent(inputs[0].nativeElement, 'change');
           tick();

           // view -> model
           expect(fixture.componentInstance.food).toEqual('chicken');
           expect(inputs[1].nativeElement.checked).toEqual(false);
         }));

      it('should support multiple named <type=radio> groups', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelRadioForm);
           fixture.componentInstance.food = 'fish';
           fixture.componentInstance.drink = 'sprite';
           fixture.detectChanges();
           tick();

           const inputs = fixture.debugElement.queryAll(By.css('input'));
           expect(inputs[0].nativeElement.checked).toEqual(false);
           expect(inputs[1].nativeElement.checked).toEqual(true);
           expect(inputs[2].nativeElement.checked).toEqual(false);
           expect(inputs[3].nativeElement.checked).toEqual(true);

           dispatchEvent(inputs[0].nativeElement, 'change');
           tick();

           expect(fixture.componentInstance.food).toEqual('chicken');
           expect(fixture.componentInstance.drink).toEqual('sprite');
           expect(inputs[1].nativeElement.checked).toEqual(false);
           expect(inputs[2].nativeElement.checked).toEqual(false);
           expect(inputs[3].nativeElement.checked).toEqual(true);
         }));

      it('should support initial undefined value', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelRadioForm);
           fixture.detectChanges();
           tick();

           const inputs = fixture.debugElement.queryAll(By.css('input'));
           expect(inputs[0].nativeElement.checked).toEqual(false);
           expect(inputs[1].nativeElement.checked).toEqual(false);
           expect(inputs[2].nativeElement.checked).toEqual(false);
           expect(inputs[3].nativeElement.checked).toEqual(false);
         }));

      it('should support resetting properly', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelRadioForm);
           fixture.componentInstance.food = 'chicken';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.query(By.css('form'));
           dispatchEvent(form.nativeElement, 'reset');
           fixture.detectChanges();
           tick();

           const inputs = fixture.debugElement.queryAll(By.css('input'));
           expect(inputs[0].nativeElement.checked).toEqual(false);
           expect(inputs[1].nativeElement.checked).toEqual(false);
         }));

      it('should support setting value to null and undefined', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelRadioForm);
           fixture.componentInstance.food = 'chicken';
           fixture.detectChanges();
           tick();

           fixture.componentInstance.food = null;
           fixture.detectChanges();
           tick();

           const inputs = fixture.debugElement.queryAll(By.css('input'));
           expect(inputs[0].nativeElement.checked).toEqual(false);
           expect(inputs[1].nativeElement.checked).toEqual(false);

           fixture.componentInstance.food = 'chicken';
           fixture.detectChanges();
           tick();

           fixture.componentInstance.food = undefined;
           fixture.detectChanges();
           tick();
           expect(inputs[0].nativeElement.checked).toEqual(false);
           expect(inputs[1].nativeElement.checked).toEqual(false);
         }));

    });

    describe('select controls', () => {
      it('with option values that are objects', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelSelectForm);
           const comp = fixture.componentInstance;
           comp.cities = [{'name': 'SF'}, {'name': 'NYC'}, {'name': 'Buffalo'}];
           comp.selectedCity = comp.cities[1];
           fixture.detectChanges();
           tick();

           const select = fixture.debugElement.query(By.css('select'));
           const nycOption = fixture.debugElement.queryAll(By.css('option'))[1];

           // model -> view
           expect(select.nativeElement.value).toEqual('1: Object');
           expect(nycOption.nativeElement.selected).toBe(true);

           select.nativeElement.value = '2: Object';
           dispatchEvent(select.nativeElement, 'change');
           fixture.detectChanges();
           tick();

           // view -> model
           expect(comp.selectedCity['name']).toEqual('Buffalo');
         }));

      it('when new options are added', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelSelectForm);
           const comp = fixture.componentInstance;
           comp.cities = [{'name': 'SF'}, {'name': 'NYC'}];
           comp.selectedCity = comp.cities[1];
           fixture.detectChanges();
           tick();

           comp.cities.push({'name': 'Buffalo'});
           comp.selectedCity = comp.cities[2];
           fixture.detectChanges();
           tick();

           const select = fixture.debugElement.query(By.css('select'));
           const buffalo = fixture.debugElement.queryAll(By.css('option'))[2];
           expect(select.nativeElement.value).toEqual('2: Object');
           expect(buffalo.nativeElement.selected).toBe(true);
         }));

      it('when options are removed', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelSelectForm);
           const comp = fixture.componentInstance;
           comp.cities = [{'name': 'SF'}, {'name': 'NYC'}];
           comp.selectedCity = comp.cities[1];
           fixture.detectChanges();
           tick();

           const select = fixture.debugElement.query(By.css('select'));
           expect(select.nativeElement.value).toEqual('1: Object');

           comp.cities.pop();
           fixture.detectChanges();
           tick();

           expect(select.nativeElement.value).not.toEqual('1: Object');
         }));

      it('when option values have same content, but different identities', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelSelectForm);
           const comp = fixture.componentInstance;
           comp.cities = [{'name': 'SF'}, {'name': 'NYC'}, {'name': 'NYC'}];
           comp.selectedCity = comp.cities[0];
           fixture.detectChanges();

           comp.selectedCity = comp.cities[2];
           fixture.detectChanges();
           tick();

           const select = fixture.debugElement.query(By.css('select'));
           const secondNYC = fixture.debugElement.queryAll(By.css('option'))[2];
           expect(select.nativeElement.value).toEqual('2: Object');
           expect(secondNYC.nativeElement.selected).toBe(true);
         }));
    });

    describe('custom value accessors', () => {
      it('should support standard writing to view and model', async(() => {
           const fixture = TestBed.createComponent(NgModelCustomWrapper);
           fixture.componentInstance.name = 'Nancy';
           fixture.detectChanges();
           fixture.whenStable().then(() => {
             fixture.detectChanges();
             fixture.whenStable().then(() => {
               // model -> view
               const customInput = fixture.debugElement.query(By.css('[name="custom"]'));
               expect(customInput.nativeElement.value).toEqual('Nancy');

               customInput.nativeElement.value = 'Carson';
               dispatchEvent(customInput.nativeElement, 'input');
               fixture.detectChanges();

               // view -> model
               expect(fixture.componentInstance.name).toEqual('Carson');
             });
           });
         }));

    });

    describe('validation directives', () => {

      it('should support dir validators using bindings', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelValidationBindings);
           fixture.componentInstance.required = true;
           fixture.componentInstance.minLen = 3;
           fixture.componentInstance.maxLen = 3;
           fixture.componentInstance.pattern = '.{3,}';
           fixture.detectChanges();
           tick();

           const required = fixture.debugElement.query(By.css('[name=required]'));
           const minLength = fixture.debugElement.query(By.css('[name=minlength]'));
           const maxLength = fixture.debugElement.query(By.css('[name=maxlength]'));
           const pattern = fixture.debugElement.query(By.css('[name=pattern]'));

           required.nativeElement.value = '';
           minLength.nativeElement.value = '1';
           maxLength.nativeElement.value = '1234';
           pattern.nativeElement.value = '12';

           dispatchEvent(required.nativeElement, 'input');
           dispatchEvent(minLength.nativeElement, 'input');
           dispatchEvent(maxLength.nativeElement, 'input');
           dispatchEvent(pattern.nativeElement, 'input');
           fixture.detectChanges();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.control.hasError('required', ['required'])).toEqual(true);
           expect(form.control.hasError('minlength', ['minlength'])).toEqual(true);
           expect(form.control.hasError('maxlength', ['maxlength'])).toEqual(true);
           expect(form.control.hasError('pattern', ['pattern'])).toEqual(true);

           required.nativeElement.value = '1';
           minLength.nativeElement.value = '123';
           maxLength.nativeElement.value = '123';
           pattern.nativeElement.value = '123';

           dispatchEvent(required.nativeElement, 'input');
           dispatchEvent(minLength.nativeElement, 'input');
           dispatchEvent(maxLength.nativeElement, 'input');
           dispatchEvent(pattern.nativeElement, 'input');

           expect(form.valid).toEqual(true);
         }));

      it('changes on bound properties should change the validation state of the form',
         fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelValidationBindings);
           fixture.detectChanges();
           tick();

           const required = fixture.debugElement.query(By.css('[name=required]'));
           const minLength = fixture.debugElement.query(By.css('[name=minlength]'));
           const maxLength = fixture.debugElement.query(By.css('[name=maxlength]'));
           const pattern = fixture.debugElement.query(By.css('[name=pattern]'));

           required.nativeElement.value = '';
           minLength.nativeElement.value = '1';
           maxLength.nativeElement.value = '1234';
           pattern.nativeElement.value = '12';

           dispatchEvent(required.nativeElement, 'input');
           dispatchEvent(minLength.nativeElement, 'input');
           dispatchEvent(maxLength.nativeElement, 'input');
           dispatchEvent(pattern.nativeElement, 'input');

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.control.hasError('required', ['required'])).toEqual(false);
           expect(form.control.hasError('minlength', ['minlength'])).toEqual(false);
           expect(form.control.hasError('maxlength', ['maxlength'])).toEqual(false);
           expect(form.control.hasError('pattern', ['pattern'])).toEqual(false);
           expect(form.valid).toEqual(true);

           fixture.componentInstance.required = true;
           fixture.componentInstance.minLen = 3;
           fixture.componentInstance.maxLen = 3;
           fixture.componentInstance.pattern = '.{3,}';
           fixture.detectChanges();

           dispatchEvent(required.nativeElement, 'input');
           dispatchEvent(minLength.nativeElement, 'input');
           dispatchEvent(maxLength.nativeElement, 'input');
           dispatchEvent(pattern.nativeElement, 'input');

           expect(form.control.hasError('required', ['required'])).toEqual(true);
           expect(form.control.hasError('minlength', ['minlength'])).toEqual(true);
           expect(form.control.hasError('maxlength', ['maxlength'])).toEqual(true);
           expect(form.control.hasError('pattern', ['pattern'])).toEqual(true);
           expect(form.valid).toEqual(false);

           expect(required.nativeElement.getAttribute('required')).toEqual('');
           expect(fixture.componentInstance.minLen.toString())
               .toEqual(minLength.nativeElement.getAttribute('minlength'));
           expect(fixture.componentInstance.maxLen.toString())
               .toEqual(maxLength.nativeElement.getAttribute('maxlength'));
           expect(fixture.componentInstance.pattern.toString())
               .toEqual(pattern.nativeElement.getAttribute('pattern'));

           fixture.componentInstance.required = false;
           fixture.componentInstance.minLen = null;
           fixture.componentInstance.maxLen = null;
           fixture.componentInstance.pattern = null;
           fixture.detectChanges();

           expect(form.control.hasError('required', ['required'])).toEqual(false);
           expect(form.control.hasError('minlength', ['minlength'])).toEqual(false);
           expect(form.control.hasError('maxlength', ['maxlength'])).toEqual(false);
           expect(form.control.hasError('pattern', ['pattern'])).toEqual(false);
           expect(form.valid).toEqual(true);

           expect(required.nativeElement.getAttribute('required')).toEqual(null);
           expect(required.nativeElement.getAttribute('minlength')).toEqual(null);
           expect(required.nativeElement.getAttribute('maxlength')).toEqual(null);
           expect(required.nativeElement.getAttribute('pattern')).toEqual(null);
         }));

    });

    describe('ngModel corner cases', () => {
      it('should update the view when the model is set back to what used to be in the view',
         fakeAsync(() => {
           const fixture = TestBed.createComponent(StandaloneNgModel);
           fixture.componentInstance.name = '';
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           input.value = 'aa';
           input.selectionStart = 1;
           dispatchEvent(input, 'input');

           fixture.detectChanges();
           tick();
           expect(fixture.componentInstance.name).toEqual('aa');

           // Programmatically update the input value to be "bb".
           fixture.componentInstance.name = 'bb';
           fixture.detectChanges();
           tick();
           expect(input.value).toEqual('bb');

           // Programatically set it back to "aa".
           fixture.componentInstance.name = 'aa';
           fixture.detectChanges();
           tick();
           expect(input.value).toEqual('aa');
         }));

      it('should not crash when validity is checked from a binding', fakeAsync(() => {
           const fixture = TestBed.createComponent(NgModelValidBinding);
           tick();
           expect(() => fixture.detectChanges()).not.toThrowError();
         }));
    });

  });
};

@Component({
  selector: 'standalone-ng-model',
  template: `
    <input type="text" [(ngModel)]="name">
  `
})
class StandaloneNgModel {
  name: string;
}

@Component({
  selector: 'ng-model-form',
  template: `
    <form (ngSubmit)="name='submitted'" (reset)="onReset()">
      <input name="name" [(ngModel)]="name" minlength="10" [ngModelOptions]="options">
    </form>
  `
})
class NgModelForm {
  name: string;
  options = {};

  onReset() {}
}

@Component({
  selector: 'ng-model-group-form',
  template: `
    <form>
      <div ngModelGroup="name">
        <input name="first" [(ngModel)]="first" required [disabled]="isDisabled">
        <input name="last" [(ngModel)]="last">
      </div>
      <input name="email" [(ngModel)]="email">
    </form>
  `
})
class NgModelGroupForm {
  first: string;
  last: string;
  email: string;
  isDisabled: boolean;
}

@Component({
  selector: 'ng-model-valid-binding',
  template: `
    <form>
      <div ngModelGroup="name" #group="ngModelGroup">
        <input name="first" [(ngModel)]="first" required>
        {{ group.valid }}
      </div>
    </form>
  `
})
class NgModelValidBinding {
  first: string;
}


@Component({
  selector: 'ng-model-ngif-form',
  template: `
    <form>
      <div ngModelGroup="name" *ngIf="groupShowing">
        <input name="first" [(ngModel)]="first">
      </div>
      <input name="email" [(ngModel)]="email" *ngIf="emailShowing">
    </form>
  `
})
class NgModelNgIfForm {
  first: string;
  groupShowing = true;
  emailShowing = true;
  email: string;
}

@Component({
  selector: 'ng-no-form',
  template: `
    <form ngNoForm>
      <input name="name">
    </form>
  `
})
class NgNoFormComp {
}

@Component({
  selector: 'invalid-ng-model-noname',
  template: `
    <form>
      <input [(ngModel)]="name">
    </form>
  `
})
class InvalidNgModelNoName {
}

@Component({
  selector: 'ng-model-options-standalone',
  template: `
    <form>
      <input name="one" [(ngModel)]="one">
      <input [(ngModel)]="two" [ngModelOptions]="{standalone: true}">
    </form>
  `
})
class NgModelOptionsStandalone {
  one: string;
  two: string;
}

@Component({
  selector: 'ng-model-radio-form',
  template: `
    <form>
      <input type="radio" name="food" [(ngModel)]="food" value="chicken">
      <input type="radio" name="food"  [(ngModel)]="food" value="fish">

      <input type="radio" name="drink" [(ngModel)]="drink" value="cola">
      <input type="radio" name="drink" [(ngModel)]="drink" value="sprite">
    </form>
  `
})
class NgModelRadioForm {
  food: string;
  drink: string;
}

@Component({
  selector: 'ng-model-select-form',
  template: `
    <select [(ngModel)]="selectedCity">
      <option *ngFor="let c of cities" [ngValue]="c"> {{c.name}} </option>
    </select>
  `
})
class NgModelSelectForm {
  selectedCity: {[k: string]: string} = {};
  cities: any[] = [];
}

@Component({
  selector: 'ng-model-custom-comp',
  template: `
    <input name="custom" [(ngModel)]="model" (ngModelChange)="changeFn($event)" [disabled]="isDisabled">
  `,
  providers: [{provide: NG_VALUE_ACCESSOR, multi: true, useExisting: NgModelCustomComp}]
})
class NgModelCustomComp implements ControlValueAccessor {
  model: string;
  @Input('disabled') isDisabled: boolean = false;
  changeFn: (value: any) => void;

  writeValue(value: any) { this.model = value; }

  registerOnChange(fn: (value: any) => void) { this.changeFn = fn; }

  registerOnTouched() {}

  setDisabledState(isDisabled: boolean) { this.isDisabled = isDisabled; }
}

@Component({
  selector: 'ng-model-custom-wrapper',
  template: `
    <form>
       <ng-model-custom-comp name="name" [(ngModel)]="name" [disabled]="isDisabled"></ng-model-custom-comp>
    </form>
  `
})
class NgModelCustomWrapper {
  name: string;
  isDisabled = false;
}

@Component({
  selector: 'ng-model-validation-bindings',
  template: `
    <form>
      <input name="required" ngModel  [required]="required">
      <input name="minlength" ngModel  [minlength]="minLen">
      <input name="maxlength" ngModel [maxlength]="maxLen">
      <input name="pattern" ngModel  [pattern]="pattern">
    </form>
  `
})
class NgModelValidationBindings {
  required: boolean;
  minLen: number;
  maxLen: number;
  pattern: string;
}

function sortedClassList(el: HTMLElement) {
  const l = getDOM().classList(el);
  l.sort();
  return l;
}
