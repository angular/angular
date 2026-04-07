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

/**
 * Comment attached to an AST node that serves as a guard to distinguish nodes
 * used for type checking host bindings from ones used for templates.
 */
const GUARD_COMMENT_TEXT = 'hostBindingsBlockGuard';

/** Represents information extracted from the source AST. */
export type SourceNode =
  | StaticSourceNode
  | {
      kind: 'unspecified';
      sourceSpan: ParseSourceSpan;
    };

/** A `SourceNode` which represents a static expression. */
export interface StaticSourceNode {
  kind: 'string' | 'identifier';
  /** Raw source code of the node (e.g. strings include the quotes). */
  source: string;
  /** Actual text of the node (e.g. value inside the quotes in strings). */
  text: string;
  /** Location information about the node. */
  sourceSpan: ParseSourceSpan;
}

/** A single binding inside the `host` object of a directive. */
export interface HostObjectLiteralBinding {
  /** Node representing the key of the binding. */
  key: SourceNode;
  /** Node representing the value of the binding. */
  value: SourceNode;
  /** Location information about the entire binding. */
  sourceSpan: ParseSourceSpan;
}

/** A single binding declared by a `@HostListener` decorator on a class member. */
export interface HostListenerDecorator {
  /** Node declaring the name of the event (e.g. first argument of `@HostListener`). */
  eventName: SourceNode | null;
  /** Node representing the name of the member that was decorated. */
  memberName: StaticSourceNode;
  /** Location information about the member that the decorator is set on. */
  memberSpan: ParseSourceSpan;
  /** Arguments passed to the event. */
  arguments: SourceNode[];
  /** Location information about the decorator. */
  decoratorSpan: ParseSourceSpan;
}

/** A single binding declared by the `@HostBinding` decorator on a class member. */
export interface HostBindingDecorator {
  /** Node representing the name of the member that was decorated. */
  memberName: StaticSourceNode;
  /** Location information about the member that the decorator is set on. */
  memberSpan: ParseSourceSpan;
  /** Arguments passed into the decorator */
  arguments: SourceNode[];
  /** Location information about the decorator. */
  decoratorSpan: ParseSourceSpan;
}

/**
 * Creates an AST node that represents the host element of a directive.
 * Can return null if there are no valid bindings to be checked.
 * @param meta Metadata used to construct the host element.
 */
export function createHostElement(
  type: 'component' | 'directive',
  selector: string | null,
  nameSpan: ParseSourceSpan,
  hostObjectLiteralBindings: HostObjectLiteralBinding[],
  hostBindingDecorators: HostBindingDecorator[],
  hostListenerDecorators: HostListenerDecorator[],
): TmplAstHostElement | null {
  const bindings: TmplAstBoundAttribute[] = [];
  const listeners: TmplAstBoundEvent[] = [];
  let parser: BindingParser | null = null;

  for (const binding of hostObjectLiteralBindings) {
    // We only support type checking of static bindings.
    parser ??= makeBindingParser();
    createNodeFromHostLiteralProperty(binding, parser, bindings, listeners);
  }

  for (const decorator of hostBindingDecorators) {
    createNodeFromBindingDecorator(decorator, bindings);
  }

  for (const decorator of hostListenerDecorators) {
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

  return new TmplAstHostElement(tagNames, bindings, listeners, nameSpan);
}

/**
 * Creates an AST node that can be used as a guard in `if` statements to distinguish TypeScript
 * nodes used for checking host bindings from ones used for checking templates.
 */
export function createHostBindingsBlockGuard(): string {
  // Note that the comment text is quite generic. This doesn't really matter, because it is
  // used only inside a TCB and there's no way for users to produce a comment there.
  // `true /*hostBindingsBlockGuard*/`.
  // Wrap the expression in parentheses to ensure that the comment is attached to the correct node.
  return `(true /*${GUARD_COMMENT_TEXT}*/)`;
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
  binding: HostObjectLiteralBinding,
  parser: BindingParser,
  bindings: TmplAstBoundAttribute[],
  listeners: TmplAstBoundEvent[],
): void {
  // TODO(crisbeto): surface parsing errors here, because currently they just get ignored.
  // They'll still get reported when the handler tries to parse the bindings, but here we
  // can highlight the nodes more accurately.
  const {key, value, sourceSpan} = binding;

  if (key.kind !== 'string' || value.kind !== 'string') {
    return;
  }

  if (key.text.startsWith('[') && key.text.endsWith(']')) {
    const {attrName, type} = inferBoundAttribute(key.text.slice(1, -1));
    const ast = parser.parseBinding(
      value.text,
      true,
      value.sourceSpan,
      value.sourceSpan.start.offset,
    );
    if (ast.errors.length > 0) {
      return; // See TODO above.
    }

    fixupSpans(ast, value);
    bindings.push(
      new TmplAstBoundAttribute(
        attrName,
        type,
        0,
        ast,
        null,
        sourceSpan,
        key.sourceSpan,
        value.sourceSpan,
        undefined,
      ),
    );
  } else if (key.text.startsWith('(') && key.text.endsWith(')')) {
    const events: ParsedEvent[] = [];

    parser.parseEvent(
      key.text.slice(1, -1),
      value.text,
      false,
      sourceSpan,
      value.sourceSpan,
      [],
      events,
      key.sourceSpan,
    );

    if (events.length === 0 || events[0].handler.errors.length > 0) {
      return; // See TODO above.
    }

    fixupSpans(events[0].handler, value);
    listeners.push(TmplAstBoundEvent.fromParsedEvent(events[0]));
  }
}

/**
 * If possible, creates and tracks a bound attribute node from a `HostBinding` decorator.
 * @param decorator Decorator from which to create the node.
 * @param bindings Array tracking the bound attributes of the host element.
 */
function createNodeFromBindingDecorator(
  decorator: HostBindingDecorator,
  bindings: TmplAstBoundAttribute[],
): void {
  const args = decorator.arguments;
  let nameNode: SourceNode;

  // The first parameter is optional. If omitted, the name
  // of the class member is used as the property.
  if (args.length === 0) {
    nameNode = decorator.memberName;
  } else if (args[0].kind === 'string') {
    nameNode = args[0];
  } else {
    return;
  }

  if (nameNode.kind !== 'string' && nameNode.kind !== 'identifier') {
    return;
  }

  // We can't synthesize a fake expression here and pass it through the binding parser, because
  // it constructs all the spans based on the source code origin and they aren't easily mappable
  // back to the source. E.g. `@HostBinding('foo') id = '123'` in source code would look
  // something like `[foo]="this.id"` in the AST. Instead we construct the expressions
  // manually here. Note that we use a dummy span with -1/-1 as offsets, because it isn't
  // used for type checking and constructing it accurately would take some effort.
  const span = new ParseSpan(-1, -1);
  const propertyStart = decorator.memberSpan.start.offset;
  const receiver = new ThisReceiver(span, new AbsoluteSourceSpan(propertyStart, propertyStart));
  const nameSpan = new AbsoluteSourceSpan(
    nameNode.sourceSpan.start.offset,
    nameNode.sourceSpan.end.offset,
  );
  const read =
    decorator.memberName.kind === 'string'
      ? new KeyedRead(
          span,
          nameSpan,
          receiver,
          new LiteralPrimitive(span, nameSpan, decorator.memberName.text),
        )
      : new PropertyRead(span, nameSpan, nameSpan, receiver, decorator.memberName.text);
  const {attrName, type} = inferBoundAttribute(nameNode.text);

  bindings.push(
    new TmplAstBoundAttribute(
      attrName,
      type,
      0,
      read,
      null,
      decorator.decoratorSpan,
      nameNode.sourceSpan,
      decorator.decoratorSpan,
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
  decorator: HostListenerDecorator,
  parser: BindingParser,
  listeners: TmplAstBoundEvent[],
): void {
  if (decorator.eventName === null || decorator.eventName.kind !== 'string') {
    return;
  }

  // We can't synthesize a fake expression here and pass it through the binding parser, because
  // it constructs all the spans based on the source code origin and they aren't easily mappable
  // back to the source. E.g. `@HostListener('foo') handleFoo() {}` in source code would look
  // something like `(foo)="handleFoo()"` in the AST. Instead we construct the expressions
  // manually here. Note that we use a dummy span with -1/-1 as offsets, because it isn't
  // used for type checking and constructing it accurately would take some effort.
  const dummySpan = new ParseSpan(-1, -1);
  const argNodes: AST[] = [];
  const methodStart = decorator.memberSpan.start.offset;
  const methodReceiver = new ThisReceiver(
    dummySpan,
    new AbsoluteSourceSpan(methodStart, methodStart),
  );
  const nameSpan = new AbsoluteSourceSpan(
    decorator.memberName.sourceSpan.start.offset,
    decorator.memberName.sourceSpan.end.offset,
  );
  const receiver =
    decorator.memberName.kind === 'string'
      ? new KeyedRead(
          dummySpan,
          nameSpan,
          methodReceiver,
          new LiteralPrimitive(dummySpan, nameSpan, decorator.memberName.text),
        )
      : new PropertyRead(dummySpan, nameSpan, nameSpan, methodReceiver, decorator.memberName.text);

  for (const arg of decorator.arguments) {
    // If the parameter is a static string, parse it using the binding parser since it can be any
    // expression, otherwise treat it as `any` so the rest of the parameters can be checked.
    if (arg.kind === 'string') {
      const span = arg.sourceSpan;
      const ast = parser.parseBinding(arg.text, true, span, span.start.offset);
      fixupSpans(ast, arg);
      argNodes.push(ast);
    } else {
      // Represents `$any(0)`. We need to construct it manually in order to set the right spans.
      const expressionSpan = new AbsoluteSourceSpan(
        arg.sourceSpan.start.offset,
        arg.sourceSpan.end.offset,
      );
      const anyRead = new PropertyRead(
        dummySpan,
        expressionSpan,
        expressionSpan,
        new ImplicitReceiver(dummySpan, expressionSpan),
        '$any',
      );
      const anyCall = new Call(
        dummySpan,
        expressionSpan,
        anyRead,
        [new LiteralPrimitive(dummySpan, expressionSpan, 0)],
        expressionSpan,
      );
      argNodes.push(anyCall);
    }
  }

  const callNode = new Call(dummySpan, nameSpan, receiver, argNodes, dummySpan);
  const eventNameNode = decorator.eventName;
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
      decorator.decoratorSpan,
      decorator.decoratorSpan,
      eventNameNode.sourceSpan,
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

/**
 * Adjusts the spans of a parsed AST so that they're appropriate for a host bindings context.
 * @param ast The parsed AST that may need to be adjusted.
 * @param initializer TypeScript node from which the source of the AST was extracted.
 */
function fixupSpans(ast: AST, node: StaticSourceNode): void {
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
  const escapeIndex = node.source.indexOf('\\', 1);

  if (escapeIndex > -1) {
    const start = node.sourceSpan.start.offset;
    const end = node.sourceSpan.end.offset;
    const newSpan = new ParseSpan(0, end - start);
    const newSourceSpan = new AbsoluteSourceSpan(start, end);
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
