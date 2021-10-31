/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fakeAsync, tick} from '@angular/core/testing';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';
import {Validators} from '@angular/forms/src/validators';
import {of} from 'rxjs';
import {asyncValidator} from './util';

(function() {
describe('FormArray', () => {
  describe('adding/removing', () => {
    let a: FormArray;
    let c1: FormControl, c2: FormControl, c3: FormControl;
    let logger: string[];

    beforeEach(() => {
      a = new FormArray([]);
      c1 = new FormControl(1);
      c2 = new FormControl(2);
      c3 = new FormControl(3);
      logger = [];
    });

    it('should support pushing', () => {
      a.push(c1);
      expect(a.length).toEqual(1);
      expect(a.controls).toEqual([c1]);
    });

    it('should support removing', () => {
      a.push(c1);
      a.push(c2);
      a.push(c3);

      a.removeAt(1);

      expect(a.controls).toEqual([c1, c3]);
    });

    it('should support clearing', () => {
      a.push(c1);
      a.push(c2);
      a.push(c3);

      a.clear();

      expect(a.controls).toEqual([]);

      a.clear();

      expect(a.controls).toEqual([]);
    });

    it('should support inserting', () => {
      a.push(c1);
      a.push(c3);

      a.insert(1, c2);

      expect(a.controls).toEqual([c1, c2, c3]);
    });

    it('should not emit events when calling `FormArray.push` with `emitEvent: false`', () => {
      a.valueChanges.subscribe(() => logger.push('value change'));
      a.statusChanges.subscribe(() => logger.push('status change'));

      a.push(c1, {emitEvent: false});

      expect(a.length).toEqual(1);
      expect(a.controls).toEqual([c1]);
      expect(logger).toEqual([]);
    });

    it('should not emit events when calling `FormArray.removeAt` with `emitEvent: false`', () => {
      a.push(c1);
      a.push(c2);
      a.push(c3);

      a.valueChanges.subscribe(() => logger.push('value change'));
      a.statusChanges.subscribe(() => logger.push('status change'));

      a.removeAt(1, {emitEvent: false});

      expect(a.controls).toEqual([c1, c3]);
      expect(logger).toEqual([]);
    });

    it('should not emit events when calling `FormArray.clear` with `emitEvent: false`', () => {
      a.push(c1);
      a.push(c2);
      a.push(c3);

      a.valueChanges.subscribe(() => logger.push('value change'));
      a.statusChanges.subscribe(() => logger.push('status change'));

      a.clear({emitEvent: false});

      expect(a.controls).toEqual([]);
      expect(logger).toEqual([]);
    });

    it('should not emit events when calling `FormArray.insert` with `emitEvent: false`', () => {
      a.push(c1);
      a.push(c3);

      a.valueChanges.subscribe(() => logger.push('value change'));
      a.statusChanges.subscribe(() => logger.push('status change'));

      a.insert(1, c2, {emitEvent: false});

      expect(a.controls).toEqual([c1, c2, c3]);
      expect(logger).toEqual([]);
    });

    it('should not emit events when calling `FormArray.setControl` with `emitEvent: false`', () => {
      a.push(c1);
      a.push(c3);

      a.valueChanges.subscribe(() => logger.push('value change'));
      a.statusChanges.subscribe(() => logger.push('status change'));

      a.setControl(1, c2, {emitEvent: false});

      expect(a.controls).toEqual([c1, c2]);
      expect(logger).toEqual([]);
    });

    it('should not emit status change events when `FormArray.push` is called with `emitEvent: false`',
       () => {
         // Adding validators to make sure there are no status change event submitted when form
         // becomes invalid.
         const validatorFn = (value: any) => value.controls.length > 0 ? {controls: true} : null;
         const asyncValidatorFn = (value: any) => of(validatorFn(value));
         const arr = new FormArray([], validatorFn, asyncValidatorFn);
         expect(arr.valid).toBe(true);

         arr.statusChanges.subscribe(() => logger.push('status change'));

         arr.push(c1, {emitEvent: false});

         expect(arr.valid).toBe(false);
         expect(logger).toEqual([]);
       });

    it('should not emit events on the parent when called with `emitEvent: false`', () => {
      const form = new FormGroup({child: a});

      form.valueChanges.subscribe(() => logger.push('form value change'));
      a.valueChanges.subscribe(() => logger.push('array value change'));
      form.statusChanges.subscribe(() => logger.push('form status change'));
      a.statusChanges.subscribe(() => logger.push('array status change'));

      a.push(new FormControl(5), {emitEvent: false});
      expect(logger).toEqual([]);
    });
  });

  describe('value', () => {
    it('should be the reduced value of the child controls', () => {
      const a = new FormArray([new FormControl(1), new FormControl(2)]);
      expect(a.value).toEqual([1, 2]);
    });

    it('should be an empty array when there are no child controls', () => {
      const a = new FormArray([]);
      expect(a.value).toEqual([]);
    });
  });

  describe('getRawValue()', () => {
    let a: FormArray;

    it('should work with nested form groups/arrays', () => {
      a = new FormArray([
        new FormGroup({'c2': new FormControl('v2'), 'c3': new FormControl('v3')}),
        new FormArray([new FormControl('v4'), new FormControl('v5')])
      ]);
      a.at(0).get('c3')!.disable();
      (a.at(1) as FormArray).at(1).disable();

      expect(a.getRawValue()).toEqual([{'c2': 'v2', 'c3': 'v3'}, ['v4', 'v5']]);
    });
  });

  describe('markAllAsTouched', () => {
    it('should mark all descendants as touched', () => {
      const formArray: FormArray = new FormArray([
        new FormControl('v1'), new FormControl('v2'), new FormGroup({'c1': new FormControl('v1')}),
        new FormArray([new FormGroup({'c2': new FormControl('v2')})])
      ]);

      expect(formArray.touched).toBe(false);

      const control1 = formArray.at(0) as FormControl;

      expect(control1.touched).toBe(false);

      const group1 = formArray.at(2) as FormGroup;

      expect(group1.touched).toBe(false);

      const group1Control1 = group1.get('c1') as FormControl;

      expect(group1Control1.touched).toBe(false);

      const innerFormArray = formArray.at(3) as FormArray;

      expect(innerFormArray.touched).toBe(false);

      const innerFormArrayGroup = innerFormArray.at(0) as FormGroup;

      expect(innerFormArrayGroup.touched).toBe(false);

      const innerFormArrayGroupControl1 = innerFormArrayGroup.get('c2') as FormControl;

      expect(innerFormArrayGroupControl1.touched).toBe(false);

      formArray.markAllAsTouched();

      expect(formArray.touched).toBe(true);

      expect(control1.touched).toBe(true);

      expect(group1.touched).toBe(true);

      expect(group1Control1.touched).toBe(true);

      expect(innerFormArray.touched).toBe(true);

      expect(innerFormArrayGroup.touched).toBe(true);

      expect(innerFormArrayGroupControl1.touched).toBe(true);
    });
  });

  describe('setValue', () => {
    let c: FormControl, c2: FormControl, a: FormArray;

    beforeEach(() => {
      c = new FormControl('');
      c2 = new FormControl('');
      a = new FormArray([c, c2]);
    });

    it('should set its own value', () => {
      a.setValue(['one', 'two']);
      expect(a.value).toEqual(['one', 'two']);
    });

    it('should set child values', () => {
      a.setValue(['one', 'two']);
      expect(c.value).toEqual('one');
      expect(c2.value).toEqual('two');
    });

    it('should set values for disabled child controls', () => {
      c2.disable();
      a.setValue(['one', 'two']);
      expect(c2.value).toEqual('two');
      expect(a.value).toEqual(['one']);
      expect(a.getRawValue()).toEqual(['one', 'two']);
    });

    it('should set value for disabled arrays', () => {
      a.disable();
      a.setValue(['one', 'two']);
      expect(c.value).toEqual('one');
      expect(c2.value).toEqual('two');
      expect(a.value).toEqual(['one', 'two']);
    });

    it('should set parent values', () => {
      const form = new FormGroup({'parent': a});
      a.setValue(['one', 'two']);
      expect(form.value).toEqual({'parent': ['one', 'two']});
    });

    it('should not update the parent explicitly specified', () => {
      const form = new FormGroup({'parent': a});
      a.setValue(['one', 'two'], {onlySelf: true});

      expect(form.value).toEqual({parent: ['', '']});
    });

    it('should throw if fields are missing from supplied value (subset)', () => {
      expect(() => a.setValue([, 'two']))
          .toThrowError(new RegExp(`Must supply a value for form control at index: 0`));
    });

    it('should throw if a value is provided for a missing control (superset)', () => {
      expect(() => a.setValue([
        'one', 'two', 'three'
      ])).toThrowError(new RegExp(`Cannot find form control at index 2`));
    });

    it('should throw if a value is not provided for a disabled control', () => {
      c2.disable();
      expect(() => a.setValue(['one']))
          .toThrowError(new RegExp(`Must supply a value for form control at index: 1`));
    });

    it('should throw if no controls are set yet', () => {
      const empty = new FormArray([]);
      expect(() => empty.setValue(['one']))
          .toThrowError(new RegExp(`no form controls registered with this array`));
    });

    describe('setValue() events', () => {
      let form: FormGroup;
      let logger: any[];

      beforeEach(() => {
        form = new FormGroup({'parent': a});
        logger = [];
      });

      it('should emit one valueChange event per control', () => {
        form.valueChanges.subscribe(() => logger.push('form'));
        a.valueChanges.subscribe(() => logger.push('array'));
        c.valueChanges.subscribe(() => logger.push('control1'));
        c2.valueChanges.subscribe(() => logger.push('control2'));

        a.setValue(['one', 'two']);
        expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
      });

      it('should not fire events when called with `emitEvent: false`', () => {
        form.valueChanges.subscribe(() => logger.push('form'));
        a.valueChanges.subscribe(() => logger.push('array'));
        c.valueChanges.subscribe(() => logger.push('control1'));
        c2.valueChanges.subscribe(() => logger.push('control2'));

        a.setValue(['one', 'two'], {emitEvent: false});
        expect(logger).toEqual([]);
      });

      it('should emit one statusChange event per control', () => {
        form.statusChanges.subscribe(() => logger.push('form'));
        a.statusChanges.subscribe(() => logger.push('array'));
        c.statusChanges.subscribe(() => logger.push('control1'));
        c2.statusChanges.subscribe(() => logger.push('control2'));

        a.setValue(['one', 'two']);
        expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
      });
    });
  });

  describe('patchValue', () => {
    let c: FormControl, c2: FormControl, a: FormArray, a2: FormArray;

    beforeEach(() => {
      c = new FormControl('');
      c2 = new FormControl('');
      a = new FormArray([c, c2]);
      a2 = new FormArray([a]);
    });

    it('should set its own value', () => {
      a.patchValue(['one', 'two']);
      expect(a.value).toEqual(['one', 'two']);
    });

    it('should set child values', () => {
      a.patchValue(['one', 'two']);
      expect(c.value).toEqual('one');
      expect(c2.value).toEqual('two');
    });

    it('should patch disabled control values', () => {
      c2.disable();
      a.patchValue(['one', 'two']);
      expect(c2.value).toEqual('two');
      expect(a.value).toEqual(['one']);
      expect(a.getRawValue()).toEqual(['one', 'two']);
    });

    it('should patch disabled control arrays', () => {
      a.disable();
      a.patchValue(['one', 'two']);
      expect(c.value).toEqual('one');
      expect(c2.value).toEqual('two');
      expect(a.value).toEqual(['one', 'two']);
    });

    it('should set parent values', () => {
      const form = new FormGroup({'parent': a});
      a.patchValue(['one', 'two']);
      expect(form.value).toEqual({'parent': ['one', 'two']});
    });

    it('should not update the parent explicitly specified', () => {
      const form = new FormGroup({'parent': a});
      a.patchValue(['one', 'two'], {onlySelf: true});

      expect(form.value).toEqual({parent: ['', '']});
    });

    it('should ignore fields that are missing from supplied value (subset)', () => {
      a.patchValue([, 'two']);
      expect(a.value).toEqual(['', 'two']);
    });

    it('should not ignore fields that are null', () => {
      a.patchValue([null]);
      expect(a.value).toEqual([null, '']);
    });

    it('should ignore any value provided for a missing control (superset)', () => {
      a.patchValue([, , 'three']);
      expect(a.value).toEqual(['', '']);
    });

    it('should ignore a array if `null` or `undefined` are used as values', () => {
      const INITIAL_STATE = [['', '']];

      a2.patchValue([null]);
      expect(a2.value).toEqual(INITIAL_STATE);

      a2.patchValue([undefined]);
      expect(a2.value).toEqual(INITIAL_STATE);
    });

    describe('patchValue() events', () => {
      let form: FormGroup;
      let logger: any[];

      beforeEach(() => {
        form = new FormGroup({'parent': a});
        logger = [];
      });

      it('should emit one valueChange event per control', () => {
        form.valueChanges.subscribe(() => logger.push('form'));
        a.valueChanges.subscribe(() => logger.push('array'));
        c.valueChanges.subscribe(() => logger.push('control1'));
        c2.valueChanges.subscribe(() => logger.push('control2'));

        a.patchValue(['one', 'two']);
        expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
      });

      it('should not emit valueChange events for skipped controls', () => {
        form.valueChanges.subscribe(() => logger.push('form'));
        a.valueChanges.subscribe(() => logger.push('array'));
        c.valueChanges.subscribe(() => logger.push('control1'));
        c2.valueChanges.subscribe(() => logger.push('control2'));

        a.patchValue(['one']);
        expect(logger).toEqual(['control1', 'array', 'form']);
      });

      it('should not emit valueChange events for skipped controls (represented as `null` or `undefined`)',
         () => {
           const logEvent = () => logger.push('valueChanges event');

           const [formArrayControl1, formArrayControl2] = (a2.controls as FormArray[])[0].controls;

           formArrayControl1.valueChanges.subscribe(logEvent);
           formArrayControl2.valueChanges.subscribe(logEvent);

           a2.patchValue([null]);
           a2.patchValue([undefined]);

           // No events are expected in `valueChanges` since
           // all controls were skipped in `patchValue`.
           expect(logger).toEqual([]);
         });

      it('should not fire events when called with `emitEvent: false`', () => {
        form.valueChanges.subscribe(() => logger.push('form'));
        a.valueChanges.subscribe(() => logger.push('array'));
        c.valueChanges.subscribe(() => logger.push('control1'));
        c2.valueChanges.subscribe(() => logger.push('control2'));

        a.patchValue(['one', 'two'], {emitEvent: false});
        expect(logger).toEqual([]);
      });

      it('should emit one statusChange event per control', () => {
        form.statusChanges.subscribe(() => logger.push('form'));
        a.statusChanges.subscribe(() => logger.push('array'));
        c.statusChanges.subscribe(() => logger.push('control1'));
        c2.statusChanges.subscribe(() => logger.push('control2'));

        a.patchValue(['one', 'two']);
        expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
      });
    });
  });

  describe('reset()', () => {
    let c: FormControl, c2: FormControl, a: FormArray;

    beforeEach(() => {
      c = new FormControl('initial value');
      c2 = new FormControl('');
      a = new FormArray([c, c2]);
    });

    it('should set its own value if value passed', () => {
      a.setValue(['new value', 'new value']);

      a.reset(['initial value', '']);
      expect(a.value).toEqual(['initial value', '']);
    });

    it('should not update the parent when explicitly specified', () => {
      const form = new FormGroup({'a': a});
      a.reset(['one', 'two'], {onlySelf: true});

      expect(form.value).toEqual({a: ['initial value', '']});
    });

    it('should set its own value if boxed value passed', () => {
      a.setValue(['new value', 'new value']);

      a.reset([{value: 'initial value', disabled: false}, '']);
      expect(a.value).toEqual(['initial value', '']);
    });

    it('should clear its own value if no value passed', () => {
      a.setValue(['new value', 'new value']);

      a.reset();
      expect(a.value).toEqual([null, null]);
    });

    it('should set the value of each of its child controls if value passed', () => {
      a.setValue(['new value', 'new value']);

      a.reset(['initial value', '']);
      expect(c.value).toBe('initial value');
      expect(c2.value).toBe('');
    });

    it('should clear the value of each of its child controls if no value', () => {
      a.setValue(['new value', 'new value']);

      a.reset();
      expect(c.value).toBe(null);
      expect(c2.value).toBe(null);
    });

    it('should set the value of its parent if value passed', () => {
      const form = new FormGroup({'a': a});
      a.setValue(['new value', 'new value']);

      a.reset(['initial value', '']);
      expect(form.value).toEqual({'a': ['initial value', '']});
    });

    it('should clear the value of its parent if no value passed', () => {
      const form = new FormGroup({'a': a});
      a.setValue(['new value', 'new value']);

      a.reset();
      expect(form.value).toEqual({'a': [null, null]});
    });

    it('should mark itself as pristine', () => {
      a.markAsDirty();
      expect(a.pristine).toBe(false);

      a.reset();
      expect(a.pristine).toBe(true);
    });

    it('should mark all child controls as pristine', () => {
      c.markAsDirty();
      c2.markAsDirty();
      expect(c.pristine).toBe(false);
      expect(c2.pristine).toBe(false);

      a.reset();
      expect(c.pristine).toBe(true);
      expect(c2.pristine).toBe(true);
    });

    it('should mark the parent as pristine if all siblings pristine', () => {
      const c3 = new FormControl('');
      const form = new FormGroup({'a': a, 'c3': c3});

      a.markAsDirty();
      expect(form.pristine).toBe(false);

      a.reset();
      expect(form.pristine).toBe(true);
    });

    it('should not mark the parent pristine if any dirty siblings', () => {
      const c3 = new FormControl('');
      const form = new FormGroup({'a': a, 'c3': c3});

      a.markAsDirty();
      c3.markAsDirty();
      expect(form.pristine).toBe(false);

      a.reset();
      expect(form.pristine).toBe(false);
    });

    it('should mark itself as untouched', () => {
      a.markAsTouched();
      expect(a.untouched).toBe(false);

      a.reset();
      expect(a.untouched).toBe(true);
    });

    it('should mark all child controls as untouched', () => {
      c.markAsTouched();
      c2.markAsTouched();
      expect(c.untouched).toBe(false);
      expect(c2.untouched).toBe(false);

      a.reset();
      expect(c.untouched).toBe(true);
      expect(c2.untouched).toBe(true);
    });

    it('should mark the parent untouched if all siblings untouched', () => {
      const c3 = new FormControl('');
      const form = new FormGroup({'a': a, 'c3': c3});

      a.markAsTouched();
      expect(form.untouched).toBe(false);

      a.reset();
      expect(form.untouched).toBe(true);
    });

    it('should not mark the parent untouched if any touched siblings', () => {
      const c3 = new FormControl('');
      const form = new FormGroup({'a': a, 'c3': c3});

      a.markAsTouched();
      c3.markAsTouched();
      expect(form.untouched).toBe(false);

      a.reset();
      expect(form.untouched).toBe(false);
    });

    it('should retain previous disabled state', () => {
      a.disable();
      a.reset();

      expect(a.disabled).toBe(true);
    });

    it('should set child disabled state if boxed value passed', () => {
      a.disable();
      a.reset([{value: '', disabled: false}, '']);

      expect(c.disabled).toBe(false);
      expect(a.disabled).toBe(false);
    });


    describe('reset() events', () => {
      let form: FormGroup, c3: FormControl, logger: any[];

      beforeEach(() => {
        c3 = new FormControl('');
        form = new FormGroup({'a': a, 'c3': c3});
        logger = [];
      });

      it('should emit one valueChange event per reset control', () => {
        form.valueChanges.subscribe(() => logger.push('form'));
        a.valueChanges.subscribe(() => logger.push('array'));
        c.valueChanges.subscribe(() => logger.push('control1'));
        c2.valueChanges.subscribe(() => logger.push('control2'));
        c3.valueChanges.subscribe(() => logger.push('control3'));

        a.reset();
        expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
      });

      it('should not fire events when called with `emitEvent: false`', () => {
        form.valueChanges.subscribe(() => logger.push('form'));
        a.valueChanges.subscribe(() => logger.push('array'));
        c.valueChanges.subscribe(() => logger.push('control1'));
        c2.valueChanges.subscribe(() => logger.push('control2'));
        c3.valueChanges.subscribe(() => logger.push('control3'));

        a.reset([], {emitEvent: false});
        expect(logger).toEqual([]);
      });

      it('should emit one statusChange event per reset control', () => {
        form.statusChanges.subscribe(() => logger.push('form'));
        a.statusChanges.subscribe(() => logger.push('array'));
        c.statusChanges.subscribe(() => logger.push('control1'));
        c2.statusChanges.subscribe(() => logger.push('control2'));
        c3.statusChanges.subscribe(() => logger.push('control3'));

        a.reset();
        expect(logger).toEqual(['control1', 'control2', 'array', 'form']);
      });

      it('should mark as pristine and not dirty before emitting valueChange and statusChange events when resetting',
         () => {
           const pristineAndNotDirty = () => {
             expect(a.pristine).toBe(true);
             expect(a.dirty).toBe(false);
           };

           c2.markAsDirty();
           expect(a.pristine).toBe(false);
           expect(a.dirty).toBe(true);

           a.valueChanges.subscribe(pristineAndNotDirty);
           a.statusChanges.subscribe(pristineAndNotDirty);

           a.reset();
         });
    });
  });

  describe('errors', () => {
    it('should run the validator when the value changes', () => {
      const simpleValidator = (c: FormArray) =>
          c.controls[0].value != 'correct' ? {'broken': true} : null;

      const c = new FormControl(null);
      const g = new FormArray([c], simpleValidator as ValidatorFn);

      c.setValue('correct');

      expect(g.valid).toEqual(true);
      expect(g.errors).toEqual(null);

      c.setValue('incorrect');

      expect(g.valid).toEqual(false);
      expect(g.errors).toEqual({'broken': true});
    });
  });


  describe('dirty', () => {
    let c: FormControl;
    let a: FormArray;

    beforeEach(() => {
      c = new FormControl('value');
      a = new FormArray([c]);
    });

    it('should be false after creating a control', () => {
      expect(a.dirty).toEqual(false);
    });

    it('should be true after changing the value of the control', () => {
      c.markAsDirty();

      expect(a.dirty).toEqual(true);
    });
  });

  describe('touched', () => {
    let c: FormControl;
    let a: FormArray;

    beforeEach(() => {
      c = new FormControl('value');
      a = new FormArray([c]);
    });

    it('should be false after creating a control', () => {
      expect(a.touched).toEqual(false);
    });

    it('should be true after child control is marked as touched', () => {
      c.markAsTouched();

      expect(a.touched).toEqual(true);
    });
  });


  describe('pending', () => {
    let c: FormControl;
    let a: FormArray;

    beforeEach(() => {
      c = new FormControl('value');
      a = new FormArray([c]);
    });

    it('should be false after creating a control', () => {
      expect(c.pending).toEqual(false);
      expect(a.pending).toEqual(false);
    });

    it('should be true after changing the value of the control', () => {
      c.markAsPending();

      expect(c.pending).toEqual(true);
      expect(a.pending).toEqual(true);
    });

    it('should not update the parent when onlySelf = true', () => {
      c.markAsPending({onlySelf: true});

      expect(c.pending).toEqual(true);
      expect(a.pending).toEqual(false);
    });

    describe('status change events', () => {
      let logger: string[];

      beforeEach(() => {
        logger = [];
        a.statusChanges.subscribe((status) => logger.push(status));
      });

      it('should emit event after marking control as pending', () => {
        c.markAsPending();
        expect(logger).toEqual(['PENDING']);
      });

      it('should not emit event from parent when onlySelf is true', () => {
        c.markAsPending({onlySelf: true});
        expect(logger).toEqual([]);
      });

      it('should not emit events when called with `emitEvent: false`', () => {
        c.markAsPending({emitEvent: false});
        expect(logger).toEqual([]);
      });

      it('should emit event when parent is markedAsPending', () => {
        a.markAsPending();
        expect(logger).toEqual(['PENDING']);
      });
    });
  });

  describe('valueChanges', () => {
    let a: FormArray;
    let c1: any /** TODO #9100 */, c2: any /** TODO #9100 */;

    beforeEach(() => {
      c1 = new FormControl('old1');
      c2 = new FormControl('old2');
      a = new FormArray([c1, c2]);
    });

    it('should fire an event after the value has been updated', done => {
      a.valueChanges.subscribe({
        next: (value: any) => {
          expect(a.value).toEqual(['new1', 'old2']);
          expect(value).toEqual(['new1', 'old2']);
          done();
        }
      });
      c1.setValue('new1');
    });

    it('should fire an event after the control\'s observable fired an event', done => {
      let controlCallbackIsCalled = false;


      c1.valueChanges.subscribe({
        next: (value: any) => {
          controlCallbackIsCalled = true;
        }
      });

      a.valueChanges.subscribe({
        next: (value: any) => {
          expect(controlCallbackIsCalled).toBe(true);
          done();
        }
      });

      c1.setValue('new1');
    });

    it('should fire an event when a control is removed', done => {
      a.valueChanges.subscribe({
        next: (value: any) => {
          expect(value).toEqual(['old1']);
          done();
        }
      });

      a.removeAt(1);
    });

    it('should fire an event when a control is added', done => {
      a.removeAt(1);

      a.valueChanges.subscribe({
        next: (value: any) => {
          expect(value).toEqual(['old1', 'old2']);
          done();
        }
      });

      a.push(c2);
    });
  });

  describe('get', () => {
    it('should return null when path is null', () => {
      const g = new FormGroup({});
      expect(g.get(null!)).toEqual(null);
    });

    it('should return null when path is empty', () => {
      const g = new FormGroup({});
      expect(g.get([])).toEqual(null);
    });

    it('should return null when path is invalid', () => {
      const g = new FormGroup({});
      expect(g.get('invalid')).toEqual(null);
    });

    it('should return a child of a control group', () => {
      const g = new FormGroup({
        'one': new FormControl('111'),
        'nested': new FormGroup({'two': new FormControl('222')})
      });

      expect(g.get(['one'])!.value).toEqual('111');
      expect(g.get('one')!.value).toEqual('111');
      expect(g.get(['nested', 'two'])!.value).toEqual('222');
      expect(g.get('nested.two')!.value).toEqual('222');
    });

    it('should return an element of an array', () => {
      const g = new FormGroup({'array': new FormArray([new FormControl('111')])});

      expect(g.get(['array', 0])!.value).toEqual('111');
    });
  });

  describe('validator', () => {
    function simpleValidator(c: AbstractControl): ValidationErrors|null {
      return c.get([0])!.value === 'correct' ? null : {'broken': true};
    }

    function arrayRequiredValidator(c: AbstractControl): ValidationErrors|null {
      return Validators.required(c.get([0]) as AbstractControl);
    }

    it('should set a single validator', () => {
      const a = new FormArray([new FormControl()], simpleValidator);
      expect(a.valid).toBe(false);
      expect(a.errors).toEqual({'broken': true});

      a.setValue(['correct']);
      expect(a.valid).toBe(true);
    });

    it('should set a single validator from options obj', () => {
      const a = new FormArray([new FormControl()], {validators: simpleValidator});
      expect(a.valid).toBe(false);
      expect(a.errors).toEqual({'broken': true});

      a.setValue(['correct']);
      expect(a.valid).toBe(true);
    });

    it('should set multiple validators from an array', () => {
      const a = new FormArray([new FormControl()], [simpleValidator, arrayRequiredValidator]);
      expect(a.valid).toBe(false);
      expect(a.errors).toEqual({'required': true, 'broken': true});

      a.setValue(['c']);
      expect(a.valid).toBe(false);
      expect(a.errors).toEqual({'broken': true});

      a.setValue(['correct']);
      expect(a.valid).toBe(true);
    });

    it('should set multiple validators from options obj', () => {
      const a = new FormArray(
          [new FormControl()], {validators: [simpleValidator, arrayRequiredValidator]});
      expect(a.valid).toBe(false);
      expect(a.errors).toEqual({'required': true, 'broken': true});

      a.setValue(['c']);
      expect(a.valid).toBe(false);
      expect(a.errors).toEqual({'broken': true});

      a.setValue(['correct']);
      expect(a.valid).toBe(true);
    });
  });

  describe('asyncValidator', () => {
    function otherObservableValidator() {
      return of({'other': true});
    }

    it('should run the async validator', fakeAsync(() => {
         const c = new FormControl('value');
         const g = new FormArray([c], null!, asyncValidator('expected'));

         expect(g.pending).toEqual(true);

         tick();

         expect(g.errors).toEqual({'async': true});
         expect(g.pending).toEqual(false);
       }));

    it('should set a single async validator from options obj', fakeAsync(() => {
         const g = new FormArray(
             [new FormControl('value')], {asyncValidators: asyncValidator('expected')});

         expect(g.pending).toEqual(true);

         tick();

         expect(g.errors).toEqual({'async': true});
         expect(g.pending).toEqual(false);
       }));

    it('should set multiple async validators from an array', fakeAsync(() => {
         const g = new FormArray(
             [new FormControl('value')], null!,
             [asyncValidator('expected'), otherObservableValidator]);

         expect(g.pending).toEqual(true);

         tick();

         expect(g.errors).toEqual({'async': true, 'other': true});
         expect(g.pending).toEqual(false);
       }));

    it('should set multiple async validators from options obj', fakeAsync(() => {
         const g = new FormArray(
             [new FormControl('value')],
             {asyncValidators: [asyncValidator('expected'), otherObservableValidator]});

         expect(g.pending).toEqual(true);

         tick();

         expect(g.errors).toEqual({'async': true, 'other': true});
         expect(g.pending).toEqual(false);
       }));

    it('should fire statusChanges events when async validators are added via options object',
       fakeAsync(() => {
         // The behavior is tested (in other spec files) for each of the model types (`FormControl`,
         // `FormGroup` and `FormArray`).
         let statuses: string[] = [];

         // Create a form control with an async validator added via options object.
         const asc = new FormArray([], {asyncValidators: [() => Promise.resolve(null)]});

         // Subscribe to status changes.
         asc.statusChanges.subscribe((status: any) => statuses.push(status));

         // After a tick, the async validator should change status PENDING -> VALID.
         tick();
         expect(statuses).toEqual(['VALID']);
       }));
  });

  describe('disable() & enable()', () => {
    let a: FormArray;
    let c: FormControl;
    let c2: FormControl;

    beforeEach(() => {
      c = new FormControl(null);
      c2 = new FormControl(null);
      a = new FormArray([c, c2]);
    });

    it('should mark the array as disabled', () => {
      expect(a.disabled).toBe(false);
      expect(a.valid).toBe(true);

      a.disable();
      expect(a.disabled).toBe(true);
      expect(a.valid).toBe(false);

      a.enable();
      expect(a.disabled).toBe(false);
      expect(a.valid).toBe(true);
    });

    it('should set the array status as disabled', () => {
      expect(a.status).toBe('VALID');

      a.disable();
      expect(a.status).toBe('DISABLED');

      a.enable();
      expect(a.status).toBe('VALID');
    });

    it('should mark children of the array as disabled', () => {
      expect(c.disabled).toBe(false);
      expect(c2.disabled).toBe(false);

      a.disable();
      expect(c.disabled).toBe(true);
      expect(c2.disabled).toBe(true);

      a.enable();
      expect(c.disabled).toBe(false);
      expect(c2.disabled).toBe(false);
    });

    it('should ignore disabled controls in validation', () => {
      const g = new FormGroup({
        nested: new FormArray([new FormControl(null, Validators.required)]),
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
          {nested: new FormArray([new FormControl('one')]), two: new FormControl('two')});
      expect(g.value).toEqual({'nested': ['one'], 'two': 'two'});

      g.get('nested')!.disable();
      expect(g.value).toEqual({'two': 'two'});

      g.get('nested')!.enable();
      expect(g.value).toEqual({'nested': ['one'], 'two': 'two'});
    });

    it('should ignore disabled controls when determining dirtiness', () => {
      const g = new FormGroup({nested: a, two: new FormControl('two')});
      g.get(['nested', 0])!.markAsDirty();
      expect(g.dirty).toBe(true);

      g.get('nested')!.disable();
      expect(g.get('nested')!.dirty).toBe(true);
      expect(g.dirty).toEqual(false);

      g.get('nested')!.enable();
      expect(g.dirty).toEqual(true);
    });

    it('should ignore disabled controls when determining touched state', () => {
      const g = new FormGroup({nested: a, two: new FormControl('two')});
      g.get(['nested', 0])!.markAsTouched();
      expect(g.touched).toBe(true);

      g.get('nested')!.disable();
      expect(g.get('nested')!.touched).toBe(true);
      expect(g.touched).toEqual(false);

      g.get('nested')!.enable();
      expect(g.touched).toEqual(true);
    });

    it('should keep empty, disabled arrays disabled when updating validity', () => {
      const arr = new FormArray([]);
      expect(arr.status).toEqual('VALID');

      arr.disable();
      expect(arr.status).toEqual('DISABLED');

      arr.updateValueAndValidity();
      expect(arr.status).toEqual('DISABLED');

      arr.push(new FormControl({value: '', disabled: true}));
      expect(arr.status).toEqual('DISABLED');

      arr.push(new FormControl());
      expect(arr.status).toEqual('VALID');
    });

    it('should re-enable empty, disabled arrays', () => {
      const arr = new FormArray([]);
      arr.disable();
      expect(arr.status).toEqual('DISABLED');

      arr.enable();
      expect(arr.status).toEqual('VALID');
    });

    it('should not run validators on disabled controls', () => {
      const validator = jasmine.createSpy('validator');
      const arr = new FormArray([new FormControl()], validator);
      expect(validator.calls.count()).toEqual(1);

      arr.disable();
      expect(validator.calls.count()).toEqual(1);

      arr.setValue(['value']);
      expect(validator.calls.count()).toEqual(1);

      arr.enable();
      expect(validator.calls.count()).toEqual(2);
    });

    describe('disabled errors', () => {
      it('should clear out array errors when disabled', () => {
        const arr = new FormArray([new FormControl()], () => ({'expected': true}));
        expect(arr.errors).toEqual({'expected': true});

        arr.disable();
        expect(arr.errors).toEqual(null);

        arr.enable();
        expect(arr.errors).toEqual({'expected': true});
      });

      it('should re-populate array errors when enabled from a child', () => {
        const arr = new FormArray([new FormControl()], () => ({'expected': true}));
        arr.disable();
        expect(arr.errors).toEqual(null);

        arr.push(new FormControl());
        expect(arr.errors).toEqual({'expected': true});
      });

      it('should clear out async array errors when disabled', fakeAsync(() => {
           const arr = new FormArray([new FormControl()], null!, asyncValidator('expected'));
           tick();
           expect(arr.errors).toEqual({'async': true});

           arr.disable();
           expect(arr.errors).toEqual(null);

           arr.enable();
           tick();
           expect(arr.errors).toEqual({'async': true});
         }));

      it('should re-populate async array errors when enabled from a child', fakeAsync(() => {
           const arr = new FormArray([new FormControl()], null!, asyncValidator('expected'));
           tick();
           expect(arr.errors).toEqual({'async': true});

           arr.disable();
           expect(arr.errors).toEqual(null);

           arr.push(new FormControl());
           tick();
           expect(arr.errors).toEqual({'async': true});
         }));
    });

    describe('disabled events', () => {
      let logger: string[];
      let c: FormControl;
      let a: FormArray;
      let form: FormGroup;

      beforeEach(() => {
        logger = [];
        c = new FormControl('', Validators.required);
        a = new FormArray([c]);
        form = new FormGroup({a: a});
      });

      it('should emit value change events in the right order', () => {
        c.valueChanges.subscribe(() => logger.push('control'));
        a.valueChanges.subscribe(() => logger.push('array'));
        form.valueChanges.subscribe(() => logger.push('form'));

        a.disable();
        expect(logger).toEqual(['control', 'array', 'form']);
      });

      it('should emit status change events in the right order', () => {
        c.statusChanges.subscribe(() => logger.push('control'));
        a.statusChanges.subscribe(() => logger.push('array'));
        form.statusChanges.subscribe(() => logger.push('form'));

        a.disable();
        expect(logger).toEqual(['control', 'array', 'form']);
      });

      it('should not emit value change events when called with `emitEvent: false`', () => {
        c.valueChanges.subscribe(() => logger.push('control'));
        a.valueChanges.subscribe(() => logger.push('array'));
        form.valueChanges.subscribe(() => logger.push('form'));

        a.disable({emitEvent: false});
        expect(logger).toEqual([]);
        a.enable({emitEvent: false});
        expect(logger).toEqual([]);
      });

      it('should not emit status change events when called with `emitEvent: false`', () => {
        c.statusChanges.subscribe(() => logger.push('control'));
        a.statusChanges.subscribe(() => logger.push('array'));
        form.statusChanges.subscribe(() => logger.push('form'));

        a.disable({emitEvent: false});
        expect(logger).toEqual([]);
        a.enable({emitEvent: false});
        expect(logger).toEqual([]);
      });
    });

    describe('setControl()', () => {
      let c: FormControl;
      let a: FormArray;

      beforeEach(() => {
        c = new FormControl('one');
        a = new FormArray([c]);
      });

      it('should replace existing control with new control', () => {
        const c2 = new FormControl('new!', Validators.minLength(10));
        a.setControl(0, c2);

        expect(a.controls[0]).toEqual(c2);
        expect(a.value).toEqual(['new!']);
        expect(a.valid).toBe(false);
      });

      it('should add control if control did not exist before', () => {
        const c2 = new FormControl('new!', Validators.minLength(10));
        a.setControl(1, c2);

        expect(a.controls[1]).toEqual(c2);
        expect(a.value).toEqual(['one', 'new!']);
        expect(a.valid).toBe(false);
      });

      it('should remove control if new control is null', () => {
        a.setControl(0, null!);
        expect(a.controls[0]).not.toBeDefined();
        expect(a.value).toEqual([]);
      });

      it('should only emit value change event once', () => {
        const logger: string[] = [];
        const c2 = new FormControl('new!');
        a.valueChanges.subscribe(() => logger.push('change!'));
        a.setControl(0, c2);
        expect(logger).toEqual(['change!']);
      });
    });
  });
});
})();
