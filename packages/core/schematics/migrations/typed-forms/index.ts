/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree, UpdateRecorder} from '@angular-devkit/schematics';
import {relative} from 'path';
import ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {anySymbolName, findControlClassUsages, findFormBuilderCalls, getAnyImport, getControlClassImports, getFormBuilderImport, MigratableNode} from './util';

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
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  for (const sourceFile of sourceFiles) {
    const controlClassImports = getControlClassImports(sourceFile);
    const formBuilderImport = getFormBuilderImport(sourceFile);

    // If no relevant classes are imported, we can exit early.
    if (controlClassImports.length === 0 && formBuilderImport === null) return;

    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

    // For each control class, migrate all of its uses.
    for (const importSpecifier of controlClassImports) {
      const usages = findControlClassUsages(sourceFile, typeChecker, importSpecifier);
      for (const node of usages) {
        migrateNode(update, node, importSpecifier);
      }
    }

    // For each FormBuilder method, migrate all of its uses.
    const nodes = findFormBuilderCalls(sourceFile, typeChecker, formBuilderImport);
    for (const n of nodes) {
      migrateNode(update, n, formBuilderImport);
    }

    // Add the any symbol used by the migrated calls.
    if (getAnyImport(sourceFile) === null) {
      const firstValidFormsImport =
          [...controlClassImports, formBuilderImport].sort().filter(i => i !== null)[0]!;
      insertAnyImport(update, firstValidFormsImport);
    }

    tree.commitUpdate(update);
  }
}

export function migrateNode(
    update: UpdateRecorder, node: MigratableNode, importd: ts.ImportSpecifier|null) {
  if (importd === null) return;
  update.insertRight(node.node.getEnd(), node.generic);
}

export function insertAnyImport(update: UpdateRecorder, importd: ts.ImportSpecifier) {
  update.insertLeft(importd.getStart(), `${anySymbolName}, `);
}
