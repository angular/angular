/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ProjectFile} from '../../utils/tsurge';
import {ClassFieldDescriptor} from '../signal-migration/src/passes/reference_resolution/known_fields';

export interface MigrationConfig {
  /**
   * Whether to migrate as much as possible, even if certain
   * queries would otherwise be marked as incompatible for migration.
   */
  bestEffortMode?: boolean;

  /**
   * Whether to insert TODOs for skipped fields, and reasons on why they
   * were skipped.
   */
  insertTodosForSkippedFields?: boolean;

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
  shouldMigrateQuery?: (queryID: ClassFieldDescriptor, containingFile: ProjectFile) => boolean;

  /**
   * Whether to assume non-batch execution for speeding up things.
   *
   * This is useful for integration with the language service.
   */
  assumeNonBatch?: boolean;

  /**
   * Optional function to receive updates on progress of the migration. Useful
   * for integration with the language service to give some kind of indication
   * what the migration is currently doing.
   */
  reportProgressFn?: (percentage: number, updateMessage: string) => void;
}
