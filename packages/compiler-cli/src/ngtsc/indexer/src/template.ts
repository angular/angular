/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AST, ASTWithSource, BoundTarget, ImplicitReceiver, MethodCall, ParseSourceSpan, PropertyRead, PropertyWrite, RecursiveAstVisitor, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstBoundText, TmplAstElement, TmplAstNode, TmplAstRecursiveVisitor, TmplAstReference, TmplAstTemplate, TmplAstVariable} from '@angular/compiler';
import {AbsoluteSourceSpan, AttributeIdentifier, ElementIdentifier, IdentifierKind, MethodIdentifier, PropertyIdentifier, ReferenceIdentifier, TemplateNodeIdentifier, TopLevelIdentifier, VariableIdentifier} from './api';
import {ComponentMeta} from './context';

/**
 * A parsed node in a template, which may have a name (if it is a selector) or
 * be anonymous (like a text span).
 */
interface HTMLNode extends TmplAstNode {
  tagName?: string;
  name?: string;
}

type ExpressionIdentifier = PropertyIdentifier|MethodIdentifier;
type TmplTarget = TmplAstReference|TmplAstVariable;
type TargetIdentifier = ReferenceIdentifier|VariableIdentifier;
type TargetIdentifierMap = Map<TmplTarget, TargetIdentifier>;

/**
 * Visits the AST of an Angular template syntax expression, finding interesting
 * entities (variable references, etc.). Creates an array of Entities found in
 * the expression, with the location of the Entities being relative to the
 * expression.
 *
 * Visiting `text {{prop}}` will return
 * `[TopLevelIdentifier {name: 'prop', span: {start: 7, end: 11}}]`.
 */
class ExpressionVisitor extends RecursiveAstVisitor {
  readonly identifiers: ExpressionIdentifier[] = [];

  private constructor(
      private readonly expressionStr: string, private readonly absoluteOffset: number,
      private readonly boundTemplate: BoundTarget<ComponentMeta>,
      private readonly targetToIdentifier: (target: TmplTarget) => TargetIdentifier) {
    super();
  }

  /**
   * Returns identifiers discovered in an expression.
   *
   * @param ast expression AST to visit
   * @param source expression AST source code
   * @param absoluteOffset absolute byte offset from start of the file to the start of the AST
   * source code.
   * @param boundTemplate bound target of the entire template, which can be used to query for the
   * entities expressions target.
   * @param targetToIdentifier closure converting a template target node to its identifier.
   */
  static getIdentifiers(
      ast: AST, source: string, absoluteOffset: number, boundTemplate: BoundTarget<ComponentMeta>,
      targetToIdentifier: (target: TmplTarget) => TargetIdentifier): TopLevelIdentifier[] {
    const visitor =
        new ExpressionVisitor(source, absoluteOffset, boundTemplate, targetToIdentifier);
    visitor.visit(ast);
    return visitor.identifiers;
  }

  override visit(ast: AST) {
    ast.visit(this);
  }

  override visitMethodCall(ast: MethodCall, context: {}) {
    this.visitIdentifier(ast, IdentifierKind.Method);
    super.visitMethodCall(ast, context);
  }

  override visitPropertyRead(ast: PropertyRead, context: {}) {
    this.visitIdentifier(ast, IdentifierKind.Property);
    super.visitPropertyRead(ast, context);
  }

  override visitPropertyWrite(ast: PropertyWrite, context: {}) {
    this.visitIdentifier(ast, IdentifierKind.Property);
    super.visitPropertyWrite(ast, context);
  }

  /**
   * Visits an identifier, adding it to the identifier store if it is useful for indexing.
   *
   * @param ast expression AST the identifier is in
   * @param kind identifier kind
   */
  private visitIdentifier(
      ast: AST&{name: string, receiver: AST}, kind: ExpressionIdentifier['kind']) {
    // The definition of a non-top-level property such as `bar` in `{{foo.bar}}` is currently
    // impossible to determine by an indexer and unsupported by the indexing module.
    // The indexing module also does not currently support references to identifiers declared in the
    // template itself, which have a non-null expression target.
    if (!(ast.receiver instanceof ImplicitReceiver)) {
      return;
    }

    // The source span of the requested AST starts at a location that is offset from the expression.
    const identifierStart = ast.sourceSpan.start - this.absoluteOffset;
    if (!this.expressionStr.substring(identifierStart).startsWith(ast.name)) {
      throw new Error(`Impossible state: "${ast.name}" not found in "${
          this.expressionStr}" at location ${identifierStart}`);
    }

    // Join the relative position of the expression within a node with the absolute position
    // of the node to get the absolute position of the expression in the source code.
    const absoluteStart = this.absoluteOffset + identifierStart;
    const span = new AbsoluteSourceSpan(absoluteStart, absoluteStart + ast.name.length);

    const targetAst = this.boundTemplate.getExpressionTarget(ast);
    const target = targetAst ? this.targetToIdentifier(targetAst) : null;
    const identifier = {
      name: ast.name,
      span,
      kind,
      target,
    } as ExpressionIdentifier;

    this.identifiers.push(identifier);
  }
}

/**
 * Visits the AST of a parsed Angular template. Discovers and stores
 * identifiers of interest, deferring to an `ExpressionVisitor` as needed.
 */
class TemplateVisitor extends TmplAstRecursiveVisitor {
  // Identifiers of interest found in the template.
  readonly identifiers = new Set<TopLevelIdentifier>();

  // Map of targets in a template to their identifiers.
  private readonly targetIdentifierCache: TargetIdentifierMap = new Map();

  // Map of elements and templates to their identifiers.
  private readonly elementAndTemplateIdentifierCache =
      new Map<TmplAstElement|TmplAstTemplate, ElementIdentifier|TemplateNodeIdentifier>();

  /**
   * Creates a template visitor for a bound template target. The bound target can be used when
   * deferred to the expression visitor to get information about the target of an expression.
   *
   * @param boundTemplate bound template target
   */
  constructor(private boundTemplate: BoundTarget<ComponentMeta>) {
    super();
  }

  /**
   * Visits a node in the template.
   *
   * @param node node to visit
   */
  visit(node: HTMLNode) {
    node.visit(this);
  }

  visitAll(nodes: TmplAstNode[]) {
    nodes.forEach(node => this.visit(node));
  }

  /**
   * Add an identifier for an HTML element and visit its children recursively.
   *
   * @param element
   */
  override visitElement(element: TmplAstElement) {
    const elementIdentifier = this.elementOrTemplateToIdentifier(element);

    this.identifiers.add(elementIdentifier);

    this.visitAll(element.references);
    this.visitAll(element.inputs);
    this.visitAll(element.attributes);
    this.visitAll(element.children);
    this.visitAll(element.outputs);
  }
  override visitTemplate(template: TmplAstTemplate) {
    const templateIdentifier = this.elementOrTemplateToIdentifier(template);

    this.identifiers.add(templateIdentifier);

    this.visitAll(template.variables);
    this.visitAll(template.attributes);
    this.visitAll(template.templateAttrs);
    this.visitAll(template.children);
    this.visitAll(template.references);
  }
  override visitBoundAttribute(attribute: TmplAstBoundAttribute) {
    // If the bound attribute has no value, it cannot have any identifiers in the value expression.
    if (attribute.valueSpan === undefined) {
      return;
    }

    const identifiers = ExpressionVisitor.getIdentifiers(
        attribute.value, attribute.valueSpan.toString(), attribute.valueSpan.start.offset,
        this.boundTemplate, this.targetToIdentifier.bind(this));
    identifiers.forEach(id => this.identifiers.add(id));
  }
  override visitBoundEvent(attribute: TmplAstBoundEvent) {
    this.visitExpression(attribute.handler);
  }
  override visitBoundText(text: TmplAstBoundText) {
    this.visitExpression(text.value);
  }
  override visitReference(reference: TmplAstReference) {
    const referenceIdentifer = this.targetToIdentifier(reference);

    this.identifiers.add(referenceIdentifer);
  }
  override visitVariable(variable: TmplAstVariable) {
    const variableIdentifier = this.targetToIdentifier(variable);

    this.identifiers.add(variableIdentifier);
  }

  /** Creates an identifier for a template element or template node. */
  private elementOrTemplateToIdentifier(node: TmplAstElement|TmplAstTemplate): ElementIdentifier
      |TemplateNodeIdentifier {
    // If this node has already been seen, return the cached result.
    if (this.elementAndTemplateIdentifierCache.has(node)) {
      return this.elementAndTemplateIdentifierCache.get(node)!;
    }

    let name: string;
    let kind: IdentifierKind.Element|IdentifierKind.Template;
    if (node instanceof TmplAstTemplate) {
      name = node.tagName;
      kind = IdentifierKind.Template;
    } else {
      name = node.name;
      kind = IdentifierKind.Element;
    }
    const sourceSpan = node.startSourceSpan;
    // An element's or template's source span can be of the form `<element>`, `<element />`, or
    // `<element></element>`. Only the selector is interesting to the indexer, so the source is
    // searched for the first occurrence of the element (selector) name.
    const start = this.getStartLocation(name, sourceSpan);
    const absoluteSpan = new AbsoluteSourceSpan(start, start + name.length);

    // Record the nodes's attributes, which an indexer can later traverse to see if any of them
    // specify a used directive on the node.
    const attributes = node.attributes.map(({name, sourceSpan}): AttributeIdentifier => {
      return {
        name,
        span: new AbsoluteSourceSpan(sourceSpan.start.offset, sourceSpan.end.offset),
        kind: IdentifierKind.Attribute,
      };
    });
    const usedDirectives = this.boundTemplate.getDirectivesOfNode(node) || [];

    const identifier = {
      name,
      span: absoluteSpan,
      kind,
      attributes: new Set(attributes),
      usedDirectives: new Set(usedDirectives.map(dir => {
        return {
          node: dir.ref.node,
          selector: dir.selector,
        };
      })),
      // cast b/c pre-TypeScript 3.5 unions aren't well discriminated
    } as ElementIdentifier |
        TemplateNodeIdentifier;

    this.elementAndTemplateIdentifierCache.set(node, identifier);
    return identifier;
  }

  /** Creates an identifier for a template reference or template variable target. */
  private targetToIdentifier(node: TmplAstReference|TmplAstVariable): TargetIdentifier {
    // If this node has already been seen, return the cached result.
    if (this.targetIdentifierCache.has(node)) {
      return this.targetIdentifierCache.get(node)!;
    }

    const {name, sourceSpan} = node;
    const start = this.getStartLocation(name, sourceSpan);
    const span = new AbsoluteSourceSpan(start, start + name.length);
    let identifier: ReferenceIdentifier|VariableIdentifier;
    if (node instanceof TmplAstReference) {
      // If the node is a reference, we care about its target. The target can be an element, a
      // template, a directive applied on a template or element (in which case the directive field
      // is non-null), or nothing at all.
      const refTarget = this.boundTemplate.getReferenceTarget(node);
      let target = null;
      if (refTarget) {
        if (refTarget instanceof TmplAstElement || refTarget instanceof TmplAstTemplate) {
          target = {
            node: this.elementOrTemplateToIdentifier(refTarget),
            directive: null,
          };
        } else {
          target = {
            node: this.elementOrTemplateToIdentifier(refTarget.node),
            directive: refTarget.directive.ref.node,
          };
        }
      }

      identifier = {
        name,
        span,
        kind: IdentifierKind.Reference,
        target,
      };
    } else {
      identifier = {
        name,
        span,
        kind: IdentifierKind.Variable,
      };
    }

    this.targetIdentifierCache.set(node, identifier);
    return identifier;
  }

  /** Gets the start location of a string in a SourceSpan */
  private getStartLocation(name: string, context: ParseSourceSpan): number {
    const localStr = context.toString();
    if (!localStr.includes(name)) {
      throw new Error(`Impossible state: "${name}" not found in "${localStr}"`);
    }
    return context.start.offset + localStr.indexOf(name);
  }

  /**
   * Visits a node's expression and adds its identifiers, if any, to the visitor's state.
   * Only ASTs with information about the expression source and its location are visited.
   *
   * @param node node whose expression to visit
   */
  private visitExpression(ast: AST) {
    // Only include ASTs that have information about their source and absolute source spans.
    if (ast instanceof ASTWithSource && ast.source !== null) {
      // Make target to identifier mapping closure stateful to this visitor instance.
      const targetToIdentifier = this.targetToIdentifier.bind(this);
      const absoluteOffset = ast.sourceSpan.start;
      const identifiers = ExpressionVisitor.getIdentifiers(
          ast, ast.source, absoluteOffset, this.boundTemplate, targetToIdentifier);
      identifiers.forEach(id => this.identifiers.add(id));
    }
  }
}

/**
 * Traverses a template AST and builds identifiers discovered in it.
 *
 * @param boundTemplate bound template target, which can be used for querying expression targets.
 * @return identifiers in template
 */
export function getTemplateIdentifiers(boundTemplate: BoundTarget<ComponentMeta>):
    Set<TopLevelIdentifier> {
  const visitor = new TemplateVisitor(boundTemplate);
  if (boundTemplate.target.template !== undefined) {
    visitor.visitAll(boundTemplate.target.template);
  }
  return visitor.identifiers;
}
