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
  return resource<T, R>({
    ...opts,
    loader: undefined,
    stream: (params) => {
      let sub: Subscription | undefined;

      // Track the abort listener so it can be removed if the Observable completes (as a memory
      // optimization).
      const onAbort = () => sub?.unsubscribe();
      params.abortSignal.addEventListener('abort', onAbort);

      // Start off stream as undefined.
      const stream = signal<{value: T} | {error: Error}>({value: undefined as T});
      let resolve: ((value: Signal<{value: T} | {error: Error}>) => void) | undefined;
      const promise = new Promise<Signal<{value: T} | {error: Error}>>((r) => (resolve = r));

      function send(value: {value: T} | {error: Error}): void {
        stream.set(value);
        resolve?.(stream);
        resolve = undefined;
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
  });
}
