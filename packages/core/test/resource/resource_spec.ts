/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';

abstract class MockBackend<T, R> {
  protected pending = new Map<T, {resolve: (r: R) => void; reject: (reason: any) => void}>();

  fetch(request: T): Promise<R> {
    const p = new Promise<R>((resolve, reject) => {
      this.pending.set(request, {resolve, reject});
    });
    return p;
  }

  abort(req: T) {
    this.reject(req, 'aborted');
  }

  reject(req: T, reason: any) {
    const entry = this.pending.get(req);
    if (entry) {
      this.pending.delete(req);
      entry.reject(reason);
    }

    return Promise.resolve();
  }

  async flush() {
    for (const [req, {resolve}] of this.pending) {
      resolve(this.prepareResponse(req));
    }

    return Promise.resolve();
  }

  protected abstract prepareResponse(request: T): R;
}

class MockEchoBackend<T> extends MockBackend<T, T> {
  override prepareResponse(request: T) {
    return request;
  }
}

describe('resource', () => {
  it('should expose data and status based on reactive request', async () => {
    const counter = signal(0);
    const backend = new MockEchoBackend();
    const echoResource = resource({
      request: () => ({counter: counter()}),
      loader: (params) => backend.fetch(params.request),
      injector: TestBed.inject(Injector),
    });

    // a freshly created resource is in the idle state
    expect(echoResource.status()).toBe('idle');
    expect(echoResource.value()).toBeUndefined();
    expect(echoResource.error()).toBe(undefined);

    // flush effect to kick off a request
    // THINK: testing patterns around a resource?
    TestBed.flushEffects();
    expect(echoResource.status()).toBe('loading');
    expect(echoResource.value()).toBeUndefined();
    expect(echoResource.error()).toBe(undefined);

    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.value()).toEqual({counter: 0});
    expect(echoResource.error()).toBe(undefined);

    counter.update((c) => c + 1);
    TestBed.flushEffects();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.value()).toEqual({counter: 1});
    expect(echoResource.error()).toBe(undefined);
  });

  it('should expose errors thrown during resource loading', async () => {
    const backend = new MockEchoBackend();
    const requestParam = {};
    const echoResource = resource({
      request: () => requestParam,
      loader: (params) => backend.fetch(params.request),
      injector: TestBed.inject(Injector),
    });

    TestBed.flushEffects();
    await backend.reject(requestParam, 'Something went wrong....');

    expect(echoResource.status()).toBe('error');
    expect(echoResource.value()).toEqual(undefined);
    expect(echoResource.error()).toBe('Something went wrong....');
  });

  it('should cancel pending requests before starting a new one', async () => {
    const counter = signal(0);
    const backend = new MockEchoBackend<{counter: number}>();
    const aborted: {counter: number}[] = [];
    const echoResource = resource<{counter: number}, {counter: number}>({
      request: () => ({counter: counter()}),
      loader: ({request, abortSignal}) => {
        abortSignal.addEventListener('abort', () => backend.abort(request));
        return backend.fetch(request).catch((reason) => {
          if (reason === 'aborted') {
            aborted.push(request);
          }
          throw new Error(reason);
        });
      },
      injector: TestBed.inject(Injector),
    });

    // start a request without resolving the previous one
    TestBed.flushEffects();

    // start a new request and resolve all
    counter.update((c) => c + 1);
    TestBed.flushEffects();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.value()).toEqual({counter: 1});
    expect(echoResource.error()).toBe(undefined);

    expect(aborted).toEqual([{counter: 0}]);
  });

  it('should allow setting local state', async () => {
    const counter = signal(0);
    const backend = new MockEchoBackend();
    const echoResource = resource({
      request: () => ({counter: counter()}),
      loader: (params) => backend.fetch(params.request),
      injector: TestBed.inject(Injector),
    });

    TestBed.flushEffects();
    await backend.flush();

    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.value()).toEqual({counter: 0});
    expect(echoResource.error()).toBe(undefined);

    echoResource.value.set({counter: 100});
    expect(echoResource.status()).toBe('local');
    expect(echoResource.value()).toEqual({counter: 100});
    expect(echoResource.error()).toBe(undefined);

    counter.set(1);
    TestBed.flushEffects();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.value()).toEqual({counter: 1});
    expect(echoResource.error()).toBe(undefined);
  });

  it('should allow re-fetching data', async () => {
    class MockResponseCountingBackend extends MockBackend<number, string> {
      counter = 0;
      override prepareResponse(request: number) {
        return request + ':' + this.counter++;
      }
    }

    const backend = new MockResponseCountingBackend();
    const res = resource<string, number>({
      request: () => 0,
      loader: (params) => backend.fetch(params.request),
      injector: TestBed.inject(Injector),
    });

    TestBed.flushEffects();
    await backend.flush();
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('0:0');
    expect(res.error()).toBe(undefined);

    res.refresh();
    TestBed.flushEffects();
    await backend.flush();
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('0:1');
    expect(res.error()).toBe(undefined);
  });

  it('should respect provided equality function for the results signal', async () => {
    const res = resource<number>({
      loader: () => Promise.resolve(0),
      equal: (a, b) => true,
      injector: TestBed.inject(Injector),
    });

    res.value.set(5);
    expect(res.status()).toBe('local');
    expect(res.value()).toBe(5);
    expect(res.error()).toBe(undefined);

    res.value.set(10);
    expect(res.status()).toBe('local');
    expect(res.value()).toBe(5); // equality blocked writes
    expect(res.error()).toBe(undefined);
  });
});
