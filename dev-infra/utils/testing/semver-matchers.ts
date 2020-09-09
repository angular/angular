/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Gets a jasmine asymmetric matcher for matching a given SemVer version. */
export function matchesVersion(versionName: string) {
  return jasmine.objectContaining({raw: versionName, version: versionName});
}
