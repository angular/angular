import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { EmitterVisitorContext } from './abstract_emitter';
import { AbstractJsEmitterVisitor } from './abstract_js_emitter';
import { getImportModulePath, ImportEnv } from './path_util';
export class JavaScriptEmitter {
    constructor() {
    }
    emitStatements(moduleUrl, stmts, exportedVars) {
        var converter = new JsEmitterVisitor(moduleUrl);
        var ctx = EmitterVisitorContext.createRoot(exportedVars);
        converter.visitAllStatements(stmts, ctx);
        var srcParts = [];
        converter.importsWithPrefixes.forEach((prefix, importedModuleUrl) => {
            // Note: can't write the real word for import as it screws up system.js auto detection...
            srcParts.push(`var ${prefix} = req` +
                `uire('${getImportModulePath(moduleUrl, importedModuleUrl, ImportEnv.JS)}');`);
        });
        srcParts.push(ctx.toSource());
        return srcParts.join('\n');
    }
}
class JsEmitterVisitor extends AbstractJsEmitterVisitor {
    constructor(_moduleUrl) {
        super();
        this._moduleUrl = _moduleUrl;
        this.importsWithPrefixes = new Map();
    }
    visitExternalExpr(ast, ctx) {
        if (isBlank(ast.value.name)) {
            throw new BaseException(`Internal error: unknown identifier ${ast.value}`);
        }
        if (isPresent(ast.value.moduleUrl) && ast.value.moduleUrl != this._moduleUrl) {
            var prefix = this.importsWithPrefixes.get(ast.value.moduleUrl);
            if (isBlank(prefix)) {
                prefix = `import${this.importsWithPrefixes.size}`;
                this.importsWithPrefixes.set(ast.value.moduleUrl, prefix);
            }
            ctx.print(`${prefix}.`);
        }
        ctx.print(ast.value.name);
        return null;
    }
    visitDeclareVarStmt(stmt, ctx) {
        super.visitDeclareVarStmt(stmt, ctx);
        if (ctx.isExportedVar(stmt.name)) {
            ctx.println(exportVar(stmt.name));
        }
        return null;
    }
    visitDeclareFunctionStmt(stmt, ctx) {
        super.visitDeclareFunctionStmt(stmt, ctx);
        if (ctx.isExportedVar(stmt.name)) {
            ctx.println(exportVar(stmt.name));
        }
        return null;
    }
    visitDeclareClassStmt(stmt, ctx) {
        super.visitDeclareClassStmt(stmt, ctx);
        if (ctx.isExportedVar(stmt.name)) {
            ctx.println(exportVar(stmt.name));
        }
        return null;
    }
}
function exportVar(varName) {
    return `Object.defineProperty(exports, '${varName}', { get: function() { return ${varName}; }});`;
}
