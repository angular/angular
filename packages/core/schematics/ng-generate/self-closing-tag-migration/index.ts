/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {existsSync, statSync} from 'fs';
import {join, relative} from 'path';

import {normalizePath} from '../../utils/change_tracker';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';
import {migrateTemplateToSelfClosingTags} from './to-self-closing-tags';
import ts from 'typescript';
import {analyzeDecorator, AnalyzedFile} from './util';

interface Options {
  path: string;
}

export function migrate(options: Options): Rule {
  return async (tree, context) => {
    const basePath = process.cwd();
    const pathToMigrate = normalizePath(join(basePath, options.path));
    let allPaths = [];

    if (pathToMigrate.trim() !== '') {
      allPaths.push(pathToMigrate);
    }

    if (!allPaths.length) {
      throw new SchematicsException(
        'Could not find any tsconfig file. Cannot run the self closing tag migration.',
      );
    }

    for (const tsconfigPath of allPaths) {
      selfClosingTagMigration(tree, tsconfigPath, basePath, pathToMigrate, options);
    }

    context.logger.info('🎉 Automated migration step has finished! 🎉');

    context.logger.info(
      'IMPORTANT! Please verify manually that your application builds and behaves as expected.',
    );
  };
}

function selfClosingTagMigration(
  tree: Tree,
  tsconfigPath: string,
  basePath: string,
  pathToMigrate: string,
  schematicOptions: Options,
) {
  if (schematicOptions.path.startsWith('..')) {
    throw new SchematicsException(
      'Cannot run self closing tag migration outside of the current project.',
    );
  }

  if (existsSync(pathToMigrate) && !statSync(pathToMigrate).isDirectory()) {
    throw new SchematicsException(
      `Migration path ${pathToMigrate} has to be a directory. Cannot run the self closing tag migration.`,
    );
  }

  const analyzedFiles = new Map<string, AnalyzedFile[]>();

  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const sourceFiles = program
    .getSourceFiles()
    .filter(
      (sourceFile) =>
        sourceFile.fileName.startsWith(pathToMigrate) &&
        canMigrateFile(basePath, sourceFile, program),
    );

  sourceFiles.forEach((sourceFile: ts.SourceFile) => {
    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isClassDeclaration(node)) {
        analyzeDecorator(node, sourceFile, analyzedFiles);
      }
    });
  });

  const paths = analyzedFiles.keys();

  for (const path of paths) {
    const cmpNodes = analyzedFiles.get(path)!;
    const relativePath = relative(basePath, path);
    const content = tree.readText(relativePath);
    const update = tree.beginUpdate(relativePath);

    for (const cmpNode of cmpNodes) {
      const length = (cmpNode.end ?? content.length) - cmpNode.start;

      if (cmpNode.templateUrl) {
        const {migrated, changed} = migrateTemplateToSelfClosingTags(content);
        if (changed) {
          update.remove(cmpNode.start, length);
          update.insertRight(cmpNode.start, migrated);
        }
      } else if (cmpNode.template) {
        const {migrated, changed} = migrateTemplateToSelfClosingTags(cmpNode.template.slice(1, -1));
        if (changed) {
          update.remove(cmpNode.start, length);
          update.insertRight(cmpNode.start, migrated);
        }
      }
    }

    tree.commitUpdate(update);
  }
}
