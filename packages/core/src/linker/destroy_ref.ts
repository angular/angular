/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector} from '../di';
import {isDestroyed} from '../render3/interfaces/type_checks';
import {LView} from '../render3/interfaces/view';
import {getLView} from '../render3/state';
import {removeLViewOnDestroy, storeLViewOnDestroy} from '../render3/util/view_utils';

const EXECUTE_CALLBACK_IF_ALREADY_DESTROYED = false;

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
   * Indicates whether the instance has already been destroyed and whether its `onDestroy` callbacks have executed.
   */
  abstract get destroyed(): boolean;

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

  override get destroyed() {
    return isDestroyed(this._lView);
  }

  override onDestroy(callback: () => void): () => void {
    const lView = this._lView;

    // TODO(atscott): Remove once g3 cleanup is complete
    if (EXECUTE_CALLBACK_IF_ALREADY_DESTROYED && isDestroyed(lView)) {
      callback();
      return () => {};
    }

    storeLViewOnDestroy(lView, callback);
    return () => removeLViewOnDestroy(lView, callback);
  }
}

function injectDestroyRef(): DestroyRef {
  return new NodeInjectorDestroyRef(getLView());
}
