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
import {findNativeEncapsulationNodes} from './util';


/** Migration that switches from `ViewEncapsulation.Native` to `ViewEncapsulation.ShadowDom`. */
export default function(): Rule {
  return (tree: Tree) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate away from Native view encapsulation.');
    }

    for (const tsconfigPath of allPaths) {
      runNativeViewEncapsulationMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runNativeViewEncapsulationMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  sourceFiles.forEach(sourceFile => {
    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    const identifiers = findNativeEncapsulationNodes(typeChecker, sourceFile);

    identifiers.forEach(node => {
      update.remove(node.getStart(), node.getWidth());
      update.insertRight(node.getStart(), 'ShadowDom');
    });

    tree.commitUpdate(update);
  });
}
