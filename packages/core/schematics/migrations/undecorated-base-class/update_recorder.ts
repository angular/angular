/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * Update recorder interface that is passed to the import and declarations
 * manager. This makes it possible to re-use logic for both TSLint rules and
 * CLI devkit schematic updates.
 */
export interface UpdateRecorder {
  addNewImport(start: number, importText: string): void;
  updateExistingImport(namedBindings: ts.NamedImports, newNamedBindings: string): void;
  updateModuleDeclarations(node: ts.ArrayLiteralExpression, newDeclarations: string): void;
  addBaseClassDecorator(node: ts.ClassDeclaration, decoratorText: string): void;
  commitUpdate(): void;

  /*
  insertLeft(index: number, content: string): void;
  insertRight(index: number, content: string): void;
  remove(index: number, length: number): void;*/
}
