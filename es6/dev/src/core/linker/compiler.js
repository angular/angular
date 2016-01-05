var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcGlsZXIudHMiXSwibmFtZXMiOlsiQ29tcGlsZXIiLCJfaXNDb21waWxlZEhvc3RUZW1wbGF0ZSIsIkNvbXBpbGVyXyIsIkNvbXBpbGVyXy5jb25zdHJ1Y3RvciIsIkNvbXBpbGVyXy5jb21waWxlSW5Ib3N0IiwiQ29tcGlsZXJfLl9jcmVhdGVQcm90b1ZpZXciLCJDb21waWxlcl8uY2xlYXJDYWNoZSIsImludGVybmFsQ3JlYXRlUHJvdG9WaWV3Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FDTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sNkNBQTZDO09BRXJFLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQU8sT0FBTyxFQUFFLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUMxRCxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFVLGNBQWMsRUFBQyxNQUFNLDJCQUEyQjtPQUMxRCxFQUFDLFNBQVMsRUFBQyxNQUFNLHlDQUF5QztPQUMxRCxFQUFDLG9CQUFvQixFQUFDLE1BQU0sNENBQTRDO0FBRS9FOzs7Ozs7R0FNRztBQUNIO0FBR0FBLENBQUNBO0FBRUQsaUNBQWlDLElBQVM7SUFDeENDLE1BQU1BLENBQUNBLElBQUlBLFlBQVlBLG9CQUFvQkEsQ0FBQ0E7QUFDOUNBLENBQUNBO0FBRUQscUNBQytCLFFBQVE7SUFDckNDLFlBQW9CQSxpQkFBbUNBO1FBQUlDLE9BQU9BLENBQUNBO1FBQS9DQSxzQkFBaUJBLEdBQWpCQSxpQkFBaUJBLENBQWtCQTtJQUFhQSxDQUFDQTtJQUVyRUQsYUFBYUEsQ0FBQ0EsYUFBbUJBO1FBQy9CRSxJQUFJQSxTQUFTQSxHQUFHQSxTQUFTQSxDQUFDQSxXQUFXQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUNyREEsSUFBSUEsb0JBQW9CQSxHQUFHQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSx1QkFBdUJBLENBQUNBLENBQUNBO1FBRW5FQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xDQSxNQUFNQSxJQUFJQSxhQUFhQSxDQUNuQkEseUNBQXlDQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUNqRkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBLENBQUNBO0lBQzdFQSxDQUFDQTtJQUVPRixnQkFBZ0JBLENBQUNBLG9CQUEwQ0E7UUFDakVHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQTtJQUNyRUEsQ0FBQ0E7SUFFREgsVUFBVUEsS0FBS0ksSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUN2REosQ0FBQ0E7QUFwQkQ7SUFBQyxVQUFVLEVBQUU7O2NBb0JaO0FBRUQsd0NBQXdDLFFBQWtCLEVBQ2xCLG9CQUEwQztJQUNoRkssTUFBTUEsQ0FBT0EsUUFBU0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO0FBQ2hFQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvdG9WaWV3UmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYnO1xuaW1wb3J0IHtQcm90b1ZpZXdGYWN0b3J5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvcHJvdG9fdmlld19mYWN0b3J5JztcblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGUsIGlzQmxhbmssIHN0cmluZ2lmeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0NvbXBpbGVkSG9zdFRlbXBsYXRlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdGVtcGxhdGVfY29tbWFuZHMnO1xuXG4vKipcbiAqIExvdy1sZXZlbCBzZXJ2aWNlIGZvciBjb21waWxpbmcge0BsaW5rIENvbXBvbmVudH1zIGludG8ge0BsaW5rIFByb3RvVmlld1JlZiBQcm90b1ZpZXdzfXMsIHdoaWNoXG4gKiBjYW4gbGF0ZXIgYmUgdXNlZCB0byBjcmVhdGUgYW5kIHJlbmRlciBhIENvbXBvbmVudCBpbnN0YW5jZS5cbiAqXG4gKiBNb3N0IGFwcGxpY2F0aW9ucyBzaG91bGQgaW5zdGVhZCB1c2UgaGlnaGVyLWxldmVsIHtAbGluayBEeW5hbWljQ29tcG9uZW50TG9hZGVyfSBzZXJ2aWNlLCB3aGljaFxuICogYm90aCBjb21waWxlcyBhbmQgaW5zdGFudGlhdGVzIGEgQ29tcG9uZW50LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcGlsZXIge1xuICBhYnN0cmFjdCBjb21waWxlSW5Ib3N0KGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPFByb3RvVmlld1JlZj47XG4gIGFic3RyYWN0IGNsZWFyQ2FjaGUoKTtcbn1cblxuZnVuY3Rpb24gX2lzQ29tcGlsZWRIb3N0VGVtcGxhdGUodHlwZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlIGluc3RhbmNlb2YgQ29tcGlsZWRIb3N0VGVtcGxhdGU7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDb21waWxlcl8gZXh0ZW5kcyBDb21waWxlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3Byb3RvVmlld0ZhY3Rvcnk6IFByb3RvVmlld0ZhY3RvcnkpIHsgc3VwZXIoKTsgfVxuXG4gIGNvbXBpbGVJbkhvc3QoY29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8UHJvdG9WaWV3UmVmPiB7XG4gICAgdmFyIG1ldGFkYXRhcyA9IHJlZmxlY3Rvci5hbm5vdGF0aW9ucyhjb21wb25lbnRUeXBlKTtcbiAgICB2YXIgY29tcGlsZWRIb3N0VGVtcGxhdGUgPSBtZXRhZGF0YXMuZmluZChfaXNDb21waWxlZEhvc3RUZW1wbGF0ZSk7XG5cbiAgICBpZiAoaXNCbGFuayhjb21waWxlZEhvc3RUZW1wbGF0ZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBObyBwcmVjb21waWxlZCB0ZW1wbGF0ZSBmb3IgY29tcG9uZW50ICR7c3RyaW5naWZ5KGNvbXBvbmVudFR5cGUpfSBmb3VuZGApO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLl9jcmVhdGVQcm90b1ZpZXcoY29tcGlsZWRIb3N0VGVtcGxhdGUpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZVByb3RvVmlldyhjb21waWxlZEhvc3RUZW1wbGF0ZTogQ29tcGlsZWRIb3N0VGVtcGxhdGUpOiBQcm90b1ZpZXdSZWYge1xuICAgIHJldHVybiB0aGlzLl9wcm90b1ZpZXdGYWN0b3J5LmNyZWF0ZUhvc3QoY29tcGlsZWRIb3N0VGVtcGxhdGUpLnJlZjtcbiAgfVxuXG4gIGNsZWFyQ2FjaGUoKSB7IHRoaXMuX3Byb3RvVmlld0ZhY3RvcnkuY2xlYXJDYWNoZSgpOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcm5hbENyZWF0ZVByb3RvVmlldyhjb21waWxlcjogQ29tcGlsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRIb3N0VGVtcGxhdGU6IENvbXBpbGVkSG9zdFRlbXBsYXRlKTogUHJvdG9WaWV3UmVmIHtcbiAgcmV0dXJuICg8YW55PmNvbXBpbGVyKS5fY3JlYXRlUHJvdG9WaWV3KGNvbXBpbGVkSG9zdFRlbXBsYXRlKTtcbn1cbiJdfQ==