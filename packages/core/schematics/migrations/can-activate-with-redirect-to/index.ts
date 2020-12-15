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
import {findLiteralsToMigrate, migrateLiteral} from './util';


/** Migration that removes `canActivate` property from routes that also have `redirectTo`. */
export default function(): Rule {
  return (tree: Tree) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate ' +
          'Router.navigateByUrl and Router.createUrlTree calls.');
    }

    for (const tsconfigPath of allPaths) {
      runCanActivateWithRedirectToMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runCanActivateWithRedirectToMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const printer = ts.createPrinter();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  sourceFiles.forEach(sourceFile => {
    const literalsToMigrate = findLiteralsToMigrate(sourceFile);
    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

    for (const literal of Array.from(literalsToMigrate)) {
      const migratedNode = migrateLiteral(literal);
      update.remove(literal.getStart(), literal.getWidth());
      update.insertRight(
          literal.getStart(), printer.printNode(ts.EmitHint.Unspecified, migratedNode, sourceFile));
    }

    tree.commitUpdate(update);
  });
}
