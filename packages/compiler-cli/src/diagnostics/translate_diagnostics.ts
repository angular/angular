/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceSpan} from '@angular/compiler';
import * as ts from 'typescript';

import {DEFAULT_ERROR_CODE, Diagnostic, SOURCE} from '../transformers/api';
import {GENERATED_FILES} from '../transformers/util';

export interface TypeCheckHost {
  parseSourceSpanOf(fileName: string, line: number, character: number): ParseSourceSpan|null;
}

export function translateDiagnostics(
    host: TypeCheckHost, untranslatedDiagnostics: ReadonlyArray<ts.Diagnostic>):
    {ts: ts.Diagnostic[], ng: Diagnostic[]} {
  const ts: ts.Diagnostic[] = [];
  const ng: Diagnostic[] = [];

  untranslatedDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file && diagnostic.start && GENERATED_FILES.test(diagnostic.file.fileName)) {
      // We need to filter out diagnostics about unused functions as
      // they are in fact referenced by nobody and only serve to surface
      // type check errors.
      if (diagnostic.code === /* ... is declared but never used */ 6133) {
        return;
      }
      const span = sourceSpanOf(host, diagnostic.file, diagnostic.start);
      if (span) {
        const fileName = span.start.file.url;
        ng.push({
          messageText: diagnosticMessageToString(diagnostic.messageText),
          category: diagnostic.category,
          span,
          source: SOURCE,
          code: DEFAULT_ERROR_CODE
        });
      }
    } else {
      ts.push(diagnostic);
    }
  });
  return {ts, ng};
}

function sourceSpanOf(host: TypeCheckHost, source: ts.SourceFile, start: number): ParseSourceSpan|
    null {
  const {line, character} = ts.getLineAndCharacterOfPosition(source, start);
  return host.parseSourceSpanOf(source.fileName, line, character);
}

function diagnosticMessageToString(message: ts.DiagnosticMessageChain|string): string {
  return ts.flattenDiagnosticMessageText(message, '\n');
}
