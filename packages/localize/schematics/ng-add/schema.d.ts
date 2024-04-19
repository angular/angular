/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface Schema {
  /**
   * The name of the project.
   */
  project?: string;
  /**
   * The name of the project.
   * @deprecated use the `project` option instead.
   */
  name?: string;
  /**
   * Will this project use $localize at runtime?
   *
   * If true then the dependency is included in the `dependencies` section of package.json, rather
   * than `devDependencies`.
   */
  useAtRuntime?: boolean;
}
