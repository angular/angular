/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';
import {MigrationStage, runMigrationInDevkit} from '../../utils/tsurge/helpers/angular_devkit';
import {UnusedImportsMigration} from './unused_imports_migration';

export function migrate(): Rule {
  return async (tree, context) => {
    await runMigrationInDevkit({
      getMigration: () => new UnusedImportsMigration(),
      tree,
      beforeProgramCreation: (tsconfigPath, stage) => {
        if (stage === MigrationStage.Analysis) {
          context.logger.info(`Preparing analysis for: ${tsconfigPath}...`);
        } else {
          context.logger.info(`Running migration for: ${tsconfigPath}...`);
        }
      },
      beforeUnitAnalysis: (tsconfigPath) => {
        context.logger.info(`Scanning for unused imports using ${tsconfigPath}`);
      },
      afterAnalysisFailure: () => {
        context.logger.error('Schematic failed unexpectedly with no analysis data');
      },
      whenDone: ({removedImports, changedFiles}) => {
        let statsMessage: string;

        if (removedImports === 0) {
          statsMessage = 'Schematic could not find unused imports in the project';
        } else {
          statsMessage =
            `Removed ${removedImports} import${removedImports !== 1 ? 's' : ''} ` +
            `in ${changedFiles} file${changedFiles !== 1 ? 's' : ''}`;
        }

        context.logger.info('');
        context.logger.info(statsMessage);
      },
    });
  };
}
