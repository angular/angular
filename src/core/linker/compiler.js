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
var proto_view_factory_1 = require('angular2/src/core/linker/proto_view_factory');
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var async_1 = require('angular2/src/facade/async');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var template_commands_1 = require('angular2/src/core/linker/template_commands');
/**
 * Low-level service for compiling {@link Component}s into {@link ProtoViewRef ProtoViews}s, which
 * can later be used to create and render a Component instance.
 *
 * Most applications should instead use higher-level {@link DynamicComponentLoader} service, which
 * both compiles and instantiates a Component.
 */
var Compiler = (function () {
    function Compiler() {
    }
    return Compiler;
})();
exports.Compiler = Compiler;
function _isCompiledHostTemplate(type) {
    return type instanceof template_commands_1.CompiledHostTemplate;
}
var Compiler_ = (function (_super) {
    __extends(Compiler_, _super);
    function Compiler_(_protoViewFactory) {
        _super.call(this);
        this._protoViewFactory = _protoViewFactory;
    }
    Compiler_.prototype.compileInHost = function (componentType) {
        var metadatas = reflection_1.reflector.annotations(componentType);
        var compiledHostTemplate = metadatas.find(_isCompiledHostTemplate);
        if (lang_1.isBlank(compiledHostTemplate)) {
            throw new exceptions_1.BaseException("No precompiled template for component " + lang_1.stringify(componentType) + " found");
        }
        return async_1.PromiseWrapper.resolve(this._createProtoView(compiledHostTemplate));
    };
    Compiler_.prototype._createProtoView = function (compiledHostTemplate) {
        return this._protoViewFactory.createHost(compiledHostTemplate).ref;
    };
    Compiler_.prototype.clearCache = function () { this._protoViewFactory.clearCache(); };
    Compiler_ = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [proto_view_factory_1.ProtoViewFactory])
    ], Compiler_);
    return Compiler_;
})(Compiler);
exports.Compiler_ = Compiler_;
function internalCreateProtoView(compiler, compiledHostTemplate) {
    return compiler._createProtoView(compiledHostTemplate);
}
exports.internalCreateProtoView = internalCreateProtoView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcGlsZXIudHMiXSwibmFtZXMiOlsiQ29tcGlsZXIiLCJDb21waWxlci5jb25zdHJ1Y3RvciIsIl9pc0NvbXBpbGVkSG9zdFRlbXBsYXRlIiwiQ29tcGlsZXJfIiwiQ29tcGlsZXJfLmNvbnN0cnVjdG9yIiwiQ29tcGlsZXJfLmNvbXBpbGVJbkhvc3QiLCJDb21waWxlcl8uX2NyZWF0ZVByb3RvVmlldyIsIkNvbXBpbGVyXy5jbGVhckNhY2hlIiwiaW50ZXJuYWxDcmVhdGVQcm90b1ZpZXciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsbUNBQStCLDZDQUE2QyxDQUFDLENBQUE7QUFFN0UsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQscUJBQXVDLDBCQUEwQixDQUFDLENBQUE7QUFDbEUsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0Qsc0JBQXNDLDJCQUEyQixDQUFDLENBQUE7QUFDbEUsMkJBQXdCLHlDQUF5QyxDQUFDLENBQUE7QUFDbEUsa0NBQW1DLDRDQUE0QyxDQUFDLENBQUE7QUFFaEY7Ozs7OztHQU1HO0FBQ0g7SUFBQUE7SUFHQUMsQ0FBQ0E7SUFBREQsZUFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBSHFCLGdCQUFRLFdBRzdCLENBQUE7QUFFRCxpQ0FBaUMsSUFBUztJQUN4Q0UsTUFBTUEsQ0FBQ0EsSUFBSUEsWUFBWUEsd0NBQW9CQSxDQUFDQTtBQUM5Q0EsQ0FBQ0E7QUFFRDtJQUMrQkMsNkJBQVFBO0lBQ3JDQSxtQkFBb0JBLGlCQUFtQ0E7UUFBSUMsaUJBQU9BLENBQUNBO1FBQS9DQSxzQkFBaUJBLEdBQWpCQSxpQkFBaUJBLENBQWtCQTtJQUFhQSxDQUFDQTtJQUVyRUQsaUNBQWFBLEdBQWJBLFVBQWNBLGFBQW1CQTtRQUMvQkUsSUFBSUEsU0FBU0EsR0FBR0Esc0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBQ3JEQSxJQUFJQSxvQkFBb0JBLEdBQUdBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLHVCQUF1QkEsQ0FBQ0EsQ0FBQ0E7UUFFbkVBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbENBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUNuQkEsMkNBQXlDQSxnQkFBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsV0FBUUEsQ0FBQ0EsQ0FBQ0E7UUFDakZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLHNCQUFjQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDN0VBLENBQUNBO0lBRU9GLG9DQUFnQkEsR0FBeEJBLFVBQXlCQSxvQkFBMENBO1FBQ2pFRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFVBQVVBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7SUFDckVBLENBQUNBO0lBRURILDhCQUFVQSxHQUFWQSxjQUFlSSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBbkJ2REo7UUFBQ0EsZUFBVUEsRUFBRUE7O2tCQW9CWkE7SUFBREEsZ0JBQUNBO0FBQURBLENBQUNBLEFBcEJELEVBQytCLFFBQVEsRUFtQnRDO0FBbkJZLGlCQUFTLFlBbUJyQixDQUFBO0FBRUQsaUNBQXdDLFFBQWtCLEVBQ2xCLG9CQUEwQztJQUNoRkssTUFBTUEsQ0FBT0EsUUFBU0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO0FBQ2hFQSxDQUFDQTtBQUhlLCtCQUF1QiwwQkFHdEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvdG9WaWV3UmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYnO1xuaW1wb3J0IHtQcm90b1ZpZXdGYWN0b3J5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvcHJvdG9fdmlld19mYWN0b3J5JztcblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1R5cGUsIGlzQmxhbmssIHN0cmluZ2lmeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0NvbXBpbGVkSG9zdFRlbXBsYXRlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdGVtcGxhdGVfY29tbWFuZHMnO1xuXG4vKipcbiAqIExvdy1sZXZlbCBzZXJ2aWNlIGZvciBjb21waWxpbmcge0BsaW5rIENvbXBvbmVudH1zIGludG8ge0BsaW5rIFByb3RvVmlld1JlZiBQcm90b1ZpZXdzfXMsIHdoaWNoXG4gKiBjYW4gbGF0ZXIgYmUgdXNlZCB0byBjcmVhdGUgYW5kIHJlbmRlciBhIENvbXBvbmVudCBpbnN0YW5jZS5cbiAqXG4gKiBNb3N0IGFwcGxpY2F0aW9ucyBzaG91bGQgaW5zdGVhZCB1c2UgaGlnaGVyLWxldmVsIHtAbGluayBEeW5hbWljQ29tcG9uZW50TG9hZGVyfSBzZXJ2aWNlLCB3aGljaFxuICogYm90aCBjb21waWxlcyBhbmQgaW5zdGFudGlhdGVzIGEgQ29tcG9uZW50LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcGlsZXIge1xuICBhYnN0cmFjdCBjb21waWxlSW5Ib3N0KGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPFByb3RvVmlld1JlZj47XG4gIGFic3RyYWN0IGNsZWFyQ2FjaGUoKTtcbn1cblxuZnVuY3Rpb24gX2lzQ29tcGlsZWRIb3N0VGVtcGxhdGUodHlwZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlIGluc3RhbmNlb2YgQ29tcGlsZWRIb3N0VGVtcGxhdGU7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDb21waWxlcl8gZXh0ZW5kcyBDb21waWxlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3Byb3RvVmlld0ZhY3Rvcnk6IFByb3RvVmlld0ZhY3RvcnkpIHsgc3VwZXIoKTsgfVxuXG4gIGNvbXBpbGVJbkhvc3QoY29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8UHJvdG9WaWV3UmVmPiB7XG4gICAgdmFyIG1ldGFkYXRhcyA9IHJlZmxlY3Rvci5hbm5vdGF0aW9ucyhjb21wb25lbnRUeXBlKTtcbiAgICB2YXIgY29tcGlsZWRIb3N0VGVtcGxhdGUgPSBtZXRhZGF0YXMuZmluZChfaXNDb21waWxlZEhvc3RUZW1wbGF0ZSk7XG5cbiAgICBpZiAoaXNCbGFuayhjb21waWxlZEhvc3RUZW1wbGF0ZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBObyBwcmVjb21waWxlZCB0ZW1wbGF0ZSBmb3IgY29tcG9uZW50ICR7c3RyaW5naWZ5KGNvbXBvbmVudFR5cGUpfSBmb3VuZGApO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLl9jcmVhdGVQcm90b1ZpZXcoY29tcGlsZWRIb3N0VGVtcGxhdGUpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZVByb3RvVmlldyhjb21waWxlZEhvc3RUZW1wbGF0ZTogQ29tcGlsZWRIb3N0VGVtcGxhdGUpOiBQcm90b1ZpZXdSZWYge1xuICAgIHJldHVybiB0aGlzLl9wcm90b1ZpZXdGYWN0b3J5LmNyZWF0ZUhvc3QoY29tcGlsZWRIb3N0VGVtcGxhdGUpLnJlZjtcbiAgfVxuXG4gIGNsZWFyQ2FjaGUoKSB7IHRoaXMuX3Byb3RvVmlld0ZhY3RvcnkuY2xlYXJDYWNoZSgpOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcm5hbENyZWF0ZVByb3RvVmlldyhjb21waWxlcjogQ29tcGlsZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRIb3N0VGVtcGxhdGU6IENvbXBpbGVkSG9zdFRlbXBsYXRlKTogUHJvdG9WaWV3UmVmIHtcbiAgcmV0dXJuICg8YW55PmNvbXBpbGVyKS5fY3JlYXRlUHJvdG9WaWV3KGNvbXBpbGVkSG9zdFRlbXBsYXRlKTtcbn1cbiJdfQ==