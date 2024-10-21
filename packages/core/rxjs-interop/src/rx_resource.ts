/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  assertInInjectionContext,
  ResourceOptions,
  Injector,
  WritableResource,
  resource,
} from '@angular/core';
import {firstValueFrom, Observable, Subject, takeUntil} from 'rxjs';

/**
 * Like `ResourceOptions` but uses an RxJS-based `loader`.
 *
 * @experimental
 */
export interface RxResourceOptions<T, R> extends Omit<ResourceOptions<T, R>, 'loader'> {
  loader: (req: Exclude<R, undefined>) => Observable<T>;
}

/**
 * Like `resource` but uses an RxJS based `loader` which maps the request to an `Observable` of the
 * resource's value.
 *
 * @experimental
 */
export function rxResource<T, R>(opts: RxResourceOptions<T, R>): WritableResource<T> {
  opts?.injector || assertInInjectionContext(rxResource);
  return resource<T, R>({
    ...opts,
    loader: ({request, abortSignal}) => {
      const cancelled = new Subject<void>();
      abortSignal.addEventListener('abort', () => cancelled.next());
      return firstValueFrom(opts.loader(request).pipe(takeUntil(cancelled)));
    },
  });
}

/**
 * Converts an `Observable<T>` to a `Resource`.
 *
 * Similar to `toSignal`, but exposes the state of the resource and allows for local mutation.
 *
 * @experimental
 */
export function toResource<T>(
  observable: Observable<T>,
  opts?: {injector?: Injector},
): WritableResource<T> {
  opts?.injector || assertInInjectionContext(toResource);
  return rxResource({
    ...opts,
    loader: () => observable,
  });
}
