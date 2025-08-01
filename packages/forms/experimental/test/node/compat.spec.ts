/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Injector, Signal, signal, WritableSignal} from '@angular/core';
import {
  CompatFieldPath,
  disabled,
  Field,
  FieldPath,
  FieldState,
  form,
  hidden,
  required,
  submit,
  validate,
} from '../../public_api';
import {TestBed} from '@angular/core/testing';
import {AbstractControl, FormControl, FormControlState, Validators} from '@angular/forms';

import {ValidationError} from '../../src/api/validation_errors';

type UnwrapFormControlState<T> = T extends FormControlState<infer V> ? V : T;

type UnwrapControl<T> = T extends AbstractControl<infer V> ? UnwrapFormControlState<V> : T;

type ControlOrNoControl<T> = T extends AbstractControl<unknown> ? Signal<T> : never;

type CompatFieldState<T, K extends string | number = string | number> = Omit<
  FieldState<T, K>,
  'value'
> & {
  value: WritableSignal<UnwrapControl<T>>;
  control: ControlOrNoControl<T>;
};

export type MaybeCompatField<TValue, TKey extends string | number = string | number> =
  | (TValue & undefined)
  | CompatField<Exclude<TValue, undefined>, TKey>;

export type CompatField<
  TValue,
  TKey extends string | number = string | number,
> = (() => CompatFieldState<TValue, TKey>) &
  (TValue extends Array<infer U>
    ? Array<MaybeCompatField<U, number>>
    : TValue extends Record<string, any>
      ? {[K in keyof TValue]: MaybeCompatField<TValue[K], string>}
      : unknown);

function convert2<T>(field: Field<T>): CompatField<T> {
  return field as any;
}

fdescribe('Forms compat', () => {
  // TODO: Arrays
  it('should not error on a valid value', () => {
    const cat = signal({
      name: 'pirojok-the-cat',
      age: new FormControl<number>(5, {nonNullable: true}),
    });

    const f = convert2(
      form(cat, {
        injector: TestBed.inject(Injector),
      }),
    );

    const age = f.age();
    let v = age.value();
    expect(v).toBe(5);
    expect(f.age().valid()).toBe(true);
  });

  it('should handle and propagate errors', () => {
    const control = new FormControl(5, Validators.min(3));
    const cat = signal({
      name: 'pirojok-the-cat',
      age: control,
    });
    const f = convert2(
      form(cat, {
        injector: TestBed.inject(Injector),
      }),
    );

    const v = f.age().value();
    expect(v).toBe(5);
    expect(f.age().valid()).toBe(true);
    control.setValue(2);
    expect(f.age().value()).toBe(2);
    expect(f.age().valid()).toBe(false);
    f.age().value.set(100);
  });

  it('picks up the value from a new form control', () => {
    const control = new FormControl(5, Validators.min(3));
    const cat = signal({
      name: 'pirojok-the-cat',
      age: control,
    });

    const f = convert2(
      form(cat, {
        injector: TestBed.inject(Injector),
      }),
    );

    expect(f.age().value()).toBe(5);
    f().value.set({age: new FormControl(10), name: 'lol'});
    expect(f.age().value()).toBe(10);

    const fc = new FormControl(25);
    cat.set({
      name: 'meow-the-cat',
      age: fc,
    });
    expect(f.age().value()).toBe(25);
    expect(f().value()).toEqual({
      name: 'meow-the-cat',
      age: fc,
    });
  });

  it('picks up the validation from a new form control', () => {
    const control = new FormControl(5, Validators.min(10));
    const cat = signal({
      name: 'pirojok-the-cat',
      age: control,
    });

    const f = convert2(
      form(cat, {
        injector: TestBed.inject(Injector),
      }),
    );

    f.age().value();
    expect(f.age().valid()).toBeFalse();
    f().value.set({age: new FormControl(10), name: 'lol'});
    expect(f.age().valid()).toBeTrue();
  });

  describe('state propagation', () => {
    it('propagates disabled state from parent', () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });

      const f = convert2(
        form(
          cat,
          (p) => {
            disabled(p, ({value}) => {
              return value().name === 'disabled-cat';
            });
          },
          {
            injector: TestBed.inject(Injector),
          },
        ),
      );

      expect(f.name().disabled()).withContext('name is initially enabled').toBeFalse();
      expect(f.age().disabled()).withContext('age is initially enabled').toBeFalse();
      f.name().value.set('disabled-cat');
      expect(f.name().disabled()).withContext('name is disabled').toBeTrue();
      expect(f.age().disabled()).withContext('age is disabled').toBeTrue();
      f.name().value.set('enabled-cat');
      expect(f.name().disabled()).withContext('name is enabled').toBeFalse();
      expect(f.age().disabled()).withContext('age is enabled').toBeFalse();
      control.disable();
      expect(f.name().disabled()).withContext('name is enabled').toBeFalse();
      expect(f.age().disabled()).withContext('age is disabled').toBeTrue();
    });

    it('propagates hidden state from parent', () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });

      const f = convert2(
        form(
          cat,
          (p) => {
            hidden(p, ({value}) => {
              return value().name === 'hidden-cat';
            });
          },
          {
            injector: TestBed.inject(Injector),
          },
        ),
      );

      expect(f.name().hidden()).withContext('name is initially displayed').toBeFalse();
      expect(f.age().hidden()).withContext('age is initially displayed').toBeFalse();
      f.name().value.set('hidden-cat');
      expect(f.name().hidden()).withContext('name is hidden').toBeTrue();
      expect(f.age().hidden()).withContext('age is hidden').toBeTrue();
    });

    it('propagates touched state to parent', async () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });

      const f = convert2(
        form(cat, {
          injector: TestBed.inject(Injector),
        }),
      );

      expect(f.name().touched()).withContext('name is initially not touched').toBeFalse();
      expect(f().touched()).withContext('form is initially not touched').toBeFalse();

      control.markAsTouched();
      control.updateValueAndValidity();

      expect(f.age().touched()).withContext('age is touched, when control is touched').toBeTrue();
      expect(f().touched()).withContext('form is touched when a child is touched').toBeTrue();

      control.markAsUntouched();
      control.updateValueAndValidity();

      expect(f.age().touched()).withContext('name is not touched when untouched').toBeFalse();
      expect(f().touched()).withContext('name is not touched when child is untouched').toBeFalse();

      f.age().markAsTouched();

      expect(f.age().touched()).withContext('age is touched, when control is touched').toBeTrue();
      expect(f().touched()).withContext('form is touched when a child is touched').toBeTrue();
    });

    it('picks up submittedState from parent', async () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });

      const f = form(
        cat,
        (cat) => {
          // first cat required if last cat specified
          required(cat.name, {when: ({valueOf}) => valueOf(cat.age) !== 0});
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().submittedStatus()).toBe('unsubmitted');
      expect(f.age().submittedStatus()).toBe('unsubmitted');

      let resolvePromise: VoidFunction | undefined;

      const result = submit(f, () => {
        return new Promise((r) => {
          resolvePromise = r;
        });
      });

      expect(f().submittedStatus()).toBe('submitting');
      expect(f.age().submittedStatus()).toBe('submitting');

      expect(resolvePromise).toBeDefined();
      resolvePromise?.();

      await result;

      expect(f().submittedStatus()).toBe('submitted');
      expect(f.age().submittedStatus()).toBe('submitted');
    });

    it('propagates dirty state to parent', () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });

      const f = convert2(
        form(cat, {
          injector: TestBed.inject(Injector),
        }),
      );

      expect(f.age().dirty()).withContext('age is initially not dirty').toBeFalse();
      expect(f().dirty()).withContext('form is initially not dirty').toBeFalse();

      control.markAsDirty();
      control.updateValueAndValidity();

      expect(f.age().dirty()).withContext('age is dirty, when control is dirty').toBeTrue();
      expect(f().dirty()).withContext('form is dirty which child is dirty').toBeTrue();

      control.markAsPristine();
      control.updateValueAndValidity();

      expect(f.age().dirty()).withContext('age is not dirty when marked as pristine').toBeFalse();
      expect(f().dirty())
        .withContext('age is not dirty when age is marked as pristine')
        .toBeFalse();

      f.age().markAsDirty();
      expect(f.age().dirty()).withContext('age is dirty, when control is dirty').toBeTrue();
      expect(f().dirty()).withContext('form is dirty which child is dirty').toBeTrue();
    });
  });

  describe('exposing control', () => {
    it('works for control', () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        address: {
          house: control,
        },
      });
      const f = convert2(
        form(cat, {
          injector: TestBed.inject(Injector),
        }),
      );

      expect(f.address.house().control()).toBe(control);
    });

    it('fails for regular values', () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        address: {
          house: control,
        },
      });
      const f = convert2(
        form(cat, {
          injector: TestBed.inject(Injector),
        }),
      );

      // @ts-expect-error
      expect(() => f.name().control()).toThrowError();
    });
  });

  it('allows to use form control values for validation', () => {
    const control = new FormControl(5, {nonNullable: true, validators: [Validators.min(3)]});
    const cat = signal({
      name: 'pirojok-the-cat',
      age: control,
    });
    const f = convert2(
      form(
        cat,
        (p) => {
          type PathToCompatPath<T> =
            T extends FormControl<infer C>
              ? CompatFieldPath<UnwrapFormControlState<C>>
              : T extends object
                ? {[K in keyof T]: PathToCompatPath<T[K]>}
                : FieldPath<T>;

          function convertPath<T>(path: FieldPath<T>): PathToCompatPath<T> {
            return path as any;
          }

          const path = convertPath(p);
          required(path.name);

          // @ts-expect-error can't add rules here
          // TODO(kirjs): this should probably throw?
          required(path.age);

          validate(path.name, ({valueOf}) => {
            let v = valueOf(path.age);
            return v < 8 ? ValidationError.custom({kind: 'too small'}) : undefined;
          });
        },
        {
          injector: TestBed.inject(Injector),
        },
      ),
    );

    expect(f.name().valid()).toBe(false);
    expect(f.name().errors()).toEqual([ValidationError.custom({kind: 'too small'})]);

    control.setValue(10);
    expect(f.name().valid()).toBe(true);
    f.age().value.set(4);
    expect(f.name().valid()).toBe(false);
  });

  describe('async validation', () => {
    it('should not error on a valid value', async () => {
      let resolve: Function = () => {};
      const cat = signal({
        name: 'pirojok-the-cat',
        age: new FormControl<number>(5, {
          nonNullable: true,
          asyncValidators: () => {
            return new Promise<null>((r) => {
              resolve = r;
            });
          },
        }),
      });

      const f = convert2(
        form(cat, {
          injector: TestBed.inject(Injector),
        }),
      );

      expect(f.age().pending()).toBeTrue();

      resolve(null);

      await TestBed.inject(ApplicationRef).whenStable();

      expect(f.age().pending()).toBeFalse();
      expect(f.age().valid()).toBeTrue();

      f.age().control().setValue(18);

      expect(f.age().pending()).toBeTrue();
      expect(f.age().valid()).toBeFalse();

      resolve({'incorrect-cat': 123});

      await TestBed.inject(ApplicationRef).whenStable();

      expect(f.age().pending()).toBeFalse();
    });
  });
});
