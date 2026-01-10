/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver';

import {tsRelatedInformationToLspRelatedInformation, tsTextSpanToLspRange} from './utils';

/**
 * Convert ts.DiagnosticCategory to lsp.DiagnosticSeverity
 * @param category diagnostic category
 */
function tsDiagnosticCategoryToLspDiagnosticSeverity(category: ts.DiagnosticCategory) {
  switch (category) {
    case ts.DiagnosticCategory.Warning:
      return lsp.DiagnosticSeverity.Warning;
    case ts.DiagnosticCategory.Error:
      return lsp.DiagnosticSeverity.Error;
    case ts.DiagnosticCategory.Suggestion:
      return lsp.DiagnosticSeverity.Hint;
    case ts.DiagnosticCategory.Message:
    default:
      return lsp.DiagnosticSeverity.Information;
  }
}

/**
 * Convert ts.Diagnostic to lsp.Diagnostic
 * @param tsDiag TS diagnostic
 * @param scriptInfo Used to compute proper offset.
 */
export function tsDiagnosticToLspDiagnostic(
  tsDiag: ts.Diagnostic,
  projectService: ts.server.ProjectService,
): lsp.Diagnostic {
  const textSpan: ts.TextSpan = {
    start: tsDiag.start || 0,
    length: tsDiag.length || 0,
  };

  const diagScriptInfo =
    tsDiag.file !== undefined ? projectService.getScriptInfo(tsDiag.file.fileName) : undefined;
  const range =
    diagScriptInfo !== undefined
      ? tsTextSpanToLspRange(diagScriptInfo, textSpan)
      : lsp.Range.create(0, 0, 0, 0);
  const diag = lsp.Diagnostic.create(
    range,
    ts.flattenDiagnosticMessageText(tsDiag.messageText, '\n'),
    tsDiagnosticCategoryToLspDiagnosticSeverity(tsDiag.category),
    tsDiag.code,
    tsDiag.source,
    tsRelatedInformationToLspRelatedInformation(projectService, tsDiag.relatedInformation),
  );
  diag.tags = tsDiag.reportsDeprecated !== undefined ? [lsp.DiagnosticTag.Deprecated] : undefined;

  return diag;
}
