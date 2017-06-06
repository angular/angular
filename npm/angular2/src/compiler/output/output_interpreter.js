'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var o = require('./output_ast');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var dart_emitter_1 = require('./dart_emitter');
var ts_emitter_1 = require('./ts_emitter');
function interpretStatements(statements, resultVar, instanceFactory) {
    var stmtsWithReturn = statements.concat([new o.ReturnStatement(o.variable(resultVar))]);
    var ctx = new _ExecutionContext(null, null, null, null, new Map(), new Map(), new Map(), new Map(), instanceFactory);
    var visitor = new StatementInterpreter();
    var result = visitor.visitAllStatements(stmtsWithReturn, ctx);
    return lang_1.isPresent(result) ? result.value : null;
}
exports.interpretStatements = interpretStatements;
var DynamicInstance = (function () {
    function DynamicInstance() {
    }
    Object.defineProperty(DynamicInstance.prototype, "props", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicInstance.prototype, "getters", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicInstance.prototype, "methods", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicInstance.prototype, "clazz", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return DynamicInstance;
}());
exports.DynamicInstance = DynamicInstance;
function isDynamicInstance(instance) {
    if (lang_1.IS_DART) {
        return instance instanceof DynamicInstance;
    }
    else {
        return lang_1.isPresent(instance) && lang_1.isPresent(instance.props) && lang_1.isPresent(instance.getters) &&
            lang_1.isPresent(instance.methods);
    }
}
function _executeFunctionStatements(varNames, varValues, statements, ctx, visitor) {
    var childCtx = ctx.createChildWihtLocalVars();
    for (var i = 0; i < varNames.length; i++) {
        childCtx.vars.set(varNames[i], varValues[i]);
    }
    var result = visitor.visitAllStatements(statements, childCtx);
    return lang_1.isPresent(result) ? result.value : null;
}
var _ExecutionContext = (function () {
    function _ExecutionContext(parent, superClass, superInstance, className, vars, props, getters, methods, instanceFactory) {
        this.parent = parent;
        this.superClass = superClass;
        this.superInstance = superInstance;
        this.className = className;
        this.vars = vars;
        this.props = props;
        this.getters = getters;
        this.methods = methods;
        this.instanceFactory = instanceFactory;
    }
    _ExecutionContext.prototype.createChildWihtLocalVars = function () {
        return new _ExecutionContext(this, this.superClass, this.superInstance, this.className, new Map(), this.props, this.getters, this.methods, this.instanceFactory);
    };
    return _ExecutionContext;
}());
var ReturnValue = (function () {
    function ReturnValue(value) {
        this.value = value;
    }
    return ReturnValue;
}());
var _DynamicClass = (function () {
    function _DynamicClass(_classStmt, _ctx, _visitor) {
        this._classStmt = _classStmt;
        this._ctx = _ctx;
        this._visitor = _visitor;
    }
    _DynamicClass.prototype.instantiate = function (args) {
        var _this = this;
        var props = new Map();
        var getters = new Map();
        var methods = new Map();
        var superClass = this._classStmt.parent.visitExpression(this._visitor, this._ctx);
        var instanceCtx = new _ExecutionContext(this._ctx, superClass, null, this._classStmt.name, this._ctx.vars, props, getters, methods, this._ctx.instanceFactory);
        this._classStmt.fields.forEach(function (field) { props.set(field.name, null); });
        this._classStmt.getters.forEach(function (getter) {
            getters.set(getter.name, function () { return _executeFunctionStatements([], [], getter.body, instanceCtx, _this._visitor); });
        });
        this._classStmt.methods.forEach(function (method) {
            var paramNames = method.params.map(function (param) { return param.name; });
            methods.set(method.name, _declareFn(paramNames, method.body, instanceCtx, _this._visitor));
        });
        var ctorParamNames = this._classStmt.constructorMethod.params.map(function (param) { return param.name; });
        _executeFunctionStatements(ctorParamNames, args, this._classStmt.constructorMethod.body, instanceCtx, this._visitor);
        return instanceCtx.superInstance;
    };
    _DynamicClass.prototype.debugAst = function () { return this._visitor.debugAst(this._classStmt); };
    return _DynamicClass;
}());
var StatementInterpreter = (function () {
    function StatementInterpreter() {
    }
    StatementInterpreter.prototype.debugAst = function (ast) {
        return lang_1.IS_DART ? dart_emitter_1.debugOutputAstAsDart(ast) : ts_emitter_1.debugOutputAstAsTypeScript(ast);
    };
    StatementInterpreter.prototype.visitDeclareVarStmt = function (stmt, ctx) {
        ctx.vars.set(stmt.name, stmt.value.visitExpression(this, ctx));
        return null;
    };
    StatementInterpreter.prototype.visitWriteVarExpr = function (expr, ctx) {
        var value = expr.value.visitExpression(this, ctx);
        var currCtx = ctx;
        while (currCtx != null) {
            if (currCtx.vars.has(expr.name)) {
                currCtx.vars.set(expr.name, value);
                return value;
            }
            currCtx = currCtx.parent;
        }
        throw new exceptions_1.BaseException("Not declared variable " + expr.name);
    };
    StatementInterpreter.prototype.visitReadVarExpr = function (ast, ctx) {
        var varName = ast.name;
        if (lang_1.isPresent(ast.builtin)) {
            switch (ast.builtin) {
                case o.BuiltinVar.Super:
                case o.BuiltinVar.This:
                    return ctx.superInstance;
                case o.BuiltinVar.CatchError:
                    varName = CATCH_ERROR_VAR;
                    break;
                case o.BuiltinVar.CatchStack:
                    varName = CATCH_STACK_VAR;
                    break;
                default:
                    throw new exceptions_1.BaseException("Unknown builtin variable " + ast.builtin);
            }
        }
        var currCtx = ctx;
        while (currCtx != null) {
            if (currCtx.vars.has(varName)) {
                return currCtx.vars.get(varName);
            }
            currCtx = currCtx.parent;
        }
        throw new exceptions_1.BaseException("Not declared variable " + varName);
    };
    StatementInterpreter.prototype.visitWriteKeyExpr = function (expr, ctx) {
        var receiver = expr.receiver.visitExpression(this, ctx);
        var index = expr.index.visitExpression(this, ctx);
        var value = expr.value.visitExpression(this, ctx);
        receiver[index] = value;
        return value;
    };
    StatementInterpreter.prototype.visitWritePropExpr = function (expr, ctx) {
        var receiver = expr.receiver.visitExpression(this, ctx);
        var value = expr.value.visitExpression(this, ctx);
        if (isDynamicInstance(receiver)) {
            var di = receiver;
            if (di.props.has(expr.name)) {
                di.props.set(expr.name, value);
            }
            else {
                reflection_1.reflector.setter(expr.name)(receiver, value);
            }
        }
        else {
            reflection_1.reflector.setter(expr.name)(receiver, value);
        }
        return value;
    };
    StatementInterpreter.prototype.visitInvokeMethodExpr = function (expr, ctx) {
        var receiver = expr.receiver.visitExpression(this, ctx);
        var args = this.visitAllExpressions(expr.args, ctx);
        var result;
        if (lang_1.isPresent(expr.builtin)) {
            switch (expr.builtin) {
                case o.BuiltinMethod.ConcatArray:
                    result = collection_1.ListWrapper.concat(receiver, args[0]);
                    break;
                case o.BuiltinMethod.SubscribeObservable:
                    result = async_1.ObservableWrapper.subscribe(receiver, args[0]);
                    break;
                case o.BuiltinMethod.bind:
                    if (lang_1.IS_DART) {
                        result = receiver;
                    }
                    else {
                        result = receiver.bind(args[0]);
                    }
                    break;
                default:
                    throw new exceptions_1.BaseException("Unknown builtin method " + expr.builtin);
            }
        }
        else if (isDynamicInstance(receiver)) {
            var di = receiver;
            if (di.methods.has(expr.name)) {
                result = lang_1.FunctionWrapper.apply(di.methods.get(expr.name), args);
            }
            else {
                result = reflection_1.reflector.method(expr.name)(receiver, args);
            }
        }
        else {
            result = reflection_1.reflector.method(expr.name)(receiver, args);
        }
        return result;
    };
    StatementInterpreter.prototype.visitInvokeFunctionExpr = function (stmt, ctx) {
        var args = this.visitAllExpressions(stmt.args, ctx);
        var fnExpr = stmt.fn;
        if (fnExpr instanceof o.ReadVarExpr && fnExpr.builtin === o.BuiltinVar.Super) {
            ctx.superInstance = ctx.instanceFactory.createInstance(ctx.superClass, ctx.className, args, ctx.props, ctx.getters, ctx.methods);
            ctx.parent.superInstance = ctx.superInstance;
            return null;
        }
        else {
            var fn = stmt.fn.visitExpression(this, ctx);
            return lang_1.FunctionWrapper.apply(fn, args);
        }
    };
    StatementInterpreter.prototype.visitReturnStmt = function (stmt, ctx) {
        return new ReturnValue(stmt.value.visitExpression(this, ctx));
    };
    StatementInterpreter.prototype.visitDeclareClassStmt = function (stmt, ctx) {
        var clazz = new _DynamicClass(stmt, ctx, this);
        ctx.vars.set(stmt.name, clazz);
        return null;
    };
    StatementInterpreter.prototype.visitExpressionStmt = function (stmt, ctx) {
        return stmt.expr.visitExpression(this, ctx);
    };
    StatementInterpreter.prototype.visitIfStmt = function (stmt, ctx) {
        var condition = stmt.condition.visitExpression(this, ctx);
        if (condition) {
            return this.visitAllStatements(stmt.trueCase, ctx);
        }
        else if (lang_1.isPresent(stmt.falseCase)) {
            return this.visitAllStatements(stmt.falseCase, ctx);
        }
        return null;
    };
    StatementInterpreter.prototype.visitTryCatchStmt = function (stmt, ctx) {
        try {
            return this.visitAllStatements(stmt.bodyStmts, ctx);
        }
        catch (e) {
            var childCtx = ctx.createChildWihtLocalVars();
            childCtx.vars.set(CATCH_ERROR_VAR, e);
            childCtx.vars.set(CATCH_STACK_VAR, e.stack);
            return this.visitAllStatements(stmt.catchStmts, childCtx);
        }
    };
    StatementInterpreter.prototype.visitThrowStmt = function (stmt, ctx) {
        throw stmt.error.visitExpression(this, ctx);
    };
    StatementInterpreter.prototype.visitCommentStmt = function (stmt, context) { return null; };
    StatementInterpreter.prototype.visitInstantiateExpr = function (ast, ctx) {
        var args = this.visitAllExpressions(ast.args, ctx);
        var clazz = ast.classExpr.visitExpression(this, ctx);
        if (clazz instanceof _DynamicClass) {
            return clazz.instantiate(args);
        }
        else {
            return lang_1.FunctionWrapper.apply(reflection_1.reflector.factory(clazz), args);
        }
    };
    StatementInterpreter.prototype.visitLiteralExpr = function (ast, ctx) { return ast.value; };
    StatementInterpreter.prototype.visitExternalExpr = function (ast, ctx) { return ast.value.runtime; };
    StatementInterpreter.prototype.visitConditionalExpr = function (ast, ctx) {
        if (ast.condition.visitExpression(this, ctx)) {
            return ast.trueCase.visitExpression(this, ctx);
        }
        else if (lang_1.isPresent(ast.falseCase)) {
            return ast.falseCase.visitExpression(this, ctx);
        }
        return null;
    };
    StatementInterpreter.prototype.visitNotExpr = function (ast, ctx) {
        return !ast.condition.visitExpression(this, ctx);
    };
    StatementInterpreter.prototype.visitCastExpr = function (ast, ctx) {
        return ast.value.visitExpression(this, ctx);
    };
    StatementInterpreter.prototype.visitFunctionExpr = function (ast, ctx) {
        var paramNames = ast.params.map(function (param) { return param.name; });
        return _declareFn(paramNames, ast.statements, ctx, this);
    };
    StatementInterpreter.prototype.visitDeclareFunctionStmt = function (stmt, ctx) {
        var paramNames = stmt.params.map(function (param) { return param.name; });
        ctx.vars.set(stmt.name, _declareFn(paramNames, stmt.statements, ctx, this));
        return null;
    };
    StatementInterpreter.prototype.visitBinaryOperatorExpr = function (ast, ctx) {
        var _this = this;
        var lhs = function () { return ast.lhs.visitExpression(_this, ctx); };
        var rhs = function () { return ast.rhs.visitExpression(_this, ctx); };
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
                throw new exceptions_1.BaseException("Unknown operator " + ast.operator);
        }
    };
    StatementInterpreter.prototype.visitReadPropExpr = function (ast, ctx) {
        var result;
        var receiver = ast.receiver.visitExpression(this, ctx);
        if (isDynamicInstance(receiver)) {
            var di = receiver;
            if (di.props.has(ast.name)) {
                result = di.props.get(ast.name);
            }
            else if (di.getters.has(ast.name)) {
                result = di.getters.get(ast.name)();
            }
            else if (di.methods.has(ast.name)) {
                result = di.methods.get(ast.name);
            }
            else {
                result = reflection_1.reflector.getter(ast.name)(receiver);
            }
        }
        else {
            result = reflection_1.reflector.getter(ast.name)(receiver);
        }
        return result;
    };
    StatementInterpreter.prototype.visitReadKeyExpr = function (ast, ctx) {
        var receiver = ast.receiver.visitExpression(this, ctx);
        var prop = ast.index.visitExpression(this, ctx);
        return receiver[prop];
    };
    StatementInterpreter.prototype.visitLiteralArrayExpr = function (ast, ctx) {
        return this.visitAllExpressions(ast.entries, ctx);
    };
    StatementInterpreter.prototype.visitLiteralMapExpr = function (ast, ctx) {
        var _this = this;
        var result = {};
        ast.entries.forEach(function (entry) { return result[entry[0]] =
            entry[1].visitExpression(_this, ctx); });
        return result;
    };
    StatementInterpreter.prototype.visitAllExpressions = function (expressions, ctx) {
        var _this = this;
        return expressions.map(function (expr) { return expr.visitExpression(_this, ctx); });
    };
    StatementInterpreter.prototype.visitAllStatements = function (statements, ctx) {
        for (var i = 0; i < statements.length; i++) {
            var stmt = statements[i];
            var val = stmt.visitStatement(this, ctx);
            if (val instanceof ReturnValue) {
                return val;
            }
        }
        return null;
    };
    return StatementInterpreter;
}());
function _declareFn(varNames, statements, ctx, visitor) {
    switch (varNames.length) {
        case 0:
            return function () { return _executeFunctionStatements(varNames, [], statements, ctx, visitor); };
        case 1:
            return function (d0) { return _executeFunctionStatements(varNames, [d0], statements, ctx, visitor); };
        case 2:
            return function (d0, d1) { return _executeFunctionStatements(varNames, [d0, d1], statements, ctx, visitor); };
        case 3:
            return function (d0, d1, d2) {
                return _executeFunctionStatements(varNames, [d0, d1, d2], statements, ctx, visitor);
            };
        case 4:
            return function (d0, d1, d2, d3) {
                return _executeFunctionStatements(varNames, [d0, d1, d2, d3], statements, ctx, visitor);
            };
        case 5:
            return function (d0, d1, d2, d3, d4) { return _executeFunctionStatements(varNames, [d0, d1, d2, d3, d4], statements, ctx, visitor); };
        case 6:
            return function (d0, d1, d2, d3, d4, d5) { return _executeFunctionStatements(varNames, [d0, d1, d2, d3, d4, d5], statements, ctx, visitor); };
        case 7:
            return function (d0, d1, d2, d3, d4, d5, d6) { return _executeFunctionStatements(varNames, [d0, d1, d2, d3, d4, d5, d6], statements, ctx, visitor); };
        case 8:
            return function (d0, d1, d2, d3, d4, d5, d6, d7) { return _executeFunctionStatements(varNames, [d0, d1, d2, d3, d4, d5, d6, d7], statements, ctx, visitor); };
        case 9:
            return function (d0, d1, d2, d3, d4, d5, d6, d7, d8) { return _executeFunctionStatements(varNames, [d0, d1, d2, d3, d4, d5, d6, d7, d8], statements, ctx, visitor); };
        case 10:
            return function (d0, d1, d2, d3, d4, d5, d6, d7, d8, d9) { return _executeFunctionStatements(varNames, [d0, d1, d2, d3, d4, d5, d6, d7, d8, d9], statements, ctx, visitor); };
        default:
            throw new exceptions_1.BaseException('Declaring functions with more than 10 arguments is not supported right now');
    }
}
var CATCH_ERROR_VAR = 'error';
var CATCH_STACK_VAR = 'stack';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2ludGVycHJldGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL291dHB1dC9vdXRwdXRfaW50ZXJwcmV0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFCQU9PLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsc0JBQWdDLDJCQUEyQixDQUFDLENBQUE7QUFDNUQsSUFBWSxDQUFDLFdBQU0sY0FBYyxDQUFDLENBQUE7QUFDbEMsMkJBQXdCLHlDQUF5QyxDQUFDLENBQUE7QUFDbEUsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFDNUUsMkJBQXNDLGdDQUFnQyxDQUFDLENBQUE7QUFDdkUsNkJBQW1DLGdCQUFnQixDQUFDLENBQUE7QUFDcEQsMkJBQXlDLGNBQWMsQ0FBQyxDQUFBO0FBRXhELDZCQUFvQyxVQUF5QixFQUFFLFNBQWlCLEVBQzVDLGVBQWdDO0lBQ2xFLElBQUksZUFBZSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RixJQUFJLEdBQUcsR0FBRyxJQUFJLGlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBZSxFQUM5QyxJQUFJLEdBQUcsRUFBZSxFQUFFLElBQUksR0FBRyxFQUFvQixFQUNuRCxJQUFJLEdBQUcsRUFBb0IsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUM5RSxJQUFJLE9BQU8sR0FBRyxJQUFJLG9CQUFvQixFQUFFLENBQUM7SUFDekMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM5RCxNQUFN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RUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSyxPQUFBLDBCQUEwQixDQUNsRCxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBRHJDLENBQ3FDLENBQUM7UUFDM0UsS0FBSyxDQUFDO1lBQ0osTUFBTSxDQUFDLFVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFLLE9BQUEsMEJBQTBCLENBQ3RELFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBRHJDLENBQ3FDLENBQUM7UUFDL0UsS0FBSyxDQUFDO1lBQ0osTUFBTSxDQUFDLFVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSyxPQUFBLDBCQUEwQixDQUMxRCxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFEckMsQ0FDcUMsQ0FBQztRQUNuRixLQUFLLENBQUM7WUFDSixNQUFNLENBQUMsVUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSyxPQUFBLDBCQUEwQixDQUM5RCxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBRHJDLENBQ3FDLENBQUM7UUFDdkYsS0FBSyxFQUFFO1lBQ0wsTUFBTSxDQUFDLFVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFLLE9BQUEsMEJBQTBCLENBQ2xFLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBRHJDLENBQ3FDLENBQUM7UUFDM0Y7WUFDRSxNQUFNLElBQUksMEJBQWEsQ0FDbkIsNEVBQTRFLENBQUMsQ0FBQztJQUN0RixDQUFDO0FBQ0gsQ0FBQztBQUVELElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQztBQUM5QixJQUFJLGVBQWUsR0FBRyxPQUFPLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIGlzU3RyaW5nLFxuICBldmFsRXhwcmVzc2lvbixcbiAgSVNfREFSVCxcbiAgRnVuY3Rpb25XcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXRfYXN0JztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCB1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7ZGVidWdPdXRwdXRBc3RBc0RhcnR9IGZyb20gJy4vZGFydF9lbWl0dGVyJztcbmltcG9ydCB7ZGVidWdPdXRwdXRBc3RBc1R5cGVTY3JpcHR9IGZyb20gJy4vdHNfZW1pdHRlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnByZXRTdGF0ZW1lbnRzKHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sIHJlc3VsdFZhcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VGYWN0b3J5OiBJbnN0YW5jZUZhY3RvcnkpOiBhbnkge1xuICB2YXIgc3RtdHNXaXRoUmV0dXJuID0gc3RhdGVtZW50cy5jb25jYXQoW25ldyBvLlJldHVyblN0YXRlbWVudChvLnZhcmlhYmxlKHJlc3VsdFZhcikpXSk7XG4gIHZhciBjdHggPSBuZXcgX0V4ZWN1dGlvbkNvbnRleHQobnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbmV3IE1hcDxzdHJpbmcsIGFueT4oKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgTWFwPHN0cmluZywgYW55PigpLCBuZXcgTWFwPHN0cmluZywgRnVuY3Rpb24+KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPigpLCBpbnN0YW5jZUZhY3RvcnkpO1xuICB2YXIgdmlzaXRvciA9IG5ldyBTdGF0ZW1lbnRJbnRlcnByZXRlcigpO1xuICB2YXIgcmVzdWx0ID0gdmlzaXRvci52aXNpdEFsbFN0YXRlbWVudHMoc3RtdHNXaXRoUmV0dXJuLCBjdHgpO1xuICByZXR1cm4gaXNQcmVzZW50KHJlc3VsdCkgPyByZXN1bHQudmFsdWUgOiBudWxsO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluc3RhbmNlRmFjdG9yeSB7XG4gIGNyZWF0ZUluc3RhbmNlKHN1cGVyQ2xhc3M6IGFueSwgY2xheno6IGFueSwgY29uc3RydWN0b3JBcmdzOiBhbnlbXSwgcHJvcHM6IE1hcDxzdHJpbmcsIGFueT4sXG4gICAgICAgICAgICAgICAgIGdldHRlcnM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPiwgbWV0aG9kczogTWFwPHN0cmluZywgRnVuY3Rpb24+KTogRHluYW1pY0luc3RhbmNlO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRHluYW1pY0luc3RhbmNlIHtcbiAgZ2V0IHByb3BzKCk6IE1hcDxzdHJpbmcsIGFueT4geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG4gIGdldCBnZXR0ZXJzKCk6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPiB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IG1ldGhvZHMoKTogTWFwPHN0cmluZywgYW55PiB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IGNsYXp6KCk6IGFueSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbn1cblxuZnVuY3Rpb24gaXNEeW5hbWljSW5zdGFuY2UoaW5zdGFuY2U6IGFueSk6IGFueSB7XG4gIGlmIChJU19EQVJUKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlIGluc3RhbmNlb2YgRHluYW1pY0luc3RhbmNlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBpc1ByZXNlbnQoaW5zdGFuY2UpICYmIGlzUHJlc2VudChpbnN0YW5jZS5wcm9wcykgJiYgaXNQcmVzZW50KGluc3RhbmNlLmdldHRlcnMpICYmXG4gICAgICAgICAgIGlzUHJlc2VudChpbnN0YW5jZS5tZXRob2RzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfZXhlY3V0ZUZ1bmN0aW9uU3RhdGVtZW50cyh2YXJOYW1lczogc3RyaW5nW10sIHZhclZhbHVlczogYW55W10sIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHg6IF9FeGVjdXRpb25Db250ZXh0LCB2aXNpdG9yOiBTdGF0ZW1lbnRJbnRlcnByZXRlcik6IGFueSB7XG4gIHZhciBjaGlsZEN0eCA9IGN0eC5jcmVhdGVDaGlsZFdpaHRMb2NhbFZhcnMoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YXJOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgIGNoaWxkQ3R4LnZhcnMuc2V0KHZhck5hbWVzW2ldLCB2YXJWYWx1ZXNbaV0pO1xuICB9XG4gIHZhciByZXN1bHQgPSB2aXNpdG9yLnZpc2l0QWxsU3RhdGVtZW50cyhzdGF0ZW1lbnRzLCBjaGlsZEN0eCk7XG4gIHJldHVybiBpc1ByZXNlbnQocmVzdWx0KSA/IHJlc3VsdC52YWx1ZSA6IG51bGw7XG59XG5cbmNsYXNzIF9FeGVjdXRpb25Db250ZXh0IHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmVudDogX0V4ZWN1dGlvbkNvbnRleHQsIHB1YmxpYyBzdXBlckNsYXNzOiBhbnksIHB1YmxpYyBzdXBlckluc3RhbmNlOiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyBjbGFzc05hbWU6IHN0cmluZywgcHVibGljIHZhcnM6IE1hcDxzdHJpbmcsIGFueT4sXG4gICAgICAgICAgICAgIHB1YmxpYyBwcm9wczogTWFwPHN0cmluZywgYW55PiwgcHVibGljIGdldHRlcnM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPixcbiAgICAgICAgICAgICAgcHVibGljIG1ldGhvZHM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPiwgcHVibGljIGluc3RhbmNlRmFjdG9yeTogSW5zdGFuY2VGYWN0b3J5KSB7fVxuXG4gIGNyZWF0ZUNoaWxkV2lodExvY2FsVmFycygpOiBfRXhlY3V0aW9uQ29udGV4dCB7XG4gICAgcmV0dXJuIG5ldyBfRXhlY3V0aW9uQ29udGV4dCh0aGlzLCB0aGlzLnN1cGVyQ2xhc3MsIHRoaXMuc3VwZXJJbnN0YW5jZSwgdGhpcy5jbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgTWFwPHN0cmluZywgYW55PigpLCB0aGlzLnByb3BzLCB0aGlzLmdldHRlcnMsIHRoaXMubWV0aG9kcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VGYWN0b3J5KTtcbiAgfVxufVxuXG5jbGFzcyBSZXR1cm5WYWx1ZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogYW55KSB7fVxufVxuXG5jbGFzcyBfRHluYW1pY0NsYXNzIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfY2xhc3NTdG10OiBvLkNsYXNzU3RtdCwgcHJpdmF0ZSBfY3R4OiBfRXhlY3V0aW9uQ29udGV4dCxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdmlzaXRvcjogU3RhdGVtZW50SW50ZXJwcmV0ZXIpIHt9XG5cbiAgaW5zdGFudGlhdGUoYXJnczogYW55W10pOiBEeW5hbWljSW5zdGFuY2Uge1xuICAgIHZhciBwcm9wcyA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG4gICAgdmFyIGdldHRlcnMgPSBuZXcgTWFwPHN0cmluZywgRnVuY3Rpb24+KCk7XG4gICAgdmFyIG1ldGhvZHMgPSBuZXcgTWFwPHN0cmluZywgRnVuY3Rpb24+KCk7XG4gICAgdmFyIHN1cGVyQ2xhc3MgPSB0aGlzLl9jbGFzc1N0bXQucGFyZW50LnZpc2l0RXhwcmVzc2lvbih0aGlzLl92aXNpdG9yLCB0aGlzLl9jdHgpO1xuICAgIHZhciBpbnN0YW5jZUN0eCA9XG4gICAgICAgIG5ldyBfRXhlY3V0aW9uQ29udGV4dCh0aGlzLl9jdHgsIHN1cGVyQ2xhc3MsIG51bGwsIHRoaXMuX2NsYXNzU3RtdC5uYW1lLCB0aGlzLl9jdHgudmFycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLCBnZXR0ZXJzLCBtZXRob2RzLCB0aGlzLl9jdHguaW5zdGFuY2VGYWN0b3J5KTtcblxuICAgIHRoaXMuX2NsYXNzU3RtdC5maWVsZHMuZm9yRWFjaCgoZmllbGQ6IG8uQ2xhc3NGaWVsZCkgPT4geyBwcm9wcy5zZXQoZmllbGQubmFtZSwgbnVsbCk7IH0pO1xuICAgIHRoaXMuX2NsYXNzU3RtdC5nZXR0ZXJzLmZvckVhY2goKGdldHRlcjogby5DbGFzc0dldHRlcikgPT4ge1xuICAgICAgZ2V0dGVycy5zZXQoZ2V0dGVyLm5hbWUsICgpID0+IF9leGVjdXRlRnVuY3Rpb25TdGF0ZW1lbnRzKFtdLCBbXSwgZ2V0dGVyLmJvZHksIGluc3RhbmNlQ3R4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Zpc2l0b3IpKTtcbiAgICB9KTtcbiAgICB0aGlzLl9jbGFzc1N0bXQubWV0aG9kcy5mb3JFYWNoKChtZXRob2Q6IG8uQ2xhc3NNZXRob2QpID0+IHtcbiAgICAgIHZhciBwYXJhbU5hbWVzID0gbWV0aG9kLnBhcmFtcy5tYXAocGFyYW0gPT4gcGFyYW0ubmFtZSk7XG4gICAgICBtZXRob2RzLnNldChtZXRob2QubmFtZSwgX2RlY2xhcmVGbihwYXJhbU5hbWVzLCBtZXRob2QuYm9keSwgaW5zdGFuY2VDdHgsIHRoaXMuX3Zpc2l0b3IpKTtcbiAgICB9KTtcblxuICAgIHZhciBjdG9yUGFyYW1OYW1lcyA9IHRoaXMuX2NsYXNzU3RtdC5jb25zdHJ1Y3Rvck1ldGhvZC5wYXJhbXMubWFwKHBhcmFtID0+IHBhcmFtLm5hbWUpO1xuICAgIF9leGVjdXRlRnVuY3Rpb25TdGF0ZW1lbnRzKGN0b3JQYXJhbU5hbWVzLCBhcmdzLCB0aGlzLl9jbGFzc1N0bXQuY29uc3RydWN0b3JNZXRob2QuYm9keSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUN0eCwgdGhpcy5fdmlzaXRvcik7XG4gICAgcmV0dXJuIGluc3RhbmNlQ3R4LnN1cGVySW5zdGFuY2U7XG4gIH1cblxuICBkZWJ1Z0FzdCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fdmlzaXRvci5kZWJ1Z0FzdCh0aGlzLl9jbGFzc1N0bXQpOyB9XG59XG5cbmNsYXNzIFN0YXRlbWVudEludGVycHJldGVyIGltcGxlbWVudHMgby5TdGF0ZW1lbnRWaXNpdG9yLCBvLkV4cHJlc3Npb25WaXNpdG9yIHtcbiAgZGVidWdBc3QoYXN0OiBvLkV4cHJlc3Npb24gfCBvLlN0YXRlbWVudCB8IG8uVHlwZSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIElTX0RBUlQgPyBkZWJ1Z091dHB1dEFzdEFzRGFydChhc3QpIDogZGVidWdPdXRwdXRBc3RBc1R5cGVTY3JpcHQoYXN0KTtcbiAgfVxuXG4gIHZpc2l0RGVjbGFyZVZhclN0bXQoc3RtdDogby5EZWNsYXJlVmFyU3RtdCwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgY3R4LnZhcnMuc2V0KHN0bXQubmFtZSwgc3RtdC52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRXcml0ZVZhckV4cHIoZXhwcjogby5Xcml0ZVZhckV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHZhciB2YWx1ZSA9IGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgdmFyIGN1cnJDdHggPSBjdHg7XG4gICAgd2hpbGUgKGN1cnJDdHggIT0gbnVsbCkge1xuICAgICAgaWYgKGN1cnJDdHgudmFycy5oYXMoZXhwci5uYW1lKSkge1xuICAgICAgICBjdXJyQ3R4LnZhcnMuc2V0KGV4cHIubmFtZSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgICBjdXJyQ3R4ID0gY3VyckN0eC5wYXJlbnQ7XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBOb3QgZGVjbGFyZWQgdmFyaWFibGUgJHtleHByLm5hbWV9YCk7XG4gIH1cbiAgdmlzaXRSZWFkVmFyRXhwcihhc3Q6IG8uUmVhZFZhckV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHZhciB2YXJOYW1lID0gYXN0Lm5hbWU7XG4gICAgaWYgKGlzUHJlc2VudChhc3QuYnVpbHRpbikpIHtcbiAgICAgIHN3aXRjaCAoYXN0LmJ1aWx0aW4pIHtcbiAgICAgICAgY2FzZSBvLkJ1aWx0aW5WYXIuU3VwZXI6XG4gICAgICAgIGNhc2Ugby5CdWlsdGluVmFyLlRoaXM6XG4gICAgICAgICAgcmV0dXJuIGN0eC5zdXBlckluc3RhbmNlO1xuICAgICAgICBjYXNlIG8uQnVpbHRpblZhci5DYXRjaEVycm9yOlxuICAgICAgICAgIHZhck5hbWUgPSBDQVRDSF9FUlJPUl9WQVI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugby5CdWlsdGluVmFyLkNhdGNoU3RhY2s6XG4gICAgICAgICAgdmFyTmFtZSA9IENBVENIX1NUQUNLX1ZBUjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5rbm93biBidWlsdGluIHZhcmlhYmxlICR7YXN0LmJ1aWx0aW59YCk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBjdXJyQ3R4ID0gY3R4O1xuICAgIHdoaWxlIChjdXJyQ3R4ICE9IG51bGwpIHtcbiAgICAgIGlmIChjdXJyQ3R4LnZhcnMuaGFzKHZhck5hbWUpKSB7XG4gICAgICAgIHJldHVybiBjdXJyQ3R4LnZhcnMuZ2V0KHZhck5hbWUpO1xuICAgICAgfVxuICAgICAgY3VyckN0eCA9IGN1cnJDdHgucGFyZW50O1xuICAgIH1cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgTm90IGRlY2xhcmVkIHZhcmlhYmxlICR7dmFyTmFtZX1gKTtcbiAgfVxuICB2aXNpdFdyaXRlS2V5RXhwcihleHByOiBvLldyaXRlS2V5RXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgdmFyIHJlY2VpdmVyID0gZXhwci5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICB2YXIgaW5kZXggPSBleHByLmluZGV4LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIHZhciB2YWx1ZSA9IGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgcmVjZWl2ZXJbaW5kZXhdID0gdmFsdWU7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHZpc2l0V3JpdGVQcm9wRXhwcihleHByOiBvLldyaXRlUHJvcEV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHZhciByZWNlaXZlciA9IGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgdmFyIHZhbHVlID0gZXhwci52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICBpZiAoaXNEeW5hbWljSW5zdGFuY2UocmVjZWl2ZXIpKSB7XG4gICAgICB2YXIgZGkgPSA8RHluYW1pY0luc3RhbmNlPnJlY2VpdmVyO1xuICAgICAgaWYgKGRpLnByb3BzLmhhcyhleHByLm5hbWUpKSB7XG4gICAgICAgIGRpLnByb3BzLnNldChleHByLm5hbWUsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZmxlY3Rvci5zZXR0ZXIoZXhwci5uYW1lKShyZWNlaXZlciwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZWZsZWN0b3Iuc2V0dGVyKGV4cHIubmFtZSkocmVjZWl2ZXIsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgdmlzaXRJbnZva2VNZXRob2RFeHByKGV4cHI6IG8uSW52b2tlTWV0aG9kRXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgdmFyIHJlY2VpdmVyID0gZXhwci5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICB2YXIgYXJncyA9IHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhleHByLmFyZ3MsIGN0eCk7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBpZiAoaXNQcmVzZW50KGV4cHIuYnVpbHRpbikpIHtcbiAgICAgIHN3aXRjaCAoZXhwci5idWlsdGluKSB7XG4gICAgICAgIGNhc2Ugby5CdWlsdGluTWV0aG9kLkNvbmNhdEFycmF5OlxuICAgICAgICAgIHJlc3VsdCA9IExpc3RXcmFwcGVyLmNvbmNhdChyZWNlaXZlciwgYXJnc1swXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugby5CdWlsdGluTWV0aG9kLlN1YnNjcmliZU9ic2VydmFibGU6XG4gICAgICAgICAgcmVzdWx0ID0gT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHJlY2VpdmVyLCBhcmdzWzBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBvLkJ1aWx0aW5NZXRob2QuYmluZDpcbiAgICAgICAgICBpZiAoSVNfREFSVCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVjZWl2ZXI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlY2VpdmVyLmJpbmQoYXJnc1swXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBVbmtub3duIGJ1aWx0aW4gbWV0aG9kICR7ZXhwci5idWlsdGlufWApO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNEeW5hbWljSW5zdGFuY2UocmVjZWl2ZXIpKSB7XG4gICAgICB2YXIgZGkgPSA8RHluYW1pY0luc3RhbmNlPnJlY2VpdmVyO1xuICAgICAgaWYgKGRpLm1ldGhvZHMuaGFzKGV4cHIubmFtZSkpIHtcbiAgICAgICAgcmVzdWx0ID0gRnVuY3Rpb25XcmFwcGVyLmFwcGx5KGRpLm1ldGhvZHMuZ2V0KGV4cHIubmFtZSksIGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gcmVmbGVjdG9yLm1ldGhvZChleHByLm5hbWUpKHJlY2VpdmVyLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gcmVmbGVjdG9yLm1ldGhvZChleHByLm5hbWUpKHJlY2VpdmVyLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICB2aXNpdEludm9rZUZ1bmN0aW9uRXhwcihzdG10OiBvLkludm9rZUZ1bmN0aW9uRXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgdmFyIGFyZ3MgPSB0aGlzLnZpc2l0QWxsRXhwcmVzc2lvbnMoc3RtdC5hcmdzLCBjdHgpO1xuICAgIHZhciBmbkV4cHIgPSBzdG10LmZuO1xuICAgIGlmIChmbkV4cHIgaW5zdGFuY2VvZiBvLlJlYWRWYXJFeHByICYmIGZuRXhwci5idWlsdGluID09PSBvLkJ1aWx0aW5WYXIuU3VwZXIpIHtcbiAgICAgIGN0eC5zdXBlckluc3RhbmNlID0gY3R4Lmluc3RhbmNlRmFjdG9yeS5jcmVhdGVJbnN0YW5jZShjdHguc3VwZXJDbGFzcywgY3R4LmNsYXNzTmFtZSwgYXJncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHgucHJvcHMsIGN0eC5nZXR0ZXJzLCBjdHgubWV0aG9kcyk7XG4gICAgICBjdHgucGFyZW50LnN1cGVySW5zdGFuY2UgPSBjdHguc3VwZXJJbnN0YW5jZTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZm4gPSBzdG10LmZuLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgICAgcmV0dXJuIEZ1bmN0aW9uV3JhcHBlci5hcHBseShmbiwgYXJncyk7XG4gICAgfVxuICB9XG4gIHZpc2l0UmV0dXJuU3RtdChzdG10OiBvLlJldHVyblN0YXRlbWVudCwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBSZXR1cm5WYWx1ZShzdG10LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpKTtcbiAgfVxuICB2aXNpdERlY2xhcmVDbGFzc1N0bXQoc3RtdDogby5DbGFzc1N0bXQsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHZhciBjbGF6eiA9IG5ldyBfRHluYW1pY0NsYXNzKHN0bXQsIGN0eCwgdGhpcyk7XG4gICAgY3R4LnZhcnMuc2V0KHN0bXQubmFtZSwgY2xhenopO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0RXhwcmVzc2lvblN0bXQoc3RtdDogby5FeHByZXNzaW9uU3RhdGVtZW50LCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICByZXR1cm4gc3RtdC5leHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICB9XG4gIHZpc2l0SWZTdG10KHN0bXQ6IG8uSWZTdG10LCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICB2YXIgY29uZGl0aW9uID0gc3RtdC5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgaWYgKGNvbmRpdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQudHJ1ZUNhc2UsIGN0eCk7XG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoc3RtdC5mYWxzZUNhc2UpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoc3RtdC5mYWxzZUNhc2UsIGN0eCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0VHJ5Q2F0Y2hTdG10KHN0bXQ6IG8uVHJ5Q2F0Y2hTdG10LCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQuYm9keVN0bXRzLCBjdHgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHZhciBjaGlsZEN0eCA9IGN0eC5jcmVhdGVDaGlsZFdpaHRMb2NhbFZhcnMoKTtcbiAgICAgIGNoaWxkQ3R4LnZhcnMuc2V0KENBVENIX0VSUk9SX1ZBUiwgZSk7XG4gICAgICBjaGlsZEN0eC52YXJzLnNldChDQVRDSF9TVEFDS19WQVIsIGUuc3RhY2spO1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQuY2F0Y2hTdG10cywgY2hpbGRDdHgpO1xuICAgIH1cbiAgfVxuICB2aXNpdFRocm93U3RtdChzdG10OiBvLlRocm93U3RtdCwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgdGhyb3cgc3RtdC5lcnJvci52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgfVxuICB2aXNpdENvbW1lbnRTdG10KHN0bXQ6IG8uQ29tbWVudFN0bXQsIGNvbnRleHQ/OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdEluc3RhbnRpYXRlRXhwcihhc3Q6IG8uSW5zdGFudGlhdGVFeHByLCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICB2YXIgYXJncyA9IHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhhc3QuYXJncywgY3R4KTtcbiAgICB2YXIgY2xhenogPSBhc3QuY2xhc3NFeHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGlmIChjbGF6eiBpbnN0YW5jZW9mIF9EeW5hbWljQ2xhc3MpIHtcbiAgICAgIHJldHVybiBjbGF6ei5pbnN0YW50aWF0ZShhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIEZ1bmN0aW9uV3JhcHBlci5hcHBseShyZWZsZWN0b3IuZmFjdG9yeShjbGF6eiksIGFyZ3MpO1xuICAgIH1cbiAgfVxuICB2aXNpdExpdGVyYWxFeHByKGFzdDogby5MaXRlcmFsRXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7IHJldHVybiBhc3QudmFsdWU7IH1cbiAgdmlzaXRFeHRlcm5hbEV4cHIoYXN0OiBvLkV4dGVybmFsRXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7IHJldHVybiBhc3QudmFsdWUucnVudGltZTsgfVxuICB2aXNpdENvbmRpdGlvbmFsRXhwcihhc3Q6IG8uQ29uZGl0aW9uYWxFeHByLCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICBpZiAoYXN0LmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KSkge1xuICAgICAgcmV0dXJuIGFzdC50cnVlQ2FzZS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChhc3QuZmFsc2VDYXNlKSkge1xuICAgICAgcmV0dXJuIGFzdC5mYWxzZUNhc2UudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0Tm90RXhwcihhc3Q6IG8uTm90RXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgcmV0dXJuICFhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICB9XG4gIHZpc2l0Q2FzdEV4cHIoYXN0OiBvLkNhc3RFeHByLCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICByZXR1cm4gYXN0LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICB9XG4gIHZpc2l0RnVuY3Rpb25FeHByKGFzdDogby5GdW5jdGlvbkV4cHIsIGN0eDogX0V4ZWN1dGlvbkNvbnRleHQpOiBhbnkge1xuICAgIHZhciBwYXJhbU5hbWVzID0gYXN0LnBhcmFtcy5tYXAoKHBhcmFtKSA9PiBwYXJhbS5uYW1lKTtcbiAgICByZXR1cm4gX2RlY2xhcmVGbihwYXJhbU5hbWVzLCBhc3Quc3RhdGVtZW50cywgY3R4LCB0aGlzKTtcbiAgfVxuICB2aXNpdERlY2xhcmVGdW5jdGlvblN0bXQoc3RtdDogby5EZWNsYXJlRnVuY3Rpb25TdG10LCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICB2YXIgcGFyYW1OYW1lcyA9IHN0bXQucGFyYW1zLm1hcCgocGFyYW0pID0+IHBhcmFtLm5hbWUpO1xuICAgIGN0eC52YXJzLnNldChzdG10Lm5hbWUsIF9kZWNsYXJlRm4ocGFyYW1OYW1lcywgc3RtdC5zdGF0ZW1lbnRzLCBjdHgsIHRoaXMpKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdEJpbmFyeU9wZXJhdG9yRXhwcihhc3Q6IG8uQmluYXJ5T3BlcmF0b3JFeHByLCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICB2YXIgbGhzID0gKCkgPT4gYXN0Lmxocy52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcbiAgICB2YXIgcmhzID0gKCkgPT4gYXN0LnJocy52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KTtcblxuICAgIHN3aXRjaCAoYXN0Lm9wZXJhdG9yKSB7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuRXF1YWxzOlxuICAgICAgICByZXR1cm4gbGhzKCkgPT0gcmhzKCk7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuSWRlbnRpY2FsOlxuICAgICAgICByZXR1cm4gbGhzKCkgPT09IHJocygpO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLk5vdEVxdWFsczpcbiAgICAgICAgcmV0dXJuIGxocygpICE9IHJocygpO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLk5vdElkZW50aWNhbDpcbiAgICAgICAgcmV0dXJuIGxocygpICE9PSByaHMoKTtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5BbmQ6XG4gICAgICAgIHJldHVybiBsaHMoKSAmJiByaHMoKTtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5PcjpcbiAgICAgICAgcmV0dXJuIGxocygpIHx8IHJocygpO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLlBsdXM6XG4gICAgICAgIHJldHVybiBsaHMoKSArIHJocygpO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLk1pbnVzOlxuICAgICAgICByZXR1cm4gbGhzKCkgLSByaHMoKTtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5EaXZpZGU6XG4gICAgICAgIHJldHVybiBsaHMoKSAvIHJocygpO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLk11bHRpcGx5OlxuICAgICAgICByZXR1cm4gbGhzKCkgKiByaHMoKTtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5Nb2R1bG86XG4gICAgICAgIHJldHVybiBsaHMoKSAlIHJocygpO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLkxvd2VyOlxuICAgICAgICByZXR1cm4gbGhzKCkgPCByaHMoKTtcbiAgICAgIGNhc2Ugby5CaW5hcnlPcGVyYXRvci5Mb3dlckVxdWFsczpcbiAgICAgICAgcmV0dXJuIGxocygpIDw9IHJocygpO1xuICAgICAgY2FzZSBvLkJpbmFyeU9wZXJhdG9yLkJpZ2dlcjpcbiAgICAgICAgcmV0dXJuIGxocygpID4gcmhzKCk7XG4gICAgICBjYXNlIG8uQmluYXJ5T3BlcmF0b3IuQmlnZ2VyRXF1YWxzOlxuICAgICAgICByZXR1cm4gbGhzKCkgPj0gcmhzKCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5rbm93biBvcGVyYXRvciAke2FzdC5vcGVyYXRvcn1gKTtcbiAgICB9XG4gIH1cbiAgdmlzaXRSZWFkUHJvcEV4cHIoYXN0OiBvLlJlYWRQcm9wRXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgdmFyIHJlc3VsdDtcbiAgICB2YXIgcmVjZWl2ZXIgPSBhc3QucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgaWYgKGlzRHluYW1pY0luc3RhbmNlKHJlY2VpdmVyKSkge1xuICAgICAgdmFyIGRpID0gPER5bmFtaWNJbnN0YW5jZT5yZWNlaXZlcjtcbiAgICAgIGlmIChkaS5wcm9wcy5oYXMoYXN0Lm5hbWUpKSB7XG4gICAgICAgIHJlc3VsdCA9IGRpLnByb3BzLmdldChhc3QubmFtZSk7XG4gICAgICB9IGVsc2UgaWYgKGRpLmdldHRlcnMuaGFzKGFzdC5uYW1lKSkge1xuICAgICAgICByZXN1bHQgPSBkaS5nZXR0ZXJzLmdldChhc3QubmFtZSkoKTtcbiAgICAgIH0gZWxzZSBpZiAoZGkubWV0aG9kcy5oYXMoYXN0Lm5hbWUpKSB7XG4gICAgICAgIHJlc3VsdCA9IGRpLm1ldGhvZHMuZ2V0KGFzdC5uYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHJlZmxlY3Rvci5nZXR0ZXIoYXN0Lm5hbWUpKHJlY2VpdmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gcmVmbGVjdG9yLmdldHRlcihhc3QubmFtZSkocmVjZWl2ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIHZpc2l0UmVhZEtleUV4cHIoYXN0OiBvLlJlYWRLZXlFeHByLCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICB2YXIgcmVjZWl2ZXIgPSBhc3QucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgdmFyIHByb3AgPSBhc3QuaW5kZXgudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgcmV0dXJuIHJlY2VpdmVyW3Byb3BdO1xuICB9XG4gIHZpc2l0TGl0ZXJhbEFycmF5RXhwcihhc3Q6IG8uTGl0ZXJhbEFycmF5RXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRBbGxFeHByZXNzaW9ucyhhc3QuZW50cmllcywgY3R4KTtcbiAgfVxuICB2aXNpdExpdGVyYWxNYXBFeHByKGFzdDogby5MaXRlcmFsTWFwRXhwciwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCk6IGFueSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGFzdC5lbnRyaWVzLmZvckVhY2goKGVudHJ5KSA9PiByZXN1bHRbPHN0cmluZz5lbnRyeVswXV0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICg8by5FeHByZXNzaW9uPmVudHJ5WzFdKS52aXNpdEV4cHJlc3Npb24odGhpcywgY3R4KSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHZpc2l0QWxsRXhwcmVzc2lvbnMoZXhwcmVzc2lvbnM6IG8uRXhwcmVzc2lvbltdLCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogYW55IHtcbiAgICByZXR1cm4gZXhwcmVzc2lvbnMubWFwKChleHByKSA9PiBleHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpKTtcbiAgfVxuXG4gIHZpc2l0QWxsU3RhdGVtZW50cyhzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdLCBjdHg6IF9FeGVjdXRpb25Db250ZXh0KTogUmV0dXJuVmFsdWUge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHN0bXQgPSBzdGF0ZW1lbnRzW2ldO1xuICAgICAgdmFyIHZhbCA9IHN0bXQudmlzaXRTdGF0ZW1lbnQodGhpcywgY3R4KTtcbiAgICAgIGlmICh2YWwgaW5zdGFuY2VvZiBSZXR1cm5WYWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBfZGVjbGFyZUZuKHZhck5hbWVzOiBzdHJpbmdbXSwgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSwgY3R4OiBfRXhlY3V0aW9uQ29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgdmlzaXRvcjogU3RhdGVtZW50SW50ZXJwcmV0ZXIpOiBGdW5jdGlvbiB7XG4gIHN3aXRjaCAodmFyTmFtZXMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuICgpID0+IF9leGVjdXRlRnVuY3Rpb25TdGF0ZW1lbnRzKHZhck5hbWVzLCBbXSwgc3RhdGVtZW50cywgY3R4LCB2aXNpdG9yKTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gKGQwKSA9PiBfZXhlY3V0ZUZ1bmN0aW9uU3RhdGVtZW50cyh2YXJOYW1lcywgW2QwXSwgc3RhdGVtZW50cywgY3R4LCB2aXNpdG9yKTtcbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4gKGQwLCBkMSkgPT4gX2V4ZWN1dGVGdW5jdGlvblN0YXRlbWVudHModmFyTmFtZXMsIFtkMCwgZDFdLCBzdGF0ZW1lbnRzLCBjdHgsIHZpc2l0b3IpO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiAoZDAsIGQxLCBkMikgPT5cbiAgICAgICAgICAgICAgICAgX2V4ZWN1dGVGdW5jdGlvblN0YXRlbWVudHModmFyTmFtZXMsIFtkMCwgZDEsIGQyXSwgc3RhdGVtZW50cywgY3R4LCB2aXNpdG9yKTtcbiAgICBjYXNlIDQ6XG4gICAgICByZXR1cm4gKGQwLCBkMSwgZDIsIGQzKSA9PlxuICAgICAgICAgICAgICAgICBfZXhlY3V0ZUZ1bmN0aW9uU3RhdGVtZW50cyh2YXJOYW1lcywgW2QwLCBkMSwgZDIsIGQzXSwgc3RhdGVtZW50cywgY3R4LCB2aXNpdG9yKTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gKGQwLCBkMSwgZDIsIGQzLCBkNCkgPT4gX2V4ZWN1dGVGdW5jdGlvblN0YXRlbWVudHModmFyTmFtZXMsIFtkMCwgZDEsIGQyLCBkMywgZDRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlbWVudHMsIGN0eCwgdmlzaXRvcik7XG4gICAgY2FzZSA2OlxuICAgICAgcmV0dXJuIChkMCwgZDEsIGQyLCBkMywgZDQsIGQ1KSA9PiBfZXhlY3V0ZUZ1bmN0aW9uU3RhdGVtZW50cyhcbiAgICAgICAgICAgICAgICAgdmFyTmFtZXMsIFtkMCwgZDEsIGQyLCBkMywgZDQsIGQ1XSwgc3RhdGVtZW50cywgY3R4LCB2aXNpdG9yKTtcbiAgICBjYXNlIDc6XG4gICAgICByZXR1cm4gKGQwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2KSA9PiBfZXhlY3V0ZUZ1bmN0aW9uU3RhdGVtZW50cyhcbiAgICAgICAgICAgICAgICAgdmFyTmFtZXMsIFtkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNl0sIHN0YXRlbWVudHMsIGN0eCwgdmlzaXRvcik7XG4gICAgY2FzZSA4OlxuICAgICAgcmV0dXJuIChkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcpID0+IF9leGVjdXRlRnVuY3Rpb25TdGF0ZW1lbnRzKFxuICAgICAgICAgICAgICAgICB2YXJOYW1lcywgW2QwLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkN10sIHN0YXRlbWVudHMsIGN0eCwgdmlzaXRvcik7XG4gICAgY2FzZSA5OlxuICAgICAgcmV0dXJuIChkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4KSA9PiBfZXhlY3V0ZUZ1bmN0aW9uU3RhdGVtZW50cyhcbiAgICAgICAgICAgICAgICAgdmFyTmFtZXMsIFtkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4XSwgc3RhdGVtZW50cywgY3R4LCB2aXNpdG9yKTtcbiAgICBjYXNlIDEwOlxuICAgICAgcmV0dXJuIChkMCwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4LCBkOSkgPT4gX2V4ZWN1dGVGdW5jdGlvblN0YXRlbWVudHMoXG4gICAgICAgICAgICAgICAgIHZhck5hbWVzLCBbZDAsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOCwgZDldLCBzdGF0ZW1lbnRzLCBjdHgsIHZpc2l0b3IpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAnRGVjbGFyaW5nIGZ1bmN0aW9ucyB3aXRoIG1vcmUgdGhhbiAxMCBhcmd1bWVudHMgaXMgbm90IHN1cHBvcnRlZCByaWdodCBub3cnKTtcbiAgfVxufVxuXG52YXIgQ0FUQ0hfRVJST1JfVkFSID0gJ2Vycm9yJztcbnZhciBDQVRDSF9TVEFDS19WQVIgPSAnc3RhY2snOyJdfQ==