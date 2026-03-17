/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ProjectFile} from '../../utils/tsurge';

export interface MigrationConfig {
  /**
   * Whether to migrate this component template to self-closing tags.
   */
  shouldMigrate?: (containingFile: ProjectFile) => boolean;

  /**
   * Whether to migrate object references
   */
  bestEffortMode?: boolean;
}
