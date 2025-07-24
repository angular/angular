/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AbsoluteSourceSpan,
  BindingPipe,
  PropertyRead,
  AST,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstHoverDeferredTrigger,
  TmplAstIfBlockBranch,
  TmplAstInteractionDeferredTrigger,
  TmplAstLetDeclaration,
  TmplAstReference,
  TmplAstSwitchBlockCase,
  TmplAstTemplate,
  TmplAstTextAttribute,
  TmplAstVariable,
  TmplAstViewportDeferredTrigger,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, makeDiagnostic, makeRelatedInformation, ngErrorCode} from '../../diagnostics';
import {ClassDeclaration} from '../../reflection';
import {TemplateDiagnostic, TypeCheckId} from '../api';
import {makeTemplateDiagnostic} from '../diagnostics';

import {TypeCheckSourceResolver} from './tcb_util';

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
   * @param id the type-checking ID of the template which contains the broken reference.
   * @param ref the `TmplAstReference` which could not be matched to a directive.
   */
  missingReferenceTarget(id: TypeCheckId, ref: TmplAstReference): void;

  /**
   * Reports usage of a `| pipe` expression in the template for which the named pipe could not be
   * found.
   *
   * @param id the type-checking ID of the template which contains the unknown pipe.
   * @param ast the `BindingPipe` invocation of the pipe which could not be found.
   * @param isStandalone whether the host component is standalone.
   */
  missingPipe(id: TypeCheckId, ast: BindingPipe, isStandalone: boolean): void;

  /**
   * Reports usage of a pipe imported via `@Component.deferredImports` outside
   * of a `@defer` block in a template.
   *
   * @param id the type-checking ID of the template which contains the unknown pipe.
   * @param ast the `BindingPipe` invocation of the pipe which could not be found.
   */
  deferredPipeUsedEagerly(id: TypeCheckId, ast: BindingPipe): void;

  /**
   * Reports usage of a component/directive imported via `@Component.deferredImports` outside
   * of a `@defer` block in a template.
   *
   * @param id the type-checking ID of the template which contains the unknown pipe.
   * @param element the element which hosts a component that was defer-loaded.
   */
  deferredComponentUsedEagerly(id: TypeCheckId, element: TmplAstElement): void;

  /**
   * Reports a duplicate declaration of a template variable.
   *
   * @param id the type-checking ID of the template which contains the duplicate
   * declaration.
   * @param variable the `TmplAstVariable` which duplicates a previously declared variable.
   * @param firstDecl the first variable declaration which uses the same name as `variable`.
   */
  duplicateTemplateVar(
    id: TypeCheckId,
    variable: TmplAstVariable,
    firstDecl: TmplAstVariable,
  ): void;

  requiresInlineTcb(id: TypeCheckId, node: ClassDeclaration): void;

  requiresInlineTypeConstructors(
    id: TypeCheckId,
    node: ClassDeclaration,
    directives: ClassDeclaration[],
  ): void;

  /**
   * Report a warning when structural directives support context guards, but the current
   * type-checking configuration prohibits their usage.
   */
  suboptimalTypeInference(id: TypeCheckId, variables: TmplAstVariable[]): void;

  /**
   * Reports a split two way binding error message.
   */
  splitTwoWayBinding(
    id: TypeCheckId,
    input: TmplAstBoundAttribute,
    output: TmplAstBoundEvent,
    inputConsumer: ClassDeclaration,
    outputConsumer: ClassDeclaration | TmplAstElement,
  ): void;

  /** Reports required inputs that haven't been bound. */
  missingRequiredInputs(
    id: TypeCheckId,
    element: TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective,
    directiveName: string,
    isComponent: boolean,
    inputAliases: string[],
  ): void;

  /**
   * Reports accesses of properties that aren't available in a `for` block's tracking expression.
   */
  illegalForLoopTrackAccess(
    id: TypeCheckId,
    block: TmplAstForLoopBlock,
    access: PropertyRead,
  ): void;

  /**
   * Reports deferred triggers that cannot access the element they're referring to.
   */
  inaccessibleDeferredTriggerElement(
    id: TypeCheckId,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ): void;

  /**
   * Reports cases where control flow nodes prevent content projection.
   */
  controlFlowPreventingContentProjection(
    id: TypeCheckId,
    category: ts.DiagnosticCategory,
    projectionNode: TmplAstElement | TmplAstTemplate,
    componentName: string,
    slotSelector: string,
    controlFlowNode:
      | TmplAstIfBlockBranch
      | TmplAstSwitchBlockCase
      | TmplAstForLoopBlock
      | TmplAstForLoopBlockEmpty,
    preservesWhitespaces: boolean,
  ): void;

  /** Reports cases where users are writing to `@let` declarations. */
  illegalWriteToLetDeclaration(id: TypeCheckId, node: AST, target: TmplAstLetDeclaration): void;

  /** Reports cases where users are accessing an `@let` before it is defined.. */
  letUsedBeforeDefinition(id: TypeCheckId, node: PropertyRead, target: TmplAstLetDeclaration): void;

  /**
   * Reports a `@let` declaration that conflicts with another symbol in the same scope.
   *
   * @param id the type-checking ID of the template which contains the declaration.
   * @param current the `TmplAstLetDeclaration` which is invalid.
   */
  conflictingDeclaration(id: TypeCheckId, current: TmplAstLetDeclaration): void;

  /**
   * Reports that a named template dependency (e.g. `<Missing/>`) is not available.
   * @param id Type checking ID of the template in which the dependency is declared.
   * @param node Node that declares the dependency.
   */
  missingNamedTemplateDependency(id: TypeCheckId, node: TmplAstComponent | TmplAstDirective): void;

  /**
   * Reports that a templace dependency of the wrong kind has been referenced at a specific position
   * (e.g. `<SomeDirective/>`).
   * @param id Type checking ID of the template in which the dependency is declared.
   * @param node Node that declares the dependency.
   */
  incorrectTemplateDependencyType(id: TypeCheckId, node: TmplAstComponent | TmplAstDirective): void;

  /**
   * Reports a binding inside directive syntax that does not match any of the inputs/outputs of
   * the directive.
   * @param id Type checking ID of the template in which the directive was defined.
   * @param directive Directive that contains the binding.
   * @param node Node declaring the binding.
   */
  unclaimedDirectiveBinding(
    id: TypeCheckId,
    directive: TmplAstDirective,
    node: TmplAstBoundAttribute | TmplAstTextAttribute | TmplAstBoundEvent,
  ): void;

  /**
   * Reports that an implicit deferred trigger is set on a block that does not have a placeholder.
   */
  deferImplicitTriggerMissingPlaceholder(
    id: TypeCheckId,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ): void;

  /**
   * Reports that an implicit deferred trigger is set on a block whose placeholder is not set up
   * correctly (e.g. more than one root node).
   */
  deferImplicitTriggerInvalidPlaceholder(
    id: TypeCheckId,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ): void;
}

export class OutOfBandDiagnosticRecorderImpl implements OutOfBandDiagnosticRecorder {
  private readonly _diagnostics: TemplateDiagnostic[] = [];

  /**
   * Tracks which `BindingPipe` nodes have already been recorded as invalid, so only one diagnostic
   * is ever produced per node.
   */
  private readonly recordedPipes = new Set<BindingPipe>();

  /** Common pipes that can be suggested to users. */
  private readonly pipeSuggestions = new Map<string, string>([
    ['async', 'AsyncPipe'],
    ['uppercase', 'UpperCasePipe'],
    ['lowercase', 'LowerCasePipe'],
    ['json', 'JsonPipe'],
    ['slice', 'SlicePipe'],
    ['number', 'DecimalPipe'],
    ['percent', 'PercentPipe'],
    ['titlecase', 'TitleCasePipe'],
    ['currency', 'CurrencyPipe'],
    ['date', 'DatePipe'],
    ['i18nPlural', 'I18nPluralPipe'],
    ['i18nSelect', 'I18nSelectPipe'],
    ['keyvalue', 'KeyValuePipe'],
  ]);

  constructor(private resolver: TypeCheckSourceResolver) {}

  get diagnostics(): ReadonlyArray<TemplateDiagnostic> {
    return this._diagnostics;
  }

  missingReferenceTarget(id: TypeCheckId, ref: TmplAstReference): void {
    const mapping = this.resolver.getTemplateSourceMapping(id);
    const value = ref.value.trim();

    const errorMsg = `No directive found with exportAs '${value}'.`;
    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        mapping,
        ref.valueSpan || ref.sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.MISSING_REFERENCE_TARGET),
        errorMsg,
      ),
    );
  }

  missingPipe(id: TypeCheckId, ast: BindingPipe, isStandalone: boolean): void {
    if (this.recordedPipes.has(ast)) {
      return;
    }

    const sourceSpan = this.resolver.toTemplateParseSourceSpan(id, ast.nameSpan);
    if (sourceSpan === null) {
      throw new Error(
        `Assertion failure: no SourceLocation found for usage of pipe '${ast.name}'.`,
      );
    }

    const mapping = this.resolver.getTemplateSourceMapping(id);
    let errorMsg = `No pipe found with name '${ast.name}'.`;

    if (this.pipeSuggestions.has(ast.name)) {
      const suggestedClassName = this.pipeSuggestions.get(ast.name)!;
      const suggestedImport = '@angular/common';

      if (isStandalone) {
        errorMsg +=
          `\nTo fix this, import the "${suggestedClassName}" class from "${suggestedImport}"` +
          ` and add it to the "imports" array of the component.`;
      } else {
        errorMsg +=
          `\nTo fix this, import the "${suggestedClassName}" class from "${suggestedImport}"` +
          ` and add it to the "imports" array of the module declaring the component.`;
      }
    }

    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        mapping,
        sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.MISSING_PIPE),
        errorMsg,
      ),
    );
    this.recordedPipes.add(ast);
  }

  deferredPipeUsedEagerly(id: TypeCheckId, ast: BindingPipe): void {
    if (this.recordedPipes.has(ast)) {
      return;
    }

    const mapping = this.resolver.getTemplateSourceMapping(id);
    const errorMsg =
      `Pipe '${ast.name}' was imported  via \`@Component.deferredImports\`, ` +
      `but was used outside of a \`@defer\` block in a template. To fix this, either ` +
      `use the '${ast.name}' pipe inside of a \`@defer\` block or import this dependency ` +
      `using the \`@Component.imports\` field.`;

    const sourceSpan = this.resolver.toTemplateParseSourceSpan(id, ast.nameSpan);
    if (sourceSpan === null) {
      throw new Error(
        `Assertion failure: no SourceLocation found for usage of pipe '${ast.name}'.`,
      );
    }
    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        mapping,
        sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.DEFERRED_PIPE_USED_EAGERLY),
        errorMsg,
      ),
    );
    this.recordedPipes.add(ast);
  }

  deferredComponentUsedEagerly(id: TypeCheckId, element: TmplAstElement): void {
    const mapping = this.resolver.getTemplateSourceMapping(id);
    const errorMsg =
      `Element '${element.name}' contains a component or a directive that ` +
      `was imported  via \`@Component.deferredImports\`, but the element itself is located ` +
      `outside of a \`@defer\` block in a template. To fix this, either ` +
      `use the '${element.name}' element inside of a \`@defer\` block or ` +
      `import referenced component/directive dependency using the \`@Component.imports\` field.`;

    const {start, end} = element.startSourceSpan;
    const absoluteSourceSpan = new AbsoluteSourceSpan(start.offset, end.offset);
    const sourceSpan = this.resolver.toTemplateParseSourceSpan(id, absoluteSourceSpan);
    if (sourceSpan === null) {
      throw new Error(
        `Assertion failure: no SourceLocation found for usage of pipe '${element.name}'.`,
      );
    }
    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        mapping,
        sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.DEFERRED_DIRECTIVE_USED_EAGERLY),
        errorMsg,
      ),
    );
  }

  duplicateTemplateVar(
    id: TypeCheckId,
    variable: TmplAstVariable,
    firstDecl: TmplAstVariable,
  ): void {
    const mapping = this.resolver.getTemplateSourceMapping(id);
    const errorMsg = `Cannot redeclare variable '${variable.name}' as it was previously declared elsewhere for the same template.`;

    // The allocation of the error here is pretty useless for variables declared in microsyntax,
    // since the sourceSpan refers to the entire microsyntax property, not a span for the specific
    // variable in question.
    //
    // TODO(alxhub): allocate to a tighter span once one is available.
    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        mapping,
        variable.sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.DUPLICATE_VARIABLE_DECLARATION),
        errorMsg,
        [
          {
            text: `The variable '${firstDecl.name}' was first declared here.`,
            start: firstDecl.sourceSpan.start.offset,
            end: firstDecl.sourceSpan.end.offset,
            sourceFile: mapping.node.getSourceFile(),
          },
        ],
      ),
    );
  }

  requiresInlineTcb(id: TypeCheckId, node: ClassDeclaration): void {
    this._diagnostics.push(
      makeInlineDiagnostic(
        id,
        ErrorCode.INLINE_TCB_REQUIRED,
        node.name,
        `This component requires inline template type-checking, which is not supported by the current environment.`,
      ),
    );
  }

  requiresInlineTypeConstructors(
    id: TypeCheckId,
    node: ClassDeclaration,
    directives: ClassDeclaration[],
  ): void {
    let message: string;
    if (directives.length > 1) {
      message = `This component uses directives which require inline type constructors, which are not supported by the current environment.`;
    } else {
      message = `This component uses a directive which requires an inline type constructor, which is not supported by the current environment.`;
    }

    this._diagnostics.push(
      makeInlineDiagnostic(
        id,
        ErrorCode.INLINE_TYPE_CTOR_REQUIRED,
        node.name,
        message,
        directives.map((dir) =>
          makeRelatedInformation(dir.name, `Requires an inline type constructor.`),
        ),
      ),
    );
  }

  suboptimalTypeInference(id: TypeCheckId, variables: TmplAstVariable[]): void {
    const mapping = this.resolver.getTemplateSourceMapping(id);

    // Select one of the template variables that's most suitable for reporting the diagnostic. Any
    // variable will do, but prefer one bound to the context's $implicit if present.
    let diagnosticVar: TmplAstVariable | null = null;
    for (const variable of variables) {
      if (diagnosticVar === null || variable.value === '' || variable.value === '$implicit') {
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
    const message = `This structural directive supports advanced type inference, but the current compiler configuration prevents its usage. The variable ${varIdentification} will have type 'any' as a result.\n\nConsider enabling the 'strictTemplates' option in your tsconfig.json for better type inference within this template.`;

    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        mapping,
        diagnosticVar.keySpan,
        ts.DiagnosticCategory.Suggestion,
        ngErrorCode(ErrorCode.SUGGEST_SUBOPTIMAL_TYPE_INFERENCE),
        message,
      ),
    );
  }

  splitTwoWayBinding(
    id: TypeCheckId,
    input: TmplAstBoundAttribute,
    output: TmplAstBoundEvent,
    inputConsumer: ClassDeclaration,
    outputConsumer: ClassDeclaration | TmplAstElement,
  ): void {
    const mapping = this.resolver.getTemplateSourceMapping(id);
    const errorMsg = `The property and event halves of the two-way binding '${input.name}' are not bound to the same target.
            Find more at https://angular.dev/guide/templates/two-way-binding#how-two-way-binding-works`;

    const relatedMessages: {text: string; start: number; end: number; sourceFile: ts.SourceFile}[] =
      [];

    relatedMessages.push({
      text: `The property half of the binding is to the '${inputConsumer.name.text}' component.`,
      start: inputConsumer.name.getStart(),
      end: inputConsumer.name.getEnd(),
      sourceFile: inputConsumer.name.getSourceFile(),
    });

    if (outputConsumer instanceof TmplAstElement) {
      let message = `The event half of the binding is to a native event called '${input.name}' on the <${outputConsumer.name}> DOM element.`;
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

    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        mapping,
        input.keySpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.SPLIT_TWO_WAY_BINDING),
        errorMsg,
        relatedMessages,
      ),
    );
  }

  missingRequiredInputs(
    id: TypeCheckId,
    element: TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective,
    directiveName: string,
    isComponent: boolean,
    inputAliases: string[],
  ): void {
    const message = `Required input${inputAliases.length === 1 ? '' : 's'} ${inputAliases
      .map((n) => `'${n}'`)
      .join(', ')} from ${
      isComponent ? 'component' : 'directive'
    } ${directiveName} must be specified.`;

    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        this.resolver.getTemplateSourceMapping(id),
        element.startSourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.MISSING_REQUIRED_INPUTS),
        message,
      ),
    );
  }

  illegalForLoopTrackAccess(
    id: TypeCheckId,
    block: TmplAstForLoopBlock,
    access: PropertyRead,
  ): void {
    const sourceSpan = this.resolver.toTemplateParseSourceSpan(id, access.sourceSpan);
    if (sourceSpan === null) {
      throw new Error(`Assertion failure: no SourceLocation found for property read.`);
    }

    const messageVars = [block.item, ...block.contextVariables.filter((v) => v.value === '$index')]
      .map((v) => `'${v.name}'`)
      .join(', ');
    const message =
      `Cannot access '${access.name}' inside of a track expression. ` +
      `Only ${messageVars} and properties on the containing component are available to this expression.`;

    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        this.resolver.getTemplateSourceMapping(id),
        sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.ILLEGAL_FOR_LOOP_TRACK_ACCESS),
        message,
      ),
    );
  }

  inaccessibleDeferredTriggerElement(
    id: TypeCheckId,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ): void {
    let message: string;

    if (trigger.reference === null) {
      message =
        `Trigger cannot find reference. Make sure that the @defer block has a ` +
        `@placeholder with at least one root element node.`;
    } else {
      message =
        `Trigger cannot find reference "${trigger.reference}".\nCheck that an element with #${trigger.reference} exists in the same template and it's accessible from the ` +
        `@defer block.\nDeferred blocks can only access triggers in same view, a parent ` +
        `embedded view or the root view of the @placeholder block.`;
    }

    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        this.resolver.getTemplateSourceMapping(id),
        trigger.sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.INACCESSIBLE_DEFERRED_TRIGGER_ELEMENT),
        message,
      ),
    );
  }

  controlFlowPreventingContentProjection(
    id: TypeCheckId,
    category: ts.DiagnosticCategory,
    projectionNode: TmplAstElement | TmplAstTemplate,
    componentName: string,
    slotSelector: string,
    controlFlowNode:
      | TmplAstIfBlockBranch
      | TmplAstSwitchBlockCase
      | TmplAstForLoopBlock
      | TmplAstForLoopBlockEmpty,
    preservesWhitespaces: boolean,
  ): void {
    const blockName = controlFlowNode.nameSpan.toString().trim();
    const lines = [
      `Node matches the "${slotSelector}" slot of the "${componentName}" component, but will not be projected into the specific slot because the surrounding ${blockName} has more than one node at its root. To project the node in the right slot, you can:\n`,
      `1. Wrap the content of the ${blockName} block in an <ng-container/> that matches the "${slotSelector}" selector.`,
      `2. Split the content of the ${blockName} block across multiple ${blockName} blocks such that each one only has a single projectable node at its root.`,
      `3. Remove all content from the ${blockName} block, except for the node being projected.`,
    ];

    if (preservesWhitespaces) {
      lines.push(
        'Note: the host component has `preserveWhitespaces: true` which may ' +
          'cause whitespace to affect content projection.',
      );
    }

    lines.push(
      '',
      'This check can be disabled using the `extendedDiagnostics.checks.' +
        'controlFlowPreventingContentProjection = "suppress" compiler option.`',
    );

    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        this.resolver.getTemplateSourceMapping(id),
        projectionNode.startSourceSpan,
        category,
        ngErrorCode(ErrorCode.CONTROL_FLOW_PREVENTING_CONTENT_PROJECTION),
        lines.join('\n'),
      ),
    );
  }

  illegalWriteToLetDeclaration(id: TypeCheckId, node: AST, target: TmplAstLetDeclaration): void {
    const sourceSpan = this.resolver.toTemplateParseSourceSpan(id, node.sourceSpan);
    if (sourceSpan === null) {
      throw new Error(`Assertion failure: no SourceLocation found for property write.`);
    }

    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        this.resolver.getTemplateSourceMapping(id),
        sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.ILLEGAL_LET_WRITE),
        `Cannot assign to @let declaration '${target.name}'.`,
      ),
    );
  }

  letUsedBeforeDefinition(
    id: TypeCheckId,
    node: PropertyRead,
    target: TmplAstLetDeclaration,
  ): void {
    const sourceSpan = this.resolver.toTemplateParseSourceSpan(id, node.sourceSpan);
    if (sourceSpan === null) {
      throw new Error(`Assertion failure: no SourceLocation found for property read.`);
    }

    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        this.resolver.getTemplateSourceMapping(id),
        sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.LET_USED_BEFORE_DEFINITION),
        `Cannot read @let declaration '${target.name}' before it has been defined.`,
      ),
    );
  }

  conflictingDeclaration(id: TypeCheckId, decl: TmplAstLetDeclaration): void {
    const mapping = this.resolver.getTemplateSourceMapping(id);
    const errorMsg = `Cannot declare @let called '${decl.name}' as there is another symbol in the template with the same name.`;

    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        mapping,
        decl.sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.CONFLICTING_LET_DECLARATION),
        errorMsg,
      ),
    );
  }

  missingNamedTemplateDependency(id: TypeCheckId, node: TmplAstComponent | TmplAstDirective): void {
    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        this.resolver.getTemplateSourceMapping(id),
        node.startSourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.MISSING_NAMED_TEMPLATE_DEPENDENCY),
        // Wording is meant to mimic the wording TS uses in their diagnostic for missing symbols.
        `Cannot find name "${node instanceof TmplAstDirective ? node.name : node.componentName}". ` +
          `Selectorless references are only supported to classes or non-type import statements.`,
      ),
    );
  }

  incorrectTemplateDependencyType(
    id: TypeCheckId,
    node: TmplAstComponent | TmplAstDirective,
  ): void {
    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        this.resolver.getTemplateSourceMapping(id),
        node.startSourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.INCORRECT_NAMED_TEMPLATE_DEPENDENCY_TYPE),
        `Incorrect reference type. Type must be a standalone ${node instanceof TmplAstComponent ? '@Component' : '@Directive'}.`,
      ),
    );
  }

  unclaimedDirectiveBinding(
    id: TypeCheckId,
    directive: TmplAstDirective,
    node: TmplAstBoundAttribute | TmplAstTextAttribute | TmplAstBoundEvent,
  ): void {
    const errorMsg =
      `Directive ${directive.name} does not have an ` +
      `${node instanceof TmplAstBoundEvent ? 'output' : 'input'} named "${node.name}". ` +
      `Bindings to directives must target existing inputs or outputs.`;

    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        this.resolver.getTemplateSourceMapping(id),
        node.keySpan || node.sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.UNCLAIMED_DIRECTIVE_BINDING),
        errorMsg,
      ),
    );
  }

  deferImplicitTriggerMissingPlaceholder(
    id: TypeCheckId,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ): void {
    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        this.resolver.getTemplateSourceMapping(id),
        trigger.sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.DEFER_IMPLICIT_TRIGGER_MISSING_PLACEHOLDER),
        'Trigger with no parameters can only be placed on an @defer that has a @placeholder block',
      ),
    );
  }

  deferImplicitTriggerInvalidPlaceholder(
    id: TypeCheckId,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ): void {
    this._diagnostics.push(
      makeTemplateDiagnostic(
        id,
        this.resolver.getTemplateSourceMapping(id),
        trigger.sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.DEFER_IMPLICIT_TRIGGER_INVALID_PLACEHOLDER),
        'Trigger with no parameters can only be placed on an @defer that has a ' +
          '@placeholder block with exactly one root element node',
      ),
    );
  }
}

function makeInlineDiagnostic(
  id: TypeCheckId,
  code: ErrorCode.INLINE_TCB_REQUIRED | ErrorCode.INLINE_TYPE_CTOR_REQUIRED,
  node: ts.Node,
  messageText: string | ts.DiagnosticMessageChain,
  relatedInformation?: ts.DiagnosticRelatedInformation[],
): TemplateDiagnostic {
  return {
    ...makeDiagnostic(code, node, messageText, relatedInformation),
    sourceFile: node.getSourceFile(),
    typeCheckId: id,
  };
}
