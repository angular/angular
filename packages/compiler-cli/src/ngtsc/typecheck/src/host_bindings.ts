/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  BindingType,
  CssSelector,
  makeBindingParser,
  ParsedEvent,
  ParseSourceSpan,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstHostElement,
  BindingParser,
  AbsoluteSourceSpan,
  ParseSpan,
  PropertyRead,
  ParsedEventType,
  Call,
  ThisReceiver,
  KeyedRead,
  LiteralPrimitive,
  AST,
  RecursiveAstVisitor,
  ASTWithName,
  SafeCall,
  ImplicitReceiver,
} from '@angular/compiler';
import ts from 'typescript';
import {createSourceSpan} from '../../annotations/common';
import {ClassDeclaration} from '../../reflection';

/**
 * Comment attached to an AST node that serves as a guard to distinguish nodes
 * used for type checking host bindings from ones used for templates.
 */
const GUARD_COMMENT_TEXT = 'hostBindingsBlockGuard';

/** Node that represent a static name of a member. */
type StaticName = ts.Identifier | ts.StringLiteralLike;

/** Property assignment node with a static name and initializer. */
type StaticPropertyAssignment = ts.PropertyAssignment & {
  name: StaticName;
  initializer: ts.StringLiteralLike;
};

/**
 * Creates an AST node that represents the host element of a directive.
 * Can return null if there are no valid bindings to be checked.
 * @param type Whether the host element is for a directive or a component.
 * @param selector Selector of the directive.
 * @param sourceNode Class declaration for the directive.
 * @param literal `host` object literal from the decorator.
 * @param bindingDecorators `HostBinding` decorators discovered on the node.
 * @param listenerDecorators `HostListener` decorators discovered on the node.
 */
export function createHostElement(
  type: 'component' | 'directive',
  selector: string | null,
  sourceNode: ClassDeclaration,
  literal: ts.ObjectLiteralExpression | null,
  bindingDecorators: Iterable<ts.Decorator>,
  listenerDecorators: Iterable<ts.Decorator>,
): TmplAstHostElement | null {
  const bindings: TmplAstBoundAttribute[] = [];
  const listeners: TmplAstBoundEvent[] = [];
  let parser: BindingParser | null = null;

  if (literal !== null) {
    for (const prop of literal.properties) {
      // We only support type checking of static bindings.
      if (
        ts.isPropertyAssignment(prop) &&
        ts.isStringLiteralLike(prop.initializer) &&
        isStaticName(prop.name)
      ) {
        parser ??= makeBindingParser();
        createNodeFromHostLiteralProperty(
          prop as StaticPropertyAssignment,
          parser,
          bindings,
          listeners,
        );
      }
    }
  }

  for (const decorator of bindingDecorators) {
    createNodeFromBindingDecorator(decorator, bindings);
  }

  for (const decorator of listenerDecorators) {
    parser ??= makeBindingParser();
    createNodeFromListenerDecorator(decorator, parser, listeners);
  }

  // The element will be a no-op if there are no bindings.
  if (bindings.length === 0 && listeners.length === 0) {
    return null;
  }

  const tagNames: string[] = [];

  if (selector !== null) {
    const parts = CssSelector.parse(selector);

    for (const part of parts) {
      if (part.element !== null) {
        tagNames.push(part.element);
      }
    }
  }

  // If none of the selectors have a tag name, fall back to `ng-component`/`ng-directive`.
  // This is how the runtime handles components without tag names as well.
  if (tagNames.length === 0) {
    tagNames.push(`ng-${type}`);
  }

  return new TmplAstHostElement(tagNames, bindings, listeners, createSourceSpan(sourceNode.name));
}

/**
 * Creates an AST node that can be used as a guard in `if` statements to distinguish TypeScript
 * nodes used for checking host bindings from ones used for checking templates.
 */
export function createHostBindingsBlockGuard(): ts.Expression {
  // Note that the comment text is quite generic. This doesn't really matter, because it is
  // used only inside a TCB and there's no way for users to produce a comment there.
  // `true /*hostBindings*/`.
  const trueExpr = ts.addSyntheticTrailingComment(
    ts.factory.createTrue(),
    ts.SyntaxKind.MultiLineCommentTrivia,
    GUARD_COMMENT_TEXT,
  );
  // Wrap the expression in parentheses to ensure that the comment is attached to the correct node.
  return ts.factory.createParenthesizedExpression(trueExpr);
}

/**
 * Determines if a given node is a guard that indicates that descendant nodes are used to check
 * host bindings.
 */
export function isHostBindingsBlockGuard(node: ts.Node): boolean {
  if (!ts.isIfStatement(node)) {
    return false;
  }

  // Needs to be kept in sync with `createHostBindingsMarker`.
  const expr = node.expression;
  if (!ts.isParenthesizedExpression(expr) || expr.expression.kind !== ts.SyntaxKind.TrueKeyword) {
    return false;
  }

  const text = expr.getSourceFile().text;
  return (
    ts.forEachTrailingCommentRange(
      text,
      expr.expression.getEnd(),
      (pos, end, kind) =>
        kind === ts.SyntaxKind.MultiLineCommentTrivia &&
        text.substring(pos + 2, end - 2) === GUARD_COMMENT_TEXT,
    ) || false
  );
}

/**
 * If possible, creates and tracks the relevant AST node for a binding declared
 * through a property on the `host` literal.
 * @param prop Property to parse.
 * @param parser Binding parser used to parse the expressions.
 * @param bindings Array tracking the bound attributes of the host element.
 * @param listeners Array tracking the event listeners of the host element.
 */
function createNodeFromHostLiteralProperty(
  property: StaticPropertyAssignment,
  parser: BindingParser,
  bindings: TmplAstBoundAttribute[],
  listeners: TmplAstBoundEvent[],
): void {
  // TODO(crisbeto): surface parsing errors here, because currently they just get ignored.
  // They'll still get reported when the handler tries to parse the bindings, but here we
  // can highlight the nodes more accurately.
  const {name, initializer} = property;

  if (name.text.startsWith('[') && name.text.endsWith(']')) {
    const {attrName, type} = inferBoundAttribute(name.text.slice(1, -1));
    const valueSpan = createStaticExpressionSpan(initializer);
    const ast = parser.parseBinding(initializer.text, true, valueSpan, valueSpan.start.offset);
    if (ast.errors.length > 0) {
      return; // See TODO above.
    }

    fixupSpans(ast, initializer);
    bindings.push(
      new TmplAstBoundAttribute(
        attrName,
        type,
        0,
        ast,
        null,
        createSourceSpan(property),
        createStaticExpressionSpan(name),
        valueSpan,
        undefined,
      ),
    );
  } else if (name.text.startsWith('(') && name.text.endsWith(')')) {
    const events: ParsedEvent[] = [];

    parser.parseEvent(
      name.text.slice(1, -1),
      initializer.text,
      false,
      createSourceSpan(property),
      createStaticExpressionSpan(initializer),
      [],
      events,
      createStaticExpressionSpan(name),
    );

    if (events.length === 0 || events[0].handler.errors.length > 0) {
      return; // See TODO above.
    }

    fixupSpans(events[0].handler, initializer);
    listeners.push(TmplAstBoundEvent.fromParsedEvent(events[0]));
  }
}

/**
 * If possible, creates and tracks a bound attribute node from a `HostBinding` decorator.
 * @param decorator Decorator from which to create the node.
 * @param bindings Array tracking the bound attributes of the host element.
 */
function createNodeFromBindingDecorator(
  decorator: ts.Decorator,
  bindings: TmplAstBoundAttribute[],
): void {
  // We only support decorators that are being called.
  if (!ts.isCallExpression(decorator.expression)) {
    return;
  }

  const args = decorator.expression.arguments;
  const property = decorator.parent;
  let nameNode: StaticName | null = null;
  let propertyName: StaticName | null = null;

  if (property && ts.isPropertyDeclaration(property) && isStaticName(property.name)) {
    propertyName = property.name;
  }

  // The first parameter is optional. If omitted, the name
  // of the class member is used as the property.
  if (args.length === 0) {
    nameNode = propertyName;
  } else if (ts.isStringLiteralLike(args[0])) {
    nameNode = args[0];
  } else {
    return;
  }

  if (nameNode === null || propertyName === null) {
    return;
  }

  // We can't synthesize a fake expression here and pass it through the binding parser, because
  // it constructs all the spans based on the source code origin and they aren't easily mappable
  // back to the source. E.g. `@HostBinding('foo') id = '123'` in source code would look
  // something like `[foo]="this.id"` in the AST. Instead we construct the expressions
  // manually here. Note that we use a dummy span with -1/-1 as offsets, because it isn't
  // used for type checking and constructing it accurately would take some effort.
  const span = new ParseSpan(-1, -1);
  const propertyStart = property.getStart();
  const receiver = new ThisReceiver(span, new AbsoluteSourceSpan(propertyStart, propertyStart));
  const nameSpan = new AbsoluteSourceSpan(propertyName.getStart(), propertyName.getEnd());
  const read = ts.isIdentifier(propertyName)
    ? new PropertyRead(span, nameSpan, nameSpan, receiver, propertyName.text)
    : new KeyedRead(
        span,
        nameSpan,
        receiver,
        new LiteralPrimitive(span, nameSpan, propertyName.text),
      );
  const {attrName, type} = inferBoundAttribute(nameNode.text);

  bindings.push(
    new TmplAstBoundAttribute(
      attrName,
      type,
      0,
      read,
      null,
      createSourceSpan(decorator),
      createStaticExpressionSpan(nameNode),
      createSourceSpan(decorator),
      undefined,
    ),
  );
}

/**
 * If possible, creates and tracks a bound event node from a `HostBinding` decorator.
 * @param decorator Decorator from which to create the node.
 * @param parser Binding parser used to parse the expressions.
 * @param bindings Array tracking the bound events of the host element.
 */
function createNodeFromListenerDecorator(
  decorator: ts.Decorator,
  parser: BindingParser,
  listeners: TmplAstBoundEvent[],
): void {
  // We only support decorators that are being called with at least one argument.
  if (!ts.isCallExpression(decorator.expression) || decorator.expression.arguments.length === 0) {
    return;
  }

  const args = decorator.expression.arguments;
  const method = decorator.parent;

  // Only handle decorators that are statically analyzable.
  if (
    !method ||
    !ts.isMethodDeclaration(method) ||
    !isStaticName(method.name) ||
    !ts.isStringLiteralLike(args[0])
  ) {
    return;
  }

  // We can't synthesize a fake expression here and pass it through the binding parser, because
  // it constructs all the spans based on the source code origin and they aren't easily mappable
  // back to the source. E.g. `@HostListener('foo') handleFoo() {}` in source code would look
  // something like `(foo)="handleFoo()"` in the AST. Instead we construct the expressions
  // manually here. Note that we use a dummy span with -1/-1 as offsets, because it isn't
  // used for type checking and constructing it accurately would take some effort.
  const span = new ParseSpan(-1, -1);
  const argNodes: AST[] = [];
  const methodStart = method.getStart();
  const methodReceiver = new ThisReceiver(span, new AbsoluteSourceSpan(methodStart, methodStart));
  const nameSpan = new AbsoluteSourceSpan(method.name.getStart(), method.name.getEnd());
  const receiver = ts.isIdentifier(method.name)
    ? new PropertyRead(span, nameSpan, nameSpan, methodReceiver, method.name.text)
    : new KeyedRead(
        span,
        nameSpan,
        methodReceiver,
        new LiteralPrimitive(span, nameSpan, method.name.text),
      );

  if (args.length > 1 && ts.isArrayLiteralExpression(args[1])) {
    for (const expr of args[1].elements) {
      // If the parameter is a static string, parse it using the binding parser since it can be any
      // expression, otherwise treat it as `any` so the rest of the parameters can be checked.
      if (ts.isStringLiteralLike(expr)) {
        const span = createStaticExpressionSpan(expr);
        const ast = parser.parseBinding(expr.text, true, span, span.start.offset);
        fixupSpans(ast, expr);
        argNodes.push(ast);
      } else {
        // Represents `$any(0)`. We need to construct it manually in order to set the right spans.
        const expressionSpan = new AbsoluteSourceSpan(expr.getStart(), expr.getEnd());
        const anyRead = new PropertyRead(
          span,
          expressionSpan,
          expressionSpan,
          new ImplicitReceiver(span, expressionSpan),
          '$any',
        );
        const anyCall = new Call(
          span,
          expressionSpan,
          anyRead,
          [new LiteralPrimitive(span, expressionSpan, 0)],
          expressionSpan,
        );
        argNodes.push(anyCall);
      }
    }
  }

  const callNode = new Call(span, nameSpan, receiver, argNodes, span);
  const eventNameNode = args[0];
  let type: ParsedEventType;
  let eventName: string;
  let phase: string | null;
  let target: string | null;

  if (eventNameNode.text.startsWith('@')) {
    const parsedName = parser.parseLegacyAnimationEventName(eventNameNode.text);
    type = ParsedEventType.LegacyAnimation;
    eventName = parsedName.eventName;
    phase = parsedName.phase;
    target = null;
  } else {
    const parsedName = parser.parseEventListenerName(eventNameNode.text);
    type = ParsedEventType.Regular;
    eventName = parsedName.eventName;
    target = parsedName.target;
    phase = null;
  }

  listeners.push(
    new TmplAstBoundEvent(
      eventName,
      type,
      callNode,
      target,
      phase,
      createSourceSpan(decorator),
      createSourceSpan(decorator),
      createStaticExpressionSpan(eventNameNode),
    ),
  );
}

/**
 * Infers the attribute name and binding type of a bound attribute based on its raw name.
 * @param name Name from which to infer the information.
 */
function inferBoundAttribute(name: string): {attrName: string; type: BindingType} {
  const attrPrefix = 'attr.';
  const classPrefix = 'class.';
  const stylePrefix = 'style.';
  const animationPrefix = 'animate.';
  const legacyAnimationPrefix = '@';
  let attrName: string;
  let type: BindingType;

  // Infer the binding type based on the prefix.
  if (name.startsWith(attrPrefix)) {
    attrName = name.slice(attrPrefix.length);
    type = BindingType.Attribute;
  } else if (name.startsWith(classPrefix)) {
    attrName = name.slice(classPrefix.length);
    type = BindingType.Class;
  } else if (name.startsWith(stylePrefix)) {
    attrName = name.slice(stylePrefix.length);
    type = BindingType.Style;
  } else if (name.startsWith(animationPrefix)) {
    attrName = name;
    type = BindingType.Animation;
  } else if (name.startsWith(legacyAnimationPrefix)) {
    attrName = name.slice(legacyAnimationPrefix.length);
    type = BindingType.LegacyAnimation;
  } else {
    attrName = name;
    type = BindingType.Property;
  }

  return {attrName, type};
}

/** Checks whether the specified node is a static name node. */
function isStaticName(node: ts.Node): node is StaticName {
  return ts.isIdentifier(node) || ts.isStringLiteralLike(node);
}

/** Creates a `ParseSourceSpan` pointing to a static expression AST node's source. */
function createStaticExpressionSpan(node: ts.StringLiteralLike | ts.Identifier): ParseSourceSpan {
  const span = createSourceSpan(node);

  // Offset by one on both sides to skip over the quotes.
  if (ts.isStringLiteralLike(node)) {
    span.fullStart = span.fullStart.moveBy(1);
    span.start = span.start.moveBy(1);
    span.end = span.end.moveBy(-1);
  }

  return span;
}

/**
 * Adjusts the spans of a parsed AST so that they're appropriate for a host bindings context.
 * @param ast The parsed AST that may need to be adjusted.
 * @param initializer TypeScript node from which the source of the AST was extracted.
 */
function fixupSpans(ast: AST, initializer: ts.StringLiteralLike): void {
  // When parsing the initializer as a property/event binding, we use `.text` which excludes escaped
  // quotes and is generally what we want, because preserving them would result in a parser error,
  // however it has the downside in that the spans of the expressions following the escaped
  // characters are no longer accurate relative to the source code. The more escaped characters
  // there are before a node, the more inaccurate its span will be. If we detect cases like that,
  // we override the spans of all nodes following the escaped string to point to the entire
  // initializer string so that we don't surface diagnostics with mangled spans. This isn't ideal,
  // but is likely rare in user code. Some workarounds that were attempted and ultimately discarded:
  // 1. Counting the number of escaped strings before a node and adjusting its span accordingly -
  // There's a prototype of this approach in https://github.com/crisbeto/angular/commit/1eb92353784a609f6be7e6653ae5a9faef549e6a
  // It works for the most part, but is complex and somewhat brittle, because it's not just the
  // escaped literals that need to be updated, but also any nodes _after_ them and any nodes
  // _containing_ them which gets increasingly complex with more complicated ASTs.
  // 2. Replacing escape characters with whitespaces, for example `\'foo\' + 123` would become
  // ` 'foo ' + 123` - this appears to produce accurate ASTs for some simpler use cases, but has
  // the potential of either changing the user's code into something that's no longer parseable or
  // causing type checking errors (e.g. the typings might require the exact string 'foo').
  // 3. Passing the raw text (e.g. `initializer.getText().slice(1, -1)`) into the binding parser -
  // This will preserve the right mappings, but can lead to parsing errors, because some of the
  // strings won't have to be escaped anymore. We could add a mode to the parser that allows it to
  // recover from such cases, but it'll introduce more complexity that we may not want to take on.
  // 4. Constructing some sort of string like `<host ${name.getText()}=${initializer.getText()}/>`,
  // passing it through the HTML parser and extracting the first attribute from it - wasn't explored
  // much, but likely has the same issues as approach #3.
  const escapeIndex = initializer.getText().indexOf('\\', 1);

  if (escapeIndex > -1) {
    const newSpan = new ParseSpan(0, initializer.getWidth());
    const newSourceSpan = new AbsoluteSourceSpan(initializer.getStart(), initializer.getEnd());
    ast.visit(new ReplaceSpanVisitor(escapeIndex, newSpan, newSourceSpan));
  }
}

/**
 * Visitor that replaces the spans of all nodes with new ones,
 * if they're defined after a specific index.
 */
class ReplaceSpanVisitor extends RecursiveAstVisitor {
  constructor(
    private readonly afterIndex: number,
    private readonly overrideSpan: ParseSpan,
    private readonly overrideSourceSpan: AbsoluteSourceSpan,
  ) {
    super();
  }

  override visit(ast: AST) {
    // Only nodes after the index need to be adjusted, but all nodes should be visited.
    if (ast.span.start >= this.afterIndex || ast.span.end >= this.afterIndex) {
      ast.span = this.overrideSpan;
      ast.sourceSpan = this.overrideSourceSpan;

      if (ast instanceof ASTWithName) {
        ast.nameSpan = this.overrideSourceSpan;
      }

      if (ast instanceof Call || ast instanceof SafeCall) {
        ast.argumentSpan = this.overrideSourceSpan;
      }
    }
    super.visit(ast);
  }
}
