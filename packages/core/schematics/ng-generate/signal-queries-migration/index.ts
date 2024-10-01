/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule, SchematicsException} from '@angular-devkit/schematics';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {DevkitMigrationFilesystem} from '../../utils/tsurge/helpers/angular_devkit/devkit_filesystem';
import {groupReplacementsByFile} from '../../utils/tsurge/helpers/group_replacements';
import {setFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {ProjectRootRelativePath, TextUpdate} from '../../utils/tsurge';
import {
  CompilationUnitData,
  SignalQueriesMigration,
} from '../../migrations/signal-queries-migration/migration';

interface Options {
  path: string;
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

    const migration = new SignalQueriesMigration({
      shouldMigrateQuery: (_query, file) => {
        return (
          file.rootRelativePath.startsWith(fs.normalize(options.path)) &&
          !/(^|\/)node_modules\//.test(file.rootRelativePath)
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
      context.logger.info(`Scanning for queries: ${tsconfigPath}..`);

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

    context.logger.info('');
    context.logger.info(`Successfully migrated to signal queries 🎉`);
  };
}
