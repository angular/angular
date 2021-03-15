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
import {findFragmentAccesses, migrateActivatedRouteSnapshotFragment} from './util';


/**
 * Migration that marks accesses of `ActivatedRouteSnapshot.fragment` as non-null.
 */
export default function(): Rule {
  return (tree: Tree) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate ' +
          '`ActivatedRouteSnapshot.fragment` accesses.');
    }

    for (const tsconfigPath of allPaths) {
      runActivatedRouteSnapshotFragmentMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runActivatedRouteSnapshotFragmentMigration(
    tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));
  const printer = ts.createPrinter();

  sourceFiles.forEach(sourceFile => {
    const nodesToMigrate = findFragmentAccesses(typeChecker, sourceFile);

    if (nodesToMigrate.size > 0) {
      const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));
      nodesToMigrate.forEach(node => {
        update.remove(node.getStart(), node.getWidth());
        update.insertRight(
            node.getStart(),
            printer.printNode(
                ts.EmitHint.Unspecified, migrateActivatedRouteSnapshotFragment(node), sourceFile));
      });
      tree.commitUpdate(update);
    }
  });
}
