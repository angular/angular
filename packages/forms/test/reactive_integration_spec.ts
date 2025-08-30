/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {
  Component,
  Directive,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  provideZoneChangeDetection,
  Type,
  ViewChild,
} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {dispatchEvent, isNode, sortedClassList} from '@angular/private/testing';
import {expect} from '@angular/private/testing/matchers';
import {merge, NEVER, Observable, of, Subject, Subscription, timer} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {
  AbstractControl,
  AsyncValidator,
  AsyncValidatorFn,
  COMPOSITION_BUFFER_MODE,
  ControlValueAccessor,
  FormArray,
  FormArrayDirective,
  FormBuilder,
  FormControl,
  FormControlDirective,
  FormControlName,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  MaxValidator,
  MinValidator,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validator,
  Validators,
} from '../index';

import {
  ControlEvent,
  FormControlStatus,
  FormResetEvent,
  FormSubmittedEvent,
  PristineChangeEvent,
  StatusChangeEvent,
  TouchedChangeEvent,
  ValueChangeEvent,
} from '../src/model/abstract_model';

import {MyInput, MyInputForm} from './value_accessor_integration_spec';

// Produces a new @Directive (with a given selector) that represents a validator class.
function createValidatorClass(selector: string) {
  @Directive({
    selector,
    providers: [
      {
        provide: NG_VALIDATORS,
        useClass: forwardRef(() => CustomValidator),
        multi: true,
      },
    ],
    standalone: false,
  })
  class CustomValidator implements Validator {
    validate(control: AbstractControl) {
      return null;
    }
  }
  return CustomValidator;
}

// Produces a new @Directive (with a given selector) that represents an async validator class.
function createAsyncValidatorClass(selector: string) {
  @Directive({
    selector,
    providers: [
      {
        provide: NG_ASYNC_VALIDATORS,
        useClass: forwardRef(() => CustomValidator),
        multi: true,
      },
    ],
    standalone: false,
  })
  class CustomValidator implements AsyncValidator {
    validate(control: AbstractControl) {
      return Promise.resolve(null);
    }
  }
  return CustomValidator;
}

// Produces a new @Directive (with a given selector) that represents a value accessor.
function createControlValueAccessor(selector: string) {
  @Directive({
    selector,
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => CustomValueAccessor),
        multi: true,
      },
    ],
    standalone: false,
  })
  class CustomValueAccessor implements ControlValueAccessor {
    writeValue(value: any) {}
    registerOnChange(fn: (value: any) => void) {}
    registerOnTouched(fn: any) {}
  }
  return CustomValueAccessor;
}

// Pre-create classes for validators.
const ViewValidatorA = createValidatorClass('[validators-a]');
const ViewValidatorB = createValidatorClass('[validators-b]');
const ViewValidatorC = createValidatorClass('[validators-c]');

// Pre-create classes for async validators.
const AsyncViewValidatorA = createAsyncValidatorClass('[validators-a]');
const AsyncViewValidatorB = createAsyncValidatorClass('[validators-b]');
const AsyncViewValidatorC = createAsyncValidatorClass('[validators-c]');

// Pre-create classes for value accessors.
const ValueAccessorA = createControlValueAccessor('[cva-a]');
const ValueAccessorB = createControlValueAccessor('[cva-b]');

describe('reactive forms integration tests', () => {
  function initTest<T>(component: Type<T>, ...directives: Type<any>[]): ComponentFixture<T> {
    TestBed.configureTestingModule({
      declarations: [component, ...directives],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [provideZoneChangeDetection()],
    });
    return TestBed.createComponent(component);
  }

  function initReactiveFormsTest<T>(
    component: Type<T>,
    ...directives: Type<any>[]
  ): ComponentFixture<T> {
    TestBed.configureTestingModule({
      declarations: [component, ...directives],
      imports: [ReactiveFormsModule],
    });
    return TestBed.createComponent(component);
  }

  // Helper method that attaches a spy to a `validate` function on a Validator class.
  function validatorSpyOn(validatorClass: any) {
    return spyOn(validatorClass.prototype, 'validate').and.callThrough();
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
      const fixture = initTest(NestedFormGroupNameComp);
      fixture.componentInstance.form = new FormGroup({
        'signin': new FormGroup({'login': new FormControl(), 'password': new FormControl()}),
      });
      fixture.detectChanges();

      const newForm = new FormGroup({
        'signin': new FormGroup({
          'login': new FormControl('Nancy'),
          'password': new FormControl('secret'),
        }),
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
        'pattern': new FormControl(''),
      });
      fixture.componentInstance.form = form;
      fixture.detectChanges();
      expect(form.get('login')!.errors).toEqual({required: true});

      const newForm = new FormGroup({
        'login': new FormControl(''),
        'min': new FormControl(''),
        'max': new FormControl(''),
        'pattern': new FormControl(''),
      });
      fixture.componentInstance.form = newForm;
      fixture.detectChanges();

      expect(newForm.get('login')!.errors).toEqual({required: true});
    });

    it('should pick up dir validators from nested form groups', () => {
      const fixture = initTest(NestedFormGroupNameComp, LoginIsEmptyValidator);
      const form = new FormGroup({
        'signin': new FormGroup({'login': new FormControl(''), 'password': new FormControl('')}),
      });
      fixture.componentInstance.form = form;
      fixture.detectChanges();
      expect(form.get('signin')!.valid).toBe(false);

      const newForm = new FormGroup({
        'signin': new FormGroup({'login': new FormControl(''), 'password': new FormControl('')}),
      });
      fixture.componentInstance.form = newForm;
      fixture.detectChanges();

      expect(form.get('signin')!.valid).toBe(false);
    });

    it('should strip named controls that are not found', () => {
      const fixture = initTest(NestedFormGroupNameComp, LoginIsEmptyValidator);
      const form: FormGroup = new FormGroup({
        'signin': new FormGroup({'login': new FormControl(''), 'password': new FormControl('')}),
      });
      fixture.componentInstance.form = form;
      fixture.detectChanges();

      form.addControl('email', new FormControl('email'));
      fixture.detectChanges();

      let emailInput = fixture.debugElement.query(By.css('[formControlName="email"]'));
      expect(emailInput.nativeElement.value).toEqual('email');

      const newForm = new FormGroup({
        'signin': new FormGroup({'login': new FormControl(''), 'password': new FormControl('')}),
      });
      fixture.componentInstance.form = newForm;
      fixture.detectChanges();

      emailInput = fixture.debugElement.query(By.css('[formControlName="email"]'));
      expect(emailInput as any).toBe(null); // TODO: remove `any` after #22449 is closed.
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

    it('should sync the disabled state if it changes right after a group is re-bound', () => {
      @Component({
        template: `
            <form [formGroup]="form">
              <input formControlName="input">
            </form>
          `,
        standalone: false,
      })
      class App {
        form: FormGroup;

        constructor(private _fb: FormBuilder) {
          this.form = this._getForm();
        }

        private _getForm() {
          return this._fb.group({'input': 'value'});
        }

        recreateAndDisable() {
          this.form = this._getForm();
          this.form.disable();
        }
      }

      const fixture = initTest(App);
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('input');
      expect(input.disabled).toBe(false);

      fixture.componentInstance.recreateAndDisable();
      fixture.detectChanges();
      expect(input.disabled).toBe(true);
    });

    describe('nested control rebinding', () => {
      it('should attach dir to control when leaf control changes', () => {
        const form: FormGroup = new FormGroup({'login': new FormControl('oldValue')});
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
        const fixture = initTest(NestedFormGroupNameComp, LoginIsEmptyValidator);
        const form: FormGroup = new FormGroup({
          signin: new FormGroup({
            login: new FormControl('oldLogin'),
            password: new FormControl('oldPassword'),
          }),
        });
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        form.removeControl('signin');
        form.addControl(
          'signin',
          new FormGroup({
            login: new FormControl('newLogin'),
            password: new FormControl('newPassword'),
          }),
        );
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
        const form: FormGroup = new FormGroup({cities: cityArray});
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
        const cityArray = new FormArray([
          new FormControl('SF'),
          new FormControl('NY'),
          new FormControl('LA'),
        ]);
        const form = new FormGroup({cities: cityArray});
        fixture.componentInstance.form = form;
        fixture.componentInstance.cityArray = cityArray;
        fixture.detectChanges();

        const newArr = new FormArray([
          new FormControl('SF'),
          new FormControl('NY'),
          new FormControl('LA'),
        ]);
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

        newArr.get([0])!.setValue('set value');
        fixture.detectChanges();

        firstInput = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(firstInput.value).toEqual('set value');
      });

      it('should submit properly after removing controls on a re-bound array', () => {
        const fixture = initTest(FormArrayComp);
        const cityArray = new FormArray([
          new FormControl('SF'),
          new FormControl('NY'),
          new FormControl('LA'),
        ]);
        const form = new FormGroup({cities: cityArray});
        fixture.componentInstance.form = form;
        fixture.componentInstance.cityArray = cityArray;
        fixture.detectChanges();

        const newArr = new FormArray([
          new FormControl('SF'),
          new FormControl('NY'),
          new FormControl('LA'),
        ]);
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

        newArr.get([2])!.setValue('NY');
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
        new FormGroup({town: new FormControl('NY'), state: new FormControl('NY')}),
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
        cities: [
          {town: 'SF', state: 'CA'},
          {town: 'NY', state: 'NY'},
        ],
      });

      inputs[0].nativeElement.value = 'LA';
      dispatchEvent(inputs[0].nativeElement, 'input');
      fixture.detectChanges();

      expect(form.value).toEqual({
        cities: [
          {town: 'LA', state: 'CA'},
          {town: 'NY', state: 'NY'},
        ],
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
      it('should add disabled attribute to an individual control when instantiated as disabled', () => {
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

      it('should add disabled attribute to an individual control when disable() is called', () => {
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

      it('should add disabled attribute to child controls when disable() is called on group', () => {
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

    describe('dynamic change of FormGroup and FormArray shapes', () => {
      it('should handle FormControl and FormGroup swap', () => {
        @Component({
          template: `
              <form [formGroup]="form">
                <input formControlName="name" id="standalone-id" *ngIf="!showAsGroup">
                <ng-container formGroupName="name" *ngIf="showAsGroup">
                  <input formControlName="control" id="inside-group-id">
                </ng-container>
              </form>
            `,
          standalone: false,
        })
        class App {
          showAsGroup = false;
          form!: FormGroup;

          useStandaloneControl() {
            this.showAsGroup = false;
            this.form = new FormGroup({
              name: new FormControl('standalone'),
            });
          }

          useControlInsideGroup() {
            this.showAsGroup = true;
            this.form = new FormGroup({
              name: new FormGroup({
                control: new FormControl('inside-group'),
              }),
            });
          }
        }

        const fixture = initTest(App);
        fixture.componentInstance.useStandaloneControl();
        fixture.detectChanges();

        let input = fixture.nativeElement.querySelector('input');
        expect(input.id).toBe('standalone-id');
        expect(input.value).toBe('standalone');

        // Replace `FormControl` with `FormGroup` at the same location
        // in data model and trigger change detection.
        fixture.componentInstance.useControlInsideGroup();
        fixture.detectChanges();

        input = fixture.nativeElement.querySelector('input');
        expect(input.id).toBe('inside-group-id');
        expect(input.value).toBe('inside-group');

        // Swap `FormGroup` with `FormControl` back at the same location
        // in data model and trigger change detection.
        fixture.componentInstance.useStandaloneControl();
        fixture.detectChanges();

        input = fixture.nativeElement.querySelector('input');
        expect(input.id).toBe('standalone-id');
        expect(input.value).toBe('standalone');
      });

      it('should handle FormControl and FormArray swap', () => {
        @Component({
          template: `
              <form [formGroup]="form">
                <input formControlName="name" id="standalone-id" *ngIf="!showAsArray">
                <ng-container formArrayName="name" *ngIf="showAsArray">
                  <input formControlName="0" id="inside-array-id">
                </ng-container>
              </form>
            `,
          standalone: false,
        })
        class App {
          showAsArray = false;
          form!: FormGroup;

          useStandaloneControl() {
            this.showAsArray = false;
            this.form = new FormGroup({
              name: new FormControl('standalone'),
            });
          }

          useControlInsideArray() {
            this.showAsArray = true;
            this.form = new FormGroup({
              name: new FormArray([
                new FormControl('inside-array'), //
              ]),
            });
          }
        }

        const fixture = initTest(App);
        fixture.componentInstance.useStandaloneControl();
        fixture.detectChanges();

        let input = fixture.nativeElement.querySelector('input');
        expect(input.id).toBe('standalone-id');
        expect(input.value).toBe('standalone');

        // Replace `FormControl` with `FormArray` at the same location
        // in data model and trigger change detection.
        fixture.componentInstance.useControlInsideArray();
        fixture.detectChanges();

        input = fixture.nativeElement.querySelector('input');
        expect(input.id).toBe('inside-array-id');
        expect(input.value).toBe('inside-array');

        // Swap `FormArray` with `FormControl` back at the same location
        // in data model and trigger change detection.
        fixture.componentInstance.useStandaloneControl();
        fixture.detectChanges();

        input = fixture.nativeElement.querySelector('input');
        expect(input.id).toBe('standalone-id');
        expect(input.value).toBe('standalone');
      });

      it('should handle FormGroup and FormArray swap', () => {
        @Component({
          template: `
              <form [formGroup]="form">
                <ng-container formGroupName="name" *ngIf="!showAsArray">
                  <input formControlName="control" id="inside-group-id">
                </ng-container>
                <ng-container formArrayName="name" *ngIf="showAsArray">
                  <input formControlName="0" id="inside-array-id">
                </ng-container>
              </form>
            `,
          standalone: false,
        })
        class App {
          showAsArray = false;
          form!: FormGroup;

          useControlInsideGroup() {
            this.showAsArray = false;
            this.form = new FormGroup({
              name: new FormGroup({
                control: new FormControl('inside-group'),
              }),
            });
          }

          useControlInsideArray() {
            this.showAsArray = true;
            this.form = new FormGroup({
              name: new FormArray([
                new FormControl('inside-array'), //
              ]),
            });
          }
        }

        const fixture = initTest(App);
        fixture.componentInstance.useControlInsideGroup();
        fixture.detectChanges();

        let input = fixture.nativeElement.querySelector('input');
        expect(input.id).toBe('inside-group-id');
        expect(input.value).toBe('inside-group');

        // Replace `FormGroup` with `FormArray` at the same location
        // in data model and trigger change detection.
        fixture.componentInstance.useControlInsideArray();
        fixture.detectChanges();

        input = fixture.nativeElement.querySelector('input');
        expect(input.id).toBe('inside-array-id');
        expect(input.value).toBe('inside-array');

        // Swap `FormArray` with `FormGroup` back at the same location
        // in data model and trigger change detection.
        fixture.componentInstance.useControlInsideGroup();
        fixture.detectChanges();

        input = fixture.nativeElement.querySelector('input');
        expect(input.id).toBe('inside-group-id');
        expect(input.value).toBe('inside-group');
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
      fixture.componentInstance.event = null!;
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

      login.valueChanges.subscribe(() => {
        expect(login.dirty).toBe(true);
      });

      const loginEl = fixture.debugElement.query(By.css('input')).nativeElement;
      loginEl.value = 'newValue';

      dispatchEvent(loginEl, 'input');
    });

    it('should mark control as pristine before emitting a value change event when resetting ', () => {
      const fixture = initTest(FormGroupComp);
      const login = new FormControl('oldValue');
      const form = new FormGroup({'login': login});
      fixture.componentInstance.form = form;
      fixture.detectChanges();

      const loginEl = fixture.debugElement.query(By.css('input')).nativeElement;
      loginEl.value = 'newValue';
      dispatchEvent(loginEl, 'input');

      expect(login.pristine).toBe(false);

      login.valueChanges.subscribe(() => {
        expect(login.pristine).toBe(true);
      });

      form.reset();
    });
  });

  describe('unified form state change', () => {
    type UnwrapObservable<T> = T extends Observable<infer U> ? U : never;
    type ControlEvents<T extends AbstractControl> = UnwrapObservable<T['events']>[];

    function expectValueChangeEvent<T>(
      event: ControlEvent<T> | undefined,
      value: T,
      sourceControl: AbstractControl,
    ) {
      const valueEvent = event as ValueChangeEvent<T>;
      expect(valueEvent).toBeInstanceOf(ValueChangeEvent);
      expect(valueEvent.source).toBe(sourceControl);
      expect(valueEvent.value).toEqual(value);
    }

    function expectPristineChangeEvent<T>(
      event: ControlEvent<T> | undefined,
      pristine: boolean,
      sourceControl: AbstractControl,
    ) {
      const pristineEvent = event as PristineChangeEvent;
      expect(pristineEvent).toBeInstanceOf(PristineChangeEvent);
      expect(pristineEvent.source).toBe(sourceControl);
      expect(pristineEvent.pristine).toBe(pristine);
    }

    function expectTouchedChangeEvent<T>(
      event: ControlEvent<T> | undefined,
      touched: boolean,
      sourceControl: AbstractControl,
    ) {
      const touchedEvent = event as TouchedChangeEvent;
      expect(touchedEvent).toBeInstanceOf(TouchedChangeEvent);
      expect(touchedEvent.source).toBe(sourceControl);
      expect(touchedEvent.touched).toBe(touched);
    }

    function expectStatusChangeEvent<T>(
      event: ControlEvent<T> | undefined,
      status: FormControlStatus,
      sourceControl: AbstractControl,
    ) {
      const touchedEvent = event as StatusChangeEvent;
      expect(touchedEvent).toBeInstanceOf(StatusChangeEvent);
      expect(touchedEvent.source).toBe(sourceControl);
      expect(touchedEvent.status).toBe(status);
    }

    it('Single level Control should emit changes for itself', () => {
      const fc = new FormControl<string | null>('foo', Validators.required);

      const values: ControlEvent[] = [];
      fc.events.subscribe((event) => values.push(event));
      expect(values.length).toBe(0);

      fc.markAsTouched();
      expectTouchedChangeEvent(values.at(-1), true, fc);

      fc.markAsUntouched();
      expectTouchedChangeEvent(values.at(-1), false, fc);

      fc.markAsDirty();
      expectPristineChangeEvent(values.at(-1), false, fc);

      fc.markAsPristine();
      expectPristineChangeEvent(values.at(-1), true, fc);

      fc.disable();
      expectValueChangeEvent(values.at(-2), 'foo', fc);
      expectStatusChangeEvent(values.at(-1), 'DISABLED', fc);
      expect(values.length).toBe(6);

      fc.enable();
      expectValueChangeEvent(values.at(-2), 'foo', fc);
      expectStatusChangeEvent(values.at(-1), 'VALID', fc);
      expect(values.length).toBe(8);

      fc.setValue(null);
      expectValueChangeEvent(values.at(-2), null, fc);
      expectStatusChangeEvent(values.at(-1), 'INVALID', fc);
      expect(values.length).toBe(10); // setValue doesnt emit dirty or touched

      fc.setValue('bar');
      expectValueChangeEvent(values.at(-2), 'bar', fc);
      expectStatusChangeEvent(values.at(-1), 'VALID', fc);
      expect(values.length).toBe(12);

      const subject = new Subject<string>();
      const asyncValidator = () => subject.pipe(map(() => null));
      fc.addAsyncValidators(asyncValidator);
      fc.updateValueAndValidity();

      // Value is emitted because of updateValueAndValidity
      expectValueChangeEvent(values.at(-2), 'bar', fc);
      expectStatusChangeEvent(values.at(-1), 'PENDING', fc);

      subject.next('');
      subject.complete();
      expectStatusChangeEvent(values.at(-1), 'VALID', fc);
      expect(values.length).toBe(15);
    });

    it('should not emit twice the same value', () => {
      const fc = new FormControl<string | null>('foo', Validators.required);
      const fcEvents: ControlEvent<string | null>[] = [];
      fc.events.subscribe((event) => fcEvents.push(event));
      expect(fcEvents.length).toBe(0);

      fc.markAsDirty();
      fc.markAsDirty();
      expect(fcEvents.length).toBe(1);

      fc.markAsPristine();
      fc.markAsPristine();
      expect(fcEvents.length).toBe(2);

      fc.markAsTouched();
      fc.markAsTouched();
      expect(fcEvents.length).toBe(3);

      fc.markAsUntouched();
      fc.markAsUntouched();
      expect(fcEvents.length).toBe(4);
    });

    it('Nested formControl should emit changes for itself and its parent', () => {
      const fc1 = new FormControl<string | null>('foo', Validators.required);
      const fc2 = new FormControl<string | null>('bar', Validators.required);
      const fg = new FormGroup({fc1, fc2});

      const fc1Events: ControlEvent<string | null>[] = [];
      const fc2Events: ControlEvent<string | null>[] = [];
      const fgEvents: ControlEvent<Partial<{fc1: string | null; fc2: string | null}>>[] = [];
      fc1.events.subscribe((event) => fc1Events.push(event));
      fc2.events.subscribe((event) => fc2Events.push(event));
      fg.events.subscribe((event) => fgEvents.push(event));

      fc1.setValue('bar');
      expectValueChangeEvent(fc1Events.at(-2), 'bar', fc1);
      expectStatusChangeEvent(fc1Events.at(-1), 'VALID', fc1);
      expect(fc1Events.length).toBe(2);

      expectValueChangeEvent(fgEvents.at(-2), {fc1: 'bar', fc2: 'bar'}, fc1);
      expectStatusChangeEvent(fgEvents.at(-1), 'VALID', fc1);
    });

    it('Nested formControl children should emit pristine', () => {
      const fc1 = new FormControl<string | null>('foo', Validators.required);
      const fc2 = new FormControl<string | null>('bar', Validators.required);
      const fg = new FormGroup({fc1, fc2});

      const fc1Event: ControlEvents<typeof fc1> = [];
      const fc2Event: ControlEvents<typeof fc2> = [];
      const fgEvent: ControlEvents<typeof fg> = [];
      fc1.events.subscribe((event) => fc1Event.push(event));
      fc2.events.subscribe((event) => fc2Event.push(event));
      fg.events.subscribe((event) => fgEvent.push(event));

      fc1.markAsDirty();
      expect(fc1Event.length).toBe(1);
      expect(fc2Event.length).toBe(0);
      expect(fgEvent.length).toBe(1);

      fg.markAsPristine();

      // Marking children as pristine does not emit an event on the parent
      // Source control is itself
      expectPristineChangeEvent(fgEvent.at(-1), true, fg);
      expect(fgEvent.length).toBe(2);

      // Child that was dirty emits a pristine change
      // Source control is itself, as even are only bubbled up
      expectPristineChangeEvent(fc1Event.at(-1), true, fc1);
      expect(fc1Event.length).toBe(2);

      // This child was already pristine, it doesn't emit a pristine change
      expect(fc2Event.length).toBe(0);
    });

    it('Nested formControl should emit dirty', () => {
      const fc1 = new FormControl<string | null>('foo', Validators.required);
      const fc2 = new FormControl<string | null>('bar', Validators.required);
      const fg = new FormGroup({fc1, fc2});

      const fc1Events: ControlEvents<typeof fc1> = [];
      const fc2Events: ControlEvents<typeof fc2> = [];
      const fgEvents: ControlEvents<typeof fg> = [];
      fc1.events.subscribe((event) => fc1Events.push(event));
      fc2.events.subscribe((event) => fc2Events.push(event));
      fg.events.subscribe((event) => fgEvents.push(event));

      fc1.markAsDirty();
      expect(fc1Events.length).toBe(1);
      expect(fgEvents.length).toBe(1);
      expect(fc2Events.length).toBe(0);

      // sourceControl is the child control
      expectPristineChangeEvent(fgEvents.at(-1), false, fc1);
      expectPristineChangeEvent(fc1Events.at(-1), false, fc1);
    });

    it('Nested formControl should emit touched', () => {
      const fc1 = new FormControl<string | null>('foo', Validators.required);
      const fc2 = new FormControl<string | null>('bar', Validators.required);
      const fg = new FormGroup({fc1, fc2});

      const fc1Events: ControlEvent[] = [];
      const fc2Events: ControlEvent[] = [];
      const fgEvents: ControlEvent[] = [];
      fc1.events.subscribe((event) => fc1Events.push(event));
      fc2.events.subscribe((event) => fc2Events.push(event));
      fg.events.subscribe((event) => fgEvents.push(event));

      fc1.markAsTouched();
      expect(fc1Events.length).toBe(1);
      expect(fgEvents.length).toBe(1);
      expect(fc2Events.length).toBe(0);

      // sourceControl is the child control
      expectTouchedChangeEvent(fgEvents.at(-1), true, fc1);
      expectTouchedChangeEvent(fc1Events.at(-1), true, fc1);
    });

    it('Nested formControl should emit disabled', () => {
      const fc1 = new FormControl<string | null>('foo', Validators.required);
      const fc2 = new FormControl<string | null>('bar', Validators.required);
      const fg = new FormGroup({fc1, fc2});

      const fc1Events: ControlEvent[] = [];
      const fc2Events: ControlEvent[] = [];
      const fgEvents: ControlEvent[] = [];
      fc1.events.subscribe((event) => fc1Events.push(event));
      fc2.events.subscribe((event) => fc2Events.push(event));
      fg.events.subscribe((event) => fgEvents.push(event));

      expect(fg.pristine).toBeTrue();

      fc1.disable();
      expect(fc1Events.length).toBe(2);
      expect(fgEvents.length).toBe(3);
      expect(fc2Events.length).toBe(0);

      expectValueChangeEvent(fgEvents.at(-3), {fc2: 'bar'}, fg);
      expectStatusChangeEvent(fgEvents.at(-2), 'VALID', fg);
      expectTouchedChangeEvent(fgEvents.at(-1), false, fc1);
      // No prisitine event sent as fg was already pristine

      expectValueChangeEvent(fc1Events.at(-2), 'foo', fc1);
      expectStatusChangeEvent(fc1Events.at(-1), 'DISABLED', fc1);
    });

    it('Nested formControl should emit PENDING', () => {
      const fc1 = new FormControl<string | null>('foo', Validators.required);
      const fc2 = new FormControl<string | null>('bar', Validators.required);
      const fg = new FormGroup({fc1, fc2});

      const fc1Events: ControlEvent[] = [];
      const fc2Events: ControlEvent[] = [];
      const fgEvents: ControlEvent[] = [];
      fc1.events.subscribe((event) => fc1Events.push(event));
      fc2.events.subscribe((event) => fc2Events.push(event));
      fg.events.subscribe((event) => fgEvents.push(event));

      fc1.markAsPending();
      expectStatusChangeEvent(fgEvents.at(-1), 'PENDING', fc1);
      expectStatusChangeEvent(fc1Events.at(-1), 'PENDING', fc1);

      expect(fc1Events.length).toBe(1);
      expect(fgEvents.length).toBe(1);
      expect(fc2Events.length).toBe(0);

      // Reseting to VALID
      fc1.updateValueAndValidity();
      expectValueChangeEvent(fgEvents.at(-2), {fc1: 'foo', fc2: 'bar'}, fc1);
      expectStatusChangeEvent(fgEvents.at(-1), 'VALID', fc1);

      expectValueChangeEvent(fc1Events.at(-2), 'foo', fc1);
      expectStatusChangeEvent(fc1Events.at(-1), 'VALID', fc1);
      expect(fc1Events.length).toBe(3);
      expect(fgEvents.length).toBe(3);
      expect(fc2Events.length).toBe(0);

      // Triggering PENDING again with the async validator now
      const subject = new Subject<string>();
      const asyncValidator = () => subject.pipe(map(() => null));
      fc1.addAsyncValidators(asyncValidator);
      fc1.updateValueAndValidity();

      expect(fc1Events.length).toBe(5);
      expect(fgEvents.length).toBe(5);
      expect(fc2Events.length).toBe(0);

      expectValueChangeEvent(fgEvents.at(-2), {fc1: 'foo', fc2: 'bar'}, fc1);
      expectStatusChangeEvent(fgEvents.at(-1), 'PENDING', fc1);
      expectValueChangeEvent(fc1Events.at(-2), 'foo', fc1);
      expectStatusChangeEvent(fc1Events.at(-1), 'PENDING', fc1);

      subject.next('');
      subject.complete();
      expectStatusChangeEvent(fgEvents.at(-1), 'VALID', fc1);
      expectStatusChangeEvent(fc1Events.at(-1), 'VALID', fc1);
    });

    it('formControl should not emit when emitEvent is false', () => {
      const fc = new FormControl<string | null>('foo', Validators.required);
      const fcEvents: ControlEvent[] = [];
      fc.events.subscribe((event) => fcEvents.push(event));

      expect(fcEvents.length).toBe(0);
      fc.markAsTouched({emitEvent: false});
      expect(fcEvents.length).toBe(0);
      fc.markAllAsDirty({emitEvent: false});
      expect(fcEvents.length).toBe(0);
      fc.markAllAsTouched({emitEvent: false});
      expect(fcEvents.length).toBe(0);
      fc.markAsUntouched({emitEvent: false});
      expect(fcEvents.length).toBe(0);
      fc.markAsPristine({emitEvent: false});
      expect(fcEvents.length).toBe(0);
      fc.markAsDirty({emitEvent: false});
      expect(fcEvents.length).toBe(0);
    });

    it('formControl should emit an event when resetting a form', () => {
      const fixture = initTest(FormGroupComp);
      const form = new FormGroup({'login': new FormControl('', Validators.required)});
      fixture.componentInstance.form = form;
      fixture.detectChanges();

      const formGroupDir = fixture.debugElement.children[0].injector.get(FormGroupDirective);

      const events: ControlEvent[] = [];
      fixture.componentInstance.form.events.subscribe((event) => events.push(event));
      formGroupDir.resetForm();

      expect(events.length).toBe(4);
      expect(events[0]).toBeInstanceOf(TouchedChangeEvent);
      expect(events[1]).toBeInstanceOf(ValueChangeEvent);
      expect(events[2]).toBeInstanceOf(StatusChangeEvent);

      // The event that matters
      expect(events[3]).toBeInstanceOf(FormResetEvent);
      expect(events[3].source).toBe(form);
    });

    it('formControl should not emit an event when resetting a form with emit:false', () => {
      const fixture = initTest(FormGroupComp);
      const form = new FormGroup({'login': new FormControl('', Validators.required)});
      fixture.componentInstance.form = form;
      fixture.detectChanges();

      const formGroupDir = fixture.debugElement.children[0].injector.get(FormGroupDirective);

      const events: ControlEvent[] = [];
      fixture.componentInstance.form.events.subscribe((event) => events.push(event));

      formGroupDir.resetForm(undefined, {emitEvent: false});

      expect(events.length).toBe(1);
      expect(events[0]).toBeInstanceOf(TouchedChangeEvent);
    });

    it('formControl should only update self', () => {
      const fixture = initTest(FormGroupComp);
      const form = new FormGroup({'login': new FormControl('', Validators.required)});
      const parentForm = new FormGroup({form});
      fixture.componentInstance.form = form;
      fixture.detectChanges();

      const formGroupDir = fixture.debugElement.children[0].injector.get(FormGroupDirective);

      const events: ControlEvent[] = [];
      fixture.componentInstance.form.events.subscribe((event) => events.push(event));
      const parentEvents: ControlEvent[] = [];
      parentForm.events.subscribe((event) => parentEvents.push(event));

      formGroupDir.resetForm(undefined, {onlySelf: true});

      expect(events.length).toBe(4);
      expect(events[0]).toBeInstanceOf(TouchedChangeEvent);
      expect(events[1]).toBeInstanceOf(ValueChangeEvent);
      expect(events[2]).toBeInstanceOf(StatusChangeEvent);

      // The event that matters
      expect(events[3]).toBeInstanceOf(FormResetEvent);
      expect(events[3].source).toBe(form);

      // Self:false = parent won't receive the events
      expect(parentEvents.length).toBe(0);

      // Not only self
      formGroupDir.resetForm({login: 'new value'});
      expect(parentEvents.length).toBe(3);
      expect(parentEvents[0]).toBeInstanceOf(TouchedChangeEvent);
      expect(parentEvents[1]).toBeInstanceOf(ValueChangeEvent);
      expect(parentEvents[2]).toBeInstanceOf(StatusChangeEvent);
    });

    it('formControl should emit an event when submitting a form', () => {
      const fixture = initTest(FormGroupComp);
      const form = new FormGroup({'login': new FormControl('', Validators.required)});
      fixture.componentInstance.form = form;
      fixture.detectChanges();

      const formGroupDir = fixture.debugElement.children[0].injector.get(FormGroupDirective);

      const events: ControlEvent[] = [];
      fixture.componentInstance.form.events.subscribe((event) => events.push(event));
      formGroupDir.onSubmit({} as any);

      expect(events.length).toBe(1);
      expect(events[0]).toBeInstanceOf(FormSubmittedEvent);
      expect(events[0].source).toBe(form);
    });
  });

  describe('setting status classes', () => {
    it('should not assign status on standalone <form> element', () => {
      @Component({
        selector: 'form-comp',
        template: `
            <form></form>
          `,
        standalone: false,
      })
      class FormComp {}

      const fixture = initReactiveFormsTest(FormComp);
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('form')).nativeElement;
      // Expect no classes added to the <form> element since it has no
      // reactive directives attached and only ReactiveForms module is used.
      expect(sortedClassList(form)).toEqual([]);
    });

    it('should not assign status on standalone <form> element with form control inside', () => {
      @Component({
        selector: 'form-comp',
        template: `
            <form>
              <input type="text" [formControl]="control">
            </form>
          `,
        standalone: false,
      })
      class FormComp {
        control = new FormControl('abc');
      }
      const fixture = initReactiveFormsTest(FormComp);
      fixture.detectChanges();

      const form = fixture.debugElement.query(By.css('form')).nativeElement;
      // Expect no classes added to the <form> element since it has no
      // reactive directives attached and only ReactiveForms module is used.
      expect(sortedClassList(form)).toEqual([]);

      const input = fixture.debugElement.query(By.css('input')).nativeElement;
      expect(sortedClassList(input)).toEqual(['ng-pristine', 'ng-untouched', 'ng-valid']);
    });

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
      const control = new FormControl('', null!, uniqLoginAsyncValidator('good'));
      fixture.debugElement.componentInstance.control = control;
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input')).nativeElement;
      expect(sortedClassList(input)).toEqual(['ng-pending', 'ng-pristine', 'ng-untouched']);

      dispatchEvent(input, 'blur');
      fixture.detectChanges();
      expect(sortedClassList(input)).toEqual(['ng-pending', 'ng-pristine', 'ng-touched']);

      input.value = 'good';
      dispatchEvent(input, 'input');
      tick();
      fixture.detectChanges();

      expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
    }));

    it('should work with single fields that combines async and sync validators', fakeAsync(() => {
      const fixture = initTest(FormControlComp);
      const control = new FormControl('', Validators.required, uniqLoginAsyncValidator('good'));
      fixture.debugElement.componentInstance.control = control;
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input')).nativeElement;
      expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-untouched']);

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
      const formEl = fixture.debugElement.query(By.css('form')).nativeElement;

      expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-untouched']);

      dispatchEvent(input, 'blur');
      fixture.detectChanges();

      expect(sortedClassList(input)).toEqual(['ng-invalid', 'ng-pristine', 'ng-touched']);

      input.value = 'updatedValue';
      dispatchEvent(input, 'input');
      fixture.detectChanges();

      expect(sortedClassList(input)).toEqual(['ng-dirty', 'ng-touched', 'ng-valid']);
      expect(sortedClassList(formEl)).not.toContain('ng-submitted');

      dispatchEvent(formEl, 'submit');
      fixture.detectChanges();

      expect(sortedClassList(input)).not.toContain('ng-submitted');
      expect(sortedClassList(formEl)).toContain('ng-submitted');

      dispatchEvent(formEl, 'reset');
      fixture.detectChanges();

      expect(sortedClassList(input)).not.toContain('ng-submitted');
      expect(sortedClassList(formEl)).not.toContain('ng-submitted');
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

      dispatchEvent(formEl, 'submit');
      fixture.detectChanges();

      expect(sortedClassList(formEl)).toContain('ng-submitted');

      dispatchEvent(formEl, 'reset');
      fixture.detectChanges();

      expect(sortedClassList(input)).not.toContain('ng-submitted');
      expect(sortedClassList(formEl)).not.toContain('ng-submitted');
    });

    it('should not assign `ng-submitted` class to elements with `formArrayName`', () => {
      // Since element with the `formArrayName` can not represent top-level forms (can only be
      // inside other elements), this test verifies that these elements never receive
      // `ng-submitted` CSS class even when they are located inside submitted form.
      const fixture = initTest(FormArrayComp);
      const cityArray = new FormArray([new FormControl('SF'), new FormControl('NY')]);
      const form = new FormGroup({cities: cityArray});
      fixture.componentInstance.form = form;
      fixture.componentInstance.cityArray = cityArray;
      fixture.detectChanges();

      const [loginInput, passwordInput] = fixture.debugElement
        .queryAll(By.css('input'))
        .map((el) => el.nativeElement);
      const arrEl = fixture.debugElement.query(By.css('div')).nativeElement;
      const formEl = fixture.debugElement.query(By.css('form')).nativeElement;

      expect(passwordInput).toBeDefined();
      expect(sortedClassList(loginInput)).not.toContain('ng-submitted');
      expect(sortedClassList(arrEl)).not.toContain('ng-submitted');
      expect(sortedClassList(formEl)).not.toContain('ng-submitted');

      dispatchEvent(formEl, 'submit');
      fixture.detectChanges();

      expect(sortedClassList(loginInput)).not.toContain('ng-submitted');
      expect(sortedClassList(arrEl)).not.toContain('ng-submitted');
      expect(sortedClassList(formEl)).toContain('ng-submitted');

      dispatchEvent(formEl, 'reset');
      fixture.detectChanges();

      expect(sortedClassList(loginInput)).not.toContain('ng-submitted');
      expect(sortedClassList(arrEl)).not.toContain('ng-submitted');
      expect(sortedClassList(formEl)).not.toContain('ng-submitted');
    });

    it('should apply submitted status with nested formArrayName', () => {
      const fixture = initTest(NestedFormArrayNameComp);
      const ic = new FormControl('foo');
      const arr = new FormArray([ic]);
      const form = new FormGroup({arr});
      fixture.componentInstance.form = form;
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input')).nativeElement;
      const arrEl = fixture.debugElement.query(By.css('div')).nativeElement;
      const formEl = fixture.debugElement.query(By.css('form')).nativeElement;

      expect(sortedClassList(input)).not.toContain('ng-submitted');
      expect(sortedClassList(arrEl)).not.toContain('ng-submitted');
      expect(sortedClassList(formEl)).not.toContain('ng-submitted');

      dispatchEvent(formEl, 'submit');
      fixture.detectChanges();

      expect(sortedClassList(input)).not.toContain('ng-submitted');
      expect(sortedClassList(arrEl)).not.toContain('ng-submitted');
      expect(sortedClassList(formEl)).toContain('ng-submitted');

      dispatchEvent(formEl, 'reset');
      fixture.detectChanges();

      expect(sortedClassList(input)).not.toContain('ng-submitted');
      expect(sortedClassList(arrEl)).not.toContain('ng-submitted');
      expect(sortedClassList(formEl)).not.toContain('ng-submitted');
    });

    it('should apply submitted status with nested formGroupName', () => {
      const fixture = initTest(NestedFormGroupNameComp);
      const loginControl = new FormControl('', {
        validators: Validators.required,
        updateOn: 'change',
      });
      const passwordControl = new FormControl('', Validators.required);
      const formGroup = new FormGroup(
        {signin: new FormGroup({login: loginControl, password: passwordControl})},
        {updateOn: 'blur'},
      );
      fixture.componentInstance.form = formGroup;
      fixture.detectChanges();

      const [loginInput, passwordInput] = fixture.debugElement
        .queryAll(By.css('input'))
        .map((el) => el.nativeElement);

      const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
      const groupEl = fixture.debugElement.query(By.css('div')).nativeElement;
      loginInput.value = 'Nancy';
      // Input and blur events, as in a real interaction, cause the form to be touched and
      // dirtied.
      dispatchEvent(loginInput, 'input');
      dispatchEvent(loginInput, 'blur');
      fixture.detectChanges();

      expect(sortedClassList(loginInput)).not.toContain('ng-submitted');
      expect(sortedClassList(groupEl)).not.toContain('ng-submitted');
      expect(sortedClassList(formEl)).not.toContain('ng-submitted');

      dispatchEvent(formEl, 'submit');
      fixture.detectChanges();

      expect(sortedClassList(loginInput)).not.toContain('ng-submitted');
      expect(sortedClassList(groupEl)).not.toContain('ng-submitted');
      expect(sortedClassList(formEl)).toContain('ng-submitted');

      dispatchEvent(formEl, 'reset');
      fixture.detectChanges();

      expect(sortedClassList(loginInput)).not.toContain('ng-submitted');
      expect(sortedClassList(groupEl)).not.toContain('ng-submitted');
      expect(sortedClassList(formEl)).not.toContain('ng-submitted');
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

        expect(control.value)
          .withContext('Expected value to remain unchanged until blur.')
          .toEqual('');
        expect(control.valid)
          .withContext('Expected no validation to occur until blur.')
          .toBe(false);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(control.value)
          .withContext('Expected value to change once control is blurred.')
          .toEqual('Nancy');
        expect(control.valid)
          .withContext('Expected validation to run once control is blurred.')
          .toBe(true);
      });

      it('should not update parent group value/validity from child until blur', () => {
        const fixture = initTest(FormGroupComp);
        const form = new FormGroup({
          login: new FormControl('', {validators: Validators.required, updateOn: 'blur'}),
        });
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        input.value = 'Nancy';
        dispatchEvent(input, 'input');
        fixture.detectChanges();

        expect(form.value)
          .withContext('Expected group value to remain unchanged until blur.')
          .toEqual({login: ''});
        expect(form.valid)
          .withContext('Expected no validation to occur on group until blur.')
          .toBe(false);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(form.value)
          .withContext('Expected group value to change once input blurred.')
          .toEqual({login: 'Nancy'});
        expect(form.valid).withContext('Expected validation to run once input blurred.').toBe(true);
      });

      it('should not wait for blur event to update if value is set programmatically', () => {
        const fixture = initTest(FormControlComp);
        const control = new FormControl('', {validators: Validators.required, updateOn: 'blur'});
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        control.setValue('Nancy');
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(input.value)
          .withContext('Expected value to propagate to view immediately.')
          .toEqual('Nancy');
        expect(control.value)
          .withContext('Expected model value to update immediately.')
          .toEqual('Nancy');
        expect(control.valid).withContext('Expected validation to run immediately.').toBe(true);
      });

      it('should not update dirty state until control is blurred', () => {
        const fixture = initTest(FormControlComp);
        const control = new FormControl('', {updateOn: 'blur'});
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        expect(control.dirty).withContext('Expected control to start out pristine.').toBe(false);

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        input.value = 'Nancy';
        dispatchEvent(input, 'input');
        fixture.detectChanges();

        expect(control.dirty)
          .withContext('Expected control to stay pristine until blurred.')
          .toBe(false);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(control.dirty)
          .withContext('Expected control to update dirty state when blurred.')
          .toBe(true);
      });

      it('should update touched when control is blurred', () => {
        const fixture = initTest(FormControlComp);
        const control = new FormControl('', {updateOn: 'blur'});
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        expect(control.touched).withContext('Expected control to start out untouched.').toBe(false);

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(control.touched)
          .withContext('Expected control to update touched state when blurred.')
          .toBe(true);
      });

      it('should continue waiting for blur to update if previously blurred', () => {
        const fixture = initTest(FormControlComp);
        const control = new FormControl('Nancy', {
          validators: Validators.required,
          updateOn: 'blur',
        });
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
          .withContext('Expected value to remain unchanged until second blur.')
          .toEqual('Nancy');
        expect(control.valid)
          .withContext('Expected validation not to run until second blur.')
          .toBe(true);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(control.value)
          .withContext('Expected value to update when blur occurs again.')
          .toEqual('');
        expect(control.valid)
          .withContext('Expected validation to run when blur occurs again.')
          .toBe(false);
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

        expect(input.value)
          .withContext('Expected programmatic value to stick after blur.')
          .toEqual('Nancy');
      });

      it('should set initial value and validity on init', () => {
        const fixture = initTest(FormControlComp);
        const control = new FormControl('Nancy', {
          validators: Validators.maxLength(3),
          updateOn: 'blur',
        });
        fixture.componentInstance.control = control;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(input.value).withContext('Expected value to be set in the view.').toEqual('Nancy');
        expect(control.value)
          .withContext('Expected initial model value to be set.')
          .toEqual('Nancy');
        expect(control.valid)
          .withContext('Expected validation to run on initial value.')
          .toBe(false);
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
        expect(control.dirty).withContext('Expected control to be dirty on blur.').toBe(true);

        control.reset();

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(input.value).withContext('Expected view value to reset').toEqual('');
        expect(control.value).withContext('Expected pending value to reset.').toBe(null);
        expect(control.dirty).withContext('Expected pending dirty value to reset.').toBe(false);
      });

      it('should be able to remove a control as a result of another control being reset', () => {
        @Component({
          template: `
              <form [formGroup]="form">
                <input formControlName="name">
                <input formControlName="surname">
              </form>
            `,
          standalone: false,
        })
        class App implements OnDestroy {
          private _subscription: Subscription;

          form: FormGroup = new FormGroup({
            name: new FormControl('Frodo'),
            surname: new FormControl('Baggins'),
          });

          constructor() {
            this._subscription = this.form.controls['name'].valueChanges.subscribe((value) => {
              if (!value) {
                this.form.removeControl('surname');
              }
            });
          }

          ngOnDestroy() {
            this._subscription.unsubscribe();
          }
        }

        const fixture = initTest(App);
        fixture.detectChanges();
        expect(fixture.componentInstance.form.value).toEqual({name: 'Frodo', surname: 'Baggins'});

        expect(() => {
          fixture.componentInstance.form.reset();
          fixture.detectChanges();
        }).not.toThrow();

        expect(fixture.componentInstance.form.value).toEqual({name: null});
      });

      it('should not emit valueChanges or statusChanges until blur', () => {
        const fixture = initTest(FormControlComp);
        const control: FormControl = new FormControl('', {
          validators: Validators.required,
          updateOn: 'blur',
        });
        fixture.componentInstance.control = control;
        fixture.detectChanges();
        const values: string[] = [];

        const sub = merge(control.valueChanges, control.statusChanges).subscribe((val) =>
          values.push(val),
        );

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        input.value = 'Nancy';
        dispatchEvent(input, 'input');
        fixture.detectChanges();

        expect(values)
          .withContext('Expected no valueChanges or statusChanges on input.')
          .toEqual([]);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(values)
          .withContext('Expected valueChanges and statusChanges on blur.')
          .toEqual(['Nancy', 'VALID']);

        sub.unsubscribe();
      });

      it('should not emit valueChanges or statusChanges on blur if value unchanged', () => {
        const fixture = initTest(FormControlComp);
        const control: FormControl = new FormControl('', {
          validators: Validators.required,
          updateOn: 'blur',
        });
        fixture.componentInstance.control = control;
        fixture.detectChanges();
        const values: string[] = [];

        const sub = merge(control.valueChanges, control.statusChanges).subscribe((val) =>
          values.push(val),
        );

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        dispatchEvent(input, 'blur');
        fixture.detectChanges();
        expect(values)
          .withContext('Expected no valueChanges or statusChanges if value unchanged.')
          .toEqual([]);

        input.value = 'Nancy';
        dispatchEvent(input, 'input');
        fixture.detectChanges();
        expect(values)
          .withContext('Expected no valueChanges or statusChanges on input.')
          .toEqual([]);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();
        expect(values).toEqual(
          ['Nancy', 'VALID'],
          'Expected valueChanges and statusChanges on blur if value changed.',
        );

        dispatchEvent(input, 'blur');
        fixture.detectChanges();
        expect(values).toEqual(
          ['Nancy', 'VALID'],
          'Expected valueChanges and statusChanges not to fire again on blur unless value changed.',
        );

        input.value = 'Bess';
        dispatchEvent(input, 'input');
        fixture.detectChanges();
        expect(values).toEqual(
          ['Nancy', 'VALID'],
          'Expected valueChanges and statusChanges not to fire on input after blur.',
        );

        dispatchEvent(input, 'blur');
        fixture.detectChanges();
        expect(values).toEqual(
          ['Nancy', 'VALID', 'Bess', 'VALID'],
          'Expected valueChanges and statusChanges to fire again on blur if value changed.',
        );

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
        expect(control.dirty).withContext('Expected control to become pristine.').toBe(false);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(control.dirty).withContext('Expected pending dirty value to reset.').toBe(false);
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

        expect(control.value)
          .withContext('Expected value to remain unchanged until blur.')
          .toEqual('');
        expect(control.valid)
          .withContext('Expected no validation to occur until blur.')
          .toBe(false);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(control.value)
          .withContext('Expected value to change once control is blurred.')
          .toEqual('Nancy');
        expect(control.valid)
          .withContext('Expected validation to run once control is blurred.')
          .toBe(true);
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

        expect(control.value)
          .withContext('Expected value to remain unchanged until blur.')
          .toEqual('');
        expect(control.valid)
          .withContext('Expected no validation to occur until blur.')
          .toBe(false);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(control.value)
          .withContext('Expected value to change once control is blurred.')
          .toEqual('Nancy');
        expect(control.valid)
          .withContext('Expected validation to run once control is blurred.')
          .toBe(true);
      });

      it('should allow child control updateOn blur to override group updateOn', () => {
        const fixture = initTest(NestedFormGroupNameComp);
        const loginControl = new FormControl('', {
          validators: Validators.required,
          updateOn: 'change',
        });
        const passwordControl = new FormControl('', Validators.required);
        const formGroup = new FormGroup(
          {signin: new FormGroup({login: loginControl, password: passwordControl})},
          {updateOn: 'blur'},
        );
        fixture.componentInstance.form = formGroup;
        fixture.detectChanges();

        const [loginInput, passwordInput] = fixture.debugElement.queryAll(By.css('input'));
        loginInput.nativeElement.value = 'Nancy';
        dispatchEvent(loginInput.nativeElement, 'input');
        fixture.detectChanges();

        expect(loginControl.value).withContext('Expected value change on input.').toEqual('Nancy');
        expect(loginControl.valid).withContext('Expected validation to run on input.').toBe(true);

        passwordInput.nativeElement.value = 'Carson';
        dispatchEvent(passwordInput.nativeElement, 'input');
        fixture.detectChanges();

        expect(passwordControl.value)
          .withContext('Expected value to remain unchanged until blur.')
          .toEqual('');
        expect(passwordControl.valid)
          .withContext('Expected no validation to occur until blur.')
          .toBe(false);

        dispatchEvent(passwordInput.nativeElement, 'blur');
        fixture.detectChanges();

        expect(passwordControl.value)
          .withContext('Expected value to change once control is blurred.')
          .toEqual('Carson');
        expect(passwordControl.valid)
          .withContext('Expected validation to run once control is blurred.')
          .toBe(true);
      });
    });

    describe('on submit', () => {
      it('should set initial value and validity on init', () => {
        const fixture = initTest(FormGroupComp);
        const form = new FormGroup({
          login: new FormControl('Nancy', {validators: Validators.required, updateOn: 'submit'}),
        });
        fixture.componentInstance.form = form;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(input.value)
          .withContext('Expected initial value to propagate to view.')
          .toEqual('Nancy');
        expect(form.value).withContext('Expected initial value to be set.').toEqual({
          login: 'Nancy',
        });
        expect(form.valid)
          .withContext('Expected form to run validation on initial value.')
          .toBe(true);
      });

      it('should not update value or validity until submit', () => {
        const fixture = initTest(FormGroupComp);
        const formGroup = new FormGroup({
          login: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });
        fixture.componentInstance.form = formGroup;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        input.value = 'Nancy';
        dispatchEvent(input, 'input');
        fixture.detectChanges();

        expect(formGroup.value)
          .withContext('Expected form value to remain unchanged on input.')
          .toEqual({login: ''});
        expect(formGroup.valid)
          .withContext('Expected form validation not to run on input.')
          .toBe(false);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(formGroup.value)
          .withContext('Expected form value to remain unchanged on blur.')
          .toEqual({login: ''});
        expect(formGroup.valid)
          .withContext('Expected form validation not to run on blur.')
          .toBe(false);

        const form = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(form, 'submit');
        fixture.detectChanges();

        expect(formGroup.value).withContext('Expected form value to update on submit.').toEqual({
          login: 'Nancy',
        });
        expect(formGroup.valid)
          .withContext('Expected form validation to run on submit.')
          .toBe(true);
      });

      it('should not update after submit until a second submit', () => {
        const fixture = initTest(FormGroupComp);
        const formGroup = new FormGroup({
          login: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });
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
          .withContext('Expected value not to change until a second submit.')
          .toEqual({login: 'Nancy'});
        expect(formGroup.valid)
          .withContext('Expected validation not to run until a second submit.')
          .toBe(true);

        dispatchEvent(form, 'submit');
        fixture.detectChanges();

        expect(formGroup.value)
          .withContext('Expected value to update on the second submit.')
          .toEqual({login: ''});
        expect(formGroup.valid)
          .withContext('Expected validation to run on a second submit.')
          .toBe(false);
      });

      it('should not wait for submit to set value programmatically', () => {
        const fixture = initTest(FormGroupComp);
        const formGroup = new FormGroup({
          login: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });
        fixture.componentInstance.form = formGroup;
        fixture.detectChanges();

        formGroup.setValue({login: 'Nancy'});
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(input.value)
          .withContext('Expected view value to update immediately.')
          .toEqual('Nancy');
        expect(formGroup.value).withContext('Expected form value to update immediately.').toEqual({
          login: 'Nancy',
        });
        expect(formGroup.valid)
          .withContext('Expected form validation to run immediately.')
          .toBe(true);
      });

      it('should not update dirty until submit', () => {
        const fixture = initTest(FormGroupComp);
        const formGroup = new FormGroup({login: new FormControl('', {updateOn: 'submit'})});
        fixture.componentInstance.form = formGroup;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        dispatchEvent(input, 'input');
        fixture.detectChanges();

        expect(formGroup.dirty).withContext('Expected dirty not to change on input.').toBe(false);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(formGroup.dirty).withContext('Expected dirty not to change on blur.').toBe(false);

        const form = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(form, 'submit');
        fixture.detectChanges();

        expect(formGroup.dirty).withContext('Expected dirty to update on submit.').toBe(true);
      });

      it('should not update touched until submit', () => {
        const fixture = initTest(FormGroupComp);
        const formGroup = new FormGroup({login: new FormControl('', {updateOn: 'submit'})});
        fixture.componentInstance.form = formGroup;
        fixture.detectChanges();

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(formGroup.touched)
          .withContext('Expected touched not to change until submit.')
          .toBe(false);

        const form = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(form, 'submit');
        fixture.detectChanges();

        expect(formGroup.touched).withContext('Expected touched to update on submit.').toBe(true);
      });

      it('should reset properly', () => {
        const fixture = initTest(FormGroupComp);
        const formGroup = new FormGroup({
          login: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });
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

        expect(input.value).withContext('Expected view value to reset.').toEqual('');
        expect(formGroup.value).withContext('Expected form value to reset').toEqual({login: null});
        expect(formGroup.dirty).withContext('Expected dirty to stay false on reset.').toBe(false);
        expect(formGroup.touched)
          .withContext('Expected touched to stay false on reset.')
          .toBe(false);

        const form = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(form, 'submit');
        fixture.detectChanges();

        expect(formGroup.value).withContext('Expected form value to stay empty on submit').toEqual({
          login: null,
        });
        expect(formGroup.dirty).withContext('Expected dirty to stay false on submit.').toBe(false);
        expect(formGroup.touched)
          .withContext('Expected touched to stay false on submit.')
          .toBe(false);
      });

      it('should not emit valueChanges or statusChanges until submit', () => {
        const fixture = initTest(FormGroupComp);
        const control = new FormControl('', {validators: Validators.required, updateOn: 'submit'});
        const formGroup = new FormGroup({login: control});
        fixture.componentInstance.form = formGroup;
        fixture.detectChanges();

        const values: any[] = [];
        const streams = merge(
          control.valueChanges,
          control.statusChanges,
          formGroup.valueChanges,
          formGroup.statusChanges,
        );
        const sub = streams.subscribe((val) => values.push(val));

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        input.value = 'Nancy';
        dispatchEvent(input, 'input');
        fixture.detectChanges();

        expect(values)
          .withContext('Expected no valueChanges or statusChanges on input')
          .toEqual([]);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(values).withContext('Expected no valueChanges or statusChanges on blur').toEqual([]);

        const form = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(form, 'submit');
        fixture.detectChanges();

        expect(values).toEqual(
          ['Nancy', 'VALID', {login: 'Nancy'}, 'VALID'],
          'Expected valueChanges and statusChanges to update on submit.',
        );

        sub.unsubscribe();
      });

      it('should not emit valueChanges or statusChanges on submit if value unchanged', () => {
        const fixture = initTest(FormGroupComp);
        const control = new FormControl('', {validators: Validators.required, updateOn: 'submit'});
        const formGroup = new FormGroup({login: control});
        fixture.componentInstance.form = formGroup;
        fixture.detectChanges();

        const values: any[] = [];
        const streams = merge(
          control.valueChanges,
          control.statusChanges,
          formGroup.valueChanges,
          formGroup.statusChanges,
        );
        const sub = streams.subscribe((val) => values.push(val));

        const form = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(form, 'submit');
        fixture.detectChanges();
        expect(values)
          .withContext('Expected no valueChanges or statusChanges if value unchanged.')
          .toEqual([]);

        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        input.value = 'Nancy';
        dispatchEvent(input, 'input');
        fixture.detectChanges();
        expect(values)
          .withContext('Expected no valueChanges or statusChanges on input.')
          .toEqual([]);

        dispatchEvent(form, 'submit');
        fixture.detectChanges();
        expect(values).toEqual(
          ['Nancy', 'VALID', {login: 'Nancy'}, 'VALID'],
          'Expected valueChanges and statusChanges on submit if value changed.',
        );

        dispatchEvent(form, 'submit');
        fixture.detectChanges();
        expect(values).toEqual(
          ['Nancy', 'VALID', {login: 'Nancy'}, 'VALID'],
          'Expected valueChanges and statusChanges not to fire again if value unchanged.',
        );

        input.value = 'Bess';
        dispatchEvent(input, 'input');
        fixture.detectChanges();

        expect(values).toEqual(
          ['Nancy', 'VALID', {login: 'Nancy'}, 'VALID'],
          'Expected valueChanges and statusChanges not to fire on input after submit.',
        );

        dispatchEvent(form, 'submit');
        fixture.detectChanges();

        expect(values).toEqual(
          ['Nancy', 'VALID', {login: 'Nancy'}, 'VALID', 'Bess', 'VALID', {login: 'Bess'}, 'VALID'],
          'Expected valueChanges and statusChanges to fire again on submit if value changed.',
        );

        sub.unsubscribe();
      });

      it('should not run validation for onChange controls on submit', () => {
        const validatorSpy = jasmine.createSpy('validator');
        const groupValidatorSpy = jasmine.createSpy('groupValidatorSpy');

        const fixture = initTest(NestedFormGroupNameComp);
        const formGroup = new FormGroup({
          signin: new FormGroup({login: new FormControl(), password: new FormControl()}),
          email: new FormControl('', {updateOn: 'submit'}),
        });
        fixture.componentInstance.form = formGroup;
        fixture.detectChanges();

        formGroup.get('signin.login')!.setValidators(validatorSpy);
        formGroup.get('signin')!.setValidators(groupValidatorSpy);

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

        expect(formGroup.touched).withContext('Expected group to become untouched.').toBe(false);

        const form = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(form, 'submit');
        fixture.detectChanges();

        expect(formGroup.touched)
          .withContext('Expected touched to stay false on submit.')
          .toBe(false);
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

        expect(control.value)
          .withContext('Expected value to remain unchanged until submit.')
          .toEqual('');
        expect(control.valid)
          .withContext('Expected no validation to occur until submit.')
          .toBe(false);

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(control.value)
          .withContext('Expected value to remain unchanged until submit.')
          .toEqual('');
        expect(control.valid)
          .withContext('Expected no validation to occur until submit.')
          .toBe(false);

        const form = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(form, 'submit');
        fixture.detectChanges();

        expect(control.value).withContext('Expected value to change on submit.').toEqual('Nancy');
        expect(control.valid).withContext('Expected validation to run on submit.').toBe(true);
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

        expect(control.value)
          .withContext('Expected value to remain unchanged until submit.')
          .toEqual('');
        expect(control.valid)
          .withContext('Expected no validation to occur until submit.')
          .toBe(false);

        const form = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(form, 'submit');
        fixture.detectChanges();

        expect(control.value)
          .withContext('Expected value to change once control on submit')
          .toEqual('Nancy');
        expect(control.valid).withContext('Expected validation to run on submit.').toBe(true);
      });

      it('should allow child control updateOn submit to override group updateOn', () => {
        const fixture = initTest(NestedFormGroupNameComp);
        const loginControl = new FormControl('', {
          validators: Validators.required,
          updateOn: 'change',
        });
        const passwordControl = new FormControl('', Validators.required);
        const formGroup = new FormGroup(
          {signin: new FormGroup({login: loginControl, password: passwordControl})},
          {updateOn: 'submit'},
        );
        fixture.componentInstance.form = formGroup;
        fixture.detectChanges();

        const [loginInput, passwordInput] = fixture.debugElement.queryAll(By.css('input'));
        loginInput.nativeElement.value = 'Nancy';
        dispatchEvent(loginInput.nativeElement, 'input');
        fixture.detectChanges();

        expect(loginControl.value).withContext('Expected value change on input.').toEqual('Nancy');
        expect(loginControl.valid).withContext('Expected validation to run on input.').toBe(true);

        passwordInput.nativeElement.value = 'Carson';
        dispatchEvent(passwordInput.nativeElement, 'input');
        fixture.detectChanges();

        expect(passwordControl.value)
          .withContext('Expected value to remain unchanged until submit.')
          .toEqual('');
        expect(passwordControl.valid)
          .withContext('Expected no validation to occur until submit.')
          .toBe(false);

        const form = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(form, 'submit');
        fixture.detectChanges();

        expect(passwordControl.value)
          .withContext('Expected value to change on submit.')
          .toEqual('Carson');
        expect(passwordControl.valid)
          .withContext('Expected validation to run on submit.')
          .toBe(true);
      });

      it('should not prevent the default action on forms with method="dialog"', fakeAsync(() => {
        if (typeof HTMLDialogElement === 'undefined') {
          return;
        }

        const fixture = initTest(NativeDialogForm);
        fixture.detectChanges();
        tick();
        const event = dispatchEvent(fixture.componentInstance.form.nativeElement, 'submit');
        fixture.detectChanges();

        expect(event.defaultPrevented).toBe(false);
      }));
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
        fixture.componentInstance.form = new FormGroup({
          'login': new FormControl(''),
          'password': new FormControl(''),
        });
        fixture.detectChanges();
        tick();

        expect(warnSpy.calls.count()).toEqual(1);
        expect(warnSpy.calls.mostRecent().args[0]).toMatch(
          /It looks like you're using ngModel on the same form field as formControlName/gi,
        );

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
        expect(warnSpy.calls.mostRecent().args[0]).toMatch(
          /It looks like you're using ngModel on the same form field as formControl/gi,
        );

        fixture.componentInstance.login = 'some value';
        fixture.detectChanges();
        tick();

        expect(warnSpy.calls.count()).toEqual(1);
      }));

      it('should warn once for each instance when global provider is provided with "always"', fakeAsync(() => {
        TestBed.configureTestingModule({
          declarations: [FormControlNgModel],
          imports: [ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'always'})],
        });

        const fixture = TestBed.createComponent(FormControlNgModel);
        fixture.componentInstance.control = new FormControl('');
        fixture.componentInstance.passwordControl = new FormControl('');
        fixture.detectChanges();
        tick();

        expect(warnSpy.calls.count()).toEqual(2);
        expect(warnSpy.calls.mostRecent().args[0]).toMatch(
          /It looks like you're using ngModel on the same form field as formControl/gi,
        );
      }));

      it('should silence warnings when global provider is provided with "never"', fakeAsync(() => {
        TestBed.configureTestingModule({
          declarations: [FormControlNgModel],
          imports: [ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'})],
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
      fixture.componentInstance.form = new FormGroup({
        'login': new FormControl(''),
        'password': new FormControl(''),
      });
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
      const formGroup = new FormGroup({
        login: new FormControl('', {updateOn: 'submit'}),
        password: new FormControl(''),
      });
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
        .withContext('Expected ngModel value to remain unchanged on input.')
        .toEqual('initial');

      const form = fixture.debugElement.query(By.css('form')).nativeElement;
      dispatchEvent(form, 'submit');
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance.login)
        .withContext('Expected ngModel value to update on submit.')
        .toEqual('Nancy');
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

      checkbox.nativeElement.required = false;
      dispatchEvent(checkbox.nativeElement, 'change');
      fixture.detectChanges();

      expect(checkbox.nativeElement.checked).toBe(true);
      expect(control.hasError('required')).toEqual(false);

      checkbox.nativeElement.checked = false;
      checkbox.nativeElement.required = true;
      dispatchEvent(checkbox.nativeElement, 'change');
      fixture.detectChanges();

      expect(checkbox.nativeElement.checked).toBe(false);
      expect(control.hasError('required')).toEqual(true);
    });

    // Note: this scenario goes against validator function rules were `null` is the only
    // representation of a successful check. However the `Validators.combine` has a side-effect
    // where falsy values are treated as success and `null` is returned from the wrapper function.
    // The goal of this test is to prevent regressions for validators that return falsy values by
    // mistake and rely on the `Validators.compose` side-effects to normalize the value to `null`
    // instead.
    it('should treat validators that return `undefined` as successful', () => {
      const fixture = initTest(FormControlComp);
      const validatorFn = (control: AbstractControl) => control.value ?? undefined;
      const control = new FormControl(undefined, validatorFn);
      fixture.componentInstance.control = control;
      fixture.detectChanges();

      expect(control.status).toBe('VALID');
      expect(control.errors).toBe(null);
    });

    it('should use sync validators defined in html', () => {
      const fixture = initTest(LoginIsEmptyWrapper, LoginIsEmptyValidator);
      const form = new FormGroup({
        'login': new FormControl(''),
        'min': new FormControl(''),
        'max': new FormControl(''),
        'pattern': new FormControl(''),
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
        'pattern': new FormControl(''),
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
        'pattern': new FormControl(''),
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
      expect(fixture.componentInstance.minLen.toString()).toEqual(
        minLength.nativeElement.getAttribute('minlength'),
      );
      expect(fixture.componentInstance.maxLen.toString()).toEqual(
        maxLength.nativeElement.getAttribute('maxlength'),
      );
      expect(fixture.componentInstance.pattern.toString()).toEqual(
        pattern.nativeElement.getAttribute('pattern'),
      );

      fixture.componentInstance.required = false;
      fixture.componentInstance.minLen = null!;
      fixture.componentInstance.maxLen = null!;
      fixture.componentInstance.pattern = null!;
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
        'pattern': new FormControl(''),
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
        'pattern': new FormControl(''),
      });
      fixture.componentInstance.form = newForm;
      fixture.detectChanges();

      fixture.componentInstance.required = false;
      fixture.componentInstance.minLen = null!;
      fixture.componentInstance.maxLen = null!;
      fixture.componentInstance.pattern = null!;
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
      const control = new FormControl('', Validators.required, uniqLoginAsyncValidator('expected'));
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
      const control = new FormControl(
        '',
        Validators.required,
        uniqLoginAsyncValidator('expected', 100),
      );
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

    it('should handle async validation changes in parent and child controls', fakeAsync(() => {
      const fixture = initTest(FormGroupComp);
      const control = new FormControl(
        '',
        Validators.required,
        asyncValidator((c) => !!c.value && c.value.length > 3, 100),
      );
      const form = new FormGroup(
        {'login': control},
        null,
        asyncValidator((c) => c.get('login')!.value.includes('angular'), 200),
      );
      fixture.componentInstance.form = form;
      fixture.detectChanges();
      tick();

      // Initially, the form is invalid because the nested mandatory control is empty
      expect(control.hasError('required')).toEqual(true);
      expect(form.value).toEqual({'login': ''});
      expect(form.invalid).toEqual(true);

      // Setting a value in the form control that will trigger the registered asynchronous
      // validation
      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'angul';
      dispatchEvent(input.nativeElement, 'input');

      // The form control asynchronous validation is in progress (for 100 ms)
      expect(control.pending).toEqual(true);

      tick(100);

      // Now the asynchronous validation has resolved, and since the form control value
      // (`angul`) has a length > 3, the validation is successful
      expect(control.invalid).toEqual(false);

      // Even if the child control is valid, the form control is pending because it is still
      // waiting for its own validation
      expect(form.pending).toEqual(true);

      tick(100);

      // Login form control is valid. However, the form control is invalid because `angul` does
      // not include `angular`
      expect(control.invalid).toEqual(false);
      expect(form.pending).toEqual(false);
      expect(form.invalid).toEqual(true);

      // Setting a value that would be trigger "VALID" form state
      input.nativeElement.value = 'angular!';
      dispatchEvent(input.nativeElement, 'input');

      // Since the form control value changed, its asynchronous validation runs for 100ms
      expect(control.pending).toEqual(true);

      tick(100);

      // Even if the child control is valid, the form control is pending because it is still
      // waiting for its own validation
      expect(control.invalid).toEqual(false);
      expect(form.pending).toEqual(true);

      tick(100);

      // Now, the form is valid because its own asynchronous validation has resolved
      // successfully, because the form control value `angular` includes the `angular` string
      expect(control.invalid).toEqual(false);
      expect(form.pending).toEqual(false);
      expect(form.invalid).toEqual(false);
    }));

    it('should cancel observable properly between validation runs', fakeAsync(() => {
      const fixture = initTest(FormControlComp);
      const resultArr: number[] = [];
      fixture.componentInstance.control = new FormControl(
        '',
        null!,
        observableValidator(resultArr),
      );
      fixture.detectChanges();
      tick(100);

      expect(resultArr.length)
        .withContext(`Expected source observable to emit once on init.`)
        .toEqual(1);

      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'a';
      dispatchEvent(input.nativeElement, 'input');
      fixture.detectChanges();

      input.nativeElement.value = 'aa';
      dispatchEvent(input.nativeElement, 'input');
      fixture.detectChanges();

      tick(100);
      expect(resultArr.length)
        .withContext(`Expected original observable to be canceled on the next value change.`)
        .toEqual(2);
    }));

    describe('enabling validators conditionally', () => {
      it('should not activate minlength and maxlength validators if input is null', () => {
        @Component({
          selector: 'min-max-length-null',
          template: `
                <form [formGroup]="form">
                  <input [formControl]="control" name="control" [minlength]="minlen" [maxlength]="maxlen">
                </form> `,
          standalone: false,
        })
        class MinMaxLengthComponent {
          control: FormControl = new FormControl();
          form: FormGroup = new FormGroup({'control': this.control});
          minlen: number | null = null;
          maxlen: number | null = null;
        }

        const fixture = initTest(MinMaxLengthComponent);
        const control = fixture.componentInstance.control;
        fixture.detectChanges();

        const form = fixture.componentInstance.form;
        const input = fixture.debugElement.query(By.css('input')).nativeElement;

        interface minmax {
          minlength: number | null;
          maxlength: number | null;
        }

        interface state {
          isValid: boolean;
          failedValidator?: string;
        }

        const setInputValue = (value: number) => {
          input.value = value;
          dispatchEvent(input, 'input');
          fixture.detectChanges();
        };
        const setValidatorValues = (values: minmax) => {
          fixture.componentInstance.minlen = values.minlength;
          fixture.componentInstance.maxlen = values.maxlength;
          fixture.detectChanges();
        };
        const verifyValidatorAttrValues = (values: {minlength: any; maxlength: any}) => {
          expect(input.getAttribute('minlength')).toBe(values.minlength);
          expect(input.getAttribute('maxlength')).toBe(values.maxlength);
        };
        const verifyFormState = (state: state) => {
          expect(form.valid).toBe(state.isValid);
          if (state.failedValidator) {
            expect(control!.hasError('minlength')).toEqual(state.failedValidator === 'minlength');
            expect(control!.hasError('maxlength')).toEqual(state.failedValidator === 'maxlength');
          }
        };

        ////////// Actual test scenarios start below //////////
        // 1. Verify that validators are disabled when input is `null`.
        setValidatorValues({minlength: null, maxlength: null});
        verifyValidatorAttrValues({minlength: null, maxlength: null});
        verifyFormState({isValid: true});

        // 2. Verify that setting validator inputs (to a value different from `null`) activate
        // validators.
        setInputValue(12345);
        setValidatorValues({minlength: 2, maxlength: 4});
        verifyValidatorAttrValues({minlength: '2', maxlength: '4'});
        verifyFormState({isValid: false, failedValidator: 'maxlength'});

        // 3. Changing value to the valid range should make the form valid.
        setInputValue(123);
        verifyFormState({isValid: true});

        // 4. Changing value to trigger `minlength` validator.
        setInputValue(1);
        verifyFormState({isValid: false, failedValidator: 'minlength'});

        // 5. Changing validator inputs to verify that attribute values are updated (and the form
        // is now valid).
        setInputValue(1);
        setValidatorValues({minlength: 1, maxlength: 5});
        verifyValidatorAttrValues({minlength: '1', maxlength: '5'});
        verifyFormState({isValid: true});

        // 6. Reset validator inputs back to `null` should deactivate validators.
        setInputValue(123);
        setValidatorValues({minlength: null, maxlength: null});
        verifyValidatorAttrValues({minlength: null, maxlength: null});
        verifyFormState({isValid: true});
      });

      it('should not activate min and max validators if input is null', () => {
        @Component({
          selector: 'min-max-null',
          template: `
                <form [formGroup]="form">
                  <input type="number" [formControl]="control" name="minmaxinput" [min]="minlen" [max]="maxlen">
                </form> `,
          standalone: false,
        })
        class MinMaxComponent {
          control: FormControl = new FormControl();
          form: FormGroup = new FormGroup({'control': this.control});
          minlen: number | null = null;
          maxlen: number | null = null;
        }

        const fixture = initTest(MinMaxComponent);
        const control = fixture.componentInstance.control;
        fixture.detectChanges();

        const form = fixture.componentInstance.form;
        const input = fixture.debugElement.query(By.css('input')).nativeElement;

        interface minmax {
          min: number | null;
          max: number | null;
        }

        interface state {
          isValid: boolean;
          failedValidator?: string;
        }

        const setInputValue = (value: number) => {
          input.value = value;
          dispatchEvent(input, 'input');
          fixture.detectChanges();
        };
        const setValidatorValues = (values: minmax) => {
          fixture.componentInstance.minlen = values.min;
          fixture.componentInstance.maxlen = values.max;
          fixture.detectChanges();
        };
        const verifyValidatorAttrValues = (values: {min: any; max: any}) => {
          expect(input.getAttribute('min')).toBe(values.min);
          expect(input.getAttribute('max')).toBe(values.max);
        };
        const verifyFormState = (state: state) => {
          expect(form.valid).toBe(state.isValid);
          if (state.failedValidator) {
            expect(control!.hasError('min')).toEqual(state.failedValidator === 'min');
            expect(control!.hasError('max')).toEqual(state.failedValidator === 'max');
          }
        };

        ////////// Actual test scenarios start below //////////
        // 1. Verify that validators are disabled when input is `null`.
        setValidatorValues({min: null, max: null});
        verifyValidatorAttrValues({min: null, max: null});
        verifyFormState({isValid: true});

        // 2. Verify that setting validator inputs (to a value different from `null`) activate
        // validators.
        setInputValue(12345);
        setValidatorValues({min: 2, max: 4});
        verifyValidatorAttrValues({min: '2', max: '4'});
        verifyFormState({isValid: false, failedValidator: 'max'});

        // 3. Changing value to the valid range should make the form valid.
        setInputValue(3);
        verifyFormState({isValid: true});

        // 4. Changing value to trigger `minlength` validator.
        setInputValue(1);
        verifyFormState({isValid: false, failedValidator: 'min'});

        // 5. Changing validator inputs to verify that attribute values are updated (and the form
        // is now valid).
        setInputValue(1);
        setValidatorValues({min: 1, max: 5});
        verifyValidatorAttrValues({min: '1', max: '5'});
        verifyFormState({isValid: true});

        // 6. Reset validator inputs back to `null` should deactivate validators.
        setInputValue(123);
        setValidatorValues({min: null, max: null});
        verifyValidatorAttrValues({min: null, max: null});
        verifyFormState({isValid: true});
      });
    });

    describe('min and max validators', () => {
      function getComponent(dir: string): Type<MinMaxFormControlComp | MinMaxFormControlNameComp> {
        return dir === 'formControl' ? MinMaxFormControlComp : MinMaxFormControlNameComp;
      }
      // Run tests for both `FormControlName` and `FormControl` directives
      ['formControl', 'formControlName'].forEach((dir: string) => {
        it('should validate max', () => {
          const fixture = initTest(getComponent(dir));
          const control = new FormControl(5);
          fixture.componentInstance.control = control;
          fixture.componentInstance.form = new FormGroup({'pin': control});
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          const form = fixture.componentInstance.form;

          expect(input.value).toEqual('5');
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          input.value = 2;
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: 2});
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          fixture.componentInstance.max = 1;
          fixture.detectChanges();

          expect(input.getAttribute('max')).toEqual('1');
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({max: {max: 1, actual: 2}});

          fixture.componentInstance.min = 0;
          fixture.componentInstance.max = 0;
          fixture.detectChanges();
          expect(input.getAttribute('min')).toEqual('0');
          expect(input.getAttribute('max')).toEqual('0');
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({max: {max: 0, actual: 2}});

          input.value = 0;
          dispatchEvent(input, 'input');
          fixture.detectChanges();
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();
        });

        it('should validate max for float number', () => {
          const fixture = initTest(getComponent(dir));
          const control = new FormControl(10.25);
          fixture.componentInstance.control = control;
          fixture.componentInstance.form = new FormGroup({'pin': control});
          fixture.componentInstance.max = 10.35;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          const form = fixture.componentInstance.form;

          expect(input.getAttribute('max')).toEqual('10.35');
          expect(input.value).toEqual('10.25');
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          input.value = 10.15;
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: 10.15});
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          fixture.componentInstance.max = 10.05;
          fixture.detectChanges();

          expect(input.getAttribute('max')).toEqual('10.05');
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({max: {max: 10.05, actual: 10.15}});

          input.value = 10.01;
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: 10.01});
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();
        });

        it('should apply max validation when control value is defined as a string', () => {
          const fixture = initTest(getComponent(dir));
          const control = new FormControl('5');
          fixture.componentInstance.control = control;
          fixture.componentInstance.form = new FormGroup({'pin': control});
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          const form = fixture.componentInstance.form;

          expect(input.value).toEqual('5');
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          input.value = '2';
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: 2});
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          fixture.componentInstance.max = 1;
          fixture.detectChanges();
          expect(input.getAttribute('max')).toEqual('1');
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({max: {max: 1, actual: 2}});
        });

        it('should validate min', () => {
          const fixture = initTest(getComponent(dir));
          const control = new FormControl(5);
          fixture.componentInstance.control = control;
          fixture.componentInstance.form = new FormGroup({'pin': control});
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          const form = fixture.componentInstance.form;

          expect(input.value).toEqual('5');
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          input.value = 2;
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: 2});
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          fixture.componentInstance.min = 5;
          fixture.detectChanges();
          expect(input.getAttribute('min')).toEqual('5');
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({min: {min: 5, actual: 2}});

          fixture.componentInstance.min = 0;
          input.value = -5;
          dispatchEvent(input, 'input');
          fixture.detectChanges();
          expect(input.getAttribute('min')).toEqual('0');
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({min: {min: 0, actual: -5}});

          input.value = 0;
          dispatchEvent(input, 'input');
          fixture.detectChanges();
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();
        });

        it('should validate min for float number', () => {
          const fixture = initTest(getComponent(dir));
          const control = new FormControl(10.25);
          fixture.componentInstance.control = control;
          fixture.componentInstance.form = new FormGroup({'pin': control});
          fixture.componentInstance.max = 10.5;
          fixture.componentInstance.min = 10.25;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          const form = fixture.componentInstance.form;

          expect(input.getAttribute('min')).toEqual('10.25');
          expect(input.getAttribute('max')).toEqual('10.5');
          expect(input.value).toEqual('10.25');
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          input.value = 10.35;
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: 10.35});
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          fixture.componentInstance.min = 10.4;
          fixture.detectChanges();
          expect(input.getAttribute('min')).toEqual('10.4');
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({min: {min: 10.4, actual: 10.35}});

          input.value = 10.45;
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: 10.45});
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();
        });

        it('should apply min validation when control value is defined as a string', () => {
          const fixture = initTest(getComponent(dir));
          const control = new FormControl('5');
          fixture.componentInstance.control = control;
          fixture.componentInstance.form = new FormGroup({'pin': control});
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          const form = fixture.componentInstance.form;

          expect(input.value).toEqual('5');
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          input.value = '2';
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: 2});
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          fixture.componentInstance.min = 5;
          fixture.detectChanges();
          expect(input.getAttribute('min')).toEqual('5');
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({min: {min: 5, actual: 2}});
        });

        it('should run min/max validation for empty values', () => {
          const fixture = initTest(getComponent(dir));
          const minValidateFnSpy = spyOn(MinValidator.prototype, 'validate');
          const maxValidateFnSpy = spyOn(MaxValidator.prototype, 'validate');

          const control = new FormControl();
          fixture.componentInstance.control = control;
          fixture.componentInstance.form = new FormGroup({'pin': control});
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          const form = fixture.componentInstance.form;

          expect(input.value).toEqual('');
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();
          expect(minValidateFnSpy).toHaveBeenCalled();
          expect(maxValidateFnSpy).toHaveBeenCalled();
        });

        it('should run min/max validation when constraints are represented as strings', () => {
          const fixture = initTest(getComponent(dir));
          const control = new FormControl(5);

          // Run tests when min and max are defined as strings.
          fixture.componentInstance.min = '1';
          fixture.componentInstance.max = '10';

          fixture.componentInstance.control = control;
          fixture.componentInstance.form = new FormGroup({'pin': control});
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          const form = fixture.componentInstance.form;

          expect(input.value).toEqual('5');
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          input.value = 2; // inside [1, 10] range
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: 2});
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          input.value = -2; // outside [1, 10] range
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: -2});
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({min: {min: 1, actual: -2}});

          input.value = 20; // outside [1, 10] range
          dispatchEvent(input, 'input');
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({max: {max: 10, actual: 20}});
        });

        it('should run min/max validation for negative values', () => {
          const fixture = initTest(getComponent(dir));
          const control = new FormControl(-30);
          fixture.componentInstance.control = control;
          fixture.componentInstance.form = new FormGroup({'pin': control});
          fixture.componentInstance.min = -20;
          fixture.componentInstance.max = -10;
          fixture.detectChanges();

          const input = fixture.debugElement.query(By.css('input')).nativeElement;
          const form = fixture.componentInstance.form;

          expect(input.value).toEqual('-30');
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({min: {min: -20, actual: -30}});

          input.value = -15;
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: -15});
          expect(form.valid).toBeTruthy();
          expect(form.controls['pin'].errors).toBeNull();

          input.value = -5;
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: -5});
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({max: {max: -10, actual: -5}});

          input.value = 0;
          dispatchEvent(input, 'input');
          expect(form.value).toEqual({pin: 0});
          expect(form.valid).toBeFalse();
          expect(form.controls['pin'].errors).toEqual({max: {max: -10, actual: 0}});
        });
      });

      it('should fire registerOnValidatorChange for validators attached to the formGroups', () => {
        let registerOnValidatorChangeFired = 0;
        let registerOnAsyncValidatorChangeFired = 0;

        @Directive({
          selector: '[ng-noop-validator]',
          providers: [
            {provide: NG_VALIDATORS, useExisting: forwardRef(() => NoOpValidator), multi: true},
          ],
          standalone: false,
        })
        class NoOpValidator implements Validator {
          @Input() validatorInput = '';

          validate(c: AbstractControl) {
            return null;
          }

          public registerOnValidatorChange(fn: () => void) {
            registerOnValidatorChangeFired++;
          }
        }

        @Directive({
          selector: '[ng-noop-async-validator]',
          providers: [
            {
              provide: NG_ASYNC_VALIDATORS,
              useExisting: forwardRef(() => NoOpAsyncValidator),
              multi: true,
            },
          ],
          standalone: false,
        })
        class NoOpAsyncValidator implements AsyncValidator {
          @Input() validatorInput = '';

          validate(c: AbstractControl) {
            return Promise.resolve(null);
          }

          public registerOnValidatorChange(fn: () => void) {
            registerOnAsyncValidatorChangeFired++;
          }
        }

        @Component({
          selector: 'ng-model-noop-validation',
          template: `
            <form [formGroup]="fooGroup" ng-noop-validator ng-noop-async-validator [validatorInput]="validatorInput">
                <input type="text" formControlName="fooInput">
            </form>
           `,
          standalone: false,
        })
        class NgModelNoOpValidation {
          validatorInput = 'bar';

          fooGroup = new FormGroup({
            fooInput: new FormControl(''),
          });
        }

        const fixture = initTest(NgModelNoOpValidation, NoOpValidator, NoOpAsyncValidator);
        fixture.detectChanges();

        expect(registerOnValidatorChangeFired).toBe(1);
        expect(registerOnAsyncValidatorChangeFired).toBe(1);

        fixture.componentInstance.validatorInput = 'baz';
        fixture.detectChanges();

        // Changing the validator input should not cause the onValidatorChange to be called
        // again.
        expect(registerOnValidatorChangeFired).toBe(1);
        expect(registerOnAsyncValidatorChangeFired).toBe(1);
      });
    });
  });

  describe('errors', () => {
    it("should throw if a form isn't passed into formGroup", () => {
      const fixture = initTest(FormGroupComp);

      expect(() => fixture.detectChanges()).toThrowError(
        new RegExp(`formGroup expects a FormGroup instance`),
      );
    });

    it('should throw if formControlName is used without a control container', () => {
      TestBed.overrideComponent(FormGroupComp, {
        set: {
          template: `
          <input type="text" formControlName="login">
        `,
        },
      });

      const fixture = initTest(FormGroupComp);
      expect(() => fixture.detectChanges()).toThrowMatching((e: Error) => {
        if (
          !e.message.includes(
            `formControlName must be used with a parent formGroup or formArray directive`,
          )
        ) {
          return false;
        }

        if (!e.message.includes(`Affected Form Control name: "login"`)) {
          return false;
        }

        return true;
      });
    });

    it('should throw if formControlName, with an index, is used without a control container', () => {
      TestBed.overrideComponent(FormGroupComp, {
        set: {
          template: `
            <input type="text" [formControlName]="0">
          `,
        },
      });

      const fixture = initTest(FormGroupComp);
      expect(() => fixture.detectChanges()).toThrowMatching((e: Error) => {
        if (
          !e.message.includes(
            `formControlName must be used with a parent formGroup or formArray directive`,
          )
        ) {
          return false;
        }

        if (!e.message.includes(`Affected Form Control index: "0"`)) {
          return false;
        }

        return true;
      });
    });

    it('should throw, without indicating the affected form control, if formControlName is used without a control container', () => {
      TestBed.overrideComponent(FormGroupComp, {
        set: {
          template: `
            <input type="text" formControlName>
          `,
        },
      });

      const fixture = initTest(FormGroupComp);
      expect(() => fixture.detectChanges()).toThrowMatching((e: Error) => {
        if (
          !e.message.includes(
            `formControlName must be used with a parent formGroup or formArray directive`,
          )
        ) {
          return false;
        }

        if (e.message.includes(`Affected Form Control`)) {
          return false;
        }

        return true;
      });
    });

    it('should throw if formControlName is used with NgForm', () => {
      TestBed.overrideComponent(FormGroupComp, {
        set: {
          template: `
          <form>
            <input type="text" formControlName="login">
          </form>
        `,
        },
      });
      const fixture = initTest(FormGroupComp);

      expect(() => fixture.detectChanges()).toThrowError(
        new RegExp(`formControlName must be used with a parent formGroup or formArray directive.`),
      );
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
        `,
        },
      });
      const fixture = initTest(FormGroupComp);

      expect(() => fixture.detectChanges()).toThrowError(
        new RegExp(`formControlName cannot be used with an ngModelGroup parent.`),
      );
    });

    it('should throw if formGroupName is used without a control container', () => {
      TestBed.overrideComponent(FormGroupComp, {
        set: {
          template: `
          <div formGroupName="person">
            <input type="text" formControlName="login">
          </div>
        `,
        },
      });
      const fixture = initTest(FormGroupComp);

      expect(() => fixture.detectChanges()).toThrowError(
        new RegExp(`formGroupName must be used with a parent formGroup directive`),
      );
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
        `,
        },
      });
      const fixture = initTest(FormGroupComp);

      expect(() => fixture.detectChanges()).toThrowError(
        new RegExp(`formGroupName must be used with a parent formGroup directive.`),
      );
    });

    it('should throw if formArrayName is used without a control container', () => {
      TestBed.overrideComponent(FormGroupComp, {
        set: {
          template: `
         <div formArrayName="cities">
           <input type="text" formControlName="login">
         </div>`,
        },
      });
      const fixture = initTest(FormGroupComp);

      expect(() => fixture.detectChanges()).toThrowError(
        new RegExp(`formArrayName must be used with a parent formGroup directive`),
      );
    });

    it('should throw if ngModel is used alone under formGroup', () => {
      TestBed.overrideComponent(FormGroupComp, {
        set: {
          template: `
         <div [formGroup]="form">
           <input type="text" [(ngModel)]="data">
         </div>
        `,
        },
      });
      const fixture = initTest(FormGroupComp);
      fixture.componentInstance.form = new FormGroup({});

      expect(() => fixture.detectChanges()).toThrowError(
        new RegExp(
          `ngModel cannot be used to register form controls with a parent formGroup directive.`,
        ),
      );
    });

    it('should not throw if ngModel is used alone under formGroup with standalone: true', () => {
      TestBed.overrideComponent(FormGroupComp, {
        set: {
          template: `
         <div [formGroup]="form">
            <input type="text" [(ngModel)]="data" [ngModelOptions]="{standalone: true}">
         </div>
        `,
        },
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
        `,
        },
      });
      const fixture = initTest(FormGroupComp);
      fixture.componentInstance.form = new FormGroup({person: new FormGroup({})});

      expect(() => fixture.detectChanges()).toThrowError(
        new RegExp(
          `ngModel cannot be used to register form controls with a parent formGroupName or formArrayName directive.`,
        ),
      );
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
        `,
        },
      });
      const fixture = initTest(FormGroupComp);
      fixture.componentInstance.form = new FormGroup({});

      expect(() => fixture.detectChanges()).toThrowError(
        new RegExp(`ngModelGroup cannot be used with a parent formGroup directive`),
      );
    });

    it('should throw if radio button name does not match formControlName attr', () => {
      TestBed.overrideComponent(FormGroupComp, {
        set: {
          template: `
          <form [formGroup]="form">hav
            <input type="radio" formControlName="food" name="drink" value="chicken">
          </form>`,
        },
      });
      const fixture = initTest(FormGroupComp);
      fixture.componentInstance.form = new FormGroup({'food': new FormControl('fish')});

      expect(() => fixture.detectChanges()).toThrowError(
        new RegExp('If you define both a name and a formControlName'),
      );
    });
  });

  describe('radio groups', () => {
    it('should respect the attr.disabled state as an initial value', () => {
      const fixture = initTest(RadioForm);
      const choice = new FormControl('one');
      const form = new FormGroup({'choice': choice});
      fixture.componentInstance.form = form;
      fixture.detectChanges();

      const oneInput = fixture.debugElement.query(By.css('input'));

      // The 'one' input is initially disabled in the view with [attr.disabled].
      // The model thinks it is enabled. This inconsistent state was retained for backwards
      // compatibility. (See `RadioControlValueAccessor` for details.)
      expect(oneInput.attributes['disabled']).toBe('true');
      expect(choice.disabled).toBe(false);

      // Flipping the attribute back and forth does not change the model
      // as expected. Once the initial `disabled` value is setup, the model
      // becomes the source of truth.
      oneInput.nativeElement.setAttribute('disabled', 'false');
      fixture.detectChanges();
      expect(oneInput.attributes['disabled']).toBe('false');
      expect(choice.disabled).toBe(false);

      oneInput.nativeElement.setAttribute('disabled', 'true');
      fixture.detectChanges();
      expect(oneInput.attributes['disabled']).toBe('true');
      expect(choice.disabled).toBe(false);

      oneInput.nativeElement.setAttribute('disabled', 'false');
      fixture.detectChanges();
      expect(oneInput.attributes['disabled']).toBe('false');
      expect(choice.disabled).toBe(false);
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

      inputEl.triggerEventHandler('compositionstart');

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
      TestBed.overrideComponent(FormControlComp, {
        set: {providers: [{provide: COMPOSITION_BUFFER_MODE, useValue: true}]},
      });
      const fixture = initTest(FormControlComp);
      fixture.componentInstance.control = new FormControl('oldValue');
      fixture.detectChanges();

      const inputEl = fixture.debugElement.query(By.css('input'));
      const inputNativeEl = inputEl.nativeElement;
      expect(inputNativeEl.value).toEqual('oldValue');

      inputEl.triggerEventHandler('compositionstart');

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
      TestBed.overrideComponent(FormControlComp, {
        set: {providers: [{provide: COMPOSITION_BUFFER_MODE, useValue: false}]},
      });
      const fixture = initTest(FormControlComp);
      fixture.componentInstance.control = new FormControl('oldValue');
      fixture.detectChanges();

      const inputEl = fixture.debugElement.query(By.css('input'));
      const inputNativeEl = inputEl.nativeElement;
      expect(inputNativeEl.value).toEqual('oldValue');

      inputEl.triggerEventHandler('compositionstart');

      inputNativeEl.value = 'updatedValue';
      dispatchEvent(inputNativeEl, 'input');
      fixture.detectChanges();

      // formControl should update normally
      expect(fixture.componentInstance.control.value).toEqual('updatedValue');
    });
  });

  describe('cleanup', () => {
    // Symbol that indicates to the verification logic that a certain spy was not expected to be
    // invoked. This symbol is used by the test helpers below.
    const SHOULD_NOT_BE_CALLED = Symbol('SHOULD_NOT_BE_INVOKED');

    function expectValidatorsToBeCalled(
      syncValidatorSpy: jasmine.Spy,
      asyncValidatorSpy: jasmine.Spy,
      expected: {ctx: any; count: number},
    ) {
      [syncValidatorSpy, asyncValidatorSpy].forEach((spy: jasmine.Spy<jasmine.Func>) => {
        spy.calls.all().forEach((call: jasmine.CallInfo<jasmine.Func>) => {
          expect(call.args[0]).toBe(expected.ctx);
        });
        expect(spy).toHaveBeenCalledTimes(expected.count);
      });
    }

    function createValidatorSpy(): jasmine.Spy<jasmine.Func> {
      return jasmine.createSpy('asyncValidator').and.returnValue(null);
    }
    function createAsyncValidatorSpy(): jasmine.Spy<jasmine.Func> {
      return jasmine.createSpy('asyncValidator').and.returnValue(Promise.resolve(null));
    }

    // Sets up a control with validators and value accessors configured for a test.
    function addOwnValidatorsAndAttachSpies(control: AbstractControl, fromView: any = {}): void {
      const validatorSpy = createValidatorSpy();
      const asyncValidatorSpy = createAsyncValidatorSpy();
      const valueChangesSpy = jasmine.createSpy('controlValueChangesListener');
      const debug: any = {
        validatorSpy,
        asyncValidatorSpy,
        valueChangesSpy,
      };
      if (fromView.viewValidators) {
        const [syncValidatorClass, asyncValidatorClass] = fromView.viewValidators;
        debug.viewValidatorSpy = validatorSpyOn(syncValidatorClass);
        debug.viewAsyncValidatorSpy = validatorSpyOn(asyncValidatorClass);
      }
      if (fromView.valueAccessor) {
        debug.valueAccessorSpy = spyOn(fromView.valueAccessor.prototype, 'writeValue');
      }
      (control as any).__debug__ = debug;

      control.valueChanges.subscribe(valueChangesSpy);
      control.setValidators(validatorSpy);
      control.setAsyncValidators(asyncValidatorSpy);
    }

    // Resets all spies associated with given controls.
    function resetSpies(...controls: AbstractControl[]): void {
      controls.forEach((control: any) => {
        const debug = control.__debug__;
        debug.validatorSpy.calls.reset();
        debug.asyncValidatorSpy.calls.reset();
        debug.valueChangesSpy.calls.reset();
        if (debug.viewValidatorSpy) {
          debug.viewValidatorSpy.calls.reset();
        }
        if (debug.viewAsyncValidatorSpy) {
          debug.viewAsyncValidatorSpy.calls.reset();
        }
        if (debug.valueAccessorSpy) {
          debug.valueAccessorSpy.calls.reset();
        }
      });
    }

    // Verifies whether spy calls match expectations.
    function verifySpyCalls(spy: any, expectedContext: any, expectedCallCount?: number) {
      if (expectedContext === SHOULD_NOT_BE_CALLED) {
        expect(spy).not.toHaveBeenCalled();
      } else {
        expect(spy).toHaveBeenCalledWith(expectedContext);
        if (expectedCallCount !== undefined) {
          expect(spy.calls.count()).toBe(expectedCallCount);
        }
      }
    }

    // Verify whether all spies attached to a given control match expectations.
    function verifySpies(control: AbstractControl, expected: any = {}) {
      const debug = (control as any).__debug__;
      const viewValidatorCallCount = expected.viewValidatorCallCount ?? 1;
      const ownValidatorCallCount = expected.ownValidatorCallCount ?? 1;
      const valueAccessorCallCount = expected.valueAccessorCallCount ?? 1;
      verifySpyCalls(debug.validatorSpy, expected.ownValidators, ownValidatorCallCount);
      verifySpyCalls(debug.asyncValidatorSpy, expected.ownValidators, ownValidatorCallCount);
      verifySpyCalls(debug.valueChangesSpy, expected.valueChanges);
      if (debug.viewValidatorSpy) {
        verifySpyCalls(debug.viewValidatorSpy, expected.viewValidators, viewValidatorCallCount);
      }
      if (debug.viewAsyncValidatorSpy) {
        verifySpyCalls(
          debug.viewAsyncValidatorSpy,
          expected.viewValidators,
          viewValidatorCallCount,
        );
      }
      if (debug.valueAccessorSpy) {
        verifySpyCalls(debug.valueAccessorSpy, expected.valueAccessor, valueAccessorCallCount);
      }
    }

    // Init a test with a predefined set of validator and value accessor classes.
    function initCleanupTest(component: Type<any>) {
      const fixture = initTest(
        component,
        ViewValidatorA,
        AsyncViewValidatorA,
        ViewValidatorB,
        AsyncViewValidatorB,
        ViewValidatorC,
        AsyncViewValidatorC,
        ValueAccessorA,
        ValueAccessorB,
      );
      fixture.detectChanges();
      return fixture;
    }

    it('should clean up validators when FormGroup is replaced', () => {
      const fixture = initTest(FormGroupWithValidators, ViewValidatorA, AsyncViewValidatorA);
      fixture.detectChanges();

      const newForm = new FormGroup({login: new FormControl('NEW')});
      const oldForm = fixture.componentInstance.form;

      // Update `form` input with a new value.
      fixture.componentInstance.form = newForm;
      fixture.detectChanges();

      const validatorSpy = validatorSpyOn(ViewValidatorA);
      const asyncValidatorSpy = validatorSpyOn(AsyncViewValidatorA);

      // Calling `setValue` for the OLD form should NOT trigger validator calls.
      oldForm.setValue({login: 'SOME-OLD-VALUE'});
      expect(validatorSpy).not.toHaveBeenCalled();
      expect(asyncValidatorSpy).not.toHaveBeenCalled();

      // Calling `setValue` for the NEW (active) form should trigger validator calls.
      newForm.setValue({login: 'SOME-NEW-VALUE'});
      expectValidatorsToBeCalled(validatorSpy, asyncValidatorSpy, {ctx: newForm, count: 1});
    });

    it('should clean up validators when FormControl inside FormGroup is replaced', () => {
      const fixture = initTest(FormControlWithValidators, ViewValidatorA, AsyncViewValidatorA);
      fixture.detectChanges();

      const newControl = new FormControl('NEW')!;
      const oldControl = fixture.componentInstance.form.get('login')!;

      const validatorSpy = validatorSpyOn(ViewValidatorA);
      const asyncValidatorSpy = validatorSpyOn(AsyncViewValidatorA);

      // Update `login` form control with a new `FormControl` instance.
      fixture.componentInstance.form.removeControl('login');
      fixture.componentInstance.form.addControl('login', newControl);
      fixture.detectChanges();

      validatorSpy.calls.reset();
      asyncValidatorSpy.calls.reset();

      // Calling `setValue` for the OLD control should NOT trigger validator calls.
      oldControl.setValue('SOME-OLD-VALUE');
      expect(validatorSpy).not.toHaveBeenCalled();
      expect(asyncValidatorSpy).not.toHaveBeenCalled();

      // Calling `setValue` for the NEW (active) control should trigger validator calls.
      newControl.setValue('SOME-NEW-VALUE');
      expectValidatorsToBeCalled(validatorSpy, asyncValidatorSpy, {ctx: newControl, count: 1});
    });

    it('should keep control in pending state if async validator never emits', fakeAsync(() => {
      const fixture = initTest(FormControlWithAsyncValidatorFn);
      fixture.detectChanges();

      const control = fixture.componentInstance.form.get('login')!;
      expect(control.status).toBe('PENDING');

      control.setValue('SOME-NEW-VALUE');
      tick();

      // Since validator never emits, we expect a control to be retained in a pending state.
      expect(control.status).toBe('PENDING');
      expect(control.errors).toBe(null);
    }));

    it('should call validators defined via `set[Async]Validators` after view init', () => {
      const fixture = initTest(FormControlWithValidators, ViewValidatorA, AsyncViewValidatorA);
      fixture.detectChanges();

      const control = fixture.componentInstance.form.get('login')!;

      const initialValidatorSpy = validatorSpyOn(ViewValidatorA);
      const initialAsyncValidatorSpy = validatorSpyOn(AsyncViewValidatorA);

      initialValidatorSpy.calls.reset();
      initialAsyncValidatorSpy.calls.reset();

      control.setValue('VALUE-A');

      // Expect initial validators (setup during view creation) to be called.
      expectValidatorsToBeCalled(initialValidatorSpy, initialAsyncValidatorSpy, {
        ctx: control,
        count: 1,
      });

      initialValidatorSpy.calls.reset();
      initialAsyncValidatorSpy.calls.reset();

      // Create new validators and corresponding spies.
      const newValidatorSpy = jasmine.createSpy('newValidator').and.returnValue(null);
      const newAsyncValidatorSpy = jasmine.createSpy('newAsyncValidator').and.returnValue(of(null));

      // Set new validators to a control that is already used in a view.
      // Expect that new validators are applied and old validators are removed.
      control.setValidators(newValidatorSpy);
      control.setAsyncValidators(newAsyncValidatorSpy);

      // Update control value to trigger validation.
      control.setValue('VALUE-B');

      // Verify that initial (inactive) validators were not called.
      expect(initialValidatorSpy).not.toHaveBeenCalled();
      expect(initialAsyncValidatorSpy).not.toHaveBeenCalled();

      // Verify that newly applied validators were executed.
      expectValidatorsToBeCalled(newValidatorSpy, newAsyncValidatorSpy, {ctx: control, count: 1});
    });

    it('should cleanup validators on a control used for multiple `formControlName` directives', () => {
      const fixture = initTest(NgForFormControlWithValidators, ViewValidatorA, AsyncViewValidatorA);
      fixture.detectChanges();

      const newControl = new FormControl('b')!;
      const oldControl = fixture.componentInstance.form.get('login')!;

      const validatorSpy = validatorSpyOn(ViewValidatorA);
      const asyncValidatorSpy = validatorSpyOn(AsyncViewValidatorA);

      // Case 1: replace `login` form control with a new `FormControl` instance.
      fixture.componentInstance.form.removeControl('login');
      fixture.componentInstance.form.addControl('login', newControl);
      fixture.detectChanges();

      // Check that validators were called with a new control as a context
      // and each validator function was called for each control (so 3 times each).
      expectValidatorsToBeCalled(validatorSpy, asyncValidatorSpy, {ctx: newControl, count: 3});

      validatorSpy.calls.reset();
      asyncValidatorSpy.calls.reset();

      // Calling `setValue` for the OLD control should NOT trigger validator calls.
      oldControl.setValue('SOME-OLD-VALUE');
      expect(validatorSpy).not.toHaveBeenCalled();
      expect(asyncValidatorSpy).not.toHaveBeenCalled();

      // Calling `setValue` for the NEW (active) control should trigger validator calls.
      newControl.setValue('SOME-NEW-VALUE');

      // Check that setting a value on a new control triggers validator calls.
      expectValidatorsToBeCalled(validatorSpy, asyncValidatorSpy, {ctx: newControl, count: 3});

      // Case 2: update `logins` to render a new list of elements.
      fixture.componentInstance.logins = ['a', 'b', 'c', 'd', 'e', 'f'];
      fixture.detectChanges();

      validatorSpy.calls.reset();
      asyncValidatorSpy.calls.reset();

      // Calling `setValue` for the NEW (active) control should trigger validator calls.
      newControl.setValue('SOME-NEW-VALUE-2');

      // Check that setting a value on a new control triggers validator calls for updated set
      // of controls (one for each element in the `logins` array).
      expectValidatorsToBeCalled(validatorSpy, asyncValidatorSpy, {ctx: newControl, count: 6});
    });

    it('should cleanup directive-specific callbacks only', () => {
      const fixture = initTest(MultipleFormControls, ViewValidatorA, AsyncViewValidatorA);
      fixture.detectChanges();

      const sharedControl = fixture.componentInstance.control;

      const validatorSpy = validatorSpyOn(ViewValidatorA);
      const asyncValidatorSpy = validatorSpyOn(AsyncViewValidatorA);

      sharedControl.setValue('b');
      fixture.detectChanges();

      // Check that validators were called for each `formControlName` directive instance
      // (2 times total).
      expectValidatorsToBeCalled(validatorSpy, asyncValidatorSpy, {ctx: sharedControl, count: 2});

      // Replace formA with a new instance. This will trigger destroy operation for the
      // `formControlName` directive that is bound to the `control` FormControl instance.
      const newFormA = new FormGroup({login: new FormControl('new-a')});
      fixture.componentInstance.formA = newFormA;
      fixture.detectChanges();

      validatorSpy.calls.reset();
      asyncValidatorSpy.calls.reset();

      // Update control with a new value.
      sharedControl.setValue('d');
      fixture.detectChanges();

      // We should still see an update to the second <input>.
      expect(fixture.nativeElement.querySelector('#login').value).toBe('d');
      expectValidatorsToBeCalled(validatorSpy, asyncValidatorSpy, {ctx: sharedControl, count: 1});
    });

    it('should clean up callbacks when FormControlDirective is destroyed (simple)', () => {
      // Scenario:
      // ---------
      // [formControl] *ngIf

      const control = new FormControl();
      addOwnValidatorsAndAttachSpies(control, {
        viewValidators: [ViewValidatorA, AsyncViewValidatorA],
        valueAccessor: ValueAccessorA,
      });

      @Component({
        selector: 'app',
        template: `
            <input *ngIf="visible" type="text" [formControl]="control" cva-a validators-a>
          `,
        standalone: false,
      })
      class App {
        visible = true;
        control = control;
      }

      const fixture = initCleanupTest(App);

      resetSpies(control);

      // Case 1: update control value and verify all spies were called.
      control.setValue('Initial value');
      fixture.detectChanges();

      verifySpies(control, {
        ownValidators: control,
        viewValidators: control,
        valueAccessor: 'Initial value',
        valueChanges: 'Initial value',
      });

      // Case 2: hide form control and verify no directive-related callbacks
      // (validators, value accessors) were invoked.
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(control);

      control.setValue('Updated Value');

      // Expectation:
      // - FormControlDirective was destroyed and connection to default value accessor and view
      //   validators should also be destroyed.
      verifySpies(control, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: control,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated Value',
      });

      // Case 3: make the form control visible again and verify all callbacks are correctly
      // attached.
      fixture.componentInstance.visible = true;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(control);

      control.setValue('Updated Value (v2)');

      verifySpies(control, {
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Updated Value (v2)',
        valueChanges: 'Updated Value (v2)',
      });
    });

    it('should clean up when FormControlDirective is destroyed (multiple instances)', () => {
      // Scenario:
      // ---------
      // [formControl] *ngIf
      // [formControl]

      const control = new FormControl();
      addOwnValidatorsAndAttachSpies(control, {
        viewValidators: [ViewValidatorA, AsyncViewValidatorA],
        valueAccessor: ValueAccessorA,
      });

      @Component({
        selector: 'app',
        template: `
            <input type="text" [formControl]="control" cva-a validators-a *ngIf="visible">
            <input type="text" [formControl]="control" cva-b>
          `,
        standalone: false,
      })
      class App {
        visible = true;
        control = control;
      }

      const fixture = initCleanupTest(App);

      // Value accessor for the second <input> without *ngIf.
      const valueAccessorBSpy = spyOn(ValueAccessorB.prototype, 'writeValue');

      // Reset all spies.
      valueAccessorBSpy.calls.reset();
      resetSpies(control);

      // Case 1: update control value and verify all spies were called.
      control.setValue('Initial value');
      fixture.detectChanges();

      expect(valueAccessorBSpy).toHaveBeenCalledWith('Initial value');
      verifySpies(control, {
        ownValidators: control,
        viewValidators: control,
        valueAccessor: 'Initial value',
        valueChanges: 'Initial value',
      });

      // Case 2: hide form control and verify no directive-related callbacks
      // (validators, value accessors) were invoked.
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      valueAccessorBSpy.calls.reset();
      resetSpies(control);

      control.setValue('Updated Value');

      // Expectation:
      // - FormControlDirective was destroyed and connection to a value accessor and view
      //   validators should also be destroyed.
      // - Since there is a second instance of the FormControlDirective directive present in the
      //   template, we expect to see calls to value accessor B (since it's applied to
      //   that directive instance) and validators applied on a control instance itself (not a
      //   part of a view setup).
      expect(valueAccessorBSpy).toHaveBeenCalledWith('Updated Value');
      verifySpies(control, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: control,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated Value',
      });
    });

    it('should clean up callbacks when FormControlName directive is destroyed', () => {
      // Scenario:
      // ---------
      // [formGroup]
      //   formControlName *ngIf
      //   formControlName

      const control = new FormControl();
      addOwnValidatorsAndAttachSpies(control, {
        viewValidators: [ViewValidatorA, AsyncViewValidatorA],
        valueAccessor: ValueAccessorA,
      });

      @Component({
        selector: 'app',
        template: `
            <div [formGroup]="group">
              <input type="text" formControlName="control" cva-a validators-a *ngIf="visible">
              <input type="text" formControlName="control" cva-b>
            </div>
          `,
        standalone: false,
      })
      class App {
        visible = true;
        group = new FormGroup({control});
      }

      const fixture = initCleanupTest(App);

      // DefaultValueAccessor will be used for the second <input> where no custom CVA is defined.
      const valueAccessorBSpy = spyOn(ValueAccessorB.prototype, 'writeValue');

      // Reset all spies.
      valueAccessorBSpy.calls.reset();
      resetSpies(control);

      // Case 1: update control value and verify all spies were called.
      control.setValue('Initial value');
      fixture.detectChanges();

      expect(valueAccessorBSpy).toHaveBeenCalledWith('Initial value');
      verifySpies(control, {
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Initial value',
        valueChanges: 'Initial value',
      });

      // Case 2: hide form control and verify no directive-related callbacks
      // (validators, value accessors) were invoked.
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      valueAccessorBSpy.calls.reset();
      resetSpies(control);

      control.setValue('Updated value');

      // Expectation:
      // - `FormControlName` was destroyed and connection to the value accessor A and
      //   validators should also be destroyed.
      // - Since there is a second instance of `FormControlName` directive present in the
      //   template, we expect to see calls to the value accessor B (since it's applied to
      //   that directive instance) and validators applied on a control instance itself (not a
      //   part of a view setup).
      expect(valueAccessorBSpy).toHaveBeenCalledWith('Updated value');
      verifySpies(control, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: control,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated value',
      });
    });

    it('should clean up callbacks when FormGroupDirective is destroyed', () => {
      // Scenario:
      // ---------
      // [formGroup] *ngIf
      //   [formControl]

      const control = new FormControl();
      addOwnValidatorsAndAttachSpies(control, {
        viewValidators: [ViewValidatorA, AsyncViewValidatorA],
        valueAccessor: ValueAccessorA,
      });

      const group = new FormGroup({control});
      addOwnValidatorsAndAttachSpies(group, {
        viewValidators: [ViewValidatorB, AsyncViewValidatorB],
      });

      @Component({
        selector: 'app',
        template: `
            <ng-container *ngIf="visible">
              <div [formGroup]="group" validators-b>
                <input type="text" [formControl]="control" cva-a validators-a>
              </div>
            </ng-container>
          `,
        standalone: false,
      })
      class App {
        visible = true;
        control = control;
        group = group;
      }

      const fixture = initCleanupTest(App);

      resetSpies(group, control);

      // Case 1: update control value and verify that all spies were called.
      control.setValue('Initial value');
      fixture.detectChanges();

      verifySpies(control, {
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Initial value',
        valueChanges: 'Initial value',
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {control: 'Initial value'},
      });

      // Case 2: hide form group and verify that no directive-related callbacks
      // (validators, value accessors) are invoked when we set control value later.
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(group, control);

      control.setValue('Updated value');

      // Expectation:
      // - `FormGroupDirective` and `FormControlDirective` were destroyed, so connection to value
      //   accessor and view validators should also be destroyed.
      // - Own validators directly attached to FormGroup and FormControl should still be invoked.
      verifySpies(control, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: control,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated value',
      });
      verifySpies(group, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: group,
        valueChanges: {control: 'Updated value'},
      });

      // Case 3: make the form control visible again and verify all callbacks are correctly
      // attached and invoked.
      fixture.componentInstance.visible = true;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(group, control);

      control.setValue('Updated value (v2)');

      verifySpies(control, {
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Updated value (v2)',
        valueChanges: 'Updated value (v2)',
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {control: 'Updated value (v2)'},
      });
    });

    it('should clean up when FormControl is destroyed (but parent FormGroup exists)', () => {
      // Scenario:
      // ---------
      // [formGroup]
      //   [formControl] *ngIf

      const control = new FormControl();
      addOwnValidatorsAndAttachSpies(control, {
        viewValidators: [ViewValidatorA, AsyncViewValidatorA],
        valueAccessor: ValueAccessorA,
      });

      const group = new FormGroup({control});
      addOwnValidatorsAndAttachSpies(group, {
        viewValidators: [ViewValidatorB, AsyncViewValidatorB],
      });

      @Component({
        selector: 'app',
        template: `
            <div [formGroup]="group" validators-b>
              <input *ngIf="visible" type="text" [formControl]="control" cva-a validators-a>
            </div>
          `,
        standalone: false,
      })
      class App {
        visible = true;
        control = control;
        group = group;
      }

      const fixture = initCleanupTest(App);

      resetSpies(group, control);

      // Case 1: update control value and verify that all spies were called.
      control.setValue('Initial value');
      fixture.detectChanges();

      verifySpies(control, {
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Initial value',
        valueChanges: 'Initial value',
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {control: 'Initial value'},
      });

      // Case 2: hide form group and verify that no directive-related callbacks
      // (validators, value accessors) are invoked when we set control value later.
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(group, control);

      group.setValue({control: 'Updated value'});

      // Expectation:
      // - `FormControlDirective` was destroyed, so connection to value accessor and view
      //   validators should also be destroyed.
      // - Own validators directly attached to FormGroup and FormControl should still be invoked.
      // - `FormGroupDirective` was *not* destroyed, so all view validators should be invoked.
      verifySpies(control, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: control,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated value',
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {control: 'Updated value'},
      });
    });

    it('should clean up controls produced by *ngFor', () => {
      // Scenario:
      // ---------
      // [formGroup]
      //   [formControl] *ngFor

      const control = new FormControl();
      addOwnValidatorsAndAttachSpies(control, {
        viewValidators: [ViewValidatorA, AsyncViewValidatorA],
        valueAccessor: ValueAccessorA,
      });

      const group = new FormGroup({control});
      addOwnValidatorsAndAttachSpies(group, {
        viewValidators: [ViewValidatorB, AsyncViewValidatorB],
      });

      @Component({
        selector: 'app',
        template: `
            <div [formGroup]="group" validators-b *ngIf="visible">
              <ng-container *ngFor="let login of logins">
                <input type="radio" [value]="login" [formControl]="control" cva-a validators-a>
              </ng-container>
            </div>
          `,
        standalone: false,
      })
      class App {
        visible = true;
        control = control;
        group = group;
        logins = ['a', 'b', 'c'];
      }

      const fixture = initCleanupTest(App);

      resetSpies(group, control);

      // Case 1: update control value and verify that all spies were called.
      control.setValue('Initial value');
      fixture.detectChanges();

      verifySpies(control, {
        viewValidatorCallCount: 3, // since *ngFor produces 3 [formControl]s
        valueAccessorCallCount: 3, // since *ngFor produces 3 [formControl]s
        ownValidatorCallCount: 1,
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Initial value',
        valueChanges: 'Initial value',
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {control: 'Initial value'},
      });

      // Case 2: update the list of logins which would result in cleanups for no longer needed
      // (thus destroyed) directives.
      fixture.componentInstance.logins = ['c', 'd'];
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(group, control);

      control.setValue('Updated value');

      verifySpies(control, {
        viewValidatorCallCount: 2, // since now we have 2 items produced by *ngFor
        valueAccessorCallCount: 2, // since now we have 2 items produced by *ngFor
        ownValidatorCallCount: 1,
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Updated value',
        valueChanges: 'Updated value',
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {control: 'Updated value'},
      });

      // Case 3: hide form group and verify that no directive-related callbacks
      // (validators, value accessors) are invoked when we set control value later.
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(group, control);

      control.setValue('Updated value (v2)');

      verifySpies(control, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: control,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated value (v2)',
      });
      verifySpies(group, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: group,
        valueChanges: {control: 'Updated value (v2)'},
      });
    });

    it('should clean up when FormArrayName is destroyed (but parent FormGroup exists)', () => {
      // Scenario:
      // ---------
      // [formGroup]
      //   formArrayName
      //     formControlName *ngIf

      const control = new FormControl();
      addOwnValidatorsAndAttachSpies(control, {
        viewValidators: [ViewValidatorA, AsyncViewValidatorA],
        valueAccessor: ValueAccessorA,
      });

      const arr = new FormArray([control]);
      addOwnValidatorsAndAttachSpies(arr, {
        viewValidators: [ViewValidatorB, AsyncViewValidatorB],
      });

      const group = new FormGroup({arr});
      addOwnValidatorsAndAttachSpies(group, {
        viewValidators: [ViewValidatorC, AsyncViewValidatorC],
      });

      @Component({
        selector: 'app',
        template: `
            <div [formGroup]="group" validators-c>
              <ng-container formArrayName="arr" validators-b>
                <input *ngIf="visible" type="text" formControlName="0" cva-a validators-a>
              </ng-container>
            </div>
          `,
        standalone: false,
      })
      class App {
        visible = true;
        group = group;
      }

      const fixture = initCleanupTest(App);

      resetSpies(group, arr, control);

      // Case 1: update control value and verify that all spies were called.
      control.setValue('Initial value');
      fixture.detectChanges();

      verifySpies(control, {
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Initial value',
        valueChanges: 'Initial value',
      });
      verifySpies(arr, {
        viewValidators: arr,
        ownValidators: arr,
        valueChanges: ['Initial value'],
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {arr: ['Initial value']},
      });

      // Case 2: hide form group and verify that no directive-related callbacks
      // (validators, value accessors) are invoked when we set control value later.
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(group, arr, control);

      control.setValue('Updated value');

      // Expectation:
      // - `FormControlDirective` was destroyed, so connection to value accessor and view
      //   validators should also be destroyed.
      // - Own validators directly attached to FormGroup, FormArray and FormControl should still
      //   be invoked.
      // - `FormArrayName` was *not* destroyed, so all view validators should be invoked.
      verifySpies(control, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: control,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated value',
      });
      verifySpies(arr, {
        viewValidators: arr,
        ownValidators: arr,
        valueChanges: ['Updated value'],
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {arr: ['Updated value']},
      });
    });

    it('should clean up when FormArrayName is destroyed (but parent FormGroup exists)', () => {
      // Scenario:
      // ---------
      // [formGroup]
      //   formArrayName *ngIf
      //     formControlName

      const control = new FormControl();
      addOwnValidatorsAndAttachSpies(control, {
        viewValidators: [ViewValidatorA, AsyncViewValidatorA],
        valueAccessor: ValueAccessorA,
      });

      const arr = new FormArray([control]);
      addOwnValidatorsAndAttachSpies(arr, {
        viewValidators: [ViewValidatorB, AsyncViewValidatorB],
      });

      const group = new FormGroup({arr});
      addOwnValidatorsAndAttachSpies(group, {
        viewValidators: [ViewValidatorC, AsyncViewValidatorC],
      });

      @Component({
        selector: 'app',
        template: `
            <div [formGroup]="group" validators-c>
              <ng-container *ngIf="visible" formArrayName="arr" validators-b>
                <input type="text" formControlName="0" cva-a validators-a>
              </ng-container>
            </div>
          `,
        standalone: false,
      })
      class App {
        visible = true;
        group = group;
      }

      const fixture = initCleanupTest(App);

      resetSpies(group, arr, control);

      // Case 1: update control value and verify that all spies were called.
      control.setValue('Initial value');
      fixture.detectChanges();

      verifySpies(control, {
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Initial value',
        valueChanges: 'Initial value',
      });
      verifySpies(arr, {
        viewValidators: arr,
        ownValidators: arr,
        valueChanges: ['Initial value'],
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {arr: ['Initial value']},
      });

      // Case 2: hide form group and verify that no directive-related callbacks
      // (validators, value accessors) are invoked when we set control value later.
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(group, arr, control);

      control.setValue('Updated value');

      // Expectation:
      // - `FormArrayName` was destroyed, so connection to view validators should be destroyed.
      // - Own validators directly attached to FormGroup, FormArray and FormControl should still
      //   be invoked.
      verifySpies(control, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: control,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated value',
      });
      verifySpies(arr, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: arr,
        valueChanges: ['Updated value'],
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {arr: ['Updated value']},
      });

      // Case 3: make the form array control available again and verify all callbacks are
      // correctly attached and invoked.
      fixture.componentInstance.visible = true;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(group, arr, control);

      control.setValue('Updated value (v2)');

      verifySpies(control, {
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Updated value (v2)',
        valueChanges: 'Updated value (v2)',
      });
      verifySpies(arr, {
        viewValidators: arr,
        ownValidators: arr,
        valueChanges: ['Updated value (v2)'],
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {arr: ['Updated value (v2)']},
      });
    });

    it('should clean up all child controls when FormGroup is destroyed', () => {
      // Scenario:
      // ---------
      // [formGroup] *ngIf
      //   formArrayName
      //     formControlName

      const control = new FormControl();
      addOwnValidatorsAndAttachSpies(control, {
        viewValidators: [ViewValidatorA, AsyncViewValidatorA],
        valueAccessor: ValueAccessorA,
      });

      const arr = new FormArray([control]);
      addOwnValidatorsAndAttachSpies(arr, {
        viewValidators: [ViewValidatorB, AsyncViewValidatorB],
      });

      const group = new FormGroup({arr});
      addOwnValidatorsAndAttachSpies(group, {
        viewValidators: [ViewValidatorC, AsyncViewValidatorC],
      });

      @Component({
        selector: 'app',
        template: `
            <div [formGroup]="group" validators-c *ngIf="visible">
              <ng-container formArrayName="arr" validators-b>
                <input type="text" formControlName="0" cva-a validators-a>
              </ng-container>
            </div>
          `,
        standalone: false,
      })
      class App {
        visible = true;
        group = group;
      }

      const fixture = initCleanupTest(App);

      resetSpies(group, arr, control);

      // Case 1: update control value and verify that all spies were called.
      control.setValue('Initial value');
      fixture.detectChanges();

      verifySpies(control, {
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Initial value',
        valueChanges: 'Initial value',
      });
      verifySpies(arr, {
        viewValidators: arr,
        ownValidators: arr,
        valueChanges: ['Initial value'],
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {arr: ['Initial value']},
      });

      // Case 2: hide form group and verify that no directive-related callbacks
      // (validators, value accessors) are invoked when we set control value later.
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(group, arr, control);

      control.setValue('Updated value');

      // Expectation:
      // - `FormArrayName` was destroyed, so connection to view validators should be destroyed.
      // - Own validators directly attached to FormGroup, FormArray and FormControl should still
      //   be invoked.
      verifySpies(control, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: control,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated value',
      });
      verifySpies(arr, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: arr,
        valueChanges: ['Updated value'],
      });
      verifySpies(group, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: group,
        valueChanges: {arr: ['Updated value']},
      });

      // Case 3: make the form group available again and verify all callbacks are correctly
      // attached and invoked.
      fixture.componentInstance.visible = true;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(group, arr, control);

      control.setValue('Updated value (v2)');

      verifySpies(control, {
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Updated value (v2)',
        valueChanges: 'Updated value (v2)',
      });
      verifySpies(arr, {
        viewValidators: arr,
        ownValidators: arr,
        valueChanges: ['Updated value (v2)'],
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {arr: ['Updated value (v2)']},
      });
    });

    it('should clean up all child controls (with *ngFor) when FormArrayName is destroyed', () => {
      // Scenario:
      // ---------
      // [formGroup]
      //   formArrayName *ngIf
      //     formControlName *ngFor

      const controlA = new FormControl('A');
      addOwnValidatorsAndAttachSpies(controlA, {
        viewValidators: [ViewValidatorA, AsyncViewValidatorA],
        valueAccessor: ValueAccessorA,
      });

      const controlB = new FormControl('B');
      // Note: since ControlA and ControlB share the same set of validators and value accessor, we
      // add spies just ones while configuring ControlA (it's not possible to add spies multiple
      // times).
      addOwnValidatorsAndAttachSpies(controlB, {});

      const arr = new FormArray([controlA, controlB]);
      addOwnValidatorsAndAttachSpies(arr, {
        viewValidators: [ViewValidatorB, AsyncViewValidatorB],
      });

      const group = new FormGroup({arr});
      addOwnValidatorsAndAttachSpies(group, {
        viewValidators: [ViewValidatorC, AsyncViewValidatorC],
      });

      @Component({
        selector: 'app',
        template: `
            <div [formGroup]="group" validators-c>
              <ng-container formArrayName="arr" validators-b *ngIf="visible">
                <ng-container *ngFor="let i of ids">
                  <input type="text" [formControlName]="i" cva-a validators-a>
                </ng-container>
              </ng-container>
            </div>
          `,
        standalone: false,
      })
      class App {
        visible = true;
        group = group;
        ids = [0, 1];
      }

      const fixture = initCleanupTest(App);

      resetSpies(group, arr, controlA, controlB);

      // Case 1: update control value and verify that all spies were called.
      controlA.setValue('Updated A');
      fixture.detectChanges();

      verifySpies(controlA, {
        viewValidators: controlA,
        ownValidators: controlA,
        valueAccessor: 'Updated A',
        valueChanges: 'Updated A',
      });
      verifySpies(controlB, {
        // ControlB is a sibling to ControlA, so updating ControlA has no effect on ControlB.
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: SHOULD_NOT_BE_CALLED,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: SHOULD_NOT_BE_CALLED,
      });
      verifySpies(arr, {
        viewValidators: arr,
        ownValidators: arr,
        valueChanges: ['Updated A', 'B'],
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {arr: ['Updated A', 'B']},
      });

      // Case 2: remove ControlA from the view by updating the list of ids.
      // Verify that ControlA is detached from the view, but ControlB still works.
      fixture.componentInstance.ids = [1];
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(group, arr, controlA, controlB);

      controlA.setValue('Updated A (v2)');

      verifySpies(controlA, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: controlA,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated A (v2)',
      });
      verifySpies(controlB, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: SHOULD_NOT_BE_CALLED,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: SHOULD_NOT_BE_CALLED,
      });
      verifySpies(arr, {
        viewValidators: arr,
        ownValidators: arr,
        valueChanges: ['Updated A (v2)', 'B'],
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {arr: ['Updated A (v2)', 'B']},
      });

      // Case 3: hide form group and verify that no directive-related callbacks
      // (validators, value accessors) are invoked when we set control value later.
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(group, arr, controlA, controlB);

      controlB.setValue('Updated B');

      // Expectation:
      // - `FormArrayName` was destroyed, so connection to view validators should be destroyed.
      // - Own validators directly attached to FormGroup, FormArray and FormControl should still
      //   be invoked.
      verifySpies(controlA, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: SHOULD_NOT_BE_CALLED,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: SHOULD_NOT_BE_CALLED,
      });
      verifySpies(controlB, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: controlB,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated B',
      });
      verifySpies(arr, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: arr,
        valueChanges: ['Updated A (v2)', 'Updated B'],
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {arr: ['Updated A (v2)', 'Updated B']},
      });
    });

    it('should clean up all child controls when FormGroupName is destroyed', () => {
      // Scenario:
      // ---------
      // [formGroup]
      //   formGroupName *ngIf
      //     formControlName

      const control = new FormControl();
      addOwnValidatorsAndAttachSpies(control, {
        viewValidators: [ViewValidatorA, AsyncViewValidatorA],
        valueAccessor: ValueAccessorA,
      });

      const group = new FormGroup({control});
      addOwnValidatorsAndAttachSpies(group, {
        viewValidators: [ViewValidatorB, AsyncViewValidatorB],
      });

      const root = new FormGroup({group});
      addOwnValidatorsAndAttachSpies(root, {
        viewValidators: [ViewValidatorC, AsyncViewValidatorC],
      });

      @Component({
        selector: 'app',
        template: `
            <div [formGroup]="root" validators-c>
              <ng-container formGroupName="group" validators-b *ngIf="visible">
                <input type="text" formControlName="control" cva-a validators-a>
              </ng-container>
            </div>
          `,
        standalone: false,
      })
      class App {
        visible = true;
        root = root;
      }

      const fixture = initCleanupTest(App);

      resetSpies(root, group, control);

      // Case 1: update control value and verify that all spies were called.
      control.setValue('Initial value');
      fixture.detectChanges();

      verifySpies(control, {
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Initial value',
        valueChanges: 'Initial value',
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {control: 'Initial value'},
      });
      verifySpies(root, {
        viewValidators: root,
        ownValidators: root,
        valueChanges: {group: {control: 'Initial value'}},
      });

      // Case 2: hide form group and verify that no directive-related callbacks
      // (validators, value accessors) are invoked when we set control value later.
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(root, group, control);

      control.setValue('Updated value');

      // Expectation:
      // - `FormGroupName` was destroyed, so connection to view validators should be destroyed.
      // - Own validators directly attached to FormGroups and FormControl should still
      //   be invoked.
      verifySpies(control, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: control,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated value',
      });
      verifySpies(group, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: group,
        valueChanges: {control: 'Updated value'},
      });
      verifySpies(root, {
        viewValidators: root,
        ownValidators: root,
        valueChanges: {group: {control: 'Updated value'}},
      });
    });

    it('should clean up all child controls when FormGroup is destroyed', () => {
      // Scenario:
      // ---------
      // [formGroup] *ngIf
      //   formGroupName
      //     formControlName

      const control = new FormControl();
      addOwnValidatorsAndAttachSpies(control, {
        viewValidators: [ViewValidatorA, AsyncViewValidatorA],
        valueAccessor: ValueAccessorA,
      });

      const group = new FormGroup({control});
      addOwnValidatorsAndAttachSpies(group, {
        viewValidators: [ViewValidatorB, AsyncViewValidatorB],
      });

      const root = new FormGroup({group});
      addOwnValidatorsAndAttachSpies(root, {
        viewValidators: [ViewValidatorC, AsyncViewValidatorC],
      });

      @Component({
        selector: 'app',
        template: `
            <div [formGroup]="root" validators-c *ngIf="visible">
              <ng-container formGroupName="group" validators-b>
                <input type="text" formControlName="control" cva-a validators-a>
              </ng-container>
            </div>
          `,
        standalone: false,
      })
      class App {
        visible = true;
        root = root;
      }

      const fixture = initCleanupTest(App);

      resetSpies(root, group, control);

      // Case 1: update control value and verify that all spies were called.
      control.setValue('Initial value');
      fixture.detectChanges();

      verifySpies(control, {
        viewValidators: control,
        ownValidators: control,
        valueAccessor: 'Initial value',
        valueChanges: 'Initial value',
      });
      verifySpies(group, {
        viewValidators: group,
        ownValidators: group,
        valueChanges: {control: 'Initial value'},
      });
      verifySpies(root, {
        viewValidators: root,
        ownValidators: root,
        valueChanges: {group: {control: 'Initial value'}},
      });

      // Case 2: hide form group and verify that no directive-related callbacks
      // (validators, value accessors) are invoked when we set control value later.
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      // Reset all spies again, prepare for next check.
      resetSpies(root, group, control);

      control.setValue('Updated value');

      // Expectation:
      // - `FormGroup` was destroyed, so connection to view validators should be destroyed.
      // - Own validators directly attached to FormGroups and FormControl should still
      //   be invoked.
      verifySpies(control, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: control,
        valueAccessor: SHOULD_NOT_BE_CALLED,
        valueChanges: 'Updated value',
      });
      verifySpies(group, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: group,
        valueChanges: {control: 'Updated value'},
      });
      verifySpies(root, {
        viewValidators: SHOULD_NOT_BE_CALLED,
        ownValidators: root,
        valueChanges: {group: {control: 'Updated value'}},
      });
    });

    // See https://github.com/angular/angular/issues/40521.
    it('should properly clean up when FormControlName has no CVA', () => {
      @Component({
        selector: 'no-cva-compo',
        template: `
            <form [formGroup]="form">
              <div formControlName="control"></div>
            </form>
          `,
        standalone: false,
      })
      class NoCVAComponent {
        form = new FormGroup({control: new FormControl()});
      }

      const fixture = initTest(NoCVAComponent);
      expect(() => {
        fixture.detectChanges();
      }).toThrowError(
        `NG01203: No value accessor for form control name: 'control'. Find more at https://angular.dev/errors/NG01203`,
      );

      // Making sure that cleanup between tests doesn't cause any issues
      // for not fully initialized controls.
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });

    describe('formArray support', () => {
      @Component({
        selector: 'form-array-comp',
        template: `
          <form #formElement [formArray]="form" (ngSubmit)="event=$event">
            @for(_ of controls; track $index) {
              <input type="text" [formControlName]="$index">
            }
          </form>`,
        standalone: false,
      })
      class FormArrayComp {
        controls = [new FormControl('fish'), new FormControl('cat'), new FormControl('dog')];
        form = new FormArray(this.controls);
        event!: Event;

        @ViewChild('formElement') formElement!: ElementRef<HTMLFormElement>;
      }

      it('basic functionality ', () => {
        const fixture = initTest(FormArrayComp);
        fixture.detectChanges();
        const controls = fixture.componentInstance.controls;

        // model -> view
        const inputs = fixture.debugElement.queryAll(By.css('input'));
        expect(inputs[1].nativeElement.value).toBe('cat');

        inputs[1].nativeElement.value = 'updated value';
        dispatchEvent(inputs[1].nativeElement, 'input');

        // view -> model
        expect(controls[1].value).toEqual('updated value');
      });

      it('should add novalidate by default to form', () => {
        const fixture = initTest(FormArrayComp);
        fixture.detectChanges();

        const form = fixture.debugElement.query(By.css('form'));
        expect(form.nativeElement.getAttribute('novalidate')).toEqual('');
      });

      it('should mark formArray as submitted on submit event', () => {
        const fixture = initTest(FormArrayComp);
        const controls = [new FormControl('fish'), new FormControl('cat'), new FormControl('dog')];
        fixture.detectChanges();

        const formGroupDir = fixture.debugElement.children[0].injector.get(FormArrayDirective);
        expect(formGroupDir.submitted).toBe(false);

        const formEl = fixture.debugElement.query(By.css('form')).nativeElement;
        dispatchEvent(formEl, 'submit');

        fixture.detectChanges();
        expect(formGroupDir.submitted).toEqual(true);
      });

      it('should reset properly', () => {
        const fixture = initTest(FormArrayComp);
        fixture.detectChanges();

        const control = fixture.componentInstance.controls[0];
        const input = fixture.debugElement.query(By.css('input')).nativeElement;

        input.value = 'aa';
        dispatchEvent(input, 'input');
        fixture.detectChanges();

        dispatchEvent(input, 'blur');
        fixture.detectChanges();
        expect(control.dirty).withContext('Expected control to be dirty on blur.').toBe(true);

        control.reset();

        dispatchEvent(input, 'blur');
        fixture.detectChanges();

        expect(input.value).withContext('Expected view value to reset').toEqual('');
        expect(control.value).withContext('Expected pending value to reset.').toBe(null);
        expect(control.dirty).withContext('Expected pending dirty value to reset.').toBe(false);
      });

      it('should support add/removing controls', () => {
        const fixture = initTest(FormArrayComp);
        const controls = fixture.componentInstance.controls;
        fixture.detectChanges();

        let inputs = fixture.debugElement.queryAll(By.css('input'));
        expect(inputs.length).toBe(3);

        controls.push(new FormControl('pineapple'));
        fixture.detectChanges();
        inputs = fixture.debugElement.queryAll(By.css('input'));
        expect(inputs.length).toBe(4);

        controls.pop();
        controls.pop();
        fixture.detectChanges();
        inputs = fixture.debugElement.queryAll(By.css('input'));
        expect(inputs.length).toBe(2);
      });

      it('should support formArrayName', () => {
        @Component({
          template: `
            <form [formArray]="form">
              <form formArrayName="1">
                <input type="text" formControlName="animal" />
              </form>
            </form>
          `,
          standalone: false,
        })
        class FormWithFormArrayName {
          public form = new FormArray([
            new FormGroup({animal: new FormControl('')}),
            new FormGroup({animal: new FormControl('Cat')}),
          ]);
        }

        const fixture = initTest(FormWithFormArrayName);
        fixture.detectChanges();
        const input = fixture.debugElement.query(By.css('input'));
        expect(input.nativeElement.value).toEqual('Cat');
      });
    });
  });
});

/**
 * Creates an async validator using a checker function, a timeout and the error to emit in case of
 * validation failure
 *
 * @param checker A function to decide whether the validator will resolve with success or failure
 * @param timeout When the validation will resolve
 * @param error The error message to be emitted in case of validation failure
 *
 * @returns An async validator created using a checker function, a timeout and the error to emit in
 * case of validation failure
 */
function asyncValidator(
  checker: (c: AbstractControl) => boolean,
  timeout: number = 0,
  error: any = {
    'async': true,
  },
) {
  return (c: AbstractControl) => {
    let resolve: (result: any) => void;
    const promise = new Promise<any>((res) => {
      resolve = res;
    });
    const res = checker(c) ? null : error;
    setTimeout(() => resolve(res), timeout);
    return promise;
  };
}

function uniqLoginAsyncValidator(expectedValue: string, timeout: number = 0) {
  return asyncValidator((c) => c.value === expectedValue, timeout, {'uniqLogin': true});
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
  providers: [{provide: NG_VALIDATORS, useValue: loginIsEmptyGroupValidator, multi: true}],
  standalone: false,
})
class LoginIsEmptyValidator {}

@Directive({
  selector: '[uniq-login-validator]',
  providers: [
    {provide: NG_ASYNC_VALIDATORS, useExisting: forwardRef(() => UniqLoginValidator), multi: true},
  ],
  standalone: false,
})
class UniqLoginValidator implements AsyncValidator {
  @Input('uniq-login-validator') expected: any;

  validate(c: AbstractControl) {
    return uniqLoginAsyncValidator(this.expected)(c);
  }
}

@Component({
  selector: 'form-control-comp',
  template: `<input type="text" [formControl]="control">`,
  standalone: false,
})
class FormControlComp {
  control!: FormControl;
}

@Component({
  selector: 'form-group-comp',
  template: `
    <form [formGroup]="form" (ngSubmit)="event=$event">
      <input type="text" formControlName="login">
    </form>`,
  standalone: false,
})
class FormGroupComp {
  control!: FormControl;
  form!: FormGroup;
  event!: Event;
}

@Component({
  selector: 'nested-form-group-name-comp',
  template: `
    <form [formGroup]="form">
      <div formGroupName="signin" login-is-empty-validator>
        <input formControlName="login">
        <input formControlName="password">
      </div>
      <input *ngIf="form.contains('email')" formControlName="email">
    </form>`,
  standalone: false,
})
class NestedFormGroupNameComp {
  form!: FormGroup;
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
     </form>`,
  standalone: false,
})
class FormArrayComp {
  form!: FormGroup;
  cityArray!: FormArray;
}

@Component({
  selector: 'nested-form-array-name-comp',
  template: `
    <form [formGroup]="form">
      <div formArrayName="arr">
        <input formControlName="0">
      </div>
    </form>
  `,
  standalone: false,
})
class NestedFormArrayNameComp {
  form!: FormGroup;
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
     </div>`,
  standalone: false,
})
class FormArrayNestedGroup {
  form!: FormGroup;
  cityArray!: FormArray;
}

@Component({
  selector: 'form-group-ng-model',
  template: `
  <form [formGroup]="form">
    <input type="text" formControlName="login" [(ngModel)]="login">
    <input type="text" formControlName="password" [(ngModel)]="password">
   </form>`,
  standalone: false,
})
class FormGroupNgModel {
  form!: FormGroup;
  login!: string;
  password!: string;
}

@Component({
  selector: 'form-control-ng-model',
  template: `
    <input type="text" [formControl]="control" [(ngModel)]="login">
    <input type="text" [formControl]="passwordControl" [(ngModel)]="password">
  `,
  standalone: false,
})
class FormControlNgModel {
  control!: FormControl;
  login!: string;
  passwordControl!: FormControl;
  password!: string;
}

@Component({
  selector: 'login-is-empty-wrapper',
  template: `
    <div [formGroup]="form" login-is-empty-validator>
      <input type="text" formControlName="login" required>
      <input type="text" formControlName="min" minlength="3">
      <input type="text" formControlName="max" maxlength="3">
      <input type="text" formControlName="pattern" pattern=".{3,}">
   </div>`,
  standalone: false,
})
class LoginIsEmptyWrapper {
  form!: FormGroup;
}

@Component({
  selector: 'validation-bindings-form',
  template: `
    <div [formGroup]="form">
      <input name="required" type="text" formControlName="login" [required]="required">
      <input name="minlength" type="text" formControlName="min" [minlength]="minLen">
      <input name="maxlength" type="text" formControlName="max" [maxlength]="maxLen">
      <input name="pattern" type="text" formControlName="pattern" [pattern]="pattern">
   </div>`,
  standalone: false,
})
class ValidationBindingsForm {
  form!: FormGroup;
  required!: boolean;
  minLen!: number;
  maxLen!: number;
  pattern!: string;
}

@Component({
  selector: 'form-control-checkbox-validator',
  template: `<input type="checkbox" [formControl]="control">`,
  standalone: false,
})
class FormControlCheckboxRequiredValidator {
  control!: FormControl;
}

@Component({
  selector: 'uniq-login-wrapper',
  template: `
  <div [formGroup]="form">
    <input type="text" formControlName="login" uniq-login-validator="expected">
  </div>`,
  standalone: false,
})
class UniqLoginWrapper {
  form!: FormGroup;
}

@Component({
  selector: 'form-group-with-validators',
  template: `
    <div [formGroup]="form" validators-a>
      <input type="text" formControlName="login">
    </div>
  `,
  standalone: false,
})
class FormGroupWithValidators {
  form = new FormGroup({login: new FormControl('INITIAL')});
}

@Component({
  selector: 'form-control-with-validators',
  template: `
    <div [formGroup]="form">
      <input type="text" formControlName="login">
    </div>
  `,
  standalone: false,
})
class FormControlWithAsyncValidatorFn {
  control = new FormControl('INITIAL');
  form = new FormGroup({login: this.control});

  constructor() {
    this.control.setAsyncValidators(() => {
      return NEVER.pipe(map((_: any) => ({timeoutError: true})));
    });
  }
}

@Component({
  selector: 'form-control-with-validators',
  template: `
    <div [formGroup]="form">
      <input type="text" formControlName="login" validators-a>
    </div>
  `,
  standalone: false,
})
class FormControlWithValidators {
  form: FormGroup = new FormGroup({login: new FormControl('INITIAL')});
}

@Component({
  selector: 'ngfor-form-controls-with-validators',
  template: `
    <div [formGroup]="formA">
      <input type="radio" formControlName="login" validators-a>
    </div>
    <div [formGroup]="formB">
      <input type="text" formControlName="login" validators-a id="login">
    </div>
  `,
  standalone: false,
})
class MultipleFormControls {
  control = new FormControl('a');
  formA = new FormGroup({login: this.control});
  formB = new FormGroup({login: this.control});
}

@Component({
  selector: 'ngfor-form-controls-with-validators',
  template: `
    <div [formGroup]="form">
      <ng-container *ngFor="let login of logins">
        <input type="radio" formControlName="login" [value]="login" validators-a>
      </ng-container>
    </div>
  `,
  standalone: false,
})
class NgForFormControlWithValidators {
  form: FormGroup = new FormGroup({login: new FormControl('a')});
  logins = ['a', 'b', 'c'];
}

@Component({
  selector: 'min-max-form-control-name',
  template: `
    <div [formGroup]="form">
      <input type="number" formControlName="pin" [max]="max" [min]="min">
   </div>`,
  standalone: false,
})
class MinMaxFormControlNameComp {
  control!: FormControl;
  form!: FormGroup;
  min: number | string = 1;
  max: number | string = 10;
}

@Component({
  selector: 'min-max-form-control',
  template: `
    <div [formGroup]="form">
      <input type="number" [formControl]="control" [max]="max" [min]="min">
   </div>`,
  standalone: false,
})
class MinMaxFormControlComp {
  control!: FormControl;
  form!: FormGroup;
  min: number | string = 1;
  max: number | string = 10;
}

@Component({
  template: `
    <dialog open>
      <form #form method="dialog" [formGroup]="formGroup">
        <button>Submit</button>
      </form>
    </dialog>
  `,
  standalone: false,
})
class NativeDialogForm {
  @ViewChild('form') form!: ElementRef<HTMLFormElement>;
  formGroup = new FormGroup({});
}

@Component({
  selector: 'radio-form',
  template: `
  <form [formGroup]="form">
    <input type="radio" formControlName="choice" value="one" [attr.disabled]="true"> One
    <input type="radio" formControlName="choice" value="two"> Two
  </form>
  `,
  standalone: false,
})
export class RadioForm {
  form = new FormGroup({
    choice: new FormControl('one'),
  });
}
