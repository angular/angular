/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import tss from 'typescript';

import {TypeCheckInfo} from '../utils';

import {CodeActionMeta, FixIdForCodeFixesAll, isFixAllAvailable} from './utils';

export class CodeFixes {
  private errorCodeToFixes = new Map<number, CodeActionMeta[]>();
  private fixIdToRegistration = new Map<FixIdForCodeFixesAll, CodeActionMeta>();

  constructor(
    private readonly tsLS: tss.LanguageService,
    readonly codeActionMetas: CodeActionMeta[],
  ) {
    for (const meta of codeActionMetas) {
      for (const err of meta.errorCodes) {
        let errMeta = this.errorCodeToFixes.get(err);
        if (errMeta === undefined) {
          this.errorCodeToFixes.set(err, (errMeta = []));
        }
        errMeta.push(meta);
      }
      for (const fixId of meta.fixIds) {
        if (this.fixIdToRegistration.has(fixId)) {
          // https://github.com/microsoft/TypeScript/blob/28dc248e5c500c7be9a8c3a7341d303e026b023f/src/services/codeFixProvider.ts#L28
          // In ts services, only one meta can be registered for a fixId.
          continue;
        }
        this.fixIdToRegistration.set(fixId, meta);
      }
    }
  }

  hasFixForCode(code: number): boolean {
    return this.errorCodeToFixes.has(code);
  }

  /**
   * When the user moves the cursor or hovers on a diagnostics, this function will be invoked by LS,
   * and collect all the responses from the `codeActionMetas` which could handle the `errorCodes`.
   */
  getCodeFixesAtPosition(
    fileName: string,
    typeCheckInfo: TypeCheckInfo | null,
    compiler: NgCompiler,
    start: number,
    end: number,
    errorCodes: readonly number[],
    diagnostics: tss.Diagnostic[],
    formatOptions: tss.FormatCodeSettings,
    preferences: tss.UserPreferences,
  ): readonly tss.CodeFixAction[] {
    const codeActions: tss.CodeFixAction[] = [];
    for (const code of errorCodes) {
      const metas = this.errorCodeToFixes.get(code);
      if (metas === undefined) {
        continue;
      }
      for (const meta of metas) {
        const codeActionsForMeta = meta.getCodeActions({
          fileName,
          typeCheckInfo: typeCheckInfo,
          compiler,
          start,
          end,
          errorCode: code,
          formatOptions,
          preferences,
          tsLs: this.tsLS,
        });
        const fixAllAvailable = isFixAllAvailable(meta, diagnostics);
        const removeFixIdForCodeActions = codeActionsForMeta.map(
          ({fixId, fixAllDescription, ...codeActionForMeta}) => {
            return fixAllAvailable
              ? {...codeActionForMeta, fixId, fixAllDescription}
              : codeActionForMeta;
          },
        );
        codeActions.push(...removeFixIdForCodeActions);
      }
    }
    return codeActions;
  }

  /**
   * When the user wants to fix the all same type of diagnostics in the `scope`, this function will
   * be called and fix all diagnostics which will be filtered by the `errorCodes` from the
   * `CodeActionMeta` that the `fixId` belongs to.
   */
  getAllCodeActions(
    compiler: NgCompiler,
    diagnostics: tss.Diagnostic[],
    scope: tss.CombinedCodeFixScope,
    fixId: string,
    formatOptions: tss.FormatCodeSettings,
    preferences: tss.UserPreferences,
  ): tss.CombinedCodeActions {
    const meta = this.fixIdToRegistration.get(fixId as FixIdForCodeFixesAll);
    if (meta === undefined) {
      return {
        changes: [],
      };
    }
    return meta.getAllCodeActions({
      compiler,
      fixId,
      formatOptions,
      preferences,
      tsLs: this.tsLS,
      scope,
      // only pass the diagnostics the `meta` cares about.
      diagnostics: diagnostics.filter((diag) => meta.errorCodes.includes(diag.code)),
    });
  }
}
