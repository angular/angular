import { isPresent, isBlank, isString, StringWrapper } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import * as o from './output_ast';
var _SINGLE_QUOTE_ESCAPE_STRING_RE = /'|\\|\n|\r|\$/g;
export var CATCH_ERROR_VAR = o.variable('error');
export var CATCH_STACK_VAR = o.variable('stack');
export class OutputEmitter {
}
class _EmittedLine {
    constructor(indent) {
        this.indent = indent;
        this.parts = [];
    }
}
export class EmitterVisitorContext {
    constructor(_exportedVars, _indent) {
        this._exportedVars = _exportedVars;
        this._indent = _indent;
        this._classes = [];
        this._lines = [new _EmittedLine(_indent)];
    }
    static createRoot(exportedVars) {
        return new EmitterVisitorContext(exportedVars, 0);
    }
    get _currentLine() { return this._lines[this._lines.length - 1]; }
    isExportedVar(varName) { return this._exportedVars.indexOf(varName) !== -1; }
    println(lastPart = '') { this.print(lastPart, true); }
    lineIsEmpty() { return this._currentLine.parts.length === 0; }
    print(part, newLine = false) {
        if (part.length > 0) {
            this._currentLine.parts.push(part);
        }
        if (newLine) {
            this._lines.push(new _EmittedLine(this._indent));
        }
    }
    removeEmptyLastLine() {
        if (this.lineIsEmpty()) {
            this._lines.pop();
        }
    }
    incIndent() {
        this._indent++;
        this._currentLine.indent = this._indent;
    }
    decIndent() {
        this._indent--;
        this._currentLine.indent = this._indent;
    }
    pushClass(clazz) { this._classes.push(clazz); }
    popClass() { return this._classes.pop(); }
    get currentClass() {
        return this._classes.length > 0 ? this._classes[this._classes.length - 1] : null;
    }
    toSource() {
        var lines = this._lines;
        if (lines[lines.length - 1].parts.length === 0) {
            lines = lines.slice(0, lines.length - 1);
        }
        return lines.map((line) => {
            if (line.parts.length > 0) {
                return _createIndent(line.indent) + line.parts.join('');
            }
            else {
                return '';
            }
        })
            .join('\n');
    }
}
export class AbstractEmitterVisitor {
    constructor(_escapeDollarInStrings) {
        this._escapeDollarInStrings = _escapeDollarInStrings;
    }
    visitExpressionStmt(stmt, ctx) {
        stmt.expr.visitExpression(this, ctx);
        ctx.println(';');
        return null;
    }
    visitReturnStmt(stmt, ctx) {
        ctx.print(`return `);
        stmt.value.visitExpression(this, ctx);
        ctx.println(';');
        return null;
    }
    visitIfStmt(stmt, ctx) {
        ctx.print(`if (`);
        stmt.condition.visitExpression(this, ctx);
        ctx.print(`) {`);
        var hasElseCase = isPresent(stmt.falseCase) && stmt.falseCase.length > 0;
        if (stmt.trueCase.length <= 1 && !hasElseCase) {
            ctx.print(` `);
            this.visitAllStatements(stmt.trueCase, ctx);
            ctx.removeEmptyLastLine();
            ctx.print(` `);
        }
        else {
            ctx.println();
            ctx.incIndent();
            this.visitAllStatements(stmt.trueCase, ctx);
            ctx.decIndent();
            if (hasElseCase) {
                ctx.println(`} else {`);
                ctx.incIndent();
                this.visitAllStatements(stmt.falseCase, ctx);
                ctx.decIndent();
            }
        }
        ctx.println(`}`);
        return null;
    }
    visitThrowStmt(stmt, ctx) {
        ctx.print(`throw `);
        stmt.error.visitExpression(this, ctx);
        ctx.println(`;`);
        return null;
    }
    visitCommentStmt(stmt, ctx) {
        var lines = stmt.comment.split('\n');
        lines.forEach((line) => { ctx.println(`// ${line}`); });
        return null;
    }
    visitWriteVarExpr(expr, ctx) {
        var lineWasEmpty = ctx.lineIsEmpty();
        if (!lineWasEmpty) {
            ctx.print('(');
        }
        ctx.print(`${expr.name} = `);
        expr.value.visitExpression(this, ctx);
        if (!lineWasEmpty) {
            ctx.print(')');
        }
        return null;
    }
    visitWriteKeyExpr(expr, ctx) {
        var lineWasEmpty = ctx.lineIsEmpty();
        if (!lineWasEmpty) {
            ctx.print('(');
        }
        expr.receiver.visitExpression(this, ctx);
        ctx.print(`[`);
        expr.index.visitExpression(this, ctx);
        ctx.print(`] = `);
        expr.value.visitExpression(this, ctx);
        if (!lineWasEmpty) {
            ctx.print(')');
        }
        return null;
    }
    visitWritePropExpr(expr, ctx) {
        var lineWasEmpty = ctx.lineIsEmpty();
        if (!lineWasEmpty) {
            ctx.print('(');
        }
        expr.receiver.visitExpression(this, ctx);
        ctx.print(`.${expr.name} = `);
        expr.value.visitExpression(this, ctx);
        if (!lineWasEmpty) {
            ctx.print(')');
        }
        return null;
    }
    visitInvokeMethodExpr(expr, ctx) {
        expr.receiver.visitExpression(this, ctx);
        var name = expr.name;
        if (isPresent(expr.builtin)) {
            name = this.getBuiltinMethodName(expr.builtin);
            if (isBlank(name)) {
                // some builtins just mean to skip the call.
                // e.g. `bind` in Dart.
                return null;
            }
        }
        ctx.print(`.${name}(`);
        this.visitAllExpressions(expr.args, ctx, `,`);
        ctx.print(`)`);
        return null;
    }
    visitInvokeFunctionExpr(expr, ctx) {
        expr.fn.visitExpression(this, ctx);
        ctx.print(`(`);
        this.visitAllExpressions(expr.args, ctx, ',');
        ctx.print(`)`);
        return null;
    }
    visitReadVarExpr(ast, ctx) {
        var varName = ast.name;
        if (isPresent(ast.builtin)) {
            switch (ast.builtin) {
                case o.BuiltinVar.Super:
                    varName = 'super';
                    break;
                case o.BuiltinVar.This:
                    varName = 'this';
                    break;
                case o.BuiltinVar.CatchError:
                    varName = CATCH_ERROR_VAR.name;
                    break;
                case o.BuiltinVar.CatchStack:
                    varName = CATCH_STACK_VAR.name;
                    break;
                default:
                    throw new BaseException(`Unknown builtin variable ${ast.builtin}`);
            }
        }
        ctx.print(varName);
        return null;
    }
    visitInstantiateExpr(ast, ctx) {
        ctx.print(`new `);
        ast.classExpr.visitExpression(this, ctx);
        ctx.print(`(`);
        this.visitAllExpressions(ast.args, ctx, ',');
        ctx.print(`)`);
        return null;
    }
    visitLiteralExpr(ast, ctx) {
        var value = ast.value;
        if (isString(value)) {
            ctx.print(escapeSingleQuoteString(value, this._escapeDollarInStrings));
        }
        else if (isBlank(value)) {
            ctx.print('null');
        }
        else {
            ctx.print(`${value}`);
        }
        return null;
    }
    visitConditionalExpr(ast, ctx) {
        ctx.print(`(`);
        ast.condition.visitExpression(this, ctx);
        ctx.print('? ');
        ast.trueCase.visitExpression(this, ctx);
        ctx.print(': ');
        ast.falseCase.visitExpression(this, ctx);
        ctx.print(`)`);
        return null;
    }
    visitNotExpr(ast, ctx) {
        ctx.print('!');
        ast.condition.visitExpression(this, ctx);
        return null;
    }
    visitBinaryOperatorExpr(ast, ctx) {
        var opStr;
        switch (ast.operator) {
            case o.BinaryOperator.Equals:
                opStr = '==';
                break;
            case o.BinaryOperator.Identical:
                opStr = '===';
                break;
            case o.BinaryOperator.NotEquals:
                opStr = '!=';
                break;
            case o.BinaryOperator.NotIdentical:
                opStr = '!==';
                break;
            case o.BinaryOperator.And:
                opStr = '&&';
                break;
            case o.BinaryOperator.Or:
                opStr = '||';
                break;
            case o.BinaryOperator.Plus:
                opStr = '+';
                break;
            case o.BinaryOperator.Minus:
                opStr = '-';
                break;
            case o.BinaryOperator.Divide:
                opStr = '/';
                break;
            case o.BinaryOperator.Multiply:
                opStr = '*';
                break;
            case o.BinaryOperator.Modulo:
                opStr = '%';
                break;
            case o.BinaryOperator.Lower:
                opStr = '<';
                break;
            case o.BinaryOperator.LowerEquals:
                opStr = '<=';
                break;
            case o.BinaryOperator.Bigger:
                opStr = '>';
                break;
            case o.BinaryOperator.BiggerEquals:
                opStr = '>=';
                break;
            default:
                throw new BaseException(`Unknown operator ${ast.operator}`);
        }
        ctx.print(`(`);
        ast.lhs.visitExpression(this, ctx);
        ctx.print(` ${opStr} `);
        ast.rhs.visitExpression(this, ctx);
        ctx.print(`)`);
        return null;
    }
    visitReadPropExpr(ast, ctx) {
        ast.receiver.visitExpression(this, ctx);
        ctx.print(`.`);
        ctx.print(ast.name);
        return null;
    }
    visitReadKeyExpr(ast, ctx) {
        ast.receiver.visitExpression(this, ctx);
        ctx.print(`[`);
        ast.index.visitExpression(this, ctx);
        ctx.print(`]`);
        return null;
    }
    visitLiteralArrayExpr(ast, ctx) {
        var useNewLine = ast.entries.length > 1;
        ctx.print(`[`, useNewLine);
        ctx.incIndent();
        this.visitAllExpressions(ast.entries, ctx, ',', useNewLine);
        ctx.decIndent();
        ctx.print(`]`, useNewLine);
        return null;
    }
    visitLiteralMapExpr(ast, ctx) {
        var useNewLine = ast.entries.length > 1;
        ctx.print(`{`, useNewLine);
        ctx.incIndent();
        this.visitAllObjects((entry) => {
            ctx.print(`${escapeSingleQuoteString(entry[0], this._escapeDollarInStrings)}: `);
            entry[1].visitExpression(this, ctx);
        }, ast.entries, ctx, ',', useNewLine);
        ctx.decIndent();
        ctx.print(`}`, useNewLine);
        return null;
    }
    visitAllExpressions(expressions, ctx, separator, newLine = false) {
        this.visitAllObjects((expr) => expr.visitExpression(this, ctx), expressions, ctx, separator, newLine);
    }
    visitAllObjects(handler, expressions, ctx, separator, newLine = false) {
        for (var i = 0; i < expressions.length; i++) {
            if (i > 0) {
                ctx.print(separator, newLine);
            }
            handler(expressions[i]);
        }
        if (newLine) {
            ctx.println();
        }
    }
    visitAllStatements(statements, ctx) {
        statements.forEach((stmt) => { return stmt.visitStatement(this, ctx); });
    }
}
export function escapeSingleQuoteString(input, escapeDollar) {
    if (isBlank(input)) {
        return null;
    }
    var body = StringWrapper.replaceAllMapped(input, _SINGLE_QUOTE_ESCAPE_STRING_RE, (match) => {
        if (match[0] == '$') {
            return escapeDollar ? '\\$' : '$';
        }
        else if (match[0] == '\n') {
            return '\\n';
        }
        else if (match[0] == '\r') {
            return '\\r';
        }
        else {
            return `\\${match[0]}`;
        }
    });
    return `'${body}'`;
}
function _createIndent(count) {
    var res = '';
    for (var i = 0; i < count; i++) {
        res += '  ';
    }
    return res;
}
