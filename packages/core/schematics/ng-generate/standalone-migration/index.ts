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

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createProgramOptions} from '../../utils/typescript/compiler_host';

import {pruneNgModules} from './prune-modules';
import {toStandaloneBootstrap} from './standalone-bootstrap';
import {toStandalone} from './to-standalone';
import {ChangesByFile} from './util';

enum MigrationMode {
  toStandalone = 'convert-to-standalone',
  pruneModules = 'prune-ng-modules',
  standaloneBootstrap = 'standalone-bootstrap',
}

interface Options {
  path: string;
  mode: MigrationMode;
}

const normalizePath = (path: string): string => path.replace(/\\/g, '/');

export default function(options: Options): Rule {
  return async (tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot run the standalone migration.');
    }

    for (const tsconfigPath of allPaths) {
      standaloneMigration(tree, tsconfigPath, basePath, options);
    }
  };
}

function standaloneMigration(tree: Tree, tsconfigPath: string, basePath: string, options: Options) {
  if (options.path.startsWith('..')) {
    throw new SchematicsException(
        'Cannot run standalone migration outside of the current project.');
  }

  const {host, rootNames} = createProgramOptions(tree, tsconfigPath, basePath);
  const program = createProgram({
                    rootNames,
                    host,
                    options: {_enableTemplateTypeChecker: true, compileNonExportedClasses: true}
                  }) as NgtscProgram;
  const printer = ts.createPrinter();

  // TS and Schematic use paths in POSIX format even on Windows.
  // This is needed as otherwise string matching such as
  // `sourceFile.fileName.startsWith(pathToMigrate)` will not work correctly.
  const pathToMigrate = normalizePath(join(basePath, options.path));

  if (existsSync(pathToMigrate) && !statSync(pathToMigrate).isDirectory()) {
    throw new SchematicsException(`Migration path ${
        pathToMigrate} has to be a directory. Cannot run the standalone migration.`);
  }

  const sourceFiles = program.getTsProgram().getSourceFiles().filter(sourceFile => {
    return sourceFile.fileName.startsWith(pathToMigrate) &&
        canMigrateFile(basePath, sourceFile, program.getTsProgram());
  });

  if (sourceFiles.length === 0) {
    throw new SchematicsException(`Could not find any files to migrate under the path ${
        pathToMigrate}. Cannot run the standalone migration.`);
  }

  let pendingChanges: ChangesByFile;
  let filesToRemove: Set<ts.SourceFile>|null = null;

  if (options.mode === MigrationMode.pruneModules) {
    const result = pruneNgModules(program, host, basePath, rootNames, sourceFiles, printer);
    pendingChanges = result.pendingChanges;
    filesToRemove = result.filesToRemove;
  } else if (options.mode === MigrationMode.standaloneBootstrap) {
    pendingChanges =
        toStandaloneBootstrap(program, host, basePath, rootNames, sourceFiles, printer);
  } else {
    /** MigrationMode.toStandalone */
    pendingChanges = toStandalone(sourceFiles, program, printer);
  }

  for (const [file, changes] of pendingChanges.entries()) {
    // Don't attempt to edit a file if it's going to be deleted.
    if (filesToRemove?.has(file)) {
      continue;
    }

    const update = tree.beginUpdate(relative(basePath, file.fileName));

    changes.forEach(change => {
      if (change.removeLength != null) {
        update.remove(change.start, change.removeLength);
      }
      update.insertRight(change.start, change.text);
    });

    tree.commitUpdate(update);
  }

  if (filesToRemove) {
    for (const file of filesToRemove) {
      tree.delete(relative(basePath, file.fileName));
    }
  }
}
