/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {join, relative} from 'path';

import {normalizePath} from '../../utils/change_tracker';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {migrateTemplate} from './migration';
import {AnalyzedFile, MigrateError} from './types';
import {analyze} from './util';

interface Options {
  path: string;
}

export default function(options: Options): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const basePath = process.cwd();
    const pathToMigrate = normalizePath(join(basePath, options.path));
    let allPaths = [];
    if (pathToMigrate.trim() !== '') {
      allPaths.push(pathToMigrate);
    }

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot run the control flow migration.');
    }

    context.logger.warn('IMPORTANT! This migration is in developer preview. Use with caution.');
    let errors: string[] = [];

    for (const tsconfigPath of allPaths) {
      const migrateErrors =
          runControlFlowMigration(tree, tsconfigPath, basePath, pathToMigrate, options);
      errors = [...errors, ...migrateErrors];
    }

    if (errors.length > 0) {
      context.logger.warn(`WARNING: ${errors.length} errors occured during your migration:\n`);
      errors.forEach((err: string) => {
        context.logger.warn(err);
      });
    }
  };
}

function runControlFlowMigration(
    tree: Tree, tsconfigPath: string, basePath: string, pathToMigrate: string,
    schematicOptions: Options): string[] {
  if (schematicOptions.path.startsWith('..')) {
    throw new SchematicsException(
        'Cannot run control flow migration outside of the current project.');
  }

  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const sourceFiles = program.getSourceFiles().filter(
      sourceFile => sourceFile.fileName.startsWith(pathToMigrate) &&
          canMigrateFile(basePath, sourceFile, program));

  if (sourceFiles.length === 0) {
    throw new SchematicsException(`Could not find any files to migrate under the path ${
        pathToMigrate}. Cannot run the control flow migration.`);
  }

  const analysis = new Map<string, AnalyzedFile>();
  const migrateErrors = new Map<string, MigrateError[]>();

  for (const sourceFile of sourceFiles) {
    analyze(sourceFile, analysis);
  }

  for (const [path, file] of analysis) {
    const ranges = file.getSortedRanges();
    const relativePath = relative(basePath, path);
    const content = tree.readText(relativePath);
    const update = tree.beginUpdate(relativePath);

    for (const {start, end, node, type} of ranges) {
      const template = content.slice(start, end);
      const length = (end ?? content.length) - start;

      const {migrated, errors} = migrateTemplate(template, type, node, file);

      if (migrated !== null) {
        update.remove(start, length);
        update.insertLeft(start, migrated);
      }

      if (errors.length > 0) {
        migrateErrors.set(path, errors);
      }
    }

    tree.commitUpdate(update);
  }

  const errorList: string[] = [];

  for (let [template, errors] of migrateErrors) {
    errorList.push(generateErrorMessage(template, errors));
  }

  return errorList;
}

function generateErrorMessage(path: string, errors: MigrateError[]): string {
  let errorMessage = `Template "${path}" encountered ${errors.length} errors during migration:\n`;
  errorMessage += errors.map(e => ` - ${e.type}: ${e.error}\n`);
  return errorMessage;
}
