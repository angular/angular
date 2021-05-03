/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {Component, Directive, forwardRef, Input, Type, ViewChild} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {AbstractControl, AsyncValidator, COMPOSITION_BUFFER_MODE, ControlValueAccessor, FormControl, FormsModule, MaxValidator, MinValidator, NG_ASYNC_VALIDATORS, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgForm, NgModel} from '@angular/forms';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {dispatchEvent, sortedClassList} from '@angular/platform-browser/testing/src/browser_util';
import {merge} from 'rxjs';

import {NgModelCustomComp, NgModelCustomWrapper} from './value_accessor_integration_spec';

{
  describe('template-driven forms integration tests', () => {
    function initTest<T>(component: Type<T>, ...directives: Type<any>[]): ComponentFixture<T> {
      TestBed.configureTestingModule(
          {declarations: [component, ...directives], imports: [FormsModule]});
      return TestBed.createComponent(component);
    }

    describe('basic functionality', () => {
      it('should support ngModel for standalone fields', fakeAsync(() => {
           const fixture = initTest(StandaloneNgModel);
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
           const fixture = initTest(NgModelForm);
           fixture.componentInstance.name = 'Nancy';

           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.value).toEqual({name: 'Nancy'});
           expect(form.valid).toBe(false);
         }));

      it('should report properties which are written outside of template bindings', async () => {
        // For example ngModel writes to `checked` property programmatically
        // (template does not contain binding to `checked` explicitly)
        // https://github.com/angular/angular/issues/33695
        @Component({
          selector: 'app-root',
          template: `<input type="radio" value="one" [(ngModel)]="active"/>`
        })
        class AppComponent {
          active = 'one';
        }
        TestBed.configureTestingModule({imports: [FormsModule], declarations: [AppComponent]});
        const fixture = TestBed.createComponent(AppComponent);
        // We need the Await as `ngModel` writes data asynchronously into the DOM
        await fixture.detectChanges();
        const input = fixture.debugElement.query(By.css('input'));
        expect(input.properties.checked).toBe(true);
        expect(input.nativeElement.checked).toBe(true);
      });


      it('should add novalidate by default to form element', fakeAsync(() => {
           const fixture = initTest(NgModelForm);

           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.query(By.css('form'));
           expect(form.nativeElement.getAttribute('novalidate')).toEqual('');
         }));

      it('should be possible to use native validation and angular forms', fakeAsync(() => {
           const fixture = initTest(NgModelNativeValidateForm);

           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.query(By.css('form'));
           expect(form.nativeElement.hasAttribute('novalidate')).toEqual(false);
         }));

      it('should support ngModelGroup', fakeAsync(() => {
           const fixture = initTest(NgModelGroupForm);
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
           const fixture = initTest(NgModelGroupForm);
           fixture.componentInstance.first = 'Nancy';
           fixture.componentInstance.last = 'Drew';
           fixture.componentInstance.email = 'some email';

           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.control.get('name')!.value).toEqual({first: 'Nancy', last: 'Drew'});
           expect(form.control.get('name.first')!.value).toEqual('Nancy');
           expect(form.control.get('email')!.value).toEqual('some email');
         }));

      it('should remove controls and control groups from form control model', fakeAsync(() => {
           const fixture = initTest(NgModelNgIfForm);
           fixture.componentInstance.emailShowing = true;
           fixture.componentInstance.first = 'Nancy';
           fixture.componentInstance.email = 'some email';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.control.get('email')!.value).toEqual('some email');
           expect(form.value).toEqual({name: {first: 'Nancy'}, email: 'some email'});

           // should remove individual control successfully
           fixture.componentInstance.emailShowing = false;
           fixture.detectChanges();
           tick();

           expect(form.control.get('email')).toBe(null);
           expect(form.value).toEqual({name: {first: 'Nancy'}});

           expect(form.control.get('name')!.value).toEqual({first: 'Nancy'});
           expect(form.control.get('name.first')!.value).toEqual('Nancy');

           // should remove form group successfully
           fixture.componentInstance.groupShowing = false;
           fixture.detectChanges();
           tick();

           expect(form.control.get('name')).toBe(null);
           expect(form.control.get('name.first')).toBe(null);
           expect(form.value).toEqual({});
         }));

      it('should set status classes with ngModel', waitForAsync(() => {
           const fixture = initTest(NgModelForm);
           fixture.componentInstance.name = 'aa';
           fixture.detectChanges();
           fixture.whenStable().then(() => {
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
         }));

      it('should set status classes with ngModel and async validators', fakeAsync(() => {
           const fixture = initTest(NgModelAsyncValidation, NgAsyncValidator);
           fixture.whenStable().then(() => {
             fixture.detectChanges();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             expect(sortedClassList(input)).toEqual(['ng-pending', 'ng-pristine', 'ng-untouched']);

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(sortedClassList(input)).toEqual(['ng-pending', 'ng-pristine', 'ng-touched']);

             input.value = 'updatedValue';
             dispatchEvent(input, 'input');
             tick();
             fixture.detectChanges();

             expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
           });
         }));

      it('should set status classes with ngModelGroup and ngForm', waitForAsync(() => {
           const fixture = initTest(NgModelGroupForm);
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
        const fixture = initTest(NgNoFormComp);
        fixture.detectChanges();
        expect(fixture.debugElement.children[0].providerTokens!.length).toEqual(0);
      });

      it('should not add novalidate when ngNoForm is used', () => {
        const fixture = initTest(NgNoFormComp);
        fixture.detectChanges();
        const form = fixture.debugElement.query(By.css('form'));
        expect(form.nativeElement.hasAttribute('novalidate')).toEqual(false);
      });
    });

    describe('name and ngModelOptions', () => {
      it('should throw if ngModel has a parent form but no name attr or standalone label', () => {
        const fixture = initTest(InvalidNgModelNoName);
        expect(() => fixture.detectChanges())
            .toThrowError(new RegExp(`name attribute must be set`));
      });

      it('should not throw if ngModel has a parent form, no name attr, and a standalone label',
         () => {
           const fixture = initTest(NgModelOptionsStandalone);
           expect(() => fixture.detectChanges()).not.toThrow();
         });

      it('should not register standalone ngModels with parent form', fakeAsync(() => {
           const fixture = initTest(NgModelOptionsStandalone);
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
           const fixture = initTest(NgModelForm);
           fixture.componentInstance.options = {name: 'override'};
           fixture.componentInstance.name = 'some data';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.value).toEqual({override: 'some data'});
         }));
    });

    describe('updateOn', () => {
      describe('blur', () => {
        it('should default updateOn to change', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = '';
             fixture.componentInstance.options = {};
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             const name = form.control.get('name') as FormControl;
             expect((name as any)._updateOn).toBeUndefined();
             expect(name.updateOn).toEqual('change');
           }));


        it('should set control updateOn to blur properly', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = '';
             fixture.componentInstance.options = {updateOn: 'blur'};
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             const name = form.control.get('name') as FormControl;
             expect((name as any)._updateOn).toEqual('blur');
             expect(name.updateOn).toEqual('blur');
           }));

        it('should always set value and validity on init', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = 'Nancy Drew';
             fixture.componentInstance.options = {updateOn: 'blur'};
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(input.value).toEqual('Nancy Drew', 'Expected initial view value to be set.');
             expect(form.value)
                 .toEqual({name: 'Nancy Drew'}, 'Expected initial control value be set.');
             expect(form.valid).toBe(true, 'Expected validation to run on initial value.');
           }));

        it('should always set value programmatically right away', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = 'Nancy Drew';
             fixture.componentInstance.options = {updateOn: 'blur'};
             fixture.detectChanges();
             tick();

             fixture.componentInstance.name = 'Carson';
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(input.value)
                 .toEqual('Carson', 'Expected view value to update on programmatic change.');
             expect(form.value)
                 .toEqual(
                     {name: 'Carson'}, 'Expected form value to update on programmatic change.');
             expect(form.valid)
                 .toBe(false, 'Expected validation to run immediately on programmatic change.');
           }));

        it('should update value/validity on blur', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = 'Carson';
             fixture.componentInstance.options = {updateOn: 'blur'};
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Nancy Drew';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(fixture.componentInstance.name)
                 .toEqual('Carson', 'Expected value not to update on input.');
             expect(form.valid).toBe(false, 'Expected validation not to run on input.');

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(fixture.componentInstance.name)
                 .toEqual('Nancy Drew', 'Expected value to update on blur.');
             expect(form.valid).toBe(true, 'Expected validation to run on blur.');
           }));

        it('should wait for second blur to update value/validity again', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = 'Carson';
             fixture.componentInstance.options = {updateOn: 'blur'};
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Nancy Drew';
             dispatchEvent(input, 'input');
             fixture.detectChanges();

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             input.value = 'Carson';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(fixture.componentInstance.name)
                 .toEqual('Nancy Drew', 'Expected value not to update until another blur.');
             expect(form.valid).toBe(true, 'Expected validation not to run until another blur.');

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(fixture.componentInstance.name)
                 .toEqual('Carson', 'Expected value to update on second blur.');
             expect(form.valid).toBe(false, 'Expected validation to run on second blur.');
           }));

        it('should not update dirtiness until blur', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = '';
             fixture.componentInstance.options = {updateOn: 'blur'};
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Nancy Drew';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(form.dirty).toBe(false, 'Expected dirtiness not to update on input.');

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(form.dirty).toBe(true, 'Expected dirtiness to update on blur.');
           }));

        it('should not update touched until blur', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = '';
             fixture.componentInstance.options = {updateOn: 'blur'};
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Nancy Drew';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(form.touched).toBe(false, 'Expected touched not to update on input.');

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(form.touched).toBe(true, 'Expected touched to update on blur.');
           }));

        it('should not emit valueChanges or statusChanges until blur', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = '';
             fixture.componentInstance.options = {updateOn: 'blur'};
             fixture.detectChanges();
             tick();

             const values: any[] = [];
             const form = fixture.debugElement.children[0].injector.get(NgForm);

             const sub =
                 merge(form.valueChanges!, form.statusChanges!).subscribe(val => values.push(val));

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Nancy Drew';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             expect(values).toEqual([], 'Expected no valueChanges or statusChanges on input.');

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(values).toEqual(
                 [{name: 'Nancy Drew'}, 'VALID'],
                 'Expected valueChanges and statusChanges on blur.');

             sub.unsubscribe();
           }));

        it('should not fire ngModelChange event on blur unless value has changed', fakeAsync(() => {
             const fixture = initTest(NgModelChangesForm);
             fixture.componentInstance.name = 'Carson';
             fixture.componentInstance.options = {updateOn: 'blur'};
             fixture.detectChanges();
             tick();

             expect(fixture.componentInstance.events)
                 .toEqual([], 'Expected ngModelChanges not to fire.');

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(fixture.componentInstance.events)
                 .toEqual([], 'Expected ngModelChanges not to fire if value unchanged.');

             input.value = 'Carson';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             expect(fixture.componentInstance.events)
                 .toEqual([], 'Expected ngModelChanges not to fire on input.');

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(fixture.componentInstance.events)
                 .toEqual(
                     ['fired'], 'Expected ngModelChanges to fire once blurred if value changed.');

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(fixture.componentInstance.events)
                 .toEqual(
                     ['fired'],
                     'Expected ngModelChanges not to fire again on blur unless value changed.');

             input.value = 'Bess';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             expect(fixture.componentInstance.events)
                 .toEqual(['fired'], 'Expected ngModelChanges not to fire on input after blur.');

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(fixture.componentInstance.events)
                 .toEqual(
                     ['fired', 'fired'],
                     'Expected ngModelChanges to fire again on blur if value changed.');
           }));
      });

      describe('submit', () => {
        it('should set control updateOn to submit properly', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = '';
             fixture.componentInstance.options = {updateOn: 'submit'};
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             const name = form.control.get('name') as FormControl;
             expect((name as any)._updateOn).toEqual('submit');
             expect(name.updateOn).toEqual('submit');
           }));

        it('should always set value and validity on init', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = 'Nancy Drew';
             fixture.componentInstance.options = {updateOn: 'submit'};
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(input.value).toEqual('Nancy Drew', 'Expected initial view value to be set.');
             expect(form.value)
                 .toEqual({name: 'Nancy Drew'}, 'Expected initial control value be set.');
             expect(form.valid).toBe(true, 'Expected validation to run on initial value.');
           }));

        it('should always set value programmatically right away', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = 'Nancy Drew';
             fixture.componentInstance.options = {updateOn: 'submit'};
             fixture.detectChanges();
             tick();

             fixture.componentInstance.name = 'Carson';
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(input.value)
                 .toEqual('Carson', 'Expected view value to update on programmatic change.');
             expect(form.value)
                 .toEqual(
                     {name: 'Carson'}, 'Expected form value to update on programmatic change.');
             expect(form.valid)
                 .toBe(false, 'Expected validation to run immediately on programmatic change.');
           }));


        it('should update on submit', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = 'Carson';
             fixture.componentInstance.options = {updateOn: 'submit'};
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Nancy Drew';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(fixture.componentInstance.name)
                 .toEqual('Carson', 'Expected value not to update on input.');
             expect(form.valid).toBe(false, 'Expected validation not to run on input.');

             dispatchEvent(input, 'blur');
             fixture.detectChanges();
             tick();

             expect(fixture.componentInstance.name)
                 .toEqual('Carson', 'Expected value not to update on blur.');
             expect(form.valid).toBe(false, 'Expected validation not to run on blur.');

             const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
             dispatchEvent(formEl, 'submit');
             fixture.detectChanges();

             expect(fixture.componentInstance.name)
                 .toEqual('Nancy Drew', 'Expected value to update on submit.');
             expect(form.valid).toBe(true, 'Expected validation to run on submit.');
           }));

        it('should wait until second submit to update again', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = 'Carson';
             fixture.componentInstance.options = {updateOn: 'submit'};
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Nancy Drew';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
             dispatchEvent(formEl, 'submit');
             fixture.detectChanges();
             tick();

             input.value = 'Carson';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(fixture.componentInstance.name)
                 .toEqual('Nancy Drew', 'Expected value not to update until second submit.');
             expect(form.valid).toBe(true, 'Expected validation not to run until second submit.');

             dispatchEvent(formEl, 'submit');
             fixture.detectChanges();
             tick();

             expect(fixture.componentInstance.name)
                 .toEqual('Carson', 'Expected value to update on second submit.');
             expect(form.valid).toBe(false, 'Expected validation to run on second submit.');
           }));

        it('should not run validation for onChange controls on submit', fakeAsync(() => {
             const validatorSpy = jasmine.createSpy('validator');
             const groupValidatorSpy = jasmine.createSpy('groupValidatorSpy');

             const fixture = initTest(NgModelGroupForm);
             fixture.componentInstance.options = {updateOn: 'submit'};
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             form.control.get('name')!.setValidators(groupValidatorSpy);
             form.control.get('name.last')!.setValidators(validatorSpy);

             const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
             dispatchEvent(formEl, 'submit');
             fixture.detectChanges();

             expect(validatorSpy).not.toHaveBeenCalled();
             expect(groupValidatorSpy).not.toHaveBeenCalled();
           }));

        it('should not update dirtiness until submit', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = '';
             fixture.componentInstance.options = {updateOn: 'submit'};
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Nancy Drew';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(form.dirty).toBe(false, 'Expected dirtiness not to update on input.');

             dispatchEvent(input, 'blur');
             fixture.detectChanges();
             tick();

             expect(form.dirty).toBe(false, 'Expected dirtiness not to update on blur.');

             const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
             dispatchEvent(formEl, 'submit');
             fixture.detectChanges();

             expect(form.dirty).toBe(true, 'Expected dirtiness to update on submit.');
           }));

        it('should not update touched until submit', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = '';
             fixture.componentInstance.options = {updateOn: 'submit'};
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Nancy Drew';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             dispatchEvent(input, 'blur');
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(form.touched).toBe(false, 'Expected touched not to update on blur.');

             const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
             dispatchEvent(formEl, 'submit');
             fixture.detectChanges();

             expect(form.touched).toBe(true, 'Expected touched to update on submit.');
           }));

        it('should reset properly', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = 'Nancy' as string | null;
             fixture.componentInstance.options = {updateOn: 'submit'};
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Nancy Drew';
             dispatchEvent(input, 'input');
             fixture.detectChanges();

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             form.resetForm();
             fixture.detectChanges();
             tick();

             expect(input.value).toEqual('', 'Expected view value to reset.');
             expect(form.value).toEqual({name: null}, 'Expected form value to reset.');
             expect(fixture.componentInstance.name)
                 .toEqual(null, 'Expected ngModel value to reset.');
             expect(form.dirty).toBe(false, 'Expected dirty to stay false on reset.');
             expect(form.touched).toBe(false, 'Expected touched to stay false on reset.');

             const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
             dispatchEvent(formEl, 'submit');
             fixture.detectChanges();

             expect(form.value)
                 .toEqual({name: null}, 'Expected form value to stay empty on submit');
             expect(fixture.componentInstance.name)
                 .toEqual(null, 'Expected ngModel value to stay empty on submit.');
             expect(form.dirty).toBe(false, 'Expected dirty to stay false on submit.');
             expect(form.touched).toBe(false, 'Expected touched to stay false on submit.');
           }));

        it('should not emit valueChanges or statusChanges until submit', fakeAsync(() => {
             const fixture = initTest(NgModelForm);
             fixture.componentInstance.name = '';
             fixture.componentInstance.options = {updateOn: 'submit'};
             fixture.detectChanges();
             tick();

             const values: any[] = [];
             const form = fixture.debugElement.children[0].injector.get(NgForm);

             const sub =
                 merge(form.valueChanges!, form.statusChanges!).subscribe(val => values.push(val));

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Nancy Drew';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             expect(values).toEqual([], 'Expected no valueChanges or statusChanges on input.');

             dispatchEvent(input, 'blur');
             fixture.detectChanges();
             tick();

             expect(values).toEqual([], 'Expected no valueChanges or statusChanges on blur.');

             const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
             dispatchEvent(formEl, 'submit');
             fixture.detectChanges();

             expect(values).toEqual(
                 [{name: 'Nancy Drew'}, 'VALID'],
                 'Expected valueChanges and statusChanges on submit.');
             sub.unsubscribe();
           }));

        it('should not fire ngModelChange event on submit unless value has changed',
           fakeAsync(() => {
             const fixture = initTest(NgModelChangesForm);
             fixture.componentInstance.name = 'Carson';
             fixture.componentInstance.options = {updateOn: 'submit'};
             fixture.detectChanges();
             tick();

             const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
             dispatchEvent(formEl, 'submit');
             fixture.detectChanges();

             expect(fixture.componentInstance.events)
                 .toEqual([], 'Expected ngModelChanges not to fire if value unchanged.');

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Carson';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             expect(fixture.componentInstance.events)
                 .toEqual([], 'Expected ngModelChanges not to fire on input.');

             dispatchEvent(formEl, 'submit');
             fixture.detectChanges();

             expect(fixture.componentInstance.events)
                 .toEqual(
                     ['fired'], 'Expected ngModelChanges to fire once submitted if value changed.');

             dispatchEvent(formEl, 'submit');
             fixture.detectChanges();

             expect(fixture.componentInstance.events)
                 .toEqual(
                     ['fired'],
                     'Expected ngModelChanges not to fire again on submit unless value changed.');

             input.value = 'Bess';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             expect(fixture.componentInstance.events)
                 .toEqual(['fired'], 'Expected ngModelChanges not to fire on input after submit.');

             dispatchEvent(formEl, 'submit');
             fixture.detectChanges();

             expect(fixture.componentInstance.events)
                 .toEqual(
                     ['fired', 'fired'],
                     'Expected ngModelChanges to fire again on submit if value changed.');
           }));
      });

      describe('ngFormOptions', () => {
        it('should use ngFormOptions value when ngModelOptions are not set', fakeAsync(() => {
             const fixture = initTest(NgModelOptionsStandalone);
             fixture.componentInstance.options = {name: 'two'};
             fixture.componentInstance.formOptions = {updateOn: 'blur'};
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             const controlOne = form.control.get('one')! as FormControl;
             expect((controlOne as any)._updateOn).toBeUndefined();
             expect(controlOne.updateOn)
                 .toEqual('blur', 'Expected first control to inherit updateOn from parent form.');

             const controlTwo = form.control.get('two')! as FormControl;
             expect((controlTwo as any)._updateOn).toBeUndefined();
             expect(controlTwo.updateOn)
                 .toEqual('blur', 'Expected last control to inherit updateOn from parent form.');
           }));

        it('should actually update using ngFormOptions value', fakeAsync(() => {
             const fixture = initTest(NgModelOptionsStandalone);
             fixture.componentInstance.one = '';
             fixture.componentInstance.formOptions = {updateOn: 'blur'};
             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             input.value = 'Nancy Drew';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(form.value).toEqual({one: ''}, 'Expected value not to update on input.');

             dispatchEvent(input, 'blur');
             fixture.detectChanges();

             expect(form.value).toEqual({one: 'Nancy Drew'}, 'Expected value to update on blur.');
           }));

        it('should allow ngModelOptions updateOn to override ngFormOptions', fakeAsync(() => {
             const fixture = initTest(NgModelOptionsStandalone);
             fixture.componentInstance.options = {updateOn: 'blur', name: 'two'};
             fixture.componentInstance.formOptions = {updateOn: 'change'};
             fixture.detectChanges();
             tick();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             const controlOne = form.control.get('one')! as FormControl;
             expect((controlOne as any)._updateOn).toBeUndefined();
             expect(controlOne.updateOn)
                 .toEqual('change', 'Expected control updateOn to inherit form updateOn.');

             const controlTwo = form.control.get('two')! as FormControl;
             expect((controlTwo as any)._updateOn)
                 .toEqual('blur', 'Expected control to set blur override.');
             expect(controlTwo.updateOn)
                 .toEqual('blur', 'Expected control updateOn to override form updateOn.');
           }));

        it('should update using ngModelOptions override', fakeAsync(() => {
             const fixture = initTest(NgModelOptionsStandalone);
             fixture.componentInstance.one = '';
             fixture.componentInstance.two = '';
             fixture.componentInstance.options = {updateOn: 'blur', name: 'two'};
             fixture.componentInstance.formOptions = {updateOn: 'change'};
             fixture.detectChanges();
             tick();

             const [inputOne, inputTwo] = fixture.debugElement.queryAll(By.css('input'));
             inputOne.nativeElement.value = 'Nancy Drew';
             dispatchEvent(inputOne.nativeElement, 'input');
             fixture.detectChanges();

             const form = fixture.debugElement.children[0].injector.get(NgForm);
             expect(form.value)
                 .toEqual({one: 'Nancy Drew', two: ''}, 'Expected first value to update on input.');

             inputTwo.nativeElement.value = 'Carson Drew';
             dispatchEvent(inputTwo.nativeElement, 'input');
             fixture.detectChanges();
             tick();

             expect(form.value)
                 .toEqual(
                     {one: 'Nancy Drew', two: ''}, 'Expected second value not to update on input.');

             dispatchEvent(inputTwo.nativeElement, 'blur');
             fixture.detectChanges();

             expect(form.value)
                 .toEqual(
                     {one: 'Nancy Drew', two: 'Carson Drew'},
                     'Expected second value to update on blur.');
           }));

        it('should not use ngFormOptions for standalone ngModels', fakeAsync(() => {
             const fixture = initTest(NgModelOptionsStandalone);
             fixture.componentInstance.two = '';
             fixture.componentInstance.options = {standalone: true};
             fixture.componentInstance.formOptions = {updateOn: 'blur'};
             fixture.detectChanges();
             tick();

             const inputTwo = fixture.debugElement.queryAll(By.css('input'))[1].nativeElement;
             inputTwo.value = 'Nancy Drew';
             dispatchEvent(inputTwo, 'input');
             fixture.detectChanges();

             expect(fixture.componentInstance.two)
                 .toEqual('Nancy Drew', 'Expected standalone ngModel not to inherit blur update.');
           }));
      });
    });

    describe('submit and reset events', () => {
      it('should emit ngSubmit event with the original submit event on submit', fakeAsync(() => {
           const fixture = initTest(NgModelForm);
           fixture.componentInstance.event = null!;

           const form = fixture.debugElement.query(By.css('form'));
           dispatchEvent(form.nativeElement, 'submit');
           tick();

           expect(fixture.componentInstance.event.type).toEqual('submit');
         }));

      it('should mark NgForm as submitted on submit event', fakeAsync(() => {
           const fixture = initTest(NgModelForm);

           tick();
           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.submitted).toBe(false);

           const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
           dispatchEvent(formEl, 'submit');
           tick();

           expect(form.submitted).toBe(true);
         }));

      it('should reset the form to empty when reset event is fired', fakeAsync(() => {
           const fixture = initTest(NgModelForm);
           fixture.componentInstance.name = 'should be cleared' as string | null;
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
           const fixture = initTest(NgModelForm);
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
           const fixture = initTest(NgModelForm);
           const form = fixture.debugElement.children[0].injector.get(NgForm);
           fixture.componentInstance.name = 'aa';
           fixture.detectChanges();

           expect(form.valid).toEqual(true);
           expect(form.value).toEqual({});

           let formValidity: string = undefined!;
           let formValue: Object = undefined!;

           form.statusChanges!.subscribe((status: string) => formValidity = status);
           form.valueChanges!.subscribe((value: string) => formValue = value);

           tick();

           expect(formValidity).toEqual('INVALID');
           expect(formValue).toEqual({name: 'aa'});
         }));

      it('should mark controls dirty before emitting the value change event', fakeAsync(() => {
           const fixture = initTest(NgModelForm);
           const form = fixture.debugElement.children[0].injector.get(NgForm).form;

           fixture.detectChanges();
           tick();

           form.get('name')!.valueChanges.subscribe(() => {
             expect(form.get('name')!.dirty).toBe(true);
           });

           const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
           inputEl.value = 'newValue';

           dispatchEvent(inputEl, 'input');
         }));

      it('should mark controls pristine before emitting the value change event when resetting ',
         fakeAsync(() => {
           const fixture = initTest(NgModelForm);
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm).form;
           const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
           const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

           inputEl.value = 'newValue';
           dispatchEvent(inputEl, 'input');

           expect(form.get('name')!.pristine).toBe(false);

           form.get('name')!.valueChanges.subscribe(() => {
             expect(form.get('name')!.pristine).toBe(true);
           });

           dispatchEvent(formEl, 'reset');
         }));
    });

    describe('disabled controls', () => {
      it('should not consider disabled controls in value or validation', fakeAsync(() => {
           const fixture = initTest(NgModelGroupForm);
           fixture.componentInstance.isDisabled = false;
           fixture.componentInstance.first = '';
           fixture.componentInstance.last = 'Drew';
           fixture.componentInstance.email = 'some email';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.value).toEqual({name: {first: '', last: 'Drew'}, email: 'some email'});
           expect(form.valid).toBe(false);
           expect(form.control.get('name.first')!.disabled).toBe(false);

           fixture.componentInstance.isDisabled = true;
           fixture.detectChanges();
           tick();

           expect(form.value).toEqual({name: {last: 'Drew'}, email: 'some email'});
           expect(form.valid).toBe(true);
           expect(form.control.get('name.first')!.disabled).toBe(true);
         }));

      it('should add disabled attribute in the UI if disable() is called programmatically',
         fakeAsync(() => {
           const fixture = initTest(NgModelGroupForm);
           fixture.componentInstance.isDisabled = false;
           fixture.componentInstance.first = 'Nancy';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           form.control.get('name.first')!.disable();
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css(`[name="first"]`));
           expect(input.nativeElement.disabled).toBe(true);
         }));

      it('should disable a custom control if disabled attr is added', waitForAsync(() => {
           const fixture = initTest(NgModelCustomWrapper, NgModelCustomComp);
           fixture.componentInstance.name = 'Nancy';
           fixture.componentInstance.isDisabled = true;
           fixture.detectChanges();
           fixture.whenStable().then(() => {
             fixture.detectChanges();
             fixture.whenStable().then(() => {
               const form = fixture.debugElement.children[0].injector.get(NgForm);
               expect(form.control.get('name')!.disabled).toBe(true);

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
           const fixture = initTest(NgModelForm);
           fixture.detectChanges();
           tick();
           const form = fixture.debugElement.children[0].injector.get(NgForm);
           expect(form.control.get('name')!.disabled).toBe(true);

           const input = fixture.debugElement.query(By.css('input'));
           expect(input.nativeElement.disabled).toEqual(true);

           form.control.enable();
           fixture.detectChanges();
           tick();
           expect(input.nativeElement.disabled).toEqual(false);
         }));
    });

    describe('validation directives', () => {
      it('required validator should validate checkbox', fakeAsync(() => {
           const fixture = initTest(NgModelCheckboxRequiredValidator);
           fixture.detectChanges();
           tick();

           const control =
               fixture.debugElement.children[0].injector.get(NgForm).control.get('checkbox')!;

           const input = fixture.debugElement.query(By.css('input'));
           expect(input.nativeElement.checked).toBe(false);
           expect(control.hasError('required')).toBe(false);

           fixture.componentInstance.required = true;
           fixture.detectChanges();
           tick();

           expect(input.nativeElement.checked).toBe(false);
           expect(control.hasError('required')).toBe(true);

           input.nativeElement.checked = true;
           dispatchEvent(input.nativeElement, 'change');
           fixture.detectChanges();
           tick();

           expect(input.nativeElement.checked).toBe(true);
           expect(control.hasError('required')).toBe(false);

           input.nativeElement.checked = false;
           dispatchEvent(input.nativeElement, 'change');
           fixture.detectChanges();
           tick();

           expect(input.nativeElement.checked).toBe(false);
           expect(control.hasError('required')).toBe(true);
         }));

      it('should validate email', fakeAsync(() => {
           const fixture = initTest(NgModelEmailValidator);
           fixture.detectChanges();
           tick();

           const control =
               fixture.debugElement.children[0].injector.get(NgForm).control.get('email')!;

           const input = fixture.debugElement.query(By.css('input'));
           expect(control.hasError('email')).toBe(false);

           fixture.componentInstance.validatorEnabled = true;
           fixture.detectChanges();
           tick();

           expect(input.nativeElement.value).toEqual('');
           expect(control.hasError('email')).toBe(false);

           input.nativeElement.value = '@';
           dispatchEvent(input.nativeElement, 'input');
           tick();

           expect(input.nativeElement.value).toEqual('@');
           expect(control.hasError('email')).toBe(true);

           input.nativeElement.value = 'test@gmail.com';
           dispatchEvent(input.nativeElement, 'input');
           fixture.detectChanges();
           tick();

           expect(input.nativeElement.value).toEqual('test@gmail.com');
           expect(control.hasError('email')).toBe(false);

           input.nativeElement.value = 'text';
           dispatchEvent(input.nativeElement, 'input');
           fixture.detectChanges();
           tick();

           expect(input.nativeElement.value).toEqual('text');
           expect(control.hasError('email')).toBe(true);
         }));

      it('should support dir validators using bindings', fakeAsync(() => {
           const fixture = initTest(NgModelValidationBindings);
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

      it('should support optional fields with string pattern validator', fakeAsync(() => {
           const fixture = initTest(NgModelMultipleValidators);
           fixture.componentInstance.required = false;
           fixture.componentInstance.pattern = '[a-z]+';
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           const input = fixture.debugElement.query(By.css('input'));

           input.nativeElement.value = '';
           dispatchEvent(input.nativeElement, 'input');
           fixture.detectChanges();
           expect(form.valid).toBeTruthy();

           input.nativeElement.value = '1';
           dispatchEvent(input.nativeElement, 'input');
           fixture.detectChanges();
           expect(form.valid).toBeFalsy();
           expect(form.control.hasError('pattern', ['tovalidate'])).toBeTruthy();
         }));

      it('should support optional fields with RegExp pattern validator', fakeAsync(() => {
           const fixture = initTest(NgModelMultipleValidators);
           fixture.componentInstance.required = false;
           fixture.componentInstance.pattern = /^[a-z]+$/;
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           const input = fixture.debugElement.query(By.css('input'));

           input.nativeElement.value = '';
           dispatchEvent(input.nativeElement, 'input');
           fixture.detectChanges();
           expect(form.valid).toBeTruthy();

           input.nativeElement.value = '1';
           dispatchEvent(input.nativeElement, 'input');
           fixture.detectChanges();
           expect(form.valid).toBeFalsy();
           expect(form.control.hasError('pattern', ['tovalidate'])).toBeTruthy();
         }));

      it('should support optional fields with minlength validator', fakeAsync(() => {
           const fixture = initTest(NgModelMultipleValidators);
           fixture.componentInstance.required = false;
           fixture.componentInstance.minLen = 2;
           fixture.detectChanges();
           tick();

           const form = fixture.debugElement.children[0].injector.get(NgForm);
           const input = fixture.debugElement.query(By.css('input'));

           input.nativeElement.value = '';
           dispatchEvent(input.nativeElement, 'input');
           fixture.detectChanges();
           expect(form.valid).toBeTruthy();

           input.nativeElement.value = '1';
           dispatchEvent(input.nativeElement, 'input');
           fixture.detectChanges();
           expect(form.valid).toBeFalsy();
           expect(form.control.hasError('minlength', ['tovalidate'])).toBeTruthy();
         }));

      it('changes on bound properties should change the validation state of the form',
         fakeAsync(() => {
           const fixture = initTest(NgModelValidationBindings);
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
           fixture.componentInstance.minLen = null!;
           fixture.componentInstance.maxLen = null!;
           fixture.componentInstance.pattern = null!;
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

      it('should update control status', fakeAsync(() => {
           const fixture = initTest(NgModelChangeState);
           const inputEl = fixture.debugElement.query(By.css('input'));
           const inputNativeEl = inputEl.nativeElement;
           const onNgModelChange = jasmine.createSpy('onNgModelChange');
           fixture.componentInstance.onNgModelChange = onNgModelChange;
           fixture.detectChanges();
           tick();

           expect(onNgModelChange).not.toHaveBeenCalled();

           inputNativeEl.value = 'updated';
           onNgModelChange.and.callFake((ngModel: NgModel) => {
             expect(ngModel.invalid).toBe(true);
             expect(ngModel.value).toBe('updated');
           });
           dispatchEvent(inputNativeEl, 'input');
           expect(onNgModelChange).toHaveBeenCalled();
           tick();

           inputNativeEl.value = '333';
           onNgModelChange.and.callFake((ngModel: NgModel) => {
             expect(ngModel.invalid).toBe(false);
             expect(ngModel.value).toBe('333');
           });
           dispatchEvent(inputNativeEl, 'input');
           expect(onNgModelChange).toHaveBeenCalledTimes(2);
           tick();
         }));

      it('should validate max', fakeAsync(() => {
           const fixture = initTest(NgModelMaxValidator);
           fixture.componentInstance.max = 10;
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           const form = fixture.debugElement.children[0].injector.get(NgForm);

           input.value = '';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.max.errors).toBeNull();

           input.value = 11;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.max.errors).toEqual({max: {max: 10, actual: 11}});

           input.value = 9;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.max.errors).toBeNull();
         }));

      it('should apply max validation when control value is defined as a string', fakeAsync(() => {
           const fixture = initTest(NgModelMaxValidator);
           fixture.componentInstance.max = 10;
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           const form = fixture.debugElement.children[0].injector.get(NgForm);

           input.value = '11';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.max.errors).toEqual({max: {max: 10, actual: 11}});

           input.value = '9';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.max.errors).toBeNull();
         }));

      it('should re-validate if max changes', fakeAsync(() => {
           const fixture = initTest(NgModelMaxValidator);
           fixture.componentInstance.max = 10;
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           const form = fixture.debugElement.children[0].injector.get(NgForm);

           input.value = 11;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.max.errors).toEqual({max: {max: 10, actual: 11}});

           input.value = 9;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.max.errors).toBeNull();

           fixture.componentInstance.max = 5;
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.max.errors).toEqual({max: {max: 5, actual: 9}});
         }));

      it('should validate min', fakeAsync(() => {
           const fixture = initTest(NgModelMinValidator);
           fixture.componentInstance.min = 10;
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           const form = fixture.debugElement.children[0].injector.get(NgForm);

           input.value = '';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min.errors).toBeNull();

           input.value = 11;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min.errors).toBeNull();

           input.value = 9;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.min.errors).toEqual({min: {min: 10, actual: 9}});
         }));

      it('should apply min validation when control value is defined as a string', fakeAsync(() => {
           const fixture = initTest(NgModelMinValidator);
           fixture.componentInstance.min = 10;
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           const form = fixture.debugElement.children[0].injector.get(NgForm);

           input.value = '11';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min.errors).toBeNull();

           input.value = '9';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.min.errors).toEqual({min: {min: 10, actual: 9}});
         }));

      it('should re-validate if min changes', fakeAsync(() => {
           const fixture = initTest(NgModelMinValidator);
           fixture.componentInstance.min = 10;
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           const form = fixture.debugElement.children[0].injector.get(NgForm);

           input.value = 11;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min.errors).toBeNull();

           input.value = 9;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.min.errors).toEqual({min: {min: 10, actual: 9}});

           fixture.componentInstance.min = 9;
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min.errors).toBeNull();
         }));

      it('should not include the min and max validators when using another directive with the same properties',
         fakeAsync(() => {
           const fixture = initTest(NgModelNoMinMaxValidator);
           const validateFnSpy = spyOn(MaxValidator.prototype, 'validate');

           fixture.componentInstance.min = 10;
           fixture.componentInstance.max = 20;
           fixture.detectChanges();
           tick();

           const min = fixture.debugElement.query(By.directive(MinValidator));
           expect(min).toBeNull();

           const max = fixture.debugElement.query(By.directive(MaxValidator));
           expect(max).toBeNull();

           const cd = fixture.debugElement.query(By.directive(CustomDirective));
           expect(cd).toBeDefined();

           expect(validateFnSpy).not.toHaveBeenCalled();
         }));

      it('should not include the min and max validators when using a custom component with the same properties',
         fakeAsync(() => {
           @Directive({
             selector: 'my-custom-component',
             providers: [{
               provide: NG_VALUE_ACCESSOR,
               multi: true,
               useExisting: forwardRef(() => MyCustomComponentDirective),
             }]
           })
           class MyCustomComponentDirective implements ControlValueAccessor {
             @Input() min!: number;
             @Input() max!: number;

             writeValue(obj: any): void {}
             registerOnChange(fn: any): void {}
             registerOnTouched(fn: any): void {}
           }

           @Component({
             template: `
              <!-- no min/max validators should be matched on these elements -->
              <my-custom-component name="min" ngModel [min]="min"></my-custom-component>
              <my-custom-component name="max" ngModel [max]="max"></my-custom-component>
            `
           })
           class AppComponent {
           }

           const fixture = initTest(AppComponent, MyCustomComponentDirective);
           const validateFnSpy = spyOn(MaxValidator.prototype, 'validate');

           fixture.detectChanges();
           tick();

           const mv = fixture.debugElement.query(By.directive(MaxValidator));
           expect(mv).toBeNull();

           const cd = fixture.debugElement.query(By.directive(CustomDirective));
           expect(cd).toBeDefined();

           expect(validateFnSpy).not.toHaveBeenCalled();
         }));

      it('should not include the min and max validators for inputs with type range',
         fakeAsync(() => {
           @Component({template: '<input type="range" min="10" max="20">'})
           class AppComponent {
           }

           const fixture = initTest(AppComponent);
           const maxValidateFnSpy = spyOn(MaxValidator.prototype, 'validate');
           const minValidateFnSpy = spyOn(MinValidator.prototype, 'validate');

           fixture.detectChanges();
           tick();

           const maxValidator = fixture.debugElement.query(By.directive(MaxValidator));
           expect(maxValidator).toBeNull();

           const minValidator = fixture.debugElement.query(By.directive(MinValidator));
           expect(minValidator).toBeNull();

           expect(maxValidateFnSpy).not.toHaveBeenCalled();
           expect(minValidateFnSpy).not.toHaveBeenCalled();
         }));

      ['number', 'string'].forEach((inputType: string) => {
        it(`should validate min and max when constraints are represented using a ${inputType}`,
           fakeAsync(() => {
             const fixture = initTest(NgModelMinMaxValidator);

             fixture.componentInstance.min = inputType === 'string' ? '5' : 5;
             fixture.componentInstance.max = inputType === 'string' ? '10' : 10;

             fixture.detectChanges();
             tick();

             const input = fixture.debugElement.query(By.css('input')).nativeElement;
             const form = fixture.debugElement.children[0].injector.get(NgForm);

             input.value = '';
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             expect(form.valid).toEqual(true);
             expect(form.controls.min_max.errors).toBeNull();

             input.value = 11;
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             expect(form.valid).toEqual(false);
             expect(form.controls.min_max.errors).toEqual({max: {max: 10, actual: 11}});

             input.value = 4;
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             expect(form.valid).toEqual(false);
             expect(form.controls.min_max.errors).toEqual({min: {min: 5, actual: 4}});

             input.value = 9;
             dispatchEvent(input, 'input');
             fixture.detectChanges();
             expect(form.valid).toEqual(true);
             expect(form.controls.min_max.errors).toBeNull();
           }));
      });
      it('should validate min and max', fakeAsync(() => {
           const fixture = initTest(NgModelMinMaxValidator);
           fixture.componentInstance.min = 5;
           fixture.componentInstance.max = 10;
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           const form = fixture.debugElement.children[0].injector.get(NgForm);

           input.value = '';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min_max.errors).toBeNull();

           input.value = 11;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.min_max.errors).toEqual({max: {max: 10, actual: 11}});

           input.value = 4;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.min_max.errors).toEqual({min: {min: 5, actual: 4}});

           input.value = 9;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min_max.errors).toBeNull();
         }));

      it('should apply min and max validation when control value is defined as a string',
         fakeAsync(() => {
           const fixture = initTest(NgModelMinMaxValidator);
           fixture.componentInstance.min = 5;
           fixture.componentInstance.max = 10;
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           const form = fixture.debugElement.children[0].injector.get(NgForm);

           input.value = '';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min_max.errors).toBeNull();

           input.value = '11';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.min_max.errors).toEqual({max: {max: 10, actual: 11}});

           input.value = '4';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.min_max.errors).toEqual({min: {min: 5, actual: 4}});

           input.value = '9';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min_max.errors).toBeNull();
         }));

      it('should re-validate if min/max changes', fakeAsync(() => {
           const fixture = initTest(NgModelMinMaxValidator);
           fixture.componentInstance.min = 5;
           fixture.componentInstance.max = 10;
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           const form = fixture.debugElement.children[0].injector.get(NgForm);

           input.value = 10;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min_max.errors).toBeNull();

           input.value = 12;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.min_max.errors).toEqual({max: {max: 10, actual: 12}});

           fixture.componentInstance.max = 12;
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min_max.errors).toBeNull();

           input.value = 5;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min_max.errors).toBeNull();

           input.value = 0;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(false);
           expect(form.controls.min_max.errors).toEqual({min: {min: 5, actual: 0}});

           fixture.componentInstance.min = 0;
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min_max.errors).toBeNull();
         }));

      it('should run min/max validation for empty values ', fakeAsync(() => {
           const fixture = initTest(NgModelMinMaxValidator);
           fixture.componentInstance.min = 5;
           fixture.componentInstance.max = 10;
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           const form = fixture.debugElement.children[0].injector.get(NgForm);

           const maxValidateFnSpy = spyOn(MaxValidator.prototype, 'validate');
           const minValidateFnSpy = spyOn(MinValidator.prototype, 'validate');

           input.value = '';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toEqual(true);
           expect(form.controls.min_max.errors).toBeNull();

           expect(maxValidateFnSpy).toHaveBeenCalled();
           expect(minValidateFnSpy).toHaveBeenCalled();
         }));

      it('should run min/max validation for negative values', fakeAsync(() => {
           const fixture = initTest(NgModelMinMaxValidator);
           fixture.componentInstance.min = -20;
           fixture.componentInstance.max = -10;
           fixture.detectChanges();
           tick();

           const input = fixture.debugElement.query(By.css('input')).nativeElement;
           const form = fixture.debugElement.children[0].injector.get(NgForm);

           input.value = '-30';
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toBeFalse();
           expect(form.controls.min_max.errors).toEqual({min: {min: -20, actual: -30}});

           input.value = -15;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toBeTruthy();
           expect(form.controls.min_max.errors).toBeNull();

           input.value = -5;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toBeFalse();
           expect(form.controls.min_max.errors).toEqual({max: {max: -10, actual: -5}});

           input.value = 0;
           dispatchEvent(input, 'input');
           fixture.detectChanges();
           expect(form.valid).toBeFalse();
           expect(form.controls.min_max.errors).toEqual({max: {max: -10, actual: 0}});
         }));
    });

    describe('IME events', () => {
      it('should determine IME event handling depending on platform by default', fakeAsync(() => {
           const fixture = initTest(StandaloneNgModel);
           const inputEl = fixture.debugElement.query(By.css('input'));
           const inputNativeEl = inputEl.nativeElement;
           fixture.componentInstance.name = 'oldValue';
           fixture.detectChanges();
           tick();
           expect(inputNativeEl.value).toEqual('oldValue');

           inputEl.triggerEventHandler('compositionstart', null);

           inputNativeEl.value = 'updatedValue';
           dispatchEvent(inputNativeEl, 'input');
           tick();

           const isAndroid = /android (\d+)/.test(getDOM().getUserAgent().toLowerCase());
           if (isAndroid) {
             // On Android, values should update immediately
             expect(fixture.componentInstance.name).toEqual('updatedValue');
           } else {
             // On other platforms, values should wait until compositionend
             expect(fixture.componentInstance.name).toEqual('oldValue');

             inputEl.triggerEventHandler('compositionend', {target: {value: 'updatedValue'}});

             fixture.detectChanges();
             tick();

             expect(fixture.componentInstance.name).toEqual('updatedValue');
           }
         }));

      it('should hold IME events until compositionend if composition mode', fakeAsync(() => {
           TestBed.overrideComponent(
               StandaloneNgModel,
               {set: {providers: [{provide: COMPOSITION_BUFFER_MODE, useValue: true}]}});
           const fixture = initTest(StandaloneNgModel);
           const inputEl = fixture.debugElement.query(By.css('input'));
           const inputNativeEl = inputEl.nativeElement;
           fixture.componentInstance.name = 'oldValue';
           fixture.detectChanges();
           tick();
           expect(inputNativeEl.value).toEqual('oldValue');

           inputEl.triggerEventHandler('compositionstart', null);

           inputNativeEl.value = 'updatedValue';
           dispatchEvent(inputNativeEl, 'input');
           tick();

           // ngModel should not update when compositionstart
           expect(fixture.componentInstance.name).toEqual('oldValue');

           inputEl.triggerEventHandler('compositionend', {target: {value: 'updatedValue'}});

           fixture.detectChanges();
           tick();

           // ngModel should update when compositionend
           expect(fixture.componentInstance.name).toEqual('updatedValue');
         }));

      it('should work normally with composition events if composition mode is off',
         fakeAsync(() => {
           TestBed.overrideComponent(
               StandaloneNgModel,
               {set: {providers: [{provide: COMPOSITION_BUFFER_MODE, useValue: false}]}});
           const fixture = initTest(StandaloneNgModel);

           const inputEl = fixture.debugElement.query(By.css('input'));
           const inputNativeEl = inputEl.nativeElement;
           fixture.componentInstance.name = 'oldValue';
           fixture.detectChanges();
           tick();
           expect(inputNativeEl.value).toEqual('oldValue');

           inputEl.triggerEventHandler('compositionstart', null);

           inputNativeEl.value = 'updatedValue';
           dispatchEvent(inputNativeEl, 'input');
           tick();

           // ngModel should update normally
           expect(fixture.componentInstance.name).toEqual('updatedValue');
         }));
    });

    describe('ngModel corner cases', () => {
      it('should update the view when the model is set back to what used to be in the view',
         fakeAsync(() => {
           const fixture = initTest(StandaloneNgModel);
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
           const fixture = initTest(NgModelValidBinding);
           tick();
           expect(() => fixture.detectChanges()).not.toThrowError();
         }));
    });
  });
}

@Component({
  selector: 'standalone-ng-model',
  template: `
    <input type="text" [(ngModel)]="name">
  `
})
class StandaloneNgModel {
  // TODO(issue/24571): remove '!'.
  name!: string;
}

@Component({
  selector: 'ng-model-form',
  template: `
    <form (ngSubmit)="event=$event" (reset)="onReset()">
      <input name="name" [(ngModel)]="name" minlength="10" [ngModelOptions]="options">
    </form>
  `
})
class NgModelForm {
  // TODO(issue/24571): remove '!'.
  name!: string|null;
  // TODO(issue/24571): remove '!'.
  event!: Event;
  options = {};

  onReset() {}
}

@Component({selector: 'ng-model-native-validate-form', template: `<form ngNativeValidate></form>`})
class NgModelNativeValidateForm {
}

@Component({
  selector: 'ng-model-group-form',
  template: `
    <form>
      <div ngModelGroup="name">
        <input name="first" [(ngModel)]="first" required [disabled]="isDisabled">
        <input name="last" [(ngModel)]="last">
      </div>
      <input name="email" [(ngModel)]="email" [ngModelOptions]="options">
    </form>
  `
})
class NgModelGroupForm {
  // TODO(issue/24571): remove '!'.
  first!: string;
  // TODO(issue/24571): remove '!'.
  last!: string;
  // TODO(issue/24571): remove '!'.
  email!: string;
  // TODO(issue/24571): remove '!'.
  isDisabled!: boolean;
  options = {updateOn: 'change'};
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
  // TODO(issue/24571): remove '!'.
  first!: string;
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
  // TODO(issue/24571): remove '!'.
  first!: string;
  groupShowing = true;
  emailShowing = true;
  // TODO(issue/24571): remove '!'.
  email!: string;
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
    <form [ngFormOptions]="formOptions">
      <input name="one" [(ngModel)]="one">
      <input [(ngModel)]="two" [ngModelOptions]="options">
    </form>
  `
})
class NgModelOptionsStandalone {
  // TODO(issue/24571): remove '!'.
  one!: string;
  // TODO(issue/24571): remove '!'.
  two!: string;
  options: {name?: string, standalone?: boolean, updateOn?: string} = {standalone: true};
  formOptions = {};
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
  // TODO(issue/24571): remove '!'.
  required!: boolean;
  // TODO(issue/24571): remove '!'.
  minLen!: number;
  // TODO(issue/24571): remove '!'.
  maxLen!: number;
  // TODO(issue/24571): remove '!'.
  pattern!: string;
}

@Component({
  selector: 'ng-model-multiple-validators',
  template: `
    <form>
      <input name="tovalidate" ngModel  [required]="required" [minlength]="minLen" [pattern]="pattern">
    </form>
  `
})
class NgModelMultipleValidators {
  // TODO(issue/24571): remove '!'.
  required!: boolean;
  // TODO(issue/24571): remove '!'.
  minLen!: number;
  // TODO(issue/24571): remove '!'.
  pattern!: string|RegExp;
}

@Component({
  selector: 'ng-model-checkbox-validator',
  template:
      `<form><input type="checkbox" [(ngModel)]="accepted" [required]="required" name="checkbox"></form>`
})
class NgModelCheckboxRequiredValidator {
  accepted: boolean = false;
  required: boolean = false;
}

@Component({
  selector: 'ng-model-email',
  template: `<form><input type="email" ngModel [email]="validatorEnabled" name="email"></form>`
})
class NgModelEmailValidator {
  validatorEnabled: boolean = false;
}

@Directive({
  selector: '[ng-async-validator]',
  providers:
      [{provide: NG_ASYNC_VALIDATORS, useExisting: forwardRef(() => NgAsyncValidator), multi: true}]
})
class NgAsyncValidator implements AsyncValidator {
  validate(c: AbstractControl) {
    return Promise.resolve(null);
  }
}

@Component({
  selector: 'ng-model-async-validation',
  template: `<input name="async" ngModel ng-async-validator>`
})
class NgModelAsyncValidation {
}

@Component({
  selector: 'ng-model-changes-form',
  template: `
    <form>
      <input name="async" [ngModel]="name" (ngModelChange)="log()"
             [ngModelOptions]="options">
    </form>
  `
})
class NgModelChangesForm {
  // TODO(issue/24571): remove '!'.
  name!: string;
  events: string[] = [];
  options: any;

  log() {
    this.events.push('fired');
  }
}

@Component({
  selector: 'ng-model-change-state',
  template: `
    <input #ngModel="ngModel" ngModel [maxlength]="4"
           (ngModelChange)="onNgModelChange(ngModel)">
  `
})
class NgModelChangeState {
  onNgModelChange = () => {};
}

@Component({
  selector: 'ng-model-max',
  template: `<form><input name="max" type="number" ngModel [max]="max"></form>`
})
class NgModelMaxValidator {
  max!: number;
}

@Component({
  selector: 'ng-model-min',
  template: `<form><input name="min" type="number" ngModel [min]="min"></form>`
})
class NgModelMinValidator {
  min!: number;
}

@Component({
  selector: 'ng-model-min-max',
  template: `
    <form><input name="min_max" type="number" ngModel [min]="min" [max]="max"></form>`
})
class NgModelMinMaxValidator {
  min!: number|string;
  max!: number|string;
}

@Directive({selector: '[myDir]'})
class CustomDirective {
  @Input() min!: number;
  @Input() max!: number;
}

@Component({
  selector: 'ng-model-no-min-max',
  template: `
    <form>
      <input name="min" type="text" ngModel [min]="min" myDir>
      <input name="max" type="text" ngModel [max]="max" myDir>
    </form>
  `,
})
class NgModelNoMinMaxValidator {
  min!: number;
  max!: number;
  @ViewChild('myDir') myDir: any;
}
