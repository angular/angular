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
import {CompilationUnitData, UnusedImportsMigration} from './unused_imports_migration';

export function migrate(): Rule {
  return async (tree, context) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);

    if (!buildPaths.length && !testPaths.length) {
      throw new SchematicsException(
        'Could not find any tsconfig file. Cannot clean up unused imports.',
      );
    }

    const fs = new DevkitMigrationFilesystem(tree);
    setFileSystem(fs);

    const migration = new UnusedImportsMigration();
    const unitResults: CompilationUnitData[] = [];
    const programInfos = [...buildPaths, ...testPaths].map((tsconfigPath) => {
      context.logger.info(`Preparing analysis for ${tsconfigPath}`);

      const baseInfo = migration.createProgram(tsconfigPath, fs);
      const info = migration.prepareProgram(baseInfo);

      return {info, tsconfigPath};
    });

    for (const {info, tsconfigPath} of programInfos) {
      context.logger.info(`Scanning for unused imports using ${tsconfigPath}`);
      unitResults.push(await migration.analyze(info));
    }

    const combined = await synchronouslyCombineUnitData(migration, unitResults);
    if (combined === null) {
      context.logger.error('Schematic failed unexpectedly with no analysis data');
      return;
    }

    const globalMeta = await migration.globalMeta(combined);
    const replacementsPerFile: Map<ProjectRootRelativePath, TextUpdate[]> = new Map();
    const {replacements} = await migration.migrate(globalMeta);
    const changesPerFile = groupReplacementsByFile(replacements);

    for (const [file, changes] of changesPerFile) {
      if (!replacementsPerFile.has(file)) {
        replacementsPerFile.set(file, changes);
      }
    }

    for (const [file, changes] of replacementsPerFile) {
      const recorder = tree.beginUpdate(file);
      for (const c of changes) {
        recorder
          .remove(c.data.position, c.data.end - c.data.position)
          .insertRight(c.data.position, c.data.toInsert);
      }
      tree.commitUpdate(recorder);
    }

    const {
      counters: {removedImports, changedFiles},
    } = await migration.stats(globalMeta);
    let statsMessage: string;

    if (removedImports === 0) {
      statsMessage = 'Schematic could not find unused imports in the project';
    } else {
      statsMessage =
        `Removed ${removedImports} import${removedImports !== 1 ? 's' : ''} ` +
        `in ${changedFiles} file${changedFiles !== 1 ? 's' : ''}`;
    }

    context.logger.info('');
    context.logger.info(statsMessage);
  };
}
