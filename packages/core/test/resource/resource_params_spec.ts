/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  Injector,
  resource,
  ResourceParams,
  ResourceParamsStatus,
  signal,
} from '../../src/core';
import {TestBed} from '../../testing';

describe('resource with ResourceParamsStatus', () => {
  it('should transition to idle when params returns ResourceParams.idle()', async () => {
    const s = signal<string | ResourceParamsStatus>('foo');
    const res = resource({
      params: s,
      loader: async ({params}) => {
        return params;
      },
      injector: TestBed.inject(Injector),
    });

    await TestBed.inject(ApplicationRef).whenStable();
    await Promise.resolve();

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('foo');

    s.set(ResourceParams.idle());
    await TestBed.inject(ApplicationRef).whenStable();

    expect(res.status()).toBe('idle');
    expect(res.value()).toBe(undefined);
  });

  it('should transition to loading when params returns ResourceParams.loading()', async () => {
    const s = signal<string | ResourceParamsStatus>('foo');
    let loadCount = 0;
    const res = resource({
      params: s,
      loader: async ({params}) => {
        loadCount++;
        return params as string;
      },
      injector: TestBed.inject(Injector),
    });

    await TestBed.inject(ApplicationRef).whenStable();
    await Promise.resolve();

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('foo');
    expect(loadCount).toBe(1);

    s.set(ResourceParams.loading());
    await TestBed.inject(ApplicationRef).whenStable();

    expect(res.status()).toBe('loading');
    expect(res.value()).toBe(undefined);
    expect(loadCount).toBe(1);
  });

  it('should transition to error when params returns ResourceParams.error()', async () => {
    const s = signal<string | ResourceParamsStatus>('foo');
    const res = resource({
      params: s,
      loader: async ({params}) => params as string,
      injector: TestBed.inject(Injector),
    });

    await TestBed.inject(ApplicationRef).whenStable();
    await Promise.resolve();
    expect(res.status()).toBe('resolved');

    const err = new Error('params error');
    s.set(ResourceParams.error(err));
    await TestBed.inject(ApplicationRef).whenStable();

    expect(res.status()).toBe('error');
    expect(res.error()).toEqual(err);
    expect(() => res.value()).toThrowError(/params error/);
  });

  it('should recover from special statuses', async () => {
    const s = signal<string | ResourceParamsStatus>(ResourceParams.idle());
    let loadCount = 0;
    const res = resource({
      params: s,
      loader: async ({params}) => {
        loadCount++;
        return params as string;
      },
      injector: TestBed.inject(Injector),
    });

    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.status()).toBe('idle');

    s.set(ResourceParams.loading());
    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.status()).toBe('loading');
    expect(loadCount).toBe(0);

    s.set(ResourceParams.error(new Error('fail')));
    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.status()).toBe('error');
    expect(loadCount).toBe(0);

    s.set('foo');
    // Now it should load
    expect(res.status()).toBe('loading'); // Loader is async
    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('foo');
    expect(loadCount).toBe(1);
  });
});
