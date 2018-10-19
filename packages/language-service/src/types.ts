/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompileMetadataResolver, CompilePipeSummary, NgAnalyzedModules, StaticSymbol} from '@angular/compiler';
import {BuiltinType, DeclarationKind, Definition, PipeInfo, Pipes, Signature, Span, Symbol, SymbolDeclaration, SymbolQuery, SymbolTable} from '@angular/compiler-cli/src/language_services';

export {
  BuiltinType,
  DeclarationKind,
  Definition,
  PipeInfo,
  Pipes,
  Signature,
  Span,
  Symbol,
  SymbolDeclaration,
  SymbolQuery,
  SymbolTable
};

/**
 * The information `LanguageService` needs from the `LanguageServiceHost` to describe the content of
 * a template and the language context the template is in.
 *
 * A host interface; see `LanguageSeriviceHost`.
 *
 * @publicApi
 */
export interface TemplateSource {
  /**
   * The source of the template.
   */
  readonly source: string;

  /**
   * The version of the source. As files are modified the version should change. That is, if the
   * `LanguageService` requesting template information for a source file and that file has changed
   * since the last time the host was asked for the file then this version string should be
   * different. No assumptions are made about the format of this string.
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
 * @publicApi
 */
export type TemplateSources = TemplateSource[] | undefined;


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
 * templateUrl references. However, the compoennt declaration might contain errors that
 * need to be reported such as the template string is missing or the component is not
 * declared in a module. These error should be reported on the declaration, not the
 * template.
 *
 * A host type; see `LanguageSeriviceHost`.
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
 * @publicApi
 */
export type Declarations = Declaration[];

/**
 * The host for a `LanguageService`. This provides all the `LanguageService` requires to respond
 * to
 * the `LanguageService` requests.
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
   * The resolver to use to find compiler metadata.
   */
  readonly resolver: CompileMetadataResolver;

  /**
   * Returns the template information for templates in `fileName` at the given location. If
   * `fileName` refers to a template file then the `position` should be ignored. If the `position`
   * is not in a template literal string then this method should return `undefined`.
   */
  getTemplateAt(fileName: string, position: number): TemplateSource|undefined;

  /**
   * Return the template source information for all templates in `fileName` or for `fileName` if
   * it
   * is a template file.
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
 * An item of the completion result to be displayed by an editor.
 *
 * A `LanguageService` interface.
 *
 * @publicApi
 */
export interface Completion {
  /**
   * The kind of comletion.
   */
  kind: DeclarationKind;

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
 * @publicApi
 */
export type Completions = Completion[] | undefined;

/**
 * A file and span.
 */
export interface Location {
  fileName: string;
  span: Span;
}

/**
 * The kind of diagnostic message.
 *
 * @publicApi
 */
export enum DiagnosticKind {
  Error,
  Warning,
}

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
  next?: DiagnosticMessageChain;
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
  kind: DiagnosticKind;

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
 * A sequence of diagnostic message.
 *
 * @publicApi
 */
export type Diagnostics = Diagnostic[];

/**
 * A section of hover text. If the text is code then language should be provided.
 * Otherwise the text is assumed to be Markdown text that will be sanitized.
 */
export interface HoverTextSection {
  /**
   * Source code or markdown text describing the symbol a the hover location.
   */
  readonly text: string;

  /**
   * The language of the source if `text` is a source code fragment.
   */
  readonly language?: string;
}

/**
 * Hover information for a symbol at the hover location.
 */
export interface Hover {
  /**
   * The hover text to display for the symbol at the hover location. If the text includes
   * source code, the section will specify which language it should be interpreted as.
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
 * as defined by the `LanguageServiceHost`.
 *
 * When a method expects a `fileName` this file can either be source file in the project that
 * contains a template in a string literal or a template file referenced by the project returned
 * by `getTemplateReference()`. All other files will cause the method to return `undefined`.
 *
 * If a method takes a `position`, it is the offset of the UTF-16 code-point relative to the
 * beginning of the file reference by `fileName`.
 *
 * This interface and all interfaces and types marked as `LanguageService` types, describe  a
 * particlar implementation of the Angular language service and is not intented to be
 * implemented. Adding members to the interface will not be considered a breaking change as
 * defined by SemVer.
 *
 * Removing a member or making a member optional, changing a method parameters, or changing a
 * member's type will all be considered a breaking change.
 *
 * While an interface is marked as experimental breaking-changes will be allowed between minor
 * releases. After an interface is marked as stable breaking-changes will only be allowed between
 * major releases. No breaking changes are allowed between patch releases.
 *
 * @publicApi
 */
export interface LanguageService {
  /**
   * Returns a list of all the external templates referenced by the project.
   */
  getTemplateReferences(): string[]|undefined;

  /**
   * Returns a list of all error for all templates in the given file.
   */
  getDiagnostics(fileName: string): Diagnostics|undefined;

  /**
   * Return the completions at the given position.
   */
  getCompletionsAt(fileName: string, position: number): Completions|undefined;

  /**
   * Return the definition location for the symbol at position.
   */
  getDefinitionAt(fileName: string, position: number): Definition|undefined;

  /**
   * Return the hover information for the symbol at position.
   */
  getHoverAt(fileName: string, position: number): Hover|undefined;

  /**
   * Return the pipes that are available at the given position.
   */
  getPipesAt(fileName: string, position: number): CompilePipeSummary[];
}
