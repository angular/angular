/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {relative} from 'path';
import * as ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {COMMON_IMPORT, DOCUMENT_TOKEN_NAME, DocumentImportVisitor, ResolvedDocumentImport} from './document_import_visitor';
import {addToImport, createImport, removeFromImport} from './move-import';


/** Entry point for the V8 move-document migration. */
export default function(): Rule {
  return (tree: Tree) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();

    if (!buildPaths.length && !testPaths.length) {
      throw new SchematicsException(`Could not find any tsconfig file. Cannot migrate DOCUMENT
          to new import source.`);
    }

    for (const tsconfigPath of [...buildPaths, ...testPaths]) {
      runMoveDocumentMigration(tree, tsconfigPath, basePath);
    }
  };
}

/**
 * Runs the DOCUMENT InjectionToken import migration for the given TypeScript project. The
 * schematic analyzes the imports within the project and moves the deprecated symbol to the
 * new import source.
 */
function runMoveDocumentMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const visitor = new DocumentImportVisitor(typeChecker);
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  // Analyze source files by finding imports.
  sourceFiles.forEach(sourceFile => visitor.visitNode(sourceFile));

  const {importsMap} = visitor;

  // Walk through all source files that contain resolved queries and update
  // the source files if needed. Note that we need to update multiple queries
  // within a source file within the same recorder in order to not throw off
  // the TypeScript node offsets.
  importsMap.forEach((resolvedImport: ResolvedDocumentImport, sourceFile: ts.SourceFile) => {
    const {platformBrowserImport, commonImport, documentElement} = resolvedImport;
    if (!documentElement || !platformBrowserImport) {
      return;
    }
    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

    const platformBrowserDeclaration = platformBrowserImport.parent.parent;
    const newPlatformBrowserText =
        removeFromImport(platformBrowserImport, sourceFile, DOCUMENT_TOKEN_NAME);
    const newCommonText = commonImport ?
        addToImport(commonImport, sourceFile, documentElement.name, documentElement.propertyName) :
        createImport(COMMON_IMPORT, sourceFile, documentElement.name, documentElement.propertyName);

    // Replace the existing query decorator call expression with the updated
    // call expression node.
    update.remove(platformBrowserDeclaration.getStart(), platformBrowserDeclaration.getWidth());
    update.insertRight(platformBrowserDeclaration.getStart(), newPlatformBrowserText);

    if (commonImport) {
      const commonDeclaration = commonImport.parent.parent;
      update.remove(commonDeclaration.getStart(), commonDeclaration.getWidth());
      update.insertRight(commonDeclaration.getStart(), newCommonText);
    } else {
      update.insertRight(platformBrowserDeclaration.getStart(), newCommonText);
    }

    tree.commitUpdate(update);
  });
}
