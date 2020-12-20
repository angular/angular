/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface Schema {
  /**
   * Skip package.json install.
   */
  skipPackageJson: boolean;

  /**
   * The project that needs the polyfill scripts
   */
  project: string;
}
