/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {DirEntry, Rule, UpdateRecorder} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import {findImportSpecifier} from '../../utils/typescript/imports';

function* visit(directory: DirEntry): IterableIterator<ts.SourceFile> {
  for (const path of directory.subfiles) {
    if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
      const entry = directory.file(path);
      if (entry) {
        const content = entry.content;
        if (content.includes('XhrFactory')) {
          const source = ts.createSourceFile(
              entry.path,
              content.toString().replace(/^\uFEFF/, ''),
              ts.ScriptTarget.Latest,
              true,
          );

          yield source;
        }
      }
    }
  }

  for (const path of directory.subdirs) {
    if (path === 'node_modules' || path.startsWith('.')) {
      continue;
    }

    yield* visit(directory.dir(path));
  }
}

export default function(): Rule {
  return tree => {
    const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});

    for (const sourceFile of visit(tree.root)) {
      let recorder: UpdateRecorder|undefined;

      const allImportDeclarations =
          sourceFile.statements.filter(n => ts.isImportDeclaration(n)) as ts.ImportDeclaration[];
      if (allImportDeclarations.length === 0) {
        continue;
      }

      const httpCommonImport = findImportDeclaration('@angular/common/http', allImportDeclarations);
      if (!httpCommonImport) {
        continue;
      }

      const commonHttpNamedBinding = getNamedImports(httpCommonImport);
      if (commonHttpNamedBinding) {
        const commonHttpNamedImports = commonHttpNamedBinding.elements;
        const xhrFactorySpecifier = findImportSpecifier(commonHttpNamedImports, 'XhrFactory');

        if (!xhrFactorySpecifier) {
          continue;
        }

        recorder = tree.beginUpdate(sourceFile.fileName);

        // Remove 'XhrFactory' from '@angular/common/http'
        if (commonHttpNamedImports.length > 1) {
          // Remove 'XhrFactory' named import
          const index = commonHttpNamedBinding.getStart();
          const length = commonHttpNamedBinding.getWidth();

          const newImports = printer.printNode(
              ts.EmitHint.Unspecified,
              ts.factory.updateNamedImports(
                  commonHttpNamedBinding,
                  commonHttpNamedBinding.elements.filter(e => e !== xhrFactorySpecifier)),
              sourceFile);
          recorder.remove(index, length).insertLeft(index, newImports);
        } else {
          // Remove '@angular/common/http' import
          const index = httpCommonImport.getFullStart();
          const length = httpCommonImport.getFullWidth();
          recorder.remove(index, length);
        }

        // Import XhrFactory from @angular/common
        const commonImport = findImportDeclaration('@angular/common', allImportDeclarations);
        const commonNamedBinding = getNamedImports(commonImport);
        if (commonNamedBinding) {
          // Already has an import for '@angular/common', just add the named import.
          const index = commonNamedBinding.getStart();
          const length = commonNamedBinding.getWidth();
          const newImports = printer.printNode(
              ts.EmitHint.Unspecified,
              ts.factory.updateNamedImports(
                  commonNamedBinding, [...commonNamedBinding.elements, xhrFactorySpecifier]),
              sourceFile);

          recorder.remove(index, length).insertLeft(index, newImports);
        } else {
          // Add import to '@angular/common'
          const index = httpCommonImport.getFullStart();
          recorder.insertLeft(index, `\nimport { XhrFactory } from '@angular/common';`);
        }
      }

      if (recorder) {
        tree.commitUpdate(recorder);
      }
    }
  };
}

function findImportDeclaration(moduleSpecifier: string, importDeclarations: ts.ImportDeclaration[]):
    ts.ImportDeclaration|undefined {
  return importDeclarations.find(
      n => ts.isStringLiteral(n.moduleSpecifier) && n.moduleSpecifier.text === moduleSpecifier);
}

function getNamedImports(importDeclaration: ts.ImportDeclaration|undefined): ts.NamedImports|
    undefined {
  const namedBindings = importDeclaration?.importClause?.namedBindings;
  if (namedBindings && ts.isNamedImports(namedBindings)) {
    return namedBindings;
  }

  return undefined;
}