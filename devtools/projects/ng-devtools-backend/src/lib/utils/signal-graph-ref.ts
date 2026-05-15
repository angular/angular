/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵDebugSignalGraph as InternalDebugSignalGraph} from '@angular/core';

/**
 * Keeps a `ɵDebugSignalGraph` reference tied to a weak-referenced key.
 * If the key is garbage collected, the graph is also cleared.
 */
export class SignalGraphRef<T extends object> {
  private ref: WeakMap<T, InternalDebugSignalGraph> = new WeakMap();

  /** Gets the key-bound signal graph reference. */
  deref(key: T): InternalDebugSignalGraph | undefined {
    return this.ref.get(key);
  }

  /** Sets the signal graph. */
  set(key: T, graph: InternalDebugSignalGraph) {
    this.ref = new WeakMap([[key, graph]]);
  }

  /** Checks if the key-bound signal graph exists. */
  exists(key: T) {
    return !!this.ref.get(key);
  }

  /** Clears the reference. */
  clear() {
    this.ref = new WeakMap();
  }
}
