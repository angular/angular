/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {getImportSpecifier} from '../../utils/typescript/imports';
import {isReferenceToImport} from '../../utils/typescript/symbol';

export const classes = new Set(['FormArray', 'FormBuilder', 'FormControl', 'FormGroup']);
export const untypedPrefix = 'Untyped';
export const forms = '@angular/forms';

export interface MigratableNode {
  node: ts.Expression;
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

  // For each imported control class, insert the corresponding uptyped import.
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
    rewrite(imp.getEnd(), 0, `, ${untypedClass}`);
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
    importSpecifier: ts.ImportSpecifier|null): MigratableNode[] {
  if (importSpecifier === null) return [];
  const usages: MigratableNode[] = [];
  const visitNode = (node: ts.Node) => {
    // Look for a `new` expression with no type arguments which references an import we care about:
    // `new FormControl()`
    if (ts.isNewExpression(node) && !node.typeArguments &&
        isReferenceToImport(typeChecker, node.expression, importSpecifier)) {
      usages.push({node: node.expression, importName: importSpecifier.getText()});
    }
    ts.forEachChild(node, visitNode);
  };
  ts.forEachChild(sourceFile, visitNode);
  return usages;
}
