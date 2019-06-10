/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, HtmlParser, Lexer, MethodCall, ParseSourceFile, PropertyRead, RecursiveAstVisitor, TmplAstNode, TokenType, visitAll} from '@angular/compiler';
import {BoundText, Element, Node, RecursiveVisitor as RecursiveTemplateVisitor, Template} from '@angular/compiler/src/render3/r3_ast';
import {htmlAstToRender3Ast} from '@angular/compiler/src/render3/r3_template_transform';
import {I18nMetaVisitor} from '@angular/compiler/src/render3/view/i18n/meta';
import {makeBindingParser} from '@angular/compiler/src/render3/view/template';
import {AbsoluteSourceSpan, IdentifierKind, RestoreTemplateOptions, TemplateIdentifier} from './api';

/**
 * A parsed node in a template, which may have a name (if it is a selector) or
 * be anonymous (like a text span).
 */
interface HTMLNode extends Node {
  tagName?: string;
  name?: string;
}

/**
 * Updates the location of an identifier to its real anchor in a source code.
 *
 * The compiler's expression parser records the location of some expressions in a manner not
 * useful to the indexer. For example, a `MethodCall` `foo(a, b)` will record the span of the
 * entire method call, but the indexer is interested only in the method identifier.
 *
 * To remedy all this, the visitor tokenizes the template node the expression was discovered in,
 * and updates the locations of entities found during expression traversal with those of the
 * tokens.
 *
 * TODO(ayazhafiz): Think about how to handle `PropertyRead`s in `BoundAttribute`s. The Lexer
 * tokenizes the attribute as a string and ignores quotes.
 *
 * @param entities entities to update
 * @param currentNode node expression was in
 */
function updateIdentifierSpans(identifiers: TemplateIdentifier[], currentNode: Node) {
  const localSpan = currentNode.sourceSpan;
  const localExpression = localSpan.toString();

  const lexedIdentifiers =
      new Lexer().tokenize(localExpression).filter(token => token.type === TokenType.Identifier);

  // Join the relative position of the expression within a node with the absolute position of the
  // node to get the absolute position of the expression in the source code.
  const absoluteOffset = currentNode.sourceSpan.start.offset;
  identifiers.forEach((id, index) => {
    const lexedId = lexedIdentifiers[index];
    if (id.name !== lexedId.strValue) {
      throw new Error(
          'Impossible state: lexed and parsed expression should contain the same tokens.');
    }

    const start = absoluteOffset + lexedId.index;
    const absoluteSpan = new AbsoluteSourceSpan(start, start + lexedId.strValue.length);
    id.span = absoluteSpan;
  });
}

/**
 * Visits the AST of an Angular template syntax expression, finding interesting
 * entities (variable references, etc.). Creates an array of Entities found in
 * the expression, with the location of the Entities being relative to the
 * expression.
 *
 * Visiting `text {{prop}}` will return `[TemplateIdentifier {name: 'prop', span: {start: 7, end:
 * 11}}]`.
 */
class ExpressionVisitor extends RecursiveAstVisitor {
  private readonly file: ParseSourceFile;

  private constructor(context: Node, readonly identifiers: TemplateIdentifier[] = []) {
    super();

    this.file = context.sourceSpan.start.file;
  }

  static getIdentifiers(ast: AST, context: Node): TemplateIdentifier[] {
    const visitor = new ExpressionVisitor(context);
    visitor.visit(ast);
    const identifiers = visitor.identifiers;

    updateIdentifierSpans(identifiers, context);

    return identifiers;
  }

  visit(ast: AST) { ast.visit(this); }

  visitMethodCall(ast: MethodCall, context: {}) {
    this.addIdentifier(ast, IdentifierKind.Method);
    super.visitMethodCall(ast, context);
  }

  visitPropertyRead(ast: PropertyRead, context: {}) {
    this.addIdentifier(ast, IdentifierKind.Property);
    super.visitPropertyRead(ast, context);
  }

  private addIdentifier(ast: AST&{name: string}, kind: IdentifierKind) {
    this.identifiers.push({
      name: ast.name,
      span: ast.span, kind,
      file: this.file,
    });
  }
}

/**
 * Visits the AST of a parsed Angular template. Discovers and stores
 * identifiers of interest, deferring to an `ExpressionVisitor` as needed.
 */
class TemplateVisitor extends RecursiveTemplateVisitor {
  // identifiers of interest found in the template
  readonly identifiers = new Set<TemplateIdentifier>();

  /**
   * Visits a node in the template.
   * @param node node to visit
   */
  visit(node: HTMLNode) { node.visit(this); }

  visitAll(nodes: Node[]) { nodes.forEach(node => this.visit(node)); }

  visitElement(element: Element) {
    this.visitAll(element.attributes);
    this.visitAll(element.children);
    this.visitAll(element.references);
  }
  visitTemplate(template: Template) {
    this.visitAll(template.attributes);
    this.visitAll(template.children);
    this.visitAll(template.references);
    this.visitAll(template.variables);
  }
  visitBoundText(text: BoundText) { this.addIdentifiers(text); }

  /**
   * Adds identifiers to the visitor's state.
   * @param visitedEntities interesting entities to add as identifiers
   * @param curretNode node entities were discovered in
   */
  private addIdentifiers(node: Node&{value: AST}) {
    const identifiers = ExpressionVisitor.getIdentifiers(node.value, node);
    identifiers.forEach(id => this.identifiers.add(id));
  }
}

/**
 * Unwraps and reparses a template, preserving whitespace and with no leading trivial characters.
 *
 * A template may previously have been parsed without preserving whitespace, and was definitely
 * parsed with leading trivial characters (see `parseTemplate` from the compiler package API).
 * Both of these are detrimental for indexing as they result in a manipulated AST not representing
 * the template source code.
 *
 * TODO(ayazhafiz): Remove once issues with `leadingTriviaChars` and `parseTemplate` are resolved.
 */
function restoreTemplate(template: TmplAstNode[], options: RestoreTemplateOptions): TmplAstNode[] {
  // try to recapture the template content and URL
  // if there was nothing in the template to begin with, this is just a no-op
  if (template.length === 0) {
    return [];
  }
  const {content: templateStr, url: templateUrl} = template[0].sourceSpan.start.file;

  options.preserveWhitespaces = true;
  const {interpolationConfig, preserveWhitespaces} = options;

  const bindingParser = makeBindingParser(interpolationConfig);
  const htmlParser = new HtmlParser();
  const parseResult = htmlParser.parse(templateStr, templateUrl, {
    ...options,
    tokenizeExpansionForms: true,
  });

  if (parseResult.errors && parseResult.errors.length > 0) {
    throw new Error('Impossible state: template must have been successfully parsed previously.');
  }

  const rootNodes = visitAll(
      new I18nMetaVisitor(interpolationConfig, !preserveWhitespaces), parseResult.rootNodes);

  const {nodes, errors} = htmlAstToRender3Ast(rootNodes, bindingParser);
  if (errors && errors.length > 0) {
    throw new Error('Impossible state: template must have been successfully parsed previously.');
  }

  return nodes;
}

/**
 * Traverses a template AST and builds identifiers discovered in it.
 * @param template template to extract indentifiers from
 * @param options options for restoring the parsed template to a indexable state
 * @return identifiers in template
 */
export function getTemplateIdentifiers(
    template: TmplAstNode[], options: RestoreTemplateOptions): Set<TemplateIdentifier> {
  const restoredTemplate = restoreTemplate(template, options);
  const visitor = new TemplateVisitor();
  visitor.visitAll(restoredTemplate);
  return visitor.identifiers;
}
