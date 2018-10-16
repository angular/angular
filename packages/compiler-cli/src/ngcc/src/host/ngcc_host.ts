/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {ReflectionHost} from '../../../ngtsc/host';
import {DecoratedClass} from './decorated_class';

export const PRE_R3_MARKER = '__PRE_R3__';
export const POST_R3_MARKER = '__POST_R3__';

export type SwitchableVariableDeclaration = ts.VariableDeclaration & {initializer: ts.Identifier};
export function isSwitchableVariableDeclaration(node: ts.Node):
    node is SwitchableVariableDeclaration {
  return ts.isVariableDeclaration(node) && !!node.initializer &&
      ts.isIdentifier(node.initializer) && node.initializer.text.endsWith(PRE_R3_MARKER);
}

/**
 * A reflection host that has extra methods for looking at non-Typescript package formats
 */
export interface NgccReflectionHost extends ReflectionHost {
  /**
   * Find a symbol for a declaration that we think is a class.
   * @param declaration The declaration whose symbol we are finding
   * @returns the symbol for the declaration or `undefined` if it is not
   * a "class" or has no symbol.
   */
  getClassSymbol(node: ts.Node): ts.Symbol|undefined;

  /**
   * Search the given module for variable declarations in which the initializer
   * is an identifier marked with the `PRE_R3_MARKER`.
   * @param module The module in which to search for switchable declarations.
   * @returns An array of variable declarations that match.
   */
  getSwitchableDeclarations(module: ts.Node): SwitchableVariableDeclaration[];

  /**
   * Find all the classes that contain decorations in a given file.
   * @param sourceFile The source file to search for decorated classes.
   * @returns An array of decorated classes.
   */
  findDecoratedClasses(sourceFile: ts.SourceFile): DecoratedClass[];
}
