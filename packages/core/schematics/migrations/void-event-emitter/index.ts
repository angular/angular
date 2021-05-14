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
import {getImportSpecifier} from '../../utils/typescript/imports';

import {findEventEmitterReferences} from './util';


export default function(): Rule {
  return (tree: Tree) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate argument-less (void) EventEmitter declarations.');
    }

    for (const tsconfigPath of allPaths) {
      runVoidEventEmitterMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runVoidEventEmitterMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const printer = ts.createPrinter();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  sourceFiles.forEach(sourceFile => {
    const eventEmitterImportSpecifier =
        getImportSpecifier(sourceFile, '@angular/core', 'EventEmitter');

    // If there are no imports for the `EventEmitter`, we can exit early.
    if (!eventEmitterImportSpecifier) {
      return;
    }

    const emitterUsages =
        findEventEmitterReferences(sourceFile, typeChecker, eventEmitterImportSpecifier);

    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    let hasUpdates = false;

    for (let [declaration, calls] of emitterUsages.entries()) {
      const areAllCallsVoid = calls.length && calls.every(emitterCall => !emitterCall.hasArguments)

      if (!areAllCallsVoid) {
        continue;
      }

      // findEventEmitterReferences() only tracked declarations initialized with a NewExpression
      const newExpr = declaration.initializer as ts.NewExpression;

      const updatedNewExpr = ts.factory.createNewExpression(
          newExpr.expression, [ts.factory.createToken(ts.SyntaxKind.VoidKeyword)],
          newExpr.arguments);

      update.remove(newExpr.getStart(), newExpr.getWidth());
      update.insertRight(
          newExpr.getStart(),
          printer.printNode(ts.EmitHint.Unspecified, updatedNewExpr, sourceFile));

      hasUpdates = true;
    }

    if (hasUpdates) {
      tree.commitUpdate(update);
    }
  });
}
