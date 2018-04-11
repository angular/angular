import * as ts from 'typescript';
import {getExportDeclaration, getImportDeclaration} from '../typescript/imports';

/** Name of the Angular Material module specifier. */
export const materialModuleSpecifier = '@angular/material';

/** Name of the Angular CDK module specifier. */
export const cdkModuleSpecifier = '@angular/cdk';

/** Whether the specified node is part of an Angular Material import declaration. */
export function isMaterialImportDeclaration(node: ts.Node) {
  return isMaterialDeclaration(getImportDeclaration(node));
}

/** Whether the specified node is part of an Angular Material export declaration. */
export function isMaterialExportDeclaration(node: ts.Node) {
  return getExportDeclaration(getImportDeclaration(node));
}

/** Whether the declaration is part of Angular Material. */
function isMaterialDeclaration(declaration: ts.ImportDeclaration | ts.ExportDeclaration) {
  const moduleSpecifier = declaration.moduleSpecifier.getText();
  return moduleSpecifier.indexOf(materialModuleSpecifier) !== -1||
      moduleSpecifier.indexOf(cdkModuleSpecifier) !== -1;
}
