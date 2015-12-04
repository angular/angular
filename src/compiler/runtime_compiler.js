'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbIlJ1bnRpbWVDb21waWxlciIsIlJ1bnRpbWVDb21waWxlci5jb25zdHJ1Y3RvciIsIlJ1bnRpbWVDb21waWxlcl8iLCJSdW50aW1lQ29tcGlsZXJfLmNvbnN0cnVjdG9yIiwiUnVudGltZUNvbXBpbGVyXy5jb21waWxlSW5Ib3N0IiwiUnVudGltZUNvbXBpbGVyXy5jbGVhckNhY2hlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUJBQTJELG1DQUFtQyxDQUFDLENBQUE7QUFFL0YsbUNBQStCLDZDQUE2QyxDQUFDLENBQUE7QUFDN0Usa0NBQStCLHFCQUFxQixDQUFDLENBQUE7QUFFckQsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFJaEQ7SUFBOENBLG1DQUFRQTtJQUF0REE7UUFBOENDLDhCQUFRQTtJQUFFQSxDQUFDQTtJQUFERCxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFBekQsRUFBOEMsbUJBQVEsRUFBRztBQUFuQyx1QkFBZSxrQkFBb0IsQ0FBQTtBQUV6RDtJQUNzQ0Usb0NBQVNBO0lBQzdDQSwwQkFBWUEsaUJBQW1DQSxFQUFVQSxpQkFBbUNBO1FBQzFGQyxrQkFBTUEsaUJBQWlCQSxDQUFDQSxDQUFDQTtRQUQ4QkEsc0JBQWlCQSxHQUFqQkEsaUJBQWlCQSxDQUFrQkE7SUFFNUZBLENBQUNBO0lBRURELHdDQUFhQSxHQUFiQSxVQUFjQSxhQUFtQkE7UUFBakNFLGlCQUdDQTtRQUZDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLDJCQUEyQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7YUFDbkVBLElBQUlBLENBQUNBLFVBQUFBLG9CQUFvQkEsSUFBSUEsT0FBQUEsa0NBQXVCQSxDQUFDQSxLQUFJQSxFQUFFQSxvQkFBb0JBLENBQUNBLEVBQW5EQSxDQUFtREEsQ0FBQ0EsQ0FBQ0E7SUFDekZBLENBQUNBO0lBRURGLHFDQUFVQSxHQUFWQTtRQUNFRyxnQkFBS0EsQ0FBQ0EsVUFBVUEsV0FBRUEsQ0FBQ0E7UUFDbkJBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7SUFDdENBLENBQUNBO0lBZEhIO1FBQUNBLGVBQVVBLEVBQUVBOzt5QkFlWkE7SUFBREEsdUJBQUNBO0FBQURBLENBQUNBLEFBZkQsRUFDc0Msb0JBQVMsRUFjOUM7QUFkWSx3QkFBZ0IsbUJBYzVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBpbGVyLCBDb21waWxlcl8sIGludGVybmFsQ3JlYXRlUHJvdG9WaWV3fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcGlsZXInO1xuaW1wb3J0IHtQcm90b1ZpZXdSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3JlZic7XG5pbXBvcnQge1Byb3RvVmlld0ZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9wcm90b192aWV3X2ZhY3RvcnknO1xuaW1wb3J0IHtUZW1wbGF0ZUNvbXBpbGVyfSBmcm9tICcuL3RlbXBsYXRlX2NvbXBpbGVyJztcblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2UsIFByb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJ1bnRpbWVDb21waWxlciBleHRlbmRzIENvbXBpbGVyIHt9XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSdW50aW1lQ29tcGlsZXJfIGV4dGVuZHMgQ29tcGlsZXJfIGltcGxlbWVudHMgUnVudGltZUNvbXBpbGVyIHtcbiAgY29uc3RydWN0b3IoX3Byb3RvVmlld0ZhY3Rvcnk6IFByb3RvVmlld0ZhY3RvcnksIHByaXZhdGUgX3RlbXBsYXRlQ29tcGlsZXI6IFRlbXBsYXRlQ29tcGlsZXIpIHtcbiAgICBzdXBlcihfcHJvdG9WaWV3RmFjdG9yeSk7XG4gIH1cblxuICBjb21waWxlSW5Ib3N0KGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPFByb3RvVmlld1JlZj4ge1xuICAgIHJldHVybiB0aGlzLl90ZW1wbGF0ZUNvbXBpbGVyLmNvbXBpbGVIb3N0Q29tcG9uZW50UnVudGltZShjb21wb25lbnRUeXBlKVxuICAgICAgICAudGhlbihjb21waWxlZEhvc3RUZW1wbGF0ZSA9PiBpbnRlcm5hbENyZWF0ZVByb3RvVmlldyh0aGlzLCBjb21waWxlZEhvc3RUZW1wbGF0ZSkpO1xuICB9XG5cbiAgY2xlYXJDYWNoZSgpIHtcbiAgICBzdXBlci5jbGVhckNhY2hlKCk7XG4gICAgdGhpcy5fdGVtcGxhdGVDb21waWxlci5jbGVhckNhY2hlKCk7XG4gIH1cbn1cbiJdfQ==