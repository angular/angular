/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';
import {SignalInputMigration} from '../../migrations/signal-migration/src';
import {MigrationStage, runMigrationInDevkit} from '../../utils/tsurge/helpers/angular_devkit';
import {filterSourceFilesByPath} from '../../utils/tsurge/helpers/filter_by_path';

interface Options {
  path: string;
  bestEffortMode?: boolean;
  insertTodos?: boolean;
  analysisDir: string;
}

export function migrate(options: Options): Rule {
  return async (tree, context) => {
    await runMigrationInDevkit({
      tree,
      getMigration: (fs) =>
        new SignalInputMigration({
          bestEffortMode: options.bestEffortMode,
          insertTodosForSkippedFields: options.insertTodos,
          shouldMigrateInput: (input) => {
            return (
              input.file.rootRelativePath.startsWith(fs.normalize(options.path)) &&
              !/(^|\/)node_modules\//.test(input.file.rootRelativePath)
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
        const migrationPath = fs.resolve(options.path);

        // Support restricting the analysis to subfolders for larger projects.
        if (analysisPath !== '/') {
          info.sourceFiles = filterSourceFilesByPath(info.sourceFiles, options.analysisDir, fs);
          info.fullProgramSourceFiles = info.fullProgramSourceFiles.filter(
            (sf) => sf.fileName.startsWith(analysisPath + '/') || sf.fileName === analysisPath,
          );
        }

        // Also filter by migration path to avoid analyzing files outside the path
        if (migrationPath !== analysisPath && migrationPath !== '/') {
          info.sourceFiles = info.sourceFiles.filter(
            (sf) => sf.fileName.startsWith(migrationPath + '/') || sf.fileName === migrationPath,
          );
          info.fullProgramSourceFiles = info.fullProgramSourceFiles.filter(
            (sf) => sf.fileName.startsWith(migrationPath + '/') || sf.fileName === migrationPath,
          );
        }
      },
      beforeUnitAnalysis: (tsconfigPath) => {
        context.logger.info(`Scanning for inputs: ${tsconfigPath}...`);
      },
      afterAllAnalyzed: () => {
        context.logger.info(``);
        context.logger.info(`Processing analysis data between targets...`);
        context.logger.info(``);
      },
      afterAnalysisFailure: () => {
        context.logger.error('Migration failed unexpectedly with no analysis data');
      },
      whenDone: ({sourceInputs, incompatibleInputs}) => {
        const migratedInputs = sourceInputs - incompatibleInputs;

        context.logger.info('');
        context.logger.info(`Successfully migrated to signal inputs 🎉`);
        context.logger.info(`  -> Migrated ${migratedInputs}/${sourceInputs} inputs.`);

        if (incompatibleInputs > 0 && !options.insertTodos) {
          context.logger.warn(`To see why ${incompatibleInputs} inputs couldn't be migrated`);
          context.logger.warn(`consider re-running with "--insert-todos" or "--best-effort-mode".`);
        }

        if (options.bestEffortMode) {
          context.logger.warn(
            `You ran with best effort mode. Manually verify all code ` +
              `works as intended, and fix where necessary.`,
          );
        }
      },
    });
  };
}
