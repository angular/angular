/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '../core';
import {ParseSourceSpan} from '../parse_util';

export class ParserError {
  public message: string;
  constructor(
      message: string, public input: string, public errLocation: string, public ctxLocation?: any) {
    this.message = `Parser Error: ${message} ${errLocation} [${input}] in ${ctxLocation}`;
  }
}

export class ParseSpan {
  constructor(public start: number, public end: number) {}
}

export abstract class AST {
  constructor(public span: ParseSpan) {}
  abstract visit<R>(visitor: AstVisitor<R>, context?: any): R;
  toString(): string { return 'AST'; }
}

/**
 * Represents a quoted expression of the form:
 *
 * quote = prefix `:` uninterpretedExpression
 * prefix = identifier
 * uninterpretedExpression = arbitrary string
 *
 * A quoted expression is meant to be pre-processed by an AST transformer that
 * converts it into another AST that no longer contains quoted expressions.
 * It is meant to allow third-party developers to extend Angular template
 * expression language. The `uninterpretedExpression` part of the quote is
 * therefore not interpreted by the Angular's own expression parser.
 */
export class Quote extends AST {
  constructor(
      span: ParseSpan, public prefix: string, public uninterpretedExpression: string,
      public location: any) {
    super(span);
  }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitQuote(this, context);
  }
  toString(): string { return 'Quote'; }
}

export class EmptyExpr extends AST {
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitEmptyExpr(this, context);
  }
}

export class ImplicitReceiver extends AST {
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitImplicitReceiver(this, context);
  }
}

/**
 * Multiple expressions separated by a semicolon.
 */
export class Chain extends AST {
  constructor(span: ParseSpan, public expressions: any[]) { super(span); }
  visit<R>(visitor: AstVisitor<R>, context: any = null): any {
    return visitor.visitChain(this, context);
  }
}

export class Conditional extends AST {
  constructor(span: ParseSpan, public condition: AST, public trueExp: AST, public falseExp: AST) {
    super(span);
  }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitConditional(this, context);
  }
}

export class PropertyRead extends AST {
  constructor(span: ParseSpan, public receiver: AST, public name: string) { super(span); }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitPropertyRead(this, context);
  }
}

export class PropertyWrite extends AST {
  constructor(span: ParseSpan, public receiver: AST, public name: string, public value: AST) {
    super(span);
  }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitPropertyWrite(this, context);
  }
}

export class SafePropertyRead extends AST {
  constructor(span: ParseSpan, public receiver: AST, public name: string) { super(span); }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitSafePropertyRead(this, context);
  }
}

export class KeyedRead extends AST {
  constructor(span: ParseSpan, public obj: AST, public key: AST) { super(span); }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitKeyedRead(this, context);
  }
}

export class KeyedWrite extends AST {
  constructor(span: ParseSpan, public obj: AST, public key: AST, public value: AST) { super(span); }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitKeyedWrite(this, context);
  }
}

export class BindingPipe extends AST {
  constructor(span: ParseSpan, public exp: AST, public name: string, public args: any[]) {
    super(span);
  }
  visit<R>(visitor: AstVisitor<R>, context: any = null): any {
    return visitor.visitPipe(this, context);
  }
}

export class LiteralPrimitive extends AST {
  constructor(span: ParseSpan, public value: any) { super(span); }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitLiteralPrimitive(this, context);
  }
}

export class LiteralArray extends AST {
  constructor(span: ParseSpan, public expressions: any[]) { super(span); }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitLiteralArray(this, context);
  }
}

export type LiteralMapKey = {
  key: string; quoted: boolean;
};

export class LiteralMap extends AST {
  constructor(span: ParseSpan, public keys: LiteralMapKey[], public values: any[]) { super(span); }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitLiteralMap(this, context);
  }
}

export class Interpolation extends AST {
  constructor(span: ParseSpan, public strings: any[], public expressions: any[]) { super(span); }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitInterpolation(this, context);
  }
}

export class Binary extends AST {
  constructor(span: ParseSpan, public operation: string, public left: AST, public right: AST) {
    super(span);
  }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitBinary(this, context);
  }
}

export class PrefixNot extends AST {
  constructor(span: ParseSpan, public expression: AST) { super(span); }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitPrefixNot(this, context);
  }
}

export class NonNullAssert extends AST {
  constructor(span: ParseSpan, public expression: AST) { super(span); }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitNonNullAssert(this, context);
  }
}

export class MethodCall extends AST {
  constructor(span: ParseSpan, public receiver: AST, public name: string, public args: any[]) {
    super(span);
  }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitMethodCall(this, context);
  }
}

export class SafeMethodCall extends AST {
  constructor(span: ParseSpan, public receiver: AST, public name: string, public args: any[]) {
    super(span);
  }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitSafeMethodCall(this, context);
  }
}

export class FunctionCall extends AST {
  constructor(span: ParseSpan, public target: AST|null, public args: any[]) { super(span); }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    return visitor.visitFunctionCall(this, context);
  }
}

export class ASTWithSource extends AST {
  constructor(
      public ast: AST, public source: string|null, public location: string,
      public errors: ParserError[]) {
    super(new ParseSpan(0, source == null ? 0 : source.length));
  }
  visit<R>(visitor: AstVisitor<R>, context: any = null): R {
    if (visitor.visitASTWithSource) {
      return visitor.visitASTWithSource(this, context);
    }
    return this.ast.visit(visitor, context);
  }
  toString(): string { return `${this.source} in ${this.location}`; }
}

export class TemplateBinding {
  constructor(
      public span: ParseSpan, public key: string, public keyIsVar: boolean, public name: string,
      public expression: ASTWithSource|null) {}
}

export interface AstVisitor<R> {
  visitBinary(ast: Binary, context: any): R;
  visitChain(ast: Chain, context: any): R;
  visitConditional(ast: Conditional, context: any): R;
  visitEmptyExpr(ast: EmptyExpr, context: any): R;
  visitFunctionCall(ast: FunctionCall, context: any): R;
  visitImplicitReceiver(ast: ImplicitReceiver, context: any): R;
  visitInterpolation(ast: Interpolation, context: any): R;
  visitKeyedRead(ast: KeyedRead, context: any): R;
  visitKeyedWrite(ast: KeyedWrite, context: any): R;
  visitLiteralArray(ast: LiteralArray, context: any): R;
  visitLiteralMap(ast: LiteralMap, context: any): R;
  visitLiteralPrimitive(ast: LiteralPrimitive, context: any): R;
  visitMethodCall(ast: MethodCall, context: any): R;
  visitPipe(ast: BindingPipe, context: any): R;
  visitPrefixNot(ast: PrefixNot, context: any): R;
  visitNonNullAssert(ast: NonNullAssert, context: any): R;
  visitPropertyRead(ast: PropertyRead, context: any): R;
  visitPropertyWrite(ast: PropertyWrite, context: any): R;
  visitQuote(ast: Quote, context: any): R;
  visitSafeMethodCall(ast: SafeMethodCall, context: any): R;
  visitSafePropertyRead(ast: SafePropertyRead, context: any): R;
  visitASTWithSource?(ast: ASTWithSource, context: any): R;
  visit?(ast: AST, context?: any): R;
}

export class NullAstVisitor implements AstVisitor<void> {
  visitBinary(ast: Binary, context: any): void {}
  visitChain(ast: Chain, context: any): void {}
  visitConditional(ast: Conditional, context: any): void {}
  visitEmptyExpr(ast: EmptyExpr, context: any): void {}
  visitFunctionCall(ast: FunctionCall, context: any): void {}
  visitImplicitReceiver(ast: ImplicitReceiver, context: any): void {}
  visitInterpolation(ast: Interpolation, context: any): void {}
  visitKeyedRead(ast: KeyedRead, context: any): void {}
  visitKeyedWrite(ast: KeyedWrite, context: any): void {}
  visitLiteralArray(ast: LiteralArray, context: any): void {}
  visitLiteralMap(ast: LiteralMap, context: any): void {}
  visitLiteralPrimitive(ast: LiteralPrimitive, context: any): void {}
  visitMethodCall(ast: MethodCall, context: any): void {}
  visitPipe(ast: BindingPipe, context: any): void {}
  visitPrefixNot(ast: PrefixNot, context: any): void {}
  visitNonNullAssert(ast: NonNullAssert, context: any): void {}
  visitPropertyRead(ast: PropertyRead, context: any): void {}
  visitPropertyWrite(ast: PropertyWrite, context: any): void {}
  visitQuote(ast: Quote, context: any): void {}
  visitSafeMethodCall(ast: SafeMethodCall, context: any): void {}
  visitSafePropertyRead(ast: SafePropertyRead, context: any): void {}
}

export class RecursiveAstVisitor implements AstVisitor<null> {
  visitBinary(ast: Binary, context: any): null {
    ast.left.visit(this, context);
    ast.right.visit(this, context);
    return null;
  }
  visitChain(ast: Chain, context: any): null { return this.visitAll(ast.expressions, context); }
  visitConditional(ast: Conditional, context: any): null {
    ast.condition.visit(this, context);
    ast.trueExp.visit(this, context);
    ast.falseExp.visit(this, context);
    return null;
  }
  visitEmptyExpr(ast: EmptyExpr, context: any): null { return null; }
  visitPipe(ast: BindingPipe, context: any): null {
    ast.exp.visit(this, context);
    this.visitAll(ast.args, context);
    return null;
  }
  visitFunctionCall(ast: FunctionCall, context: any): null {
    ast.target !.visit(this, context);
    this.visitAll(ast.args, context);
    return null;
  }
  visitImplicitReceiver(ast: ImplicitReceiver, context: any): null { return null; }
  visitInterpolation(ast: Interpolation, context: any): null {
    return this.visitAll(ast.expressions, context);
  }
  visitKeyedRead(ast: KeyedRead, context: any): null {
    ast.obj.visit(this, context);
    ast.key.visit(this, context);
    return null;
  }
  visitKeyedWrite(ast: KeyedWrite, context: any): null {
    ast.obj.visit(this, context);
    ast.key.visit(this, context);
    ast.value.visit(this, context);
    return null;
  }
  visitLiteralArray(ast: LiteralArray, context: any): null {
    return this.visitAll(ast.expressions, context);
  }
  visitLiteralMap(ast: LiteralMap, context: any): null {
    return this.visitAll(ast.values, context);
  }
  visitLiteralPrimitive(ast: LiteralPrimitive, context: any): null { return null; }
  visitMethodCall(ast: MethodCall, context: any): null {
    ast.receiver.visit(this, context);
    return this.visitAll(ast.args, context);
  }
  visitPrefixNot(ast: PrefixNot, context: any): null {
    ast.expression.visit(this, context);
    return null;
  }
  visitNonNullAssert(ast: NonNullAssert, context: any): null {
    ast.expression.visit(this, context);
    return null;
  }
  visitPropertyRead(ast: PropertyRead, context: any): null {
    ast.receiver.visit(this, context);
    return null;
  }
  visitPropertyWrite(ast: PropertyWrite, context: any): null {
    ast.receiver.visit(this, context);
    ast.value.visit(this, context);
    return null;
  }
  visitSafePropertyRead(ast: SafePropertyRead, context: any): null {
    ast.receiver.visit(this, context);
    return null;
  }
  visitSafeMethodCall(ast: SafeMethodCall, context: any): null {
    ast.receiver.visit(this, context);
    return this.visitAll(ast.args, context);
  }
  visitAll(asts: AST[], context: any): null {
    asts.forEach(ast => ast.visit(this, context));
    return null;
  }
  visitQuote(ast: Quote, context: any): null { return null; }
}

export class AstTransformer implements AstVisitor<AST> {
  visitImplicitReceiver(ast: ImplicitReceiver, context: any): AST { return ast; }

  visitInterpolation(ast: Interpolation, context: any): AST {
    return new Interpolation(ast.span, ast.strings, this.visitAll(ast.expressions));
  }

  visitLiteralPrimitive(ast: LiteralPrimitive, context: any): AST {
    return new LiteralPrimitive(ast.span, ast.value);
  }

  visitPropertyRead(ast: PropertyRead, context: any): AST {
    return new PropertyRead(ast.span, ast.receiver.visit(this), ast.name);
  }

  visitPropertyWrite(ast: PropertyWrite, context: any): AST {
    return new PropertyWrite(ast.span, ast.receiver.visit(this), ast.name, ast.value.visit(this));
  }

  visitSafePropertyRead(ast: SafePropertyRead, context: any): AST {
    return new SafePropertyRead(ast.span, ast.receiver.visit(this), ast.name);
  }

  visitMethodCall(ast: MethodCall, context: any): AST {
    return new MethodCall(ast.span, ast.receiver.visit(this), ast.name, this.visitAll(ast.args));
  }

  visitSafeMethodCall(ast: SafeMethodCall, context: any): AST {
    return new SafeMethodCall(
        ast.span, ast.receiver.visit(this), ast.name, this.visitAll(ast.args));
  }

  visitFunctionCall(ast: FunctionCall, context: any): AST {
    return new FunctionCall(ast.span, ast.target !.visit(this), this.visitAll(ast.args));
  }

  visitLiteralArray(ast: LiteralArray, context: any): AST {
    return new LiteralArray(ast.span, this.visitAll(ast.expressions));
  }

  visitLiteralMap(ast: LiteralMap, context: any): AST {
    return new LiteralMap(ast.span, ast.keys, this.visitAll(ast.values));
  }

  visitBinary(ast: Binary, context: any): AST {
    return new Binary(ast.span, ast.operation, ast.left.visit(this), ast.right.visit(this));
  }

  visitPrefixNot(ast: PrefixNot, context: any): AST {
    return new PrefixNot(ast.span, ast.expression.visit(this));
  }

  visitNonNullAssert(ast: NonNullAssert, context: any): AST {
    return new NonNullAssert(ast.span, ast.expression.visit(this));
  }

  visitConditional(ast: Conditional, context: any): AST {
    return new Conditional(
        ast.span, ast.condition.visit(this), ast.trueExp.visit(this), ast.falseExp.visit(this));
  }

  visitPipe(ast: BindingPipe, context: any): AST {
    return new BindingPipe(ast.span, ast.exp.visit(this), ast.name, this.visitAll(ast.args));
  }

  visitKeyedRead(ast: KeyedRead, context: any): AST {
    return new KeyedRead(ast.span, ast.obj.visit(this), ast.key.visit(this));
  }

  visitKeyedWrite(ast: KeyedWrite, context: any): AST {
    return new KeyedWrite(
        ast.span, ast.obj.visit(this), ast.key.visit(this), ast.value.visit(this));
  }

  visitEmptyExpr(ast: EmptyExpr, context: any): AST { return ast; }

  visitAll(asts: AST[]): AST[] {
    const res: AST[] = new Array(asts.length);
    for (let i = 0; i < asts.length; ++i) {
      res[i] = asts[i].visit(this);
    }
    return res;
  }

  visitChain(ast: Chain, context: any): AST {
    return new Chain(ast.span, this.visitAll(ast.expressions));
  }

  visitQuote(ast: Quote, context: any): AST {
    return new Quote(ast.span, ast.prefix, ast.uninterpretedExpression, ast.location);
  }
}

// A transformer that only creates new nodes if the transformer makes a change or
// a change is made a child node.
export class AstMemoryEfficientTransformer implements AstVisitor<AST> {
  visitImplicitReceiver(ast: ImplicitReceiver, context: any): AST { return ast; }

  visitInterpolation(ast: Interpolation, context: any): Interpolation {
    const expressions = this.visitAll(ast.expressions);
    if (expressions !== ast.expressions)
      return new Interpolation(ast.span, ast.strings, expressions);
    return ast;
  }

  visitLiteralPrimitive(ast: LiteralPrimitive, context: any): AST { return ast; }

  visitPropertyRead(ast: PropertyRead, context: any): AST {
    const receiver = ast.receiver.visit(this);
    if (receiver !== ast.receiver) {
      return new PropertyRead(ast.span, receiver, ast.name);
    }
    return ast;
  }

  visitPropertyWrite(ast: PropertyWrite, context: any): AST {
    const receiver = ast.receiver.visit(this);
    const value = ast.value.visit(this);
    if (receiver !== ast.receiver || value !== ast.value) {
      return new PropertyWrite(ast.span, receiver, ast.name, value);
    }
    return ast;
  }

  visitSafePropertyRead(ast: SafePropertyRead, context: any): AST {
    const receiver = ast.receiver.visit(this);
    if (receiver !== ast.receiver) {
      return new SafePropertyRead(ast.span, receiver, ast.name);
    }
    return ast;
  }

  visitMethodCall(ast: MethodCall, context: any): AST {
    const receiver = ast.receiver.visit(this);
    const args = this.visitAll(ast.args);
    if (receiver !== ast.receiver || args !== ast.args) {
      return new MethodCall(ast.span, receiver, ast.name, args);
    }
    return ast;
  }

  visitSafeMethodCall(ast: SafeMethodCall, context: any): AST {
    const receiver = ast.receiver.visit(this);
    const args = this.visitAll(ast.args);
    if (receiver !== ast.receiver || args !== ast.args) {
      return new SafeMethodCall(ast.span, receiver, ast.name, args);
    }
    return ast;
  }

  visitFunctionCall(ast: FunctionCall, context: any): AST {
    const target = ast.target && ast.target.visit(this);
    const args = this.visitAll(ast.args);
    if (target !== ast.target || args !== ast.args) {
      return new FunctionCall(ast.span, target, args);
    }
    return ast;
  }

  visitLiteralArray(ast: LiteralArray, context: any): AST {
    const expressions = this.visitAll(ast.expressions);
    if (expressions !== ast.expressions) {
      return new LiteralArray(ast.span, expressions);
    }
    return ast;
  }

  visitLiteralMap(ast: LiteralMap, context: any): AST {
    const values = this.visitAll(ast.values);
    if (values !== ast.values) {
      return new LiteralMap(ast.span, ast.keys, values);
    }
    return ast;
  }

  visitBinary(ast: Binary, context: any): AST {
    const left = ast.left.visit(this);
    const right = ast.right.visit(this);
    if (left !== ast.left || right !== ast.right) {
      return new Binary(ast.span, ast.operation, left, right);
    }
    return ast;
  }

  visitPrefixNot(ast: PrefixNot, context: any): AST {
    const expression = ast.expression.visit(this);
    if (expression !== ast.expression) {
      return new PrefixNot(ast.span, expression);
    }
    return ast;
  }

  visitNonNullAssert(ast: NonNullAssert, context: any): AST {
    const expression = ast.expression.visit(this);
    if (expression !== ast.expression) {
      return new NonNullAssert(ast.span, expression);
    }
    return ast;
  }

  visitConditional(ast: Conditional, context: any): AST {
    const condition = ast.condition.visit(this);
    const trueExp = ast.trueExp.visit(this);
    const falseExp = ast.falseExp.visit(this);
    if (condition !== ast.condition || trueExp !== ast.trueExp || falseExp !== ast.falseExp) {
      return new Conditional(ast.span, condition, trueExp, falseExp);
    }
    return ast;
  }

  visitPipe(ast: BindingPipe, context: any): AST {
    const exp = ast.exp.visit(this);
    const args = this.visitAll(ast.args);
    if (exp !== ast.exp || args !== ast.args) {
      return new BindingPipe(ast.span, exp, ast.name, args);
    }
    return ast;
  }

  visitKeyedRead(ast: KeyedRead, context: any): AST {
    const obj = ast.obj.visit(this);
    const key = ast.key.visit(this);
    if (obj !== ast.obj || key !== ast.key) {
      return new KeyedRead(ast.span, obj, key);
    }
    return ast;
  }

  visitKeyedWrite(ast: KeyedWrite, context: any): AST {
    const obj = ast.obj.visit(this);
    const key = ast.key.visit(this);
    const value = ast.value.visit(this);
    if (obj !== ast.obj || key !== ast.key || value !== ast.value) {
      return new KeyedWrite(ast.span, obj, key, value);
    }
    return ast;
  }

  visitEmptyExpr(ast: EmptyExpr, context: any): AST { return ast; }

  visitAll(asts: any[]): AST[] {
    const res: AST[] = new Array(asts.length);
    let modified = false;
    for (let i = 0; i < asts.length; ++i) {
      const original = asts[i];
      const value = original.visit(this);
      res[i] = value;
      modified = modified || value !== original;
    }
    return modified ? res : asts;
  }

  visitChain(ast: Chain, context: any): AST {
    const expressions = this.visitAll(ast.expressions);
    if (expressions !== ast.expressions) {
      return new Chain(ast.span, expressions);
    }
    return ast;
  }

  visitQuote(ast: Quote, context: any): AST { return ast; }
}

export function visitAstChildren(ast: AST, visitor: AstVisitor<any>, context?: any) {
  function visit(ast: AST) {
    visitor.visit && visitor.visit(ast, context) || ast.visit(visitor, context);
  }

  function visitAll<T extends AST>(asts: T[]) { asts.forEach(visit); }

  ast.visit({
    visitBinary(ast) {
      visit(ast.left);
      visit(ast.right);
    },
    visitChain(ast) { visitAll(ast.expressions); },
    visitConditional(ast) {
      visit(ast.condition);
      visit(ast.trueExp);
      visit(ast.falseExp);
    },
    visitEmptyExpr(ast) {},
    visitFunctionCall(ast) {
      if (ast.target) {
        visit(ast.target);
      }
      visitAll(ast.args);
    },
    visitImplicitReceiver(ast) {},
    visitInterpolation(ast) { visitAll(ast.expressions); },
    visitKeyedRead(ast) {
      visit(ast.obj);
      visit(ast.key);
    },
    visitKeyedWrite(ast) {
      visit(ast.obj);
      visit(ast.key);
      visit(ast.obj);
    },
    visitLiteralArray(ast) { visitAll(ast.expressions); },
    visitLiteralMap(ast) {},
    visitLiteralPrimitive(ast) {},
    visitMethodCall(ast) {
      visit(ast.receiver);
      visitAll(ast.args);
    },
    visitPipe(ast) {
      visit(ast.exp);
      visitAll(ast.args);
    },
    visitPrefixNot(ast) { visit(ast.expression); },
    visitNonNullAssert(ast) { visit(ast.expression); },
    visitPropertyRead(ast) { visit(ast.receiver); },
    visitPropertyWrite(ast) {
      visit(ast.receiver);
      visit(ast.value);
    },
    visitQuote(ast) {},
    visitSafeMethodCall(ast) {
      visit(ast.receiver);
      visitAll(ast.args);
    },
    visitSafePropertyRead(ast) { visit(ast.receiver); },
  });
}


// Bindings

export class ParsedProperty {
  public readonly isLiteral: boolean;
  public readonly isAnimation: boolean;

  constructor(
      public name: string, public expression: ASTWithSource, public type: ParsedPropertyType,
      public sourceSpan: ParseSourceSpan) {
    this.isLiteral = this.type === ParsedPropertyType.LITERAL_ATTR;
    this.isAnimation = this.type === ParsedPropertyType.ANIMATION;
  }
}

export enum ParsedPropertyType {
  DEFAULT,
  LITERAL_ATTR,
  ANIMATION
}

export const enum ParsedEventType {
  // DOM or Directive event
  Regular,
  // Animation specific event
  Animation,
}

export class ParsedEvent {
  // Regular events have a target
  // Animation events have a phase
  constructor(
      public name: string, public targetOrPhase: string, public type: ParsedEventType,
      public handler: AST, public sourceSpan: ParseSourceSpan,
      public handlerSpan: ParseSourceSpan) {}
}

export class ParsedVariable {
  constructor(public name: string, public value: string, public sourceSpan: ParseSourceSpan) {}
}

export const enum BindingType {
  // A regular binding to a property (e.g. `[property]="expression"`).
  Property,
  // A binding to an element attribute (e.g. `[attr.name]="expression"`).
  Attribute,
  // A binding to a CSS class (e.g. `[class.name]="condition"`).
  Class,
  // A binding to a style rule (e.g. `[style.rule]="expression"`).
  Style,
  // A binding to an animation reference (e.g. `[animate.key]="expression"`).
  Animation,
}

export class BoundElementProperty {
  constructor(
      public name: string, public type: BindingType, public securityContext: SecurityContext,
      public value: AST, public unit: string|null, public sourceSpan: ParseSourceSpan) {}
}
