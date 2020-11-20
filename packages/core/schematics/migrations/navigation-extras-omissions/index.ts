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


/** Migration that switches `Router.navigateByUrl` and `Router.createUrlTree` to a new signature. */
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
      runNavigationExtrasOmissionsMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runNavigationExtrasOmissionsMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const printer = ts.createPrinter();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  sourceFiles.forEach(sourceFile => {
    const literalsToMigrate = findLiteralsToMigrate(sourceFile, typeChecker);
    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

    literalsToMigrate.forEach((instances, methodName) => instances.forEach(instance => {
      const migratedNode = migrateLiteral(methodName, instance);

      if (migratedNode !== instance) {
        update.remove(instance.getStart(), instance.getWidth());
        update.insertRight(
            instance.getStart(),
            printer.printNode(ts.EmitHint.Unspecified, migratedNode, sourceFile));
      }
    }));

    tree.commitUpdate(update);
  });
}
