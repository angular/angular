/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {EnvironmentInjector} from '../di';
import {isDestroyed} from '../render3/interfaces/type_checks';
import type {LView} from '../render3/interfaces/view';
import {getLView} from '../render3/state';
import {removeLViewOnDestroy, storeLViewOnDestroy} from '../render3/util/view_utils';

/**
 * `DestroyRef` lets you set callbacks to run for any cleanup or destruction behavior.
 * The scope of this destruction depends on where `DestroyRef` is injected. If `DestroyRef`
 * is injected in a component or directive, the callbacks run when that component or
 * directive is destroyed. Otherwise the callbacks run when a corresponding injector is destroyed.
 *
 * @publicApi
 */
export abstract class DestroyRef {
  // Here the `DestroyRef` acts primarily as a DI token. There are (currently) types of objects that
  // can be returned from the injector when asking for this token:
  // - `NodeInjectorDestroyRef` when retrieved from a node injector;
  // - `EnvironmentInjector` when retrieved from an environment injector

  /**
   * Registers a destroy callback in a given lifecycle scope.  Returns a cleanup function that can
   * be invoked to unregister the callback.
   *
   * @usageNotes
   * ### Example
   * ```ts
   * const destroyRef = inject(DestroyRef);
   *
   * // register a destroy callback
   * const unregisterFn = destroyRef.onDestroy(() => doSomethingOnDestroy());
   *
   * // stop the destroy callback from executing if needed
   * unregisterFn();
   * ```
   */
  abstract onDestroy(callback: () => void): () => void;

  /**
   * @internal
   * @nocollapse
   */
  static __NG_ELEMENT_ID__: () => DestroyRef = injectDestroyRef;

  /**
   * @internal
   * @nocollapse
   */
  static __NG_ENV_ID__: (injector: EnvironmentInjector) => DestroyRef = (injector) => injector;
}

export class NodeInjectorDestroyRef extends DestroyRef {
  constructor(readonly _lView: LView) {
    super();
  }

  override onDestroy(callback: () => void): () => void {
    const lView = this._lView;

    // Checking if `lView` is already destroyed before storing the `callback` enhances
    // safety and integrity for applications.
    // If `lView` is destroyed, we call the `callback` immediately to ensure that
    // any necessary cleanup is handled gracefully.
    // With this approach, we're providing better reliability in managing resources.
    // One of the use cases is `takeUntilDestroyed`, which aims to replace `takeUntil`
    // in existing applications. While `takeUntil` can be safely called once the view
    // is destroyed — resulting in no errors and finalizing the subscription depending
    // on whether a subject or replay subject is used, replacing it with
    // `takeUntilDestroyed` introduces a breaking change, as it throws an error if
    // the `lView` is destroyed (https://github.com/angular/angular/issues/54527).
    if (isDestroyed(lView)) {
      callback();
      // We return a "noop" callback, which, when executed, does nothing because
      // we haven't stored anything on the `lView`, and thus there's nothing to remove.
      return () => {};
    }

    storeLViewOnDestroy(lView, callback);
    return () => removeLViewOnDestroy(lView, callback);
  }
}

function injectDestroyRef(): DestroyRef {
  return new NodeInjectorDestroyRef(getLView());
}
