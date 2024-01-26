/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO(atscott): flip default internally ASAP and externally for v18 (#52928)
let _ensureDirtyViewsAreAlwaysReachable = false;

export function getEnsureDirtyViewsAreAlwaysReachable() {
  return _ensureDirtyViewsAreAlwaysReachable;
}
export function setEnsureDirtyViewsAreAlwaysReachable(v: boolean) {
  _ensureDirtyViewsAreAlwaysReachable = v;
}
