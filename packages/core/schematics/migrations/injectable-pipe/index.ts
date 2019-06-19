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

import {InjectablePipeVisitor} from './angular/injectable_pipe_visitor';
import {INJECTABLE_DECORATOR_NAME, addImport, getNamedImports} from './util';

/**
 * Runs a migration over a TypeScript project that adds an `@Injectable`
 * annotation to all classes that have `@Pipe`.
 */
export default function(): Rule {
  return (tree: Tree) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot add Injectable annotation to pipes.');
    }

    for (const tsconfigPath of allPaths) {
      runInjectablePipeMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runInjectablePipeMigration(tree: Tree, tsconfigPath: string, basePath: string) {
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
  const visitor = new InjectablePipeVisitor(typeChecker);
  const sourceFiles = program.getSourceFiles().filter(
      f => !f.isDeclarationFile && !program.isSourceFileFromExternalLibrary(f));
  const printer = ts.createPrinter();

  sourceFiles.forEach(sourceFile => visitor.visitNode(sourceFile));

  visitor.missingInjectablePipes.forEach(data => {
    const {classDeclaration, importDeclarationMissingImport} = data;
    const sourceFile = classDeclaration.getSourceFile();
    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

    // Note that we don't need to go through the AST to insert the decorator, because the change
    // is pretty basic. Also this has a better chance of preserving the user's formatting.
    update.insertLeft(classDeclaration.getStart(), `@${INJECTABLE_DECORATOR_NAME}()\n`);

    // Add @Injectable to the imports if it isn't imported already. Note that this doesn't deal with
    // the case where there aren't any imports for `@angular/core` at all. We don't need to handle
    // it because the Pipe decorator won't be recognized if it hasn't been imported from Angular.
    if (importDeclarationMissingImport) {
      const namedImports = getNamedImports(importDeclarationMissingImport);

      if (namedImports) {
        update.remove(namedImports.getStart(), namedImports.getWidth());
        update.insertRight(
            namedImports.getStart(),
            printer.printNode(
                ts.EmitHint.Unspecified, addImport(namedImports, INJECTABLE_DECORATOR_NAME),
                sourceFile));
      }
    }

    tree.commitUpdate(update);
  });
}
