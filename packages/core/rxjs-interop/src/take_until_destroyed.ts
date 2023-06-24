/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertInInjectionContext, DestroyRef, inject} from '@angular/core';
import {MonoTypeOperatorFunction, Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/**
 * Operator which completes the Observable when the calling context (component, directive, service,
 * etc) is destroyed.
 *
 * @param destroyRef optionally, the `DestroyRef` representing the current context. This can be
 *     passed explicitly to use `takeUntilDestroyed` outside of an injection context. Otherwise, the
 * current `DestroyRef` is injected.
 *
 * @developerPreview
 */
export function takeUntilDestroyed<T>(destroyRef?: DestroyRef): MonoTypeOperatorFunction<T> {
  if (!destroyRef) {
    assertInInjectionContext(takeUntilDestroyed);
    destroyRef = inject(DestroyRef);
  }

  const destroyed$ = new Observable<void>(observer => {
    const unregisterFn = destroyRef!.onDestroy(observer.next.bind(observer));
    return unregisterFn;
  });

  return <T>(source: Observable<T>) => {
    return source.pipe(takeUntil(destroyed$));
  };
}
