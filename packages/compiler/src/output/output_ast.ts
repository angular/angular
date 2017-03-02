/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {CompileIdentifierMetadata} from '../compile_metadata';
import {ParseSourceSpan} from '../parse_util';

//// Types
export enum TypeModifier {
  Const
}

export abstract class Type {
  constructor(public modifiers: TypeModifier[] = null) {
    if (!modifiers) {
      this.modifiers = [];
    }
  }
  abstract visitType(visitor: TypeVisitor, context: any): any;

  hasModifier(modifier: TypeModifier): boolean { return this.modifiers.indexOf(modifier) !== -1; }
}

export enum BuiltinTypeName {
  Dynamic,
  Bool,
  String,
  Int,
  Number,
  Function,
  Inferred
}

export class BuiltinType extends Type {
  constructor(public name: BuiltinTypeName, modifiers: TypeModifier[] = null) { super(modifiers); }
  visitType(visitor: TypeVisitor, context: any): any {
    return visitor.visitBuiltintType(this, context);
  }
}

export class ExpressionType extends Type {
  constructor(public value: Expression, modifiers: TypeModifier[] = null) { super(modifiers); }
  visitType(visitor: TypeVisitor, context: any): any {
    return visitor.visitExpressionType(this, context);
  }
}


export class ArrayType extends Type {
  constructor(public of : Type, modifiers: TypeModifier[] = null) { super(modifiers); }
  visitType(visitor: TypeVisitor, context: any): any {
    return visitor.visitArrayType(this, context);
  }
}


export class MapType extends Type {
  constructor(public valueType: Type, modifiers: TypeModifier[] = null) { super(modifiers); }
  visitType(visitor: TypeVisitor, context: any): any { return visitor.visitMapType(this, context); }
}

export const DYNAMIC_TYPE = new BuiltinType(BuiltinTypeName.Dynamic);
export const INFERRED_TYPE = new BuiltinType(BuiltinTypeName.Inferred);
export const BOOL_TYPE = new BuiltinType(BuiltinTypeName.Bool);
export const INT_TYPE = new BuiltinType(BuiltinTypeName.Int);
export const NUMBER_TYPE = new BuiltinType(BuiltinTypeName.Number);
export const STRING_TYPE = new BuiltinType(BuiltinTypeName.String);
export const FUNCTION_TYPE = new BuiltinType(BuiltinTypeName.Function);

export interface TypeVisitor {
  visitBuiltintType(type: BuiltinType, context: any): any;
  visitExpressionType(type: ExpressionType, context: any): any;
  visitArrayType(type: ArrayType, context: any): any;
  visitMapType(type: MapType, context: any): any;
}

///// Expressions

export enum BinaryOperator {
  Equals,
  NotEquals,
  Identical,
  NotIdentical,
  Minus,
  Plus,
  Divide,
  Multiply,
  Modulo,
  And,
  Or,
  Lower,
  LowerEquals,
  Bigger,
  BiggerEquals
}


export abstract class Expression {
  constructor(public type: Type, public sourceSpan?: ParseSourceSpan) {}

  abstract visitExpression(visitor: ExpressionVisitor, context: any): any;

  prop(name: string, sourceSpan?: ParseSourceSpan): ReadPropExpr {
    return new ReadPropExpr(this, name, null, sourceSpan);
  }

  key(index: Expression, type: Type = null, sourceSpan?: ParseSourceSpan): ReadKeyExpr {
    return new ReadKeyExpr(this, index, type, sourceSpan);
  }

  callMethod(name: string|BuiltinMethod, params: Expression[], sourceSpan?: ParseSourceSpan):
      InvokeMethodExpr {
    return new InvokeMethodExpr(this, name, params, null, sourceSpan);
  }

  callFn(params: Expression[], sourceSpan?: ParseSourceSpan): InvokeFunctionExpr {
    return new InvokeFunctionExpr(this, params, null, sourceSpan);
  }

  instantiate(params: Expression[], type: Type = null, sourceSpan?: ParseSourceSpan):
      InstantiateExpr {
    return new InstantiateExpr(this, params, type, sourceSpan);
  }

  conditional(trueCase: Expression, falseCase: Expression = null, sourceSpan?: ParseSourceSpan):
      ConditionalExpr {
    return new ConditionalExpr(this, trueCase, falseCase, null, sourceSpan);
  }

  equals(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Equals, this, rhs, null, sourceSpan);
  }
  notEquals(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.NotEquals, this, rhs, null, sourceSpan);
  }
  identical(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Identical, this, rhs, null, sourceSpan);
  }
  notIdentical(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.NotIdentical, this, rhs, null, sourceSpan);
  }
  minus(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Minus, this, rhs, null, sourceSpan);
  }
  plus(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Plus, this, rhs, null, sourceSpan);
  }
  divide(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Divide, this, rhs, null, sourceSpan);
  }
  multiply(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Multiply, this, rhs, null, sourceSpan);
  }
  modulo(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Modulo, this, rhs, null, sourceSpan);
  }
  and(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.And, this, rhs, null, sourceSpan);
  }
  or(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Or, this, rhs, null, sourceSpan);
  }
  lower(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Lower, this, rhs, null, sourceSpan);
  }
  lowerEquals(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.LowerEquals, this, rhs, null, sourceSpan);
  }
  bigger(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.Bigger, this, rhs, null, sourceSpan);
  }
  biggerEquals(rhs: Expression, sourceSpan?: ParseSourceSpan): BinaryOperatorExpr {
    return new BinaryOperatorExpr(BinaryOperator.BiggerEquals, this, rhs, null, sourceSpan);
  }
  isBlank(sourceSpan?: ParseSourceSpan): Expression {
    // Note: We use equals by purpose here to compare to null and undefined in JS.
    // We use the typed null to allow strictNullChecks to narrow types.
    return this.equals(TYPED_NULL_EXPR, sourceSpan);
  }
  cast(type: Type, sourceSpan?: ParseSourceSpan): Expression {
    return new CastExpr(this, type, sourceSpan);
  }

  toStmt(): Statement { return new ExpressionStatement(this); }
}

export enum BuiltinVar {
  This,
  Super,
  CatchError,
  CatchStack
}

export class ReadVarExpr extends Expression {
  public name: string;
  public builtin: BuiltinVar;

  constructor(name: string|BuiltinVar, type: Type = null, sourceSpan?: ParseSourceSpan) {
    super(type, sourceSpan);
    if (typeof name === 'string') {
      this.name = name;
      this.builtin = null;
    } else {
      this.name = null;
      this.builtin = <BuiltinVar>name;
    }
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitReadVarExpr(this, context);
  }

  set(value: Expression): WriteVarExpr {
    return new WriteVarExpr(this.name, value, null, this.sourceSpan);
  }
}


export class WriteVarExpr extends Expression {
  public value: Expression;
  constructor(
      public name: string, value: Expression, type: Type = null, sourceSpan?: ParseSourceSpan) {
    super(type || value.type, sourceSpan);
    this.value = value;
  }

  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitWriteVarExpr(this, context);
  }

  toDeclStmt(type: Type = null, modifiers: StmtModifier[] = null): DeclareVarStmt {
    return new DeclareVarStmt(this.name, this.value, type, modifiers, this.sourceSpan);
  }
}


export class WriteKeyExpr extends Expression {
  public value: Expression;
  constructor(
      public receiver: Expression, public index: Expression, value: Expression, type: Type = null,
      sourceSpan?: ParseSourceSpan) {
    super(type || value.type, sourceSpan);
    this.value = value;
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitWriteKeyExpr(this, context);
  }
}


export class WritePropExpr extends Expression {
  public value: Expression;
  constructor(
      public receiver: Expression, public name: string, value: Expression, type: Type = null,
      sourceSpan?: ParseSourceSpan) {
    super(type || value.type, sourceSpan);
    this.value = value;
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitWritePropExpr(this, context);
  }
}

export enum BuiltinMethod {
  ConcatArray,
  SubscribeObservable,
  Bind
}

export class InvokeMethodExpr extends Expression {
  public name: string;
  public builtin: BuiltinMethod;
  constructor(
      public receiver: Expression, method: string|BuiltinMethod, public args: Expression[],
      type: Type = null, sourceSpan?: ParseSourceSpan) {
    super(type, sourceSpan);
    if (typeof method === 'string') {
      this.name = method;
      this.builtin = null;
    } else {
      this.name = null;
      this.builtin = <BuiltinMethod>method;
    }
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitInvokeMethodExpr(this, context);
  }
}


export class InvokeFunctionExpr extends Expression {
  constructor(
      public fn: Expression, public args: Expression[], type: Type = null,
      sourceSpan?: ParseSourceSpan) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitInvokeFunctionExpr(this, context);
  }
}


export class InstantiateExpr extends Expression {
  constructor(
      public classExpr: Expression, public args: Expression[], type?: Type,
      sourceSpan?: ParseSourceSpan) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitInstantiateExpr(this, context);
  }
}


export class LiteralExpr extends Expression {
  constructor(public value: any, type: Type = null, sourceSpan?: ParseSourceSpan) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitLiteralExpr(this, context);
  }
}


export class ExternalExpr extends Expression {
  constructor(
      public value: CompileIdentifierMetadata, type: Type = null, public typeParams: Type[] = null,
      sourceSpan?: ParseSourceSpan) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitExternalExpr(this, context);
  }
}


export class ConditionalExpr extends Expression {
  public trueCase: Expression;
  constructor(
      public condition: Expression, trueCase: Expression, public falseCase: Expression = null,
      type: Type = null, sourceSpan?: ParseSourceSpan) {
    super(type || trueCase.type, sourceSpan);
    this.trueCase = trueCase;
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitConditionalExpr(this, context);
  }
}


export class NotExpr extends Expression {
  constructor(public condition: Expression, sourceSpan?: ParseSourceSpan) {
    super(BOOL_TYPE, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitNotExpr(this, context);
  }
}

export class CastExpr extends Expression {
  constructor(public value: Expression, type: Type, sourceSpan?: ParseSourceSpan) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitCastExpr(this, context);
  }
}


export class FnParam {
  constructor(public name: string, public type: Type = null) {}
}


export class FunctionExpr extends Expression {
  constructor(
      public params: FnParam[], public statements: Statement[], type: Type = null,
      sourceSpan?: ParseSourceSpan) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitFunctionExpr(this, context);
  }

  toDeclStmt(name: string, modifiers: StmtModifier[] = null): DeclareFunctionStmt {
    return new DeclareFunctionStmt(
        name, this.params, this.statements, this.type, modifiers, this.sourceSpan);
  }
}


export class BinaryOperatorExpr extends Expression {
  public lhs: Expression;
  constructor(
      public operator: BinaryOperator, lhs: Expression, public rhs: Expression, type: Type = null,
      sourceSpan?: ParseSourceSpan) {
    super(type || lhs.type, sourceSpan);
    this.lhs = lhs;
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitBinaryOperatorExpr(this, context);
  }
}


export class ReadPropExpr extends Expression {
  constructor(
      public receiver: Expression, public name: string, type: Type = null,
      sourceSpan?: ParseSourceSpan) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitReadPropExpr(this, context);
  }
  set(value: Expression): WritePropExpr {
    return new WritePropExpr(this.receiver, this.name, value, null, this.sourceSpan);
  }
}


export class ReadKeyExpr extends Expression {
  constructor(
      public receiver: Expression, public index: Expression, type: Type = null,
      sourceSpan?: ParseSourceSpan) {
    super(type, sourceSpan);
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitReadKeyExpr(this, context);
  }
  set(value: Expression): WriteKeyExpr {
    return new WriteKeyExpr(this.receiver, this.index, value, null, this.sourceSpan);
  }
}


export class LiteralArrayExpr extends Expression {
  public entries: Expression[];
  constructor(entries: Expression[], type: Type = null, sourceSpan?: ParseSourceSpan) {
    super(type, sourceSpan);
    this.entries = entries;
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitLiteralArrayExpr(this, context);
  }
}

export class LiteralMapEntry {
  constructor(public key: string, public value: Expression, public quoted: boolean = false) {}
}

export class LiteralMapExpr extends Expression {
  public valueType: Type = null;
  constructor(
      public entries: LiteralMapEntry[], type: MapType = null, sourceSpan?: ParseSourceSpan) {
    super(type, sourceSpan);
    if (type) {
      this.valueType = type.valueType;
    }
  }
  visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitLiteralMapExpr(this, context);
  }
}

export interface ExpressionVisitor {
  visitReadVarExpr(ast: ReadVarExpr, context: any): any;
  visitWriteVarExpr(expr: WriteVarExpr, context: any): any;
  visitWriteKeyExpr(expr: WriteKeyExpr, context: any): any;
  visitWritePropExpr(expr: WritePropExpr, context: any): any;
  visitInvokeMethodExpr(ast: InvokeMethodExpr, context: any): any;
  visitInvokeFunctionExpr(ast: InvokeFunctionExpr, context: any): any;
  visitInstantiateExpr(ast: InstantiateExpr, context: any): any;
  visitLiteralExpr(ast: LiteralExpr, context: any): any;
  visitExternalExpr(ast: ExternalExpr, context: any): any;
  visitConditionalExpr(ast: ConditionalExpr, context: any): any;
  visitNotExpr(ast: NotExpr, context: any): any;
  visitCastExpr(ast: CastExpr, context: any): any;
  visitFunctionExpr(ast: FunctionExpr, context: any): any;
  visitBinaryOperatorExpr(ast: BinaryOperatorExpr, context: any): any;
  visitReadPropExpr(ast: ReadPropExpr, context: any): any;
  visitReadKeyExpr(ast: ReadKeyExpr, context: any): any;
  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: any): any;
  visitLiteralMapExpr(ast: LiteralMapExpr, context: any): any;
}

export const THIS_EXPR = new ReadVarExpr(BuiltinVar.This);
export const SUPER_EXPR = new ReadVarExpr(BuiltinVar.Super);
export const CATCH_ERROR_VAR = new ReadVarExpr(BuiltinVar.CatchError);
export const CATCH_STACK_VAR = new ReadVarExpr(BuiltinVar.CatchStack);
export const NULL_EXPR = new LiteralExpr(null, null);
export const TYPED_NULL_EXPR = new LiteralExpr(null, INFERRED_TYPE);

//// Statements
export enum StmtModifier {
  Final,
  Private
}

export abstract class Statement {
  constructor(public modifiers: StmtModifier[] = null, public sourceSpan?: ParseSourceSpan) {
    if (!modifiers) {
      this.modifiers = [];
    }
  }

  abstract visitStatement(visitor: StatementVisitor, context: any): any;

  hasModifier(modifier: StmtModifier): boolean { return this.modifiers.indexOf(modifier) !== -1; }
}


export class DeclareVarStmt extends Statement {
  public type: Type;
  constructor(
      public name: string, public value: Expression, type: Type = null,
      modifiers: StmtModifier[] = null, sourceSpan?: ParseSourceSpan) {
    super(modifiers, sourceSpan);
    this.type = type || value.type;
  }

  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitDeclareVarStmt(this, context);
  }
}

export class DeclareFunctionStmt extends Statement {
  constructor(
      public name: string, public params: FnParam[], public statements: Statement[],
      public type: Type = null, modifiers: StmtModifier[] = null, sourceSpan?: ParseSourceSpan) {
    super(modifiers, sourceSpan);
  }

  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitDeclareFunctionStmt(this, context);
  }
}

export class ExpressionStatement extends Statement {
  constructor(public expr: Expression, sourceSpan?: ParseSourceSpan) { super(null, sourceSpan); }

  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitExpressionStmt(this, context);
  }
}


export class ReturnStatement extends Statement {
  constructor(public value: Expression, sourceSpan?: ParseSourceSpan) { super(null, sourceSpan); }
  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitReturnStmt(this, context);
  }
}

export class AbstractClassPart {
  constructor(public type: Type = null, public modifiers: StmtModifier[]) {
    if (!modifiers) {
      this.modifiers = [];
    }
  }
  hasModifier(modifier: StmtModifier): boolean { return this.modifiers.indexOf(modifier) !== -1; }
}

export class ClassField extends AbstractClassPart {
  constructor(public name: string, type: Type = null, modifiers: StmtModifier[] = null) {
    super(type, modifiers);
  }
}


export class ClassMethod extends AbstractClassPart {
  constructor(
      public name: string, public params: FnParam[], public body: Statement[], type: Type = null,
      modifiers: StmtModifier[] = null) {
    super(type, modifiers);
  }
}


export class ClassGetter extends AbstractClassPart {
  constructor(
      public name: string, public body: Statement[], type: Type = null,
      modifiers: StmtModifier[] = null) {
    super(type, modifiers);
  }
}


export class ClassStmt extends Statement {
  constructor(
      public name: string, public parent: Expression, public fields: ClassField[],
      public getters: ClassGetter[], public constructorMethod: ClassMethod,
      public methods: ClassMethod[], modifiers: StmtModifier[] = null,
      sourceSpan?: ParseSourceSpan) {
    super(modifiers, sourceSpan);
  }
  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitDeclareClassStmt(this, context);
  }
}


export class IfStmt extends Statement {
  constructor(
      public condition: Expression, public trueCase: Statement[],
      public falseCase: Statement[] = [], sourceSpan?: ParseSourceSpan) {
    super(null, sourceSpan);
  }
  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitIfStmt(this, context);
  }
}


export class CommentStmt extends Statement {
  constructor(public comment: string, sourceSpan?: ParseSourceSpan) { super(null, sourceSpan); }
  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitCommentStmt(this, context);
  }
}


export class TryCatchStmt extends Statement {
  constructor(
      public bodyStmts: Statement[], public catchStmts: Statement[], sourceSpan?: ParseSourceSpan) {
    super(null, sourceSpan);
  }
  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitTryCatchStmt(this, context);
  }
}


export class ThrowStmt extends Statement {
  constructor(public error: Expression, sourceSpan?: ParseSourceSpan) { super(null, sourceSpan); }
  visitStatement(visitor: StatementVisitor, context: any): any {
    return visitor.visitThrowStmt(this, context);
  }
}

export interface StatementVisitor {
  visitDeclareVarStmt(stmt: DeclareVarStmt, context: any): any;
  visitDeclareFunctionStmt(stmt: DeclareFunctionStmt, context: any): any;
  visitExpressionStmt(stmt: ExpressionStatement, context: any): any;
  visitReturnStmt(stmt: ReturnStatement, context: any): any;
  visitDeclareClassStmt(stmt: ClassStmt, context: any): any;
  visitIfStmt(stmt: IfStmt, context: any): any;
  visitTryCatchStmt(stmt: TryCatchStmt, context: any): any;
  visitThrowStmt(stmt: ThrowStmt, context: any): any;
  visitCommentStmt(stmt: CommentStmt, context: any): any;
}

export class ExpressionTransformer implements StatementVisitor, ExpressionVisitor {
  visitReadVarExpr(ast: ReadVarExpr, context: any): any { return ast; }

  visitWriteVarExpr(expr: WriteVarExpr, context: any): any {
    return new WriteVarExpr(
        expr.name, expr.value.visitExpression(this, context), expr.type, expr.sourceSpan);
  }

  visitWriteKeyExpr(expr: WriteKeyExpr, context: any): any {
    return new WriteKeyExpr(
        expr.receiver.visitExpression(this, context), expr.index.visitExpression(this, context),
        expr.value.visitExpression(this, context), expr.type, expr.sourceSpan);
  }

  visitWritePropExpr(expr: WritePropExpr, context: any): any {
    return new WritePropExpr(
        expr.receiver.visitExpression(this, context), expr.name,
        expr.value.visitExpression(this, context), expr.type, expr.sourceSpan);
  }

  visitInvokeMethodExpr(ast: InvokeMethodExpr, context: any): any {
    const method = ast.builtin || ast.name;
    return new InvokeMethodExpr(
        ast.receiver.visitExpression(this, context), method,
        this.visitAllExpressions(ast.args, context), ast.type, ast.sourceSpan);
  }

  visitInvokeFunctionExpr(ast: InvokeFunctionExpr, context: any): any {
    return new InvokeFunctionExpr(
        ast.fn.visitExpression(this, context), this.visitAllExpressions(ast.args, context),
        ast.type, ast.sourceSpan);
  }

  visitInstantiateExpr(ast: InstantiateExpr, context: any): any {
    return new InstantiateExpr(
        ast.classExpr.visitExpression(this, context), this.visitAllExpressions(ast.args, context),
        ast.type, ast.sourceSpan);
  }

  visitLiteralExpr(ast: LiteralExpr, context: any): any { return ast; }

  visitExternalExpr(ast: ExternalExpr, context: any): any { return ast; }

  visitConditionalExpr(ast: ConditionalExpr, context: any): any {
    return new ConditionalExpr(
        ast.condition.visitExpression(this, context), ast.trueCase.visitExpression(this, context),
        ast.falseCase.visitExpression(this, context), ast.type, ast.sourceSpan);
  }

  visitNotExpr(ast: NotExpr, context: any): any {
    return new NotExpr(ast.condition.visitExpression(this, context), ast.sourceSpan);
  }

  visitCastExpr(ast: CastExpr, context: any): any {
    return new CastExpr(ast.value.visitExpression(this, context), context, ast.sourceSpan);
  }

  visitFunctionExpr(ast: FunctionExpr, context: any): any {
    // Don't descend into nested functions
    return ast;
  }

  visitBinaryOperatorExpr(ast: BinaryOperatorExpr, context: any): any {
    return new BinaryOperatorExpr(
        ast.operator, ast.lhs.visitExpression(this, context),
        ast.rhs.visitExpression(this, context), ast.type, ast.sourceSpan);
  }

  visitReadPropExpr(ast: ReadPropExpr, context: any): any {
    return new ReadPropExpr(
        ast.receiver.visitExpression(this, context), ast.name, ast.type, ast.sourceSpan);
  }

  visitReadKeyExpr(ast: ReadKeyExpr, context: any): any {
    return new ReadKeyExpr(
        ast.receiver.visitExpression(this, context), ast.index.visitExpression(this, context),
        ast.type, ast.sourceSpan);
  }

  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: any): any {
    return new LiteralArrayExpr(
        this.visitAllExpressions(ast.entries, context), ast.type, ast.sourceSpan);
  }

  visitLiteralMapExpr(ast: LiteralMapExpr, context: any): any {
    const entries = ast.entries.map(
        (entry): LiteralMapEntry => new LiteralMapEntry(
            entry.key, entry.value.visitExpression(this, context), entry.quoted, ));
    const mapType = new MapType(ast.valueType);
    return new LiteralMapExpr(entries, mapType, ast.sourceSpan);
  }
  visitAllExpressions(exprs: Expression[], context: any): Expression[] {
    return exprs.map(expr => expr.visitExpression(this, context));
  }

  visitDeclareVarStmt(stmt: DeclareVarStmt, context: any): any {
    return new DeclareVarStmt(
        stmt.name, stmt.value.visitExpression(this, context), stmt.type, stmt.modifiers,
        stmt.sourceSpan);
  }
  visitDeclareFunctionStmt(stmt: DeclareFunctionStmt, context: any): any {
    // Don't descend into nested functions
    return stmt;
  }

  visitExpressionStmt(stmt: ExpressionStatement, context: any): any {
    return new ExpressionStatement(stmt.expr.visitExpression(this, context), stmt.sourceSpan);
  }

  visitReturnStmt(stmt: ReturnStatement, context: any): any {
    return new ReturnStatement(stmt.value.visitExpression(this, context), stmt.sourceSpan);
  }

  visitDeclareClassStmt(stmt: ClassStmt, context: any): any {
    // Don't descend into nested functions
    return stmt;
  }

  visitIfStmt(stmt: IfStmt, context: any): any {
    return new IfStmt(
        stmt.condition.visitExpression(this, context),
        this.visitAllStatements(stmt.trueCase, context),
        this.visitAllStatements(stmt.falseCase, context), stmt.sourceSpan);
  }

  visitTryCatchStmt(stmt: TryCatchStmt, context: any): any {
    return new TryCatchStmt(
        this.visitAllStatements(stmt.bodyStmts, context),
        this.visitAllStatements(stmt.catchStmts, context), stmt.sourceSpan);
  }

  visitThrowStmt(stmt: ThrowStmt, context: any): any {
    return new ThrowStmt(stmt.error.visitExpression(this, context), stmt.sourceSpan);
  }

  visitCommentStmt(stmt: CommentStmt, context: any): any { return stmt; }

  visitAllStatements(stmts: Statement[], context: any): Statement[] {
    return stmts.map(stmt => stmt.visitStatement(this, context));
  }
}


export class RecursiveExpressionVisitor implements StatementVisitor, ExpressionVisitor {
  visitReadVarExpr(ast: ReadVarExpr, context: any): any { return ast; }
  visitWriteVarExpr(expr: WriteVarExpr, context: any): any {
    expr.value.visitExpression(this, context);
    return expr;
  }
  visitWriteKeyExpr(expr: WriteKeyExpr, context: any): any {
    expr.receiver.visitExpression(this, context);
    expr.index.visitExpression(this, context);
    expr.value.visitExpression(this, context);
    return expr;
  }
  visitWritePropExpr(expr: WritePropExpr, context: any): any {
    expr.receiver.visitExpression(this, context);
    expr.value.visitExpression(this, context);
    return expr;
  }
  visitInvokeMethodExpr(ast: InvokeMethodExpr, context: any): any {
    ast.receiver.visitExpression(this, context);
    this.visitAllExpressions(ast.args, context);
    return ast;
  }
  visitInvokeFunctionExpr(ast: InvokeFunctionExpr, context: any): any {
    ast.fn.visitExpression(this, context);
    this.visitAllExpressions(ast.args, context);
    return ast;
  }
  visitInstantiateExpr(ast: InstantiateExpr, context: any): any {
    ast.classExpr.visitExpression(this, context);
    this.visitAllExpressions(ast.args, context);
    return ast;
  }
  visitLiteralExpr(ast: LiteralExpr, context: any): any { return ast; }
  visitExternalExpr(ast: ExternalExpr, context: any): any { return ast; }
  visitConditionalExpr(ast: ConditionalExpr, context: any): any {
    ast.condition.visitExpression(this, context);
    ast.trueCase.visitExpression(this, context);
    ast.falseCase.visitExpression(this, context);
    return ast;
  }
  visitNotExpr(ast: NotExpr, context: any): any {
    ast.condition.visitExpression(this, context);
    return ast;
  }
  visitCastExpr(ast: CastExpr, context: any): any {
    ast.value.visitExpression(this, context);
    return ast;
  }
  visitFunctionExpr(ast: FunctionExpr, context: any): any { return ast; }
  visitBinaryOperatorExpr(ast: BinaryOperatorExpr, context: any): any {
    ast.lhs.visitExpression(this, context);
    ast.rhs.visitExpression(this, context);
    return ast;
  }
  visitReadPropExpr(ast: ReadPropExpr, context: any): any {
    ast.receiver.visitExpression(this, context);
    return ast;
  }
  visitReadKeyExpr(ast: ReadKeyExpr, context: any): any {
    ast.receiver.visitExpression(this, context);
    ast.index.visitExpression(this, context);
    return ast;
  }
  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: any): any {
    this.visitAllExpressions(ast.entries, context);
    return ast;
  }
  visitLiteralMapExpr(ast: LiteralMapExpr, context: any): any {
    ast.entries.forEach((entry) => entry.value.visitExpression(this, context));
    return ast;
  }
  visitAllExpressions(exprs: Expression[], context: any): void {
    exprs.forEach(expr => expr.visitExpression(this, context));
  }

  visitDeclareVarStmt(stmt: DeclareVarStmt, context: any): any {
    stmt.value.visitExpression(this, context);
    return stmt;
  }
  visitDeclareFunctionStmt(stmt: DeclareFunctionStmt, context: any): any {
    // Don't descend into nested functions
    return stmt;
  }
  visitExpressionStmt(stmt: ExpressionStatement, context: any): any {
    stmt.expr.visitExpression(this, context);
    return stmt;
  }
  visitReturnStmt(stmt: ReturnStatement, context: any): any {
    stmt.value.visitExpression(this, context);
    return stmt;
  }
  visitDeclareClassStmt(stmt: ClassStmt, context: any): any {
    // Don't descend into nested functions
    return stmt;
  }
  visitIfStmt(stmt: IfStmt, context: any): any {
    stmt.condition.visitExpression(this, context);
    this.visitAllStatements(stmt.trueCase, context);
    this.visitAllStatements(stmt.falseCase, context);
    return stmt;
  }
  visitTryCatchStmt(stmt: TryCatchStmt, context: any): any {
    this.visitAllStatements(stmt.bodyStmts, context);
    this.visitAllStatements(stmt.catchStmts, context);
    return stmt;
  }
  visitThrowStmt(stmt: ThrowStmt, context: any): any {
    stmt.error.visitExpression(this, context);
    return stmt;
  }
  visitCommentStmt(stmt: CommentStmt, context: any): any { return stmt; }
  visitAllStatements(stmts: Statement[], context: any): void {
    stmts.forEach(stmt => stmt.visitStatement(this, context));
  }
}

export function replaceVarInExpression(
    varName: string, newValue: Expression, expression: Expression): Expression {
  const transformer = new _ReplaceVariableTransformer(varName, newValue);
  return expression.visitExpression(transformer, null);
}

class _ReplaceVariableTransformer extends ExpressionTransformer {
  constructor(private _varName: string, private _newValue: Expression) { super(); }
  visitReadVarExpr(ast: ReadVarExpr, context: any): any {
    return ast.name == this._varName ? this._newValue : ast;
  }
}

export function findReadVarNames(stmts: Statement[]): Set<string> {
  const finder = new _VariableFinder();
  finder.visitAllStatements(stmts, null);
  return finder.varNames;
}

class _VariableFinder extends RecursiveExpressionVisitor {
  varNames = new Set<string>();
  visitReadVarExpr(ast: ReadVarExpr, context: any): any {
    this.varNames.add(ast.name);
    return null;
  }
}

export function variable(
    name: string, type: Type = null, sourceSpan?: ParseSourceSpan): ReadVarExpr {
  return new ReadVarExpr(name, type, sourceSpan);
}

export function importExpr(
    id: CompileIdentifierMetadata, typeParams: Type[] = null,
    sourceSpan?: ParseSourceSpan): ExternalExpr {
  return new ExternalExpr(id, null, typeParams, sourceSpan);
}

export function importType(
    id: CompileIdentifierMetadata, typeParams: Type[] = null,
    typeModifiers: TypeModifier[] = null): ExpressionType {
  return id != null ? expressionType(importExpr(id, typeParams), typeModifiers) : null;
}

export function expressionType(
    expr: Expression, typeModifiers: TypeModifier[] = null): ExpressionType {
  return expr != null ? new ExpressionType(expr, typeModifiers) : null;
}

export function literalArr(
    values: Expression[], type: Type = null, sourceSpan?: ParseSourceSpan): LiteralArrayExpr {
  return new LiteralArrayExpr(values, type, sourceSpan);
}

export function literalMap(
    values: [string, Expression][], type: MapType = null, quoted: boolean = false): LiteralMapExpr {
  return new LiteralMapExpr(
      values.map(entry => new LiteralMapEntry(entry[0], entry[1], quoted)), type);
}

export function not(expr: Expression, sourceSpan?: ParseSourceSpan): NotExpr {
  return new NotExpr(expr, sourceSpan);
}

export function fn(
    params: FnParam[], body: Statement[], type: Type = null,
    sourceSpan?: ParseSourceSpan): FunctionExpr {
  return new FunctionExpr(params, body, type, sourceSpan);
}

export function literal(value: any, type: Type = null, sourceSpan?: ParseSourceSpan): LiteralExpr {
  return new LiteralExpr(value, type, sourceSpan);
}
