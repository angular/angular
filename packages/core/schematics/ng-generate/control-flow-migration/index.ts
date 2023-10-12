/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {relative} from 'path';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {AnalyzedFile, MigrateError} from './types';
import {analyze, migrateTemplate} from './util';

export default function(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot run the control flow migration.');
    }

    context.logger.warn('IMPORTANT! This migration is in developer preview. Use with caution.');
    let errors: string[] = [];

    for (const tsconfigPath of allPaths) {
      const migrateErrors = runControlFlowMigration(tree, tsconfigPath, basePath);
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

function runControlFlowMigration(tree: Tree, tsconfigPath: string, basePath: string): string[] {
  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));
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

    for (const [start, end] of ranges) {
      const template = content.slice(start, end);
      const length = (end ?? content.length) - start;
      const {migrated, errors} = migrateTemplate(template);

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
