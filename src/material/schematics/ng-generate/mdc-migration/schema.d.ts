/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface Schema {
  /**
   * Workspace-relative path to a directory which will be migrated.
   *
   * Source files determined outside of this directory will be ignored,
   * allowing for an incremental migration.
   *
   * If not set, the directory is determined based on the specified tsconfig.
   */
  directory?: string;

  /**
   * The components to migrate.
   */
  components: string[];
}
