/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileReflector} from '../compile_reflector';
import * as o from './output_ast';
import {debugOutputAstAsTypeScript} from './ts_emitter';

export function interpretStatements(
    statements: o.Statement[], reflector: CompileReflector): {[key: string]: any} {
  const ctx = new _ExecutionContext(null, null, null, new Map<string, any>());
  const visitor = new StatementInterpreter(reflector);
  visitor.visitAllStatements(statements, ctx);
  const result: {[key: string]: any} = {};
  ctx.exports.forEach((exportName) => {
    result[exportName] = ctx.vars.get(exportName);
  });
  return result;
}

function _executeFunctionStatements(
    varNames: string[], varValues: any[], statements: o.Statement[], ctx: _ExecutionContext,
    visitor: StatementInterpreter): any {
  const childCtx = ctx.createChildWihtLocalVars();
  for (let i = 0; i < varNames.length; i++) {
    childCtx.vars.set(varNames[i], varValues[i]);
  }
  const result = visitor.visitAllStatements(statements, childCtx);
  return result ? result.value : null;
}

class _ExecutionContext {
  exports: string[] = [];

  constructor(
      public parent: _ExecutionContext|null, public instance: Object|null,
      public className: string|null, public vars: Map<string, any>) {}

  createChildWihtLocalVars(): _ExecutionContext {
    return new _ExecutionContext(this, this.instance, this.className, new Map<string, any>());
  }
}

class ReturnValue {
  constructor(public value: any) {}
}

function createDynamicClass(
    _classStmt: o.ClassStmt, _ctx: _ExecutionContext, _visitor: StatementInterpreter): Function {
  const propertyDescriptors: {[key: string]: any} = {};

  _classStmt.getters.forEach((getter: o.ClassGetter) => {
    // Note: use `function` instead of arrow function to capture `this`
    propertyDescriptors[getter.name] = {
      configurable: false,
      get: function() {
        const instanceCtx = new _ExecutionContext(_ctx, this, _classStmt.name, _ctx.vars);
        return _executeFunctionStatements([], [], getter.body, instanceCtx, _visitor);
      }
    };
  });
  _classStmt.methods.forEach(function(method: o.ClassMethod) {
    const paramNames = method.params.map(param => param.name);
    // Note: use `function` instead of arrow function to capture `this`
    propertyDescriptors[method.name!] = {
      writable: false,
      configurable: false,
      value: function(...args: any[]) {
        const instanceCtx = new _ExecutionContext(_ctx, this, _classStmt.name, _ctx.vars);
        return _executeFunctionStatements(paramNames, args, method.body, instanceCtx, _visitor);
      }
    };
  });

  const ctorParamNames = _classStmt.constructorMethod.params.map(param => param.name);
  // Note: use `function` instead of arrow function to capture `this`
  const ctor = function(this: Object, ...args: any[]) {
    const instanceCtx = new _ExecutionContext(_ctx, this, _classStmt.name, _ctx.vars);
    _classStmt.fields.forEach((field) => {
      (this as any)[field.name] = undefined;
    });
    _executeFunctionStatements(
        ctorParamNames, args, _classStmt.constructorMethod.body, instanceCtx, _visitor);
  };
  const superClass = _classStmt.parent ? _classStmt.parent.visitExpression(_visitor, _ctx) : Object;
  ctor.prototype = Object.create(superClass.prototype, propertyDescriptors);
  return ctor;
}

class StatementInterpreter implements o.StatementVisitor, o.ExpressionVisitor {
  constructor(private reflector: CompileReflector) {}
  debugAst(ast: o.Expression|o.Statement|o.Type): string {
    return debugOutputAstAsTypeScript(ast);
  }

  visitDeclareVarStmt(stmt: o.DeclareVarStmt, ctx: _ExecutionContext): any {
    const initialValue = stmt.value ? stmt.value.visitExpression(this, ctx) : undefined;
    ctx.vars.set(stmt.name, initialValue);
    if (stmt.hasModifier(o.StmtModifier.Exported)) {
      ctx.exports.push(stmt.name);
    }
    return null;
  }
  visitWriteVarExpr(expr: o.WriteVarExpr, ctx: _ExecutionContext): any {
    const value = expr.value.visitExpression(this, ctx);
    let currCtx = ctx;
    while (currCtx != null) {
      if (currCtx.vars.has(expr.name)) {
        currCtx.vars.set(expr.name, value);
        return value;
      }
      currCtx = currCtx.parent!;
    }
    throw new Error(`Not declared variable ${expr.name}`);
  }
  visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, ctx: _ExecutionContext): never {
    throw new Error('Cannot interpret a WrappedNodeExpr.');
  }
  visitTypeofExpr(ast: o.TypeofExpr, ctx: _ExecutionContext): never {
    throw new Error('Cannot interpret a TypeofExpr');
  }
  visitReadVarExpr(ast: o.ReadVarExpr, ctx: _ExecutionContext): any {
    let varName = ast.name!;
    if (ast.builtin != null) {
      switch (ast.builtin) {
        case o.BuiltinVar.Super:
          return Object.getPrototypeOf(ctx.instance);
        case o.BuiltinVar.This:
          return ctx.instance;
        case o.BuiltinVar.CatchError:
          varName = CATCH_ERROR_VAR;
          break;
        case o.BuiltinVar.CatchStack:
          varName = CATCH_STACK_VAR;
          break;
        default:
          throw new Error(`Unknown builtin variable ${ast.builtin}`);
      }
    }
    let currCtx = ctx;
    while (currCtx != null) {
      if (currCtx.vars.has(varName)) {
        return currCtx.vars.get(varName);
      }
      currCtx = currCtx.parent!;
    }
    throw new Error(`Not declared variable ${varName}`);
  }
  visitWriteKeyExpr(expr: o.WriteKeyExpr, ctx: _ExecutionContext): any {
    const receiver = expr.receiver.visitExpression(this, ctx);
    const index = expr.index.visitExpression(this, ctx);
    const value = expr.value.visitExpression(this, ctx);
    receiver[index] = value;
    return value;
  }
  visitWritePropExpr(expr: o.WritePropExpr, ctx: _ExecutionContext): any {
    const receiver = expr.receiver.visitExpression(this, ctx);
    const value = expr.value.visitExpression(this, ctx);
    receiver[expr.name] = value;
    return value;
  }

  visitInvokeMethodExpr(expr: o.InvokeMethodExpr, ctx: _ExecutionContext): any {
    const receiver = expr.receiver.visitExpression(this, ctx);
    const args = this.visitAllExpressions(expr.args, ctx);
    let result: any;
    if (expr.builtin != null) {
      switch (expr.builtin) {
        case o.BuiltinMethod.ConcatArray:
          result = receiver.concat(...args);
          break;
        case o.BuiltinMethod.SubscribeObservable:
          result = receiver.subscribe({next: args[0]});
          break;
        case o.BuiltinMethod.Bind:
          result = receiver.bind(...args);
          break;
        default:
          throw new Error(`Unknown builtin method ${expr.builtin}`);
      }
    } else {
      result = receiver[expr.name!].apply(receiver, args);
    }
    return result;
  }
  visitInvokeFunctionExpr(stmt: o.InvokeFunctionExpr, ctx: _ExecutionContext): any {
    const args = this.visitAllExpressions(stmt.args, ctx);
    const fnExpr = stmt.fn;
    if (fnExpr instanceof o.ReadVarExpr && fnExpr.builtin === o.BuiltinVar.Super) {
      ctx.instance!.constructor.prototype.constructor.apply(ctx.instance, args);
      return null;
    } else {
      const fn = stmt.fn.visitExpression(this, ctx);
      return fn.apply(null, args);
    }
  }
  visitTaggedTemplateExpr(expr: o.TaggedTemplateExpr, ctx: _ExecutionContext): any {
    const templateElements = expr.template.elements.map((e) => e.text);
    Object.defineProperty(
        templateElements, 'raw', {value: expr.template.elements.map((e) => e.rawText)});
    const args = this.visitAllExpressions(expr.template.expressions, ctx);
    args.unshift(templateElements);
    const tag = expr.tag.visitExpression(this, ctx);
    return tag.apply(null, args);
  }
  visitReturnStmt(stmt: o.ReturnStatement, ctx: _ExecutionContext): any {
    return new ReturnValue(stmt.value.visitExpression(this, ctx));
  }
  visitDeclareClassStmt(stmt: o.ClassStmt, ctx: _ExecutionContext): any {
    const clazz = createDynamicClass(stmt, ctx, this);
    ctx.vars.set(stmt.name, clazz);
    if (stmt.hasModifier(o.StmtModifier.Exported)) {
      ctx.exports.push(stmt.name);
    }
    return null;
  }
  visitExpressionStmt(stmt: o.ExpressionStatement, ctx: _ExecutionContext): any {
    return stmt.expr.visitExpression(this, ctx);
  }
  visitIfStmt(stmt: o.IfStmt, ctx: _ExecutionContext): any {
    const condition = stmt.condition.visitExpression(this, ctx);
    if (condition) {
      return this.visitAllStatements(stmt.trueCase, ctx);
    } else if (stmt.falseCase != null) {
      return this.visitAllStatements(stmt.falseCase, ctx);
    }
    return null;
  }
  visitTryCatchStmt(stmt: o.TryCatchStmt, ctx: _ExecutionContext): any {
    try {
      return this.visitAllStatements(stmt.bodyStmts, ctx);
    } catch (e) {
      const childCtx = ctx.createChildWihtLocalVars();
      childCtx.vars.set(CATCH_ERROR_VAR, e);
      childCtx.vars.set(CATCH_STACK_VAR, e.stack);
      return this.visitAllStatements(stmt.catchStmts, childCtx);
    }
  }
  visitThrowStmt(stmt: o.ThrowStmt, ctx: _ExecutionContext): any {
    throw stmt.error.visitExpression(this, ctx);
  }
  visitInstantiateExpr(ast: o.InstantiateExpr, ctx: _ExecutionContext): any {
    const args = this.visitAllExpressions(ast.args, ctx);
    const clazz = ast.classExpr.visitExpression(this, ctx);
    return new clazz(...args);
  }
  visitLiteralExpr(ast: o.LiteralExpr, ctx: _ExecutionContext): any {
    return ast.value;
  }
  visitLocalizedString(ast: o.LocalizedString, context: any): any {
    return null;
  }
  visitExternalExpr(ast: o.ExternalExpr, ctx: _ExecutionContext): any {
    return this.reflector.resolveExternalReference(ast.value);
  }
  visitConditionalExpr(ast: o.ConditionalExpr, ctx: _ExecutionContext): any {
    if (ast.condition.visitExpression(this, ctx)) {
      return ast.trueCase.visitExpression(this, ctx);
    } else if (ast.falseCase != null) {
      return ast.falseCase.visitExpression(this, ctx);
    }
    return null;
  }
  visitNotExpr(ast: o.NotExpr, ctx: _ExecutionContext): any {
    return !ast.condition.visitExpression(this, ctx);
  }
  visitAssertNotNullExpr(ast: o.AssertNotNull, ctx: _ExecutionContext): any {
    return ast.condition.visitExpression(this, ctx);
  }
  visitCastExpr(ast: o.CastExpr, ctx: _ExecutionContext): any {
    return ast.value.visitExpression(this, ctx);
  }
  visitFunctionExpr(ast: o.FunctionExpr, ctx: _ExecutionContext): any {
    const paramNames = ast.params.map((param) => param.name);
    return _declareFn(paramNames, ast.statements, ctx, this);
  }
  visitDeclareFunctionStmt(stmt: o.DeclareFunctionStmt, ctx: _ExecutionContext): any {
    const paramNames = stmt.params.map((param) => param.name);
    ctx.vars.set(stmt.name, _declareFn(paramNames, stmt.statements, ctx, this));
    if (stmt.hasModifier(o.StmtModifier.Exported)) {
      ctx.exports.push(stmt.name);
    }
    return null;
  }
  visitUnaryOperatorExpr(ast: o.UnaryOperatorExpr, ctx: _ExecutionContext): any {
    const rhs = () => ast.expr.visitExpression(this, ctx);

    switch (ast.operator) {
      case o.UnaryOperator.Plus:
        return +rhs();
      case o.UnaryOperator.Minus:
        return -rhs();
      default:
        throw new Error(`Unknown operator ${ast.operator}`);
    }
  }
  visitBinaryOperatorExpr(ast: o.BinaryOperatorExpr, ctx: _ExecutionContext): any {
    const lhs = () => ast.lhs.visitExpression(this, ctx);
    const rhs = () => ast.rhs.visitExpression(this, ctx);

    switch (ast.operator) {
      case o.BinaryOperator.Equals:
        return lhs() == rhs();
      case o.BinaryOperator.Identical:
        return lhs() === rhs();
      case o.BinaryOperator.NotEquals:
        return lhs() != rhs();
      case o.BinaryOperator.NotIdentical:
        return lhs() !== rhs();
      case o.BinaryOperator.And:
        return lhs() && rhs();
      case o.BinaryOperator.Or:
        return lhs() || rhs();
      case o.BinaryOperator.Plus:
        return lhs() + rhs();
      case o.BinaryOperator.Minus:
        return lhs() - rhs();
      case o.BinaryOperator.Divide:
        return lhs() / rhs();
      case o.BinaryOperator.Multiply:
        return lhs() * rhs();
      case o.BinaryOperator.Modulo:
        return lhs() % rhs();
      case o.BinaryOperator.Lower:
        return lhs() < rhs();
      case o.BinaryOperator.LowerEquals:
        return lhs() <= rhs();
      case o.BinaryOperator.Bigger:
        return lhs() > rhs();
      case o.BinaryOperator.BiggerEquals:
        return lhs() >= rhs();
      default:
        throw new Error(`Unknown operator ${ast.operator}`);
    }
  }
  visitReadPropExpr(ast: o.ReadPropExpr, ctx: _ExecutionContext): any {
    let result: any;
    const receiver = ast.receiver.visitExpression(this, ctx);
    result = receiver[ast.name];
    return result;
  }
  visitReadKeyExpr(ast: o.ReadKeyExpr, ctx: _ExecutionContext): any {
    const receiver = ast.receiver.visitExpression(this, ctx);
    const prop = ast.index.visitExpression(this, ctx);
    return receiver[prop];
  }
  visitLiteralArrayExpr(ast: o.LiteralArrayExpr, ctx: _ExecutionContext): any {
    return this.visitAllExpressions(ast.entries, ctx);
  }
  visitLiteralMapExpr(ast: o.LiteralMapExpr, ctx: _ExecutionContext): any {
    const result: {[k: string]: any} = {};
    ast.entries.forEach(entry => result[entry.key] = entry.value.visitExpression(this, ctx));
    return result;
  }
  visitCommaExpr(ast: o.CommaExpr, context: any): any {
    const values = this.visitAllExpressions(ast.parts, context);
    return values[values.length - 1];
  }
  visitAllExpressions(expressions: o.Expression[], ctx: _ExecutionContext): any {
    return expressions.map((expr) => expr.visitExpression(this, ctx));
  }

  visitAllStatements(statements: o.Statement[], ctx: _ExecutionContext): ReturnValue|null {
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const val = stmt.visitStatement(this, ctx);
      if (val instanceof ReturnValue) {
        return val;
      }
    }
    return null;
  }
}

function _declareFn(
    varNames: string[], statements: o.Statement[], ctx: _ExecutionContext,
    visitor: StatementInterpreter): Function {
  return (...args: any[]) => _executeFunctionStatements(varNames, args, statements, ctx, visitor);
}

const CATCH_ERROR_VAR = 'error';
const CATCH_STACK_VAR = 'stack';
