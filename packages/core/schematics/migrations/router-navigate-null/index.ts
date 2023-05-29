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

/** Migration that casts `Router.navigate` and `Router.navigateByUrl` as `Promise<boolean>`s. */
export default function(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate typing of Router.navigate nor Router.navigateByUrl.');
    }

    for (const tsconfigPath of allPaths) {
      runNativeRouterNavigateMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runNativeRouterNavigateMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const sourceFiles = program.getSourceFiles().filter(
      (f) => !f.isDeclarationFile && !program.isSourceFileFromExternalLibrary(f));

  const updateFn = (sourceFile: ts.SourceFile, node: ts.Node, content: string) => {
    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    update.insertRight(node.getStart() + node.getWidth(), content);
    tree.commitUpdate(update);
  };

  sourceFiles.forEach((sourceFile) => migrateFile(sourceFile, typeChecker, updateFn));
}
