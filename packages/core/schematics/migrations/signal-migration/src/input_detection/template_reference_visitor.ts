/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {
  AST,
  BindingType,
  ImplicitReceiver,
  LiteralMap,
  ParsedEventType,
  PropertyRead,
  PropertyWrite,
  RecursiveAstVisitor,
  SafePropertyRead,
  ThisReceiver,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstBoundText,
  TmplAstDeferredBlock,
  TmplAstForLoopBlock,
  TmplAstIfBlockBranch,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
  TmplAstTemplate,
  tmplAstVisitAll,
} from '../../../../../../compiler';
import {
  SymbolKind,
  TemplateTypeChecker,
} from '../../../../../../compiler-cli/src/ngtsc/typecheck/api';
import {KnownInputs} from './known_inputs';
import {attemptRetrieveInputFromSymbol} from './nodes_to_input';
import {MigrationHost} from '../migration_host';
import {InputDescriptor, InputUniqueKey} from '../utils/input_id';
import {InputIncompatibilityReason} from './incompatibility';
import {BoundAttribute, BoundEvent} from '../../../../../../compiler/src/render3/r3_ast';

/**
 * Interface describing a reference to an input from within
 * an Angular template, or host binding "template expression".
 */
export interface TmplInputExpressionReference<ExprContext> {
  target: ts.Node;
  targetInput: InputDescriptor;
  read: PropertyRead;
  context: ExprContext;
  isObjectShorthandExpression: boolean;
  isLikelyNarrowed: boolean;
}

/**
 * AST visitor that iterates through a template and finds all
 * input references.
 *
 * This resolution is important to be able to migrate references to inputs
 * that will be migrated to signal inputs.
 */
export class TemplateReferenceVisitor extends TmplAstRecursiveVisitor {
  result: TmplInputExpressionReference<TmplAstNode>[] = [];

  /**
   * Whether we are currently descending into HTML AST nodes
   * where all bound attributes are considered potentially narrowing.
   *
   * Keeps track of all referenced inputs in such attribute expressions.
   */
  private templateAttributeReferencedInputs: TmplInputExpressionReference<TmplAstNode>[] | null =
    null;

  private expressionVisitor: TemplateExpressionReferenceVisitor<TmplAstNode>;
  private seenInputsCount = new Map<InputUniqueKey, number>();

  constructor(
    host: MigrationHost,
    typeChecker: ts.TypeChecker,
    templateTypeChecker: TemplateTypeChecker,
    componentClass: ts.ClassDeclaration,
    knownInputs: KnownInputs,
  ) {
    super();
    this.expressionVisitor = new TemplateExpressionReferenceVisitor(
      host,
      typeChecker,
      templateTypeChecker,
      componentClass,
      knownInputs,
    );
  }

  private checkExpressionForReferencedInputs(activeNode: TmplAstNode, expressionNode: AST) {
    const referencedInputs = this.expressionVisitor.checkTemplateExpression(
      activeNode,
      expressionNode,
    );
    // Add all references to the overall visitor result.
    this.result.push(...referencedInputs);

    // Count usages of seen input references. We'll use this to make decisions
    // based on whether inputs are potentially narrowed or not.
    for (const input of referencedInputs) {
      this.seenInputsCount.set(
        input.targetInput.key,
        (this.seenInputsCount.get(input.targetInput.key) ?? 0) + 1,
      );
    }

    return referencedInputs;
  }

  private descendAndCheckForNarrowedSimilarReferences(
    potentiallyNarrowedInputs: TmplInputExpressionReference<TmplAstNode>[],
    descend: () => void,
  ) {
    const inputs = potentiallyNarrowedInputs.map((i) => ({
      ref: i,
      key: i.targetInput.key,
      pastCount: this.seenInputsCount.get(i.targetInput.key) ?? 0,
    }));

    descend();

    for (const input of inputs) {
      // Input was referenced inside a narrowable spot, and is used in child nodes.
      // This is a sign for the input to be narrowed. Mark it as such.
      if ((this.seenInputsCount.get(input.key) ?? 0) > input.pastCount) {
        input.ref.isLikelyNarrowed = true;
      }
    }
  }

  override visitTemplate(template: TmplAstTemplate): void {
    // Note: We assume all bound expressions for templates may be subject
    // to TCB narrowing. This is relevant for now until we support narrowing
    // of signal calls in templates.
    // TODO: Remove with: https://github.com/angular/angular/pull/55456.
    this.templateAttributeReferencedInputs = [];

    tmplAstVisitAll(this, template.attributes);
    tmplAstVisitAll(this, template.templateAttrs);

    // If we are dealing with a microsyntax template, do not check
    // inputs and outputs as those are already passed to the children.
    // Template attributes may contain relevant expressions though.
    if (template.tagName === 'ng-template') {
      tmplAstVisitAll(this, template.inputs);
      tmplAstVisitAll(this, template.outputs);
    }

    const referencedInputs = this.templateAttributeReferencedInputs;
    this.templateAttributeReferencedInputs = null;

    this.descendAndCheckForNarrowedSimilarReferences(referencedInputs, () => {
      tmplAstVisitAll(this, template.children);
      tmplAstVisitAll(this, template.references);
      tmplAstVisitAll(this, template.variables);
    });
  }

  override visitIfBlockBranch(block: TmplAstIfBlockBranch): void {
    if (block.expression) {
      const referencedInputs = this.checkExpressionForReferencedInputs(block, block.expression);
      this.descendAndCheckForNarrowedSimilarReferences(referencedInputs, () => {
        super.visitIfBlockBranch(block);
      });
    } else {
      super.visitIfBlockBranch(block);
    }
  }

  override visitForLoopBlock(block: TmplAstForLoopBlock): void {
    this.checkExpressionForReferencedInputs(block, block.expression);
    this.checkExpressionForReferencedInputs(block, block.trackBy);
    super.visitForLoopBlock(block);
  }

  override visitSwitchBlock(block: TmplAstSwitchBlock): void {
    const referencedInputs = this.checkExpressionForReferencedInputs(block, block.expression);
    this.descendAndCheckForNarrowedSimilarReferences(referencedInputs, () => {
      super.visitSwitchBlock(block);
    });
  }

  override visitSwitchBlockCase(block: TmplAstSwitchBlockCase): void {
    if (block.expression) {
      const referencedInputs = this.checkExpressionForReferencedInputs(block, block.expression);
      this.descendAndCheckForNarrowedSimilarReferences(referencedInputs, () => {
        super.visitSwitchBlockCase(block);
      });
    } else {
      super.visitSwitchBlockCase(block);
    }
  }

  override visitDeferredBlock(deferred: TmplAstDeferredBlock): void {
    if (deferred.triggers.when) {
      this.checkExpressionForReferencedInputs(deferred, deferred.triggers.when.value);
    }
    if (deferred.prefetchTriggers.when) {
      this.checkExpressionForReferencedInputs(deferred, deferred.prefetchTriggers.when.value);
    }
    super.visitDeferredBlock(deferred);
  }

  override visitBoundText(text: TmplAstBoundText): void {
    this.checkExpressionForReferencedInputs(text, text.value);
  }

  override visitBoundEvent(attribute: TmplAstBoundEvent): void {
    this.checkExpressionForReferencedInputs(attribute, attribute.handler);
  }

  override visitBoundAttribute(attribute: TmplAstBoundAttribute): void {
    const referencedInputs = this.checkExpressionForReferencedInputs(attribute, attribute.value);

    // Attributes inside templates are potentially "narrowed" and hence we
    // keep track of all referenced inputs to see if they actually are.
    if (this.templateAttributeReferencedInputs !== null) {
      this.templateAttributeReferencedInputs.push(...referencedInputs);
    }
  }
}

/**
 * Expression AST visitor that checks whether a given expression references
 * a known `@Input()`.
 *
 * This resolution is important to be able to migrate references to inputs
 * that will be migrated to signal inputs.
 */
export class TemplateExpressionReferenceVisitor<ExprContext> extends RecursiveAstVisitor {
  private activeTmplAstNode: ExprContext | null = null;
  private detectedInputReferences: TmplInputExpressionReference<ExprContext>[] = [];

  private isInsideObjectShorthandExpression = false;

  constructor(
    private host: MigrationHost,
    private typeChecker: ts.TypeChecker,
    private templateTypeChecker: TemplateTypeChecker | null,
    private componentClass: ts.ClassDeclaration,
    private knownInputs: KnownInputs,
  ) {
    super();
  }

  /** Checks the given AST expression. */
  checkTemplateExpression(
    activeNode: ExprContext,
    expressionNode: AST,
  ): TmplInputExpressionReference<ExprContext>[] {
    this.detectedInputReferences = [];
    this.activeTmplAstNode = activeNode;

    expressionNode.visit(this);
    return this.detectedInputReferences;
  }

  // Keep track when we are inside an object shorthand expression. This is
  // necessary as we need to expand the shorthand to invoke a potential new signal.
  // E.g. `{bla}` may be transformed to `{bla: bla()}`.
  override visitLiteralMap(ast: LiteralMap, context: any) {
    for (const [idx, key] of ast.keys.entries()) {
      this.isInsideObjectShorthandExpression = !!key.isShorthandInitialized;
      (ast.values[idx] as AST).visit(this, context);
      this.isInsideObjectShorthandExpression = false;
    }
    super.visitLiteralMap(ast, context);
  }

  override visitPropertyRead(ast: PropertyRead) {
    this._inspectPropertyAccess(ast);
    super.visitPropertyRead(ast, null);
  }
  override visitSafePropertyRead(ast: SafePropertyRead) {
    this._inspectPropertyAccess(ast);
    super.visitPropertyRead(ast, null);
  }

  override visitPropertyWrite(ast: PropertyWrite) {
    this._inspectPropertyAccess(ast);
    super.visitPropertyWrite(ast, null);
  }

  /**
   * Inspects the property access and attempts to resolve whether they access
   * a known decorator input. If so, the result is captured.
   */
  private _inspectPropertyAccess(ast: PropertyRead | PropertyWrite) {
    const matchingInputId =
      this._checkAccessViaTemplateTypeCheckBlock(ast) ??
      this._checkAccessViaOwningComponentClassType(ast);

    // If the input matched and is a write, mark it as incompatible.
    // An input may also be considered written if it's part of a two-way binding syntax.
    if (
      matchingInputId !== null &&
      (ast instanceof PropertyWrite ||
        (this.activeTmplAstNode && isTwoWayBindingNode(this.activeTmplAstNode)))
    ) {
      this.knownInputs.markInputAsIncompatible(matchingInputId, {
        context: null,
        reason: InputIncompatibilityReason.WriteAssignment,
      });
    }
  }

  /**
   * Checks whether the node refers to an input using the TCB information.
   * Type check block may not exist for e.g. test components, so this can return `null`.
   */
  private _checkAccessViaTemplateTypeCheckBlock(
    ast: PropertyRead | PropertyWrite,
  ): InputDescriptor | null {
    // There might be no template type checker. E.g. if we check host bindings.
    if (this.templateTypeChecker === null) {
      return null;
    }

    const symbol = this.templateTypeChecker.getSymbolOfNode(ast, this.componentClass);
    if (symbol?.kind !== SymbolKind.Expression || symbol.tsSymbol === null) {
      return null;
    }

    // Dangerous: Type checking symbol retrieval is a totally different `ts.Program`,
    // than the one where we analyzed `knownInputs`.
    // --> Find the input via its input id.
    const targetInput = attemptRetrieveInputFromSymbol(
      this.host,
      symbol.tsSymbol,
      this.knownInputs,
    );

    if (targetInput === null) {
      return null;
    }

    this.detectedInputReferences.push({
      target: targetInput.descriptor.node,
      targetInput: targetInput.descriptor,
      read: ast,
      context: this.activeTmplAstNode!,
      isLikelyNarrowed: false,
      isObjectShorthandExpression: this.isInsideObjectShorthandExpression,
    });

    return targetInput.descriptor;
  }

  /**
   * Simple resolution checking whether the given AST refers to a known input.
   * This is a fallback for when there is no type checking information (e.g. in host bindings).
   *
   * It attempts to resolve references by traversing accesses of the "component class" type.
   * e.g. `this.bla` is resolved via `CompType#bla` and further.
   */
  private _checkAccessViaOwningComponentClassType(
    ast: PropertyRead | PropertyWrite,
  ): InputDescriptor | null {
    // We might check host bindings, which can never point to template variables or local refs.
    const target =
      this.templateTypeChecker === null
        ? null
        : this.templateTypeChecker.getExpressionTarget(ast, this.componentClass);

    // Skip checking if:
    // - the reference resolves to a template variable or local ref. No way to resolve without TCB.
    // - the owning component does not have a name (should not happen technically).
    if (target !== null || this.componentClass.name === undefined) {
      return null;
    }

    const property = traverseReceiverAndLookupSymbol(
      ast,
      this.componentClass as ts.ClassDeclaration & {name: ts.Identifier},
      this.typeChecker,
    );
    if (property === null) {
      return null;
    }

    const matchingTarget = attemptRetrieveInputFromSymbol(this.host, property, this.knownInputs);
    if (matchingTarget === null) {
      return null;
    }

    this.detectedInputReferences.push({
      target: matchingTarget.descriptor.node,
      targetInput: matchingTarget.descriptor,
      read: ast,
      context: this.activeTmplAstNode!,
      isLikelyNarrowed: false,
      isObjectShorthandExpression: this.isInsideObjectShorthandExpression,
    });
    return matchingTarget.descriptor;
  }
}

/**
 * Emulates an access to a given field using the TypeScript `ts.Type`
 * of the given class. The resolved symbol of the access is returned.
 */
function traverseReceiverAndLookupSymbol(
  readOrWrite: PropertyRead | PropertyWrite,
  componentClass: ts.ClassDeclaration & {name: ts.Identifier},
  checker: ts.TypeChecker,
) {
  const path: string[] = [readOrWrite.name];
  let node = readOrWrite;
  while (node.receiver instanceof PropertyRead || node.receiver instanceof PropertyWrite) {
    node = node.receiver;
    path.unshift(node.name);
  }

  if (!(node.receiver instanceof ImplicitReceiver || node.receiver instanceof ThisReceiver)) {
    return null;
  }

  let type = checker.getTypeAtLocation(componentClass.name);
  let symbol: ts.Symbol | null = null;

  for (const propName of path) {
    // Note: Always assume `NonNullable` for the path, when using the non-TCB lookups. This
    // is necessary to support e.g. ternary narrowing in host bindings. The assumption is that
    // an input is only accessed if its receivers are all non-nullable anyway.
    const propSymbol = type.getNonNullableType().getProperty(propName);
    if (propSymbol === undefined) {
      return null;
    }
    symbol = propSymbol;
    type = checker.getTypeOfSymbol(propSymbol);
  }

  return symbol;
}

/** Whether the given node refers to a two-way binding AST node. */
function isTwoWayBindingNode(node: unknown): boolean {
  return (
    (node instanceof BoundAttribute && node.type === BindingType.TwoWay) ||
    (node instanceof BoundEvent && node.type === ParsedEventType.TwoWay)
  );
}
