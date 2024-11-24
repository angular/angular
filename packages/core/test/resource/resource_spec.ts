/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  createEnvironmentInjector,
  EnvironmentInjector,
  Injector,
  resource,
  ResourceStatus,
  signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';

abstract class MockBackend<T, R> {
  protected pending = new Map<
    T,
    {resolve: (r: R) => void; reject: (reason: any) => void; promise: Promise<R>}
  >();

  fetch(request: T): Promise<R> {
    const p = new Promise<R>((resolve, reject) => {
      this.pending.set(request, {resolve, reject, promise: undefined!});
    });
    this.pending.get(request)!.promise = p;
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
    const allPending = Array.from(this.pending.values()).map((pending) => pending.promise);

    for (const [req, {resolve}] of this.pending) {
      resolve(this.prepareResponse(req));
    }
    this.pending.clear();

    return Promise.all(allPending);
  }

  protected abstract prepareResponse(request: T): R;
}

class MockEchoBackend<T> extends MockBackend<T, T> {
  override prepareResponse(request: T) {
    return request;
  }
}

class MockResponseCountingBackend extends MockBackend<number, string> {
  counter = 0;
  override prepareResponse(request: number) {
    return request + ':' + this.counter++;
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
    expect(echoResource.status()).toBe(ResourceStatus.Idle);
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeFalse();
    expect(echoResource.value()).toBeUndefined();
    expect(echoResource.error()).toBe(undefined);

    // flush effect to kick off a request
    // THINK: testing patterns around a resource?
    TestBed.flushEffects();
    expect(echoResource.status()).toBe(ResourceStatus.Loading);
    expect(echoResource.isLoading()).toBeTrue();
    expect(echoResource.hasValue()).toBeFalse();
    expect(echoResource.value()).toBeUndefined();
    expect(echoResource.error()).toBe(undefined);

    await backend.flush();
    expect(echoResource.status()).toBe(ResourceStatus.Resolved);
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual({counter: 0});
    expect(echoResource.error()).toBe(undefined);

    counter.update((c) => c + 1);
    TestBed.flushEffects();
    await backend.flush();
    expect(echoResource.status()).toBe(ResourceStatus.Resolved);
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeTrue();
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

    expect(echoResource.status()).toBe(ResourceStatus.Error);
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeFalse();
    expect(echoResource.value()).toEqual(undefined);
    expect(echoResource.error()).toBe('Something went wrong....');
  });

  it('should expose errors on reload', async () => {
    const backend = new MockEchoBackend();
    const counter = signal(0);
    const echoResource = resource({
      request: () => ({counter: counter()}),
      loader: (params) => {
        if (params.request.counter % 2 === 0) {
          return Promise.resolve('ok');
        } else {
          throw new Error('KO');
        }
      },
      injector: TestBed.inject(Injector),
    });

    TestBed.flushEffects();
    await backend.flush();

    expect(echoResource.status()).toBe(ResourceStatus.Resolved);
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual('ok');
    expect(echoResource.error()).toBe(undefined);

    counter.update((value) => value + 1);
    TestBed.flushEffects();

    expect(echoResource.status()).toBe(ResourceStatus.Error);
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeFalse();
    expect(echoResource.value()).toEqual(undefined);
    expect(echoResource.error()).toEqual(Error('KO'));
  });

  it('should _not_ load if the request resolves to undefined', () => {
    const counter = signal(0);
    const backend = new MockEchoBackend();
    const echoResource = resource({
      request: () => (counter() > 5 ? {counter: counter()} : undefined),
      loader: (params) => backend.fetch(params.request),
      injector: TestBed.inject(Injector),
    });

    TestBed.flushEffects();
    expect(echoResource.status()).toBe(ResourceStatus.Idle);
    expect(echoResource.isLoading()).toBeFalse();

    counter.set(10);
    TestBed.flushEffects();
    expect(echoResource.isLoading()).toBeTrue();
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
    await Promise.resolve();

    // start a new request and resolve all
    counter.update((c) => c + 1);
    TestBed.flushEffects();
    await backend.flush();
    expect(echoResource.status()).toBe(ResourceStatus.Resolved);
    expect(echoResource.value()).toEqual({counter: 1});
    expect(echoResource.error()).toBe(undefined);

    expect(aborted).toEqual([{counter: 0}]);
  });

  it('should cancel pending requests when the resource is destroyed via injector', async () => {
    const counter = signal(0);
    const backend = new MockEchoBackend<{counter: number}>();
    const aborted: {counter: number}[] = [];
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
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
      injector,
    });

    // start a request without resolving the previous one
    TestBed.flushEffects();
    await Promise.resolve();

    injector.destroy();
    await backend.flush();
    expect(echoResource.status()).toBe(ResourceStatus.Idle);
    expect(echoResource.value()).toBe(undefined);
    expect(echoResource.error()).toBe(undefined);

    expect(aborted).toEqual([{counter: 0}]);
  });

  it('should cancel pending requests when the resource is manually destroyed', async () => {
    const counter = signal(0);
    const backend = new MockEchoBackend<{counter: number}>();
    const aborted: {counter: number}[] = [];
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
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
      injector,
    });

    // start a request without resolving the previous one
    TestBed.flushEffects();
    await Promise.resolve();

    echoResource.destroy();
    await backend.flush();

    expect(echoResource.status()).toBe(ResourceStatus.Idle);
    expect(echoResource.value()).toBe(undefined);
    expect(echoResource.error()).toBe(undefined);

    expect(aborted).toEqual([{counter: 0}]);
  });

  it('should not respond to reactive state changes in a loader', async () => {
    const unrelated = signal('a');
    const backend = new MockResponseCountingBackend();
    const res = resource<string, number>({
      request: () => 0,
      loader: (params) => {
        // read reactive state and assure it is _not_ tracked
        unrelated();
        return backend.fetch(params.request);
      },
      injector: TestBed.inject(Injector),
    });

    TestBed.flushEffects();
    await backend.flush();
    expect(res.value()).toBe('0:0');

    unrelated.set('b');
    TestBed.flushEffects();
    // there is no chang in the status
    expect(res.status()).toBe(ResourceStatus.Resolved);
    await backend.flush();
    // there is no chang in the value
    expect(res.value()).toBe('0:0');
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

    expect(echoResource.status()).toBe(ResourceStatus.Resolved);
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.value()).toEqual({counter: 0});
    expect(echoResource.error()).toBe(undefined);

    echoResource.value.set({counter: 100});
    expect(echoResource.status()).toBe(ResourceStatus.Local);
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual({counter: 100});
    expect(echoResource.error()).toBe(undefined);

    counter.set(1);
    TestBed.flushEffects();
    await backend.flush();
    expect(echoResource.status()).toBe(ResourceStatus.Resolved);
    expect(echoResource.value()).toEqual({counter: 1});
    expect(echoResource.error()).toBe(undefined);

    // state setter is also exposed on the resource directly
    echoResource.set({counter: 200});
    expect(echoResource.status()).toBe(ResourceStatus.Local);
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual({counter: 200});
  });

  it('should allow re-fetching data', async () => {
    const backend = new MockResponseCountingBackend();
    const res = resource<string, number>({
      request: () => 0,
      loader: (params) => backend.fetch(params.request),
      injector: TestBed.inject(Injector),
    });

    TestBed.flushEffects();
    await backend.flush();
    expect(res.status()).toBe(ResourceStatus.Resolved);
    expect(res.value()).toBe('0:0');
    expect(res.error()).toBe(undefined);

    res.reload();
    TestBed.flushEffects();
    await backend.flush();
    expect(res.status()).toBe(ResourceStatus.Resolved);
    expect(res.isLoading()).toBeFalse();
    expect(res.value()).toBe('0:1');
    expect(res.error()).toBe(undefined);

    // calling refresh multiple times should _not_ result in multiple requests
    res.reload();
    TestBed.flushEffects();
    res.reload();
    TestBed.flushEffects();
    await backend.flush();
    expect(res.value()).toBe('0:2');
  });

  it('should respect provided equality function for the results signal', async () => {
    const res = resource({
      loader: async () => 0,
      equal: (a, b) => true,
      injector: TestBed.inject(Injector),
    });

    res.value.set(5);
    expect(res.status()).toBe(ResourceStatus.Local);
    expect(res.value()).toBe(5);
    expect(res.error()).toBe(undefined);

    res.value.set(10);
    expect(res.status()).toBe(ResourceStatus.Local);
    expect(res.value()).toBe(5); // equality blocked writes
    expect(res.error()).toBe(undefined);
  });

  it('should convert writable resource to its read-only version', () => {
    const res = resource({
      loader: async () => 0,
      equal: (a, b) => true,
      injector: TestBed.inject(Injector),
    });

    const readonlyRes = res.asReadonly();

    // @ts-expect-error
    readonlyRes.asReadonly;

    // @ts-expect-error
    readonlyRes.value.set;
  });
});
