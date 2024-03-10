/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef} from '../application/application_ref';
import {assertInInjectionContext, Injector} from '../di';
import {inject} from '../di/injector_compatibility';

import {internalAfterNextRender} from './after_render_hooks';

/**
 * Queue a state update to be performed asynchronously.
 *
 * This is useful to safely update application state that is used in an expression that was already
 * checked during change detection. This defers the update until later and prevents
 * `ExpressionChangedAfterItHasBeenChecked` errors. Using signals for state is recommended instead,
 * but it's not always immediately possible to change the state to a signal because it would be a
 * breaking change. When the callback updates state used in an expression, this needs to be
 * accompanied by an explicit notification to the framework that something has changed (i.e.
 * updating a signal or calling `ChangeDetectorRef.markForCheck()`) or may still cause
 * `ExpressionChangedAfterItHasBeenChecked` in dev mode or fail to synchronize the state to the DOM
 * in production.
 */

export function queueStateUpdate(callback: VoidFunction, options?: {injector?: Injector;}): void {
  !options && assertInInjectionContext(queueStateUpdate);
  const injector = options?.injector ?? inject(Injector);
  const appRef = injector.get(ApplicationRef);

  let executed = false;
  const runCallbackOnce = () => {
    if (executed || appRef.destroyed) return;

    executed = true;
    callback();
  };

  internalAfterNextRender(runCallbackOnce, {injector, runOnServer: true});
  queueMicrotask(runCallbackOnce);
}
