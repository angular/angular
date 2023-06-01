/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree, UpdateRecorder} from '@angular-devkit/schematics';
import {relative} from 'path';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {migrateFile} from './util';

export default function(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot run the guard and resolve interfaces migration.');
    }

    for (const tsconfigPath of allPaths) {
      runGuardAndResolveInterfacesMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runGuardAndResolveInterfacesMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  for (const sourceFile of sourceFiles) {
    let update: UpdateRecorder|null = null;

    const rewriter = (startPos: number, width: number, text: string|null) => {
      if (update === null) {
        // Lazily initialize update, because most files will not require migration.
        update = tree.beginUpdate(relative(basePath, sourceFile.fileName));
      }
      update.remove(startPos, width);
      if (text !== null) {
        update.insertLeft(startPos, text);
      }
    };
    migrateFile(sourceFile, typeChecker, rewriter);

    if (update !== null) {
      tree.commitUpdate(update);
    }
  }
}
