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
import {findParentAccesses} from './util';


/** Migration that marks accesses of `AbstractControl.parent` as non-null. */
export default function(): Rule {
  return (tree: Tree) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate AbstractControl.parent accesses.');
    }

    for (const tsconfigPath of allPaths) {
      runNativeAbstractControlParentMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runNativeAbstractControlParentMigration(
    tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  sourceFiles.forEach(sourceFile => {
    // We sort the nodes based on their position in the file and we offset the positions by one
    // for each non-null assertion that we've added. We have to do it this way, rather than
    // creating and printing a new AST node like in other migrations, because property access
    // expressions can be nested (e.g. `control.parent.parent.value`), but the node positions
    // aren't being updated as we're inserting new code. If we were to go through the AST,
    // we'd have to update the `SourceFile` and start over after each operation.
    findParentAccesses(typeChecker, sourceFile)
        .sort((a, b) => a.getStart() - b.getStart())
        .forEach((node, index) => {
          const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));
          update.insertRight(node.getStart() + node.getWidth() + index, '!');
          tree.commitUpdate(update);
        });
  });
}
