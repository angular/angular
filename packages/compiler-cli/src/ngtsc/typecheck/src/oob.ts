/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, BindingPipe, PropertyRead, PropertyWrite, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstElement, TmplAstForLoopBlock, TmplAstForLoopBlockEmpty, TmplAstHoverDeferredTrigger, TmplAstIfBlockBranch, TmplAstInteractionDeferredTrigger, TmplAstReference, TmplAstTemplate, TmplAstVariable, TmplAstViewportDeferredTrigger} from '@angular/compiler';
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

  /**
   * Reports usage of a pipe imported via `@Component.deferredImports` outside
   * of a `@defer` block in a template.
   *
   * @param templateId the template type-checking ID of the template which contains the unknown
   * pipe.
   * @param ast the `BindingPipe` invocation of the pipe which could not be found.
   */
  deferredPipeUsedEagerly(templateId: TemplateId, ast: BindingPipe): void;

  /**
   * Reports usage of a component/directive imported via `@Component.deferredImports` outside
   * of a `@defer` block in a template.
   *
   * @param templateId the template type-checking ID of the template which contains the unknown
   * pipe.
   * @param element the element which hosts a component that was defer-loaded.
   */
  deferredComponentUsedEagerly(templateId: TemplateId, element: TmplAstElement): void;

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

  /**
   * Reports accesses of properties that aren't available in a `for` block's tracking expression.
   */
  illegalForLoopTrackAccess(
      templateId: TemplateId, block: TmplAstForLoopBlock, access: PropertyRead): void;

  /**
   * Reports deferred triggers that cannot access the element they're referring to.
   */
  inaccessibleDeferredTriggerElement(
      templateId: TemplateId,
      trigger: TmplAstHoverDeferredTrigger|TmplAstInteractionDeferredTrigger|
      TmplAstViewportDeferredTrigger): void;

  /**
   * Reports cases where control flow nodes prevent content projection.
   */
  controlFlowPreventingContentProjection(
      templateId: TemplateId, category: ts.DiagnosticCategory,
      projectionNode: TmplAstElement|TmplAstTemplate, componentName: string, slotSelector: string,
      controlFlowNode: TmplAstIfBlockBranch|TmplAstForLoopBlock|TmplAstForLoopBlockEmpty,
      preservesWhitespaces: boolean): void;
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

  deferredPipeUsedEagerly(templateId: TemplateId, ast: BindingPipe): void {
    if (this.recordedPipes.has(ast)) {
      return;
    }

    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `Pipe '${ast.name}' was imported  via \`@Component.deferredImports\`, ` +
        `but was used outside of a \`@defer\` block in a template. To fix this, either ` +
        `use the '${ast.name}' pipe inside of a \`@defer\` block or import this dependency ` +
        `using the \`@Component.imports\` field.`;

    const sourceSpan = this.resolver.toParseSourceSpan(templateId, ast.nameSpan);
    if (sourceSpan === null) {
      throw new Error(
          `Assertion failure: no SourceLocation found for usage of pipe '${ast.name}'.`);
    }
    this._diagnostics.push(makeTemplateDiagnostic(
        templateId, mapping, sourceSpan, ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.DEFERRED_PIPE_USED_EAGERLY), errorMsg));
    this.recordedPipes.add(ast);
  }

  deferredComponentUsedEagerly(templateId: TemplateId, element: TmplAstElement): void {
    const mapping = this.resolver.getSourceMapping(templateId);
    const errorMsg = `Element '${element.name}' contains a component or a directive that ` +
        `was imported  via \`@Component.deferredImports\`, but the element itself is located ` +
        `outside of a \`@defer\` block in a template. To fix this, either ` +
        `use the '${element.name}' element inside of a \`@defer\` block or ` +
        `import referenced component/directive dependency using the \`@Component.imports\` field.`;

    const {start, end} = element.startSourceSpan;
    const absoluteSourceSpan = new AbsoluteSourceSpan(start.offset, end.offset);
    const sourceSpan = this.resolver.toParseSourceSpan(templateId, absoluteSourceSpan);
    if (sourceSpan === null) {
      throw new Error(
          `Assertion failure: no SourceLocation found for usage of pipe '${element.name}'.`);
    }
    this._diagnostics.push(makeTemplateDiagnostic(
        templateId, mapping, sourceSpan, ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.DEFERRED_DIRECTIVE_USED_EAGERLY), errorMsg));
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

  illegalForLoopTrackAccess(
      templateId: TemplateId, block: TmplAstForLoopBlock, access: PropertyRead): void {
    const sourceSpan = this.resolver.toParseSourceSpan(templateId, access.sourceSpan);
    if (sourceSpan === null) {
      throw new Error(`Assertion failure: no SourceLocation found for property read.`);
    }

    const message =
        `Cannot access '${access.name}' inside of a track expression. ` +
        `Only '${block.item.name}', '${
            block.contextVariables.$index
                .name}' and properties on the containing component are available to this expression.`;

    this._diagnostics.push(makeTemplateDiagnostic(
        templateId, this.resolver.getSourceMapping(templateId), sourceSpan,
        ts.DiagnosticCategory.Error, ngErrorCode(ErrorCode.ILLEGAL_FOR_LOOP_TRACK_ACCESS),
        message));
  }

  inaccessibleDeferredTriggerElement(
      templateId: TemplateId,
      trigger: TmplAstHoverDeferredTrigger|TmplAstInteractionDeferredTrigger|
      TmplAstViewportDeferredTrigger): void {
    let message: string;

    if (trigger.reference === null) {
      message = `Trigger cannot find reference. Make sure that the @defer block has a ` +
          `@placeholder with at least one root element node.`;
    } else {
      message =
          `Trigger cannot find reference "${trigger.reference}".\nCheck that an element with #${
              trigger.reference} exists in the same template and it's accessible from the ` +
          `@defer block.\nDeferred blocks can only access triggers in same view, a parent ` +
          `embedded view or the root view of the @placeholder block.`;
    }

    this._diagnostics.push(makeTemplateDiagnostic(
        templateId, this.resolver.getSourceMapping(templateId), trigger.sourceSpan,
        ts.DiagnosticCategory.Error, ngErrorCode(ErrorCode.INACCESSIBLE_DEFERRED_TRIGGER_ELEMENT),
        message));
  }

  controlFlowPreventingContentProjection(
      templateId: TemplateId, category: ts.DiagnosticCategory,
      projectionNode: TmplAstElement|TmplAstTemplate, componentName: string, slotSelector: string,
      controlFlowNode: TmplAstIfBlockBranch|TmplAstForLoopBlock|TmplAstForLoopBlockEmpty,
      preservesWhitespaces: boolean): void {
    let blockName: string;
    if (controlFlowNode instanceof TmplAstForLoopBlockEmpty) {
      blockName = '@empty';
    } else if (controlFlowNode instanceof TmplAstForLoopBlock) {
      blockName = '@for';
    } else {
      blockName = '@if';
    }

    const lines = [
      `Node matches the "${slotSelector}" slot of the "${
          componentName}" component, but will not be projected into the specific slot because the surrounding ${
          blockName} has more than one node at its root. To project the node in the right slot, you can:\n`,
      `1. Wrap the content of the ${blockName} block in an <ng-container/> that matches the "${
          slotSelector}" selector.`,
      `2. Split the content of the ${blockName} block across multiple ${
          blockName} blocks such that each one only has a single projectable node at its root.`,
      `3. Remove all content from the ${blockName} block, except for the node being projected.`
    ];

    if (preservesWhitespaces) {
      lines.push(
          'Note: the host component has `preserveWhitespaces: true` which may ' +
          'cause whitespace to affect content projection.');
    }

    lines.push(
        '',
        'This check can be disabled using the `extendedDiagnostics.checks.' +
            'controlFlowPreventingContentProjection = "suppress" compiler option.`');

    this._diagnostics.push(makeTemplateDiagnostic(
        templateId, this.resolver.getSourceMapping(templateId), projectionNode.startSourceSpan,
        category, ngErrorCode(ErrorCode.CONTROL_FLOW_PREVENTING_CONTENT_PROJECTION),
        lines.join('\n')));
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
