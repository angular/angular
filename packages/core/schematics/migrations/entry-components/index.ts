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

import {migrateEntryComponentsUsages} from './util';


/** Migration that removes `entryComponents` usages. */
export default function(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot remove `entryComponents`.');
    }

    for (const tsconfigPath of allPaths) {
      runEntryComponentsMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runEntryComponentsMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const printer = ts.createPrinter();

  program.getSourceFiles()
      .filter(sourceFile => canMigrateFile(basePath, sourceFile, program))
      .forEach(sourceFile => {
        const usages = migrateEntryComponentsUsages(typeChecker, printer, sourceFile);

        if (usages.length > 0) {
          const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));
          usages.forEach(usage => {
            update.remove(usage.start, usage.length);
            update.insertRight(usage.start, usage.replacement);
          });
          tree.commitUpdate(update);
        }
      });
}
