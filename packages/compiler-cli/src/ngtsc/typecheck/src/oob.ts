/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstReference} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../diagnostics';

import {TcbSourceResolver, makeTemplateDiagnostic} from './diagnostics';

/**
 * Collects `ts.Diagnostic`s on problems which occur in the template which aren't directly sourced
 * from Type Check Blocks.
 *
 * During the creation of a Type Check Block, the template is traversed and the
 * `OutOfBandDiagnosticRecorder` is called to record cases when a correct interpretation for the
 * template cannot be found. These operations create `ts.Diagnostic`s which are stored by the
 * recorder for later display.
 */
export interface OutOfBandDiagnosticRecorder {
  readonly diagnostics: ReadonlyArray<ts.Diagnostic>;

  /**
   * Reports a `#ref="target"` expression in the template for which a target directive could not be
   * found.
   *
   * @param templateId the template type-checking ID of the template which contains the broken
   * reference.
   * @param ref the `TmplAstReference` which could not be matched to a directive.
   */
  missingReferenceTarget(templateId: string, ref: TmplAstReference): void;
}

export class OutOfBandDiagnosticRecorderImpl implements OutOfBandDiagnosticRecorder {
  private _diagnostics: ts.Diagnostic[] = [];

  constructor(private resolver: TcbSourceResolver) {}

  get diagnostics(): ReadonlyArray<ts.Diagnostic> { return this._diagnostics; }

  missingReferenceTarget(templateId: string, ref: TmplAstReference): void {
    const mapping = this.resolver.getSourceMapping(templateId);
    const value = ref.value.trim();

    const errorMsg = `No directive found with exportAs '${value}'.`;
    this._diagnostics.push(makeTemplateDiagnostic(
        mapping, ref.valueSpan || ref.sourceSpan, ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.MISSING_REFERENCE_TARGET), errorMsg));
  }
}
