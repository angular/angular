'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var compiler_1 = require('angular2/src/core/linker/compiler');
var view_ref_1 = require('angular2/src/core/linker/view_ref');
var template_compiler_1 = require('./template_compiler');
var di_1 = require('angular2/src/core/di');
var RuntimeCompiler = (function (_super) {
    __extends(RuntimeCompiler, _super);
    function RuntimeCompiler() {
        _super.apply(this, arguments);
    }
    return RuntimeCompiler;
})(compiler_1.Compiler);
exports.RuntimeCompiler = RuntimeCompiler;
var RuntimeCompiler_ = (function (_super) {
    __extends(RuntimeCompiler_, _super);
    function RuntimeCompiler_(_templateCompiler) {
        _super.call(this);
        this._templateCompiler = _templateCompiler;
    }
    RuntimeCompiler_.prototype.compileInHost = function (componentType) {
        return this._templateCompiler.compileHostComponentRuntime(componentType)
            .then(function (hostViewFactory) { return new view_ref_1.HostViewFactoryRef_(hostViewFactory); });
    };
    RuntimeCompiler_.prototype.clearCache = function () {
        _super.prototype.clearCache.call(this);
        this._templateCompiler.clearCache();
    };
    RuntimeCompiler_ = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [template_compiler_1.TemplateCompiler])
    ], RuntimeCompiler_);
    return RuntimeCompiler_;
})(compiler_1.Compiler_);
exports.RuntimeCompiler_ = RuntimeCompiler_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbIlJ1bnRpbWVDb21waWxlciIsIlJ1bnRpbWVDb21waWxlci5jb25zdHJ1Y3RvciIsIlJ1bnRpbWVDb21waWxlcl8iLCJSdW50aW1lQ29tcGlsZXJfLmNvbnN0cnVjdG9yIiwiUnVudGltZUNvbXBpbGVyXy5jb21waWxlSW5Ib3N0IiwiUnVudGltZUNvbXBpbGVyXy5jbGVhckNhY2hlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHlCQUFrQyxtQ0FBbUMsQ0FBQyxDQUFBO0FBQ3RFLHlCQUFzRCxtQ0FBbUMsQ0FBQyxDQUFBO0FBQzFGLGtDQUErQixxQkFBcUIsQ0FBQyxDQUFBO0FBRXJELG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBSWhEO0lBQThDQSxtQ0FBUUE7SUFBdERBO1FBQThDQyw4QkFBUUE7SUFHdERBLENBQUNBO0lBQURELHNCQUFDQTtBQUFEQSxDQUFDQSxBQUhELEVBQThDLG1CQUFRLEVBR3JEO0FBSHFCLHVCQUFlLGtCQUdwQyxDQUFBO0FBRUQ7SUFDc0NFLG9DQUFTQTtJQUM3Q0EsMEJBQW9CQSxpQkFBbUNBO1FBQUlDLGlCQUFPQSxDQUFDQTtRQUEvQ0Esc0JBQWlCQSxHQUFqQkEsaUJBQWlCQSxDQUFrQkE7SUFBYUEsQ0FBQ0E7SUFFckVELHdDQUFhQSxHQUFiQSxVQUFjQSxhQUFtQkE7UUFDL0JFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxhQUFhQSxDQUFDQTthQUNuRUEsSUFBSUEsQ0FBQ0EsVUFBQUEsZUFBZUEsSUFBSUEsT0FBQUEsSUFBSUEsOEJBQW1CQSxDQUFDQSxlQUFlQSxDQUFDQSxFQUF4Q0EsQ0FBd0NBLENBQUNBLENBQUNBO0lBQ3pFQSxDQUFDQTtJQUVERixxQ0FBVUEsR0FBVkE7UUFDRUcsZ0JBQUtBLENBQUNBLFVBQVVBLFdBQUVBLENBQUNBO1FBQ25CQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO0lBQ3RDQSxDQUFDQTtJQVpISDtRQUFDQSxlQUFVQSxFQUFFQTs7eUJBYVpBO0lBQURBLHVCQUFDQTtBQUFEQSxDQUFDQSxBQWJELEVBQ3NDLG9CQUFTLEVBWTlDO0FBWlksd0JBQWdCLG1CQVk1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21waWxlciwgQ29tcGlsZXJffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcGlsZXInO1xuaW1wb3J0IHtIb3N0Vmlld0ZhY3RvcnlSZWYsIEhvc3RWaWV3RmFjdG9yeVJlZl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3JlZic7XG5pbXBvcnQge1RlbXBsYXRlQ29tcGlsZXJ9IGZyb20gJy4vdGVtcGxhdGVfY29tcGlsZXInO1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUnVudGltZUNvbXBpbGVyIGV4dGVuZHMgQ29tcGlsZXIge1xuICBhYnN0cmFjdCBjb21waWxlSW5Ib3N0KGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPEhvc3RWaWV3RmFjdG9yeVJlZj47XG4gIGFic3RyYWN0IGNsZWFyQ2FjaGUoKTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJ1bnRpbWVDb21waWxlcl8gZXh0ZW5kcyBDb21waWxlcl8gaW1wbGVtZW50cyBSdW50aW1lQ29tcGlsZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF90ZW1wbGF0ZUNvbXBpbGVyOiBUZW1wbGF0ZUNvbXBpbGVyKSB7IHN1cGVyKCk7IH1cblxuICBjb21waWxlSW5Ib3N0KGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPEhvc3RWaWV3RmFjdG9yeVJlZl8+IHtcbiAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVDb21waWxlci5jb21waWxlSG9zdENvbXBvbmVudFJ1bnRpbWUoY29tcG9uZW50VHlwZSlcbiAgICAgICAgLnRoZW4oaG9zdFZpZXdGYWN0b3J5ID0+IG5ldyBIb3N0Vmlld0ZhY3RvcnlSZWZfKGhvc3RWaWV3RmFjdG9yeSkpO1xuICB9XG5cbiAgY2xlYXJDYWNoZSgpIHtcbiAgICBzdXBlci5jbGVhckNhY2hlKCk7XG4gICAgdGhpcy5fdGVtcGxhdGVDb21waWxlci5jbGVhckNhY2hlKCk7XG4gIH1cbn1cbiJdfQ==