/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  disabled,
  required,
  error,
  readonly,
  validate,
  validateTree,
  REQUIRED,
  FormTreeError,
  SchemaOrSchemaFn,
  apply,
  applyEach,
  form,
  submit,
} from '../public_api';

const noopSchema: SchemaOrSchemaFn<unknown> = () => {};

describe('FieldNode', () => {
  it('is untouched initially', () => {
    const f = form(
      signal({
        a: 1,
        b: 2,
      }),
      noopSchema,
      {injector: TestBed.inject(Injector)},
    );
    expect(f().touched()).toBe(false);
  });

  it('can get a child of a key that exists', () => {
    const f = form(
      signal({
        a: 1,
        b: 2,
      }),
      noopSchema,
      {injector: TestBed.inject(Injector)},
    );
    expect(f.a).toBeDefined();
    expect(f.a().value()).toBe(1);
  });

  describe('instances', () => {
    it('should get the same instance when asking for a child multiple times', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        noopSchema,
        {injector: TestBed.inject(Injector)},
      );
      const child = f.a;
      expect(f.a).toBe(child);
    });

    it('should get the same instance when asking for a child multiple times', () => {
      const value = signal<{a: number; b?: number}>({a: 1, b: 2});
      const f = form(value, noopSchema, {injector: TestBed.inject(Injector)});
      const child = f.a;
      value.set({a: 3});
      expect(f.a).toBe(child);
    });
  });

  it('cannot get a child of a key that does not exist', () => {
    const f = form(
      signal<{a: number; b: number; c?: number}>({
        a: 1,
        b: 2,
      }),
      noopSchema,
      {
        injector: TestBed.inject(Injector),
      },
    );
    expect(f.c).toBeUndefined();
  });

  it('can get a child inside of a computed', () => {
    const f = form(
      signal({
        a: 1,
        b: 2,
      }),
      noopSchema,
      {injector: TestBed.inject(Injector)},
    );
    const childA = computed(() => f.a);
    expect(childA()).toBeDefined();
  });

  it('can get a child inside of a computed', () => {
    const f = form(
      signal({
        a: 1,
        b: 2,
      }),
      noopSchema,
      {injector: TestBed.inject(Injector)},
    );
    const childA = computed(() => f.a);
    expect(childA()).toBeDefined();
  });

  describe('dirty', () => {
    it('is not dirty initially', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        noopSchema,
        {injector: TestBed.inject(Injector)},
      );
      expect(f().dirty()).toBe(false);
      expect(f.a().dirty()).toBe(false);
    });

    it('can be marked as dirty', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        noopSchema,
        {injector: TestBed.inject(Injector)},
      );
      expect(f().dirty()).toBe(false);

      f().markAsDirty();
      expect(f().dirty()).toBe(true);
    });

    it('propagates from the children', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        noopSchema,
        {injector: TestBed.inject(Injector)},
      );
      expect(f().dirty()).toBe(false);

      f.a().markAsDirty();
      expect(f().dirty()).toBe(true);
    });

    it('does not propagate down', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        noopSchema,
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().dirty()).toBe(false);
      f().markAsDirty();
      expect(f.a().dirty()).toBe(false);
    });

    it('does not consider children that get removed', () => {
      const value = signal<{a: number; b?: number}>({a: 1, b: 2});
      const f = form(value, noopSchema, {injector: TestBed.inject(Injector)});
      expect(f().dirty()).toBe(false);

      f.b!().markAsDirty();
      expect(f().dirty()).toBe(true);

      value.set({a: 2});
      expect(f().dirty()).toBe(false);
      expect(f.b).toBeUndefined();
    });
  });

  describe('touched', () => {
    it('is untouched initially', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        noopSchema,
        {injector: TestBed.inject(Injector)},
      );
      expect(f().touched()).toBe(false);
    });

    it('can be marked as touched', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        noopSchema,
        {injector: TestBed.inject(Injector)},
      );
      expect(f().touched()).toBe(false);

      f().markAsTouched();
      expect(f().touched()).toBe(true);
    });

    it('propagates from the children', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        noopSchema,
        {injector: TestBed.inject(Injector)},
      );
      expect(f().touched()).toBe(false);

      f.a().markAsTouched();
      expect(f().touched()).toBe(true);
    });

    it('does not propagate down', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        noopSchema,
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().touched()).toBe(false);
      f().markAsTouched();
      expect(f.a().touched()).toBe(false);
    });

    it('does not consider children that get removed', () => {
      const value = signal<{a: number; b?: number}>({a: 1, b: 2});
      const f = form(value, noopSchema, {injector: TestBed.inject(Injector)});
      expect(f().touched()).toBe(false);

      f.b!().markAsTouched();
      expect(f().touched()).toBe(true);

      value.set({a: 2});
      expect(f().touched()).toBe(false);
      expect(f.b).toBeUndefined();
    });
  });

  describe('arrays', () => {
    it('should only have child nodes for elements that exist', () => {
      const f = form(signal([1, 2]), noopSchema, {injector: TestBed.inject(Injector)});
      expect(f[0]).toBeDefined();
      expect(f[1]).toBeDefined();
      expect(f[2]).not.toBeDefined();
      expect(f['length']).toBe(2);
    });

    it('should get the element node', () => {
      const f = form(
        signal({names: [{name: 'Alex'}, {name: 'Miles'}]}),
        (p) => {
          applyEach(p.names, (a) => {
            disabled(a.name, ({value, fieldOf}) => {
              const el = fieldOf(a);
              expect(el().value().name).toBe(value());
              expect(fieldOf(p).names.findIndex((e: any) => e === el)).not.toBe(-1);
              return true;
            });
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      expect(f.names[0].name().disabled()).toBe(true);
      expect(f.names[1].name().disabled()).toBe(true);
    });

    it('should support element-level logic', () => {
      const f = form(
        signal([1, 2, 3]),
        (p) => {
          applyEach(p, (a) => {
            a;
            disabled(a, ({value}) => value() % 2 === 0);
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      expect(f[0]().disabled()).toBe(false);
      expect(f[1]().disabled()).toBe(true);
      expect(f[2]().disabled()).toBe(false);
    });

    it('should support dynamic elements', () => {
      const model = signal([1, 2, 3]);
      const f = form(
        model,
        (p) => {
          applyEach(p, (el) => {
            // Disabled if even.
            disabled(el, ({value}) => value() % 2 === 0);
          });
        },
        {injector: TestBed.inject(Injector)},
      );
      model.update((v) => [...v, 4]);
      expect(f[3]().disabled()).toBe(true);
    });

    it('should support removing elements', () => {
      const value = signal([1, 2, 3]);
      const f = form(value, noopSchema, {injector: TestBed.inject(Injector)});
      f[2]().markAsTouched();
      expect(f().touched()).toBe(true);

      value.set([1, 2]);
      expect(f().touched()).toBe(false);
    });

    describe('tracking', () => {
      it('maintains identity across value moves', () => {
        const value = signal([{name: 'Alex'}, {name: 'Kirill'}]);
        const f = form(value, noopSchema, {injector: TestBed.inject(Injector)});
        const alex = f[0];
        const kirill = f[1];

        value.update((old) => [old[1], old[0]]);

        expect(f[0] === kirill).toBeTrue();
        expect(f[1] === alex).toBeTrue();
      });

      it('maintains identity across value update', () => {
        const value = signal([{name: 'Alex'}, {name: 'Kirill'}]);
        const f = form(value, noopSchema, {injector: TestBed.inject(Injector)});
        const alex = f[0];
        const kirill = f[1];

        value.update((old) => [old[1], {...old[0], name: 'Pawel'}]);

        expect(f[0] === kirill).toBeTrue();
        expect(f[1] === alex).toBeTrue();
      });
    });
  });

  describe('disabled', () => {
    it('should allow logic to make a node disabled', () => {
      const f = form(
        signal({a: 1, b: 2}),
        (p) => {
          disabled(p.a, ({value}) => value() !== 2);
        },
        {injector: TestBed.inject(Injector)},
      );
      const a = f.a;
      expect(f().disabled()).toBe(false);
      expect(a().disabled()).toBe(true);
      expect(a().disabledReasons()).toEqual([{field: f.a}]);

      a().value.set(2);
      expect(f().disabled()).toBe(false);
      expect(a().disabled()).toBe(false);
    });

    it('should disable with reason', () => {
      const f = form(
        signal({a: 1, b: 2}),
        (p) => {
          disabled(p.a, () => 'a cannot be changed');
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().disabled()).toBe(true);
      expect(f.a().disabledReasons()).toEqual([
        {
          field: f.a,
          reason: 'a cannot be changed',
        },
      ]);
    });

    it('should not have disabled reason if not disabled', () => {
      const f = form(
        signal({a: 1, b: 2}),
        (p) => {
          disabled(p.a, ({value}) => (value() > 5 ? 'a cannot be changed' : false));
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().disabled()).toBe(false);
      expect(f.a().disabledReasons()).toEqual([]);

      f.a().value.set(6);

      expect(f.a().disabled()).toBe(true);
      expect(f.a().disabledReasons()).toEqual([
        {
          field: f.a,
          reason: 'a cannot be changed',
        },
      ]);
    });

    it('disabled reason should propagate to children', () => {
      const f = form(
        signal({a: 1, b: 2}),
        (p) => {
          disabled(p, () => 'form unavailable');
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().disabled()).toBe(true);
      expect(f().disabledReasons()).toEqual([
        {
          field: f,
          reason: 'form unavailable',
        },
      ]);
      expect(f.a().disabled()).toBe(true);
      expect(f.a().disabledReasons()).toEqual([
        {
          field: f,
          reason: 'form unavailable',
        },
      ]);
    });
  });

  describe('readonly', () => {
    it('should allow logic to make a field readonly', () => {
      const f = form(
        signal({a: 1, b: 2}),
        (p) => {
          readonly(p.a);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().readonly()).toBe(false);
      expect(f.a().readonly()).toBe(true);
      expect(f.b().readonly()).toBe(false);
    });

    it('should allow logic to make a field conditionally readonly', () => {
      const f = form(
        signal({a: 1, b: 2}),
        (p) => {
          readonly(p.a, ({value}) => value() > 10);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().readonly()).toBe(false);

      f.a().value.set(11);
      expect(f.a().readonly()).toBe(true);
    });

    it('should make children of readonly parent readonly', () => {
      const f = form(
        signal({a: 1, b: 2}),
        (p) => {
          readonly(p);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().readonly()).toBe(true);
      expect(f.a().readonly()).toBe(true);
      expect(f.b().readonly()).toBe(true);
    });

    it('should not validate readonly fields', () => {
      const isReadonly = signal(false);
      const f = form(
        signal(''),
        (p) => {
          readonly(p, isReadonly);
          required(p);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().metadata(REQUIRED)()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().readonly()).toBe(false);

      isReadonly.set(true);
      expect(f().metadata(REQUIRED)()).toBe(true);
      expect(f().valid()).toBe(true);
      expect(f().readonly()).toBe(true);
    });
  });

  describe('validation', () => {
    it('should validate field', () => {
      const f = form(
        signal({a: 1, b: 2}),
        (p) => {
          validate(p.a, ({value}) => {
            if (value() > 10) {
              return {kind: 'too damn high'};
            }
            return undefined;
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().errors()).toEqual([]);
      expect(f.a().valid()).toBe(true);
      expect(f.a().errors()).toEqual([]);
      expect(f().valid()).toBe(true);

      f.a().value.set(11);
      expect(f.a().errors()).toEqual([{kind: 'too damn high'}]);
      expect(f.a().valid()).toBe(false);
      expect(f().errors()).toEqual([]);
      expect(f().valid()).toBe(false);
    });

    it('should validate with multiple errors', () => {
      const f = form(
        signal({a: 1, b: 2}),
        (p) => {
          validate(p.a, ({value}) => {
            if (value() > 10) {
              return [{kind: 'too damn high'}, {kind: 'bad'}];
            }
            return undefined;
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().errors()).toEqual([]);
      expect(f.a().valid()).toBe(true);

      f.a().value.set(11);
      expect(f.a().errors()).toEqual([{kind: 'too damn high'}, {kind: 'bad'}]);
      expect(f.a().valid()).toBe(false);
    });

    it('should validate with shorthand syntax', () => {
      const f = form(
        signal({a: 1, b: 2}),
        (p) => {
          error(p.a, ({value}) => value() > 1);
          error(p.a, ({value}) => value() > 10, 'too damn high');
          error(
            p.a,
            ({value}) => value() > 100,
            ({value}) => `${value()} is much too high`,
          );
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().errors()).toEqual([]);
      expect(f.a().valid()).toBe(true);

      f.a().value.set(2);
      expect(f.a().errors()).toEqual([{kind: 'custom'}]);
      expect(f.a().valid()).toBe(false);

      f.a().value.set(11);
      expect(f.a().errors()).toEqual([
        {kind: 'custom'},
        {kind: 'custom', message: 'too damn high'},
      ]);
      expect(f.a().valid()).toBe(false);

      f.a().value.set(101);
      expect(f.a().errors()).toEqual([
        {kind: 'custom'},
        {kind: 'custom', message: 'too damn high'},
        {kind: 'custom', message: '101 is much too high'},
      ]);
      expect(f.a().valid()).toBe(false);
    });

    it('should validate required field', () => {
      const data = signal({first: '', last: ''});
      const f = form(
        data,
        (name) => {
          required(name.first);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.first().errors()).toEqual([{kind: 'required'}]);
      expect(f.first().valid()).toBe(false);
      expect(f.first().metadata(REQUIRED)()).toBe(true);

      f.first().value.set('Bob');

      expect(f.first().errors()).toEqual([]);
      expect(f.first().valid()).toBe(true);
      expect(f.first().metadata(REQUIRED)()).toBe(true);
    });

    it('should validate conditionally required field', () => {
      const data = signal({first: '', last: ''});
      const f = form(
        data,
        (name) => {
          // first name required if last name specified
          required(name.first, {when: ({valueOf}) => valueOf(name.last) !== ''});
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.first().errors()).toEqual([]);
      expect(f.first().valid()).toBe(true);
      expect(f.first().metadata(REQUIRED)()).toBe(false);

      f.last().value.set('Loblaw');

      expect(f.first().errors()).toEqual([{kind: 'required'}]);
      expect(f.first().valid()).toBe(false);
      expect(f.first().metadata(REQUIRED)()).toBe(true);

      f.first().value.set('Bob');

      expect(f.first().errors()).toEqual([]);
      expect(f.first().valid()).toBe(true);
      expect(f.first().metadata(REQUIRED)()).toBe(true);
    });

    it('should support custom empty predicate', () => {
      const data = signal({name: '', quantity: 0});
      const f = form(
        data,
        (item) => {
          required(item.quantity, {emptyPredicate: (value) => value === 0});
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.quantity().metadata(REQUIRED)()).toBe(true);
      expect(f.quantity().errors()).toEqual([{kind: 'required'}]);

      f.quantity().value.set(1);
      expect(f.quantity().metadata(REQUIRED)()).toBe(true);
      expect(f.quantity().errors()).toEqual([]);
    });

    it('should link required error messages to their predicate', () => {
      const data = signal({country: '', amount: 0, name: ''});
      const f = form(
        data,
        (tx) => {
          required(tx.name, {
            when: ({valueOf}) => valueOf(tx.country) === 'USA',
            errors: () => ({
              kind: 'required',
              message: 'Name is required in your country',
            }),
          });
          required(tx.name, {
            when: ({valueOf}) => valueOf(tx.amount) >= 1000,
            errors: () => ({
              kind: 'required',
              message: 'Name is required for large transactions',
            }),
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().errors()).toEqual([]);

      f.country().value.set('USA');
      expect(f.name().errors()).toEqual([
        {kind: 'required', message: 'Name is required in your country'},
      ]);

      f.amount().value.set(1000);
      expect(f.name().errors()).toEqual([
        {kind: 'required', message: 'Name is required in your country'},
        {kind: 'required', message: 'Name is required for large transactions'},
      ]);

      f.country().value.set('Canada');
      expect(f.name().errors()).toEqual([
        {kind: 'required', message: 'Name is required for large transactions'},
      ]);

      f.amount().value.set(100);
      expect(f.name().errors()).toEqual([]);
    });

    describe('tree validation', () => {
      it('should push errors to children', () => {
        const cat = signal({name: 'Fluffy', age: 5});
        const f = form(
          cat,
          (p) => {
            validateTree(p, ({value, fieldOf}) => {
              const errors: FormTreeError[] = [];
              if (value().name.length > 8) {
                errors.push({kind: 'long_name', field: fieldOf(p.name)});
              }
              if (value().age < 0) {
                errors.push({kind: 'temporal_anomaly', field: fieldOf(p.age)});
              }
              return errors;
            });
          },
          {injector: TestBed.inject(Injector)},
        );

        expect(f.name().errors()).toEqual([]);
        expect(f.age().errors()).toEqual([]);

        f.age().value.set(-10);

        expect(f.name().errors()).toEqual([]);
        expect(f.age().errors()).toEqual([jasmine.objectContaining({kind: 'temporal_anomaly'})]);

        cat.set({name: 'Fluffy McFluffington', age: 10});
        expect(f.name().errors()).toEqual([jasmine.objectContaining({kind: 'long_name'})]);
        expect(f.age().errors()).toEqual([]);
      });

      it('should push errors to children async', () => {
        const cat = signal({name: 'Fluffy', age: 5});
        const f = form(
          cat,
          (p) => {
            validateTree(p, ({value, fieldOf}) => {
              const errors: FormTreeError[] = [];
              if (value().name.length > 8) {
                errors.push({kind: 'long_name', field: fieldOf(p.name)});
              }
              if (value().age < 0) {
                errors.push({kind: 'temporal_anomaly', field: fieldOf(p.age)});
              }
              return errors;
            });
          },
          {injector: TestBed.inject(Injector)},
        );

        expect(f.name().errors()).toEqual([]);
        expect(f.age().errors()).toEqual([]);

        f.age().value.set(-10);

        expect(f.name().errors()).toEqual([]);
        expect(f.age().errors()).toEqual([jasmine.objectContaining({kind: 'temporal_anomaly'})]);

        cat.set({name: 'Fluffy McFluffington', age: 10});
        expect(f.name().errors()).toEqual([jasmine.objectContaining({kind: 'long_name'})]);
        expect(f.age().errors()).toEqual([]);
      });
    });
  });

  describe('submit', () => {
    it('maps errors to a field', async () => {
      const data = signal({first: '', last: ''});
      const f = form(
        data,
        (name) => {
          // first name required if last name specified
          required(name.first, {when: ({valueOf}) => valueOf(name.last) !== ''});
        },
        {injector: TestBed.inject(Injector)},
      );

      await submit(f, (form) => {
        return Promise.resolve([
          {
            field: form.last,
            error: {kind: 'lastName'},
          },
        ]);
      });

      expect(f.last().errors()).toEqual([{kind: 'lastName'}]);
    });

    it('maps errors to a field', async () => {
      const initialValue = {first: 'meow', last: 'wuf'};
      const data = signal(initialValue);
      const f = form(
        data,
        (name) => {
          // first name required if last name specified
          required(name.first, {when: ({valueOf}) => valueOf(name.last) !== ''});
        },
        {injector: TestBed.inject(Injector)},
      );

      const submitSpy = jasmine.createSpy('submit');

      await submit(f, (form) => {
        submitSpy(form().value());
        return Promise.resolve();
      });

      expect(submitSpy).toHaveBeenCalledWith(initialValue);
    });

    it('marks the form as submitting', async () => {
      const initialValue = {first: 'meow', last: 'wuf'};
      const data = signal(initialValue);
      const f = form(
        data,
        (name) => {
          // first name required if last name specified
          required(name.first, {when: ({valueOf}) => valueOf(name.last) !== ''});
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().submittedStatus()).toBe('unsubmitted');

      let resolvePromise: VoidFunction | undefined;

      const result = submit(f, () => {
        return new Promise((r) => {
          resolvePromise = r;
        });
      });

      expect(f().submittedStatus()).toBe('submitting');

      expect(resolvePromise).toBeDefined();
      resolvePromise?.();

      await result;
      expect(f().submittedStatus()).toBe('submitted');

      f().resetSubmittedStatus();
      expect(f().submittedStatus()).toBe('unsubmitted');
    });

    it('works on child fields', async () => {
      const initialValue = {first: 'meow', last: 'wuf'};
      const data = signal(initialValue);
      const f = form(
        data,
        (name) => {
          // first name required if last name specified
          required(name.first, {
            when: ({valueOf}) => valueOf(name.last) !== '',
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      const submitSpy = jasmine.createSpy('submit');

      await submit(f.first, (form) => {
        submitSpy(form().value());
        return Promise.resolve([
          {
            field: form,
            error: {kind: 'lastName'},
          },
        ]);
      });

      expect(submitSpy).toHaveBeenCalledWith('meow');
    });
  });

  describe('composition', () => {
    it('should apply schema to field', () => {
      interface Address {
        street: string;
        city: string;
      }

      const addressSchema: SchemaOrSchemaFn<Address> = (p) => {
        disabled(p.street, () => true);
      };

      const data = signal<{name: string; address: Address}>({
        name: '',
        address: {street: '', city: ''},
      });

      const f = form(
        data,
        (p) => {
          apply(p.address, addressSchema);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.address.street().disabled()).toBe(true);
    });
  });
});
