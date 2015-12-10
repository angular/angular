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
import { Compiler, Compiler_, internalCreateProtoView } from 'angular2/src/core/linker/compiler';
import { ProtoViewFactory } from 'angular2/src/core/linker/proto_view_factory';
import { TemplateCompiler } from './template_compiler';
import { Injectable } from 'angular2/src/core/di';
export class RuntimeCompiler extends Compiler {
}
export let RuntimeCompiler_ = class extends Compiler_ {
    constructor(_protoViewFactory, _templateCompiler) {
        super(_protoViewFactory);
        this._templateCompiler = _templateCompiler;
    }
    compileInHost(componentType) {
        return this._templateCompiler.compileHostComponentRuntime(componentType)
            .then(compiledHostTemplate => internalCreateProtoView(this, compiledHostTemplate));
    }
    clearCache() {
        super.clearCache();
        this._templateCompiler.clearCache();
    }
};
RuntimeCompiler_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ProtoViewFactory, TemplateCompiler])
], RuntimeCompiler_);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbIlJ1bnRpbWVDb21waWxlciIsIlJ1bnRpbWVDb21waWxlcl8iLCJSdW50aW1lQ29tcGlsZXJfLmNvbnN0cnVjdG9yIiwiUnVudGltZUNvbXBpbGVyXy5jb21waWxlSW5Ib3N0IiwiUnVudGltZUNvbXBpbGVyXy5jbGVhckNhY2hlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSx1QkFBdUIsRUFBQyxNQUFNLG1DQUFtQztPQUV2RixFQUFDLGdCQUFnQixFQUFDLE1BQU0sNkNBQTZDO09BQ3JFLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUI7T0FFN0MsRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7QUFJL0MscUNBQThDLFFBQVE7QUFBRUEsQ0FBQ0E7QUFFekQsNENBQ3NDLFNBQVM7SUFDN0NDLFlBQVlBLGlCQUFtQ0EsRUFBVUEsaUJBQW1DQTtRQUMxRkMsTUFBTUEsaUJBQWlCQSxDQUFDQSxDQUFDQTtRQUQ4QkEsc0JBQWlCQSxHQUFqQkEsaUJBQWlCQSxDQUFrQkE7SUFFNUZBLENBQUNBO0lBRURELGFBQWFBLENBQUNBLGFBQW1CQTtRQUMvQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSwyQkFBMkJBLENBQUNBLGFBQWFBLENBQUNBO2FBQ25FQSxJQUFJQSxDQUFDQSxvQkFBb0JBLElBQUlBLHVCQUF1QkEsQ0FBQ0EsSUFBSUEsRUFBRUEsb0JBQW9CQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN6RkEsQ0FBQ0E7SUFFREYsVUFBVUE7UUFDUkcsS0FBS0EsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7UUFDbkJBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7SUFDdENBLENBQUNBO0FBQ0hILENBQUNBO0FBZkQ7SUFBQyxVQUFVLEVBQUU7O3FCQWVaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBpbGVyLCBDb21waWxlcl8sIGludGVybmFsQ3JlYXRlUHJvdG9WaWV3fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcGlsZXInO1xuaW1wb3J0IHtQcm90b1ZpZXdSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3JlZic7XG5pbXBvcnQge1Byb3RvVmlld0ZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9wcm90b192aWV3X2ZhY3RvcnknO1xuaW1wb3J0IHtUZW1wbGF0ZUNvbXBpbGVyfSBmcm9tICcuL3RlbXBsYXRlX2NvbXBpbGVyJztcblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2UsIFByb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJ1bnRpbWVDb21waWxlciBleHRlbmRzIENvbXBpbGVyIHt9XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSdW50aW1lQ29tcGlsZXJfIGV4dGVuZHMgQ29tcGlsZXJfIGltcGxlbWVudHMgUnVudGltZUNvbXBpbGVyIHtcbiAgY29uc3RydWN0b3IoX3Byb3RvVmlld0ZhY3Rvcnk6IFByb3RvVmlld0ZhY3RvcnksIHByaXZhdGUgX3RlbXBsYXRlQ29tcGlsZXI6IFRlbXBsYXRlQ29tcGlsZXIpIHtcbiAgICBzdXBlcihfcHJvdG9WaWV3RmFjdG9yeSk7XG4gIH1cblxuICBjb21waWxlSW5Ib3N0KGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPFByb3RvVmlld1JlZj4ge1xuICAgIHJldHVybiB0aGlzLl90ZW1wbGF0ZUNvbXBpbGVyLmNvbXBpbGVIb3N0Q29tcG9uZW50UnVudGltZShjb21wb25lbnRUeXBlKVxuICAgICAgICAudGhlbihjb21waWxlZEhvc3RUZW1wbGF0ZSA9PiBpbnRlcm5hbENyZWF0ZVByb3RvVmlldyh0aGlzLCBjb21waWxlZEhvc3RUZW1wbGF0ZSkpO1xuICB9XG5cbiAgY2xlYXJDYWNoZSgpIHtcbiAgICBzdXBlci5jbGVhckNhY2hlKCk7XG4gICAgdGhpcy5fdGVtcGxhdGVDb21waWxlci5jbGVhckNhY2hlKCk7XG4gIH1cbn1cbiJdfQ==