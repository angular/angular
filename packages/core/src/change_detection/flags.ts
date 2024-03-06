/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO(atscott): Remove prior to v18 release. Keeping this around in case anyone internally needs
// to opt out temporarily.
let _ensureDirtyViewsAreAlwaysReachable = true;

export function getEnsureDirtyViewsAreAlwaysReachable() {
  return _ensureDirtyViewsAreAlwaysReachable;
}
export function setEnsureDirtyViewsAreAlwaysReachable(v: boolean) {
  _ensureDirtyViewsAreAlwaysReachable = v;
}
