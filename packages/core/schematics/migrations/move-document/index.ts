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
  const parsed = parseTsconfigFile(tsconfigPath, dirname(tsconfigPath));
  const host = ts.createCompilerHost(parsed.options, true);

  // We need to overwrite the host "readFile" method, as we want the TypeScript
  // program to be based on the file contents in the virtual file tree. Otherwise
  // if we run the migration for multiple tsconfig files which have intersecting
  // source files, it can end up updating query definitions multiple times.
  host.readFile = fileName => {
    const buffer = tree.read(relative(basePath, fileName));
    // Strip BOM as otherwise TSC methods (Ex: getWidth) will return an offset which
    // which breaks the CLI UpdateRecorder.
    // See: https://github.com/angular/angular/pull/30719
    return buffer ? buffer.toString().replace(/^\uFEFF/, '') : undefined;
  };

  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const typeChecker = program.getTypeChecker();
  const visitor = new DocumentImportVisitor(typeChecker);
  const sourceFiles = program.getSourceFiles().filter(
      f => !f.isDeclarationFile && !program.isSourceFileFromExternalLibrary(f));

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
