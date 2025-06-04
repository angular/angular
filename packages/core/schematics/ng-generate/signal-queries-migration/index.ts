/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';
import {SignalQueriesMigration} from '../../migrations/signal-queries-migration/migration';
import {MigrationStage, runMigrationInDevkit} from '../../utils/tsurge/helpers/angular_devkit';

interface Options {
  path: string;
  analysisDir: string;
  bestEffortMode?: boolean;
  insertTodos?: boolean;
}

export function migrate(options: Options): Rule {
  return async (tree, context) => {
    await runMigrationInDevkit({
      tree,
      getMigration: (fs) =>
        new SignalQueriesMigration({
          bestEffortMode: options.bestEffortMode,
          insertTodosForSkippedFields: options.insertTodos,
          shouldMigrateQuery: (_query, file) => {
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
        context.logger.info(`Scanning for queries: ${tsconfigPath}...`);
      },
      afterAnalysisFailure: () => {
        context.logger.error('Migration failed unexpectedly with no analysis data');
      },
      afterAllAnalyzed: () => {
        context.logger.info(``);
        context.logger.info(`Processing analysis data between targets...`);
        context.logger.info(``);
      },
      whenDone: ({queriesCount, incompatibleQueries}) => {
        context.logger.info('');
        context.logger.info(`Successfully migrated to signal queries 🎉`);

        const migratedQueries = queriesCount - incompatibleQueries;

        context.logger.info('');
        context.logger.info(`Successfully migrated to signal queries 🎉`);
        context.logger.info(`  -> Migrated ${migratedQueries}/${queriesCount} queries.`);

        if (incompatibleQueries > 0 && !options.insertTodos) {
          context.logger.warn(`To see why ${incompatibleQueries} queries couldn't be migrated`);
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
