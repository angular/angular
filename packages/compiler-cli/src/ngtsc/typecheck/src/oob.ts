/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BindingPipe, PropertyWrite, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstElement, TmplAstReference, TmplAstTemplate, TmplAstVariable} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, makeDiagnostic, makeRelatedInformation, ngErrorCode} from '../../diagnostics';
import {ClassDeclaration} from '../../reflection';
import {TemplateDiagnostic, TemplateId} from '../api';
import {makeTemplateDiagnostic} from '../diagnostics';

import {TemplateSourceResolver} from './tcb_util';



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
  readonly diagnostics: ReadonlyArray<TemplateDiagnostic>;

  /**
   * Reports a `#ref="target"` expression in the template for which a target directive could not be
   * found.
   *
   * @param templateId the template type-checking ID of the template which contains the broken
   * reference.
   * @param ref the `TmplAstReference` which could not be matched to a directive.
   */
  missingReferenceTarget(templateId: TemplateId, ref: TmplAstReference): void;

  /**
   * Reports usage of a `| pipe` expression in the template for which the named pipe could not be
   * found.
   *
   * @param templateId the template type-checking ID of the template which contains the unknown
   * pipe.
   * @param ast the `BindingPipe` invocation of the pipe which could not be found.
   */
  missingPipe(templateId: TemplateId, ast: BindingPipe): void;

  illegalAssignmentToTemplateVar(
      templateId: TemplateId, assignment: PropertyWrite, target: TmplAstVariable): void;

  /**
   * Reports a duplicate declaration of a template variable.
   *
   * @param templateId the template type-checking ID of the template which contains the duplicate
   * declaration.
   * @param variable the `TmplAstVariable` which duplicates a previously declared variable.
   * @param firstDecl the first variable declaration which uses the same name as `variable`.
   */
  duplicateTemplateVar(
      templateId: TemplateId, variable: TmplAstVariable, firstDecl: TmplAstVariable): void;

  requiresInlineTcb(templateId: TemplateId, node: ClassDeclaration): void;

  requiresInlineTypeConstructors(
      templateId: TemplateId, node: ClassDeclaration, directives: ClassDeclaration[]): void;

  /**
   * Report a warning when structural directives support context guards, but the current
   * type-checking configuration prohibits their usage.
   */
  suboptimalTypeInference(templateId: TemplateId, variables: TmplAstVariable[]): void;

  /**
   * Reports a split two way binding error message.
   */
  splitTwoWayBinding(
      templateId: TemplateId, input: TmplAstBoundAttribute, output: TmplAstBoundEvent,
      inputConsumer: ClassDeclaration, outputConsumer: ClassDeclaration|TmplAstElement): void;

  /** Reports required inputs that haven't been bound. */
  missingRequiredInputs(
      templateId: TemplateId, element: TmplAstElement|TmplAstTemplate, directiveName: string,
      isComponent: boolean, inputAliases: string[]): void;
}

export class OutOfBandDiagnosticRecorderImpl implements OutOfBandDiagnosticRecorder {
  private _diagnostics: TemplateDiagnostic[] = [];

  /**
   * Tracks which `BindingPipe` nodes have already been recorded as invalid, so only one diagnostic
   * is ever produced per node.
   */
  private recordedPipes = new Set<BindingPipe>();

  constructor(private resolver: TemplateSourceResolver) {}

  get diagnostics(): ReadonlyArray<TemplateDiagnostic> {
    return this._diagnostics;
  }

  missingReferenceTarget(templateId: TemplateId, ref: TmplAstReference): void {
    const mapping = this.resolver.getSourceMapping(templateId);
    const value = ref.value.trim();

    const errorMsg = `No directive found with exportAs '${value}'.`;
    this._diagnostics.push(makeTemplateDiagnostic(
        templateId, mapping, ref.valueSpan || ref.sourceSpan, ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.MISSING_REFERENCE_TARGET), errorMsg));
  }

  missingPipe(templateId: TemplateId, ast: BindingPipe): void {
    if (this.recordedPipes.has(ast)) {
      return;
    }

    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `No pipe found with name '${ast.name}'.`;

    const sourceSpan = this.resolver.toParseSourceSpan(templateId, ast.nameSpan);
    if (sourceSpan === null) {
      throw new Error(
          `Assertion failure: no SourceLocation found for usage of pipe '${ast.name}'.`);
    }
    this._diagnostics.push(makeTemplateDiagnostic(
        templateId, mapping, sourceSpan, ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.MISSING_PIPE), errorMsg));
    this.recordedPipes.add(ast);
  }

  illegalAssignmentToTemplateVar(
      templateId: TemplateId, assignment: PropertyWrite, target: TmplAstVariable): void {
    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `Cannot use variable '${
        assignment
            .name}' as the left-hand side of an assignment expression. Template variables are read-only.`;

    const sourceSpan = this.resolver.toParseSourceSpan(templateId, assignment.sourceSpan);
    if (sourceSpan === null) {
      throw new Error(`Assertion failure: no SourceLocation found for property binding.`);
    }
    this._diagnostics.push(makeTemplateDiagnostic(
        templateId, mapping, sourceSpan, ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.WRITE_TO_READ_ONLY_VARIABLE), errorMsg, [{
          text: `The variable ${assignment.name} is declared here.`,
          start: target.valueSpan?.start.offset || target.sourceSpan.start.offset,
          end: target.valueSpan?.end.offset || target.sourceSpan.end.offset,
          sourceFile: mapping.node.getSourceFile(),
        }]));
  }

  duplicateTemplateVar(
      templateId: TemplateId, variable: TmplAstVariable, firstDecl: TmplAstVariable): void {
    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `Cannot redeclare variable '${
        variable.name}' as it was previously declared elsewhere for the same template.`;

    // The allocation of the error here is pretty useless for variables declared in microsyntax,
    // since the sourceSpan refers to the entire microsyntax property, not a span for the specific
    // variable in question.
    //
    // TODO(alxhub): allocate to a tighter span once one is available.
    this._diagnostics.push(makeTemplateDiagnostic(
        templateId, mapping, variable.sourceSpan, ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.DUPLICATE_VARIABLE_DECLARATION), errorMsg, [{
          text: `The variable '${firstDecl.name}' was first declared here.`,
          start: firstDecl.sourceSpan.start.offset,
          end: firstDecl.sourceSpan.end.offset,
          sourceFile: mapping.node.getSourceFile(),
        }]));
  }

  requiresInlineTcb(templateId: TemplateId, node: ClassDeclaration): void {
    this._diagnostics.push(makeInlineDiagnostic(
        templateId, ErrorCode.INLINE_TCB_REQUIRED, node.name,
        `This component requires inline template type-checking, which is not supported by the current environment.`));
  }

  requiresInlineTypeConstructors(
      templateId: TemplateId, node: ClassDeclaration, directives: ClassDeclaration[]): void {
    let message: string;
    if (directives.length > 1) {
      message =
          `This component uses directives which require inline type constructors, which are not supported by the current environment.`;
    } else {
      message =
          `This component uses a directive which requires an inline type constructor, which is not supported by the current environment.`;
    }

    this._diagnostics.push(makeInlineDiagnostic(
        templateId, ErrorCode.INLINE_TYPE_CTOR_REQUIRED, node.name, message,
        directives.map(
            dir => makeRelatedInformation(dir.name, `Requires an inline type constructor.`))));
  }

  suboptimalTypeInference(templateId: TemplateId, variables: TmplAstVariable[]): void {
    const mapping = this.resolver.getSourceMapping(templateId);

    // Select one of the template variables that's most suitable for reporting the diagnostic. Any
    // variable will do, but prefer one bound to the context's $implicit if present.
    let diagnosticVar: TmplAstVariable|null = null;
    for (const variable of variables) {
      if (diagnosticVar === null || (variable.value === '' || variable.value === '$implicit')) {
        diagnosticVar = variable;
      }
    }
    if (diagnosticVar === null) {
      // There is no variable on which to report the diagnostic.
      return;
    }

    let varIdentification = `'${diagnosticVar.name}'`;
    if (variables.length === 2) {
      varIdentification += ` (and 1 other)`;
    } else if (variables.length > 2) {
      varIdentification += ` (and ${variables.length - 1} others)`;
    }
    const message =
        `This structural directive supports advanced type inference, but the current compiler configuration prevents its usage. The variable ${
            varIdentification} will have type 'any' as a result.\n\nConsider enabling the 'strictTemplates' option in your tsconfig.json for better type inference within this template.`;

    this._diagnostics.push(makeTemplateDiagnostic(
        templateId, mapping, diagnosticVar.keySpan, ts.DiagnosticCategory.Suggestion,
        ngErrorCode(ErrorCode.SUGGEST_SUBOPTIMAL_TYPE_INFERENCE), message));
  }

  splitTwoWayBinding(
      templateId: TemplateId, input: TmplAstBoundAttribute, output: TmplAstBoundEvent,
      inputConsumer: ClassDeclaration, outputConsumer: ClassDeclaration|TmplAstElement): void {
    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `The property and event halves of the two-way binding '${
        input.name}' are not bound to the same target.
            Find more at https://angular.io/guide/two-way-binding#how-two-way-binding-works`;

    const relatedMessages: {text: string; start: number; end: number;
                            sourceFile: ts.SourceFile;}[] = [];

    relatedMessages.push({
      text: `The property half of the binding is to the '${inputConsumer.name.text}' component.`,
      start: inputConsumer.name.getStart(),
      end: inputConsumer.name.getEnd(),
      sourceFile: inputConsumer.name.getSourceFile(),
    });

    if (outputConsumer instanceof TmplAstElement) {
      let message = `The event half of the binding is to a native event called '${
          input.name}' on the <${outputConsumer.name}> DOM element.`;
      if (!mapping.node.getSourceFile().isDeclarationFile) {
        message += `\n \n Are you missing an output declaration called '${output.name}'?`;
      }
      relatedMessages.push({
        text: message,
        start: outputConsumer.sourceSpan.start.offset + 1,
        end: outputConsumer.sourceSpan.start.offset + outputConsumer.name.length + 1,
        sourceFile: mapping.node.getSourceFile(),
      });
    } else {
      relatedMessages.push({
        text: `The event half of the binding is to the '${outputConsumer.name.text}' component.`,
        start: outputConsumer.name.getStart(),
        end: outputConsumer.name.getEnd(),
        sourceFile: outputConsumer.name.getSourceFile(),
      });
    }


    this._diagnostics.push(makeTemplateDiagnostic(
        templateId, mapping, input.keySpan, ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.SPLIT_TWO_WAY_BINDING), errorMsg, relatedMessages));
  }

  missingRequiredInputs(
      templateId: TemplateId, element: TmplAstElement|TmplAstTemplate, directiveName: string,
      isComponent: boolean, inputAliases: string[]): void {
    const message = `Required input${inputAliases.length === 1 ? '' : 's'} ${
        inputAliases.map(n => `'${n}'`).join(', ')} from ${
        isComponent ? 'component' : 'directive'} ${directiveName} must be specified.`;

    this._diagnostics.push(makeTemplateDiagnostic(
        templateId, this.resolver.getSourceMapping(templateId), element.startSourceSpan,
        ts.DiagnosticCategory.Error, ngErrorCode(ErrorCode.MISSING_REQUIRED_INPUTS), message));
  }
}

function makeInlineDiagnostic(
    templateId: TemplateId, code: ErrorCode.INLINE_TCB_REQUIRED|ErrorCode.INLINE_TYPE_CTOR_REQUIRED,
    node: ts.Node, messageText: string|ts.DiagnosticMessageChain,
    relatedInformation?: ts.DiagnosticRelatedInformation[]): TemplateDiagnostic {
  return {
    ...makeDiagnostic(code, node, messageText, relatedInformation),
    componentFile: node.getSourceFile(),
    templateId,
  };
}
