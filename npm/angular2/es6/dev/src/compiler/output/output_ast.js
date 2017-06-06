import { isString, isPresent, isBlank } from 'angular2/src/facade/lang';
//// Types
export var TypeModifier;
(function (TypeModifier) {
    TypeModifier[TypeModifier["Const"] = 0] = "Const";
})(TypeModifier || (TypeModifier = {}));
export class Type {
    constructor(modifiers = null) {
        this.modifiers = modifiers;
        if (isBlank(modifiers)) {
            this.modifiers = [];
        }
    }
    hasModifier(modifier) { return this.modifiers.indexOf(modifier) !== -1; }
}
export var BuiltinTypeName;
(function (BuiltinTypeName) {
    BuiltinTypeName[BuiltinTypeName["Dynamic"] = 0] = "Dynamic";
    BuiltinTypeName[BuiltinTypeName["Bool"] = 1] = "Bool";
    BuiltinTypeName[BuiltinTypeName["String"] = 2] = "String";
    BuiltinTypeName[BuiltinTypeName["Int"] = 3] = "Int";
    BuiltinTypeName[BuiltinTypeName["Number"] = 4] = "Number";
    BuiltinTypeName[BuiltinTypeName["Function"] = 5] = "Function";
})(BuiltinTypeName || (BuiltinTypeName = {}));
export class BuiltinType extends Type {
    constructor(name, modifiers = null) {
        super(modifiers);
        this.name = name;
    }
    visitType(visitor, context) {
        return visitor.visitBuiltintType(this, context);
    }
}
export class ExternalType extends Type {
    constructor(value, typeParams = null, modifiers = null) {
        super(modifiers);
        this.value = value;
        this.typeParams = typeParams;
    }
    visitType(visitor, context) {
        return visitor.visitExternalType(this, context);
    }
}
export class ArrayType extends Type {
    constructor(of, modifiers = null) {
        super(modifiers);
        this.of = of;
    }
    visitType(visitor, context) {
        return visitor.visitArrayType(this, context);
    }
}
export class MapType extends Type {
    constructor(valueType, modifiers = null) {
        super(modifiers);
        this.valueType = valueType;
    }
    visitType(visitor, context) { return visitor.visitMapType(this, context); }
}
export var DYNAMIC_TYPE = new BuiltinType(BuiltinTypeName.Dynamic);
export var BOOL_TYPE = new BuiltinType(BuiltinTypeName.Bool);
export var INT_TYPE = new BuiltinType(BuiltinTypeName.Int);
export var NUMBER_TYPE = new BuiltinType(BuiltinTypeName.Number);
export var STRING_TYPE = new BuiltinType(BuiltinTypeName.String);
export var FUNCTION_TYPE = new BuiltinType(BuiltinTypeName.Function);
///// Expressions
export var BinaryOperator;
(function (BinaryOperator) {
    BinaryOperator[BinaryOperator["Equals"] = 0] = "Equals";
    BinaryOperator[BinaryOperator["NotEquals"] = 1] = "NotEquals";
    BinaryOperator[BinaryOperator["Identical"] = 2] = "Identical";
    BinaryOperator[BinaryOperator["NotIdentical"] = 3] = "NotIdentical";
    BinaryOperator[BinaryOperator["Minus"] = 4] = "Minus";
    BinaryOperator[BinaryOperator["Plus"] = 5] = "Plus";
    BinaryOperator[BinaryOperator["Divide"] = 6] = "Divide";
    BinaryOperator[BinaryOperator["Multiply"] = 7] = "Multiply";
    BinaryOperator[BinaryOperator["Modulo"] = 8] = "Modulo";
    BinaryOperator[BinaryOperator["And"] = 9] = "And";
    BinaryOperator[BinaryOperator["Or"] = 10] = "Or";
    BinaryOperator[BinaryOperator["Lower"] = 11] = "Lower";
    BinaryOperator[BinaryOperator["LowerEquals"] = 12] = "LowerEquals";
    BinaryOperator[BinaryOperator["Bigger"] = 13] = "Bigger";
    BinaryOperator[BinaryOperator["BiggerEquals"] = 14] = "BiggerEquals";
})(BinaryOperator || (BinaryOperator = {}));
export class Expression {
    constructor(type) {
        this.type = type;
    }
    prop(name) { return new ReadPropExpr(this, name); }
    key(index, type = null) {
        return new ReadKeyExpr(this, index, type);
    }
    callMethod(name, params) {
        return new InvokeMethodExpr(this, name, params);
    }
    callFn(params) { return new InvokeFunctionExpr(this, params); }
    instantiate(params, type = null) {
        return new InstantiateExpr(this, params, type);
    }
    conditional(trueCase, falseCase = null) {
        return new ConditionalExpr(this, trueCase, falseCase);
    }
    equals(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Equals, this, rhs);
    }
    notEquals(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.NotEquals, this, rhs);
    }
    identical(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Identical, this, rhs);
    }
    notIdentical(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.NotIdentical, this, rhs);
    }
    minus(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Minus, this, rhs);
    }
    plus(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Plus, this, rhs);
    }
    divide(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Divide, this, rhs);
    }
    multiply(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Multiply, this, rhs);
    }
    modulo(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Modulo, this, rhs);
    }
    and(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.And, this, rhs);
    }
    or(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Or, this, rhs);
    }
    lower(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Lower, this, rhs);
    }
    lowerEquals(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.LowerEquals, this, rhs);
    }
    bigger(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.Bigger, this, rhs);
    }
    biggerEquals(rhs) {
        return new BinaryOperatorExpr(BinaryOperator.BiggerEquals, this, rhs);
    }
    isBlank() {
        // Note: We use equals by purpose here to compare to null and undefined in JS.
        return this.equals(NULL_EXPR);
    }
    cast(type) { return new CastExpr(this, type); }
    toStmt() { return new ExpressionStatement(this); }
}
export var BuiltinVar;
(function (BuiltinVar) {
    BuiltinVar[BuiltinVar["This"] = 0] = "This";
    BuiltinVar[BuiltinVar["Super"] = 1] = "Super";
    BuiltinVar[BuiltinVar["CatchError"] = 2] = "CatchError";
    BuiltinVar[BuiltinVar["CatchStack"] = 3] = "CatchStack";
})(BuiltinVar || (BuiltinVar = {}));
export class ReadVarExpr extends Expression {
    constructor(name, type = null) {
        super(type);
        if (isString(name)) {
            this.name = name;
            this.builtin = null;
        }
        else {
            this.name = null;
            this.builtin = name;
        }
    }
    visitExpression(visitor, context) {
        return visitor.visitReadVarExpr(this, context);
    }
    set(value) { return new WriteVarExpr(this.name, value); }
}
export class WriteVarExpr extends Expression {
    constructor(name, value, type = null) {
        super(isPresent(type) ? type : value.type);
        this.name = name;
        this.value = value;
    }
    visitExpression(visitor, context) {
        return visitor.visitWriteVarExpr(this, context);
    }
    toDeclStmt(type = null, modifiers = null) {
        return new DeclareVarStmt(this.name, this.value, type, modifiers);
    }
}
export class WriteKeyExpr extends Expression {
    constructor(receiver, index, value, type = null) {
        super(isPresent(type) ? type : value.type);
        this.receiver = receiver;
        this.index = index;
        this.value = value;
    }
    visitExpression(visitor, context) {
        return visitor.visitWriteKeyExpr(this, context);
    }
}
export class WritePropExpr extends Expression {
    constructor(receiver, name, value, type = null) {
        super(isPresent(type) ? type : value.type);
        this.receiver = receiver;
        this.name = name;
        this.value = value;
    }
    visitExpression(visitor, context) {
        return visitor.visitWritePropExpr(this, context);
    }
}
export var BuiltinMethod;
(function (BuiltinMethod) {
    BuiltinMethod[BuiltinMethod["ConcatArray"] = 0] = "ConcatArray";
    BuiltinMethod[BuiltinMethod["SubscribeObservable"] = 1] = "SubscribeObservable";
    BuiltinMethod[BuiltinMethod["bind"] = 2] = "bind";
})(BuiltinMethod || (BuiltinMethod = {}));
export class InvokeMethodExpr extends Expression {
    constructor(receiver, method, args, type = null) {
        super(type);
        this.receiver = receiver;
        this.args = args;
        if (isString(method)) {
            this.name = method;
            this.builtin = null;
        }
        else {
            this.name = null;
            this.builtin = method;
        }
    }
    visitExpression(visitor, context) {
        return visitor.visitInvokeMethodExpr(this, context);
    }
}
export class InvokeFunctionExpr extends Expression {
    constructor(fn, args, type = null) {
        super(type);
        this.fn = fn;
        this.args = args;
    }
    visitExpression(visitor, context) {
        return visitor.visitInvokeFunctionExpr(this, context);
    }
}
export class InstantiateExpr extends Expression {
    constructor(classExpr, args, type) {
        super(type);
        this.classExpr = classExpr;
        this.args = args;
    }
    visitExpression(visitor, context) {
        return visitor.visitInstantiateExpr(this, context);
    }
}
export class LiteralExpr extends Expression {
    constructor(value, type = null) {
        super(type);
        this.value = value;
    }
    visitExpression(visitor, context) {
        return visitor.visitLiteralExpr(this, context);
    }
}
export class ExternalExpr extends Expression {
    constructor(value, type = null, typeParams = null) {
        super(type);
        this.value = value;
        this.typeParams = typeParams;
    }
    visitExpression(visitor, context) {
        return visitor.visitExternalExpr(this, context);
    }
}
export class ConditionalExpr extends Expression {
    constructor(condition, trueCase, falseCase = null, type = null) {
        super(isPresent(type) ? type : trueCase.type);
        this.condition = condition;
        this.falseCase = falseCase;
        this.trueCase = trueCase;
    }
    visitExpression(visitor, context) {
        return visitor.visitConditionalExpr(this, context);
    }
}
export class NotExpr extends Expression {
    constructor(condition) {
        super(BOOL_TYPE);
        this.condition = condition;
    }
    visitExpression(visitor, context) {
        return visitor.visitNotExpr(this, context);
    }
}
export class CastExpr extends Expression {
    constructor(value, type) {
        super(type);
        this.value = value;
    }
    visitExpression(visitor, context) {
        return visitor.visitCastExpr(this, context);
    }
}
export class FnParam {
    constructor(name, type = null) {
        this.name = name;
        this.type = type;
    }
}
export class FunctionExpr extends Expression {
    constructor(params, statements, type = null) {
        super(type);
        this.params = params;
        this.statements = statements;
    }
    visitExpression(visitor, context) {
        return visitor.visitFunctionExpr(this, context);
    }
    toDeclStmt(name, modifiers = null) {
        return new DeclareFunctionStmt(name, this.params, this.statements, this.type, modifiers);
    }
}
export class BinaryOperatorExpr extends Expression {
    constructor(operator, lhs, rhs, type = null) {
        super(isPresent(type) ? type : lhs.type);
        this.operator = operator;
        this.rhs = rhs;
        this.lhs = lhs;
    }
    visitExpression(visitor, context) {
        return visitor.visitBinaryOperatorExpr(this, context);
    }
}
export class ReadPropExpr extends Expression {
    constructor(receiver, name, type = null) {
        super(type);
        this.receiver = receiver;
        this.name = name;
    }
    visitExpression(visitor, context) {
        return visitor.visitReadPropExpr(this, context);
    }
    set(value) {
        return new WritePropExpr(this.receiver, this.name, value);
    }
}
export class ReadKeyExpr extends Expression {
    constructor(receiver, index, type = null) {
        super(type);
        this.receiver = receiver;
        this.index = index;
    }
    visitExpression(visitor, context) {
        return visitor.visitReadKeyExpr(this, context);
    }
    set(value) {
        return new WriteKeyExpr(this.receiver, this.index, value);
    }
}
export class LiteralArrayExpr extends Expression {
    constructor(entries, type = null) {
        super(type);
        this.entries = entries;
    }
    visitExpression(visitor, context) {
        return visitor.visitLiteralArrayExpr(this, context);
    }
}
export class LiteralMapExpr extends Expression {
    constructor(entries, type = null) {
        super(type);
        this.entries = entries;
        this.valueType = null;
        if (isPresent(type)) {
            this.valueType = type.valueType;
        }
    }
    ;
    visitExpression(visitor, context) {
        return visitor.visitLiteralMapExpr(this, context);
    }
}
export var THIS_EXPR = new ReadVarExpr(BuiltinVar.This);
export var SUPER_EXPR = new ReadVarExpr(BuiltinVar.Super);
export var CATCH_ERROR_VAR = new ReadVarExpr(BuiltinVar.CatchError);
export var CATCH_STACK_VAR = new ReadVarExpr(BuiltinVar.CatchStack);
export var NULL_EXPR = new LiteralExpr(null, null);
//// Statements
export var StmtModifier;
(function (StmtModifier) {
    StmtModifier[StmtModifier["Final"] = 0] = "Final";
    StmtModifier[StmtModifier["Private"] = 1] = "Private";
})(StmtModifier || (StmtModifier = {}));
export class Statement {
    constructor(modifiers = null) {
        this.modifiers = modifiers;
        if (isBlank(modifiers)) {
            this.modifiers = [];
        }
    }
    hasModifier(modifier) { return this.modifiers.indexOf(modifier) !== -1; }
}
export class DeclareVarStmt extends Statement {
    constructor(name, value, type = null, modifiers = null) {
        super(modifiers);
        this.name = name;
        this.value = value;
        this.type = isPresent(type) ? type : value.type;
    }
    visitStatement(visitor, context) {
        return visitor.visitDeclareVarStmt(this, context);
    }
}
export class DeclareFunctionStmt extends Statement {
    constructor(name, params, statements, type = null, modifiers = null) {
        super(modifiers);
        this.name = name;
        this.params = params;
        this.statements = statements;
        this.type = type;
    }
    visitStatement(visitor, context) {
        return visitor.visitDeclareFunctionStmt(this, context);
    }
}
export class ExpressionStatement extends Statement {
    constructor(expr) {
        super();
        this.expr = expr;
    }
    visitStatement(visitor, context) {
        return visitor.visitExpressionStmt(this, context);
    }
}
export class ReturnStatement extends Statement {
    constructor(value) {
        super();
        this.value = value;
    }
    visitStatement(visitor, context) {
        return visitor.visitReturnStmt(this, context);
    }
}
export class AbstractClassPart {
    constructor(type = null, modifiers) {
        this.type = type;
        this.modifiers = modifiers;
        if (isBlank(modifiers)) {
            this.modifiers = [];
        }
    }
    hasModifier(modifier) { return this.modifiers.indexOf(modifier) !== -1; }
}
export class ClassField extends AbstractClassPart {
    constructor(name, type = null, modifiers = null) {
        super(type, modifiers);
        this.name = name;
    }
}
export class ClassMethod extends AbstractClassPart {
    constructor(name, params, body, type = null, modifiers = null) {
        super(type, modifiers);
        this.name = name;
        this.params = params;
        this.body = body;
    }
}
export class ClassGetter extends AbstractClassPart {
    constructor(name, body, type = null, modifiers = null) {
        super(type, modifiers);
        this.name = name;
        this.body = body;
    }
}
export class ClassStmt extends Statement {
    constructor(name, parent, fields, getters, constructorMethod, methods, modifiers = null) {
        super(modifiers);
        this.name = name;
        this.parent = parent;
        this.fields = fields;
        this.getters = getters;
        this.constructorMethod = constructorMethod;
        this.methods = methods;
    }
    visitStatement(visitor, context) {
        return visitor.visitDeclareClassStmt(this, context);
    }
}
export class IfStmt extends Statement {
    constructor(condition, trueCase, falseCase = []) {
        super();
        this.condition = condition;
        this.trueCase = trueCase;
        this.falseCase = falseCase;
    }
    visitStatement(visitor, context) {
        return visitor.visitIfStmt(this, context);
    }
}
export class CommentStmt extends Statement {
    constructor(comment) {
        super();
        this.comment = comment;
    }
    visitStatement(visitor, context) {
        return visitor.visitCommentStmt(this, context);
    }
}
export class TryCatchStmt extends Statement {
    constructor(bodyStmts, catchStmts) {
        super();
        this.bodyStmts = bodyStmts;
        this.catchStmts = catchStmts;
    }
    visitStatement(visitor, context) {
        return visitor.visitTryCatchStmt(this, context);
    }
}
export class ThrowStmt extends Statement {
    constructor(error) {
        super();
        this.error = error;
    }
    visitStatement(visitor, context) {
        return visitor.visitThrowStmt(this, context);
    }
}
export class ExpressionTransformer {
    visitReadVarExpr(ast, context) { return ast; }
    visitWriteVarExpr(expr, context) {
        return new WriteVarExpr(expr.name, expr.value.visitExpression(this, context));
    }
    visitWriteKeyExpr(expr, context) {
        return new WriteKeyExpr(expr.receiver.visitExpression(this, context), expr.index.visitExpression(this, context), expr.value.visitExpression(this, context));
    }
    visitWritePropExpr(expr, context) {
        return new WritePropExpr(expr.receiver.visitExpression(this, context), expr.name, expr.value.visitExpression(this, context));
    }
    visitInvokeMethodExpr(ast, context) {
        var method = isPresent(ast.builtin) ? ast.builtin : ast.name;
        return new InvokeMethodExpr(ast.receiver.visitExpression(this, context), method, this.visitAllExpressions(ast.args, context), ast.type);
    }
    visitInvokeFunctionExpr(ast, context) {
        return new InvokeFunctionExpr(ast.fn.visitExpression(this, context), this.visitAllExpressions(ast.args, context), ast.type);
    }
    visitInstantiateExpr(ast, context) {
        return new InstantiateExpr(ast.classExpr.visitExpression(this, context), this.visitAllExpressions(ast.args, context), ast.type);
    }
    visitLiteralExpr(ast, context) { return ast; }
    visitExternalExpr(ast, context) { return ast; }
    visitConditionalExpr(ast, context) {
        return new ConditionalExpr(ast.condition.visitExpression(this, context), ast.trueCase.visitExpression(this, context), ast.falseCase.visitExpression(this, context));
    }
    visitNotExpr(ast, context) {
        return new NotExpr(ast.condition.visitExpression(this, context));
    }
    visitCastExpr(ast, context) {
        return new CastExpr(ast.value.visitExpression(this, context), context);
    }
    visitFunctionExpr(ast, context) {
        // Don't descend into nested functions
        return ast;
    }
    visitBinaryOperatorExpr(ast, context) {
        return new BinaryOperatorExpr(ast.operator, ast.lhs.visitExpression(this, context), ast.rhs.visitExpression(this, context), ast.type);
    }
    visitReadPropExpr(ast, context) {
        return new ReadPropExpr(ast.receiver.visitExpression(this, context), ast.name, ast.type);
    }
    visitReadKeyExpr(ast, context) {
        return new ReadKeyExpr(ast.receiver.visitExpression(this, context), ast.index.visitExpression(this, context), ast.type);
    }
    visitLiteralArrayExpr(ast, context) {
        return new LiteralArrayExpr(this.visitAllExpressions(ast.entries, context));
    }
    visitLiteralMapExpr(ast, context) {
        return new LiteralMapExpr(ast.entries.map((entry) => [entry[0], entry[1].visitExpression(this, context)]));
    }
    visitAllExpressions(exprs, context) {
        return exprs.map(expr => expr.visitExpression(this, context));
    }
    visitDeclareVarStmt(stmt, context) {
        return new DeclareVarStmt(stmt.name, stmt.value.visitExpression(this, context), stmt.type, stmt.modifiers);
    }
    visitDeclareFunctionStmt(stmt, context) {
        // Don't descend into nested functions
        return stmt;
    }
    visitExpressionStmt(stmt, context) {
        return new ExpressionStatement(stmt.expr.visitExpression(this, context));
    }
    visitReturnStmt(stmt, context) {
        return new ReturnStatement(stmt.value.visitExpression(this, context));
    }
    visitDeclareClassStmt(stmt, context) {
        // Don't descend into nested functions
        return stmt;
    }
    visitIfStmt(stmt, context) {
        return new IfStmt(stmt.condition.visitExpression(this, context), this.visitAllStatements(stmt.trueCase, context), this.visitAllStatements(stmt.falseCase, context));
    }
    visitTryCatchStmt(stmt, context) {
        return new TryCatchStmt(this.visitAllStatements(stmt.bodyStmts, context), this.visitAllStatements(stmt.catchStmts, context));
    }
    visitThrowStmt(stmt, context) {
        return new ThrowStmt(stmt.error.visitExpression(this, context));
    }
    visitCommentStmt(stmt, context) { return stmt; }
    visitAllStatements(stmts, context) {
        return stmts.map(stmt => stmt.visitStatement(this, context));
    }
}
export class RecursiveExpressionVisitor {
    visitReadVarExpr(ast, context) { return ast; }
    visitWriteVarExpr(expr, context) {
        expr.value.visitExpression(this, context);
        return expr;
    }
    visitWriteKeyExpr(expr, context) {
        expr.receiver.visitExpression(this, context);
        expr.index.visitExpression(this, context);
        expr.value.visitExpression(this, context);
        return expr;
    }
    visitWritePropExpr(expr, context) {
        expr.receiver.visitExpression(this, context);
        expr.value.visitExpression(this, context);
        return expr;
    }
    visitInvokeMethodExpr(ast, context) {
        ast.receiver.visitExpression(this, context);
        this.visitAllExpressions(ast.args, context);
        return ast;
    }
    visitInvokeFunctionExpr(ast, context) {
        ast.fn.visitExpression(this, context);
        this.visitAllExpressions(ast.args, context);
        return ast;
    }
    visitInstantiateExpr(ast, context) {
        ast.classExpr.visitExpression(this, context);
        this.visitAllExpressions(ast.args, context);
        return ast;
    }
    visitLiteralExpr(ast, context) { return ast; }
    visitExternalExpr(ast, context) { return ast; }
    visitConditionalExpr(ast, context) {
        ast.condition.visitExpression(this, context);
        ast.trueCase.visitExpression(this, context);
        ast.falseCase.visitExpression(this, context);
        return ast;
    }
    visitNotExpr(ast, context) {
        ast.condition.visitExpression(this, context);
        return ast;
    }
    visitCastExpr(ast, context) {
        ast.value.visitExpression(this, context);
        return ast;
    }
    visitFunctionExpr(ast, context) { return ast; }
    visitBinaryOperatorExpr(ast, context) {
        ast.lhs.visitExpression(this, context);
        ast.rhs.visitExpression(this, context);
        return ast;
    }
    visitReadPropExpr(ast, context) {
        ast.receiver.visitExpression(this, context);
        return ast;
    }
    visitReadKeyExpr(ast, context) {
        ast.receiver.visitExpression(this, context);
        ast.index.visitExpression(this, context);
        return ast;
    }
    visitLiteralArrayExpr(ast, context) {
        this.visitAllExpressions(ast.entries, context);
        return ast;
    }
    visitLiteralMapExpr(ast, context) {
        ast.entries.forEach((entry) => entry[1].visitExpression(this, context));
        return ast;
    }
    visitAllExpressions(exprs, context) {
        exprs.forEach(expr => expr.visitExpression(this, context));
    }
    visitDeclareVarStmt(stmt, context) {
        stmt.value.visitExpression(this, context);
        return stmt;
    }
    visitDeclareFunctionStmt(stmt, context) {
        // Don't descend into nested functions
        return stmt;
    }
    visitExpressionStmt(stmt, context) {
        stmt.expr.visitExpression(this, context);
        return stmt;
    }
    visitReturnStmt(stmt, context) {
        stmt.value.visitExpression(this, context);
        return stmt;
    }
    visitDeclareClassStmt(stmt, context) {
        // Don't descend into nested functions
        return stmt;
    }
    visitIfStmt(stmt, context) {
        stmt.condition.visitExpression(this, context);
        this.visitAllStatements(stmt.trueCase, context);
        this.visitAllStatements(stmt.falseCase, context);
        return stmt;
    }
    visitTryCatchStmt(stmt, context) {
        this.visitAllStatements(stmt.bodyStmts, context);
        this.visitAllStatements(stmt.catchStmts, context);
        return stmt;
    }
    visitThrowStmt(stmt, context) {
        stmt.error.visitExpression(this, context);
        return stmt;
    }
    visitCommentStmt(stmt, context) { return stmt; }
    visitAllStatements(stmts, context) {
        stmts.forEach(stmt => stmt.visitStatement(this, context));
    }
}
export function replaceVarInExpression(varName, newValue, expression) {
    var transformer = new _ReplaceVariableTransformer(varName, newValue);
    return expression.visitExpression(transformer, null);
}
class _ReplaceVariableTransformer extends ExpressionTransformer {
    constructor(_varName, _newValue) {
        super();
        this._varName = _varName;
        this._newValue = _newValue;
    }
    visitReadVarExpr(ast, context) {
        return ast.name == this._varName ? this._newValue : ast;
    }
}
export function findReadVarNames(stmts) {
    var finder = new _VariableFinder();
    finder.visitAllStatements(stmts, null);
    return finder.varNames;
}
class _VariableFinder extends RecursiveExpressionVisitor {
    constructor(...args) {
        super(...args);
        this.varNames = new Set();
    }
    visitReadVarExpr(ast, context) {
        this.varNames.add(ast.name);
        return null;
    }
}
export function variable(name, type = null) {
    return new ReadVarExpr(name, type);
}
export function importExpr(id, typeParams = null) {
    return new ExternalExpr(id, null, typeParams);
}
export function importType(id, typeParams = null, typeModifiers = null) {
    return isPresent(id) ? new ExternalType(id, typeParams, typeModifiers) : null;
}
export function literal(value, type = null) {
    return new LiteralExpr(value, type);
}
export function literalArr(values, type = null) {
    return new LiteralArrayExpr(values, type);
}
export function literalMap(values, type = null) {
    return new LiteralMapExpr(values, type);
}
export function not(expr) {
    return new NotExpr(expr);
}
export function fn(params, body, type = null) {
    return new FunctionExpr(params, body, type);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2FzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9vdXRwdXQvb3V0cHV0X2FzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO0FBR3JFLFVBQVU7QUFDVixXQUFZLFlBRVg7QUFGRCxXQUFZLFlBQVk7SUFDdEIsaURBQUssQ0FBQTtBQUNQLENBQUMsRUFGVyxZQUFZLEtBQVosWUFBWSxRQUV2QjtBQUVEO0lBQ0UsWUFBbUIsU0FBUyxHQUFtQixJQUFJO1FBQWhDLGNBQVMsR0FBVCxTQUFTLENBQXVCO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQztJQUNILENBQUM7SUFHRCxXQUFXLENBQUMsUUFBc0IsSUFBYSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xHLENBQUM7QUFFRCxXQUFZLGVBT1g7QUFQRCxXQUFZLGVBQWU7SUFDekIsMkRBQU8sQ0FBQTtJQUNQLHFEQUFJLENBQUE7SUFDSix5REFBTSxDQUFBO0lBQ04sbURBQUcsQ0FBQTtJQUNILHlEQUFNLENBQUE7SUFDTiw2REFBUSxDQUFBO0FBQ1YsQ0FBQyxFQVBXLGVBQWUsS0FBZixlQUFlLFFBTzFCO0FBRUQsaUNBQWlDLElBQUk7SUFDbkMsWUFBbUIsSUFBcUIsRUFBRSxTQUFTLEdBQW1CLElBQUk7UUFBSSxNQUFNLFNBQVMsQ0FBQyxDQUFDO1FBQTVFLFNBQUksR0FBSixJQUFJLENBQWlCO0lBQXdELENBQUM7SUFDakcsU0FBUyxDQUFDLE9BQW9CLEVBQUUsT0FBWTtRQUMxQyxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRCxDQUFDO0FBQ0gsQ0FBQztBQUVELGtDQUFrQyxJQUFJO0lBQ3BDLFlBQW1CLEtBQWdDLEVBQVMsVUFBVSxHQUFXLElBQUksRUFDekUsU0FBUyxHQUFtQixJQUFJO1FBQzFDLE1BQU0sU0FBUyxDQUFDLENBQUM7UUFGQSxVQUFLLEdBQUwsS0FBSyxDQUEyQjtRQUFTLGVBQVUsR0FBVixVQUFVLENBQWU7SUFHckYsQ0FBQztJQUNELFNBQVMsQ0FBQyxPQUFvQixFQUFFLE9BQVk7UUFDMUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEQsQ0FBQztBQUNILENBQUM7QUFHRCwrQkFBK0IsSUFBSTtJQUNqQyxZQUFtQixFQUFRLEVBQUUsU0FBUyxHQUFtQixJQUFJO1FBQUksTUFBTSxTQUFTLENBQUMsQ0FBQztRQUEvRCxPQUFFLEdBQUYsRUFBRSxDQUFNO0lBQXdELENBQUM7SUFDcEYsU0FBUyxDQUFDLE9BQW9CLEVBQUUsT0FBWTtRQUMxQyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDL0MsQ0FBQztBQUNILENBQUM7QUFHRCw2QkFBNkIsSUFBSTtJQUMvQixZQUFtQixTQUFlLEVBQUUsU0FBUyxHQUFtQixJQUFJO1FBQUksTUFBTSxTQUFTLENBQUMsQ0FBQztRQUF0RSxjQUFTLEdBQVQsU0FBUyxDQUFNO0lBQXdELENBQUM7SUFDM0YsU0FBUyxDQUFDLE9BQW9CLEVBQUUsT0FBWSxJQUFTLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEcsQ0FBQztBQUVELE9BQU8sSUFBSSxZQUFZLEdBQUcsSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25FLE9BQU8sSUFBSSxTQUFTLEdBQUcsSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdELE9BQU8sSUFBSSxRQUFRLEdBQUcsSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNELE9BQU8sSUFBSSxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pFLE9BQU8sSUFBSSxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pFLE9BQU8sSUFBSSxhQUFhLEdBQUcsSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBVXJFLGlCQUFpQjtBQUVqQixXQUFZLGNBZ0JYO0FBaEJELFdBQVksY0FBYztJQUN4Qix1REFBTSxDQUFBO0lBQ04sNkRBQVMsQ0FBQTtJQUNULDZEQUFTLENBQUE7SUFDVCxtRUFBWSxDQUFBO0lBQ1oscURBQUssQ0FBQTtJQUNMLG1EQUFJLENBQUE7SUFDSix1REFBTSxDQUFBO0lBQ04sMkRBQVEsQ0FBQTtJQUNSLHVEQUFNLENBQUE7SUFDTixpREFBRyxDQUFBO0lBQ0gsZ0RBQUUsQ0FBQTtJQUNGLHNEQUFLLENBQUE7SUFDTCxrRUFBVyxDQUFBO0lBQ1gsd0RBQU0sQ0FBQTtJQUNOLG9FQUFZLENBQUE7QUFDZCxDQUFDLEVBaEJXLGNBQWMsS0FBZCxjQUFjLFFBZ0J6QjtBQUdEO0lBQ0UsWUFBbUIsSUFBVTtRQUFWLFNBQUksR0FBSixJQUFJLENBQU07SUFBRyxDQUFDO0lBSWpDLElBQUksQ0FBQyxJQUFZLElBQWtCLE1BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXpFLEdBQUcsQ0FBQyxLQUFpQixFQUFFLElBQUksR0FBUyxJQUFJO1FBQ3RDLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxVQUFVLENBQUMsSUFBNEIsRUFBRSxNQUFvQjtRQUMzRCxNQUFNLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxNQUFNLENBQUMsTUFBb0IsSUFBd0IsTUFBTSxDQUFDLElBQUksa0JBQWtCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVqRyxXQUFXLENBQUMsTUFBb0IsRUFBRSxJQUFJLEdBQVMsSUFBSTtRQUNqRCxNQUFNLENBQUMsSUFBSSxlQUFlLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsV0FBVyxDQUFDLFFBQW9CLEVBQUUsU0FBUyxHQUFlLElBQUk7UUFDNUQsTUFBTSxDQUFDLElBQUksZUFBZSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFlO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFDRCxTQUFTLENBQUMsR0FBZTtRQUN2QixNQUFNLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBQ0QsU0FBUyxDQUFDLEdBQWU7UUFDdkIsTUFBTSxDQUFDLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUNELFlBQVksQ0FBQyxHQUFlO1FBQzFCLE1BQU0sQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFDRCxLQUFLLENBQUMsR0FBZTtRQUNuQixNQUFNLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBQ0QsSUFBSSxDQUFDLEdBQWU7UUFDbEIsTUFBTSxDQUFDLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFlO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFDRCxRQUFRLENBQUMsR0FBZTtRQUN0QixNQUFNLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBQ0QsTUFBTSxDQUFDLEdBQWU7UUFDcEIsTUFBTSxDQUFDLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUNELEdBQUcsQ0FBQyxHQUFlO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFDRCxFQUFFLENBQUMsR0FBZTtRQUNoQixNQUFNLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBQ0QsS0FBSyxDQUFDLEdBQWU7UUFDbkIsTUFBTSxDQUFDLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUNELFdBQVcsQ0FBQyxHQUFlO1FBQ3pCLE1BQU0sQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFDRCxNQUFNLENBQUMsR0FBZTtRQUNwQixNQUFNLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBQ0QsWUFBWSxDQUFDLEdBQWU7UUFDMUIsTUFBTSxDQUFDLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUNELE9BQU87UUFDTCw4RUFBOEU7UUFDOUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUNELElBQUksQ0FBQyxJQUFVLElBQWdCLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sS0FBZ0IsTUFBTSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUFFRCxXQUFZLFVBS1g7QUFMRCxXQUFZLFVBQVU7SUFDcEIsMkNBQUksQ0FBQTtJQUNKLDZDQUFLLENBQUE7SUFDTCx1REFBVSxDQUFBO0lBQ1YsdURBQVUsQ0FBQTtBQUNaLENBQUMsRUFMVyxVQUFVLEtBQVYsVUFBVSxRQUtyQjtBQUVELGlDQUFpQyxVQUFVO0lBSXpDLFlBQVksSUFBeUIsRUFBRSxJQUFJLEdBQVMsSUFBSTtRQUN0RCxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQ1osRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsSUFBSSxHQUFXLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsT0FBTyxHQUFlLElBQUksQ0FBQztRQUNsQyxDQUFDO0lBQ0gsQ0FBQztJQUNELGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFpQixJQUFrQixNQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckYsQ0FBQztBQUdELGtDQUFrQyxVQUFVO0lBRTFDLFlBQW1CLElBQVksRUFBRSxLQUFpQixFQUFFLElBQUksR0FBUyxJQUFJO1FBQ25FLE1BQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFEMUIsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUU3QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBRUQsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUN0RCxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsVUFBVSxDQUFDLElBQUksR0FBUyxJQUFJLEVBQUUsU0FBUyxHQUFtQixJQUFJO1FBQzVELE1BQU0sQ0FBQyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7QUFDSCxDQUFDO0FBR0Qsa0NBQWtDLFVBQVU7SUFFMUMsWUFBbUIsUUFBb0IsRUFBUyxLQUFpQixFQUFFLEtBQWlCLEVBQ3hFLElBQUksR0FBUyxJQUFJO1FBQzNCLE1BQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFGMUIsYUFBUSxHQUFSLFFBQVEsQ0FBWTtRQUFTLFVBQUssR0FBTCxLQUFLLENBQVk7UUFHL0QsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQUNELGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEQsQ0FBQztBQUNILENBQUM7QUFHRCxtQ0FBbUMsVUFBVTtJQUUzQyxZQUFtQixRQUFvQixFQUFTLElBQVksRUFBRSxLQUFpQixFQUNuRSxJQUFJLEdBQVMsSUFBSTtRQUMzQixNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRjFCLGFBQVEsR0FBUixRQUFRLENBQVk7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBRzFELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFDRCxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQ3RELE1BQU0sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ25ELENBQUM7QUFDSCxDQUFDO0FBRUQsV0FBWSxhQUlYO0FBSkQsV0FBWSxhQUFhO0lBQ3ZCLCtEQUFXLENBQUE7SUFDWCwrRUFBbUIsQ0FBQTtJQUNuQixpREFBSSxDQUFBO0FBQ04sQ0FBQyxFQUpXLGFBQWEsS0FBYixhQUFhLFFBSXhCO0FBRUQsc0NBQXNDLFVBQVU7SUFHOUMsWUFBbUIsUUFBb0IsRUFBRSxNQUE4QixFQUNwRCxJQUFrQixFQUFFLElBQUksR0FBUyxJQUFJO1FBQ3RELE1BQU0sSUFBSSxDQUFDLENBQUM7UUFGSyxhQUFRLEdBQVIsUUFBUSxDQUFZO1FBQ3BCLFNBQUksR0FBSixJQUFJLENBQWM7UUFFbkMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsSUFBSSxHQUFXLE1BQU0sQ0FBQztZQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsT0FBTyxHQUFrQixNQUFNLENBQUM7UUFDdkMsQ0FBQztJQUNILENBQUM7SUFDRCxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQ3RELE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELENBQUM7QUFDSCxDQUFDO0FBR0Qsd0NBQXdDLFVBQVU7SUFDaEQsWUFBbUIsRUFBYyxFQUFTLElBQWtCLEVBQUUsSUFBSSxHQUFTLElBQUk7UUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQTVFLE9BQUUsR0FBRixFQUFFLENBQVk7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFjO0lBQW9DLENBQUM7SUFDakcsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUN0RCxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4RCxDQUFDO0FBQ0gsQ0FBQztBQUdELHFDQUFxQyxVQUFVO0lBQzdDLFlBQW1CLFNBQXFCLEVBQVMsSUFBa0IsRUFBRSxJQUFXO1FBQUksTUFBTSxJQUFJLENBQUMsQ0FBQztRQUE3RSxjQUFTLEdBQVQsU0FBUyxDQUFZO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBYztJQUE4QixDQUFDO0lBQ2xHLGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckQsQ0FBQztBQUNILENBQUM7QUFHRCxpQ0FBaUMsVUFBVTtJQUN6QyxZQUFtQixLQUFVLEVBQUUsSUFBSSxHQUFTLElBQUk7UUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQTdDLFVBQUssR0FBTCxLQUFLLENBQUs7SUFBb0MsQ0FBQztJQUNsRSxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQ3RELE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELENBQUM7QUFDSCxDQUFDO0FBR0Qsa0NBQWtDLFVBQVU7SUFDMUMsWUFBbUIsS0FBZ0MsRUFBRSxJQUFJLEdBQVMsSUFBSSxFQUNuRCxVQUFVLEdBQVcsSUFBSTtRQUMxQyxNQUFNLElBQUksQ0FBQyxDQUFDO1FBRkssVUFBSyxHQUFMLEtBQUssQ0FBMkI7UUFDaEMsZUFBVSxHQUFWLFVBQVUsQ0FBZTtJQUU1QyxDQUFDO0lBQ0QsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUN0RCxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRCxDQUFDO0FBQ0gsQ0FBQztBQUdELHFDQUFxQyxVQUFVO0lBRTdDLFlBQW1CLFNBQXFCLEVBQUUsUUFBb0IsRUFDM0MsU0FBUyxHQUFlLElBQUksRUFBRSxJQUFJLEdBQVMsSUFBSTtRQUNoRSxNQUFNLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRjdCLGNBQVMsR0FBVCxTQUFTLENBQVk7UUFDckIsY0FBUyxHQUFULFNBQVMsQ0FBbUI7UUFFN0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDM0IsQ0FBQztJQUNELGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckQsQ0FBQztBQUNILENBQUM7QUFHRCw2QkFBNkIsVUFBVTtJQUNyQyxZQUFtQixTQUFxQjtRQUFJLE1BQU0sU0FBUyxDQUFDLENBQUM7UUFBMUMsY0FBUyxHQUFULFNBQVMsQ0FBWTtJQUFzQixDQUFDO0lBQy9ELGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLENBQUM7QUFDSCxDQUFDO0FBRUQsOEJBQThCLFVBQVU7SUFDdEMsWUFBbUIsS0FBaUIsRUFBRSxJQUFVO1FBQUksTUFBTSxJQUFJLENBQUMsQ0FBQztRQUE3QyxVQUFLLEdBQUwsS0FBSyxDQUFZO0lBQTZCLENBQUM7SUFDbEUsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUN0RCxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUMsQ0FBQztBQUNILENBQUM7QUFHRDtJQUNFLFlBQW1CLElBQVksRUFBUyxJQUFJLEdBQVMsSUFBSTtRQUF0QyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBYTtJQUFHLENBQUM7QUFDL0QsQ0FBQztBQUdELGtDQUFrQyxVQUFVO0lBQzFDLFlBQW1CLE1BQWlCLEVBQVMsVUFBdUIsRUFBRSxJQUFJLEdBQVMsSUFBSTtRQUNyRixNQUFNLElBQUksQ0FBQyxDQUFDO1FBREssV0FBTSxHQUFOLE1BQU0sQ0FBVztRQUFTLGVBQVUsR0FBVixVQUFVLENBQWE7SUFFcEUsQ0FBQztJQUNELGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFZLEVBQUUsU0FBUyxHQUFtQixJQUFJO1FBQ3ZELE1BQU0sQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMzRixDQUFDO0FBQ0gsQ0FBQztBQUdELHdDQUF3QyxVQUFVO0lBRWhELFlBQW1CLFFBQXdCLEVBQUUsR0FBZSxFQUFTLEdBQWUsRUFDeEUsSUFBSSxHQUFTLElBQUk7UUFDM0IsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUZ4QixhQUFRLEdBQVIsUUFBUSxDQUFnQjtRQUEwQixRQUFHLEdBQUgsR0FBRyxDQUFZO1FBR2xGLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2pCLENBQUM7SUFDRCxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQ3RELE1BQU0sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hELENBQUM7QUFDSCxDQUFDO0FBR0Qsa0NBQWtDLFVBQVU7SUFDMUMsWUFBbUIsUUFBb0IsRUFBUyxJQUFZLEVBQUUsSUFBSSxHQUFTLElBQUk7UUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQTVFLGFBQVEsR0FBUixRQUFRLENBQVk7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO0lBQW9DLENBQUM7SUFDakcsZUFBZSxDQUFDLE9BQTBCLEVBQUUsT0FBWTtRQUN0RCxNQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBQ0QsR0FBRyxDQUFDLEtBQWlCO1FBQ25CLE1BQU0sQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUQsQ0FBQztBQUNILENBQUM7QUFHRCxpQ0FBaUMsVUFBVTtJQUN6QyxZQUFtQixRQUFvQixFQUFTLEtBQWlCLEVBQUUsSUFBSSxHQUFTLElBQUk7UUFDbEYsTUFBTSxJQUFJLENBQUMsQ0FBQztRQURLLGFBQVEsR0FBUixRQUFRLENBQVk7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFZO0lBRWpFLENBQUM7SUFDRCxlQUFlLENBQUMsT0FBMEIsRUFBRSxPQUFZO1FBQ3RELE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFDRCxHQUFHLENBQUMsS0FBaUI7UUFDbkIsTUFBTSxDQUFDLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1RCxDQUFDO0FBQ0gsQ0FBQztBQUdELHNDQUFzQyxVQUFVO0lBRTlDLFlBQVksT0FBcUIsRUFBRSxJQUFJLEdBQVMsSUFBSTtRQUNsRCxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDekIsQ0FBQztJQUNELGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEQsQ0FBQztBQUNILENBQUM7QUFHRCxvQ0FBb0MsVUFBVTtJQUc1QyxZQUFtQixPQUEwQyxFQUFFLElBQUksR0FBWSxJQUFJO1FBQ2pGLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFESyxZQUFPLEdBQVAsT0FBTyxDQUFtQztRQUZ0RCxjQUFTLEdBQVMsSUFBSSxDQUFDO1FBSTVCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2xDLENBQUM7SUFDSCxDQUFDOztJQUNELGVBQWUsQ0FBQyxPQUEwQixFQUFFLE9BQVk7UUFDdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEQsQ0FBQztBQUNILENBQUM7QUF1QkQsT0FBTyxJQUFJLFNBQVMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEQsT0FBTyxJQUFJLFVBQVUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUQsT0FBTyxJQUFJLGVBQWUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDcEUsT0FBTyxJQUFJLGVBQWUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDcEUsT0FBTyxJQUFJLFNBQVMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFFbkQsZUFBZTtBQUNmLFdBQVksWUFHWDtBQUhELFdBQVksWUFBWTtJQUN0QixpREFBSyxDQUFBO0lBQ0wscURBQU8sQ0FBQTtBQUNULENBQUMsRUFIVyxZQUFZLEtBQVosWUFBWSxRQUd2QjtBQUVEO0lBQ0UsWUFBbUIsU0FBUyxHQUFtQixJQUFJO1FBQWhDLGNBQVMsR0FBVCxTQUFTLENBQXVCO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQztJQUNILENBQUM7SUFJRCxXQUFXLENBQUMsUUFBc0IsSUFBYSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xHLENBQUM7QUFHRCxvQ0FBb0MsU0FBUztJQUUzQyxZQUFtQixJQUFZLEVBQVMsS0FBaUIsRUFBRSxJQUFJLEdBQVMsSUFBSSxFQUNoRSxTQUFTLEdBQW1CLElBQUk7UUFDMUMsTUFBTSxTQUFTLENBQUMsQ0FBQztRQUZBLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFZO1FBR3ZELElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQ2xELENBQUM7SUFFRCxjQUFjLENBQUMsT0FBeUIsRUFBRSxPQUFZO1FBQ3BELE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BELENBQUM7QUFDSCxDQUFDO0FBRUQseUNBQXlDLFNBQVM7SUFDaEQsWUFBbUIsSUFBWSxFQUFTLE1BQWlCLEVBQVMsVUFBdUIsRUFDdEUsSUFBSSxHQUFTLElBQUksRUFBRSxTQUFTLEdBQW1CLElBQUk7UUFDcEUsTUFBTSxTQUFTLENBQUMsQ0FBQztRQUZBLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFXO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtRQUN0RSxTQUFJLEdBQUosSUFBSSxDQUFhO0lBRXBDLENBQUM7SUFFRCxjQUFjLENBQUMsT0FBeUIsRUFBRSxPQUFZO1FBQ3BELE1BQU0sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pELENBQUM7QUFDSCxDQUFDO0FBRUQseUNBQXlDLFNBQVM7SUFDaEQsWUFBbUIsSUFBZ0I7UUFBSSxPQUFPLENBQUM7UUFBNUIsU0FBSSxHQUFKLElBQUksQ0FBWTtJQUFhLENBQUM7SUFFakQsY0FBYyxDQUFDLE9BQXlCLEVBQUUsT0FBWTtRQUNwRCxNQUFNLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRCxDQUFDO0FBQ0gsQ0FBQztBQUdELHFDQUFxQyxTQUFTO0lBQzVDLFlBQW1CLEtBQWlCO1FBQUksT0FBTyxDQUFDO1FBQTdCLFVBQUssR0FBTCxLQUFLLENBQVk7SUFBYSxDQUFDO0lBQ2xELGNBQWMsQ0FBQyxPQUF5QixFQUFFLE9BQVk7UUFDcEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELENBQUM7QUFDSCxDQUFDO0FBRUQ7SUFDRSxZQUFtQixJQUFJLEdBQVMsSUFBSSxFQUFTLFNBQXlCO1FBQW5ELFNBQUksR0FBSixJQUFJLENBQWE7UUFBUyxjQUFTLEdBQVQsU0FBUyxDQUFnQjtRQUNwRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUM7SUFDSCxDQUFDO0lBQ0QsV0FBVyxDQUFDLFFBQXNCLElBQWEsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRyxDQUFDO0FBRUQsZ0NBQWdDLGlCQUFpQjtJQUMvQyxZQUFtQixJQUFZLEVBQUUsSUFBSSxHQUFTLElBQUksRUFBRSxTQUFTLEdBQW1CLElBQUk7UUFDbEYsTUFBTSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFETixTQUFJLEdBQUosSUFBSSxDQUFRO0lBRS9CLENBQUM7QUFDSCxDQUFDO0FBR0QsaUNBQWlDLGlCQUFpQjtJQUNoRCxZQUFtQixJQUFZLEVBQVMsTUFBaUIsRUFBUyxJQUFpQixFQUN2RSxJQUFJLEdBQVMsSUFBSSxFQUFFLFNBQVMsR0FBbUIsSUFBSTtRQUM3RCxNQUFNLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUZOLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFXO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBYTtJQUduRixDQUFDO0FBQ0gsQ0FBQztBQUdELGlDQUFpQyxpQkFBaUI7SUFDaEQsWUFBbUIsSUFBWSxFQUFTLElBQWlCLEVBQUUsSUFBSSxHQUFTLElBQUksRUFDaEUsU0FBUyxHQUFtQixJQUFJO1FBQzFDLE1BQU0sSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRk4sU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFNBQUksR0FBSixJQUFJLENBQWE7SUFHekQsQ0FBQztBQUNILENBQUM7QUFHRCwrQkFBK0IsU0FBUztJQUN0QyxZQUFtQixJQUFZLEVBQVMsTUFBa0IsRUFBUyxNQUFvQixFQUNwRSxPQUFzQixFQUFTLGlCQUE4QixFQUM3RCxPQUFzQixFQUFFLFNBQVMsR0FBbUIsSUFBSTtRQUN6RSxNQUFNLFNBQVMsQ0FBQyxDQUFDO1FBSEEsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFdBQU0sR0FBTixNQUFNLENBQVk7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQ3BFLFlBQU8sR0FBUCxPQUFPLENBQWU7UUFBUyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWE7UUFDN0QsWUFBTyxHQUFQLE9BQU8sQ0FBZTtJQUV6QyxDQUFDO0lBQ0QsY0FBYyxDQUFDLE9BQXlCLEVBQUUsT0FBWTtRQUNwRCxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0RCxDQUFDO0FBQ0gsQ0FBQztBQUdELDRCQUE0QixTQUFTO0lBQ25DLFlBQW1CLFNBQXFCLEVBQVMsUUFBcUIsRUFDbkQsU0FBUyxHQUFrQyxFQUFFO1FBQzlELE9BQU8sQ0FBQztRQUZTLGNBQVMsR0FBVCxTQUFTLENBQVk7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFhO1FBQ25ELGNBQVMsR0FBVCxTQUFTLENBQW9DO0lBRWhFLENBQUM7SUFDRCxjQUFjLENBQUMsT0FBeUIsRUFBRSxPQUFZO1FBQ3BELE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1QyxDQUFDO0FBQ0gsQ0FBQztBQUdELGlDQUFpQyxTQUFTO0lBQ3hDLFlBQW1CLE9BQWU7UUFBSSxPQUFPLENBQUM7UUFBM0IsWUFBTyxHQUFQLE9BQU8sQ0FBUTtJQUFhLENBQUM7SUFDaEQsY0FBYyxDQUFDLE9BQXlCLEVBQUUsT0FBWTtRQUNwRCxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqRCxDQUFDO0FBQ0gsQ0FBQztBQUdELGtDQUFrQyxTQUFTO0lBQ3pDLFlBQW1CLFNBQXNCLEVBQVMsVUFBdUI7UUFBSSxPQUFPLENBQUM7UUFBbEUsY0FBUyxHQUFULFNBQVMsQ0FBYTtRQUFTLGVBQVUsR0FBVixVQUFVLENBQWE7SUFBYSxDQUFDO0lBQ3ZGLGNBQWMsQ0FBQyxPQUF5QixFQUFFLE9BQVk7UUFDcEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEQsQ0FBQztBQUNILENBQUM7QUFHRCwrQkFBK0IsU0FBUztJQUN0QyxZQUFtQixLQUFpQjtRQUFJLE9BQU8sQ0FBQztRQUE3QixVQUFLLEdBQUwsS0FBSyxDQUFZO0lBQWEsQ0FBQztJQUNsRCxjQUFjLENBQUMsT0FBeUIsRUFBRSxPQUFZO1FBQ3BELE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvQyxDQUFDO0FBQ0gsQ0FBQztBQWNEO0lBQ0UsZ0JBQWdCLENBQUMsR0FBZ0IsRUFBRSxPQUFZLElBQVMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDckUsaUJBQWlCLENBQUMsSUFBa0IsRUFBRSxPQUFZO1FBQ2hELE1BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFDRCxpQkFBaUIsQ0FBQyxJQUFrQixFQUFFLE9BQVk7UUFDaEQsTUFBTSxDQUFDLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsRUFDNUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUN6QyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBQ0Qsa0JBQWtCLENBQUMsSUFBbUIsRUFBRSxPQUFZO1FBQ2xELE1BQU0sQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksRUFDdkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUNELHFCQUFxQixDQUFDLEdBQXFCLEVBQUUsT0FBWTtRQUN2RCxJQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztRQUM3RCxNQUFNLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUNuRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUNELHVCQUF1QixDQUFDLEdBQXVCLEVBQUUsT0FBWTtRQUMzRCxNQUFNLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQ3JDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBQ0Qsb0JBQW9CLENBQUMsR0FBb0IsRUFBRSxPQUFZO1FBQ3JELE1BQU0sQ0FBQyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQzVDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwRixDQUFDO0lBQ0QsZ0JBQWdCLENBQUMsR0FBZ0IsRUFBRSxPQUFZLElBQVMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDckUsaUJBQWlCLENBQUMsR0FBaUIsRUFBRSxPQUFZLElBQVMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkUsb0JBQW9CLENBQUMsR0FBb0IsRUFBRSxPQUFZO1FBQ3JELE1BQU0sQ0FBQyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQzVDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsRUFDM0MsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUNELFlBQVksQ0FBQyxHQUFZLEVBQUUsT0FBWTtRQUNyQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUNELGFBQWEsQ0FBQyxHQUFhLEVBQUUsT0FBWTtRQUN2QyxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFDRCxpQkFBaUIsQ0FBQyxHQUFpQixFQUFFLE9BQVk7UUFDL0Msc0NBQXNDO1FBQ3RDLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsdUJBQXVCLENBQUMsR0FBdUIsRUFBRSxPQUFZO1FBQzNELE1BQU0sQ0FBQyxJQUFJLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUNwRCxHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFDRCxpQkFBaUIsQ0FBQyxHQUFpQixFQUFFLE9BQVk7UUFDL0MsTUFBTSxDQUFDLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzRixDQUFDO0lBQ0QsZ0JBQWdCLENBQUMsR0FBZ0IsRUFBRSxPQUFZO1FBQzdDLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQzNDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUNELHFCQUFxQixDQUFDLEdBQXFCLEVBQUUsT0FBWTtRQUN2RCxNQUFNLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFDRCxtQkFBbUIsQ0FBQyxHQUFtQixFQUFFLE9BQVk7UUFDbkQsTUFBTSxDQUFDLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUNyQyxDQUFDLEtBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBZSxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBQ0QsbUJBQW1CLENBQUMsS0FBbUIsRUFBRSxPQUFZO1FBQ25ELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxJQUFvQixFQUFFLE9BQVk7UUFDcEQsTUFBTSxDQUFDLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQy9ELElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0Qsd0JBQXdCLENBQUMsSUFBeUIsRUFBRSxPQUFZO1FBQzlELHNDQUFzQztRQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELG1CQUFtQixDQUFDLElBQXlCLEVBQUUsT0FBWTtRQUN6RCxNQUFNLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBQ0QsZUFBZSxDQUFDLElBQXFCLEVBQUUsT0FBWTtRQUNqRCxNQUFNLENBQUMsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUNELHFCQUFxQixDQUFDLElBQWUsRUFBRSxPQUFZO1FBQ2pELHNDQUFzQztRQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELFdBQVcsQ0FBQyxJQUFZLEVBQUUsT0FBWTtRQUNwQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUM3QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFDL0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBQ0QsaUJBQWlCLENBQUMsSUFBa0IsRUFBRSxPQUFZO1FBQ2hELE1BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFDaEQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBQ0QsY0FBYyxDQUFDLElBQWUsRUFBRSxPQUFZO1FBQzFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBQ0QsZ0JBQWdCLENBQUMsSUFBaUIsRUFBRSxPQUFZLElBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdkUsa0JBQWtCLENBQUMsS0FBa0IsRUFBRSxPQUFZO1FBQ2pELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7QUFDSCxDQUFDO0FBR0Q7SUFDRSxnQkFBZ0IsQ0FBQyxHQUFnQixFQUFFLE9BQVksSUFBUyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNyRSxpQkFBaUIsQ0FBQyxJQUFrQixFQUFFLE9BQVk7UUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsaUJBQWlCLENBQUMsSUFBa0IsRUFBRSxPQUFZO1FBQ2hELElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0Qsa0JBQWtCLENBQUMsSUFBbUIsRUFBRSxPQUFZO1FBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxxQkFBcUIsQ0FBQyxHQUFxQixFQUFFLE9BQVk7UUFDdkQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsdUJBQXVCLENBQUMsR0FBdUIsRUFBRSxPQUFZO1FBQzNELEdBQUcsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1QyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELG9CQUFvQixDQUFDLEdBQW9CLEVBQUUsT0FBWTtRQUNyRCxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxnQkFBZ0IsQ0FBQyxHQUFnQixFQUFFLE9BQVksSUFBUyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNyRSxpQkFBaUIsQ0FBQyxHQUFpQixFQUFFLE9BQVksSUFBUyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN2RSxvQkFBb0IsQ0FBQyxHQUFvQixFQUFFLE9BQVk7UUFDckQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1QyxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0MsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNiLENBQUM7SUFDRCxZQUFZLENBQUMsR0FBWSxFQUFFLE9BQVk7UUFDckMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsYUFBYSxDQUFDLEdBQWEsRUFBRSxPQUFZO1FBQ3ZDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELGlCQUFpQixDQUFDLEdBQWlCLEVBQUUsT0FBWSxJQUFTLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLHVCQUF1QixDQUFDLEdBQXVCLEVBQUUsT0FBWTtRQUMzRCxHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsaUJBQWlCLENBQUMsR0FBaUIsRUFBRSxPQUFZO1FBQy9DLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1QyxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUNELGdCQUFnQixDQUFDLEdBQWdCLEVBQUUsT0FBWTtRQUM3QyxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QscUJBQXFCLENBQUMsR0FBcUIsRUFBRSxPQUFZO1FBQ3ZELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsbUJBQW1CLENBQUMsR0FBbUIsRUFBRSxPQUFZO1FBQ25ELEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxLQUFrQixLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDYixDQUFDO0lBQ0QsbUJBQW1CLENBQUMsS0FBbUIsRUFBRSxPQUFZO1FBQ25ELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELG1CQUFtQixDQUFDLElBQW9CLEVBQUUsT0FBWTtRQUNwRCxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCx3QkFBd0IsQ0FBQyxJQUF5QixFQUFFLE9BQVk7UUFDOUQsc0NBQXNDO1FBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsbUJBQW1CLENBQUMsSUFBeUIsRUFBRSxPQUFZO1FBQ3pELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELGVBQWUsQ0FBQyxJQUFxQixFQUFFLE9BQVk7UUFDakQsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QscUJBQXFCLENBQUMsSUFBZSxFQUFFLE9BQVk7UUFDakQsc0NBQXNDO1FBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QsV0FBVyxDQUFDLElBQVksRUFBRSxPQUFZO1FBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELGlCQUFpQixDQUFDLElBQWtCLEVBQUUsT0FBWTtRQUNoRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELGNBQWMsQ0FBQyxJQUFlLEVBQUUsT0FBWTtRQUMxQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxnQkFBZ0IsQ0FBQyxJQUFpQixFQUFFLE9BQVksSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN2RSxrQkFBa0IsQ0FBQyxLQUFrQixFQUFFLE9BQVk7UUFDakQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0FBQ0gsQ0FBQztBQUVELHVDQUF1QyxPQUFlLEVBQUUsUUFBb0IsRUFDckMsVUFBc0I7SUFDM0QsSUFBSSxXQUFXLEdBQUcsSUFBSSwyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDckUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3ZELENBQUM7QUFFRCwwQ0FBMEMscUJBQXFCO0lBQzdELFlBQW9CLFFBQWdCLEVBQVUsU0FBcUI7UUFBSSxPQUFPLENBQUM7UUFBM0QsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVk7SUFBYSxDQUFDO0lBQ2pGLGdCQUFnQixDQUFDLEdBQWdCLEVBQUUsT0FBWTtRQUM3QyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0lBQzFELENBQUM7QUFDSCxDQUFDO0FBRUQsaUNBQWlDLEtBQWtCO0lBQ2pELElBQUksTUFBTSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7SUFDbkMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2QyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUN6QixDQUFDO0FBRUQsOEJBQThCLDBCQUEwQjtJQUF4RDtRQUE4QixlQUEwQjtRQUN0RCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUsvQixDQUFDO0lBSkMsZ0JBQWdCLENBQUMsR0FBZ0IsRUFBRSxPQUFZO1FBQzdDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUM7QUFFRCx5QkFBeUIsSUFBWSxFQUFFLElBQUksR0FBUyxJQUFJO0lBQ3RELE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckMsQ0FBQztBQUVELDJCQUEyQixFQUE2QixFQUFFLFVBQVUsR0FBVyxJQUFJO0lBQ2pGLE1BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFFRCwyQkFBMkIsRUFBNkIsRUFBRSxVQUFVLEdBQVcsSUFBSSxFQUN4RCxhQUFhLEdBQW1CLElBQUk7SUFDN0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNoRixDQUFDO0FBRUQsd0JBQXdCLEtBQVUsRUFBRSxJQUFJLEdBQVMsSUFBSTtJQUNuRCxNQUFNLENBQUMsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFFRCwyQkFBMkIsTUFBb0IsRUFBRSxJQUFJLEdBQVMsSUFBSTtJQUNoRSxNQUFNLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUVELDJCQUEyQixNQUF5QyxFQUN6QyxJQUFJLEdBQVksSUFBSTtJQUM3QyxNQUFNLENBQUMsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFFRCxvQkFBb0IsSUFBZ0I7SUFDbEMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFFRCxtQkFBbUIsTUFBaUIsRUFBRSxJQUFpQixFQUFFLElBQUksR0FBUyxJQUFJO0lBQ3hFLE1BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzlDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzU3RyaW5nLCBpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0NvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGF9IGZyb20gJy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuXG4vLy8vIFR5cGVzXG5leHBvcnQgZW51bSBUeXBlTW9kaWZpZXIge1xuICBDb25zdFxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVHlwZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtb2RpZmllcnM6IFR5cGVNb2RpZmllcltdID0gbnVsbCkge1xuICAgIGlmIChpc0JsYW5rKG1vZGlmaWVycykpIHtcbiAgICAgIHRoaXMubW9kaWZpZXJzID0gW107XG4gICAgfVxuICB9XG4gIGFic3RyYWN0IHZpc2l0VHlwZSh2aXNpdG9yOiBUeXBlVmlzaXRvciwgY29udGV4dDogYW55KTogYW55O1xuXG4gIGhhc01vZGlmaWVyKG1vZGlmaWVyOiBUeXBlTW9kaWZpZXIpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMubW9kaWZpZXJzLmluZGV4T2YobW9kaWZpZXIpICE9PSAtMTsgfVxufVxuXG5leHBvcnQgZW51bSBCdWlsdGluVHlwZU5hbWUge1xuICBEeW5hbWljLFxuICBCb29sLFxuICBTdHJpbmcsXG4gIEludCxcbiAgTnVtYmVyLFxuICBGdW5jdGlvblxufVxuXG5leHBvcnQgY2xhc3MgQnVpbHRpblR5cGUgZXh0ZW5kcyBUeXBlIHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IEJ1aWx0aW5UeXBlTmFtZSwgbW9kaWZpZXJzOiBUeXBlTW9kaWZpZXJbXSA9IG51bGwpIHsgc3VwZXIobW9kaWZpZXJzKTsgfVxuICB2aXNpdFR5cGUodmlzaXRvcjogVHlwZVZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRCdWlsdGludFR5cGUodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEV4dGVybmFsVHlwZSBleHRlbmRzIFR5cGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIHB1YmxpYyB0eXBlUGFyYW1zOiBUeXBlW10gPSBudWxsLFxuICAgICAgICAgICAgICBtb2RpZmllcnM6IFR5cGVNb2RpZmllcltdID0gbnVsbCkge1xuICAgIHN1cGVyKG1vZGlmaWVycyk7XG4gIH1cbiAgdmlzaXRUeXBlKHZpc2l0b3I6IFR5cGVWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RXh0ZXJuYWxUeXBlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEFycmF5VHlwZSBleHRlbmRzIFR5cGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgb2Y6IFR5cGUsIG1vZGlmaWVyczogVHlwZU1vZGlmaWVyW10gPSBudWxsKSB7IHN1cGVyKG1vZGlmaWVycyk7IH1cbiAgdmlzaXRUeXBlKHZpc2l0b3I6IFR5cGVWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QXJyYXlUeXBlKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIE1hcFR5cGUgZXh0ZW5kcyBUeXBlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlVHlwZTogVHlwZSwgbW9kaWZpZXJzOiBUeXBlTW9kaWZpZXJbXSA9IG51bGwpIHsgc3VwZXIobW9kaWZpZXJzKTsgfVxuICB2aXNpdFR5cGUodmlzaXRvcjogVHlwZVZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0TWFwVHlwZSh0aGlzLCBjb250ZXh0KTsgfVxufVxuXG5leHBvcnQgdmFyIERZTkFNSUNfVFlQRSA9IG5ldyBCdWlsdGluVHlwZShCdWlsdGluVHlwZU5hbWUuRHluYW1pYyk7XG5leHBvcnQgdmFyIEJPT0xfVFlQRSA9IG5ldyBCdWlsdGluVHlwZShCdWlsdGluVHlwZU5hbWUuQm9vbCk7XG5leHBvcnQgdmFyIElOVF9UWVBFID0gbmV3IEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlTmFtZS5JbnQpO1xuZXhwb3J0IHZhciBOVU1CRVJfVFlQRSA9IG5ldyBCdWlsdGluVHlwZShCdWlsdGluVHlwZU5hbWUuTnVtYmVyKTtcbmV4cG9ydCB2YXIgU1RSSU5HX1RZUEUgPSBuZXcgQnVpbHRpblR5cGUoQnVpbHRpblR5cGVOYW1lLlN0cmluZyk7XG5leHBvcnQgdmFyIEZVTkNUSU9OX1RZUEUgPSBuZXcgQnVpbHRpblR5cGUoQnVpbHRpblR5cGVOYW1lLkZ1bmN0aW9uKTtcblxuXG5leHBvcnQgaW50ZXJmYWNlIFR5cGVWaXNpdG9yIHtcbiAgdmlzaXRCdWlsdGludFR5cGUodHlwZTogQnVpbHRpblR5cGUsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRFeHRlcm5hbFR5cGUodHlwZTogRXh0ZXJuYWxUeXBlLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QXJyYXlUeXBlKHR5cGU6IEFycmF5VHlwZSwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdE1hcFR5cGUodHlwZTogTWFwVHlwZSwgY29udGV4dDogYW55KTogYW55O1xufVxuXG4vLy8vLyBFeHByZXNzaW9uc1xuXG5leHBvcnQgZW51bSBCaW5hcnlPcGVyYXRvciB7XG4gIEVxdWFscyxcbiAgTm90RXF1YWxzLFxuICBJZGVudGljYWwsXG4gIE5vdElkZW50aWNhbCxcbiAgTWludXMsXG4gIFBsdXMsXG4gIERpdmlkZSxcbiAgTXVsdGlwbHksXG4gIE1vZHVsbyxcbiAgQW5kLFxuICBPcixcbiAgTG93ZXIsXG4gIExvd2VyRXF1YWxzLFxuICBCaWdnZXIsXG4gIEJpZ2dlckVxdWFsc1xufVxuXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIHR5cGU6IFR5cGUpIHt9XG5cbiAgYWJzdHJhY3QgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnk7XG5cbiAgcHJvcChuYW1lOiBzdHJpbmcpOiBSZWFkUHJvcEV4cHIgeyByZXR1cm4gbmV3IFJlYWRQcm9wRXhwcih0aGlzLCBuYW1lKTsgfVxuXG4gIGtleShpbmRleDogRXhwcmVzc2lvbiwgdHlwZTogVHlwZSA9IG51bGwpOiBSZWFkS2V5RXhwciB7XG4gICAgcmV0dXJuIG5ldyBSZWFkS2V5RXhwcih0aGlzLCBpbmRleCwgdHlwZSk7XG4gIH1cblxuICBjYWxsTWV0aG9kKG5hbWU6IHN0cmluZyB8IEJ1aWx0aW5NZXRob2QsIHBhcmFtczogRXhwcmVzc2lvbltdKTogSW52b2tlTWV0aG9kRXhwciB7XG4gICAgcmV0dXJuIG5ldyBJbnZva2VNZXRob2RFeHByKHRoaXMsIG5hbWUsIHBhcmFtcyk7XG4gIH1cblxuICBjYWxsRm4ocGFyYW1zOiBFeHByZXNzaW9uW10pOiBJbnZva2VGdW5jdGlvbkV4cHIgeyByZXR1cm4gbmV3IEludm9rZUZ1bmN0aW9uRXhwcih0aGlzLCBwYXJhbXMpOyB9XG5cbiAgaW5zdGFudGlhdGUocGFyYW1zOiBFeHByZXNzaW9uW10sIHR5cGU6IFR5cGUgPSBudWxsKTogSW5zdGFudGlhdGVFeHByIHtcbiAgICByZXR1cm4gbmV3IEluc3RhbnRpYXRlRXhwcih0aGlzLCBwYXJhbXMsIHR5cGUpO1xuICB9XG5cbiAgY29uZGl0aW9uYWwodHJ1ZUNhc2U6IEV4cHJlc3Npb24sIGZhbHNlQ2FzZTogRXhwcmVzc2lvbiA9IG51bGwpOiBDb25kaXRpb25hbEV4cHIge1xuICAgIHJldHVybiBuZXcgQ29uZGl0aW9uYWxFeHByKHRoaXMsIHRydWVDYXNlLCBmYWxzZUNhc2UpO1xuICB9XG5cbiAgZXF1YWxzKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuRXF1YWxzLCB0aGlzLCByaHMpO1xuICB9XG4gIG5vdEVxdWFscyhyaHM6IEV4cHJlc3Npb24pOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLk5vdEVxdWFscywgdGhpcywgcmhzKTtcbiAgfVxuICBpZGVudGljYWwocmhzOiBFeHByZXNzaW9uKTogQmluYXJ5T3BlcmF0b3JFeHByIHtcbiAgICByZXR1cm4gbmV3IEJpbmFyeU9wZXJhdG9yRXhwcihCaW5hcnlPcGVyYXRvci5JZGVudGljYWwsIHRoaXMsIHJocyk7XG4gIH1cbiAgbm90SWRlbnRpY2FsKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTm90SWRlbnRpY2FsLCB0aGlzLCByaHMpO1xuICB9XG4gIG1pbnVzKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTWludXMsIHRoaXMsIHJocyk7XG4gIH1cbiAgcGx1cyhyaHM6IEV4cHJlc3Npb24pOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLlBsdXMsIHRoaXMsIHJocyk7XG4gIH1cbiAgZGl2aWRlKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuRGl2aWRlLCB0aGlzLCByaHMpO1xuICB9XG4gIG11bHRpcGx5KHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTXVsdGlwbHksIHRoaXMsIHJocyk7XG4gIH1cbiAgbW9kdWxvKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTW9kdWxvLCB0aGlzLCByaHMpO1xuICB9XG4gIGFuZChyaHM6IEV4cHJlc3Npb24pOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLkFuZCwgdGhpcywgcmhzKTtcbiAgfVxuICBvcihyaHM6IEV4cHJlc3Npb24pOiBCaW5hcnlPcGVyYXRvckV4cHIge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKEJpbmFyeU9wZXJhdG9yLk9yLCB0aGlzLCByaHMpO1xuICB9XG4gIGxvd2VyKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuTG93ZXIsIHRoaXMsIHJocyk7XG4gIH1cbiAgbG93ZXJFcXVhbHMocmhzOiBFeHByZXNzaW9uKTogQmluYXJ5T3BlcmF0b3JFeHByIHtcbiAgICByZXR1cm4gbmV3IEJpbmFyeU9wZXJhdG9yRXhwcihCaW5hcnlPcGVyYXRvci5Mb3dlckVxdWFscywgdGhpcywgcmhzKTtcbiAgfVxuICBiaWdnZXIocmhzOiBFeHByZXNzaW9uKTogQmluYXJ5T3BlcmF0b3JFeHByIHtcbiAgICByZXR1cm4gbmV3IEJpbmFyeU9wZXJhdG9yRXhwcihCaW5hcnlPcGVyYXRvci5CaWdnZXIsIHRoaXMsIHJocyk7XG4gIH1cbiAgYmlnZ2VyRXF1YWxzKHJoczogRXhwcmVzc2lvbik6IEJpbmFyeU9wZXJhdG9yRXhwciB7XG4gICAgcmV0dXJuIG5ldyBCaW5hcnlPcGVyYXRvckV4cHIoQmluYXJ5T3BlcmF0b3IuQmlnZ2VyRXF1YWxzLCB0aGlzLCByaHMpO1xuICB9XG4gIGlzQmxhbmsoKTogRXhwcmVzc2lvbiB7XG4gICAgLy8gTm90ZTogV2UgdXNlIGVxdWFscyBieSBwdXJwb3NlIGhlcmUgdG8gY29tcGFyZSB0byBudWxsIGFuZCB1bmRlZmluZWQgaW4gSlMuXG4gICAgcmV0dXJuIHRoaXMuZXF1YWxzKE5VTExfRVhQUik7XG4gIH1cbiAgY2FzdCh0eXBlOiBUeXBlKTogRXhwcmVzc2lvbiB7IHJldHVybiBuZXcgQ2FzdEV4cHIodGhpcywgdHlwZSk7IH1cbiAgdG9TdG10KCk6IFN0YXRlbWVudCB7IHJldHVybiBuZXcgRXhwcmVzc2lvblN0YXRlbWVudCh0aGlzKTsgfVxufVxuXG5leHBvcnQgZW51bSBCdWlsdGluVmFyIHtcbiAgVGhpcyxcbiAgU3VwZXIsXG4gIENhdGNoRXJyb3IsXG4gIENhdGNoU3RhY2tcbn1cblxuZXhwb3J0IGNsYXNzIFJlYWRWYXJFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyBuYW1lO1xuICBwdWJsaWMgYnVpbHRpbjogQnVpbHRpblZhcjtcblxuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcgfCBCdWlsdGluVmFyLCB0eXBlOiBUeXBlID0gbnVsbCkge1xuICAgIHN1cGVyKHR5cGUpO1xuICAgIGlmIChpc1N0cmluZyhuYW1lKSkge1xuICAgICAgdGhpcy5uYW1lID0gPHN0cmluZz5uYW1lO1xuICAgICAgdGhpcy5idWlsdGluID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5uYW1lID0gbnVsbDtcbiAgICAgIHRoaXMuYnVpbHRpbiA9IDxCdWlsdGluVmFyPm5hbWU7XG4gICAgfVxuICB9XG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFJlYWRWYXJFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG5cbiAgc2V0KHZhbHVlOiBFeHByZXNzaW9uKTogV3JpdGVWYXJFeHByIHsgcmV0dXJuIG5ldyBXcml0ZVZhckV4cHIodGhpcy5uYW1lLCB2YWx1ZSk7IH1cbn1cblxuXG5leHBvcnQgY2xhc3MgV3JpdGVWYXJFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyB2YWx1ZTogRXhwcmVzc2lvbjtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgdmFsdWU6IEV4cHJlc3Npb24sIHR5cGU6IFR5cGUgPSBudWxsKSB7XG4gICAgc3VwZXIoaXNQcmVzZW50KHR5cGUpID8gdHlwZSA6IHZhbHVlLnR5cGUpO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFdyaXRlVmFyRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIHRvRGVjbFN0bXQodHlwZTogVHlwZSA9IG51bGwsIG1vZGlmaWVyczogU3RtdE1vZGlmaWVyW10gPSBudWxsKTogRGVjbGFyZVZhclN0bXQge1xuICAgIHJldHVybiBuZXcgRGVjbGFyZVZhclN0bXQodGhpcy5uYW1lLCB0aGlzLnZhbHVlLCB0eXBlLCBtb2RpZmllcnMpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFdyaXRlS2V5RXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBwdWJsaWMgdmFsdWU6IEV4cHJlc3Npb247XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWNlaXZlcjogRXhwcmVzc2lvbiwgcHVibGljIGluZGV4OiBFeHByZXNzaW9uLCB2YWx1ZTogRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgdHlwZTogVHlwZSA9IG51bGwpIHtcbiAgICBzdXBlcihpc1ByZXNlbnQodHlwZSkgPyB0eXBlIDogdmFsdWUudHlwZSk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFdyaXRlS2V5RXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBXcml0ZVByb3BFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyB2YWx1ZTogRXhwcmVzc2lvbjtcbiAgY29uc3RydWN0b3IocHVibGljIHJlY2VpdmVyOiBFeHByZXNzaW9uLCBwdWJsaWMgbmFtZTogc3RyaW5nLCB2YWx1ZTogRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgdHlwZTogVHlwZSA9IG51bGwpIHtcbiAgICBzdXBlcihpc1ByZXNlbnQodHlwZSkgPyB0eXBlIDogdmFsdWUudHlwZSk7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFdyaXRlUHJvcEV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGVudW0gQnVpbHRpbk1ldGhvZCB7XG4gIENvbmNhdEFycmF5LFxuICBTdWJzY3JpYmVPYnNlcnZhYmxlLFxuICBiaW5kXG59XG5cbmV4cG9ydCBjbGFzcyBJbnZva2VNZXRob2RFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyBidWlsdGluOiBCdWlsdGluTWV0aG9kO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVjZWl2ZXI6IEV4cHJlc3Npb24sIG1ldGhvZDogc3RyaW5nIHwgQnVpbHRpbk1ldGhvZCxcbiAgICAgICAgICAgICAgcHVibGljIGFyZ3M6IEV4cHJlc3Npb25bXSwgdHlwZTogVHlwZSA9IG51bGwpIHtcbiAgICBzdXBlcih0eXBlKTtcbiAgICBpZiAoaXNTdHJpbmcobWV0aG9kKSkge1xuICAgICAgdGhpcy5uYW1lID0gPHN0cmluZz5tZXRob2Q7XG4gICAgICB0aGlzLmJ1aWx0aW4gPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5hbWUgPSBudWxsO1xuICAgICAgdGhpcy5idWlsdGluID0gPEJ1aWx0aW5NZXRob2Q+bWV0aG9kO1xuICAgIH1cbiAgfVxuICB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRJbnZva2VNZXRob2RFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEludm9rZUZ1bmN0aW9uRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZm46IEV4cHJlc3Npb24sIHB1YmxpYyBhcmdzOiBFeHByZXNzaW9uW10sIHR5cGU6IFR5cGUgPSBudWxsKSB7IHN1cGVyKHR5cGUpOyB9XG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEludm9rZUZ1bmN0aW9uRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBJbnN0YW50aWF0ZUV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNsYXNzRXhwcjogRXhwcmVzc2lvbiwgcHVibGljIGFyZ3M6IEV4cHJlc3Npb25bXSwgdHlwZT86IFR5cGUpIHsgc3VwZXIodHlwZSk7IH1cbiAgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0SW5zdGFudGlhdGVFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIExpdGVyYWxFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogYW55LCB0eXBlOiBUeXBlID0gbnVsbCkgeyBzdXBlcih0eXBlKTsgfVxuICB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRMaXRlcmFsRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBFeHRlcm5hbEV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLCB0eXBlOiBUeXBlID0gbnVsbCxcbiAgICAgICAgICAgICAgcHVibGljIHR5cGVQYXJhbXM6IFR5cGVbXSA9IG51bGwpIHtcbiAgICBzdXBlcih0eXBlKTtcbiAgfVxuICB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRFeHRlcm5hbEV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgQ29uZGl0aW9uYWxFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyB0cnVlQ2FzZTogRXhwcmVzc2lvbjtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbmRpdGlvbjogRXhwcmVzc2lvbiwgdHJ1ZUNhc2U6IEV4cHJlc3Npb24sXG4gICAgICAgICAgICAgIHB1YmxpYyBmYWxzZUNhc2U6IEV4cHJlc3Npb24gPSBudWxsLCB0eXBlOiBUeXBlID0gbnVsbCkge1xuICAgIHN1cGVyKGlzUHJlc2VudCh0eXBlKSA/IHR5cGUgOiB0cnVlQ2FzZS50eXBlKTtcbiAgICB0aGlzLnRydWVDYXNlID0gdHJ1ZUNhc2U7XG4gIH1cbiAgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0Q29uZGl0aW9uYWxFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIE5vdEV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbmRpdGlvbjogRXhwcmVzc2lvbikgeyBzdXBlcihCT09MX1RZUEUpOyB9XG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdE5vdEV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENhc3RFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogRXhwcmVzc2lvbiwgdHlwZTogVHlwZSkgeyBzdXBlcih0eXBlKTsgfVxuICB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRDYXN0RXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBGblBhcmFtIHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHR5cGU6IFR5cGUgPSBudWxsKSB7fVxufVxuXG5cbmV4cG9ydCBjbGFzcyBGdW5jdGlvbkV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmFtczogRm5QYXJhbVtdLCBwdWJsaWMgc3RhdGVtZW50czogU3RhdGVtZW50W10sIHR5cGU6IFR5cGUgPSBudWxsKSB7XG4gICAgc3VwZXIodHlwZSk7XG4gIH1cbiAgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RnVuY3Rpb25FeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG5cbiAgdG9EZWNsU3RtdChuYW1lOiBzdHJpbmcsIG1vZGlmaWVyczogU3RtdE1vZGlmaWVyW10gPSBudWxsKTogRGVjbGFyZUZ1bmN0aW9uU3RtdCB7XG4gICAgcmV0dXJuIG5ldyBEZWNsYXJlRnVuY3Rpb25TdG10KG5hbWUsIHRoaXMucGFyYW1zLCB0aGlzLnN0YXRlbWVudHMsIHRoaXMudHlwZSwgbW9kaWZpZXJzKTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBCaW5hcnlPcGVyYXRvckV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgcHVibGljIGxoczogRXhwcmVzc2lvbjtcbiAgY29uc3RydWN0b3IocHVibGljIG9wZXJhdG9yOiBCaW5hcnlPcGVyYXRvciwgbGhzOiBFeHByZXNzaW9uLCBwdWJsaWMgcmhzOiBFeHByZXNzaW9uLFxuICAgICAgICAgICAgICB0eXBlOiBUeXBlID0gbnVsbCkge1xuICAgIHN1cGVyKGlzUHJlc2VudCh0eXBlKSA/IHR5cGUgOiBsaHMudHlwZSk7XG4gICAgdGhpcy5saHMgPSBsaHM7XG4gIH1cbiAgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QmluYXJ5T3BlcmF0b3JFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFJlYWRQcm9wRXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVjZWl2ZXI6IEV4cHJlc3Npb24sIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHR5cGU6IFR5cGUgPSBudWxsKSB7IHN1cGVyKHR5cGUpOyB9XG4gIHZpc2l0RXhwcmVzc2lvbih2aXNpdG9yOiBFeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFJlYWRQcm9wRXhwcih0aGlzLCBjb250ZXh0KTtcbiAgfVxuICBzZXQodmFsdWU6IEV4cHJlc3Npb24pOiBXcml0ZVByb3BFeHByIHtcbiAgICByZXR1cm4gbmV3IFdyaXRlUHJvcEV4cHIodGhpcy5yZWNlaXZlciwgdGhpcy5uYW1lLCB2YWx1ZSk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgUmVhZEtleUV4cHIgZXh0ZW5kcyBFeHByZXNzaW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlY2VpdmVyOiBFeHByZXNzaW9uLCBwdWJsaWMgaW5kZXg6IEV4cHJlc3Npb24sIHR5cGU6IFR5cGUgPSBudWxsKSB7XG4gICAgc3VwZXIodHlwZSk7XG4gIH1cbiAgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UmVhZEtleUV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cbiAgc2V0KHZhbHVlOiBFeHByZXNzaW9uKTogV3JpdGVLZXlFeHByIHtcbiAgICByZXR1cm4gbmV3IFdyaXRlS2V5RXhwcih0aGlzLnJlY2VpdmVyLCB0aGlzLmluZGV4LCB2YWx1ZSk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgTGl0ZXJhbEFycmF5RXhwciBleHRlbmRzIEV4cHJlc3Npb24ge1xuICBwdWJsaWMgZW50cmllczogRXhwcmVzc2lvbltdO1xuICBjb25zdHJ1Y3RvcihlbnRyaWVzOiBFeHByZXNzaW9uW10sIHR5cGU6IFR5cGUgPSBudWxsKSB7XG4gICAgc3VwZXIodHlwZSk7XG4gICAgdGhpcy5lbnRyaWVzID0gZW50cmllcztcbiAgfVxuICB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogRXhwcmVzc2lvblZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRMaXRlcmFsQXJyYXlFeHByKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIExpdGVyYWxNYXBFeHByIGV4dGVuZHMgRXhwcmVzc2lvbiB7XG4gIHB1YmxpYyB2YWx1ZVR5cGU6IFR5cGUgPSBudWxsO1xuICA7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbnRyaWVzOiBBcnJheTxBcnJheTxzdHJpbmcgfCBFeHByZXNzaW9uPj4sIHR5cGU6IE1hcFR5cGUgPSBudWxsKSB7XG4gICAgc3VwZXIodHlwZSk7XG4gICAgaWYgKGlzUHJlc2VudCh0eXBlKSkge1xuICAgICAgdGhpcy52YWx1ZVR5cGUgPSB0eXBlLnZhbHVlVHlwZTtcbiAgICB9XG4gIH1cbiAgdmlzaXRFeHByZXNzaW9uKHZpc2l0b3I6IEV4cHJlc3Npb25WaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0TGl0ZXJhbE1hcEV4cHIodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFeHByZXNzaW9uVmlzaXRvciB7XG4gIHZpc2l0UmVhZFZhckV4cHIoYXN0OiBSZWFkVmFyRXhwciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFdyaXRlVmFyRXhwcihleHByOiBXcml0ZVZhckV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRXcml0ZUtleUV4cHIoZXhwcjogV3JpdGVLZXlFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0V3JpdGVQcm9wRXhwcihleHByOiBXcml0ZVByb3BFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0SW52b2tlTWV0aG9kRXhwcihhc3Q6IEludm9rZU1ldGhvZEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRJbnZva2VGdW5jdGlvbkV4cHIoYXN0OiBJbnZva2VGdW5jdGlvbkV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRJbnN0YW50aWF0ZUV4cHIoYXN0OiBJbnN0YW50aWF0ZUV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRMaXRlcmFsRXhwcihhc3Q6IExpdGVyYWxFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RXh0ZXJuYWxFeHByKGFzdDogRXh0ZXJuYWxFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0Q29uZGl0aW9uYWxFeHByKGFzdDogQ29uZGl0aW9uYWxFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0Tm90RXhwcihhc3Q6IE5vdEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRDYXN0RXhwcihhc3Q6IENhc3RFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RnVuY3Rpb25FeHByKGFzdDogRnVuY3Rpb25FeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QmluYXJ5T3BlcmF0b3JFeHByKGFzdDogQmluYXJ5T3BlcmF0b3JFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UmVhZFByb3BFeHByKGFzdDogUmVhZFByb3BFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UmVhZEtleUV4cHIoYXN0OiBSZWFkS2V5RXhwciwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdExpdGVyYWxBcnJheUV4cHIoYXN0OiBMaXRlcmFsQXJyYXlFeHByLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0TGl0ZXJhbE1hcEV4cHIoYXN0OiBMaXRlcmFsTWFwRXhwciwgY29udGV4dDogYW55KTogYW55O1xufVxuXG5leHBvcnQgdmFyIFRISVNfRVhQUiA9IG5ldyBSZWFkVmFyRXhwcihCdWlsdGluVmFyLlRoaXMpO1xuZXhwb3J0IHZhciBTVVBFUl9FWFBSID0gbmV3IFJlYWRWYXJFeHByKEJ1aWx0aW5WYXIuU3VwZXIpO1xuZXhwb3J0IHZhciBDQVRDSF9FUlJPUl9WQVIgPSBuZXcgUmVhZFZhckV4cHIoQnVpbHRpblZhci5DYXRjaEVycm9yKTtcbmV4cG9ydCB2YXIgQ0FUQ0hfU1RBQ0tfVkFSID0gbmV3IFJlYWRWYXJFeHByKEJ1aWx0aW5WYXIuQ2F0Y2hTdGFjayk7XG5leHBvcnQgdmFyIE5VTExfRVhQUiA9IG5ldyBMaXRlcmFsRXhwcihudWxsLCBudWxsKTtcblxuLy8vLyBTdGF0ZW1lbnRzXG5leHBvcnQgZW51bSBTdG10TW9kaWZpZXIge1xuICBGaW5hbCxcbiAgUHJpdmF0ZVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhdGVtZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIG1vZGlmaWVyczogU3RtdE1vZGlmaWVyW10gPSBudWxsKSB7XG4gICAgaWYgKGlzQmxhbmsobW9kaWZpZXJzKSkge1xuICAgICAgdGhpcy5tb2RpZmllcnMgPSBbXTtcbiAgICB9XG4gIH1cblxuICBhYnN0cmFjdCB2aXNpdFN0YXRlbWVudCh2aXNpdG9yOiBTdGF0ZW1lbnRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnk7XG5cbiAgaGFzTW9kaWZpZXIobW9kaWZpZXI6IFN0bXRNb2RpZmllcik6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5tb2RpZmllcnMuaW5kZXhPZihtb2RpZmllcikgIT09IC0xOyB9XG59XG5cblxuZXhwb3J0IGNsYXNzIERlY2xhcmVWYXJTdG10IGV4dGVuZHMgU3RhdGVtZW50IHtcbiAgcHVibGljIHR5cGU6IFR5cGU7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogRXhwcmVzc2lvbiwgdHlwZTogVHlwZSA9IG51bGwsXG4gICAgICAgICAgICAgIG1vZGlmaWVyczogU3RtdE1vZGlmaWVyW10gPSBudWxsKSB7XG4gICAgc3VwZXIobW9kaWZpZXJzKTtcbiAgICB0aGlzLnR5cGUgPSBpc1ByZXNlbnQodHlwZSkgPyB0eXBlIDogdmFsdWUudHlwZTtcbiAgfVxuXG4gIHZpc2l0U3RhdGVtZW50KHZpc2l0b3I6IFN0YXRlbWVudFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXREZWNsYXJlVmFyU3RtdCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVjbGFyZUZ1bmN0aW9uU3RtdCBleHRlbmRzIFN0YXRlbWVudCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBwYXJhbXM6IEZuUGFyYW1bXSwgcHVibGljIHN0YXRlbWVudHM6IFN0YXRlbWVudFtdLFxuICAgICAgICAgICAgICBwdWJsaWMgdHlwZTogVHlwZSA9IG51bGwsIG1vZGlmaWVyczogU3RtdE1vZGlmaWVyW10gPSBudWxsKSB7XG4gICAgc3VwZXIobW9kaWZpZXJzKTtcbiAgfVxuXG4gIHZpc2l0U3RhdGVtZW50KHZpc2l0b3I6IFN0YXRlbWVudFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXREZWNsYXJlRnVuY3Rpb25TdG10KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFeHByZXNzaW9uU3RhdGVtZW50IGV4dGVuZHMgU3RhdGVtZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIGV4cHI6IEV4cHJlc3Npb24pIHsgc3VwZXIoKTsgfVxuXG4gIHZpc2l0U3RhdGVtZW50KHZpc2l0b3I6IFN0YXRlbWVudFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRFeHByZXNzaW9uU3RtdCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBSZXR1cm5TdGF0ZW1lbnQgZXh0ZW5kcyBTdGF0ZW1lbnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IEV4cHJlc3Npb24pIHsgc3VwZXIoKTsgfVxuICB2aXNpdFN0YXRlbWVudCh2aXNpdG9yOiBTdGF0ZW1lbnRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UmV0dXJuU3RtdCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWJzdHJhY3RDbGFzc1BhcnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdHlwZTogVHlwZSA9IG51bGwsIHB1YmxpYyBtb2RpZmllcnM6IFN0bXRNb2RpZmllcltdKSB7XG4gICAgaWYgKGlzQmxhbmsobW9kaWZpZXJzKSkge1xuICAgICAgdGhpcy5tb2RpZmllcnMgPSBbXTtcbiAgICB9XG4gIH1cbiAgaGFzTW9kaWZpZXIobW9kaWZpZXI6IFN0bXRNb2RpZmllcik6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5tb2RpZmllcnMuaW5kZXhPZihtb2RpZmllcikgIT09IC0xOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBDbGFzc0ZpZWxkIGV4dGVuZHMgQWJzdHJhY3RDbGFzc1BhcnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCB0eXBlOiBUeXBlID0gbnVsbCwgbW9kaWZpZXJzOiBTdG10TW9kaWZpZXJbXSA9IG51bGwpIHtcbiAgICBzdXBlcih0eXBlLCBtb2RpZmllcnMpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIENsYXNzTWV0aG9kIGV4dGVuZHMgQWJzdHJhY3RDbGFzc1BhcnQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgcGFyYW1zOiBGblBhcmFtW10sIHB1YmxpYyBib2R5OiBTdGF0ZW1lbnRbXSxcbiAgICAgICAgICAgICAgdHlwZTogVHlwZSA9IG51bGwsIG1vZGlmaWVyczogU3RtdE1vZGlmaWVyW10gPSBudWxsKSB7XG4gICAgc3VwZXIodHlwZSwgbW9kaWZpZXJzKTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBDbGFzc0dldHRlciBleHRlbmRzIEFic3RyYWN0Q2xhc3NQYXJ0IHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGJvZHk6IFN0YXRlbWVudFtdLCB0eXBlOiBUeXBlID0gbnVsbCxcbiAgICAgICAgICAgICAgbW9kaWZpZXJzOiBTdG10TW9kaWZpZXJbXSA9IG51bGwpIHtcbiAgICBzdXBlcih0eXBlLCBtb2RpZmllcnMpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIENsYXNzU3RtdCBleHRlbmRzIFN0YXRlbWVudCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBwYXJlbnQ6IEV4cHJlc3Npb24sIHB1YmxpYyBmaWVsZHM6IENsYXNzRmllbGRbXSxcbiAgICAgICAgICAgICAgcHVibGljIGdldHRlcnM6IENsYXNzR2V0dGVyW10sIHB1YmxpYyBjb25zdHJ1Y3Rvck1ldGhvZDogQ2xhc3NNZXRob2QsXG4gICAgICAgICAgICAgIHB1YmxpYyBtZXRob2RzOiBDbGFzc01ldGhvZFtdLCBtb2RpZmllcnM6IFN0bXRNb2RpZmllcltdID0gbnVsbCkge1xuICAgIHN1cGVyKG1vZGlmaWVycyk7XG4gIH1cbiAgdmlzaXRTdGF0ZW1lbnQodmlzaXRvcjogU3RhdGVtZW50VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdERlY2xhcmVDbGFzc1N0bXQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgSWZTdG10IGV4dGVuZHMgU3RhdGVtZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbmRpdGlvbjogRXhwcmVzc2lvbiwgcHVibGljIHRydWVDYXNlOiBTdGF0ZW1lbnRbXSxcbiAgICAgICAgICAgICAgcHVibGljIGZhbHNlQ2FzZTogU3RhdGVtZW50W10gPSAvKkB0czJkYXJ0X2NvbnN0Ki9bXSkge1xuICAgIHN1cGVyKCk7XG4gIH1cbiAgdmlzaXRTdGF0ZW1lbnQodmlzaXRvcjogU3RhdGVtZW50VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdElmU3RtdCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBDb21tZW50U3RtdCBleHRlbmRzIFN0YXRlbWVudCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb21tZW50OiBzdHJpbmcpIHsgc3VwZXIoKTsgfVxuICB2aXNpdFN0YXRlbWVudCh2aXNpdG9yOiBTdGF0ZW1lbnRWaXNpdG9yLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0Q29tbWVudFN0bXQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgVHJ5Q2F0Y2hTdG10IGV4dGVuZHMgU3RhdGVtZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIGJvZHlTdG10czogU3RhdGVtZW50W10sIHB1YmxpYyBjYXRjaFN0bXRzOiBTdGF0ZW1lbnRbXSkgeyBzdXBlcigpOyB9XG4gIHZpc2l0U3RhdGVtZW50KHZpc2l0b3I6IFN0YXRlbWVudFZpc2l0b3IsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUcnlDYXRjaFN0bXQodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgVGhyb3dTdG10IGV4dGVuZHMgU3RhdGVtZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIGVycm9yOiBFeHByZXNzaW9uKSB7IHN1cGVyKCk7IH1cbiAgdmlzaXRTdGF0ZW1lbnQodmlzaXRvcjogU3RhdGVtZW50VmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFRocm93U3RtdCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRlbWVudFZpc2l0b3Ige1xuICB2aXNpdERlY2xhcmVWYXJTdG10KHN0bXQ6IERlY2xhcmVWYXJTdG10LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RGVjbGFyZUZ1bmN0aW9uU3RtdChzdG10OiBEZWNsYXJlRnVuY3Rpb25TdG10LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RXhwcmVzc2lvblN0bXQoc3RtdDogRXhwcmVzc2lvblN0YXRlbWVudCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFJldHVyblN0bXQoc3RtdDogUmV0dXJuU3RhdGVtZW50LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0RGVjbGFyZUNsYXNzU3RtdChzdG10OiBDbGFzc1N0bXQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRJZlN0bXQoc3RtdDogSWZTdG10LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0VHJ5Q2F0Y2hTdG10KHN0bXQ6IFRyeUNhdGNoU3RtdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFRocm93U3RtdChzdG10OiBUaHJvd1N0bXQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRDb21tZW50U3RtdChzdG10OiBDb21tZW50U3RtdCwgY29udGV4dDogYW55KTogYW55O1xufVxuXG5leHBvcnQgY2xhc3MgRXhwcmVzc2lvblRyYW5zZm9ybWVyIGltcGxlbWVudHMgU3RhdGVtZW50VmlzaXRvciwgRXhwcmVzc2lvblZpc2l0b3Ige1xuICB2aXNpdFJlYWRWYXJFeHByKGFzdDogUmVhZFZhckV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cbiAgdmlzaXRXcml0ZVZhckV4cHIoZXhwcjogV3JpdGVWYXJFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgV3JpdGVWYXJFeHByKGV4cHIubmFtZSwgZXhwci52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpO1xuICB9XG4gIHZpc2l0V3JpdGVLZXlFeHByKGV4cHI6IFdyaXRlS2V5RXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IFdyaXRlS2V5RXhwcihleHByLnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHByLmluZGV4LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHByLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSk7XG4gIH1cbiAgdmlzaXRXcml0ZVByb3BFeHByKGV4cHI6IFdyaXRlUHJvcEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBXcml0ZVByb3BFeHByKGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLCBleHByLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuICB2aXNpdEludm9rZU1ldGhvZEV4cHIoYXN0OiBJbnZva2VNZXRob2RFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHZhciBtZXRob2QgPSBpc1ByZXNlbnQoYXN0LmJ1aWx0aW4pID8gYXN0LmJ1aWx0aW4gOiBhc3QubmFtZTtcbiAgICByZXR1cm4gbmV3IEludm9rZU1ldGhvZEV4cHIoYXN0LnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSwgbWV0aG9kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LmFyZ3MsIGNvbnRleHQpLCBhc3QudHlwZSk7XG4gIH1cbiAgdmlzaXRJbnZva2VGdW5jdGlvbkV4cHIoYXN0OiBJbnZva2VGdW5jdGlvbkV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBJbnZva2VGdW5jdGlvbkV4cHIoYXN0LmZuLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoYXN0LmFyZ3MsIGNvbnRleHQpLCBhc3QudHlwZSk7XG4gIH1cbiAgdmlzaXRJbnN0YW50aWF0ZUV4cHIoYXN0OiBJbnN0YW50aWF0ZUV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBJbnN0YW50aWF0ZUV4cHIoYXN0LmNsYXNzRXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpdEFsbEV4cHJlc3Npb25zKGFzdC5hcmdzLCBjb250ZXh0KSwgYXN0LnR5cGUpO1xuICB9XG4gIHZpc2l0TGl0ZXJhbEV4cHIoYXN0OiBMaXRlcmFsRXhwciwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuICB2aXNpdEV4dGVybmFsRXhwcihhc3Q6IEV4dGVybmFsRXhwciwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIGFzdDsgfVxuICB2aXNpdENvbmRpdGlvbmFsRXhwcihhc3Q6IENvbmRpdGlvbmFsRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IENvbmRpdGlvbmFsRXhwcihhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QudHJ1ZUNhc2UudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC5mYWxzZUNhc2UudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuICB2aXNpdE5vdEV4cHIoYXN0OiBOb3RFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgTm90RXhwcihhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSk7XG4gIH1cbiAgdmlzaXRDYXN0RXhwcihhc3Q6IENhc3RFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgQ2FzdEV4cHIoYXN0LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSwgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRGdW5jdGlvbkV4cHIoYXN0OiBGdW5jdGlvbkV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgLy8gRG9uJ3QgZGVzY2VuZCBpbnRvIG5lc3RlZCBmdW5jdGlvbnNcbiAgICByZXR1cm4gYXN0O1xuICB9XG4gIHZpc2l0QmluYXJ5T3BlcmF0b3JFeHByKGFzdDogQmluYXJ5T3BlcmF0b3JFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BlcmF0b3JFeHByKGFzdC5vcGVyYXRvciwgYXN0Lmxocy52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LnJocy52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksIGFzdC50eXBlKTtcbiAgfVxuICB2aXNpdFJlYWRQcm9wRXhwcihhc3Q6IFJlYWRQcm9wRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IFJlYWRQcm9wRXhwcihhc3QucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLCBhc3QubmFtZSwgYXN0LnR5cGUpO1xuICB9XG4gIHZpc2l0UmVhZEtleUV4cHIoYXN0OiBSZWFkS2V5RXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IFJlYWRLZXlFeHByKGFzdC5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QuaW5kZXgudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLCBhc3QudHlwZSk7XG4gIH1cbiAgdmlzaXRMaXRlcmFsQXJyYXlFeHByKGFzdDogTGl0ZXJhbEFycmF5RXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IExpdGVyYWxBcnJheUV4cHIodGhpcy52aXNpdEFsbEV4cHJlc3Npb25zKGFzdC5lbnRyaWVzLCBjb250ZXh0KSk7XG4gIH1cbiAgdmlzaXRMaXRlcmFsTWFwRXhwcihhc3Q6IExpdGVyYWxNYXBFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgTGl0ZXJhbE1hcEV4cHIoYXN0LmVudHJpZXMubWFwKFxuICAgICAgICAoZW50cnkpID0+IFtlbnRyeVswXSwgKDxFeHByZXNzaW9uPmVudHJ5WzFdKS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCldKSk7XG4gIH1cbiAgdmlzaXRBbGxFeHByZXNzaW9ucyhleHByczogRXhwcmVzc2lvbltdLCBjb250ZXh0OiBhbnkpOiBFeHByZXNzaW9uW10ge1xuICAgIHJldHVybiBleHBycy5tYXAoZXhwciA9PiBleHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSk7XG4gIH1cblxuICB2aXNpdERlY2xhcmVWYXJTdG10KHN0bXQ6IERlY2xhcmVWYXJTdG10LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgRGVjbGFyZVZhclN0bXQoc3RtdC5uYW1lLCBzdG10LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSwgc3RtdC50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RtdC5tb2RpZmllcnMpO1xuICB9XG4gIHZpc2l0RGVjbGFyZUZ1bmN0aW9uU3RtdChzdG10OiBEZWNsYXJlRnVuY3Rpb25TdG10LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIC8vIERvbid0IGRlc2NlbmQgaW50byBuZXN0ZWQgZnVuY3Rpb25zXG4gICAgcmV0dXJuIHN0bXQ7XG4gIH1cbiAgdmlzaXRFeHByZXNzaW9uU3RtdChzdG10OiBFeHByZXNzaW9uU3RhdGVtZW50LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgRXhwcmVzc2lvblN0YXRlbWVudChzdG10LmV4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuICB2aXNpdFJldHVyblN0bXQoc3RtdDogUmV0dXJuU3RhdGVtZW50LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgUmV0dXJuU3RhdGVtZW50KHN0bXQudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuICB2aXNpdERlY2xhcmVDbGFzc1N0bXQoc3RtdDogQ2xhc3NTdG10LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIC8vIERvbid0IGRlc2NlbmQgaW50byBuZXN0ZWQgZnVuY3Rpb25zXG4gICAgcmV0dXJuIHN0bXQ7XG4gIH1cbiAgdmlzaXRJZlN0bXQoc3RtdDogSWZTdG10LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgSWZTdG10KHN0bXQuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LnRydWVDYXNlLCBjb250ZXh0KSxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LmZhbHNlQ2FzZSwgY29udGV4dCkpO1xuICB9XG4gIHZpc2l0VHJ5Q2F0Y2hTdG10KHN0bXQ6IFRyeUNhdGNoU3RtdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gbmV3IFRyeUNhdGNoU3RtdCh0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LmJvZHlTdG10cywgY29udGV4dCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoc3RtdC5jYXRjaFN0bXRzLCBjb250ZXh0KSk7XG4gIH1cbiAgdmlzaXRUaHJvd1N0bXQoc3RtdDogVGhyb3dTdG10LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBuZXcgVGhyb3dTdG10KHN0bXQuZXJyb3IudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuICB2aXNpdENvbW1lbnRTdG10KHN0bXQ6IENvbW1lbnRTdG10LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gc3RtdDsgfVxuICB2aXNpdEFsbFN0YXRlbWVudHMoc3RtdHM6IFN0YXRlbWVudFtdLCBjb250ZXh0OiBhbnkpOiBTdGF0ZW1lbnRbXSB7XG4gICAgcmV0dXJuIHN0bXRzLm1hcChzdG10ID0+IHN0bXQudmlzaXRTdGF0ZW1lbnQodGhpcywgY29udGV4dCkpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFJlY3Vyc2l2ZUV4cHJlc3Npb25WaXNpdG9yIGltcGxlbWVudHMgU3RhdGVtZW50VmlzaXRvciwgRXhwcmVzc2lvblZpc2l0b3Ige1xuICB2aXNpdFJlYWRWYXJFeHByKGFzdDogUmVhZFZhckV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cbiAgdmlzaXRXcml0ZVZhckV4cHIoZXhwcjogV3JpdGVWYXJFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiBleHByO1xuICB9XG4gIHZpc2l0V3JpdGVLZXlFeHByKGV4cHI6IFdyaXRlS2V5RXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBleHByLnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICBleHByLmluZGV4LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICBleHByLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICB2aXNpdFdyaXRlUHJvcEV4cHIoZXhwcjogV3JpdGVQcm9wRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBleHByLnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICBleHByLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICB2aXNpdEludm9rZU1ldGhvZEV4cHIoYXN0OiBJbnZva2VNZXRob2RFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdEFsbEV4cHJlc3Npb25zKGFzdC5hcmdzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gYXN0O1xuICB9XG4gIHZpc2l0SW52b2tlRnVuY3Rpb25FeHByKGFzdDogSW52b2tlRnVuY3Rpb25FeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5mbi52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdEFsbEV4cHJlc3Npb25zKGFzdC5hcmdzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gYXN0O1xuICB9XG4gIHZpc2l0SW5zdGFudGlhdGVFeHByKGFzdDogSW5zdGFudGlhdGVFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5jbGFzc0V4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhhc3QuYXJncywgY29udGV4dCk7XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuICB2aXNpdExpdGVyYWxFeHByKGFzdDogTGl0ZXJhbEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cbiAgdmlzaXRFeHRlcm5hbEV4cHIoYXN0OiBFeHRlcm5hbEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBhc3Q7IH1cbiAgdmlzaXRDb25kaXRpb25hbEV4cHIoYXN0OiBDb25kaXRpb25hbEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgYXN0LnRydWVDYXNlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICBhc3QuZmFsc2VDYXNlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gYXN0O1xuICB9XG4gIHZpc2l0Tm90RXhwcihhc3Q6IE5vdEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuICB2aXNpdENhc3RFeHByKGFzdDogQ2FzdEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gYXN0O1xuICB9XG4gIHZpc2l0RnVuY3Rpb25FeHByKGFzdDogRnVuY3Rpb25FeHByLCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gYXN0OyB9XG4gIHZpc2l0QmluYXJ5T3BlcmF0b3JFeHByKGFzdDogQmluYXJ5T3BlcmF0b3JFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGFzdC5saHMudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIGFzdC5yaHMudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiBhc3Q7XG4gIH1cbiAgdmlzaXRSZWFkUHJvcEV4cHIoYXN0OiBSZWFkUHJvcEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gYXN0O1xuICB9XG4gIHZpc2l0UmVhZEtleUV4cHIoYXN0OiBSZWFkS2V5RXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBhc3QucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIGFzdC5pbmRleC52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuICB2aXNpdExpdGVyYWxBcnJheUV4cHIoYXN0OiBMaXRlcmFsQXJyYXlFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhhc3QuZW50cmllcywgY29udGV4dCk7XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuICB2aXNpdExpdGVyYWxNYXBFeHByKGFzdDogTGl0ZXJhbE1hcEV4cHIsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgYXN0LmVudHJpZXMuZm9yRWFjaCgoZW50cnkpID0+ICg8RXhwcmVzc2lvbj5lbnRyeVsxXSkudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgICByZXR1cm4gYXN0O1xuICB9XG4gIHZpc2l0QWxsRXhwcmVzc2lvbnMoZXhwcnM6IEV4cHJlc3Npb25bXSwgY29udGV4dDogYW55KTogdm9pZCB7XG4gICAgZXhwcnMuZm9yRWFjaChleHByID0+IGV4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuXG4gIHZpc2l0RGVjbGFyZVZhclN0bXQoc3RtdDogRGVjbGFyZVZhclN0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgc3RtdC52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCk7XG4gICAgcmV0dXJuIHN0bXQ7XG4gIH1cbiAgdmlzaXREZWNsYXJlRnVuY3Rpb25TdG10KHN0bXQ6IERlY2xhcmVGdW5jdGlvblN0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgLy8gRG9uJ3QgZGVzY2VuZCBpbnRvIG5lc3RlZCBmdW5jdGlvbnNcbiAgICByZXR1cm4gc3RtdDtcbiAgfVxuICB2aXNpdEV4cHJlc3Npb25TdG10KHN0bXQ6IEV4cHJlc3Npb25TdGF0ZW1lbnQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgc3RtdC5leHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gc3RtdDtcbiAgfVxuICB2aXNpdFJldHVyblN0bXQoc3RtdDogUmV0dXJuU3RhdGVtZW50LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHN0bXQudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiBzdG10O1xuICB9XG4gIHZpc2l0RGVjbGFyZUNsYXNzU3RtdChzdG10OiBDbGFzc1N0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgLy8gRG9uJ3QgZGVzY2VuZCBpbnRvIG5lc3RlZCBmdW5jdGlvbnNcbiAgICByZXR1cm4gc3RtdDtcbiAgfVxuICB2aXNpdElmU3RtdChzdG10OiBJZlN0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgc3RtdC5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQudHJ1ZUNhc2UsIGNvbnRleHQpO1xuICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQuZmFsc2VDYXNlLCBjb250ZXh0KTtcbiAgICByZXR1cm4gc3RtdDtcbiAgfVxuICB2aXNpdFRyeUNhdGNoU3RtdChzdG10OiBUcnlDYXRjaFN0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoc3RtdC5ib2R5U3RtdHMsIGNvbnRleHQpO1xuICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQuY2F0Y2hTdG10cywgY29udGV4dCk7XG4gICAgcmV0dXJuIHN0bXQ7XG4gIH1cbiAgdmlzaXRUaHJvd1N0bXQoc3RtdDogVGhyb3dTdG10LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHN0bXQuZXJyb3IudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiBzdG10O1xuICB9XG4gIHZpc2l0Q29tbWVudFN0bXQoc3RtdDogQ29tbWVudFN0bXQsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBzdG10OyB9XG4gIHZpc2l0QWxsU3RhdGVtZW50cyhzdG10czogU3RhdGVtZW50W10sIGNvbnRleHQ6IGFueSk6IHZvaWQge1xuICAgIHN0bXRzLmZvckVhY2goc3RtdCA9PiBzdG10LnZpc2l0U3RhdGVtZW50KHRoaXMsIGNvbnRleHQpKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZVZhckluRXhwcmVzc2lvbih2YXJOYW1lOiBzdHJpbmcsIG5ld1ZhbHVlOiBFeHByZXNzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbjogRXhwcmVzc2lvbik6IEV4cHJlc3Npb24ge1xuICB2YXIgdHJhbnNmb3JtZXIgPSBuZXcgX1JlcGxhY2VWYXJpYWJsZVRyYW5zZm9ybWVyKHZhck5hbWUsIG5ld1ZhbHVlKTtcbiAgcmV0dXJuIGV4cHJlc3Npb24udmlzaXRFeHByZXNzaW9uKHRyYW5zZm9ybWVyLCBudWxsKTtcbn1cblxuY2xhc3MgX1JlcGxhY2VWYXJpYWJsZVRyYW5zZm9ybWVyIGV4dGVuZHMgRXhwcmVzc2lvblRyYW5zZm9ybWVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmFyTmFtZTogc3RyaW5nLCBwcml2YXRlIF9uZXdWYWx1ZTogRXhwcmVzc2lvbikgeyBzdXBlcigpOyB9XG4gIHZpc2l0UmVhZFZhckV4cHIoYXN0OiBSZWFkVmFyRXhwciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICByZXR1cm4gYXN0Lm5hbWUgPT0gdGhpcy5fdmFyTmFtZSA/IHRoaXMuX25ld1ZhbHVlIDogYXN0O1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kUmVhZFZhck5hbWVzKHN0bXRzOiBTdGF0ZW1lbnRbXSk6IFNldDxzdHJpbmc+IHtcbiAgdmFyIGZpbmRlciA9IG5ldyBfVmFyaWFibGVGaW5kZXIoKTtcbiAgZmluZGVyLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10cywgbnVsbCk7XG4gIHJldHVybiBmaW5kZXIudmFyTmFtZXM7XG59XG5cbmNsYXNzIF9WYXJpYWJsZUZpbmRlciBleHRlbmRzIFJlY3Vyc2l2ZUV4cHJlc3Npb25WaXNpdG9yIHtcbiAgdmFyTmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgdmlzaXRSZWFkVmFyRXhwcihhc3Q6IFJlYWRWYXJFeHByLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMudmFyTmFtZXMuYWRkKGFzdC5uYW1lKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFyaWFibGUobmFtZTogc3RyaW5nLCB0eXBlOiBUeXBlID0gbnVsbCk6IFJlYWRWYXJFeHByIHtcbiAgcmV0dXJuIG5ldyBSZWFkVmFyRXhwcihuYW1lLCB0eXBlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGltcG9ydEV4cHIoaWQ6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIHR5cGVQYXJhbXM6IFR5cGVbXSA9IG51bGwpOiBFeHRlcm5hbEV4cHIge1xuICByZXR1cm4gbmV3IEV4dGVybmFsRXhwcihpZCwgbnVsbCwgdHlwZVBhcmFtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbXBvcnRUeXBlKGlkOiBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLCB0eXBlUGFyYW1zOiBUeXBlW10gPSBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZU1vZGlmaWVyczogVHlwZU1vZGlmaWVyW10gPSBudWxsKTogRXh0ZXJuYWxUeXBlIHtcbiAgcmV0dXJuIGlzUHJlc2VudChpZCkgPyBuZXcgRXh0ZXJuYWxUeXBlKGlkLCB0eXBlUGFyYW1zLCB0eXBlTW9kaWZpZXJzKSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaXRlcmFsKHZhbHVlOiBhbnksIHR5cGU6IFR5cGUgPSBudWxsKTogTGl0ZXJhbEV4cHIge1xuICByZXR1cm4gbmV3IExpdGVyYWxFeHByKHZhbHVlLCB0eXBlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpdGVyYWxBcnIodmFsdWVzOiBFeHByZXNzaW9uW10sIHR5cGU6IFR5cGUgPSBudWxsKTogTGl0ZXJhbEFycmF5RXhwciB7XG4gIHJldHVybiBuZXcgTGl0ZXJhbEFycmF5RXhwcih2YWx1ZXMsIHR5cGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGl0ZXJhbE1hcCh2YWx1ZXM6IEFycmF5PEFycmF5PHN0cmluZyB8IEV4cHJlc3Npb24+PixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IE1hcFR5cGUgPSBudWxsKTogTGl0ZXJhbE1hcEV4cHIge1xuICByZXR1cm4gbmV3IExpdGVyYWxNYXBFeHByKHZhbHVlcywgdHlwZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3QoZXhwcjogRXhwcmVzc2lvbik6IE5vdEV4cHIge1xuICByZXR1cm4gbmV3IE5vdEV4cHIoZXhwcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbihwYXJhbXM6IEZuUGFyYW1bXSwgYm9keTogU3RhdGVtZW50W10sIHR5cGU6IFR5cGUgPSBudWxsKTogRnVuY3Rpb25FeHByIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbkV4cHIocGFyYW1zLCBib2R5LCB0eXBlKTtcbn1cbiJdfQ==