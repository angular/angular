/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {injectAsync} from '../core/services/inject-async';
export function injectNodeRuntimeSandbox(injector) {
  return injectAsync(injector, () =>
    import('./node-runtime-sandbox.service').then((c) => c.NodeRuntimeSandbox),
  );
}
//# sourceMappingURL=inject-node-runtime-sandbox.js.map
