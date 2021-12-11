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

export const controlClassNames = ['AbstractControl', 'FormArray', 'FormControl', 'FormGroup'];
export const builderMethodNames = ['control', 'group', 'array'];
export const anySymbolName = 'AnyForUntypedForms';

export interface MigratableNode {
  node: ts.Expression;
  generic: string;
}

export function getControlClassImports(sourceFile: ts.SourceFile) {
  return controlClassNames.map(cclass => getImportSpecifier(sourceFile, '@angular/forms', cclass))
      .filter(v => v != null);
}

export function getFormBuilderImport(sourceFile: ts.SourceFile) {
  return getImportSpecifier(sourceFile, '@angular/forms', 'FormBuilder');
}

export function getAnyImport(sourceFile: ts.SourceFile) {
  return getImportSpecifier(sourceFile, '@angular/forms', anySymbolName);
}

export function findControlClassUsages(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
    importSpecifier: ts.ImportSpecifier|null): MigratableNode[] {
  if (importSpecifier === null) return [];
  let generic = `<${anySymbolName}>`;
  if (importSpecifier.name.getText() === 'FormArray' ||
      importSpecifier.propertyName?.getText() === 'FormArray') {
    generic = `<${anySymbolName}[]>`;
  }
  const usages: MigratableNode[] = [];
  const visitNode = (node: ts.Node) => {
    // Look for a `new` expression with no type arguments which references an import we care about:
    // `new FormControl()`
    if (ts.isNewExpression(node) && !node.typeArguments &&
        isReferenceToImport(typeChecker, node.expression, importSpecifier)) {
      usages.push({node: node.expression, generic});
    }
    ts.forEachChild(node, visitNode);
  };
  ts.forEachChild(sourceFile, visitNode);
  return usages;
}

export function findFormBuilderCalls(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
    importSpecifier: ts.ImportSpecifier|null): MigratableNode[] {
  if (!importSpecifier) return [];
  const usages = new Array<MigratableNode>();
  ts.forEachChild(sourceFile, function visitNode(node: ts.Node) {
    // Look for calls that look like `foo.<method to migrate>`.
    if (ts.isCallExpression(node) && !node.typeArguments &&
        ts.isPropertyAccessExpression(node.expression) && ts.isIdentifier(node.expression.name) &&
        builderMethodNames.includes(node.expression.name.text)) {
      const generic =
          node.expression.name.text === 'array' ? `<${anySymbolName}[]>` : `<${anySymbolName}>`;
      // Check whether the type of the object on which the function is called refers to the
      // provided import.
      if (isReferenceToImport(typeChecker, node.expression.expression, importSpecifier)) {
        usages.push({node: node.expression, generic});
      }
    }
    ts.forEachChild(node, visitNode);
  });
  return usages;
}
