'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var abstract_emitter_1 = require('./abstract_emitter');
var abstract_js_emitter_1 = require('./abstract_js_emitter');
var util_1 = require('../util');
function jitStatements(sourceUrl, statements, resultVar) {
    var converter = new JitEmitterVisitor();
    var ctx = abstract_emitter_1.EmitterVisitorContext.createRoot([resultVar]);
    converter.visitAllStatements(statements, ctx);
    return lang_1.evalExpression(sourceUrl, resultVar, ctx.toSource(), converter.getArgs());
}
exports.jitStatements = jitStatements;
var JitEmitterVisitor = (function (_super) {
    __extends(JitEmitterVisitor, _super);
    function JitEmitterVisitor() {
        _super.apply(this, arguments);
        this._evalArgNames = [];
        this._evalArgValues = [];
    }
    JitEmitterVisitor.prototype.getArgs = function () {
        var result = {};
        for (var i = 0; i < this._evalArgNames.length; i++) {
            result[this._evalArgNames[i]] = this._evalArgValues[i];
        }
        return result;
    };
    JitEmitterVisitor.prototype.visitExternalExpr = function (ast, ctx) {
        var value = ast.value.runtime;
        var id = this._evalArgValues.indexOf(value);
        if (id === -1) {
            id = this._evalArgValues.length;
            this._evalArgValues.push(value);
            var name = lang_1.isPresent(ast.value.name) ? util_1.sanitizeIdentifier(ast.value.name) : 'val';
            this._evalArgNames.push(util_1.sanitizeIdentifier("jit_" + name + id));
        }
        ctx.print(this._evalArgNames[id]);
        return null;
    };
    return JitEmitterVisitor;
}(abstract_js_emitter_1.AbstractJsEmitterVisitor));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2ppdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9vdXRwdXQvb3V0cHV0X2ppdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxxQkFPTywwQkFBMEIsQ0FBQyxDQUFBO0FBRWxDLGlDQUFvQyxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3pELG9DQUF1Qyx1QkFBdUIsQ0FBQyxDQUFBO0FBQy9ELHFCQUFpQyxTQUFTLENBQUMsQ0FBQTtBQUUzQyx1QkFBOEIsU0FBaUIsRUFBRSxVQUF5QixFQUM1QyxTQUFpQjtJQUM3QyxJQUFJLFNBQVMsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7SUFDeEMsSUFBSSxHQUFHLEdBQUcsd0NBQXFCLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUN4RCxTQUFTLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzlDLE1BQU0sQ0FBQyxxQkFBYyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ25GLENBQUM7QUFOZSxxQkFBYSxnQkFNNUIsQ0FBQTtBQUVEO0lBQWdDLHFDQUF3QjtJQUF4RDtRQUFnQyw4QkFBd0I7UUFDOUMsa0JBQWEsR0FBYSxFQUFFLENBQUM7UUFDN0IsbUJBQWMsR0FBVSxFQUFFLENBQUM7SUFzQnJDLENBQUM7SUFwQkMsbUNBQU8sR0FBUDtRQUNFLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbkQsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCw2Q0FBaUIsR0FBakIsVUFBa0IsR0FBbUIsRUFBRSxHQUEwQjtRQUMvRCxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUM5QixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2QsRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hDLElBQUksSUFBSSxHQUFHLGdCQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyx5QkFBa0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNsRixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyx5QkFBa0IsQ0FBQyxTQUFPLElBQUksR0FBRyxFQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFDRCxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNILHdCQUFDO0FBQUQsQ0FBQyxBQXhCRCxDQUFnQyw4Q0FBd0IsR0F3QnZEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBpc1N0cmluZyxcbiAgZXZhbEV4cHJlc3Npb24sXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIFN0cmluZ1dyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXRfYXN0JztcbmltcG9ydCB7RW1pdHRlclZpc2l0b3JDb250ZXh0fSBmcm9tICcuL2Fic3RyYWN0X2VtaXR0ZXInO1xuaW1wb3J0IHtBYnN0cmFjdEpzRW1pdHRlclZpc2l0b3J9IGZyb20gJy4vYWJzdHJhY3RfanNfZW1pdHRlcic7XG5pbXBvcnQge3Nhbml0aXplSWRlbnRpZmllcn0gZnJvbSAnLi4vdXRpbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBqaXRTdGF0ZW1lbnRzKHNvdXJjZVVybDogc3RyaW5nLCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0VmFyOiBzdHJpbmcpOiBhbnkge1xuICB2YXIgY29udmVydGVyID0gbmV3IEppdEVtaXR0ZXJWaXNpdG9yKCk7XG4gIHZhciBjdHggPSBFbWl0dGVyVmlzaXRvckNvbnRleHQuY3JlYXRlUm9vdChbcmVzdWx0VmFyXSk7XG4gIGNvbnZlcnRlci52aXNpdEFsbFN0YXRlbWVudHMoc3RhdGVtZW50cywgY3R4KTtcbiAgcmV0dXJuIGV2YWxFeHByZXNzaW9uKHNvdXJjZVVybCwgcmVzdWx0VmFyLCBjdHgudG9Tb3VyY2UoKSwgY29udmVydGVyLmdldEFyZ3MoKSk7XG59XG5cbmNsYXNzIEppdEVtaXR0ZXJWaXNpdG9yIGV4dGVuZHMgQWJzdHJhY3RKc0VtaXR0ZXJWaXNpdG9yIHtcbiAgcHJpdmF0ZSBfZXZhbEFyZ05hbWVzOiBzdHJpbmdbXSA9IFtdO1xuICBwcml2YXRlIF9ldmFsQXJnVmFsdWVzOiBhbnlbXSA9IFtdO1xuXG4gIGdldEFyZ3MoKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2V2YWxBcmdOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0W3RoaXMuX2V2YWxBcmdOYW1lc1tpXV0gPSB0aGlzLl9ldmFsQXJnVmFsdWVzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmlzaXRFeHRlcm5hbEV4cHIoYXN0OiBvLkV4dGVybmFsRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIHZhciB2YWx1ZSA9IGFzdC52YWx1ZS5ydW50aW1lO1xuICAgIHZhciBpZCA9IHRoaXMuX2V2YWxBcmdWYWx1ZXMuaW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKGlkID09PSAtMSkge1xuICAgICAgaWQgPSB0aGlzLl9ldmFsQXJnVmFsdWVzLmxlbmd0aDtcbiAgICAgIHRoaXMuX2V2YWxBcmdWYWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICB2YXIgbmFtZSA9IGlzUHJlc2VudChhc3QudmFsdWUubmFtZSkgPyBzYW5pdGl6ZUlkZW50aWZpZXIoYXN0LnZhbHVlLm5hbWUpIDogJ3ZhbCc7XG4gICAgICB0aGlzLl9ldmFsQXJnTmFtZXMucHVzaChzYW5pdGl6ZUlkZW50aWZpZXIoYGppdF8ke25hbWV9JHtpZH1gKSk7XG4gICAgfVxuICAgIGN0eC5wcmludCh0aGlzLl9ldmFsQXJnTmFtZXNbaWRdKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIl19