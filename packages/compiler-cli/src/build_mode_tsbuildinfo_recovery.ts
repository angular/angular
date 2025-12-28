/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

export function flattenDiagnosticMessage(diag: ts.Diagnostic): string {
  return ts.flattenDiagnosticMessageText(diag.messageText, ts.sys.newLine);
}

export function extractTsBuildInfoPathFromDiagnostic(diag: ts.Diagnostic): string | null {
  // First, check if the diagnostic file directly points to a tsbuildinfo file.
  // This is the most reliable indicator.
  if (diag.file?.fileName && diag.file.fileName.endsWith('.tsbuildinfo')) {
    return diag.file.fileName;
  }

  const msg = flattenDiagnosticMessage(diag);
  if (!msg.includes('.tsbuildinfo')) {
    return null;
  }

  // Attempt to parse the path from the diagnostic message. TS sometimes
  // quotes paths and sometimes prints them as bare tokens.
  const m = msg.match(/(?:['"])?([^\s'"]+\.tsbuildinfo)(?:['"])?/);
  if (!m) {
    return null;
  }

  return m[1].replace(/[),.:;]+$/, '');
}
