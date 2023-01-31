/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SimpleChange} from '@angular/core';
import {fakeAsync, flushMicrotasks, tick} from '@angular/core/testing';
import {AbstractControl, CheckboxControlValueAccessor, ControlValueAccessor, DefaultValueAccessor, FormArray, FormArrayName, FormControl, FormControlDirective, FormControlName, FormGroup, FormGroupDirective, FormGroupName, NgControl, NgForm, NgModel, NgModelGroup, SelectControlValueAccessor, SelectMultipleControlValueAccessor, ValidationErrors, Validator, Validators} from '@angular/forms';
import {selectValueAccessor} from '@angular/forms/src/directives/shared';
import {composeValidators} from '@angular/forms/src/validators';

import {asyncValidator} from './util';

class DummyControlValueAccessor implements ControlValueAccessor {
  writtenValue: any;

  registerOnChange(fn: any) {}
  registerOnTouched(fn: any) {}

  writeValue(obj: any): void {
    this.writtenValue = obj;
  }
}

class CustomValidatorDirective implements Validator {
  validate(c: FormControl): ValidationErrors {
    return {'custom': true};
  }
}

{
  describe('Form Directives', () => {
    let defaultAccessor: DefaultValueAccessor;

    beforeEach(() => {
      defaultAccessor = new DefaultValueAccessor(null!, null!, null!);
    });

    describe('shared', () => {
      describe('selectValueAccessor', () => {
        let dir: NgControl;

        beforeEach(() => {
          dir = {path: []} as any;
        });

        it('should throw when given an empty array', () => {
          expect(() => selectValueAccessor(dir, [])).toThrowError();
        });

        it('should throw when accessor is not provided as array', () => {
          expect(() => selectValueAccessor(dir, {} as any[]))
              .toThrowError(
                  'NG01200: Value accessor was not provided as an array for form control with unspecified name attribute. Check that the \`NG_VALUE_ACCESSOR\` token is configured as a \`multi: true\` provider.');
        });

        it('should return the default value accessor when no other provided', () => {
          expect(selectValueAccessor(dir, [defaultAccessor])).toEqual(defaultAccessor);
        });

        it('should return checkbox accessor when provided', () => {
          const checkboxAccessor = new CheckboxControlValueAccessor(null!, null!);
          expect(selectValueAccessor(dir, [
            defaultAccessor, checkboxAccessor
          ])).toEqual(checkboxAccessor);
        });

        it('should return select accessor when provided', () => {
          const selectAccessor = new SelectControlValueAccessor(null!, null!);
          expect(selectValueAccessor(dir, [
            defaultAccessor, selectAccessor
          ])).toEqual(selectAccessor);
        });

        it('should return select multiple accessor when provided', () => {
          const selectMultipleAccessor = new SelectMultipleControlValueAccessor(null!, null!);
          expect(selectValueAccessor(dir, [
            defaultAccessor, selectMultipleAccessor
          ])).toEqual(selectMultipleAccessor);
        });

        it('should throw when more than one build-in accessor is provided', () => {
          const checkboxAccessor = new CheckboxControlValueAccessor(null!, null!);
          const selectAccessor = new SelectControlValueAccessor(null!, null!);
          expect(() => selectValueAccessor(dir, [checkboxAccessor, selectAccessor])).toThrowError();
        });

        it('should return custom accessor when provided', () => {
          const customAccessor: ControlValueAccessor = {} as any;
          const checkboxAccessor = new CheckboxControlValueAccessor(null!, null!);
          expect(selectValueAccessor(dir, <any>[
            defaultAccessor, customAccessor, checkboxAccessor
          ])).toEqual(customAccessor);
        });

        it('should return custom accessor when provided with select multiple', () => {
          const customAccessor: ControlValueAccessor = {} as any;
          const selectMultipleAccessor = new SelectMultipleControlValueAccessor(null!, null!);
          expect(selectValueAccessor(dir, <any>[
            defaultAccessor, customAccessor, selectMultipleAccessor
          ])).toEqual(customAccessor);
        });

        it('should throw when more than one custom accessor is provided', () => {
          const customAccessor: ControlValueAccessor = {} as any;
          expect(() => selectValueAccessor(dir, [customAccessor, customAccessor])).toThrowError();
        });
      });

      describe('composeValidators', () => {
        it('should compose functions', () => {
          const dummy1 = () => ({'dummy1': true});
          const dummy2 = () => ({'dummy2': true});
          const v = composeValidators([dummy1, dummy2])!;
          expect(v(new FormControl(''))).toEqual({'dummy1': true, 'dummy2': true});
        });

        it('should compose validator directives', () => {
          const dummy1 = () => ({'dummy1': true});
          const v = composeValidators([dummy1, new CustomValidatorDirective()])!;
          expect(v(new FormControl(''))).toEqual({'dummy1': true, 'custom': true});
        });
      });
    });

    describe('formGroup', () => {
      let form: FormGroupDirective;
      let formModel: FormGroup;
      let loginControlDir: FormControlName;

      beforeEach(() => {
        form = new FormGroupDirective([], []);
        formModel = new FormGroup({
          'login': new FormControl(),
          'passwords':
              new FormGroup({'password': new FormControl(), 'passwordConfirm': new FormControl()})
        });
        form.form = formModel;

        loginControlDir = new FormControlName(
            form, [Validators.required], [asyncValidator('expected')], [defaultAccessor], null);
        loginControlDir.name = 'login';
        loginControlDir.valueAccessor = new DummyControlValueAccessor();
      });

      it('should reexport control properties', () => {
        expect(form.control).toBe(formModel);
        expect(form.value).toBe(formModel.value);
        expect(form.valid).toBe(formModel.valid);
        expect(form.invalid).toBe(formModel.invalid);
        expect(form.pending).toBe(formModel.pending);
        expect(form.errors).toBe(formModel.errors);
        expect(form.pristine).toBe(formModel.pristine);
        expect(form.dirty).toBe(formModel.dirty);
        expect(form.touched).toBe(formModel.touched);
        expect(form.untouched).toBe(formModel.untouched);
        expect(form.statusChanges).toBe(formModel.statusChanges);
        expect(form.valueChanges).toBe(formModel.valueChanges);
      });

      it('should reexport control methods', () => {
        expect(form.hasError('required')).toBe(formModel.hasError('required'));
        expect(form.getError('required')).toBe(formModel.getError('required'));

        formModel.setErrors({required: true});
        expect(form.hasError('required')).toBe(formModel.hasError('required'));
        expect(form.getError('required')).toBe(formModel.getError('required'));
      });

      describe('addControl', () => {
        it('should throw when no control found', () => {
          const dir = new FormControlName(form, null!, null!, [defaultAccessor], null);
          dir.name = 'invalidName';

          expect(() => form.addControl(dir))
              .toThrowError(new RegExp(`Cannot find control with name: 'invalidName'`));
        });

        it('should throw for a named control when no value accessor', () => {
          const dir = new FormControlName(form, null!, null!, null!, null);
          dir.name = 'login';

          expect(() => form.addControl(dir))
              .toThrowError(new RegExp(
                  `NG01203: No value accessor for form control name: 'login'. Find more at https://angular.io/errors/NG01203`));
        });

        it('should throw when no value accessor with path', () => {
          const group = new FormGroupName(form, null!, null!);
          const dir = new FormControlName(group, null!, null!, null!, null);
          group.name = 'passwords';
          dir.name = 'password';

          expect(() => form.addControl(dir))
              .toThrowError(new RegExp(
                  `NG01203: No value accessor for form control path: 'passwords -> password'. Find more at https://angular.io/errors/NG01203`));
        });

        it('should set up validators', fakeAsync(() => {
             form.addControl(loginControlDir);

             // sync validators are set
             expect(formModel.hasError('required', ['login'])).toBe(true);
             expect(formModel.hasError('async', ['login'])).toBe(false);

             (<FormControl>formModel.get('login')).setValue('invalid value');

             // sync validator passes, running async validators
             expect(formModel.pending).toBe(true);

             tick();

             expect(formModel.hasError('required', ['login'])).toBe(false);
             expect(formModel.hasError('async', ['login'])).toBe(true);
           }));

        it('should write value to the DOM', () => {
          (<FormControl>formModel.get(['login'])).setValue('initValue');

          form.addControl(loginControlDir);

          expect((<any>loginControlDir.valueAccessor).writtenValue).toEqual('initValue');
        });

        it('should add the directive to the list of directives included in the form', () => {
          form.addControl(loginControlDir);
          expect(form.directives).toEqual([loginControlDir]);
        });
      });

      describe('addFormGroup', () => {
        const matchingPasswordsValidator = (g: AbstractControl) => {
          const controls = (g as FormGroup).controls;
          if (controls['password'].value != controls['passwordConfirm'].value) {
            return {'differentPasswords': true};
          } else {
            return null;
          }
        };

        it('should set up validator', fakeAsync(() => {
             const group = new FormGroupName(
                 form, [matchingPasswordsValidator], [asyncValidator('expected')]);
             group.name = 'passwords';
             form.addFormGroup(group);

             (<FormControl>formModel.get(['passwords', 'password'])).setValue('somePassword');
             (<FormControl>formModel.get([
               'passwords', 'passwordConfirm'
             ])).setValue('someOtherPassword');

             // sync validators are set
             expect(formModel.hasError('differentPasswords', ['passwords'])).toEqual(true);

             (<FormControl>formModel.get([
               'passwords', 'passwordConfirm'
             ])).setValue('somePassword');

             // sync validators pass, running async validators
             expect(formModel.pending).toBe(true);

             tick();

             expect(formModel.hasError('async', ['passwords'])).toBe(true);
           }));
      });

      describe('removeControl', () => {
        it('should remove the directive to the list of directives included in the form', () => {
          form.addControl(loginControlDir);
          form.removeControl(loginControlDir);
          expect(form.directives).toEqual([]);
        });
      });

      describe('ngOnChanges', () => {
        it('should update dom values of all the directives', () => {
          form.addControl(loginControlDir);

          (<FormControl>formModel.get(['login'])).setValue('new value');

          form.ngOnChanges({});

          expect((<any>loginControlDir.valueAccessor).writtenValue).toEqual('new value');
        });

        it('should set up a sync validator', () => {
          const formValidator = (c: AbstractControl) => ({'custom': true});
          const f = new FormGroupDirective([formValidator], []);
          f.form = formModel;
          f.ngOnChanges({'form': new SimpleChange(null, null, false)});

          expect(formModel.errors).toEqual({'custom': true});
        });

        it('should set up an async validator', fakeAsync(() => {
             const f = new FormGroupDirective([], [asyncValidator('expected')]);
             f.form = formModel;
             f.ngOnChanges({'form': new SimpleChange(null, null, false)});

             tick();

             expect(formModel.errors).toEqual({'async': true});
           }));
      });
    });

    describe('NgForm', () => {
      let form: NgForm;
      let formModel: FormGroup;
      let loginControlDir: NgModel;
      let personControlGroupDir: NgModelGroup;

      beforeEach(() => {
        form = new NgForm([], []);
        formModel = form.form;

        personControlGroupDir = new NgModelGroup(form, [], []);
        personControlGroupDir.name = 'person';

        loginControlDir = new NgModel(personControlGroupDir, null!, null!, [defaultAccessor]);
        loginControlDir.name = 'login';
        loginControlDir.valueAccessor = new DummyControlValueAccessor();
      });

      it('should reexport control properties', () => {
        expect(form.control).toBe(formModel);
        expect(form.value).toBe(formModel.value);
        expect(form.valid).toBe(formModel.valid);
        expect(form.invalid).toBe(formModel.invalid);
        expect(form.pending).toBe(formModel.pending);
        expect(form.errors).toBe(formModel.errors);
        expect(form.pristine).toBe(formModel.pristine);
        expect(form.dirty).toBe(formModel.dirty);
        expect(form.touched).toBe(formModel.touched);
        expect(form.untouched).toBe(formModel.untouched);
        expect(form.statusChanges).toBe(formModel.statusChanges);
        expect(form.status).toBe(formModel.status);
        expect(form.valueChanges).toBe(formModel.valueChanges);
        expect(form.disabled).toBe(formModel.disabled);
        expect(form.enabled).toBe(formModel.enabled);
      });

      it('should reexport control methods', () => {
        expect(form.hasError('required')).toBe(formModel.hasError('required'));
        expect(form.getError('required')).toBe(formModel.getError('required'));

        formModel.setErrors({required: true});
        expect(form.hasError('required')).toBe(formModel.hasError('required'));
        expect(form.getError('required')).toBe(formModel.getError('required'));
      });

      describe('addControl & addFormGroup', () => {
        it('should create a control with the given name', fakeAsync(() => {
             form.addFormGroup(personControlGroupDir);
             form.addControl(loginControlDir);

             flushMicrotasks();

             expect(formModel.get(['person', 'login'])).not.toBeNull();
           }));

        // should update the form's value and validity
      });

      describe('removeControl & removeFormGroup', () => {
        it('should remove control', fakeAsync(() => {
             form.addFormGroup(personControlGroupDir);
             form.addControl(loginControlDir);

             form.removeFormGroup(personControlGroupDir);
             form.removeControl(loginControlDir);

             flushMicrotasks();

             expect(formModel.get(['person'])).toBeNull();
             expect(formModel.get(['person', 'login'])).toBeNull();
           }));

        // should update the form's value and validity
      });

      it('should set up sync validator', fakeAsync(() => {
           const formValidator = () => ({'custom': true});
           const f = new NgForm([formValidator], []);

           tick();

           expect(f.form.errors).toEqual({'custom': true});
         }));

      it('should set up async validator', fakeAsync(() => {
           const f = new NgForm([], [asyncValidator('expected')]);

           tick();

           expect(f.form.errors).toEqual({'async': true});
         }));
    });

    describe('FormGroupName', () => {
      let formModel: FormGroup;
      let controlGroupDir: FormGroupName;

      beforeEach(() => {
        formModel = new FormGroup({'login': new FormControl(null)});

        const parent = new FormGroupDirective([], []);
        parent.form = new FormGroup({'group': formModel});
        controlGroupDir = new FormGroupName(parent, [], []);
        controlGroupDir.name = 'group';
      });

      it('should reexport control properties', () => {
        expect(controlGroupDir.control).toBe(formModel);
        expect(controlGroupDir.value).toBe(formModel.value);
        expect(controlGroupDir.valid).toBe(formModel.valid);
        expect(controlGroupDir.invalid).toBe(formModel.invalid);
        expect(controlGroupDir.pending).toBe(formModel.pending);
        expect(controlGroupDir.errors).toBe(formModel.errors);
        expect(controlGroupDir.pristine).toBe(formModel.pristine);
        expect(controlGroupDir.dirty).toBe(formModel.dirty);
        expect(controlGroupDir.touched).toBe(formModel.touched);
        expect(controlGroupDir.untouched).toBe(formModel.untouched);
        expect(controlGroupDir.statusChanges).toBe(formModel.statusChanges);
        expect(controlGroupDir.status).toBe(formModel.status);
        expect(controlGroupDir.valueChanges).toBe(formModel.valueChanges);
        expect(controlGroupDir.disabled).toBe(formModel.disabled);
        expect(controlGroupDir.enabled).toBe(formModel.enabled);
      });

      it('should reexport control methods', () => {
        expect(controlGroupDir.hasError('required')).toBe(formModel.hasError('required'));
        expect(controlGroupDir.getError('required')).toBe(formModel.getError('required'));

        formModel.setErrors({required: true});
        expect(controlGroupDir.hasError('required')).toBe(formModel.hasError('required'));
        expect(controlGroupDir.getError('required')).toBe(formModel.getError('required'));
      });
    });

    describe('FormArrayName', () => {
      let formModel: FormArray;
      let formArrayDir: FormArrayName;

      beforeEach(() => {
        const parent = new FormGroupDirective([], []);
        formModel = new FormArray([new FormControl('')]);
        parent.form = new FormGroup({'array': formModel});
        formArrayDir = new FormArrayName(parent, [], []);
        formArrayDir.name = 'array';
      });

      it('should reexport control properties', () => {
        expect(formArrayDir.control).toBe(formModel);
        expect(formArrayDir.value).toBe(formModel.value);
        expect(formArrayDir.valid).toBe(formModel.valid);
        expect(formArrayDir.invalid).toBe(formModel.invalid);
        expect(formArrayDir.pending).toBe(formModel.pending);
        expect(formArrayDir.errors).toBe(formModel.errors);
        expect(formArrayDir.pristine).toBe(formModel.pristine);
        expect(formArrayDir.dirty).toBe(formModel.dirty);
        expect(formArrayDir.touched).toBe(formModel.touched);
        expect(formArrayDir.status).toBe(formModel.status);
        expect(formArrayDir.untouched).toBe(formModel.untouched);
        expect(formArrayDir.disabled).toBe(formModel.disabled);
        expect(formArrayDir.enabled).toBe(formModel.enabled);
      });

      it('should reexport control methods', () => {
        expect(formArrayDir.hasError('required')).toBe(formModel.hasError('required'));
        expect(formArrayDir.getError('required')).toBe(formModel.getError('required'));

        formModel.setErrors({required: true});
        expect(formArrayDir.hasError('required')).toBe(formModel.hasError('required'));
        expect(formArrayDir.getError('required')).toBe(formModel.getError('required'));
      });
    });

    describe('FormControlDirective', () => {
      let controlDir: FormControlDirective;
      let control: FormControl;
      const checkProperties = function(control: FormControl) {
        expect(controlDir.control).toBe(control);
        expect(controlDir.value).toBe(control.value);
        expect(controlDir.valid).toBe(control.valid);
        expect(controlDir.invalid).toBe(control.invalid);
        expect(controlDir.pending).toBe(control.pending);
        expect(controlDir.errors).toBe(control.errors);
        expect(controlDir.pristine).toBe(control.pristine);
        expect(controlDir.dirty).toBe(control.dirty);
        expect(controlDir.touched).toBe(control.touched);
        expect(controlDir.untouched).toBe(control.untouched);
        expect(controlDir.statusChanges).toBe(control.statusChanges);
        expect(controlDir.status).toBe(control.status);
        expect(controlDir.valueChanges).toBe(control.valueChanges);
        expect(controlDir.disabled).toBe(control.disabled);
        expect(controlDir.enabled).toBe(control.enabled);
      };

      beforeEach(() => {
        controlDir = new FormControlDirective([Validators.required], [], [defaultAccessor], null);
        controlDir.valueAccessor = new DummyControlValueAccessor();

        control = new FormControl(null);
        controlDir.form = control;
      });

      it('should reexport control properties', () => {
        checkProperties(control);
      });

      it('should reexport control methods', () => {
        expect(controlDir.hasError('required')).toBe(control.hasError('required'));
        expect(controlDir.getError('required')).toBe(control.getError('required'));

        control.setErrors({required: true});
        expect(controlDir.hasError('required')).toBe(control.hasError('required'));
        expect(controlDir.getError('required')).toBe(control.getError('required'));
      });

      it('should reexport new control properties', () => {
        const newControl = new FormControl(null);
        controlDir.form = newControl;
        controlDir.ngOnChanges({'form': new SimpleChange(control, newControl, false)});

        checkProperties(newControl);
      });

      it('should set up validator', () => {
        expect(control.valid).toBe(true);

        // this will add the required validator and recalculate the validity
        controlDir.ngOnChanges({'form': new SimpleChange(null, control, false)});

        expect(control.valid).toBe(false);
      });
    });

    describe('NgModel', () => {
      let ngModel: NgModel;
      let control: FormControl;

      beforeEach(() => {
        ngModel = new NgModel(
            null!, [Validators.required], [asyncValidator('expected')], [defaultAccessor]);
        ngModel.valueAccessor = new DummyControlValueAccessor();
        control = ngModel.control;
      });

      it('should reexport control properties', () => {
        expect(ngModel.control).toBe(control);
        expect(ngModel.value).toBe(control.value);
        expect(ngModel.valid).toBe(control.valid);
        expect(ngModel.invalid).toBe(control.invalid);
        expect(ngModel.pending).toBe(control.pending);
        expect(ngModel.errors).toBe(control.errors);
        expect(ngModel.pristine).toBe(control.pristine);
        expect(ngModel.dirty).toBe(control.dirty);
        expect(ngModel.touched).toBe(control.touched);
        expect(ngModel.untouched).toBe(control.untouched);
        expect(ngModel.statusChanges).toBe(control.statusChanges);
        expect(ngModel.status).toBe(control.status);
        expect(ngModel.valueChanges).toBe(control.valueChanges);
        expect(ngModel.disabled).toBe(control.disabled);
        expect(ngModel.enabled).toBe(control.enabled);
      });

      it('should reexport control methods', () => {
        expect(ngModel.hasError('required')).toBe(control.hasError('required'));
        expect(ngModel.getError('required')).toBe(control.getError('required'));

        control.setErrors({required: true});
        expect(ngModel.hasError('required')).toBe(control.hasError('required'));
        expect(ngModel.getError('required')).toBe(control.getError('required'));
      });

      it('should throw when no value accessor with named control', () => {
        const namedDir = new NgModel(null!, null!, null!, null!);
        namedDir.name = 'one';

        expect(() => namedDir.ngOnChanges({}))
            .toThrowError(new RegExp(
                `NG01203: No value accessor for form control name: 'one'. Find more at https://angular.io/errors/NG01203`));
      });

      it('should throw when no value accessor with unnamed control', () => {
        const unnamedDir = new NgModel(null!, null!, null!, null!);

        expect(() => unnamedDir.ngOnChanges({}))
            .toThrowError(new RegExp(
                `NG01203: No value accessor for form control unspecified name attribute. Find more at https://angular.io/errors/NG01203`));
      });

      it('should set up validator', fakeAsync(() => {
           // this will add the required validator and recalculate the validity
           ngModel.ngOnChanges({});
           tick();

           expect(ngModel.control.errors).toEqual({'required': true});

           ngModel.control.setValue('someValue');
           tick();

           expect(ngModel.control.errors).toEqual({'async': true});
         }));

      it('should mark as disabled properly', fakeAsync(() => {
           ngModel.ngOnChanges({isDisabled: new SimpleChange('', undefined, false)});
           tick();
           expect(ngModel.control.disabled).toEqual(false);

           ngModel.ngOnChanges({isDisabled: new SimpleChange('', null, false)});
           tick();
           expect(ngModel.control.disabled).toEqual(false);

           ngModel.ngOnChanges({isDisabled: new SimpleChange('', false, false)});
           tick();
           expect(ngModel.control.disabled).toEqual(false);

           ngModel.ngOnChanges({isDisabled: new SimpleChange('', 'false', false)});
           tick();
           expect(ngModel.control.disabled).toEqual(false);

           ngModel.ngOnChanges({isDisabled: new SimpleChange('', 0, false)});
           tick();
           expect(ngModel.control.disabled).toEqual(false);

           ngModel.ngOnChanges({isDisabled: new SimpleChange(null, '', false)});
           tick();
           expect(ngModel.control.disabled).toEqual(true);

           ngModel.ngOnChanges({isDisabled: new SimpleChange(null, 'true', false)});
           tick();
           expect(ngModel.control.disabled).toEqual(true);

           ngModel.ngOnChanges({isDisabled: new SimpleChange(null, true, false)});
           tick();
           expect(ngModel.control.disabled).toEqual(true);

           ngModel.ngOnChanges({isDisabled: new SimpleChange(null, 'anything else', false)});
           tick();
           expect(ngModel.control.disabled).toEqual(true);
         }));
    });

    describe('FormControlName', () => {
      let formModel: FormControl;
      let controlNameDir: FormControlName;

      beforeEach(() => {
        formModel = new FormControl('name');

        const parent = new FormGroupDirective([], []);
        parent.form = new FormGroup({'name': formModel});
        controlNameDir = new FormControlName(parent, [], [], [defaultAccessor], null);
        controlNameDir.name = 'name';
        (controlNameDir as {control: FormControl}).control = formModel;
      });

      it('should reexport control properties', () => {
        expect(controlNameDir.control).toBe(formModel);
        expect(controlNameDir.value).toBe(formModel.value);
        expect(controlNameDir.valid).toBe(formModel.valid);
        expect(controlNameDir.invalid).toBe(formModel.invalid);
        expect(controlNameDir.pending).toBe(formModel.pending);
        expect(controlNameDir.errors).toBe(formModel.errors);
        expect(controlNameDir.pristine).toBe(formModel.pristine);
        expect(controlNameDir.dirty).toBe(formModel.dirty);
        expect(controlNameDir.touched).toBe(formModel.touched);
        expect(controlNameDir.untouched).toBe(formModel.untouched);
        expect(controlNameDir.statusChanges).toBe(formModel.statusChanges);
        expect(controlNameDir.status).toBe(formModel.status);
        expect(controlNameDir.valueChanges).toBe(formModel.valueChanges);
        expect(controlNameDir.disabled).toBe(formModel.disabled);
        expect(controlNameDir.enabled).toBe(formModel.enabled);
      });

      it('should reexport control methods', () => {
        expect(controlNameDir.hasError('required')).toBe(formModel.hasError('required'));
        expect(controlNameDir.getError('required')).toBe(formModel.getError('required'));

        formModel.setErrors({required: true});
        expect(controlNameDir.hasError('required')).toBe(formModel.hasError('required'));
        expect(controlNameDir.getError('required')).toBe(formModel.getError('required'));
      });
    });
  });
}
