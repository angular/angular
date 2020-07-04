/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompileDirectiveSummary, CompilePipeSummary, CssSelector, NgAnalyzedModules, Node as HtmlAst, ParseError, Parser, StaticSymbol, TemplateAst} from '@angular/compiler';
import * as ts from 'typescript';

import {Span, Symbol, SymbolQuery, SymbolTable} from './symbols';

export {StaticSymbol} from '@angular/compiler';
export {BuiltinType, Definition, PipeInfo, Pipes, Signature, Span, Symbol, SymbolDeclaration, SymbolQuery, SymbolTable} from './symbols';

/**
 * The information `LanguageService` needs from the `LanguageServiceHost` to describe the content of
 * a template and the language context the template is in.
 *
 * A host interface; see `LanguageServiceHost`.
 *
 * @publicApi
 */
export interface TemplateSource {
  /**
   * The source of the template.
   */
  readonly source: string;

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

  /**
   * Name of the file that contains the template. Could be `.html` or `.ts`.
   */
  readonly fileName: string;
}

/**
 * Error information found getting declaration information
 *
 * A host type; see `LanguageServiceHost`.
 *
 * @publicApi
 */
export interface DeclarationError {
  /**
   * The span of the error in the declaration's module.
   */
  readonly span: Span;

  /**
   * The message to display describing the error or a chain
   * of messages.
   */
  readonly message: string|DiagnosticMessageChain;
}

/**
 * Information about the component declarations.
 *
 * A file might contain a declaration without a template because the file contains only
 * templateUrl references. However, the component declaration might contain errors that
 * need to be reported such as the template string is missing or the component is not
 * declared in a module. These error should be reported on the declaration, not the
 * template.
 *
 * A host type; see `LanguageServiceHost`.
 *
 * @publicApi
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
  readonly metadata: CompileDirectiveMetadata;

  /**
   * Error reported trying to get the metadata.
   */
  readonly errors: DeclarationError[];
}

/**
 * The host for a `LanguageService`. This provides all the `LanguageService` requires to respond
 * to the `LanguageService` requests.
 *
 * This interface describes the requirements of the `LanguageService` on its host.
 *
 * The host interface is host language agnostic.
 *
 * Adding optional member to this interface or any interface that is described as a
 * `LanguageServiceHost` interface is not considered a breaking change as defined by SemVer.
 * Removing a method or changing a member from required to optional will also not be considered a
 * breaking change.
 *
 * If a member is deprecated it will be changed to optional in a minor release before it is
 * removed in a major release.
 *
 * Adding a required member or changing a method's parameters, is considered a breaking change and
 * will only be done when breaking changes are allowed. When possible, a new optional member will
 * be added and the old member will be deprecated. The new member will then be made required in
 * and the old member will be removed only when breaking changes are allowed.
 *
 * While an interface is marked as experimental breaking-changes will be allowed between minor
 * releases. After an interface is marked as stable breaking-changes will only be allowed between
 * major releases. No breaking changes are allowed between patch releases.
 *
 * @publicApi
 */
export interface LanguageServiceHost {
  /**
   * Return the template source information for all templates in `fileName` or for `fileName` if
   * it is a template file.
   */
  getTemplates(fileName: string): TemplateSource[];

  /**
   * Returns the Angular declarations in the given file.
   */
  getDeclarations(fileName: string): Declaration[];

  /**
   * Return a summary of all Angular modules in the project.
   */
  getAnalyzedModules(): NgAnalyzedModules;

  /**
   * Return the AST for both HTML and template for the contextFile.
   */
  getTemplateAst(template: TemplateSource): AstResult|undefined;

  /**
   * Return the template AST for the node that corresponds to the position.
   */
  getTemplateAstAtPosition(fileName: string, position: number): AstResult|undefined;
}

/**
 * The type of Angular directive. Used for QuickInfo in template.
 */
export enum DirectiveKind {
  COMPONENT = 'component',
  DIRECTIVE = 'directive',
  EVENT = 'event',
}

/**
 * ScriptElementKind for completion.
 */
export enum CompletionKind {
  ANGULAR_ELEMENT = 'angular element',
  ATTRIBUTE = 'attribute',
  COMPONENT = 'component',
  ELEMENT = 'element',
  ENTITY = 'entity',
  HTML_ATTRIBUTE = 'html attribute',
  HTML_ELEMENT = 'html element',
  KEY = 'key',
  METHOD = 'method',
  PIPE = 'pipe',
  PROPERTY = 'property',
  REFERENCE = 'reference',
  TYPE = 'type',
  VARIABLE = 'variable',
}

export type CompletionEntry = Omit<ts.CompletionEntry, 'kind'>&{
  kind: CompletionKind,
};

/**
 * A template diagnostics message chain. This is similar to the TypeScript
 * DiagnosticMessageChain. The messages are intended to be formatted as separate
 * sentence fragments and indented.
 *
 * For compatibility previous implementation, the values are expected to override
 * toString() to return a formatted message.
 *
 * @publicApi
 */
export interface DiagnosticMessageChain {
  /**
   * The text of the diagnostic message to display.
   */
  message: string;

  /**
   * The next message in the chain.
   */
  next?: DiagnosticMessageChain[];
}

/**
 * An template diagnostic message to display.
 *
 * @publicApi
 */
export interface Diagnostic {
  /**
   * The kind of diagnostic message
   */
  kind: ts.DiagnosticCategory;

  /**
   * The source span that should be highlighted.
   */
  span: Span;

  /**
   * The text of the diagnostic message to display or a chain of messages.
   */
  message: string|DiagnosticMessageChain;
}

/**
 * An instance of an Angular language service created by `createLanguageService()`.
 *
 * The Angular language service implements a subset of methods defined in
 * The Angular language service implements a subset of methods defined by
 * the TypeScript language service.
 *
 * @publicApi
 */
export type LanguageService = Pick<
    ts.LanguageService,
    'getCompletionsAtPosition'|'getDefinitionAndBoundSpan'|'getQuickInfoAtPosition'|
    'getSemanticDiagnostics'|'getReferencesAtPosition'>;

/** Information about an Angular template AST. */
export interface AstResult {
  htmlAst: HtmlAst[];
  templateAst: TemplateAst[];
  directive: CompileDirectiveMetadata;
  directives: CompileDirectiveSummary[];
  pipes: CompilePipeSummary[];
  parseErrors?: ParseError[];
  expressionParser: Parser;
  template: TemplateSource;
}

/** Information about a directive's selectors. */
export type SelectorInfo = {
  selectors: CssSelector[],
  map: Map<CssSelector, CompileDirectiveSummary>
};

export interface SymbolInfo {
  symbol: Symbol;
  span: ts.TextSpan;
  staticSymbol?: StaticSymbol;
}

/** TODO: this should probably be merged with AstResult */
export interface DiagnosticTemplateInfo {
  fileName?: string;
  offset: number;
  query: SymbolQuery;
  members: SymbolTable;
  htmlAst: HtmlAst[];
  templateAst: TemplateAst[];
  source: string;
}
