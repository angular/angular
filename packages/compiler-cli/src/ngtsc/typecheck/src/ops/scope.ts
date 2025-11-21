/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DirectiveOwner,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstBoundText,
  TmplAstComponent,
  TmplAstContent,
  TmplAstDeferredBlock,
  TmplAstDeferredBlockTriggers,
  TmplAstDirective,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstHostElement,
  TmplAstHoverDeferredTrigger,
  TmplAstIcu,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstInteractionDeferredTrigger,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstReference,
  TmplAstSwitchBlock,
  TmplAstTemplate,
  TmplAstText,
  TmplAstVariable,
  TmplAstViewportDeferredTrigger,
} from '@angular/compiler';
import ts from 'typescript';
import {TcbOp} from './base';
import {TypeCheckableDirectiveMeta} from '../../api';
import {Context} from './context';
import {TcbTemplateBodyOp, TcbTemplateContextOp} from './template';
import {TcbElementOp} from './element';
import {addParseSpanInfo} from '../diagnostics';
import {tcbExpression, TcbExpressionOp} from './expression';
import {TcbBlockImplicitVariableOp, TcbBlockVariableOp, TcbTemplateVariableOp} from './variables';
import {TcbComponentContextCompletionOp} from './completions';
import {LocalSymbol, TcbInvalidReferenceOp, TcbReferenceOp} from './references';
import {TcbIfOp} from './if_block';
import {TcbSwitchOp} from './switch_block';
import {TcbForOfOp} from './for_block';
import {TcbLetDeclarationOp} from './let';
import {TcbDirectiveInputsOp, TcbUnclaimedInputsOp} from './inputs';
import {TcbDomSchemaCheckerOp} from './schema';
import {TcbDirectiveOutputsOp, TcbUnclaimedOutputsOp} from './events';
import {
  CustomFieldType,
  getCustomFieldDirectiveType,
  isFieldDirective,
  isNativeField,
  TcbNativeFieldDirectiveTypeOp,
} from './signal_forms';
import {Reference} from '../../../imports';
import {ClassDeclaration} from '../../../reflection';
import {
  TcbGenericDirectiveTypeWithAnyParamsOp,
  TcbNonGenericDirectiveTypeOp,
} from './directive_type';
import {requiresInlineTypeCtor} from '../type_constructor';
import {TcbDirectiveCtorOp} from './directive_constructor';
import {TcbControlFlowContentProjectionOp} from './content_projection';
import {TcbComponentNodeOp} from './selectorless';
import {TcbIntersectionObserverOp} from './intersection_observer';
import {TcbHostElementOp} from './host';

/**
 * Local scope within the type check block for a particular template.
 *
 * The top-level template and each nested `<ng-template>` have their own `Scope`, which exist in a
 * hierarchy. The structure of this hierarchy mirrors the syntactic scopes in the generated type
 * check block, where each nested template is encased in an `if` structure.
 *
 * As a template's `TcbOp`s are executed in a given `Scope`, statements are added via
 * `addStatement()`. When this processing is complete, the `Scope` can be turned into a `ts.Block`
 * via `renderToBlock()`.
 *
 * If a `TcbOp` requires the output of another, it can call `resolve()`.
 */
export class Scope {
  /**
   * A queue of operations which need to be performed to generate the TCB code for this scope.
   *
   * This array can contain either a `TcbOp` which has yet to be executed, or a `ts.Expression|null`
   * representing the memoized result of executing the operation. As operations are executed, their
   * results are written into the `opQueue`, overwriting the original operation.
   *
   * If an operation is in the process of being executed, it is temporarily overwritten here with
   * `INFER_TYPE_FOR_CIRCULAR_OP_EXPR`. This way, if a cycle is encountered where an operation
   * depends transitively on its own result, the inner operation will infer the least narrow type
   * that fits instead. This has the same semantics as TypeScript itself when types are referenced
   * circularly.
   */
  private opQueue: (TcbOp | ts.Expression | null)[] = [];

  /**
   * A map of `TmplAstElement`s to the index of their `TcbElementOp` in the `opQueue`
   */
  private elementOpMap = new Map<TmplAstElement, number>();

  /**
   * A map of `TmplAstHostElement`s to the index of their `TcbHostElementOp` in the `opQueue`
   */
  private hostElementOpMap = new Map<TmplAstHostElement, number>();

  /**
   * A map of `TmplAstComponent`s to the index of their `TcbComponentNodeOp` in the `opQueue`
   */
  private componentNodeOpMap = new Map<TmplAstComponent, number>();

  /**
   * A map of maps which tracks the index of `TcbDirectiveCtorOp`s in the `opQueue` for each
   * directive on a `TmplAstElement` or `TmplAstTemplate` node.
   */
  private directiveOpMap = new Map<DirectiveOwner, Map<TypeCheckableDirectiveMeta, number>>();

  /**
   * A map of `TmplAstReference`s to the index of their `TcbReferenceOp` in the `opQueue`
   */
  private referenceOpMap = new Map<TmplAstReference, number>();

  /**
   * Map of immediately nested <ng-template>s (within this `Scope`) represented by `TmplAstTemplate`
   * nodes to the index of their `TcbTemplateContextOp`s in the `opQueue`.
   */
  private templateCtxOpMap = new Map<TmplAstTemplate, number>();

  /**
   * Map of variables declared on the template that created this `Scope` (represented by
   * `TmplAstVariable` nodes) to the index of their `TcbVariableOp`s in the `opQueue`, or to
   * pre-resolved variable identifiers.
   */
  private varMap = new Map<TmplAstVariable, number | ts.Identifier>();

  /**
   * A map of the names of `TmplAstLetDeclaration`s to the index of their op in the `opQueue`.
   *
   * Assumes that there won't be duplicated `@let` declarations within the same scope.
   */
  private letDeclOpMap = new Map<string, {opIndex: number; node: TmplAstLetDeclaration}>();

  /**
   * Statements for this template.
   *
   * Executing the `TcbOp`s in the `opQueue` populates this array.
   */
  private statements: ts.Statement[] = [];

  /**
   * Gets names of the for loop context variables and their types.
   */
  private static getForLoopContextVariableTypes() {
    return new Map<string, ts.KeywordTypeSyntaxKind>([
      ['$first', ts.SyntaxKind.BooleanKeyword],
      ['$last', ts.SyntaxKind.BooleanKeyword],
      ['$even', ts.SyntaxKind.BooleanKeyword],
      ['$odd', ts.SyntaxKind.BooleanKeyword],
      ['$index', ts.SyntaxKind.NumberKeyword],
      ['$count', ts.SyntaxKind.NumberKeyword],
    ]);
  }

  private constructor(
    private tcb: Context,
    private parent: Scope | null = null,
    private guard: ts.Expression | null = null,
  ) {}

  /**
   * Constructs a `Scope` given either a `TmplAstTemplate` or a list of `TmplAstNode`s.
   *
   * @param tcb the overall context of TCB generation.
   * @param parentScope the `Scope` of the parent template (if any) or `null` if this is the root
   * `Scope`.
   * @param scopedNode Node that provides the scope around the child nodes (e.g. a
   * `TmplAstTemplate` node exposing variables to its children).
   * @param children Child nodes that should be appended to the TCB.
   * @param guard an expression that is applied to this scope for type narrowing purposes.
   */
  static forNodes(
    tcb: Context,
    parentScope: Scope | null,
    scopedNode:
      | TmplAstTemplate
      | TmplAstIfBlockBranch
      | TmplAstForLoopBlock
      | TmplAstHostElement
      | null,
    children: TmplAstNode[] | null,
    guard: ts.Expression | null,
  ): Scope {
    const scope = new Scope(tcb, parentScope, guard);

    if (parentScope === null && tcb.env.config.enableTemplateTypeChecker) {
      // Add an autocompletion point for the component context.
      scope.opQueue.push(new TcbComponentContextCompletionOp(scope));
    }

    // If given an actual `TmplAstTemplate` instance, then process any additional information it
    // has.
    if (scopedNode instanceof TmplAstTemplate) {
      // The template's variable declarations need to be added as `TcbVariableOp`s.
      const varMap = new Map<string, TmplAstVariable>();

      for (const v of scopedNode.variables) {
        // Validate that variables on the `TmplAstTemplate` are only declared once.
        if (!varMap.has(v.name)) {
          varMap.set(v.name, v);
        } else {
          const firstDecl = varMap.get(v.name)!;
          tcb.oobRecorder.duplicateTemplateVar(tcb.id, v, firstDecl);
        }
        Scope.registerVariable(scope, v, new TcbTemplateVariableOp(tcb, scope, scopedNode, v));
      }
    } else if (scopedNode instanceof TmplAstIfBlockBranch) {
      const {expression, expressionAlias} = scopedNode;
      if (expression !== null && expressionAlias !== null) {
        Scope.registerVariable(
          scope,
          expressionAlias,
          new TcbBlockVariableOp(
            tcb,
            scope,
            tcbExpression(expression, tcb, scope),
            expressionAlias,
          ),
        );
      }
    } else if (scopedNode instanceof TmplAstForLoopBlock) {
      // Register the variable for the loop so it can be resolved by
      // children. It'll be declared once the loop is created.
      const loopInitializer = tcb.allocateId();
      addParseSpanInfo(loopInitializer, scopedNode.item.sourceSpan);
      scope.varMap.set(scopedNode.item, loopInitializer);

      const forLoopContextVariableTypes = Scope.getForLoopContextVariableTypes();

      for (const variable of scopedNode.contextVariables) {
        if (!forLoopContextVariableTypes.has(variable.value)) {
          throw new Error(`Unrecognized for loop context variable ${variable.name}`);
        }

        const type = ts.factory.createKeywordTypeNode(
          forLoopContextVariableTypes.get(variable.value)!,
        );
        Scope.registerVariable(
          scope,
          variable,
          new TcbBlockImplicitVariableOp(tcb, scope, type, variable),
        );
      }
    } else if (scopedNode instanceof TmplAstHostElement) {
      scope.appendNode(scopedNode);
    }
    if (children !== null) {
      for (const node of children) {
        scope.appendNode(node);
      }
    }
    // Once everything is registered, we need to check if there are `@let`
    // declarations that conflict with other local symbols defined after them.
    for (const variable of scope.varMap.keys()) {
      Scope.checkConflictingLet(scope, variable);
    }
    for (const ref of scope.referenceOpMap.keys()) {
      Scope.checkConflictingLet(scope, ref);
    }
    return scope;
  }

  /** Registers a local variable with a scope. */
  private static registerVariable(scope: Scope, variable: TmplAstVariable, op: TcbOp): void {
    const opIndex = scope.opQueue.push(op) - 1;
    scope.varMap.set(variable, opIndex);
  }

  /**
   * Look up a `ts.Expression` representing the value of some operation in the current `Scope`,
   * including any parent scope(s). This method always returns a mutable clone of the
   * `ts.Expression` with the comments cleared.
   *
   * @param node a `TmplAstNode` of the operation in question. The lookup performed will depend on
   * the type of this node:
   *
   * Assuming `directive` is not present, then `resolve` will return:
   *
   * * `TmplAstElement` - retrieve the expression for the element DOM node
   * * `TmplAstTemplate` - retrieve the template context variable
   * * `TmplAstVariable` - retrieve a template let- variable
   * * `TmplAstLetDeclaration` - retrieve a template `@let` declaration
   * * `TmplAstReference` - retrieve variable created for the local ref
   *
   * @param directive if present, a directive type on a `TmplAstElement` or `TmplAstTemplate` to
   * look up instead of the default for an element or template node.
   */
  resolve(
    node: LocalSymbol,
    directive?: TypeCheckableDirectiveMeta,
  ): ts.Identifier | ts.NonNullExpression {
    // Attempt to resolve the operation locally.
    const res = this.resolveLocal(node, directive);
    if (res !== null) {
      // We want to get a clone of the resolved expression and clear the trailing comments
      // so they don't continue to appear in every place the expression is used.
      // As an example, this would otherwise produce:
      // var _t1 /**T:DIR*/ /*1,2*/ = _ctor1();
      // _t1 /**T:DIR*/ /*1,2*/.input = 'value';
      //
      // In addition, returning a clone prevents the consumer of `Scope#resolve` from
      // attaching comments at the declaration site.
      let clone: ts.Identifier | ts.NonNullExpression;

      if (ts.isIdentifier(res)) {
        clone = ts.factory.createIdentifier(res.text);
      } else if (ts.isNonNullExpression(res)) {
        clone = ts.factory.createNonNullExpression(res.expression);
      } else {
        throw new Error(`Could not resolve ${node} to an Identifier or a NonNullExpression`);
      }

      ts.setOriginalNode(clone, res);
      (clone as any).parent = clone.parent;
      return ts.setSyntheticTrailingComments(clone, []);
    } else if (this.parent !== null) {
      // Check with the parent.
      return this.parent.resolve(node, directive);
    } else {
      throw new Error(`Could not resolve ${node} / ${directive}`);
    }
  }

  /**
   * Add a statement to this scope.
   */
  addStatement(stmt: ts.Statement): void {
    this.statements.push(stmt);
  }

  /**
   * Get the statements.
   */
  render(): ts.Statement[] {
    for (let i = 0; i < this.opQueue.length; i++) {
      // Optional statements cannot be skipped when we are generating the TCB for use
      // by the TemplateTypeChecker.
      const skipOptional = !this.tcb.env.config.enableTemplateTypeChecker;
      this.executeOp(i, skipOptional);
    }
    return this.statements;
  }

  /**
   * Returns an expression of all template guards that apply to this scope, including those of
   * parent scopes. If no guards have been applied, null is returned.
   */
  guards(): ts.Expression | null {
    let parentGuards: ts.Expression | null = null;
    if (this.parent !== null) {
      // Start with the guards from the parent scope, if present.
      parentGuards = this.parent.guards();
    }

    if (this.guard === null) {
      // This scope does not have a guard, so return the parent's guards as is.
      return parentGuards;
    } else if (parentGuards === null) {
      // There's no guards from the parent scope, so this scope's guard represents all available
      // guards.
      return this.guard;
    } else {
      // Both the parent scope and this scope provide a guard, so create a combination of the two.
      // It is important that the parent guard is used as left operand, given that it may provide
      // narrowing that is required for this scope's guard to be valid.
      return ts.factory.createBinaryExpression(
        parentGuards,
        ts.SyntaxKind.AmpersandAmpersandToken,
        this.guard,
      );
    }
  }

  /** Returns whether a template symbol is defined locally within the current scope. */
  isLocal(node: TmplAstVariable | TmplAstLetDeclaration | TmplAstReference): boolean {
    if (node instanceof TmplAstVariable) {
      return this.varMap.has(node);
    }
    if (node instanceof TmplAstLetDeclaration) {
      return this.letDeclOpMap.has(node.name);
    }
    return this.referenceOpMap.has(node);
  }

  /**
   * Constructs a `Scope` given either a `TmplAstTemplate` or a list of `TmplAstNode`s.
   * This is identical to `Scope.forNodes` which we can't reference in some ops due to
   * circular dependencies.
   *.
   * @param parentScope the `Scope` of the parent template.
   * @param scopedNode Node that provides the scope around the child nodes (e.g. a
   * `TmplAstTemplate` node exposing variables to its children).
   * @param children Child nodes that should be appended to the TCB.
   * @param guard an expression that is applied to this scope for type narrowing purposes.
   */
  createChildScope(
    parentScope: Scope,
    scopedNode:
      | TmplAstTemplate
      | TmplAstIfBlockBranch
      | TmplAstForLoopBlock
      | TmplAstHostElement
      | null,
    children: TmplAstNode[] | null,
    guard: ts.Expression | null,
  ): Scope {
    return Scope.forNodes(this.tcb, parentScope, scopedNode, children, guard);
  }

  private resolveLocal(
    ref: LocalSymbol,
    directive?: TypeCheckableDirectiveMeta,
  ): ts.Expression | null {
    if (ref instanceof TmplAstReference && this.referenceOpMap.has(ref)) {
      return this.resolveOp(this.referenceOpMap.get(ref)!);
    } else if (ref instanceof TmplAstLetDeclaration && this.letDeclOpMap.has(ref.name)) {
      return this.resolveOp(this.letDeclOpMap.get(ref.name)!.opIndex);
    } else if (ref instanceof TmplAstVariable && this.varMap.has(ref)) {
      // Resolving a context variable for this template.
      // Execute the `TcbVariableOp` associated with the `TmplAstVariable`.
      const opIndexOrNode = this.varMap.get(ref)!;
      return typeof opIndexOrNode === 'number' ? this.resolveOp(opIndexOrNode) : opIndexOrNode;
    } else if (
      ref instanceof TmplAstTemplate &&
      directive === undefined &&
      this.templateCtxOpMap.has(ref)
    ) {
      // Resolving the context of the given sub-template.
      // Execute the `TcbTemplateContextOp` for the template.
      return this.resolveOp(this.templateCtxOpMap.get(ref)!);
    } else if (
      (ref instanceof TmplAstElement ||
        ref instanceof TmplAstTemplate ||
        ref instanceof TmplAstComponent ||
        ref instanceof TmplAstDirective ||
        ref instanceof TmplAstHostElement) &&
      directive !== undefined &&
      this.directiveOpMap.has(ref)
    ) {
      // Resolving a directive on an element or sub-template.
      const dirMap = this.directiveOpMap.get(ref)!;
      return dirMap.has(directive) ? this.resolveOp(dirMap.get(directive)!) : null;
    } else if (ref instanceof TmplAstElement && this.elementOpMap.has(ref)) {
      // Resolving the DOM node of an element in this template.
      return this.resolveOp(this.elementOpMap.get(ref)!);
    } else if (ref instanceof TmplAstComponent && this.componentNodeOpMap.has(ref)) {
      return this.resolveOp(this.componentNodeOpMap.get(ref)!);
    } else if (ref instanceof TmplAstHostElement && this.hostElementOpMap.has(ref)) {
      return this.resolveOp(this.hostElementOpMap.get(ref)!);
    } else {
      return null;
    }
  }

  /**
   * Like `executeOp`, but assert that the operation actually returned `ts.Expression`.
   */
  private resolveOp(opIndex: number): ts.Expression {
    const res = this.executeOp(opIndex, /* skipOptional */ false);
    if (res === null) {
      throw new Error(`Error resolving operation, got null`);
    }
    return res;
  }

  /**
   * Execute a particular `TcbOp` in the `opQueue`.
   *
   * This method replaces the operation in the `opQueue` with the result of execution (once done)
   * and also protects against a circular dependency from the operation to itself by temporarily
   * setting the operation's result to a special expression.
   */
  private executeOp(opIndex: number, skipOptional: boolean): ts.Expression | null {
    const op = this.opQueue[opIndex];
    if (!(op instanceof TcbOp)) {
      return op;
    }

    if (skipOptional && op.optional) {
      return null;
    }

    // Set the result of the operation in the queue to its circular fallback. If executing this
    // operation results in a circular dependency, this will prevent an infinite loop and allow for
    // the resolution of such cycles.
    this.opQueue[opIndex] = op.circularFallback();
    const res = op.execute();
    // Once the operation has finished executing, it's safe to cache the real result.
    this.opQueue[opIndex] = res;
    return res;
  }

  private appendNode(node: TmplAstNode): void {
    if (node instanceof TmplAstElement) {
      const opIndex = this.opQueue.push(new TcbElementOp(this.tcb, this, node)) - 1;
      this.elementOpMap.set(node, opIndex);
      if (this.tcb.env.config.controlFlowPreventingContentProjection !== 'suppress') {
        this.appendContentProjectionCheckOp(node);
      }
      this.appendDirectivesAndInputsOfElementLikeNode(node);
      this.appendOutputsOfElementLikeNode(node, node.inputs, node.outputs);
      this.appendSelectorlessDirectives(node);
      this.appendChildren(node);
      this.checkAndAppendReferencesOfNode(node);
    } else if (node instanceof TmplAstTemplate) {
      // Template children are rendered in a child scope.
      this.appendDirectivesAndInputsOfElementLikeNode(node);
      this.appendOutputsOfElementLikeNode(node, node.inputs, node.outputs);
      this.appendSelectorlessDirectives(node);
      const ctxIndex = this.opQueue.push(new TcbTemplateContextOp(this.tcb, this)) - 1;
      this.templateCtxOpMap.set(node, ctxIndex);
      if (this.tcb.env.config.checkTemplateBodies) {
        this.opQueue.push(new TcbTemplateBodyOp(this.tcb, this, node));
      } else if (this.tcb.env.config.alwaysCheckSchemaInTemplateBodies) {
        this.appendDeepSchemaChecks(node.children);
      }
      this.checkAndAppendReferencesOfNode(node);
    } else if (node instanceof TmplAstComponent) {
      this.appendComponentNode(node);
    } else if (node instanceof TmplAstDeferredBlock) {
      this.appendDeferredBlock(node);
    } else if (node instanceof TmplAstIfBlock) {
      this.opQueue.push(new TcbIfOp(this.tcb, this, node));
    } else if (node instanceof TmplAstSwitchBlock) {
      this.opQueue.push(new TcbSwitchOp(this.tcb, this, node));
    } else if (node instanceof TmplAstForLoopBlock) {
      this.opQueue.push(new TcbForOfOp(this.tcb, this, node));
      node.empty && this.tcb.env.config.checkControlFlowBodies && this.appendChildren(node.empty);
    } else if (node instanceof TmplAstBoundText) {
      this.opQueue.push(new TcbExpressionOp(this.tcb, this, node.value));
    } else if (node instanceof TmplAstIcu) {
      this.appendIcuExpressions(node);
    } else if (node instanceof TmplAstContent) {
      this.appendChildren(node);
    } else if (node instanceof TmplAstLetDeclaration) {
      const opIndex = this.opQueue.push(new TcbLetDeclarationOp(this.tcb, this, node)) - 1;
      if (this.isLocal(node)) {
        this.tcb.oobRecorder.conflictingDeclaration(this.tcb.id, node);
      } else {
        this.letDeclOpMap.set(node.name, {opIndex, node});
      }
    } else if (node instanceof TmplAstHostElement) {
      this.appendHostElement(node);
    }
  }

  private appendChildren(node: TmplAstNode & {children: TmplAstNode[]}) {
    for (const child of node.children) {
      this.appendNode(child);
    }
  }

  private checkAndAppendReferencesOfNode(
    node: TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective,
  ): void {
    for (const ref of node.references) {
      const target = this.tcb.boundTarget.getReferenceTarget(ref);

      let ctxIndex: number;
      if (target === null) {
        // The reference is invalid if it doesn't have a target, so report it as an error.
        this.tcb.oobRecorder.missingReferenceTarget(this.tcb.id, ref);

        // Any usages of the invalid reference will be resolved to a variable of type any.
        ctxIndex = this.opQueue.push(new TcbInvalidReferenceOp(this.tcb, this)) - 1;
      } else if (target instanceof TmplAstTemplate || target instanceof TmplAstElement) {
        ctxIndex = this.opQueue.push(new TcbReferenceOp(this.tcb, this, ref, node, target)) - 1;
      } else {
        ctxIndex =
          this.opQueue.push(new TcbReferenceOp(this.tcb, this, ref, node, target.directive)) - 1;
      }
      this.referenceOpMap.set(ref, ctxIndex);
    }
  }

  private appendDirectivesAndInputsOfElementLikeNode(node: TmplAstElement | TmplAstTemplate): void {
    // Collect all the inputs on the element.
    const claimedInputs = new Set<string>();

    // Don't resolve directives when selectorless is enabled and treat all the inputs on the element
    // as unclaimed. In selectorless the inputs are defined either in component or directive nodes.
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);

    if (directives === null || directives.length === 0) {
      // If there are no directives, then all inputs are unclaimed inputs, so queue an operation
      // to add them if needed.
      if (node instanceof TmplAstElement) {
        this.opQueue.push(
          new TcbUnclaimedInputsOp(this.tcb, this, node.inputs, node, claimedInputs),
          new TcbDomSchemaCheckerOp(this.tcb, node, /* checkElement */ true, claimedInputs),
        );
      }
      return;
    }

    if (node instanceof TmplAstElement) {
      const isDeferred = this.tcb.boundTarget.isDeferred(node);
      if (!isDeferred && directives.some((dirMeta) => dirMeta.isExplicitlyDeferred)) {
        // This node has directives/components that were defer-loaded (included into
        // `@Component.deferredImports`), but the node itself was used outside of a
        // `@defer` block, which is the error.
        this.tcb.oobRecorder.deferredComponentUsedEagerly(this.tcb.id, node);
      }
    }

    const dirMap = new Map<TypeCheckableDirectiveMeta, number>();
    for (const dir of directives) {
      this.appendDirectiveInputs(dir, node, dirMap, directives);
    }
    this.directiveOpMap.set(node, dirMap);

    // After expanding the directives, we might need to queue an operation to check any unclaimed
    // inputs.
    if (node instanceof TmplAstElement) {
      // Go through the directives and remove any inputs that it claims from `elementInputs`.
      for (const dir of directives) {
        for (const propertyName of dir.inputs.propertyNames) {
          claimedInputs.add(propertyName);
        }
      }

      this.opQueue.push(new TcbUnclaimedInputsOp(this.tcb, this, node.inputs, node, claimedInputs));
      // If there are no directives which match this element, then it's a "plain" DOM element (or a
      // web component), and should be checked against the DOM schema. If any directives match,
      // we must assume that the element could be custom (either a component, or a directive like
      // <router-outlet>) and shouldn't validate the element name itself.
      const checkElement = directives.length === 0;
      this.opQueue.push(new TcbDomSchemaCheckerOp(this.tcb, node, checkElement, claimedInputs));
    }
  }

  private appendOutputsOfElementLikeNode(
    node: TmplAstElement | TmplAstTemplate | TmplAstHostElement,
    bindings: TmplAstBoundAttribute[] | null,
    events: TmplAstBoundEvent[],
  ): void {
    // Collect all the outputs on the element.
    const claimedOutputs = new Set<string>();

    // Don't resolve directives when selectorless is enabled and treat all the outputs on the
    // element as unclaimed. In selectorless the outputs are defined either in component or
    // directive nodes.
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);

    if (directives === null || directives.length === 0) {
      // If there are no directives, then all outputs are unclaimed outputs, so queue an operation
      // to add them if needed.
      if (node instanceof TmplAstElement) {
        this.opQueue.push(
          new TcbUnclaimedOutputsOp(this.tcb, this, node, events, bindings, claimedOutputs),
        );
      }
      return;
    }

    // Queue operations for all directives to check the relevant outputs for a directive.
    for (const dir of directives) {
      this.opQueue.push(new TcbDirectiveOutputsOp(this.tcb, this, node, bindings, events, dir));
    }

    // After expanding the directives, we might need to queue an operation to check any unclaimed
    // outputs.
    if (node instanceof TmplAstElement || node instanceof TmplAstHostElement) {
      // Go through the directives and register any outputs that it claims in `claimedOutputs`.
      for (const dir of directives) {
        for (const outputProperty of dir.outputs.propertyNames) {
          claimedOutputs.add(outputProperty);
        }
      }

      this.opQueue.push(
        new TcbUnclaimedOutputsOp(this.tcb, this, node, events, bindings, claimedOutputs),
      );
    }
  }

  private appendInputsOfSelectorlessNode(node: TmplAstComponent | TmplAstDirective): void {
    // Only resolve the directives that were brought in by this specific directive.
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);
    const claimedInputs = new Set<string>();

    if (directives !== null && directives.length > 0) {
      const dirMap = new Map<TypeCheckableDirectiveMeta, number>();
      for (const dir of directives) {
        this.appendDirectiveInputs(dir, node, dirMap, directives);

        for (const propertyName of dir.inputs.propertyNames) {
          claimedInputs.add(propertyName);
        }
      }
      this.directiveOpMap.set(node, dirMap);
    }

    // In selectorless all directive inputs have to be claimed.
    if (node instanceof TmplAstDirective) {
      for (const input of node.inputs) {
        if (!claimedInputs.has(input.name)) {
          this.tcb.oobRecorder.unclaimedDirectiveBinding(this.tcb.id, node, input);
        }
      }

      for (const attr of node.attributes) {
        if (!claimedInputs.has(attr.name)) {
          this.tcb.oobRecorder.unclaimedDirectiveBinding(this.tcb.id, node, attr);
        }
      }
    } else {
      const checkElement = node.tagName !== null;
      this.opQueue.push(
        new TcbUnclaimedInputsOp(this.tcb, this, node.inputs, node, claimedInputs),
        new TcbDomSchemaCheckerOp(this.tcb, node, checkElement, claimedInputs),
      );
    }
  }

  private appendOutputsOfSelectorlessNode(node: TmplAstComponent | TmplAstDirective): void {
    // Only resolve the directives that were brought in by this specific directive.
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);
    const claimedOutputs = new Set<string>();

    if (directives !== null && directives.length > 0) {
      for (const dir of directives) {
        this.opQueue.push(
          new TcbDirectiveOutputsOp(this.tcb, this, node, node.inputs, node.outputs, dir),
        );

        for (const outputProperty of dir.outputs.propertyNames) {
          claimedOutputs.add(outputProperty);
        }
      }
    }

    // In selectorless all directive outputs have to be claimed.
    if (node instanceof TmplAstDirective) {
      for (const output of node.outputs) {
        if (!claimedOutputs.has(output.name)) {
          this.tcb.oobRecorder.unclaimedDirectiveBinding(this.tcb.id, node, output);
        }
      }
    } else {
      this.opQueue.push(
        new TcbUnclaimedOutputsOp(this.tcb, this, node, node.outputs, node.inputs, claimedOutputs),
      );
    }
  }

  private appendDirectiveInputs(
    dir: TypeCheckableDirectiveMeta,
    node: TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective,
    dirMap: Map<TypeCheckableDirectiveMeta, number>,
    allDirectiveMatches: TypeCheckableDirectiveMeta[],
  ): void {
    const customFieldType = allDirectiveMatches.some(isFieldDirective)
      ? getCustomFieldDirectiveType(dir)
      : null;

    const directiveOp = this.getDirectiveOp(dir, node, customFieldType);
    const dirIndex = this.opQueue.push(directiveOp) - 1;
    dirMap.set(dir, dirIndex);

    if (isNativeField(dir, node, allDirectiveMatches)) {
      this.opQueue.push(new TcbNativeFieldDirectiveTypeOp(this.tcb, this, node as TmplAstElement));
    }

    this.opQueue.push(new TcbDirectiveInputsOp(this.tcb, this, node, dir, customFieldType));
  }

  private getDirectiveOp(
    dir: TypeCheckableDirectiveMeta,
    node: DirectiveOwner,
    customFieldType: CustomFieldType | null,
  ): TcbOp {
    const dirRef = dir.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>;

    if (!dir.isGeneric) {
      // The most common case is that when a directive is not generic, we use the normal
      // `TcbNonDirectiveTypeOp`.
      return new TcbNonGenericDirectiveTypeOp(this.tcb, this, node, dir);
    } else if (
      !requiresInlineTypeCtor(dirRef.node, this.tcb.env.reflector, this.tcb.env) ||
      this.tcb.env.config.useInlineTypeConstructors
    ) {
      // For generic directives, we use a type constructor to infer types. If a directive requires
      // an inline type constructor, then inlining must be available to use the
      // `TcbDirectiveCtorOp`. If not we, we fallback to using `any` – see below.
      return new TcbDirectiveCtorOp(this.tcb, this, node, dir, customFieldType);
    }

    // If inlining is not available, then we give up on inferring the generic params, and use
    // `any` type for the directive's generic parameters.
    return new TcbGenericDirectiveTypeWithAnyParamsOp(this.tcb, this, node, dir);
  }

  private appendSelectorlessDirectives(
    node: TmplAstElement | TmplAstTemplate | TmplAstComponent,
  ): void {
    for (const directive of node.directives) {
      // Check that the directive exists.
      if (!this.tcb.boundTarget.referencedDirectiveExists(directive.name)) {
        this.tcb.oobRecorder.missingNamedTemplateDependency(this.tcb.id, directive);
        continue;
      }

      // Check that the class is a directive class.
      const directives = this.tcb.boundTarget.getDirectivesOfNode(directive);
      if (
        directives === null ||
        directives.length === 0 ||
        directives.some((dir) => dir.isComponent || !dir.isStandalone)
      ) {
        this.tcb.oobRecorder.incorrectTemplateDependencyType(this.tcb.id, directive);
        continue;
      }

      this.appendInputsOfSelectorlessNode(directive);
      this.appendOutputsOfSelectorlessNode(directive);
      this.checkAndAppendReferencesOfNode(directive);
    }
  }

  private appendDeepSchemaChecks(nodes: TmplAstNode[]): void {
    for (const node of nodes) {
      if (!(node instanceof TmplAstElement || node instanceof TmplAstTemplate)) {
        continue;
      }

      if (node instanceof TmplAstElement) {
        const claimedInputs = new Set<string>();
        let directives = this.tcb.boundTarget.getDirectivesOfNode(node);

        for (const dirNode of node.directives) {
          const directiveResults = this.tcb.boundTarget.getDirectivesOfNode(dirNode);

          if (directiveResults !== null && directiveResults.length > 0) {
            directives ??= [];
            directives.push(...directiveResults);
          }
        }

        let hasDirectives: boolean;
        if (directives === null || directives.length === 0) {
          hasDirectives = false;
        } else {
          hasDirectives = true;
          for (const dir of directives) {
            for (const propertyName of dir.inputs.propertyNames) {
              claimedInputs.add(propertyName);
            }
          }
        }
        this.opQueue.push(new TcbDomSchemaCheckerOp(this.tcb, node, !hasDirectives, claimedInputs));
      }

      this.appendDeepSchemaChecks(node.children);
    }
  }

  private appendIcuExpressions(node: TmplAstIcu): void {
    for (const variable of Object.values(node.vars)) {
      this.opQueue.push(new TcbExpressionOp(this.tcb, this, variable.value));
    }
    for (const placeholder of Object.values(node.placeholders)) {
      if (placeholder instanceof TmplAstBoundText) {
        this.opQueue.push(new TcbExpressionOp(this.tcb, this, placeholder.value));
      }
    }
  }

  private appendContentProjectionCheckOp(root: TmplAstElement | TmplAstComponent): void {
    const meta =
      this.tcb.boundTarget.getDirectivesOfNode(root)?.find((meta) => meta.isComponent) || null;

    if (meta !== null && meta.ngContentSelectors !== null && meta.ngContentSelectors.length > 0) {
      const selectors = meta.ngContentSelectors;

      // We don't need to generate anything for components that don't have projection
      // slots, or they only have one catch-all slot (represented by `*`).
      if (selectors.length > 1 || (selectors.length === 1 && selectors[0] !== '*')) {
        this.opQueue.push(
          new TcbControlFlowContentProjectionOp(this.tcb, root, selectors, meta.name),
        );
      }
    }
  }

  private appendComponentNode(node: TmplAstComponent): void {
    // TODO(crisbeto): should we still append the children if the component is invalid?
    // Check that the referenced class exists.
    if (!this.tcb.boundTarget.referencedDirectiveExists(node.componentName)) {
      this.tcb.oobRecorder.missingNamedTemplateDependency(this.tcb.id, node);
      return;
    }

    // Check that the class is a component.
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);
    if (
      directives === null ||
      directives.length === 0 ||
      directives.every((dir) => !dir.isComponent || !dir.isStandalone)
    ) {
      this.tcb.oobRecorder.incorrectTemplateDependencyType(this.tcb.id, node);
      return;
    }

    const opIndex = this.opQueue.push(new TcbComponentNodeOp(this.tcb, this, node)) - 1;
    this.componentNodeOpMap.set(node, opIndex);
    if (this.tcb.env.config.controlFlowPreventingContentProjection !== 'suppress') {
      this.appendContentProjectionCheckOp(node);
    }
    this.appendInputsOfSelectorlessNode(node);
    this.appendOutputsOfSelectorlessNode(node);
    this.appendSelectorlessDirectives(node);
    this.appendChildren(node);
    this.checkAndAppendReferencesOfNode(node);
  }

  private appendDeferredBlock(block: TmplAstDeferredBlock): void {
    this.appendDeferredTriggers(block, block.triggers);
    this.appendDeferredTriggers(block, block.prefetchTriggers);

    // Only the `when` hydration trigger needs to be checked.
    if (block.hydrateTriggers.when) {
      this.opQueue.push(new TcbExpressionOp(this.tcb, this, block.hydrateTriggers.when.value));
    }

    this.appendChildren(block);

    if (block.placeholder !== null) {
      this.appendChildren(block.placeholder);
    }

    if (block.loading !== null) {
      this.appendChildren(block.loading);
    }

    if (block.error !== null) {
      this.appendChildren(block.error);
    }
  }

  private appendDeferredTriggers(
    block: TmplAstDeferredBlock,
    triggers: TmplAstDeferredBlockTriggers,
  ): void {
    if (triggers.when !== undefined) {
      this.opQueue.push(new TcbExpressionOp(this.tcb, this, triggers.when.value));
    }

    if (triggers.viewport !== undefined && triggers.viewport.options !== null) {
      this.opQueue.push(new TcbIntersectionObserverOp(this.tcb, this, triggers.viewport.options));
    }

    if (triggers.hover !== undefined) {
      this.validateReferenceBasedDeferredTrigger(block, triggers.hover);
    }

    if (triggers.interaction !== undefined) {
      this.validateReferenceBasedDeferredTrigger(block, triggers.interaction);
    }

    if (triggers.viewport !== undefined) {
      this.validateReferenceBasedDeferredTrigger(block, triggers.viewport);
    }
  }

  private appendHostElement(node: TmplAstHostElement): void {
    const opIndex = this.opQueue.push(new TcbHostElementOp(this.tcb, this, node)) - 1;
    const directives = this.tcb.boundTarget.getDirectivesOfNode(node);

    if (directives !== null && directives.length > 0) {
      const directiveOpMap = new Map<TypeCheckableDirectiveMeta, number>();

      for (const directive of directives) {
        const directiveOp = this.getDirectiveOp(directive, node, null);
        directiveOpMap.set(directive, this.opQueue.push(directiveOp) - 1);
      }

      this.directiveOpMap.set(node, directiveOpMap);
    }

    this.hostElementOpMap.set(node, opIndex);
    this.opQueue.push(
      new TcbUnclaimedInputsOp(this.tcb, this, node.bindings, node, null),
      new TcbDomSchemaCheckerOp(this.tcb, node, false, null),
    );
    this.appendOutputsOfElementLikeNode(node, null, node.listeners);
  }

  private validateReferenceBasedDeferredTrigger(
    block: TmplAstDeferredBlock,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ): void {
    if (trigger.reference === null) {
      if (block.placeholder === null) {
        this.tcb.oobRecorder.deferImplicitTriggerMissingPlaceholder(this.tcb.id, trigger);
        return;
      }

      let rootNode: TmplAstNode | null = null;

      for (const child of block.placeholder.children) {
        // Skip over empty text nodes if the host doesn't preserve whitespaces.
        if (
          !this.tcb.hostPreserveWhitespaces &&
          child instanceof TmplAstText &&
          child.value.trim().length === 0
        ) {
          continue;
        }

        // Capture the first root node.
        if (rootNode === null) {
          rootNode = child;
        } else {
          // More than one root node is invalid. Reset it and break
          // the loop so the assertion below can flag it.
          rootNode = null;
          break;
        }
      }

      if (rootNode === null || !(rootNode instanceof TmplAstElement)) {
        this.tcb.oobRecorder.deferImplicitTriggerInvalidPlaceholder(this.tcb.id, trigger);
      }
      return;
    }

    if (this.tcb.boundTarget.getDeferredTriggerTarget(block, trigger) === null) {
      this.tcb.oobRecorder.inaccessibleDeferredTriggerElement(this.tcb.id, trigger);
    }
  }

  /** Reports a diagnostic if there are any `@let` declarations that conflict with a node. */
  private static checkConflictingLet(scope: Scope, node: TmplAstVariable | TmplAstReference): void {
    if (scope.letDeclOpMap.has(node.name)) {
      scope.tcb.oobRecorder.conflictingDeclaration(
        scope.tcb.id,
        scope.letDeclOpMap.get(node.name)!.node,
      );
    }
  }
}
