/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  ASTWithSource,
  CombinedRecursiveAstVisitor,
  ImplicitReceiver,
  PropertyRead,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstReference,
  TmplAstTemplate,
  TmplAstVariable,
  tmplAstVisitAll,
} from '@angular/compiler';
import {AbsoluteSourceSpan, IdentifierKind} from './api';
/**
 * Visits the AST of a parsed Angular template. Discovers and stores
 * identifiers of interest, deferring to an `ExpressionVisitor` as needed.
 */
class TemplateVisitor extends CombinedRecursiveAstVisitor {
  boundTemplate;
  // Identifiers of interest found in the template.
  identifiers = new Set();
  errors = [];
  currentAstWithSource = null;
  // Map of targets in a template to their identifiers.
  targetIdentifierCache = new Map();
  // Map of elements and templates to their identifiers.
  directiveHostIdentifierCache = new Map();
  /**
   * Creates a template visitor for a bound template target. The bound target can be used when
   * deferred to the expression visitor to get information about the target of an expression.
   *
   * @param boundTemplate bound template target
   */
  constructor(boundTemplate) {
    super();
    this.boundTemplate = boundTemplate;
  }
  /**
   * Add an identifier for an HTML element and visit its children recursively.
   *
   * @param element
   */
  visitElement(element) {
    const elementIdentifier = this.directiveHostToIdentifier(element);
    if (elementIdentifier !== null) {
      this.identifiers.add(elementIdentifier);
    }
    super.visitElement(element);
  }
  visitTemplate(template) {
    const templateIdentifier = this.directiveHostToIdentifier(template);
    if (templateIdentifier !== null) {
      this.identifiers.add(templateIdentifier);
    }
    super.visitTemplate(template);
  }
  visitReference(reference) {
    const referenceIdentifier = this.targetToIdentifier(reference);
    if (referenceIdentifier !== null) {
      this.identifiers.add(referenceIdentifier);
    }
    super.visitReference(reference);
  }
  visitVariable(variable) {
    const variableIdentifier = this.targetToIdentifier(variable);
    if (variableIdentifier !== null) {
      this.identifiers.add(variableIdentifier);
    }
    super.visitVariable(variable);
  }
  visitLetDeclaration(decl) {
    const identifier = this.targetToIdentifier(decl);
    if (identifier !== null) {
      this.identifiers.add(identifier);
    }
    super.visitLetDeclaration(decl);
  }
  visitComponent(component) {
    const identifier = this.directiveHostToIdentifier(component);
    if (identifier !== null) {
      this.identifiers.add(identifier);
    }
    super.visitComponent(component);
  }
  visitDirective(directive) {
    const identifier = this.directiveHostToIdentifier(directive);
    if (identifier !== null) {
      this.identifiers.add(identifier);
    }
    super.visitDirective(directive);
  }
  visitPropertyRead(ast) {
    this.visitIdentifier(ast, IdentifierKind.Property);
    super.visitPropertyRead(ast, null);
  }
  visitBoundAttribute(attribute) {
    const previous = this.currentAstWithSource;
    this.currentAstWithSource = {
      source: attribute.valueSpan?.toString() || null,
      absoluteOffset: attribute.valueSpan ? attribute.valueSpan.start.offset : -1,
    };
    this.visit(attribute.value instanceof ASTWithSource ? attribute.value.ast : attribute.value);
    this.currentAstWithSource = previous;
  }
  /** Creates an identifier for a template element or template node. */
  directiveHostToIdentifier(node) {
    // If this node has already been seen, return the cached result.
    if (this.directiveHostIdentifierCache.has(node)) {
      return this.directiveHostIdentifierCache.get(node);
    }
    let name;
    let kind;
    if (node instanceof TmplAstTemplate) {
      name = node.tagName ?? 'ng-template';
      kind = IdentifierKind.Template;
    } else if (node instanceof TmplAstElement) {
      name = node.name;
      kind = IdentifierKind.Element;
    } else if (node instanceof TmplAstComponent) {
      name = node.fullName;
      kind = IdentifierKind.Component;
    } else {
      name = node.name;
      kind = IdentifierKind.Directive;
    }
    // Namespaced elements have a particular format for `node.name` that needs to be handled.
    // For example, an `<svg>` element has a `node.name` of `':svg:svg'`.
    // TODO(alxhub): properly handle namespaced elements
    if (
      (node instanceof TmplAstTemplate || node instanceof TmplAstElement) &&
      name.startsWith(':')
    ) {
      name = name.split(':').pop();
    }
    const sourceSpan = node.startSourceSpan;
    // An element's or template's source span can be of the form `<element>`, `<element />`, or
    // `<element></element>`. Only the selector is interesting to the indexer, so the source is
    // searched for the first occurrence of the element (selector) name.
    const start = this.getStartLocation(name, sourceSpan);
    if (start === null) {
      return null;
    }
    const absoluteSpan = new AbsoluteSourceSpan(start, start + name.length);
    // Record the nodes's attributes, which an indexer can later traverse to see if any of them
    // specify a used directive on the node.
    const attributes = node.attributes.map(({name, sourceSpan}) => {
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
      usedDirectives: new Set(
        usedDirectives.map((dir) => {
          return {
            node: dir.ref.node,
            selector: dir.selector,
          };
        }),
      ),
      // cast b/c pre-TypeScript 3.5 unions aren't well discriminated
    };
    this.directiveHostIdentifierCache.set(node, identifier);
    return identifier;
  }
  /** Creates an identifier for a template reference or template variable target. */
  targetToIdentifier(node) {
    // If this node has already been seen, return the cached result.
    if (this.targetIdentifierCache.has(node)) {
      return this.targetIdentifierCache.get(node);
    }
    const {name, sourceSpan} = node;
    const start = this.getStartLocation(name, sourceSpan);
    if (start === null) {
      return null;
    }
    const span = new AbsoluteSourceSpan(start, start + name.length);
    let identifier;
    if (node instanceof TmplAstReference) {
      // If the node is a reference, we care about its target. The target can be an element, a
      // template, a directive applied on a template or element (in which case the directive field
      // is non-null), or nothing at all.
      const refTarget = this.boundTemplate.getReferenceTarget(node);
      let target = null;
      if (refTarget) {
        let node = null;
        let directive = null;
        if (
          refTarget instanceof TmplAstElement ||
          refTarget instanceof TmplAstTemplate ||
          refTarget instanceof TmplAstComponent ||
          refTarget instanceof TmplAstDirective
        ) {
          node = this.directiveHostToIdentifier(refTarget);
        } else {
          node = this.directiveHostToIdentifier(refTarget.node);
          directive = refTarget.directive.ref.node;
        }
        if (node === null) {
          return null;
        }
        target = {
          node,
          directive,
        };
      }
      identifier = {
        name,
        span,
        kind: IdentifierKind.Reference,
        target,
      };
    } else if (node instanceof TmplAstVariable) {
      identifier = {
        name,
        span,
        kind: IdentifierKind.Variable,
      };
    } else {
      identifier = {
        name,
        span,
        kind: IdentifierKind.LetDeclaration,
      };
    }
    this.targetIdentifierCache.set(node, identifier);
    return identifier;
  }
  /** Gets the start location of a string in a SourceSpan */
  getStartLocation(name, context) {
    const localStr = context.toString();
    if (!localStr.includes(name)) {
      this.errors.push(new Error(`Impossible state: "${name}" not found in "${localStr}"`));
      return null;
    }
    return context.start.offset + localStr.indexOf(name);
  }
  /**
   * Visits a node's expression and adds its identifiers, if any, to the visitor's state.
   * Only ASTs with information about the expression source and its location are visited.
   *
   * @param node node whose expression to visit
   */
  visit(node) {
    if (node instanceof ASTWithSource) {
      const previous = this.currentAstWithSource;
      this.currentAstWithSource = {source: node.source, absoluteOffset: node.sourceSpan.start};
      super.visit(node.ast);
      this.currentAstWithSource = previous;
    } else {
      super.visit(node);
    }
  }
  /**
   * Visits an identifier, adding it to the identifier store if it is useful for indexing.
   *
   * @param ast expression AST the identifier is in
   * @param kind identifier kind
   */
  visitIdentifier(ast, kind) {
    // Only handle identifiers in expressions that have a source location.
    if (this.currentAstWithSource === null || this.currentAstWithSource.source === null) {
      return;
    }
    // The definition of a non-top-level property such as `bar` in `{{foo.bar}}` is currently
    // impossible to determine by an indexer and unsupported by the indexing module.
    // The indexing module also does not currently support references to identifiers declared in the
    // template itself, which have a non-null expression target.
    if (!(ast.receiver instanceof ImplicitReceiver)) {
      return;
    }
    const {absoluteOffset, source: expressionStr} = this.currentAstWithSource;
    // The source span of the requested AST starts at a location that is offset from the expression.
    let identifierStart = ast.sourceSpan.start - absoluteOffset;
    if (ast instanceof PropertyRead) {
      // For `PropertyRead` and the identifier starts at the `nameSpan`,
      // not necessarily the `sourceSpan`.
      identifierStart = ast.nameSpan.start - absoluteOffset;
    }
    if (!expressionStr.substring(identifierStart).startsWith(ast.name)) {
      this.errors.push(
        new Error(
          `Impossible state: "${ast.name}" not found in "${expressionStr}" at location ${identifierStart}`,
        ),
      );
      return;
    }
    // Join the relative position of the expression within a node with the absolute position
    // of the node to get the absolute position of the expression in the source code.
    const absoluteStart = absoluteOffset + identifierStart;
    const span = new AbsoluteSourceSpan(absoluteStart, absoluteStart + ast.name.length);
    const targetAst = this.boundTemplate.getExpressionTarget(ast);
    const target = targetAst ? this.targetToIdentifier(targetAst) : null;
    const identifier = {
      name: ast.name,
      span,
      kind,
      target,
    };
    this.identifiers.add(identifier);
  }
}
/**
 * Traverses a template AST and builds identifiers discovered in it.
 *
 * @param boundTemplate bound template target, which can be used for querying expression targets.
 * @return identifiers in template
 */
export function getTemplateIdentifiers(boundTemplate) {
  const visitor = new TemplateVisitor(boundTemplate);
  if (boundTemplate.target.template !== undefined) {
    tmplAstVisitAll(visitor, boundTemplate.target.template);
  }
  return {identifiers: visitor.identifiers, errors: visitor.errors};
}
//# sourceMappingURL=template.js.map
