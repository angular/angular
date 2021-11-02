/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fakeAsync, tick, waitForAsync} from '@angular/core/testing';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {of} from 'rxjs';

import {asyncValidator, asyncValidatorReturningObservable, currentStateOf, simpleAsyncValidator} from './util';


(function() {
function simpleValidator(c: AbstractControl): ValidationErrors|null {
  return c.get('one')!.value === 'correct' ? null : {'broken': true};
}

function otherObservableValidator() {
  return of({'other': true});
}

describe('FormGroup', () => {
  describe('value', () => {
    it('should be the reduced value of the child controls', () => {
      const g = new FormGroup({'one': new FormControl('111'), 'two': new FormControl('222')});
      expect(g.value).toEqual({'one': '111', 'two': '222'});
    });

    it('should be empty when there are no child controls', () => {
      const g = new FormGroup({});
      expect(g.value).toEqual({});
    });

    it('should support nested groups', () => {
      const g = new FormGroup({
        'one': new FormControl('111'),
        'nested': new FormGroup({'two': new FormControl('222')})
      });
      expect(g.value).toEqual({'one': '111', 'nested': {'two': '222'}});

      (<FormControl>(g.get('nested.two'))).setValue('333');

      expect(g.value).toEqual({'one': '111', 'nested': {'two': '333'}});
    });
  });

  describe('getRawValue', () => {
    let fg: FormGroup;

    it('should work with nested form groups/arrays', () => {
      fg = new FormGroup({
        'c1': new FormControl('v1'),
        'group': new FormGroup({'c2': new FormControl('v2'), 'c3': new FormControl('v3')}),
        'array': new FormArray([new FormControl('v4'), new FormControl('v5')])
      });
      fg.get('group')!.get('c3')!.disable();
      (fg.get('array') as FormArray).at(1).disable();

      expect(fg.getRawValue())
          .toEqual({'c1': 'v1', 'group': {'c2': 'v2', 'c3': 'v3'}, 'array': ['v4', 'v5']});
    });
  });

  describe('markAllAsTouched', () => {
    it('should mark all descendants as touched', () => {
      const formGroup: FormGroup = new FormGroup({
        'c1': new FormControl('v1'),
        'group': new FormGroup({'c2': new FormControl('v2'), 'c3': new FormControl('v3')}),
        'array': new FormArray([
          new FormControl('v4'), new FormControl('v5'), new FormGroup({'c4': new FormControl('v4')})
        ])
      });

      expect(formGroup.touched).toBe(false);

      const control1 = formGroup.get('c1') as FormControl;

      expect(control1.touched).toBe(false);

      const innerGroup = formGroup.get('group') as FormGroup;

      expect(innerGroup.touched).toBe(false);

      const innerGroupFirstChildCtrl = innerGroup.get('c2') as FormControl;

      expect(innerGroupFirstChildCtrl.touched).toBe(false);

      formGroup.markAllAsTouched();

      expect(formGroup.touched).toBe(true);

      expect(control1.touched).toBe(true);

      expect(innerGroup.touched).toBe(true);

      expect(innerGroupFirstChildCtrl.touched).toBe(true);

      const innerGroupSecondChildCtrl = innerGroup.get('c3') as FormControl;

      expect(innerGroupSecondChildCtrl.touched).toBe(true);

      const array = formGroup.get('array') as FormArray;

      expect(array.touched).toBe(true);

      const arrayFirstChildCtrl = array.at(0) as FormControl;

      expect(arrayFirstChildCtrl.touched).toBe(true);

      const arraySecondChildCtrl = array.at(1) as FormControl;

      expect(arraySecondChildCtrl.touched).toBe(true);

      const arrayFirstChildGroup = array.at(2) as FormGroup;

      expect(arrayFirstChildGroup.touched).toBe(true);

      const arrayFirstChildGroupFirstChildCtrl = arrayFirstChildGroup.get('c4') as FormControl;

      expect(arrayFirstChildGroupFirstChildCtrl.touched).toBe(true);
    });
  });

  describe('adding and removing controls', () => {
    let logger: any[];

    beforeEach(() => {
      logger = [];
    });

    it('should update value and validity when control is added', () => {
      const g = new FormGroup({'one': new FormControl('1')});
      expect(g.value).toEqual({'one': '1'});
      expect(g.valid).toBe(true);

      g.addControl('two', new FormControl('2', Validators.minLength(10)));

      expect(g.value).toEqual({'one': '1', 'two': '2'});
      expect(g.valid).toBe(false);
    });

    it('should update value and validity when control is removed', () => {
      const g = new FormGroup(
          {'one': new FormControl('1'), 'two': new FormControl('2', Validators.minLength(10))});
      expect(g.value).toEqual({'one': '1', 'two': '2'});
      expect(g.valid).toBe(false);

      g.removeControl('two');

      expect(g.value).toEqual({'one': '1'});
      expect(g.valid).toBe(true);
    });

    it('should not emit events when `FormGroup.addControl` is called with `emitEvent: false`',
       () => {
         const g = new FormGroup({'one': new FormControl('1')});
         expect(g.value).toEqual({'one': '1'});

         g.valueChanges.subscribe(() => logger.push('value change'));
         g.statusChanges.subscribe(() => logger.push('status change'));

         g.addControl('two', new FormControl('2'), {emitEvent: false});

         expect(g.value).toEqual({'one': '1', 'two': '2'});
         expect(logger).toEqual([]);
       });

    it('should not emit events when `FormGroup.removeControl` is called with `emitEvent: false`',
       () => {
         const g = new FormGroup(
             {'one': new FormControl('1'), 'two': new FormControl('2', Validators.minLength(10))});
         expect(g.value).toEqual({'one': '1', 'two': '2'});
         expect(g.valid).toBe(false);

         g.valueChanges.subscribe(() => logger.push('value change'));
         g.statusChanges.subscribe(() => logger.push('status change'));

         g.removeControl('two', {emitEvent: false});

         expect(g.value).toEqual({'one': '1'});
         expect(g.valid).toBe(true);
         expect(logger).toEqual([]);
       });

    it('should not emit status change events when `FormGroup.addControl` is called with `emitEvent: false`',
       () => {
         const validatorFn = (value: any) =>
             value.controls.invalidCtrl ? {invalidCtrl: true} : null;
         const asyncValidatorFn = (value: any) => of(validatorFn(value));
         const g = new FormGroup({}, validatorFn, asyncValidatorFn);
         expect(g.valid).toBe(true);

         g.statusChanges.subscribe(() => logger.push('status change'));

         g.addControl('invalidCtrl', new FormControl(''), {emitEvent: false});

         expect(g.value).toEqual({'invalidCtrl': ''});
         expect(g.valid).toBe(false);
         expect(logger).toEqual([]);
       });
  });

  describe('dirty', () => {
    let c: FormControl, g: FormGroup;

    beforeEach(() => {
      c = new FormControl('value');
      g = new FormGroup({'one': c});
    });

    it('should be false after creating a control', () => {
      expect(g.dirty).toEqual(false);
    });

    it('should be true after changing the value of the control', () => {
      c.markAsDirty();

      expect(g.dirty).toEqual(true);
    });
  });


  describe('touched', () => {
    let c: FormControl, g: FormGroup;

    beforeEach(() => {
      c = new FormControl('value');
      g = new FormGroup({'one': c});
    });

    it('should be false after creating a control', () => {
      expect(g.touched).toEqual(false);
    });

    it('should be true after control is marked as touched', () => {
      c.markAsTouched();

      expect(g.touched).toEqual(true);
    });
  });

  describe('setValue', () => {
    let c: FormControl, c2: FormControl, g: FormGroup;

    beforeEach(() => {
      c = new FormControl('');
      c2 = new FormControl('');
      g = new FormGroup({'one': c, 'two': c2});
    });

    it('should set its own value', () => {
      g.setValue({'one': 'one', 'two': 'two'});
      expect(g.value).toEqual({'one': 'one', 'two': 'two'});
    });

    it('should set child values', () => {
      g.setValue({'one': 'one', 'two': 'two'});
      expect(c.value).toEqual('one');
      expect(c2.value).toEqual('two');
    });

    it('should set child control values if disabled', () => {
      c2.disable();
      g.setValue({'one': 'one', 'two': 'two'});
      expect(c2.value).toEqual('two');
      expect(g.value).toEqual({'one': 'one'});
      expect(g.getRawValue()).toEqual({'one': 'one', 'two': 'two'});
    });

    it('should set group value if group is disabled', () => {
      g.disable();
      g.setValue({'one': 'one', 'two': 'two'});
      expect(c.value).toEqual('one');
      expect(c2.value).toEqual('two');

      expect(g.value).toEqual({'one': 'one', 'two': 'two'});
    });

    it('should set parent values', () => {
      const form = new FormGroup({'parent': g});
      g.setValue({'one': 'one', 'two': 'two'});
      expect(form.value).toEqual({'parent': {'one': 'one', 'two': 'two'}});
    });

    it('should not update the parent when explicitly specified', () => {
      const form = new FormGroup({'parent': g});
      g.setValue({'one': 'one', 'two': 'two'}, {onlySelf: true});

      expect(form.value).toEqual({parent: {'one': '', 'two': ''}});
    });

    it('should throw if fields are missing from supplied value (subset)', () => {
      expect(() => g.setValue({
        'one': 'one'
      })).toThrowError(new RegExp(`Must supply a value for form control with name: 'two'`));
    });

    it('should throw if a value is provided for a missing control (superset)', () => {
      expect(() => g.setValue({'one': 'one', 'two': 'two', 'three': 'three'}))
          .toThrowError(new RegExp(`Cannot find form control with name: three`));
    });

    it('should throw if a value is not provided for a disabled control', () => {
      c2.disable();
      expect(() => g.setValue({
        'one': 'one'
      })).toThrowError(new RegExp(`Must supply a value for form control with name: 'two'`));
    });

    it('should throw if no controls are set yet', () => {
      const empty = new FormGroup({});
      expect(() => empty.setValue({
        'one': 'one'
      })).toThrowError(new RegExp(`no form controls registered with this group`));
    });

    describe('setValue() events', () => {
      let form: FormGroup;
      let logger: any[];

      beforeEach(() => {
        form = new FormGroup({'parent': g});
        logger = [];
      });

      it('should emit one valueChange event per control', () => {
        form.valueChanges.subscribe(() => logger.push('form'));
        g.valueChanges.subscribe(() => logger.push('group'));
        c.valueChanges.subscribe(() => logger.push('control1'));
        c2.valueChanges.subscribe(() => logger.push('control2'));

        g.setValue({'one': 'one', 'two': 'two'});
        expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
      });

      it('should not emit events when `FormGroup.setValue` is called with `emitEvent: false`',
         () => {
           form.valueChanges.subscribe(() => logger.push('form'));
           g.valueChanges.subscribe(() => logger.push('group'));
           c.valueChanges.subscribe(() => logger.push('control'));

           g.setValue({'one': 'one', 'two': 'two'}, {emitEvent: false});
           expect(logger).toEqual([]);
         });

      it('should emit one statusChange event per control', () => {
        form.statusChanges.subscribe(() => logger.push('form'));
        g.statusChanges.subscribe(() => logger.push('group'));
        c.statusChanges.subscribe(() => logger.push('control1'));
        c2.statusChanges.subscribe(() => logger.push('control2'));

        g.setValue({'one': 'one', 'two': 'two'});
        expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
      });

      it('should not emit events on the parent when called with `emitEvent: false`', () => {
        form.valueChanges.subscribe(() => logger.push('form value change'));
        g.valueChanges.subscribe(() => logger.push('group value change'));
        form.statusChanges.subscribe(() => logger.push('form status change'));
        g.statusChanges.subscribe(() => logger.push('group status change'));

        g.addControl('three', new FormControl(5), {emitEvent: false});
        expect(logger).toEqual([]);
      });
    });
  });

  describe('patchValue', () => {
    let c: FormControl, c2: FormControl, g: FormGroup, g2: FormGroup;

    beforeEach(() => {
      c = new FormControl('');
      c2 = new FormControl('');
      g = new FormGroup({'one': c, 'two': c2});
      g2 = new FormGroup({
        'array': new FormArray([new FormControl(1), new FormControl(2)]),
        'group': new FormGroup({'one': new FormControl(3)}),
      });
    });

    it('should set its own value', () => {
      g.patchValue({'one': 'one', 'two': 'two'});
      expect(g.value).toEqual({'one': 'one', 'two': 'two'});
    });

    it('should set child values', () => {
      g.patchValue({'one': 'one', 'two': 'two'});
      expect(c.value).toEqual('one');
      expect(c2.value).toEqual('two');
    });

    it('should patch disabled control values', () => {
      c2.disable();
      g.patchValue({'one': 'one', 'two': 'two'});
      expect(c2.value).toEqual('two');
      expect(g.value).toEqual({'one': 'one'});
      expect(g.getRawValue()).toEqual({'one': 'one', 'two': 'two'});
    });

    it('should patch disabled control groups', () => {
      g.disable();
      g.patchValue({'one': 'one', 'two': 'two'});
      expect(c.value).toEqual('one');
      expect(c2.value).toEqual('two');
      expect(g.value).toEqual({'one': 'one', 'two': 'two'});
    });

    it('should set parent values', () => {
      const form = new FormGroup({'parent': g});
      g.patchValue({'one': 'one', 'two': 'two'});
      expect(form.value).toEqual({'parent': {'one': 'one', 'two': 'two'}});
    });

    it('should not update the parent when explicitly specified', () => {
      const form = new FormGroup({'parent': g});
      g.patchValue({'one': 'one', 'two': 'two'}, {onlySelf: true});

      expect(form.value).toEqual({parent: {'one': '', 'two': ''}});
    });

    it('should ignore fields that are missing from supplied value (subset)', () => {
      g.patchValue({'one': 'one'});
      expect(g.value).toEqual({'one': 'one', 'two': ''});
    });

    it('should not ignore fields that are null', () => {
      g.patchValue({'one': null});
      expect(g.value).toEqual({'one': null, 'two': ''});
    });

    it('should ignore any value provided for a missing control (superset)', () => {
      g.patchValue({'three': 'three'});
      expect(g.value).toEqual({'one': '', 'two': ''});
    });

    it('should ignore a control if `null` or `undefined` are used as values', () => {
      const INITIAL_STATE = {'array': [1, 2], 'group': {'one': 3}};

      g2.patchValue({'array': null});
      expect(g2.value).toEqual(INITIAL_STATE);

      g2.patchValue({'array': undefined});
      expect(g2.value).toEqual(INITIAL_STATE);

      g2.patchValue({'group': null});
      expect(g2.value).toEqual(INITIAL_STATE);

      g2.patchValue({'group': undefined});
      expect(g2.value).toEqual(INITIAL_STATE);
    });

    describe('patchValue() events', () => {
      let form: FormGroup;
      let logger: any[];

      beforeEach(() => {
        form = new FormGroup({'parent': g});
        logger = [];
      });

      it('should emit one valueChange event per control', () => {
        form.valueChanges.subscribe(() => logger.push('form'));
        g.valueChanges.subscribe(() => logger.push('group'));
        c.valueChanges.subscribe(() => logger.push('control1'));
        c2.valueChanges.subscribe(() => logger.push('control2'));

        g.patchValue({'one': 'one', 'two': 'two'});
        expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
      });

      it('should not emit valueChange events for skipped controls', () => {
        form.valueChanges.subscribe(() => logger.push('form'));
        g.valueChanges.subscribe(() => logger.push('group'));
        c.valueChanges.subscribe(() => logger.push('control1'));
        c2.valueChanges.subscribe(() => logger.push('control2'));

        g.patchValue({'one': 'one'});
        expect(logger).toEqual(['control1', 'group', 'form']);
      });

      it('should not emit valueChange events for skipped controls (represented as `null` or `undefined`)',
         () => {
           const logEvent = () => logger.push('valueChanges event');

           const [formArrayControl1, formArrayControl2] = (g2.controls.array as FormArray).controls;
           const formGroupControl = (g2.controls.group as FormGroup).controls.one;

           formArrayControl1.valueChanges.subscribe(logEvent);
           formArrayControl2.valueChanges.subscribe(logEvent);
           formGroupControl.valueChanges.subscribe(logEvent);

           g2.patchValue({'array': null});
           g2.patchValue({'array': undefined});
           g2.patchValue({'group': null});
           g2.patchValue({'group': undefined});

           // No events are expected in `valueChanges` since
           // all controls were skipped in `patchValue`.
           expect(logger).toEqual([]);
         });

      it('should not emit events when `FormGroup.patchValue` is called with `emitEvent: false`',
         () => {
           form.valueChanges.subscribe(() => logger.push('form'));
           g.valueChanges.subscribe(() => logger.push('group'));
           c.valueChanges.subscribe(() => logger.push('control'));

           g.patchValue({'one': 'one', 'two': 'two'}, {emitEvent: false});
           expect(logger).toEqual([]);
         });

      it('should emit one statusChange event per control', () => {
        form.statusChanges.subscribe(() => logger.push('form'));
        g.statusChanges.subscribe(() => logger.push('group'));
        c.statusChanges.subscribe(() => logger.push('control1'));
        c2.statusChanges.subscribe(() => logger.push('control2'));

        g.patchValue({'one': 'one', 'two': 'two'});
        expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
      });
    });
  });

  describe('reset()', () => {
    let c: FormControl, c2: FormControl, g: FormGroup;

    beforeEach(() => {
      c = new FormControl('initial value');
      c2 = new FormControl('');
      g = new FormGroup({'one': c, 'two': c2});
    });

    it('should set its own value if value passed', () => {
      g.setValue({'one': 'new value', 'two': 'new value'});

      g.reset({'one': 'initial value', 'two': ''});
      expect(g.value).toEqual({'one': 'initial value', 'two': ''});
    });

    it('should set its own value if boxed value passed', () => {
      g.setValue({'one': 'new value', 'two': 'new value'});

      g.reset({'one': {value: 'initial value', disabled: false}, 'two': ''});
      expect(g.value).toEqual({'one': 'initial value', 'two': ''});
    });

    it('should clear its own value if no value passed', () => {
      g.setValue({'one': 'new value', 'two': 'new value'});

      g.reset();
      expect(g.value).toEqual({'one': null, 'two': null});
    });

    it('should set the value of each of its child controls if value passed', () => {
      g.setValue({'one': 'new value', 'two': 'new value'});

      g.reset({'one': 'initial value', 'two': ''});
      expect(c.value).toBe('initial value');
      expect(c2.value).toBe('');
    });

    it('should clear the value of each of its child controls if no value passed', () => {
      g.setValue({'one': 'new value', 'two': 'new value'});

      g.reset();
      expect(c.value).toBe(null);
      expect(c2.value).toBe(null);
    });

    it('should set the value of its parent if value passed', () => {
      const form = new FormGroup({'g': g});
      g.setValue({'one': 'new value', 'two': 'new value'});

      g.reset({'one': 'initial value', 'two': ''});
      expect(form.value).toEqual({'g': {'one': 'initial value', 'two': ''}});
    });

    it('should clear the value of its parent if no value passed', () => {
      const form = new FormGroup({'g': g});
      g.setValue({'one': 'new value', 'two': 'new value'});

      g.reset();
      expect(form.value).toEqual({'g': {'one': null, 'two': null}});
    });

    it('should not update the parent when explicitly specified', () => {
      const form = new FormGroup({'g': g});
      g.reset({'one': 'new value', 'two': 'new value'}, {onlySelf: true});

      expect(form.value).toEqual({g: {'one': 'initial value', 'two': ''}});
    });

    it('should mark itself as pristine', () => {
      g.markAsDirty();
      expect(g.pristine).toBe(false);

      g.reset();
      expect(g.pristine).toBe(true);
    });

    it('should mark all child controls as pristine', () => {
      c.markAsDirty();
      c2.markAsDirty();
      expect(c.pristine).toBe(false);
      expect(c2.pristine).toBe(false);

      g.reset();
      expect(c.pristine).toBe(true);
      expect(c2.pristine).toBe(true);
    });

    it('should mark the parent as pristine if all siblings pristine', () => {
      const c3 = new FormControl('');
      const form = new FormGroup({'g': g, 'c3': c3});

      g.markAsDirty();
      expect(form.pristine).toBe(false);

      g.reset();
      expect(form.pristine).toBe(true);
    });

    it('should not mark the parent pristine if any dirty siblings', () => {
      const c3 = new FormControl('');
      const form = new FormGroup({'g': g, 'c3': c3});

      g.markAsDirty();
      c3.markAsDirty();
      expect(form.pristine).toBe(false);

      g.reset();
      expect(form.pristine).toBe(false);
    });

    it('should mark itself as untouched', () => {
      g.markAsTouched();
      expect(g.untouched).toBe(false);

      g.reset();
      expect(g.untouched).toBe(true);
    });

    it('should mark all child controls as untouched', () => {
      c.markAsTouched();
      c2.markAsTouched();
      expect(c.untouched).toBe(false);
      expect(c2.untouched).toBe(false);

      g.reset();
      expect(c.untouched).toBe(true);
      expect(c2.untouched).toBe(true);
    });

    it('should mark the parent untouched if all siblings untouched', () => {
      const c3 = new FormControl('');
      const form = new FormGroup({'g': g, 'c3': c3});

      g.markAsTouched();
      expect(form.untouched).toBe(false);

      g.reset();
      expect(form.untouched).toBe(true);
    });

    it('should not mark the parent untouched if any touched siblings', () => {
      const c3 = new FormControl('');
      const form = new FormGroup({'g': g, 'c3': c3});

      g.markAsTouched();
      c3.markAsTouched();
      expect(form.untouched).toBe(false);

      g.reset();
      expect(form.untouched).toBe(false);
    });

    it('should retain previous disabled state', () => {
      g.disable();
      g.reset();

      expect(g.disabled).toBe(true);
    });

    it('should set child disabled state if boxed value passed', () => {
      g.disable();
      g.reset({'one': {value: '', disabled: false}, 'two': ''});

      expect(c.disabled).toBe(false);
      expect(g.disabled).toBe(false);
    });

    describe('reset() events', () => {
      let form: FormGroup, c3: FormControl, logger: any[];

      beforeEach(() => {
        c3 = new FormControl('');
        form = new FormGroup({'g': g, 'c3': c3});
        logger = [];
      });

      it('should emit one valueChange event per reset control', () => {
        form.valueChanges.subscribe(() => logger.push('form'));
        g.valueChanges.subscribe(() => logger.push('group'));
        c.valueChanges.subscribe(() => logger.push('control1'));
        c2.valueChanges.subscribe(() => logger.push('control2'));
        c3.valueChanges.subscribe(() => logger.push('control3'));

        g.reset();
        expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
      });

      it('should not emit events when `FormGroup.reset` is called with `emitEvent: false`', () => {
        form.valueChanges.subscribe(() => logger.push('form'));
        g.valueChanges.subscribe(() => logger.push('group'));
        c.valueChanges.subscribe(() => logger.push('control'));

        g.reset({}, {emitEvent: false});
        expect(logger).toEqual([]);
      });

      it('should emit one statusChange event per reset control', () => {
        form.statusChanges.subscribe(() => logger.push('form'));
        g.statusChanges.subscribe(() => logger.push('group'));
        c.statusChanges.subscribe(() => logger.push('control1'));
        c2.statusChanges.subscribe(() => logger.push('control2'));
        c3.statusChanges.subscribe(() => logger.push('control3'));

        g.reset();
        expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
      });

      it('should emit one statusChange event per reset control', () => {
        form.statusChanges.subscribe(() => logger.push('form'));
        g.statusChanges.subscribe(() => logger.push('group'));
        c.statusChanges.subscribe(() => logger.push('control1'));
        c2.statusChanges.subscribe(() => logger.push('control2'));
        c3.statusChanges.subscribe(() => logger.push('control3'));

        g.reset({'one': {value: '', disabled: true}});
        expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
      });

      it('should mark as pristine and not dirty before emitting valueChange and statusChange events when resetting',
         () => {
           const pristineAndNotDirty = () => {
             expect(form.pristine).toBe(true);
             expect(form.dirty).toBe(false);
           };

           c3.markAsDirty();
           expect(form.pristine).toBe(false);
           expect(form.dirty).toBe(true);

           form.valueChanges.subscribe(pristineAndNotDirty);
           form.statusChanges.subscribe(pristineAndNotDirty);

           form.reset();
         });
    });
  });

  describe('contains', () => {
    let group: FormGroup;

    beforeEach(() => {
      group = new FormGroup({
        'required': new FormControl('requiredValue'),
        'optional': new FormControl({value: 'disabled value', disabled: true})
      });
    });

    it('should return false when the component is disabled', () => {
      expect(group.contains('optional')).toEqual(false);
    });

    it('should return false when there is no component with the given name', () => {
      expect(group.contains('something else')).toEqual(false);
    });

    it('should return true when the component is enabled', () => {
      expect(group.contains('required')).toEqual(true);

      group.enable();

      expect(group.contains('optional')).toEqual(true);
    });

    it('should support controls with dots in their name', () => {
      expect(group.contains('some.name')).toBe(false);
      group.addControl('some.name', new FormControl());

      expect(group.contains('some.name')).toBe(true);
    });
  });

  describe('retrieve', () => {
    let group: FormGroup;

    beforeEach(() => {
      group = new FormGroup({
        'required': new FormControl('requiredValue'),
      });
    });

    it('should not get inherited properties', () => {
      expect(group.get('constructor')).toBe(null);
    });
  });

  describe('statusChanges', () => {
    let control: FormControl;
    let group: FormGroup;

    beforeEach(waitForAsync(() => {
      control = new FormControl('', asyncValidatorReturningObservable);
      group = new FormGroup({'one': control});
    }));

    it('should fire statusChanges events for async validators added via options object',
       fakeAsync(() => {
         // The behavior can be tested for each of the model types.
         let statuses: string[] = [];

         // Create a form control with an async validator added via options object.
         const asc = new FormGroup({}, {asyncValidators: [() => Promise.resolve(null)]});

         // Subscribe to status changes.
         asc.statusChanges.subscribe((status: any) => statuses.push(status));

         // After a tick, the async validator should change status PENDING -> VALID.
         tick();
         expect(statuses).toEqual(['VALID']);
       }));

    // TODO(kara): update these tests to use fake Async
    it('should fire a statusChange if child has async validation change', done => {
      const loggedValues: string[] = [];
      group.statusChanges.subscribe({
        next: (status: string) => {
          loggedValues.push(status);
          if (loggedValues.length === 2) {
            expect(loggedValues).toEqual(['PENDING', 'INVALID']);
          }
          done();
        }
      });
      control.setValue('');
    });
  });

  describe('getError', () => {
    it('should return the error when it is present', () => {
      const c = new FormControl('', Validators.required);
      const g = new FormGroup({'one': c});
      expect(c.getError('required')).toEqual(true);
      expect(g.getError('required', ['one'])).toEqual(true);
    });

    it('should return null otherwise', () => {
      const c = new FormControl('not empty', Validators.required);
      const g = new FormGroup({'one': c});
      expect(c.getError('invalid')).toEqual(null);
      expect(g.getError('required', ['one'])).toEqual(null);
      expect(g.getError('required', ['invalid'])).toEqual(null);
    });

    it('should be able to traverse group with single string', () => {
      const c = new FormControl('', Validators.required);
      const g = new FormGroup({'one': c});
      expect(c.getError('required')).toEqual(true);
      expect(g.getError('required', 'one')).toEqual(true);
    });

    it('should be able to traverse group with string delimited by dots', () => {
      const c = new FormControl('', Validators.required);
      const g2 = new FormGroup({'two': c});
      const g1 = new FormGroup({'one': g2});
      expect(c.getError('required')).toEqual(true);
      expect(g1.getError('required', 'one.two')).toEqual(true);
    });

    it('should traverse group with form array using string and numbers', () => {
      const c = new FormControl('', Validators.required);
      const g2 = new FormGroup({'two': c});
      const a = new FormArray([g2]);
      const g1 = new FormGroup({'one': a});
      expect(c.getError('required')).toEqual(true);
      expect(g1.getError('required', ['one', 0, 'two'])).toEqual(true);
    });
  });

  describe('hasError', () => {
    it('should return true when it is present', () => {
      const c = new FormControl('', Validators.required);
      const g = new FormGroup({'one': c});
      expect(c.hasError('required')).toEqual(true);
      expect(g.hasError('required', ['one'])).toEqual(true);
    });

    it('should return false otherwise', () => {
      const c = new FormControl('not empty', Validators.required);
      const g = new FormGroup({'one': c});
      expect(c.hasError('invalid')).toEqual(false);
      expect(g.hasError('required', ['one'])).toEqual(false);
      expect(g.hasError('required', ['invalid'])).toEqual(false);
    });

    it('should be able to traverse group with single string', () => {
      const c = new FormControl('', Validators.required);
      const g = new FormGroup({'one': c});
      expect(c.hasError('required')).toEqual(true);
      expect(g.hasError('required', 'one')).toEqual(true);
    });

    it('should be able to traverse group with string delimited by dots', () => {
      const c = new FormControl('', Validators.required);
      const g2 = new FormGroup({'two': c});
      const g1 = new FormGroup({'one': g2});
      expect(c.hasError('required')).toEqual(true);
      expect(g1.hasError('required', 'one.two')).toEqual(true);
    });
    it('should traverse group with form array using string and numbers', () => {
      const c = new FormControl('', Validators.required);
      const g2 = new FormGroup({'two': c});
      const a = new FormArray([g2]);
      const g1 = new FormGroup({'one': a});
      expect(c.getError('required')).toEqual(true);
      expect(g1.getError('required', ['one', 0, 'two'])).toEqual(true);
    });
  });

  describe('validator', () => {
    function containsValidator(c: AbstractControl): ValidationErrors|null {
      return c.get('one')!.value && c.get('one')!.value.indexOf('c') !== -1 ? null :
                                                                              {'missing': true};
    }

    it('should run a single validator when the value changes', () => {
      const c = new FormControl(null);
      const g = new FormGroup({'one': c}, simpleValidator);

      c.setValue('correct');

      expect(g.valid).toEqual(true);
      expect(g.errors).toEqual(null);

      c.setValue('incorrect');

      expect(g.valid).toEqual(false);
      expect(g.errors).toEqual({'broken': true});
    });

    it('should support multiple validators from array', () => {
      const g = new FormGroup({one: new FormControl()}, [simpleValidator, containsValidator]);
      expect(g.valid).toEqual(false);
      expect(g.errors).toEqual({missing: true, broken: true});

      g.setValue({one: 'c'});
      expect(g.valid).toEqual(false);
      expect(g.errors).toEqual({broken: true});

      g.setValue({one: 'correct'});
      expect(g.valid).toEqual(true);
    });

    it('should set single validator from options obj', () => {
      const g = new FormGroup({one: new FormControl()}, {validators: simpleValidator});
      expect(g.valid).toEqual(false);
      expect(g.errors).toEqual({broken: true});

      g.setValue({one: 'correct'});
      expect(g.valid).toEqual(true);
    });

    it('should set multiple validators from options obj', () => {
      const g = new FormGroup(
          {one: new FormControl()}, {validators: [simpleValidator, containsValidator]});
      expect(g.valid).toEqual(false);
      expect(g.errors).toEqual({missing: true, broken: true});

      g.setValue({one: 'c'});
      expect(g.valid).toEqual(false);
      expect(g.errors).toEqual({broken: true});

      g.setValue({one: 'correct'});
      expect(g.valid).toEqual(true);
    });
  });

  describe('asyncValidator', () => {
    it('should run the async validator', fakeAsync(() => {
         const c = new FormControl('value');
         const g = new FormGroup({'one': c}, null!, asyncValidator('expected'));

         expect(g.pending).toEqual(true);

         tick(1);

         expect(g.errors).toEqual({'async': true});
         expect(g.pending).toEqual(false);
       }));

    it('should set multiple async validators from array', fakeAsync(() => {
         const g = new FormGroup(
             {'one': new FormControl('value')}, null!,
             [asyncValidator('expected'), otherObservableValidator]);
         expect(g.pending).toEqual(true);

         tick();
         expect(g.errors).toEqual({'async': true, 'other': true});
         expect(g.pending).toEqual(false);
       }));

    it('should set single async validator from options obj', fakeAsync(() => {
         const g = new FormGroup(
             {'one': new FormControl('value')}, {asyncValidators: asyncValidator('expected')});
         expect(g.pending).toEqual(true);

         tick();
         expect(g.errors).toEqual({'async': true});
         expect(g.pending).toEqual(false);
       }));

    it('should set multiple async validators from options obj', fakeAsync(() => {
         const g = new FormGroup(
             {'one': new FormControl('value')},
             {asyncValidators: [asyncValidator('expected'), otherObservableValidator]});
         expect(g.pending).toEqual(true);

         tick();
         expect(g.errors).toEqual({'async': true, 'other': true});
         expect(g.pending).toEqual(false);
       }));

    it('should set the parent group\'s status to pending', fakeAsync(() => {
         const c = new FormControl('value', null!, asyncValidator('expected'));
         const g = new FormGroup({'one': c});

         expect(g.pending).toEqual(true);

         tick(1);

         expect(g.pending).toEqual(false);
       }));

    it('should run the parent group\'s async validator when children are pending', fakeAsync(() => {
         const c = new FormControl('value', null!, asyncValidator('expected'));
         const g = new FormGroup({'one': c}, null!, asyncValidator('expected'));

         tick(1);

         expect(g.errors).toEqual({'async': true});
         expect(g.get('one')!.errors).toEqual({'async': true});
       }));

    it('should handle successful async FormGroup resolving synchronously before a successful async child validator',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 1, shouldFail: false}));
         const g = new FormGroup(
             {'one': c}, null!, simpleAsyncValidator({timeout: 0, shouldFail: false}));

         // Initially, the form control validation is pending, and the form group own validation has
         // synchronously resolved. Still, the form is in pending state due to its child
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: true, status: 'PENDING'},  // Control
         ]);

         tick(1);

         // After 1ms, the form control validation has resolved
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: false, status: 'VALID'},  // Group
           {errors: null, pending: false, status: 'VALID'},  // Control
         ]);
       }));

    it('should handle successful async FormGroup resolving after a synchronously and successfully resolving child validator',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 0, shouldFail: false}));
         const g = new FormGroup(
             {'one': c}, null!, simpleAsyncValidator({timeout: 1, shouldFail: false}));

         // Initially, form control validator has synchronously resolved. However, g has its own
         // pending validation
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: false, status: 'VALID'},   // Control
         ]);

         tick(1);

         // After 1ms, the form group validation has resolved
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: false, status: 'VALID'},  // Group
           {errors: null, pending: false, status: 'VALID'},  // Control
         ]);
       }));

    it('should handle successful async FormGroup and child control validators resolving synchronously',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 0, shouldFail: false}));
         const g = new FormGroup(
             {'one': c}, null!, simpleAsyncValidator({timeout: 0, shouldFail: false}));

         // Both form control and form group successful async validators have resolved synchronously
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: false, status: 'VALID'},  // Group
           {errors: null, pending: false, status: 'VALID'},  // Control
         ]);
       }));

    it('should handle failing async FormGroup and failing child control validators resolving synchronously',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 0, shouldFail: true}));
         const g =
             new FormGroup({'one': c}, null!, simpleAsyncValidator({timeout: 0, shouldFail: true}));

         // FormControl async validator has executed and failed synchronously with the default error
         // `{async: true}`. Next, the form group status is calculated. Since one of its children is
         // failing, the form group itself is marked `INVALID`. And its asynchronous validation is
         // not even triggered. Therefore, we end up with form group that is `INVALID` but whose
         // errors are null (child errors do not propagate and own async validation not event
         // triggered).
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: false, status: 'INVALID'},           // Group
           {errors: {async: true}, pending: false, status: 'INVALID'},  // Control
         ]);
       }));

    it('should handle failing async FormGroup and successful child control validators resolving synchronously',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 0, shouldFail: false}));
         const g =
             new FormGroup({'one': c}, null!, simpleAsyncValidator({timeout: 0, shouldFail: true}));

         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: {async: true}, pending: false, status: 'INVALID'},  // Group
           {errors: null, pending: false, status: 'VALID'},             // Control
         ]);
       }));

    it('should handle failing async FormArray and successful children validators resolving synchronously',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 0, shouldFail: false}));
         const g = new FormGroup(
             {'one': c}, null!, simpleAsyncValidator({timeout: 0, shouldFail: false}));

         const c2 =
             new FormControl('fcVal', null!, simpleAsyncValidator({timeout: 0, shouldFail: false}));

         const a =
             new FormArray([g, c2], null!, simpleAsyncValidator({timeout: 0, shouldFail: true}));

         expect(currentStateOf([a, a.at(0)!, a.at(1)!])).toEqual([
           {errors: {async: true}, pending: false, status: 'INVALID'},  // Array
           {errors: null, pending: false, status: 'VALID'},             // Group p
           {errors: null, pending: false, status: 'VALID'},             // Control c2
         ]);
       }));

    it('should handle failing FormGroup validator resolving after successful child validator',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 1, shouldFail: false}));
         const g =
             new FormGroup({'one': c}, null!, simpleAsyncValidator({timeout: 2, shouldFail: true}));

         // Initially, the form group and nested control are in pending state
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: true, status: 'PENDING'},  // Control
         ]);

         tick(1);

         // After 1ms, only form control validation has resolved
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: false, status: 'VALID'},   // Control
         ]);

         tick(1);

         // After 1ms, the form group validation fails
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: {async: true}, pending: false, status: 'INVALID'},  // Group
           {errors: null, pending: false, status: 'VALID'},             // Control
         ]);
       }));

    it('should handle failing FormArray validator resolving after successful child validator',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 1, shouldFail: false}));
         const a = new FormArray([c], null!, simpleAsyncValidator({timeout: 2, shouldFail: true}));

         // Initially, the form array and nested control are in pending state
         expect(currentStateOf([a, a.at(0)!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // FormArray
           {errors: null, pending: true, status: 'PENDING'},  // Control
         ]);

         tick(1);

         // After 1ms, only form control validation has resolved
         expect(currentStateOf([a, a.at(0)!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // FormArray
           {errors: null, pending: false, status: 'VALID'},   // Control
         ]);

         tick(1);

         // After 1ms, the form array validation fails
         expect(currentStateOf([a, a.at(0)!])).toEqual([
           {errors: {async: true}, pending: false, status: 'INVALID'},  // FormArray
           {errors: null, pending: false, status: 'VALID'},             // Control
         ]);
       }));

    it('should handle successful FormGroup validator resolving after successful child validator',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 1, shouldFail: false}));
         const g = new FormGroup(
             {'one': c}, null!, simpleAsyncValidator({timeout: 2, shouldFail: false}));

         // Initially, the form group and nested control are in pending state
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: true, status: 'PENDING'},  // Control
         ]);

         tick(1);

         // After 1ms, only form control validation has resolved
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: false, status: 'VALID'},   // Control
         ]);

         tick(1);

         // After 1ms, the form group validation resolves
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: false, status: 'VALID'},  // Group
           {errors: null, pending: false, status: 'VALID'},  // Control
         ]);
       }));

    it('should handle successful FormArray validator resolving after successful child validators',
       fakeAsync(() => {
         const c1 = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 1, shouldFail: false}));
         const g = new FormGroup(
             {'one': c1}, null!, simpleAsyncValidator({timeout: 2, shouldFail: false}));
         const c2 =
             new FormControl('fcVal', null!, simpleAsyncValidator({timeout: 3, shouldFail: false}));

         const a =
             new FormArray([g, c2], null!, simpleAsyncValidator({timeout: 4, shouldFail: false}));

         // Initially, the form array and the tested form group and form control c2 are in pending
         // state
         expect(currentStateOf([a, a.at(0)!, a.at(1)!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // FormArray
           {errors: null, pending: true, status: 'PENDING'},  // g
           {errors: null, pending: true, status: 'PENDING'},  // c2
         ]);

         tick(2);

         // After 2ms, g validation has resolved
         expect(currentStateOf([a, a.at(0)!, a.at(1)!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // FormArray
           {errors: null, pending: false, status: 'VALID'},   // g
           {errors: null, pending: true, status: 'PENDING'},  // c2
         ]);

         tick(1);

         // After 1ms, c2 validation has resolved
         expect(currentStateOf([a, a.at(0)!, a.at(1)!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // FormArray
           {errors: null, pending: false, status: 'VALID'},   // g
           {errors: null, pending: false, status: 'VALID'},   // c2
         ]);

         tick(1);

         // After 1ms, FormArray own validation has resolved
         expect(currentStateOf([a, a.at(0)!, a.at(1)!])).toEqual([
           {errors: null, pending: false, status: 'VALID'},  // FormArray
           {errors: null, pending: false, status: 'VALID'},  // g
           {errors: null, pending: false, status: 'VALID'},  // c2
         ]);
       }));

    it('should handle failing FormArray validator resolving after successful child validators',
       fakeAsync(() => {
         const c1 = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 1, shouldFail: false}));
         const g = new FormGroup(
             {'one': c1}, null!, simpleAsyncValidator({timeout: 2, shouldFail: false}));
         const c2 =
             new FormControl('fcVal', null!, simpleAsyncValidator({timeout: 3, shouldFail: false}));

         const a =
             new FormArray([g, c2], null!, simpleAsyncValidator({timeout: 4, shouldFail: true}));

         // Initially, the form array and the tested form group and form control c2 are in pending
         // state
         expect(currentStateOf([a, a.at(0)!, a.at(1)!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // FormArray
           {errors: null, pending: true, status: 'PENDING'},  // g
           {errors: null, pending: true, status: 'PENDING'},  // c2
         ]);

         tick(2);

         // After 2ms, g validation has resolved
         expect(currentStateOf([a, a.at(0)!, a.at(1)!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // FormArray
           {errors: null, pending: false, status: 'VALID'},   // g
           {errors: null, pending: true, status: 'PENDING'},  // c2
         ]);

         tick(1);

         // After 1ms, c2 validation has resolved
         expect(currentStateOf([a, a.at(0)!, a.at(1)!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // FormArray
           {errors: null, pending: false, status: 'VALID'},   // g
           {errors: null, pending: false, status: 'VALID'},   // c2
         ]);

         tick(1);

         // After 1ms, FormArray own validation has failed
         expect(currentStateOf([a, a.at(0)!, a.at(1)!])).toEqual([
           {errors: {async: true}, pending: false, status: 'INVALID'},  // FormArray
           {errors: null, pending: false, status: 'VALID'},             // g
           {errors: null, pending: false, status: 'VALID'},             // c2
         ]);
       }));

    it('should handle multiple successful FormGroup validators resolving after successful child validator',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 1, shouldFail: false}));
         const g = new FormGroup({'one': c}, null!, [
           simpleAsyncValidator({timeout: 2, shouldFail: false}),
           simpleAsyncValidator({timeout: 3, shouldFail: false})
         ]);

         // Initially, the form group and nested control are in pending state
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: true, status: 'PENDING'},  // Control
         ]);

         tick(1);

         // After 1ms, only form control validation has resolved
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: false, status: 'VALID'},   // Control
         ]);

         tick(1);

         // After 1ms, one form async validator has resolved but not the second
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: false, status: 'VALID'},   // Control
         ]);

         tick(1);

         // After 1ms, the form group validation resolves
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: false, status: 'VALID'},  // Group
           {errors: null, pending: false, status: 'VALID'},  // Control
         ]);
       }));

    it('should handle multiple FormGroup validators (success then failure) resolving after successful child validator',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 1, shouldFail: false}));
         const g = new FormGroup({'one': c}, null!, [
           simpleAsyncValidator({timeout: 2, shouldFail: false}),
           simpleAsyncValidator({timeout: 3, shouldFail: true})
         ]);

         // Initially, the form group and nested control are in pending state
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: true, status: 'PENDING'},  // Control
         ]);

         tick(1);

         // After 1ms, only form control validation has resolved
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: false, status: 'VALID'},   // Control
         ]);

         tick(1);

         // After 1ms, one form async validator has resolved but not the second
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: false, status: 'VALID'},   // Control
         ]);

         tick(1);

         // After 1ms, the form group validation fails
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: {async: true}, pending: false, status: 'INVALID'},  // Group
           {errors: null, pending: false, status: 'VALID'},             // Control
         ]);
       }));


    it('should handle multiple FormGroup validators (failure then success) resolving after successful child validator',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 1, shouldFail: false}));
         const g = new FormGroup({'one': c}, null!, [
           simpleAsyncValidator({timeout: 2, shouldFail: true}),
           simpleAsyncValidator({timeout: 3, shouldFail: false})
         ]);

         // Initially, the form group and nested control are in pending state
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: true, status: 'PENDING'},  // Control
         ]);

         tick(1);

         // After 1ms, only form control validation has resolved
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: false, status: 'VALID'},   // Control
         ]);


         tick(1);

         // All async validators are composed into one function. So, after 2ms, the FormGroup g is
         // still in pending state without errors
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: false, status: 'VALID'},   // Control
         ]);

         tick(1);

         // After 1ms, the form group validation fails
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: {async: true}, pending: false, status: 'INVALID'},  // Group
           {errors: null, pending: false, status: 'VALID'},             // Control
         ]);
       }));


    it('should handle async validators in nested form groups / arrays', fakeAsync(() => {
         const c1 = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 1, shouldFail: false}));

         const g1 = new FormGroup(
             {'one': c1}, null!, simpleAsyncValidator({timeout: 2, shouldFail: true}));

         const c2 =
             new FormControl('fcVal', null!, simpleAsyncValidator({timeout: 3, shouldFail: false}));

         const g2 =
             new FormArray([c2], null!, simpleAsyncValidator({timeout: 4, shouldFail: false}));

         const g = new FormGroup(
             {'g1': g1, 'g2': g2}, null!, simpleAsyncValidator({timeout: 5, shouldFail: false}));

         // Initially, the form group and nested control are in pending state
         expect(currentStateOf([g, g.get('g1')!, g.get('g2')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group g
           {errors: null, pending: true, status: 'PENDING'},  // Group g1
           {errors: null, pending: true, status: 'PENDING'},  // Group g2
         ]);

         tick(2);

         // After 2ms, g1 validation fails
         expect(currentStateOf([g, g.get('g1')!, g.get('g2')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},            // Group g
           {errors: {async: true}, pending: false, status: 'INVALID'},  // Group g1
           {errors: null, pending: true, status: 'PENDING'},            // Group g2
         ]);

         tick(2);

         // After 2ms, g2 validation resolves
         expect(currentStateOf([g, g.get('g1')!, g.get('g2')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},            // Group g
           {errors: {async: true}, pending: false, status: 'INVALID'},  // Group g1
           {errors: null, pending: false, status: 'VALID'},             // Group g2
         ]);

         tick(1);

         // After 1ms, g validation fails because g1 is invalid, but since errors do not cascade, so
         // we still have null errors for g
         expect(currentStateOf([g, g.get('g1')!, g.get('g2')!])).toEqual([
           {errors: null, pending: false, status: 'INVALID'},           // Group g
           {errors: {async: true}, pending: false, status: 'INVALID'},  // Group g1
           {errors: null, pending: false, status: 'VALID'},             // Group g2
         ]);
       }));

    it('should handle failing FormGroup validator resolving before successful child validator',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 2, shouldFail: false}));
         const g =
             new FormGroup({'one': c}, null!, simpleAsyncValidator({timeout: 1, shouldFail: true}));

         // Initially, the form group and nested control are in pending state
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // Group
           {errors: null, pending: true, status: 'PENDING'},  // Control
         ]);

         tick(1);

         // After 1ms, form group validation fails
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: {async: true}, pending: false, status: 'INVALID'},  // Group
           {errors: null, pending: true, status: 'PENDING'},            // Control
         ]);

         tick(1);

         // After 1ms, child validation resolves
         expect(currentStateOf([g, g.get('one')!])).toEqual([
           {errors: {async: true}, pending: false, status: 'INVALID'},  // Group
           {errors: null, pending: false, status: 'VALID'},             // Control
         ]);
       }));

    it('should handle failing FormArray validator resolving before successful child validator',
       fakeAsync(() => {
         const c = new FormControl(
             'fcValue', null!, simpleAsyncValidator({timeout: 2, shouldFail: false}));
         const a = new FormArray([c], null!, simpleAsyncValidator({timeout: 1, shouldFail: true}));

         // Initially, the form array and nested control are in pending state
         expect(currentStateOf([a, a.at(0)!])).toEqual([
           {errors: null, pending: true, status: 'PENDING'},  // FormArray
           {errors: null, pending: true, status: 'PENDING'},  // Control
         ]);

         tick(1);

         // After 1ms, form array validation fails
         expect(currentStateOf([a, a.at(0)!])).toEqual([
           {errors: {async: true}, pending: false, status: 'INVALID'},  // FormArray
           {errors: null, pending: true, status: 'PENDING'},            // Control
         ]);

         tick(1);

         // After 1ms, child validation resolves
         expect(currentStateOf([a, a.at(0)!])).toEqual([
           {errors: {async: true}, pending: false, status: 'INVALID'},  // FormArray
           {errors: null, pending: false, status: 'VALID'},             // Control
         ]);
       }));
  });

  describe('disable() & enable()', () => {
    it('should mark the group as disabled', () => {
      const g = new FormGroup({'one': new FormControl(null)});
      expect(g.disabled).toBe(false);
      expect(g.valid).toBe(true);

      g.disable();
      expect(g.disabled).toBe(true);
      expect(g.valid).toBe(false);

      g.enable();
      expect(g.disabled).toBe(false);
      expect(g.valid).toBe(true);
    });

    it('should set the group status as disabled', () => {
      const g = new FormGroup({'one': new FormControl(null)});
      expect(g.status).toEqual('VALID');

      g.disable();
      expect(g.status).toEqual('DISABLED');

      g.enable();
      expect(g.status).toBe('VALID');
    });

    it('should mark children of the group as disabled', () => {
      const c1 = new FormControl(null);
      const c2 = new FormControl(null);
      const g = new FormGroup({'one': c1, 'two': c2});
      expect(c1.disabled).toBe(false);
      expect(c2.disabled).toBe(false);

      g.disable();
      expect(c1.disabled).toBe(true);
      expect(c2.disabled).toBe(true);

      g.enable();
      expect(c1.disabled).toBe(false);
      expect(c2.disabled).toBe(false);
    });

    it('should ignore disabled controls in validation', () => {
      const g = new FormGroup({
        nested: new FormGroup({one: new FormControl(null, Validators.required)}),
        two: new FormControl('two')
      });
      expect(g.valid).toBe(false);

      g.get('nested')!.disable();
      expect(g.valid).toBe(true);

      g.get('nested')!.enable();
      expect(g.valid).toBe(false);
    });

    it('should ignore disabled controls when serializing value', () => {
      const g = new FormGroup(
          {nested: new FormGroup({one: new FormControl('one')}), two: new FormControl('two')});
      expect(g.value).toEqual({'nested': {'one': 'one'}, 'two': 'two'});

      g.get('nested')!.disable();
      expect(g.value).toEqual({'two': 'two'});

      g.get('nested')!.enable();
      expect(g.value).toEqual({'nested': {'one': 'one'}, 'two': 'two'});
    });

    it('should update its value when disabled with disabled children', () => {
      const g = new FormGroup(
          {nested: new FormGroup({one: new FormControl('one'), two: new FormControl('two')})});

      g.get('nested.two')!.disable();
      expect(g.value).toEqual({nested: {one: 'one'}});

      g.get('nested')!.disable();
      expect(g.value).toEqual({nested: {one: 'one', two: 'two'}});

      g.get('nested')!.enable();
      expect(g.value).toEqual({nested: {one: 'one', two: 'two'}});
    });

    it('should update its value when enabled with disabled children', () => {
      const g = new FormGroup(
          {nested: new FormGroup({one: new FormControl('one'), two: new FormControl('two')})});

      g.get('nested.two')!.disable();
      expect(g.value).toEqual({nested: {one: 'one'}});

      g.get('nested')!.enable();
      expect(g.value).toEqual({nested: {one: 'one', two: 'two'}});
    });

    it('should ignore disabled controls when determining dirtiness', () => {
      const g = new FormGroup(
          {nested: new FormGroup({one: new FormControl('one')}), two: new FormControl('two')});
      g.get('nested.one')!.markAsDirty();
      expect(g.dirty).toBe(true);

      g.get('nested')!.disable();
      expect(g.get('nested')!.dirty).toBe(true);
      expect(g.dirty).toEqual(false);

      g.get('nested')!.enable();
      expect(g.dirty).toEqual(true);
    });

    it('should ignore disabled controls when determining touched state', () => {
      const g = new FormGroup(
          {nested: new FormGroup({one: new FormControl('one')}), two: new FormControl('two')});
      g.get('nested.one')!.markAsTouched();
      expect(g.touched).toBe(true);

      g.get('nested')!.disable();
      expect(g.get('nested')!.touched).toBe(true);
      expect(g.touched).toEqual(false);

      g.get('nested')!.enable();
      expect(g.touched).toEqual(true);
    });

    it('should keep empty, disabled groups disabled when updating validity', () => {
      const group = new FormGroup({});
      expect(group.status).toEqual('VALID');

      group.disable();
      expect(group.status).toEqual('DISABLED');

      group.updateValueAndValidity();
      expect(group.status).toEqual('DISABLED');

      group.addControl('one', new FormControl({value: '', disabled: true}));
      expect(group.status).toEqual('DISABLED');

      group.addControl('two', new FormControl());
      expect(group.status).toEqual('VALID');
    });

    it('should re-enable empty, disabled groups', () => {
      const group = new FormGroup({});
      group.disable();
      expect(group.status).toEqual('DISABLED');

      group.enable();
      expect(group.status).toEqual('VALID');
    });

    it('should not run validators on disabled controls', () => {
      const validator = jasmine.createSpy('validator');
      const g = new FormGroup({'one': new FormControl()}, validator);
      expect(validator.calls.count()).toEqual(1);

      g.disable();
      expect(validator.calls.count()).toEqual(1);

      g.setValue({one: 'value'});
      expect(validator.calls.count()).toEqual(1);

      g.enable();
      expect(validator.calls.count()).toEqual(2);
    });

    describe('disabled errors', () => {
      it('should clear out group errors when disabled', () => {
        const g = new FormGroup({'one': new FormControl()}, () => ({'expected': true}));
        expect(g.errors).toEqual({'expected': true});

        g.disable();
        expect(g.errors).toEqual(null);

        g.enable();
        expect(g.errors).toEqual({'expected': true});
      });

      it('should re-populate group errors when enabled from a child', () => {
        const g = new FormGroup({'one': new FormControl()}, () => ({'expected': true}));
        g.disable();
        expect(g.errors).toEqual(null);

        g.addControl('two', new FormControl());
        expect(g.errors).toEqual({'expected': true});
      });

      it('should clear out async group errors when disabled', fakeAsync(() => {
           const g = new FormGroup({'one': new FormControl()}, null!, asyncValidator('expected'));
           tick();
           expect(g.errors).toEqual({'async': true});

           g.disable();
           expect(g.errors).toEqual(null);

           g.enable();
           tick();
           expect(g.errors).toEqual({'async': true});
         }));

      it('should re-populate async group errors when enabled from a child', fakeAsync(() => {
           const g = new FormGroup({'one': new FormControl()}, null!, asyncValidator('expected'));
           tick();
           expect(g.errors).toEqual({'async': true});

           g.disable();
           expect(g.errors).toEqual(null);

           g.addControl('two', new FormControl());
           tick();
           expect(g.errors).toEqual({'async': true});
         }));
    });

    describe('disabled events', () => {
      let logger: string[];
      let c: FormControl;
      let g: FormGroup;
      let form: FormGroup;

      beforeEach(() => {
        logger = [];
        c = new FormControl('', Validators.required);
        g = new FormGroup({one: c});
        form = new FormGroup({g: g});
      });

      it('should emit value change events in the right order', () => {
        c.valueChanges.subscribe(() => logger.push('control'));
        g.valueChanges.subscribe(() => logger.push('group'));
        form.valueChanges.subscribe(() => logger.push('form'));

        g.disable();
        expect(logger).toEqual(['control', 'group', 'form']);
      });

      it('should emit status change events in the right order', () => {
        c.statusChanges.subscribe(() => logger.push('control'));
        g.statusChanges.subscribe(() => logger.push('group'));
        form.statusChanges.subscribe(() => logger.push('form'));

        g.disable();
        expect(logger).toEqual(['control', 'group', 'form']);
      });

      it('should not emit value change events when called with `emitEvent: false`', () => {
        c.valueChanges.subscribe(() => logger.push('control'));
        g.valueChanges.subscribe(() => logger.push('group'));
        form.valueChanges.subscribe(() => logger.push('form'));

        g.disable({emitEvent: false});
        expect(logger).toEqual([]);
        g.enable({emitEvent: false});
        expect(logger).toEqual([]);
      });

      it('should not emit status change events when called with `emitEvent: false`', () => {
        c.statusChanges.subscribe(() => logger.push('control'));
        g.statusChanges.subscribe(() => logger.push('group'));
        form.statusChanges.subscribe(() => logger.push('form'));

        g.disable({emitEvent: false});
        expect(logger).toEqual([]);
        g.enable({emitEvent: false});
        expect(logger).toEqual([]);
      });
    });
  });

  describe('updateTreeValidity()', () => {
    let c: FormControl, c2: FormControl, c3: FormControl;
    let nested: FormGroup, form: FormGroup;
    let logger: string[];

    beforeEach(() => {
      c = new FormControl('one');
      c2 = new FormControl('two');
      c3 = new FormControl('three');
      nested = new FormGroup({one: c, two: c2});
      form = new FormGroup({nested: nested, three: c3});
      logger = [];

      c.statusChanges.subscribe(() => logger.push('one'));
      c2.statusChanges.subscribe(() => logger.push('two'));
      c3.statusChanges.subscribe(() => logger.push('three'));
      nested.statusChanges.subscribe(() => logger.push('nested'));
      form.statusChanges.subscribe(() => logger.push('form'));
    });

    it('should update tree validity', () => {
      (form as any)._updateTreeValidity();
      expect(logger).toEqual(['one', 'two', 'nested', 'three', 'form']);
    });

    it('should not emit events when called with `emitEvent: false`', () => {
      (form as any)._updateTreeValidity({emitEvent: false});
      expect(logger).toEqual([]);
    });
  });

  describe('setControl()', () => {
    let c: FormControl;
    let g: FormGroup;

    beforeEach(() => {
      c = new FormControl('one');
      g = new FormGroup({one: c});
    });

    it('should replace existing control with new control', () => {
      const c2 = new FormControl('new!', Validators.minLength(10));
      g.setControl('one', c2);

      expect(g.controls['one']).toEqual(c2);
      expect(g.value).toEqual({one: 'new!'});
      expect(g.valid).toBe(false);
    });

    it('should add control if control did not exist before', () => {
      const c2 = new FormControl('new!', Validators.minLength(10));
      g.setControl('two', c2);

      expect(g.controls['two']).toEqual(c2);
      expect(g.value).toEqual({one: 'one', two: 'new!'});
      expect(g.valid).toBe(false);
    });

    it('should remove control if new control is null', () => {
      g.setControl('one', null!);
      expect(g.controls['one']).not.toBeDefined();
      expect(g.value).toEqual({});
    });

    it('should only emit value change event once', () => {
      const logger: string[] = [];
      const c2 = new FormControl('new!');
      g.valueChanges.subscribe(() => logger.push('change!'));
      g.setControl('one', c2);
      expect(logger).toEqual(['change!']);
    });

    it('should not emit event called when `FormGroup.setControl` with `emitEvent: false`', () => {
      const logger: string[] = [];
      const c2 = new FormControl('new!');
      g.valueChanges.subscribe(() => logger.push('value change'));
      g.statusChanges.subscribe(() => logger.push('status change'));
      g.setControl('one', c2, {emitEvent: false});
      expect(logger).toEqual([]);
    });
  });

  describe('emit `statusChanges` and `valueChanges` with/without async/sync validators', () => {
    const attachEventsLogger = (control: AbstractControl, log: string[], controlName?: string) => {
      const name = controlName ? ` (${controlName})` : '';
      control.statusChanges.subscribe(status => log.push(`status${name}: ${status}`));
      control.valueChanges.subscribe(value => log.push(`value${name}: ${JSON.stringify(value)}`));
    };

    describe('stand alone controls', () => {
      it('should run the async validator on stand alone controls and set status to `INVALID`',
         fakeAsync(() => {
           const logs: string[] = [];
           const c =
               new FormControl('', null, simpleAsyncValidator({timeout: 0, shouldFail: true}));

           attachEventsLogger(c, logs);

           expect(logs.length).toBe(0);

           tick(1);

           c.setValue('new!', {emitEvent: true});

           tick(1);

           // Note that above `simpleAsyncValidator` is called with `timeout:0`.  When the timeout
           // is set to `0`, the function returns `of(error)`, and the function behaves in a
           // synchronous manner. Because of this there is no `PENDING` state as seen in the
           // `logs`.
           expect(logs).toEqual([
             'status: INVALID',  // status change emitted as a result of initial async validator run
             'value: "new!"',    // value change emitted by `setValue`
             'status: INVALID'   // async validator run after `setValue` call
           ]);
         }));

      it('should run the async validator on stand alone controls and set status to `VALID`',
         fakeAsync(() => {
           const logs: string[] = [];
           const c = new FormControl('', null, asyncValidator('new!'));

           attachEventsLogger(c, logs);

           expect(logs.length).toBe(0);

           tick(1);

           c.setValue('new!', {emitEvent: true});

           tick(1);

           expect(logs).toEqual([
             'status: INVALID',  // status change emitted as a result of initial async validator run
             'value: "new!"',    // value change emitted by `setValue`
             'status: PENDING',  // status change emitted by `setValue`
             'status: VALID'     // async validator run after `setValue` call
           ]);
         }));

      it('should run the async validator on stand alone controls, include `PENDING` and set status to `INVALID`',
         fakeAsync(() => {
           const logs: string[] = [];
           const c =
               new FormControl('', null, simpleAsyncValidator({timeout: 1, shouldFail: true}));

           attachEventsLogger(c, logs);

           expect(logs.length).toBe(0);

           tick(1);

           c.setValue('new!', {emitEvent: true});

           tick(1);

           expect(logs).toEqual([
             'status: INVALID',  // status change emitted as a result of initial async validator run
             'value: "new!"',    // value change emitted by `setValue`
             'status: PENDING',  // status change emitted by `setValue`
             'status: INVALID'   // async validator run after `setValue` call
           ]);
         }));

      it('should run setValue before the initial async validator and set status to `VALID`',
         fakeAsync(() => {
           const logs: string[] = [];
           const c = new FormControl('', null, asyncValidator('new!'));

           attachEventsLogger(c, logs);

           expect(logs.length).toBe(0);

           c.setValue('new!', {emitEvent: true});

           tick(1);

           // The `setValue` call invoked synchronously cancels the initial run of the
           // `asyncValidator` (which would cause the control status to be changed to `INVALID`), so
           // the log contains only events after calling `setValue`.
           expect(logs).toEqual([
             'value: "new!"',    // value change emitted by `setValue`
             'status: PENDING',  // status change emitted by `setValue`
             'status: VALID'     // async validator run after `setValue` call
           ]);
         }));

      it('should run setValue before the initial async validator and set status to `INVALID`',
         fakeAsync(() => {
           const logs: string[] = [];
           const c =
               new FormControl('', null, simpleAsyncValidator({timeout: 1, shouldFail: true}));

           attachEventsLogger(c, logs);

           expect(logs.length).toBe(0);

           c.setValue('new!', {emitEvent: true});

           tick(1);

           // The `setValue` call invoked synchronously cancels the initial run of the
           // `asyncValidator` (which would cause the control status to be changed to `INVALID`), so
           // the log contains only events after calling `setValue`.
           expect(logs).toEqual([
             'value: "new!"',    // value change emitted by `setValue`
             'status: PENDING',  // status change emitted by `setValue`
             'status: INVALID'   // async validator run after `setValue` call
           ]);
         }));

      it('should cancel initial run of the async validator and not emit anything', fakeAsync(() => {
           const logger: string[] = [];
           const c =
               new FormControl('', null, simpleAsyncValidator({timeout: 1, shouldFail: true}));

           attachEventsLogger(c, logger);

           expect(logger.length).toBe(0);

           c.setValue('new!', {emitEvent: false});

           tick(1);

           // Because we are calling `setValue` with `emitEvent: false`, nothing is emitted
           // and our logger remains empty
           expect(logger).toEqual([]);
         }));

      it('should run the sync validator on stand alone controls and set status to `INVALID`',
         fakeAsync(() => {
           const logs: string[] = [];
           const c = new FormControl('new!', Validators.required);

           attachEventsLogger(c, logs);

           expect(logs.length).toBe(0);

           tick(1);

           c.setValue('', {emitEvent: true});

           tick(1);

           expect(logs).toEqual([
             'value: ""',       // value change emitted by `setValue`
             'status: INVALID'  // status change emitted by `setValue`
           ]);
         }));

      it('should run the sync validator on stand alone controls and set status to `VALID`',
         fakeAsync(() => {
           const logs: string[] = [];
           const c = new FormControl('', Validators.required);

           attachEventsLogger(c, logs);

           expect(logs.length).toBe(0);

           tick(1);

           c.setValue('new!', {emitEvent: true});

           tick(1);

           expect(logs).toEqual([
             'value: "new!"',  // value change emitted by `setValue`
             'status: VALID'   // status change emitted by `setValue`
           ]);
         }));
    });

    describe('combination of multiple form controls', () => {
      it('should run the async validator on the FormControl added to the FormGroup and set status to `VALID`',
         fakeAsync(() => {
           const logs: string[] = [];
           const c1 = new FormControl('one');
           const g1 = new FormGroup({'one': c1});

           // Initial state of the controls
           expect(currentStateOf([c1, g1])).toEqual([
             {errors: null, pending: false, status: 'VALID'},  // Control 1
             {errors: null, pending: false, status: 'VALID'},  // Group
           ]);

           attachEventsLogger(g1, logs, 'g1');

           const c2 = new FormControl('new!', null, asyncValidator('new!'));

           attachEventsLogger(c2, logs, 'c2');

           // Initial state of the new control
           expect(currentStateOf([c2])).toEqual([
             {errors: null, pending: true, status: 'PENDING'},  // Control 2
           ]);

           expect(logs.length).toBe(0);

           g1.setControl('one', c2);

           tick(1);

           expect(logs).toEqual([
             'value (g1): {"one":"new!"}',  // value change emitted by `setControl`
             'status (g1): PENDING',        // value change emitted by `setControl`
             'status (c2): VALID',          // async validator run after `setControl` call
             'status (g1): VALID'           // status changed from the `setControl` call
           ]);

           // Final state of all controls
           expect(currentStateOf([g1, c2])).toEqual([
             {errors: null, pending: false, status: 'VALID'},  // Group
             {errors: null, pending: false, status: 'VALID'},  // Control 2
           ]);
         }));

      it('should run the async validator on the FormControl added to the FormGroup and set status to `INVALID`',
         fakeAsync(() => {
           const logs: string[] = [];
           const c1 = new FormControl('one');
           const g1 = new FormGroup({'one': c1});

           // Initial state of the controls
           expect(currentStateOf([c1, g1])).toEqual([
             {errors: null, pending: false, status: 'VALID'},  // Control 1
             {errors: null, pending: false, status: 'VALID'},  // Group
           ]);

           attachEventsLogger(g1, logs, 'g1');

           const c2 =
               new FormControl('new!', null, simpleAsyncValidator({timeout: 1, shouldFail: true}));

           attachEventsLogger(c2, logs, 'c2');

           // Initial state of the new control
           expect(currentStateOf([c2])).toEqual([
             {errors: null, pending: true, status: 'PENDING'},  // Control 2
           ]);

           expect(logs.length).toBe(0);

           g1.setControl('one', c2);

           tick(1);

           expect(logs).toEqual([
             'value (g1): {"one":"new!"}',
             'status (g1): PENDING',  // g1 async validator is invoked after `g1.setControl` call
             'status (c2): INVALID',  // c2 async validator trigger at c2 init, completed with the
                                      // `INVALID` status
             'status (g1): INVALID'   // g1 validator completed with the `INVALID` status
           ]);

           // Final state of all controls
           expect(currentStateOf([g1, c2])).toEqual([
             {errors: null, pending: false, status: 'INVALID'},           // Group
             {errors: {async: true}, pending: false, status: 'INVALID'},  // Control 2
           ]);
         }));

      it('should run the async validator at `FormControl` and `FormGroup` level and set status to `INVALID`',
         fakeAsync(() => {
           const logs: string[] = [];
           const c1 = new FormControl('one');
           const g1 = new FormGroup(
               {'one': c1}, null, simpleAsyncValidator({timeout: 1, shouldFail: true}));

           // Initial state of the controls
           expect(currentStateOf([c1, g1])).toEqual([
             {errors: null, pending: false, status: 'VALID'},   // Control 1
             {errors: null, pending: true, status: 'PENDING'},  // Group
           ]);

           attachEventsLogger(g1, logs, 'g1');

           const c2 =
               new FormControl('new!', null, simpleAsyncValidator({timeout: 1, shouldFail: true}));

           attachEventsLogger(c2, logs, 'c2');

           // Initial state of the new control
           expect(currentStateOf([c2])).toEqual([
             {errors: null, pending: true, status: 'PENDING'},  // Control 2
           ]);

           expect(logs.length).toBe(0);

           g1.setControl('one', c2);

           tick(1);

           expect(logs).toEqual([
             'value (g1): {"one":"new!"}',
             'status (g1): PENDING',  // g1 async validator is invoked after `g1.setControl` call
             'status (c2): INVALID',  // c2 async validator trigger at c2 init, completed with the
                                      // `INVALID` status
             'status (g1): PENDING',  // c2 update triggered g1 to re-run validation
             'status (g1): INVALID'   // g1 validator completed with the `INVALID` status
           ]);

           // Final state of all controls
           expect(currentStateOf([g1, c2])).toEqual([
             {errors: {async: true}, pending: false, status: 'INVALID'},  // Group
             {errors: {async: true}, pending: false, status: 'INVALID'},  // Control 2
           ]);
         }));

      it('should run the async validator on a `FormArray` and a `FormControl` and status to `INVALID`',
         fakeAsync(() => {
           const logs: string[] = [];
           const c1 = new FormControl('one');
           const g1 = new FormGroup(
               {'one': c1}, null, simpleAsyncValidator({timeout: 1, shouldFail: true}));
           const fa =
               new FormArray([g1], null!, simpleAsyncValidator({timeout: 1, shouldFail: true}));

           attachEventsLogger(g1, logs, 'g1');

           // Initial state of the controls
           expect(currentStateOf([c1, g1, fa])).toEqual([
             {errors: null, pending: false, status: 'VALID'},   // Control 1
             {errors: null, pending: true, status: 'PENDING'},  // Group
             {errors: null, pending: true, status: 'PENDING'},  // FormArray
           ]);

           attachEventsLogger(fa, logs, 'fa');

           const c2 =
               new FormControl('new!', null, simpleAsyncValidator({timeout: 1, shouldFail: true}));

           attachEventsLogger(c2, logs, 'c2');

           // Initial state of the new control
           expect(currentStateOf([c2])).toEqual([
             {errors: null, pending: true, status: 'PENDING'},  // Control 2
           ]);

           expect(logs.length).toBe(0);

           g1.setControl('one', c2);

           tick(1);

           expect(logs).toEqual([
             'value (g1): {"one":"new!"}',    // g1's call to `setControl` triggered value update
             'status (g1): PENDING',          // g1's call to `setControl` triggered status update
             'value (fa): [{"one":"new!"}]',  // g1 update triggers the `FormArray` value update
             'status (fa): PENDING',          // g1 update triggers the `FormArray` status update
             'status (c2): INVALID',          // async validator run after `setControl` call
             'status (g1): PENDING',          // async validator run after `setControl` call
             'status (fa): PENDING',          // async validator run after `setControl` call
             'status (g1): INVALID',          // g1 validator completed with the `INVALID` status
             'status (fa): PENDING',          // fa validator still running
             'status (fa): INVALID'           // fa validator completed with the `INVALID` status
           ]);

           // Final state of all controls
           expect(currentStateOf([g1, fa, c2])).toEqual([
             {errors: {async: true}, pending: false, status: 'INVALID'},  // Group
             {errors: {async: true}, pending: false, status: 'INVALID'},  // FormArray
             {errors: {async: true}, pending: false, status: 'INVALID'},  // Control 2
           ]);
         }));
    });
  });

  describe('pending', () => {
    let c: FormControl;
    let g: FormGroup;

    beforeEach(() => {
      c = new FormControl('value');
      g = new FormGroup({'one': c});
    });

    it('should be false after creating a control', () => {
      expect(g.pending).toEqual(false);
    });

    it('should be true after changing the value of the control', () => {
      c.markAsPending();
      expect(g.pending).toEqual(true);
    });

    it('should not update the parent when onlySelf = true', () => {
      c.markAsPending({onlySelf: true});
      expect(g.pending).toEqual(false);
    });

    describe('status change events', () => {
      let logger: string[];

      beforeEach(() => {
        logger = [];
        g.statusChanges.subscribe((status) => logger.push(status));
      });

      it('should emit event after marking control as pending', () => {
        c.markAsPending();
        expect(logger).toEqual(['PENDING']);
      });

      it('should not emit event when onlySelf = true', () => {
        c.markAsPending({onlySelf: true});
        expect(logger).toEqual([]);
      });

      it('should not emit event when called with `emitEvent: false`', () => {
        c.markAsPending({emitEvent: false});
        expect(logger).toEqual([]);
      });

      it('should emit event when parent is markedAsPending', () => {
        g.markAsPending();
        expect(logger).toEqual(['PENDING']);
      });
    });
  });
});
})();
