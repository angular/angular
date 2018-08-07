/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Name of the Material version that is shipped together with the schematics. */
export const materialVersion =
  loadPackageVersionGracefully('@angular/cdk') ||
  loadPackageVersionGracefully('@angular/material');

/** Angular version that is needed for the Material version that comes with the schematics. */
export const requiredAngularVersion = '0.0.0-NG';

/** Loads the full version from the given Angular package gracefully. */
function loadPackageVersionGracefully(packageName: string): string | null {
  try {
    return require(packageName).VERSION.full;
  } catch {
    return null;
  }
}
