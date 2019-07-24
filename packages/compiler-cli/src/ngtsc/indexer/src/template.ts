/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AST, ASTWithSource, BoundTarget, ImplicitReceiver, MethodCall, ParseSourceSpan, PropertyRead, PropertyWrite, RecursiveAstVisitor, TmplAstBoundAttribute, TmplAstBoundEvent, TmplAstBoundText, TmplAstElement, TmplAstNode, TmplAstRecursiveVisitor, TmplAstReference, TmplAstTemplate, TmplAstVariable} from '@angular/compiler';
import {AbsoluteSourceSpan, AttributeIdentifier, ElementIdentifier, IdentifierKind, MethodIdentifier, PropertyIdentifier, ReferenceIdentifier, TopLevelIdentifier, VariableIdentifier} from './api';
import {ComponentMeta} from './context';

/**
 * A parsed node in a template, which may have a name (if it is a selector) or
 * be anonymous (like a text span).
 */
interface HTMLNode extends TmplAstNode {
  tagName?: string;
  name?: string;
}

type ExpressionIdentifier = PropertyIdentifier | MethodIdentifier;
type ExpressionToIdentifierMap = Map<AST, ExpressionIdentifier>;
type TargetToIdentifierMap =
    Map<TmplAstReference|TmplAstVariable, ReferenceIdentifier|VariableIdentifier>;

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
      private readonly expressionToIdentifier: ExpressionToIdentifierMap) {
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
   * @param targetMap map of targets defined in templates to their identifiers.
   */
  static getIdentifiers(
      ast: AST, source: string, absoluteOffset: number, boundTemplate: BoundTarget<ComponentMeta>,
      expressionToIdentifier: ExpressionToIdentifierMap): TopLevelIdentifier[] {
    const visitor =
        new ExpressionVisitor(source, absoluteOffset, boundTemplate, expressionToIdentifier);
    visitor.visit(ast);
    return visitor.identifiers;
  }

  visit(ast: AST) { ast.visit(this); }

  visitMethodCall(ast: MethodCall, context: {}) {
    this.visitIdentifier(ast, IdentifierKind.Method);
    super.visitMethodCall(ast, context);
  }

  visitPropertyRead(ast: PropertyRead, context: {}) {
    this.visitIdentifier(ast, IdentifierKind.Property);
    super.visitPropertyRead(ast, context);
  }

  visitPropertyWrite(ast: PropertyWrite, context: {}) {
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

    // Get the location of the identifier of real interest.
    // The compiler's expression parser records the location of some expressions in a manner not
    // useful to the indexer. For example, a `MethodCall` `foo(a, b)` will record the span of the
    // entire method call, but the indexer is interested only in the method identifier.
    const localExpression = this.expressionStr.substr(ast.span.start);
    if (!localExpression.includes(ast.name)) {
      throw new Error(`Impossible state: "${ast.name}" not found in "${localExpression}"`);
    }
    const identifierStart = ast.span.start + localExpression.indexOf(ast.name);

    // Join the relative position of the expression within a node with the absolute position
    // of the node to get the absolute position of the expression in the source code.
    const absoluteStart = this.absoluteOffset + identifierStart;
    const span = new AbsoluteSourceSpan(absoluteStart, absoluteStart + ast.name.length);

    const identifier = {
      name: ast.name,
      span,
      kind,
    } as ExpressionIdentifier;

    this.expressionToIdentifier.set(ast, identifier);
    this.identifiers.push(identifier);
  }
}

/**
 * Visits the AST of a parsed Angular template. Discovers and stores
 * identifiers of interest, deferring to an `ExpressionVisitor` as needed.
 */
class TemplateVisitor extends TmplAstRecursiveVisitor {
  // identifiers of interest found in the template
  readonly identifiers = new Set<TopLevelIdentifier>();

  // Map of targets in a template to their identifiers.
  private readonly targetToIdentifier: TargetToIdentifierMap = new Map();
  // Map of expressions to to their identifiers, populated during template traversal and then
  // updated with references to expression target identifiers using `targetToIdentifier`.
  private readonly expressiontoIdentifier: ExpressionToIdentifierMap = new Map();

  /**
   * Creates a template visitor for a bound template target. The bound target can be used when
   * deferred to the expression visitor to get information about the target of an expression.
   *
   * @param boundTemplate bound template target
   */
  constructor(private boundTemplate: BoundTarget<ComponentMeta>) { super(); }

  /**
   * Processes an entire template's nodes and returns the identifiers discovered in it.
   */
  processTemplate(template: TmplAstNode[]): Set<TopLevelIdentifier> {
    this.visitAll(template);
    // Update expression identifiers with references to their targets' identifiers, which are known
    // after the entire template has been processed.
    for (const [expression, identifier] of Array.from(this.expressiontoIdentifier.entries())) {
      const target = this.boundTemplate.getExpressionTarget(expression);
      if (target) {
        const targetIdentifier = this.targetToIdentifier.get(target);
        if (!targetIdentifier) {
          throw new Error(`Target ${target.name} was not given an identifier.`);
        }
        identifier.target = targetIdentifier;
      }
    }
    return this.identifiers;
  }

  /**
   * Visits a node in the template.
   *
   * @param node node to visit
   */
  visit(node: HTMLNode) { node.visit(this); }

  visitAll(nodes: TmplAstNode[]) { nodes.forEach(node => this.visit(node)); }

  /**
   * Add an identifier for an HTML element and visit its children recursively.
   *
   * @param element
   */
  visitElement(element: TmplAstElement) {
    // Record the element's attributes, which an indexer can later traverse to see if any of them
    // specify a used directive on the element.
    const attributes = element.attributes.map(({name, sourceSpan}): AttributeIdentifier => {
      return {
        name,
        span: new AbsoluteSourceSpan(sourceSpan.start.offset, sourceSpan.end.offset),
        kind: IdentifierKind.Attribute,
      };
    });
    const usedDirectives = this.boundTemplate.getDirectivesOfNode(element) || [];
    const {name, sourceSpan} = element;
    // An element's source span can be of the form `<element>`, `<element />`, or
    // `<element></element>`. Only the selector is interesting to the indexer, so the source is
    // searched for the first occurrence of the element (selector) name.
    const start = this.getStartLocation(name, sourceSpan);
    const elId: ElementIdentifier = {
      name,
      span: new AbsoluteSourceSpan(start, start + name.length),
      kind: IdentifierKind.Element,
      attributes: new Set(attributes),
      usedDirectives: new Set(usedDirectives.map(dir => {
        return {
          node: dir.ref.node,
          selector: dir.selector,
        };
      })),
    };
    this.identifiers.add(elId);

    // Must visit references first so that the target map is populated.
    this.visitAll(element.references);

    this.visitAll(element.inputs);
    this.visitAll(element.attributes);
    this.visitAll(element.children);
    this.visitAll(element.outputs);
  }
  visitTemplate(template: TmplAstTemplate) {
    // Must visit variables first so that the target map is populated.
    this.visitAll(template.variables);

    this.visitAll(template.attributes);
    this.visitAll(template.templateAttrs);
    this.visitAll(template.children);
    this.visitAll(template.references);
  }
  visitBoundAttribute(attribute: TmplAstBoundAttribute) {
    // A BoundAttribute's value (the parent AST) may have subexpressions (children ASTs) that have
    // recorded spans extending past the recorded span of the parent. The most common example of
    // this is with `*ngFor`.
    // To resolve this, use the information on the BoundAttribute Template AST, which is always
    // correct, to determine locations of identifiers in the expression.
    //
    // TODO(ayazhafiz): Remove this when https://github.com/angular/angular/pull/31813 lands.
    const attributeSrc = attribute.sourceSpan.toString();
    const attributeAbsolutePosition = attribute.sourceSpan.start.offset;

    // Skip the bytes of the attribute name so that there are no collisions between the attribute
    // name and expression identifier names later.
    const nameSkipOffet = attributeSrc.indexOf(attribute.name) + attribute.name.length;
    const expressionSrc = attributeSrc.substring(nameSkipOffet);
    const expressionAbsolutePosition = attributeAbsolutePosition + nameSkipOffet;

    const identifiers = ExpressionVisitor.getIdentifiers(
        attribute.value, expressionSrc, expressionAbsolutePosition, this.boundTemplate,
        this.expressiontoIdentifier);
    identifiers.forEach(id => this.identifiers.add(id));
  }
  visitBoundEvent(attribute: TmplAstBoundEvent) { this.visitExpression(attribute.handler); }
  visitBoundText(text: TmplAstBoundText) { this.visitExpression(text.value); }
  visitReference(reference: TmplAstReference) {
    const {name, sourceSpan} = reference;
    const start = this.getStartLocation(name, sourceSpan);
    const referenceIdentifer: ReferenceIdentifier = {
      name,
      span: new AbsoluteSourceSpan(start, start + name.length),
      kind: IdentifierKind.Reference,
    };

    this.targetToIdentifier.set(reference, referenceIdentifer);
    this.identifiers.add(referenceIdentifer);
  }
  visitVariable(variable: TmplAstVariable) {
    const {name, sourceSpan} = variable;
    const start = this.getStartLocation(name, sourceSpan);
    const variableIdentifier: VariableIdentifier = {
      name,
      span: new AbsoluteSourceSpan(start, start + name.length),
      kind: IdentifierKind.Variable,
    };

    this.targetToIdentifier.set(variable, variableIdentifier);
    this.identifiers.add(variableIdentifier);
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
      const absoluteOffset = ast.sourceSpan.start;
      const identifiers = ExpressionVisitor.getIdentifiers(
          ast, ast.source, absoluteOffset, this.boundTemplate, this.expressiontoIdentifier);
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
  if (!boundTemplate.target.template) {
    return new Set();
  }
  return visitor.processTemplate(boundTemplate.target.template);
}
