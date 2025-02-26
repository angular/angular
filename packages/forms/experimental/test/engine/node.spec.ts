import {computed, signal} from '@angular/core';
import {array, disabled, form} from '../../src/api/schema';
import {FormNode} from '../../src/engine/node';

describe('Node', () => {
  it('is untouched initially', () => {
    const value = signal({a: 1, b: 2});
    const node = new FormNode(value);

    expect(node.touched()).toBe(false);
  });

  it('can get a child of a key that exists', () => {
    const value = signal({a: 1, b: 2});
    const node = new FormNode(value);

    const child = node.getChild('a')!;
    expect(child).toBeDefined();
    expect(child.value()).toBe(1);
  });

  describe('instances', () => {
    it('should get the same instance when asking for a child multiple times', () => {
      const value = signal({a: 1, b: 2});
      const node = new FormNode(value);

      const child = node.getChild('a')!;

      expect(node.getChild('a')).toBe(child);
    });

    it('should get the same instance when asking for a child multiple times', () => {
      const value = signal<Object>({a: 1, b: 2});
      const node = new FormNode(value);

      const child = node.getChild('a')!;

      value.set({a: 3});
      expect(node.getChild('a')).toBe(child);
    });
  });

  it('cannot get a child of a key that does not exist', () => {
    const value = signal({a: 1, b: 2});
    const node = new FormNode(value);

    expect(node.getChild('c')).toBeUndefined();
  });

  it('can get a child inside of a computed', () => {
    const value = signal({a: 1, b: 2});
    const node = new FormNode(value);
    const childA = computed(() => node.getChild('a')!);

    expect(childA()).toBeDefined();
  });

  it('can get a child inside of a computed', () => {
    const value = signal({a: 1, b: 2});
    const node = new FormNode(value);
    const childA = computed(() => node.getChild('a')!);

    expect(childA()).toBeDefined();
  });

  describe('touched', () => {
    it('can be marked as touched', () => {
      const value = signal({a: 1, b: 2});
      const node = new FormNode(value);

      expect(node.touched()).toBe(false);
      node.markAsTouched();
      expect(node.touched()).toBe(true);
    });

    it('propagates from the children', () => {
      const value = signal({a: 1, b: 2});
      const node = new FormNode(value);

      expect(node.touched()).toBe(false);
      node.getChild('a')!.markAsTouched();
      expect(node.touched()).toBe(true);
    });

    it('does not propagate down', () => {
      const value = signal({a: 1, b: 2});
      const node = new FormNode(value);

      expect(node.getChild('a')!.touched()).toBe(false);
      node.markAsTouched();
      expect(node.getChild('a')!.touched()).toBe(false);
    });

    it('does not consider children that get removed', () => {
      const value = signal<Object>({a: 1, b: 2});
      const node = new FormNode(value);

      expect(node.touched()).toBe(false);
      node.getChild('b')!.markAsTouched();
      expect(node.touched()).toBe(true);
      value.set({a: 2});
      expect(node.touched()).toBe(false);
      expect(node.getChild('b')).toBeUndefined();
    });
  });

  describe('arrays', () => {
    it('should only have child nodes for elements that exist', () => {
      const value = signal([1, 2]);
      const node = new FormNode(value);
      expect(node.getChild(0)).toBeDefined();
      expect(node.getChild(1)).toBeDefined();
      expect(node.getChild(2)).not.toBeDefined();
      expect(node.getChild('length')).not.toBeDefined();
    });

    it('should support element-level logic', () => {
      const node = form(signal([1, 2, 3]), (p) => {
        array(p, (a) => {
          a;
          disabled(a, (v) => v % 2 === 0);
        });
      });

      expect(node.getChild(0)!.disabled()).toBe(false);
      expect(node.getChild(1)!.disabled()).toBe(true);
      expect(node.getChild(2)!.disabled()).toBe(false);
    });

    it('should support dynamic elements', () => {
      const model = signal([1, 2, 3]);
      const node = form(model, (p) => {
        array(p, (el) => {
          // Disabled if even.
          disabled(el, (v) => v % 2 === 0);
        });
      });

      model.update((v) => [...v, 4]);
      expect(node.getChild(3)!.disabled()).toBe(true);
    });

    it('should support removing elements', () => {
      const value = signal([1, 2, 3]);
      const node = new FormNode(value);

      node.getChild(2)!.markAsTouched();
      expect(node.touched()).toBe(true);

      value.set([1, 2]);
      expect(node.touched()).toBe(false);
    });
  });

  describe('disabled', () => {
    it('should allow logic to make a node disabled', () => {
      const node = form(signal({a: 1, b: 2}), (p) => {
        disabled(p.a, (v) => v !== 2);
      });

      const a = node.getChild('a')!;

      expect(node.disabled()).toBe(false);
      expect(a.disabled()).toBe(true);

      a.value.set(2);
      expect(node.disabled()).toBe(false);
      expect(a.disabled()).toBe(false);
    });
  });
});
