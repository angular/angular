/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  computed,
  createEnvironmentInjector,
  effect,
  EnvironmentInjector,
  Injector,
  resource,
  ResourceStatus,
  signal,
} from '../../src/core';
import {TestBed} from '../../testing';

import type {PromiseConstructor} from '../../src/util/promise_with_resolvers';

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
      params: () => ({counter: counter()}),
      loader: (params) => backend.fetch(params.params),
      injector: TestBed.inject(Injector),
    });

    // a freshly created resource is in the loading state
    expect(echoResource.status()).toBe('loading');
    expect(echoResource.isLoading()).toBeTrue();
    expect(echoResource.hasValue()).toBeFalse();
    expect(echoResource.value()).toBeUndefined();
    expect(echoResource.error()).toBe(undefined);
    TestBed.tick();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual({counter: 0});
    expect(echoResource.error()).toBe(undefined);

    counter.update((c) => c + 1);
    TestBed.tick();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
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

    TestBed.tick();
    await flushMicrotasks();

    expect(prevStatus).toBe('idle');
  });

  it('should expose errors thrown during resource loading', async () => {
    const backend = new MockEchoBackend();
    const requestParam = {};
    const echoResource = resource({
      params: () => requestParam,
      loader: (params) => backend.fetch(params.params),
      injector: TestBed.inject(Injector),
    });

    TestBed.tick();
    await backend.reject(requestParam, new Error('Something went wrong....'));

    expect(echoResource.status()).toBe('error');
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeFalse();

    const err = extractError(() => echoResource.value())!;
    expect(err).not.toBeUndefined();
    expect(err instanceof Error).toBeTrue();
    expect(err!.message).toContain('Resource');
    expect(err.cause).toEqual(new Error('Something went wrong....'));
    expect(echoResource.error()).toEqual(new Error('Something went wrong....'));
  });

  it('should expose errors on reload', async () => {
    const backend = new MockEchoBackend();
    const counter = signal(0);
    const echoResource = resource({
      params: () => ({counter: counter()}),
      loader: (params) => {
        if (params.params.counter % 2 === 0) {
          return Promise.resolve('ok');
        } else {
          throw new Error('KO');
        }
      },
      injector: TestBed.inject(Injector),
    });

    TestBed.tick();
    await backend.flush();

    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual('ok');
    expect(echoResource.error()).toBe(undefined);

    counter.update((value) => value + 1);
    TestBed.tick();
    await backend.flush();

    expect(echoResource.status()).toBe('error');
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeFalse();
    const err = extractError(() => echoResource.value())!;
    expect(err).not.toBeUndefined();
    expect(err.message).toContain('Resource');
    expect(err.message).toContain('KO');
    expect(err.cause).toEqual(new Error('KO'));
    expect(echoResource.error()).toEqual(Error('KO'));

    counter.update((value) => value + 1);
    TestBed.tick();
    await backend.flush();

    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual('ok');
    expect(echoResource.error()).toBe(undefined);
  });

  it('should not trigger consumers on every status change via hasValue()', async () => {
    const params = signal<number | undefined>(undefined);
    const testResource = resource({
      params,
      // Hanging promise, never resolves
      loader: () => new Promise(() => {}),
      injector: TestBed.inject(Injector),
    });

    let effectRuns = 0;
    effect(
      () => {
        testResource.hasValue();
        effectRuns++;
      },
      {injector: TestBed.inject(Injector)},
    );

    TestBed.tick();
    // Params are undefined, status should be idle.
    expect(testResource.status()).toBe('idle');
    // Effect should run the first time.
    expect(effectRuns).toBe(1);

    // Set params, causing the stauts to become 'loading'.
    params.set(0);
    expect(testResource.status()).toBe('loading');
    TestBed.tick();
    // The effect should not rerun.
    expect(effectRuns).toBe(1);
  });

  it('should update computed signals', async () => {
    const backend = new MockEchoBackend();
    const counter = signal(0);
    const echoResource = resource({
      params: () => ({counter: counter()}),
      loader: (params) => {
        if (params.params.counter % 2 === 0) {
          return Promise.resolve(params.params.counter);
        } else {
          throw new Error('KO');
        }
      },
      injector: TestBed.inject(Injector),
    });
    const computedValue = computed(() => {
      if (!echoResource.hasValue()) {
        return -1;
      }
      return echoResource.value();
    });

    TestBed.tick();
    await backend.flush();

    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual(0);
    expect(computedValue()).toEqual(0);
    expect(echoResource.error()).toBe(undefined);

    counter.update((value) => value + 1);
    TestBed.tick();
    await backend.flush();

    expect(echoResource.status()).toBe('error');
    expect(echoResource.hasValue()).toBeFalse();
    const err = extractError(() => echoResource.value())!;
    expect(err).not.toBeUndefined();
    expect(err.message).toContain('Resource');
    expect(err.message).toContain('KO');
    expect(err.cause).toEqual(new Error('KO'));
    expect(computedValue()).toEqual(-1);
    expect(echoResource.error()).toEqual(Error('KO'));

    counter.update((value) => value + 1);
    TestBed.tick();
    await backend.flush();

    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual(2);
    expect(computedValue()).toEqual(2);
    expect(echoResource.error()).toBe(undefined);
  });

  it('should respond to a request that changes while loading', async () => {
    const appRef = TestBed.inject(ApplicationRef);

    const request = signal(0);
    let resolve: Array<() => void> = [];
    const res = resource({
      params: request,
      loader: async ({params}) => {
        const p = (Promise as unknown as PromiseConstructor).withResolvers<number>();
        resolve.push(() => p.resolve(params));
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
    expect(res.status()).toBe('loading');
    appRef.tick();
    expect(res.status()).toBe('loading');
    expect(resolve.length).toBe(2);

    // Resolve the second load.
    resolve[1]?.();
    await flushMicrotasks();

    // We should see the resolved value.
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe(1);
  });

  it('should throw an error when getting a value even when provided with a default value', async () => {
    const DEFAULT: string[] = [];
    const request = signal(0);
    const res = resource({
      params: request,
      loader: async ({params}) => {
        if (params === 1) {
          throw new Error('err');
        }
        return ['data'];
      },
      defaultValue: DEFAULT,
      injector: TestBed.inject(Injector),
    });
    expect(res.value()).toBe(DEFAULT);

    // Verify the value is not the default one on request resolution.
    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.value()).not.toBe(DEFAULT);

    // Retain the non-default value during request execution.
    request.set(1);
    expect(res.value()).not.toBe(DEFAULT);

    // Resolve the request.
    await TestBed.inject(ApplicationRef).whenStable();
    expect(res.error()).not.toBeUndefined();
    const err = extractError(() => res.value())!;
    expect(err).not.toBeUndefined();
    expect(err.message).toContain('Resource');
    expect(err.message).toContain('err');
    expect(err.cause).toEqual(new Error('err'));
  });

  it('should _not_ load if the request resolves to undefined', () => {
    const counter = signal(0);
    const backend = new MockEchoBackend();
    const echoResource = resource({
      params: () => (counter() > 5 ? {counter: counter()} : undefined),
      loader: (params) => backend.fetch(params.params),
      injector: TestBed.inject(Injector),
    });

    TestBed.tick();
    expect(echoResource.status()).toBe('idle');
    expect(echoResource.isLoading()).toBeFalse();

    counter.set(10);
    TestBed.tick();
    expect(echoResource.isLoading()).toBeTrue();
  });

  it('should cancel pending requests before starting a new one', async () => {
    const counter = signal(0);
    const backend = new MockEchoBackend<{counter: number}>();
    const aborted: {counter: number}[] = [];
    const echoResource = resource<{counter: number}, {counter: number}>({
      params: () => ({counter: counter()}),
      loader: ({params, abortSignal}) => {
        abortSignal.addEventListener('abort', () => backend.abort(params));
        return backend.fetch(params).catch((reason) => {
          if (reason === 'aborted') {
            aborted.push(params);
          }
          throw new Error(reason);
        });
      },
      injector: TestBed.inject(Injector),
    });

    // start a request without resolving the previous one
    TestBed.tick();
    await Promise.resolve();

    // start a new request and resolve all
    counter.update((c) => c + 1);
    TestBed.tick();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
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
      params: () => ({counter: counter()}),
      loader: ({params, abortSignal}) => {
        abortSignal.addEventListener('abort', () => backend.abort(params));
        return backend.fetch(params).catch((reason) => {
          if (reason === 'aborted') {
            aborted.push(params);
          }
          throw new Error(reason);
        });
      },
      injector,
    });

    // start a request without resolving the previous one
    TestBed.tick();
    await Promise.resolve();

    injector.destroy();
    await backend.flush();
    expect(echoResource.status()).toBe('idle');
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
      params: () => ({counter: counter()}),
      loader: ({params, abortSignal}) => {
        abortSignal.addEventListener('abort', () => backend.abort(params));
        return backend.fetch(params).catch((reason) => {
          if (reason === 'aborted') {
            aborted.push(params);
          }
          throw new Error(reason);
        });
      },
      injector,
    });

    // start a request without resolving the previous one
    TestBed.tick();
    await Promise.resolve();

    echoResource.destroy();
    await backend.flush();

    expect(echoResource.status()).toBe('idle');
    expect(echoResource.value()).toBe(undefined);
    expect(echoResource.error()).toBe(undefined);

    expect(aborted).toEqual([{counter: 0}]);
  });

  it('should not respond to reactive state changes in a loader', async () => {
    const unrelated = signal('a');
    const backend = new MockResponseCountingBackend();
    const res = resource<string, number>({
      params: () => 0,
      loader: (params) => {
        // read reactive state and assure it is _not_ tracked
        unrelated();
        return backend.fetch(params.params);
      },
      injector: TestBed.inject(Injector),
    });

    TestBed.tick();
    await backend.flush();
    expect(res.value()).toBe('0:0');

    unrelated.set('b');
    TestBed.tick();
    // there is no chang in the status
    expect(res.status()).toBe('resolved');
    await backend.flush();
    // there is no chang in the value
    expect(res.value()).toBe('0:0');
  });

  it('should allow setting local state', async () => {
    const counter = signal(0);
    const backend = new MockEchoBackend();
    const echoResource = resource({
      params: () => ({counter: counter()}),
      loader: (params) => backend.fetch(params.params),
      injector: TestBed.inject(Injector),
    });

    TestBed.tick();
    await backend.flush();

    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.value()).toEqual({counter: 0});
    expect(echoResource.error()).toBe(undefined);

    echoResource.value.set({counter: 100});
    expect(echoResource.status()).toBe('local');
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual({counter: 100});
    expect(echoResource.error()).toBe(undefined);

    counter.set(1);
    TestBed.tick();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.value()).toEqual({counter: 1});
    expect(echoResource.error()).toBe(undefined);

    // state setter is also exposed on the resource directly
    echoResource.set({counter: 200});
    expect(echoResource.status()).toBe('local');
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual({counter: 200});
  });

  it('should allow re-fetching data', async () => {
    const backend = new MockResponseCountingBackend();
    const res = resource<string, number>({
      params: () => 0,
      loader: (params) => backend.fetch(params.params),
      injector: TestBed.inject(Injector),
    });

    TestBed.tick();
    await backend.flush();
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('0:0');
    expect(res.error()).toBe(undefined);

    res.reload();
    expect(res.status()).toBe('reloading');
    expect(res.value()).toBe('0:0');

    TestBed.tick();
    await backend.flush();
    expect(res.status()).toBe('resolved');
    expect(res.isLoading()).toBeFalse();
    expect(res.value()).toBe('0:1');
    expect(res.error()).toBe(undefined);

    // calling refresh multiple times should _not_ result in multiple requests
    res.reload();
    TestBed.tick();
    res.reload();
    TestBed.tick();
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
    expect(res.status()).toBe('local');
    expect(res.value()).toBe(5);
    expect(res.error()).toBe(undefined);

    res.value.set(10);
    expect(res.status()).toBe('local');
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
      params: request,
      loader: (params) => backend.fetch(params.params),
      injector: TestBed.inject(Injector),
    });
    // Idle to start.
    expect(echoResource.status()).toBe('idle');
    // Switch to loading state should be synchronous.
    request.set(1);
    expect(echoResource.status()).toBe('loading');
    // And back to idle.
    request.set(undefined);
    expect(echoResource.status()).toBe('idle');
    // Allow the load to proceed.
    request.set(2);
    TestBed.tick();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    // Reload state should be synchronous.
    echoResource.reload();
    expect(echoResource.status()).toBe('reloading');
    // Back to idle.
    request.set(undefined);
    expect(echoResource.status()).toBe('idle');
  });
  it('set() should abort a pending load', async () => {
    const request = signal<number | undefined>(1);
    const backend = new MockEchoBackend();
    const echoResource = resource({
      params: request,
      loader: (params) => backend.fetch(params.params),
      injector: TestBed.inject(Injector),
    });
    const appRef = TestBed.inject(ApplicationRef);
    // Fully resolve the resource to start.
    TestBed.tick();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    // Trigger loading state.
    request.set(2);
    expect(echoResource.status()).toBe('loading');
    // Set the resource to a new value.
    echoResource.set(3);
    // Now run the effect, which should be a no-op as the resource was set to a local value.
    TestBed.tick();
    // We should still be in local state.
    expect(echoResource.status()).toBe('local');
    expect(echoResource.value()).toBe(3);
    // Flush the resource
    await backend.flush();
    await appRef.whenStable();
    // We should still be in local state.
    expect(echoResource.status()).toBe('local');
    expect(echoResource.value()).toBe(3);
  });

  it('set() should abort a pending reload', async () => {
    const request = signal<number | undefined>(1);
    const backend = new MockEchoBackend();
    const echoResource = resource({
      params: request,
      loader: (params) => backend.fetch(params.params),
      injector: TestBed.inject(Injector),
    });
    const appRef = TestBed.inject(ApplicationRef);
    // Fully resolve the resource to start.
    TestBed.tick();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    // Trigger reloading state.
    echoResource.reload();
    expect(echoResource.status()).toBe('reloading');
    // Set the resource to a new value.
    echoResource.set(3);
    // Now run the effect, which should be a no-op as the resource was set to a local value.
    TestBed.tick();
    // We should still be in local state.
    expect(echoResource.status()).toBe('local');
    expect(echoResource.value()).toBe(3);
    // Flush the resource
    await backend.flush();
    await appRef.whenStable();
    // We should still be in local state.
    expect(echoResource.status()).toBe('local');
    expect(echoResource.value()).toBe(3);
  });

  it('should allow streaming', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const res = resource({
      stream: async () => signal({value: 'done'}),
      injector: TestBed.inject(Injector),
    });

    await appRef.whenStable();
    expect(res.status()).toBe('resolved');
    expect(res.value()).toBe('done');
  });

  it('should error via error()', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const res = resource({
      stream: async () => signal({error: new Error('fail')}),
      injector: TestBed.inject(Injector),
    });

    await appRef.whenStable();
    expect(res.status()).toBe('error');
    expect(res.error()).toEqual(new Error('fail'));
  });

  it('should transition across streamed states', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const stream = signal<{value: number} | {error: Error}>({value: 1});

    const res = resource({
      stream: async () => stream,
      injector: TestBed.inject(Injector),
    });
    await appRef.whenStable();

    stream.set({value: 2});
    expect(res.value()).toBe(2);

    stream.set({value: 3});
    expect(res.value()).toBe(3);

    stream.set({error: new Error('fail')});
    expect(res.error()).toEqual(new Error('fail'));

    stream.set({value: 4});
    expect(res.value()).toBe(4);
  });

  it('should not accept new errors after a request is cancelled', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const stream = signal<{value: number} | {error: Error}>({value: 0});
    const request = signal(1);
    const res = resource({
      params: request,
      stream: async ({params}) => {
        if (params === 1) {
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

    // The previous error functions should no longer result in changes to the resource.
    stream.set({error: new Error('fail')});
    expect(res.value()).toBe(undefined);
  });

  it('should interrupt pending request if the same value is set', async () => {
    const counter = signal(0);
    const backend = new MockEchoBackend<{counter: number} | null>();
    const aborted: ({counter: number} | null)[] = [];
    const echoResource = resource<{counter: number} | null, {counter: number} | null>({
      params: () => ({counter: counter()}),
      loader: ({params, abortSignal}) => {
        abortSignal.addEventListener('abort', () => backend.abort(params));
        return backend.fetch(params).catch((reason) => {
          if (reason === 'aborted') {
            aborted.push(params);
          }
          throw new Error(reason);
        });
      },
      injector: TestBed.inject(Injector),
    });

    // Start the initial load.
    TestBed.tick();
    await Promise.resolve();
    expect(echoResource.status()).toBe('loading');
    expect(echoResource.value()).toBe(undefined);
    expect(echoResource.error()).toBe(undefined);
    expect(aborted).toEqual([]);

    // Interrupt by setting a value before the request has resolved.
    echoResource.set(null);
    TestBed.tick();
    await backend.flush();
    expect(echoResource.status()).toBe('local');
    expect(echoResource.value()).toBe(null);
    expect(echoResource.error()).toBe(undefined);
    expect(aborted).toEqual([{counter: 0}]);

    // Reload the resource to trigger another request.
    echoResource.reload();
    TestBed.tick();
    await Promise.resolve();
    expect(echoResource.status()).toBe('reloading');
    expect(echoResource.value()).toBe(null);
    expect(echoResource.error()).toBe(undefined);
    expect(aborted).toEqual([{counter: 0}]);

    // Interrupt the reload with the same value as before.
    echoResource.set(null);
    await backend.flush();
    expect(echoResource.status()).toBe('local');
    expect(echoResource.value()).toBe(null);
    expect(echoResource.error()).toBe(undefined);
    expect(aborted).toEqual([{counter: 0}, {counter: 0}]);
  });

  it('should return default value when getting a value after reloading in the error state', async () => {
    const backend = new MockEchoBackend();
    const requestParam = {};
    const echoResource = resource({
      params: () => requestParam,
      loader: (params) => backend.fetch(params.params),
      injector: TestBed.inject(Injector),
      defaultValue: 'my-default-value',
    });

    TestBed.tick();
    await backend.reject(requestParam, new Error('Something went wrong....'));

    expect(echoResource.status()).toBe('error');
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeFalse();

    const errFromValue = extractError(() => echoResource.value())!;
    expect(errFromValue.message).toContain('Resource');
    expect(errFromValue.message).toContain('Something went wrong....');
    expect(errFromValue.cause).toEqual(new Error('Something went wrong....'));
    expect(echoResource.error()!).toEqual(new Error('Something went wrong....'));

    echoResource.reload();
    TestBed.tick();

    expect(echoResource.status()).toBe('reloading');
    expect(echoResource.isLoading()).toBeTrue();
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual('my-default-value');
    expect(echoResource.error()).toEqual(new Error('Something went wrong....'));

    await backend.flush();
    TestBed.tick();

    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.isLoading()).toBeFalse();
    expect(echoResource.hasValue()).toBeTrue();
    expect(echoResource.value()).toEqual({});
    expect(echoResource.error()).toEqual(undefined);
  });

  it('should retain the value from the last resolved request until the new request is loaded', async () => {
    const request = signal<number>(1);
    const backend = new MockEchoBackend();
    const echoResource = resource({
      params: request,
      loader: ({params}) => backend.fetch(params),
      injector: TestBed.inject(Injector),
    });

    // Fully resolve the resource to start.
    TestBed.tick();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.value()).toBe(1);

    // Trigger loading state and check if the value is retained.
    request.set(2);
    expect(echoResource.status()).toBe('loading');
    expect(echoResource.value()).toBe(1);

    // Verify that the value has been updated after the completion of the last request.
    TestBed.tick();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.value()).toBe(2);
  });

  it('should _not_ retain the value from the last errored request if a new request is loading', async () => {
    const request = signal<number>(1);
    const backend = new MockEchoBackend();
    const echoResource = resource({
      params: request,
      loader: ({params}) => backend.fetch(params),
      injector: TestBed.inject(Injector),
    });

    // Fully resolve the resource to start.
    TestBed.tick();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.value()).toBe(1);

    // Initiate and complete a second request that results in an error.
    request.set(2);
    TestBed.tick();
    await backend.reject(request(), new Error('Something went wrong....'));
    expect(echoResource.status()).toBe('error');
    expect(echoResource.hasValue()).toBeFalse();
    expect(echoResource.error()).toEqual(new Error('Something went wrong....'));

    // Initiate a third successful request and verify that the value is undefined (not `1`) during loading.
    request.set(3);
    expect(echoResource.status()).toBe('loading');
    expect(echoResource.value()).toBe(undefined);

    // Complete the last/third request and check if latest value has been set.
    TestBed.tick();
    await backend.flush();
    expect(echoResource.status()).toBe('resolved');
    expect(echoResource.value()).toBe(3);
  });
});

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function extractError(fn: () => unknown): Error | undefined {
  try {
    fn();
    return undefined;
  } catch (err: unknown) {
    return err as Error;
  }
}
