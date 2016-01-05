var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9ydW50aW1lX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbIlJ1bnRpbWVDb21waWxlciIsIlJ1bnRpbWVDb21waWxlcl8iLCJSdW50aW1lQ29tcGlsZXJfLmNvbnN0cnVjdG9yIiwiUnVudGltZUNvbXBpbGVyXy5jb21waWxlSW5Ib3N0IiwiUnVudGltZUNvbXBpbGVyXy5jbGVhckNhY2hlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSxtQ0FBbUM7T0FFdkYsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLDZDQUE2QztPQUNyRSxFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCO09BRTdDLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO0FBSS9DLHFDQUE4QyxRQUFRO0FBQUVBLENBQUNBO0FBRXpELDRDQUNzQyxTQUFTO0lBQzdDQyxZQUFZQSxpQkFBbUNBLEVBQVVBLGlCQUFtQ0E7UUFDMUZDLE1BQU1BLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7UUFEOEJBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBa0JBO0lBRTVGQSxDQUFDQTtJQUVERCxhQUFhQSxDQUFDQSxhQUFtQkE7UUFDL0JFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxhQUFhQSxDQUFDQTthQUNuRUEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxJQUFJQSx1QkFBdUJBLENBQUNBLElBQUlBLEVBQUVBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDekZBLENBQUNBO0lBRURGLFVBQVVBO1FBQ1JHLEtBQUtBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO1FBQ25CQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO0lBQ3RDQSxDQUFDQTtBQUNISCxDQUFDQTtBQWZEO0lBQUMsVUFBVSxFQUFFOztxQkFlWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21waWxlciwgQ29tcGlsZXJfLCBpbnRlcm5hbENyZWF0ZVByb3RvVmlld30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2NvbXBpbGVyJztcbmltcG9ydCB7UHJvdG9WaWV3UmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYnO1xuaW1wb3J0IHtQcm90b1ZpZXdGYWN0b3J5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvcHJvdG9fdmlld19mYWN0b3J5JztcbmltcG9ydCB7VGVtcGxhdGVDb21waWxlcn0gZnJvbSAnLi90ZW1wbGF0ZV9jb21waWxlcic7XG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSdW50aW1lQ29tcGlsZXIgZXh0ZW5kcyBDb21waWxlciB7fVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUnVudGltZUNvbXBpbGVyXyBleHRlbmRzIENvbXBpbGVyXyBpbXBsZW1lbnRzIFJ1bnRpbWVDb21waWxlciB7XG4gIGNvbnN0cnVjdG9yKF9wcm90b1ZpZXdGYWN0b3J5OiBQcm90b1ZpZXdGYWN0b3J5LCBwcml2YXRlIF90ZW1wbGF0ZUNvbXBpbGVyOiBUZW1wbGF0ZUNvbXBpbGVyKSB7XG4gICAgc3VwZXIoX3Byb3RvVmlld0ZhY3RvcnkpO1xuICB9XG5cbiAgY29tcGlsZUluSG9zdChjb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxQcm90b1ZpZXdSZWY+IHtcbiAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVDb21waWxlci5jb21waWxlSG9zdENvbXBvbmVudFJ1bnRpbWUoY29tcG9uZW50VHlwZSlcbiAgICAgICAgLnRoZW4oY29tcGlsZWRIb3N0VGVtcGxhdGUgPT4gaW50ZXJuYWxDcmVhdGVQcm90b1ZpZXcodGhpcywgY29tcGlsZWRIb3N0VGVtcGxhdGUpKTtcbiAgfVxuXG4gIGNsZWFyQ2FjaGUoKSB7XG4gICAgc3VwZXIuY2xlYXJDYWNoZSgpO1xuICAgIHRoaXMuX3RlbXBsYXRlQ29tcGlsZXIuY2xlYXJDYWNoZSgpO1xuICB9XG59XG4iXX0=