/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';
import {async, fakeAsync, tick} from '@angular/core/testing';
import {AsyncTestCompleter, beforeEach, describe, inject, it} from '@angular/core/testing/src/testing_internal';
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';


export function main() {
  function asyncValidator(expected: string, timeouts = {}) {
    return (c: AbstractControl) => {
      let resolve: (result: any) => void = undefined !;
      const promise = new Promise(res => { resolve = res; });
      const t = (timeouts as any)[c.value] != null ? (timeouts as any)[c.value] : 0;
      const res = c.value != expected ? {'async': true} : null;

      if (t == 0) {
        resolve(res);
      } else {
        setTimeout(() => { resolve(res); }, t);
      }

      return promise;
    };
  }

  function asyncValidatorReturningObservable(c: FormControl) {
    const e = new EventEmitter();
    Promise.resolve(null).then(() => { e.emit({'async': true}); });
    return e;
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
        fg.get('group') !.get('c3') !.disable();
        (fg.get('array') as FormArray).at(1).disable();

        expect(fg.getRawValue())
            .toEqual({'c1': 'v1', 'group': {'c2': 'v2', 'c3': 'v3'}, 'array': ['v4', 'v5']});
      });

    });

    describe('adding and removing controls', () => {
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
    });

    describe('errors', () => {
      it('should run the validator when the value changes', () => {
        const simpleValidator = (c: FormGroup) =>
            c.controls['one'].value != 'correct' ? {'broken': true} : null;

        const c = new FormControl(null);
        const g = new FormGroup({'one': c}, simpleValidator);

        c.setValue('correct');

        expect(g.valid).toEqual(true);
        expect(g.errors).toEqual(null);

        c.setValue('incorrect');

        expect(g.valid).toEqual(false);
        expect(g.errors).toEqual({'broken': true});
      });
    });

    describe('dirty', () => {
      let c: FormControl, g: FormGroup;

      beforeEach(() => {
        c = new FormControl('value');
        g = new FormGroup({'one': c});
      });

      it('should be false after creating a control', () => { expect(g.dirty).toEqual(false); });

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

      it('should be false after creating a control', () => { expect(g.touched).toEqual(false); });

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

        it('should not fire an event when explicitly specified', fakeAsync(() => {
             form.valueChanges.subscribe((value) => { throw 'Should not happen'; });
             g.valueChanges.subscribe((value) => { throw 'Should not happen'; });
             c.valueChanges.subscribe((value) => { throw 'Should not happen'; });

             g.setValue({'one': 'one', 'two': 'two'}, {emitEvent: false});
             tick();
           }));

        it('should emit one statusChange event per control', () => {
          form.statusChanges.subscribe(() => logger.push('form'));
          g.statusChanges.subscribe(() => logger.push('group'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));

          g.setValue({'one': 'one', 'two': 'two'});
          expect(logger).toEqual(['control1', 'control2', 'group', 'form']);
        });
      });
    });

    describe('patchValue', () => {
      let c: FormControl, c2: FormControl, g: FormGroup;

      beforeEach(() => {
        c = new FormControl('');
        c2 = new FormControl('');
        g = new FormGroup({'one': c, 'two': c2});
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

        it('should not fire an event when explicitly specified', fakeAsync(() => {
             form.valueChanges.subscribe((value) => { throw 'Should not happen'; });
             g.valueChanges.subscribe((value) => { throw 'Should not happen'; });
             c.valueChanges.subscribe((value) => { throw 'Should not happen'; });

             g.patchValue({'one': 'one', 'two': 'two'}, {emitEvent: false});
             tick();
           }));

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

        it('should not fire an event when explicitly specified', fakeAsync(() => {
             form.valueChanges.subscribe((value) => { throw 'Should not happen'; });
             g.valueChanges.subscribe((value) => { throw 'Should not happen'; });
             c.valueChanges.subscribe((value) => { throw 'Should not happen'; });

             g.reset({}, {emitEvent: false});
             tick();
           }));

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

      it('should return false when the component is disabled',
         () => { expect(group.contains('optional')).toEqual(false); });

      it('should return false when there is no component with the given name',
         () => { expect(group.contains('something else')).toEqual(false); });

      it('should return true when the component is enabled', () => {
        expect(group.contains('required')).toEqual(true);

        group.enable('optional');

        expect(group.contains('optional')).toEqual(true);
      });

      it('should support controls with dots in their name', () => {
        expect(group.contains('some.name')).toBe(false);
        group.addControl('some.name', new FormControl());

        expect(group.contains('some.name')).toBe(true);
      });
    });


    describe('statusChanges', () => {
      let control: FormControl;
      let group: FormGroup;

      beforeEach(async(() => {
        control = new FormControl('', asyncValidatorReturningObservable);
        group = new FormGroup({'one': control});
      }));


      // TODO(kara): update these tests to use fake Async
      it('should fire a statusChange if child has async validation change',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const loggedValues: string[] = [];
           group.statusChanges.subscribe({
             next: (status: string) => {
               loggedValues.push(status);
               if (loggedValues.length === 2) {
                 expect(loggedValues).toEqual(['PENDING', 'INVALID']);
               }
               async.done();
             }
           });
           control.setValue('');
         }));
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
    });

    describe('asyncValidator', () => {
      it('should run the async validator', fakeAsync(() => {
           const c = new FormControl('value');
           const g = new FormGroup({'one': c}, null !, asyncValidator('expected'));

           expect(g.pending).toEqual(true);

           tick(1);

           expect(g.errors).toEqual({'async': true});
           expect(g.pending).toEqual(false);
         }));

      it('should set the parent group\'s status to pending', fakeAsync(() => {
           const c = new FormControl('value', null !, asyncValidator('expected'));
           const g = new FormGroup({'one': c});

           expect(g.pending).toEqual(true);

           tick(1);

           expect(g.pending).toEqual(false);
         }));

      it('should run the parent group\'s async validator when children are pending',
         fakeAsync(() => {
           const c = new FormControl('value', null !, asyncValidator('expected'));
           const g = new FormGroup({'one': c}, null !, asyncValidator('expected'));

           tick(1);

           expect(g.errors).toEqual({'async': true});
           expect(g.get('one') !.errors).toEqual({'async': true});
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

        g.get('nested') !.disable();
        expect(g.valid).toBe(true);

        g.get('nested') !.enable();
        expect(g.valid).toBe(false);
      });

      it('should ignore disabled controls when serializing value', () => {
        const g = new FormGroup(
            {nested: new FormGroup({one: new FormControl('one')}), two: new FormControl('two')});
        expect(g.value).toEqual({'nested': {'one': 'one'}, 'two': 'two'});

        g.get('nested') !.disable();
        expect(g.value).toEqual({'two': 'two'});

        g.get('nested') !.enable();
        expect(g.value).toEqual({'nested': {'one': 'one'}, 'two': 'two'});
      });

      it('should update its value when disabled with disabled children', () => {
        const g = new FormGroup(
            {nested: new FormGroup({one: new FormControl('one'), two: new FormControl('two')})});

        g.get('nested.two') !.disable();
        expect(g.value).toEqual({nested: {one: 'one'}});

        g.get('nested') !.disable();
        expect(g.value).toEqual({nested: {one: 'one', two: 'two'}});

        g.get('nested') !.enable();
        expect(g.value).toEqual({nested: {one: 'one', two: 'two'}});
      });

      it('should update its value when enabled with disabled children', () => {
        const g = new FormGroup(
            {nested: new FormGroup({one: new FormControl('one'), two: new FormControl('two')})});

        g.get('nested.two') !.disable();
        expect(g.value).toEqual({nested: {one: 'one'}});

        g.get('nested') !.enable();
        expect(g.value).toEqual({nested: {one: 'one', two: 'two'}});
      });

      it('should ignore disabled controls when determining dirtiness', () => {
        const g = new FormGroup(
            {nested: new FormGroup({one: new FormControl('one')}), two: new FormControl('two')});
        g.get('nested.one') !.markAsDirty();
        expect(g.dirty).toBe(true);

        g.get('nested') !.disable();
        expect(g.get('nested') !.dirty).toBe(true);
        expect(g.dirty).toEqual(false);

        g.get('nested') !.enable();
        expect(g.dirty).toEqual(true);
      });

      it('should ignore disabled controls when determining touched state', () => {
        const g = new FormGroup(
            {nested: new FormGroup({one: new FormControl('one')}), two: new FormControl('two')});
        g.get('nested.one') !.markAsTouched();
        expect(g.touched).toBe(true);

        g.get('nested') !.disable();
        expect(g.get('nested') !.touched).toBe(true);
        expect(g.touched).toEqual(false);

        g.get('nested') !.enable();
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
             const g =
                 new FormGroup({'one': new FormControl()}, null !, asyncValidator('expected'));
             tick();
             expect(g.errors).toEqual({'async': true});

             g.disable();
             expect(g.errors).toEqual(null);

             g.enable();
             tick();
             expect(g.errors).toEqual({'async': true});
           }));

        it('should re-populate async group errors when enabled from a child', fakeAsync(() => {
             const g =
                 new FormGroup({'one': new FormControl()}, null !, asyncValidator('expected'));
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
        form._updateTreeValidity();
        expect(logger).toEqual(['one', 'two', 'nested', 'three', 'form']);
      });

      it('should not emit events when turned off', () => {
        form._updateTreeValidity({emitEvent: false});
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
        g.setControl('one', null !);
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

    });


  });
}
