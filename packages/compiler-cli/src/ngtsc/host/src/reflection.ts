/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * Metadata extracted from an instance of a decorator on another declaration.
 */
export interface Decorator {
  /**
   * Name by which the decorator was invoked in the user's code.
   *
   * This is distinct from the name by which the decorator was imported (though in practice they
   * will usually be the same).
   */
  name: string;

  /**
   * Identifier which refers to the decorator in source.
   */
  identifier: ts.Identifier;

  /**
   * `Import` by which the decorator was brought into the module in which it was invoked, or `null`
   * if the decorator was declared in the same module and not imported.
   */
  import : Import | null;

  /**
   * TypeScript reference to the decorator itself.
   */
  node: ts.Node;

  /**
   * Arguments of the invocation of the decorator, if the decorator is invoked, or `null` otherwise.
   */
  args: ts.Expression[]|null;
}

/**
 * An enumeration of possible kinds of class members.
 */
export enum ClassMemberKind {
  Constructor,
  Getter,
  Setter,
  Property,
  Method,
}

/**
 * A member of a class, such as a property, method, or constructor.
 */
export interface ClassMember {
  /**
   * TypeScript reference to the class member itself, or null if it is not applicable.
   */
  node: ts.Node|null;

  /**
   * Indication of which type of member this is (property, method, etc).
   */
  kind: ClassMemberKind;

  /**
   * TypeScript `ts.TypeNode` representing the type of the member, or `null` if not present or
   * applicable.
   */
  type: ts.TypeNode|null;

  /**
   * Name of the class member.
   */
  name: string;

  /**
   * TypeScript `ts.Identifier` representing the name of the member, or `null` if no such node
   * is present.
   *
   * The `nameNode` is useful in writing references to this member that will be correctly source-
   * mapped back to the original file.
   */
  nameNode: ts.Identifier|null;

  /**
   * TypeScript `ts.Expression` which represents the value of the member.
   *
   * If the member is a property, this will be the property initializer if there is one, or null
   * otherwise.
   */
  value: ts.Expression|null;

  /**
   * TypeScript `ts.Declaration` which represents the implementation of the member.
   *
   * In TypeScript code this is identical to the node, but in downleveled code this should always be
   * the Declaration which actually represents the member's runtime value.
   *
   * For example, the TS code:
   *
   * ```
   * class Clazz {
   *   static get property(): string {
   *     return 'value';
   *   }
   * }
   * ```
   *
   * Downlevels to:
   *
   * ```
   * var Clazz = (function () {
   *   function Clazz() {
   *   }
   *   Object.defineProperty(Clazz, "property", {
   *       get: function () {
   *           return 'value';
   *       },
   *       enumerable: true,
   *       configurable: true
   *   });
   *   return Clazz;
   * }());
   * ```
   *
   * In this example, for the property "property", the node would be the entire
   * Object.defineProperty ExpressionStatement, but the implementation would be this
   * FunctionDeclaration:
   *
   * ```
   * function () {
   *   return 'value';
   * },
   * ```
   */
  implementation: ts.Declaration|null;

  /**
   * Whether the member is static or not.
   */
  isStatic: boolean;

  /**
   * Any `Decorator`s which are present on the member, or `null` if none are present.
   */
  decorators: Decorator[]|null;
}

/**
 * A parameter to a constructor.
 */
export interface CtorParameter {
  /**
   * Name of the parameter, if available.
   *
   * Some parameters don't have a simple string name (for example, parameters which are destructured
   * into multiple variables). In these cases, `name` can be `null`.
   */
  name: string|null;

  /**
   * TypeScript `ts.BindingName` representing the name of the parameter.
   *
   * The `nameNode` is useful in writing references to this member that will be correctly source-
   * mapped back to the original file.
   */
  nameNode: ts.BindingName;

  /**
   * TypeScript `ts.Expression` representing the type of the parameter, if the type is a simple
   * expression type.
   *
   * If the type is not present or cannot be represented as an expression, `type` is `null`.
   */
  type: ts.Expression|null;

  /**
   * Any `Decorator`s which are present on the parameter, or `null` if none are present.
   */
  decorators: Decorator[]|null;
}

/**
 * Definition of a function or method, including its body if present and any parameters.
 *
 * In TypeScript code this metadata will be a simple reflection of the declarations in the node
 * itself. In ES5 code this can be more complicated, as the default values for parameters may
 * be extracted from certain body statements.
 */
export interface FunctionDefinition<T extends ts.MethodDeclaration|ts.FunctionDeclaration|
                                    ts.FunctionExpression> {
  /**
   * A reference to the node which declares the function.
   */
  node: T;

  /**
   * Statements of the function body, if a body is present, or null if no body is present.
   *
   * This list may have been filtered to exclude statements which perform parameter default value
   * initialization.
   */
  body: ts.Statement[]|null;

  /**
   * Metadata regarding the function's parameters, including possible default value expressions.
   */
  parameters: Parameter[];
}

/**
 * A parameter to a function or method.
 */
export interface Parameter {
  /**
   * Name of the parameter, if available.
   */
  name: string|null;

  /**
   * Declaration which created this parameter.
   */
  node: ts.ParameterDeclaration;

  /**
   * Expression which represents the default value of the parameter, if any.
   */
  initializer: ts.Expression|null;
}

/**
 * The source of an imported symbol, including the original symbol name and the module from which it
 * was imported.
 */
export interface Import {
  /**
   * The name of the imported symbol under which it was exported (not imported).
   */
  name: string;

  /**
   * The module from which the symbol was imported.
   *
   * This could either be an absolute module name (@angular/core for example) or a relative path.
   */
  from: string;
}

/**
 * The declaration of a symbol, along with information about how it was imported into the
 * application.
 */
export interface Declaration {
  /**
   * TypeScript reference to the declaration itself.
   */
  node: ts.Declaration;

  /**
   * The absolute module path from which the symbol was imported into the application, if the symbol
   * was imported via an absolute module (even through a chain of re-exports). If the symbol is part
   * of the application and was not imported from an absolute path, this will be `null`.
   */
  viaModule: string|null;
}

/**
 * Abstracts reflection operations on a TypeScript AST.
 *
 * Depending on the format of the code being interpreted, different concepts are represented with
 * different syntactical structures. The `ReflectionHost` abstracts over those differences and
 * presents a single API by which the compiler can query specific information about the AST.
 *
 * All operations on the `ReflectionHost` require the use of TypeScript `ts.Node`s with binding
 * information already available (that is, nodes that come from a `ts.Program` that has been
 * type-checked, and are not synthetically created).
 */
export interface ReflectionHost {
  /**
   * Examine a declaration (for example, of a class or function) and return metadata about any
   * decorators present on the declaration.
   *
   * @param declaration a TypeScript `ts.Declaration` node representing the class or function over
   * which to reflect. For example, if the intent is to reflect the decorators of a class and the
   * source is in ES6 format, this will be a `ts.ClassDeclaration` node. If the source is in ES5
   * format, this might be a `ts.VariableDeclaration` as classes in ES5 are represented as the
   * result of an IIFE execution.
   *
   * @returns an array of `Decorator` metadata if decorators are present on the declaration, or
   * `null` if either no decorators were present or if the declaration is not of a decorable type.
   */
  getDecoratorsOfDeclaration(declaration: ts.Declaration): Decorator[]|null;

  /**
   * Examine a declaration which should be of a class, and return metadata about the members of the
   * class.
   *
   * @param declaration a TypeScript `ts.Declaration` node representing the class over which to
   * reflect. If the source is in ES6 format, this will be a `ts.ClassDeclaration` node. If the
   * source is in ES5 format, this might be a `ts.VariableDeclaration` as classes in ES5 are
   * represented as the result of an IIFE execution.
   *
   * @returns an array of `ClassMember` metadata representing the members of the class.
   *
   * @throws if `declaration` does not resolve to a class declaration.
   */
  getMembersOfClass(clazz: ts.Declaration): ClassMember[];

  /**
   * Reflect over the constructor of a class and return metadata about its parameters.
   *
   * This method only looks at the constructor of a class directly and not at any inherited
   * constructors.
   *
   * @param declaration a TypeScript `ts.Declaration` node representing the class over which to
   * reflect. If the source is in ES6 format, this will be a `ts.ClassDeclaration` node. If the
   * source is in ES5 format, this might be a `ts.VariableDeclaration` as classes in ES5 are
   * represented as the result of an IIFE execution.
   *
   * @returns an array of `Parameter` metadata representing the parameters of the constructor, if
   * a constructor exists. If the constructor exists and has 0 parameters, this array will be empty.
   * If the class has no constructor, this method returns `null`.
   */
  getConstructorParameters(declaration: ts.Declaration): CtorParameter[]|null;

  /**
   * Reflect over a function and return metadata about its parameters and body.
   *
   * Functions in TypeScript and ES5 code have different AST representations, in particular around
   * default values for parameters. A TypeScript function has its default value as the initializer
   * on the parameter declaration, whereas an ES5 function has its default value set in a statement
   * of the form:
   *
   * if (param === void 0) { param = 3; }
   *
   * This method abstracts over these details, and interprets the function declaration and body to
   * extract parameter default values and the "real" body.
   *
   * A current limitation is that this metadata has no representation for shorthand assignment of
   * parameter objects in the function signature.
   *
   * @param fn a TypeScript `ts.Declaration` node representing the function over which to reflect.
   *
   * @returns a `FunctionDefinition` giving metadata about the function definition.
   */
  getDefinitionOfFunction<T extends ts.MethodDeclaration|ts.FunctionDeclaration|
                          ts.FunctionExpression>(fn: T): FunctionDefinition<T>;

  /**
   * Determine if an identifier was imported from another module and return `Import` metadata
   * describing its origin.
   *
   * @param id a TypeScript `ts.Identifer` to reflect.
   *
   * @returns metadata about the `Import` if the identifier was imported from another module, or
   * `null` if the identifier doesn't resolve to an import but instead is locally defined.
   */
  getImportOfIdentifier(id: ts.Identifier): Import|null;

  /**
   * Trace an identifier to its declaration, if possible.
   *
   * This method attempts to resolve the declaration of the given identifier, tracing back through
   * imports and re-exports until the original declaration statement is found. A `Declaration`
   * object is returned if the original declaration is found, or `null` is returned otherwise.
   *
   * If the declaration is in a different module, and that module is imported via an absolute path,
   * this method also returns the absolute path of the imported module. For example, if the code is:
   *
   * ```
   * import {RouterModule} from '@angular/core';
   *
   * export const ROUTES = RouterModule.forRoot([...]);
   * ```
   *
   * and if `getDeclarationOfIdentifier` is called on `RouterModule` in the `ROUTES` expression,
   * then it would trace `RouterModule` via its import from `@angular/core`, and note that the
   * definition was imported from `@angular/core` into the application where it was referenced.
   *
   * If the definition is re-exported several times from different absolute module names, only
   * the first one (the one by which the application refers to the module) is returned.
   *
   * This module name is returned in the `viaModule` field of the `Declaration`. If The declaration
   * is relative to the application itself and there was no import through an absolute path, then
   * `viaModule` is `null`.
   *
   * @param id a TypeScript `ts.Identifier` to trace back to a declaration.
   *
   * @returns metadata about the `Declaration` if the original declaration is found, or `null`
   * otherwise.
   */
  getDeclarationOfIdentifier(id: ts.Identifier): Declaration|null;

  /**
   * Collect the declarations exported from a module by name.
   *
   * Iterates over the exports of a module (including re-exports) and returns a map of export
   * name to its `Declaration`. If an exported value is itself re-exported from another module,
   * the `Declaration`'s `viaModule` will reflect that.
   *
   * @param node a TypeScript `ts.Node` representing the module (for example a `ts.SourceFile`) for
   * which to collect exports.
   *
   * @returns a map of `Declaration`s for the module's exports, by name.
   */
  getExportsOfModule(module: ts.Node): Map<string, Declaration>|null;

  /**
   * Check whether the given node actually represents a class.
   */
  isClass(node: ts.Node): boolean;

  hasBaseClass(node: ts.Declaration): boolean;

  /**
   * Get the number of generic type parameters of a given class.
   *
   * @returns the number of type parameters of the class, if known, or `null` if the declaration
   * is not a class or has an unknown number of type parameters.
   */
  getGenericArityOfClass(clazz: ts.Declaration): number|null;

  /**
   * Find the assigned value of a variable declaration.
   *
   * Normally this will be the initializer of the declaration, but where the variable is
   * not a `const` we may need to look elsewhere for the variable's value.
   *
   * @param declaration a TypeScript variable declaration, whose value we want.
   * @returns the value of the variable, as a TypeScript expression node, or `undefined`
   * if the value cannot be computed.
   */
  getVariableValue(declaration: ts.VariableDeclaration): ts.Expression|null;

  /**
   * Take an exported declaration of a class (maybe downleveled to a variable) and look up the
   * declaration of its type in a separate .d.ts tree.
   *
   * This function is allowed to return `null` if the current compilation unit does not have a
   * separate .d.ts tree. When compiling TypeScript code this is always the case, since .d.ts files
   * are produced only during the emit of such a compilation. When compiling .js code, however,
   * there is frequently a parallel .d.ts tree which this method exposes.
   *
   * Note that the `ts.ClassDeclaration` returned from this function may not be from the same
   * `ts.Program` as the input declaration.
   */
  getDtsDeclarationOfClass(declaration: ts.Declaration): ts.ClassDeclaration|null;
}
