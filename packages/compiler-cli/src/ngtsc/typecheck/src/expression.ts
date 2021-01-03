/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, AstVisitor, ASTWithSource, Binary, BindingPipe, Chain, Conditional, EmptyExpr, FunctionCall, ImplicitReceiver, Interpolation, KeyedRead, KeyedWrite, LiteralArray, LiteralMap, LiteralPrimitive, MethodCall, NonNullAssert, PrefixNot, PropertyRead, PropertyWrite, Quote, SafeMethodCall, SafePropertyRead, ThisReceiver, Unary} from '@angular/compiler';
import * as ts from 'typescript';

import {TypeCheckingConfig} from '../api';

import {addParseSpanInfo, wrapForDiagnostics, wrapForTypeChecker} from './diagnostics';
import {tsCastToAny} from './ts_util';

export const NULL_AS_ANY =
    ts.createAsExpression(ts.createNull(), ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
const UNDEFINED = ts.createIdentifier('undefined');

const UNARY_OPS = new Map<string, ts.PrefixUnaryOperator>([
  ['+', ts.SyntaxKind.PlusToken],
  ['-', ts.SyntaxKind.MinusToken],
]);

const BINARY_OPS = new Map<string, ts.BinaryOperator>([
  ['+', ts.SyntaxKind.PlusToken],
  ['-', ts.SyntaxKind.MinusToken],
  ['<', ts.SyntaxKind.LessThanToken],
  ['>', ts.SyntaxKind.GreaterThanToken],
  ['<=', ts.SyntaxKind.LessThanEqualsToken],
  ['>=', ts.SyntaxKind.GreaterThanEqualsToken],
  ['==', ts.SyntaxKind.EqualsEqualsToken],
  ['===', ts.SyntaxKind.EqualsEqualsEqualsToken],
  ['*', ts.SyntaxKind.AsteriskToken],
  ['/', ts.SyntaxKind.SlashToken],
  ['%', ts.SyntaxKind.PercentToken],
  ['!=', ts.SyntaxKind.ExclamationEqualsToken],
  ['!==', ts.SyntaxKind.ExclamationEqualsEqualsToken],
  ['||', ts.SyntaxKind.BarBarToken],
  ['&&', ts.SyntaxKind.AmpersandAmpersandToken],
  ['&', ts.SyntaxKind.AmpersandToken],
  ['|', ts.SyntaxKind.BarToken],
]);

/**
 * Convert an `AST` to TypeScript code directly, without going through an intermediate `Expression`
 * AST.
 */
export function astToTypescript(
    ast: AST, maybeResolve: (ast: AST) => (ts.Expression | null),
    config: TypeCheckingConfig): ts.Expression {
  const translator = new AstTranslator(maybeResolve, config);
  return translator.translate(ast);
}

class AstTranslator implements AstVisitor {
  constructor(
      private maybeResolve: (ast: AST) => (ts.Expression | null),
      private config: TypeCheckingConfig) {}

  translate(ast: AST): ts.Expression {
    // Skip over an `ASTWithSource` as its `visit` method calls directly into its ast's `visit`,
    // which would prevent any custom resolution through `maybeResolve` for that node.
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }

    // The `EmptyExpr` doesn't have a dedicated method on `AstVisitor`, so it's special cased here.
    if (ast instanceof EmptyExpr) {
      return UNDEFINED;
    }

    // First attempt to let any custom resolution logic provide a translation for the given node.
    const resolved = this.maybeResolve(ast);
    if (resolved !== null) {
      return resolved;
    }

    return ast.visit(this);
  }

  visitUnary(ast: Unary): ts.Expression {
    const expr = this.translate(ast.expr);
    const op = UNARY_OPS.get(ast.operator);
    if (op === undefined) {
      throw new Error(`Unsupported Unary.operator: ${ast.operator}`);
    }
    const node = wrapForDiagnostics(ts.createPrefix(op, expr));
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitBinary(ast: Binary): ts.Expression {
    const lhs = wrapForDiagnostics(this.translate(ast.left));
    const rhs = wrapForDiagnostics(this.translate(ast.right));
    const op = BINARY_OPS.get(ast.operation);
    if (op === undefined) {
      throw new Error(`Unsupported Binary.operation: ${ast.operation}`);
    }
    const node = ts.createBinary(lhs, op, rhs);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitChain(ast: Chain): ts.Expression {
    const elements = ast.expressions.map(expr => this.translate(expr));
    const node = wrapForDiagnostics(ts.createCommaList(elements));
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitConditional(ast: Conditional): ts.Expression {
    const condExpr = this.translate(ast.condition);
    const trueExpr = this.translate(ast.trueExp);
    // Wrap `falseExpr` in parens so that the trailing parse span info is not attributed to the
    // whole conditional.
    // In the following example, the last source span comment (5,6) could be seen as the
    // trailing comment for _either_ the whole conditional expression _or_ just the `falseExpr` that
    // is immediately before it:
    // `conditional /*1,2*/ ? trueExpr /*3,4*/ : falseExpr /*5,6*/`
    // This should be instead be `conditional /*1,2*/ ? trueExpr /*3,4*/ : (falseExpr /*5,6*/)`
    const falseExpr = wrapForTypeChecker(this.translate(ast.falseExp));
    const node = ts.createParen(ts.createConditional(condExpr, trueExpr, falseExpr));
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitFunctionCall(ast: FunctionCall): ts.Expression {
    const receiver = wrapForDiagnostics(this.translate(ast.target!));
    const args = ast.args.map(expr => this.translate(expr));
    const node = ts.createCall(receiver, undefined, args);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitImplicitReceiver(ast: ImplicitReceiver): never {
    throw new Error('Method not implemented.');
  }

  visitThisReceiver(ast: ThisReceiver): never {
    throw new Error('Method not implemented.');
  }

  visitInterpolation(ast: Interpolation): ts.Expression {
    // Build up a chain of binary + operations to simulate the string concatenation of the
    // interpolation's expressions. The chain is started using an actual string literal to ensure
    // the type is inferred as 'string'.
    return ast.expressions.reduce(
        (lhs, ast) =>
            ts.createBinary(lhs, ts.SyntaxKind.PlusToken, wrapForTypeChecker(this.translate(ast))),
        ts.createLiteral(''));
  }

  visitKeyedRead(ast: KeyedRead): ts.Expression {
    const receiver = wrapForDiagnostics(this.translate(ast.obj));
    const key = this.translate(ast.key);
    const node = ts.createElementAccess(receiver, key);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitKeyedWrite(ast: KeyedWrite): ts.Expression {
    const receiver = wrapForDiagnostics(this.translate(ast.obj));
    const left = ts.createElementAccess(receiver, this.translate(ast.key));
    // TODO(joost): annotate `left` with the span of the element access, which is not currently
    //  available on `ast`.
    const right = wrapForTypeChecker(this.translate(ast.value));
    const node = wrapForDiagnostics(ts.createBinary(left, ts.SyntaxKind.EqualsToken, right));
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitLiteralArray(ast: LiteralArray): ts.Expression {
    const elements = ast.expressions.map(expr => this.translate(expr));
    const literal = ts.createArrayLiteral(elements);
    // If strictLiteralTypes is disabled, array literals are cast to `any`.
    const node = this.config.strictLiteralTypes ? literal : tsCastToAny(literal);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitLiteralMap(ast: LiteralMap): ts.Expression {
    const properties = ast.keys.map(({key}, idx) => {
      const value = this.translate(ast.values[idx]);
      return ts.createPropertyAssignment(ts.createStringLiteral(key), value);
    });
    const literal = ts.createObjectLiteral(properties, true);
    // If strictLiteralTypes is disabled, object literals are cast to `any`.
    const node = this.config.strictLiteralTypes ? literal : tsCastToAny(literal);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitLiteralPrimitive(ast: LiteralPrimitive): ts.Expression {
    let node: ts.Expression;
    if (ast.value === undefined) {
      node = ts.createIdentifier('undefined');
    } else if (ast.value === null) {
      node = ts.createNull();
    } else {
      node = ts.createLiteral(ast.value);
    }
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitMethodCall(ast: MethodCall): ts.Expression {
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const method = ts.createPropertyAccess(receiver, ast.name);
    addParseSpanInfo(method, ast.nameSpan);
    const args = ast.args.map(expr => this.translate(expr));
    const node = ts.createCall(method, undefined, args);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitNonNullAssert(ast: NonNullAssert): ts.Expression {
    const expr = wrapForDiagnostics(this.translate(ast.expression));
    const node = ts.createNonNullExpression(expr);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitPipe(ast: BindingPipe): never {
    throw new Error('Method not implemented.');
  }

  visitPrefixNot(ast: PrefixNot): ts.Expression {
    const expression = wrapForDiagnostics(this.translate(ast.expression));
    const node = ts.createLogicalNot(expression);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitPropertyRead(ast: PropertyRead): ts.Expression {
    // This is a normal property read - convert the receiver to an expression and emit the correct
    // TypeScript expression to read the property.
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const name = ts.createPropertyAccess(receiver, ast.name);
    addParseSpanInfo(name, ast.nameSpan);
    const node = wrapForDiagnostics(name);
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitPropertyWrite(ast: PropertyWrite): ts.Expression {
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const left = ts.createPropertyAccess(receiver, ast.name);
    addParseSpanInfo(left, ast.nameSpan);
    // TypeScript reports assignment errors on the entire lvalue expression. Annotate the lvalue of
    // the assignment with the sourceSpan, which includes receivers, rather than nameSpan for
    // consistency of the diagnostic location.
    // a.b.c = 1
    // ^^^^^^^^^ sourceSpan
    //     ^     nameSpan
    const leftWithPath = wrapForDiagnostics(left);
    addParseSpanInfo(leftWithPath, ast.sourceSpan);
    // The right needs to be wrapped in parens as well or we cannot accurately match its
    // span to just the RHS. For example, the span in `e = $event /*0,10*/` is ambiguous.
    // It could refer to either the whole binary expression or just the RHS.
    // We should instead generate `e = ($event /*0,10*/)` so we know the span 0,10 matches RHS.
    const right = wrapForTypeChecker(this.translate(ast.value));
    const node =
        wrapForDiagnostics(ts.createBinary(leftWithPath, ts.SyntaxKind.EqualsToken, right));
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitQuote(ast: Quote): ts.Expression {
    return NULL_AS_ANY;
  }

  visitSafeMethodCall(ast: SafeMethodCall): ts.Expression {
    // See the comments in SafePropertyRead above for an explanation of the cases here.
    let node: ts.Expression;
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    const args = ast.args.map(expr => this.translate(expr));
    if (this.config.strictSafeNavigationTypes) {
      // "a?.method(...)" becomes (null as any ? a!.method(...) : undefined)
      const method = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
      addParseSpanInfo(method, ast.nameSpan);
      const call = ts.createCall(method, undefined, args);
      node = ts.createParen(ts.createConditional(NULL_AS_ANY, call, UNDEFINED));
    } else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
      // "a?.method(...)" becomes (a as any).method(...)
      const method = ts.createPropertyAccess(tsCastToAny(receiver), ast.name);
      addParseSpanInfo(method, ast.nameSpan);
      node = ts.createCall(method, undefined, args);
    } else {
      // "a?.method(...)" becomes (a!.method(...) as any)
      const method = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
      addParseSpanInfo(method, ast.nameSpan);
      node = tsCastToAny(ts.createCall(method, undefined, args));
    }
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }

  visitSafePropertyRead(ast: SafePropertyRead): ts.Expression {
    let node: ts.Expression;
    const receiver = wrapForDiagnostics(this.translate(ast.receiver));
    // The form of safe property reads depends on whether strictness is in use.
    if (this.config.strictSafeNavigationTypes) {
      // Basically, the return here is either the type of the complete expression with a null-safe
      // property read, or `undefined`. So a ternary is used to create an "or" type:
      // "a?.b" becomes (null as any ? a!.b : undefined)
      // The type of this expression is (typeof a!.b) | undefined, which is exactly as desired.
      const expr = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
      addParseSpanInfo(expr, ast.nameSpan);
      node = ts.createParen(ts.createConditional(NULL_AS_ANY, expr, UNDEFINED));
    } else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
      // Emulate a View Engine bug where 'any' is inferred for the left-hand side of the safe
      // navigation operation. With this bug, the type of the left-hand side is regarded as any.
      // Therefore, the left-hand side only needs repeating in the output (to validate it), and then
      // 'any' is used for the rest of the expression. This is done using a comma operator:
      // "a?.b" becomes (a as any).b, which will of course have type 'any'.
      node = ts.createPropertyAccess(tsCastToAny(receiver), ast.name);
    } else {
      // The View Engine bug isn't active, so check the entire type of the expression, but the final
      // result is still inferred as `any`.
      // "a?.b" becomes (a!.b as any)
      const expr = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
      addParseSpanInfo(expr, ast.nameSpan);
      node = tsCastToAny(expr);
    }
    addParseSpanInfo(node, ast.sourceSpan);
    return node;
  }
}

/**
 * Checks whether View Engine will infer a type of 'any' for the left-hand side of a safe navigation
 * operation.
 *
 * In View Engine's template type-checker, certain receivers of safe navigation operations will
 * cause a temporary variable to be allocated as part of the checking expression, to save the value
 * of the receiver and use it more than once in the expression. This temporary variable has type
 * 'any'. In practice, this means certain receivers cause View Engine to not check the full
 * expression, and other receivers will receive more complete checking.
 *
 * For compatibility, this logic is adapted from View Engine's expression_converter.ts so that the
 * Ivy checker can emulate this bug when needed.
 */
class VeSafeLhsInferenceBugDetector implements AstVisitor {
  private static SINGLETON = new VeSafeLhsInferenceBugDetector();

  static veWillInferAnyFor(ast: SafeMethodCall|SafePropertyRead) {
    return ast.receiver.visit(VeSafeLhsInferenceBugDetector.SINGLETON);
  }

  visitUnary(ast: Unary): boolean {
    return ast.expr.visit(this);
  }
  visitBinary(ast: Binary): boolean {
    return ast.left.visit(this) || ast.right.visit(this);
  }
  visitChain(ast: Chain): boolean {
    return false;
  }
  visitConditional(ast: Conditional): boolean {
    return ast.condition.visit(this) || ast.trueExp.visit(this) || ast.falseExp.visit(this);
  }
  visitFunctionCall(ast: FunctionCall): boolean {
    return true;
  }
  visitImplicitReceiver(ast: ImplicitReceiver): boolean {
    return false;
  }
  visitThisReceiver(ast: ThisReceiver): boolean {
    return false;
  }
  visitInterpolation(ast: Interpolation): boolean {
    return ast.expressions.some(exp => exp.visit(this));
  }
  visitKeyedRead(ast: KeyedRead): boolean {
    return false;
  }
  visitKeyedWrite(ast: KeyedWrite): boolean {
    return false;
  }
  visitLiteralArray(ast: LiteralArray): boolean {
    return true;
  }
  visitLiteralMap(ast: LiteralMap): boolean {
    return true;
  }
  visitLiteralPrimitive(ast: LiteralPrimitive): boolean {
    return false;
  }
  visitMethodCall(ast: MethodCall): boolean {
    return true;
  }
  visitPipe(ast: BindingPipe): boolean {
    return true;
  }
  visitPrefixNot(ast: PrefixNot): boolean {
    return ast.expression.visit(this);
  }
  visitNonNullAssert(ast: PrefixNot): boolean {
    return ast.expression.visit(this);
  }
  visitPropertyRead(ast: PropertyRead): boolean {
    return false;
  }
  visitPropertyWrite(ast: PropertyWrite): boolean {
    return false;
  }
  visitQuote(ast: Quote): boolean {
    return false;
  }
  visitSafeMethodCall(ast: SafeMethodCall): boolean {
    return true;
  }
  visitSafePropertyRead(ast: SafePropertyRead): boolean {
    return false;
  }
}
