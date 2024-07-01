/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {createProgram, NgtscProgram} from '@angular/compiler-cli';
import {existsSync, statSync} from 'fs';
import {join, relative} from 'path';
import ts from 'typescript';

import {ChangesByFile, normalizePath} from '../../utils/change_tracker';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createProgramOptions} from '../../utils/typescript/compiler_host';

import {toLazyStandaloneRoutes} from './to-standalone';

interface Options {
  path: string;
}

export default function (options: Options): Rule {
  return async (tree, context) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];
    // TS and Schematic use paths in POSIX format even on Windows. This is needed as otherwise
    // string matching such as `sourceFile.fileName.startsWith(pathToMigrate)` might not work.
    const pathToMigrate = normalizePath(join(basePath, options.path));
    let migratedFiles = 0;

    if (!allPaths.length) {
      throw new SchematicsException(
        'Could not find any tsconfig file. Cannot run the standalone routes migration.',
      );
    }

    for (const tsconfigPath of allPaths) {
      migratedFiles += standaloneRoutesMigration(tree, tsconfigPath, basePath, pathToMigrate, options);
    }

    if (migratedFiles === 0) {
      throw new SchematicsException(
        `Could not find any files to migrate under the path ${pathToMigrate}. Cannot run the standalone routes migration.`,
      );
    }

    context.logger.info('🎉 Automated migration step has finished! 🎉');
    context.logger.info(
      'IMPORTANT! Please verify manually that your application builds and behaves as expected.',
    );
    context.logger.info(
      `See https://angular.dev/reference/migrations/standalone-routes for more information.`,
    );
  };
}

function standaloneRoutesMigration(
  tree: Tree,
  tsconfigPath: string,
  basePath: string,
  pathToMigrate: string,
  schematicOptions: Options,
  oldProgram?: NgtscProgram,
): number {
  if (schematicOptions.path.startsWith('..')) {
    throw new SchematicsException(
      'Cannot run standalone routes migration outside of the current project.',
    );
  }

  const {host, options, rootNames} = createProgramOptions(
    tree,
    tsconfigPath,
    basePath,
    undefined,
    undefined,
    {
      _enableTemplateTypeChecker: true, // Required for the template type checker to work.
      compileNonExportedClasses: true, // We want to migrate non-exported classes too.
      // Avoid checking libraries to speed up the migration.
      skipLibCheck: true,
      skipDefaultLibCheck: true,
    },
  );
  const program = createProgram({rootNames, host, options, oldProgram}) as NgtscProgram;
  const printer = ts.createPrinter();

  if (existsSync(pathToMigrate) && !statSync(pathToMigrate).isDirectory()) {
    throw new SchematicsException(
      `Migration path ${pathToMigrate} has to be a directory. Cannot run the standalone routes migration.`,
    );
  }

  const sourceFiles = program
    .getTsProgram()
    .getSourceFiles()
    .filter(
      (sourceFile) =>
        sourceFile.fileName.startsWith(pathToMigrate) &&
        canMigrateFile(basePath, sourceFile, program.getTsProgram()),
    );

  if (sourceFiles.length === 0) {
    return 0;
  }

  let pendingChanges: ChangesByFile;

  pendingChanges = toLazyStandaloneRoutes(
    sourceFiles,
    program,
    printer,
    undefined,
  );

  for (const [file, changes] of pendingChanges.entries()) {
    const update = tree.beginUpdate(relative(basePath, file.fileName));

    changes.forEach((change) => {
      if (change.removeLength != null) {
        update.remove(change.start, change.removeLength);
      }
      update.insertRight(change.start, change.text);
    });

    tree.commitUpdate(update);
  }

  return sourceFiles.length;
}
