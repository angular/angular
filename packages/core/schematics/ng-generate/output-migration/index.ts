/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';
import {OutputMigration} from '../../migrations/output-migration/output-migration';
import {MigrationStage, runMigrationInDevkit} from '../../utils/tsurge/helpers/angular_devkit';

interface Options {
  path: string;
  analysisDir: string;
}

export function migrate(options: Options): Rule {
  return async (tree, context) => {
    await runMigrationInDevkit({
      tree,
      getMigration: (fs) =>
        new OutputMigration({
          shouldMigrate: (_, file) => {
            return (
              file.rootRelativePath.startsWith(fs.normalize(options.path)) &&
              !/(^|\/)node_modules\//.test(file.rootRelativePath)
            );
          },
        }),
      beforeProgramCreation: (tsconfigPath, stage) => {
        if (stage === MigrationStage.Analysis) {
          context.logger.info(`Preparing analysis for: ${tsconfigPath}...`);
        } else {
          context.logger.info(`Running migration for: ${tsconfigPath}...`);
        }
      },
      afterProgramCreation: (info, fs) => {
        const analysisPath = fs.resolve(options.analysisDir);

        // Support restricting the analysis to subfolders for larger projects.
        if (analysisPath !== '/') {
          info.sourceFiles = info.sourceFiles.filter((sf) => sf.fileName.startsWith(analysisPath));
          info.fullProgramSourceFiles = info.fullProgramSourceFiles.filter((sf) =>
            sf.fileName.startsWith(analysisPath),
          );
        }
      },
      beforeUnitAnalysis: (tsconfigPath) => {
        context.logger.info(`Scanning for outputs: ${tsconfigPath}...`);
      },
      afterAllAnalyzed: () => {
        context.logger.info(``);
        context.logger.info(`Processing analysis data between targets...`);
        context.logger.info(``);
      },
      afterAnalysisFailure: () => {
        context.logger.error('Migration failed unexpectedly with no analysis data');
      },
      whenDone: ({detectedOutputs, problematicOutputs, successRate}) => {
        const migratedOutputs = detectedOutputs - problematicOutputs;
        const successRatePercent = (successRate * 100).toFixed(2);

        context.logger.info('');
        context.logger.info(`Successfully migrated to outputs as functions 🎉`);
        context.logger.info(
          `  -> Migrated ${migratedOutputs} out of ${detectedOutputs} detected outputs (${successRatePercent} %).`,
        );
      },
    });
  };
}
