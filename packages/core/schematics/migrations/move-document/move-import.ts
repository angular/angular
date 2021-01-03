/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

export function removeFromImport(
    importNode: ts.NamedImports, sourceFile: ts.SourceFile, importName: string): string {
  const printer = ts.createPrinter();
  const elements = importNode.elements.filter(
      el => String((el.propertyName || el.name).escapedText) !== importName);

  if (!elements.length) {
    return '';
  }

  const oldDeclaration = importNode.parent.parent;
  const newImport = ts.createNamedImports(elements);
  const importClause = ts.createImportClause(undefined, newImport);
  const newDeclaration = ts.createImportDeclaration(
      undefined, undefined, importClause, oldDeclaration.moduleSpecifier);

  return printer.printNode(ts.EmitHint.Unspecified, newDeclaration, sourceFile);
}

export function addToImport(
    importNode: ts.NamedImports, sourceFile: ts.SourceFile, name: ts.Identifier,
    propertyName?: ts.Identifier): string {
  const printer = ts.createPrinter();
  const propertyNameIdentifier =
      propertyName ? ts.createIdentifier(String(propertyName.escapedText)) : undefined;
  const nameIdentifier = ts.createIdentifier(String(name.escapedText));
  const newSpecfier = ts.createImportSpecifier(propertyNameIdentifier, nameIdentifier);
  const elements = [...importNode.elements];

  elements.push(newSpecfier);

  const oldDeclaration = importNode.parent.parent;
  const newImport = ts.createNamedImports(elements);
  const importClause = ts.createImportClause(undefined, newImport);
  const newDeclaration = ts.createImportDeclaration(
      undefined, undefined, importClause, oldDeclaration.moduleSpecifier);

  return printer.printNode(ts.EmitHint.Unspecified, newDeclaration, sourceFile);
}

export function createImport(
    importSource: string, sourceFile: ts.SourceFile, name: ts.Identifier,
    propertyName?: ts.Identifier) {
  const printer = ts.createPrinter();
  const propertyNameIdentifier =
      propertyName ? ts.createIdentifier(String(propertyName.escapedText)) : undefined;
  const nameIdentifier = ts.createIdentifier(String(name.escapedText));
  const newSpecfier = ts.createImportSpecifier(propertyNameIdentifier, nameIdentifier);
  const newNamedImports = ts.createNamedImports([newSpecfier]);
  const importClause = ts.createImportClause(undefined, newNamedImports);
  const moduleSpecifier = ts.createStringLiteral(importSource);
  const newImport = ts.createImportDeclaration(undefined, undefined, importClause, moduleSpecifier);

  return printer.printNode(ts.EmitHint.Unspecified, newImport, sourceFile);
}
