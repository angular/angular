/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {getImportSpecifier} from '../../utils/typescript/imports';

export const classes = new Set(['FormArray', 'FormBuilder', 'FormControl', 'FormGroup']);
export const formControl = 'FormControl';
export const untypedPrefix = 'Untyped';
export const forms = '@angular/forms';

export interface MigratableNode {
  node: ts.Node;
  importName: string;
}

export type rewriteFn = (startPos: number, origLength: number, text: string) => void;

export function migrateFile(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker, rewrite: rewriteFn) {
  const imports = getImports(sourceFile);

  // If no relevant classes are imported, we can exit early.
  if (imports.length === 0) return;

  // For each control class, migrate all of its uses.
  for (let i = imports.length; i >= 0; i--) {
    const imp = imports[i];
    const usages = getUsages(sourceFile, typeChecker, imp);
    if (usages.length === 0) {
      // Since there are no usages of this class we need to migrate it, we should completely
      // skip it for the subsequent migration steps.
      imports.splice(i, 1);
    }
    for (const usage of usages) {
      const newName = getUntypedVersionOfImportOrName(usage.importName);
      if (newName === null) {
        // This should never happen.
        console.error(
            `Typed forms migration error: unknown replacement for usage ${usage.node.getText()}`);
        continue;
      }
      rewrite(usage.node.getStart(), usage.node.getWidth(), newName);
    }
  }

  // For each imported control class, migrate to the corresponding uptyped import.
  for (const imp of imports) {
    const untypedClass = getUntypedVersionOfImportOrName(imp.getText());
    if (untypedClass === null) {
      // This should never happen.
      console.error(
          `Typed forms migration error: unknown untyped version of import ${imp.getText()}`);
      continue;
    }
    if (getImportSpecifier(sourceFile, forms, untypedClass)) {
      // In order to make the migration idempotent, we must check whether the untyped version of the
      // class is already present. If present, immediately continue.
      continue;
    }
    rewrite(imp.getStart(), imp.getWidth(), untypedClass);
  }
}

function getImports(sourceFile: ts.SourceFile): ts.ImportSpecifier[] {
  let imports: ts.ImportSpecifier[] = [];
  for (const cc of classes) {
    const specifier = getImportSpecifier(sourceFile, forms, cc);
    if (!specifier) continue;
    imports.push(specifier);
  }
  return imports;
}

function getUntypedVersionOfImportOrName(name: string): string|null {
  for (const cc of classes) {
    if (name.includes(cc)) {
      return `${untypedPrefix}${cc}`;
    }
  }
  return null;
}

function getUsages(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
    importSpecifier: ts.ImportSpecifier): MigratableNode[] {
  const usages: MigratableNode[] = [];
  const visitNode = (node: ts.Node) => {
    if (ts.isImportSpecifier(node)) {
      // Skip this node and all of its children; imports are a special case.
      return;
    }
    if (ts.isIdentifier(node) && isUsageOfFormsImport(typeChecker, node, importSpecifier)) {
      usages.push({node, importName: importSpecifier.getText()});
    }
    ts.forEachChild(node, visitNode);
  };
  ts.forEachChild(sourceFile, visitNode);
  return usages;
}

function isUsageOfFormsImport(
    typeChecker: ts.TypeChecker, node: ts.Identifier,
    importSpecifier: ts.ImportSpecifier): boolean {
  const symbol = typeChecker.getSymbolAtLocation(node);

  // We check symbol.declarations because we actually care about the name at the declaration site,
  // not the usage site. These could be different in the case of overridden constructors.
  if (!symbol || symbol.declarations === undefined || !symbol.declarations.length) return false;

  const decl = symbol.declarations[0];
  if (!ts.isImportSpecifier(decl)) return false;

  // As per `typescript/imports.ts`, we must walk up the tree to find the enclosing import
  // declaration. For reasons specific to the TS AST, this is always 3 levels up from an import
  // specifier node.
  const importDecl = decl.parent.parent.parent;
  if (!ts.isStringLiteral(importDecl.moduleSpecifier)) return false;

  const importName = typeChecker.getTypeAtLocation(importSpecifier)?.getSymbol()?.getName();
  if (!importName) return false;

  // Handles aliased imports: e.g. "import {Component as myComp} from ...";
  const declName = decl.propertyName ? decl.propertyName.text : decl.name.text;

  if (importName === declName) return true;

  // In the case of FormControl's overridden exported constructor, the value name and declaration
  // name are not exactly the same. For our purposes, it's enough to check whether the latter is a
  // substring of the former.
  if (declName === formControl && importName.includes(declName)) return true;

  return false;
}
