/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ApplicationRef, Injector, ResourceLoaderParams, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {timeout, useAutoTick, waitFor} from '@angular/private/testing';
import {applyEach, form, validateAsyncLoader} from '../../public_api';

describe('validateAsyncLoader', () => {
  useAutoTick();
  let injector: Injector;
  let appRef: ApplicationRef;
  beforeEach(() => {
    injector = TestBed.inject(Injector);
    appRef = TestBed.inject(ApplicationRef);
  });

  it('should accept PromiseLike loaders and provide defined params, an abort signal, and previous status', async () => {
    const loader = jasmine
      .createSpy('loader')
      .and.callFake((args: ResourceLoaderParams<string>) => {
        expect(args.params).toBe('input');
        expect(args.abortSignal).toEqual(jasmine.any(AbortSignal));
        expect(args.previous.status).toBe('idle');
        const result = Promise.resolve('result');
        // A thenable without Promise's catch/finally methods.
        return {then: result.then.bind(result)};
      });
    const f = form(
      signal('input'),
      (p) =>
        validateAsyncLoader(p, {
          params: ({value}) => value(),
          loader,
          onSuccess: (result: string) => ({kind: result}),
          onError: () => undefined,
        }),
      {injector},
    );
    await appRef.whenStable();
    expect(f().errors()).toEqual([{kind: 'result', fieldTree: f}]);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('should supply loading as the previous loader status after debounce', async () => {
    const debounce = controlledDebounce();
    const loader = jasmine
      .createSpy('loader')
      .and.callFake(async ({previous}: ResourceLoaderParams<string>) => previous.status);
    const f = form(
      signal('initial'),
      (p) =>
        validateAsyncLoader(p, {
          params: ({value}) => value(),
          debounce: debounce.wait,
          loader,
          onSuccess: (status) => (status === 'idle' ? {kind: 'idle'} : undefined),
          onError: () => undefined,
        }),
      {injector},
    );
    await appRef.whenStable();
    expect(f().invalid()).toBeTrue();
    f().value.set('updated');
    await appRef.whenStable();
    expect(f().pending()).toBeTrue();
    await debounce.resolve();
    await appRef.whenStable();
    expect(loader).toHaveBeenCalledTimes(2);
    expect(loader.calls.mostRecent().args[0].previous.status).toBe('loading');
    expect(f().valid()).toBeTrue();
  });

  for (const reload of [false, true]) {
    it(`should retry failed A -> B -> A ${reload ? 'with' : 'without'} reloadValidation during debounce`, async () => {
      const debounce = controlledDebounce();
      const loader = jasmine.createSpy('loader').and.callFake(async () => {
        if (loader.calls.count() === 1) throw new Error('temporary');
        return true;
      });
      const f = form(
        signal('A'),
        (p) =>
          validateAsyncLoader(p, {
            params: ({value}) => value(),
            debounce: debounce.wait,
            loader,
            onSuccess: () => undefined,
            onError: () => ({kind: 'remote'}),
          }),
        {injector},
      );
      await appRef.whenStable();
      expect(f().invalid()).toBeTrue();
      f().value.set('B');
      await appRef.whenStable();
      expect(f().pending()).toBeTrue();
      expect(f().errors()).toEqual([]);
      f().value.set('A');
      await appRef.whenStable();
      if (reload) f().reloadValidation();
      expect(loader).toHaveBeenCalledTimes(1);
      await debounce.resolve();
      await appRef.whenStable();
      expect(loader).toHaveBeenCalledTimes(2);
      expect(loader.calls.mostRecent().args[0].params).toBe('A');
      expect(f().valid()).toBeTrue();
    });
  }

  for (const outcome of ['resolve', 'reject'] as const) {
    it(`should ignore a stale ${outcome} during debounce and validate the new context`, async () => {
      const debounce = controlledDebounce();
      const initial = Promise.withResolvers<string>();
      const updated = Promise.withResolvers<string>();
      const success = jasmine.createSpy('success');
      const failure = jasmine.createSpy('failure');
      const loader = jasmine
        .createSpy('loader')
        .and.callFake(({params}: ResourceLoaderParams<string>) =>
          params === 'initial' ? initial.promise : updated.promise,
        );
      const f = form(
        signal('initial'),
        (p) =>
          validateAsyncLoader(p, {
            params: ({value}) => value(),
            debounce: debounce.wait,
            loader,
            onSuccess: (value, ctx) => {
              success(value, ctx.value());
            },
            onError: (error) => {
              failure(error);
            },
          }),
        {injector},
      );
      await waitFor(() => throwUnless(loader).toHaveBeenCalledTimes(1));
      f().value.set('updated');
      await timeout(0);
      if (outcome === 'resolve') initial.resolve('stale');
      else initial.reject(new Error('stale error'));
      await timeout(0);
      expect(f().pending()).toBeTrue();
      expect(f().errors()).toEqual([]);
      expect(success).not.toHaveBeenCalled();
      expect(failure).not.toHaveBeenCalled();
      await debounce.resolve();
      await waitFor(() => throwUnless(loader).toHaveBeenCalledTimes(2));
      updated.resolve('new result');
      await appRef.whenStable();
      expect(f().valid()).toBeTrue();
      expect(success).toHaveBeenCalledOnceWith('new result', 'updated');
      expect(failure).not.toHaveBeenCalled();
    });
  }

  it('should replace pending debounce timers and allow synchronous bypass', async () => {
    const waits: ReturnType<typeof Promise.withResolvers<void>>[] = [];
    const loader = jasmine
      .createSpy('loader')
      .and.callFake(async ({params}: ResourceLoaderParams<string>) => params);
    const f = form(
      signal('A'),
      (p) =>
        validateAsyncLoader(p, {
          params: ({value}) => value(),
          debounce: (value) => {
            if (value === 'now') return;
            const wait = Promise.withResolvers<void>();
            waits.push(wait);
            return wait.promise;
          },
          loader,
          onSuccess: () => undefined,
          onError: () => undefined,
        }),
      {injector},
    );
    await appRef.whenStable();
    expect(loader).toHaveBeenCalledTimes(1);
    f().value.set('B');
    await appRef.whenStable();
    f().value.set('C');
    await appRef.whenStable();
    waits[0].resolve();
    await waits[0].promise;
    await appRef.whenStable();
    expect(f().pending()).toBeTrue();
    expect(loader).toHaveBeenCalledTimes(1);
    f().value.set('now');
    await appRef.whenStable();
    expect(loader).toHaveBeenCalledTimes(2);
    expect(loader.calls.mostRecent().args[0].params).toBe('now');
    waits[1].resolve();
    await waits[1].promise;
    await appRef.whenStable();
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('should debounce numeric waits without restarting for equal params', async () => {
    const loader = jasmine.createSpy('loader').and.callFake(async () => true);
    const f = form(
      signal('A'),
      (p) =>
        validateAsyncLoader(p, {
          params: ({value}) => value().trim(),
          debounce: 10,
          loader,
          onSuccess: () => undefined,
          onError: () => undefined,
        }),
      {injector},
    );
    await appRef.whenStable();
    f().value.set('A ');
    await appRef.whenStable();
    expect(f().pending()).toBeFalse();
    expect(loader).toHaveBeenCalledTimes(1);
    f().value.set('B');
    await appRef.whenStable();
    expect(f().pending()).toBeTrue();
    await timeout(10);
    await appRef.whenStable();
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('should let core reject reloads while loading or idle and reload errors or resolved results', async () => {
    const request = Promise.withResolvers<string>();
    const loader = jasmine.createSpy('loader').and.returnValue(request.promise);
    const f = form(
      signal<string | undefined>('A'),
      (p) =>
        validateAsyncLoader(p, {
          params: ({value}) => value(),
          loader,
          onSuccess: () => undefined,
          onError: () => ({kind: 'failed'}),
        }),
      {injector},
    );
    await waitFor(() => throwUnless(loader).toHaveBeenCalledTimes(1));
    f().reloadValidation();
    await timeout(0);
    expect(loader).toHaveBeenCalledTimes(1);
    request.reject(new Error('failed'));
    await appRef.whenStable();
    expect(f().invalid()).toBeTrue();
    loader.and.returnValue(Promise.resolve('recovered'));
    f().reloadValidation();
    await appRef.whenStable();
    expect(loader).toHaveBeenCalledTimes(2);
    expect(f().valid()).toBeTrue();
    f().reloadValidation();
    await appRef.whenStable();
    expect(loader).toHaveBeenCalledTimes(3);
    f().value.set(undefined);
    await appRef.whenStable();
    f().reloadValidation();
    await appRef.whenStable();
    expect(loader).toHaveBeenCalledTimes(3);
  });

  it('should abort on replacement or destruction without promising immediate abortion during debounce', async () => {
    const model = signal(['A']);
    const debounce = controlledDebounce();
    const signals: AbortSignal[] = [];
    const f = form(
      model,
      (p) =>
        applyEach(p, (item) =>
          validateAsyncLoader(item, {
            params: ({value}) => value(),
            debounce: debounce.wait,
            loader: ({abortSignal}) => {
              signals.push(abortSignal);
              return new Promise<string>((resolve) =>
                abortSignal.addEventListener('abort', () => resolve('aborted')),
              );
            },
            onSuccess: () => undefined,
            onError: () => undefined,
          }),
        ),
      {injector},
    );
    await waitFor(() => throwUnless(signals.length).toBe(1));
    f[0]().value.set('B');
    await timeout(0);
    expect(f[0]().pending()).toBeTrue();
    expect(signals[0].aborted).toBeFalse();
    await debounce.resolve();
    await waitFor(() => throwUnless(signals.length).toBe(2));
    expect(signals[0].aborted).toBeTrue();
    model.set([]);
    await appRef.whenStable();
    expect(signals[1].aborted).toBeTrue();
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
