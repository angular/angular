/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {createComputed, SIGNAL} from '../../../primitives/signals';
/**
 * Create a computed `Signal` which derives a reactive value from an expression.
 */
export function computed(computation, options) {
  const getter = createComputed(computation, options?.equal);
  if (ngDevMode) {
    getter.toString = () => `[Computed: ${getter()}]`;
    getter[SIGNAL].debugName = options?.debugName;
  }
  return getter;
}
//# sourceMappingURL=computed.js.map
