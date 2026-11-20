/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Injector, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormControlStatus,
  FormGroup,
  StatusChangeEvent,
} from '@angular/forms';
import {SignalFormControl} from '../../../compat/src/signal_form_control/signal_form_control';
import {applyWhen, disabled, required, validateAsync, ValidationError} from '../../../public_api';
import {SchemaFn} from '../../../src/api/types';

function createSignalFormControl<T>(value: T, schema?: SchemaFn<T>) {
  const injector = TestBed.inject(Injector);
  return new SignalFormControl(value, schema, {injector});
}

describe('SignalFormControl in FormGroup', () => {
  it('should reflect value and value changes', () => {
    const form = createSignalFormControl(10);
    const group = new FormGroup({
      n: form,
    });

    expect(group.value).toEqual({n: 10});
    form.setValue(20);
    expect(group.value).toEqual({n: 20});
  });

  it('should propagate patchValue updates from child to parent', () => {
    const form = createSignalFormControl(5);
    const value = form.sourceValue;
    const group = new FormGroup({
      n: form,
    });

    const emissions: any[] = [];
    group.valueChanges.subscribe((v) => emissions.push(v));

    form.patchValue(15);

    expect(group.value).toEqual({n: 15});
    expect(emissions).toEqual([{n: 15}]);
    expect(form.value).toBe(15);
    expect(value()).toBe(15);

    form.patchValue(25);

    expect(group.value).toEqual({n: 25});
    expect(emissions).toEqual([{n: 15}, {n: 25}]);
    expect(form.value).toBe(25);
    expect(value()).toBe(25);
  });

  it('should reflect validity changes', () => {
    const form = createSignalFormControl<number | undefined>(10, (p) => required(p));
    const group = new FormGroup({
      n: form,
    });

    expect(group.status).toBe('VALID');

    const statuses: FormControlStatus[] = [];
    group.statusChanges.subscribe((status) => statuses.push(status));

    form.setValue(undefined);
    expect(group.status).toBe('INVALID');

    form.setValue(10);
    expect(group.status).toBe('VALID');

    expect(statuses).toEqual(['INVALID', 'VALID']);
  });

  it('should update signal when parent setValue is called', () => {
    const form = createSignalFormControl(10);
    const value = form.sourceValue;
    const group = new FormGroup({
      n: form,
    });

    group.setValue({n: 20});

    expect(value()).toBe(20);
    expect(form.value).toBe(20);
  });

  it('should update signal when parent patchValue is called', () => {
    const form = createSignalFormControl(10);
    const value = form.sourceValue;
    const group = new FormGroup({
      n: form,
    });

    group.patchValue({n: 30});

    expect(value()).toBe(30);
    expect(form.value).toBe(30);
  });

  it('should reset child value and state when parent reset is called', () => {
    const child = createSignalFormControl(10);
    const value = child.sourceValue;
    const group = new FormGroup({
      n: child,
    });

    child.markAsDirty();
    child.markAsTouched();
    expect(child.dirty).toBe(true);
    expect(child.touched).toBe(true);

    group.reset({n: 50});

    expect(value()).toBe(50);
    expect(child.dirty).toBe(false);
    expect(child.touched).toBe(false);
  });

  it('should mark child as touched when parent markAllAsTouched is called', () => {
    const form = createSignalFormControl(10);
    const group = new FormGroup({
      n: form,
    });

    expect(form.touched).toBe(false);
    group.markAllAsTouched();
    expect(form.touched).toBe(true);
  });

  it('should mark child as pristine when parent markAsPristine is called', () => {
    const form = createSignalFormControl(10);
    const group = new FormGroup({
      n: form,
    });

    form.markAsDirty();
    expect(form.dirty).toBe(true);

    group.markAsPristine();

    expect(form.dirty).toBe(false);
    expect(form.pristine).toBe(true);
  });

  it('should mark child as untouched when parent markAsUntouched is called', () => {
    const form = createSignalFormControl(10);
    const group = new FormGroup({
      n: form,
    });

    form.markAsTouched();
    expect(form.touched).toBe(true);

    group.markAsUntouched();

    expect(form.touched).toBe(false);
  });

  it('should include child value in parent getRawValue', () => {
    const form = createSignalFormControl(10);
    const group = new FormGroup({
      n: form,
    });

    expect(group.getRawValue()).toEqual({n: 10});

    form.setValue(99);
    expect(group.getRawValue()).toEqual({n: 99});
  });

  it('should support cross-field validators on parent', () => {
    const form = createSignalFormControl(10);
    const group = new FormGroup(
      {
        n: form,
      },
      {
        validators: (g) => {
          const val = g.get('n')?.value;
          return val > 5 ? null : {min: true};
        },
      },
    );

    expect(group.valid).toBe(true);

    form.setValue(1);

    expect(group.valid).toBe(false);
    expect(group.errors).toEqual({min: true});
  });

  it('should allow retrieving child control using get()', () => {
    const form = createSignalFormControl(10);
    const group = new FormGroup({
      n: form,
    });

    const retrieved = group.get('n');
    expect(retrieved).toBe(form);
    expect(retrieved?.value).toBe(10);
  });

  it('should emit parent statusChanges when child validity changes', () => {
    const form = createSignalFormControl<number | undefined>(10, (p) => required(p));
    const group = new FormGroup({
      n: form,
    });

    const statuses: FormControlStatus[] = [];
    group.statusChanges.subscribe((s) => statuses.push(s));

    form.setValue(undefined);

    expect(statuses).toContain('INVALID');
    expect(group.status).toBe('INVALID');
  });

  it('should pass sourceControl correctly when signal value changes synchronously', () => {
    const form = createSignalFormControl(10);
    const group = new FormGroup({
      n: form,
    });

    const sourceControls: any[] = [];
    group.events.subscribe((event: any) => {
      if (event.source) {
        sourceControls.push(event.source);
      }
    });

    form.fieldTree().value.set(20);
    expect(sourceControls[0]).toBe(form);
  });

  it('should not notify parent when onlySelf is true', () => {
    const form = createSignalFormControl(10);
    const value = form.sourceValue;
    const group = new FormGroup({
      n: form,
    });

    const parentEmissions: unknown[] = [];
    group.valueChanges.subscribe((v) => parentEmissions.push(v));

    form.setValue(20, {onlySelf: true});

    expect(parentEmissions.length).toBe(0);
    expect(group.value).toEqual({n: 10});

    expect(value()).toBe(20);
    expect(form.value).toBe(20);
  });

  describe('integration with parent', () => {
    it('should synchronize value with parent FormGroup immediately', () => {
      const child = createSignalFormControl('meow');
      const group = new FormGroup({
        child: child,
      });

      child.fieldTree().value.set('wuf');
      expect(group.value).toEqual({child: 'wuf'});
    });

    it('should synchronize nested value with parent FormGroup immediately', () => {
      const child = createSignalFormControl({name: 'pirojok', says: 'meow'});
      const group = new FormGroup({
        child: child,
      });

      child.fieldTree.says().value.set('wuf');
      expect(group.value).toEqual({child: {name: 'pirojok', says: 'wuf'}});
    });

    it('should synchronize multiple value sets with parent FormGroup immediately', () => {
      const child = createSignalFormControl({name: 'a', count: 0});
      const group = new FormGroup({child});

      child.fieldTree.name().value.set('b');
      expect(group.value).toEqual({child: {name: 'b', count: 0}});

      child.fieldTree.count().value.set(1);
      expect(group.value).toEqual({child: {name: 'b', count: 1}});

      child.fieldTree.name().value.set('c');
      expect(group.value).toEqual({child: {name: 'c', count: 1}});

      child.fieldTree.count().value.set(2);
      expect(group.value).toEqual({child: {name: 'c', count: 2}});
    });

    it('should return the same child fieldTree instance on repeated access', () => {
      const child = createSignalFormControl({name: 'test', count: 0});

      const name1 = child.fieldTree.name;
      const name2 = child.fieldTree.name;

      expect(name1 === name2).toBe(true);
    });

    it('should return the same fieldState instance on repeated calls', () => {
      const child = createSignalFormControl({name: 'test', count: 0});

      const state1 = child.fieldTree();
      const state2 = child.fieldTree();

      expect(state1 === state2).toBe(true);
    });

    it('should return the same child fieldState instance on repeated calls', () => {
      const child = createSignalFormControl({name: 'test', count: 0});

      const state1 = child.fieldTree.name();
      const state2 = child.fieldTree.name();

      expect(state1 === state2).toBe(true);
    });

    describe('array fieldTree', () => {
      it('should access length property', () => {
        const child = createSignalFormControl(['a', 'b', 'c']);

        expect(child.fieldTree.length).toBe(3);
      });

      it('should access element children via index', () => {
        const child = createSignalFormControl(['first', 'second', 'third']);

        expect(child.fieldTree[0]().value()).toBe('first');
        expect(child.fieldTree[1]().value()).toBe('second');
        expect(child.fieldTree[2]().value()).toBe('third');
      });

      it('should set element value via index', () => {
        const child = createSignalFormControl(['a', 'b', 'c']);
        const group = new FormGroup({child});

        child.fieldTree[1]().value.set('updated');

        expect(group.value).toEqual({child: ['a', 'updated', 'c']});
      });

      it('should iterate over object fields', () => {
        const child = createSignalFormControl({x: 'a', y: 'b', z: 'c'});
        const values: string[] = [];

        for (const [, field] of child.fieldTree) {
          values.push(field!().value());
        }

        expect(values).toEqual(['a', 'b', 'c']);
      });
    });

    it('should propagate validity to parent FormGroup immediately', () => {
      const child = createSignalFormControl<string>('meow-meow', (p) => required(p));
      const group = new FormGroup({
        child: child,
      });

      expect(group.valid).withContext('Valid initially').toBe(true);
      child.fieldTree().value.set('');
      expect(group.valid).withContext('Invalid immediately on value change').toBe(false);
      group.controls.child.setValue('meow');
      expect(group.valid).withContext('Valid initially').toBe(true);
    });

    describe('FormArray', () => {
      it('should synchronize value with parent FormArray immediately', () => {
        const child = createSignalFormControl('meow');
        const array = new FormArray([child]);

        child.fieldTree().value.set('wuf');
        expect(array.value).toEqual(['wuf']);
      });

      it('should propagate validity to parent FormArray immediately', () => {
        const child = createSignalFormControl<string>('valid', (p) => required(p));
        const array = new FormArray([child]);

        expect(array.valid).withContext('Valid initially').toBe(true);
        child.fieldTree().value.set('');
        expect(array.valid).withContext('Invalid immediately on value change').toBe(false);
        array.at(0).setValue('meow');
        expect(array.valid).withContext('Valid initially').toBe(true);
      });
    });

    describe('updateOn', () => {
      it('should throw error when parent FormGroup has updateOn: "blur"', () => {
        const child = createSignalFormControl('meow');
        expect(() => new FormGroup({child}, {updateOn: 'blur'})).toThrowError(
          /SignalFormControl does not support the "updateOn: 'blur'" option inherited from its parent/,
        );
      });

      it('should throw error when parent FormGroup has updateOn: "submit"', () => {
        const child = createSignalFormControl('meow');
        expect(() => new FormGroup({child}, {updateOn: 'submit'})).toThrowError(
          /SignalFormControl does not support the "updateOn: 'submit'" option inherited from its parent/,
        );
      });

      it('should throw error when added to a FormGroup with updateOn: "blur"', () => {
        const group = new FormGroup({}, {updateOn: 'blur'});
        const child = createSignalFormControl('meow');
        expect(() => group.addControl('child', child)).toThrowError(
          /SignalFormControl does not support the "updateOn: 'blur'" option inherited from its parent/,
        );
      });

      it('should throw error when setControl in a FormGroup with updateOn: "blur"', () => {
        const group = new FormGroup({}, {updateOn: 'blur'});
        const child = createSignalFormControl('meow');
        expect(() => group.setControl('child', child)).toThrowError(
          /SignalFormControl does not support the "updateOn: 'blur'" option inherited from its parent/,
        );
      });

      it('should throw error when parent FormArray has updateOn: "blur"', () => {
        const child = createSignalFormControl('meow');
        expect(() => new FormArray([child], {updateOn: 'blur'})).toThrowError(
          /SignalFormControl does not support the "updateOn: 'blur'" option inherited from its parent/,
        );
      });

      it('should throw error when pushed into a FormArray with updateOn: "blur"', () => {
        const array = new FormArray<AbstractControl>([], {updateOn: 'blur'});
        const child = createSignalFormControl('meow');
        expect(() => array.push(child)).toThrowError(
          /SignalFormControl does not support the "updateOn: 'blur'" option inherited from its parent/,
        );
      });

      it('should not throw error when parent FormGroup has default updateOn ("change")', () => {
        const child = createSignalFormControl('meow');
        expect(() => new FormGroup({child})).not.toThrow();
        expect(() => new FormGroup({child}, {updateOn: 'change'})).not.toThrow();
      });
    });

    describe('reactive status changes via rules', () => {
      it('should update parent FormGroup status when conditional required rule changes', () => {
        const isRequired = signal(false);
        const child = createSignalFormControl('', (p) => {
          required(p, {when: () => isRequired()});
        });
        const group = new FormGroup({child});
        TestBed.tick();

        expect(child.status).toBe('VALID');
        expect(group.status).toBe('VALID');

        const groupStatuses: FormControlStatus[] = [];
        const groupStatusEvents: StatusChangeEvent[] = [];
        group.statusChanges.subscribe((s) => groupStatuses.push(s));
        group.events.subscribe((e) => {
          if (e instanceof StatusChangeEvent) {
            groupStatusEvents.push(e);
          }
        });

        isRequired.set(true);
        TestBed.tick();

        expect(child.status).toBe('INVALID');
        expect(group.status).toBe('INVALID');
        expect(group.invalid).toBe(true);
        expect(groupStatuses).toEqual(['INVALID']);
        expect(groupStatusEvents.length).toBe(1);
        expect(groupStatusEvents[0].status).toBe('INVALID');
        expect(groupStatusEvents[0].source).toBe(child);

        isRequired.set(false);
        TestBed.tick();

        expect(child.status).toBe('VALID');
        expect(group.status).toBe('VALID');
        expect(group.valid).toBe(true);
        expect(groupStatuses).toEqual(['INVALID', 'VALID']);
      });

      it('should update parent FormGroup status when applyWhen rule changes', () => {
        const needsValidation = signal(false);
        const child = createSignalFormControl('', (p) => {
          applyWhen(
            p,
            () => needsValidation(),
            (p) => {
              required(p);
            },
          );
        });
        const group = new FormGroup({child});
        TestBed.tick();

        expect(group.status).toBe('VALID');

        needsValidation.set(true);
        TestBed.tick();

        expect(group.status).toBe('INVALID');

        needsValidation.set(false);
        TestBed.tick();

        expect(group.status).toBe('VALID');
      });

      it('should update parent FormGroup value and status when disabled rule changes', () => {
        const isDisabled = signal(false);
        const name = createSignalFormControl('Alice', (p) => {
          disabled(p, {when: () => isDisabled()});
        });
        const age = new FormControl(30);
        const group = new FormGroup({name, age});
        TestBed.tick();

        expect(group.status).toBe('VALID');
        expect(group.value).toEqual({name: 'Alice', age: 30});

        const groupValues: unknown[] = [];
        const groupStatuses: FormControlStatus[] = [];
        group.valueChanges.subscribe((v) => groupValues.push(v));
        group.statusChanges.subscribe((s) => groupStatuses.push(s));

        isDisabled.set(true);
        TestBed.tick();

        expect(name.status).toBe('DISABLED');
        expect(group.status).toBe('VALID');
        expect(group.value).toEqual({age: 30});
        expect(group.getRawValue()).toEqual({name: 'Alice', age: 30});
        expect(groupValues).toEqual([{age: 30}]);
        expect(groupStatuses).toEqual(['VALID']);

        isDisabled.set(false);
        TestBed.tick();

        expect(name.status).toBe('VALID');
        expect(group.status).toBe('VALID');
        expect(group.value).toEqual({name: 'Alice', age: 30});
        expect(groupValues).toEqual([{age: 30}, {name: 'Alice', age: 30}]);
        expect(groupStatuses).toEqual(['VALID', 'VALID']);
      });

      it('should mark parent FormGroup as DISABLED when all child controls become disabled via rule', () => {
        const isDisabled = signal(false);
        const child = createSignalFormControl('Alice', (p) => {
          disabled(p, {when: () => isDisabled()});
        });
        const group = new FormGroup({child});
        TestBed.tick();

        expect(group.status).toBe('VALID');
        expect(group.disabled).toBe(false);

        isDisabled.set(true);
        TestBed.tick();

        expect(child.status).toBe('DISABLED');
        expect(group.status).toBe('DISABLED');
        expect(group.disabled).toBe(true);

        isDisabled.set(false);
        TestBed.tick();

        expect(child.status).toBe('VALID');
        expect(group.status).toBe('VALID');
        expect(group.disabled).toBe(false);
      });

      it('should update parent FormArray value and status when disabled or required rule changes', () => {
        const isDisabled = signal(false);
        const isRequired = signal(false);
        const first = createSignalFormControl('', (p) => {
          required(p, {when: () => isRequired()});
          disabled(p, {when: () => isDisabled()});
        });
        const second = createSignalFormControl('keep');
        const array = new FormArray([first, second]);
        TestBed.tick();

        expect(array.status).toBe('VALID');
        expect(array.value).toEqual(['', 'keep']);

        isRequired.set(true);
        TestBed.tick();

        expect(array.status).toBe('INVALID');

        isDisabled.set(true);
        TestBed.tick();

        expect(array.status).toBe('VALID');
        expect(array.value).toEqual(['keep']);
      });

      it('should propagate async validation status changes to parent FormGroup', async () => {
        let deferred = Promise.withResolvers<ValidationError[]>();
        const resolveNext = (errors: ValidationError[]) => {
          TestBed.tick();
          deferred.resolve(errors);
          deferred = Promise.withResolvers<ValidationError[]>();
        };

        const child = createSignalFormControl('initial', (p) => {
          validateAsync(p, {
            params: ({value}) => value(),
            factory: (params) =>
              resource({
                params,
                loader: () => deferred.promise,
              }),
            onSuccess: (errors) => errors,
            onError: () => null,
          });
        });
        const group = new FormGroup({child});
        const appRef = TestBed.inject(ApplicationRef);

        expect(child.status).toBe('PENDING');
        expect(group.status).toBe('PENDING');

        resolveNext([]);
        await appRef.whenStable();

        expect(child.status).toBe('VALID');
        expect(group.status).toBe('VALID');

        child.setValue('invalid');
        expect(child.status).toBe('PENDING');
        expect(group.status).toBe('PENDING');

        resolveNext([{kind: 'async-invalid'}]);
        await appRef.whenStable();

        expect(child.status).toBe('INVALID');
        expect(group.status).toBe('INVALID');
      });

      it('should not emit duplicate parent updates when both value and status change', () => {
        const child = createSignalFormControl('valid', (p) => {
          required(p);
        });
        const group = new FormGroup({child});
        TestBed.tick();

        const groupValues: unknown[] = [];
        const groupStatuses: FormControlStatus[] = [];
        group.valueChanges.subscribe((v) => groupValues.push(v));
        group.statusChanges.subscribe((s) => groupStatuses.push(s));

        // Imperative setValue changing both value and status
        child.setValue('');
        TestBed.tick();

        expect(groupValues).toEqual([{child: ''}]);
        expect(groupStatuses).toEqual(['INVALID']);

        // Reactive sourceValue.set changing both value and status
        child.sourceValue.set('valid-again');
        TestBed.tick();

        expect(groupValues).toEqual([{child: ''}, {child: 'valid-again'}]);
        expect(groupStatuses).toEqual(['INVALID', 'VALID']);

        // Synchronous fieldTree().value.set changing both value and status
        child.fieldTree().value.set('');
        TestBed.tick();

        expect(groupValues).toEqual([{child: ''}, {child: 'valid-again'}, {child: ''}]);
        expect(groupStatuses).toEqual(['INVALID', 'VALID', 'INVALID']);
      });

      it('should respect onlySelf and emitEvent options across tick when status also changes', () => {
        const child = createSignalFormControl('valid', (p) => {
          required(p);
        });
        const group = new FormGroup({child});
        TestBed.tick();

        const groupValues: unknown[] = [];
        const groupStatuses: FormControlStatus[] = [];
        group.valueChanges.subscribe((v) => groupValues.push(v));
        group.statusChanges.subscribe((s) => groupStatuses.push(s));

        child.setValue('', {onlySelf: true});
        TestBed.tick();

        expect(child.status).toBe('INVALID');
        expect(group.status).toBe('VALID');
        expect(groupValues).toEqual([]);
        expect(groupStatuses).toEqual([]);

        child.setValue('valid', {emitEvent: false});
        TestBed.tick();

        expect(child.status).toBe('VALID');
        expect(group.status).toBe('VALID');
        expect(groupValues).toEqual([]);
        expect(groupStatuses).toEqual([]);
      });

      it('should respect onlySelf and emitEvent on reset when status changes and not emit twice', () => {
        const child = createSignalFormControl('valid', (p) => {
          required(p);
        });
        const group = new FormGroup({child});
        TestBed.tick();

        child.setValue('');
        TestBed.tick();
        expect(group.status).toBe('INVALID');

        const groupValues: unknown[] = [];
        const groupStatuses: FormControlStatus[] = [];
        group.valueChanges.subscribe((v) => groupValues.push(v));
        group.statusChanges.subscribe((s) => groupStatuses.push(s));

        child.reset(undefined, {onlySelf: true});
        TestBed.tick();

        expect(child.status).toBe('VALID');
        expect(group.status).toBe('INVALID');
        expect(groupValues).toEqual([]);
        expect(groupStatuses).toEqual([]);

        child.setValue('', {emitEvent: false});
        TestBed.tick();

        child.reset(undefined, {emitEvent: false});
        TestBed.tick();

        expect(group.status).toBe('VALID');
        expect(groupValues).toEqual([]);
        expect(groupStatuses).toEqual([]);

        child.setValue('', {emitEvent: false});
        TestBed.tick();

        child.reset();
        TestBed.tick();

        expect(groupValues).toEqual([{child: 'valid'}]);
        expect(groupStatuses).toEqual(['VALID']);
      });

      it('should still propagate reactive updates after multiple synchronous setValue calls', () => {
        const child = createSignalFormControl('initial');
        const group = new FormGroup({child});
        TestBed.tick();

        child.setValue('first');
        child.setValue('second');
        TestBed.tick();

        expect(group.value).toEqual({child: 'second'});

        child.sourceValue.set('third');
        TestBed.tick();

        expect(group.value).toEqual({child: 'third'});
      });

      it('should have updated parent status before child statusChanges subscribers run', () => {
        const isRequired = signal(false);
        const child = createSignalFormControl('', (p) => {
          required(p, {when: () => isRequired()});
        });
        const group = new FormGroup({child});
        TestBed.tick();

        let observedGroupStatus: FormControlStatus | undefined;
        child.statusChanges.subscribe(() => {
          observedGroupStatus = group.status;
        });

        isRequired.set(true);
        TestBed.tick();

        expect(observedGroupStatus).toBe('INVALID');
      });

      it('should update parent FormGroup when multiple child controls share a rule signal', () => {
        const isRequired = signal(false);
        const first = createSignalFormControl('', (p) => {
          required(p, {when: () => isRequired()});
        });
        const second = createSignalFormControl('', (p) => {
          required(p, {when: () => isRequired()});
        });
        const group = new FormGroup({first, second});
        TestBed.tick();

        expect(group.status).toBe('VALID');

        isRequired.set(true);
        TestBed.tick();

        expect(first.status).toBe('INVALID');
        expect(second.status).toBe('INVALID');
        expect(group.status).toBe('INVALID');

        first.setValue('filled');
        TestBed.tick();

        expect(first.status).toBe('VALID');
        expect(second.status).toBe('INVALID');
        expect(group.status).toBe('INVALID');

        second.setValue('filled');
        TestBed.tick();

        expect(first.status).toBe('VALID');
        expect(second.status).toBe('VALID');
        expect(group.status).toBe('VALID');
      });

      it('should propagate rule status changes through nested FormGroups', () => {
        const isRequired = signal(false);
        const child = createSignalFormControl('', (p) => {
          required(p, {when: () => isRequired()});
        });
        const nested = new FormGroup({child});
        const root = new FormGroup({nested});
        TestBed.tick();

        expect(child.status).toBe('VALID');
        expect(nested.status).toBe('VALID');
        expect(root.status).toBe('VALID');

        isRequired.set(true);
        TestBed.tick();

        expect(child.status).toBe('INVALID');
        expect(nested.status).toBe('INVALID');
        expect(root.status).toBe('INVALID');

        isRequired.set(false);
        TestBed.tick();

        expect(child.status).toBe('VALID');
        expect(nested.status).toBe('VALID');
        expect(root.status).toBe('VALID');
      });

      it('should update parent status when dynamically adding a SignalFormControl with active rules', () => {
        const isRequired = signal(true);
        const child = createSignalFormControl('', (p) => {
          required(p, {when: () => isRequired()});
        });
        const group = new FormGroup({});
        TestBed.tick();

        expect(group.status).toBe('VALID');

        group.addControl('child', child);

        expect(child.status).toBe('INVALID');
        expect(group.status).toBe('INVALID');

        isRequired.set(false);
        TestBed.tick();

        expect(child.status).toBe('VALID');
        expect(group.status).toBe('VALID');
      });
    });
  });
});
