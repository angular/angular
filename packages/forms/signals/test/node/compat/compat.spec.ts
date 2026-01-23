/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {compatForm, CompatValidationError} from '../../../compat/public_api';
import {
  disabled,
  email,
  FieldState,
  FieldTree,
  form,
  hidden,
  readonly,
  required,
  submit,
  TreeValidationResult,
  validate,
  validateTree,
} from '../../../public_api';

function promiseWithResolvers<T>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
} {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {promise, resolve, reject};
}

describe('Forms compat', () => {
  it('should not error on a valid value', () => {
    const cat = signal({
      name: 'pirojok-the-cat',
      age: new FormControl<number>(5, {nonNullable: true}),
    });

    const f = compatForm(cat, {
      injector: TestBed.inject(Injector),
    });

    const age = f.age();
    expect(age.value()).toBe(5);
    expect(f.age().valid()).toBe(true);
  });

  it('should handle and propagate errors', () => {
    const control = new FormControl(5, Validators.min(3));
    const cat = signal({
      name: 'pirojok-the-cat',
      age: control,
    });
    const f = compatForm(cat, {
      injector: TestBed.inject(Injector),
    });

    expect(f.age().value()).toBe(5);
    expect(f.age().valid()).toBe(true);
    expect(f().valid()).toBe(true);
    control.setValue(2);
    expect(f.age().value()).toBe(2);
    expect(f.age().valid()).toBe(false);
    expect(f().valid()).toBe(false);
    f.age().value.set(100);
    expect(f.age().value()).toBe(100);
    expect(f.age().valid()).toBe(true);
    expect(f().valid()).toBe(true);
  });

  it('can be in root', () => {
    const catControl = new FormControl('meow', Validators.minLength(3));
    const cat = signal(catControl);
    const f = compatForm(cat, {
      injector: TestBed.inject(Injector),
    });

    expect(f().value()).toBe('meow');
    expect(f().valid()).toBe(true);
  });

  it('picks up the value from a new form control', () => {
    const control = new FormControl(5, Validators.min(3));
    const cat = signal({
      name: 'pirojok-the-cat',
      age: control,
    });

    const f = compatForm(cat, {
      injector: TestBed.inject(Injector),
    });

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

  it('handles multiple value and control changes', () => {
    const control = new FormControl(100, Validators.min(3));
    const cat = signal(control);

    const f = compatForm(cat, {
      injector: TestBed.inject(Injector),
    });

    expect(f().value()).toBe(100);
    control.setValue(101);
    expect(f().value()).toBe(101);
    cat.set(new FormControl(6));
    expect(f().value()).toBe(6);
    cat.set(new FormControl(7));
    expect(f().value()).toBe(7);
    cat.set(new FormControl(8));
    expect(f().value()).toBe(8);
  });

  describe('validation', () => {
    it('picks up the validation from a new form control', () => {
      const control = new FormControl(5, Validators.min(10));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      expect(f.age().valid()).toBeFalse();
      expect(f.age().errors()).toEqual([
        new CompatValidationError({control, kind: 'min', context: {min: 10, actual: 5}}),
      ]);
      f().value.set({age: new FormControl(4), name: 'lol'});
      expect(f.age().valid()).toBeTrue();
    });

    it('allows to manually set errors', () => {
      const catControl = new FormControl('meow', Validators.minLength(3));
      const cat = signal(catControl);
      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      catControl.setErrors({meow: true});
      expect(f().errors()).toEqual([
        new CompatValidationError({kind: 'meow', context: true, control: catControl}),
      ]);
    });

    it('picks up the multiple errors from a new form control', () => {
      const control = new FormControl('pirojok-the-error', [
        (c) => {
          return {
            [c.value]: {'meow': true},
            'error-1': 'error-1-content',
            'error-2': 'error-2-content',
          };
        },
      ]);

      const cat = signal({
        name: 'pirojok-the-cat',
        mistake: control,
      });

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      expect(f.mistake().valid()).toBeFalse();
      expect(f.mistake().errors()).toEqual([
        new CompatValidationError({kind: 'pirojok-the-error', context: {meow: true}, control}),
        new CompatValidationError({kind: 'error-1', context: 'error-1-content', control}),
        new CompatValidationError({kind: 'error-2', context: 'error-2-content', control}),
      ]);
    });

    it('supports async validation', async () => {
      let resolve: Function = () => {};
      const formControl = new FormControl<number>(5, {
        nonNullable: true,
        asyncValidators: () => {
          // can't use promiseWithResolver here, because this runs multiple times across tests.
          return new Promise<null>((r) => {
            resolve = r;
          });
        },
      });
      const cat = signal({
        name: 'pirojok-the-cat',
        age: formControl,
      });

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

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
      expect(f.age().errors()).toEqual([
        new CompatValidationError({kind: 'incorrect-cat', context: 123, control: formControl}),
      ]);
    });
  });

  describe('state propagation', () => {
    it('propagates disabled state from parent', () => {
      const ageControl = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: ageControl,
      });

      const f = compatForm(
        cat,
        (p) => {
          disabled(p, ({value}) => {
            return value().name === 'disabled-cat';
          });
        },
        {
          injector: TestBed.inject(Injector),
        },
      );

      expect(f.name().disabled()).withContext('name is initially enabled').toBeFalse();
      expect(f.age().disabled()).withContext('age is initially enabled').toBeFalse();
      f.name().value.set('disabled-cat');
      expect(f.name().disabled()).withContext('name is disabled').toBeTrue();
      expect(f.age().disabled()).withContext('age is disabled').toBeTrue();
      f.name().value.set('enabled-cat');
      expect(f.name().disabled()).withContext('name is enabled').toBeFalse();
      expect(f.age().disabled()).withContext('age is enabled').toBeFalse();
      ageControl.disable();
      expect(f.name().disabled()).withContext('name is enabled').toBeFalse();
      expect(f.age().disabled()).withContext('age is disabled').toBeTrue();
    });

    it('propagates hidden state from parent', () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat1',
        age: control,
      });

      const f = compatForm(
        cat,
        (p) => {
          hidden(p, ({value}) => {
            return value().name === 'hidden-cat';
          });
        },
        {
          injector: TestBed.inject(Injector),
        },
      );

      expect(f.name().hidden()).withContext('name is initially displayed').toBeFalse();
      expect(f.age().hidden()).withContext('age is initially displayed').toBeFalse();
      f.name().value.set('hidden-cat');
      expect(f.name().hidden()).withContext('name is hidden').toBeTrue();
      expect(f().hidden()).withContext('name is hidden').toBeTrue();
      expect(f.age().hidden()).withContext('age is hidden').toBeTrue();
    });

    it('propagates touched state to parent', async () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      expect(f.name().touched()).withContext('name is initially not touched').toBeFalse();
      expect(f().touched()).withContext('form is initially not touched').toBeFalse();

      control.markAsTouched();

      expect(f.age().touched()).withContext('age is touched, when control is touched').toBeTrue();
      expect(f().touched()).withContext('form is touched when a child is touched').toBeTrue();

      control.markAsUntouched();

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

      const f = compatForm(cat, {injector: TestBed.inject(Injector)});

      expect(f().submitting()).toBe(false);
      expect(f.age().submitting()).toBe(false);

      const {promise, resolve} = promiseWithResolvers<TreeValidationResult>();

      const result = submit(f as unknown as FieldTree<void>, () => {
        return promise;
      });

      expect(f().submitting()).toBe(true);
      expect(f.age().submitting()).toBe(true);

      resolve([]);
      await result;

      expect(f().submitting()).toBe(false);
      expect(f.age().submitting()).toBe(false);
    });

    it('propagates dirty state to parent', () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      expect(f.age().dirty()).withContext('age is initially not dirty').toBeFalse();
      expect(f().dirty()).withContext('form is initially not dirty').toBeFalse();

      control.markAsDirty();

      expect(f.age().dirty()).withContext('age is dirty, when control is dirty').toBeTrue();
      expect(f().dirty()).withContext('form is dirty when the child is dirty').toBeTrue();

      control.markAsPristine();

      expect(f.age().dirty()).withContext('age is not dirty when marked as pristine').toBeFalse();
      expect(f().dirty())
        .withContext('age is not dirty when age is marked as pristine')
        .toBeFalse();

      f.age().markAsDirty();
      expect(f.age().dirty()).withContext('age is dirty, when control is dirty').toBeTrue();
      expect(f().dirty()).withContext('form is dirty when the child is dirty').toBeTrue();
    });

    it('allows resetting state', () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      control.markAsDirty();
      control.markAsTouched();

      expect(f.age().dirty()).toBeTrue();
      expect(f.age().touched()).toBeTrue();

      f.age().reset();

      expect(f.age().dirty()).toBeFalse();
      expect(f.age().touched()).toBeFalse();
      expect(f().dirty()).toBeFalse();
      expect(f().touched()).toBeFalse();
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
      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      expect(f.address.house().control()).toBe(control);
    });

    it('supports getting control from stateOf', () => {
      const control = new FormControl(5, Validators.min(3));

      const cat = signal({
        name: 'pirojok-the-cat',
        address: {
          house: control,
        },
      });

      const f = compatForm(
        cat,
        (p) => {
          validate(p, ({stateOf}) => {
            return stateOf(p.address.house).control().value === 6 ? undefined : {kind: 'too small'};
          });
        },
        {
          injector: TestBed.inject(Injector),
        },
      );

      expect(f().errors()).toEqual([{kind: 'too small', fieldTree: f}]);
    });

    it('supports getting control from fieldTreeOf', () => {
      const control = new FormControl(5, Validators.min(3));

      const cat = signal({
        name: 'pirojok-the-cat',
        address: {
          house: control,
        },
      });

      const f = compatForm(
        cat,
        (p) => {
          validate(p, ({fieldTreeOf}) => {
            return fieldTreeOf(p.address.house)().control().value === 6
              ? undefined
              : {kind: 'too small'};
          });
        },
        {
          injector: TestBed.inject(Injector),
        },
      );

      expect(f().errors()).toEqual([{kind: 'too small', fieldTree: f}]);
    });

    it('fails for regular values', () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        address: {
          house: control,
        },
      });
      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      // @ts-expect-error
      expect(() => f.name().control()).toThrowError();
    });
  });

  it('disallows passing a path with a FormControl on the type level', () => {
    const control = new FormControl(5, {nonNullable: true, validators: [Validators.min(3)]});
    const cat = signal({
      name: 'pirojok-the-cat',
      age: control,
    });
    compatForm(
      cat,
      (path) => {
        // @ts-expect-error
        required(path.age);
        // @ts-expect-error
        validate(path.age, () => {
          return undefined;
        });
      },
      {
        injector: TestBed.inject(Injector),
      },
    );
  });

  it('allows to use form control values for validation', () => {
    const control = new FormControl(5, {nonNullable: true, validators: [Validators.min(3)]});
    const cat = signal({
      name: 'pirojok-the-cat',
      age: control,
    });
    const f = compatForm(
      cat,
      (path) => {
        required(path.name);

        validate(path.name, ({valueOf}) => {
          return valueOf(path.age) < 8 ? {kind: 'too small'} : undefined;
        });
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.name().valid()).toBe(false);
    expect(f.name().errors()).toEqual([
      {
        kind: 'too small',
        fieldTree: f.name,
      },
    ]);

    control.setValue(10);
    expect(f.name().valid()).toBe(true);
    f.age().value.set(4);
    expect(f.name().valid()).toBe(false);
    f.age().value.update((value) => value + 6);
    expect(f.name().valid()).toBe(true);
  });

  describe('arrays', () => {
    it('works with removing an element and bringing it back', async () => {
      const validCat = new FormControl('valid cat', {nonNullable: true});
      const invalidCat = new FormControl('invalid cat', {
        nonNullable: true,
        validators: [Validators.maxLength(5)],
      });

      const cats = signal({
        cats: [validCat, invalidCat],
      });

      const f = compatForm(cats, {
        injector: TestBed.inject(Injector),
      });

      expect(f.cats[0]().value()).toBe('valid cat');
      expect(f.cats[1]().value()).toBe('invalid cat');

      expect(f.cats[0]().valid()).withContext('first cat is valid').toBe(true);
      expect(f.cats[1]().valid()).withContext('second cat is not valid').toBe(false);

      expect(f().valid())
        .withContext('form is not valid because child validator fails')
        .toBe(false);

      cats.set({cats: []});
      expect(f().valid())
        .withContext('form is valid because invalid control has been removed')
        .toBe(true);

      cats.set({cats: [validCat]});
      expect(f().valid())
        .withContext('form is valid because only valid control was brought back')
        .toBe(true);

      expect(f.cats[0]().value()).toBe('valid cat');
      expect(f.cats[1]).toBe(undefined);

      cats.set({cats: [invalidCat]});
      expect(f().valid())
        .withContext('form is invalid again, because invalid child is back')
        .toBe(false);

      expect(f.cats[0]().value()).toBe('invalid cat');
      expect(f.cats[1]).toBe(undefined);
    });
  });

  describe('FormGroup', () => {
    it('is supported', () => {
      const cat = signal(
        new FormGroup({
          name: new FormControl('pirojok-the-cat'),
          age: new FormControl(10),
        }),
      );

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      expect(f().value()).toEqual({
        name: 'pirojok-the-cat',
        age: 10,
      });

      expect(f().valid()).toEqual(true);
    });

    it('uses the actual value, not rawValue', () => {
      const ageControl = new FormControl(10);
      const cat = signal(
        new FormGroup({
          name: new FormControl('pirojok-the-cat'),
          age: ageControl,
        }),
      );

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      ageControl.disable();
      expect(f().value()).toEqual({
        name: 'pirojok-the-cat',
        age: 10,
      });

      expect(f().valid()).toEqual(true);
    });

    it('propagates validity and errors from child controls', () => {
      const ageControl = new FormControl(1, Validators.min(5));
      const cat = signal(
        new FormGroup({
          name: new FormControl('pirojok-the-cat'),
          age: ageControl,
        }),
      );

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      expect(f().valid()).toEqual(false);
      expect(f().errors()).toEqual([
        new CompatValidationError({kind: 'min', control: ageControl, context: {min: 5, actual: 1}}),
      ]);
    });
  });

  it(`should not interpret 'FormControl' properties as subfields`, () => {
    const cat = signal(new FormControl('pirojok-the-cat'));

    const f = compatForm(cat, {
      injector: TestBed.inject(Injector),
    });

    // Does not pick up form control props as form children.
    // @ts-expect-error
    expect(f.value).toBe(undefined);
    // @ts-expect-error
    expect(f.setValue).toBe(undefined);
    // @ts-expect-error
    expect(f.child).toBe(undefined);
  });

  describe('type test all rules', () => {
    it('compat form', () => {
      const control = new FormControl(5, {nonNullable: true, validators: [Validators.min(3)]});
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });
      compatForm(
        cat,
        (path) => {
          required(path.name);

          validate(path.name, ({valueOf}) => {
            return valueOf(path.age) < 8 ? {kind: 'too small'} : undefined;
          });
          required(path.name, {
            when: ({valueOf}) => {
              return valueOf(path.age) < 8;
            },
          });
          validateTree(path.name, ({valueOf}) => {
            return valueOf(path.age) < 8 ? [] : [];
          });

          readonly(path.name, ({valueOf}) => {
            return valueOf(path.age) < 8;
          });

          email(path.name, {
            error: ({valueOf}) => {
              return valueOf(path.age) < 8 ? [] : [];
            },
          });
        },
        {
          injector: TestBed.inject(Injector),
        },
      );

      expect().nothing();
    });

    describe('regular forms', () => {
      it('throws when using valueOf on FormControl', () => {
        const control = new FormControl(5, {nonNullable: true, validators: [Validators.min(3)]});
        const cat = signal({
          name: 'pirojok-the-cat',
          age: control,
        });
        const f = form(
          cat,
          (p) => {
            validate(p.name, ({valueOf}) => {
              valueOf(p.age);
            });
          },
          {
            injector: TestBed.inject(Injector),
          },
        );

        expect(() => f().valid()).toThrowError(/Tried to read an 'AbstractControl' value/);
      });
    });
  });

  describe('type tests', () => {
    it('uses raw value', () => {
      const ageControl = new FormControl(10);
      const cat = signal(
        new FormGroup({
          name: new FormControl('pirojok-the-cat', {nonNullable: true}),
          age: ageControl,
        }),
      );

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      const name: string = f().value().name;
    });

    it('unwraps the value', () => {
      const ageControl = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: ageControl,
      });

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
      });

      const age: number | null = f.age().value();
      // @ts-expect-error
      const notAge: string = f.age().value();
    });

    it('allows generic CompatValidationError', () => {
      const error = new CompatValidationError({
        kind: 'min',
        context: {min: 3, max: 4},
        control: new FormControl(),
      });

      const min: number = error.context.min;
      // @ts-expect-error
      const notMin: string = error.context.min;
    });

    it('Allows setting T value for non compat fields', () => {
      function setStateValue<T>(state: FieldState<T>, value: T) {
        state.value.set(value);
      }

      function setValueCompatState<T>(field: FieldState<T>, value: T) {
        field.value.set(field.value());
      }

      function setValueRegularState<T>(field: FieldState<T>, value: T) {
        field.value.set(field.value());
      }

      function setValue<T>(f: FieldTree<T>, value: T) {
        // @ts-expect-error
        f().value.set(value);
      }
    });
  });
});
