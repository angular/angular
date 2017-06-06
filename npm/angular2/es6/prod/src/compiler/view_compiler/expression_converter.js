import * as o from '../output/output_ast';
import { Identifiers } from '../identifiers';
import { BaseException } from 'angular2/src/facade/exceptions';
import { isBlank, isPresent, isArray } from 'angular2/src/facade/lang';
var IMPLICIT_RECEIVER = o.variable('#implicit');
export class ExpressionWithWrappedValueInfo {
    constructor(expression, needsValueUnwrapper) {
        this.expression = expression;
        this.needsValueUnwrapper = needsValueUnwrapper;
    }
}
export function convertCdExpressionToIr(nameResolver, implicitReceiver, expression, valueUnwrapper) {
    var visitor = new _AstToIrVisitor(nameResolver, implicitReceiver, valueUnwrapper);
    var irAst = expression.visit(visitor, _Mode.Expression);
    return new ExpressionWithWrappedValueInfo(irAst, visitor.needsValueUnwrapper);
}
export function convertCdStatementToIr(nameResolver, implicitReceiver, stmt) {
    var visitor = new _AstToIrVisitor(nameResolver, implicitReceiver, null);
    var statements = [];
    flattenStatements(stmt.visit(visitor, _Mode.Statement), statements);
    return statements;
}
var _Mode;
(function (_Mode) {
    _Mode[_Mode["Statement"] = 0] = "Statement";
    _Mode[_Mode["Expression"] = 1] = "Expression";
})(_Mode || (_Mode = {}));
function ensureStatementMode(mode, ast) {
    if (mode !== _Mode.Statement) {
        throw new BaseException(`Expected a statement, but saw ${ast}`);
    }
}
function ensureExpressionMode(mode, ast) {
    if (mode !== _Mode.Expression) {
        throw new BaseException(`Expected an expression, but saw ${ast}`);
    }
}
function convertToStatementIfNeeded(mode, expr) {
    if (mode === _Mode.Statement) {
        return expr.toStmt();
    }
    else {
        return expr;
    }
}
class _AstToIrVisitor {
    constructor(_nameResolver, _implicitReceiver, _valueUnwrapper) {
        this._nameResolver = _nameResolver;
        this._implicitReceiver = _implicitReceiver;
        this._valueUnwrapper = _valueUnwrapper;
        this.needsValueUnwrapper = false;
    }
    visitBinary(ast, mode) {
        var op;
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
            default:
                throw new BaseException(`Unsupported operation ${ast.operation}`);
        }
        return convertToStatementIfNeeded(mode, new o.BinaryOperatorExpr(op, ast.left.visit(this, _Mode.Expression), ast.right.visit(this, _Mode.Expression)));
    }
    visitChain(ast, mode) {
        ensureStatementMode(mode, ast);
        return this.visitAll(ast.expressions, mode);
    }
    visitConditional(ast, mode) {
        var value = ast.condition.visit(this, _Mode.Expression);
        return convertToStatementIfNeeded(mode, value.conditional(ast.trueExp.visit(this, _Mode.Expression), ast.falseExp.visit(this, _Mode.Expression)));
    }
    visitPipe(ast, mode) {
        var input = ast.exp.visit(this, _Mode.Expression);
        var args = this.visitAll(ast.args, _Mode.Expression);
        var value = this._nameResolver.callPipe(ast.name, input, args);
        this.needsValueUnwrapper = true;
        return convertToStatementIfNeeded(mode, this._valueUnwrapper.callMethod('unwrap', [value]));
    }
    visitFunctionCall(ast, mode) {
        return convertToStatementIfNeeded(mode, ast.target.visit(this, _Mode.Expression)
            .callFn(this.visitAll(ast.args, _Mode.Expression)));
    }
    visitImplicitReceiver(ast, mode) {
        ensureExpressionMode(mode, ast);
        return IMPLICIT_RECEIVER;
    }
    visitInterpolation(ast, mode) {
        ensureExpressionMode(mode, ast);
        var args = [o.literal(ast.expressions.length)];
        for (var i = 0; i < ast.strings.length - 1; i++) {
            args.push(o.literal(ast.strings[i]));
            args.push(ast.expressions[i].visit(this, _Mode.Expression));
        }
        args.push(o.literal(ast.strings[ast.strings.length - 1]));
        return o.importExpr(Identifiers.interpolate).callFn(args);
    }
    visitKeyedRead(ast, mode) {
        return convertToStatementIfNeeded(mode, ast.obj.visit(this, _Mode.Expression).key(ast.key.visit(this, _Mode.Expression)));
    }
    visitKeyedWrite(ast, mode) {
        var obj = ast.obj.visit(this, _Mode.Expression);
        var key = ast.key.visit(this, _Mode.Expression);
        var value = ast.value.visit(this, _Mode.Expression);
        return convertToStatementIfNeeded(mode, obj.key(key).set(value));
    }
    visitLiteralArray(ast, mode) {
        return convertToStatementIfNeeded(mode, this._nameResolver.createLiteralArray(this.visitAll(ast.expressions, mode)));
    }
    visitLiteralMap(ast, mode) {
        var parts = [];
        for (var i = 0; i < ast.keys.length; i++) {
            parts.push([ast.keys[i], ast.values[i].visit(this, _Mode.Expression)]);
        }
        return convertToStatementIfNeeded(mode, this._nameResolver.createLiteralMap(parts));
    }
    visitLiteralPrimitive(ast, mode) {
        return convertToStatementIfNeeded(mode, o.literal(ast.value));
    }
    visitMethodCall(ast, mode) {
        var args = this.visitAll(ast.args, _Mode.Expression);
        var result = null;
        var receiver = ast.receiver.visit(this, _Mode.Expression);
        if (receiver === IMPLICIT_RECEIVER) {
            var varExpr = this._nameResolver.getLocal(ast.name);
            if (isPresent(varExpr)) {
                result = varExpr.callFn(args);
            }
            else {
                receiver = this._implicitReceiver;
            }
        }
        if (isBlank(result)) {
            result = receiver.callMethod(ast.name, args);
        }
        return convertToStatementIfNeeded(mode, result);
    }
    visitPrefixNot(ast, mode) {
        return convertToStatementIfNeeded(mode, o.not(ast.expression.visit(this, _Mode.Expression)));
    }
    visitPropertyRead(ast, mode) {
        var result = null;
        var receiver = ast.receiver.visit(this, _Mode.Expression);
        if (receiver === IMPLICIT_RECEIVER) {
            result = this._nameResolver.getLocal(ast.name);
            if (isBlank(result)) {
                receiver = this._implicitReceiver;
            }
        }
        if (isBlank(result)) {
            result = receiver.prop(ast.name);
        }
        return convertToStatementIfNeeded(mode, result);
    }
    visitPropertyWrite(ast, mode) {
        var receiver = ast.receiver.visit(this, _Mode.Expression);
        if (receiver === IMPLICIT_RECEIVER) {
            var varExpr = this._nameResolver.getLocal(ast.name);
            if (isPresent(varExpr)) {
                throw new BaseException('Cannot assign to a reference or variable!');
            }
            receiver = this._implicitReceiver;
        }
        return convertToStatementIfNeeded(mode, receiver.prop(ast.name).set(ast.value.visit(this, _Mode.Expression)));
    }
    visitSafePropertyRead(ast, mode) {
        var receiver = ast.receiver.visit(this, _Mode.Expression);
        return convertToStatementIfNeeded(mode, receiver.isBlank().conditional(o.NULL_EXPR, receiver.prop(ast.name)));
    }
    visitSafeMethodCall(ast, mode) {
        var receiver = ast.receiver.visit(this, _Mode.Expression);
        var args = this.visitAll(ast.args, _Mode.Expression);
        return convertToStatementIfNeeded(mode, receiver.isBlank().conditional(o.NULL_EXPR, receiver.callMethod(ast.name, args)));
    }
    visitAll(asts, mode) { return asts.map(ast => ast.visit(this, mode)); }
    visitQuote(ast, mode) {
        throw new BaseException('Quotes are not supported for evaluation!');
    }
}
function flattenStatements(arg, output) {
    if (isArray(arg)) {
        arg.forEach((entry) => flattenStatements(entry, output));
    }
    else {
        output.push(arg);
    }
}
