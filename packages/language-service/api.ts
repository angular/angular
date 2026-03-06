/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of the language service package.
 */

import type ts from 'typescript';

export interface PluginConfig {
  /**
   * If true, return only Angular results. Otherwise, return Angular + TypeScript
   * results.
   */
  angularOnly: boolean;
  /**
   * If true, enable `strictTemplates` in Angular compiler options regardless
   * of its value in tsconfig.json.
   */
  forceStrictTemplates?: true;

  /**
   * If false, disables parsing control flow blocks in the compiler. Should be used only when older
   * versions of Angular that do not support blocks (pre-v17) used with the language service.
   */
  enableBlockSyntax?: false;

  /**
   * Version of `@angular/core` that was detected in the user's workspace.
   */
  angularCoreVersion?: string;

  /**
   * If false, disables parsing of `@let` declarations in the compiler.
   */
  enableLetSyntax?: false;

  /**
   * Whether selectorless is enabled.
   */
  enableSelectorless?: true;

  /**
   * A list of diagnostic codes that should be supressed in the language service.
   */
  suppressAngularDiagnosticCodes?: number[];
}

export type GetTcbResponse = {
  /**
   * The filename of the SourceFile this typecheck block belongs to.
   * The filename is entirely opaque and unstable, useful only for debugging
   * purposes.
   */
  fileName: string;
  /** The content of the SourceFile this typecheck block belongs to. */
  content: string;
  /**
   * Spans over node(s) in the typecheck block corresponding to the
   * TS code generated for template node under the current cursor position.
   *
   * When the cursor position is over a source for which there is no generated
   * code, `selections` is empty.
   */
  selections: ts.TextSpan[];
};

export type GetComponentLocationsForTemplateResponse = ts.DocumentSpan[];
export type GetTemplateLocationForComponentResponse = ts.DocumentSpan | undefined;

/**
 * Function that can be invoked to show progress when computing
 * refactoring edits.
 *
 * Useful for refactorings which take a long time to compute edits for.
 */
export type ApplyRefactoringProgressFn = (percentage: number, updateMessage: string) => void;

/** Interface describing the result for computing edits of a refactoring. */
export interface ApplyRefactoringResult extends Omit<ts.RefactorEditInfo, 'notApplicableReason'> {
  errorMessage?: string;
  warningMessage?: string;
}

/**
 * Angular-specific LSP SymbolKind values for template symbols.
 * These are used for symbols that don't have a direct TypeScript ScriptElementKind mapping.
 * Values match LSP SymbolKind enum: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#symbolKind
 */
export enum AngularSymbolKind {
  Namespace = 3,
  Array = 18,
  Object = 19,
  Struct = 23,
  Event = 24,
}

/**
 * A document symbol representing an Angular template element.
 * This uses TypeScript's NavigationTree structure so it can be merged with TS symbols.
 */
export interface TemplateDocumentSymbol {
  /** Display name for the symbol */
  text: string;
  /** Kind of symbol (using TypeScript's ScriptElementKind for compatibility) */
  kind: ts.ScriptElementKind;
  /**
   * Optional LSP SymbolKind override for Angular-specific symbol types.
   * When set, this takes precedence over the default ScriptElementKind mapping.
   */
  lspKind?: AngularSymbolKind;
  /** Span covering the entire symbol */
  spans: ts.TextSpan[];
  /** Span for just the name (used for selection) */
  nameSpan?: ts.TextSpan;
  /** Child symbols */
  childItems?: TemplateDocumentSymbol[];
  /**
   * The name of the class this template belongs to.
   * Only set for root-level symbols in TypeScript files with inline templates.
   * Used to merge template symbols into the correct component class when
   * multiple components exist in the same file.
   */
  className?: string;
}

/**
 * Options for customizing document symbols behavior.
 */
export interface DocumentSymbolsOptions {
  /**
   * Show all implicit @for loop variables ($index, $count, $first, $last, $even, $odd).
   * When false (default), only explicitly aliased variables like `let i = $index` are shown.
   */
  showImplicitForVariables?: boolean;
}

/**
 * Result for linked editing ranges containing the ranges and optional word pattern.
 */
export interface LinkedEditingRanges {
  /** The ranges that should be edited together. */
  ranges: ts.TextSpan[];
  /** An optional word pattern to describe valid tag names. */
  wordPattern?: string;
}

/**
 * `NgLanguageService` describes an instance of an Angular language service,
 * whose API surface is a strict superset of TypeScript's language service.
 */
export interface NgLanguageService extends ts.LanguageService {
  /**
   * Triggers the Angular compiler's analysis pipeline without performing
   * per-file type checking. This is a lighter alternative to calling
   * `getSemanticDiagnostics()` when the goal is only to ensure that the
   * Angular project has been analyzed (e.g. during project initialization).
   */
  ensureProjectAnalyzed(): void;

  getTcb(fileName: string, position: number): GetTcbResponse | undefined;

  /**
   * Gets linked editing ranges for synchronized editing of HTML tag pairs.
   *
   * When the cursor is on an element tag name, returns both the opening and closing
   * tag name spans so they can be edited simultaneously. This overrides TypeScript's
   * built-in method which only works for JSX/TSX.
   *
   * @param fileName The file to check
   * @param position The cursor position in the file
   * @returns LinkedEditingRanges if on a tag name, undefined otherwise
   */
  getLinkedEditingRangeAtPosition(
    fileName: string,
    position: number,
  ): LinkedEditingRanges | undefined;
  getComponentLocationsForTemplate(fileName: string): GetComponentLocationsForTemplateResponse;
  getTemplateLocationForComponent(
    fileName: string,
    position: number,
  ): GetTemplateLocationForComponentResponse;
  getTypescriptLanguageService(): ts.LanguageService;

  /**
   * Gets document symbols for Angular templates, including control flow blocks,
   * elements, components, template references, and @let declarations.
   * Returns symbols in NavigationTree format for compatibility with TypeScript.
   *
   * @param fileName The file path to get template symbols for
   * @param options Optional configuration for document symbols behavior
   */
  getTemplateDocumentSymbols(
    fileName: string,
    options?: DocumentSymbolsOptions,
  ): TemplateDocumentSymbol[];

  applyRefactoring(
    fileName: string,
    positionOrRange: number | ts.TextRange,
    refactorName: string,
    reportProgress: ApplyRefactoringProgressFn,
  ): Promise<ApplyRefactoringResult | undefined>;

  hasCodeFixesForErrorCode(errorCode: number): boolean;

  getTokenTypeFromClassification(classification: number): number | undefined;
  getTokenModifierFromClassification(classification: number): number;
}

export function isNgLanguageService(
  ls: ts.LanguageService | NgLanguageService,
): ls is NgLanguageService {
  return 'getTcb' in ls;
}
