import { CompileIdentifierMetadata } from '../compile_metadata';
export declare enum TypeModifier {
    Const = 0,
}
export declare abstract class Type {
    modifiers: TypeModifier[];
    constructor(modifiers?: TypeModifier[]);
    abstract visitType(visitor: TypeVisitor, context: any): any;
    hasModifier(modifier: TypeModifier): boolean;
}
export declare enum BuiltinTypeName {
    Dynamic = 0,
    Bool = 1,
    String = 2,
    Int = 3,
    Number = 4,
    Function = 5,
}
export declare class BuiltinType extends Type {
    name: BuiltinTypeName;
    constructor(name: BuiltinTypeName, modifiers?: TypeModifier[]);
    visitType(visitor: TypeVisitor, context: any): any;
}
export declare class ExternalType extends Type {
    value: CompileIdentifierMetadata;
    typeParams: Type[];
    constructor(value: CompileIdentifierMetadata, typeParams?: Type[], modifiers?: TypeModifier[]);
    visitType(visitor: TypeVisitor, context: any): any;
}
export declare class ArrayType extends Type {
    of: Type;
    constructor(of: Type, modifiers?: TypeModifier[]);
    visitType(visitor: TypeVisitor, context: any): any;
}
export declare class MapType extends Type {
    valueType: Type;
    constructor(valueType: Type, modifiers?: TypeModifier[]);
    visitType(visitor: TypeVisitor, context: any): any;
}
export declare var DYNAMIC_TYPE: BuiltinType;
export declare var BOOL_TYPE: BuiltinType;
export declare var INT_TYPE: BuiltinType;
export declare var NUMBER_TYPE: BuiltinType;
export declare var STRING_TYPE: BuiltinType;
export declare var FUNCTION_TYPE: BuiltinType;
export interface TypeVisitor {
    visitBuiltintType(type: BuiltinType, context: any): any;
    visitExternalType(type: ExternalType, context: any): any;
    visitArrayType(type: ArrayType, context: any): any;
    visitMapType(type: MapType, context: any): any;
}
export declare enum BinaryOperator {
    Equals = 0,
    NotEquals = 1,
    Identical = 2,
    NotIdentical = 3,
    Minus = 4,
    Plus = 5,
    Divide = 6,
    Multiply = 7,
    Modulo = 8,
    And = 9,
    Or = 10,
    Lower = 11,
    LowerEquals = 12,
    Bigger = 13,
    BiggerEquals = 14,
}
export declare abstract class Expression {
    type: Type;
    constructor(type: Type);
    abstract visitExpression(visitor: ExpressionVisitor, context: any): any;
    prop(name: string): ReadPropExpr;
    key(index: Expression, type?: Type): ReadKeyExpr;
    callMethod(name: string | BuiltinMethod, params: Expression[]): InvokeMethodExpr;
    callFn(params: Expression[]): InvokeFunctionExpr;
    instantiate(params: Expression[], type?: Type): InstantiateExpr;
    conditional(trueCase: Expression, falseCase?: Expression): ConditionalExpr;
    equals(rhs: Expression): BinaryOperatorExpr;
    notEquals(rhs: Expression): BinaryOperatorExpr;
    identical(rhs: Expression): BinaryOperatorExpr;
    notIdentical(rhs: Expression): BinaryOperatorExpr;
    minus(rhs: Expression): BinaryOperatorExpr;
    plus(rhs: Expression): BinaryOperatorExpr;
    divide(rhs: Expression): BinaryOperatorExpr;
    multiply(rhs: Expression): BinaryOperatorExpr;
    modulo(rhs: Expression): BinaryOperatorExpr;
    and(rhs: Expression): BinaryOperatorExpr;
    or(rhs: Expression): BinaryOperatorExpr;
    lower(rhs: Expression): BinaryOperatorExpr;
    lowerEquals(rhs: Expression): BinaryOperatorExpr;
    bigger(rhs: Expression): BinaryOperatorExpr;
    biggerEquals(rhs: Expression): BinaryOperatorExpr;
    isBlank(): Expression;
    cast(type: Type): Expression;
    toStmt(): Statement;
}
export declare enum BuiltinVar {
    This = 0,
    Super = 1,
    CatchError = 2,
    CatchStack = 3,
}
export declare class ReadVarExpr extends Expression {
    name: any;
    builtin: BuiltinVar;
    constructor(name: string | BuiltinVar, type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
    set(value: Expression): WriteVarExpr;
}
export declare class WriteVarExpr extends Expression {
    name: string;
    value: Expression;
    constructor(name: string, value: Expression, type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
    toDeclStmt(type?: Type, modifiers?: StmtModifier[]): DeclareVarStmt;
}
export declare class WriteKeyExpr extends Expression {
    receiver: Expression;
    index: Expression;
    value: Expression;
    constructor(receiver: Expression, index: Expression, value: Expression, type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
}
export declare class WritePropExpr extends Expression {
    receiver: Expression;
    name: string;
    value: Expression;
    constructor(receiver: Expression, name: string, value: Expression, type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
}
export declare enum BuiltinMethod {
    ConcatArray = 0,
    SubscribeObservable = 1,
    bind = 2,
}
export declare class InvokeMethodExpr extends Expression {
    receiver: Expression;
    args: Expression[];
    name: string;
    builtin: BuiltinMethod;
    constructor(receiver: Expression, method: string | BuiltinMethod, args: Expression[], type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
}
export declare class InvokeFunctionExpr extends Expression {
    fn: Expression;
    args: Expression[];
    constructor(fn: Expression, args: Expression[], type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
}
export declare class InstantiateExpr extends Expression {
    classExpr: Expression;
    args: Expression[];
    constructor(classExpr: Expression, args: Expression[], type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
}
export declare class LiteralExpr extends Expression {
    value: any;
    constructor(value: any, type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
}
export declare class ExternalExpr extends Expression {
    value: CompileIdentifierMetadata;
    typeParams: Type[];
    constructor(value: CompileIdentifierMetadata, type?: Type, typeParams?: Type[]);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
}
export declare class ConditionalExpr extends Expression {
    condition: Expression;
    falseCase: Expression;
    trueCase: Expression;
    constructor(condition: Expression, trueCase: Expression, falseCase?: Expression, type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
}
export declare class NotExpr extends Expression {
    condition: Expression;
    constructor(condition: Expression);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
}
export declare class CastExpr extends Expression {
    value: Expression;
    constructor(value: Expression, type: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
}
export declare class FnParam {
    name: string;
    type: Type;
    constructor(name: string, type?: Type);
}
export declare class FunctionExpr extends Expression {
    params: FnParam[];
    statements: Statement[];
    constructor(params: FnParam[], statements: Statement[], type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
    toDeclStmt(name: string, modifiers?: StmtModifier[]): DeclareFunctionStmt;
}
export declare class BinaryOperatorExpr extends Expression {
    operator: BinaryOperator;
    rhs: Expression;
    lhs: Expression;
    constructor(operator: BinaryOperator, lhs: Expression, rhs: Expression, type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
}
export declare class ReadPropExpr extends Expression {
    receiver: Expression;
    name: string;
    constructor(receiver: Expression, name: string, type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
    set(value: Expression): WritePropExpr;
}
export declare class ReadKeyExpr extends Expression {
    receiver: Expression;
    index: Expression;
    constructor(receiver: Expression, index: Expression, type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
    set(value: Expression): WriteKeyExpr;
}
export declare class LiteralArrayExpr extends Expression {
    entries: Expression[];
    constructor(entries: Expression[], type?: Type);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
}
export declare class LiteralMapExpr extends Expression {
    entries: Array<Array<string | Expression>>;
    valueType: Type;
    constructor(entries: Array<Array<string | Expression>>, type?: MapType);
    visitExpression(visitor: ExpressionVisitor, context: any): any;
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
export declare var THIS_EXPR: ReadVarExpr;
export declare var SUPER_EXPR: ReadVarExpr;
export declare var CATCH_ERROR_VAR: ReadVarExpr;
export declare var CATCH_STACK_VAR: ReadVarExpr;
export declare var NULL_EXPR: LiteralExpr;
export declare enum StmtModifier {
    Final = 0,
    Private = 1,
}
export declare abstract class Statement {
    modifiers: StmtModifier[];
    constructor(modifiers?: StmtModifier[]);
    abstract visitStatement(visitor: StatementVisitor, context: any): any;
    hasModifier(modifier: StmtModifier): boolean;
}
export declare class DeclareVarStmt extends Statement {
    name: string;
    value: Expression;
    type: Type;
    constructor(name: string, value: Expression, type?: Type, modifiers?: StmtModifier[]);
    visitStatement(visitor: StatementVisitor, context: any): any;
}
export declare class DeclareFunctionStmt extends Statement {
    name: string;
    params: FnParam[];
    statements: Statement[];
    type: Type;
    constructor(name: string, params: FnParam[], statements: Statement[], type?: Type, modifiers?: StmtModifier[]);
    visitStatement(visitor: StatementVisitor, context: any): any;
}
export declare class ExpressionStatement extends Statement {
    expr: Expression;
    constructor(expr: Expression);
    visitStatement(visitor: StatementVisitor, context: any): any;
}
export declare class ReturnStatement extends Statement {
    value: Expression;
    constructor(value: Expression);
    visitStatement(visitor: StatementVisitor, context: any): any;
}
export declare class AbstractClassPart {
    type: Type;
    modifiers: StmtModifier[];
    constructor(type: Type, modifiers: StmtModifier[]);
    hasModifier(modifier: StmtModifier): boolean;
}
export declare class ClassField extends AbstractClassPart {
    name: string;
    constructor(name: string, type?: Type, modifiers?: StmtModifier[]);
}
export declare class ClassMethod extends AbstractClassPart {
    name: string;
    params: FnParam[];
    body: Statement[];
    constructor(name: string, params: FnParam[], body: Statement[], type?: Type, modifiers?: StmtModifier[]);
}
export declare class ClassGetter extends AbstractClassPart {
    name: string;
    body: Statement[];
    constructor(name: string, body: Statement[], type?: Type, modifiers?: StmtModifier[]);
}
export declare class ClassStmt extends Statement {
    name: string;
    parent: Expression;
    fields: ClassField[];
    getters: ClassGetter[];
    constructorMethod: ClassMethod;
    methods: ClassMethod[];
    constructor(name: string, parent: Expression, fields: ClassField[], getters: ClassGetter[], constructorMethod: ClassMethod, methods: ClassMethod[], modifiers?: StmtModifier[]);
    visitStatement(visitor: StatementVisitor, context: any): any;
}
export declare class IfStmt extends Statement {
    condition: Expression;
    trueCase: Statement[];
    falseCase: Statement[];
    constructor(condition: Expression, trueCase: Statement[], falseCase?: Statement[]);
    visitStatement(visitor: StatementVisitor, context: any): any;
}
export declare class CommentStmt extends Statement {
    comment: string;
    constructor(comment: string);
    visitStatement(visitor: StatementVisitor, context: any): any;
}
export declare class TryCatchStmt extends Statement {
    bodyStmts: Statement[];
    catchStmts: Statement[];
    constructor(bodyStmts: Statement[], catchStmts: Statement[]);
    visitStatement(visitor: StatementVisitor, context: any): any;
}
export declare class ThrowStmt extends Statement {
    error: Expression;
    constructor(error: Expression);
    visitStatement(visitor: StatementVisitor, context: any): any;
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
export declare class ExpressionTransformer implements StatementVisitor, ExpressionVisitor {
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
    visitAllExpressions(exprs: Expression[], context: any): Expression[];
    visitDeclareVarStmt(stmt: DeclareVarStmt, context: any): any;
    visitDeclareFunctionStmt(stmt: DeclareFunctionStmt, context: any): any;
    visitExpressionStmt(stmt: ExpressionStatement, context: any): any;
    visitReturnStmt(stmt: ReturnStatement, context: any): any;
    visitDeclareClassStmt(stmt: ClassStmt, context: any): any;
    visitIfStmt(stmt: IfStmt, context: any): any;
    visitTryCatchStmt(stmt: TryCatchStmt, context: any): any;
    visitThrowStmt(stmt: ThrowStmt, context: any): any;
    visitCommentStmt(stmt: CommentStmt, context: any): any;
    visitAllStatements(stmts: Statement[], context: any): Statement[];
}
export declare class RecursiveExpressionVisitor implements StatementVisitor, ExpressionVisitor {
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
    visitAllExpressions(exprs: Expression[], context: any): void;
    visitDeclareVarStmt(stmt: DeclareVarStmt, context: any): any;
    visitDeclareFunctionStmt(stmt: DeclareFunctionStmt, context: any): any;
    visitExpressionStmt(stmt: ExpressionStatement, context: any): any;
    visitReturnStmt(stmt: ReturnStatement, context: any): any;
    visitDeclareClassStmt(stmt: ClassStmt, context: any): any;
    visitIfStmt(stmt: IfStmt, context: any): any;
    visitTryCatchStmt(stmt: TryCatchStmt, context: any): any;
    visitThrowStmt(stmt: ThrowStmt, context: any): any;
    visitCommentStmt(stmt: CommentStmt, context: any): any;
    visitAllStatements(stmts: Statement[], context: any): void;
}
export declare function replaceVarInExpression(varName: string, newValue: Expression, expression: Expression): Expression;
export declare function findReadVarNames(stmts: Statement[]): Set<string>;
export declare function variable(name: string, type?: Type): ReadVarExpr;
export declare function importExpr(id: CompileIdentifierMetadata, typeParams?: Type[]): ExternalExpr;
export declare function importType(id: CompileIdentifierMetadata, typeParams?: Type[], typeModifiers?: TypeModifier[]): ExternalType;
export declare function literal(value: any, type?: Type): LiteralExpr;
export declare function literalArr(values: Expression[], type?: Type): LiteralArrayExpr;
export declare function literalMap(values: Array<Array<string | Expression>>, type?: MapType): LiteralMapExpr;
export declare function not(expr: Expression): NotExpr;
export declare function fn(params: FnParam[], body: Statement[], type?: Type): FunctionExpr;
