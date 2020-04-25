/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext} from '@angular-devkit/schematics';
import {TargetVersion} from '../update-tool/target-version';
import {cdkUpgradeData} from './upgrade-data';
import {createMigrationSchematicRule} from './devkit-migration-rule';

/** Entry point for the migration schematics with target of Angular CDK 6.0.0 */
export function updateToV6(): Rule {
  return createMigrationSchematicRule(TargetVersion.V6, [], cdkUpgradeData, onMigrationComplete);
}

/** Entry point for the migration schematics with target of Angular CDK 7.0.0 */
export function updateToV7(): Rule {
  return createMigrationSchematicRule(TargetVersion.V7, [], cdkUpgradeData, onMigrationComplete);
}

/** Entry point for the migration schematics with target of Angular CDK 8.0.0 */
export function updateToV8(): Rule {
  return createMigrationSchematicRule(TargetVersion.V8, [], cdkUpgradeData, onMigrationComplete);
}

/** Entry point for the migration schematics with target of Angular CDK 9.0.0 */
export function updateToV9(): Rule {
  return createMigrationSchematicRule(TargetVersion.V9, [], cdkUpgradeData, onMigrationComplete);
}

/** Function that will be called when the migration completed. */
function onMigrationComplete(context: SchematicContext, targetVersion: TargetVersion,
                             hasFailures: boolean) {
  context.logger.info('');
  context.logger.info(`  ✓  Updated Angular CDK to ${targetVersion}`);
  context.logger.info('');

  if (hasFailures) {
    context.logger.warn(
        '  ⚠  Some issues were detected but could not be fixed automatically. Please check the ' +
        'output above and fix these issues manually.');
  }
}
