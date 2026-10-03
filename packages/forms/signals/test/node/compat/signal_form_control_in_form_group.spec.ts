/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  AbstractControl,
  ControlEvent,
  FormArray,
  FormControl,
  FormControlStatus,
  FormGroup,
} from '@angular/forms';
import {SignalFormControl} from '../../../compat/src/signal_form_control/signal_form_control';
import {required} from '../../../public_api';
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

  describe('disable and enable', () => {
    it('should disable the group and the child when parent disable() is called', () => {
      const child = createSignalFormControl(10);
      const group = new FormGroup({
        n: child,
      });

      expect(() => group.disable()).not.toThrow();

      expect(group.disabled).toBe(true);
      expect(group.status).toBe('DISABLED');
      expect(child.disabled).toBe(true);
      expect(child.status).toBe('DISABLED');
    });

    it('should re-enable the group and the child when parent enable() is called', () => {
      const child = createSignalFormControl(10);
      const group = new FormGroup({
        n: child,
      });

      group.disable();
      expect(child.disabled).toBe(true);

      group.enable();

      expect(group.disabled).toBe(false);
      expect(group.status).toBe('VALID');
      expect(child.disabled).toBe(false);
      expect(child.status).toBe('VALID');
      expect(group.value).toEqual({n: 10});
    });

    it('should exclude a disabled child from the group value but include it in getRawValue', () => {
      const child = createSignalFormControl(10);
      const group = new FormGroup({
        n: child,
        other: new FormControl(1),
      });

      child.disable();

      expect(group.value).toEqual({other: 1});
      expect(group.getRawValue()).toEqual({n: 10, other: 1});
    });

    it('should update parent status and value when the child is disabled directly', () => {
      const child = createSignalFormControl(10);
      const group = new FormGroup({
        n: child,
        other: new FormControl(1),
      });

      child.disable();

      expect(group.status).toBe('VALID');
      expect(group.value).toEqual({other: 1});

      child.enable();

      expect(group.status).toBe('VALID');
      expect(group.value).toEqual({n: 10, other: 1});
    });

    it('should behave consistently for FormControl and SignalFormControl children', () => {
      const signalChild = createSignalFormControl(10);
      const plainChild = new FormControl(1);
      const group = new FormGroup({
        signal: signalChild,
        plain: plainChild,
      });

      group.disable();

      expect(signalChild.disabled).toBe(true);
      expect(plainChild.disabled).toBe(true);
      expect(group.status).toBe('DISABLED');
      expect(group.value).toEqual({signal: 10, plain: 1});

      group.enable();

      expect(signalChild.disabled).toBe(false);
      expect(plainChild.disabled).toBe(false);
      expect(group.status).toBe('VALID');
      expect(group.value).toEqual({signal: 10, plain: 1});
    });

    it('should preserve a dirty sibling and restore own dirty state when a dirty child is disabled', () => {
      const child = createSignalFormControl(10);
      const sibling = new FormControl(1);
      const group = new FormGroup({
        n: child,
        other: sibling,
      });
      const appRef = TestBed.inject(ApplicationRef);

      child.markAsDirty();
      sibling.markAsDirty();
      appRef.tick();

      expect(child.dirty).toBe(true);
      expect(sibling.dirty).toBe(true);
      expect(group.dirty).toBe(true);

      child.disable();
      appRef.tick();

      expect(sibling.dirty).toBe(true);
      expect(group.dirty).toBe(true);

      child.enable();
      appRef.tick();

      expect(child.dirty).toBe(true);
    });

    it('should preserve a touched sibling and restore own touched state when a touched child is disabled', () => {
      const child = createSignalFormControl(10);
      const sibling = new FormControl(1);
      const group = new FormGroup({
        n: child,
        other: sibling,
      });
      const appRef = TestBed.inject(ApplicationRef);

      child.markAsTouched();
      sibling.markAsTouched();
      appRef.tick();

      expect(child.touched).toBe(true);
      expect(sibling.touched).toBe(true);
      expect(group.touched).toBe(true);

      child.disable();
      appRef.tick();

      expect(sibling.touched).toBe(true);
      expect(group.touched).toBe(true);

      child.enable();
      appRef.tick();

      expect(child.touched).toBe(true);
    });

    it('should not update the parent when child.disable({onlySelf: true}) is called', () => {
      const child = createSignalFormControl(10);
      const group = new FormGroup({
        n: child,
        other: new FormControl(1),
      });
      const appRef = TestBed.inject(ApplicationRef);
      appRef.tick();

      const parentValues: unknown[] = [];
      const parentStatuses: FormControlStatus[] = [];
      group.valueChanges.subscribe((v) => parentValues.push(v));
      group.statusChanges.subscribe((s) => parentStatuses.push(s));

      child.disable({onlySelf: true});
      appRef.tick();

      expect(child.disabled).toBe(true);
      expect(group.value).toEqual({n: 10, other: 1});
      expect(parentValues).toEqual([]);
      expect(parentStatuses).toEqual([]);
    });

    it('should not emit status or value changes when child.disable({emitEvent: false}) is called', () => {
      const child = createSignalFormControl(10);
      const group = new FormGroup({
        n: child,
        other: new FormControl(1),
      });
      const appRef = TestBed.inject(ApplicationRef);
      appRef.tick();

      const childStatuses: FormControlStatus[] = [];
      const parentStatuses: FormControlStatus[] = [];
      const parentValues: unknown[] = [];
      child.statusChanges.subscribe((s) => childStatuses.push(s));
      group.statusChanges.subscribe((s) => parentStatuses.push(s));
      group.valueChanges.subscribe((v) => parentValues.push(v));

      child.disable({emitEvent: false});
      appRef.tick();

      expect(child.disabled).toBe(true);
      expect(childStatuses).toEqual([]);
      expect(parentStatuses).toEqual([]);
      expect(parentValues).toEqual([]);
    });

    it('should support disable/enable and value exclusion when nested in a FormArray', () => {
      const child = createSignalFormControl(10);
      const array = new FormArray<AbstractControl>([child, new FormControl(1)]);

      expect(() => array.disable()).not.toThrow();
      expect(array.status).toBe('DISABLED');
      expect(child.disabled).toBe(true);

      array.enable();
      expect(array.status).toBe('VALID');
      expect(child.disabled).toBe(false);

      child.disable();
      expect(array.value).toEqual([1]);
      expect(array.getRawValue()).toEqual([10, 1]);
    });

    it('should not re-emit on a sibling SignalFormControl when another child changes dirty/touched', () => {
      const changed = createSignalFormControl(10);
      const sibling = createSignalFormControl(20);
      const group = new FormGroup({
        changed,
        sibling,
      });
      const appRef = TestBed.inject(ApplicationRef);
      appRef.tick();

      const siblingEvents: ControlEvent[] = [];
      const siblingStatuses: FormControlStatus[] = [];
      sibling.events.subscribe((e) => siblingEvents.push(e));
      sibling.statusChanges.subscribe((s) => siblingStatuses.push(s));

      changed.markAsDirty();
      changed.markAsTouched();
      appRef.tick();

      expect(siblingEvents).toEqual([]);
      expect(siblingStatuses).toEqual([]);
      expect(group.dirty).toBe(true);
      expect(group.touched).toBe(true);

      changed.disable();
      appRef.tick();

      expect(sibling.dirty).toBe(false);
      expect(sibling.touched).toBe(false);
      expect(sibling.disabled).toBe(false);
      expect(group.dirty).toBe(false);
      expect(group.touched).toBe(false);
      expect(group.value).toEqual({sibling: 20});
      expect(group.getRawValue()).toEqual({changed: 10, sibling: 20});
    });
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
  });
});
