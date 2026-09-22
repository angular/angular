/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {actAsync} from '@angular/private/testing';
import {Injector, resource, ResourceParamsStatus, signal} from '../../src/core';
import {TestBed} from '../../testing';

function throwStatusAndErrors<T>(source: () => T | ResourceParamsStatus | Error): () => T {
  return () => {
    const value = source();
    if (value instanceof Error) throw value;
    if (value === ResourceParamsStatus.IDLE || value === ResourceParamsStatus.LOADING) throw value;
    return value as T;
  };
}

describe('resource with ResourceParamsStatus', () => {
  it('should transition to idle when params throws ResourceParamsStatus.IDLE', async () => {
    const s = signal<string | ResourceParamsStatus>('foo');
    const res = await actAsync(() =>
      resource({
        params: throwStatusAndErrors(s),
        loader: async ({params}) => {
          return params;
        },
        injector: TestBed.inject(Injector),
      }),
    );

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('foo');

    await actAsync(() => s.set(ResourceParamsStatus.IDLE));

    expect(res.status()).toBe('idle');
    expect(res.value()).toBe(undefined);
  });

  it('should transition to loading when params throws ResourceParamsStatus.LOADING', async () => {
    const s = signal<string | ResourceParamsStatus>('foo');
    let loadCount = 0;
    const res = await actAsync(() =>
      resource({
        params: throwStatusAndErrors(s),
        loader: async ({params}) => {
          loadCount++;
          return params as string;
        },
        injector: TestBed.inject(Injector),
      }),
    );

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('foo');
    expect(loadCount).toBe(1);

    await actAsync(() => s.set(ResourceParamsStatus.LOADING));

    expect(res.status()).toBe('loading');
    expect(res.value()).toBe(undefined);
    expect(loadCount).toBe(1);
  });

  it('should transition to error when params throws an Error', async () => {
    const s = signal<string | Error>('foo');
    const res = await actAsync(() =>
      resource({
        params: throwStatusAndErrors(s),
        loader: async ({params}) => params as string,
        injector: TestBed.inject(Injector),
      }),
    );

    expect(res.status()).toBe('resolved');

    const err = new Error('params error');
    await actAsync(() => s.set(err));

    expect(res.status()).toBe('error');
    expect(res.error()).toEqual(err);
    expect(() => res.value()).toThrowError(/params error/);
  });

  it('should recover from special statuses', async () => {
    const s = signal<string | ResourceParamsStatus | Error>(ResourceParamsStatus.IDLE);
    let loadCount = 0;
    const res = await actAsync(() =>
      resource({
        params: throwStatusAndErrors(s),
        loader: async ({params}) => {
          loadCount++;
          return params;
        },
        injector: TestBed.inject(Injector),
      }),
    );

    expect(res.status()).toBe('idle');

    await actAsync(() => s.set(ResourceParamsStatus.LOADING));

    expect(res.status()).toBe('loading');
    expect(loadCount).toBe(0);

    await actAsync(() => s.set(new Error('fail')));

    expect(res.status()).toBe('error');
    expect(loadCount).toBe(0);

    await actAsync(() => s.set('foo'));

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('foo');
    expect(loadCount).toBe(1);
  });

  it('should propagate a different error thrown from params', async () => {
    const s = signal<string | Error>('foo');
    const res = await actAsync(() =>
      resource({
        params: throwStatusAndErrors(s),
        loader: async ({params}) => params as string,
        injector: TestBed.inject(Injector),
      }),
    );

    await actAsync(() => s.set(new Error('first')));
    expect(res.status()).toBe('error');
    expect(res.error()).toEqual(new Error('first'));

    await actAsync(() => s.set(new Error('second')));
    expect(res.status()).toBe('error');
    expect(res.error()).toEqual(new Error('second'));
  });

  it('should keep the status when an unrelated signal re-runs params that throws the same status', async () => {
    const unrelated = signal(0);
    const s = signal<string | ResourceParamsStatus>(ResourceParamsStatus.LOADING);
    let paramsCount = 0;
    let loadCount = 0;
    const res = await actAsync(() =>
      resource({
        params: () => {
          paramsCount++;
          unrelated();
          return throwStatusAndErrors(s)();
        },
        loader: async ({params}) => {
          loadCount++;
          return params;
        },
        injector: TestBed.inject(Injector),
      }),
    );

    expect(res.status()).toBe('loading');
    expect(paramsCount).toBe(1);

    await actAsync(() => unrelated.set(1));

    expect(paramsCount).toBe(2);
    expect(res.status()).toBe('loading');
    expect(loadCount).toBe(0);

    await actAsync(() => s.set('foo'));
    expect(res.status()).toBe('resolved');
    expect(loadCount).toBe(1);
  });
});
