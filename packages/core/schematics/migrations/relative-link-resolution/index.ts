/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree, UpdateRecorder} from '@angular-devkit/schematics';
import {relative} from 'path';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {migrateFile} from './util';

export default function(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. ' +
          'Cannot run a migration to cleanup the deprecated `relativeLinkResolution` config option.');
    }

    for (const tsconfigPath of allPaths) {
      runRelativeLinkResolutionMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runRelativeLinkResolutionMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  for (const sourceFile of sourceFiles) {
    let update: UpdateRecorder|null = null;

    const rewriter = (startPos: number, origLength: number, text: string) => {
      if (update === null) {
        // Lazily initialize update, because most files will not require migration.
        update = tree.beginUpdate(relative(basePath, sourceFile.fileName));
      }
      update.remove(startPos, origLength);
      update.insertLeft(startPos, text);
    };

    migrateFile(sourceFile, rewriter);

    if (update !== null) {
      tree.commitUpdate(update);
    }
  }
}
