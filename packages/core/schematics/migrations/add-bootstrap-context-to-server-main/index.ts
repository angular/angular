/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule, SchematicsException, Tree, UpdateRecorder} from '@angular-devkit/schematics';
import {relative} from 'path';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';
import {migrateFile} from './migration';

export function migrate(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
        'Could not find any tsconfig file. Cannot run the add-bootstrap-context-to-server-main migration.',
      );
    }

    for (const tsconfigPath of allPaths) {
      runMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const sourceFiles = program
    .getSourceFiles()
    .filter((sourceFile) => canMigrateFile(basePath, sourceFile, program));

  for (const sourceFile of sourceFiles) {
    let update: UpdateRecorder | null = null;

    const rewriter = (startPos: number, width: number, text: string | null) => {
      if (update === null) {
        // Lazily initialize update, because most files will not require migration.
        update = tree.beginUpdate(relative(basePath, sourceFile.fileName));
      }
      update.remove(startPos, width);
      if (text !== null) {
        update.insertLeft(startPos, text);
      }
    };
    migrateFile(sourceFile, rewriter);

    if (update !== null) {
      tree.commitUpdate(update);
    }
  }
}
