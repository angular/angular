/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {ClassDeclaration, ConcreteDeclaration, Decorator, ReflectionHost} from '../../../src/ngtsc/reflection';

export const PRE_R3_MARKER = '__PRE_R3__';
export const POST_R3_MARKER = '__POST_R3__';

export type SwitchableVariableDeclaration = ts.VariableDeclaration & {initializer: ts.Identifier};
export function isSwitchableVariableDeclaration(node: ts.Node):
    node is SwitchableVariableDeclaration {
  return ts.isVariableDeclaration(node) && !!node.initializer &&
      ts.isIdentifier(node.initializer) && node.initializer.text.endsWith(PRE_R3_MARKER);
}

/**
 * A structure returned from `getModuleWithProviderInfo` that describes functions
 * that return ModuleWithProviders objects.
 */
export interface ModuleWithProvidersFunction {
  /**
   * The name of the declared function.
   */
  name: string;
  /**
   * The declaration of the function that returns the `ModuleWithProviders` object.
   */
  declaration: ts.SignatureDeclaration;
  /**
   * Declaration of the containing class (if this is a method)
   */
  container: ts.Declaration|null;
  /**
   * The declaration of the class that the `ngModule` property on the `ModuleWithProviders` object
   * refers to.
   */
  ngModule: ConcreteDeclaration<ClassDeclaration>;
}

/**
 * The symbol corresponding to a "class" declaration. I.e. a `ts.Symbol` whose `valueDeclaration` is
 * a `ClassDeclaration`.
 */
export type ClassSymbol = ts.Symbol & {valueDeclaration: ClassDeclaration};

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
   * Search the given source file for exported functions and static class methods that return
   * ModuleWithProviders objects.
   * @param f The source file to search for these functions
   * @returns An array of info items about each of the functions that return ModuleWithProviders
   * objects.
   */
  getModuleWithProvidersFunctions(f: ts.SourceFile): ModuleWithProvidersFunction[];
}
