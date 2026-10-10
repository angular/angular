/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  isResource,
  isResourceRef,
  isSignal,
  resource,
  Resource,
  signal,
  Signal,
} from '../../src/core';
import {TestBed} from '../../testing';

describe('isResource', () => {
  it('should return true for a resource', () => {
    const res = TestBed.runInInjectionContext(() =>
      resource({
        loader: () => Promise.resolve('value'),
      }),
    );
    expect(isResource(res)).toBe(true);
  });

  it('should return true for a resource with params', () => {
    const id = signal(1);
    const res = TestBed.runInInjectionContext(() =>
      resource({
        params: () => ({id: id()}),
        loader: ({params}) => Promise.resolve(`item-${params.id}`),
      }),
    );
    expect(isResource(res)).toBe(true);
  });

  it('should return false for a signal', () => {
    const sig = signal('Angular');
    expect(isResource(sig)).toBe(false);
  });

  it('should return false for a computed signal', () => {
    const comp = computed(() => 10);
    expect(isResource(comp)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isResource(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isResource(undefined)).toBe(false);
  });

  it('should return false for a primitive', () => {
    expect(isResource(0)).toBe(false);
    expect(isResource('')).toBe(false);
    expect(isResource(true)).toBe(false);
  });

  it('should return false for a plain object', () => {
    expect(isResource({value: 'test', status: 'resolved'})).toBe(false);
  });

  it('should return false for a function', () => {
    expect(isResource(() => {})).toBe(false);
  });

  it('should return false for an object with non-signal properties', () => {
    const fake = {
      value: 'fake',
      status: 'resolved',
      error: undefined,
      isLoading: false,
      hasValue: () => true,
    };
    expect(isResource(fake)).toBe(false);
  });

  it('should distinguish Resource from Signal and plain values in a union type', () => {
    // Use case from https://github.com/angular/angular/issues/70525:
    // fetchDataById(id: Resource<T> | Signal<T> | T)
    function resolveValue<T>(input: Resource<T> | Signal<T> | T): T | undefined {
      if (isResource(input)) {
        return input.value();
      } else if (isSignal(input)) {
        return input();
      } else {
        return input;
      }
    }

    const plainValue = 42;
    expect(resolveValue(plainValue)).toBe(42);

    const sig = signal(100);
    expect(resolveValue(sig)).toBe(100);

    const res = TestBed.runInInjectionContext(() =>
      resource({
        loader: () => Promise.resolve('data'),
        defaultValue: 'initial',
      }),
    );
    expect(resolveValue(res)).toBe('initial');
  });

  it('should return true for a custom Resource implementation', () => {
    const customResource = {
      value: signal('custom'),
      status: signal('resolved'),
      error: signal(undefined),
      isLoading: signal(false),
      snapshot: computed(() => ({status: 'resolved', value: 'custom'})),
      hasValue(): boolean {
        return true;
      },
    };
    expect(isResource(customResource)).toBe(true);
  });

  it('should return true for a WritableResource (resource() returns WritableResource)', () => {
    const res = TestBed.runInInjectionContext(() =>
      resource({
        loader: () => Promise.resolve('value'),
        defaultValue: 'default',
      }),
    );
    res.set('overridden');
    expect(isResource(res)).toBe(true);
  });

  it('should return false when a required signal property is missing', () => {
    const partial = {
      value: signal('data'),
      status: signal('resolved'),
      error: signal(undefined),
      // missing isLoading and snapshot
      hasValue: () => true,
    };
    expect(isResource(partial)).toBe(false);
  });

  it('should return false when snapshot is missing', () => {
    const noSnapshot = {
      value: signal('data'),
      status: signal('resolved'),
      error: signal(undefined),
      isLoading: signal(false),
      hasValue: () => true,
    };
    expect(isResource(noSnapshot)).toBe(false);
  });

  it('should support resource chaining with isResource in params', () => {
    function fetchDataById(id: Resource<string> | Signal<string> | string) {
      return resource({
        params: ({chain}) => (isResource(id) ? chain(id) : isSignal(id) ? id() : id),
        loader: ({params}) => Promise.resolve(params),
      });
    }

    const res = TestBed.runInInjectionContext(() => {
      const upstream = resource({
        loader: () => Promise.resolve('upstream-data'),
        defaultValue: 'default',
      });
      return fetchDataById(upstream);
    });
    expect(isResource(res)).toBe(true);

    const sigRes = TestBed.runInInjectionContext(() => fetchDataById(signal('sig-value')));
    expect(isResource(sigRes)).toBe(true);

    const plainRes = TestBed.runInInjectionContext(() => fetchDataById('plain-value'));
    expect(isResource(plainRes)).toBe(true);
  });
});

describe('isResourceRef', () => {
  it('should return true for a resource created via resource()', () => {
    const res = TestBed.runInInjectionContext(() =>
      resource({
        loader: () => Promise.resolve('value'),
      }),
    );
    expect(isResourceRef(res)).toBe(true);
  });

  it('should return false for a plain Resource without writable methods', () => {
    const customResource = {
      value: signal('custom'),
      status: signal('resolved'),
      error: signal(undefined),
      isLoading: signal(false),
      snapshot: computed(() => ({status: 'resolved', value: 'custom'})),
      hasValue(): boolean {
        return true;
      },
    };
    expect(isResource(customResource)).toBe(true);
    expect(isResourceRef(customResource)).toBe(false);
  });

  it('should return false for non-resource values', () => {
    expect(isResourceRef(null)).toBe(false);
    expect(isResourceRef(undefined)).toBe(false);
    expect(isResourceRef(42)).toBe(false);
    expect(isResourceRef(signal('test'))).toBe(false);
    expect(isResourceRef({value: 'test'})).toBe(false);
  });

  it('should narrow the type to ResourceRef', () => {
    const res: Resource<string> | Signal<string> | string = TestBed.runInInjectionContext(() =>
      resource({
        loader: () => Promise.resolve('value'),
        defaultValue: 'default',
      }),
    );
    if (isResourceRef(res)) {
      res.set('new-value');
      res.update((v) => v + '-updated');
      res.reload();
      res.destroy();
    }
  });
});
