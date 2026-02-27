/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';
import {ModelOutputMigration} from './migration';
import {MigrationStage, runMigrationInDevkit} from '../../utils/tsurge/helpers/angular_devkit';

interface Options {
  path: string;
}

export function migrate(options: Options): Rule {
  return async (tree, context) => {
    await runMigrationInDevkit({
      tree,
      getMigration: (fs) =>
        new ModelOutputMigration({
          shouldMigrate: (file) => {
            return (
              file.rootRelativePath.startsWith(fs.normalize(options.path)) &&
              !/(^|\/)node_modules\//.test(file.rootRelativePath)
            );
          },
        }),
      beforeProgramCreation: (tsconfigPath: string, stage: MigrationStage) => {
        if (stage === MigrationStage.Analysis) {
          context.logger.info(`Preparing analysis for: ${tsconfigPath}...`);
        } else {
          context.logger.info(`Running migration for: ${tsconfigPath}...`);
        }
      },
      beforeUnitAnalysis: (tsconfigPath: string) => {
        context.logger.info(`Scanning for model/output patterns: ${tsconfigPath}...`);
      },
      afterAllAnalyzed: () => {
        context.logger.info(``);
        context.logger.info(`Processing analysis data...`);
        context.logger.info(``);
      },
      afterAnalysisFailure: () => {
        context.logger.error('Migration failed unexpectedly');
      },
      whenDone: ({
        touchedFilesCount,
        replacementCount,
      }: {
        touchedFilesCount: number;
        replacementCount: number;
      }) => {
        context.logger.info('');
        context.logger.info(`Successfully migrated model/output to linkedSignal 🎉`);
        context.logger.info(
          `  -> Migrated ${replacementCount} properties in ${touchedFilesCount} files.`,
        );
      },
    });
  };
}
