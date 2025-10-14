/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export class ParseSpan {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  toAbsolute(absoluteOffset) {
    return new AbsoluteSourceSpan(absoluteOffset + this.start, absoluteOffset + this.end);
  }
}
export class AST {
  constructor(
    span,
    /**
     * Absolute location of the expression AST in a source code file.
     */
    sourceSpan,
  ) {
    this.span = span;
    this.sourceSpan = sourceSpan;
  }
  toString() {
    return 'AST';
  }
}
export class ASTWithName extends AST {
  constructor(span, sourceSpan, nameSpan) {
    super(span, sourceSpan);
    this.nameSpan = nameSpan;
  }
}
export class EmptyExpr extends AST {
  visit(visitor, context = null) {
    // do nothing
  }
}
export class ImplicitReceiver extends AST {
  visit(visitor, context = null) {
    return visitor.visitImplicitReceiver(this, context);
  }
}
/**
 * Receiver when something is accessed through `this` (e.g. `this.foo`). Note that this class
 * inherits from `ImplicitReceiver`, because accessing something through `this` is treated the
 * same as accessing it implicitly inside of an Angular template (e.g. `[attr.title]="this.title"`
 * is the same as `[attr.title]="title"`.). Inheriting allows for the `this` accesses to be treated
 * the same as implicit ones, except for a couple of exceptions like `$event` and `$any`.
 * TODO: we should find a way for this class not to extend from `ImplicitReceiver` in the future.
 */
export class ThisReceiver extends ImplicitReceiver {
  visit(visitor, context = null) {
    return visitor.visitThisReceiver?.(this, context);
  }
}
/**
 * Multiple expressions separated by a semicolon.
 */
export class Chain extends AST {
  constructor(span, sourceSpan, expressions) {
    super(span, sourceSpan);
    this.expressions = expressions;
  }
  visit(visitor, context = null) {
    return visitor.visitChain(this, context);
  }
}
export class Conditional extends AST {
  constructor(span, sourceSpan, condition, trueExp, falseExp) {
    super(span, sourceSpan);
    this.condition = condition;
    this.trueExp = trueExp;
    this.falseExp = falseExp;
  }
  visit(visitor, context = null) {
    return visitor.visitConditional(this, context);
  }
}
export class PropertyRead extends ASTWithName {
  constructor(span, sourceSpan, nameSpan, receiver, name) {
    super(span, sourceSpan, nameSpan);
    this.receiver = receiver;
    this.name = name;
  }
  visit(visitor, context = null) {
    return visitor.visitPropertyRead(this, context);
  }
}
export class SafePropertyRead extends ASTWithName {
  constructor(span, sourceSpan, nameSpan, receiver, name) {
    super(span, sourceSpan, nameSpan);
    this.receiver = receiver;
    this.name = name;
  }
  visit(visitor, context = null) {
    return visitor.visitSafePropertyRead(this, context);
  }
}
export class KeyedRead extends AST {
  constructor(span, sourceSpan, receiver, key) {
    super(span, sourceSpan);
    this.receiver = receiver;
    this.key = key;
  }
  visit(visitor, context = null) {
    return visitor.visitKeyedRead(this, context);
  }
}
export class SafeKeyedRead extends AST {
  constructor(span, sourceSpan, receiver, key) {
    super(span, sourceSpan);
    this.receiver = receiver;
    this.key = key;
  }
  visit(visitor, context = null) {
    return visitor.visitSafeKeyedRead(this, context);
  }
}
/** Possible types for a pipe. */
export var BindingPipeType;
(function (BindingPipeType) {
  /**
   * Pipe is being referenced by its name, for example:
   * `@Pipe({name: 'foo'}) class FooPipe` and `{{123 | foo}}`.
   */
  BindingPipeType[(BindingPipeType['ReferencedByName'] = 0)] = 'ReferencedByName';
  /**
   * Pipe is being referenced by its class name, for example:
   * `@Pipe() class FooPipe` and `{{123 | FooPipe}}`.
   */
  BindingPipeType[(BindingPipeType['ReferencedDirectly'] = 1)] = 'ReferencedDirectly';
})(BindingPipeType || (BindingPipeType = {}));
export class BindingPipe extends ASTWithName {
  constructor(span, sourceSpan, exp, name, args, type, nameSpan) {
    super(span, sourceSpan, nameSpan);
    this.exp = exp;
    this.name = name;
    this.args = args;
    this.type = type;
  }
  visit(visitor, context = null) {
    return visitor.visitPipe(this, context);
  }
}
export class LiteralPrimitive extends AST {
  constructor(span, sourceSpan, value) {
    super(span, sourceSpan);
    this.value = value;
  }
  visit(visitor, context = null) {
    return visitor.visitLiteralPrimitive(this, context);
  }
}
export class LiteralArray extends AST {
  constructor(span, sourceSpan, expressions) {
    super(span, sourceSpan);
    this.expressions = expressions;
  }
  visit(visitor, context = null) {
    return visitor.visitLiteralArray(this, context);
  }
}
export class LiteralMap extends AST {
  constructor(span, sourceSpan, keys, values) {
    super(span, sourceSpan);
    this.keys = keys;
    this.values = values;
  }
  visit(visitor, context = null) {
    return visitor.visitLiteralMap(this, context);
  }
}
export class Interpolation extends AST {
  constructor(span, sourceSpan, strings, expressions) {
    super(span, sourceSpan);
    this.strings = strings;
    this.expressions = expressions;
  }
  visit(visitor, context = null) {
    return visitor.visitInterpolation(this, context);
  }
}
export class Binary extends AST {
  constructor(span, sourceSpan, operation, left, right) {
    super(span, sourceSpan);
    this.operation = operation;
    this.left = left;
    this.right = right;
  }
  visit(visitor, context = null) {
    return visitor.visitBinary(this, context);
  }
  static isAssignmentOperation(op) {
    return (
      op === '=' ||
      op === '+=' ||
      op === '-=' ||
      op === '*=' ||
      op === '/=' ||
      op === '%=' ||
      op === '**=' ||
      op === '&&=' ||
      op === '||=' ||
      op === '??='
    );
  }
}
/**
 * For backwards compatibility reasons, `Unary` inherits from `Binary` and mimics the binary AST
 * node that was originally used. This inheritance relation can be deleted in some future major,
 * after consumers have been given a chance to fully support Unary.
 */
export class Unary extends Binary {
  /**
   * Creates a unary minus expression "-x", represented as `Binary` using "0 - x".
   */
  static createMinus(span, sourceSpan, expr) {
    return new Unary(
      span,
      sourceSpan,
      '-',
      expr,
      '-',
      new LiteralPrimitive(span, sourceSpan, 0),
      expr,
    );
  }
  /**
   * Creates a unary plus expression "+x", represented as `Binary` using "x - 0".
   */
  static createPlus(span, sourceSpan, expr) {
    return new Unary(
      span,
      sourceSpan,
      '+',
      expr,
      '-',
      expr,
      new LiteralPrimitive(span, sourceSpan, 0),
    );
  }
  /**
   * During the deprecation period this constructor is private, to avoid consumers from creating
   * a `Unary` with the fallback properties for `Binary`.
   */
  constructor(span, sourceSpan, operator, expr, binaryOp, binaryLeft, binaryRight) {
    super(span, sourceSpan, binaryOp, binaryLeft, binaryRight);
    this.operator = operator;
    this.expr = expr;
    // Redeclare the properties that are inherited from `Binary` as `never`, as consumers should not
    // depend on these fields when operating on `Unary`.
    this.left = null;
    this.right = null;
    this.operation = null;
  }
  visit(visitor, context = null) {
    if (visitor.visitUnary !== undefined) {
      return visitor.visitUnary(this, context);
    }
    return visitor.visitBinary(this, context);
  }
}
export class PrefixNot extends AST {
  constructor(span, sourceSpan, expression) {
    super(span, sourceSpan);
    this.expression = expression;
  }
  visit(visitor, context = null) {
    return visitor.visitPrefixNot(this, context);
  }
}
export class TypeofExpression extends AST {
  constructor(span, sourceSpan, expression) {
    super(span, sourceSpan);
    this.expression = expression;
  }
  visit(visitor, context = null) {
    return visitor.visitTypeofExpression(this, context);
  }
}
export class VoidExpression extends AST {
  constructor(span, sourceSpan, expression) {
    super(span, sourceSpan);
    this.expression = expression;
  }
  visit(visitor, context = null) {
    return visitor.visitVoidExpression(this, context);
  }
}
export class NonNullAssert extends AST {
  constructor(span, sourceSpan, expression) {
    super(span, sourceSpan);
    this.expression = expression;
  }
  visit(visitor, context = null) {
    return visitor.visitNonNullAssert(this, context);
  }
}
export class Call extends AST {
  constructor(span, sourceSpan, receiver, args, argumentSpan) {
    super(span, sourceSpan);
    this.receiver = receiver;
    this.args = args;
    this.argumentSpan = argumentSpan;
  }
  visit(visitor, context = null) {
    return visitor.visitCall(this, context);
  }
}
export class SafeCall extends AST {
  constructor(span, sourceSpan, receiver, args, argumentSpan) {
    super(span, sourceSpan);
    this.receiver = receiver;
    this.args = args;
    this.argumentSpan = argumentSpan;
  }
  visit(visitor, context = null) {
    return visitor.visitSafeCall(this, context);
  }
}
export class TaggedTemplateLiteral extends AST {
  constructor(span, sourceSpan, tag, template) {
    super(span, sourceSpan);
    this.tag = tag;
    this.template = template;
  }
  visit(visitor, context) {
    return visitor.visitTaggedTemplateLiteral(this, context);
  }
}
export class TemplateLiteral extends AST {
  constructor(span, sourceSpan, elements, expressions) {
    super(span, sourceSpan);
    this.elements = elements;
    this.expressions = expressions;
  }
  visit(visitor, context) {
    return visitor.visitTemplateLiteral(this, context);
  }
}
export class TemplateLiteralElement extends AST {
  constructor(span, sourceSpan, text) {
    super(span, sourceSpan);
    this.text = text;
  }
  visit(visitor, context) {
    return visitor.visitTemplateLiteralElement(this, context);
  }
}
export class ParenthesizedExpression extends AST {
  constructor(span, sourceSpan, expression) {
    super(span, sourceSpan);
    this.expression = expression;
  }
  visit(visitor, context) {
    return visitor.visitParenthesizedExpression(this, context);
  }
}
export class RegularExpressionLiteral extends AST {
  constructor(span, sourceSpan, body, flags) {
    super(span, sourceSpan);
    this.body = body;
    this.flags = flags;
  }
  visit(visitor, context) {
    return visitor.visitRegularExpressionLiteral(this, context);
  }
}
/**
 * Records the absolute position of a text span in a source file, where `start` and `end` are the
 * starting and ending byte offsets, respectively, of the text span in a source file.
 */
export class AbsoluteSourceSpan {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}
export class ASTWithSource extends AST {
  constructor(ast, source, location, absoluteOffset, errors) {
    super(
      new ParseSpan(0, source === null ? 0 : source.length),
      new AbsoluteSourceSpan(
        absoluteOffset,
        source === null ? absoluteOffset : absoluteOffset + source.length,
      ),
    );
    this.ast = ast;
    this.source = source;
    this.location = location;
    this.errors = errors;
  }
  visit(visitor, context = null) {
    if (visitor.visitASTWithSource) {
      return visitor.visitASTWithSource(this, context);
    }
    return this.ast.visit(visitor, context);
  }
  toString() {
    return `${this.source} in ${this.location}`;
  }
}
export class VariableBinding {
  /**
   * @param sourceSpan entire span of the binding.
   * @param key name of the LHS along with its span.
   * @param value optional value for the RHS along with its span.
   */
  constructor(sourceSpan, key, value) {
    this.sourceSpan = sourceSpan;
    this.key = key;
    this.value = value;
  }
}
export class ExpressionBinding {
  /**
   * @param sourceSpan entire span of the binding.
   * @param key binding name, like ngForOf, ngForTrackBy, ngIf, along with its
   * span. Note that the length of the span may not be the same as
   * `key.source.length`. For example,
   * 1. key.source = ngFor, key.span is for "ngFor"
   * 2. key.source = ngForOf, key.span is for "of"
   * 3. key.source = ngForTrackBy, key.span is for "trackBy"
   * @param value optional expression for the RHS.
   */
  constructor(sourceSpan, key, value) {
    this.sourceSpan = sourceSpan;
    this.key = key;
    this.value = value;
  }
}
export class RecursiveAstVisitor {
  visit(ast, context) {
    // The default implementation just visits every node.
    // Classes that extend RecursiveAstVisitor should override this function
    // to selectively visit the specified node.
    ast.visit(this, context);
  }
  visitUnary(ast, context) {
    this.visit(ast.expr, context);
  }
  visitBinary(ast, context) {
    this.visit(ast.left, context);
    this.visit(ast.right, context);
  }
  visitChain(ast, context) {
    this.visitAll(ast.expressions, context);
  }
  visitConditional(ast, context) {
    this.visit(ast.condition, context);
    this.visit(ast.trueExp, context);
    this.visit(ast.falseExp, context);
  }
  visitPipe(ast, context) {
    this.visit(ast.exp, context);
    this.visitAll(ast.args, context);
  }
  visitImplicitReceiver(ast, context) {}
  visitThisReceiver(ast, context) {}
  visitInterpolation(ast, context) {
    this.visitAll(ast.expressions, context);
  }
  visitKeyedRead(ast, context) {
    this.visit(ast.receiver, context);
    this.visit(ast.key, context);
  }
  visitLiteralArray(ast, context) {
    this.visitAll(ast.expressions, context);
  }
  visitLiteralMap(ast, context) {
    this.visitAll(ast.values, context);
  }
  visitLiteralPrimitive(ast, context) {}
  visitPrefixNot(ast, context) {
    this.visit(ast.expression, context);
  }
  visitTypeofExpression(ast, context) {
    this.visit(ast.expression, context);
  }
  visitVoidExpression(ast, context) {
    this.visit(ast.expression, context);
  }
  visitNonNullAssert(ast, context) {
    this.visit(ast.expression, context);
  }
  visitPropertyRead(ast, context) {
    this.visit(ast.receiver, context);
  }
  visitSafePropertyRead(ast, context) {
    this.visit(ast.receiver, context);
  }
  visitSafeKeyedRead(ast, context) {
    this.visit(ast.receiver, context);
    this.visit(ast.key, context);
  }
  visitCall(ast, context) {
    this.visit(ast.receiver, context);
    this.visitAll(ast.args, context);
  }
  visitSafeCall(ast, context) {
    this.visit(ast.receiver, context);
    this.visitAll(ast.args, context);
  }
  visitTemplateLiteral(ast, context) {
    // Iterate in the declaration order. Note that there will
    // always be one expression less than the number of elements.
    for (let i = 0; i < ast.elements.length; i++) {
      this.visit(ast.elements[i], context);
      const expression = i < ast.expressions.length ? ast.expressions[i] : null;
      if (expression !== null) {
        this.visit(expression, context);
      }
    }
  }
  visitTemplateLiteralElement(ast, context) {}
  visitTaggedTemplateLiteral(ast, context) {
    this.visit(ast.tag, context);
    this.visit(ast.template, context);
  }
  visitParenthesizedExpression(ast, context) {
    this.visit(ast.expression, context);
  }
  visitRegularExpressionLiteral(ast, context) {}
  // This is not part of the AstVisitor interface, just a helper method
  visitAll(asts, context) {
    for (const ast of asts) {
      this.visit(ast, context);
    }
  }
}
// Bindings
export class ParsedProperty {
  constructor(name, expression, type, sourceSpan, keySpan, valueSpan) {
    this.name = name;
    this.expression = expression;
    this.type = type;
    this.sourceSpan = sourceSpan;
    this.keySpan = keySpan;
    this.valueSpan = valueSpan;
    this.isLiteral = this.type === ParsedPropertyType.LITERAL_ATTR;
    this.isLegacyAnimation = this.type === ParsedPropertyType.LEGACY_ANIMATION;
    this.isAnimation = this.type === ParsedPropertyType.ANIMATION;
  }
}
export var ParsedPropertyType;
(function (ParsedPropertyType) {
  ParsedPropertyType[(ParsedPropertyType['DEFAULT'] = 0)] = 'DEFAULT';
  ParsedPropertyType[(ParsedPropertyType['LITERAL_ATTR'] = 1)] = 'LITERAL_ATTR';
  ParsedPropertyType[(ParsedPropertyType['LEGACY_ANIMATION'] = 2)] = 'LEGACY_ANIMATION';
  ParsedPropertyType[(ParsedPropertyType['TWO_WAY'] = 3)] = 'TWO_WAY';
  ParsedPropertyType[(ParsedPropertyType['ANIMATION'] = 4)] = 'ANIMATION';
})(ParsedPropertyType || (ParsedPropertyType = {}));
export var ParsedEventType;
(function (ParsedEventType) {
  // DOM or Directive event
  ParsedEventType[(ParsedEventType['Regular'] = 0)] = 'Regular';
  // Legacy animation specific event
  ParsedEventType[(ParsedEventType['LegacyAnimation'] = 1)] = 'LegacyAnimation';
  // Event side of a two-way binding (e.g. `[(property)]="expression"`).
  ParsedEventType[(ParsedEventType['TwoWay'] = 2)] = 'TwoWay';
  // Animation specific event
  ParsedEventType[(ParsedEventType['Animation'] = 3)] = 'Animation';
})(ParsedEventType || (ParsedEventType = {}));
export class ParsedEvent {
  constructor(name, targetOrPhase, type, handler, sourceSpan, handlerSpan, keySpan) {
    this.name = name;
    this.targetOrPhase = targetOrPhase;
    this.type = type;
    this.handler = handler;
    this.sourceSpan = sourceSpan;
    this.handlerSpan = handlerSpan;
    this.keySpan = keySpan;
  }
}
/**
 * ParsedVariable represents a variable declaration in a microsyntax expression.
 */
export class ParsedVariable {
  constructor(name, value, sourceSpan, keySpan, valueSpan) {
    this.name = name;
    this.value = value;
    this.sourceSpan = sourceSpan;
    this.keySpan = keySpan;
    this.valueSpan = valueSpan;
  }
}
export var BindingType;
(function (BindingType) {
  // A regular binding to a property (e.g. `[property]="expression"`).
  BindingType[(BindingType['Property'] = 0)] = 'Property';
  // A binding to an element attribute (e.g. `[attr.name]="expression"`).
  BindingType[(BindingType['Attribute'] = 1)] = 'Attribute';
  // A binding to a CSS class (e.g. `[class.name]="condition"`).
  BindingType[(BindingType['Class'] = 2)] = 'Class';
  // A binding to a style rule (e.g. `[style.rule]="expression"`).
  BindingType[(BindingType['Style'] = 3)] = 'Style';
  // A binding to a legacy animation reference (e.g. `[animate.key]="expression"`).
  BindingType[(BindingType['LegacyAnimation'] = 4)] = 'LegacyAnimation';
  // Property side of a two-way binding (e.g. `[(property)]="expression"`).
  BindingType[(BindingType['TwoWay'] = 5)] = 'TwoWay';
  // A binding to an animation CSS class or function (e.g. `[animate.leave]="expression"`).
  BindingType[(BindingType['Animation'] = 6)] = 'Animation';
})(BindingType || (BindingType = {}));
export class BoundElementProperty {
  constructor(name, type, securityContext, value, unit, sourceSpan, keySpan, valueSpan) {
    this.name = name;
    this.type = type;
    this.securityContext = securityContext;
    this.value = value;
    this.unit = unit;
    this.sourceSpan = sourceSpan;
    this.keySpan = keySpan;
    this.valueSpan = valueSpan;
  }
}
//# sourceMappingURL=ast.js.map
