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
