import * as o from './output_ast';
import { isPresent, isBlank, isArray } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { EmitterVisitorContext, AbstractEmitterVisitor, CATCH_ERROR_VAR, CATCH_STACK_VAR } from './abstract_emitter';
import { getImportModulePath, ImportEnv } from './path_util';
var _debugModuleUrl = 'asset://debug/lib';
export function debugOutputAstAsTypeScript(ast) {
    var converter = new _TsEmitterVisitor(_debugModuleUrl);
    var ctx = EmitterVisitorContext.createRoot([]);
    var asts;
    if (isArray(ast)) {
        asts = ast;
    }
    else {
        asts = [ast];
    }
    asts.forEach((ast) => {
        if (ast instanceof o.Statement) {
            ast.visitStatement(converter, ctx);
        }
        else if (ast instanceof o.Expression) {
            ast.visitExpression(converter, ctx);
        }
        else if (ast instanceof o.Type) {
            ast.visitType(converter, ctx);
        }
        else {
            throw new BaseException(`Don't know how to print debug info for ${ast}`);
        }
    });
    return ctx.toSource();
}
export class TypeScriptEmitter {
    constructor() {
    }
    emitStatements(moduleUrl, stmts, exportedVars) {
        var converter = new _TsEmitterVisitor(moduleUrl);
        var ctx = EmitterVisitorContext.createRoot(exportedVars);
        converter.visitAllStatements(stmts, ctx);
        var srcParts = [];
        converter.importsWithPrefixes.forEach((prefix, importedModuleUrl) => {
            // Note: can't write the real word for import as it screws up system.js auto detection...
            srcParts.push(`imp` +
                `ort * as ${prefix} from '${getImportModulePath(moduleUrl, importedModuleUrl, ImportEnv.JS)}';`);
        });
        srcParts.push(ctx.toSource());
        return srcParts.join('\n');
    }
}
class _TsEmitterVisitor extends AbstractEmitterVisitor {
    constructor(_moduleUrl) {
        super(false);
        this._moduleUrl = _moduleUrl;
        this.importsWithPrefixes = new Map();
    }
    visitExternalExpr(ast, ctx) {
        this._visitIdentifier(ast.value, ast.typeParams, ctx);
        return null;
    }
    visitDeclareVarStmt(stmt, ctx) {
        if (ctx.isExportedVar(stmt.name)) {
            ctx.print(`export `);
        }
        if (stmt.hasModifier(o.StmtModifier.Final)) {
            ctx.print(`const`);
        }
        else {
            ctx.print(`var`);
        }
        ctx.print(` ${stmt.name}`);
        if (isPresent(stmt.type)) {
            ctx.print(`:`);
            stmt.type.visitType(this, ctx);
        }
        ctx.print(` = `);
        stmt.value.visitExpression(this, ctx);
        ctx.println(`;`);
        return null;
    }
    visitCastExpr(ast, ctx) {
        ctx.print(`(<`);
        ast.type.visitType(this, ctx);
        ctx.print(`>`);
        ast.value.visitExpression(this, ctx);
        ctx.print(`)`);
        return null;
    }
    visitDeclareClassStmt(stmt, ctx) {
        ctx.pushClass(stmt);
        if (ctx.isExportedVar(stmt.name)) {
            ctx.print(`export `);
        }
        ctx.print(`class ${stmt.name}`);
        if (isPresent(stmt.parent)) {
            ctx.print(` extends `);
            stmt.parent.visitExpression(this, ctx);
        }
        ctx.println(` {`);
        ctx.incIndent();
        stmt.fields.forEach((field) => this._visitClassField(field, ctx));
        if (isPresent(stmt.constructorMethod)) {
            this._visitClassConstructor(stmt, ctx);
        }
        stmt.getters.forEach((getter) => this._visitClassGetter(getter, ctx));
        stmt.methods.forEach((method) => this._visitClassMethod(method, ctx));
        ctx.decIndent();
        ctx.println(`}`);
        ctx.popClass();
        return null;
    }
    _visitClassField(field, ctx) {
        if (field.hasModifier(o.StmtModifier.Private)) {
            ctx.print(`private `);
        }
        ctx.print(field.name);
        if (isPresent(field.type)) {
            ctx.print(`:`);
            field.type.visitType(this, ctx);
        }
        else {
            ctx.print(`: any`);
        }
        ctx.println(`;`);
    }
    _visitClassGetter(getter, ctx) {
        if (getter.hasModifier(o.StmtModifier.Private)) {
            ctx.print(`private `);
        }
        ctx.print(`get ${getter.name}()`);
        if (isPresent(getter.type)) {
            ctx.print(`:`);
            getter.type.visitType(this, ctx);
        }
        ctx.println(` {`);
        ctx.incIndent();
        this.visitAllStatements(getter.body, ctx);
        ctx.decIndent();
        ctx.println(`}`);
    }
    _visitClassConstructor(stmt, ctx) {
        ctx.print(`constructor(`);
        this._visitParams(stmt.constructorMethod.params, ctx);
        ctx.println(`) {`);
        ctx.incIndent();
        this.visitAllStatements(stmt.constructorMethod.body, ctx);
        ctx.decIndent();
        ctx.println(`}`);
    }
    _visitClassMethod(method, ctx) {
        if (method.hasModifier(o.StmtModifier.Private)) {
            ctx.print(`private `);
        }
        ctx.print(`${method.name}(`);
        this._visitParams(method.params, ctx);
        ctx.print(`):`);
        if (isPresent(method.type)) {
            method.type.visitType(this, ctx);
        }
        else {
            ctx.print(`void`);
        }
        ctx.println(` {`);
        ctx.incIndent();
        this.visitAllStatements(method.body, ctx);
        ctx.decIndent();
        ctx.println(`}`);
    }
    visitFunctionExpr(ast, ctx) {
        ctx.print(`(`);
        this._visitParams(ast.params, ctx);
        ctx.print(`):`);
        if (isPresent(ast.type)) {
            ast.type.visitType(this, ctx);
        }
        else {
            ctx.print(`void`);
        }
        ctx.println(` => {`);
        ctx.incIndent();
        this.visitAllStatements(ast.statements, ctx);
        ctx.decIndent();
        ctx.print(`}`);
        return null;
    }
    visitDeclareFunctionStmt(stmt, ctx) {
        if (ctx.isExportedVar(stmt.name)) {
            ctx.print(`export `);
        }
        ctx.print(`function ${stmt.name}(`);
        this._visitParams(stmt.params, ctx);
        ctx.print(`):`);
        if (isPresent(stmt.type)) {
            stmt.type.visitType(this, ctx);
        }
        else {
            ctx.print(`void`);
        }
        ctx.println(` {`);
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
    visitBuiltintType(type, ctx) {
        var typeStr;
        switch (type.name) {
            case o.BuiltinTypeName.Bool:
                typeStr = 'boolean';
                break;
            case o.BuiltinTypeName.Dynamic:
                typeStr = 'any';
                break;
            case o.BuiltinTypeName.Function:
                typeStr = 'Function';
                break;
            case o.BuiltinTypeName.Number:
                typeStr = 'number';
                break;
            case o.BuiltinTypeName.Int:
                typeStr = 'number';
                break;
            case o.BuiltinTypeName.String:
                typeStr = 'string';
                break;
            default:
                throw new BaseException(`Unsupported builtin type ${type.name}`);
        }
        ctx.print(typeStr);
        return null;
    }
    visitExternalType(ast, ctx) {
        this._visitIdentifier(ast.value, ast.typeParams, ctx);
        return null;
    }
    visitArrayType(type, ctx) {
        if (isPresent(type.of)) {
            type.of.visitType(this, ctx);
        }
        else {
            ctx.print(`any`);
        }
        ctx.print(`[]`);
        return null;
    }
    visitMapType(type, ctx) {
        ctx.print(`{[key: string]:`);
        if (isPresent(type.valueType)) {
            type.valueType.visitType(this, ctx);
        }
        else {
            ctx.print(`any`);
        }
        ctx.print(`}`);
        return null;
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
    _visitParams(params, ctx) {
        this.visitAllObjects((param) => {
            ctx.print(param.name);
            if (isPresent(param.type)) {
                ctx.print(`:`);
                param.type.visitType(this, ctx);
            }
        }, params, ctx, ',');
    }
    _visitIdentifier(value, typeParams, ctx) {
        if (isBlank(value.name)) {
            throw new BaseException(`Internal error: unknown identifier ${value}`);
        }
        if (isPresent(value.moduleUrl) && value.moduleUrl != this._moduleUrl) {
            var prefix = this.importsWithPrefixes.get(value.moduleUrl);
            if (isBlank(prefix)) {
                prefix = `import${this.importsWithPrefixes.size}`;
                this.importsWithPrefixes.set(value.moduleUrl, prefix);
            }
            ctx.print(`${prefix}.`);
        }
        ctx.print(value.name);
        if (isPresent(typeParams) && typeParams.length > 0) {
            ctx.print(`<`);
            this.visitAllObjects((type) => type.visitType(this, ctx), typeParams, ctx, ',');
            ctx.print(`>`);
        }
    }
}
