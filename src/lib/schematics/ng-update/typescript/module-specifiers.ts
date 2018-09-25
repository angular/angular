/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {getExportDeclaration, getImportDeclaration} from '@angular/cdk/schematics';

/** Name of the Angular Material module specifier. */
export const materialModuleSpecifier = '@angular/material';

/** Name of the Angular CDK module specifier. */
export const cdkModuleSpecifier = '@angular/cdk';

/** Whether the specified node is part of an Angular Material or CDK import declaration. */
export function isMaterialImportDeclaration(node: ts.Node) {
  return isMaterialDeclaration(getImportDeclaration(node));
}

/** Whether the specified node is part of an Angular Material or CDK import declaration. */
export function isMaterialExportDeclaration(node: ts.Node) {
  return isMaterialDeclaration(getExportDeclaration(node));
}

/** Whether the declaration is part of Angular Material. */
function isMaterialDeclaration(declaration: ts.ImportDeclaration | ts.ExportDeclaration) {
  if (!declaration.moduleSpecifier) {
    return false;
  }

  const moduleSpecifier = declaration.moduleSpecifier.getText();
  return moduleSpecifier.indexOf(materialModuleSpecifier) !== -1 ||
      moduleSpecifier.indexOf(cdkModuleSpecifier) !== -1;
}
