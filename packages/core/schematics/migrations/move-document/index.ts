/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {dirname, relative} from 'path';
import * as ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {parseTsconfigFile} from '../../utils/typescript/parse_tsconfig';
import {DOCUMENT_TOKEN_NAME, DocumentImportVisitor, Imports} from './document_import_visitor';
import {addToImport, removeFromImport} from './move-import';


/** Entry point for the V8 move-document migration. */
export default function(): Rule {
  return (tree: Tree) => {
    const projectTsConfigPaths = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();

    if (!projectTsConfigPaths.length) {
      throw new SchematicsException(`Could not find any tsconfig file. Cannot migrate DOCUMENT 
          to new import source.`);
    }

    for (const tsconfigPath of projectTsConfigPaths) {
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
  const parsed = parseTsconfigFile(tsconfigPath, dirname(tsconfigPath));
  const host = ts.createCompilerHost(parsed.options, true);

  // We need to overwrite the host "readFile" method, as we want the TypeScript
  // program to be based on the file contents in the virtual file tree. Otherwise
  // if we run the migration for multiple tsconfig files which have intersecting
  // source files, it can end up updating query definitions multiple times.
  host.readFile = fileName => {
    const buffer = tree.read(relative(basePath, fileName));
    return buffer ? buffer.toString() : undefined;
  };

  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const typeChecker = program.getTypeChecker();
  const visitor = new DocumentImportVisitor(typeChecker);
  const rootSourceFiles = program.getRootFileNames().map(f => program.getSourceFile(f) !);

  // Analyze source files by finding imports.
  rootSourceFiles.forEach(sourceFile => visitor.visitNode(sourceFile));

  const {importsMap} = visitor;

  // Walk through all source files that contain resolved queries and update
  // the source files if needed. Note that we need to update multiple queries
  // within a source file within the same recorder in order to not throw off
  // the TypeScript node offsets.
  importsMap.forEach((imports: Imports, sourceFile: ts.SourceFile) => {
    const {platformBrowserImport, commonImport, documentElement, replaceText} = imports;
    if (!documentElement || !replaceText || !platformBrowserImport) {
      return;
    }
    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

    const platformBrowserDeclaration = platformBrowserImport.parent.parent;
    const newPlatformBrowserText = removeFromImport(platformBrowserImport, DOCUMENT_TOKEN_NAME);
    const newCommonText =
        commonImport ? addToImport(commonImport, DOCUMENT_TOKEN_NAME) : NEW_COMMON_TEXT;

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

const NEW_COMMON_TEXT = `\nimport {DOCUMENT} from '@angular/common';`;
