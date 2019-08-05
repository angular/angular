/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input, Type} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AbstractControlOptions, AsyncValidatorFn, ControlValueAccessor, FormControl, FormGroup, FormHooks, FormsModule, NG_FORM_HOOKS, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule, ValidatorFn} from '@angular/forms';
import {By} from '@angular/platform-browser';

{
  describe('reactive forms FormHooks integration tests', () => {

    function initTest<T>(
        formHooks: FormHooks, component: Type<T>, ...directives: Type<any>[]): ComponentFixture<T> {
      TestBed.configureTestingModule({
        declarations: [component, ...directives],
        imports: [FormsModule, ReactiveFormsModule],
        providers: [{provide: NG_FORM_HOOKS, useValue: formHooks}]
      });
      return TestBed.createComponent(component);
    }

    describe('FormHooks', () => {
      let hooks: FormHooks;

      beforeEach(() => {
        hooks = {
          setUpControl(control: FormControl, dir: NgControl): void{},
          cleanUpControl(control: FormControl, dir: NgControl): void{}
        };
      });

      it('setUpControl should be called when control is linked via formControl', () => {
        spyOn(hooks, 'setUpControl');
        const fixture = initTest(hooks, FormControlComp);
        const control = new FormControl('value');
        fixture.componentInstance.control = control;
        fixture.detectChanges();
        expect(hooks.setUpControl).toHaveBeenCalledWith(control, jasmine.any(Object));
      });

      it('cleanUpControl should be called when formControl is changed via formControl', () => {
        const spy = spyOn(hooks, 'cleanUpControl');
        const fixture = initTest(hooks, FormControlComp);
        const control = new FormControl('value');
        fixture.componentInstance.control = control;
        fixture.detectChanges();
        spy.calls.reset();
        fixture.componentInstance.control = new FormControl('other value');
        fixture.detectChanges();
        expect(hooks.cleanUpControl).toHaveBeenCalledWith(control, jasmine.any(Object));
      });

      it('setUpControl should be called when formControl is changed via formControl', () => {
        const spy = spyOn(hooks, 'setUpControl');
        const fixture = initTest(hooks, FormControlComp);
        fixture.componentInstance.control = new FormControl('value');
        fixture.detectChanges();
        spy.calls.reset();
        const newControl = new FormControl('other value');
        fixture.componentInstance.control = newControl;
        fixture.detectChanges();
        expect(hooks.setUpControl).toHaveBeenCalledWith(newControl, jasmine.any(Object));
      });

      it('setUpControl should be called when control is linked via formGroup->formControlName',
         () => {
           spyOn(hooks, 'setUpControl');
           const fixture = initTest(hooks, FormGroupComp);
           const control = new FormControl('value');
           fixture.componentInstance.formGroup = new FormGroup({control: control});
           fixture.detectChanges();
           expect(hooks.setUpControl).toHaveBeenCalledWith(control, jasmine.any(Object));
         });

      it('cleanUpControl should be called when formControlName is changed via formGroup->formControlName',
         () => {
           const spy = spyOn(hooks, 'cleanUpControl');
           const fixture = initTest(hooks, FormGroupComp);
           const control = new FormControl('value');
           const group = new FormGroup({control: control});
           fixture.componentInstance.formGroup = group;
           fixture.detectChanges();
           spy.calls.reset();
           group.setControl('control', new FormControl('other value'));
           fixture.detectChanges();
           expect(hooks.cleanUpControl).toHaveBeenCalledWith(control, jasmine.any(Object));
         });

      it('setUpControl should be called when formControlName is changed via formGroup->formControlName',
         () => {
           const spy = spyOn(hooks, 'setUpControl');
           const fixture = initTest(hooks, FormGroupComp);
           const control = new FormControl('value');
           const group = new FormGroup({control: control});
           fixture.componentInstance.formGroup = group;
           fixture.detectChanges();
           spy.calls.reset();
           const newControl = new FormControl('other value');
           group.setControl('control', newControl);
           fixture.detectChanges();
           expect(hooks.setUpControl).toHaveBeenCalledWith(newControl, jasmine.any(Object));
         });

      it('cleanUpControl should be called when formGroup is changed via formGroup->formControlName',
         () => {
           const spy = spyOn(hooks, 'cleanUpControl');
           const fixture = initTest(hooks, FormGroupComp);
           const control = new FormControl('value');
           fixture.componentInstance.formGroup = new FormGroup({control: control});
           fixture.detectChanges();
           spy.calls.reset();
           fixture.componentInstance.formGroup =
               new FormGroup({control: new FormControl('other value')});
           fixture.detectChanges();
           expect(hooks.cleanUpControl).toHaveBeenCalledWith(control, jasmine.any(Object));
         });

      it('setUpControl should be called when formGroup is changed via formGroup->formControlName',
         () => {
           const spy = spyOn(hooks, 'setUpControl');
           const fixture = initTest(hooks, FormGroupComp);
           const control = new FormControl('value');
           fixture.componentInstance.formGroup = new FormGroup({control: control});
           fixture.detectChanges();
           spy.calls.reset();
           const newControl = new FormControl('other value');
           fixture.componentInstance.formGroup = new FormGroup({control: newControl});
           fixture.detectChanges();
           expect(hooks.setUpControl).toHaveBeenCalledWith(newControl, jasmine.any(Object));
         });
    });

    describe('FormHooks for postfix', () => {
      let hooks: FormHooks;

      beforeEach(() => {
        hooks = {
          setUpControl(control: FormControl, dir: NgControl) {
            const accessor = dir.valueAccessor;
            if (accessor != null && isCustomControlValueAccessor(accessor) &&
                isCustomFormControl(control)) {
              control.registerOnPostfixChange(postfix => accessor.setPostfix(postfix));
              accessor.setPostfix(control.postfix);
            }
          },
          cleanUpControl(control: FormControl, dir: NgControl) {
            if (isCustomFormControl(control)) {
              control.clearPostfixChangeFunctions();
            }
          }
        };
      });

      it('is set at startup', () => {
        const fixture = initTest(hooks, FormCustomControlComp, FormHookCustomControl);
        const control = new CustomFormControl('42');
        control.postfix = 'cm';
        fixture.componentInstance.control = control;
        fixture.detectChanges();
        const customComponent = fixture.debugElement.query(By.css('form-custom-control'))
                                    .componentInstance as FormHookCustomControl;
        expect(customComponent.postfix).toEqual('cm');
      });

      it('is set at change', () => {
        const fixture = initTest(hooks, FormCustomControlComp, FormHookCustomControl);
        const control = new CustomFormControl('42');
        control.postfix = 'cm';
        fixture.componentInstance.control = control;
        fixture.detectChanges();
        control.postfix = 'km';
        fixture.detectChanges();
        const customComponent = fixture.debugElement.query(By.css('form-custom-control'))
                                    .componentInstance as FormHookCustomControl;
        expect(customComponent.postfix).toEqual('km');
      });
    });

  });
}

@Component({selector: 'form-control-comp', template: `<input type="text" [formControl]="control">`})
class FormControlComp {
  // TODO(issue/24571): remove '!'.
  control !: FormControl;
}

@Component({
  selector: 'form-group-comp',
  template: `<form [formGroup]="formGroup"><input type="text" formControlName="control"></form>`
})
class FormGroupComp {
  // TODO(issue/24571): remove '!'.
  formGroup !: FormGroup;
}

@Component({
  selector: 'form-group-name-comp',
  template:
      `<form [formGroup]="formGroup"><div formGroupName="subGroup"><input type="text" formControlName="control"></div></form>`
})
class FormGroupNameComp {
  // TODO(issue/24571): remove '!'.
  formGroup !: FormGroup;
}

@Component({
  selector: 'form-custom-control-comp',
  template: `<form-custom-control [formControl]="control"></form-custom-control>`
})
class FormCustomControlComp {
  // TODO(issue/24571): remove '!'.
  control !: FormControl;
}

interface CustomControlValueAccessor extends ControlValueAccessor {
  setPostfix(postfix: string): void;
}
function isCustomControlValueAccessor(obj: ControlValueAccessor):
    obj is CustomControlValueAccessor {
  return (<CustomControlValueAccessor>obj).setPostfix !== undefined;
}
class CustomFormControl extends FormControl {
  private _onPostfixChange: Function[] = [];
  private _postfix = '';
  get postfix(): string { return this._postfix; }
  set postfix(value: string) {
    this._postfix = value;
    for (let f of this._onPostfixChange) {
      f(value);
    }
  }
  constructor(
      formState: any, validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
      asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null) {
    super(formState, validatorOrOpts, asyncValidator);
  }
  registerOnPostfixChange(fn: (postfix: string) => void): void { this._onPostfixChange.push(fn); }
  clearPostfixChangeFunctions(): void { this._onPostfixChange = []; }
}
function isCustomFormControl(obj: FormControl): obj is CustomFormControl {
  return (<CustomFormControl>obj).registerOnPostfixChange !== undefined;
}

@Component({
  selector: 'form-custom-control',
  template:
      `<input name="custom" [(ngModel)]="model" (ngModelChange)="changeFn($event)" [disabled]="isDisabled"><span class="postfix">{{postfix}}</span>`,
  providers: [{provide: NG_VALUE_ACCESSOR, multi: true, useExisting: FormHookCustomControl}]
})
class FormHookCustomControl implements CustomControlValueAccessor {
  // TODO(issue/24571): remove '!'.
  model !: string;
  @Input('disabled') isDisabled: boolean = false;
  // TODO(issue/24571): remove '!'.
  changeFn !: (value: any) => void;
  postfix = '';

  writeValue(value: any) { this.model = value; }

  registerOnChange(fn: (value: any) => void) { this.changeFn = fn; }

  registerOnTouched() {}

  setDisabledState(isDisabled: boolean) { this.isDisabled = isDisabled; }

  setPostfix(postfix: string) { this.postfix = postfix; }
}
