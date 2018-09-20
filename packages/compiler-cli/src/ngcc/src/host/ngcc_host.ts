/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {ReflectionHost} from '../../../ngtsc/host';

export const PRE_NGCC_MARKER = '__PRE_NGCC__';
export const POST_NGCC_MARKER = '__POST_NGCC__';

export type SwitchableVariableDeclaration = ts.VariableDeclaration & {initializer: ts.Identifier};
export function isSwitchableVariableDeclaration(node: ts.Node):
    node is SwitchableVariableDeclaration {
  return ts.isVariableDeclaration(node) && !!node.initializer &&
      ts.isIdentifier(node.initializer) && node.initializer.text.endsWith(PRE_NGCC_MARKER);
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
   * is an identifier marked with the `PRE_NGCC_MARKER`.
   * @param module The module in which to search for switchable declarations.
   * @returns An array of variable declarations that match.
   */
  getSwitchableDeclarations(module: ts.Node): SwitchableVariableDeclaration[];
}
