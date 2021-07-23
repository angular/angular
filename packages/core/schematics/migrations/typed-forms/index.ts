/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {relative} from 'path';
import * as ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {findControlClassUsages, findFormBuilderCalls, getControlClassImports, getFormBuilderImport, migrateNode} from './util'

export default function(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate to Typed Forms.');
    }

    for (const tsconfigPath of allPaths) {
      runTypedFormsMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runTypedFormsMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const printer = ts.createPrinter();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  sourceFiles.forEach(sourceFile => {
    const controlClassImports = getControlClassImports(sourceFile);
    const formBuilderImport = getFormBuilderImport(sourceFile);

    // If no relevant classes are imported, we can exit early.
    if (controlClassImports.every(e => e == null) && !formBuilderImport) return;

    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

    // For each control class, migrate all of its uses.
    controlClassImports.forEach(
        importSpecifier => findControlClassUsages(sourceFile, typeChecker, importSpecifier)
                               .forEach(n => migrateNode(update, n, importSpecifier)));

    // For each FormBuilder method, migrate all of its uses.
    findFormBuilderCalls(sourceFile, typeChecker, formBuilderImport)
        .forEach(n => migrateNode(update, n, formBuilderImport));

    tree.commitUpdate(update);
  });
}
