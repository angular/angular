/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {join, relative} from 'path';

import {normalizePath} from '../../utils/change_tracker';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {migrateFile} from './migration';
import {MigrationOptions} from './analysis';

interface Options extends MigrationOptions {
  path: string;
}

export function migrate(options: Options): Rule {
  return async (tree: Tree) => {
    const basePath = process.cwd();
    const pathToMigrate = normalizePath(join(basePath, options.path));
    let allPaths = [];
    if (pathToMigrate.trim() !== '') {
      allPaths.push(pathToMigrate);
    }

    if (!allPaths.length) {
      throw new SchematicsException(
        'Could not find any tsconfig file. Cannot run the inject migration.',
      );
    }

    for (const tsconfigPath of allPaths) {
      runInjectMigration(tree, tsconfigPath, basePath, pathToMigrate, options);
    }
  };
}

function runInjectMigration(
  tree: Tree,
  tsconfigPath: string,
  basePath: string,
  pathToMigrate: string,
  schematicOptions: Options,
): void {
  if (schematicOptions.path.startsWith('..')) {
    throw new SchematicsException('Cannot run inject migration outside of the current project.');
  }

  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const sourceFiles = program
    .getSourceFiles()
    .filter(
      (sourceFile) =>
        sourceFile.fileName.startsWith(pathToMigrate) &&
        canMigrateFile(basePath, sourceFile, program),
    );

  if (sourceFiles.length === 0) {
    throw new SchematicsException(
      `Could not find any files to migrate under the path ${pathToMigrate}. Cannot run the inject migration.`,
    );
  }

  for (const sourceFile of sourceFiles) {
    const changes = migrateFile(sourceFile, schematicOptions);

    if (changes.length > 0) {
      const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

      for (const change of changes) {
        if (change.removeLength != null) {
          update.remove(change.start, change.removeLength);
        }
        update.insertRight(change.start, change.text);
      }

      tree.commitUpdate(update);
    }
  }
}
