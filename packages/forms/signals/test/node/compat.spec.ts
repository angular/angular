/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Injector, signal} from '@angular/core';
import {customError, disabled, form, hidden, required, submit, validate} from '../../public_api';
import {TestBed} from '@angular/core/testing';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CompatFieldAdapter} from '../../src/field/compat/compat_field_adapter';
import {ReactiveValidationError} from '../../src/field/compat/compat_validation_error';
import {compatForm} from '../../src/field/compat/compat_form';

describe('Forms compat', () => {
  // TODO: valueOf in regular form
  /**
   * Open questions and TODOs:
   *
   * - Should we propagate errors for FormGroup? Right now we get in a state where  a form group can be invalid, but have no errors.
   * One option would be to aggregate errors and have a ValidatorError.formGroup({context: ...all errors go here...})
   *
   * - Should we map min/max errors to appropriate signal form errors?
   * - What would be a good way to not let rules take values with FormControls?
   *
   */
  it('should not error on a valid value', () => {
    const cat = signal({
      name: 'pirojok-the-cat',
      age: new FormControl<number>(5, {nonNullable: true}),
    });

    const f = compatForm(cat, {
      injector: TestBed.inject(Injector),
      adapter: new CompatFieldAdapter(),
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
      adapter: new CompatFieldAdapter(),
    });

    expect(f.age().value()).toBe(5);
    expect(f.age().valid()).toBe(true);
    control.setValue(2);
    expect(f.age().value()).toBe(2);
    expect(f.age().valid()).toBe(false);
    f.age().value.set(100);
  });

  it('can be in root', () => {
    const catControl = new FormControl('meow', Validators.minLength(3));
    const cat = signal(catControl);
    const f = compatForm(cat, {
      injector: TestBed.inject(Injector),
      adapter: new CompatFieldAdapter(),
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
      adapter: new CompatFieldAdapter(),
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

  describe('validation', () => {
    it('picks up the validation from a new form control', () => {
      const control = new FormControl(5, Validators.min(10));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
        adapter: new CompatFieldAdapter(),
      });

      expect(f.age().valid()).toBeFalse();
      expect(f.age().errors()).toEqual([
        new ReactiveValidationError({kind: 'min', context: {min: 10, actual: 5}}),
      ]);
      f().value.set({age: new FormControl(10), name: 'lol'});
      expect(f.age().valid()).toBeTrue();
    });

    it('allows to manually set errors', () => {
      const catControl = new FormControl('meow', Validators.minLength(3));
      const cat = signal(catControl);
      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
        adapter: new CompatFieldAdapter(),
      });

      catControl.setErrors({meow: true});
      expect(f().errors()).toEqual([new ReactiveValidationError({kind: 'meow', context: true})]);
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
        adapter: new CompatFieldAdapter(),
      });

      expect(f.mistake().valid()).toBeFalse();
      expect(f.mistake().errors()).toEqual([
        new ReactiveValidationError({kind: 'pirojok-the-error', context: {meow: true}}),
        new ReactiveValidationError({kind: 'error-1', context: 'error-1-content'}),
        new ReactiveValidationError({kind: 'error-2', context: 'error-2-content'}),
      ]);
    });
  });

  describe('state propagation', () => {
    it('propagates disabled state from parent', () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
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
          adapter: new CompatFieldAdapter(),
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
      control.disable();
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
          adapter: new CompatFieldAdapter(),
        },
      );

      expect(f.name().hidden()).withContext('name is initially displayed').toBeFalse();
      expect(f.age().hidden()).withContext('age is initially displayed').toBeFalse();
      f.name().value.set('hidden-cat');
      expect(f.name().hidden()).withContext('name is hidden').toBeTrue();
      expect(f().hidden()).withContext('name is hidden').toBeTrue();
      const actual = f.age().hidden();
      expect(actual).withContext('age is hidden').toBeTrue();
    });

    it('propagates touched state to parent', async () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
        adapter: new CompatFieldAdapter(),
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

      const f = compatForm(
        cat,
        (cat) => {
          // first cat required if last cat specified
          required(cat.name, {when: ({valueOf}) => valueOf(cat.age) !== 0});
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().submitting()).toBe(false);
      expect(f.age().submitting()).toBe(false);

      let resolvePromise: VoidFunction | undefined;

      const result = submit(f as any, () => {
        return new Promise((r) => {
          resolvePromise = r;
        });
      });

      expect(f().submitting()).toBe(true);
      expect(f.age().submitting()).toBe(true);

      expect(resolvePromise).toBeDefined();
      resolvePromise?.();

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
        adapter: new CompatFieldAdapter(),
      });

      expect(f.age().dirty()).withContext('age is initially not dirty').toBeFalse();
      expect(f().dirty()).withContext('form is initially not dirty').toBeFalse();

      control.markAsDirty();

      expect(f.age().dirty()).withContext('age is dirty, when control is dirty').toBeTrue();
      expect(f().dirty()).withContext('form is dirty which child is dirty').toBeTrue();

      control.markAsPristine();

      expect(f.age().dirty()).withContext('age is not dirty when marked as pristine').toBeFalse();
      expect(f().dirty())
        .withContext('age is not dirty when age is marked as pristine')
        .toBeFalse();

      f.age().markAsDirty();
      expect(f.age().dirty()).withContext('age is dirty, when control is dirty').toBeTrue();
      expect(f().dirty()).withContext('form is dirty which child is dirty').toBeTrue();
    });

    it('allows resetting state', () => {
      const control = new FormControl(5, Validators.min(3));
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
        adapter: new CompatFieldAdapter(),
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
        adapter: new CompatFieldAdapter(),
      });

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
      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
        adapter: new CompatFieldAdapter(),
      });

      // @ts-expect-error: meow
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
        adapter: new CompatFieldAdapter(),
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
          return valueOf(path.age) < 8 ? customError({kind: 'too small'}) : undefined;
        });
      },
      {
        injector: TestBed.inject(Injector),
        adapter: new CompatFieldAdapter(),
      },
    );

    expect(f.name().valid()).toBe(false);
    expect(f.name().errors()).toEqual([
      customError({
        kind: 'too small',
        field: f.name,
      }),
    ]);

    control.setValue(10);
    expect(f.name().valid()).toBe(true);
    f.age().value.set(4);
    expect(f.name().valid()).toBe(false);
  });

  describe('validation', () => {
    it('supports async validation', async () => {
      let resolve: Function = () => {};
      const formControl = new FormControl<number>(5, {
        nonNullable: true,
        asyncValidators: () => {
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
        adapter: new CompatFieldAdapter(),
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
        new ReactiveValidationError({kind: 'incorrect-cat', context: 123}),
      ]);
    });
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
        adapter: new CompatFieldAdapter(),
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
        adapter: new CompatFieldAdapter(),
      });

      expect(f().value()).toEqual({
        name: 'pirojok-the-cat',
        age: 10,
      });

      expect(f().valid()).toEqual(true);
    });

    it('is propagates validity', () => {
      const cat = signal(
        new FormGroup({
          name: new FormControl('pirojok-the-cat'),
          age: new FormControl(1, Validators.min(5)),
        }),
      );

      const f = compatForm(cat, {
        injector: TestBed.inject(Injector),
        adapter: new CompatFieldAdapter(),
      });

      expect(f().valid()).toEqual(false);
      expect(f().errors()).toEqual([]);
    });
  });

  it('returns an undefined if trying to access its children.', () => {
    const cat = signal(new FormControl('pirojok-the-cat'));

    const f = compatForm(cat, {
      injector: TestBed.inject(Injector),
      adapter: new CompatFieldAdapter(),
    });

    expect((f as any).value).toBe(undefined);
  });

  describe('non-compat form', () => {
    it('keeps things as is, and does not unwrap', () => {
      const control = new FormControl(5, {nonNullable: true, validators: [Validators.min(3)]});
      const cat = signal({
        name: 'pirojok-the-cat',
        age: control,
      });
      const f = form(
        cat,
        (path) => {
          required(path.name);

          validate(path.name, ({valueOf}) => {
            return valueOf(path.age) < 8 ? customError({kind: 'too small'}) : undefined;
          });
        },
        {
          injector: TestBed.inject(Injector),
        },
      );

      expect(f.age().value()).toEqual(control);
    });
  });
});
