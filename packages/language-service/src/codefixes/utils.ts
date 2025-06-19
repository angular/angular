/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom, NgCompiler} from '@angular/compiler-cli';
import tss from 'typescript';

import {TypeCheckInfo} from '../utils';

/**
 * This context is the info includes the `errorCode` at the given span the user selected in the
 * editor and the `NgCompiler` could help to fix it.
 *
 * When the editor tries to provide a code fix for a diagnostic in a span of a template file, this
 * context will be provided to the `CodeActionMeta` which could handle the `errorCode`.
 */
export interface CodeActionContext {
  typeCheckInfo: TypeCheckInfo | null;
  fileName: string;
  compiler: NgCompiler;
  start: number;
  end: number;
  errorCode: number;
  formatOptions: tss.FormatCodeSettings;
  preferences: tss.UserPreferences;
  tsLs: tss.LanguageService;
}

/**
 * This context is the info includes all diagnostics in the `scope` and the `NgCompiler` that could
 * help to fix it.
 *
 * When the editor tries to fix the all same type of diagnostics selected by the user in the
 * `scope`, this context will be provided to the `CodeActionMeta` which could handle the `fixId`.
 */
export interface CodeFixAllContext {
  scope: tss.CombinedCodeFixScope;
  compiler: NgCompiler;
  // https://github.com/microsoft/TypeScript/blob/5c4caafc2a2d0fceb03fce80fb14d3ee4407d918/src/services/types.ts#L781-L785
  fixId: string;
  formatOptions: tss.FormatCodeSettings;
  preferences: tss.UserPreferences;
  tsLs: tss.LanguageService;
  diagnostics: tss.Diagnostic[];
}

export interface CodeActionMeta {
  errorCodes: Array<number>;
  getCodeActions: (context: CodeActionContext) => readonly tss.CodeFixAction[];
  fixIds: FixIdForCodeFixesAll[];
  getAllCodeActions: (context: CodeFixAllContext) => tss.CombinedCodeActions;
}

/**
 * Convert the span of `textChange` in the TCB to the span of the template.
 */
export function convertFileTextChangeInTcb(
  changes: readonly tss.FileTextChanges[],
  compiler: NgCompiler,
): tss.FileTextChanges[] {
  const ttc = compiler.getTemplateTypeChecker();
  const fileTextChanges: tss.FileTextChanges[] = [];
  for (const fileTextChange of changes) {
    if (!ttc.isTrackedTypeCheckFile(absoluteFrom(fileTextChange.fileName))) {
      fileTextChanges.push(fileTextChange);
      continue;
    }
    const textChanges: tss.TextChange[] = [];
    let fileName: string | undefined;
    const seenTextChangeInTemplate = new Set<string>();
    for (const textChange of fileTextChange.textChanges) {
      const sourceLocation = ttc.getSourceMappingAtTcbLocation({
        tcbPath: absoluteFrom(fileTextChange.fileName),
        isShimFile: true,
        positionInFile: textChange.span.start,
      });
      if (sourceLocation === null) {
        continue;
      }
      const mapping = sourceLocation.sourceMapping;
      if (mapping.type === 'external') {
        fileName = mapping.templateUrl;
      } else if (mapping.type === 'direct') {
        fileName = mapping.node.getSourceFile().fileName;
      } else {
        continue;
      }
      const start = sourceLocation.span.start.offset;
      const length = sourceLocation.span.end.offset - sourceLocation.span.start.offset;
      const changeSpanKey = `${start},${length}`;
      if (seenTextChangeInTemplate.has(changeSpanKey)) {
        continue;
      }
      seenTextChangeInTemplate.add(changeSpanKey);
      textChanges.push({
        newText: textChange.newText,
        span: {
          start,
          length,
        },
      });
    }
    if (fileName === undefined) {
      continue;
    }
    fileTextChanges.push({
      fileName,
      isNewFile: fileTextChange.isNewFile,
      textChanges,
    });
  }
  return fileTextChanges;
}

/**
 * 'fix all' is only available when there are multiple diagnostics that the code action meta
 * indicates it can fix.
 */
export function isFixAllAvailable(meta: CodeActionMeta, diagnostics: tss.Diagnostic[]) {
  const errorCodes = meta.errorCodes;
  let maybeFixableDiagnostics = 0;
  for (const diag of diagnostics) {
    if (errorCodes.includes(diag.code)) maybeFixableDiagnostics++;
    if (maybeFixableDiagnostics > 1) return true;
  }

  return false;
}

export enum FixIdForCodeFixesAll {
  FIX_SPELLING = 'fixSpelling',
  FIX_MISSING_MEMBER = 'fixMissingMember',
  FIX_INVALID_BANANA_IN_BOX = 'fixInvalidBananaInBox',
  FIX_MISSING_IMPORT = 'fixMissingImport',
  FIX_UNUSED_STANDALONE_IMPORTS = 'fixUnusedStandaloneImports',
}
