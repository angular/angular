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
   * TypeScript reference to the class member itself,
   * or null if not present or applicagle (e.g. when source is JS).
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
   * TypeScript `ts.Expression` which initializes this member, if the member is a property, or
   * `null` otherwise.
   */
  initializer: ts.Expression|null;

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
 * A parameter to a function or constructor.
 */
export interface Parameter {
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
  getConstructorParameters(declaration: ts.Declaration): Parameter[]|null;

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
}
