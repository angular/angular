import {computed, signal} from '@angular/core';
import {disabled, error, required, validate} from '../src/api/logic';
import {apply, applyEach, form, submit} from '../src/api/structure';
import {Schema} from '../src/api/types';
import {DISABLED_REASON, REQUIRED} from '../src/logic_node';

describe('Node', () => {
  it('is untouched initially', () => {
    const f = form(signal({a: 1, b: 2}));
    expect(f.$state.touched()).toBe(false);
  });

  it('can get a child of a key that exists', () => {
    const f = form(signal({a: 1, b: 2}));
    expect(f.a).toBeDefined();
    expect(f.a.$state.value()).toBe(1);
  });

  describe('instances', () => {
    it('should get the same instance when asking for a child multiple times', () => {
      const f = form(signal({a: 1, b: 2}));
      const child = f.a;
      expect(f.a).toBe(child);
    });

    it('should get the same instance when asking for a child multiple times', () => {
      const value = signal<{a: number; b?: number}>({a: 1, b: 2});
      const f = form(value);
      const child = f.a;
      value.set({a: 3});
      expect(f.a).toBe(child);
    });
  });

  it('cannot get a child of a key that does not exist', () => {
    const f = form(signal<{a: number; b: number; c?: number}>({a: 1, b: 2}));
    expect(f.c).toBeUndefined();
  });

  it('can get a child inside of a computed', () => {
    const f = form(signal({a: 1, b: 2}));
    const childA = computed(() => f.a);
    expect(childA()).toBeDefined();
  });

  it('can get a child inside of a computed', () => {
    const f = form(signal({a: 1, b: 2}));
    const childA = computed(() => f.a);
    expect(childA()).toBeDefined();
  });

  describe('touched', () => {
    it('can be marked as touched', () => {
      const f = form(signal({a: 1, b: 2}));
      expect(f.$state.touched()).toBe(false);

      f.$state.markAsTouched();
      expect(f.$state.touched()).toBe(true);
    });

    it('propagates from the children', () => {
      const f = form(signal({a: 1, b: 2}));
      expect(f.$state.touched()).toBe(false);

      f.a.$state.markAsTouched();
      expect(f.$state.touched()).toBe(true);
    });

    it('does not propagate down', () => {
      const f = form(signal({a: 1, b: 2}));

      expect(f.a.$state.touched()).toBe(false);
      f.$state.markAsTouched();
      expect(f.a.$state.touched()).toBe(false);
    });

    it('does not consider children that get removed', () => {
      const value = signal<{a: number; b?: number}>({a: 1, b: 2});
      const f = form(value);
      expect(f.$state.touched()).toBe(false);

      f.b!.$state.markAsTouched();
      expect(f.$state.touched()).toBe(true);

      value.set({a: 2});
      expect(f.$state.touched()).toBe(false);
      expect(f.b).toBeUndefined();
    });
  });

  describe('arrays', () => {
    it('should only have child nodes for elements that exist', () => {
      const f = form(signal([1, 2]));
      expect(f[0]).toBeDefined();
      expect(f[1]).toBeDefined();
      expect(f[2]).not.toBeDefined();
      expect(f['length']).toBe(2);
    });

    it('should get the element node', () => {
      const f = form(signal({names: [{name: 'Alex'}, {name: 'Miles'}]}), (p) => {
        applyEach(p.names, (a) => {
          disabled(a.name, ({value, resolve}) => {
            const el = resolve(a);
            expect(el.$state.value().name).toBe(value());
            expect(resolve(p).names.findIndex((e) => e === el)).not.toBe(-1);
            return true;
          });
        });
      });
      expect(f.names[0].name.$state.disabled()).toBe(true);
      expect(f.names[1].name.$state.disabled()).toBe(true);
    });

    it('should support element-level logic', () => {
      const f = form(signal([1, 2, 3]), (p) => {
        applyEach(p, (a) => {
          a;
          disabled(a, ({value}) => value() % 2 === 0);
        });
      });
      expect(f[0].$state.disabled()).toBe(false);
      expect(f[1].$state.disabled()).toBe(true);
      expect(f[2].$state.disabled()).toBe(false);
    });

    it('should support dynamic elements', () => {
      const model = signal([1, 2, 3]);
      const f = form(model, (p) => {
        applyEach(p, (el) => {
          // Disabled if even.
          disabled(el, ({value}) => value() % 2 === 0);
        });
      });
      model.update((v) => [...v, 4]);
      expect(f[3].$state.disabled()).toBe(true);
    });

    it('should support removing elements', () => {
      const value = signal([1, 2, 3]);
      const f = form(value);
      f[2].$state.markAsTouched();
      expect(f.$state.touched()).toBe(true);

      value.set([1, 2]);
      expect(f.$state.touched()).toBe(false);
    });

    describe('tracking', () => {
      xit('maintains identity across value moves', () => {
        const value = signal([{name: 'Alex'}, {name: 'Kirill'}]);
        const f = form(value);
        const alex = f[0];
        const kirill = f[1];

        value.update((old) => [old[1], old[0]]);

        expect(f[0] === kirill).toBeTrue();
        // expect(f[0] === alex).toBeFalse();
        expect(f[1] === alex).toBeTrue();
      });
    });
  });

  describe('disabled', () => {
    it('should allow logic to make a node disabled', () => {
      const f = form(signal({a: 1, b: 2}), (p) => {
        disabled(p.a, ({value}) => value() !== 2);
      });
      const a = f.a;
      expect(f.$state.disabled()).toBe(false);
      expect(a.$state.disabled()).toBe(true);

      a.$state.value.set(2);
      expect(f.$state.disabled()).toBe(false);
      expect(a.$state.disabled()).toBe(false);
    });

    it('should disable with reason', () => {
      const f = form(signal({a: 1, b: 2}), (p) => {
        disabled(p.a, () => true, 'a cannot be changed');
      });

      expect(f.a.$state.disabled()).toBe(true);
      expect(f.a.$state.metadata(DISABLED_REASON)).toBe('a cannot be changed');
    });

    it('should not have disabled reason if not disabled', () => {
      const f = form(signal({a: 1, b: 2}), (p) => {
        disabled(p.a, ({value}) => value() > 5, 'a cannot be changed');
      });

      expect(f.a.$state.disabled()).toBe(false);
      expect(f.a.$state.metadata(DISABLED_REASON)).toBe('');

      f.a.$state.value.set(6);

      expect(f.a.$state.disabled()).toBe(true);
      expect(f.a.$state.metadata(DISABLED_REASON)).toBe('a cannot be changed');
    });

    it('disabled reason should not propagate to children', () => {
      const f = form(signal({a: 1, b: 2}), (p) => {
        disabled(p, () => true, 'form unavailable');
      });

      expect(f.$state.disabled()).toBe(true);
      expect(f.$state.metadata(DISABLED_REASON)).toBe('form unavailable');
      expect(f.a.$state.disabled()).toBe(true);
      expect(f.a.$state.metadata(DISABLED_REASON)).toBe('');
    });
  });

  describe('validation', () => {
    it('should validate field', () => {
      const f = form(signal({a: 1, b: 2}), (p) => {
        validate(p.a, ({value}) => {
          if (value() > 10) {
            return {kind: 'too damn high'};
          }
          return undefined;
        });
      });

      expect(f.a.$state.errors()).toEqual([]);
      expect(f.a.$state.valid()).toBe(true);
      expect(f.a.$state.errors()).toEqual([]);
      expect(f.$state.valid()).toBe(true);

      f.a.$state.value.set(11);
      expect(f.a.$state.errors()).toEqual([{kind: 'too damn high'}]);
      expect(f.a.$state.valid()).toBe(false);
      expect(f.$state.errors()).toEqual([]);
      expect(f.$state.valid()).toBe(false);
    });

    it('should validate with multiple errors', () => {
      const f = form(signal({a: 1, b: 2}), (p) => {
        validate(p.a, ({value}) => {
          if (value() > 10) {
            return [{kind: 'too damn high'}, {kind: 'bad'}];
          }
          return undefined;
        });
      });

      expect(f.a.$state.errors()).toEqual([]);
      expect(f.a.$state.valid()).toBe(true);

      f.a.$state.value.set(11);
      expect(f.a.$state.errors()).toEqual([{kind: 'too damn high'}, {kind: 'bad'}]);
      expect(f.a.$state.valid()).toBe(false);
    });

    it('should validate with shorthand syntax', () => {
      const f = form(signal({a: 1, b: 2}), (p) => {
        error(p.a, ({value}) => value() > 1);
        error(p.a, ({value}) => value() > 10, 'too damn high');
        error(
          p.a,
          ({value}) => value() > 100,
          ({value}) => `${value()} is much too high`,
        );
      });

      expect(f.a.$state.errors()).toEqual([]);
      expect(f.a.$state.valid()).toBe(true);

      f.a.$state.value.set(2);
      expect(f.a.$state.errors()).toEqual([{kind: 'custom'}]);
      expect(f.a.$state.valid()).toBe(false);

      f.a.$state.value.set(11);
      expect(f.a.$state.errors()).toEqual([
        {kind: 'custom'},
        {kind: 'custom', message: 'too damn high'},
      ]);
      expect(f.a.$state.valid()).toBe(false);

      f.a.$state.value.set(101);
      expect(f.a.$state.errors()).toEqual([
        {kind: 'custom'},
        {kind: 'custom', message: 'too damn high'},
        {kind: 'custom', message: '101 is much too high'},
      ]);
      expect(f.a.$state.valid()).toBe(false);
    });

    it('should validate required field', () => {
      const data = signal({first: '', last: ''});
      const f = form(data, (name) => {
        required(name.first);
      });

      expect(f.first.$state.errors()).toEqual([{kind: 'required'}]);
      expect(f.first.$state.valid()).toBe(false);
      expect(f.first.$state.metadata(REQUIRED)).toBe(true);

      f.first.$state.value.set('Bob');

      expect(f.first.$state.errors()).toEqual([]);
      expect(f.first.$state.valid()).toBe(true);
      expect(f.first.$state.metadata(REQUIRED)).toBe(true);
    });

    it('should validate conditionally required field', () => {
      const data = signal({first: '', last: ''});
      const f = form(data, (name) => {
        // first name required if last name specified
        required(name.first, ({resolve}) => resolve(name.last).$state.value() !== '');
      });

      expect(f.first.$state.errors()).toEqual([]);
      expect(f.first.$state.valid()).toBe(true);
      expect(f.first.$state.metadata(REQUIRED)).toBe(false);

      f.last.$state.value.set('Loblaw');

      expect(f.first.$state.errors()).toEqual([{kind: 'required'}]);
      expect(f.first.$state.valid()).toBe(false);
      expect(f.first.$state.metadata(REQUIRED)).toBe(true);

      f.first.$state.value.set('Bob');

      expect(f.first.$state.errors()).toEqual([]);
      expect(f.first.$state.valid()).toBe(true);
      expect(f.first.$state.metadata(REQUIRED)).toBe(true);
    });

    it('should support custom empty predicate', () => {
      const data = signal({name: '', quantity: 0});
      const f = form(data, (item) => {
        required(item.quantity, undefined, undefined, (value) => value === 0);
      });

      expect(f.quantity.$state.metadata(REQUIRED)).toBe(true);
      expect(f.quantity.$state.errors()).toEqual([{kind: 'required'}]);

      f.quantity.$state.value.set(1);
      expect(f.quantity.$state.metadata(REQUIRED)).toBe(true);
      expect(f.quantity.$state.errors()).toEqual([]);
    });

    it('should link required error messages to their predicate', () => {
      const data = signal({country: '', amount: 0, name: ''});
      const f = form(data, (tx) => {
        required(
          tx.name,
          ({resolve}) => resolve(tx.country).$state.value() === 'USA',
          'Name is required in your country',
        );
        required(
          tx.name,
          ({resolve}) => resolve(tx.amount).$state.value() >= 1000,
          'Name is required for large transactions',
        );
      });

      expect(f.name.$state.errors()).toEqual([]);

      f.country.$state.value.set('USA');
      expect(f.name.$state.errors()).toEqual([
        {kind: 'required', message: 'Name is required in your country'},
      ]);

      f.amount.$state.value.set(1000);
      expect(f.name.$state.errors()).toEqual([
        {kind: 'required', message: 'Name is required in your country'},
        {kind: 'required', message: 'Name is required for large transactions'},
      ]);

      f.country.$state.value.set('Canada');
      expect(f.name.$state.errors()).toEqual([
        {kind: 'required', message: 'Name is required for large transactions'},
      ]);

      f.amount.$state.value.set(100);
      expect(f.name.$state.errors()).toEqual([]);
    });
  });

  describe('submit', () => {
    it('maps errors to a field', async () => {
      const data = signal({first: '', last: ''});
      const f = form(data, (name) => {
        // first name required if last name specified
        required(name.first, ({resolve}) => resolve(name.last).$state.value() !== '');
      });

      await submit(f, (form) => {
        return Promise.resolve([
          {
            field: form.last,
            error: {kind: 'lastName'},
          },
        ]);
      });

      expect(f.last.$state.errors()).toEqual([{kind: 'lastName'}]);
    });

    it('maps errors to a field', async () => {
      const initialValue = {first: 'meow', last: 'wuf'};
      const data = signal(initialValue);
      const f = form(data, (name) => {
        // first name required if last name specified
        required(name.first, ({resolve}) => resolve(name.last).$state.value() !== '');
      });

      const submitSpy = jasmine.createSpy('submit');

      await submit(f, (form) => {
        submitSpy(form.$state.value());
        return Promise.resolve();
      });

      expect(submitSpy).toHaveBeenCalledWith(initialValue);
    });

    it('marks the form as submitting', async () => {
      const initialValue = {first: 'meow', last: 'wuf'};
      const data = signal(initialValue);
      const f = form(data, (name) => {
        // first name required if last name specified
        required(name.first, ({resolve}) => resolve(name.last).$state.value() !== '');
      });

      expect(f.$state.submittedStatus()).toBe('unsubmitted');

      let resolve: VoidFunction | undefined;

      const result = submit(f, () => {
        return new Promise((r) => {
          resolve = r;
        });
      });

      expect(f.$state.submittedStatus()).toBe('submitting');

      expect(resolve).toBeDefined();
      resolve?.();

      await result;
      expect(f.$state.submittedStatus()).toBe('submitted');

      f.$state.resetSubmittedStatus();
      expect(f.$state.submittedStatus()).toBe('unsubmitted');
    });

    it('works on child fields', async () => {
      const initialValue = {first: 'meow', last: 'wuf'};
      const data = signal(initialValue);
      const f = form(data, (name) => {
        // first name required if last name specified
        required(name.first, ({resolve}) => resolve(name.last).$state.value() !== '');
      });

      const submitSpy = jasmine.createSpy('submit');

      await submit(f.first, (form) => {
        submitSpy(form.$state.value());
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

      const addressSchema: Schema<Address> = (p) => {
        disabled(p.street, () => true);
      };

      const data = signal<{name: string; address: Address}>({
        name: '',
        address: {street: '', city: ''},
      });

      const f = form(data, (p) => {
        apply(p.address, addressSchema);
      });

      expect(f.address.street.$state.disabled()).toBe(true);
    });
  });
});
