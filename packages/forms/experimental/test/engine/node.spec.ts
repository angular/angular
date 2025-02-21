import {computed, signal} from '@angular/core';
import {FormNode} from '../../src/engine/node';

fdescribe('Node', () => {
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
});
