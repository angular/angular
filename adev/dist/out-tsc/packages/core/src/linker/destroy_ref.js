/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {isDestroyed} from '../render3/interfaces/type_checks';
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
export class DestroyRef {
  /**
   * @internal
   * @nocollapse
   */
  static __NG_ELEMENT_ID__ = injectDestroyRef;
  /**
   * @internal
   * @nocollapse
   */
  static __NG_ENV_ID__ = (injector) => injector;
}
export class NodeInjectorDestroyRef extends DestroyRef {
  _lView;
  constructor(_lView) {
    super();
    this._lView = _lView;
  }
  get destroyed() {
    return isDestroyed(this._lView);
  }
  onDestroy(callback) {
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
function injectDestroyRef() {
  return new NodeInjectorDestroyRef(getLView());
}
//# sourceMappingURL=destroy_ref.js.map
