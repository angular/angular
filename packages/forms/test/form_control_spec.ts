/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {fakeAsync, tick} from '@angular/core/testing';
import {AsyncValidatorFn, FormArray, FormControl, FormGroup, Validators} from '@angular/forms';

import {asyncValidator, asyncValidatorReturningObservable} from './util';

(function () {
  function otherAsyncValidator() {
    return Promise.resolve({'other': true});
  }

  function syncValidator() {
    return null;
  }

  describe('FormControl', () => {
    it('should default the value to null', () => {
      const c = new FormControl();
      expect(c.value).toBe(null);
    });

    describe('markAllAsTouched', () => {
      it('should mark only the control itself as touched', () => {
        const control = new FormControl('');
        expect(control.touched).toBe(false);
        control.markAllAsTouched();
        expect(control.touched).toBe(true);
      });
    });

    describe('boxed values', () => {
      it('should support valid boxed values on creation', () => {
        const c = new FormControl({value: 'some val', disabled: true}, null!, null!);
        expect(c.disabled).toBe(true);
        expect(c.value).toBe('some val');
        expect(c.status).toBe('DISABLED');
      });

      it('should not treat objects as boxed values when `disabled` field is present, but `value` is missing', () => {
        const c = new FormControl({disabled: true});
        expect(c.value).toEqual({disabled: true});
        expect(c.disabled).toBe(false);
      });

      it('should honor boxed value with disabled control when validating', () => {
        const c = new FormControl({value: '', disabled: true}, Validators.required);
        expect(c.disabled).toBe(true);
        expect(c.valid).toBe(false);
        expect(c.status).toBe('DISABLED');
      });

      it('should not treat objects as boxed values if they have more than two props', () => {
        const c: FormControl = new FormControl(
          {value: '', disabled: true, test: 'test'} as any,
          null!,
          null!,
        );
        expect(c.value).toEqual({value: '', disabled: true, test: 'test'});
        expect(c.disabled).toBe(false);
      });

      it('should not treat objects as boxed values if disabled is missing', () => {
        const c = new FormControl({value: '', test: 'test'}, null!, null!);
        expect(c.value).toEqual({value: '', test: 'test'});
        expect(c.disabled).toBe(false);
      });
    });

    describe('updateOn', () => {
      it('should default to on change', () => {
        const c = new FormControl('');
        expect(c.updateOn).toEqual('change');
      });

      it('should default to on change with an options obj', () => {
        const c = new FormControl('', {validators: Validators.required});
        expect(c.updateOn).toEqual('change');
      });

      it('should set updateOn when updating on blur', () => {
        const c = new FormControl('', {updateOn: 'blur'});
        expect(c.updateOn).toEqual('blur');
      });

      describe('in groups and arrays', () => {
        it('should default to group updateOn when not set in control', () => {
          const g = new FormGroup(
            {one: new FormControl(), two: new FormControl()},
            {updateOn: 'blur'},
          );

          expect(g.get('one')!.updateOn).toEqual('blur');
          expect(g.get('two')!.updateOn).toEqual('blur');
        });

        it('should default to array updateOn when not set in control', () => {
          const a = new FormArray([new FormControl(), new FormControl()], {updateOn: 'blur'});

          expect(a.get([0])!.updateOn).toEqual('blur');
          expect(a.get([1])!.updateOn).toEqual('blur');
        });

        it('should set updateOn with nested groups', () => {
          const g = new FormGroup(
            {
              group: new FormGroup({one: new FormControl(), two: new FormControl()}),
            },
            {updateOn: 'blur'},
          );

          expect(g.get('group.one')!.updateOn).toEqual('blur');
          expect(g.get('group.two')!.updateOn).toEqual('blur');
          expect(g.get('group')!.updateOn).toEqual('blur');
        });

        it('should set updateOn with nested arrays', () => {
          const g = new FormGroup(
            {
              arr: new FormArray([new FormControl(), new FormControl()]),
            },
            {updateOn: 'blur'},
          );

          expect(g.get(['arr', 0])!.updateOn).toEqual('blur');
          expect(g.get(['arr', 1])!.updateOn).toEqual('blur');
          expect(g.get('arr')!.updateOn).toEqual('blur');
        });

        it('should allow control updateOn to override group updateOn', () => {
          const g = new FormGroup(
            {one: new FormControl('', {updateOn: 'change'}), two: new FormControl()},
            {updateOn: 'blur'},
          );

          expect(g.get('one')!.updateOn).toEqual('change');
          expect(g.get('two')!.updateOn).toEqual('blur');
        });

        it('should set updateOn with complex setup', () => {
          const g = new FormGroup({
            group: new FormGroup(
              {one: new FormControl('', {updateOn: 'change'}), two: new FormControl()},
              {updateOn: 'blur'},
            ),
            groupTwo: new FormGroup({one: new FormControl()}, {updateOn: 'submit'}),
            three: new FormControl(),
          });

          expect(g.get('group.one')!.updateOn).toEqual('change');
          expect(g.get('group.two')!.updateOn).toEqual('blur');
          expect(g.get('groupTwo.one')!.updateOn).toEqual('submit');
          expect(g.get('three')!.updateOn).toEqual('change');
        });
      });
    });

    describe('validator', () => {
      it('should run validator with the initial value', () => {
        const c = new FormControl('value', Validators.required);
        expect(c.valid).toEqual(true);
      });

      it('should rerun the validator when the value changes', () => {
        const c = new FormControl('value', Validators.required);
        c.setValue(null);
        expect(c.valid).toEqual(false);
      });

      it('should support arrays of validator functions if passed', () => {
        const c = new FormControl('value', [Validators.required, Validators.minLength(3)]);
        c.setValue('a');
        expect(c.valid).toEqual(false);

        c.setValue('aaa');
        expect(c.valid).toEqual(true);
      });

      it('should support single validator from options obj', () => {
        const c: FormControl = new FormControl(null, {validators: Validators.required});
        expect(c.valid).toEqual(false);
        expect(c.errors).toEqual({required: true});

        c.setValue('value');
        expect(c.valid).toEqual(true);
      });

      it('should support multiple validators from options obj', () => {
        const c: FormControl = new FormControl(null, {
          validators: [Validators.required, Validators.minLength(3)],
        });
        expect(c.valid).toEqual(false);
        expect(c.errors).toEqual({required: true});

        c.setValue('aa');
        expect(c.valid).toEqual(false);
        expect(c.errors).toEqual({minlength: {requiredLength: 3, actualLength: 2}});

        c.setValue('aaa');
        expect(c.valid).toEqual(true);
      });

      it('should support a null validators value', () => {
        const c = new FormControl(null, {validators: null});
        expect(c.valid).toEqual(true);
      });

      it('should support an empty options obj', () => {
        const c = new FormControl(null, {});
        expect(c.valid).toEqual(true);
      });

      it('should return errors', () => {
        const c = new FormControl(null, Validators.required);
        expect(c.errors).toEqual({'required': true});
      });

      it('should set single validator', () => {
        const c: FormControl = new FormControl(null);
        expect(c.valid).toEqual(true);

        c.setValidators(Validators.required);

        c.setValue(null);
        expect(c.valid).toEqual(false);

        c.setValue('abc');
        expect(c.valid).toEqual(true);
      });

      it('should set multiple validators from array', () => {
        const c = new FormControl('');
        expect(c.valid).toEqual(true);

        c.setValidators([Validators.minLength(5), Validators.required]);

        c.setValue('');
        expect(c.valid).toEqual(false);

        c.setValue('abc');
        expect(c.valid).toEqual(false);

        c.setValue('abcde');
        expect(c.valid).toEqual(true);
      });

      it('should override validators using `setValidators` function', () => {
        const c = new FormControl('');
        expect(c.valid).toEqual(true);

        c.setValidators([Validators.minLength(5), Validators.required]);

        c.setValue('');
        expect(c.valid).toEqual(false);

        c.setValue('abc');
        expect(c.valid).toEqual(false);

        c.setValue('abcde');
        expect(c.valid).toEqual(true);

        // Define new set of validators, overriding previously applied ones.
        c.setValidators([Validators.maxLength(2)]);

        c.setValue('abcdef');
        expect(c.valid).toEqual(false);

        c.setValue('a');
        expect(c.valid).toEqual(true);
      });

      it('should not mutate the validators array when overriding using setValidators', () => {
        const control = new FormControl('');
        const originalValidators = [Validators.required];

        control.setValidators(originalValidators);
        control.addValidators(Validators.minLength(10));

        expect(originalValidators.length).toBe(1);
      });

      it('should override validators by setting `control.validator` field value', () => {
        const c = new FormControl('');
        expect(c.valid).toEqual(true);

        // Define new set of validators, overriding previously applied ones.
        c.validator = Validators.compose([Validators.minLength(5), Validators.required]);

        c.setValue('');
        expect(c.valid).toEqual(false);

        c.setValue('abc');
        expect(c.valid).toEqual(false);

        c.setValue('abcde');
        expect(c.valid).toEqual(true);

        // Define new set of validators, overriding previously applied ones.
        c.validator = Validators.compose([Validators.maxLength(2)]);

        c.setValue('abcdef');
        expect(c.valid).toEqual(false);

        c.setValue('a');
        expect(c.valid).toEqual(true);
      });

      it('should clear validators', () => {
        const c = new FormControl('', Validators.required);
        expect(c.valid).toEqual(false);

        c.clearValidators();
        expect(c.validator).toEqual(null);

        c.setValue('');
        expect(c.valid).toEqual(true);
      });

      it('should add after clearing', () => {
        const c = new FormControl('', Validators.required);
        expect(c.valid).toEqual(false);

        c.clearValidators();
        expect(c.validator).toEqual(null);

        c.setValidators([Validators.required]);
        expect(c.validator).not.toBe(null);
      });

      it('should check presence of and remove a validator set in the control constructor', () => {
        const c = new FormControl('', Validators.required);
        expect(c.hasValidator(Validators.required)).toEqual(true);

        c.removeValidators(Validators.required);
        expect(c.hasValidator(Validators.required)).toEqual(false);

        c.addValidators(Validators.required);
        expect(c.hasValidator(Validators.required)).toEqual(true);
      });

      it('should check presence of and remove a validator set with addValidators', () => {
        const c = new FormControl('');
        expect(c.hasValidator(Validators.required)).toEqual(false);
        c.addValidators(Validators.required);
        expect(c.hasValidator(Validators.required)).toEqual(true);

        c.removeValidators(Validators.required);
        expect(c.hasValidator(Validators.required)).toEqual(false);
      });

      it('should check presence of and remove multiple validators set at the same time', () => {
        const c = new FormControl('3');
        const minValidator = Validators.min(4);
        c.addValidators([Validators.required, minValidator]);
        expect(c.hasValidator(Validators.required)).toEqual(true);
        expect(c.hasValidator(minValidator)).toEqual(true);

        c.removeValidators([Validators.required, minValidator]);
        expect(c.hasValidator(Validators.required)).toEqual(false);
        expect(c.hasValidator(minValidator)).toEqual(false);
      });

      it('should be able to remove a validator added multiple times', () => {
        const c = new FormControl('', Validators.required);
        c.addValidators(Validators.required);
        c.addValidators(Validators.required);
        expect(c.hasValidator(Validators.required)).toEqual(true);

        c.removeValidators(Validators.required);
        expect(c.hasValidator(Validators.required)).toEqual(false);
      });

      it('should not mutate the validators array when adding/removing sync validators', () => {
        const originalValidators = [Validators.required];
        const control = new FormControl('', originalValidators);

        control.addValidators(Validators.min(10));
        expect(originalValidators.length).toBe(1);

        control.removeValidators(Validators.required);
        expect(originalValidators.length).toBe(1);
      });

      it('should not mutate the validators array when adding/removing async validators', () => {
        const firstValidator = asyncValidator('one');
        const secondValidator = asyncValidator('two');
        const originalValidators = [firstValidator];
        const control = new FormControl('', null, originalValidators);

        control.addAsyncValidators(secondValidator);
        expect(originalValidators.length).toBe(1);

        control.removeAsyncValidators(firstValidator);
        expect(originalValidators.length).toBe(1);
      });

      it('should return false when checking presence of a validator not identical by reference', () => {
        const minValidator = Validators.min(5);
        const c = new FormControl('1', minValidator);
        expect(c.hasValidator(minValidator)).toEqual(true);
        expect(c.hasValidator(Validators.min(5))).toEqual(false);
      });
    });

    describe('asyncValidator', () => {
      it('should run validator with the initial value', fakeAsync(() => {
        const c = new FormControl('value', null!, asyncValidator('expected'));
        tick();

        expect(c.valid).toEqual(false);
        expect(c.errors).toEqual({'async': true});
      }));

      it('should support validators returning observables', fakeAsync(() => {
        const c = new FormControl('value', null!, asyncValidatorReturningObservable);
        tick();

        expect(c.valid).toEqual(false);
        expect(c.errors).toEqual({'async': true});
      }));

      it('should rerun the validator when the value changes', fakeAsync(() => {
        const c = new FormControl('value', null!, asyncValidator('expected'));

        c.setValue('expected');
        tick();

        expect(c.valid).toEqual(true);
      }));

      it('should run the async validator only when the sync validator passes', fakeAsync(() => {
        const c = new FormControl('', Validators.required, asyncValidator('expected'));
        tick();

        expect(c.errors).toEqual({'required': true});

        c.setValue('some value');
        tick();

        expect(c.errors).toEqual({'async': true});
      }));

      it('should mark the control as pending while running the async validation', fakeAsync(() => {
        const c = new FormControl('', null!, asyncValidator('expected'));

        expect(c.pending).toEqual(true);

        tick();

        expect(c.pending).toEqual(false);
      }));

      it('should only use the latest async validation run', fakeAsync(() => {
        const c = new FormControl(
          '',
          null!,
          asyncValidator('expected', {'long': 200, 'expected': 100}),
        );

        c.setValue('long');
        c.setValue('expected');

        tick(300);

        expect(c.valid).toEqual(true);
      }));

      it('should support arrays of async validator functions if passed', fakeAsync(() => {
        const c = new FormControl('value', null!, [
          asyncValidator('expected'),
          otherAsyncValidator,
        ]);
        tick();

        expect(c.errors).toEqual({'async': true, 'other': true});
      }));

      it('should support a single async validator from options obj', fakeAsync(() => {
        const c = new FormControl('value', {asyncValidators: asyncValidator('expected')});
        expect(c.pending).toEqual(true);
        tick();

        expect(c.valid).toEqual(false);
        expect(c.errors).toEqual({'async': true});
      }));

      it('should support multiple async validators from options obj', fakeAsync(() => {
        const c = new FormControl('value', {
          asyncValidators: [asyncValidator('expected'), otherAsyncValidator],
        });
        expect(c.pending).toEqual(true);
        tick();

        expect(c.valid).toEqual(false);
        expect(c.errors).toEqual({'async': true, 'other': true});
      }));

      it('should support a mix of validators from options obj', fakeAsync(() => {
        const c = new FormControl('', {
          validators: Validators.required,
          asyncValidators: asyncValidator('expected'),
        });
        tick();
        expect(c.errors).toEqual({required: true});

        c.setValue('value');
        expect(c.pending).toBe(true);

        tick();
        expect(c.valid).toEqual(false);
        expect(c.errors).toEqual({'async': true});
      }));

      it('should add single async validator', fakeAsync(() => {
        const c = new FormControl('value', null!);

        c.setAsyncValidators(asyncValidator('expected'));
        expect(c.asyncValidator).not.toEqual(null);

        c.setValue('expected');
        tick();

        expect(c.valid).toEqual(true);
      }));

      it('should add async validator from array', fakeAsync(() => {
        const c = new FormControl('value', null!);

        c.setAsyncValidators([asyncValidator('expected')]);
        expect(c.asyncValidator).not.toEqual(null);

        c.setValue('expected');
        tick();

        expect(c.valid).toEqual(true);
      }));

      it('should override validators using `setAsyncValidators` function', fakeAsync(() => {
        const c = new FormControl('');
        expect(c.valid).toEqual(true);

        c.setAsyncValidators([asyncValidator('expected')]);

        c.setValue('');
        tick();
        expect(c.valid).toEqual(false);

        c.setValue('expected');
        tick();
        expect(c.valid).toEqual(true);

        // Define new set of validators, overriding previously applied ones.
        c.setAsyncValidators([asyncValidator('new expected')]);

        c.setValue('expected');
        tick();
        expect(c.valid).toEqual(false);

        c.setValue('new expected');
        tick();
        expect(c.valid).toEqual(true);
      }));

      it('should not mutate the validators array when overriding using setValidators', () => {
        const control = new FormControl('');
        const originalValidators = [asyncValidator('one')];

        control.setAsyncValidators(originalValidators);
        control.addAsyncValidators(asyncValidator('two'));

        expect(originalValidators.length).toBe(1);
      });

      it('should override validators by setting `control.asyncValidator` field value', fakeAsync(() => {
        const c = new FormControl('');
        expect(c.valid).toEqual(true);

        c.asyncValidator = Validators.composeAsync([asyncValidator('expected')]);

        c.setValue('');
        tick();
        expect(c.valid).toEqual(false);

        c.setValue('expected');
        tick();
        expect(c.valid).toEqual(true);

        // Define new set of validators, overriding previously applied ones.
        c.asyncValidator = Validators.composeAsync([asyncValidator('new expected')]);

        c.setValue('expected');
        tick();
        expect(c.valid).toEqual(false);

        c.setValue('new expected');
        tick();
        expect(c.valid).toEqual(true);
      }));

      it('should clear async validators', fakeAsync(() => {
        const c = new FormControl('value', [asyncValidator('expected'), otherAsyncValidator]);

        c.clearValidators();

        expect(c.asyncValidator).toEqual(null);
      }));

      it('should not change validity state if control is disabled while async validating', fakeAsync(() => {
        const c = new FormControl('value', [asyncValidator('expected')]);
        c.disable();
        tick();
        expect(c.status).toEqual('DISABLED');
      }));

      it('should check presence of and remove a validator set in the control constructor', () => {
        const asyncVal = asyncValidator('expected');
        const c = new FormControl('', null, asyncVal);
        expect(c.hasAsyncValidator(asyncVal)).toEqual(true);

        c.removeAsyncValidators(asyncVal);
        expect(c.hasAsyncValidator(asyncVal)).toEqual(false);

        c.addAsyncValidators(asyncVal);
        expect(c.hasAsyncValidator(asyncVal)).toEqual(true);
      });

      it('should check presence of and remove a validator set with addValidators', () => {
        const c = new FormControl('');
        const asyncVal = asyncValidator('expected');
        c.addAsyncValidators(asyncVal);
        expect(c.hasAsyncValidator(asyncVal)).toEqual(true);

        c.removeAsyncValidators(asyncVal);
        expect(c.hasAsyncValidator(asyncVal)).toEqual(false);
      });

      it('should check presence of and remove multiple validators set at the same time', () => {
        const c = new FormControl('3');
        const asyncVal1 = asyncValidator('expected1');
        const asyncVal2 = asyncValidator('expected2');
        c.addAsyncValidators([asyncVal1, asyncVal2]);
        expect(c.hasAsyncValidator(asyncVal1)).toEqual(true);
        expect(c.hasAsyncValidator(asyncVal2)).toEqual(true);

        c.removeAsyncValidators([asyncVal1, asyncVal2]);
        expect(c.hasAsyncValidator(asyncVal1)).toEqual(false);
        expect(c.hasAsyncValidator(asyncVal2)).toEqual(false);
      });

      it('should be able to remove a validator added multiple times', () => {
        const asyncVal = asyncValidator('expected');
        const c = new FormControl('', null, asyncVal);
        c.addAsyncValidators(asyncVal);
        c.addAsyncValidators(asyncVal);
        expect(c.hasAsyncValidator(asyncVal)).toEqual(true);

        c.removeAsyncValidators(asyncVal);
        expect(c.hasAsyncValidator(asyncVal)).toEqual(false);
      });

      it('should return false when checking presence of a validator not identical by reference', () => {
        const asyncVal = asyncValidator('expected');
        const asyncValDifferentFn = asyncValidator('expected');
        const c = new FormControl('1', null, asyncVal);
        expect(c.hasAsyncValidator(asyncVal)).toEqual(true);
        expect(c.hasAsyncValidator(asyncValDifferentFn)).toEqual(false);
      });
    });

    describe('dirty', () => {
      it('should be false after creating a control', () => {
        const c = new FormControl('value');
        expect(c.dirty).toEqual(false);
      });

      it('should be true after changing the value of the control', () => {
        const c = new FormControl('value');
        c.markAsDirty();
        expect(c.dirty).toEqual(true);
      });
    });

    describe('touched', () => {
      it('should be false after creating a control', () => {
        const c = new FormControl('value');
        expect(c.touched).toEqual(false);
      });

      it('should be true after markAsTouched runs', () => {
        const c = new FormControl('value');
        c.markAsTouched();
        expect(c.touched).toEqual(true);
      });
    });

    describe('setValue', () => {
      let g: FormGroup, c: FormControl;
      beforeEach(() => {
        c = new FormControl('oldValue');
        g = new FormGroup({'one': c});
      });

      it('should set the value of the control', () => {
        c.setValue('newValue');
        expect(c.value).toEqual('newValue');
      });

      it('should invoke ngOnChanges if it is present', () => {
        let ngOnChanges: any;
        c.registerOnChange((v: any) => (ngOnChanges = ['invoked', v]));

        c.setValue('newValue');

        expect(ngOnChanges).toEqual(['invoked', 'newValue']);
      });

      it('should not invoke on change when explicitly specified', () => {
        let onChange: any = null;
        c.registerOnChange((v: any) => (onChange = ['invoked', v]));

        c.setValue('newValue', {emitModelToViewChange: false});

        expect(onChange).toBeNull();
      });

      it('should set the parent', () => {
        c.setValue('newValue');
        expect(g.value).toEqual({'one': 'newValue'});
      });

      it('should not set the parent when explicitly specified', () => {
        c.setValue('newValue', {onlySelf: true});
        expect(g.value).toEqual({'one': 'oldValue'});
      });

      it('should fire an event', fakeAsync(() => {
        c.valueChanges.subscribe((value) => {
          expect(value).toEqual('newValue');
        });

        c.setValue('newValue');
        tick();
      }));

      it('should not fire an event when explicitly specified', fakeAsync(() => {
        c.valueChanges.subscribe((value) => {
          throw 'Should not happen';
        });

        c.setValue('newValue', {emitEvent: false});
        tick();
      }));

      it('should work on a disabled control', () => {
        g.addControl('two', new FormControl('two'));
        c.disable();
        c.setValue('new value');
        expect(c.value).toEqual('new value');
        expect(g.value).toEqual({'two': 'two'});
      });
    });

    describe('patchValue', () => {
      let g: FormGroup, c: FormControl;
      beforeEach(() => {
        c = new FormControl('oldValue');
        g = new FormGroup({'one': c});
      });

      it('should set the value of the control', () => {
        c.patchValue('newValue');
        expect(c.value).toEqual('newValue');
      });

      it('should invoke ngOnChanges if it is present', () => {
        let ngOnChanges: any;
        c.registerOnChange((v: any) => (ngOnChanges = ['invoked', v]));

        c.patchValue('newValue');

        expect(ngOnChanges).toEqual(['invoked', 'newValue']);
      });

      it('should not invoke on change when explicitly specified', () => {
        let onChange: any = null;
        c.registerOnChange((v: any) => (onChange = ['invoked', v]));

        c.patchValue('newValue', {emitModelToViewChange: false});

        expect(onChange).toBeNull();
      });

      it('should set the parent', () => {
        c.patchValue('newValue');
        expect(g.value).toEqual({'one': 'newValue'});
      });

      it('should not set the parent when explicitly specified', () => {
        c.patchValue('newValue', {onlySelf: true});
        expect(g.value).toEqual({'one': 'oldValue'});
      });

      it('should fire an event', fakeAsync(() => {
        c.valueChanges.subscribe((value) => {
          expect(value).toEqual('newValue');
        });

        c.patchValue('newValue');
        tick();
      }));

      it('should not fire an event when explicitly specified', fakeAsync(() => {
        c.valueChanges.subscribe((value) => {
          throw 'Should not happen';
        });

        c.patchValue('newValue', {emitEvent: false});

        tick();
      }));

      it('should patch value on a disabled control', () => {
        g.addControl('two', new FormControl('two'));
        c.disable();

        c.patchValue('new value');
        expect(c.value).toEqual('new value');
        expect(g.value).toEqual({'two': 'two'});
      });
    });

    describe('reset()', () => {
      let c: FormControl;

      beforeEach(() => {
        c = new FormControl('initial value');
      });

      it('should reset to a specific value if passed', () => {
        c.setValue('new value');
        expect(c.value).toBe('new value');

        c.reset('initial value');
        expect(c.value).toBe('initial value');
      });

      it('should not set the parent when explicitly specified', () => {
        const g = new FormGroup({'one': c});
        c.patchValue('newValue', {onlySelf: true});
        expect(g.value).toEqual({'one': 'initial value'});
      });

      it('should reset to a specific value if passed with boxed value', () => {
        c.setValue('new value');
        expect(c.value).toBe('new value');

        c.reset({value: 'initial value', disabled: false});
        expect(c.value).toBe('initial value');
      });

      it('should clear the control value if no value is passed', () => {
        c.setValue('new value');
        expect(c.value).toBe('new value');

        c.reset();
        expect(c.value).toBe(null);
      });

      it('should reset to the initial value if specified in FormControlOptions', () => {
        const c2 = new FormControl('foo', {nonNullable: true});
        expect(c2.value).toBe('foo');
        expect(c2.defaultValue).toBe('foo');

        c2.setValue('bar');
        expect(c2.value).toBe('bar');
        expect(c2.defaultValue).toBe('foo');

        c2.reset();
        expect(c2.value).toBe('foo');
        expect(c2.defaultValue).toBe('foo');

        const c3 = new FormControl('foo', {nonNullable: false});
        expect(c3.value).toBe('foo');
        expect(c3.defaultValue).toBe(null);

        c3.setValue('bar');
        expect(c3.value).toBe('bar');
        expect(c3.defaultValue).toBe(null);

        c3.reset();
        expect(c3.value).toBe(null);
        expect(c3.defaultValue).toBe(null);
      });

      it('should look inside FormState objects for a default value', () => {
        const c2 = new FormControl({value: 'foo', disabled: false}, {initialValueIsDefault: true});
        expect(c2.value).toBe('foo');
        expect(c2.defaultValue).toBe('foo');

        c2.setValue('bar');
        expect(c2.value).toBe('bar');
        expect(c2.defaultValue).toBe('foo');

        c2.reset();
        expect(c2.value).toBe('foo');
        expect(c2.defaultValue).toBe('foo');
      });

      it('should not alter the disabled state when resetting, even if a default value is provided', () => {
        const c2 = new FormControl({value: 'foo', disabled: true}, {nonNullable: true});
        expect(c2.value).toBe('foo');
        expect(c2.defaultValue).toBe('foo');
        expect(c2.disabled).toBe(true);

        c2.setValue('bar');
        c2.enable();

        c2.reset();
        expect(c2.value).toBe('foo');
        expect(c2.defaultValue).toBe('foo');
        expect(c2.disabled).toBe(false);
      });

      it('should update the value of any parent controls with passed value', () => {
        const g = new FormGroup({'one': c});
        c.setValue('new value');
        expect(g.value).toEqual({'one': 'new value'});

        c.reset('initial value');
        expect(g.value).toEqual({'one': 'initial value'});
      });

      it('should update the value of any parent controls with null value', () => {
        const g = new FormGroup({'one': c});
        c.setValue('new value');
        expect(g.value).toEqual({'one': 'new value'});

        c.reset();
        expect(g.value).toEqual({'one': null});
      });

      it('should mark the control as pristine', () => {
        c.markAsDirty();
        expect(c.pristine).toBe(false);

        c.reset();
        expect(c.pristine).toBe(true);
      });

      it('should set the parent pristine state if all pristine', () => {
        const g = new FormGroup({'one': c});
        c.markAsDirty();
        expect(g.pristine).toBe(false);

        c.reset();
        expect(g.pristine).toBe(true);
      });

      it('should not set the parent pristine state if it has other dirty controls', () => {
        const c2 = new FormControl('two');
        const g = new FormGroup({'one': c, 'two': c2});
        c.markAsDirty();
        c2.markAsDirty();

        c.reset();
        expect(g.pristine).toBe(false);
      });

      it('should mark the control as untouched', () => {
        c.markAsTouched();
        expect(c.untouched).toBe(false);

        c.reset();
        expect(c.untouched).toBe(true);
      });

      it('should set the parent untouched state if all untouched', () => {
        const g = new FormGroup({'one': c});
        c.markAsTouched();
        expect(g.untouched).toBe(false);

        c.reset();
        expect(g.untouched).toBe(true);
      });

      it('should not set the parent untouched state if other touched controls', () => {
        const c2 = new FormControl('two');
        const g = new FormGroup({'one': c, 'two': c2});
        c.markAsTouched();
        c2.markAsTouched();

        c.reset();
        expect(g.untouched).toBe(false);
      });

      it('should retain the disabled state of the control', () => {
        c.disable();
        c.reset();

        expect(c.disabled).toBe(true);
      });

      it('should set disabled state based on boxed value if passed', () => {
        c.disable();
        c.reset({value: null, disabled: false});

        expect(c.disabled).toBe(false);
      });

      describe('reset() events', () => {
        let g: FormGroup, c2: FormControl, logger: any[];

        beforeEach(() => {
          c2 = new FormControl('two');
          g = new FormGroup({'one': c, 'two': c2});
          logger = [];
        });

        it('should emit one valueChange event per reset control', () => {
          g.valueChanges.subscribe(() => logger.push('group'));
          c.valueChanges.subscribe(() => logger.push('control1'));
          c2.valueChanges.subscribe(() => logger.push('control2'));

          c.reset();
          expect(logger).toEqual(['control1', 'group']);
        });

        it('should not fire an event when explicitly specified', fakeAsync(() => {
          g.valueChanges.subscribe((value) => {
            throw 'Should not happen';
          });
          c.valueChanges.subscribe((value) => {
            throw 'Should not happen';
          });
          c2.valueChanges.subscribe((value) => {
            throw 'Should not happen';
          });

          c.reset(null, {emitEvent: false});

          tick();
        }));

        it('should emit one statusChange event per reset control', () => {
          g.statusChanges.subscribe(() => logger.push('group'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));

          c.reset();
          expect(logger).toEqual(['control1', 'group']);
        });

        it('should emit one statusChange event per disabled control', () => {
          g.statusChanges.subscribe(() => logger.push('group'));
          c.statusChanges.subscribe(() => logger.push('control1'));
          c2.statusChanges.subscribe(() => logger.push('control2'));

          c.reset({value: null, disabled: true});
          expect(logger).toEqual(['control1', 'group']);
        });
      });
    });

    describe('valueChanges & statusChanges', () => {
      let c: FormControl;

      beforeEach(() => {
        c = new FormControl('old', Validators.required);
      });

      it('should fire an event after the value has been updated', (done) => {
        c.valueChanges.subscribe({
          next: (value: any) => {
            expect(c.value).toEqual('new');
            expect(value).toEqual('new');
            done();
          },
        });
        c.setValue('new');
      });

      it('should fire an event after the status has been updated to invalid', fakeAsync(() => {
        c.statusChanges.subscribe({
          next: (status: any) => {
            expect(c.status).toEqual('INVALID');
            expect(status).toEqual('INVALID');
          },
        });

        c.setValue('');
        tick();
      }));

      it('should fire statusChanges events for async validators added via options object', fakeAsync(() => {
        // The behavior can be tested for each of the model types.
        let statuses: string[] = [];

        // Create a form control with an async validator added via options object.
        const asc = new FormControl('', {asyncValidators: [() => Promise.resolve(null)]});

        // Subscribe to status changes.
        asc.statusChanges.subscribe((status: any) => statuses.push(status));

        // After a tick, the async validator should change status PENDING -> VALID.
        tick();
        expect(statuses).toEqual(['VALID']);
      }));

      it('should fire an event after the status has been updated to pending', fakeAsync(() => {
        const c = new FormControl('old', Validators.required, asyncValidator('expected'));

        const log: string[] = [];
        c.valueChanges.subscribe({next: (value: any) => log.push(`value: '${value}'`)});

        c.statusChanges.subscribe({next: (status: any) => log.push(`status: '${status}'`)});

        c.setValue('');
        tick();

        c.setValue('nonEmpty');
        tick();

        c.setValue('expected');
        tick();

        expect(log).toEqual([
          "value: ''",
          "status: 'INVALID'",
          "value: 'nonEmpty'",
          "status: 'PENDING'",
          "status: 'INVALID'",
          "value: 'expected'",
          "status: 'PENDING'",
          "status: 'VALID'",
        ]);
      }));

      it('should update set errors and status before emitting an event', fakeAsync(() => {
        c.setValue('');

        tick();
        expect(c.valid).toEqual(false);
        expect(c.errors).toEqual({'required': true});
      }));

      it('should return a cold observable', fakeAsync(() => {
        let value: string | null = null;
        c.setValue('will be ignored');
        c.valueChanges.subscribe((v) => (value = v));
        c.setValue('new');
        tick();

        // @ts-expect-error see microsoft/TypeScript#9998
        expect(value).toEqual('new');
      }));
    });

    describe('setErrors', () => {
      it('should set errors on a control', () => {
        const c = new FormControl('someValue');

        c.setErrors({'someError': true});

        expect(c.valid).toEqual(false);
        expect(c.errors).toEqual({'someError': true});
      });

      it('should reset the errors and validity when the value changes', () => {
        const c = new FormControl('someValue', Validators.required);

        c.setErrors({'someError': true});
        c.setValue('');

        expect(c.errors).toEqual({'required': true});
      });

      it("should update the parent group's validity", () => {
        const c = new FormControl('someValue');
        const g = new FormGroup({'one': c});

        expect(g.valid).toEqual(true);

        c.setErrors({'someError': true});

        expect(g.valid).toEqual(false);
      });

      it("should not reset parent's errors", () => {
        const c = new FormControl('someValue');
        const g = new FormGroup({'one': c});

        g.setErrors({'someGroupError': true});
        c.setErrors({'someError': true});

        expect(g.errors).toEqual({'someGroupError': true});
      });

      it('should reset errors when updating a value', () => {
        const c = new FormControl('oldValue');
        const g = new FormGroup({'one': c});

        g.setErrors({'someGroupError': true});
        c.setErrors({'someError': true});

        c.setValue('newValue');

        expect(c.errors).toEqual(null);
        expect(g.errors).toEqual(null);
      });
    });

    describe('disable() & enable()', () => {
      it('should mark the control as disabled', () => {
        const c = new FormControl(null);
        expect(c.disabled).toBe(false);
        expect(c.valid).toBe(true);

        c.disable();
        expect(c.disabled).toBe(true);
        expect(c.valid).toBe(false);

        c.enable();
        expect(c.disabled).toBe(false);
        expect(c.valid).toBe(true);
      });

      it('should set the control status as disabled', () => {
        const c = new FormControl(null);
        expect(c.status).toEqual('VALID');

        c.disable();
        expect(c.status).toEqual('DISABLED');

        c.enable();
        expect(c.status).toEqual('VALID');
      });

      it('should retain the original value when disabled', () => {
        const c = new FormControl('some value');
        expect(c.value).toEqual('some value');

        c.disable();
        expect(c.value).toEqual('some value');

        c.enable();
        expect(c.value).toEqual('some value');
      });

      it('should keep the disabled control in the group, but return false for contains()', () => {
        const c = new FormControl('');
        const g = new FormGroup({'one': c});

        expect(g.get('one')).toBeDefined();
        expect(g.contains('one')).toBe(true);

        c.disable();
        expect(g.get('one')).toBeDefined();
        expect(g.contains('one')).toBe(false);
      });

      it('should mark the parent group disabled if all controls are disabled', () => {
        const c = new FormControl();
        const c2 = new FormControl();
        const g = new FormGroup({'one': c, 'two': c2});
        expect(g.enabled).toBe(true);

        c.disable();
        expect(g.enabled).toBe(true);

        c2.disable();
        expect(g.enabled).toBe(false);

        c.enable();
        expect(g.enabled).toBe(true);
      });

      it('should update the parent group value when child control status changes', () => {
        const c = new FormControl('one');
        const c2 = new FormControl('two');
        const g = new FormGroup({'one': c, 'two': c2});
        expect(g.value).toEqual({'one': 'one', 'two': 'two'});

        c.disable();
        expect(g.value).toEqual({'two': 'two'});

        c2.disable();
        expect(g.value).toEqual({'one': 'one', 'two': 'two'});

        c.enable();
        expect(g.value).toEqual({'one': 'one'});
      });

      it('should mark the parent array disabled if all controls are disabled', () => {
        const c = new FormControl();
        const c2 = new FormControl();
        const a = new FormArray([c, c2]);
        expect(a.enabled).toBe(true);

        c.disable();
        expect(a.enabled).toBe(true);

        c2.disable();
        expect(a.enabled).toBe(false);

        c.enable();
        expect(a.enabled).toBe(true);
      });

      it('should update the parent array value when child control status changes', () => {
        const c = new FormControl('one');
        const c2 = new FormControl('two');
        const a = new FormArray([c, c2]);
        expect(a.value).toEqual(['one', 'two']);

        c.disable();
        expect(a.value).toEqual(['two']);

        c2.disable();
        expect(a.value).toEqual(['one', 'two']);

        c.enable();
        expect(a.value).toEqual(['one']);
      });

      it('should ignore disabled array controls when determining dirtiness', () => {
        const c = new FormControl('one');
        const c2 = new FormControl('two');
        const a = new FormArray([c, c2]);
        c.markAsDirty();
        expect(a.dirty).toBe(true);

        c.disable();
        expect(c.dirty).toBe(true);
        expect(a.dirty).toBe(false);

        c.enable();
        expect(a.dirty).toBe(true);
      });

      it('should not make a dirty array not dirty when disabling controls', () => {
        const c = new FormControl('one');
        const c2 = new FormControl('two');
        const a = new FormArray([c, c2]);

        a.markAsDirty();
        expect(a.dirty).toBe(true);
        expect(c.dirty).toBe(false);

        c.disable();
        expect(a.dirty).toBe(true);

        c.enable();
        expect(a.dirty).toBe(true);
      });

      it('should ignore disabled controls in validation', () => {
        const c = new FormControl(null, Validators.required);
        const c2 = new FormControl(null);
        const g = new FormGroup({one: c, two: c2});
        expect(g.valid).toBe(false);

        c.disable();
        expect(g.valid).toBe(true);

        c.enable();
        expect(g.valid).toBe(false);
      });

      it('should ignore disabled controls when serializing value in a group', () => {
        const c = new FormControl('one');
        const c2 = new FormControl('two');
        const g = new FormGroup({one: c, two: c2});
        expect(g.value).toEqual({one: 'one', two: 'two'});

        c.disable();
        expect(g.value).toEqual({two: 'two'});

        c.enable();
        expect(g.value).toEqual({one: 'one', two: 'two'});
      });

      it('should ignore disabled controls when serializing value in an array', () => {
        const c = new FormControl('one');
        const c2 = new FormControl('two');
        const a = new FormArray([c, c2]);
        expect(a.value).toEqual(['one', 'two']);

        c.disable();
        expect(a.value).toEqual(['two']);

        c.enable();
        expect(a.value).toEqual(['one', 'two']);
      });

      it('should ignore disabled controls when determining dirtiness', () => {
        const c = new FormControl('one');
        const c2 = new FormControl('two');
        const g = new FormGroup({one: c, two: c2});
        c.markAsDirty();
        expect(g.dirty).toBe(true);

        c.disable();
        expect(c.dirty).toBe(true);
        expect(g.dirty).toBe(false);

        c.enable();
        expect(g.dirty).toBe(true);
      });

      it('should not make a dirty group not dirty when disabling controls', () => {
        const c = new FormControl('one');
        const c2 = new FormControl('two');
        const g = new FormGroup({one: c, two: c2});

        g.markAsDirty();
        expect(g.dirty).toBe(true);
        expect(c.dirty).toBe(false);

        c.disable();
        expect(g.dirty).toBe(true);

        c.enable();
        expect(g.dirty).toBe(true);
      });

      it('should ignore disabled controls when determining touched state', () => {
        const c = new FormControl('one');
        const c2 = new FormControl('two');
        const g = new FormGroup({one: c, two: c2});
        c.markAsTouched();
        expect(g.touched).toBe(true);

        c.disable();
        expect(c.touched).toBe(true);
        expect(g.touched).toBe(false);

        c.enable();
        expect(g.touched).toBe(true);
      });

      it('should not run validators on disabled controls', () => {
        const validator = jasmine.createSpy('validator');
        const c = new FormControl('', validator);
        expect(validator.calls.count()).toEqual(1);

        c.disable();
        expect(validator.calls.count()).toEqual(1);

        c.setValue('value');
        expect(validator.calls.count()).toEqual(1);

        c.enable();
        expect(validator.calls.count()).toEqual(2);
      });

      describe('disabled errors', () => {
        it('should clear out the errors when disabled', () => {
          const c = new FormControl('', Validators.required);
          expect(c.errors).toEqual({required: true});

          c.disable();
          expect(c.errors).toEqual(null);

          c.enable();
          expect(c.errors).toEqual({required: true});
        });

        it('should clear out async errors when disabled', fakeAsync(() => {
          const c = new FormControl('', null!, asyncValidator('expected'));
          tick();
          expect(c.errors).toEqual({'async': true});

          c.disable();
          expect(c.errors).toEqual(null);

          c.enable();
          tick();
          expect(c.errors).toEqual({'async': true});
        }));
      });

      describe('disabled events', () => {
        let logger: string[];
        let c: FormControl;
        let g: FormGroup;

        beforeEach(() => {
          logger = [];
          c = new FormControl('', Validators.required);
          g = new FormGroup({one: c});
        });

        it('should emit a statusChange event when disabled status changes', () => {
          c.statusChanges.subscribe((status: string) => logger.push(status));

          c.disable();
          expect(logger).toEqual(['DISABLED']);

          c.enable();
          expect(logger).toEqual(['DISABLED', 'INVALID']);
        });

        it('should emit status change events in correct order', () => {
          c.statusChanges.subscribe(() => logger.push('control'));
          g.statusChanges.subscribe(() => logger.push('group'));

          c.disable();
          expect(logger).toEqual(['control', 'group']);
        });

        it('should throw when sync validator passed into async validator param', () => {
          const fn = () =>
            new FormControl('', syncValidator, syncValidator as unknown as AsyncValidatorFn);
          // test for the specific error since without the error check it would still throw an error
          // but
          // not a meaningful one
          expect(fn).toThrowError(
            'NG01101: Expected async validator to return Promise or Observable. ' +
              'Are you using a synchronous validator where an async validator is expected? ' +
              'Find more at https://angular.dev/errors/NG01101',
          );
        });

        it('should not emit value change events when emitEvent = false', () => {
          c.valueChanges.subscribe(() => logger.push('control'));
          g.valueChanges.subscribe(() => logger.push('group'));

          c.disable({emitEvent: false});
          expect(logger).toEqual([]);
          c.enable({emitEvent: false});
          expect(logger).toEqual([]);
        });

        it('should not emit status change events when emitEvent = false', () => {
          c.statusChanges.subscribe(() => logger.push('control'));
          g.statusChanges.subscribe(() => logger.push('form'));

          c.disable({emitEvent: false});
          expect(logger).toEqual([]);
          c.enable({emitEvent: false});
          expect(logger).toEqual([]);
        });
      });
    });
    describe('pending', () => {
      let c: FormControl;

      beforeEach(() => {
        c = new FormControl('value');
      });

      it('should be false after creating a control', () => {
        expect(c.pending).toEqual(false);
      });

      it('should be true after changing the value of the control', () => {
        c.markAsPending();
        expect(c.pending).toEqual(true);
      });

      describe('status change events', () => {
        let logger: string[];

        beforeEach(() => {
          logger = [];
          c.statusChanges.subscribe((status) => logger.push(status));
        });

        it('should emit event after marking control as pending', () => {
          c.markAsPending();
          expect(logger).toEqual(['PENDING']);
        });

        it('should not emit event when emitEvent = false', () => {
          c.markAsPending({emitEvent: false});
          expect(logger).toEqual([]);
        });
      });
    });

    describe('can be extended', () => {
      // We don't technically support extending Forms classes, but people do it anyway.
      // We need to make sure that there is some way to extend them to avoid causing breakage.

      class FCExt extends FormControl {
        constructor(
          formState?:
            | any
            | {
                value?: any;
                disabled?: boolean;
              },
          ...args: any
        ) {
          super(formState, ...args);
        }
      }

      it('should perform basic FormControl operations', () => {
        const nc = new FCExt({value: 'foo'});
        nc.setValue('bar');
        // There is no need to assert because, if this test compiles, then it is possible to correctly
        // extend FormControl.
      });
    });

    describe('inspecting the prototype still provides FormControl type', () => {
      // The constructor should be a function with a prototype property of T.
      // (This is the assumption we don't want to break.)
      type Constructor<T> = Function & {prototype: T};

      function isInstanceOf<T>(value: Constructor<T>, arg: unknown): arg is T {
        // The implementation does not matter; we want to check whether this guard narrows the type.
        return true;
      }

      // This is a nullable FormControl, and we want isInstanceOf to narrow the type.
      const fcOrNull: FormControl | null = new FormControl(42);

      it('and is appropriately narrowed', () => {
        if (isInstanceOf(FormControl, fcOrNull)) {
          // If the guard does not work, then this code will not compile due to null being in the
          // type.
          fcOrNull.setValue(7);
        }
      });
    });

    describe('Function.name', () => {
      it('returns FormControl', () => {
        // This is always true in the trivial case, but can be broken by various methods of overriding
        // FormControl's exported constructor.
        expect(FormControl.name).toBe('FormControl');
      });
    });
  });
})();
