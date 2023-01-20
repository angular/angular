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

import {toStandalone} from './to-standalone';
import {ChangesByFile} from './util';

enum MigrationMode {
  toStandalone = 'convert-to-standalone',
}

interface Options {
  path: string;
  mode: MigrationMode;
}

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
  const pathToMigrate = join(basePath, options.path);

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

  if (options.mode === MigrationMode.toStandalone) {
    pendingChanges = toStandalone(sourceFiles, program, printer);
  } else {
    throw new SchematicsException(
        `Unknown schematic mode ${options.mode}. Cannot run the standalone migration.`);
  }

  for (const [file, changes] of pendingChanges.entries()) {
    const update = tree.beginUpdate(relative(basePath, file.fileName));

    changes.forEach(change => {
      if (change.removeLength != null) {
        update.remove(change.start, change.removeLength);
      }
      update.insertRight(change.start, change.text);
    });

    tree.commitUpdate(update);
  }
}
