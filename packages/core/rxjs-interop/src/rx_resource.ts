/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  assertInInjectionContext,
  resource,
  ResourceLoaderParams,
  ResourceRef,
  Signal,
  signal,
  BaseResourceOptions,
  ɵRuntimeError,
  ɵRuntimeErrorCode,
  ResourceStreamItem,
  inject,
  Injector,
  DestroyRef,
  WritableSignal,
} from '../../src/core';
import {Observable, Subscription} from 'rxjs';
import {encapsulateResourceError} from '../../src/resource/resource';

/**
 * Like `ResourceOptions` but uses an RxJS-based `loader`.
 *
 * @experimental
 */
export interface RxResourceOptions<T, R> extends BaseResourceOptions<T, R> {
  stream: (params: ResourceLoaderParams<R>) => Observable<T>;
}

/**
 * Like `resource` but uses an RxJS based `loader` which maps the request to an `Observable` of the
 * resource's value.
 *
 * @see [Using rxResource for async data](ecosystem/rxjs-interop#using-rxresource-for-async-data)
 *
 * @experimental
 */
export function rxResource<T, R>(
  opts: RxResourceOptions<T, R> & {defaultValue: NoInfer<T>},
): ResourceRef<T>;

/**
 * Like `resource` but uses an RxJS based `loader` which maps the request to an `Observable` of the
 * resource's value.
 *
 * @experimental
 */
export function rxResource<T, R>(opts: RxResourceOptions<T, R>): ResourceRef<T | undefined>;
export function rxResource<T, R>(opts: RxResourceOptions<T, R>): ResourceRef<T | undefined> {
  if (ngDevMode && !opts?.injector) {
    assertInInjectionContext(rxResource);
  }

  const injector = opts?.injector ?? inject(Injector);
  const destroyRef = injector.get(DestroyRef);

  // TODO(alxhub): remove after g3 updated to rename loader -> stream
  const streamFn = opts.stream ?? (opts as {loader?: RxResourceOptions<T, R>['stream']}).loader;
  if (streamFn === undefined) {
    throw new ɵRuntimeError(
      ɵRuntimeErrorCode.MUST_PROVIDE_STREAM_OPTION,
      ngDevMode && `Must provide \`stream\` option.`,
    );
  }

  let earlySub: Subscription | undefined;
  let earlyPromise: Promise<Signal<ResourceStreamItem<T>>> | undefined;
  let earlyRequest: R | undefined;

  const res = resource<T, R>({
    ...opts,
    injector,
    loader: undefined,
    stream: (params: ResourceLoaderParams<R>) => {
      const currentRequest = (params as any).request ?? (params as any).params;
      if (earlyPromise && earlyRequest === currentRequest) {
        const onAbort = () => earlySub?.unsubscribe();
        params.abortSignal.addEventListener('abort', onAbort);

        const promise = earlyPromise;
        earlyPromise = undefined;
        return promise;
      }

      earlySub?.unsubscribe();

      let sub: Subscription | undefined;
      const onAbort = () => sub?.unsubscribe();
      params.abortSignal.addEventListener('abort', onAbort);

      const stream = signal<ResourceStreamItem<T>>({value: undefined as T});
      let resolve: ((value: Signal<ResourceStreamItem<T>>) => void) | undefined;
      const promise = new Promise<Signal<ResourceStreamItem<T>>>((r) => (resolve = r));

      function send(value: ResourceStreamItem<T>): void {
        stream.set(value);
        resolve?.(stream);
        resolve = undefined;
      }

      sub = streamFn(params).subscribe({
        next: (value) => send({value}),
        error: (error: unknown) => {
          send({error: encapsulateResourceError(error)});
          params.abortSignal.removeEventListener('abort', onAbort);
        },
        complete: () => {
          if (resolve) {
            send({
              error: new ɵRuntimeError(
                ɵRuntimeErrorCode.RESOURCE_COMPLETED_BEFORE_PRODUCING_VALUE,
                ngDevMode && 'Resource completed before producing a value',
              ),
            });
          }
          params.abortSignal.removeEventListener('abort', onAbort);
        },
      });

      return promise;
    },
    getInitialStream: (req: R) => {
      earlyRequest = req;

      let isSubscribing = true;
      let emittedSync = false;
      let initialValue: ResourceStreamItem<T> = {value: undefined as T};

      let stream: WritableSignal<ResourceStreamItem<T>> | undefined;
      let resolve: ((value: Signal<ResourceStreamItem<T>>) => void) | undefined;
      earlyPromise = new Promise<Signal<ResourceStreamItem<T>>>((r) => (resolve = r));

      function send(item: ResourceStreamItem<T>): void {
        stream!.set(item);
        resolve?.(stream!);
        resolve = undefined;
      }

      const abortController = new AbortController();

      const params = {
        request: req,
        params: req,
        previous: {status: 'idle'},
        abortSignal: abortController.signal,
      } as unknown as ResourceLoaderParams<R>;

      try {
        earlySub = streamFn(params).subscribe({
          next: (value) => {
            if (isSubscribing) {
              emittedSync = true;
              initialValue = {value};
            } else {
              send({value});
            }
          },
          error: (error: unknown) => {
            if (isSubscribing) {
              emittedSync = true;
              initialValue = {error: encapsulateResourceError(error)};
            } else {
              send({error: encapsulateResourceError(error)});
            }
          },
          complete: () => {
            if (isSubscribing && !emittedSync) {
              emittedSync = true;
              initialValue = {
                error: new ɵRuntimeError(
                  ɵRuntimeErrorCode.RESOURCE_COMPLETED_BEFORE_PRODUCING_VALUE,
                  ngDevMode && 'Resource completed before producing a value',
                ),
              };
            } else if (!isSubscribing && resolve) {
              send({
                error: new ɵRuntimeError(
                  ɵRuntimeErrorCode.RESOURCE_COMPLETED_BEFORE_PRODUCING_VALUE,
                  ngDevMode && 'Resource completed before producing a value',
                ),
              });
            }
          },
        });
      } catch (error: unknown) {
        emittedSync = true;
        initialValue = {error: encapsulateResourceError(error)};
      }

      isSubscribing = false;
      stream = signal<ResourceStreamItem<T>>(initialValue);

      if (emittedSync) {
        earlyPromise = undefined;
        return stream;
      }

      return undefined;
    },
  } as any);

  const originalSet = res.value.set as any;
  (res.value as any).set = (v: any) => {
    earlySub?.unsubscribe();
    originalSet(v);
  };

  const originalUpdate = res.value.update as any;
  (res.value as any).update = (fn: any) => {
    earlySub?.unsubscribe();
    originalUpdate(fn);
  };

  destroyRef.onDestroy(() => earlySub?.unsubscribe());

  return res;
}
