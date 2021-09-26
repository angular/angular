/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {relative} from 'path';
import ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {migrateFile} from './util';

/** Migration that marks accesses of `QueryList`'s `first` and `last` as non-null. */
export default function(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot add non null assertions to QueryList first and last accesses.');
    }

    for (const tsconfigPath of allPaths) {
      runQueryListFirstLastMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runQueryListFirstLastMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  const updateFn =
      (sourceFile: ts.SourceFile, start: number, length: number, content: string,
       basePath?: string) => {
        const update = tree.beginUpdate(relative(basePath!, sourceFile.fileName));
        update.insertRight(start + length, content);
        tree.commitUpdate(update);
      };

  sourceFiles.forEach(sourceFile => migrateFile(sourceFile, basePath, typeChecker, updateFn));
}
