/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, BindingPipe, PropertyWrite, TmplAstReference, TmplAstVariable} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../diagnostics';

import {TcbSourceResolver, absoluteSourceSpanToSourceLocation, makeTemplateDiagnostic} from './diagnostics';



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

  /**
   * Reports usage of a `| pipe` expression in the template for which the named pipe could not be
   * found.
   *
   * @param templateId the template type-checking ID of the template which contains the unknown
   * pipe.
   * @param ast the `BindingPipe` invocation of the pipe which could not be found.
   * @param sourceSpan the `AbsoluteSourceSpan` of the pipe invocation (ideally, this should be the
   * source span of the pipe's name). This depends on the source span of the `BindingPipe` itself
   * plus span of the larger expression context.
   */
  missingPipe(templateId: string, ast: BindingPipe, sourceSpan: AbsoluteSourceSpan): void;

  illegalAssignmentToTemplateVar(
      templateId: string, assignment: PropertyWrite, assignmentSpan: AbsoluteSourceSpan,
      target: TmplAstVariable): void;
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
        ErrorCode.MISSING_REFERENCE_TARGET, errorMsg));
  }

  missingPipe(templateId: string, ast: BindingPipe, absSpan: AbsoluteSourceSpan): void {
    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `No pipe found with name '${ast.name}'.`;

    const location = absoluteSourceSpanToSourceLocation(templateId, absSpan);
    const sourceSpan = this.resolver.sourceLocationToSpan(location);
    if (sourceSpan === null) {
      throw new Error(
          `Assertion failure: no SourceLocation found for usage of pipe '${ast.name}'.`);
    }
    this._diagnostics.push(makeTemplateDiagnostic(
        mapping, sourceSpan, ts.DiagnosticCategory.Error, ErrorCode.MISSING_PIPE, errorMsg));
  }

  illegalAssignmentToTemplateVar(
      templateId: string, assignment: PropertyWrite, assignmentSpan: AbsoluteSourceSpan,
      target: TmplAstVariable): void {
    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg =
        `Cannot use variable '${assignment.name}' as the left-hand side of an assignment expression. Template variables are read-only.`;

    const location = absoluteSourceSpanToSourceLocation(templateId, assignmentSpan);
    const sourceSpan = this.resolver.sourceLocationToSpan(location);
    if (sourceSpan === null) {
      throw new Error(`Assertion failure: no SourceLocation found for property binding.`);
    }
    this._diagnostics.push(makeTemplateDiagnostic(
        mapping, sourceSpan, ts.DiagnosticCategory.Error, ErrorCode.WRITE_TO_READ_ONLY_VARIABLE,
        errorMsg, {
          text: `The variable ${assignment.name} is declared here.`,
          span: target.valueSpan || target.sourceSpan,
        }));
  }
}
