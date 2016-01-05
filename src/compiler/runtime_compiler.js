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
var proto_view_factory_1 = require('angular2/src/core/linker/proto_view_factory');
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
    function RuntimeCompiler_(_protoViewFactory, _templateCompiler) {
        _super.call(this, _protoViewFactory);
        this._templateCompiler = _templateCompiler;
    }
    RuntimeCompiler_.prototype.compileInHost = function (componentType) {
        var _this = this;
        return this._templateCompiler.compileHostComponentRuntime(componentType)
            .then(function (compiledHostTemplate) { return compiler_1.internalCreateProtoView(_this, compiledHostTemplate); });
    };
    RuntimeCompiler_.prototype.clearCache = function () {
        _super.prototype.clearCache.call(this);
        this._templateCompiler.clearCache();
    };
    RuntimeCompiler_ = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [proto_view_factory_1.ProtoViewFactory, template_compiler_1.TemplateCompiler])
    ], RuntimeCompiler_);
    return RuntimeCompiler_;
})(compiler_1.Compiler_);
exports.RuntimeCompiler_ = RuntimeCompiler_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbIlJ1bnRpbWVDb21waWxlciIsIlJ1bnRpbWVDb21waWxlci5jb25zdHJ1Y3RvciIsIlJ1bnRpbWVDb21waWxlcl8iLCJSdW50aW1lQ29tcGlsZXJfLmNvbnN0cnVjdG9yIiwiUnVudGltZUNvbXBpbGVyXy5jb21waWxlSW5Ib3N0IiwiUnVudGltZUNvbXBpbGVyXy5jbGVhckNhY2hlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHlCQUEyRCxtQ0FBbUMsQ0FBQyxDQUFBO0FBRS9GLG1DQUErQiw2Q0FBNkMsQ0FBQyxDQUFBO0FBQzdFLGtDQUErQixxQkFBcUIsQ0FBQyxDQUFBO0FBRXJELG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBSWhEO0lBQThDQSxtQ0FBUUE7SUFBdERBO1FBQThDQyw4QkFBUUE7SUFBRUEsQ0FBQ0E7SUFBREQsc0JBQUNBO0FBQURBLENBQUNBLEFBQXpELEVBQThDLG1CQUFRLEVBQUc7QUFBbkMsdUJBQWUsa0JBQW9CLENBQUE7QUFFekQ7SUFDc0NFLG9DQUFTQTtJQUM3Q0EsMEJBQVlBLGlCQUFtQ0EsRUFBVUEsaUJBQW1DQTtRQUMxRkMsa0JBQU1BLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7UUFEOEJBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBa0JBO0lBRTVGQSxDQUFDQTtJQUVERCx3Q0FBYUEsR0FBYkEsVUFBY0EsYUFBbUJBO1FBQWpDRSxpQkFHQ0E7UUFGQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSwyQkFBMkJBLENBQUNBLGFBQWFBLENBQUNBO2FBQ25FQSxJQUFJQSxDQUFDQSxVQUFBQSxvQkFBb0JBLElBQUlBLE9BQUFBLGtDQUF1QkEsQ0FBQ0EsS0FBSUEsRUFBRUEsb0JBQW9CQSxDQUFDQSxFQUFuREEsQ0FBbURBLENBQUNBLENBQUNBO0lBQ3pGQSxDQUFDQTtJQUVERixxQ0FBVUEsR0FBVkE7UUFDRUcsZ0JBQUtBLENBQUNBLFVBQVVBLFdBQUVBLENBQUNBO1FBQ25CQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO0lBQ3RDQSxDQUFDQTtJQWRISDtRQUFDQSxlQUFVQSxFQUFFQTs7eUJBZVpBO0lBQURBLHVCQUFDQTtBQUFEQSxDQUFDQSxBQWZELEVBQ3NDLG9CQUFTLEVBYzlDO0FBZFksd0JBQWdCLG1CQWM1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21waWxlciwgQ29tcGlsZXJfLCBpbnRlcm5hbENyZWF0ZVByb3RvVmlld30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2NvbXBpbGVyJztcbmltcG9ydCB7UHJvdG9WaWV3UmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYnO1xuaW1wb3J0IHtQcm90b1ZpZXdGYWN0b3J5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvcHJvdG9fdmlld19mYWN0b3J5JztcbmltcG9ydCB7VGVtcGxhdGVDb21waWxlcn0gZnJvbSAnLi90ZW1wbGF0ZV9jb21waWxlcic7XG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSdW50aW1lQ29tcGlsZXIgZXh0ZW5kcyBDb21waWxlciB7fVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUnVudGltZUNvbXBpbGVyXyBleHRlbmRzIENvbXBpbGVyXyBpbXBsZW1lbnRzIFJ1bnRpbWVDb21waWxlciB7XG4gIGNvbnN0cnVjdG9yKF9wcm90b1ZpZXdGYWN0b3J5OiBQcm90b1ZpZXdGYWN0b3J5LCBwcml2YXRlIF90ZW1wbGF0ZUNvbXBpbGVyOiBUZW1wbGF0ZUNvbXBpbGVyKSB7XG4gICAgc3VwZXIoX3Byb3RvVmlld0ZhY3RvcnkpO1xuICB9XG5cbiAgY29tcGlsZUluSG9zdChjb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxQcm90b1ZpZXdSZWY+IHtcbiAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVDb21waWxlci5jb21waWxlSG9zdENvbXBvbmVudFJ1bnRpbWUoY29tcG9uZW50VHlwZSlcbiAgICAgICAgLnRoZW4oY29tcGlsZWRIb3N0VGVtcGxhdGUgPT4gaW50ZXJuYWxDcmVhdGVQcm90b1ZpZXcodGhpcywgY29tcGlsZWRIb3N0VGVtcGxhdGUpKTtcbiAgfVxuXG4gIGNsZWFyQ2FjaGUoKSB7XG4gICAgc3VwZXIuY2xlYXJDYWNoZSgpO1xuICAgIHRoaXMuX3RlbXBsYXRlQ29tcGlsZXIuY2xlYXJDYWNoZSgpO1xuICB9XG59XG4iXX0=