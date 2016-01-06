var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { isBlank, stringify } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { HostViewFactory } from 'angular2/src/core/linker/view';
import { HostViewFactoryRef_ } from 'angular2/src/core/linker/view_ref';
/**
 * Low-level service for compiling {@link Component}s into {@link ProtoViewRef ProtoViews}s, which
 * can later be used to create and render a Component instance.
 *
 * Most applications should instead use higher-level {@link DynamicComponentLoader} service, which
 * both compiles and instantiates a Component.
 */
export class Compiler {
}
function isHostViewFactory(type) {
    return type instanceof HostViewFactory;
}
export let Compiler_ = class extends Compiler {
    compileInHost(componentType) {
        var metadatas = reflector.annotations(componentType);
        var hostViewFactory = metadatas.find(isHostViewFactory);
        if (isBlank(hostViewFactory)) {
            throw new BaseException(`No precompiled component ${stringify(componentType)} found`);
        }
        return PromiseWrapper.resolve(new HostViewFactoryRef_(hostViewFactory));
    }
    clearCache() { }
};
Compiler_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], Compiler_);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcGlsZXIudHMiXSwibmFtZXMiOlsiQ29tcGlsZXIiLCJpc0hvc3RWaWV3RmFjdG9yeSIsIkNvbXBpbGVyXyIsIkNvbXBpbGVyXy5jb21waWxlSW5Ib3N0IiwiQ29tcGlsZXJfLmNsZWFyQ2FjaGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUVPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQU8sT0FBTyxFQUFFLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUMxRCxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFVLGNBQWMsRUFBQyxNQUFNLDJCQUEyQjtPQUMxRCxFQUFDLFNBQVMsRUFBQyxNQUFNLHlDQUF5QztPQUMxRCxFQUFDLGVBQWUsRUFBQyxNQUFNLCtCQUErQjtPQUN0RCxFQUFDLG1CQUFtQixFQUFDLE1BQU0sbUNBQW1DO0FBRXJFOzs7Ozs7R0FNRztBQUNIO0FBR0FBLENBQUNBO0FBRUQsMkJBQTJCLElBQVM7SUFDbENDLE1BQU1BLENBQUNBLElBQUlBLFlBQVlBLGVBQWVBLENBQUNBO0FBQ3pDQSxDQUFDQTtBQUVELHFDQUMrQixRQUFRO0lBQ3JDQyxhQUFhQSxDQUFDQSxhQUFtQkE7UUFDL0JDLElBQUlBLFNBQVNBLEdBQUdBLFNBQVNBLENBQUNBLFdBQVdBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBQ3JEQSxJQUFJQSxlQUFlQSxHQUFHQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBO1FBRXhEQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3QkEsTUFBTUEsSUFBSUEsYUFBYUEsQ0FBQ0EsNEJBQTRCQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUN4RkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsbUJBQW1CQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMxRUEsQ0FBQ0E7SUFFREQsVUFBVUEsS0FBSUUsQ0FBQ0E7QUFDakJGLENBQUNBO0FBYkQ7SUFBQyxVQUFVLEVBQUU7O2NBYVo7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SG9zdFZpZXdGYWN0b3J5UmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYnO1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZSwgaXNCbGFuaywgc3RyaW5naWZ5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7SG9zdFZpZXdGYWN0b3J5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlldyc7XG5pbXBvcnQge0hvc3RWaWV3RmFjdG9yeVJlZl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3JlZic7XG5cbi8qKlxuICogTG93LWxldmVsIHNlcnZpY2UgZm9yIGNvbXBpbGluZyB7QGxpbmsgQ29tcG9uZW50fXMgaW50byB7QGxpbmsgUHJvdG9WaWV3UmVmIFByb3RvVmlld3N9cywgd2hpY2hcbiAqIGNhbiBsYXRlciBiZSB1c2VkIHRvIGNyZWF0ZSBhbmQgcmVuZGVyIGEgQ29tcG9uZW50IGluc3RhbmNlLlxuICpcbiAqIE1vc3QgYXBwbGljYXRpb25zIHNob3VsZCBpbnN0ZWFkIHVzZSBoaWdoZXItbGV2ZWwge0BsaW5rIER5bmFtaWNDb21wb25lbnRMb2FkZXJ9IHNlcnZpY2UsIHdoaWNoXG4gKiBib3RoIGNvbXBpbGVzIGFuZCBpbnN0YW50aWF0ZXMgYSBDb21wb25lbnQuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21waWxlciB7XG4gIGFic3RyYWN0IGNvbXBpbGVJbkhvc3QoY29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8SG9zdFZpZXdGYWN0b3J5UmVmPjtcbiAgYWJzdHJhY3QgY2xlYXJDYWNoZSgpO1xufVxuXG5mdW5jdGlvbiBpc0hvc3RWaWV3RmFjdG9yeSh0eXBlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGUgaW5zdGFuY2VvZiBIb3N0Vmlld0ZhY3Rvcnk7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDb21waWxlcl8gZXh0ZW5kcyBDb21waWxlciB7XG4gIGNvbXBpbGVJbkhvc3QoY29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8SG9zdFZpZXdGYWN0b3J5UmVmXz4ge1xuICAgIHZhciBtZXRhZGF0YXMgPSByZWZsZWN0b3IuYW5ub3RhdGlvbnMoY29tcG9uZW50VHlwZSk7XG4gICAgdmFyIGhvc3RWaWV3RmFjdG9yeSA9IG1ldGFkYXRhcy5maW5kKGlzSG9zdFZpZXdGYWN0b3J5KTtcblxuICAgIGlmIChpc0JsYW5rKGhvc3RWaWV3RmFjdG9yeSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBObyBwcmVjb21waWxlZCBjb21wb25lbnQgJHtzdHJpbmdpZnkoY29tcG9uZW50VHlwZSl9IGZvdW5kYCk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKG5ldyBIb3N0Vmlld0ZhY3RvcnlSZWZfKGhvc3RWaWV3RmFjdG9yeSkpO1xuICB9XG5cbiAgY2xlYXJDYWNoZSgpIHt9XG59XG4iXX0=