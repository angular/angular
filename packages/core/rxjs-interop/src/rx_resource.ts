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
} from '../../src/core';
import {Observable, Subscription} from 'rxjs';
import {encapsulateResourceError} from '../../src/resource/resource';
import {promiseWithResolvers} from '../../src/util/promise_with_resolvers';

/**
 * Like `ResourceOptions` but uses an RxJS-based `loader`.
 *
 * @publicApi 22.0
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
 * @publicApi 22.0
 */
export function rxResource<T, R>(
  opts: RxResourceOptions<T, R> & {defaultValue: NoInfer<T>},
): ResourceRef<T>;

/**
 * Like `resource` but uses an RxJS based `loader` which maps the request to an `Observable` of the
 * resource's value.
 *
 * @publicApi 22.0
 */
export function rxResource<T, R>(opts: RxResourceOptions<T, R>): ResourceRef<T | undefined>;
export function rxResource<T, R>(opts: RxResourceOptions<T, R>): ResourceRef<T | undefined> {
  if (ngDevMode && !opts?.injector) {
    assertInInjectionContext(rxResource);
  }
  return resource<T, R>({
    ...opts,
    loader: undefined,
    stream: (params) => {
      let sub: Subscription | undefined;

      // `abort` can fire synchronously while the subscription is not initialized yet.
      // Use this flag to unsubscribe immediately once `sub` exists.
      let aborted = false;

      // Start off stream as undefined.
      const stream = signal<ResourceStreamItem<T>>({value: undefined as T});
      const {resolve, promise} = promiseWithResolvers<Signal<ResourceStreamItem<T>>>();
      let hasResolved = false;

      function resolveOnce(): void {
        if (!hasResolved) {
          hasResolved = true;
          resolve(stream);
        }
      }

      // Track the abort listener so it can be removed if the Observable completes (as a memory
      // optimization).
      const onAbort = () => {
        aborted = true;
        sub?.unsubscribe();
        // Remove the listener immediately since unsubscribe won't trigger the subscription's
        // error/complete handlers. This ensures the promise resolves and PendingTask is released.
        params.abortSignal.removeEventListener('abort', onAbort);
        // Resolve the promise with the current stream state if it hasn't been resolved yet.
        // This ensures the PendingTask created for this request is released.
        resolveOnce();
      };
      params.abortSignal.addEventListener('abort', onAbort);

      function send(value: ResourceStreamItem<T>): void {
        stream.set(value);
        resolveOnce();
      }

      // TODO(alxhub): remove after g3 updated to rename loader -> stream
      const streamFn = opts.stream ?? (opts as {loader?: RxResourceOptions<T, R>['stream']}).loader;
      if (streamFn === undefined) {
        throw new ɵRuntimeError(
          ɵRuntimeErrorCode.MUST_PROVIDE_STREAM_OPTION,
          ngDevMode && `Must provide \`stream\` option.`,
        );
      }

      sub = streamFn(params).subscribe({
        next: (value) => send({value}),
        error: (error: unknown) => {
          send({error: encapsulateResourceError(error)});
          params.abortSignal.removeEventListener('abort', onAbort);
        },
        complete: () => {
          if (!hasResolved) {
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

      if (aborted) {
        sub.unsubscribe();
      }

      if (hasResolved) {
        return stream;
      }

      return promise;
    },
  });
}
