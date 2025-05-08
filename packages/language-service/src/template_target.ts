/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AbsoluteSourceSpan,
  AST,
  ASTWithSource,
  Call,
  ImplicitReceiver,
  ParseSourceSpan,
  ParseSpan,
  PropertyRead,
  RecursiveAstVisitor,
  SafeCall,
  TmplAstBoundAttribute,
  TmplAstBoundDeferredTrigger,
  TmplAstBoundEvent,
  TmplAstBoundText,
  TmplAstComponent,
  TmplAstContent,
  TmplAstDeferredBlock,
  TmplAstDeferredBlockError,
  TmplAstDeferredBlockLoading,
  TmplAstDeferredBlockPlaceholder,
  TmplAstDeferredTrigger,
  TmplAstDirective,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstHostElement,
  TmplAstIcu,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstReference,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
  TmplAstTemplate,
  TmplAstText,
  TmplAstTextAttribute,
  TmplAstUnknownBlock,
  TmplAstVariable,
  tmplAstVisitAll,
  TmplAstVisitor,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {findFirstMatchingNode} from '@angular/compiler-cli/src/ngtsc/typecheck/src/comments';
import tss from 'typescript';

import {
  isBoundEventWithSyntheticHandler,
  isTemplateNodeWithKeyAndValue,
  isWithin,
  isWithinKeyValue,
  TypeCheckInfo,
} from './utils';

/**
 * Contextual information for a target position within the template.
 */
export interface TemplateTarget {
  /**
   * Target position within the template.
   */
  position: number;

  /**
   * The template (or AST expression) node or nodes closest to the search position.
   */
  context: TargetContext;

  /**
   * The `TmplAstTemplate` which contains the found node or expression (or `null` if in the root
   * template).
   */
  template: TmplAstTemplate | null;

  /**
   * The immediate parent node of the targeted node.
   */
  parent: TmplAstNode | AST | null;
}

/**
 * A node or nodes targeted at a given position in the template, including potential contextual
 * information about the specific aspect of the node being referenced.
 *
 * Some nodes have multiple interior contexts. For example, `TmplAstElement` nodes have both a tag
 * name as well as a body, and a given position definitively points to one or the other.
 * `TargetNode` captures the node itself, as well as this additional contextual disambiguation.
 */
export type TargetContext = SingleNodeTarget | MultiNodeTarget;

/** Contexts which logically target only a single node in the template AST. */
export type SingleNodeTarget =
  | RawExpression
  | CallExpressionInArgContext
  | RawTemplateNode
  | ElementInBodyContext
  | ElementInTagContext
  | AttributeInKeyContext
  | AttributeInValueContext
  | ComponentInBodyContext
  | ComponentInTagContext
  | DirectiveInNameContext
  | DirectiveInBodyContext;

/**
 * Contexts which logically target multiple nodes in the template AST, which cannot be
 * disambiguated given a single position because they are all equally relevant. For example, in the
 * banana-in-a-box syntax `[(ngModel)]="formValues.person"`, the position in the template for the
 * key `ngModel` refers to both the bound event `ngModelChange` and the input `ngModel`.
 */
export type MultiNodeTarget = TwoWayBindingContext;

/**
 * Differentiates the various kinds of `TargetNode`s.
 */
export enum TargetNodeKind {
  RawExpression,
  CallExpressionInArgContext,
  RawTemplateNode,
  ElementInTagContext,
  ElementInBodyContext,
  AttributeInKeyContext,
  AttributeInValueContext,
  TwoWayBindingContext,
  ComponentInTagContext,
  ComponentInBodyContext,
  DirectiveInNameContext,
  DirectiveInBodyContext,
}

/**
 * An `AST` expression that's targeted at a given position, with no additional context.
 */
export interface RawExpression {
  kind: TargetNodeKind.RawExpression;
  node: AST;
  parents: AST[];
}

/**
 * An `e.Call` expression with the cursor in a position where an argument could appear.
 *
 * This is returned when the only matching node is the method call expression, but the cursor is
 * within the method call parentheses. For example, in the expression `foo(|)` there is no argument
 * expression that the cursor could be targeting, but the cursor is in a position where one could
 * appear.
 */
export interface CallExpressionInArgContext {
  kind: TargetNodeKind.CallExpressionInArgContext;
  node: Call | SafeCall;
}

/**
 * A `TmplAstNode` template node that's targeted at a given position, with no additional context.
 */
export interface RawTemplateNode {
  kind: TargetNodeKind.RawTemplateNode;
  node: TmplAstNode;
}

/**
 * A `TmplAstElement` (or `TmplAstTemplate`) element node that's targeted, where the given position
 * is within the tag name.
 */
export interface ElementInTagContext {
  kind: TargetNodeKind.ElementInTagContext;
  node: TmplAstElement | TmplAstTemplate;
}

/**
 * A `TmplAstElement` (or `TmplAstTemplate`) element node that's targeted, where the given position
 * is within the element body.
 */
export interface ElementInBodyContext {
  kind: TargetNodeKind.ElementInBodyContext;
  node: TmplAstElement | TmplAstTemplate;
}

/**
 * A `TmplAstComponent` element node that's targeted, where the given position is within the tag,
 * e.g. `MyComp` in `<MyComp foo="bar"/>`.
 */
export interface ComponentInTagContext {
  kind: TargetNodeKind.ComponentInTagContext;
  node: TmplAstComponent;
}

/**
 * A `TmplAstComponent` element node that's targeted, where the given position is within the body,
 * e.g. `foo="bar"/>` in `<MyComp foo="bar"/>`.
 */
export interface ComponentInBodyContext {
  kind: TargetNodeKind.ComponentInBodyContext;
  node: TmplAstComponent;
}

/**
 * A `TmplAstDirective` element node that's targeted, where the given position is within the
 * directive's name (e.g. `MyDir` in `@MyDir`).
 */
export interface DirectiveInNameContext {
  kind: TargetNodeKind.DirectiveInNameContext;
  node: TmplAstDirective;
}

/**
 * A `TmplAstDirective` element node that's targeted, where the given position is within the body,
 * e.g. `(foo="bar")` in `@MyDir(foo="bar")`.
 */
export interface DirectiveInBodyContext {
  kind: TargetNodeKind.DirectiveInBodyContext;
  node: TmplAstDirective;
}

export interface AttributeInKeyContext {
  kind: TargetNodeKind.AttributeInKeyContext;
  node: TmplAstTextAttribute | TmplAstBoundAttribute | TmplAstBoundEvent;
}

export interface AttributeInValueContext {
  kind: TargetNodeKind.AttributeInValueContext;
  node: TmplAstTextAttribute | TmplAstBoundAttribute | TmplAstBoundEvent;
}

/**
 * A `TmplAstBoundAttribute` and `TmplAstBoundEvent` pair that are targeted, where the given
 * position is within the key span of both.
 */
export interface TwoWayBindingContext {
  kind: TargetNodeKind.TwoWayBindingContext;
  nodes: [TmplAstBoundAttribute, TmplAstBoundEvent];
}

/**
 * Special marker AST that can be used when the cursor is within the `sourceSpan` but not
 * the key or value span of a node with key/value spans.
 */
class OutsideKeyValueMarkerAst extends AST {
  override visit(): null {
    return null;
  }
}

/**
 * This special marker is added to the path when the cursor is within the sourceSpan but not the key
 * or value span of a node with key/value spans.
 */
const OUTSIDE_K_V_MARKER = new OutsideKeyValueMarkerAst(
  new ParseSpan(-1, -1),
  new AbsoluteSourceSpan(-1, -1),
);

/**
 * Return the template AST node or expression AST node that most accurately
 * represents the node at the specified cursor `position`.
 *
 * @param template AST tree of the template
 * @param position target cursor position
 */
export function getTargetAtPosition(
  template: TmplAstNode[],
  position: number,
): TemplateTarget | null {
  const path = TemplateTargetVisitor.visitTemplate(template, position);
  if (path.length === 0) {
    return null;
  }

  const candidate = path[path.length - 1];

  // Walk up the result nodes to find the nearest `TmplAstTemplate` which contains the targeted
  // node.
  let context: TmplAstTemplate | null = null;
  for (let i = path.length - 2; i >= 0; i--) {
    const node = path[i];
    if (node instanceof TmplAstTemplate) {
      context = node;
      break;
    }
  }

  // Given the candidate node, determine the full targeted context.
  let nodeInContext: TargetContext;
  if (
    (candidate instanceof Call || candidate instanceof SafeCall) &&
    isWithin(position, candidate.argumentSpan)
  ) {
    nodeInContext = {
      kind: TargetNodeKind.CallExpressionInArgContext,
      node: candidate,
    };
  } else if (candidate instanceof AST) {
    const parents = path.filter((value: AST | TmplAstNode): value is AST => value instanceof AST);
    // Remove the current node from the parents list.
    parents.pop();

    nodeInContext = {
      kind: TargetNodeKind.RawExpression,
      node: candidate,
      parents,
    };
  } else if (candidate instanceof TmplAstElement) {
    // Elements have two contexts: the tag context (position is within the element tag) or the
    // element body context (position is outside of the tag name, but still in the element).
    nodeInContext = {
      kind: isWithinTagBody(position, candidate)
        ? TargetNodeKind.ElementInBodyContext
        : TargetNodeKind.ElementInTagContext,
      node: candidate,
    };
  } else if (candidate instanceof TmplAstComponent) {
    nodeInContext = {
      kind: isWithinTagBody(position, candidate)
        ? TargetNodeKind.ComponentInBodyContext
        : TargetNodeKind.ComponentInTagContext,
      node: candidate,
    };
  } else if (candidate instanceof TmplAstDirective) {
    const startSpan = candidate.startSourceSpan;

    // The start span includes the opening paren, if there is one which we have to account for.
    const endOffset = startSpan.end.offset - (startSpan.toString().endsWith('(') ? 1 : 0);

    nodeInContext = {
      kind:
        position >= startSpan.start.offset && position <= endOffset
          ? TargetNodeKind.DirectiveInNameContext
          : TargetNodeKind.DirectiveInBodyContext,
      node: candidate,
    };
  } else if (
    (candidate instanceof TmplAstBoundAttribute ||
      candidate instanceof TmplAstBoundEvent ||
      candidate instanceof TmplAstTextAttribute) &&
    candidate.keySpan !== undefined
  ) {
    const previousCandidate = path[path.length - 2];
    if (
      candidate instanceof TmplAstBoundEvent &&
      previousCandidate instanceof TmplAstBoundAttribute &&
      candidate.name === previousCandidate.name + 'Change'
    ) {
      const boundAttribute: TmplAstBoundAttribute = previousCandidate;
      const boundEvent: TmplAstBoundEvent = candidate;
      nodeInContext = {
        kind: TargetNodeKind.TwoWayBindingContext,
        nodes: [boundAttribute, boundEvent],
      };
    } else if (isWithin(position, candidate.keySpan)) {
      nodeInContext = {
        kind: TargetNodeKind.AttributeInKeyContext,
        node: candidate,
      };
    } else {
      nodeInContext = {
        kind: TargetNodeKind.AttributeInValueContext,
        node: candidate,
      };
    }
  } else {
    nodeInContext = {
      kind: TargetNodeKind.RawTemplateNode,
      node: candidate,
    };
  }

  let parent: TmplAstNode | AST | null = null;
  if (nodeInContext.kind === TargetNodeKind.TwoWayBindingContext && path.length >= 3) {
    parent = path[path.length - 3];
  } else if (path.length >= 2) {
    parent = path[path.length - 2];
  }

  return {position, context: nodeInContext, template: context, parent};
}

function findFirstMatchingNodeForSourceSpan(
  tcb: tss.Node,
  sourceSpan: ParseSourceSpan | AbsoluteSourceSpan,
) {
  return findFirstMatchingNode(tcb, {
    withSpan: sourceSpan,
    filter: (node: tss.Node): node is tss.Node => true,
  });
}

/**
 * A tcb nodes for the template at a given position, include the tcb node of the template.
 */
interface TcbNodesInfoForTemplate {
  componentTcbNode: tss.Node;
  nodes: tss.Node[];
}

/**
 * Return the nodes in `TCB` of the node at the specified cursor `position`.
 *
 */
export function getTcbNodesOfTemplateAtPosition(
  typeCheckInfo: TypeCheckInfo,
  position: number,
  compiler: NgCompiler,
): TcbNodesInfoForTemplate | null {
  const target = getTargetAtPosition(typeCheckInfo.nodes, position);
  if (target === null) {
    return null;
  }

  const tcb = compiler.getTemplateTypeChecker().getTypeCheckBlock(typeCheckInfo.declaration);
  if (tcb === null) {
    return null;
  }

  const tcbNodes: (tss.Node | null)[] = [];
  if (target.context.kind === TargetNodeKind.RawExpression) {
    const targetNode = target.context.node;
    if (targetNode instanceof PropertyRead) {
      const tsNode = findFirstMatchingNode(tcb, {
        withSpan: targetNode.nameSpan,
        filter: (node): node is tss.PropertyAccessExpression =>
          tss.isPropertyAccessExpression(node),
      });
      tcbNodes.push(tsNode?.name ?? null);
    } else {
      tcbNodes.push(findFirstMatchingNodeForSourceSpan(tcb, target.context.node.sourceSpan));
    }
  } else if (target.context.kind === TargetNodeKind.TwoWayBindingContext) {
    const targetNodes = target.context.nodes
      .map((n) => n.sourceSpan)
      .map((node) => {
        return findFirstMatchingNodeForSourceSpan(tcb, node);
      });
    tcbNodes.push(...targetNodes);
  } else {
    tcbNodes.push(findFirstMatchingNodeForSourceSpan(tcb, target.context.node.sourceSpan));
  }

  return {
    nodes: tcbNodes.filter((n): n is tss.Node => n !== null),
    componentTcbNode: tcb,
  };
}

/**
 * Visitor which, given a position and a template, identifies the node within the template at that
 * position, as well as records the path of increasingly nested nodes that were traversed to reach
 * that position.
 */
class TemplateTargetVisitor implements TmplAstVisitor {
  // We need to keep a path instead of the last node because we might need more
  // context for the last node, for example what is the parent node?
  readonly path: Array<TmplAstNode | AST> = [];

  static visitTemplate(template: TmplAstNode[], position: number): Array<TmplAstNode | AST> {
    const visitor = new TemplateTargetVisitor(position);
    visitor.visitAll(template);
    const {path} = visitor;

    const strictPath = path.filter((v) => v !== OUTSIDE_K_V_MARKER);
    const candidate = strictPath[strictPath.length - 1];
    const matchedASourceSpanButNotAKvSpan = path.some((v) => v === OUTSIDE_K_V_MARKER);
    if (
      matchedASourceSpanButNotAKvSpan &&
      (candidate instanceof TmplAstTemplate || candidate instanceof TmplAstElement)
    ) {
      // Template nodes with key and value spans are always defined on a `TmplAstTemplate` or
      // `TmplAstElement`. If we found a node on a template with a `sourceSpan` that includes the
      // cursor, it is possible that we are outside the k/v spans (i.e. in-between them). If this is
      // the case and we do not have any other candidate matches on the `TmplAstElement` or
      // `TmplAstTemplate`, we want to return no results. Otherwise, the
      // `TmplAstElement`/`TmplAstTemplate` result is incorrect for that cursor position.
      return [];
    }
    return strictPath;
  }

  // Position must be absolute in the source file.
  private constructor(private readonly position: number) {}

  visit(node: TmplAstNode) {
    if (!isWithinNode(this.position, node)) {
      return;
    }

    const last: TmplAstNode | AST | undefined = this.path[this.path.length - 1];
    const withinKeySpanOfLastNode =
      last && isTemplateNodeWithKeyAndValue(last) && isWithin(this.position, last.keySpan);
    const withinKeySpanOfCurrentNode =
      isTemplateNodeWithKeyAndValue(node) && isWithin(this.position, node.keySpan);
    if (withinKeySpanOfLastNode && !withinKeySpanOfCurrentNode) {
      // We've already identified that we are within a `keySpan` of a node.
      // Unless we are _also_ in the `keySpan` of the current node (happens with two way bindings),
      // we should stop processing nodes at this point to prevent matching any other nodes. This can
      // happen when the end span of a different node touches the start of the keySpan for the
      // candidate node. Because our `isWithin` logic is inclusive on both ends, we can match both
      // nodes.
      return;
    }
    if (last instanceof TmplAstUnknownBlock && isWithin(this.position, last.nameSpan)) {
      // Autocompletions such as `@\nfoo`, where a newline follows a bare `@`, would not work
      // because the language service visitor sees us inside the subsequent text node. We deal with
      // this with using a special-case: if we are completing inside the name span, we don't
      // continue to the subsequent text node.
      return;
    }

    if (isTemplateNodeWithKeyAndValue(node) && !isWithinKeyValue(this.position, node)) {
      // If cursor is within source span but not within key span or value span,
      // do not return the node.
      this.path.push(OUTSIDE_K_V_MARKER);
    } else if (node instanceof TmplAstHostElement) {
      this.path.push(node);
      this.visitAll(node.bindings);
      this.visitAll(node.listeners);
    } else {
      this.path.push(node);
      node.visit(this);
    }
  }

  visitElement(element: TmplAstElement) {
    this.visitDirectiveHost(element);
  }

  visitTemplate(template: TmplAstTemplate) {
    this.visitDirectiveHost(template);
  }

  visitComponent(component: TmplAstComponent) {
    this.visitDirectiveHost(component);
  }

  visitDirective(directive: TmplAstDirective) {
    this.visitDirectiveHost(directive);
  }

  private visitDirectiveHost(
    node: TmplAstTemplate | TmplAstElement | TmplAstComponent | TmplAstDirective,
  ) {
    const isTemplate = node instanceof TmplAstTemplate;
    const isDirective = node instanceof TmplAstDirective;
    this.visitAll(node.attributes);
    if (!isDirective) {
      this.visitAll(node.directives);
    }
    this.visitAll(node.inputs);
    // We allow the path to contain both the `TmplAstBoundAttribute` and `TmplAstBoundEvent` for
    // two-way bindings but do not want the path to contain both the `TmplAstBoundAttribute` with
    // its children when the position is in the value span because we would then logically create a
    // path that also contains the `PropertyWrite` from the `TmplAstBoundEvent`. This early return
    // condition ensures we target just `TmplAstBoundAttribute` for this case and exclude
    // `TmplAstBoundEvent` children.
    if (
      this.path[this.path.length - 1] !== node &&
      !(this.path[this.path.length - 1] instanceof TmplAstBoundAttribute)
    ) {
      return;
    }
    this.visitAll(node.outputs);
    if (isTemplate) {
      this.visitAll(node.templateAttrs);
    }
    this.visitAll(node.references);
    if (isTemplate) {
      this.visitAll(node.variables);
    }

    // If we get here and have not found a candidate node on the element itself, proceed with
    // looking for a more specific node on the element children.
    if (this.path[this.path.length - 1] !== node) {
      return;
    }

    if (!isDirective) {
      this.visitAll(node.children);
    }
  }

  visitContent(content: TmplAstContent) {
    tmplAstVisitAll(this, content.attributes);
    this.visitAll(content.children);
  }

  visitVariable(variable: TmplAstVariable) {
    // Variable has no template nodes or expression nodes.
  }

  visitReference(reference: TmplAstReference) {
    // Reference has no template nodes or expression nodes.
  }

  visitTextAttribute(attribute: TmplAstTextAttribute) {
    // Text attribute has no template nodes or expression nodes.
  }

  visitBoundAttribute(attribute: TmplAstBoundAttribute) {
    if (attribute.valueSpan !== undefined) {
      this.visitBinding(attribute.value);
    }
  }

  visitBoundEvent(event: TmplAstBoundEvent) {
    if (!isBoundEventWithSyntheticHandler(event)) {
      this.visitBinding(event.handler);
    }
  }

  visitText(text: TmplAstText) {
    // Text has no template nodes or expression nodes.
  }

  visitBoundText(text: TmplAstBoundText) {
    this.visitBinding(text.value);
  }

  visitIcu(icu: TmplAstIcu) {
    for (const boundText of Object.values(icu.vars)) {
      this.visit(boundText);
    }
    for (const boundTextOrText of Object.values(icu.placeholders)) {
      this.visit(boundTextOrText);
    }
  }

  visitDeferredBlock(deferred: TmplAstDeferredBlock) {
    deferred.visitAll(this);
  }

  visitDeferredBlockPlaceholder(block: TmplAstDeferredBlockPlaceholder) {
    this.visitAll(block.children);
  }

  visitDeferredBlockError(block: TmplAstDeferredBlockError) {
    this.visitAll(block.children);
  }

  visitDeferredBlockLoading(block: TmplAstDeferredBlockLoading) {
    this.visitAll(block.children);
  }

  visitDeferredTrigger(trigger: TmplAstDeferredTrigger) {
    if (trigger instanceof TmplAstBoundDeferredTrigger) {
      this.visitBinding(trigger.value);
    }
  }

  visitSwitchBlock(block: TmplAstSwitchBlock) {
    this.visitBinding(block.expression);
    this.visitAll(block.cases);
    this.visitAll(block.unknownBlocks);
  }

  visitSwitchBlockCase(block: TmplAstSwitchBlockCase) {
    block.expression && this.visitBinding(block.expression);
    this.visitAll(block.children);
  }

  visitForLoopBlock(block: TmplAstForLoopBlock) {
    this.visit(block.item);
    this.visitAll(block.contextVariables);
    this.visitBinding(block.expression);
    this.visitBinding(block.trackBy);
    this.visitAll(block.children);
    block.empty && this.visit(block.empty);
  }

  visitForLoopBlockEmpty(block: TmplAstForLoopBlockEmpty) {
    this.visitAll(block.children);
  }

  visitIfBlock(block: TmplAstIfBlock) {
    this.visitAll(block.branches);
  }

  visitIfBlockBranch(block: TmplAstIfBlockBranch) {
    block.expression && this.visitBinding(block.expression);
    block.expressionAlias && this.visit(block.expressionAlias);
    this.visitAll(block.children);
  }

  visitUnknownBlock(block: TmplAstUnknownBlock) {}

  visitLetDeclaration(decl: TmplAstLetDeclaration) {
    this.visitBinding(decl.value);
  }

  visitAll(nodes: TmplAstNode[]) {
    for (const node of nodes) {
      this.visit(node);
    }
  }

  private visitBinding(expression: AST) {
    const visitor = new ExpressionVisitor(this.position);
    visitor.visit(expression, this.path);
  }
}

class ExpressionVisitor extends RecursiveAstVisitor {
  // Position must be absolute in the source file.
  constructor(private readonly position: number) {
    super();
  }

  override visit(node: AST, path: Array<TmplAstNode | AST>) {
    if (node instanceof ASTWithSource) {
      // In order to reduce noise, do not include `ASTWithSource` in the path.
      // For the purpose of source spans, there is no difference between
      // `ASTWithSource` and underlying node that it wraps.
      node = node.ast;
    }
    // The third condition is to account for the implicit receiver, which should
    // not be visited.
    if (isWithin(this.position, node.sourceSpan) && !(node instanceof ImplicitReceiver)) {
      path.push(node);
      node.visit(this, path);
    }
  }
}

function getSpanIncludingEndTag(ast: TmplAstNode) {
  const result = {
    start: ast.sourceSpan.start.offset,
    end: ast.sourceSpan.end.offset,
  };
  // For Element and Template node, sourceSpan.end is the end of the opening
  // tag. For the purpose of language service, we need to actually recognize
  // the end of the closing tag. Otherwise, for situation like
  // <my-component></my-comp¦onent> where the cursor is in the closing tag
  // we will not be able to return any information.
  if (ast instanceof TmplAstElement || ast instanceof TmplAstTemplate) {
    if (ast.endSourceSpan) {
      result.end = ast.endSourceSpan.end.offset;
    } else if (ast.children.length > 0) {
      // If the AST has children but no end source span, then it is an unclosed element with an end
      // that should be the end of the last child.
      result.end = getSpanIncludingEndTag(ast.children[ast.children.length - 1]).end;
    } else {
      // This is likely a self-closing tag with no children so the `sourceSpan.end` is correct.
    }
  }
  return result;
}

/** Checks whether a position is within an AST node. */
function isWithinNode(position: number, node: TmplAstNode): boolean {
  if (!(node instanceof TmplAstHostElement)) {
    return isWithin(position, getSpanIncludingEndTag(node));
  }

  // Host elements are special in that they don't have a contiguous source span. E.g. some bindings
  // can be in the `host` literal in the decorator while others are on class members. That's why we
  // need to check each binding, rather than the host element itself.
  return (
    (node.bindings.length > 0 &&
      node.bindings.some((binding) => isWithin(position, binding.sourceSpan))) ||
    (node.listeners.length > 0 &&
      node.listeners.some((listener) => isWithin(position, listener.sourceSpan)))
  );
}

/** Checks whether a position is within the body or the start syntax of a node. */
function isWithinTagBody(position: number, node: TmplAstElement | TmplAstComponent): boolean {
  // Calculate the end of the element tag name. Any position beyond this is in the body.
  const name = node instanceof TmplAstComponent ? node.fullName : node.name;
  const tagEndPos =
    node.sourceSpan.start.offset + 1 /* '<' is the opening character */ + name.length;
  return position > tagEndPos;
}
