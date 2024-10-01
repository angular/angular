/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule, SchematicsException} from '@angular-devkit/schematics';

import {SignalInputMigration} from '../../migrations/signal-migration/src';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {DevkitMigrationFilesystem} from '../../utils/tsurge/helpers/angular_devkit/devkit_filesystem';
import {groupReplacementsByFile} from '../../utils/tsurge/helpers/group_replacements';
import {setFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {CompilationUnitData} from '../../migrations/signal-migration/src/batch/unit_data';
import {ProjectRootRelativePath, TextUpdate} from '../../utils/tsurge';

interface Options {
  path: string;
  bestEffortMode?: boolean;
  insertTodos?: boolean;
  analysisDir: string;
}

export function migrate(options: Options): Rule {
  return async (tree, context) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);

    if (!buildPaths.length && !testPaths.length) {
      throw new SchematicsException(
        'Could not find any tsconfig file. Cannot run signal input migration.',
      );
    }

    const fs = new DevkitMigrationFilesystem(tree);
    setFileSystem(fs);

    const migration = new SignalInputMigration({
      bestEffortMode: options.bestEffortMode,
      insertTodosForSkippedFields: options.insertTodos,
      shouldMigrateInput: (input) => {
        return (
          input.file.rootRelativePath.startsWith(fs.normalize(options.path)) &&
          !/(^|\/)node_modules\//.test(input.file.rootRelativePath)
        );
      },
    });
    const analysisPath = fs.resolve(options.analysisDir);
    const unitResults: CompilationUnitData[] = [];
    const programInfos = [...buildPaths, ...testPaths].map((tsconfigPath) => {
      context.logger.info(`Preparing analysis for: ${tsconfigPath}..`);

      const baseInfo = migration.createProgram(tsconfigPath, fs);
      const info = migration.prepareProgram(baseInfo);

      // Support restricting the analysis to subfolders for larger projects.
      if (analysisPath !== '/') {
        info.sourceFiles = info.sourceFiles.filter((sf) => sf.fileName.startsWith(analysisPath));
        info.fullProgramSourceFiles = info.fullProgramSourceFiles.filter((sf) =>
          sf.fileName.startsWith(analysisPath),
        );
      }

      return {info, tsconfigPath};
    });

    // Analyze phase. Treat all projects as compilation units as
    // this allows us to support references between those.
    for (const {info, tsconfigPath} of programInfos) {
      context.logger.info(`Scanning for inputs: ${tsconfigPath}..`);

      unitResults.push(await migration.analyze(info));
    }

    context.logger.info(``);
    context.logger.info(`Processing analysis data between targets..`);
    context.logger.info(``);

    const merged = await migration.merge(unitResults);
    const replacementsPerFile: Map<ProjectRootRelativePath, TextUpdate[]> = new Map();

    for (const {info, tsconfigPath} of programInfos) {
      context.logger.info(`Migrating: ${tsconfigPath}..`);

      const replacements = await migration.migrate(merged, info);
      const changesPerFile = groupReplacementsByFile(replacements);

      for (const [file, changes] of changesPerFile) {
        if (!replacementsPerFile.has(file)) {
          replacementsPerFile.set(file, changes);
        }
      }
    }

    context.logger.info(`Applying changes..`);
    for (const [file, changes] of replacementsPerFile) {
      const recorder = tree.beginUpdate(file);
      for (const c of changes) {
        recorder
          .remove(c.data.position, c.data.end - c.data.position)
          .insertLeft(c.data.position, c.data.toInsert);
      }
      tree.commitUpdate(recorder);
    }

    const {counters} = await migration.stats(merged);
    const migratedInputs = counters.sourceInputs - counters.incompatibleInputs;

    context.logger.info('');
    context.logger.info(`Successfully migrated to signal inputs 🎉`);
    context.logger.info(`  -> Migrated ${migratedInputs}/${counters.sourceInputs} inputs.`);

    if (counters.incompatibleInputs > 0 && !options.insertTodos) {
      context.logger.warn(`To see why ${counters.incompatibleInputs} inputs couldn't be migrated`);
      context.logger.warn(`consider re-running with "--insert-todos" or "--best-effort-mode".`);
    }

    if (options.bestEffortMode) {
      context.logger.warn(
        `You ran with best effort mode. Manually verify all code ` +
          `works as intended, and fix where necessary.`,
      );
    }
  };
}
