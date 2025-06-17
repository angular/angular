/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {SymbolKind, TemplateTypeChecker} from '@angular/compiler-cli';
import {
  AST,
  Binary,
  BindingType,
  Conditional,
  ImplicitReceiver,
  LiteralMap,
  ParsedEventType,
  PropertyRead,
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
} from '@angular/compiler';
import {lookupPropertyAccess} from '../../../../../utils/tsurge/helpers/ast/lookup_property_access';
import {ClassFieldDescriptor, KnownFields} from './known_fields';

/**
 * Interface describing a reference to an input from within
 * an Angular template, or host binding "template expression".
 */
export interface TmplInputExpressionReference<ExprContext, D extends ClassFieldDescriptor> {
  targetNode: ts.Node;
  targetField: D;
  read: PropertyRead;
  readAstPath: AST[];
  context: ExprContext;
  isObjectShorthandExpression: boolean;
  isLikelyNarrowed: boolean;
  isWrite: boolean;
}

/**
 * AST visitor that iterates through a template and finds all
 * input references.
 *
 * This resolution is important to be able to migrate references to inputs
 * that will be migrated to signal inputs.
 */
export class TemplateReferenceVisitor<
  D extends ClassFieldDescriptor,
> extends TmplAstRecursiveVisitor {
  result: TmplInputExpressionReference<TmplAstNode, D>[] = [];

  /**
   * Whether we are currently descending into HTML AST nodes
   * where all bound attributes are considered potentially narrowing.
   *
   * Keeps track of all referenced inputs in such attribute expressions.
   */
  private templateAttributeReferencedFields: TmplInputExpressionReference<TmplAstNode, D>[] | null =
    null;

  private expressionVisitor: TemplateExpressionReferenceVisitor<TmplAstNode, D>;
  private seenKnownFieldsCount = new Map<D['key'], number>();

  constructor(
    typeChecker: ts.TypeChecker,
    templateTypeChecker: TemplateTypeChecker,
    componentClass: ts.ClassDeclaration,
    knownFields: KnownFields<D>,
    fieldNamesToConsiderForReferenceLookup: Set<string> | null,
  ) {
    super();
    this.expressionVisitor = new TemplateExpressionReferenceVisitor(
      typeChecker,
      templateTypeChecker,
      componentClass,
      knownFields,
      fieldNamesToConsiderForReferenceLookup,
    );
  }

  private checkExpressionForReferencedFields(activeNode: TmplAstNode, expressionNode: AST) {
    const referencedFields = this.expressionVisitor.checkTemplateExpression(
      activeNode,
      expressionNode,
    );
    // Add all references to the overall visitor result.
    this.result.push(...referencedFields);

    // Count usages of seen input references. We'll use this to make decisions
    // based on whether inputs are potentially narrowed or not.
    for (const input of referencedFields) {
      this.seenKnownFieldsCount.set(
        input.targetField.key,
        (this.seenKnownFieldsCount.get(input.targetField.key) ?? 0) + 1,
      );
    }

    return referencedFields;
  }

  private descendAndCheckForNarrowedSimilarReferences(
    potentiallyNarrowedInputs: TmplInputExpressionReference<TmplAstNode, D>[],
    descend: () => void,
  ) {
    const inputs = potentiallyNarrowedInputs.map((i) => ({
      ref: i,
      key: i.targetField.key,
      pastCount: this.seenKnownFieldsCount.get(i.targetField.key) ?? 0,
    }));

    descend();

    for (const input of inputs) {
      // Input was referenced inside a narrowable spot, and is used in child nodes.
      // This is a sign for the input to be narrowed. Mark it as such.
      if ((this.seenKnownFieldsCount.get(input.key) ?? 0) > input.pastCount) {
        input.ref.isLikelyNarrowed = true;
      }
    }
  }

  override visitTemplate(template: TmplAstTemplate): void {
    // Note: We assume all bound expressions for templates may be subject
    // to TCB narrowing. This is relevant for now until we support narrowing
    // of signal calls in templates.
    // TODO: Remove with: https://github.com/angular/angular/pull/55456.
    this.templateAttributeReferencedFields = [];

    tmplAstVisitAll(this, template.attributes);
    tmplAstVisitAll(this, template.templateAttrs);

    // If we are dealing with a microsyntax template, do not check
    // inputs and outputs as those are already passed to the children.
    // Template attributes may contain relevant expressions though.
    if (template.tagName === 'ng-template') {
      tmplAstVisitAll(this, template.inputs);
      tmplAstVisitAll(this, template.outputs);
    }

    const referencedInputs = this.templateAttributeReferencedFields;
    this.templateAttributeReferencedFields = null;

    this.descendAndCheckForNarrowedSimilarReferences(referencedInputs, () => {
      tmplAstVisitAll(this, template.children);
      tmplAstVisitAll(this, template.references);
      tmplAstVisitAll(this, template.variables);
    });
  }

  override visitIfBlockBranch(block: TmplAstIfBlockBranch): void {
    if (block.expression) {
      const referencedFields = this.checkExpressionForReferencedFields(block, block.expression);
      this.descendAndCheckForNarrowedSimilarReferences(referencedFields, () => {
        super.visitIfBlockBranch(block);
      });
    } else {
      super.visitIfBlockBranch(block);
    }
  }

  override visitForLoopBlock(block: TmplAstForLoopBlock): void {
    this.checkExpressionForReferencedFields(block, block.expression);
    this.checkExpressionForReferencedFields(block, block.trackBy);
    super.visitForLoopBlock(block);
  }

  override visitSwitchBlock(block: TmplAstSwitchBlock): void {
    const referencedFields = this.checkExpressionForReferencedFields(block, block.expression);
    this.descendAndCheckForNarrowedSimilarReferences(referencedFields, () => {
      super.visitSwitchBlock(block);
    });
  }

  override visitSwitchBlockCase(block: TmplAstSwitchBlockCase): void {
    if (block.expression) {
      const referencedFields = this.checkExpressionForReferencedFields(block, block.expression);
      this.descendAndCheckForNarrowedSimilarReferences(referencedFields, () => {
        super.visitSwitchBlockCase(block);
      });
    } else {
      super.visitSwitchBlockCase(block);
    }
  }

  override visitDeferredBlock(deferred: TmplAstDeferredBlock): void {
    if (deferred.triggers.when) {
      this.checkExpressionForReferencedFields(deferred, deferred.triggers.when.value);
    }
    if (deferred.prefetchTriggers.when) {
      this.checkExpressionForReferencedFields(deferred, deferred.prefetchTriggers.when.value);
    }
    super.visitDeferredBlock(deferred);
  }

  override visitBoundText(text: TmplAstBoundText): void {
    this.checkExpressionForReferencedFields(text, text.value);
  }

  override visitBoundEvent(attribute: TmplAstBoundEvent): void {
    this.checkExpressionForReferencedFields(attribute, attribute.handler);
  }

  override visitBoundAttribute(attribute: TmplAstBoundAttribute): void {
    const referencedFields = this.checkExpressionForReferencedFields(attribute, attribute.value);

    // Attributes inside templates are potentially "narrowed" and hence we
    // keep track of all referenced inputs to see if they actually are.
    if (this.templateAttributeReferencedFields !== null) {
      this.templateAttributeReferencedFields.push(...referencedFields);
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
export class TemplateExpressionReferenceVisitor<
  ExprContext,
  D extends ClassFieldDescriptor,
> extends RecursiveAstVisitor {
  private activeTmplAstNode: ExprContext | null = null;
  private detectedInputReferences: TmplInputExpressionReference<ExprContext, D>[] = [];
  private isInsideObjectShorthandExpression = false;
  private insideConditionalExpressionsWithReads: AST[] = [];

  constructor(
    private typeChecker: ts.TypeChecker,
    private templateTypeChecker: TemplateTypeChecker | null,
    private componentClass: ts.ClassDeclaration,
    private knownFields: KnownFields<D>,
    private fieldNamesToConsiderForReferenceLookup: Set<string> | null,
  ) {
    super();
  }

  /** Checks the given AST expression. */
  checkTemplateExpression(
    activeNode: ExprContext,
    expressionNode: AST,
  ): TmplInputExpressionReference<ExprContext, D>[] {
    this.detectedInputReferences = [];
    this.activeTmplAstNode = activeNode;

    expressionNode.visit(this, []);
    return this.detectedInputReferences;
  }

  override visit(ast: AST, context: AST[]) {
    super.visit(ast, [...context, ast]);
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
  }

  override visitPropertyRead(ast: PropertyRead, context: AST[]) {
    this._inspectPropertyAccess(ast, false, context);
    super.visitPropertyRead(ast, context);
  }
  override visitSafePropertyRead(ast: SafePropertyRead, context: AST[]) {
    this._inspectPropertyAccess(ast, false, context);
    super.visitPropertyRead(ast, context);
  }

  override visitBinary(ast: Binary, context: AST[]) {
    if (ast.operation === '=' && ast.left instanceof PropertyRead) {
      this._inspectPropertyAccess(ast.left, true, [...context, ast, ast.left]);
    } else {
      super.visitBinary(ast, context);
    }
  }

  override visitConditional(ast: Conditional, context: AST[]) {
    this.visit(ast.condition, context);
    this.insideConditionalExpressionsWithReads.push(ast.condition);
    this.visit(ast.trueExp, context);
    this.visit(ast.falseExp, context);
    this.insideConditionalExpressionsWithReads.pop();
  }

  /**
   * Inspects the property access and attempts to resolve whether they access
   * a known field. If so, the result is captured.
   */
  private _inspectPropertyAccess(ast: PropertyRead, isAssignment: boolean, astPath: AST[]) {
    if (
      this.fieldNamesToConsiderForReferenceLookup !== null &&
      !this.fieldNamesToConsiderForReferenceLookup.has(ast.name)
    ) {
      return;
    }

    const isWrite = !!(
      isAssignment ||
      (this.activeTmplAstNode && isTwoWayBindingNode(this.activeTmplAstNode))
    );

    this._checkAccessViaTemplateTypeCheckBlock(ast, isWrite, astPath) ||
      this._checkAccessViaOwningComponentClassType(ast, isWrite, astPath);
  }

  /**
   * Checks whether the node refers to an input using the TCB information.
   * Type check block may not exist for e.g. test components, so this can return `null`.
   */
  private _checkAccessViaTemplateTypeCheckBlock(
    ast: PropertyRead,
    isWrite: boolean,
    astPath: AST[],
  ): boolean {
    // There might be no template type checker. E.g. if we check host bindings.
    if (this.templateTypeChecker === null) {
      return false;
    }

    const symbol = this.templateTypeChecker.getSymbolOfNode(ast, this.componentClass);
    if (symbol?.kind !== SymbolKind.Expression || symbol.tsSymbol === null) {
      return false;
    }

    // Dangerous: Type checking symbol retrieval is a totally different `ts.Program`,
    // than the one where we analyzed `knownInputs`.
    // --> Find the input via its input id.
    const targetInput = this.knownFields.attemptRetrieveDescriptorFromSymbol(symbol.tsSymbol);

    if (targetInput === null) {
      return false;
    }

    this.detectedInputReferences.push({
      targetNode: targetInput.node,
      targetField: targetInput,
      read: ast,
      readAstPath: astPath,
      context: this.activeTmplAstNode!,
      isLikelyNarrowed: this._isPartOfNarrowingTernary(ast),
      isObjectShorthandExpression: this.isInsideObjectShorthandExpression,
      isWrite,
    });

    return true;
  }

  /**
   * Simple resolution checking whether the given AST refers to a known input.
   * This is a fallback for when there is no type checking information (e.g. in host bindings).
   *
   * It attempts to resolve references by traversing accesses of the "component class" type.
   * e.g. `this.bla` is resolved via `CompType#bla` and further.
   */
  private _checkAccessViaOwningComponentClassType(
    ast: PropertyRead,
    isWrite: boolean,
    astPath: AST[],
  ): void {
    // We might check host bindings, which can never point to template variables or local refs.
    const expressionTemplateTarget =
      this.templateTypeChecker === null
        ? null
        : this.templateTypeChecker.getExpressionTarget(ast, this.componentClass);

    // Skip checking if:
    // - the reference resolves to a template variable or local ref. No way to resolve without TCB.
    // - the owning component does not have a name (should not happen technically).
    if (expressionTemplateTarget !== null || this.componentClass.name === undefined) {
      return;
    }

    const property = traverseReceiverAndLookupSymbol(
      ast,
      this.componentClass as ts.ClassDeclaration & {name: ts.Identifier},
      this.typeChecker,
    );
    if (property === null) {
      return;
    }

    const matchingTarget = this.knownFields.attemptRetrieveDescriptorFromSymbol(property);
    if (matchingTarget === null) {
      return;
    }

    this.detectedInputReferences.push({
      targetNode: matchingTarget.node,
      targetField: matchingTarget,
      read: ast,
      readAstPath: astPath,
      context: this.activeTmplAstNode!,
      isLikelyNarrowed: this._isPartOfNarrowingTernary(ast),
      isObjectShorthandExpression: this.isInsideObjectShorthandExpression,
      isWrite,
    });
  }

  private _isPartOfNarrowingTernary(read: PropertyRead) {
    // Note: We do not safe check that the reads are fully matching 1:1. This is acceptable
    // as worst case we just skip an input from being migrated. This is very unlikely too.
    return this.insideConditionalExpressionsWithReads.some(
      (r): r is PropertyRead | SafePropertyRead =>
        (r instanceof PropertyRead || r instanceof SafePropertyRead) && r.name === read.name,
    );
  }
}

/**
 * Emulates an access to a given field using the TypeScript `ts.Type`
 * of the given class. The resolved symbol of the access is returned.
 */
function traverseReceiverAndLookupSymbol(
  readOrWrite: PropertyRead,
  componentClass: ts.ClassDeclaration & {name: ts.Identifier},
  checker: ts.TypeChecker,
) {
  const path: string[] = [readOrWrite.name];
  let node = readOrWrite;
  while (node.receiver instanceof PropertyRead) {
    node = node.receiver;
    path.unshift(node.name);
  }

  if (!(node.receiver instanceof ImplicitReceiver || node.receiver instanceof ThisReceiver)) {
    return null;
  }

  const classType = checker.getTypeAtLocation(componentClass.name);
  return (
    lookupPropertyAccess(checker, classType, path, {
      // Necessary to avoid breaking the resolution if there is
      // some narrowing involved. E.g. `myClass ? myClass.input`.
      ignoreNullability: true,
    })?.symbol ?? null
  );
}

/** Whether the given node refers to a two-way binding AST node. */
function isTwoWayBindingNode(node: unknown): boolean {
  return (
    (node instanceof TmplAstBoundAttribute && node.type === BindingType.TwoWay) ||
    (node instanceof TmplAstBoundEvent && node.type === ParsedEventType.TwoWay)
  );
}
