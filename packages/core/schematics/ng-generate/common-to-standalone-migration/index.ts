/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';
import {CommonToStandaloneMigration} from './migration';
import {MigrationStage, runMigrationInDevkit} from '../../utils/tsurge/helpers/angular_devkit';
import {FileSystem} from '@angular/compiler-cli/private/migrations';

interface Options {
  path: string;
  analysisDir: string;
}

export function migrate(options: Options): Rule {
  return async (tree, context) => {
    await runMigrationInDevkit({
      tree,
      getMigration: (fs: FileSystem) =>
        new CommonToStandaloneMigration({
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
        context.logger.info(`Scanning for CommonModule usage: ${tsconfigPath}...`);
      },
      afterAllAnalyzed: () => {
        context.logger.info(``);
        context.logger.info(`Processing analysis data between targets...`);
        context.logger.info(``);
      },
      afterAnalysisFailure: () => {
        context.logger.error('Migration failed unexpectedly with no analysis data');
      },
      whenDone: (stats: {counters: {replacements: number; references: number}}) => {
        context.logger.info('');
        context.logger.info(`Successfully migrated CommonModule to standalone imports 🎉`);
        context.logger.info(
          `  -> Migrated ${stats.counters.replacements} CommonModule references affecting ${stats.counters.references} components.`,
        );
      },
    });
  };
}
