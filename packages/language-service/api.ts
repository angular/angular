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

  /**
   * Configuration for Angular-specific inlay hints.
   */
  inlayHints?: {
    /**
     * Show type hints for variables in @for loops.
     */
    forLoopVariableTypes?: boolean;
    /**
     * Show type hints for @if alias variables.
     */
    ifAliasTypes?: boolean;
    /**
     * Show type hints for event parameter types.
     */
    eventParameterTypes?: boolean;
    /**
     * Show type hints for pipe output types.
     */
    pipeOutputTypes?: boolean;
    /**
     * Show type hints for @let declaration types.
     */
    letDeclarationTypes?: boolean;
    /**
     * Show type hints for reference variable types.
     */
    referenceVariableTypes?: boolean;
    /**
     * Show type hints for property binding types.
     */
    propertyBindingTypes?: boolean;
    /**
     * Show type hints for DOM property binding types.
     */
    domPropertyBindingTypes?: boolean;
  };
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
 * Result for linked editing ranges containing the ranges and optional word pattern.
 */
export interface LinkedEditingRanges {
  /** The ranges that should be edited together. */
  ranges: ts.TextSpan[];
  /** An optional word pattern to describe valid tag names. */
  wordPattern?: string;
}

/**
 * Inlay hint kinds.
 */
export enum InlayHintKind {
  Type = 1,
  Parameter = 2,
}

/**
 * An inlay hint label part allows for interactive and composite labels.
 */
export interface InlayHintLabelPart {
  /**
   * The value of this label part.
   */
  value: string;

  /**
   * The tooltip text when you hover over this label part. Can be a string or a MarkupContent.
   */
  tooltip?: string | MarkupContent;

  /**
   * An optional source code location that represents this
   * label part.
   *
   * The editor will use this location for the hover and for code navigation
   * features: This part will become a clickable link that resolves to the
   * definition of the symbol at the given location (not necessarily the
   * location itself), it shows the hover that shows at the location, and it
   * shows a context menu with further code navigation commands.
   */
  location?: ts.Location;

  /**
   * An optional command for this label part.
   *
   * Depending on the kind of label part this is, the command might be used
   * for code actions or navigation.
   */
  command?: ts.Command;
}

/**
 * Markup content for tooltips.
 */
export interface MarkupContent {
  /**
   * The type of the markup.
   */
  kind: 'plaintext' | 'markdown';

  /**
   * The content itself.
   */
  value: string;
}

/**
 * Inlay hint information.
 */
export interface InlayHint {
  /**
   * The position of this hint.
   */
  position: ts.LineAndCharacter;

  /**
   * The label of this hint. A human readable string or an array of
   * InlayHintLabelPart label parts.
   *
   * *Note* that neither the string nor the label part can be empty.
   */
  label: string | InlayHintLabelPart[];

  /**
   * The kind of this hint. Can be omitted in which case the client
   * will fall back to a default.
   */
  kind?: InlayHintKind;

  /**
   * Optional text edits that are performed when accepting this inlay hint.
   *
   * *Note* that edits are expected to change the document so that the inlay
   * hint (or its nearest variant) is now part of the document and the inlay
   * hint itself is therefore part of the document.
   */
  textEdits?: ts.TextChange[];

  /**
   * The tooltip text when you hover over this item.
   */
  tooltip?: string | MarkupContent;

  /**
   * Render padding before the hint. Note: Padding should use the
   * editor's background color, not the background color of the hint
   * itself. That means padding can be used to visually align/separate
   * an inlay hint.
   */
  paddingLeft?: boolean;

  /**
   * Render padding after the hint. Note: Padding should use the
   * editor's background color, not the background color of the hint
   * itself. That means padding can be used to visually align/separate
   * an inlay hint.
   */
  paddingRight?: boolean;

  /**
   * A data entry field that is preserved on a inlay hint between
   * a `textDocument/inlayHint` and a `inlayHint/resolve` request.
   */
  data?: any;
}

/**
 * `NgLanguageService` describes an instance of an Angular language service,
 * whose API surface is a strict superset of TypeScript's language service.
 */
export interface NgLanguageService extends ts.LanguageService {
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

  applyRefactoring(
    fileName: string,
    positionOrRange: number | ts.TextRange,
    refactorName: string,
    reportProgress: ApplyRefactoringProgressFn,
  ): Promise<ApplyRefactoringResult | undefined>;

  hasCodeFixesForErrorCode(errorCode: number): boolean;

  getTokenTypeFromClassification(classification: number): number | undefined;
  getTokenModifierFromClassification(classification: number): number;

  /**
   * Gets inlay hints for the specified file and span.
   *
   * Inlay hints are inline annotations that appear directly in the code,
   * showing type information without requiring hover.
   *
   * @param fileName The file to get inlay hints for
   * @param span The text span to get inlay hints for
   * @returns An array of inlay hints
   */
  getInlayHints(fileName: string, span: ts.TextSpan): InlayHint[];
}

export function isNgLanguageService(
  ls: ts.LanguageService | NgLanguageService,
): ls is NgLanguageService {
  return 'getTcb' in ls;
}
