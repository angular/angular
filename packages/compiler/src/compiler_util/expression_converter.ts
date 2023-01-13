/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as cdAst from '../expression_parser/ast';
import * as o from '../output/output_ast';
import {ParseSourceSpan} from '../parse_util';

export class EventHandlerVars {
  static event = o.variable('$event');
}

export interface LocalResolver {
  getLocal(name: string): o.Expression|null;
  notifyImplicitReceiverUse(): void;
  globals?: Set<string>;
  maybeRestoreView(): void;
}

/**
 * Converts the given expression AST into an executable output AST, assuming the expression is
 * used in an action binding (e.g. an event handler).
 */
export function convertActionBinding(
    localResolver: LocalResolver|null, implicitReceiver: o.Expression, action: cdAst.AST,
    bindingId: string, baseSourceSpan?: ParseSourceSpan, implicitReceiverAccesses?: Set<string>,
    globals?: Set<string>): o.Statement[] {
  if (!localResolver) {
    localResolver = new DefaultLocalResolver(globals);
  }
  const actionWithoutBuiltins = convertPropertyBindingBuiltins(
      {
        createLiteralArrayConverter: (argCount: number) => {
          // Note: no caching for literal arrays in actions.
          return (args: o.Expression[]) => o.literalArr(args);
        },
        createLiteralMapConverter: (keys: {key: string, quoted: boolean}[]) => {
          // Note: no caching for literal maps in actions.
          return (values: o.Expression[]) => {
            const entries = keys.map((k, i) => ({
                                       key: k.key,
                                       value: values[i],
                                       quoted: k.quoted,
                                     }));
            return o.literalMap(entries);
          };
        },
        createPipeConverter: (name: string) => {
          throw new Error(`Illegal State: Actions are not allowed to contain pipes. Pipe: ${name}`);
        }
      },
      action);

  const visitor = new _AstToIrVisitor(
      localResolver, implicitReceiver, bindingId, /* supportsInterpolation */ false, baseSourceSpan,
      implicitReceiverAccesses);
  const actionStmts: o.Statement[] = [];
  flattenStatements(actionWithoutBuiltins.visit(visitor, _Mode.Statement), actionStmts);
  prependTemporaryDecls(visitor.temporaryCount, bindingId, actionStmts);

  if (visitor.usesImplicitReceiver) {
    localResolver.notifyImplicitReceiverUse();
  }

  const lastIndex = actionStmts.length - 1;
  if (lastIndex >= 0) {
    const lastStatement = actionStmts[lastIndex];
    // Ensure that the value of the last expression statement is returned
    if (lastStatement instanceof o.ExpressionStatement) {
      actionStmts[lastIndex] = new o.ReturnStatement(lastStatement.expr);
    }
  }
  return actionStmts;
}

export interface BuiltinConverter {
  (args: o.Expression[]): o.Expression;
}

export interface BuiltinConverterFactory {
  createLiteralArrayConverter(argCount: number): BuiltinConverter;
  createLiteralMapConverter(keys: {key: string, quoted: boolean}[]): BuiltinConverter;
  createPipeConverter(name: string, argCount: number): BuiltinConverter;
}

export function convertPropertyBindingBuiltins(
    converterFactory: BuiltinConverterFactory, ast: cdAst.AST): cdAst.AST {
  return convertBuiltins(converterFactory, ast);
}

export class ConvertPropertyBindingResult {
  constructor(public stmts: o.Statement[], public currValExpr: o.Expression) {}
}

/**
 * Converts the given expression AST into an executable output AST, assuming the expression
 * is used in property binding. The expression has to be preprocessed via
 * `convertPropertyBindingBuiltins`.
 */
export function convertPropertyBinding(
    localResolver: LocalResolver|null, implicitReceiver: o.Expression,
    expressionWithoutBuiltins: cdAst.AST, bindingId: string): ConvertPropertyBindingResult {
  if (!localResolver) {
    localResolver = new DefaultLocalResolver();
  }
  const visitor = new _AstToIrVisitor(
      localResolver, implicitReceiver, bindingId, /* supportsInterpolation */ false);
  const outputExpr: o.Expression = expressionWithoutBuiltins.visit(visitor, _Mode.Expression);
  const stmts: o.Statement[] = getStatementsFromVisitor(visitor, bindingId);

  if (visitor.usesImplicitReceiver) {
    localResolver.notifyImplicitReceiverUse();
  }

  return new ConvertPropertyBindingResult(stmts, outputExpr);
}

/**
 * Given some expression, such as a binding or interpolation expression, and a context expression to
 * look values up on, visit each facet of the given expression resolving values from the context
 * expression such that a list of arguments can be derived from the found values that can be used as
 * arguments to an external update instruction.
 *
 * @param localResolver The resolver to use to look up expressions by name appropriately
 * @param contextVariableExpression The expression representing the context variable used to create
 * the final argument expressions
 * @param expressionWithArgumentsToExtract The expression to visit to figure out what values need to
 * be resolved and what arguments list to build.
 * @param bindingId A name prefix used to create temporary variable names if they're needed for the
 * arguments generated
 * @returns An array of expressions that can be passed as arguments to instruction expressions like
 * `o.importExpr(R3.propertyInterpolate).callFn(result)`
 */
export function convertUpdateArguments(
    localResolver: LocalResolver, contextVariableExpression: o.Expression,
    expressionWithArgumentsToExtract: cdAst.Interpolation, bindingId: string) {
  const visitor = new _AstToIrVisitor(
      localResolver, contextVariableExpression, bindingId, /* supportsInterpolation */ true);
  const outputExpr = visitor.visitInterpolation(expressionWithArgumentsToExtract, _Mode.Expression);

  if (visitor.usesImplicitReceiver) {
    localResolver.notifyImplicitReceiverUse();
  }

  const stmts = getStatementsFromVisitor(visitor, bindingId);
  const args = outputExpr.args;
  return {stmts, args};
}

function getStatementsFromVisitor(visitor: _AstToIrVisitor, bindingId: string) {
  const stmts: o.Statement[] = [];
  for (let i = 0; i < visitor.temporaryCount; i++) {
    stmts.push(temporaryDeclaration(bindingId, i));
  }
  return stmts;
}

function convertBuiltins(converterFactory: BuiltinConverterFactory, ast: cdAst.AST): cdAst.AST {
  const visitor = new _BuiltinAstConverter(converterFactory);
  return ast.visit(visitor);
}

function temporaryName(bindingId: string, temporaryNumber: number): string {
  return `tmp_${bindingId}_${temporaryNumber}`;
}

function temporaryDeclaration(bindingId: string, temporaryNumber: number): o.Statement {
  return new o.DeclareVarStmt(temporaryName(bindingId, temporaryNumber));
}

function prependTemporaryDecls(
    temporaryCount: number, bindingId: string, statements: o.Statement[]) {
  for (let i = temporaryCount - 1; i >= 0; i--) {
    statements.unshift(temporaryDeclaration(bindingId, i));
  }
}

enum _Mode {
  Statement,
  Expression
}

function ensureStatementMode(mode: _Mode, ast: cdAst.AST) {
  if (mode !== _Mode.Statement) {
    throw new Error(`Expected a statement, but saw ${ast}`);
  }
}

function ensureExpressionMode(mode: _Mode, ast: cdAst.AST) {
  if (mode !== _Mode.Expression) {
    throw new Error(`Expected an expression, but saw ${ast}`);
  }
}

function convertToStatementIfNeeded(mode: _Mode, expr: o.Expression): o.Expression|o.Statement {
  if (mode === _Mode.Statement) {
    return expr.toStmt();
  } else {
    return expr;
  }
}

class _BuiltinAstConverter extends cdAst.AstTransformer {
  constructor(private _converterFactory: BuiltinConverterFactory) {
    super();
  }
  override visitPipe(ast: cdAst.BindingPipe, context: any): any {
    const args = [ast.exp, ...ast.args].map(ast => ast.visit(this, context));
    return new BuiltinFunctionCall(
        ast.span, ast.sourceSpan, args,
        this._converterFactory.createPipeConverter(ast.name, args.length));
  }
  override visitLiteralArray(ast: cdAst.LiteralArray, context: any): any {
    const args = ast.expressions.map(ast => ast.visit(this, context));
    return new BuiltinFunctionCall(
        ast.span, ast.sourceSpan, args,
        this._converterFactory.createLiteralArrayConverter(ast.expressions.length));
  }
  override visitLiteralMap(ast: cdAst.LiteralMap, context: any): any {
    const args = ast.values.map(ast => ast.visit(this, context));

    return new BuiltinFunctionCall(
        ast.span, ast.sourceSpan, args, this._converterFactory.createLiteralMapConverter(ast.keys));
  }
}

class _AstToIrVisitor implements cdAst.AstVisitor {
  private _nodeMap = new Map<cdAst.AST, cdAst.AST>();
  private _resultMap = new Map<cdAst.AST, o.Expression>();
  private _currentTemporary: number = 0;
  public temporaryCount: number = 0;
  public usesImplicitReceiver: boolean = false;

  constructor(
      private _localResolver: LocalResolver, private _implicitReceiver: o.Expression,
      private bindingId: string, private supportsInterpolation: boolean,
      private baseSourceSpan?: ParseSourceSpan, private implicitReceiverAccesses?: Set<string>) {}

  visitUnary(ast: cdAst.Unary, mode: _Mode): any {
    let op: o.UnaryOperator;
    switch (ast.operator) {
      case '+':
        op = o.UnaryOperator.Plus;
        break;
      case '-':
        op = o.UnaryOperator.Minus;
        break;
      default:
        throw new Error(`Unsupported operator ${ast.operator}`);
    }

    return convertToStatementIfNeeded(
        mode,
        new o.UnaryOperatorExpr(
            op, this._visit(ast.expr, _Mode.Expression), undefined,
            this.convertSourceSpan(ast.span)));
  }

  visitBinary(ast: cdAst.Binary, mode: _Mode): any {
    let op: o.BinaryOperator;
    switch (ast.operation) {
      case '+':
        op = o.BinaryOperator.Plus;
        break;
      case '-':
        op = o.BinaryOperator.Minus;
        break;
      case '*':
        op = o.BinaryOperator.Multiply;
        break;
      case '/':
        op = o.BinaryOperator.Divide;
        break;
      case '%':
        op = o.BinaryOperator.Modulo;
        break;
      case '&&':
        op = o.BinaryOperator.And;
        break;
      case '||':
        op = o.BinaryOperator.Or;
        break;
      case '==':
        op = o.BinaryOperator.Equals;
        break;
      case '!=':
        op = o.BinaryOperator.NotEquals;
        break;
      case '===':
        op = o.BinaryOperator.Identical;
        break;
      case '!==':
        op = o.BinaryOperator.NotIdentical;
        break;
      case '<':
        op = o.BinaryOperator.Lower;
        break;
      case '>':
        op = o.BinaryOperator.Bigger;
        break;
      case '<=':
        op = o.BinaryOperator.LowerEquals;
        break;
      case '>=':
        op = o.BinaryOperator.BiggerEquals;
        break;
      case '??':
        return this.convertNullishCoalesce(ast, mode);
      default:
        throw new Error(`Unsupported operation ${ast.operation}`);
    }

    return convertToStatementIfNeeded(
        mode,
        new o.BinaryOperatorExpr(
            op, this._visit(ast.left, _Mode.Expression), this._visit(ast.right, _Mode.Expression),
            undefined, this.convertSourceSpan(ast.span)));
  }

  visitChain(ast: cdAst.Chain, mode: _Mode): any {
    ensureStatementMode(mode, ast);
    return this.visitAll(ast.expressions, mode);
  }

  visitConditional(ast: cdAst.Conditional, mode: _Mode): any {
    const value: o.Expression = this._visit(ast.condition, _Mode.Expression);
    return convertToStatementIfNeeded(
        mode,
        value.conditional(
            this._visit(ast.trueExp, _Mode.Expression), this._visit(ast.falseExp, _Mode.Expression),
            this.convertSourceSpan(ast.span)));
  }

  visitPipe(ast: cdAst.BindingPipe, mode: _Mode): any {
    throw new Error(
        `Illegal state: Pipes should have been converted into functions. Pipe: ${ast.name}`);
  }

  visitImplicitReceiver(ast: cdAst.ImplicitReceiver, mode: _Mode): any {
    ensureExpressionMode(mode, ast);
    this.usesImplicitReceiver = true;
    return this._implicitReceiver;
  }

  visitThisReceiver(ast: cdAst.ThisReceiver, mode: _Mode): any {
    return this.visitImplicitReceiver(ast, mode);
  }

  visitInterpolation(ast: cdAst.Interpolation, mode: _Mode): InterpolationExpression {
    if (!this.supportsInterpolation) {
      throw new Error('Unexpected interpolation');
    }

    ensureExpressionMode(mode, ast);
    let args: o.Expression[] = [];
    for (let i = 0; i < ast.strings.length - 1; i++) {
      args.push(o.literal(ast.strings[i]));
      args.push(this._visit(ast.expressions[i], _Mode.Expression));
    }
    args.push(o.literal(ast.strings[ast.strings.length - 1]));

    // If we're dealing with an interpolation of 1 value with an empty prefix and suffix, reduce the
    // args returned to just the value, because we're going to pass it to a special instruction.
    const strings = ast.strings;
    if (strings.length === 2 && strings[0] === '' && strings[1] === '') {
      // Single argument interpolate instructions.
      args = [args[1]];
    } else if (ast.expressions.length >= 9) {
      // 9 or more arguments must be passed to the `interpolateV`-style instructions, which accept
      // an array of arguments
      args = [o.literalArr(args)];
    }

    return new InterpolationExpression(args);
  }

  visitKeyedRead(ast: cdAst.KeyedRead, mode: _Mode): any {
    const leftMostSafe = this.leftMostSafeNode(ast);
    if (leftMostSafe) {
      return this.convertSafeAccess(ast, leftMostSafe, mode);
    } else {
      return convertToStatementIfNeeded(
          mode,
          this._visit(ast.receiver, _Mode.Expression).key(this._visit(ast.key, _Mode.Expression)));
    }
  }

  visitKeyedWrite(ast: cdAst.KeyedWrite, mode: _Mode): any {
    const obj: o.Expression = this._visit(ast.receiver, _Mode.Expression);
    const key: o.Expression = this._visit(ast.key, _Mode.Expression);
    const value: o.Expression = this._visit(ast.value, _Mode.Expression);

    if (obj === this._implicitReceiver) {
      this._localResolver.maybeRestoreView();
    }

    return convertToStatementIfNeeded(mode, obj.key(key).set(value));
  }

  visitLiteralArray(ast: cdAst.LiteralArray, mode: _Mode): any {
    throw new Error(`Illegal State: literal arrays should have been converted into functions`);
  }

  visitLiteralMap(ast: cdAst.LiteralMap, mode: _Mode): any {
    throw new Error(`Illegal State: literal maps should have been converted into functions`);
  }

  visitLiteralPrimitive(ast: cdAst.LiteralPrimitive, mode: _Mode): any {
    // For literal values of null, undefined, true, or false allow type interference
    // to infer the type.
    const type =
        ast.value === null || ast.value === undefined || ast.value === true || ast.value === true ?
        o.INFERRED_TYPE :
        undefined;
    return convertToStatementIfNeeded(
        mode, o.literal(ast.value, type, this.convertSourceSpan(ast.span)));
  }

  private _getLocal(name: string, receiver: cdAst.AST): o.Expression|null {
    if (this._localResolver.globals?.has(name) && receiver instanceof cdAst.ThisReceiver) {
      return null;
    }

    return this._localResolver.getLocal(name);
  }

  visitPrefixNot(ast: cdAst.PrefixNot, mode: _Mode): any {
    return convertToStatementIfNeeded(mode, o.not(this._visit(ast.expression, _Mode.Expression)));
  }

  visitNonNullAssert(ast: cdAst.NonNullAssert, mode: _Mode): any {
    return convertToStatementIfNeeded(mode, this._visit(ast.expression, _Mode.Expression));
  }

  visitPropertyRead(ast: cdAst.PropertyRead, mode: _Mode): any {
    const leftMostSafe = this.leftMostSafeNode(ast);
    if (leftMostSafe) {
      return this.convertSafeAccess(ast, leftMostSafe, mode);
    } else {
      let result: any = null;
      const prevUsesImplicitReceiver = this.usesImplicitReceiver;
      const receiver = this._visit(ast.receiver, _Mode.Expression);
      if (receiver === this._implicitReceiver) {
        result = this._getLocal(ast.name, ast.receiver);
        if (result) {
          // Restore the previous "usesImplicitReceiver" state since the implicit
          // receiver has been replaced with a resolved local expression.
          this.usesImplicitReceiver = prevUsesImplicitReceiver;
          this.addImplicitReceiverAccess(ast.name);
        }
      }
      if (result == null) {
        result = receiver.prop(ast.name, this.convertSourceSpan(ast.span));
      }
      return convertToStatementIfNeeded(mode, result);
    }
  }

  visitPropertyWrite(ast: cdAst.PropertyWrite, mode: _Mode): any {
    const receiver: o.Expression = this._visit(ast.receiver, _Mode.Expression);
    const prevUsesImplicitReceiver = this.usesImplicitReceiver;

    let varExpr: o.ReadPropExpr|null = null;
    if (receiver === this._implicitReceiver) {
      const localExpr = this._getLocal(ast.name, ast.receiver);
      if (localExpr) {
        if (localExpr instanceof o.ReadPropExpr) {
          // If the local variable is a property read expression, it's a reference
          // to a 'context.property' value and will be used as the target of the
          // write expression.
          varExpr = localExpr;
          // Restore the previous "usesImplicitReceiver" state since the implicit
          // receiver has been replaced with a resolved local expression.
          this.usesImplicitReceiver = prevUsesImplicitReceiver;
          this.addImplicitReceiverAccess(ast.name);
        } else {
          // Otherwise it's an error.
          const receiver = ast.name;
          const value = (ast.value instanceof cdAst.PropertyRead) ? ast.value.name : undefined;
          throw new Error(`Cannot assign value "${value}" to template variable "${
              receiver}". Template variables are read-only.`);
        }
      }
    }
    // If no local expression could be produced, use the original receiver's
    // property as the target.
    if (varExpr === null) {
      varExpr = receiver.prop(ast.name, this.convertSourceSpan(ast.span));
    }
    return convertToStatementIfNeeded(mode, varExpr.set(this._visit(ast.value, _Mode.Expression)));
  }

  visitSafePropertyRead(ast: cdAst.SafePropertyRead, mode: _Mode): any {
    return this.convertSafeAccess(ast, this.leftMostSafeNode(ast), mode);
  }

  visitSafeKeyedRead(ast: cdAst.SafeKeyedRead, mode: _Mode): any {
    return this.convertSafeAccess(ast, this.leftMostSafeNode(ast), mode);
  }

  visitAll(asts: cdAst.AST[], mode: _Mode): any {
    return asts.map(ast => this._visit(ast, mode));
  }

  visitCall(ast: cdAst.Call, mode: _Mode): any {
    const leftMostSafe = this.leftMostSafeNode(ast);
    if (leftMostSafe) {
      return this.convertSafeAccess(ast, leftMostSafe, mode);
    }

    const convertedArgs = this.visitAll(ast.args, _Mode.Expression);

    if (ast instanceof BuiltinFunctionCall) {
      return convertToStatementIfNeeded(mode, ast.converter(convertedArgs));
    }

    const receiver = ast.receiver;
    if (receiver instanceof cdAst.PropertyRead &&
        receiver.receiver instanceof cdAst.ImplicitReceiver &&
        !(receiver.receiver instanceof cdAst.ThisReceiver) && receiver.name === '$any') {
      if (convertedArgs.length !== 1) {
        throw new Error(`Invalid call to $any, expected 1 argument but received ${
            convertedArgs.length || 'none'}`);
      }
      return convertToStatementIfNeeded(mode, convertedArgs[0] as o.Expression);
    }

    const call = this._visit(receiver, _Mode.Expression)
                     .callFn(convertedArgs, this.convertSourceSpan(ast.span));
    return convertToStatementIfNeeded(mode, call);
  }

  visitSafeCall(ast: cdAst.SafeCall, mode: _Mode): any {
    return this.convertSafeAccess(ast, this.leftMostSafeNode(ast), mode);
  }

  private _visit(ast: cdAst.AST, mode: _Mode): any {
    const result = this._resultMap.get(ast);
    if (result) return result;
    return (this._nodeMap.get(ast) || ast).visit(this, mode);
  }

  private convertSafeAccess(
      ast: cdAst.AST, leftMostSafe: cdAst.SafePropertyRead|cdAst.SafeKeyedRead|cdAst.SafeCall,
      mode: _Mode): any {
    // If the expression contains a safe access node on the left it needs to be converted to
    // an expression that guards the access to the member by checking the receiver for blank. As
    // execution proceeds from left to right, the left most part of the expression must be guarded
    // first but, because member access is left associative, the right side of the expression is at
    // the top of the AST. The desired result requires lifting a copy of the left part of the
    // expression up to test it for blank before generating the unguarded version.

    // Consider, for example the following expression: a?.b.c?.d.e

    // This results in the ast:
    //         .
    //        / \
    //       ?.   e
    //      /  \
    //     .    d
    //    / \
    //   ?.  c
    //  /  \
    // a    b

    // The following tree should be generated:
    //
    //        /---- ? ----\
    //       /      |      \
    //     a   /--- ? ---\  null
    //        /     |     \
    //       .      .     null
    //      / \    / \
    //     .  c   .   e
    //    / \    / \
    //   a   b  .   d
    //         / \
    //        .   c
    //       / \
    //      a   b
    //
    // Notice that the first guard condition is the left hand of the left most safe access node
    // which comes in as leftMostSafe to this routine.

    let guardedExpression = this._visit(leftMostSafe.receiver, _Mode.Expression);
    let temporary: o.ReadVarExpr|undefined = undefined;
    if (this.needsTemporaryInSafeAccess(leftMostSafe.receiver)) {
      // If the expression has method calls or pipes then we need to save the result into a
      // temporary variable to avoid calling stateful or impure code more than once.
      temporary = this.allocateTemporary();

      // Preserve the result in the temporary variable
      guardedExpression = temporary.set(guardedExpression);

      // Ensure all further references to the guarded expression refer to the temporary instead.
      this._resultMap.set(leftMostSafe.receiver, temporary);
    }
    const condition = guardedExpression.isBlank();

    // Convert the ast to an unguarded access to the receiver's member. The map will substitute
    // leftMostNode with its unguarded version in the call to `this.visit()`.
    if (leftMostSafe instanceof cdAst.SafeCall) {
      this._nodeMap.set(
          leftMostSafe,
          new cdAst.Call(
              leftMostSafe.span, leftMostSafe.sourceSpan, leftMostSafe.receiver, leftMostSafe.args,
              leftMostSafe.argumentSpan));
    } else if (leftMostSafe instanceof cdAst.SafeKeyedRead) {
      this._nodeMap.set(
          leftMostSafe,
          new cdAst.KeyedRead(
              leftMostSafe.span, leftMostSafe.sourceSpan, leftMostSafe.receiver, leftMostSafe.key));
    } else {
      this._nodeMap.set(
          leftMostSafe,
          new cdAst.PropertyRead(
              leftMostSafe.span, leftMostSafe.sourceSpan, leftMostSafe.nameSpan,
              leftMostSafe.receiver, leftMostSafe.name));
    }

    // Recursively convert the node now without the guarded member access.
    const access = this._visit(ast, _Mode.Expression);

    // Remove the mapping. This is not strictly required as the converter only traverses each node
    // once but is safer if the conversion is changed to traverse the nodes more than once.
    this._nodeMap.delete(leftMostSafe);

    // If we allocated a temporary, release it.
    if (temporary) {
      this.releaseTemporary(temporary);
    }

    // Produce the conditional
    return convertToStatementIfNeeded(mode, condition.conditional(o.NULL_EXPR, access));
  }

  private convertNullishCoalesce(ast: cdAst.Binary, mode: _Mode): any {
    const left: o.Expression = this._visit(ast.left, _Mode.Expression);
    const right: o.Expression = this._visit(ast.right, _Mode.Expression);
    const temporary = this.allocateTemporary();
    this.releaseTemporary(temporary);

    // Generate the following expression. It is identical to how TS
    // transpiles binary expressions with a nullish coalescing operator.
    // let temp;
    // (temp = a) !== null && temp !== undefined ? temp : b;
    return convertToStatementIfNeeded(
        mode,
        temporary.set(left)
            .notIdentical(o.NULL_EXPR)
            .and(temporary.notIdentical(o.literal(undefined)))
            .conditional(temporary, right));
  }

  // Given an expression of the form a?.b.c?.d.e then the left most safe node is
  // the (a?.b). The . and ?. are left associative thus can be rewritten as:
  // ((((a?.c).b).c)?.d).e. This returns the most deeply nested safe read or
  // safe method call as this needs to be transformed initially to:
  //   a == null ? null : a.c.b.c?.d.e
  // then to:
  //   a == null ? null : a.b.c == null ? null : a.b.c.d.e
  private leftMostSafeNode(ast: cdAst.AST): cdAst.SafePropertyRead|cdAst.SafeKeyedRead {
    const visit = (visitor: cdAst.AstVisitor, ast: cdAst.AST): any => {
      return (this._nodeMap.get(ast) || ast).visit(visitor);
    };
    return ast.visit({
      visitUnary(ast: cdAst.Unary) {
        return null;
      },
      visitBinary(ast: cdAst.Binary) {
        return null;
      },
      visitChain(ast: cdAst.Chain) {
        return null;
      },
      visitConditional(ast: cdAst.Conditional) {
        return null;
      },
      visitCall(ast: cdAst.Call) {
        return visit(this, ast.receiver);
      },
      visitSafeCall(ast: cdAst.SafeCall) {
        return visit(this, ast.receiver) || ast;
      },
      visitImplicitReceiver(ast: cdAst.ImplicitReceiver) {
        return null;
      },
      visitThisReceiver(ast: cdAst.ThisReceiver) {
        return null;
      },
      visitInterpolation(ast: cdAst.Interpolation) {
        return null;
      },
      visitKeyedRead(ast: cdAst.KeyedRead) {
        return visit(this, ast.receiver);
      },
      visitKeyedWrite(ast: cdAst.KeyedWrite) {
        return null;
      },
      visitLiteralArray(ast: cdAst.LiteralArray) {
        return null;
      },
      visitLiteralMap(ast: cdAst.LiteralMap) {
        return null;
      },
      visitLiteralPrimitive(ast: cdAst.LiteralPrimitive) {
        return null;
      },
      visitPipe(ast: cdAst.BindingPipe) {
        return null;
      },
      visitPrefixNot(ast: cdAst.PrefixNot) {
        return null;
      },
      visitNonNullAssert(ast: cdAst.NonNullAssert) {
        return visit(this, ast.expression);
      },
      visitPropertyRead(ast: cdAst.PropertyRead) {
        return visit(this, ast.receiver);
      },
      visitPropertyWrite(ast: cdAst.PropertyWrite) {
        return null;
      },
      visitSafePropertyRead(ast: cdAst.SafePropertyRead) {
        return visit(this, ast.receiver) || ast;
      },
      visitSafeKeyedRead(ast: cdAst.SafeKeyedRead) {
        return visit(this, ast.receiver) || ast;
      }
    });
  }

  // Returns true of the AST includes a method or a pipe indicating that, if the
  // expression is used as the target of a safe property or method access then
  // the expression should be stored into a temporary variable.
  private needsTemporaryInSafeAccess(ast: cdAst.AST): boolean {
    const visit = (visitor: cdAst.AstVisitor, ast: cdAst.AST): boolean => {
      return ast && (this._nodeMap.get(ast) || ast).visit(visitor);
    };
    const visitSome = (visitor: cdAst.AstVisitor, ast: cdAst.AST[]): boolean => {
      return ast.some(ast => visit(visitor, ast));
    };
    return ast.visit({
      visitUnary(ast: cdAst.Unary): boolean {
        return visit(this, ast.expr);
      },
      visitBinary(ast: cdAst.Binary): boolean {
        return visit(this, ast.left) || visit(this, ast.right);
      },
      visitChain(ast: cdAst.Chain) {
        return false;
      },
      visitConditional(ast: cdAst.Conditional): boolean {
        return visit(this, ast.condition) || visit(this, ast.trueExp) || visit(this, ast.falseExp);
      },
      visitCall(ast: cdAst.Call) {
        return true;
      },
      visitSafeCall(ast: cdAst.SafeCall) {
        return true;
      },
      visitImplicitReceiver(ast: cdAst.ImplicitReceiver) {
        return false;
      },
      visitThisReceiver(ast: cdAst.ThisReceiver) {
        return false;
      },
      visitInterpolation(ast: cdAst.Interpolation) {
        return visitSome(this, ast.expressions);
      },
      visitKeyedRead(ast: cdAst.KeyedRead) {
        return false;
      },
      visitKeyedWrite(ast: cdAst.KeyedWrite) {
        return false;
      },
      visitLiteralArray(ast: cdAst.LiteralArray) {
        return true;
      },
      visitLiteralMap(ast: cdAst.LiteralMap) {
        return true;
      },
      visitLiteralPrimitive(ast: cdAst.LiteralPrimitive) {
        return false;
      },
      visitPipe(ast: cdAst.BindingPipe) {
        return true;
      },
      visitPrefixNot(ast: cdAst.PrefixNot) {
        return visit(this, ast.expression);
      },
      visitNonNullAssert(ast: cdAst.PrefixNot) {
        return visit(this, ast.expression);
      },
      visitPropertyRead(ast: cdAst.PropertyRead) {
        return false;
      },
      visitPropertyWrite(ast: cdAst.PropertyWrite) {
        return false;
      },
      visitSafePropertyRead(ast: cdAst.SafePropertyRead) {
        return false;
      },
      visitSafeKeyedRead(ast: cdAst.SafeKeyedRead) {
        return false;
      }
    });
  }

  private allocateTemporary(): o.ReadVarExpr {
    const tempNumber = this._currentTemporary++;
    this.temporaryCount = Math.max(this._currentTemporary, this.temporaryCount);
    return new o.ReadVarExpr(temporaryName(this.bindingId, tempNumber));
  }

  private releaseTemporary(temporary: o.ReadVarExpr) {
    this._currentTemporary--;
    if (temporary.name != temporaryName(this.bindingId, this._currentTemporary)) {
      throw new Error(`Temporary ${temporary.name} released out of order`);
    }
  }

  /**
   * Creates an absolute `ParseSourceSpan` from the relative `ParseSpan`.
   *
   * `ParseSpan` objects are relative to the start of the expression.
   * This method converts these to full `ParseSourceSpan` objects that
   * show where the span is within the overall source file.
   *
   * @param span the relative span to convert.
   * @returns a `ParseSourceSpan` for the given span or null if no
   * `baseSourceSpan` was provided to this class.
   */
  private convertSourceSpan(span: cdAst.ParseSpan) {
    if (this.baseSourceSpan) {
      const start = this.baseSourceSpan.start.moveBy(span.start);
      const end = this.baseSourceSpan.start.moveBy(span.end);
      const fullStart = this.baseSourceSpan.fullStart.moveBy(span.start);
      return new ParseSourceSpan(start, end, fullStart);
    } else {
      return null;
    }
  }

  /** Adds the name of an AST to the list of implicit receiver accesses. */
  private addImplicitReceiverAccess(name: string) {
    if (this.implicitReceiverAccesses) {
      this.implicitReceiverAccesses.add(name);
    }
  }
}

function flattenStatements(arg: any, output: o.Statement[]) {
  if (Array.isArray(arg)) {
    (<any[]>arg).forEach((entry) => flattenStatements(entry, output));
  } else {
    output.push(arg);
  }
}

function unsupported(): never {
  throw new Error('Unsupported operation');
}

class InterpolationExpression extends o.Expression {
  constructor(public args: o.Expression[]) {
    super(null, null);
  }

  override isConstant = unsupported;
  override isEquivalent = unsupported;
  override visitExpression = unsupported;
}

class DefaultLocalResolver implements LocalResolver {
  constructor(public globals?: Set<string>) {}
  notifyImplicitReceiverUse(): void {}
  maybeRestoreView(): void {}
  getLocal(name: string): o.Expression|null {
    if (name === EventHandlerVars.event.name) {
      return EventHandlerVars.event;
    }
    return null;
  }
}

export class BuiltinFunctionCall extends cdAst.Call {
  constructor(
      span: cdAst.ParseSpan, sourceSpan: cdAst.AbsoluteSourceSpan, args: cdAst.AST[],
      public converter: BuiltinConverter) {
    super(span, sourceSpan, new cdAst.EmptyExpr(span, sourceSpan), args, null!);
  }
}
