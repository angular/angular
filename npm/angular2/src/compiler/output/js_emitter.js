'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var abstract_emitter_1 = require('./abstract_emitter');
var abstract_js_emitter_1 = require('./abstract_js_emitter');
var path_util_1 = require('./path_util');
var JavaScriptEmitter = (function () {
    function JavaScriptEmitter() {
    }
    JavaScriptEmitter.prototype.emitStatements = function (moduleUrl, stmts, exportedVars) {
        var converter = new JsEmitterVisitor(moduleUrl);
        var ctx = abstract_emitter_1.EmitterVisitorContext.createRoot(exportedVars);
        converter.visitAllStatements(stmts, ctx);
        var srcParts = [];
        converter.importsWithPrefixes.forEach(function (prefix, importedModuleUrl) {
            // Note: can't write the real word for import as it screws up system.js auto detection...
            srcParts.push(("var " + prefix + " = req") +
                ("uire('" + path_util_1.getImportModulePath(moduleUrl, importedModuleUrl, path_util_1.ImportEnv.JS) + "');"));
        });
        srcParts.push(ctx.toSource());
        return srcParts.join('\n');
    };
    return JavaScriptEmitter;
}());
exports.JavaScriptEmitter = JavaScriptEmitter;
var JsEmitterVisitor = (function (_super) {
    __extends(JsEmitterVisitor, _super);
    function JsEmitterVisitor(_moduleUrl) {
        _super.call(this);
        this._moduleUrl = _moduleUrl;
        this.importsWithPrefixes = new Map();
    }
    JsEmitterVisitor.prototype.visitExternalExpr = function (ast, ctx) {
        if (lang_1.isBlank(ast.value.name)) {
            throw new exceptions_1.BaseException("Internal error: unknown identifier " + ast.value);
        }
        if (lang_1.isPresent(ast.value.moduleUrl) && ast.value.moduleUrl != this._moduleUrl) {
            var prefix = this.importsWithPrefixes.get(ast.value.moduleUrl);
            if (lang_1.isBlank(prefix)) {
                prefix = "import" + this.importsWithPrefixes.size;
                this.importsWithPrefixes.set(ast.value.moduleUrl, prefix);
            }
            ctx.print(prefix + ".");
        }
        ctx.print(ast.value.name);
        return null;
    };
    JsEmitterVisitor.prototype.visitDeclareVarStmt = function (stmt, ctx) {
        _super.prototype.visitDeclareVarStmt.call(this, stmt, ctx);
        if (ctx.isExportedVar(stmt.name)) {
            ctx.println(exportVar(stmt.name));
        }
        return null;
    };
    JsEmitterVisitor.prototype.visitDeclareFunctionStmt = function (stmt, ctx) {
        _super.prototype.visitDeclareFunctionStmt.call(this, stmt, ctx);
        if (ctx.isExportedVar(stmt.name)) {
            ctx.println(exportVar(stmt.name));
        }
        return null;
    };
    JsEmitterVisitor.prototype.visitDeclareClassStmt = function (stmt, ctx) {
        _super.prototype.visitDeclareClassStmt.call(this, stmt, ctx);
        if (ctx.isExportedVar(stmt.name)) {
            ctx.println(exportVar(stmt.name));
        }
        return null;
    };
    return JsEmitterVisitor;
}(abstract_js_emitter_1.AbstractJsEmitterVisitor));
function exportVar(varName) {
    return "Object.defineProperty(exports, '" + varName + "', { get: function() { return " + varName + "; }});";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNfZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9vdXRwdXQvanNfZW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxxQkFPTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELGlDQUFtRCxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3hFLG9DQUF1Qyx1QkFBdUIsQ0FBQyxDQUFBO0FBQy9ELDBCQUE2QyxhQUFhLENBQUMsQ0FBQTtBQUUzRDtJQUNFO0lBQWUsQ0FBQztJQUNoQiwwQ0FBYyxHQUFkLFVBQWUsU0FBaUIsRUFBRSxLQUFvQixFQUFFLFlBQXNCO1FBQzVFLElBQUksU0FBUyxHQUFHLElBQUksZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEQsSUFBSSxHQUFHLEdBQUcsd0NBQXFCLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3pELFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDekMsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLEVBQUUsaUJBQWlCO1lBQzlELHlGQUF5RjtZQUN6RixRQUFRLENBQUMsSUFBSSxDQUFDLFVBQU8sTUFBTSxZQUFRO2dCQUNyQixZQUFTLCtCQUFtQixDQUFDLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxxQkFBUyxDQUFDLEVBQUUsQ0FBQyxTQUFLLENBQUMsQ0FBQztRQUMvRixDQUFDLENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDOUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJ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QUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNILHVCQUFDO0FBQUQsQ0FBQyxBQXpDRCxDQUErQiw4Q0FBd0IsR0F5Q3REO0FBRUQsbUJBQW1CLE9BQWU7SUFDaEMsTUFBTSxDQUFDLHFDQUFtQyxPQUFPLHNDQUFpQyxPQUFPLFdBQVEsQ0FBQztBQUNwRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbyBmcm9tICcuL291dHB1dF9hc3QnO1xuaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBpc1N0cmluZyxcbiAgZXZhbEV4cHJlc3Npb24sXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIFN0cmluZ1dyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7T3V0cHV0RW1pdHRlciwgRW1pdHRlclZpc2l0b3JDb250ZXh0fSBmcm9tICcuL2Fic3RyYWN0X2VtaXR0ZXInO1xuaW1wb3J0IHtBYnN0cmFjdEpzRW1pdHRlclZpc2l0b3J9IGZyb20gJy4vYWJzdHJhY3RfanNfZW1pdHRlcic7XG5pbXBvcnQge2dldEltcG9ydE1vZHVsZVBhdGgsIEltcG9ydEVudn0gZnJvbSAnLi9wYXRoX3V0aWwnO1xuXG5leHBvcnQgY2xhc3MgSmF2YVNjcmlwdEVtaXR0ZXIgaW1wbGVtZW50cyBPdXRwdXRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuICBlbWl0U3RhdGVtZW50cyhtb2R1bGVVcmw6IHN0cmluZywgc3RtdHM6IG8uU3RhdGVtZW50W10sIGV4cG9ydGVkVmFyczogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgIHZhciBjb252ZXJ0ZXIgPSBuZXcgSnNFbWl0dGVyVmlzaXRvcihtb2R1bGVVcmwpO1xuICAgIHZhciBjdHggPSBFbWl0dGVyVmlzaXRvckNvbnRleHQuY3JlYXRlUm9vdChleHBvcnRlZFZhcnMpO1xuICAgIGNvbnZlcnRlci52aXNpdEFsbFN0YXRlbWVudHMoc3RtdHMsIGN0eCk7XG4gICAgdmFyIHNyY1BhcnRzID0gW107XG4gICAgY29udmVydGVyLmltcG9ydHNXaXRoUHJlZml4ZXMuZm9yRWFjaCgocHJlZml4LCBpbXBvcnRlZE1vZHVsZVVybCkgPT4ge1xuICAgICAgLy8gTm90ZTogY2FuJ3Qgd3JpdGUgdGhlIHJlYWwgd29yZCBmb3IgaW1wb3J0IGFzIGl0IHNjcmV3cyB1cCBzeXN0ZW0uanMgYXV0byBkZXRlY3Rpb24uLi5cbiAgICAgIHNyY1BhcnRzLnB1c2goYHZhciAke3ByZWZpeH0gPSByZXFgICtcbiAgICAgICAgICAgICAgICAgICAgYHVpcmUoJyR7Z2V0SW1wb3J0TW9kdWxlUGF0aChtb2R1bGVVcmwsIGltcG9ydGVkTW9kdWxlVXJsLCBJbXBvcnRFbnYuSlMpfScpO2ApO1xuICAgIH0pO1xuICAgIHNyY1BhcnRzLnB1c2goY3R4LnRvU291cmNlKCkpO1xuICAgIHJldHVybiBzcmNQYXJ0cy5qb2luKCdcXG4nKTtcbiAgfVxufVxuXG5jbGFzcyBKc0VtaXR0ZXJWaXNpdG9yIGV4dGVuZHMgQWJzdHJhY3RKc0VtaXR0ZXJWaXNpdG9yIHtcbiAgaW1wb3J0c1dpdGhQcmVmaXhlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbW9kdWxlVXJsOiBzdHJpbmcpIHsgc3VwZXIoKTsgfVxuXG4gIHZpc2l0RXh0ZXJuYWxFeHByKGFzdDogby5FeHRlcm5hbEV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBpZiAoaXNCbGFuayhhc3QudmFsdWUubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBJbnRlcm5hbCBlcnJvcjogdW5rbm93biBpZGVudGlmaWVyICR7YXN0LnZhbHVlfWApO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KGFzdC52YWx1ZS5tb2R1bGVVcmwpICYmIGFzdC52YWx1ZS5tb2R1bGVVcmwgIT0gdGhpcy5fbW9kdWxlVXJsKSB7XG4gICAgICB2YXIgcHJlZml4ID0gdGhpcy5pbXBvcnRzV2l0aFByZWZpeGVzLmdldChhc3QudmFsdWUubW9kdWxlVXJsKTtcbiAgICAgIGlmIChpc0JsYW5rKHByZWZpeCkpIHtcbiAgICAgICAgcHJlZml4ID0gYGltcG9ydCR7dGhpcy5pbXBvcnRzV2l0aFByZWZpeGVzLnNpemV9YDtcbiAgICAgICAgdGhpcy5pbXBvcnRzV2l0aFByZWZpeGVzLnNldChhc3QudmFsdWUubW9kdWxlVXJsLCBwcmVmaXgpO1xuICAgICAgfVxuICAgICAgY3R4LnByaW50KGAke3ByZWZpeH0uYCk7XG4gICAgfVxuICAgIGN0eC5wcmludChhc3QudmFsdWUubmFtZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXREZWNsYXJlVmFyU3RtdChzdG10OiBvLkRlY2xhcmVWYXJTdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgc3VwZXIudmlzaXREZWNsYXJlVmFyU3RtdChzdG10LCBjdHgpO1xuICAgIGlmIChjdHguaXNFeHBvcnRlZFZhcihzdG10Lm5hbWUpKSB7XG4gICAgICBjdHgucHJpbnRsbihleHBvcnRWYXIoc3RtdC5uYW1lKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0RGVjbGFyZUZ1bmN0aW9uU3RtdChzdG10OiBvLkRlY2xhcmVGdW5jdGlvblN0bXQsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBzdXBlci52aXNpdERlY2xhcmVGdW5jdGlvblN0bXQoc3RtdCwgY3R4KTtcbiAgICBpZiAoY3R4LmlzRXhwb3J0ZWRWYXIoc3RtdC5uYW1lKSkge1xuICAgICAgY3R4LnByaW50bG4oZXhwb3J0VmFyKHN0bXQubmFtZSkpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdERlY2xhcmVDbGFzc1N0bXQoc3RtdDogby5DbGFzc1N0bXQsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBzdXBlci52aXNpdERlY2xhcmVDbGFzc1N0bXQoc3RtdCwgY3R4KTtcbiAgICBpZiAoY3R4LmlzRXhwb3J0ZWRWYXIoc3RtdC5uYW1lKSkge1xuICAgICAgY3R4LnByaW50bG4oZXhwb3J0VmFyKHN0bXQubmFtZSkpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBleHBvcnRWYXIodmFyTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJyR7dmFyTmFtZX0nLCB7IGdldDogZnVuY3Rpb24oKSB7IHJldHVybiAke3Zhck5hbWV9OyB9fSk7YDtcbn1cbiJdfQ==