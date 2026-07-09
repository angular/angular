/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {join, relative} from 'path';
import ts from 'typescript';

import {normalizePath} from '../../utils/change_tracker';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {migrateFile} from './migration';
import {MigrationOptions} from './analysis';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';

interface Options extends MigrationOptions {
  path: string;
}

export function migrate(options: Options): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const basePath = process.cwd();
    let pathToMigrate: string | undefined;
    if (options.path) {
      if (options.path.startsWith('..')) {
        throw new SchematicsException(
          'Cannot run inject migration outside of the current project.',
        );
      }
      pathToMigrate = normalizePath(join(basePath, options.path));
    }

    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      context.logger.warn('Could not find any tsconfig file. Cannot run the inject migration.');
      return;
    }

    let sourceFilesCount = 0;

    for (const tsconfigPath of allPaths) {
      const program = createMigrationProgram(tree, tsconfigPath, basePath);
      const sourceFiles = program
        .getSourceFiles()
        .filter(
          (sourceFile) =>
            (pathToMigrate ? sourceFile.fileName.startsWith(pathToMigrate) : true) &&
            canMigrateFile(basePath, sourceFile, program),
        );

      sourceFilesCount += runInjectMigration(tree, sourceFiles, basePath, options);
    }

    if (sourceFilesCount === 0) {
      context.logger.warn('Inject migration did not find any files to migrate');
    }
  };
}

function runInjectMigration(
  tree: Tree,
  sourceFiles: ts.SourceFile[],
  basePath: string,
  schematicOptions: Options,
): number {
  let migratedFiles = 0;

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
      migratedFiles++;
    }
  }
  return migratedFiles;
}
