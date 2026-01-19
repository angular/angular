/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, effect, Injector, signal, WritableSignal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  apply,
  applyEach,
  debounce,
  disabled,
  form,
  FormField,
  hidden,
  readonly,
  required,
  requiredError,
  Schema,
  schema,
  SchemaOrSchemaFn,
  SchemaPath,
  SchemaPathTree,
  validate,
  validateTree,
  ValidationError,
} from '../../public_api';
import {SchemaImpl} from '../../src/schema/schema';

describe('FieldNode', () => {
  it('can get a child of a key that exists', () => {
    const f = form(
      signal({
        a: 1,
        b: 2,
      }),
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
        {injector: TestBed.inject(Injector)},
      );
      const child = f.a;
      expect(f.a).toBe(child);
    });

    it('should get the same instance when asking for a child multiple times', () => {
      const value = signal<{a: number; b?: number}>({a: 1, b: 2});
      const f = form(value, {injector: TestBed.inject(Injector)});
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
      {injector: TestBed.inject(Injector)},
    );
    const childA = computed(() => f.a);
    expect(childA()).toBeDefined();
  });

  describe('resetting', () => {
    it('can be reset with a value', () => {
      const model = signal({a: 1, b: 2});
      const f = form(model, {injector: TestBed.inject(Injector)});
      f.a().markAsDirty();
      f.a().markAsTouched();

      f().reset({a: 5, b: 8});
      expect(f.a().value()).toBe(5);
      expect(f.a().dirty()).toBe(false);
      expect(f.a().touched()).toBe(false);
    });

    it('can be reset without a value', () => {
      const model = signal({a: 1, b: 2});
      const f = form(model, {injector: TestBed.inject(Injector)});

      f().reset();
      expect(f.a().value()).toBe(1);
    });

    it('can reset with empty string', () => {
      const model = signal('hello');
      const f = form(model, {injector: TestBed.inject(Injector)});
      f().reset('');
      expect(f().value()).toBe('');
    });

    it('can reset with false', () => {
      const model = signal(true);
      const f = form(model, {injector: TestBed.inject(Injector)});
      f().reset(false);
      expect(f().value()).toBe(false);
    });

    it('can reset with null', () => {
      const model: WritableSignal<string | null> = signal('hello');
      const f = form(model, {injector: TestBed.inject(Injector)});
      f().reset(null);
      expect(f().value()).toBeNull();
    });

    it('can reset with 0', () => {
      const model = signal(5);
      const f = form(model, {injector: TestBed.inject(Injector)});
      f().reset(0);
      expect(f().value()).toBe(0);
    });

    it('can reset with NaN', () => {
      const model = signal(5);
      const f = form(model, {injector: TestBed.inject(Injector)});
      f().reset(NaN);
      expect(f().value()).toBeNaN();
    });
  });

  describe('dirty', () => {
    it('is not dirty initially', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
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
        {injector: TestBed.inject(Injector)},
      );
      expect(f().dirty()).toBe(false);

      f().markAsDirty();
      expect(f().dirty()).toBe(true);
    });

    it('can be reset', () => {
      const model = signal({a: 1, b: 2});
      const f = form(model, {injector: TestBed.inject(Injector)});
      f().markAsDirty();
      expect(f().dirty()).toBe(true);

      f().reset();
      expect(f().dirty()).toBe(false);
    });

    it('propagates from the children', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
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
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().dirty()).toBe(false);
      f().markAsDirty();
      expect(f.a().dirty()).toBe(false);
    });

    it('does not consider children that get removed', () => {
      const value = signal<{a: number; b?: number}>({a: 1, b: 2});
      const f = form(value, {injector: TestBed.inject(Injector)});
      expect(f().dirty()).toBe(false);

      f.b!().markAsDirty();
      expect(f().dirty()).toBe(true);

      value.set({a: 2});
      expect(f().dirty()).toBe(false);
      expect(f.b).toBeUndefined();
    });

    it('should not be marked as dirty when is readonly', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        (p) => {
          readonly(p);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().dirty()).toBe(false);

      f().markAsDirty();
      expect(f().dirty()).toBe(false);
    });
    it('should not be marked as dirty when is disabled', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        (p) => {
          disabled(p);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().dirty()).toBe(false);

      f().markAsDirty();
      expect(f().dirty()).toBe(false);
    });

    it('should not be marked as dirty when is hidden', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        (p) => {
          hidden(p, () => true);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().dirty()).toBe(false);

      f().markAsDirty();

      expect(f().dirty()).toBe(false);
    });

    it('should be marked as dirty when not readonly', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        {injector: TestBed.inject(Injector)},
      );

      expect(f().dirty()).toBe(false);

      f().markAsDirty();
      expect(f().dirty()).toBe(true);
    });

    it('should be marked as dirty when not disabled', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        {injector: TestBed.inject(Injector)},
      );

      expect(f().dirty()).toBe(false);

      f().markAsDirty();
      expect(f().dirty()).toBe(true);
    });

    it('should be marked as dirty when not hidden', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        {injector: TestBed.inject(Injector)},
      );

      expect(f().dirty()).toBe(false);

      f().markAsDirty();
      expect(f().dirty()).toBe(true);
    });

    it('should become pristine when field becomes non-interactive after being marked dirty', () => {
      const isReadonly = signal(false);
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        (p) => {
          readonly(p, isReadonly);
        },
        {injector: TestBed.inject(Injector)},
      );

      // Initially interactive and not dirty
      expect(f().readonly()).toBe(false);
      expect(f().dirty()).toBe(false);

      // Mark as dirty while interactive
      f().markAsDirty();
      expect(f().dirty()).toBe(true);

      // Make non-interactive, should become pristine
      isReadonly.set(true);
      expect(f().readonly()).toBe(true);
      expect(f().dirty()).toBe(false);

      // Make interactive again, should still be dirty
      isReadonly.set(false);
      expect(f().readonly()).toBe(false);
      expect(f().dirty()).toBe(true);
    });
  });

  describe('touched', () => {
    it('is untouched initially', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
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
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().touched()).toBe(false);
      f().markAsTouched();
      expect(f.a().touched()).toBe(false);
    });

    it('does not consider children that get removed', () => {
      const value = signal<{a: number; b?: number}>({a: 1, b: 2});
      const f = form(value, {injector: TestBed.inject(Injector)});
      expect(f().touched()).toBe(false);

      f.b!().markAsTouched();
      expect(f().touched()).toBe(true);

      value.set({a: 2});
      expect(f().touched()).toBe(false);
      expect(f.b).toBeUndefined();
    });

    it('can be reset', () => {
      const model = signal({a: 1, b: 2});
      const f = form(model, {injector: TestBed.inject(Injector)});
      f().markAsTouched();
      expect(f().touched()).toBe(true);

      f().reset();
      expect(f().touched()).toBe(false);
    });

    it('reset should not track model changes', () => {
      const f = form(signal(''), {injector: TestBed.inject(Injector)});
      const spy = jasmine.createSpy();
      effect(
        () => {
          spy();
          f().reset();
        },
        {injector: TestBed.inject(Injector)},
      );

      TestBed.tick();
      expect(spy).toHaveBeenCalledTimes(1);

      f().value.set('hi');

      TestBed.tick();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not be marked as touched when is readonly', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        (p) => {
          readonly(p);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().touched()).toBe(false);

      f().markAsTouched();
      expect(f().touched()).toBe(false);
    });
    it('should not be marked as touched when is disabled', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        (p) => {
          disabled(p);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().touched()).toBe(false);

      f().markAsTouched();
      expect(f().touched()).toBe(false);
    });

    it('should not be marked as touched when is hidden', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        (p) => {
          hidden(p, () => true);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().touched()).toBe(false);

      f().markAsTouched();

      expect(f().touched()).toBe(false);
    });

    it('should be marked as touched when not readonly', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        {injector: TestBed.inject(Injector)},
      );

      expect(f().touched()).toBe(false);

      f().markAsTouched();
      expect(f().touched()).toBe(true);
    });

    it('should be marked as touched when not disabled', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        {injector: TestBed.inject(Injector)},
      );

      expect(f().touched()).toBe(false);

      f().markAsTouched();
      expect(f().touched()).toBe(true);
    });

    it('should be marked as touched when not hidden', () => {
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        {injector: TestBed.inject(Injector)},
      );

      expect(f().touched()).toBe(false);

      f().markAsTouched();
      expect(f().touched()).toBe(true);
    });

    it('should become untouched when field becomes non-interactive after being marked touched', () => {
      const isHidden = signal(false);
      const f = form(
        signal({
          a: 1,
          b: 2,
        }),
        (p) => {
          hidden(p, isHidden);
        },
        {injector: TestBed.inject(Injector)},
      );

      // Initially interactive and not touched
      expect(f().hidden()).toBe(false);
      expect(f().touched()).toBe(false);

      // Mark as touched while interactive
      f().markAsTouched();
      expect(f().touched()).toBe(true);

      // Make non-interactive, should become untouched
      isHidden.set(true);
      expect(f().hidden()).toBe(true);
      expect(f().touched()).toBe(false);

      // Make interactive again, should still be touched
      isHidden.set(false);
      expect(f().hidden()).toBe(false);
      expect(f().touched()).toBe(true);
    });

    it('should flush pending control value sync on touch', () => {
      const product = {
        id: 'a',
        name: 'a',
        displayName: 'A',
        imgUrl: 'https://a.png',
      };
      const myForm = form(
        signal(product),
        (p) => {
          debounce(p.name, () => new Promise(() => {}));
        },
        {injector: TestBed.inject(Injector)},
      );

      myForm.name().markAsTouched();
      // Same object identity because there was no change to flush to the name.
      expect(myForm().value()).toBe(product);

      myForm.name().setControlValue('b');
      // Same object identity because the name change is still pending.
      expect(myForm().value()).toBe(product);

      myForm.name().markAsTouched();
      // Different object identity because the name change was flushed.
      expect(myForm().value()).not.toBe(product);
    });
  });

  describe('arrays', () => {
    it('should only have child nodes for elements that exist', () => {
      const f = form(signal([1, 2]), {injector: TestBed.inject(Injector)});
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
            disabled(a.name, ({value, fieldTreeOf}) => {
              const el = fieldTreeOf(a);
              expect(el().value().name).toBe(value());
              expect([...fieldTreeOf(p).names].findIndex((e: any) => e === el)).not.toBe(-1);
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
      const f = form(value, {injector: TestBed.inject(Injector)});
      f[2]().markAsTouched();
      expect(f().touched()).toBe(true);

      value.set([1, 2]);
      expect(f().touched()).toBe(false);
    });

    describe('tracking', () => {
      it('maintains identity across value moves', () => {
        const value = signal([{name: 'Alex'}, {name: 'Kirill'}]);
        const f = form(value, {injector: TestBed.inject(Injector)});
        const alex = f[0];
        const kirill = f[1];

        value.update((old) => [old[1], old[0]]);

        expect(f[0] === kirill).toBeTrue();
        expect(f[1] === alex).toBeTrue();
      });

      it('maintains identity across value update', () => {
        const value = signal([{name: 'Alex'}, {name: 'Kirill'}]);
        const f = form(value, {injector: TestBed.inject(Injector)});
        const alex = f[0];
        const kirill = f[1];

        value.update((old) => [old[1], {...old[0], name: 'Pawel'}]);

        expect(f[0] === kirill).toBeTrue();
        expect(f[1] === alex).toBeTrue();
      });

      it('uses index as identity for primitive values', () => {
        const value = signal([1, 'two']);
        const f = form(value, {injector: TestBed.inject(Injector)});
        const first = f[0];
        const second = f[1];

        value.update((old) => [old[1], old[0]]);

        expect(f[0] === first).toBeTrue();
        expect(f[1] === second).toBeTrue();
      });

      it('uses index as identity for array values', () => {
        const value = signal([[1], ['two']]);
        const f = form(value, {injector: TestBed.inject(Injector)});
        const first = f[0];
        const second = f[1];

        value.update((old) => [old[1], old[0]]);

        expect(f[0] === first).toBeTrue();
        expect(f[1] === second).toBeTrue();
      });
    });
  });

  describe('names', () => {
    it('auto-generates a name for the form', () => {
      const f = form(signal({}), {injector: TestBed.inject(Injector)});
      expect(f().name()).toMatch(/^a.form\d+$/);
    });

    it('uses a specific name for the form when given', () => {
      const f = form(signal({}), {injector: TestBed.inject(Injector), name: 'test'});
      expect(f().name()).toBe('test');
    });

    it('derives child field names from parents', () => {
      const f = form(signal({user: {firstName: 'Alex'}}), {
        injector: TestBed.inject(Injector),
        name: 'test',
      });
      expect(f.user().name()).toBe('test.user');
      expect(f.user.firstName().name()).toBe('test.user.firstName');
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
      expect(a().disabledReasons()).toEqual([{fieldTree: f.a}]);

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
          fieldTree: f.a,
          message: 'a cannot be changed',
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
          fieldTree: f.a,
          message: 'a cannot be changed',
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
          fieldTree: f,
          message: 'form unavailable',
        },
      ]);
      expect(f.a().disabled()).toBe(true);
      expect(f.a().disabledReasons()).toEqual([
        {
          fieldTree: f,
          message: 'form unavailable',
        },
      ]);
    });

    it('should disable unconditionally', () => {
      const f = form(
        signal({a: '', b: ''}),
        (p) => {
          disabled(p.a);
          disabled(p.b, 'disabled!');
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().disabledReasons()).toEqual([
        {
          fieldTree: f.a,
        },
      ]);
      expect(f.b().disabledReasons()).toEqual([
        {
          fieldTree: f.b,
          message: 'disabled!',
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

      expect(f().required()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().readonly()).toBe(false);

      isReadonly.set(true);
      expect(f().required()).toBe(true);
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
              return {kind: 'too-damn-high'};
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
      expect(f.a().errors()).toEqual([{kind: 'too-damn-high', fieldTree: f.a}]);
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
              return [{kind: 'too-damn-high'}, {kind: 'bad'}];
            }
            return undefined;
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().errors()).toEqual([]);
      expect(f.a().valid()).toBe(true);

      f.a().value.set(11);
      expect(f.a().errors()).toEqual([
        {kind: 'too-damn-high', fieldTree: f.a},
        {kind: 'bad', fieldTree: f.a},
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

      expect(f.first().errors()).toEqual([requiredError({fieldTree: f.first})]);
      expect(f.first().valid()).toBe(false);
      expect(f.first().required()).toBe(true);

      f.first().value.set('Bob');

      expect(f.first().errors()).toEqual([]);
      expect(f.first().valid()).toBe(true);
      expect(f.first().required()).toBe(true);
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
      expect(f.first().required()).toBe(false);

      f.last().value.set('Loblaw');

      expect(f.first().errors()).toEqual([requiredError({fieldTree: f.first})]);
      expect(f.first().valid()).toBe(false);
      expect(f.first().required()).toBe(true);

      f.first().value.set('Bob');

      expect(f.first().errors()).toEqual([]);
      expect(f.first().valid()).toBe(true);
      expect(f.first().required()).toBe(true);
    });

    it('should link required error messages to their predicate', () => {
      const data = signal({country: '', amount: 0, name: ''});
      const f = form(
        data,
        (tx) => {
          required(tx.name, {
            when: ({valueOf}) => valueOf(tx.country) === 'USA',
            error: requiredError({message: 'Name is required in your country'}),
          });
          required(tx.name, {
            when: ({valueOf}) => valueOf(tx.amount) >= 1000,
            error: requiredError({
              message: 'Name is required for large transactions',
            }),
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.name().errors()).toEqual([]);

      f.country().value.set('USA');
      expect(f.name().errors()).toEqual([
        requiredError({
          message: 'Name is required in your country',
          fieldTree: f.name,
        }),
      ]);

      f.amount().value.set(1000);
      expect(f.name().errors()).toEqual([
        requiredError({
          message: 'Name is required in your country',
          fieldTree: f.name,
        }),
        requiredError({
          message: 'Name is required for large transactions',
          fieldTree: f.name,
        }),
      ]);

      f.country().value.set('Canada');
      expect(f.name().errors()).toEqual([
        requiredError({
          message: 'Name is required for large transactions',
          fieldTree: f.name,
        }),
      ]);

      f.amount().value.set(100);
      expect(f.name().errors()).toEqual([]);
    });

    it('should allow validate logic to return null to indicate no error', () => {
      const f = form(
        signal({a: 1, b: 2}),
        (p) => {
          validate(p.a, ({value}) => (value() > 1 ? {kind: 'error'} : null));
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.a().errors()).toEqual([]);
      expect(f.a().valid()).toBe(true);

      f.a().value.set(2);
      expect(f.a().errors()).toEqual([{kind: 'error', fieldTree: f.a}]);
      expect(f.a().valid()).toBe(false);
    });

    describe('tree validation', () => {
      it('should push errors to children', () => {
        const cat = signal({name: 'Fluffy', age: 5});
        const f = form(
          cat,
          (p) => {
            validateTree(p, ({value, fieldTreeOf}) => {
              const errors: ValidationError.WithOptionalFieldTree[] = [];
              if (value().name.length > 8) {
                errors.push({kind: 'long_name', fieldTree: fieldTreeOf(p.name)});
              }
              if (value().age < 0) {
                errors.push({kind: 'temporal_anomaly', fieldTree: fieldTreeOf(p.age)});
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
        expect(f.age().errors()).toEqual([{kind: 'temporal_anomaly', fieldTree: f.age}]);

        cat.set({name: 'Fluffy McFluffington', age: 10});
        expect(f.name().errors()).toEqual([{kind: 'long_name', fieldTree: f.name}]);
        expect(f.age().errors()).toEqual([]);
      });

      it('should push errors to children async', () => {
        const cat = signal({name: 'Fluffy', age: 5});
        const f = form(
          cat,
          (p) => {
            validateTree(p, ({value, fieldTreeOf}) => {
              const errors: ValidationError.WithOptionalFieldTree[] = [];
              if (value().name.length > 8) {
                errors.push({kind: 'long_name', fieldTree: fieldTreeOf(p.name)});
              }
              if (value().age < 0) {
                errors.push({kind: 'temporal_anomaly', fieldTree: fieldTreeOf(p.age)});
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
        expect(f.age().errors()).toEqual([{kind: 'temporal_anomaly', fieldTree: f.age}]);

        cat.set({name: 'Fluffy McFluffington', age: 10});
        expect(f.name().errors()).toEqual([{kind: 'long_name', fieldTree: f.name}]);
        expect(f.age().errors()).toEqual([]);
      });
    });
  });

  describe('errorSummary', () => {
    it('should be empty', () => {
      const data = signal({});
      const f = form(data, {injector: TestBed.inject(Injector)});

      expect(f().errorSummary()).toEqual([]);
    });

    it('should contain errors from current field', () => {
      const data = signal('');
      const f = form(
        data,
        (p) => {
          required(p);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().errorSummary()).toEqual([requiredError({fieldTree: f})]);
    });

    it('should contain errors from child fields', () => {
      const name = signal({first: '', last: ''});
      const f = form(
        name,
        (p) => {
          required(p.first);
          required(p.last);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f().errorSummary()).toEqual([
        requiredError({fieldTree: f.first}),
        requiredError({fieldTree: f.last}),
      ]);
    });

    it('should accumulate errors of all descendants', () => {
      const data = signal({
        child: {
          child: {},
        },
      });
      const f = form(
        data,
        (p) => {
          validate(p, () => ({kind: 'root'}));
          validate(p.child, () => ({kind: 'child'}));
          validate(p.child.child, () => ({kind: 'grandchild'}));
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.child.child().errorSummary()).toEqual([
        {kind: 'grandchild', fieldTree: f.child.child},
      ]);
      expect(f.child().errorSummary()).toEqual([
        {kind: 'child', fieldTree: f.child},
        {kind: 'grandchild', fieldTree: f.child.child},
      ]);
      expect(f().errorSummary()).toEqual([
        {kind: 'root', fieldTree: f},
        {kind: 'child', fieldTree: f.child},
        {kind: 'grandchild', fieldTree: f.child.child},
      ]);
    });

    it('should sort errors by DOM position', async () => {
      @Component({
        template: `
          <input [formField]="f.b" />
          <input [formField]="f.a" />
        `,
        imports: [FormField],
      })
      class TestCmp {
        f = form(signal({a: '', b: ''}), (p) => {
          validate(p.a, () => ({kind: 'error-a'}));
          validate(p.b, () => ({kind: 'error-b'}));
        });
      }

      const fixture = TestBed.createComponent(TestCmp);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();

      expect(cmp.f().errorSummary()).toEqual([
        jasmine.objectContaining({kind: 'error-b'}),
        jasmine.objectContaining({kind: 'error-a'}),
      ]);
    });

    it('should sort bound errors before unbound errors', () => {
      @Component({
        template: ` <input [formField]="f.a" /> `,
        imports: [FormField],
      })
      class TestCmp {
        f = form(signal({a: '', b: ''}), (p) => {
          validate(p.a, () => ({kind: 'error-a'}));
          validate(p.b, () => ({kind: 'error-b'}));
        });
      }

      const fixture = TestBed.createComponent(TestCmp);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();

      expect(cmp.f().errorSummary()).toEqual([
        jasmine.objectContaining({kind: 'error-a'}),
        jasmine.objectContaining({kind: 'error-b'}),
      ]);
    });

    it('should sort errors from nested fields by DOM position', () => {
      @Component({
        template: `
          <input [formField]="f.group.child" />
          <input [formField]="f.other" />
        `,
        imports: [FormField],
      })
      class TestCmp {
        f = form(signal({group: {child: ''}, other: ''}), (p) => {
          validate(p.group.child, () => ({kind: 'child'}));
          validate(p.other, () => ({kind: 'other'}));
        });
      }

      const fixture = TestBed.createComponent(TestCmp);
      const cmp = fixture.componentInstance;
      fixture.detectChanges();

      expect(cmp.f().errorSummary()).toEqual([
        jasmine.objectContaining({kind: 'child'}),
        jasmine.objectContaining({kind: 'other'}),
      ]);
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

  describe('predefined schema', () => {
    it('should compile schema once per form', () => {
      const opts = {injector: TestBed.inject(Injector)};
      const subFn = jasmine.createSpy('schemaFn');
      const sub: Schema<string> = schema(subFn);
      const s = schema((p: SchemaPathTree<{a: string; b: string}>) => {
        apply(p.a, sub);
        apply(p.b, sub);
      });
      expect(subFn).toHaveBeenCalledTimes(0);

      form(signal({a: '', b: ''}), s, opts);
      expect(subFn).toHaveBeenCalledTimes(1);

      form(signal({a: '', b: ''}), s, opts);
      expect(subFn).toHaveBeenCalledTimes(2);
    });

    it('should resolve predefined schema paths within the local context', () => {
      const s = schema<{a: string; b: string}>((p) => {
        disabled(p.b, ({valueOf}) => valueOf(p.a) === 'disable-b');
      });

      const f = form(
        signal({first: {a: '', b: ''}, second: {a: 'disable-b', b: ''}}),
        (p) => {
          apply(p.first, s);
          apply(p.second, s);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.first.b().disabled()).toBe(false);
      expect(f.second.b().disabled()).toBe(true);
    });

    it('should resolve predefined schema paths deeply nested within the schema', () => {
      const s = schema<{a: string; b: string}>((p) => {
        disabled(p.b, ({valueOf}) => valueOf(p.a) === 'disable-b');
      });

      const f = form(
        signal({first: {second: {a: 'disable-b', b: ''}}}),
        (p) => {
          apply(p.first, (p) => {
            apply(p.second, s);
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.first.second.b().disabled()).toBe(true);
    });

    it('should error on resolving predefined schema path that is not part of the form', () => {
      let otherP: SchemaPath<string>;
      const s = schema<string>((p) => (otherP = p));
      SchemaImpl.rootCompile(s);

      const f = form(
        signal(''),
        (p) => {
          disabled(p, ({fieldTreeOf}) => {
            fieldTreeOf(otherP);
            return true;
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(() => f().disabled()).toThrowError(/Path is not part of this field tree\./);
    });
  });

  describe('reset', () => {
    it('should propagate to descendants', () => {
      const model = signal({a: {b: 2}});
      const f = form(model, {injector: TestBed.inject(Injector)});

      f.a.b().markAsDirty();
      expect(f().dirty()).toBe(true);
      expect(f.a().dirty()).toBe(true);
      expect(f.a.b().dirty()).toBe(true);

      f().reset();
      expect(f().dirty()).toBe(false);
      expect(f.a().dirty()).toBe(false);
      expect(f.a.b().dirty()).toBe(false);
    });
  });
});
