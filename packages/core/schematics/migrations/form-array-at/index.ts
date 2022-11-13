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
import {createMigrationProgram} from '../../utils/typescript/compiler_host';

import {migrateFile} from './util';

/** Migration that marks accesses of `FormArray.at` as potentially undefined. */
export default function(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate FormArray.at accesses.');
    }

    for (const tsconfigPath of allPaths) {
      runNativeFormArrayAtMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runNativeFormArrayAtMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const sourceFiles = program.getSourceFiles().filter(
      (f) => !f.isDeclarationFile && !program.isSourceFileFromExternalLibrary(f));

  const updateFn =
      (sourceFile: ts.SourceFile, start: number, length: number, content: string,
       basePath?: string) => {
        const update = tree.beginUpdate(relative(basePath!, sourceFile.fileName));
        update.insertRight(start + length, content);
        tree.commitUpdate(update);
      };

  sourceFiles.forEach((sourceFile) => migrateFile(sourceFile, basePath, typeChecker, updateFn));
}
