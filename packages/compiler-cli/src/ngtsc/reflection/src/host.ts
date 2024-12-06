/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

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
   * Identifier which refers to the decorator in the user's code.
   */
  identifier: DecoratorIdentifier;

  /**
   * `Import` by which the decorator was brought into the module in which it was invoked, or `null`
   * if the decorator was declared in the same module and not imported.
   */
  import: Import | null;

  /**
   * TypeScript reference to the decorator itself.
   */
  node: ts.Node;

  /**
   * Arguments of the invocation of the decorator, if the decorator is invoked, or `null`
   * otherwise.
   */
  args: ts.Expression[] | null;
}

/**
 * A decorator is identified by either a simple identifier (e.g. `Decorator`) or, in some cases,
 * a namespaced property access (e.g. `core.Decorator`).
 */
export type DecoratorIdentifier = ts.Identifier | NamespacedIdentifier;
export type NamespacedIdentifier = ts.PropertyAccessExpression & {
  expression: ts.Identifier;
  name: ts.Identifier;
};
export function isDecoratorIdentifier(exp: ts.Expression): exp is DecoratorIdentifier {
  return (
    ts.isIdentifier(exp) ||
    (ts.isPropertyAccessExpression(exp) &&
      ts.isIdentifier(exp.expression) &&
      ts.isIdentifier(exp.name))
  );
}

/**
 * The `ts.Declaration` of a "class".
 *
 * Classes are represented differently in different code formats:
 * - In TS code, they are typically defined using the `class` keyword.
 * - In ES2015 code, they are usually defined using the `class` keyword, but they can also be
 *   variable declarations, which are initialized to a class expression (e.g.
 *   `let Foo = Foo1 = class Foo {}`).
 * - In ES5 code, they are typically defined as variable declarations being assigned the return
 *   value of an IIFE. The actual "class" is implemented as a constructor function inside the IIFE,
 *   but the outer variable declaration represents the "class" to the rest of the program.
 *
 * For `ReflectionHost` purposes, a class declaration should always have a `name` identifier,
 * because we need to be able to reference it in other parts of the program.
 */
export type ClassDeclaration<T extends DeclarationNode = DeclarationNode> = T & {
  name: ts.Identifier;
};

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

/** Possible access levels of a class member. */
export enum ClassMemberAccessLevel {
  PublicWritable,
  PublicReadonly,
  Protected,
  Private,
  EcmaScriptPrivate,
}

/**
 * A member of a class, such as a property, method, or constructor.
 */
export interface ClassMember {
  /**
   * TypeScript reference to the class member itself, or null if it is not applicable.
   */
  node: ts.Node | null;

  /**
   * Indication of which type of member this is (property, method, etc).
   */
  kind: ClassMemberKind;

  /** Access level describing the class member modifiers. */
  accessLevel: ClassMemberAccessLevel;

  /**
   * TypeScript `ts.TypeNode` representing the type of the member, or `null` if not present or
   * applicable.
   */
  type: ts.TypeNode | null;

  /**
   * Name of the class member.
   */
  name: string;

  /**
   * TypeScript `ts.Identifier`, `ts.PrivateIdentifier`, or `ts.StringLiteral` representing the
   * name of the member, or `null` if no such node is present.
   *
   * The `nameNode` is useful in writing references to this member that will be correctly source-
   * mapped back to the original file.
   */
  nameNode: ts.Identifier | ts.PrivateIdentifier | ts.StringLiteral | null;

  /**
   * TypeScript `ts.Expression` which represents the value of the member.
   *
   * If the member is a property, this will be the property initializer if there is one, or null
   * otherwise.
   */
  value: ts.Expression | null;

  /**
   * TypeScript `ts.Declaration` which represents the implementation of the member.
   *
   * In TypeScript code this is identical to the node, but in downleveled code this should always be
   * the Declaration which actually represents the member's runtime value.
   *
   * For example, the TS code:
   *
   * ```ts
   * class Clazz {
   *   static get property(): string {
   *     return 'value';
   *   }
   * }
   * ```
   *
   * Downlevels to:
   *
   * ```ts
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
   * ```ts
   * function () {
   *   return 'value';
   * },
   * ```
   */
  implementation: ts.Declaration | null;

  /**
   * Whether the member is static or not.
   */
  isStatic: boolean;

  /**
   * Any `Decorator`s which are present on the member, or `null` if none are present.
   */
  decorators: Decorator[] | null;
}

export const enum TypeValueReferenceKind {
  LOCAL,
  IMPORTED,
  UNAVAILABLE,
}

/**
 * A type reference that refers to any type via a `ts.Expression` that's valid within the local file
 * where the type was referenced.
 */
export interface LocalTypeValueReference {
  kind: TypeValueReferenceKind.LOCAL;

  /**
   * The synthesized expression to reference the type in a value position.
   */
  expression: ts.Expression;

  /**
   * If the type originates from a default import, the import statement is captured here to be able
   * to track its usages, preventing the import from being elided if it was originally only used in
   * a type-position. See `DefaultImportTracker` for details.
   */
  defaultImportStatement: ts.ImportDeclaration | null;
}

/**
 * A reference that refers to a type that was imported, and gives the symbol `name` and the
 * `moduleName` of the import. Note that this `moduleName` may be a relative path, and thus is
 * likely only valid within the context of the file which contained the original type reference.
 */
export interface ImportedTypeValueReference {
  kind: TypeValueReferenceKind.IMPORTED;

  /**
   * The module specifier from which the `importedName` symbol should be imported.
   */
  moduleName: string;

  /**
   * The name of the top-level symbol that is imported from `moduleName`. If `nestedPath` is also
   * present, a nested object is being referenced from the top-level symbol.
   */
  importedName: string;

  /**
   * If present, represents the symbol names that are referenced from the top-level import.
   * When `null` or empty, the `importedName` itself is the symbol being referenced.
   */
  nestedPath: string[] | null;

  // This field can be null in local compilation mode when resolving is not possible.
  valueDeclaration: DeclarationNode | null;
}

/**
 * A representation for a type value reference that is used when no value is available. This can
 * occur due to various reasons, which is indicated in the `reason` field.
 */
export interface UnavailableTypeValueReference {
  kind: TypeValueReferenceKind.UNAVAILABLE;

  /**
   * The reason why no value reference could be determined for a type.
   */
  reason: UnavailableValue;
}

/**
 * The various reasons why the compiler may be unable to synthesize a value from a type reference.
 */
export const enum ValueUnavailableKind {
  /**
   * No type node was available.
   */
  MISSING_TYPE,

  /**
   * The type does not have a value declaration, e.g. an interface.
   */
  NO_VALUE_DECLARATION,

  /**
   * The type is imported using a type-only imports, so it is not suitable to be used in a
   * value-position.
   */
  TYPE_ONLY_IMPORT,

  /**
   * The type reference could not be resolved to a declaration.
   */
  UNKNOWN_REFERENCE,

  /**
   * The type corresponds with a namespace.
   */
  NAMESPACE,

  /**
   * The type is not supported in the compiler, for example union types.
   */
  UNSUPPORTED,
}

export interface UnsupportedType {
  kind: ValueUnavailableKind.UNSUPPORTED;
  typeNode: ts.TypeNode;
}

export interface NoValueDeclaration {
  kind: ValueUnavailableKind.NO_VALUE_DECLARATION;
  typeNode: ts.TypeNode;
  decl: ts.Declaration | null;
}

export interface TypeOnlyImport {
  kind: ValueUnavailableKind.TYPE_ONLY_IMPORT;
  typeNode: ts.TypeNode;
  node: ts.ImportClause | ts.ImportSpecifier;
}

export interface NamespaceImport {
  kind: ValueUnavailableKind.NAMESPACE;
  typeNode: ts.TypeNode;
  importClause: ts.ImportClause;
}

export interface UnknownReference {
  kind: ValueUnavailableKind.UNKNOWN_REFERENCE;
  typeNode: ts.TypeNode;
}

export interface MissingType {
  kind: ValueUnavailableKind.MISSING_TYPE;
}

/**
 * The various reasons why a type node may not be referred to as a value.
 */
export type UnavailableValue =
  | UnsupportedType
  | NoValueDeclaration
  | TypeOnlyImport
  | NamespaceImport
  | UnknownReference
  | MissingType;

/**
 * A reference to a value that originated from a type position.
 *
 * For example, a constructor parameter could be declared as `foo: Foo`. A `TypeValueReference`
 * extracted from this would refer to the value of the class `Foo` (assuming it was actually a
 * type).
 *
 * See the individual types for additional information.
 */
export type TypeValueReference =
  | LocalTypeValueReference
  | ImportedTypeValueReference
  | UnavailableTypeValueReference;

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
  name: string | null;

  /**
   * TypeScript `ts.BindingName` representing the name of the parameter.
   *
   * The `nameNode` is useful in writing references to this member that will be correctly source-
   * mapped back to the original file.
   */
  nameNode: ts.BindingName;

  /**
   * Reference to the value of the parameter's type annotation, if it's possible to refer to the
   * parameter's type as a value.
   *
   * This can either be a reference to a local value, a reference to an imported value, or no
   * value if no is present or cannot be represented as an expression.
   */
  typeValueReference: TypeValueReference;

  /**
   * TypeScript `ts.TypeNode` representing the type node found in the type position.
   *
   * This field can be used for diagnostics reporting if `typeValueReference` is `null`.
   *
   * Can be null, if the param has no type declared.
   */
  typeNode: ts.TypeNode | null;

  /**
   * Any `Decorator`s which are present on the parameter, or `null` if none are present.
   */
  decorators: Decorator[] | null;
}

/**
 * Definition of a function or method, including its body if present and any parameters.
 *
 * In TypeScript code this metadata will be a simple reflection of the declarations in the node
 * itself. In ES5 code this can be more complicated, as the default values for parameters may
 * be extracted from certain body statements.
 */
export interface FunctionDefinition {
  /**
   * A reference to the node which declares the function.
   */
  node:
    | ts.MethodDeclaration
    | ts.FunctionDeclaration
    | ts.FunctionExpression
    | ts.VariableDeclaration
    | ts.ArrowFunction;

  /**
   * Statements of the function body, if a body is present, or null if no body is present or the
   * function is identified to represent a tslib helper function, in which case `helper` will
   * indicate which helper this function represents.
   *
   * This list may have been filtered to exclude statements which perform parameter default value
   * initialization.
   */
  body: ts.Statement[] | null;

  /**
   * Metadata regarding the function's parameters, including possible default value expressions.
   */
  parameters: Parameter[];

  /**
   * Generic type parameters of the function.
   */
  typeParameters: ts.TypeParameterDeclaration[] | null;

  /**
   * Number of known signatures of the function.
   */
  signatureCount: number;
}

/**
 * A parameter to a function or method.
 */
export interface Parameter {
  /**
   * Name of the parameter, if available.
   */
  name: string | null;

  /**
   * Declaration which created this parameter.
   */
  node: ts.ParameterDeclaration;

  /**
   * Expression which represents the default value of the parameter, if any.
   */
  initializer: ts.Expression | null;

  /**
   * Type of the parameter.
   */
  type: ts.TypeNode | null;
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

  /**
   * TypeScript node that represents this import.
   */
  node: ts.ImportDeclaration;
}

/**
 * A type that is used to identify a declaration.
 */
export type DeclarationNode = ts.Declaration;

export type AmbientImport = {
  __brand: 'AmbientImport';
};

/** Indicates that a declaration is referenced through an ambient type. */
export const AmbientImport = {} as AmbientImport;

/**
 * The declaration of a symbol, along with information about how it was imported into the
 * application.
 */
export interface Declaration<T extends ts.Declaration = ts.Declaration> {
  /**
   * The absolute module path from which the symbol was imported into the application, if the symbol
   * was imported via an absolute module (even through a chain of re-exports). If the symbol is part
   * of the application and was not imported from an absolute path, this will be `null`.
   */
  viaModule: string | AmbientImport | null;

  /**
   * TypeScript reference to the declaration itself, if one exists.
   */
  node: T;
}

/**
 * Abstracts reflection operations on a TypeScript AST.
 *
 * Depending on the format of the code being interpreted, different concepts are represented
 * with different syntactical structures. The `ReflectionHost` abstracts over those differences and
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
   * `null` if either no decorators were present or if the declaration is not of a decoratable type.
   */
  getDecoratorsOfDeclaration(declaration: DeclarationNode): Decorator[] | null;

  /**
   * Examine a declaration which should be of a class, and return metadata about the members of the
   * class.
   *
   * @param clazz a `ClassDeclaration` representing the class over which to reflect.
   *
   * @returns an array of `ClassMember` metadata representing the members of the class.
   *
   * @throws if `declaration` does not resolve to a class declaration.
   */
  getMembersOfClass(clazz: ClassDeclaration): ClassMember[];

  /**
   * Reflect over the constructor of a class and return metadata about its parameters.
   *
   * This method only looks at the constructor of a class directly and not at any inherited
   * constructors.
   *
   * @param clazz a `ClassDeclaration` representing the class over which to reflect.
   *
   * @returns an array of `Parameter` metadata representing the parameters of the constructor, if
   * a constructor exists. If the constructor exists and has 0 parameters, this array will be empty.
   * If the class has no constructor, this method returns `null`.
   */
  getConstructorParameters(clazz: ClassDeclaration): CtorParameter[] | null;

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
  getDefinitionOfFunction(fn: ts.Node): FunctionDefinition | null;

  /**
   * Determine if an identifier was imported from another module and return `Import` metadata
   * describing its origin.
   *
   * @param id a TypeScript `ts.Identifier` to reflect.
   *
   * @returns metadata about the `Import` if the identifier was imported from another module, or
   * `null` if the identifier doesn't resolve to an import but instead is locally defined.
   */
  getImportOfIdentifier(id: ts.Identifier): Import | null;

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
   * ```ts
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
  getDeclarationOfIdentifier(id: ts.Identifier): Declaration | null;

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
  getExportsOfModule(module: ts.Node): Map<string, Declaration> | null;

  /**
   * Check whether the given node actually represents a class.
   */
  isClass(node: ts.Node): node is ClassDeclaration;

  /**
   * Determines whether the given declaration, which should be a class, has a base class.
   *
   * @param clazz a `ClassDeclaration` representing the class over which to reflect.
   */
  hasBaseClass(clazz: ClassDeclaration): boolean;

  /**
   * Get an expression representing the base class (if any) of the given `clazz`.
   *
   * This expression is most commonly an Identifier, but is possible to inherit from a more dynamic
   * expression.
   *
   * @param clazz the class whose base we want to get.
   */
  getBaseClassExpression(clazz: ClassDeclaration): ts.Expression | null;

  /**
   * Get the number of generic type parameters of a given class.
   *
   * @param clazz a `ClassDeclaration` representing the class over which to reflect.
   *
   * @returns the number of type parameters of the class, if known, or `null` if the declaration
   * is not a class or has an unknown number of type parameters.
   */
  getGenericArityOfClass(clazz: ClassDeclaration): number | null;

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
  getVariableValue(declaration: ts.VariableDeclaration): ts.Expression | null;

  /**
   * Returns `true` if a declaration is exported from the module in which it's defined.
   *
   * Not all mechanisms by which a declaration is exported can be statically detected, especially
   * when processing already compiled JavaScript. A `false` result does not indicate that the
   * declaration is never visible outside its module, only that it was not exported via one of the
   * export mechanisms that the `ReflectionHost` is capable of statically checking.
   */
  isStaticallyExported(decl: ts.Node): boolean;
}
