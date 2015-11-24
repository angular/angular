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
import { ProtoViewFactory } from 'angular2/src/core/linker/proto_view_factory';
import { Injectable } from 'angular2/src/core/di';
import { isBlank, stringify } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { CompiledHostTemplate } from 'angular2/src/core/linker/template_commands';
/**
 * Low-level service for compiling {@link Component}s into {@link ProtoViewRef ProtoViews}s, which
 * can later be used to create and render a Component instance.
 *
 * Most applications should instead use higher-level {@link DynamicComponentLoader} service, which
 * both compiles and instantiates a Component.
 */
export class Compiler {
}
function _isCompiledHostTemplate(type) {
    return type instanceof CompiledHostTemplate;
}
export let Compiler_ = class extends Compiler {
    constructor(_protoViewFactory) {
        super();
        this._protoViewFactory = _protoViewFactory;
    }
    compileInHost(componentType) {
        var metadatas = reflector.annotations(componentType);
        var compiledHostTemplate = metadatas.find(_isCompiledHostTemplate);
        if (isBlank(compiledHostTemplate)) {
            throw new BaseException(`No precompiled template for component ${stringify(componentType)} found`);
        }
        return PromiseWrapper.resolve(this._createProtoView(compiledHostTemplate));
    }
    _createProtoView(compiledHostTemplate) {
        return this._protoViewFactory.createHost(compiledHostTemplate).ref;
    }
    clearCache() { this._protoViewFactory.clearCache(); }
};
Compiler_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ProtoViewFactory])
], Compiler_);
export function internalCreateProtoView(compiler, compiledHostTemplate) {
    return compiler._createProtoView(compiledHostTemplate);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcGlsZXIudHMiXSwibmFtZXMiOlsiQ29tcGlsZXIiLCJfaXNDb21waWxlZEhvc3RUZW1wbGF0ZSIsIkNvbXBpbGVyXyIsIkNvbXBpbGVyXy5jb25zdHJ1Y3RvciIsIkNvbXBpbGVyXy5jb21waWxlSW5Ib3N0IiwiQ29tcGlsZXJfLl9jcmVhdGVQcm90b1ZpZXciLCJDb21waWxlcl8uY2xlYXJDYWNoZSIsImludGVybmFsQ3JlYXRlUHJvdG9WaWV3Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUNPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw2Q0FBNkM7T0FFckUsRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBTyxPQUFPLEVBQUUsU0FBUyxFQUFDLE1BQU0sMEJBQTBCO09BQzFELEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEVBQVUsY0FBYyxFQUFDLE1BQU0sMkJBQTJCO09BQzFELEVBQUMsU0FBUyxFQUFDLE1BQU0seUNBQXlDO09BQzFELEVBQUMsb0JBQW9CLEVBQUMsTUFBTSw0Q0FBNEM7QUFFL0U7Ozs7OztHQU1HO0FBQ0g7QUFHQUEsQ0FBQ0E7QUFFRCxpQ0FBaUMsSUFBUztJQUN4Q0MsTUFBTUEsQ0FBQ0EsSUFBSUEsWUFBWUEsb0JBQW9CQSxDQUFDQTtBQUM5Q0EsQ0FBQ0E7QUFFRCxxQ0FDK0IsUUFBUTtJQUNyQ0MsWUFBb0JBLGlCQUFtQ0E7UUFBSUMsT0FBT0EsQ0FBQ0E7UUFBL0NBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBa0JBO0lBQWFBLENBQUNBO0lBRXJFRCxhQUFhQSxDQUFDQSxhQUFtQkE7UUFDL0JFLElBQUlBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBLFdBQVdBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBQ3JEQSxJQUFJQSxvQkFBb0JBLEdBQUdBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLHVCQUF1QkEsQ0FBQ0EsQ0FBQ0E7UUFFbkVBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbENBLE1BQU1BLElBQUlBLGFBQWFBLENBQ25CQSx5Q0FBeUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQ2pGQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDN0VBLENBQUNBO0lBRU9GLGdCQUFnQkEsQ0FBQ0Esb0JBQTBDQTtRQUNqRUcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxVQUFVQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBO0lBQ3JFQSxDQUFDQTtJQUVESCxVQUFVQSxLQUFLSSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0FBQ3ZESixDQUFDQTtBQXBCRDtJQUFDLFVBQVUsRUFBRTs7Y0FvQlo7QUFFRCx3Q0FBd0MsUUFBa0IsRUFDbEIsb0JBQTBDO0lBQ2hGSyxNQUFNQSxDQUFPQSxRQUFTQSxDQUFDQSxnQkFBZ0JBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7QUFDaEVBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQcm90b1ZpZXdSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3JlZic7XG5pbXBvcnQge1Byb3RvVmlld0ZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9wcm90b192aWV3X2ZhY3RvcnknO1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZSwgaXNCbGFuaywgc3RyaW5naWZ5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7Q29tcGlsZWRIb3N0VGVtcGxhdGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci90ZW1wbGF0ZV9jb21tYW5kcyc7XG5cbi8qKlxuICogTG93LWxldmVsIHNlcnZpY2UgZm9yIGNvbXBpbGluZyB7QGxpbmsgQ29tcG9uZW50fXMgaW50byB7QGxpbmsgUHJvdG9WaWV3UmVmIFByb3RvVmlld3N9cywgd2hpY2hcbiAqIGNhbiBsYXRlciBiZSB1c2VkIHRvIGNyZWF0ZSBhbmQgcmVuZGVyIGEgQ29tcG9uZW50IGluc3RhbmNlLlxuICpcbiAqIE1vc3QgYXBwbGljYXRpb25zIHNob3VsZCBpbnN0ZWFkIHVzZSBoaWdoZXItbGV2ZWwge0BsaW5rIER5bmFtaWNDb21wb25lbnRMb2FkZXJ9IHNlcnZpY2UsIHdoaWNoXG4gKiBib3RoIGNvbXBpbGVzIGFuZCBpbnN0YW50aWF0ZXMgYSBDb21wb25lbnQuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21waWxlciB7XG4gIGFic3RyYWN0IGNvbXBpbGVJbkhvc3QoY29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8UHJvdG9WaWV3UmVmPjtcbiAgYWJzdHJhY3QgY2xlYXJDYWNoZSgpO1xufVxuXG5mdW5jdGlvbiBfaXNDb21waWxlZEhvc3RUZW1wbGF0ZSh0eXBlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGUgaW5zdGFuY2VvZiBDb21waWxlZEhvc3RUZW1wbGF0ZTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbXBpbGVyXyBleHRlbmRzIENvbXBpbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcHJvdG9WaWV3RmFjdG9yeTogUHJvdG9WaWV3RmFjdG9yeSkgeyBzdXBlcigpOyB9XG5cbiAgY29tcGlsZUluSG9zdChjb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxQcm90b1ZpZXdSZWY+IHtcbiAgICB2YXIgbWV0YWRhdGFzID0gcmVmbGVjdG9yLmFubm90YXRpb25zKGNvbXBvbmVudFR5cGUpO1xuICAgIHZhciBjb21waWxlZEhvc3RUZW1wbGF0ZSA9IG1ldGFkYXRhcy5maW5kKF9pc0NvbXBpbGVkSG9zdFRlbXBsYXRlKTtcblxuICAgIGlmIChpc0JsYW5rKGNvbXBpbGVkSG9zdFRlbXBsYXRlKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYE5vIHByZWNvbXBpbGVkIHRlbXBsYXRlIGZvciBjb21wb25lbnQgJHtzdHJpbmdpZnkoY29tcG9uZW50VHlwZSl9IGZvdW5kYCk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuX2NyZWF0ZVByb3RvVmlldyhjb21waWxlZEhvc3RUZW1wbGF0ZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlUHJvdG9WaWV3KGNvbXBpbGVkSG9zdFRlbXBsYXRlOiBDb21waWxlZEhvc3RUZW1wbGF0ZSk6IFByb3RvVmlld1JlZiB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3RvVmlld0ZhY3RvcnkuY3JlYXRlSG9zdChjb21waWxlZEhvc3RUZW1wbGF0ZSkucmVmO1xuICB9XG5cbiAgY2xlYXJDYWNoZSgpIHsgdGhpcy5fcHJvdG9WaWV3RmFjdG9yeS5jbGVhckNhY2hlKCk7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludGVybmFsQ3JlYXRlUHJvdG9WaWV3KGNvbXBpbGVyOiBDb21waWxlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlZEhvc3RUZW1wbGF0ZTogQ29tcGlsZWRIb3N0VGVtcGxhdGUpOiBQcm90b1ZpZXdSZWYge1xuICByZXR1cm4gKDxhbnk+Y29tcGlsZXIpLl9jcmVhdGVQcm90b1ZpZXcoY29tcGlsZWRIb3N0VGVtcGxhdGUpO1xufVxuIl19