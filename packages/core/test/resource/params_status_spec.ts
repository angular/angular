/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {timeout} from '../../../private/testing';
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
    const res = resource({
      params: throwStatusAndErrors(s),
      loader: async ({params}) => {
        return params;
      },
      injector: TestBed.inject(Injector),
    });
    TestBed.tick();
    await timeout();

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('foo');

    s.set(ResourceParamsStatus.IDLE);
    TestBed.tick();
    await timeout();

    expect(res.status()).toBe('idle');
    expect(res.value()).toBe(undefined);
  });

  it('should transition to loading when params throws ResourceParamsStatus.LOADING', async () => {
    const s = signal<string | ResourceParamsStatus>('foo');
    let loadCount = 0;
    const res = resource({
      params: throwStatusAndErrors(s),
      loader: async ({params}) => {
        loadCount++;
        return params as string;
      },
      injector: TestBed.inject(Injector),
    });
    TestBed.tick();
    await timeout();

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('foo');
    expect(loadCount).toBe(1);

    s.set(ResourceParamsStatus.LOADING);
    TestBed.tick();
    await timeout();

    expect(res.status()).toBe('loading');
    expect(res.value()).toBe(undefined);
    expect(loadCount).toBe(1);
  });

  it('should transition to error when params throws an Error', async () => {
    const s = signal<string | Error>('foo');
    const res = resource({
      params: throwStatusAndErrors(s),
      loader: async ({params}) => params as string,
      injector: TestBed.inject(Injector),
    });
    TestBed.tick();
    await timeout();

    expect(res.status()).toBe('resolved');

    const err = new Error('params error');
    s.set(err);
    TestBed.tick();
    await timeout();

    expect(res.status()).toBe('error');
    expect(res.error()).toEqual(err);
    expect(() => res.value()).toThrowError(/params error/);
  });

  it('should recover from special statuses', async () => {
    const s = signal<string | ResourceParamsStatus | Error>(ResourceParamsStatus.IDLE);
    let loadCount = 0;
    const res = resource({
      params: throwStatusAndErrors(s),
      loader: async ({params}) => {
        loadCount++;
        return params;
      },
      injector: TestBed.inject(Injector),
    });
    TestBed.tick();
    await timeout();

    expect(res.status()).toBe('idle');

    s.set(ResourceParamsStatus.LOADING);
    TestBed.tick();
    await timeout();

    expect(res.status()).toBe('loading');
    expect(loadCount).toBe(0);

    s.set(new Error('fail'));
    TestBed.tick();
    await timeout();

    expect(res.status()).toBe('error');
    expect(loadCount).toBe(0);

    s.set('foo');
    // Now it should load
    expect(res.status()).toBe('loading'); // Loader is async

    TestBed.tick();
    await timeout();

    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('foo');
    expect(loadCount).toBe(1);
  });
});
