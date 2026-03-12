/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ArrowFunction,
  AST,
  AstVisitor,
  ASTWithSource,
  Binary,
  BindingPipe,
  Call,
  Chain,
  Conditional,
  EmptyExpr,
  ImplicitReceiver,
  Interpolation,
  KeyedRead,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  NonNullAssert,
  ParenthesizedExpression,
  PrefixNot,
  PropertyRead,
  RegularExpressionLiteral,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  SpreadElement,
  TaggedTemplateLiteral,
  TemplateLiteral,
  ThisReceiver,
  TypeofExpression,
  Unary,
  VoidExpression,
} from '@angular/compiler';
import {quoteAndEscape, TcbExpr} from './ops/codegen';
import {TypeCheckingConfig} from '../api';

/**
 * Convert an `AST` to a `TcbExpr` directly, without going through an intermediate `Expression`
 * AST.
 */
export function astToTcbExpr(
  ast: AST,
  maybeResolve: (ast: AST) => TcbExpr | null,
  config: TypeCheckingConfig,
): TcbExpr {
  const translator = new TcbExprTranslator(maybeResolve, config);
  return translator.translate(ast);
}

class TcbExprTranslator implements AstVisitor {
  constructor(
    private maybeResolve: (ast: AST) => TcbExpr | null,
    private config: TypeCheckingConfig,
  ) {}

  translate(ast: AST): TcbExpr {
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }

    // First attempt to let any custom resolution logic provide a translation for the given node.
    const resolved = this.maybeResolve(ast);
    if (resolved !== null) {
      return resolved;
    }

    return ast.visit(this);
  }

  visitUnary(ast: Unary): TcbExpr {
    const expr = this.translate(ast.expr);
    const node = new TcbExpr(`${ast.operator}${expr.print()}`);
    return node.wrapForTypeChecker().addParseSpanInfo(ast.sourceSpan);
  }

  visitBinary(ast: Binary): TcbExpr {
    const lhs = this.translate(ast.left);
    const rhs = this.translate(ast.right);
    lhs.wrapForTypeChecker();
    rhs.wrapForTypeChecker();
    const expression = `${lhs.print()} ${ast.operation} ${rhs.print()}`;
    const node = new TcbExpr(
      ast.operation === '??' || ast.operation === '**' ? `(${expression})` : expression,
    );
    node.addParseSpanInfo(ast.sourceSpan);
    return node;
  }

  visitChain(ast: Chain): TcbExpr {
    const elements = ast.expressions.map((expr) => this.translate(expr).print());
    const node = new TcbExpr(elements.join(', '));
    node.wrapForTypeChecker();
    node.addParseSpanInfo(ast.sourceSpan);
    return node;
  }

  visitConditional(ast: Conditional): TcbExpr {
    const condExpr = this.translate(ast.condition);
    const trueExpr = this.translate(ast.trueExp);
    // Wrap `falseExpr` in parens so that the trailing parse span info is not attributed to the
    // whole conditional.
    // In the following example, the last source span comment (5,6) could be seen as the
    // trailing comment for _either_ the whole conditional expression _or_ just the `falseExpr` that
    // is immediately before it:
    // `conditional /*1,2*/ ? trueExpr /*3,4*/ : falseExpr /*5,6*/`
    // This should be instead be `conditional /*1,2*/ ? trueExpr /*3,4*/ : (falseExpr /*5,6*/)`
    const falseExpr = this.translate(ast.falseExp).wrapForTypeChecker();
    const node = new TcbExpr(
      `(${condExpr.print()} ? ${trueExpr.print()} : ${falseExpr.print()})`,
    ).addParseSpanInfo(ast.sourceSpan);
    return node;
  }

  visitImplicitReceiver(ast: ImplicitReceiver): never {
    throw new Error('Method not implemented.');
  }

  visitThisReceiver(ast: ThisReceiver): never {
    throw new Error('Method not implemented.');
  }

  visitRegularExpressionLiteral(ast: RegularExpressionLiteral, context: any): TcbExpr {
    const node = new TcbExpr(`/${ast.body}/${ast.flags ?? ''}`);
    node.wrapForTypeChecker();
    return node;
  }

  visitInterpolation(ast: Interpolation): TcbExpr {
    // Build up a chain of binary + operations to simulate the string concatenation of the
    // interpolation's expressions. The chain is started using an actual string literal to ensure
    // the type is inferred as 'string'.
    const exprs = ast.expressions.map((e) => {
      const node = this.translate(e);
      node.wrapForTypeChecker();
      return node.print();
    });
    return new TcbExpr(`"" + ${exprs.join(' + ')}`);
  }

  visitKeyedRead(ast: KeyedRead): TcbExpr {
    const receiver = this.translate(ast.receiver).wrapForTypeChecker();
    const key = this.translate(ast.key);
    return new TcbExpr(`${receiver.print()}[${key.print()}]`).addParseSpanInfo(ast.sourceSpan);
  }

  visitLiteralArray(ast: LiteralArray): TcbExpr {
    const elements = ast.expressions.map((expr) => this.translate(expr));
    let literal = `[${elements.map((el) => el.print()).join(', ')}]`;

    // If strictLiteralTypes is disabled, array literals are cast to `any`.
    if (!this.config.strictLiteralTypes) {
      literal = `(${literal} as any)`;
    }

    return new TcbExpr(literal).addParseSpanInfo(ast.sourceSpan);
  }

  visitLiteralMap(ast: LiteralMap): TcbExpr {
    const properties = ast.keys.map((key, idx) => {
      const value = this.translate(ast.values[idx]);

      if (key.kind === 'property') {
        const keyNode = new TcbExpr(quoteAndEscape(key.key));
        keyNode.addParseSpanInfo(key.sourceSpan);
        return `${keyNode.print()}: ${value.print()}`;
      } else {
        return `...${value.print()}`;
      }
    });

    let literal = `{ ${properties.join(', ')} }`;

    if (!this.config.strictLiteralTypes) {
      // If strictLiteralTypes is disabled, array literals are cast to `any`.
      literal = `${literal} as any`;
    }

    const expression = new TcbExpr(literal).addParseSpanInfo(ast.sourceSpan);

    // Always parenthesize the literal, because for DOM bindings we may put it
    // directly in the function body at which point TS might parse it as a block.
    expression.wrapForTypeChecker();

    return expression;
  }

  visitLiteralPrimitive(ast: LiteralPrimitive): TcbExpr {
    let node: TcbExpr;
    if (ast.value === undefined) {
      node = new TcbExpr('undefined');
    } else if (ast.value === null) {
      node = new TcbExpr('null');
    } else if (typeof ast.value === 'string') {
      node = new TcbExpr(quoteAndEscape(ast.value));
    } else if (typeof ast.value === 'number') {
      if (Number.isNaN(ast.value)) {
        node = new TcbExpr('NaN');
      } else if (!Number.isFinite(ast.value)) {
        node = new TcbExpr(ast.value > 0 ? 'Infinity' : '-Infinity');
      } else {
        node = new TcbExpr(ast.value.toString());
      }
    } else if (typeof ast.value === 'boolean') {
      node = new TcbExpr(ast.value + '');
    } else {
      throw Error(`Unsupported AST value of type ${typeof ast.value}`);
    }
    node.addParseSpanInfo(ast.sourceSpan);
    return node;
  }

  visitNonNullAssert(ast: NonNullAssert): TcbExpr {
    const expr = this.translate(ast.expression).wrapForTypeChecker();
    return new TcbExpr(`${expr.print()}!`).addParseSpanInfo(ast.sourceSpan);
  }

  visitPipe(ast: BindingPipe): never {
    throw new Error('Method not implemented.');
  }

  visitPrefixNot(ast: PrefixNot): TcbExpr {
    const expression = this.translate(ast.expression).wrapForTypeChecker();
    return new TcbExpr(`!${expression.print()}`).addParseSpanInfo(ast.sourceSpan);
  }

  visitTypeofExpression(ast: TypeofExpression): TcbExpr {
    const expression = this.translate(ast.expression).wrapForTypeChecker();
    return new TcbExpr(`typeof ${expression.print()}`).addParseSpanInfo(ast.sourceSpan);
  }

  visitVoidExpression(ast: VoidExpression): TcbExpr {
    const expression = this.translate(ast.expression).wrapForTypeChecker();
    return new TcbExpr(`void ${expression.print()}`).addParseSpanInfo(ast.sourceSpan);
  }

  visitPropertyRead(ast: PropertyRead): TcbExpr {
    // This is a normal property read - convert the receiver to an expression and emit the correct
    // TypeScript expression to read the property.
    const receiver = this.translate(ast.receiver).wrapForTypeChecker();
    return new TcbExpr(`${receiver.print()}.${ast.name}`)
      .addParseSpanInfo(ast.nameSpan)
      .wrapForTypeChecker()
      .addParseSpanInfo(ast.sourceSpan);
  }

  visitSafePropertyRead(ast: SafePropertyRead): TcbExpr {
    let node: TcbExpr;
    const receiver = this.translate(ast.receiver).wrapForTypeChecker();
    const name = new TcbExpr(ast.name).addParseSpanInfo(ast.nameSpan);

    // The form of safe property reads depends on whether strictness is in use.
    if (this.config.strictSafeNavigationTypes) {
      // Basically, the return here is either the type of the complete expression with a null-safe
      // property read, or `undefined`. So a ternary is used to create an "or" type:
      // "a?.b" becomes (0 as any ? a!.b : undefined)
      // The type of this expression is (typeof a!.b) | undefined, which is exactly as desired.
      node = new TcbExpr(`(0 as any ? ${receiver.print()}!.${name.print()} : undefined)`);
    } else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
      // Emulate a View Engine bug where 'any' is inferred for the left-hand side of the safe
      // navigation operation. With this bug, the type of the left-hand side is regarded as any.
      // Therefore, the left-hand side only needs repeating in the output (to validate it), and then
      // 'any' is used for the rest of the expression. This is done using a comma operator:
      // "a?.b" becomes (a as any).b, which will of course have type 'any'.
      node = new TcbExpr(`(${receiver.print()} as any).${name.print()}`);
    } else {
      // The View Engine bug isn't active, so check the entire type of the expression, but the final
      // result is still inferred as `any`.
      // "a?.b" becomes (a!.b as any)
      node = new TcbExpr(`(${receiver.print()}!.${name.print()} as any)`);
    }
    return node.addParseSpanInfo(ast.sourceSpan);
  }

  visitSafeKeyedRead(ast: SafeKeyedRead): TcbExpr {
    const receiver = this.translate(ast.receiver).wrapForTypeChecker();
    const key = this.translate(ast.key);
    let node: TcbExpr;

    // The form of safe property reads depends on whether strictness is in use.
    if (this.config.strictSafeNavigationTypes) {
      // "a?.[...]" becomes (0 as any ? a![...] : undefined)
      const elementAccess = new TcbExpr(`${receiver.print()}![${key.print()}]`).addParseSpanInfo(
        ast.sourceSpan,
      );
      node = new TcbExpr(`(0 as any ? ${elementAccess.print()} : undefined)`);
    } else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
      // "a?.[...]" becomes (a as any)[...]
      node = new TcbExpr(`(${receiver.print()} as any)[${key.print()}]`);
    } else {
      // "a?.[...]" becomes (a!.[...] as any)
      const elementAccess = new TcbExpr(`${receiver.print()}![${key.print()}]`).addParseSpanInfo(
        ast.sourceSpan,
      );
      node = new TcbExpr(`(${elementAccess.print()} as any)`);
    }
    return node.addParseSpanInfo(ast.sourceSpan);
  }

  visitCall(ast: Call): TcbExpr {
    const args = ast.args.map((expr) => this.translate(expr));
    const receiver = ast.receiver;
    let expr: TcbExpr;

    // For calls that have a property read as receiver, we have to special-case their emit to avoid
    // inserting superfluous parenthesis as they prevent TypeScript from applying a narrowing effect
    // if the method acts as a type guard.
    if (receiver instanceof PropertyRead) {
      const resolved = this.maybeResolve(receiver);
      if (resolved !== null) {
        expr = resolved;
      } else {
        const propertyReceiver = this.translate(receiver.receiver).wrapForTypeChecker();
        expr = new TcbExpr(`${propertyReceiver.print()}.${receiver.name}`).addParseSpanInfo(
          receiver.nameSpan,
        );
      }
    } else {
      expr = this.translate(receiver);
    }

    let node: TcbExpr;

    // Safe property/keyed reads will produce a ternary whose value is nullable.
    // We have to generate a similar ternary around the call.
    if (ast.receiver instanceof SafePropertyRead || ast.receiver instanceof SafeKeyedRead) {
      node = this.convertToSafeCall(ast, expr, args);
    } else {
      node = new TcbExpr(`${expr.print()}(${args.map((arg) => arg.print()).join(', ')})`);
    }

    return node.addParseSpanInfo(ast.sourceSpan);
  }

  visitSafeCall(ast: SafeCall): TcbExpr {
    const args = ast.args.map((expr) => this.translate(expr));
    const expr = this.translate(ast.receiver).wrapForTypeChecker();
    return this.convertToSafeCall(ast, expr, args).addParseSpanInfo(ast.sourceSpan);
  }

  visitTemplateLiteral(ast: TemplateLiteral): TcbExpr {
    const length = ast.elements.length;
    const head = ast.elements[0];
    let result: string;

    if (length === 1) {
      result = `\`${head.text}\``;
    } else {
      let parts = [`\`${head.text}`];
      const tailIndex = length - 1;

      for (let i = 1; i < tailIndex; i++) {
        const expr = this.translate(ast.expressions[i - 1]);
        parts.push(`\${${expr.print()}}${ast.elements[i].text}`);
      }
      const resolvedExpression = this.translate(ast.expressions[tailIndex - 1]);
      parts.push(`\${${resolvedExpression.print()}}${ast.elements[tailIndex].text}\``);
      result = parts.join('');
    }
    return new TcbExpr(result);
  }

  visitTemplateLiteralElement() {
    throw new Error('Method not implemented');
  }

  visitTaggedTemplateLiteral(ast: TaggedTemplateLiteral): TcbExpr {
    const tag = this.translate(ast.tag);
    const template = this.visitTemplateLiteral(ast.template);
    return new TcbExpr(`${tag.print()}${template.print()}`);
  }

  visitParenthesizedExpression(ast: ParenthesizedExpression): TcbExpr {
    const expr = this.translate(ast.expression);
    return new TcbExpr(`(${expr.print()})`);
  }

  visitSpreadElement(ast: SpreadElement) {
    const expression = this.translate(ast.expression);
    expression.wrapForTypeChecker();
    const node = new TcbExpr(`...${expression.print()}`);
    node.addParseSpanInfo(ast.sourceSpan);
    return node;
  }

  visitEmptyExpr(ast: EmptyExpr) {
    const node = new TcbExpr('undefined');
    node.addParseSpanInfo(ast.sourceSpan);
    return node;
  }

  visitArrowFunction(ast: ArrowFunction): TcbExpr {
    const params = ast.parameters
      .map((param) => new TcbExpr(param.name).markIgnoreDiagnostics().print())
      .join(', ');
    const body = astToTcbExpr(
      ast.body,
      (innerAst) => {
        if (
          !(innerAst instanceof PropertyRead) ||
          innerAst.receiver instanceof ThisReceiver ||
          !(innerAst.receiver instanceof ImplicitReceiver)
        ) {
          return this.maybeResolve(innerAst);
        }

        const correspondingParam = ast.parameters.find((arg) => arg.name === innerAst.name);

        if (correspondingParam) {
          const node = new TcbExpr(innerAst.name);
          node.addParseSpanInfo(innerAst.sourceSpan);
          return node;
        }

        return this.maybeResolve(innerAst);
      },
      this.config,
    );

    return new TcbExpr(
      `${ast.parameters.length === 1 ? params : `(${params})`} => ${body.print()}`,
    );
  }

  private convertToSafeCall(ast: Call | SafeCall, exprNode: TcbExpr, argNodes: TcbExpr[]): TcbExpr {
    const expr = exprNode.print();
    const args = argNodes.map((node) => node.print()).join(', ');

    if (this.config.strictSafeNavigationTypes) {
      // (0 as any ? a!.method(...) : undefined)
      return new TcbExpr(`(0 as any ? ${expr}!(${args}) : undefined)`);
    }

    if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
      // (a as any).method(...)
      return new TcbExpr(`(${expr} as any)(${args})`);
    }

    // (a!.method(...) as any)
    return new TcbExpr(`(${expr}!(${args}) as any)`);
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

  static veWillInferAnyFor(ast: Call | SafeCall | SafePropertyRead | SafeKeyedRead) {
    const visitor = VeSafeLhsInferenceBugDetector.SINGLETON;
    return ast instanceof Call ? ast.visit(visitor) : ast.receiver.visit(visitor);
  }

  visitUnary(ast: Unary): boolean {
    return ast.expr.visit(this);
  }
  visitBinary(ast: Binary): boolean {
    return ast.left.visit(this) || ast.right.visit(this);
  }
  visitChain(): boolean {
    return false;
  }
  visitConditional(ast: Conditional): boolean {
    return ast.condition.visit(this) || ast.trueExp.visit(this) || ast.falseExp.visit(this);
  }
  visitCall(): boolean {
    return true;
  }
  visitSafeCall(): boolean {
    return false;
  }
  visitImplicitReceiver(): boolean {
    return false;
  }
  visitThisReceiver(): boolean {
    return false;
  }
  visitInterpolation(ast: Interpolation): boolean {
    return ast.expressions.some((exp) => exp.visit(this));
  }
  visitKeyedRead(): boolean {
    return false;
  }
  visitLiteralArray(): boolean {
    return true;
  }
  visitLiteralMap(): boolean {
    return true;
  }
  visitLiteralPrimitive(): boolean {
    return false;
  }
  visitPipe(): boolean {
    return true;
  }
  visitPrefixNot(ast: PrefixNot): boolean {
    return ast.expression.visit(this);
  }
  visitTypeofExpression(ast: TypeofExpression): boolean {
    return ast.expression.visit(this);
  }
  visitVoidExpression(ast: VoidExpression): boolean {
    return ast.expression.visit(this);
  }
  visitNonNullAssert(ast: NonNullAssert): boolean {
    return ast.expression.visit(this);
  }
  visitPropertyRead(): boolean {
    return false;
  }
  visitSafePropertyRead(): boolean {
    return false;
  }
  visitSafeKeyedRead(): boolean {
    return false;
  }
  visitTemplateLiteral() {
    return false;
  }
  visitTemplateLiteralElement() {
    return false;
  }
  visitTaggedTemplateLiteral() {
    return false;
  }
  visitParenthesizedExpression(ast: ParenthesizedExpression) {
    return ast.expression.visit(this);
  }
  visitRegularExpressionLiteral() {
    return false;
  }
  visitSpreadElement(ast: SpreadElement) {
    return ast.expression.visit(this);
  }
  visitArrowFunction(ast: ArrowFunction, context: any) {
    return false;
  }
}
