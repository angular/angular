/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, EventEmitter, Input, Output, forwardRef} from '@angular/core';
import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {AbstractControl, ControlValueAccessor, FormArray, FormControl, FormGroup, FormGroupDirective, FormsModule, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule, Validator, Validators} from '@angular/forms';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {dispatchEvent} from '@angular/platform-browser/testing/browser_util';

import {ListWrapper} from '../src/facade/collection';

export function main() {
  describe('reactive forms integration tests', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [FormsModule, ReactiveFormsModule],
        declarations: [
          FormControlComp, FormGroupComp, FormArrayComp, FormArrayNestedGroup,
          FormControlNameSelect, FormControlNumberInput, FormControlRadioButtons, WrappedValue,
          WrappedValueForm, MyInput, MyInputForm, FormGroupNgModel, FormControlNgModel,
          LoginIsEmptyValidator, LoginIsEmptyWrapper, ValidationBindingsForm, UniqLoginValidator,
          UniqLoginWrapper, NestedFormGroupComp
        ]
      });
    });

    describe('basic functionality', () => {
      it('should work with single controls', () => {
        const fixture = TestBed.createComponent(FormControlComp);
        const control = new FormControl('old value');
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        // model -> view
        const input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.value).toEqual('old value');

        input.nativeElement.value = 'updated value';
        dispatchEvent(input.nativeElement, 'input');

        // view -> model
        expect(control.value).toEqual('updated value');
      });

      it('should work with formGroups (model -> view)', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({'login': new FormControl('loginValue')});
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.value).toEqual('loginValue');
      });

      it('work with formGroups (view -> model)', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        const form = new FormGroup({'login': new FormControl('oldValue')});
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input'));
        input.nativeElement.value = 'updatedValue';
        dispatchEvent(input.nativeElement, 'input');

        expect(form.value).toEqual({'login': 'updatedValue'});
      });

    });

    describe('rebound form groups', () => {

      it('should update DOM elements initially', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({'login': new FormControl('oldValue')});
        fixture.detectChanges();

        fixture.componentInstance.form = new FormGroup({'login': new FormControl('newValue')});
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.value).toEqual('newValue');
      });

      it('should update model when UI changes', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({'login': new FormControl('oldValue')});
        fixture.detectChanges();

        const newForm = new FormGroup({'login': new FormControl('newValue')});
        fixture.componentInstance.form = newForm;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input'));
        input.nativeElement.value = 'Nancy';
        dispatchEvent(input.nativeElement, 'input');
        fixture.detectChanges();

        expect(newForm.value).toEqual({login: 'Nancy'});

        newForm.setValue({login: 'Carson'});
        fixture.detectChanges();
        expect(input.nativeElement.value).toEqual('Carson');
      });

      it('should work with radio buttons when reusing control', () => {
        const fixture = TestBed.createComponent(FormControlRadioButtons);
        const food = new FormControl('chicken');
        fixture.componentInstance.form =
            new FormGroup({'food': food, 'drink': new FormControl('')});
        fixture.detectChanges();

        const newForm = new FormGroup({'food': food, 'drink': new FormControl('')});
        fixture.componentInstance.form = newForm;
        fixture.detectChanges();

        newForm.setValue({food: 'fish', drink: ''});
        fixture.detectChanges();
        const inputs = fixture.debugElement.queryAll(By.css('input'));
        expect(inputs[0].nativeElement.checked).toBe(false);
        expect(inputs[1].nativeElement.checked).toBe(true);
      });

      it('should update nested form group model when UI changes', () => {
        const fixture = TestBed.createComponent(NestedFormGroupComp);
        fixture.componentInstance.form = new FormGroup(
            {'signin': new FormGroup({'login': new FormControl(), 'password': new FormControl()})});
        fixture.detectChanges();

        const newForm = new FormGroup({
          'signin': new FormGroup(
              {'login': new FormControl('Nancy'), 'password': new FormControl('secret')})
        });
        fixture.componentInstance.form = newForm;
        fixture.detectChanges();

        const inputs = fixture.debugElement.queryAll(By.css('input'));
        expect(inputs[0].nativeElement.value).toEqual('Nancy');
        expect(inputs[1].nativeElement.value).toEqual('secret');

        inputs[0].nativeElement.value = 'Carson';
        dispatchEvent(inputs[0].nativeElement, 'input');
        fixture.detectChanges();

        expect(newForm.value).toEqual({signin: {login: 'Carson', password: 'secret'}});

        newForm.setValue({signin: {login: 'Bess', password: 'otherpass'}});
        fixture.detectChanges();
        expect(inputs[0].nativeElement.value).toEqual('Bess');
      });

      it('should pick up dir validators from form controls', () => {
        const fixture = TestBed.createComponent(LoginIsEmptyWrapper);
        const form = new FormGroup({
          'login': new FormControl(''),
          'min': new FormControl(''),
          'max': new FormControl(''),
          'pattern': new FormControl('')
        });
        fixture.componentInstance.form = form;
        fixture.detectChanges();
        expect(form.get('login').errors).toEqual({required: true});

        const newForm = new FormGroup({
          'login': new FormControl(''),
          'min': new FormControl(''),
          'max': new FormControl(''),
          'pattern': new FormControl('')
        });
        fixture.componentInstance.form = newForm;
        fixture.detectChanges();

        expect(newForm.get('login').errors).toEqual({required: true});
      });

      it('should pick up dir validators from nested form groups', () => {
        const fixture = TestBed.createComponent(NestedFormGroupComp);
        const form = new FormGroup({
          'signin':
              new FormGroup({'login': new FormControl(''), 'password': new FormControl('')})
        });
        fixture.componentInstance.form = form;
        fixture.detectChanges();
        expect(form.get('signin').valid).toBe(false);

        const newForm = new FormGroup({
          'signin':
              new FormGroup({'login': new FormControl(''), 'password': new FormControl('')})
        });
        fixture.componentInstance.form = newForm;
        fixture.detectChanges();

        expect(form.get('signin').valid).toBe(false);
      });

      it('should strip named controls that are not found', () => {
        const fixture = TestBed.createComponent(NestedFormGroupComp);
        const form = new FormGroup({
          'signin':
              new FormGroup({'login': new FormControl(''), 'password': new FormControl('')})
        });
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        form.addControl('email', new FormControl('email'));
        fixture.detectChanges();

        let emailInput = fixture.debugElement.query(By.css('[formControlName="email"]'));
        expect(emailInput.nativeElement.value).toEqual('email');

        const newForm = new FormGroup({
          'signin':
              new FormGroup({'login': new FormControl(''), 'password': new FormControl('')})
        });
        fixture.componentInstance.form = newForm;
        fixture.detectChanges();

        emailInput = fixture.debugElement.query(By.css('[formControlName="email"]'));
        expect(emailInput).toBe(null);
      });

      it('should strip array controls that are not found', () => {
        const fixture = TestBed.createComponent(FormArrayComp);
        const cityArray = new FormArray([new FormControl('SF'), new FormControl('NY')]);
        const form = new FormGroup({cities: cityArray});
        fixture.componentInstance.form = form;
        fixture.componentInstance.cityArray = cityArray;
        fixture.detectChanges();

        let inputs = fixture.debugElement.queryAll(By.css('input'));
        expect(inputs[2]).not.toBeDefined();
        cityArray.push(new FormControl('LA'));
        fixture.detectChanges();

        inputs = fixture.debugElement.queryAll(By.css('input'));
        expect(inputs[2]).toBeDefined();

        const newArr = new FormArray([new FormControl('SF'), new FormControl('NY')]);
        const newForm = new FormGroup({cities: newArr});
        fixture.componentInstance.form = newForm;
        fixture.componentInstance.cityArray = newArr;
        fixture.detectChanges();

        inputs = fixture.debugElement.queryAll(By.css('input'));
        expect(inputs[2]).not.toBeDefined();
      });

      describe('nested control rebinding', () => {

        it('should attach dir to control when leaf control changes', () => {
          const form = new FormGroup({'login': new FormControl('oldValue')});
          const fixture = TestBed.createComponent(FormGroupComp);
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          form.removeControl('login');
          form.addControl('login', new FormControl('newValue'));
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input'));
          expect(input.nativeElement.value).toEqual('newValue');

          input.nativeElement.value = 'user input';
          dispatchEvent(input.nativeElement, 'input');
          fixture.detectChanges();

          expect(form.value).toEqual({login: 'user input'});

          form.setValue({login: 'Carson'});
          fixture.detectChanges();
          expect(input.nativeElement.value).toEqual('Carson');
        });

        it('should attach dirs to all child controls when group control changes', () => {
          const fixture = TestBed.createComponent(NestedFormGroupComp);
          const form = new FormGroup({
            signin: new FormGroup(
                {login: new FormControl('oldLogin'), password: new FormControl('oldPassword')})
          });
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          form.removeControl('signin');
          form.addControl(
              'signin',
              new FormGroup(
                  {login: new FormControl('newLogin'), password: new FormControl('newPassword')}));
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.value).toEqual('newLogin');
          expect(inputs[1].nativeElement.value).toEqual('newPassword');

          inputs[0].nativeElement.value = 'user input';
          dispatchEvent(inputs[0].nativeElement, 'input');
          fixture.detectChanges();

          expect(form.value).toEqual({signin: {login: 'user input', password: 'newPassword'}});

          form.setValue({signin: {login: 'Carson', password: 'Drew'}});
          fixture.detectChanges();
          expect(inputs[0].nativeElement.value).toEqual('Carson');
          expect(inputs[1].nativeElement.value).toEqual('Drew');
        });

        it('should attach dirs to all present child controls when array control changes', () => {
          const fixture = TestBed.createComponent(FormArrayComp);
          const cityArray = new FormArray([new FormControl('SF'), new FormControl('NY')]);
          const form = new FormGroup({cities: cityArray});
          fixture.componentInstance.form = form;
          fixture.componentInstance.cityArray = cityArray;
          fixture.detectChanges();

          form.removeControl('cities');
          form.addControl('cities', new FormArray([new FormControl('LA')]));
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input'));
          expect(input.nativeElement.value).toEqual('LA');

          input.nativeElement.value = 'MTV';
          dispatchEvent(input.nativeElement, 'input');
          fixture.detectChanges();

          expect(form.value).toEqual({cities: ['MTV']});

          form.setValue({cities: ['LA']});
          fixture.detectChanges();
          expect(input.nativeElement.value).toEqual('LA');
        });

      });

    });

    describe('form arrays', () => {
      it('should support form arrays', () => {
        const fixture = TestBed.createComponent(FormArrayComp);
        const cityArray = new FormArray([new FormControl('SF'), new FormControl('NY')]);
        const form = new FormGroup({cities: cityArray});
        fixture.componentInstance.form = form;
        fixture.componentInstance.cityArray = cityArray;
        fixture.detectChanges();

        const inputs = fixture.debugElement.queryAll(By.css('input'));

        // model -> view
        expect(inputs[0].nativeElement.value).toEqual('SF');
        expect(inputs[1].nativeElement.value).toEqual('NY');
        expect(form.value).toEqual({cities: ['SF', 'NY']});

        inputs[0].nativeElement.value = 'LA';
        dispatchEvent(inputs[0].nativeElement, 'input');
        fixture.detectChanges();

        //  view -> model
        expect(form.value).toEqual({cities: ['LA', 'NY']});
      });

      it('should support pushing new controls to form arrays', () => {
        const fixture = TestBed.createComponent(FormArrayComp);
        const cityArray = new FormArray([new FormControl('SF'), new FormControl('NY')]);
        const form = new FormGroup({cities: cityArray});
        fixture.componentInstance.form = form;
        fixture.componentInstance.cityArray = cityArray;
        fixture.detectChanges();

        cityArray.push(new FormControl('LA'));
        fixture.detectChanges();

        const inputs = fixture.debugElement.queryAll(By.css('input'));
        expect(inputs[2].nativeElement.value).toEqual('LA');
        expect(form.value).toEqual({cities: ['SF', 'NY', 'LA']});
      });

      it('should support form groups nested in form arrays', () => {
        const fixture = TestBed.createComponent(FormArrayNestedGroup);
        const cityArray = new FormArray([
          new FormGroup({town: new FormControl('SF'), state: new FormControl('CA')}),
          new FormGroup({town: new FormControl('NY'), state: new FormControl('NY')})
        ]);
        const form = new FormGroup({cities: cityArray});
        fixture.componentInstance.form = form;
        fixture.componentInstance.cityArray = cityArray;
        fixture.detectChanges();

        const inputs = fixture.debugElement.queryAll(By.css('input'));
        expect(inputs[0].nativeElement.value).toEqual('SF');
        expect(inputs[1].nativeElement.value).toEqual('CA');
        expect(inputs[2].nativeElement.value).toEqual('NY');
        expect(inputs[3].nativeElement.value).toEqual('NY');
        expect(form.value).toEqual({
          cities: [{town: 'SF', state: 'CA'}, {town: 'NY', state: 'NY'}]
        });

        inputs[0].nativeElement.value = 'LA';
        dispatchEvent(inputs[0].nativeElement, 'input');
        fixture.detectChanges();

        expect(form.value).toEqual({
          cities: [{town: 'LA', state: 'CA'}, {town: 'NY', state: 'NY'}]
        });
      });

    });

    describe('programmatic changes', () => {
      it('should update the value in the DOM when setValue() is called', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        const login = new FormControl('oldValue');
        const form = new FormGroup({'login': login});
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        login.setValue('newValue');
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.value).toEqual('newValue');
      });

      describe('disabled controls', () => {
        it('should add disabled attribute to an individual control when instantiated as disabled',
           () => {
             const fixture = TestBed.createComponent(FormControlComp);
             const control = new FormControl({value: 'some value', disabled: true});
             fixture.componentInstance.control = control;
             fixture.detectChanges();

             const input = fixture.debugElement.query(By.css('input'));
             expect(input.nativeElement.disabled).toBe(true);

             control.enable();
             fixture.detectChanges();
             expect(input.nativeElement.disabled).toBe(false);
           });

        it('should add disabled attribute to formControlName when instantiated as disabled', () => {
          const fixture = TestBed.createComponent(FormGroupComp);
          const control = new FormControl({value: 'some value', disabled: true});
          fixture.componentInstance.form = new FormGroup({login: control});
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input'));
          expect(input.nativeElement.disabled).toBe(true);

          control.enable();
          fixture.detectChanges();
          expect(input.nativeElement.disabled).toBe(false);
        });

        it('should add disabled attribute to an individual control when disable() is called',
           () => {
             const fixture = TestBed.createComponent(FormControlComp);
             const control = new FormControl('some value');
             fixture.componentInstance.control = control;
             fixture.detectChanges();

             control.disable();
             fixture.detectChanges();

             const input = fixture.debugElement.query(By.css('input'));
             expect(input.nativeElement.disabled).toBe(true);

             control.enable();
             fixture.detectChanges();
             expect(input.nativeElement.disabled).toBe(false);
           });

        it('should add disabled attribute to child controls when disable() is called on group',
           () => {
             const fixture = TestBed.createComponent(FormGroupComp);
             const form = new FormGroup({'login': new FormControl('login')});
             fixture.componentInstance.form = form;
             fixture.detectChanges();

             form.disable();
             fixture.detectChanges();

             const inputs = fixture.debugElement.queryAll(By.css('input'));
             expect(inputs[0].nativeElement.disabled).toBe(true);

             form.enable();
             fixture.detectChanges();
             expect(inputs[0].nativeElement.disabled).toBe(false);
           });


        it('should not add disabled attribute to custom controls when disable() is called', () => {
          const fixture = TestBed.createComponent(MyInputForm);
          const control = new FormControl('some value');
          fixture.componentInstance.form = new FormGroup({login: control});
          fixture.detectChanges();

          control.disable();
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('my-input'));
          expect(input.nativeElement.getAttribute('disabled')).toBe(null);
        });

      });

    });

    describe('user input', () => {

      it('should mark controls as touched after interacting with the DOM control', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        const login = new FormControl('oldValue');
        const form = new FormGroup({'login': login});
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        const loginEl = fixture.debugElement.query(By.css('input'));
        expect(login.touched).toBe(false);

        dispatchEvent(loginEl.nativeElement, 'blur');

        expect(login.touched).toBe(true);
      });

    });

    describe('submit and reset events', () => {
      it('should emit ngSubmit event on submit', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({'login': new FormControl('loginValue')});
        fixture.componentInstance.data = 'should be changed';
        fixture.detectChanges();

        const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(formEl, 'submit');

        fixture.detectChanges();
        expect(fixture.componentInstance.data).toEqual('submitted');
      });

      it('should mark formGroup as submitted on submit event', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({'login': new FormControl('loginValue')});
        fixture.detectChanges();

        const formGroupDir = fixture.debugElement.children[0].injector.get(FormGroupDirective);
        expect(formGroupDir.submitted).toBe(false);

        const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(formEl, 'submit');

        fixture.detectChanges();
        expect(formGroupDir.submitted).toEqual(true);
      });

      it('should set value in UI when form resets to that value programmatically', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        const login = new FormControl('some value');
        const form = new FormGroup({'login': login});
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        const loginEl = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(loginEl.value).toBe('some value');

        form.reset({'login': 'reset value'});
        expect(loginEl.value).toBe('reset value');
      });

      it('should clear value in UI when form resets programmatically', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        const login = new FormControl('some value');
        const form = new FormGroup({'login': login});
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        const loginEl = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(loginEl.value).toBe('some value');

        form.reset();
        expect(loginEl.value).toBe('');
      });

    });

    describe('value changes and status changes', () => {

      it('should mark controls as dirty before emitting a value change event', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        const login = new FormControl('oldValue');
        fixture.componentInstance.form = new FormGroup({'login': login});
        fixture.detectChanges();

        login.valueChanges.subscribe(() => { expect(login.dirty).toBe(true); });

        const loginEl = fixture.debugElement.query(By.css('input')).nativeElement;
        loginEl.value = 'newValue';

        dispatchEvent(loginEl, 'input');
      });

      it('should mark control as pristine before emitting a value change event when resetting ',
         () => {
           const fixture = TestBed.createComponent(FormGroupComp);
           const login = new FormControl('oldValue');
           const form = new FormGroup({'login': login});
           fixture.componentInstance.form = form;
           fixture.detectChanges();

           const loginEl = fixture.debugElement.query(By.css('input')).nativeElement;
           loginEl.value = 'newValue';
           dispatchEvent(loginEl, 'input');

           expect(login.pristine).toBe(false);

           login.valueChanges.subscribe(() => { expect(login.pristine).toBe(true); });

           form.reset();
         });

    });

    describe('setting status classes', () => {
      it('should work with single fields', () => {
        const fixture = TestBed.createComponent(FormControlComp);
        const control = new FormControl('', Validators.required);
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-untouched']);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-touched']);

        input.value = 'updatedValue';
        dispatchEvent(input, 'input');
        fixture.detectChanges();

        expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
      });

      it('should work with single fields in parent forms', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        const form = new FormGroup({'login': new FormControl('', Validators.required)});
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-untouched']);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-touched']);

        input.value = 'updatedValue';
        dispatchEvent(input, 'input');
        fixture.detectChanges();

        expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
      });

      it('should work with formGroup', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        const form = new FormGroup({'login': new FormControl('', Validators.required)});
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        const formEl = fixture.debugElement.query(By.css('form')).nativeElement;

        expect(sortedClassList(formEl)).toEqual(['ng-invalid', 'ng-pristine', 'ng-untouched']);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(sortedClassList(formEl)).toEqual(['ng-invalid', 'ng-pristine', 'ng-touched']);

        input.value = 'updatedValue';
        dispatchEvent(input, 'input');
        fixture.detectChanges();

        expect(sortedClassList(formEl)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
      });

    });

    describe('value accessors', () => {

      it('should support <input> without type', () => {
        TestBed.overrideComponent(
            FormControlComp, {set: {template: `<input [formControl]="control">`}});
        const fixture = TestBed.createComponent(FormControlComp);
        const control = new FormControl('old');
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        // model -> view
        const input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.value).toEqual('old');

        input.nativeElement.value = 'new';
        dispatchEvent(input.nativeElement, 'input');

        // view -> model
        expect(control.value).toEqual('new');
      });

      it('should support <input type=text>', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        const form = new FormGroup({'login': new FormControl('old')});
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        // model -> view
        const input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.value).toEqual('old');

        input.nativeElement.value = 'new';
        dispatchEvent(input.nativeElement, 'input');

        // view -> model
        expect(form.value).toEqual({'login': 'new'});
      });

      it('should ignore the change event for <input type=text>', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        const form = new FormGroup({'login': new FormControl('oldValue')});
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input'));
        form.valueChanges.subscribe({next: (value) => { throw 'Should not happen'; }});
        input.nativeElement.value = 'updatedValue';

        dispatchEvent(input.nativeElement, 'change');
      });

      it('should support <textarea>', () => {
        TestBed.overrideComponent(
            FormControlComp, {set: {template: `<textarea [formControl]="control"></textarea>`}});
        const fixture = TestBed.createComponent(FormControlComp);
        const control = new FormControl('old');
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        // model -> view
        const textarea = fixture.debugElement.query(By.css('textarea'));
        expect(textarea.nativeElement.value).toEqual('old');

        textarea.nativeElement.value = 'new';
        dispatchEvent(textarea.nativeElement, 'input');

        // view -> model
        expect(control.value).toEqual('new');
      });

      it('should support <type=checkbox>', () => {
        TestBed.overrideComponent(
            FormControlComp, {set: {template: `<input type="checkbox" [formControl]="control">`}});
        const fixture = TestBed.createComponent(FormControlComp);
        const control = new FormControl(true);
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        // model -> view
        const input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.checked).toBe(true);

        input.nativeElement.checked = false;
        dispatchEvent(input.nativeElement, 'change');

        // view -> model
        expect(control.value).toBe(false);
      });

      it('should support <select>', () => {
        const fixture = TestBed.createComponent(FormControlNameSelect);
        fixture.detectChanges();

        // model -> view
        const select = fixture.debugElement.query(By.css('select'));
        const sfOption = fixture.debugElement.query(By.css('option'));
        expect(select.nativeElement.value).toEqual('SF');
        expect(sfOption.nativeElement.selected).toBe(true);

        select.nativeElement.value = 'NY';
        dispatchEvent(select.nativeElement, 'change');
        fixture.detectChanges();

        // view -> model
        expect(sfOption.nativeElement.selected).toBe(false);
        expect(fixture.componentInstance.form.value).toEqual({'city': 'NY'});
      });

      describe('should support <type=number>', () => {
        it('with basic use case', () => {
          const fixture = TestBed.createComponent(FormControlNumberInput);
          const control = new FormControl(10);
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          // model -> view
          const input = fixture.debugElement.query(By.css('input'));
          expect(input.nativeElement.value).toEqual('10');

          input.nativeElement.value = '20';
          dispatchEvent(input.nativeElement, 'input');

          // view -> model
          expect(control.value).toEqual(20);
        });

        it('when value is cleared in the UI', () => {
          const fixture = TestBed.createComponent(FormControlNumberInput);
          const control = new FormControl(10, Validators.required);
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input'));
          input.nativeElement.value = '';
          dispatchEvent(input.nativeElement, 'input');

          expect(control.valid).toBe(false);
          expect(control.value).toEqual(null);

          input.nativeElement.value = '0';
          dispatchEvent(input.nativeElement, 'input');

          expect(control.valid).toBe(true);
          expect(control.value).toEqual(0);
        });

        it('when value is cleared programmatically', () => {
          const fixture = TestBed.createComponent(FormControlNumberInput);
          const control = new FormControl(10);
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          control.setValue(null);

          const input = fixture.debugElement.query(By.css('input'));
          expect(input.nativeElement.value).toEqual('');
        });
      });

      describe('should support <type=radio>', () => {

        it('should support basic functionality', () => {
          const fixture = TestBed.createComponent(FormControlRadioButtons);
          const form =
              new FormGroup({'food': new FormControl('fish'), 'drink': new FormControl('sprite')});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          // model -> view
          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(true);

          dispatchEvent(inputs[0].nativeElement, 'change');
          fixture.detectChanges();

          // view -> model
          expect(form.get('food').value).toEqual('chicken');
          expect(inputs[1].nativeElement.checked).toEqual(false);

          form.get('food').setValue('fish');
          fixture.detectChanges();

          // programmatic change -> view
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(true);
        });

        it('should support an initial undefined value', () => {
          const fixture = TestBed.createComponent(FormControlRadioButtons);
          const form = new FormGroup({'food': new FormControl(), 'drink': new FormControl()});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(false);
        });

        it('should reset properly', () => {
          const fixture = TestBed.createComponent(FormControlRadioButtons);
          const form =
              new FormGroup({'food': new FormControl('fish'), 'drink': new FormControl('sprite')});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          form.reset();
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(false);
        });

        it('should set value to null and undefined properly', () => {
          const fixture = TestBed.createComponent(FormControlRadioButtons);
          const form = new FormGroup(
              {'food': new FormControl('chicken'), 'drink': new FormControl('sprite')});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          form.get('food').setValue(null);
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);

          form.get('food').setValue('chicken');
          fixture.detectChanges();

          form.get('food').setValue(undefined);
          fixture.detectChanges();
          expect(inputs[0].nativeElement.checked).toEqual(false);
        });

        it('should use formControlName to group radio buttons when name is absent', () => {
          const fixture = TestBed.createComponent(FormControlRadioButtons);
          const foodCtrl = new FormControl('fish');
          const drinkCtrl = new FormControl('sprite');
          fixture.componentInstance.form = new FormGroup({'food': foodCtrl, 'drink': drinkCtrl});
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(true);
          expect(inputs[2].nativeElement.checked).toEqual(false);
          expect(inputs[3].nativeElement.checked).toEqual(true);

          dispatchEvent(inputs[0].nativeElement, 'change');
          inputs[0].nativeElement.checked = true;
          fixture.detectChanges();

          const value = fixture.componentInstance.form.value;
          expect(value.food).toEqual('chicken');
          expect(inputs[1].nativeElement.checked).toEqual(false);
          expect(inputs[2].nativeElement.checked).toEqual(false);
          expect(inputs[3].nativeElement.checked).toEqual(true);

          drinkCtrl.setValue('cola');
          fixture.detectChanges();

          expect(inputs[0].nativeElement.checked).toEqual(true);
          expect(inputs[1].nativeElement.checked).toEqual(false);
          expect(inputs[2].nativeElement.checked).toEqual(true);
          expect(inputs[3].nativeElement.checked).toEqual(false);
        });

        it('should support removing controls from <type=radio>', () => {
          const fixture = TestBed.createComponent(FormControlRadioButtons);
          const showRadio = new FormControl('yes');
          const form =
              new FormGroup({'food': new FormControl('fish'), 'drink': new FormControl('sprite')});
          fixture.componentInstance.form = form;
          fixture.componentInstance.showRadio = showRadio;
          showRadio.valueChanges.subscribe((change) => {
            (change === 'yes') ? form.addControl('food', new FormControl('fish')) :
                                 form.removeControl('food');
          });
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('[value="no"]'));
          dispatchEvent(input.nativeElement, 'change');

          fixture.detectChanges();
          expect(form.value).toEqual({drink: 'sprite'});
        });

        it('should differentiate controls on different levels with the same name', () => {
          TestBed.overrideComponent(FormControlRadioButtons, {
            set: {
              template: `
              <div [formGroup]="form">
                <input type="radio" formControlName="food" value="chicken">
                <input type="radio" formControlName="food" value="fish">
                <div formGroupName="nested">
                  <input type="radio" formControlName="food" value="chicken">
                  <input type="radio" formControlName="food" value="fish">
                </div>
              </div>
              `
            }
          });
          const fixture = TestBed.createComponent(FormControlRadioButtons);
          const form = new FormGroup({
            food: new FormControl('fish'),
            nested: new FormGroup({food: new FormControl('fish')})
          });
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          // model -> view
          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.checked).toEqual(false);
          expect(inputs[1].nativeElement.checked).toEqual(true);
          expect(inputs[2].nativeElement.checked).toEqual(false);
          expect(inputs[3].nativeElement.checked).toEqual(true);

          dispatchEvent(inputs[0].nativeElement, 'change');
          fixture.detectChanges();

          // view -> model
          expect(form.get('food').value).toEqual('chicken');
          expect(form.get('nested.food').value).toEqual('fish');

          expect(inputs[1].nativeElement.checked).toEqual(false);
          expect(inputs[2].nativeElement.checked).toEqual(false);
          expect(inputs[3].nativeElement.checked).toEqual(true);

        });

        it('should disable all radio buttons when disable() is called', () => {
          const fixture = TestBed.createComponent(FormControlRadioButtons);
          const form =
              new FormGroup({food: new FormControl('fish'), drink: new FormControl('cola')});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.disabled).toEqual(false);
          expect(inputs[1].nativeElement.disabled).toEqual(false);
          expect(inputs[2].nativeElement.disabled).toEqual(false);
          expect(inputs[3].nativeElement.disabled).toEqual(false);

          form.get('food').disable();
          expect(inputs[0].nativeElement.disabled).toEqual(true);
          expect(inputs[1].nativeElement.disabled).toEqual(true);
          expect(inputs[2].nativeElement.disabled).toEqual(false);
          expect(inputs[3].nativeElement.disabled).toEqual(false);

          form.disable();
          expect(inputs[0].nativeElement.disabled).toEqual(true);
          expect(inputs[1].nativeElement.disabled).toEqual(true);
          expect(inputs[2].nativeElement.disabled).toEqual(true);
          expect(inputs[3].nativeElement.disabled).toEqual(true);

          form.enable();
          expect(inputs[0].nativeElement.disabled).toEqual(false);
          expect(inputs[1].nativeElement.disabled).toEqual(false);
          expect(inputs[2].nativeElement.disabled).toEqual(false);
          expect(inputs[3].nativeElement.disabled).toEqual(false);
        });

        it('should disable all radio buttons when initially disabled', () => {
          const fixture = TestBed.createComponent(FormControlRadioButtons);
          const form = new FormGroup({
            food: new FormControl({value: 'fish', disabled: true}),
            drink: new FormControl('cola')
          });
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          const inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.disabled).toEqual(true);
          expect(inputs[1].nativeElement.disabled).toEqual(true);
          expect(inputs[2].nativeElement.disabled).toEqual(false);
          expect(inputs[3].nativeElement.disabled).toEqual(false);
        });

      });

      describe('custom value accessors', () => {
        it('should support basic functionality', () => {
          const fixture = TestBed.createComponent(WrappedValueForm);
          const form = new FormGroup({'login': new FormControl('aa')});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          // model -> view
          const input = fixture.debugElement.query(By.css('input'));
          expect(input.nativeElement.value).toEqual('!aa!');

          input.nativeElement.value = '!bb!';
          dispatchEvent(input.nativeElement, 'input');

          // view -> model
          expect(form.value).toEqual({'login': 'bb'});

          // custom validator
          expect(form.get('login').errors).toEqual({'err': true});
          form.setValue({login: 'expected'});
          expect(form.get('login').errors).toEqual(null);
        });

        it('should support non builtin input elements that fire a change event without a \'target\' property',
           () => {
             const fixture = TestBed.createComponent(MyInputForm);
             fixture.componentInstance.form = new FormGroup({'login': new FormControl('aa')});
             fixture.detectChanges();

             const input = fixture.debugElement.query(By.css('my-input'));
             expect(input.componentInstance.value).toEqual('!aa!');

             input.componentInstance.value = '!bb!';
             input.componentInstance.onInput.subscribe((value: any) => {
               expect(fixture.componentInstance.form.value).toEqual({'login': 'bb'});
             });
             input.componentInstance.dispatchChangeEvent();
           });

        it('should support custom accessors without setDisabledState - formControlName', () => {
          const fixture = TestBed.createComponent(WrappedValueForm);
          fixture.componentInstance.form = new FormGroup({
            'login': new FormControl({value: 'aa', disabled: true}),
          });
          fixture.detectChanges();
          expect(fixture.componentInstance.form.status).toEqual('DISABLED');
          expect(fixture.componentInstance.form.get('login').status).toEqual('DISABLED');
        });

        it('should support custom accessors without setDisabledState - formControlDirective',
           () => {
             TestBed.overrideComponent(
                 FormControlComp,
                 {set: {template: `<input type="text" [formControl]="control" wrapped-value>`}});
             const fixture = TestBed.createComponent(FormControlComp);
             fixture.componentInstance.control = new FormControl({value: 'aa', disabled: true});
             fixture.detectChanges();
             expect(fixture.componentInstance.control.status).toEqual('DISABLED');
           });

      });

    });

    describe('ngModel interactions', () => {

      it('should support ngModel for complex forms', fakeAsync(() => {
           const fixture = TestBed.createComponent(FormGroupNgModel);
           fixture.componentInstance.form = new FormGroup({'login': new FormControl('')});
           fixture.componentInstance.login = 'oldValue';
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           expect(input.value).toEqual('oldValue');

           input.value = 'updatedValue';
           dispatchEvent(input, 'input');

           tick();
           expect(fixture.componentInstance.login).toEqual('updatedValue');
         }));

      it('should support ngModel for single fields', fakeAsync(() => {
           const fixture = TestBed.createComponent(FormControlNgModel);
           fixture.componentInstance.control = new FormControl('');
           fixture.componentInstance.login = 'oldValue';
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           expect(input.value).toEqual('oldValue');

           input.value = 'updatedValue';
           dispatchEvent(input, 'input');
           tick();

           expect(fixture.componentInstance.login).toEqual('updatedValue');
         }));

      it('should not update the view when the value initially came from the view', fakeAsync(() => {
           const fixture = TestBed.createComponent(FormControlNgModel);
           fixture.componentInstance.control = new FormControl('');
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           input.value = 'aa';
           input.setSelectionRange(1, 2);
           dispatchEvent(input, 'input');

           fixture.detectChanges();
           tick();

           // selection start has not changed because we did not reset the value
           expect(input.selectionStart).toEqual(1);
         }));

    });

    describe('validations', () => {
      it('should use sync validators defined in html', () => {
        const fixture = TestBed.createComponent(LoginIsEmptyWrapper);
        const form = new FormGroup({
          'login': new FormControl(''),
          'min': new FormControl(''),
          'max': new FormControl(''),
          'pattern': new FormControl('')
        });
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        const required = fixture.debugElement.query(By.css('[required]'));
        const minLength = fixture.debugElement.query(By.css('[minlength]'));
        const maxLength = fixture.debugElement.query(By.css('[maxlength]'));
        const pattern = fixture.debugElement.query(By.css('[pattern]'));

        required.nativeElement.value = '';
        minLength.nativeElement.value = '1';
        maxLength.nativeElement.value = '1234';
        pattern.nativeElement.value = '12';

        dispatchEvent(required.nativeElement, 'input');
        dispatchEvent(minLength.nativeElement, 'input');
        dispatchEvent(maxLength.nativeElement, 'input');
        dispatchEvent(pattern.nativeElement, 'input');

        expect(form.hasError('required', ['login'])).toEqual(true);
        expect(form.hasError('minlength', ['min'])).toEqual(true);
        expect(form.hasError('maxlength', ['max'])).toEqual(true);
        expect(form.hasError('pattern', ['pattern'])).toEqual(true);
        expect(form.hasError('loginIsEmpty')).toEqual(true);

        required.nativeElement.value = '1';
        minLength.nativeElement.value = '123';
        maxLength.nativeElement.value = '123';
        pattern.nativeElement.value = '123';

        dispatchEvent(required.nativeElement, 'input');
        dispatchEvent(minLength.nativeElement, 'input');
        dispatchEvent(maxLength.nativeElement, 'input');
        dispatchEvent(pattern.nativeElement, 'input');

        expect(form.valid).toEqual(true);
      });

      it('should use sync validators using bindings', () => {
        const fixture = TestBed.createComponent(ValidationBindingsForm);
        const form = new FormGroup({
          'login': new FormControl(''),
          'min': new FormControl(''),
          'max': new FormControl(''),
          'pattern': new FormControl('')
        });
        fixture.componentInstance.form = form;
        fixture.componentInstance.required = true;
        fixture.componentInstance.minLen = 3;
        fixture.componentInstance.maxLen = 3;
        fixture.componentInstance.pattern = '.{3,}';
        fixture.detectChanges();

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

        expect(form.hasError('required', ['login'])).toEqual(true);
        expect(form.hasError('minlength', ['min'])).toEqual(true);
        expect(form.hasError('maxlength', ['max'])).toEqual(true);
        expect(form.hasError('pattern', ['pattern'])).toEqual(true);

        required.nativeElement.value = '1';
        minLength.nativeElement.value = '123';
        maxLength.nativeElement.value = '123';
        pattern.nativeElement.value = '123';

        dispatchEvent(required.nativeElement, 'input');
        dispatchEvent(minLength.nativeElement, 'input');
        dispatchEvent(maxLength.nativeElement, 'input');
        dispatchEvent(pattern.nativeElement, 'input');

        expect(form.valid).toEqual(true);
      });

      it('changes on bound properties should change the validation state of the form', () => {
        const fixture = TestBed.createComponent(ValidationBindingsForm);
        const form = new FormGroup({
          'login': new FormControl(''),
          'min': new FormControl(''),
          'max': new FormControl(''),
          'pattern': new FormControl('')
        });
        fixture.componentInstance.form = form;
        fixture.detectChanges();

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

        expect(form.hasError('required', ['login'])).toEqual(false);
        expect(form.hasError('minlength', ['min'])).toEqual(false);
        expect(form.hasError('maxlength', ['max'])).toEqual(false);
        expect(form.hasError('pattern', ['pattern'])).toEqual(false);
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

        expect(form.hasError('required', ['login'])).toEqual(true);
        expect(form.hasError('minlength', ['min'])).toEqual(true);
        expect(form.hasError('maxlength', ['max'])).toEqual(true);
        expect(form.hasError('pattern', ['pattern'])).toEqual(true);
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

        expect(form.hasError('required', ['login'])).toEqual(false);
        expect(form.hasError('minlength', ['min'])).toEqual(false);
        expect(form.hasError('maxlength', ['max'])).toEqual(false);
        expect(form.hasError('pattern', ['pattern'])).toEqual(false);
        expect(form.valid).toEqual(true);

        expect(required.nativeElement.getAttribute('required')).toEqual(null);
        expect(required.nativeElement.getAttribute('minlength')).toEqual(null);
        expect(required.nativeElement.getAttribute('maxlength')).toEqual(null);
        expect(required.nativeElement.getAttribute('pattern')).toEqual(null);
      });

      it('should support rebound controls with rebound validators', () => {
        const fixture = TestBed.createComponent(ValidationBindingsForm);
        const form = new FormGroup({
          'login': new FormControl(''),
          'min': new FormControl(''),
          'max': new FormControl(''),
          'pattern': new FormControl('')
        });
        fixture.componentInstance.form = form;
        fixture.componentInstance.required = true;
        fixture.componentInstance.minLen = 3;
        fixture.componentInstance.maxLen = 3;
        fixture.componentInstance.pattern = '.{3,}';
        fixture.detectChanges();

        const newForm = new FormGroup({
          'login': new FormControl(''),
          'min': new FormControl(''),
          'max': new FormControl(''),
          'pattern': new FormControl('')
        });
        fixture.componentInstance.form = newForm;
        fixture.detectChanges();

        fixture.componentInstance.required = false;
        fixture.componentInstance.minLen = null;
        fixture.componentInstance.maxLen = null;
        fixture.componentInstance.pattern = null;
        fixture.detectChanges();

        expect(newForm.hasError('required', ['login'])).toEqual(false);
        expect(newForm.hasError('minlength', ['min'])).toEqual(false);
        expect(newForm.hasError('maxlength', ['max'])).toEqual(false);
        expect(newForm.hasError('pattern', ['pattern'])).toEqual(false);
        expect(newForm.valid).toEqual(true);
      });

      it('should use async validators defined in the html', fakeAsync(() => {
           const fixture = TestBed.createComponent(UniqLoginWrapper);
           const form = new FormGroup({'login': new FormControl('')});
           tick();
           fixture.componentInstance.form = form;
           fixture.detectChanges();

           expect(form.pending).toEqual(true);
           tick(100);

           expect(form.hasError('uniqLogin', ['login'])).toEqual(true);

           const input = fixture.debugElement.query(By.css('input'));
           input.nativeElement.value = 'expected';
           dispatchEvent(input.nativeElement, 'input');
           tick(100);

           expect(form.valid).toEqual(true);
         }));

      it('should use sync validators defined in the model', () => {
        const fixture = TestBed.createComponent(FormGroupComp);
        const form = new FormGroup({'login': new FormControl('aa', Validators.required)});
        fixture.componentInstance.form = form;
        fixture.detectChanges();
        expect(form.valid).toEqual(true);

        const input = fixture.debugElement.query(By.css('input'));
        input.nativeElement.value = '';
        dispatchEvent(input.nativeElement, 'input');

        expect(form.valid).toEqual(false);
      });

      it('should use async validators defined in the model', fakeAsync(() => {
           const fixture = TestBed.createComponent(FormGroupComp);
           const control =
               new FormControl('', Validators.required, uniqLoginAsyncValidator('expected'));
           const form = new FormGroup({'login': control});
           fixture.componentInstance.form = form;
           fixture.detectChanges();
           tick();

           expect(form.hasError('required', ['login'])).toEqual(true);

           const input = fixture.debugElement.query(By.css('input'));
           input.nativeElement.value = 'wrong value';
           dispatchEvent(input.nativeElement, 'input');

           expect(form.pending).toEqual(true);
           tick();

           expect(form.hasError('uniqLogin', ['login'])).toEqual(true);

           input.nativeElement.value = 'expected';
           dispatchEvent(input.nativeElement, 'input');
           tick();

           expect(form.valid).toEqual(true);
         }));

    });

    describe('errors', () => {

      it('should throw if a form isn\'t passed into formGroup', () => {
        const fixture = TestBed.createComponent(FormGroupComp);

        expect(() => fixture.detectChanges())
            .toThrowError(new RegExp(`formGroup expects a FormGroup instance`));
      });

      it('should throw if formControlName is used without a control container', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
          <input type="text" formControlName="login">
        `
          }
        });
        const fixture = TestBed.createComponent(FormGroupComp);

        expect(() => fixture.detectChanges())
            .toThrowError(
                new RegExp(`formControlName must be used with a parent formGroup directive`));
      });

      it('should throw if formControlName is used with NgForm', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
          <form>
            <input type="text" formControlName="login">
          </form>
        `
          }
        });
        const fixture = TestBed.createComponent(FormGroupComp);

        expect(() => fixture.detectChanges())
            .toThrowError(
                new RegExp(`formControlName must be used with a parent formGroup directive.`));
      });

      it('should throw if formControlName is used with NgModelGroup', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
          <form>
            <div ngModelGroup="parent">
              <input type="text" formControlName="login">
            </div>
          </form>
        `
          }
        });
        const fixture = TestBed.createComponent(FormGroupComp);

        expect(() => fixture.detectChanges())
            .toThrowError(
                new RegExp(`formControlName cannot be used with an ngModelGroup parent.`));
      });

      it('should throw if formGroupName is used without a control container', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
          <div formGroupName="person">
            <input type="text" formControlName="login">
          </div>
        `
          }
        });
        const fixture = TestBed.createComponent(FormGroupComp);

        expect(() => fixture.detectChanges())
            .toThrowError(
                new RegExp(`formGroupName must be used with a parent formGroup directive`));
      });

      it('should throw if formGroupName is used with NgForm', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
          <form>
            <div formGroupName="person">
              <input type="text" formControlName="login">
            </div>
          </form>
        `
          }
        });
        const fixture = TestBed.createComponent(FormGroupComp);

        expect(() => fixture.detectChanges())
            .toThrowError(
                new RegExp(`formGroupName must be used with a parent formGroup directive.`));
      });

      it('should throw if formArrayName is used without a control container', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
         <div formArrayName="cities">
           <input type="text" formControlName="login">
         </div>`
          }
        });
        const fixture = TestBed.createComponent(FormGroupComp);

        expect(() => fixture.detectChanges())
            .toThrowError(
                new RegExp(`formArrayName must be used with a parent formGroup directive`));
      });

      it('should throw if ngModel is used alone under formGroup', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
         <div [formGroup]="myGroup">
           <input type="text" [(ngModel)]="data">
         </div>
        `
          }
        });
        const fixture = TestBed.createComponent(FormGroupComp);
        fixture.componentInstance.myGroup = new FormGroup({});

        expect(() => fixture.detectChanges())
            .toThrowError(new RegExp(
                `ngModel cannot be used to register form controls with a parent formGroup directive.`));
      });

      it('should not throw if ngModel is used alone under formGroup with standalone: true', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
         <div [formGroup]="myGroup">
            <input type="text" [(ngModel)]="data" [ngModelOptions]="{standalone: true}">
         </div>
        `
          }
        });
        const fixture = TestBed.createComponent(FormGroupComp);
        fixture.componentInstance.myGroup = new FormGroup({});

        expect(() => fixture.detectChanges()).not.toThrowError();
      });

      it('should throw if ngModel is used alone with formGroupName', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
          <div [formGroup]="myGroup">
            <div formGroupName="person">
              <input type="text" [(ngModel)]="data">
            </div>
          </div>
        `
          }
        });
        const fixture = TestBed.createComponent(FormGroupComp);
        const myGroup = new FormGroup({person: new FormGroup({})});
        fixture.componentInstance.myGroup = new FormGroup({person: new FormGroup({})});

        expect(() => fixture.detectChanges())
            .toThrowError(new RegExp(
                `ngModel cannot be used to register form controls with a parent formGroupName or formArrayName directive.`));
      });

      it('should throw if ngModelGroup is used with formGroup', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
          <div [formGroup]="myGroup">
            <div ngModelGroup="person">
              <input type="text" [(ngModel)]="data">
            </div>
          </div>
        `
          }
        });
        const fixture = TestBed.createComponent(FormGroupComp);
        fixture.componentInstance.myGroup = new FormGroup({});

        expect(() => fixture.detectChanges())
            .toThrowError(
                new RegExp(`ngModelGroup cannot be used with a parent formGroup directive`));
      });

      it('should throw if radio button name does not match formControlName attr', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
          <form [formGroup]="form">hav
            <input type="radio" formControlName="food" name="drink" value="chicken">
          </form>`
          }
        });
        const fixture = TestBed.createComponent(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({'food': new FormControl('fish')});

        expect(() => fixture.detectChanges())
            .toThrowError(new RegExp('If you define both a name and a formControlName'));
      });

    });
  });
}

@Directive({
  selector: '[wrapped-value]',
  host: {'(input)': 'handleOnInput($event.target.value)', '[value]': 'value'},
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: WrappedValue},
    {provide: NG_VALIDATORS, multi: true, useExisting: WrappedValue}
  ]
})
class WrappedValue implements ControlValueAccessor {
  value: any;
  onChange: Function;

  writeValue(value: any) { this.value = `!${value}!`; }

  registerOnChange(fn: (value: any) => void) { this.onChange = fn; }
  registerOnTouched(fn: any) {}

  handleOnInput(value: any) { this.onChange(value.substring(1, value.length - 1)); }

  validate(c: AbstractControl) { return c.value === 'expected' ? null : {'err': true}; }
}

@Component({selector: 'my-input', template: ''})
class MyInput implements ControlValueAccessor {
  @Output('input') onInput = new EventEmitter();
  value: string;

  constructor(cd: NgControl) { cd.valueAccessor = this; }

  writeValue(value: any) { this.value = `!${value}!`; }

  registerOnChange(fn: (value: any) => void) { this.onInput.subscribe({next: fn}); }

  registerOnTouched(fn: any) {}

  dispatchChangeEvent() { this.onInput.emit(this.value.substring(1, this.value.length - 1)); }
}

function uniqLoginAsyncValidator(expectedValue: string) {
  return (c: AbstractControl) => {
    var resolve: (result: any) => void;
    var promise = new Promise(res => { resolve = res; });
    var res = (c.value == expectedValue) ? null : {'uniqLogin': true};
    resolve(res);
    return promise;
  };
}

function loginIsEmptyGroupValidator(c: FormGroup) {
  return c.controls['login'].value == '' ? {'loginIsEmpty': true} : null;
}

@Directive({
  selector: '[login-is-empty-validator]',
  providers: [{provide: NG_VALIDATORS, useValue: loginIsEmptyGroupValidator, multi: true}]
})
class LoginIsEmptyValidator {
}

@Directive({
  selector: '[uniq-login-validator]',
  providers: [{
    provide: NG_ASYNC_VALIDATORS,
    useExisting: forwardRef(() => UniqLoginValidator),
    multi: true
  }]
})
class UniqLoginValidator implements Validator {
  @Input('uniq-login-validator') expected: any /** TODO #9100 */;

  validate(c: AbstractControl) { return uniqLoginAsyncValidator(this.expected)(c); }
}

function sortedClassList(el: HTMLElement) {
  var l = getDOM().classList(el);
  ListWrapper.sort(l);
  return l;
}

@Component({
  selector: 'form-control-comp',
  template: `
    <input type="text" [formControl]="control">
  `
})
class FormControlComp {
  control: FormControl;
}

@Component({
  selector: 'form-group-comp',
  template: `
    <form [formGroup]="form" (ngSubmit)="data='submitted'">
      <input type="text" formControlName="login">
    </form>
  `
})
class FormGroupComp {
  control: FormControl;
  form: FormGroup;
  myGroup: FormGroup;
  data: string;
}

@Component({
  selector: 'nested-form-group-comp',
  template: `
    <form [formGroup]="form">
      <div formGroupName="signin" login-is-empty-validator>
        <input formControlName="login">
        <input formControlName="password">
      </div>
      <input *ngIf="form.contains('email')" formControlName="email">
    </form>
  `
})
class NestedFormGroupComp {
  form: FormGroup;
}

@Component({
  selector: 'form-control-number-input',
  template: `
    <input type="number" [formControl]="control">
  `
})
class FormControlNumberInput {
  control: FormControl;
}

@Component({
  selector: 'form-control-radio-buttons',
  template: `
  <form [formGroup]="form" *ngIf="showRadio.value === 'yes'">
    <input type="radio" formControlName="food" value="chicken">
    <input type="radio" formControlName="food" value="fish">
    <input type="radio" formControlName="drink" value="cola">
    <input type="radio" formControlName="drink" value="sprite">
  </form>
  <input type="radio" [formControl]="showRadio" value="yes">
  <input type="radio" [formControl]="showRadio" value="no">
  `
})
class FormControlRadioButtons {
  form: FormGroup;
  showRadio = new FormControl('yes');
}

@Component({
  selector: 'form-array-comp',
  template: `
    <div [formGroup]="form">
      <div formArrayName="cities">
        <div *ngFor="let city of cityArray.controls; let i=index">
          <input [formControlName]="i">
        </div>
      </div>
     </div>
  `
})
class FormArrayComp {
  form: FormGroup;
  cityArray: FormArray;
}

@Component({
  selector: 'form-array-nested-group',
  template: `
     <div [formGroup]="form">
      <div formArrayName="cities">
        <div *ngFor="let city of cityArray.controls; let i=index" [formGroupName]="i">
          <input formControlName="town">
          <input formControlName="state">
        </div>
      </div>
     </div>
  `
})
class FormArrayNestedGroup {
  form: FormGroup;
  cityArray: FormArray;
}

@Component({
  selector: 'form-control-name-select',
  template: `
    <div [formGroup]="form">
      <select formControlName="city">
        <option *ngFor="let c of cities" [value]="c"></option>
      </select>
    </div>
  `
})
class FormControlNameSelect {
  cities = ['SF', 'NY'];
  form = new FormGroup({city: new FormControl('SF')});
}

@Component({
  selector: 'wrapped-value-form',
  template: `
   <div [formGroup]="form">
    <input type="text" formControlName="login" wrapped-value>
  </div>
  `
})
class WrappedValueForm {
  form: FormGroup;
}

@Component({
  selector: 'my-input-form',
  template: `
   <div [formGroup]="form">
      <my-input formControlName="login"></my-input>
   </div>
  `
})
class MyInputForm {
  form: FormGroup;
}

@Component({
  selector: 'form-group-ng-model',
  template: `
  <div [formGroup]="form">
    <input type="text" formControlName="login" [(ngModel)]="login">
   </div>
  `
})
class FormGroupNgModel {
  form: FormGroup;
  login: string;
}

@Component({
  selector: 'form-control-ng-model',
  template: `
    <input type="text" [formControl]="control" [(ngModel)]="login">
  `
})
class FormControlNgModel {
  control: FormControl;
  login: string;
}

@Component({
  selector: 'login-is-empty-wrapper',
  template: `
    <div [formGroup]="form" login-is-empty-validator>
      <input type="text" formControlName="login" required>
      <input type="text" formControlName="min" minlength="3">
      <input type="text" formControlName="max" maxlength="3">
      <input type="text" formControlName="pattern" pattern=".{3,}">
   </div>
  `
})
class LoginIsEmptyWrapper {
  form: FormGroup;
}

@Component({
  selector: 'validation-bindings-form',
  template: `
    <div [formGroup]="form">
      <input name="required" type="text" formControlName="login" [required]="required">
      <input name="minlength" type="text" formControlName="min" [minlength]="minLen">
      <input name="maxlength" type="text" formControlName="max" [maxlength]="maxLen">
      <input name="pattern" type="text" formControlName="pattern" [pattern]="pattern">
   </div>
  `
})
class ValidationBindingsForm {
  form: FormGroup;
  required: boolean;
  minLen: number;
  maxLen: number;
  pattern: string;
}

@Component({
  selector: 'uniq-login-wrapper',
  template: `
  <div [formGroup]="form">
    <input type="text" formControlName="login" uniq-login-validator="expected">
  </div>
  `
})
class UniqLoginWrapper {
  form: FormGroup;
}
