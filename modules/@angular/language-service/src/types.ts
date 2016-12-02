/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, StaticSymbol} from '@angular/compiler';
import {NgAnalyzedModules} from '@angular/compiler/src/aot/compiler';
import {CompileMetadataResolver} from '@angular/compiler/src/metadata_resolver';


/**
 * The range of a span of text in a source file.
 *
 * @experimental
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
 * The information `LanguageService` needs from the `LanguageServiceHost` to describe the content of
 * a template and the
 * langauge context the template is in.
 *
 * A host interface; see `LanguageSeriviceHost`.
 *
 * @experimental
 */
export interface TemplateSource {
  /**
   * The source of the template.
   */
  readonly source: string;

  /**
   * The version of the source. As files are modified the version should change. That is, if the
   * `LanguageSerivce` requesting
   * template infomration for a source file and that file has changed since the last time the host
   * was asked for the file then
   * this version string should be different. No assumptions are made about the format of this
   * string.
   *
   * The version can change more often than the source but should not change less often.
   */
  readonly version: string;

  /**
   * The span of the template within the source file.
   */
  readonly span: Span;

  /**
   * A static symbol for the template's component.
   */
  readonly type: StaticSymbol;

  /**
   * The `SymbolTable` for the members of the component.
   */
  readonly members: SymbolTable;

  /**
   * A `SymbolQuery` for the context of the template.
   */
  readonly query: SymbolQuery;
}

/**
 * A sequence of template sources.
 *
 * A host type; see `LanguageSeriviceHost`.
 *
 * @experimental
 */
export type TemplateSources = TemplateSource[] /* | undefined */;

/**
 * Error information found getting declaration information
 *
 * A host type; see `LanagueServiceHost`.
 *
 * @experimental
 */
export interface DeclarationError {
  /**
   * The span of the error in the declaration's module.
   */
  readonly span: Span;

  /**
   * The message to display describing the error.
   */
  readonly message: string;
}

/**
 * Information about the component declarations.
 *
 * A file might contain a declaration without a template because the file contains only
 * templateUrl references. However, the compoennt declaration might contain errors that
 * need to be reported such as the template string is missing or the component is not
 * declared in a module. These error should be reported on the declaration, not the
 * template.
 *
 * A host type; see `LanguageSeriviceHost`.
 *
 * @experimental
 */
export interface Declaration {
  /**
   * The static symbol of the compponent being declared.
   */
  readonly type: StaticSymbol;

  /**
   * The span of the declaration annotation reference (e.g. the 'Component' or 'Directive'
   * reference).
   */
  readonly declarationSpan: Span;

  /**
   * Reference to the compiler directive metadata for the declaration.
   */
  readonly metadata?: CompileDirectiveMetadata;

  /**
   * Error reported trying to get the metadata.
   */
  readonly errors: DeclarationError[];
}

/**
 * A sequence of declarations.
 *
 * A host type; see `LanguageSeriviceHost`.
 *
 * @experimental
 */
export type Declarations = Declaration[];

/**
 * An enumeration of basic types.
 *
 * A `LanguageServiceHost` interface.
 *
 * @experimental
 */
export enum BuiltinType {
  /**
   * The type is a type that can hold any other type.
   */
  Any,

  /**
   * The type of a string literal.
   */
  String,

  /**
   * The type of a numeric literal.
   */
  Number,

  /**
   * The type of the `true` and `false` literals.
   */
  Boolean,

  /**
   * The type of the `undefined` literal.
   */
  Undefined,

  /**
   * the type of the `null` literal.
   */
  Null,

  /**
   * Not a built-in type.
   */
  Other
}

/**
 * A symbol describing a language element that can be referenced by expressions
 * in an Angular template.
 *
 * A `LanguageServiceHost` interface.
 *
 * @experimental
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
  readonly type: Symbol /* | undefined */;


  /**
   * A symbol for the container of this symbol. For example, if this is a method, the container
   * is the class or interface of the method. If no container is appropriate, undefined is
   * returned.
   */
  readonly container: Symbol /* | undefined */;

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
  readonly definition: Definition;
  /**

   * A table of the members of the symbol; that is, the members that can appear
   * after a `.` in an Angular expression.
   *
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
  selectSignature(types: Symbol[]): Signature /* | undefined */;

  /**
   * Return the type of the expression if this symbol is indexed by `argument`.
   * If the symbol cannot be indexed, this method should return `undefined`.
   */
  indexed(argument: Symbol): Symbol /* | undefined */;
}

/**
 * A table of `Symbol`s accessible by name.
 *
 * A `LanguageServiceHost` interface.
 *
 * @experimental
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
  get(key: string): Symbol /* | undefined */;

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
 * A `LanguageServiceHost` interface.
 *
 * @experimental
 */
export interface Signature {
  /**
   * The arguments of the signture. The order of `argumetnts.symbols()` must be in the order
   * of argument declaration.
   */
  readonly arguments: SymbolTable;

  /**
   * The symbol of the signature result type.
   */
  readonly result: Symbol;
}

/**
 * Describes the language context in which an Angular expression is evaluated.
 *
 * A `LanguageServiceHost` interface.
 *
 * @experimental
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
  getElementType(type: Symbol): Symbol /* | undefined */;

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
  getTypeSymbol(type: StaticSymbol): Symbol;

  /**
   * Return the members that are in the context of a type's template reference.
   */
  getTemplateContext(type: StaticSymbol): SymbolTable;

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
  getSpanAt(line: number, column: number): Span /* | undefined */;
}

/**
 * The host for a `LanguageService`. This provides all the `LanguageSerivce` requires to respond to
 * the `LanguageService` requests.
 *
 * This interface describes the requirements of the `LanguageService` on its host.
 *
 * The host interface is host language agnostic.
 *
 * Adding optional member to this interface or any interface that is described as a
 * `LanguageSerivceHost`
 * interface is not considered a breaking change as defined by SemVer. Removing a method or changing
 * a
 * member from required to optional will also not be considered a breaking change.
 *
 * If a member is deprecated it will be changed to optional in a minor release before it is removed
 * in
 * a major release.
 *
 * Adding a required member or changing a method's parameters, is considered a breaking change and
 * will
 * only be done when breaking changes are allowed. When possible, a new optional member will be
 * added and
 * the old member will be deprecated. The new member will then be made required in and the old
 * member will
 * be removed only when breaking chnages are allowed.
 *
 * While an interface is marked as experimental breaking-changes will be allowed between minor
 * releases.
 * After an interface is marked as stable breaking-changes will only be allowed between major
 * releases.
 * No breaking changes are allowed between patch releases.
 *
 * @experimental
 */
export interface LanguageServiceHost {
  /**
   * The resolver to use to find compiler metadata.
   */
  readonly resolver: CompileMetadataResolver;

  /**
   * Returns the template information for templates in `fileName` at the given location. If
   * `fileName`
   * refers to a template file then the `position` should be ignored. If the `position` is not in a
   * template literal string then this method should return `undefined`.
   */
  getTemplateAt(fileName: string, position: number): TemplateSource /* |undefined */;

  /**
   * Return the template source information for all templates in `fileName` or for `fileName` if it
   * is
   * a template file.
   */
  getTemplates(fileName: string): TemplateSources;

  /**
   * Returns the Angular declarations in the given file.
   */
  getDeclarations(fileName: string): Declarations;

  /**
   * Return a summary of all Angular modules in the project.
   */
  getAnalyzedModules(): NgAnalyzedModules;

  /**
   * Return a list all the template files referenced by the project.
   */
  getTemplateReferences(): string[];
}

/**
 * The kinds of completions generated by the language service.
 *
 * A 'LanguageService' interface.
 *
 * @experimental
 */
export type CompletionKind = 'attribute' | 'html attribute' | 'component' | 'element' | 'entity' |
    'key' | 'method' | 'pipe' | 'property' | 'type' | 'reference' | 'variable';

/**
 * An item of the completion result to be displayed by an editor.
 *
 * A `LanguageService` interface.
 *
 * @experimental
 */
export interface Completion {
  /**
   * The kind of comletion.
   */
  kind: CompletionKind;

  /**
   * The name of the completion to be displayed
   */
  name: string;

  /**
   * The key to use to sort the completions for display.
   */
  sort: string;
}

/**
 * A sequence of completions.
 *
 * @experimental
 */
export type Completions = Completion[] /* | undefined */;

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
export type Definition = Location[] /* | undefined */;

/**
 * The kind of diagnostic message.
 *
 * @experimental
 */
export enum DiagnosticKind {
  Error,
  Warning,
}

/**
 * An template diagnostic message to display.
 *
 * @experimental
 */
export interface Diagnostic {
  /**
   * The kind of diagnostic message
   */
  kind: DiagnosticKind;

  /**
   * The source span that should be highlighted.
   */
  span: Span;

  /**
   * The text of the diagnostic message to display.
   */
  message: string;
}

/**
 * A sequence of diagnostic message.
 *
 * @experimental
 */
export type Diagnostics = Diagnostic[];

/**
 * Information about the pipes that are available for use in a template.
 *
 * A `LanguageService` interface.
 *
 * @experimental
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
 * @experimental
 */
export type Pipes = PipeInfo[] /* | undefined */;

/**
 * Describes a symbol to type binding used to build a symbol table.
 *
 * A `LanguageServiceHost` interface.
 *
 * @experimental
 */

export interface SymbolDeclaration {
  /**
   * The name of the symbol in table.
   */
  readonly name: string;

  /**
   * The kind of symbol to declare.
   */
  readonly kind: CompletionKind;

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
 * A section of hover text. If the text is code then langauge should be provided.
 * Otherwise the text is assumed to be Markdown text that will be sanitized.
 */
export interface HoverTextSection {
  /**
   * Source code or markdown text describing the symbol a the hover location.
   */
  readonly text: string;

  /**
   * The langauge of the source if `text` is a souce code fragment.
   */
  readonly language?: string;
}

/**
 * Hover infomration for a symbol at the hover location.
 */
export interface Hover {
  /**
   * The hover text to display for the symbol at the hover location. If the text includes
   * source code, the section will specify which langauge it should be interpreted as.
   */
  readonly text: HoverTextSection[];

  /**
   * The span of source the hover covers.
   */
  readonly span: Span;
}

/**
 * An instance of an Angular language service created by `createLanguageService()`.
 *
 * The language service returns information about Angular templates that are included in a project
 * as
 * defined by the `LanguageServiceHost`.
 *
 * When a method expects a `fileName` this file can either be source file in the project that
 * contains
 * a template in a string literal or a template file referenced by the project returned by
 * `getTemplateReference()`. All other files will cause the method to return `undefined`.
 *
 * If a method takes a `position`, it is the offset of the UTF-16 code-point relative to the
 * beginning
 * of the file reference by `fileName`.
 *
 * This interface and all interfaces and types marked as `LanguageSerivce` types, describe  a
 * particlar
 * implementation of the Angular language service and is not intented to be implemented. Adding
 * members
 * to the interface will not be considered a breaking change as defined by SemVer.
 *
 * Removing a member or making a member optional, changing a method parameters, or changing a
 * member's
 * type will all be considered a breaking change.
 *
 * While an interface is marked as experimental breaking-changes will be allowed between minor
 * releases.
 * After an interface is marked as stable breaking-changes will only be allowed between major
 * releases.
 * No breaking changes are allowed between patch releases.
 *
 * @experimental
 */
export interface LanguageService {
  /**
   * Returns a list of all the external templates referenced by the project.
   */
  getTemplateReferences(): string[] /* | undefined */;

  /**
   * Returns a list of all error for all templates in the given file.
   */
  getDiagnostics(fileName: string): Diagnostics /* | undefined */;

  /**
   * Return the completions at the given position.
   */
  getCompletionsAt(fileName: string, position: number): Completions /* | undefined */;

  /**
   * Return the definition location for the symbol at position.
   */
  getDefinitionAt(fileName: string, position: number): Definition /* | undefined */;

  /**
   * Return the hover information for the symbol at position.
   */
  getHoverAt(fileName: string, position: number): Hover /* | undefined */;

  /**
   * Return the pipes that are available at the given position.
   */
  getPipesAt(fileName: string, position: number): Pipes /* | undefined */;
}
