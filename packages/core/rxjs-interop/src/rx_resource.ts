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
  resource,
  ResourceLoaderParams,
  ResourceRef,
} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {finalize, take, takeUntil} from 'rxjs/operators';

/**
 * Like `ResourceOptions` but uses an RxJS-based `loader`.
 *
 * @experimental
 */
export interface RxResourceOptions<T, R> extends Omit<ResourceOptions<T, R>, 'loader'> {
  loader: (params: ResourceLoaderParams<R>) => Observable<T>;
}

/**
 * Like `resource` but uses an RxJS based `loader` which maps the request to an `Observable` of the
 * resource's value. Like `firstValueFrom`, only the first emission of the Observable is considered.
 *
 * @experimental
 */
export function rxResource<T, R>(opts: RxResourceOptions<T, R>): ResourceRef<T | undefined> {
  opts?.injector || assertInInjectionContext(rxResource);
  return resource<T, R>({
    ...opts,
    loader: (params) => {
      const cancelled = new Subject<void>();
      const onAbort = () => cancelled.next();
      params.abortSignal.addEventListener('abort', onAbort);

      // Note: this is identical to `firstValueFrom` which we can't use,
      // because at the time of writing, `core` still supports rxjs 6.x.
      return new Promise<T>((resolve, reject) => {
        opts
          .loader(params)
          .pipe(
            take(1),
            takeUntil(cancelled),
            // This is necessary to remove an event listener when it is no
            // longer needed, allowing objects to be garbage collected.
            // Not all browser garbage collectors are smart enough to mark the
            // abort signal as unused, as it may still have an event listener attached.
            finalize(() => params.abortSignal.removeEventListener('abort', onAbort)),
          )
          .subscribe({
            next: resolve,
            error: reject,
            complete: () => reject(new Error('Resource completed before producing a value')),
          });
      });
    },
  });
}
