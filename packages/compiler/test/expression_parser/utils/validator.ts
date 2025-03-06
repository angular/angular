/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  Binary,
  BindingPipe,
  Call,
  Chain,
  Conditional,
  ImplicitReceiver,
  Interpolation,
  KeyedRead,
  KeyedWrite,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  ParenthesizedExpression,
  ParseSpan,
  PrefixNot,
  PropertyRead,
  PropertyWrite,
  RecursiveAstVisitor,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  TaggedTemplateLiteral,
  TemplateLiteral,
  TemplateLiteralElement,
  TypeofExpression,
  Unary,
  VoidExpression,
} from '../../../src/expression_parser/ast';

import {unparse} from './unparser';

class ASTValidator extends RecursiveAstVisitor {
  private parentSpan: ParseSpan | undefined;

  override visit(ast: AST) {
    this.parentSpan = undefined;
    ast.visit(this);
  }

  validate(ast: AST, cb: () => void): void {
    if (!inSpan(ast.span, this.parentSpan)) {
      if (this.parentSpan) {
        const parentSpan = this.parentSpan as ParseSpan;
        throw Error(
          `Invalid AST span [expected (${ast.span.start}, ${ast.span.end}) to be in (${
            parentSpan.start
          },  ${parentSpan.end}) for ${unparse(ast)}`,
        );
      } else {
        throw Error(`Invalid root AST span for ${unparse(ast)}`);
      }
    }
    const oldParent = this.parentSpan;
    this.parentSpan = ast.span;
    cb();
    this.parentSpan = oldParent;
  }

  override visitUnary(ast: Unary, context: any): any {
    this.validate(ast, () => super.visitUnary(ast, context));
  }

  override visitBinary(ast: Binary, context: any): any {
    this.validate(ast, () => super.visitBinary(ast, context));
  }

  override visitChain(ast: Chain, context: any): any {
    this.validate(ast, () => super.visitChain(ast, context));
  }

  override visitConditional(ast: Conditional, context: any): any {
    this.validate(ast, () => super.visitConditional(ast, context));
  }

  override visitImplicitReceiver(ast: ImplicitReceiver, context: any): any {
    this.validate(ast, () => super.visitImplicitReceiver(ast, context));
  }

  override visitInterpolation(ast: Interpolation, context: any): any {
    this.validate(ast, () => super.visitInterpolation(ast, context));
  }

  override visitKeyedRead(ast: KeyedRead, context: any): any {
    this.validate(ast, () => super.visitKeyedRead(ast, context));
  }

  override visitKeyedWrite(ast: KeyedWrite, context: any): any {
    this.validate(ast, () => super.visitKeyedWrite(ast, context));
  }

  override visitLiteralArray(ast: LiteralArray, context: any): any {
    this.validate(ast, () => super.visitLiteralArray(ast, context));
  }

  override visitLiteralMap(ast: LiteralMap, context: any): any {
    this.validate(ast, () => super.visitLiteralMap(ast, context));
  }

  override visitLiteralPrimitive(ast: LiteralPrimitive, context: any): any {
    this.validate(ast, () => super.visitLiteralPrimitive(ast, context));
  }

  override visitPipe(ast: BindingPipe, context: any): any {
    this.validate(ast, () => super.visitPipe(ast, context));
  }

  override visitPrefixNot(ast: PrefixNot, context: any): any {
    this.validate(ast, () => super.visitPrefixNot(ast, context));
  }

  override visitTypeofExpression(ast: TypeofExpression, context: any): any {
    this.validate(ast, () => super.visitTypeofExpression(ast, context));
  }

  override visitVoidExpression(ast: VoidExpression, context: any): any {
    this.validate(ast, () => super.visitVoidExpression(ast, context));
  }

  override visitPropertyRead(ast: PropertyRead, context: any): any {
    this.validate(ast, () => super.visitPropertyRead(ast, context));
  }

  override visitPropertyWrite(ast: PropertyWrite, context: any): any {
    this.validate(ast, () => super.visitPropertyWrite(ast, context));
  }

  override visitSafePropertyRead(ast: SafePropertyRead, context: any): any {
    this.validate(ast, () => super.visitSafePropertyRead(ast, context));
  }

  override visitSafeKeyedRead(ast: SafeKeyedRead, context: any): any {
    this.validate(ast, () => super.visitSafeKeyedRead(ast, context));
  }

  override visitCall(ast: Call, context: any): any {
    this.validate(ast, () => super.visitCall(ast, context));
  }

  override visitSafeCall(ast: SafeCall, context: any): any {
    this.validate(ast, () => super.visitSafeCall(ast, context));
  }

  override visitTemplateLiteral(ast: TemplateLiteral, context: any): any {
    this.validate(ast, () => super.visitTemplateLiteral(ast, context));
  }

  override visitTemplateLiteralElement(ast: TemplateLiteralElement, context: any): any {
    this.validate(ast, () => super.visitTemplateLiteralElement(ast, context));
  }

  override visitTaggedTemplateLiteral(ast: TaggedTemplateLiteral, context: any): void {
    this.validate(ast, () => super.visitTaggedTemplateLiteral(ast, context));
  }

  override visitParenthesizedExpression(ast: ParenthesizedExpression, context: any): void {
    this.validate(ast, () => super.visitParenthesizedExpression(ast, context));
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
