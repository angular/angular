/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  createEnvironmentInjector,
  EnvironmentInjector,
  Injector,
  resource,
  ResourceStatus,
  signal,
} from '../../src/core';
import {TestBed} from '../../testing';

// Needed for the `Promise.withResolvers()` usage below.
import '../../src/util/promise_with_resolvers';

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
    return this.reject(req, 'aborted');
  }

  reject(req: T, reason: any) {
    const entry = this.pending.get(req);
    if (entry) {
      this.pending.delete(req);
      entry.reject(reason);
    }

    return flushMicrotasks();
  }

  async flush(): Promise<void> {
    const allPending = Array.from(this.pending.values()).map((pending) => pending.promise);

    for (const [req, {resolve}] of this.pending) {
      resolve(this.prepareResponse(req));
    }
    this.pending.clear();

    await Promise.all(allPending);
    await flushMicrotasks();
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

    // a freshly created resource is in the loading state
    expect(echoResource.status()).toBe(ResourceStatus.Loading);
    expect(echoResource.isLoading()).toBeTrue();
    expect(echoResource.hasValue()).toBeFalse();
    expect(echoResource.value()).toBeUndefined();
    expect(echoResource.error()).toBe(undefined);
    TestBed.flushEffects();
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

  it('should report idle status as the previous status on first run', async () => {
    let prevStatus: ResourceStatus | undefined;
    resource({
      loader: async ({previous}) => {
        // Ensure the loader only runs once.
        expect(prevStatus).toBeUndefined();

        prevStatus = previous.status;
        return true;
      },
      injector: TestBed.inject(Injector),
    });

    TestBed.flushEffects();
    await flushMicrotasks();

    expect(prevStatus).toBe(ResourceStatus.Idle);
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
    await backend.flush();

    expect(echoResource.status()).toBe(ResourceStatus.Error);
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeFalse();
    expect(echoResource.value()).toEqual(undefined);
    expect(echoResource.error()).toEqual(Error('KO'));
  });

  it('should respond to a request that changes while loading', async () => {
    const appRef = TestBed.inject(ApplicationRef);

    const request = signal(0);
    let resolve: Array<() => void> = [];
    const res = resource({
      request,
      loader: async ({request}) => {
        const p = Promise.withResolvers<number>();
        resolve.push(() => p.resolve(request));
        return p.promise;
      },
      injector: TestBed.inject(Injector),
    });

    // Start the load by running the effect inside the resource.
    appRef.tick();

    // We should have a pending load.
    expect(resolve.length).toBe(1);

    // Change the request.
    request.set(1);

    // Resolve the first load.
    resolve[0]();
    await flushMicrotasks();

    // The resource should still be loading. Ticking (triggering the 2nd effect)
    // should not change the loading status.
    expect(res.status()).toBe(ResourceStatus.Loading);
    appRef.tick();
    expect(res.status()).toBe(ResourceStatus.Loading);
    expect(resolve.length).toBe(2);

    // Resolve the second load.
    resolve[1]?.();
    await flushMicrotasks();

    // We should see the resolved value.
    expect(res.status()).toBe(ResourceStatus.Resolved);
    expect(res.value()).toBe(1);
  });

  it('should return a default value if provided', async () => {
    const DEFAULT: string[] = [];
    const request = signal(0);
    const res = resource({
      request,
      loader: async ({request}) => {
        if (request === 2) {
          throw new Error('err');
        }
        return ['data'];
      },
      defaultValue: DEFAULT,
      injector: TestBed.inject(Injector),
    });
    expect(res.value()).toBe(DEFAULT);

    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).not.toBe(DEFAULT);

    request.set(1);
    expect(res.value()).toBe(DEFAULT);

    request.set(2);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.error()).not.toBeUndefined();
    expect(res.value()).toBe(DEFAULT);
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
    expect(res.status()).toBe(ResourceStatus.Reloading);
    expect(res.value()).toBe('0:0');

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

  it('should synchronously change states', async () => {
    const request = signal<number | undefined>(undefined);
    const backend = new MockEchoBackend();
    const echoResource = resource({
      request,
      loader: (params) => backend.fetch(params.request),
      injector: TestBed.inject(Injector),
    });
    // Idle to start.
    expect(echoResource.status()).toBe(ResourceStatus.Idle);
    // Switch to loading state should be synchronous.
    request.set(1);
    expect(echoResource.status()).toBe(ResourceStatus.Loading);
    // And back to idle.
    request.set(undefined);
    expect(echoResource.status()).toBe(ResourceStatus.Idle);
    // Allow the load to proceed.
    request.set(2);
    TestBed.flushEffects();
    await backend.flush();
    expect(echoResource.status()).toBe(ResourceStatus.Resolved);
    // Reload state should be synchronous.
    echoResource.reload();
    expect(echoResource.status()).toBe(ResourceStatus.Reloading);
    // Back to idle.
    request.set(undefined);
    expect(echoResource.status()).toBe(ResourceStatus.Idle);
  });
  it('set() should abort a pending load', async () => {
    const request = signal<number | undefined>(1);
    const backend = new MockEchoBackend();
    const echoResource = resource({
      request,
      loader: (params) => backend.fetch(params.request),
      injector: TestBed.inject(Injector),
    });
    const appRef = TestBed.inject(ApplicationRef);
    // Fully resolve the resource to start.
    TestBed.flushEffects();
    await backend.flush();
    expect(echoResource.status()).toBe(ResourceStatus.Resolved);
    // Trigger loading state.
    request.set(2);
    expect(echoResource.status()).toBe(ResourceStatus.Loading);
    // Set the resource to a new value.
    echoResource.set(3);
    // Now run the effect, which should be a no-op as the resource was set to a local value.
    TestBed.flushEffects();
    // We should still be in local state.
    expect(echoResource.status()).toBe(ResourceStatus.Local);
    expect(echoResource.value()).toBe(3);
    // Flush the resource
    await backend.flush();
    await appRef.whenStable();
    // We should still be in local state.
    expect(echoResource.status()).toBe(ResourceStatus.Local);
    expect(echoResource.value()).toBe(3);
  });

  it('set() should abort a pending reload', async () => {
    const request = signal<number | undefined>(1);
    const backend = new MockEchoBackend();
    const echoResource = resource({
      request,
      loader: (params) => backend.fetch(params.request),
      injector: TestBed.inject(Injector),
    });
    const appRef = TestBed.inject(ApplicationRef);
    // Fully resolve the resource to start.
    TestBed.flushEffects();
    await backend.flush();
    expect(echoResource.status()).toBe(ResourceStatus.Resolved);
    // Trigger reloading state.
    echoResource.reload();
    expect(echoResource.status()).toBe(ResourceStatus.Reloading);
    // Set the resource to a new value.
    echoResource.set(3);
    // Now run the effect, which should be a no-op as the resource was set to a local value.
    TestBed.flushEffects();
    // We should still be in local state.
    expect(echoResource.status()).toBe(ResourceStatus.Local);
    expect(echoResource.value()).toBe(3);
    // Flush the resource
    await backend.flush();
    await appRef.whenStable();
    // We should still be in local state.
    expect(echoResource.status()).toBe(ResourceStatus.Local);
    expect(echoResource.value()).toBe(3);
  });

  it('should allow streaming', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const res = resource({
      stream: async () => signal({value: 'done'}),
      injector: TestBed.inject(Injector),
    });

    await appRef.whenStable();
    expect(res.status()).toBe(ResourceStatus.Resolved);
    expect(res.value()).toBe('done');
  });

  it('should error via error()', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const res = resource({
      stream: async () => signal({error: 'fail'}),
      injector: TestBed.inject(Injector),
    });

    await appRef.whenStable();
    expect(res.status()).toBe(ResourceStatus.Error);
    expect(res.error()).toBe('fail');
  });

  it('should transition across streamed states', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const stream = signal<{value: number} | {error: unknown}>({value: 1});

    const res = resource({
      stream: async () => stream,
      injector: TestBed.inject(Injector),
    });
    await appRef.whenStable();

    stream.set({value: 2});
    expect(res.value()).toBe(2);

    stream.set({value: 3});
    expect(res.value()).toBe(3);

    stream.set({error: 'fail'});
    expect(res.error()).toBe('fail');

    stream.set({value: 4});
    expect(res.value()).toBe(4);
  });

  it('should not accept new values/errors after a request is cancelled', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const stream = signal<{value: number} | {error: unknown}>({value: 0});
    const request = signal(1);
    const res = resource({
      request,
      stream: async ({request}) => {
        if (request === 1) {
          return stream;
        } else {
          return signal({value: 0});
        }
      },
      injector: TestBed.inject(Injector),
    });
    await appRef.whenStable();

    stream.set({value: 1});
    expect(res.value()).toBe(1);

    // Changing the request aborts the previous one.
    request.set(2);

    // The previous set/error functions should no longer result in changes to the resource.
    stream.set({value: 2});
    expect(res.value()).toBe(undefined);
    stream.set({error: 'fail'});
    expect(res.value()).toBe(undefined);
  });

  it('should interrupt pending request if the same value is set', async () => {
    const counter = signal(0);
    const backend = new MockEchoBackend<{counter: number} | null>();
    const aborted: ({counter: number} | null)[] = [];
    const echoResource = resource<{counter: number} | null, {counter: number} | null>({
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

    // Start the initial load.
    TestBed.flushEffects();
    await Promise.resolve();
    expect(echoResource.status()).toBe(ResourceStatus.Loading);
    expect(echoResource.value()).toBe(undefined);
    expect(echoResource.error()).toBe(undefined);
    expect(aborted).toEqual([]);

    // Interrupt by setting a value before the request has resolved.
    echoResource.set(null);
    TestBed.flushEffects();
    await backend.flush();
    expect(echoResource.status()).toBe(ResourceStatus.Local);
    expect(echoResource.value()).toBe(null);
    expect(echoResource.error()).toBe(undefined);
    expect(aborted).toEqual([{counter: 0}]);

    // Reload the resource to trigger another request.
    echoResource.reload();
    TestBed.flushEffects();
    await Promise.resolve();
    expect(echoResource.status()).toBe(ResourceStatus.Reloading);
    expect(echoResource.value()).toBe(null);
    expect(echoResource.error()).toBe(undefined);
    expect(aborted).toEqual([{counter: 0}]);

    // Interrupt the reload with the same value as before.
    echoResource.set(null);
    await backend.flush();
    expect(echoResource.status()).toBe(ResourceStatus.Local);
    expect(echoResource.value()).toBe(null);
    expect(echoResource.error()).toBe(undefined);
    expect(aborted).toEqual([{counter: 0}, {counter: 0}]);
  });
});

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
