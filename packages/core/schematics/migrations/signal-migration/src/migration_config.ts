/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {KnownInputInfo} from './input_detection/known_inputs';

export interface MigrationConfig {
  /**
   * Whether to migrate as much as possible, even if certain inputs would otherwise
   * be marked as incompatible for migration.
   */
  bestEffortMode?: boolean;

  /**
   * Whether to insert TODOs for skipped fields, and reasons on why they
   * were skipped.
   */
  insertTodosForSkippedFields?: boolean;

  /**
   * Whether the given input should be migrated. With batch execution, this
   * callback fires for foreign inputs from other compilation units too.
   *
   * Treating an input as non-migrated means that no references to it are
   * migrated, nor the actual declaration (if it's part of the sources).
   *
   * If no function is specified here, the migration will migrate all
   * inputs and references it discovers in compilation units. This is the
   * running assumption for batch mode and LSC mode where the migration
   * assumes all seen inputs (even those in `.d.ts`) are intended to be
   * migrated.
   */
  shouldMigrateInput?: (input: KnownInputInfo) => boolean;

  /**
   * Whether to upgrade analysis phase to avoid batch execution.
   *
   * This is useful when not running against multiple compilation units.
   * The analysis phase will re-use the same program and information, without
   * re-analyzing in the `migrate` phase.
   *
   * Results will be available as {@link SignalInputMigration#upgradedAnalysisPhaseResults}
   * after executing the analyze stage.
   */
  upgradeAnalysisPhaseToAvoidBatch?: boolean;

  /**
   * Optional function to receive updates on progress of the migration. Useful
   * for integration with the language service to give some kind of indication
   * what the migration is currently doing.
   */
  reportProgressFn?: (percentage: number, updateMessage: string) => void;
}
