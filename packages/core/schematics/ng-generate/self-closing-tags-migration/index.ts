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
import {synchronouslyCombineUnitData} from '../../utils/tsurge/helpers/combine_units';
import {
  SelfClosingTagsCompilationUnitData,
  SelfClosingTagsMigration,
} from '../../migrations/self-closing-tags-migration/self-closing-tags-migration';

interface Options {
  path: string;
  analysisDir: string;
}

export function migrate(options: Options): Rule {
  return async (tree, context) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);

    if (!buildPaths.length && !testPaths.length) {
      throw new SchematicsException(
        'Could not find any tsconfig file. Cannot run self-closing tags migration.',
      );
    }

    const fs = new DevkitMigrationFilesystem(tree);
    setFileSystem(fs);

    const migration = new SelfClosingTagsMigration({
      shouldMigrate: (file) => {
        return (
          file.rootRelativePath.startsWith(fs.normalize(options.path)) &&
          !/(^|\/)node_modules\//.test(file.rootRelativePath)
        );
      },
    });

    const unitResults: SelfClosingTagsCompilationUnitData[] = [];
    const programInfos = [...buildPaths, ...testPaths].map((tsconfigPath) => {
      context.logger.info(`Preparing analysis for: ${tsconfigPath}..`);

      const baseInfo = migration.createProgram(tsconfigPath, fs);
      const info = migration.prepareProgram(baseInfo);

      return {info, tsconfigPath};
    });

    // Analyze phase. Treat all projects as compilation units as
    // this allows us to support references between those.
    for (const {info, tsconfigPath} of programInfos) {
      context.logger.info(`Scanning for component tags: ${tsconfigPath}..`);
      unitResults.push(await migration.analyze(info));
    }

    context.logger.info(``);
    context.logger.info(`Processing analysis data between targets..`);
    context.logger.info(``);

    const combined = await synchronouslyCombineUnitData(migration, unitResults);
    if (combined === null) {
      context.logger.error('Migration failed unexpectedly with no analysis data');
      return;
    }

    const globalMeta = await migration.globalMeta(combined);
    const replacementsPerFile: Map<ProjectRootRelativePath, TextUpdate[]> = new Map();

    for (const {tsconfigPath} of programInfos) {
      context.logger.info(`Migrating: ${tsconfigPath}..`);

      const {replacements} = await migration.migrate(globalMeta);
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

    const {
      counters: {touchedFilesCount, replacementCount},
    } = await migration.stats(globalMeta);

    context.logger.info('');
    context.logger.info(`Successfully migrated to self-closing tags 🎉`);
    context.logger.info(
      `  -> Migrated ${replacementCount} components to self-closing tags in ${touchedFilesCount} component files.`,
    );
  };
}
