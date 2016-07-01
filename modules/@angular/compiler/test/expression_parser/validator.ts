import {AST, Binary, BindingPipe, Chain, Conditional, EmptyExpr, FunctionCall, ImplicitReceiver, Interpolation, KeyedRead, KeyedWrite, LiteralArray, LiteralMap, LiteralPrimitive, MethodCall, ParseSpan, PrefixNot, PropertyRead, PropertyWrite, Quote, RecursiveAstVisitor, SafeMethodCall, SafePropertyRead} from '../../src/expression_parser/ast';

import {unparse} from './unparser';

class ASTValidator extends RecursiveAstVisitor {
  private parentSpan: ParseSpan|undefined;

  visit(ast: AST) {
    this.parentSpan = undefined;
    ast.visit(this);
  }

  validate(ast: AST, cb: () => void): void {
    if (!inSpan(ast.span, this.parentSpan)) {
      throw Error(
          `Invalid AST span [expected (${ast.span.start}, ${ast.span.end}) to be in (${this.parentSpan.start},  ${this.parentSpan.end}) for ${unparse(ast)}`);
    }
    const oldParent = this.parentSpan;
    this.parentSpan = ast.span;
    cb();
    this.parentSpan = oldParent;
  }

  visitBinary(ast: Binary, context: any): any {
    this.validate(ast, () => super.visitBinary(ast, context));
  }

  visitChain(ast: Chain, context: any): any {
    this.validate(ast, () => super.visitChain(ast, context));
  }

  visitConditional(ast: Conditional, context: any): any {
    this.validate(ast, () => super.visitConditional(ast, context));
  }

  visitFunctionCall(ast: FunctionCall, context: any): any {
    this.validate(ast, () => super.visitFunctionCall(ast, context));
  }

  visitImplicitReceiver(ast: ImplicitReceiver, context: any): any {
    this.validate(ast, () => super.visitImplicitReceiver(ast, context));
  }

  visitInterpolation(ast: Interpolation, context: any): any {
    this.validate(ast, () => super.visitInterpolation(ast, context));
  }

  visitKeyedRead(ast: KeyedRead, context: any): any {
    this.validate(ast, () => super.visitKeyedRead(ast, context));
  }

  visitKeyedWrite(ast: KeyedWrite, context: any): any {
    this.validate(ast, () => super.visitKeyedWrite(ast, context));
  }

  visitLiteralArray(ast: LiteralArray, context: any): any {
    this.validate(ast, () => super.visitLiteralArray(ast, context));
  }

  visitLiteralMap(ast: LiteralMap, context: any): any {
    this.validate(ast, () => super.visitLiteralMap(ast, context));
  }

  visitLiteralPrimitive(ast: LiteralPrimitive, context: any): any {
    this.validate(ast, () => super.visitLiteralPrimitive(ast, context));
  }

  visitMethodCall(ast: MethodCall, context: any): any {
    this.validate(ast, () => super.visitMethodCall(ast, context));
  }

  visitPipe(ast: BindingPipe, context: any): any {
    this.validate(ast, () => super.visitPipe(ast, context));
  }

  visitPrefixNot(ast: PrefixNot, context: any): any {
    this.validate(ast, () => super.visitPrefixNot(ast, context));
  }

  visitPropertyRead(ast: PropertyRead, context: any): any {
    this.validate(ast, () => super.visitPropertyRead(ast, context));
  }

  visitPropertyWrite(ast: PropertyWrite, context: any): any {
    this.validate(ast, () => super.visitPropertyWrite(ast, context));
  }

  visitQuote(ast: Quote, context: any): any {
    this.validate(ast, () => super.visitQuote(ast, context));
  }

  visitSafeMethodCall(ast: SafeMethodCall, context: any): any {
    this.validate(ast, () => super.visitSafeMethodCall(ast, context));
  }

  visitSafePropertyRead(ast: SafePropertyRead, context: any): any {
    this.validate(ast, () => super.visitSafePropertyRead(ast, context));
  }
}

function inSpan(span: ParseSpan, parentSpan: ParseSpan | undefined): parentSpan is ParseSpan {
  return !parentSpan || (span.start >= parentSpan.start && span.end <= parentSpan.end);
}

const sharedValidator = new ASTValidator();

export function validate<T extends AST>(ast: T): T {
  sharedValidator.visit(ast);
  return ast;
}
