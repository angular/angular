/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {relative} from 'path';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {analyze, AnalyzedFile, migrateTemplate} from './util';

export default function(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot run the block syntax template entities migration.');
    }

    for (const tsconfigPath of allPaths) {
      runBlockTemplateEntitiesMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runBlockTemplateEntitiesMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));
  const analysis = new Map<string, AnalyzedFile>();

  for (const sourceFile of sourceFiles) {
    analyze(sourceFile, analysis);
  }

  for (const [path, file] of analysis) {
    const ranges = file.getSortedRanges();
    const relativePath = relative(basePath, path);

    // Don't interrupt the entire migration if a file can't be read.
    if (!tree.exists(relativePath)) {
      continue;
    }

    const content = tree.readText(relativePath);
    const update = tree.beginUpdate(relativePath);

    for (const [start, end] of ranges) {
      const template = content.slice(start, end);
      const length = (end ?? content.length) - start;
      const migrated = migrateTemplate(template);

      if (migrated !== null) {
        update.remove(start, length);
        update.insertLeft(start, migrated);
      }
    }

    tree.commitUpdate(update);
  }
}
