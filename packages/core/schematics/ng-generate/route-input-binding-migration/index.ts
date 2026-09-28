/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule} from '@angular-devkit/schematics';
import {MigrationStage, runMigrationInDevkit} from '../../utils/tsurge/helpers/angular_devkit';
import {RouteInputBindingMigration} from './migration';

interface Options {
  path: string;
  analysisDir: string;
}

export function migrate(options: Options): Rule {
  return async (tree, context) => {
    await runMigrationInDevkit({
      tree,
      getMigration: (fs) =>
        new RouteInputBindingMigration({
          shouldMigrate: (file) => {
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
        context.logger.info(`Scanning for ActivatedRoute usages: ${tsconfigPath}...`);
      },
      afterAllAnalyzed: () => {
        context.logger.info(``);
        context.logger.info(`Processing analysis data between targets...`);
        context.logger.info(``);
      },
      afterAnalysisFailure: () => {
        context.logger.error('Migration failed unexpectedly with no analysis data');
      },
      whenDone: ({counters}) => {
        context.logger.info('');

        if (!counters.bindingEnabled) {
          context.logger.warn(
            counters.routerSetupsWithoutBinding > 0
              ? `Found ${counters.routerSetupsWithoutBinding} router setup(s) that don't bind ` +
                  `route information to component inputs.`
              : `Could not find a router setup with component input binding.`,
          );
          context.logger.warn(
            `Add "withComponentInputBinding()" to "provideRouter" (or "bindToComponentInputs: true" ` +
              `to "RouterModule.forRoot") and re-run the migration.`,
          );
          context.logger.warn(
            `Note that enabling it sets inputs of routed components that don't match any route ` +
              `information to "undefined", so review routed components with default input values.`,
          );
          return;
        }

        context.logger.info(`Successfully migrated to route input binding 🎉`);
        context.logger.info(
          `  -> Migrated ${counters.migratedReads}/${counters.candidateReads} route parameters in ` +
            `${counters.migratedComponents}/${counters.candidateComponents} components.`,
        );
        if (counters.migratedComponents > 0) {
          context.logger.warn(
            `Unit tests that provide a mocked ActivatedRoute to migrated components need to set ` +
              `the inputs instead, e.g. via "RouterTestingHarness" or "fixture.componentRef.setInput".`,
          );
        }
      },
    });
  };
}
