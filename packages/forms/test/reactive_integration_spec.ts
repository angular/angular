/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Input, Type, forwardRef} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {AbstractControl, AsyncValidator, AsyncValidatorFn, COMPOSITION_BUFFER_MODE, FormArray, FormControl, FormControlDirective, FormControlName, FormGroup, FormGroupDirective, FormsModule, NG_ASYNC_VALIDATORS, NG_VALIDATORS, ReactiveFormsModule, Validators} from '@angular/forms';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {dispatchEvent} from '@angular/platform-browser/testing/src/browser_util';
import {fixmeIvy} from '@angular/private/testing';
import {merge, timer} from 'rxjs';
import {tap} from 'rxjs/operators';

import {MyInput, MyInputForm} from './value_accessor_integration_spec';

{
  describe('reactive forms integration tests', () => {

    function initTest<T>(component: Type<T>, ...directives: Type<any>[]): ComponentFixture<T> {
      TestBed.configureTestingModule(
          {declarations: [component, ...directives], imports: [FormsModule, ReactiveFormsModule]});
      return TestBed.createComponent(component);
    }

    describe('basic functionality', () => {
      it('should work with single controls', () => {
        const fixture = initTest(FormControlComp);
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
        const fixture = initTest(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({'login': new FormControl('loginValue')});
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.value).toEqual('loginValue');
      });

      it('should add novalidate by default to form', () => {
        const fixture = initTest(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({'login': new FormControl('loginValue')});
        fixture.detectChanges();

        const form = fixture.debugElement.query(By.css('form'));
        expect(form.nativeElement.getAttribute('novalidate')).toEqual('');
      });

      it('work with formGroups (view -> model)', () => {
        const fixture = initTest(FormGroupComp);
        const form = new FormGroup({'login': new FormControl('oldValue')});
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input'));
        input.nativeElement.value = 'updatedValue';
        dispatchEvent(input.nativeElement, 'input');

        expect(form.value).toEqual({'login': 'updatedValue'});
      });

    });

    describe('re-bound form groups', () => {

      it('should update DOM elements initially', () => {
        const fixture = initTest(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({'login': new FormControl('oldValue')});
        fixture.detectChanges();

        fixture.componentInstance.form = new FormGroup({'login': new FormControl('newValue')});
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.value).toEqual('newValue');
      });

      it('should update model when UI changes', () => {
        const fixture = initTest(FormGroupComp);
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

      it('should update nested form group model when UI changes', () => {
        const fixture = initTest(NestedFormGroupComp);
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
        const fixture = initTest(LoginIsEmptyWrapper, LoginIsEmptyValidator);
        const form = new FormGroup({
          'login': new FormControl(''),
          'min': new FormControl(''),
          'max': new FormControl(''),
          'pattern': new FormControl('')
        });
        fixture.componentInstance.form = form;
        fixture.detectChanges();
        expect(form.get('login') !.errors).toEqual({required: true});

        const newForm = new FormGroup({
          'login': new FormControl(''),
          'min': new FormControl(''),
          'max': new FormControl(''),
          'pattern': new FormControl('')
        });
        fixture.componentInstance.form = newForm;
        fixture.detectChanges();

        expect(newForm.get('login') !.errors).toEqual({required: true});
      });

      it('should pick up dir validators from nested form groups', () => {
        const fixture = initTest(NestedFormGroupComp, LoginIsEmptyValidator);
        const form = new FormGroup({
          'signin':
              new FormGroup({'login': new FormControl(''), 'password': new FormControl('')})
        });
        fixture.componentInstance.form = form;
        fixture.detectChanges();
        expect(form.get('signin') !.valid).toBe(false);

        const newForm = new FormGroup({
          'signin':
              new FormGroup({'login': new FormControl(''), 'password': new FormControl('')})
        });
        fixture.componentInstance.form = newForm;
        fixture.detectChanges();

        expect(form.get('signin') !.valid).toBe(false);
      });

      it('should strip named controls that are not found', () => {
        const fixture = initTest(NestedFormGroupComp, LoginIsEmptyValidator);
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
        expect(emailInput as any).toBe(null);  // TODO: Review use of `any` here (#19904)
      });

      it('should strip array controls that are not found', () => {
        const fixture = initTest(FormArrayComp);
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
          const fixture = initTest(FormGroupComp);
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
          const fixture = initTest(NestedFormGroupComp, LoginIsEmptyValidator);
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
          const fixture = initTest(FormArrayComp);
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

        it('should remove controls correctly after re-binding a form array', () => {
          const fixture = initTest(FormArrayComp);
          const cityArray =
              new FormArray([new FormControl('SF'), new FormControl('NY'), new FormControl('LA')]);
          const form = new FormGroup({cities: cityArray});
          fixture.componentInstance.form = form;
          fixture.componentInstance.cityArray = cityArray;
          fixture.detectChanges();

          const newArr =
              new FormArray([new FormControl('SF'), new FormControl('NY'), new FormControl('LA')]);
          fixture.componentInstance.cityArray = newArr;
          form.setControl('cities', newArr);
          fixture.detectChanges();

          newArr.removeAt(0);
          fixture.detectChanges();

          let inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.value).toEqual('NY');
          expect(inputs[1].nativeElement.value).toEqual('LA');

          let firstInput = inputs[0].nativeElement;
          firstInput.value = 'new value';
          dispatchEvent(firstInput, 'input');
          fixture.detectChanges();

          expect(newArr.value).toEqual(['new value', 'LA']);

          newArr.removeAt(0);
          fixture.detectChanges();

          firstInput = fixture.debugElement.query(By.css('input')).nativeElement;
          firstInput.value = 'last one';
          dispatchEvent(firstInput, 'input');
          fixture.detectChanges();

          expect(newArr.value).toEqual(['last one']);

          newArr.get([0]) !.setValue('set value');
          fixture.detectChanges();

          firstInput = fixture.debugElement.query(By.css('input')).nativeElement;
          expect(firstInput.value).toEqual('set value');
        });

        it('should submit properly after removing controls on a re-bound array', () => {
          const fixture = initTest(FormArrayComp);
          const cityArray =
              new FormArray([new FormControl('SF'), new FormControl('NY'), new FormControl('LA')]);
          const form = new FormGroup({cities: cityArray});
          fixture.componentInstance.form = form;
          fixture.componentInstance.cityArray = cityArray;
          fixture.detectChanges();

          const newArr =
              new FormArray([new FormControl('SF'), new FormControl('NY'), new FormControl('LA')]);
          fixture.componentInstance.cityArray = newArr;
          form.setControl('cities', newArr);
          fixture.detectChanges();

          newArr.removeAt(0);
          fixture.detectChanges();

          const formEl = fixture.debugElement.query(By.css('form'));
          expect(() => dispatchEvent(formEl.nativeElement, 'submit')).not.toThrowError();
        });

        it('should insert controls properly on a re-bound array', () => {
          const fixture = initTest(FormArrayComp);
          const cityArray = new FormArray([new FormControl('SF'), new FormControl('NY')]);
          const form = new FormGroup({cities: cityArray});
          fixture.componentInstance.form = form;
          fixture.componentInstance.cityArray = cityArray;
          fixture.detectChanges();

          const newArr = new FormArray([new FormControl('SF'), new FormControl('NY')]);
          fixture.componentInstance.cityArray = newArr;
          form.setControl('cities', newArr);
          fixture.detectChanges();

          newArr.insert(1, new FormControl('LA'));
          fixture.detectChanges();

          let inputs = fixture.debugElement.queryAll(By.css('input'));
          expect(inputs[0].nativeElement.value).toEqual('SF');
          expect(inputs[1].nativeElement.value).toEqual('LA');
          expect(inputs[2].nativeElement.value).toEqual('NY');

          const lastInput = inputs[2].nativeElement;
          lastInput.value = 'Tulsa';
          dispatchEvent(lastInput, 'input');
          fixture.detectChanges();

          expect(newArr.value).toEqual(['SF', 'LA', 'Tulsa']);

          newArr.get([2]) !.setValue('NY');
          fixture.detectChanges();

          expect(lastInput.value).toEqual('NY');
        });

      });

    });

    describe('form arrays', () => {
      it('should support form arrays', () => {
        const fixture = initTest(FormArrayComp);
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
        const fixture = initTest(FormArrayComp);
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
        const fixture = initTest(FormArrayNestedGroup);
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
        const fixture = initTest(FormGroupComp);
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
             const fixture = initTest(FormControlComp);
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
          const fixture = initTest(FormGroupComp);
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
             const fixture = initTest(FormControlComp);
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
             const fixture = initTest(FormGroupComp);
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
          const fixture = initTest(MyInputForm, MyInput);
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
        const fixture = initTest(FormGroupComp);
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
      it('should emit ngSubmit event with the original submit event on submit', () => {
        const fixture = initTest(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({'login': new FormControl('loginValue')});
        fixture.componentInstance.event = null !;
        fixture.detectChanges();

        const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(formEl, 'submit');

        fixture.detectChanges();
        expect(fixture.componentInstance.event.type).toEqual('submit');
      });

      it('should mark formGroup as submitted on submit event', () => {
        const fixture = initTest(FormGroupComp);
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
        const fixture = initTest(FormGroupComp);
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
        const fixture = initTest(FormGroupComp);
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
        const fixture = initTest(FormGroupComp);
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
           const fixture = initTest(FormGroupComp);
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

    fixmeIvy('Host bindings to styles do not yet work') &&
        describe('setting status classes', () => {
          it('should work with single fields', () => {
            const fixture = initTest(FormControlComp);
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

          it('should work with single fields and async validators', fakeAsync(() => {
               const fixture = initTest(FormControlComp);
               const control = new FormControl('', null !, uniqLoginAsyncValidator('good'));
               fixture.debugElement.componentInstance.control = control;
               fixture.detectChanges();

               const input = fixture.debugElement.query(By.css('input')).nativeElement;
               expect(sortedClassList(input)).toEqual([
                 'ng-pending', 'ng-pristine', 'ng-untouched'
               ]);

               dispatchEvent(input, 'blur');
               fixture.detectChanges();
               expect(sortedClassList(input)).toEqual(['ng-pending', 'ng-pristine', 'ng-touched']);

               input.value = 'good';
               dispatchEvent(input, 'input');
               tick();
               fixture.detectChanges();

               expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
             }));

          it('should work with single fields that combines async and sync validators',
             fakeAsync(() => {
               const fixture = initTest(FormControlComp);
               const control =
                   new FormControl('', Validators.required, uniqLoginAsyncValidator('good'));
               fixture.debugElement.componentInstance.control = control;
               fixture.detectChanges();

               const input = fixture.debugElement.query(By.css('input')).nativeElement;
               expect(sortedClassList(input)).toEqual([
                 'ng-invalid', 'ng-pristine', 'ng-untouched'
               ]);

               dispatchEvent(input, 'blur');
               fixture.detectChanges();
               expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-touched']);

               input.value = 'bad';
               dispatchEvent(input, 'input');
               fixture.detectChanges();

               expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-pending', 'ng-touched']);

               tick();
               fixture.detectChanges();

               expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-invalid', 'ng-touched']);

               input.value = 'good';
               dispatchEvent(input, 'input');
               tick();
               fixture.detectChanges();

               expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
             }));

          it('should work with single fields in parent forms', () => {
            const fixture = initTest(FormGroupComp);
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
            const fixture = initTest(FormGroupComp);
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

    describe('updateOn options', () => {

      describe('on blur', () => {

        it('should not update value or validity based on user input until blur', () => {
          const fixture = initTest(FormControlComp);
          const control = new FormControl('', {validators: Validators.required, updateOn: 'blur'});
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(control.value).toEqual('', 'Expected value to remain unchanged until blur.');
          expect(control.valid).toBe(false, 'Expected no validation to occur until blur.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(control.value)
              .toEqual('Nancy', 'Expected value to change once control is blurred.');
          expect(control.valid).toBe(true, 'Expected validation to run once control is blurred.');
        });

        it('should not update parent group value/validity from child until blur', () => {
          const fixture = initTest(FormGroupComp);
          const form = new FormGroup(
              {login: new FormControl('', {validators: Validators.required, updateOn: 'blur'})});
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(form.value)
              .toEqual({login: ''}, 'Expected group value to remain unchanged until blur.');
          expect(form.valid).toBe(false, 'Expected no validation to occur on group until blur.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(form.value)
              .toEqual({login: 'Nancy'}, 'Expected group value to change once input blurred.');
          expect(form.valid).toBe(true, 'Expected validation to run once input blurred.');
        });

        it('should not wait for blur event to update if value is set programmatically', () => {
          const fixture = initTest(FormControlComp);
          const control = new FormControl('', {validators: Validators.required, updateOn: 'blur'});
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          control.setValue('Nancy');
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          expect(input.value).toEqual('Nancy', 'Expected value to propagate to view immediately.');
          expect(control.value).toEqual('Nancy', 'Expected model value to update immediately.');
          expect(control.valid).toBe(true, 'Expected validation to run immediately.');
        });

        it('should not update dirty state until control is blurred', () => {
          const fixture = initTest(FormControlComp);
          const control = new FormControl('', {updateOn: 'blur'});
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          expect(control.dirty).toBe(false, 'Expected control to start out pristine.');

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(control.dirty).toBe(false, 'Expected control to stay pristine until blurred.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(control.dirty).toBe(true, 'Expected control to update dirty state when blurred.');
        });

        it('should update touched when control is blurred', () => {
          const fixture = initTest(FormControlComp);
          const control = new FormControl('', {updateOn: 'blur'});
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          expect(control.touched).toBe(false, 'Expected control to start out untouched.');

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(control.touched)
              .toBe(true, 'Expected control to update touched state when blurred.');
        });

        it('should continue waiting for blur to update if previously blurred', () => {
          const fixture = initTest(FormControlComp);
          const control =
              new FormControl('Nancy', {validators: Validators.required, updateOn: 'blur'});
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          dispatchEvent(input, 'focus');
          input.value = '';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(control.value)
              .toEqual('Nancy', 'Expected value to remain unchanged until second blur.');
          expect(control.valid).toBe(true, 'Expected validation not to run until second blur.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(control.value).toEqual('', 'Expected value to update when blur occurs again.');
          expect(control.valid).toBe(false, 'Expected validation to run when blur occurs again.');
        });

        it('should not use stale pending value if value set programmatically', () => {
          const fixture = initTest(FormControlComp);
          const control = new FormControl('', {validators: Validators.required, updateOn: 'blur'});
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'aa';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          control.setValue('Nancy');
          fixture.detectChanges();

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(input.value).toEqual('Nancy', 'Expected programmatic value to stick after blur.');
        });

        it('should set initial value and validity on init', () => {
          const fixture = initTest(FormControlComp);
          const control =
              new FormControl('Nancy', {validators: Validators.maxLength(3), updateOn: 'blur'});
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;

          expect(input.value).toEqual('Nancy', 'Expected value to be set in the view.');
          expect(control.value).toEqual('Nancy', 'Expected initial model value to be set.');
          expect(control.valid).toBe(false, 'Expected validation to run on initial value.');
        });

        it('should reset properly', () => {
          const fixture = initTest(FormControlComp);
          const control = new FormControl('', {validators: Validators.required, updateOn: 'blur'});
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'aa';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          dispatchEvent(input, 'blur');
          fixture.detectChanges();
          expect(control.dirty).toBe(true, 'Expected control to be dirty on blur.');

          control.reset();

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(input.value).toEqual('', 'Expected view value to reset');
          expect(control.value).toBe(null, 'Expected pending value to reset.');
          expect(control.dirty).toBe(false, 'Expected pending dirty value to reset.');
        });

        it('should not emit valueChanges or statusChanges until blur', () => {
          const fixture = initTest(FormControlComp);
          const control = new FormControl('', {validators: Validators.required, updateOn: 'blur'});
          fixture.componentInstance.control = control;
          fixture.detectChanges();
          const values: string[] = [];

          const sub =
              merge(control.valueChanges, control.statusChanges).subscribe(val => values.push(val));

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(values).toEqual([], 'Expected no valueChanges or statusChanges on input.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(values).toEqual(
              ['Nancy', 'VALID'], 'Expected valueChanges and statusChanges on blur.');

          sub.unsubscribe();
        });

        it('should not emit valueChanges or statusChanges on blur if value unchanged', () => {
          const fixture = initTest(FormControlComp);
          const control = new FormControl('', {validators: Validators.required, updateOn: 'blur'});
          fixture.componentInstance.control = control;
          fixture.detectChanges();
          const values: string[] = [];

          const sub =
              merge(control.valueChanges, control.statusChanges).subscribe(val => values.push(val));

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          dispatchEvent(input, 'blur');
          fixture.detectChanges();
          expect(values).toEqual(
              [], 'Expected no valueChanges or statusChanges if value unchanged.');

          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();
          expect(values).toEqual([], 'Expected no valueChanges or statusChanges on input.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();
          expect(values).toEqual(
              ['Nancy', 'VALID'],
              'Expected valueChanges and statusChanges on blur if value changed.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();
          expect(values).toEqual(
              ['Nancy', 'VALID'],
              'Expected valueChanges and statusChanges not to fire again on blur unless value changed.');

          input.value = 'Bess';
          dispatchEvent(input, 'input');
          fixture.detectChanges();
          expect(values).toEqual(
              ['Nancy', 'VALID'],
              'Expected valueChanges and statusChanges not to fire on input after blur.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();
          expect(values).toEqual(
              ['Nancy', 'VALID', 'Bess', 'VALID'],
              'Expected valueChanges and statusChanges to fire again on blur if value changed.');

          sub.unsubscribe();
        });

        it('should mark as pristine properly if pending dirty', () => {
          const fixture = initTest(FormControlComp);
          const control = new FormControl('', {updateOn: 'blur'});
          fixture.componentInstance.control = control;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'aa';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          control.markAsPristine();
          expect(control.dirty).toBe(false, 'Expected control to become pristine.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(control.dirty).toBe(false, 'Expected pending dirty value to reset.');
        });

        it('should update on blur with group updateOn', () => {
          const fixture = initTest(FormGroupComp);
          const control = new FormControl('', Validators.required);
          const formGroup = new FormGroup({login: control}, {updateOn: 'blur'});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(control.value).toEqual('', 'Expected value to remain unchanged until blur.');
          expect(control.valid).toBe(false, 'Expected no validation to occur until blur.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(control.value)
              .toEqual('Nancy', 'Expected value to change once control is blurred.');
          expect(control.valid).toBe(true, 'Expected validation to run once control is blurred.');

        });

        it('should update on blur with array updateOn', () => {
          const fixture = initTest(FormArrayComp);
          const control = new FormControl('', Validators.required);
          const cityArray = new FormArray([control], {updateOn: 'blur'});
          const formGroup = new FormGroup({cities: cityArray});
          fixture.componentInstance.form = formGroup;
          fixture.componentInstance.cityArray = cityArray;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(control.value).toEqual('', 'Expected value to remain unchanged until blur.');
          expect(control.valid).toBe(false, 'Expected no validation to occur until blur.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(control.value)
              .toEqual('Nancy', 'Expected value to change once control is blurred.');
          expect(control.valid).toBe(true, 'Expected validation to run once control is blurred.');

        });


        it('should allow child control updateOn blur to override group updateOn', () => {
          const fixture = initTest(NestedFormGroupComp);
          const loginControl =
              new FormControl('', {validators: Validators.required, updateOn: 'change'});
          const passwordControl = new FormControl('', Validators.required);
          const formGroup = new FormGroup(
              {signin: new FormGroup({login: loginControl, password: passwordControl})},
              {updateOn: 'blur'});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          const [loginInput, passwordInput] = fixture.debugElement.queryAll(By.css('input'));
          loginInput.nativeElement.value = 'Nancy';
          dispatchEvent(loginInput.nativeElement, 'input');
          fixture.detectChanges();

          expect(loginControl.value).toEqual('Nancy', 'Expected value change on input.');
          expect(loginControl.valid).toBe(true, 'Expected validation to run on input.');

          passwordInput.nativeElement.value = 'Carson';
          dispatchEvent(passwordInput.nativeElement, 'input');
          fixture.detectChanges();

          expect(passwordControl.value)
              .toEqual('', 'Expected value to remain unchanged until blur.');
          expect(passwordControl.valid).toBe(false, 'Expected no validation to occur until blur.');

          dispatchEvent(passwordInput.nativeElement, 'blur');
          fixture.detectChanges();

          expect(passwordControl.value)
              .toEqual('Carson', 'Expected value to change once control is blurred.');
          expect(passwordControl.valid)
              .toBe(true, 'Expected validation to run once control is blurred.');
        });


      });

      describe('on submit', () => {

        it('should set initial value and validity on init', () => {
          const fixture = initTest(FormGroupComp);
          const form = new FormGroup({
            login:
                new FormControl('Nancy', {validators: Validators.required, updateOn: 'submit'})
          });
          fixture.componentInstance.form = form;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          expect(input.value).toEqual('Nancy', 'Expected initial value to propagate to view.');
          expect(form.value).toEqual({login: 'Nancy'}, 'Expected initial value to be set.');
          expect(form.valid).toBe(true, 'Expected form to run validation on initial value.');
        });

        it('should not update value or validity until submit', () => {
          const fixture = initTest(FormGroupComp);
          const formGroup = new FormGroup(
              {login: new FormControl('', {validators: Validators.required, updateOn: 'submit'})});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(formGroup.value)
              .toEqual({login: ''}, 'Expected form value to remain unchanged on input.');
          expect(formGroup.valid).toBe(false, 'Expected form validation not to run on input.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(formGroup.value)
              .toEqual({login: ''}, 'Expected form value to remain unchanged on blur.');
          expect(formGroup.valid).toBe(false, 'Expected form validation not to run on blur.');

          const form = fixture.debugElement.query(By.css('form')).nativeElement;
          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          expect(formGroup.value)
              .toEqual({login: 'Nancy'}, 'Expected form value to update on submit.');
          expect(formGroup.valid).toBe(true, 'Expected form validation to run on submit.');
        });

        it('should not update after submit until a second submit', () => {
          const fixture = initTest(FormGroupComp);
          const formGroup = new FormGroup(
              {login: new FormControl('', {validators: Validators.required, updateOn: 'submit'})});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          const form = fixture.debugElement.query(By.css('form')).nativeElement;
          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          input.value = '';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(formGroup.value)
              .toEqual({login: 'Nancy'}, 'Expected value not to change until a second submit.');
          expect(formGroup.valid)
              .toBe(true, 'Expected validation not to run until a second submit.');

          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          expect(formGroup.value)
              .toEqual({login: ''}, 'Expected value to update on the second submit.');
          expect(formGroup.valid).toBe(false, 'Expected validation to run on a second submit.');
        });

        it('should not wait for submit to set value programmatically', () => {
          const fixture = initTest(FormGroupComp);
          const formGroup = new FormGroup(
              {login: new FormControl('', {validators: Validators.required, updateOn: 'submit'})});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          formGroup.setValue({login: 'Nancy'});
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          expect(input.value).toEqual('Nancy', 'Expected view value to update immediately.');
          expect(formGroup.value)
              .toEqual({login: 'Nancy'}, 'Expected form value to update immediately.');
          expect(formGroup.valid).toBe(true, 'Expected form validation to run immediately.');
        });

        it('should not update dirty until submit', () => {
          const fixture = initTest(FormGroupComp);
          const formGroup = new FormGroup({login: new FormControl('', {updateOn: 'submit'})});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(formGroup.dirty).toBe(false, 'Expected dirty not to change on input.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(formGroup.dirty).toBe(false, 'Expected dirty not to change on blur.');

          const form = fixture.debugElement.query(By.css('form')).nativeElement;
          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          expect(formGroup.dirty).toBe(true, 'Expected dirty to update on submit.');
        });

        it('should not update touched until submit', () => {
          const fixture = initTest(FormGroupComp);
          const formGroup = new FormGroup({login: new FormControl('', {updateOn: 'submit'})});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(formGroup.touched).toBe(false, 'Expected touched not to change until submit.');

          const form = fixture.debugElement.query(By.css('form')).nativeElement;
          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          expect(formGroup.touched).toBe(true, 'Expected touched to update on submit.');
        });

        it('should reset properly', () => {
          const fixture = initTest(FormGroupComp);
          const formGroup = new FormGroup(
              {login: new FormControl('', {validators: Validators.required, updateOn: 'submit'})});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          formGroup.reset();
          fixture.detectChanges();

          expect(input.value).toEqual('', 'Expected view value to reset.');
          expect(formGroup.value).toEqual({login: null}, 'Expected form value to reset');
          expect(formGroup.dirty).toBe(false, 'Expected dirty to stay false on reset.');
          expect(formGroup.touched).toBe(false, 'Expected touched to stay false on reset.');

          const form = fixture.debugElement.query(By.css('form')).nativeElement;
          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          expect(formGroup.value)
              .toEqual({login: null}, 'Expected form value to stay empty on submit');
          expect(formGroup.dirty).toBe(false, 'Expected dirty to stay false on submit.');
          expect(formGroup.touched).toBe(false, 'Expected touched to stay false on submit.');
        });

        it('should not emit valueChanges or statusChanges until submit', () => {
          const fixture = initTest(FormGroupComp);
          const control =
              new FormControl('', {validators: Validators.required, updateOn: 'submit'});
          const formGroup = new FormGroup({login: control});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          const values: any[] = [];
          const streams = merge(
              control.valueChanges, control.statusChanges, formGroup.valueChanges,
              formGroup.statusChanges);
          const sub = streams.subscribe(val => values.push(val));

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(values).toEqual([], 'Expected no valueChanges or statusChanges on input');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(values).toEqual([], 'Expected no valueChanges or statusChanges on blur');

          const form = fixture.debugElement.query(By.css('form')).nativeElement;
          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          expect(values).toEqual(
              ['Nancy', 'VALID', {login: 'Nancy'}, 'VALID'],
              'Expected valueChanges and statusChanges to update on submit.');

          sub.unsubscribe();
        });

        it('should not emit valueChanges or statusChanges on submit if value unchanged', () => {
          const fixture = initTest(FormGroupComp);
          const control =
              new FormControl('', {validators: Validators.required, updateOn: 'submit'});
          const formGroup = new FormGroup({login: control});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          const values: (string | {[key: string]: string})[] = [];
          const streams = merge(
              control.valueChanges, control.statusChanges, formGroup.valueChanges,
              formGroup.statusChanges);
          const sub = streams.subscribe(val => values.push(val));

          const form = fixture.debugElement.query(By.css('form')).nativeElement;
          dispatchEvent(form, 'submit');
          fixture.detectChanges();
          expect(values).toEqual(
              [], 'Expected no valueChanges or statusChanges if value unchanged.');

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();
          expect(values).toEqual([], 'Expected no valueChanges or statusChanges on input.');

          dispatchEvent(form, 'submit');
          fixture.detectChanges();
          expect(values).toEqual(
              ['Nancy', 'VALID', {login: 'Nancy'}, 'VALID'],
              'Expected valueChanges and statusChanges on submit if value changed.');

          dispatchEvent(form, 'submit');
          fixture.detectChanges();
          expect(values).toEqual(
              ['Nancy', 'VALID', {login: 'Nancy'}, 'VALID'],
              'Expected valueChanges and statusChanges not to fire again if value unchanged.');

          input.value = 'Bess';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(values).toEqual(
              ['Nancy', 'VALID', {login: 'Nancy'}, 'VALID'],
              'Expected valueChanges and statusChanges not to fire on input after submit.');

          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          expect(values).toEqual(
              [
                'Nancy', 'VALID', {login: 'Nancy'}, 'VALID', 'Bess', 'VALID', {login: 'Bess'},
                'VALID'
              ],
              'Expected valueChanges and statusChanges to fire again on submit if value changed.');

          sub.unsubscribe();
        });

        it('should not run validation for onChange controls on submit', () => {
          const validatorSpy = jasmine.createSpy('validator');
          const groupValidatorSpy = jasmine.createSpy('groupValidatorSpy');

          const fixture = initTest(NestedFormGroupComp);
          const formGroup = new FormGroup({
            signin: new FormGroup({login: new FormControl(), password: new FormControl()}),
            email: new FormControl('', {updateOn: 'submit'})
          });
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          formGroup.get('signin.login') !.setValidators(validatorSpy);
          formGroup.get('signin') !.setValidators(groupValidatorSpy);

          const form = fixture.debugElement.query(By.css('form')).nativeElement;
          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          expect(validatorSpy).not.toHaveBeenCalled();
          expect(groupValidatorSpy).not.toHaveBeenCalled();

        });

        it('should mark as untouched properly if pending touched', () => {
          const fixture = initTest(FormGroupComp);
          const formGroup = new FormGroup({login: new FormControl('', {updateOn: 'submit'})});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          formGroup.markAsUntouched();
          fixture.detectChanges();

          expect(formGroup.touched).toBe(false, 'Expected group to become untouched.');

          const form = fixture.debugElement.query(By.css('form')).nativeElement;
          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          expect(formGroup.touched).toBe(false, 'Expected touched to stay false on submit.');
        });

        it('should update on submit with group updateOn', () => {
          const fixture = initTest(FormGroupComp);
          const control = new FormControl('', Validators.required);
          const formGroup = new FormGroup({login: control}, {updateOn: 'submit'});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(control.value).toEqual('', 'Expected value to remain unchanged until submit.');
          expect(control.valid).toBe(false, 'Expected no validation to occur until submit.');

          dispatchEvent(input, 'blur');
          fixture.detectChanges();

          expect(control.value).toEqual('', 'Expected value to remain unchanged until submit.');
          expect(control.valid).toBe(false, 'Expected no validation to occur until submit.');

          const form = fixture.debugElement.query(By.css('form')).nativeElement;
          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          expect(control.value).toEqual('Nancy', 'Expected value to change on submit.');
          expect(control.valid).toBe(true, 'Expected validation to run on submit.');

        });

        it('should update on submit with array updateOn', () => {
          const fixture = initTest(FormArrayComp);
          const control = new FormControl('', Validators.required);
          const cityArray = new FormArray([control], {updateOn: 'submit'});
          const formGroup = new FormGroup({cities: cityArray});
          fixture.componentInstance.form = formGroup;
          fixture.componentInstance.cityArray = cityArray;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          input.value = 'Nancy';
          dispatchEvent(input, 'input');
          fixture.detectChanges();

          expect(control.value).toEqual('', 'Expected value to remain unchanged until submit.');
          expect(control.valid).toBe(false, 'Expected no validation to occur until submit.');


          const form = fixture.debugElement.query(By.css('form')).nativeElement;
          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          expect(control.value).toEqual('Nancy', 'Expected value to change once control on submit');
          expect(control.valid).toBe(true, 'Expected validation to run on submit.');

        });

        it('should allow child control updateOn submit to override group updateOn', () => {
          const fixture = initTest(NestedFormGroupComp);
          const loginControl =
              new FormControl('', {validators: Validators.required, updateOn: 'change'});
          const passwordControl = new FormControl('', Validators.required);
          const formGroup = new FormGroup(
              {signin: new FormGroup({login: loginControl, password: passwordControl})},
              {updateOn: 'submit'});
          fixture.componentInstance.form = formGroup;
          fixture.detectChanges();

          const [loginInput, passwordInput] = fixture.debugElement.queryAll(By.css('input'));
          loginInput.nativeElement.value = 'Nancy';
          dispatchEvent(loginInput.nativeElement, 'input');
          fixture.detectChanges();

          expect(loginControl.value).toEqual('Nancy', 'Expected value change on input.');
          expect(loginControl.valid).toBe(true, 'Expected validation to run on input.');

          passwordInput.nativeElement.value = 'Carson';
          dispatchEvent(passwordInput.nativeElement, 'input');
          fixture.detectChanges();

          expect(passwordControl.value)
              .toEqual('', 'Expected value to remain unchanged until submit.');
          expect(passwordControl.valid)
              .toBe(false, 'Expected no validation to occur until submit.');

          const form = fixture.debugElement.query(By.css('form')).nativeElement;
          dispatchEvent(form, 'submit');
          fixture.detectChanges();

          expect(passwordControl.value).toEqual('Carson', 'Expected value to change on submit.');
          expect(passwordControl.valid).toBe(true, 'Expected validation to run on submit.');
        });

      });

    });

    describe('ngModel interactions', () => {
      let warnSpy: jasmine.Spy;

      beforeEach(() => {
        // Reset `_ngModelWarningSentOnce` on `FormControlDirective` and `FormControlName` types.
        (FormControlDirective as any)._ngModelWarningSentOnce = false;
        (FormControlName as any)._ngModelWarningSentOnce = false;

        warnSpy = spyOn(console, 'warn');
      });

      describe('deprecation warnings', () => {

        it('should warn once by default when using ngModel with formControlName', fakeAsync(() => {
             const fixture = initTest(FormGroupNgModel);
             fixture.componentInstance.form =
                 new FormGroup({'login': new FormControl(''), 'password': new FormControl('')});
             fixture.detectChanges();
             tick();

             expect(warnSpy.calls.count()).toEqual(1);
             expect(warnSpy.calls.mostRecent().args[0])
                 .toMatch(
                     /It looks like you're using ngModel on the same form field as formControlName/gi);

             fixture.componentInstance.login = 'some value';
             fixture.detectChanges();
             tick();

             expect(warnSpy.calls.count()).toEqual(1);
           }));

        it('should warn once by default when using ngModel with formControl', fakeAsync(() => {
             const fixture = initTest(FormControlNgModel);
             fixture.componentInstance.control = new FormControl('');
             fixture.componentInstance.passwordControl = new FormControl('');
             fixture.detectChanges();
             tick();

             expect(warnSpy.calls.count()).toEqual(1);
             expect(warnSpy.calls.mostRecent().args[0])
                 .toMatch(
                     /It looks like you're using ngModel on the same form field as formControl/gi);

             fixture.componentInstance.login = 'some value';
             fixture.detectChanges();
             tick();

             expect(warnSpy.calls.count()).toEqual(1);
           }));

        it('should warn once for each instance when global provider is provided with "always"',
           fakeAsync(() => {
             TestBed.configureTestingModule({
               declarations: [FormControlNgModel],
               imports:
                   [ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'always'})]
             });

             const fixture = TestBed.createComponent(FormControlNgModel);
             fixture.componentInstance.control = new FormControl('');
             fixture.componentInstance.passwordControl = new FormControl('');
             fixture.detectChanges();
             tick();

             expect(warnSpy.calls.count()).toEqual(2);
             expect(warnSpy.calls.mostRecent().args[0])
                 .toMatch(
                     /It looks like you're using ngModel on the same form field as formControl/gi);
           }));

        it('should silence warnings when global provider is provided with "never"',
           fakeAsync(() => {
             TestBed.configureTestingModule({
               declarations: [FormControlNgModel],
               imports: [ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'})]
             });

             const fixture = TestBed.createComponent(FormControlNgModel);
             fixture.componentInstance.control = new FormControl('');
             fixture.componentInstance.passwordControl = new FormControl('');
             fixture.detectChanges();
             tick();

             expect(warnSpy).not.toHaveBeenCalled();
           }));

      });

      it('should support ngModel for complex forms', fakeAsync(() => {
           const fixture = initTest(FormGroupNgModel);
           fixture.componentInstance.form =
               new FormGroup({'login': new FormControl(''), 'password': new FormControl('')});
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
           const fixture = initTest(FormControlNgModel);
           fixture.componentInstance.control = new FormControl('');
           fixture.componentInstance.passwordControl = new FormControl('');
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
           if (isNode) return;
           const fixture = initTest(FormControlNgModel);
           fixture.componentInstance.control = new FormControl('');
           fixture.componentInstance.passwordControl = new FormControl('');
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

      it('should work with updateOn submit', fakeAsync(() => {
           const fixture = initTest(FormGroupNgModel);
           const formGroup = new FormGroup(
               {login: new FormControl('', {updateOn: 'submit'}), password: new FormControl('')});
           fixture.componentInstance.form = formGroup;
           fixture.componentInstance.login = 'initial';
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           input.value = 'Nancy';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           tick();

           expect(fixture.componentInstance.login)
               .toEqual('initial', 'Expected ngModel value to remain unchanged on input.');

           const form = fixture.debugElement.query(By.css('form')).nativeElement;
           dispatchEvent(form, 'submit');
           fixture.detectChanges();
           tick();

           expect(fixture.componentInstance.login)
               .toEqual('Nancy', 'Expected ngModel value to update on submit.');

         }));

    });

    describe('validations', () => {
      it('required validator should validate checkbox', () => {
        const fixture = initTest(FormControlCheckboxRequiredValidator);
        const control = new FormControl(false, Validators.requiredTrue);
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        const checkbox = fixture.debugElement.query(By.css('input'));
        expect(checkbox.nativeElement.checked).toBe(false);
        expect(control.hasError('required')).toEqual(true);

        checkbox.nativeElement.checked = true;
        dispatchEvent(checkbox.nativeElement, 'change');
        fixture.detectChanges();

        expect(checkbox.nativeElement.checked).toBe(true);
        expect(control.hasError('required')).toEqual(false);
      });

      it('should use sync validators defined in html', () => {
        const fixture = initTest(LoginIsEmptyWrapper, LoginIsEmptyValidator);
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
        const fixture = initTest(ValidationBindingsForm);
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
        const fixture = initTest(ValidationBindingsForm);
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
        fixture.componentInstance.minLen = null !;
        fixture.componentInstance.maxLen = null !;
        fixture.componentInstance.pattern = null !;
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
        const fixture = initTest(ValidationBindingsForm);
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
        fixture.componentInstance.minLen = null !;
        fixture.componentInstance.maxLen = null !;
        fixture.componentInstance.pattern = null !;
        fixture.detectChanges();

        expect(newForm.hasError('required', ['login'])).toEqual(false);
        expect(newForm.hasError('minlength', ['min'])).toEqual(false);
        expect(newForm.hasError('maxlength', ['max'])).toEqual(false);
        expect(newForm.hasError('pattern', ['pattern'])).toEqual(false);
        expect(newForm.valid).toEqual(true);
      });

      it('should use async validators defined in the html', fakeAsync(() => {
           const fixture = initTest(UniqLoginWrapper, UniqLoginValidator);
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
        const fixture = initTest(FormGroupComp);
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
           const fixture = initTest(FormGroupComp);
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

      it('async validator should not override result of sync validator', fakeAsync(() => {
           const fixture = initTest(FormGroupComp);
           const control =
               new FormControl('', Validators.required, uniqLoginAsyncValidator('expected', 100));
           fixture.componentInstance.form = new FormGroup({'login': control});
           fixture.detectChanges();
           tick();

           expect(control.hasError('required')).toEqual(true);

           const input = fixture.debugElement.query(By.css('input'));
           input.nativeElement.value = 'expected';
           dispatchEvent(input.nativeElement, 'input');

           expect(control.pending).toEqual(true);

           input.nativeElement.value = '';
           dispatchEvent(input.nativeElement, 'input');
           tick(110);

           expect(control.valid).toEqual(false);
         }));

      it('should cancel observable properly between validation runs', fakeAsync(() => {
           const fixture = initTest(FormControlComp);
           const resultArr: number[] = [];
           fixture.componentInstance.control =
               new FormControl('', null !, observableValidator(resultArr));
           fixture.detectChanges();
           tick(100);

           expect(resultArr.length).toEqual(1, `Expected source observable to emit once on init.`);

           const input = fixture.debugElement.query(By.css('input'));
           input.nativeElement.value = 'a';
           dispatchEvent(input.nativeElement, 'input');
           fixture.detectChanges();

           input.nativeElement.value = 'aa';
           dispatchEvent(input.nativeElement, 'input');
           fixture.detectChanges();

           tick(100);
           expect(resultArr.length)
               .toEqual(2, `Expected original observable to be canceled on the next value change.`);
         }));


    });

    describe('errors', () => {

      it('should throw if a form isn\'t passed into formGroup', () => {
        const fixture = initTest(FormGroupComp);

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
        const fixture = initTest(FormGroupComp);

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
        const fixture = initTest(FormGroupComp);

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
        const fixture = initTest(FormGroupComp);

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
        const fixture = initTest(FormGroupComp);

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
        const fixture = initTest(FormGroupComp);

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
        const fixture = initTest(FormGroupComp);

        expect(() => fixture.detectChanges())
            .toThrowError(
                new RegExp(`formArrayName must be used with a parent formGroup directive`));
      });

      it('should throw if ngModel is used alone under formGroup', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
         <div [formGroup]="form">
           <input type="text" [(ngModel)]="data">
         </div>
        `
          }
        });
        const fixture = initTest(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({});

        expect(() => fixture.detectChanges())
            .toThrowError(new RegExp(
                `ngModel cannot be used to register form controls with a parent formGroup directive.`));
      });

      it('should not throw if ngModel is used alone under formGroup with standalone: true', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
         <div [formGroup]="form">
            <input type="text" [(ngModel)]="data" [ngModelOptions]="{standalone: true}">
         </div>
        `
          }
        });
        const fixture = initTest(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({});

        expect(() => fixture.detectChanges()).not.toThrowError();
      });

      it('should throw if ngModel is used alone with formGroupName', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
          <div [formGroup]="form">
            <div formGroupName="person">
              <input type="text" [(ngModel)]="data">
            </div>
          </div>
        `
          }
        });
        const fixture = initTest(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({person: new FormGroup({})});

        expect(() => fixture.detectChanges())
            .toThrowError(new RegExp(
                `ngModel cannot be used to register form controls with a parent formGroupName or formArrayName directive.`));
      });

      it('should throw if ngModelGroup is used with formGroup', () => {
        TestBed.overrideComponent(FormGroupComp, {
          set: {
            template: `
          <div [formGroup]="form">
            <div ngModelGroup="person">
              <input type="text" [(ngModel)]="data">
            </div>
          </div>
        `
          }
        });
        const fixture = initTest(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({});

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
        const fixture = initTest(FormGroupComp);
        fixture.componentInstance.form = new FormGroup({'food': new FormControl('fish')});

        expect(() => fixture.detectChanges())
            .toThrowError(new RegExp('If you define both a name and a formControlName'));
      });

    });

    describe('IME events', () => {

      it('should determine IME event handling depending on platform by default', () => {
        const fixture = initTest(FormControlComp);
        fixture.componentInstance.control = new FormControl('oldValue');
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css('input'));
        const inputNativeEl = inputEl.nativeElement;
        expect(inputNativeEl.value).toEqual('oldValue');

        inputEl.triggerEventHandler('compositionstart', null);

        inputNativeEl.value = 'updatedValue';
        dispatchEvent(inputNativeEl, 'input');
        const isAndroid = /android (\d+)/.test(getDOM().getUserAgent().toLowerCase());

        if (isAndroid) {
          // On Android, values should update immediately
          expect(fixture.componentInstance.control.value).toEqual('updatedValue');
        } else {
          // On other platforms, values should wait for compositionend
          expect(fixture.componentInstance.control.value).toEqual('oldValue');

          inputEl.triggerEventHandler('compositionend', {target: {value: 'updatedValue'}});
          fixture.detectChanges();
          expect(fixture.componentInstance.control.value).toEqual('updatedValue');
        }
      });

      it('should hold IME events until compositionend if composition mode', () => {
        TestBed.overrideComponent(
            FormControlComp,
            {set: {providers: [{provide: COMPOSITION_BUFFER_MODE, useValue: true}]}});
        const fixture = initTest(FormControlComp);
        fixture.componentInstance.control = new FormControl('oldValue');
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css('input'));
        const inputNativeEl = inputEl.nativeElement;
        expect(inputNativeEl.value).toEqual('oldValue');

        inputEl.triggerEventHandler('compositionstart', null);

        inputNativeEl.value = 'updatedValue';
        dispatchEvent(inputNativeEl, 'input');

        // should not update when compositionstart
        expect(fixture.componentInstance.control.value).toEqual('oldValue');

        inputEl.triggerEventHandler('compositionend', {target: {value: 'updatedValue'}});

        fixture.detectChanges();

        // should update when compositionend
        expect(fixture.componentInstance.control.value).toEqual('updatedValue');
      });

      it('should work normally with composition events if composition mode is off', () => {
        TestBed.overrideComponent(
            FormControlComp,
            {set: {providers: [{provide: COMPOSITION_BUFFER_MODE, useValue: false}]}});
        const fixture = initTest(FormControlComp);
        fixture.componentInstance.control = new FormControl('oldValue');
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css('input'));
        const inputNativeEl = inputEl.nativeElement;
        expect(inputNativeEl.value).toEqual('oldValue');

        inputEl.triggerEventHandler('compositionstart', null);

        inputNativeEl.value = 'updatedValue';
        dispatchEvent(inputNativeEl, 'input');
        fixture.detectChanges();

        // formControl should update normally
        expect(fixture.componentInstance.control.value).toEqual('updatedValue');
      });

    });

  });
}

function uniqLoginAsyncValidator(expectedValue: string, timeout: number = 0) {
  return (c: AbstractControl) => {
    let resolve: (result: any) => void;
    const promise = new Promise(res => { resolve = res; });
    const res = (c.value == expectedValue) ? null : {'uniqLogin': true};
    setTimeout(() => resolve(res), timeout);
    return promise;
  };
}

function observableValidator(resultArr: number[]): AsyncValidatorFn {
  return (c: AbstractControl) => {
    return timer(100).pipe(tap((resp: any) => resultArr.push(resp)));
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
class UniqLoginValidator implements AsyncValidator {
  @Input('uniq-login-validator') expected: any;

  validate(c: AbstractControl) { return uniqLoginAsyncValidator(this.expected)(c); }
}

function sortedClassList(el: HTMLElement) {
  return getDOM().classList(el).sort();
}

@Component({selector: 'form-control-comp', template: `<input type="text" [formControl]="control">`})
class FormControlComp {
  // TODO(issue/24571): remove '!'.
  control !: FormControl;
}

@Component({
  selector: 'form-group-comp',
  template: `
    <form [formGroup]="form" (ngSubmit)="event=$event">
      <input type="text" formControlName="login">
    </form>`
})
class FormGroupComp {
  // TODO(issue/24571): remove '!'.
  control !: FormControl;
  // TODO(issue/24571): remove '!'.
  form !: FormGroup;
  // TODO(issue/24571): remove '!'.
  event !: Event;
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
    </form>`
})
class NestedFormGroupComp {
  // TODO(issue/24571): remove '!'.
  form !: FormGroup;
}

@Component({
  selector: 'form-array-comp',
  template: `
    <form [formGroup]="form">
      <div formArrayName="cities">
        <div *ngFor="let city of cityArray.controls; let i=index">
          <input [formControlName]="i">
        </div>
      </div>
     </form>`
})
class FormArrayComp {
  // TODO(issue/24571): remove '!'.
  form !: FormGroup;
  // TODO(issue/24571): remove '!'.
  cityArray !: FormArray;
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
     </div>`
})
class FormArrayNestedGroup {
  // TODO(issue/24571): remove '!'.
  form !: FormGroup;
  // TODO(issue/24571): remove '!'.
  cityArray !: FormArray;
}

@Component({
  selector: 'form-group-ng-model',
  template: `
  <form [formGroup]="form">
    <input type="text" formControlName="login" [(ngModel)]="login">
    <input type="text" formControlName="password" [(ngModel)]="password">
   </form>`
})
class FormGroupNgModel {
  // TODO(issue/24571): remove '!'.
  form !: FormGroup;
  // TODO(issue/24571): remove '!'.
  login !: string;
  // TODO(issue/24571): remove '!'.
  password !: string;
}

@Component({
  selector: 'form-control-ng-model',
  template: `
    <input type="text" [formControl]="control" [(ngModel)]="login">
    <input type="text" [formControl]="passwordControl" [(ngModel)]="password">
  `
})
class FormControlNgModel {
  // TODO(issue/24571): remove '!'.
  control !: FormControl;
  // TODO(issue/24571): remove '!'.
  login !: string;
  // TODO(issue/24571): remove '!'.
  passwordControl !: FormControl;
  // TODO(issue/24571): remove '!'.
  password !: string;
}

@Component({
  selector: 'login-is-empty-wrapper',
  template: `
    <div [formGroup]="form" login-is-empty-validator>
      <input type="text" formControlName="login" required>
      <input type="text" formControlName="min" minlength="3">
      <input type="text" formControlName="max" maxlength="3">
      <input type="text" formControlName="pattern" pattern=".{3,}">
   </div>`
})
class LoginIsEmptyWrapper {
  // TODO(issue/24571): remove '!'.
  form !: FormGroup;
}

@Component({
  selector: 'validation-bindings-form',
  template: `
    <div [formGroup]="form">
      <input name="required" type="text" formControlName="login" [required]="required">
      <input name="minlength" type="text" formControlName="min" [minlength]="minLen">
      <input name="maxlength" type="text" formControlName="max" [maxlength]="maxLen">
      <input name="pattern" type="text" formControlName="pattern" [pattern]="pattern">
   </div>`
})
class ValidationBindingsForm {
  // TODO(issue/24571): remove '!'.
  form !: FormGroup;
  // TODO(issue/24571): remove '!'.
  required !: boolean;
  // TODO(issue/24571): remove '!'.
  minLen !: number;
  // TODO(issue/24571): remove '!'.
  maxLen !: number;
  // TODO(issue/24571): remove '!'.
  pattern !: string;
}

@Component({
  selector: 'form-control-checkbox-validator',
  template: `<input type="checkbox" [formControl]="control">`
})
class FormControlCheckboxRequiredValidator {
  // TODO(issue/24571): remove '!'.
  control !: FormControl;
}

@Component({
  selector: 'uniq-login-wrapper',
  template: `
  <div [formGroup]="form">
    <input type="text" formControlName="login" uniq-login-validator="expected">
  </div>`
})
class UniqLoginWrapper {
  // TODO(issue/24571): remove '!'.
  form !: FormGroup;
}
