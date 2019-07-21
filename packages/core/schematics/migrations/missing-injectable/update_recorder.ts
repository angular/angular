/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * Update recorder interface that is used to transform source files in a non-colliding
 * way. Also this indirection makes it possible to re-use logic for both TSLint rules
 * and CLI devkit schematic updates.
 */
export interface UpdateRecorder {
  addNewImport(start: number, importText: string): void;
  updateExistingImport(namedBindings: ts.NamedImports, newNamedBindings: string): void;
  addClassDecorator(node: ts.ClassDeclaration, text: string, moduleName: string): void;
  replaceDecorator(node: ts.Decorator, newText: string, moduleName: string): void;
  commitUpdate(): void;
}
