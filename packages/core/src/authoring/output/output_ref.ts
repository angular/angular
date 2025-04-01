/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DestroyRef} from '../../linker/destroy_ref';

/**
 * Function that can be used to manually clean up a
 * programmatic {@link OutputRef#subscribe} subscription.
 *
 * Note: Angular will automatically clean up subscriptions
 * when the directive/component of the output is destroyed.
 *
 * @publicAPI
 */
export interface OutputRefSubscription {
  unsubscribe(): void;
}

/**
 * A reference to an Angular output.
 *
 * @publicAPI
 */
export interface OutputRef<T> {
  /**
   * Registers a callback that is invoked whenever the output
   * emits a new value of type `T`.
   *
   * Angular will automatically clean up the subscription when
   * the directive/component of the output is destroyed.
   */
  subscribe(callback: (value: T) => void): OutputRefSubscription;

  /**
   * Reference to the `DestroyRef` of the directive/component declaring
   * the output. The `DestroyRef` is captured so that helpers like
   * the `outputToObservable` can complete the observable upon destroy.
   *
   * Note: May be `undefined` in cases of `EventEmitter` where
   * we do not want to add a dependency on an injection context.
   *
   * @internal
   */
  destroyRef: DestroyRef | undefined;
}
