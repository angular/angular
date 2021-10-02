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
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';
import {findInitTestEnvironmentCalls, findTestModuleMetadataNodes, migrateInitTestEnvironment, migrateTestModuleMetadataLiteral} from './util';


/** Migration that adds the `teardown` flag to `TestBed` calls. */
export default function(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot add `teardown` flag to `TestBed`.');
    }

    for (const tsconfigPath of allPaths) {
      runTestbedTeardownMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runTestbedTeardownMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));
  const initTestEnvironmentResult = findInitTestEnvironmentCalls(typeChecker, sourceFiles);
  const printer = ts.createPrinter();

  // If we identified at least one call to `initTestEnvironment` (can be migrated or unmigrated),
  // we don't need to migrate `configureTestingModule` or `withModule` calls, because they'll take
  // the default teardown behavior from the environment. This is preferrable, because it'll result
  // in the least number of changes to users' code.
  if (initTestEnvironmentResult.totalCalls > 0) {
    // Migrate all of the unmigrated calls `initTestEnvironment`. This could be zero
    // if the user has already opted into the new teardown behavior themselves.
    initTestEnvironmentResult.callsToMigrate.forEach(call => {
      migrate(call, migrateInitTestEnvironment, tree, basePath, printer);
    });
  } else {
    // Otherwise migrate the metadata passed into the `configureTestingModule` and `withModule`
    // calls. This scenario is less likely, but it could happen if `initTestEnvironment` has been
    // abstracted away or is inside a .js file.
    sourceFiles.forEach(sourceFile => {
      findTestModuleMetadataNodes(typeChecker, sourceFile).forEach(literal => {
        migrate(literal, migrateTestModuleMetadataLiteral, tree, basePath, printer);
      });
    });
  }
}


function migrate<T extends ts.Node>(
    node: T, migrator: (node: T) => T, tree: Tree, basePath: string, printer: ts.Printer) {
  const migrated = migrator(node);
  const update = tree.beginUpdate(relative(basePath, node.getSourceFile().fileName));
  update.remove(node.getStart(), node.getWidth());
  update.insertRight(
      node.getStart(), printer.printNode(ts.EmitHint.Unspecified, migrated, node.getSourceFile()));
  tree.commitUpdate(update);
}
