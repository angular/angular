import {computed, signal} from '@angular/core';
import {form} from '../../src/api/form';
import {array, disabled, validate} from '../../src/api/schema';

describe('Node', () => {
  it('is untouched initially', () => {
    const f = form(signal({a: 1, b: 2}));
    expect(f.$.touched()).toBe(false);
  });

  it('can get a child of a key that exists', () => {
    const f = form(signal({a: 1, b: 2}));
    expect(f.a).toBeDefined();
    expect(f.a.$.value()).toBe(1);
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
      expect(f.$.touched()).toBe(false);

      f.$.markAsTouched();
      expect(f.$.touched()).toBe(true);
    });

    it('propagates from the children', () => {
      const f = form(signal({a: 1, b: 2}));
      expect(f.$.touched()).toBe(false);

      f.a.$.markAsTouched();
      expect(f.$.touched()).toBe(true);
    });

    it('does not propagate down', () => {
      const f = form(signal({a: 1, b: 2}));

      expect(f.a.$.touched()).toBe(false);
      f.$.markAsTouched();
      expect(f.a.$.touched()).toBe(false);
    });

    it('does not consider children that get removed', () => {
      const value = signal<{a: number; b?: number}>({a: 1, b: 2});
      const f = form(value);
      expect(f.$.touched()).toBe(false);

      f.b!.$.markAsTouched();
      expect(f.$.touched()).toBe(true);

      value.set({a: 2});
      expect(f.$.touched()).toBe(false);
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
        array(p.names, (a) => {
          disabled(a.name, (name, el, f2) => {
            expect(el.$.value().name).toBe(name);
            expect(f2.names.findIndex((e) => e === el)).not.toBe(-1);
            return true;
          });
        });
      });
      expect(f.names[0].name.$.disabled()).toBe(true);
      expect(f.names[1].name.$.disabled()).toBe(true);
    });

    it('should support element-level logic', () => {
      const f = form(signal([1, 2, 3]), (p) => {
        array(p, (a) => {
          a;
          disabled(a, (v) => (v as any) % 2 === 0);
        });
      });
      expect(f[0].$.disabled()).toBe(false);
      expect(f[1].$.disabled()).toBe(true);
      expect(f[2].$.disabled()).toBe(false);
    });

    it('should support dynamic elements', () => {
      const model = signal([1, 2, 3]);
      const f = form(model, (p) => {
        array(p as any, (el) => {
          // Disabled if even.
          disabled(el, (v) => (v as any) % 2 === 0);
        });
      });
      model.update((v) => [...v, 4]);
      expect(f[3].$.disabled()).toBe(true);
    });

    it('should support removing elements', () => {
      const value = signal([1, 2, 3]);
      const f = form(value);
      f[2].$.markAsTouched();
      expect(f.$.touched()).toBe(true);

      value.set([1, 2]);
      expect(f.$.touched()).toBe(false);
    });
  });

  describe('disabled', () => {
    it('should allow logic to make a node disabled', () => {
      const f = form(signal({a: 1, b: 2}), (p) => {
        disabled(p.a, (v) => v !== 2);
      });
      const a = f.a;
      expect(f.$.disabled()).toBe(false);
      expect(a.$.disabled()).toBe(true);

      a.$.value.set(2);
      expect(f.$.disabled()).toBe(false);
      expect(a.$.disabled()).toBe(false);
    });
  });

  describe('validation', () => {
    it('should validate field', () => {
      const f = form(signal({a: 1, b: 2}), (p) => {
        validate(p.a, (v) => {
          if (v > 10) {
            return {kind: 'too damn high'};
          }
          return undefined;
        });
      });

      expect(f.a.$.errors()).toEqual([]);
      expect(f.a.$.valid()).toBe(true);
      expect(f.a.$.errors()).toEqual([]);
      expect(f.$.valid()).toBe(true);

      f.a.$.value.set(11);
      expect(f.a.$.errors()).toEqual([{kind: 'too damn high'}]);
      expect(f.a.$.valid()).toBe(false);
      expect(f.$.errors()).toEqual([]);
      expect(f.$.valid()).toBe(false);
    });

    it('should validate with multiple errors', () => {
      const f = form(signal({a: 1, b: 2}), (p) => {
        validate(p.a, (v) => {
          if (v > 10) {
            return [{kind: 'too damn high'}, {kind: 'bad'}];
          }
          return undefined;
        });
      });

      expect(f.a.$.errors()).toEqual([]);
      expect(f.a.$.valid()).toBe(true);

      f.a.$.value.set(11);
      expect(f.a.$.errors()).toEqual([{kind: 'too damn high'}, {kind: 'bad'}]);
      expect(f.a.$.valid()).toBe(false);
    });
  });
});
