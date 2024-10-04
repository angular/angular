/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ProjectFile} from '../../utils/tsurge';
import {ClassFieldDescriptor} from '../signal-migration/src';

export interface MigrationConfig {
  /**
   * Whether the given query should be migrated. With batch execution, this
   * callback fires for foreign queries from other compilation units too.
   *
   * Treating a query as non-migrated means that no references to it are
   * migrated, nor the actual declaration (if it's part of the sources).
   *
   * If no function is specified here, the migration will migrate all
   * inputs and references it discovers in compilation units. This is the
   * running assumption for batch mode and LSC mode where the migration
   * assumes all seen queries are migrated.
   */
  shouldMigrateQuery?: (query: ClassFieldDescriptor, file: ProjectFile) => boolean;
}
