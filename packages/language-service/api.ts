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

import ts from 'typescript';

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
 * `NgLanguageService` describes an instance of an Angular language service,
 * whose API surface is a strict superset of TypeScript's language service.
 */
export interface NgLanguageService extends ts.LanguageService {
  getTcb(fileName: string, position: number): GetTcbResponse | undefined;
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
}

export function isNgLanguageService(
  ls: ts.LanguageService | NgLanguageService,
): ls is NgLanguageService {
  return 'getTcb' in ls;
}
