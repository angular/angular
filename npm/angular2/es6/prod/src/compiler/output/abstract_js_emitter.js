import { isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import * as o from './output_ast';
import { AbstractEmitterVisitor, CATCH_ERROR_VAR, CATCH_STACK_VAR } from './abstract_emitter';
export class AbstractJsEmitterVisitor extends AbstractEmitterVisitor {
    constructor() {
        super(false);
    }
    visitDeclareClassStmt(stmt, ctx) {
        ctx.pushClass(stmt);
        this._visitClassConstructor(stmt, ctx);
        if (isPresent(stmt.parent)) {
            ctx.print(`${stmt.name}.prototype = Object.create(`);
            stmt.parent.visitExpression(this, ctx);
            ctx.println(`.prototype);`);
        }
        stmt.getters.forEach((getter) => this._visitClassGetter(stmt, getter, ctx));
        stmt.methods.forEach((method) => this._visitClassMethod(stmt, method, ctx));
        ctx.popClass();
        return null;
    }
    _visitClassConstructor(stmt, ctx) {
        ctx.print(`function ${stmt.name}(`);
        if (isPresent(stmt.constructorMethod)) {
            this._visitParams(stmt.constructorMethod.params, ctx);
        }
        ctx.println(`) {`);
        ctx.incIndent();
        if (isPresent(stmt.constructorMethod)) {
            if (stmt.constructorMethod.body.length > 0) {
                ctx.println(`var self = this;`);
                this.visitAllStatements(stmt.constructorMethod.body, ctx);
            }
        }
        ctx.decIndent();
        ctx.println(`}`);
    }
    _visitClassGetter(stmt, getter, ctx) {
        ctx.println(`Object.defineProperty(${stmt.name}.prototype, '${getter.name}', { get: function() {`);
        ctx.incIndent();
        if (getter.body.length > 0) {
            ctx.println(`var self = this;`);
            this.visitAllStatements(getter.body, ctx);
        }
        ctx.decIndent();
        ctx.println(`}});`);
    }
    _visitClassMethod(stmt, method, ctx) {
        ctx.print(`${stmt.name}.prototype.${method.name} = function(`);
        this._visitParams(method.params, ctx);
        ctx.println(`) {`);
        ctx.incIndent();
        if (method.body.length > 0) {
            ctx.println(`var self = this;`);
            this.visitAllStatements(method.body, ctx);
        }
        ctx.decIndent();
        ctx.println(`};`);
    }
    visitReadVarExpr(ast, ctx) {
        if (ast.builtin === o.BuiltinVar.This) {
            ctx.print('self');
        }
        else if (ast.builtin === o.BuiltinVar.Super) {
            throw new BaseException(`'super' needs to be handled at a parent ast node, not at the variable level!`);
        }
        else {
            super.visitReadVarExpr(ast, ctx);
        }
        return null;
    }
    visitDeclareVarStmt(stmt, ctx) {
        ctx.print(`var ${stmt.name} = `);
        stmt.value.visitExpression(this, ctx);
        ctx.println(`;`);
        return null;
    }
    visitCastExpr(ast, ctx) {
        ast.value.visitExpression(this, ctx);
        return null;
    }
    visitInvokeFunctionExpr(expr, ctx) {
        var fnExpr = expr.fn;
        if (fnExpr instanceof o.ReadVarExpr && fnExpr.builtin === o.BuiltinVar.Super) {
            ctx.currentClass.parent.visitExpression(this, ctx);
            ctx.print(`.call(this`);
            if (expr.args.length > 0) {
                ctx.print(`, `);
                this.visitAllExpressions(expr.args, ctx, ',');
            }
            ctx.print(`)`);
        }
        else {
            super.visitInvokeFunctionExpr(expr, ctx);
        }
        return null;
    }
    visitFunctionExpr(ast, ctx) {
        ctx.print(`function(`);
        this._visitParams(ast.params, ctx);
        ctx.println(`) {`);
        ctx.incIndent();
        this.visitAllStatements(ast.statements, ctx);
        ctx.decIndent();
        ctx.print(`}`);
        return null;
    }
    visitDeclareFunctionStmt(stmt, ctx) {
        ctx.print(`function ${stmt.name}(`);
        this._visitParams(stmt.params, ctx);
        ctx.println(`) {`);
        ctx.incIndent();
        this.visitAllStatements(stmt.statements, ctx);
        ctx.decIndent();
        ctx.println(`}`);
        return null;
    }
    visitTryCatchStmt(stmt, ctx) {
        ctx.println(`try {`);
        ctx.incIndent();
        this.visitAllStatements(stmt.bodyStmts, ctx);
        ctx.decIndent();
        ctx.println(`} catch (${CATCH_ERROR_VAR.name}) {`);
        ctx.incIndent();
        var catchStmts = [
            CATCH_STACK_VAR.set(CATCH_ERROR_VAR.prop('stack'))
                .toDeclStmt(null, [o.StmtModifier.Final])
        ].concat(stmt.catchStmts);
        this.visitAllStatements(catchStmts, ctx);
        ctx.decIndent();
        ctx.println(`}`);
        return null;
    }
    _visitParams(params, ctx) {
        this.visitAllObjects((param) => ctx.print(param.name), params, ctx, ',');
    }
    getBuiltinMethodName(method) {
        var name;
        switch (method) {
            case o.BuiltinMethod.ConcatArray:
                name = 'concat';
                break;
            case o.BuiltinMethod.SubscribeObservable:
                name = 'subscribe';
                break;
            case o.BuiltinMethod.bind:
                name = 'bind';
                break;
            default:
                throw new BaseException(`Unknown builtin method: ${method}`);
        }
        return name;
    }
}
