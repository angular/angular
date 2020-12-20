/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '@angular/compiler';
import * as ts from 'typescript';


/**
 * The range of a span of text in a source file.
 *
 * @publicApi
 */
export interface Span {
  /**
   * The first code-point of the span as an offset relative to the beginning of the source assuming
   * a UTF-16 encoding.
   */
  start: number;

  /**
   * The first code-point after the span as an offset relative to the beginning of the source
   * assuming a UTF-16 encoding.
   */
  end: number;
}

/**
 * A file and span.
 */
export interface Location {
  fileName: string;
  span: Span;
}

/**
 * A defnition location(s).
 */
export type Definition = Location[]|undefined;

/**
 * A symbol describing a language element that can be referenced by expressions
 * in an Angular template.
 *
 * @publicApi
 */
export interface Symbol {
  /**
   * The name of the symbol as it would be referenced in an Angular expression.
   */
  readonly name: string;

  /**
   * The kind of completion this symbol should generate if included.
   */
  readonly kind: string;

  /**
   * The language of the source that defines the symbol. (e.g. typescript for TypeScript,
   * ng-template for an Angular template, etc.)
   */
  readonly language: string;

  /**
   * A symbol representing type of the symbol.
   */
  readonly type: Symbol|undefined;

  /**
   * A symbol for the container of this symbol. For example, if this is a method, the container
   * is the class or interface of the method. If no container is appropriate, undefined is
   * returned.
   */
  readonly container: Symbol|undefined;

  /**
   * The symbol is public in the container.
   */
  readonly public: boolean;

  /**
   * `true` if the symbol can be the target of a call.
   */
  readonly callable: boolean;

  /**
   * The location of the definition of the symbol
   */
  readonly definition: Definition|undefined;

  /**
   * `true` if the symbol is a type that is nullable (can be null or undefined).
   */
  readonly nullable: boolean;

  /**
   * Documentation comment on the Symbol, if any.
   */
  readonly documentation: ts.SymbolDisplayPart[];

  /**
   * A table of the members of the symbol; that is, the members that can appear
   * after a `.` in an Angular expression.
   */
  members(): SymbolTable;

  /**
   * The list of overloaded signatures that can be used if the symbol is the
   * target of a call.
   */
  signatures(): Signature[];

  /**
   * Return which signature of returned by `signatures()` would be used selected
   * given the `types` supplied. If no signature would match, this method should
   * return `undefined`.
   */
  selectSignature(types: Symbol[]): Signature|undefined;

  /**
   * Return the type of the expression if this symbol is indexed by `argument`.
   * Sometimes we need the key of arguments to get the type of the expression, for example
   * in the case of tuples (`type Example = [string, number]`).
   * [string, number]).
   * If the symbol cannot be indexed, this method should return `undefined`.
   */
  indexed(argument: Symbol, key?: any): Symbol|undefined;

  /**
   * Returns the type arguments of a Symbol, if any.
   */
  typeArguments(): Symbol[]|undefined;
}

/**
 * A table of `Symbol`s accessible by name.
 *
 * @publicApi
 */
export interface SymbolTable {
  /**
   * The number of symbols in the table.
   */
  readonly size: number;

  /**
   * Get the symbol corresponding to `key` or `undefined` if there is no symbol in the
   * table by the name `key`.
   */
  get(key: string): Symbol|undefined;

  /**
   * Returns `true` if the table contains a `Symbol` with the name `key`.
   */
  has(key: string): boolean;

  /**
   * Returns all the `Symbol`s in the table. The order should be, but is not required to be,
   * in declaration order.
   */
  values(): Symbol[];
}

/**
 * A description of a function or method signature.
 *
 * @publicApi
 */
export interface Signature {
  /**
   * The arguments of the signture. The order of `arguments.symbols()` must be in the order
   * of argument declaration.
   */
  readonly arguments: SymbolTable;

  /**
   * The symbol of the signature result type.
   */
  readonly result: Symbol;
}

/**
 * An enumeration of basic types.
 *
 * @publicApi
 */
export enum BuiltinType {
  /**
   * The type is a type that can hold any other type.
   */
  Any = -1,  // equivalent to b11..11 = String | Union | ...

  /** Unknown types are functionally identical to any. */
  Unknown = -1,

  /**
   * The type of a string literal.
   */
  String = 1 << 0,

  /**
   * The type of a numeric literal.
   */
  Number = 1 << 1,

  /**
   * The type of the `true` and `false` literals.
   */
  Boolean = 1 << 2,

  /**
   * The type of the `undefined` literal.
   */
  Undefined = 1 << 3,

  /**
   * the type of the `null` literal.
   */
  Null = 1 << 4,

  /**
   * the type is an unbound type parameter.
   */
  Unbound = 1 << 5,

  /**
   * Not a built-in type.
   */
  Other = 1 << 6,

  Object = 1 << 7,
}

/**
 * The kinds of definition.
 *
 * @publicApi
 */
export type DeclarationKind = 'attribute'|'html attribute'|'component'|'element'|'entity'|'key'|
    'method'|'pipe'|'property'|'type'|'reference'|'variable';

/**
 * Describes a symbol to type binding used to build a symbol table.
 *
 * @publicApi
 */
export interface SymbolDeclaration {
  /**
   * The name of the symbol in table.
   */
  readonly name: string;

  /**
   * The kind of symbol to declare.
   */
  readonly kind: DeclarationKind;

  /**
   * Type of the symbol. The type symbol should refer to a symbol for a type.
   */
  readonly type: Symbol;

  /**
   * The definion of the symbol if one exists.
   */
  readonly definition?: Definition;
}

/**
 * Information about the pipes that are available for use in a template.
 *
 * @publicApi
 */
export interface PipeInfo {
  /**
   * The name of the pipe.
   */
  name: string;

  /**
   * The static symbol for the pipe's constructor.
   */
  symbol: StaticSymbol;
}

/**
 * A sequence of pipe information.
 *
 * @publicApi
 */
export type Pipes = PipeInfo[]|undefined;

/**
 * Describes the language context in which an Angular expression is evaluated.
 *
 * @publicApi
 */
export interface SymbolQuery {
  /**
   * Return the built-in type this symbol represents or Other if it is not a built-in type.
   */
  getTypeKind(symbol: Symbol): BuiltinType;

  /**
   * Return a symbol representing the given built-in type.
   */
  getBuiltinType(kind: BuiltinType): Symbol;

  /**
   * Return the symbol for a type that represents the union of all the types given. Any value
   * of one of the types given should be assignable to the returned type. If no one type can
   * be constructed then this should be the Any type.
   */
  getTypeUnion(...types: Symbol[]): Symbol;

  /**
   * Return a symbol for an array type that has the `type` as its element type.
   */
  getArrayType(type: Symbol): Symbol;

  /**
   * Return element type symbol for an array type if the `type` is an array type. Otherwise return
   * undefined.
   */
  getElementType(type: Symbol): Symbol|undefined;

  /**
   * Return a type that is the non-nullable version of the given type. If `type` is already
   * non-nullable, return `type`.
   */
  getNonNullableType(type: Symbol): Symbol;

  /**
   * Return a symbol table for the pipes that are in scope.
   */
  getPipes(): SymbolTable;

  /**
   * Return the type symbol for the given static symbol.
   */
  getTypeSymbol(type: StaticSymbol): Symbol|undefined;

  /**
   * Return the members that are in the context of a type's template reference.
   */
  getTemplateContext(type: StaticSymbol): SymbolTable|undefined;

  /**
   * Produce a symbol table with the given symbols. Used to produce a symbol table
   * for use with mergeSymbolTables().
   */
  createSymbolTable(symbols: SymbolDeclaration[]): SymbolTable;

  /**
   * Produce a merged symbol table. If the symbol tables contain duplicate entries
   * the entries of the latter symbol tables will obscure the entries in the prior
   * symbol tables.
   *
   * The symbol tables passed to this routine MUST be produces by the same instance
   * of SymbolQuery that is being called.
   */
  mergeSymbolTable(symbolTables: SymbolTable[]): SymbolTable;

  /**
   * Return the span of the narrowest non-token node at the given location.
   */
  getSpanAt(line: number, column: number): Span|undefined;
}
