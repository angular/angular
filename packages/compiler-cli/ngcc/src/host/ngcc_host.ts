/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {ClassDeclaration, Declaration, Decorator, ReflectionHost} from '../../../src/ngtsc/reflection';

export const PRE_R3_MARKER = '__PRE_R3__';
export const POST_R3_MARKER = '__POST_R3__';

export type SwitchableVariableDeclaration = ts.VariableDeclaration&{initializer: ts.Identifier};
export function isSwitchableVariableDeclaration(node: ts.Node):
    node is SwitchableVariableDeclaration {
  return ts.isVariableDeclaration(node) && !!node.initializer &&
      ts.isIdentifier(node.initializer) && node.initializer.text.endsWith(PRE_R3_MARKER);
}

/**
 * The symbol corresponding to a "class" declaration. I.e. a `ts.Symbol` whose `valueDeclaration` is
 * a `ClassDeclaration`.
 */
export type ClassSymbol = ts.Symbol&{valueDeclaration: ClassDeclaration};

/**
 * A representation of a class that accounts for the potential existence of two `ClassSymbol`s for a
 * given class, as the compiled JavaScript bundles that ngcc reflects on can have two declarations.
 */
export interface NgccClassSymbol {
  /**
   * The name of the class.
   */
  name: string;

  /**
   * Represents the symbol corresponding with the outer declaration of the class. This should be
   * considered the public class symbol, i.e. its declaration is visible to the rest of the program.
   */
  declaration: ClassSymbol;

  /**
   * Represents the symbol corresponding with the inner declaration of the class, referred to as its
   * "implementation". This is not necessarily a `ClassSymbol` but rather just a `ts.Symbol`, as the
   * inner declaration does not need to satisfy the requirements imposed on a publicly visible class
   * declaration.
   */
  implementation: ts.Symbol;

  /**
   * Represents the symbol corresponding to a variable within a class IIFE that may be used to
   * attach static properties or decorated.
   */
  adjacent?: ts.Symbol;
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
  getClassSymbol(declaration: ts.Node): NgccClassSymbol|undefined;

  /**
   * Search the given module for variable declarations in which the initializer
   * is an identifier marked with the `PRE_R3_MARKER`.
   * @param module The module in which to search for switchable declarations.
   * @returns An array of variable declarations that match.
   */
  getSwitchableDeclarations(module: ts.Node): SwitchableVariableDeclaration[];

  /**
   * Retrieves all decorators of a given class symbol.
   * @param symbol Class symbol that can refer to a declaration which can hold decorators.
   * @returns An array of decorators or null if none are declared.
   */
  getDecoratorsOfSymbol(symbol: NgccClassSymbol): Decorator[]|null;

  /**
   * Retrieves all class symbols of a given source file.
   * @param sourceFile The source file to search for classes.
   * @returns An array of found class symbols.
   */
  findClassSymbols(sourceFile: ts.SourceFile): NgccClassSymbol[];

  /**
   * Find the last node that is relevant to the specified class.
   *
   * As well as the main declaration, classes can have additional statements such as static
   * properties (`SomeClass.staticProp = ...;`) and decorators (`__decorate(SomeClass, ...);`).
   * It is useful to know exactly where the class "ends" so that we can inject additional
   * statements after that point.
   *
   * @param classSymbol The class whose statements we want.
   */
  getEndOfClass(classSymbol: NgccClassSymbol): ts.Node;

  /**
   * Check whether a `Declaration` corresponds with a known declaration and set its `known` property
   * to the appropriate `KnownDeclaration`.
   *
   * @param decl The `Declaration` to check.
   * @return The passed in `Declaration` (potentially enhanced with a `KnownDeclaration`).
   */
  detectKnownDeclaration<T extends Declaration>(decl: T): T;
}
