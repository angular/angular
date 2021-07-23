import {UpdateRecorder} from '@angular-devkit/schematics';
import * as ts from 'typescript';

import {getImportSpecifier, replaceImport} from '../../utils/typescript/imports';
import {isReferenceToImport} from '../../utils/typescript/symbol';

export function migrateNode(
    update: UpdateRecorder, node: ts.Expression, importd: ts.ImportSpecifier|null) {
  if (!importd) return;
  let generic = '<any>';
  if (node.getFullText().includes('array') || node.getFullText().includes('FormArray')) {
    generic = '<any[]>';
  }
  update.insertRight(node.getEnd(), generic)
}

export function getControlClassImports(sourceFile: ts.SourceFile) {
  return ['FormControl', 'FormGroup', 'FormArray', 'AbstractControl'].map(
      cclass => getImportSpecifier(sourceFile, '@angular/forms', cclass));
}

export function getFormBuilderImport(sourceFile: ts.SourceFile) {
  return getImportSpecifier(sourceFile, '@angular/forms', 'FormBuilder');
}

export function findControlClassUsages(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
    importSpecifier: ts.ImportSpecifier|null) {
  if (!importSpecifier) return [];
  const usages = new Array<ts.Expression>();
  ts.forEachChild(sourceFile, function visitNode(node: ts.Node) {
    if (ts.isNewExpression(node) &&
        isReferenceToImport(typeChecker, node.expression, importSpecifier)) {
      usages.push(node.expression);
    }
    ts.forEachChild(node, visitNode);
  });
  return usages;
}

export function findFormBuilderCalls(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
    importSpecifier: ts.ImportSpecifier|null) {
  if (!importSpecifier) return [];
  const usages = new Array<ts.Expression>();
  ts.forEachChild(sourceFile, function visitNode(node: ts.Node) {
    // Look for calls that look like `foo.<method to migrate>`.
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.name) &&
        ['control', 'group', 'array'].includes(node.expression.name.text)) {
      // Check whether the type of the object on which the function is called refers to the
      // provided import.
      if (isReferenceToImport(typeChecker, node.expression.expression, importSpecifier)) {
        usages.push(node.expression);
      }
    }
    ts.forEachChild(node, visitNode);
  });
  return usages;
}