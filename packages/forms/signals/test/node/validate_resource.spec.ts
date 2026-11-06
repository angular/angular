/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  ApplicationRef,
  effect,
  inject,
  Injector,
  makeStateKey,
  TransferState,
  resource,
  Resource,
  resourceFromSnapshots,
  ResourceSnapshot,
  settledResourceValue,
  signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {timeout, useAutoTick, waitFor} from '@angular/private/testing';
import {applyEach, form, validateResource} from '../../public_api';

describe('validateResource', () => {
  useAutoTick();
  let appRef: ApplicationRef;
  let injector: Injector;
  beforeEach(() => {
    appRef = TestBed.inject(ApplicationRef);
    injector = TestBed.inject(Injector);
  });

  it('should create one factory in injection context and read current params synchronously', async () => {
    const factory = jasmine
      .createSpy('factory')
      .and.callFake((params: Resource<string | undefined>) => {
        expect(inject(Injector)).toBeDefined();
        const value = settledResourceValue(params);
        return resourceFromSnapshots(() => ({status: 'resolved', value: value()}));
      });
    const f = form(
      signal('initial'),
      (p) =>
        validateResource(p, {
          params: ({value}) => value(),
          factory,
          onSuccess: (value: string) => ({kind: value}),
          onError: () => undefined,
        }),
      {injector},
    );
    expect(f().errors()).toEqual([{kind: 'initial', fieldTree: f}]);
    f().value.set('updated');
    expect(f().errors()).toEqual([{kind: 'updated', fieldTree: f}]);
    await appRef.whenStable();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should safely consume params in effects and compute the new result before effects flush', async () => {
    const debounce = controlledDebounce();
    const consume = jasmine.createSpy('consume');
    const success = jasmine.createSpy('success');
    const f = form(
      signal('initial'),
      (p) =>
        validateResource(p, {
          params: ({value}) => value(),
          debounce: debounce.wait,
          factory: (source) => {
            const params = settledResourceValue(source);
            effect(() => consume(params()));
            return resourceFromSnapshots(() => {
              const value = params();
              return {status: value === undefined ? 'idle' : 'resolved', value};
            });
          },
          onSuccess: (result, ctx) => {
            success(result, ctx.value());
          },
          onError: () => undefined,
        }),
      {injector},
    );
    await appRef.whenStable();
    expect(f().valid()).toBeTrue();
    success.calls.reset();
    f().value.set('updated');
    await appRef.whenStable();
    expect(f().pending()).toBeTrue();
    expect(consume.calls.allArgs()).toEqual([['initial'], [undefined]]);
    expect(success).not.toHaveBeenCalled();
    await debounce.resolve();
    expect(f().pending()).toBeFalse();
    expect(success).toHaveBeenCalledOnceWith('updated', 'updated');
    await appRef.whenStable();
    expect(consume.calls.mostRecent().args).toEqual(['updated']);
  });

  for (const status of ['idle', 'loading', 'reloading', 'resolved', 'local', 'error'] as const) {
    it(`should propagate target ${status} only after source debounce settles`, async () => {
      const debounce = controlledDebounce();
      const error = new Error('target failure');
      const snapshot = signal<ResourceSnapshot<string | undefined>>({
        status: 'resolved',
        value: 'initial',
      });
      const onError = jasmine.createSpy('onError').and.returnValue({kind: 'error'});
      const f = form(
        signal('initial'),
        (p) =>
          validateResource(p, {
            params: ({value}) => value(),
            debounce: debounce.wait,
            factory: () => resourceFromSnapshots(snapshot),
            onSuccess: (value) => ({kind: value}),
            onError,
          }),
        {injector},
      );
      await appRef.whenStable();
      f().value.set('updated');
      await appRef.whenStable();
      snapshot.set(
        status === 'error'
          ? {status, error}
          : {status, value: status === 'idle' ? undefined : 'result'},
      );
      expect(f().pending()).toBeTrue();
      expect(f().errors()).toEqual([]);
      expect(onError).not.toHaveBeenCalled();
      await debounce.resolve();
      await appRef.whenStable();
      expect(f().pending()).toBe(status === 'loading' || status === 'reloading');
      expect(f().errors()).toEqual(
        status === 'resolved' || status === 'local'
          ? [{kind: 'result', fieldTree: f}]
          : status === 'error'
            ? [{kind: 'error', fieldTree: f}]
            : [],
      );
    });
  }

  for (const value of [false, 0, '', null, undefined]) {
    it(`should distinguish a ${String(value)} result from an unavailable result`, async () => {
      const success = jasmine.createSpy('success');
      const f = form(
        signal('input'),
        (p) =>
          validateResource(p, {
            params: ({value}) => value(),
            factory: () => resourceFromSnapshots(() => ({status: 'resolved', value})),
            onSuccess: (result) => {
              success(result);
            },
            onError: () => undefined,
          }),
        {injector},
      );
      await appRef.whenStable();
      expect(f().valid()).toBeTrue();
      expect(success.calls.allArgs()).toEqual(value === undefined ? [] : [[value]]);
    });
  }

  it('should skip settled undefined params even when the target has cached data', async () => {
    const success = jasmine.createSpy('success');
    const f = form(
      signal<string | undefined>('input'),
      (p) =>
        validateResource(p, {
          params: ({value}) => value(),
          factory: () => resourceFromSnapshots(() => ({status: 'resolved', value: 'cached'})),
          onSuccess: (result) => {
            success(result);
          },
          onError: () => undefined,
        }),
      {injector},
    );
    await appRef.whenStable();
    expect(f().valid()).toBeTrue();
    success.calls.reset();
    f().value.set(undefined);
    await appRef.whenStable();
    expect(f().pending()).toBeFalse();
    expect(f().valid()).toBeTrue();
    expect(success).not.toHaveBeenCalled();
  });

  for (const debounce of [undefined, 5]) {
    for (const callback of ['params', 'when'] as const) {
      for (const thrown of [new Error('params failed'), undefined, 'bad', {reason: 'bad'}]) {
        it(`should normalize ${String(thrown)} thrown by ${callback} ${debounce === undefined ? 'without' : 'with'} debounce and recover`, async () => {
          const consume = jasmine.createSpy('consume');
          const onError = jasmine.createSpy('onError').and.returnValue({kind: 'params'});
          const fail = signal(false);
          const f = form(
            signal('initial'),
            (p) =>
              validateResource(p, {
                params: ({value}) => {
                  if (callback === 'params' && fail()) throw thrown;
                  return value();
                },
                when: () => {
                  if (callback === 'when' && fail()) throw thrown;
                  return true;
                },
                debounce,
                factory: (source) => {
                  const params = settledResourceValue(source);
                  effect(() => consume(params()));
                  return resourceFromSnapshots(() => ({status: 'resolved', value: params()}));
                },
                onSuccess: () => undefined,
                onError,
              }),
            {injector},
          );
          await appRef.whenStable();
          expect(f().valid()).toBeTrue();
          fail.set(true);
          await appRef.whenStable();
          expect(f().errors()).toEqual([{kind: 'params', fieldTree: f}]);
          const error = onError.calls.mostRecent().args[0] as Error;
          expect(error).toEqual(jasmine.any(Error));
          if (thrown instanceof Error) expect(error).toBe(thrown);
          else expect(error.cause).toBe(thrown);
          expect(consume.calls.mostRecent().args).toEqual([undefined]);
          fail.set(false);
          await appRef.whenStable();
          // Error recovery may be debounced, but debounced() does not register pending tasks.
          if (debounce !== undefined) await timeout(debounce);
          await appRef.whenStable();
          expect(f().valid()).toBeTrue();
        });
      }
    }
  }

  for (const state of ['debounce', 'source error', 'target error'] as const) {
    it(`should forward repeated reloads with the receiver intact during ${state}`, async () => {
      const debounce = controlledDebounce();
      const error = signal(false);
      let count = 0;
      const target = Object.assign(
        resourceFromSnapshots<string | undefined>(() =>
          state === 'target error'
            ? {status: 'error', error: new Error('target')}
            : {status: 'resolved', value: 'cached'},
        ),
        {
          reload() {
            expect(this).toBe(target);
            count++;
            return true;
          },
        },
      );
      const f = form(
        signal('initial'),
        (p) =>
          validateResource(p, {
            params: ({value}) => {
              if (error()) throw new Error('source');
              return value();
            },
            debounce: debounce.wait,
            factory: () => target,
            onSuccess: () => undefined,
            onError: () => ({kind: 'error'}),
          }),
        {injector},
      );
      await appRef.whenStable();
      if (state === 'source error') error.set(true);
      else if (state === 'debounce') f().value.set('updated');
      await appRef.whenStable();
      f().reloadValidation();
      f().reloadValidation();
      expect(count).toBe(2);
      if (state === 'debounce') await debounce.resolve();
      await appRef.whenStable();
      expect(count).toBe(2);
    });
  }

  it('should support a resource with no reload method', async () => {
    const f = form(
      signal('input'),
      (p) =>
        validateResource(p, {
          params: ({value}) => value(),
          factory: () => resourceFromSnapshots(() => ({status: 'resolved', value: true})),
          onSuccess: () => undefined,
          onError: () => undefined,
        }),
      {injector},
    );
    await appRef.whenStable();
    expect(() => f().reloadValidation()).not.toThrow();
  });

  it('should not publish a configured default or retained reload value as completed validation', async () => {
    const request = Promise.withResolvers<string>();
    const loader = jasmine.createSpy('loader').and.returnValue(request.promise);
    const success = jasmine.createSpy('success');
    const f = form(
      signal('input'),
      (p) =>
        validateResource(p, {
          params: ({value}) => value(),
          factory: (params) =>
            resource<string, string | undefined>({
              params: ({chain}) => chain(params),
              loader,
              defaultValue: 'default',
            }),
          onSuccess: (value) => {
            success(value);
          },
          onError: () => undefined,
        }),
      {injector},
    );
    expect(f().pending()).toBeTrue();
    expect(success).not.toHaveBeenCalled();
    request.resolve('loaded');
    await appRef.whenStable();
    expect(f().valid()).toBeTrue();
    expect(success).toHaveBeenCalledOnceWith('loaded');
    const reload = Promise.withResolvers<string>();
    loader.and.returnValue(reload.promise);
    success.calls.reset();
    f().reloadValidation();
    expect(f().pending()).toBeTrue();
    expect(success).not.toHaveBeenCalled();
    reload.resolve('reloaded');
    await appRef.whenStable();
    expect(f().valid()).toBeTrue();
    expect(success).toHaveBeenCalledOnceWith('reloaded');
  });
  for (const status of ['resolved', 'loading', 'error'] as const) {
    it(`should propagate the target's ${status} state when debounce settles back to the original params`, async () => {
      const debounce = controlledDebounce();
      const targetSnapshot: ResourceSnapshot<string | undefined> =
        status === 'error'
          ? {status: 'error', error: new Error('A failure')}
          : {status, value: 'A result'};
      const reload = jasmine.createSpy('reload').and.returnValue(false);
      const success = jasmine.createSpy('success');
      const onError = jasmine.createSpy('onError').and.returnValue({kind: 'target-error'});
      const f = form(
        signal('A'),
        (p) =>
          validateResource(p, {
            params: ({value}) => value(),
            debounce: debounce.wait,
            factory: (source) => {
              const params = settledResourceValue(source);
              return Object.assign(
                resourceFromSnapshots<string | undefined>(() => {
                  if (params() === undefined) return {status: 'idle', value: undefined};
                  return params() === 'A' ? targetSnapshot : {status: 'loading', value: undefined};
                }),
                {reload},
              );
            },
            onSuccess: (result, ctx) => {
              success(result, ctx.value());
            },
            onError,
          }),
        {injector},
      );
      await appRef.whenStable();
      expect(f().pending()).toBe(status === 'loading');
      expect(f().valid()).toBe(status === 'resolved');
      expect(f().errors()).toEqual(
        status === 'error' ? [{kind: 'target-error', fieldTree: f}] : [],
      );
      success.calls.reset();
      onError.calls.reset();
      f().value.set('B');
      await appRef.whenStable();
      expect(f().pending()).toBeTrue();
      f().value.set('A');
      await appRef.whenStable();
      expect(f().pending()).toBeTrue();
      expect(f().errors()).toEqual([]);
      expect(onError).not.toHaveBeenCalled();
      expect(success).not.toHaveBeenCalled();
      await debounce.resolve();
      expect(f().pending()).toBe(status === 'loading');
      expect(f().errors()).toEqual(
        status === 'error' ? [{kind: 'target-error', fieldTree: f}] : [],
      );
      expect(success.calls.allArgs()).toEqual(status === 'resolved' ? [['A result', 'A']] : []);
      expect(reload).not.toHaveBeenCalled();
    });
  }

  it('should clean up a custom subscription while debouncing and when its field is removed', async () => {
    const model = signal([{name: 'A'}]);
    const debounce = controlledDebounce();
    const subscribe = jasmine.createSpy('subscribe');
    const unsubscribe = jasmine.createSpy('unsubscribe');
    const f = form(
      model,
      (p) =>
        applyEach(p, (item) =>
          validateResource(item.name, {
            params: ({value}) => value(),
            debounce: debounce.wait,
            factory: (source) => {
              const params = settledResourceValue(source);
              effect((onCleanup) => {
                const value = params();
                if (value !== undefined) {
                  subscribe(value);
                  onCleanup(() => unsubscribe(value));
                }
              });
              return resourceFromSnapshots(() => ({status: 'resolved', value: params()}));
            },
            onSuccess: () => undefined,
            onError: () => undefined,
          }),
        ),
      {injector},
    );
    await appRef.whenStable();
    expect(subscribe).toHaveBeenCalledOnceWith('A');
    f[0].name().value.set('B');
    await appRef.whenStable();
    expect(unsubscribe).toHaveBeenCalledOnceWith('A');
    await debounce.resolve();
    await appRef.whenStable();
    expect(subscribe.calls.allArgs()).toEqual([['A'], ['B']]);
    model.set([]);
    await appRef.whenStable();
    expect(unsubscribe.calls.allArgs()).toEqual([['A'], ['B']]);
  });

  it('should discard an obsolete server result before it can enter TransferState', async () => {
    const wasServer = globalThis['ngServerMode'];
    globalThis['ngServerMode'] = true;
    try {
      const transferState = TestBed.inject(TransferState);
      const key = makeStateKey<string>('validation-result');
      const initial = Promise.withResolvers<string>();
      const updated = Promise.withResolvers<string>();
      const debounce = controlledDebounce();
      const loader = jasmine
        .createSpy('loader')
        .and.callFake(({params}: {params: string}) =>
          params === 'A' ? initial.promise : updated.promise,
        );
      const f = form(
        signal('A'),
        (p) =>
          validateResource(p, {
            params: ({value}) => value(),
            debounce: debounce.wait,
            factory: (source) =>
              resource<string, string | undefined>({
                params: ({chain}) => chain(source),
                loader,
                id: key,
              }),
            onSuccess: () => undefined,
            onError: () => undefined,
          }),
        {injector},
      );
      await waitFor(() => throwUnless(loader).toHaveBeenCalledTimes(1));
      f().value.set('B');
      await timeout(0);
      initial.resolve('stale');
      await appRef.whenStable();
      expect(transferState.hasKey(key)).toBeFalse();
      await debounce.resolve();
      await waitFor(() => throwUnless(loader).toHaveBeenCalledTimes(2));
      updated.resolve('current');
      await appRef.whenStable();
      expect(transferState.get(key, '')).toBe('current');
    } finally {
      globalThis['ngServerMode'] = wasServer;
    }
  });
});

function controlledDebounce() {
  let pending: ReturnType<typeof Promise.withResolvers<void>>;
  return {
    wait: () => (pending = Promise.withResolvers<void>()).promise,
    resolve: () => {
      pending.resolve();
      return pending.promise;
    },
  };
}
