/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';
import {FileSystem} from '@angular/compiler-cli/private/migrations';
import {MigrationStage, runMigrationInDevkit} from '../../utils/tsurge/helpers/angular_devkit';
import {RouterTestingModuleMigration} from './migration';

interface Options {
  path: string;
  analysisDir: string;
}

export function migrate(options: Options): Rule {
  return async (tree, context) => {
    await runMigrationInDevkit({
      tree,
      getMigration: (fs: FileSystem) =>
        new RouterTestingModuleMigration({
          shouldMigrate: (file) => {
            return (
              file.rootRelativePath.startsWith(fs.normalize(options.path)) &&
              !/(^|\/)node_modules\//.test(file.rootRelativePath) &&
              /\.spec\.ts$/.test(file.rootRelativePath)
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
        context.logger.info(`Scanning for RouterTestingModule usage: ${tsconfigPath}...`);
      },
      afterAllAnalyzed: () => {
        context.logger.info(``);
        context.logger.info(`Processing analysis data between targets...`);
        context.logger.info(``);
      },
      afterAnalysisFailure: () => {
        context.logger.error('Migration failed unexpectedly with no analysis data');
      },
      whenDone: (stats) => {
        context.logger.info('');
        context.logger.info(`Successfully migrated RouterTestingModule to RouterModule 🎉`);
        context.logger.info(
          `  -> Migrated ${stats.counters.migratedUsages} RouterTestingModule usages in ${stats.counters.totalFiles} test files.`,
        );
        if (stats.counters.filesWithLocationMocks > 0) {
          context.logger.info(
            `  -> Added provideLocationMocks() to ${stats.counters.filesWithLocationMocks} files with SpyLocation.urlChanges usage.`,
          );
        }
      },
    });
  };
}
