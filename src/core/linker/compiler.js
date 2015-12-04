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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcGlsZXIudHMiXSwibmFtZXMiOlsiQ29tcGlsZXIiLCJDb21waWxlci5jb25zdHJ1Y3RvciIsIl9pc0NvbXBpbGVkSG9zdFRlbXBsYXRlIiwiQ29tcGlsZXJfIiwiQ29tcGlsZXJfLmNvbnN0cnVjdG9yIiwiQ29tcGlsZXJfLmNvbXBpbGVJbkhvc3QiLCJDb21waWxlcl8uX2NyZWF0ZVByb3RvVmlldyIsIkNvbXBpbGVyXy5jbGVhckNhY2hlIiwiaW50ZXJuYWxDcmVhdGVQcm90b1ZpZXciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxtQ0FBK0IsNkNBQTZDLENBQUMsQ0FBQTtBQUU3RSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNsRSwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCxzQkFBc0MsMkJBQTJCLENBQUMsQ0FBQTtBQUNsRSwyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUNsRSxrQ0FBbUMsNENBQTRDLENBQUMsQ0FBQTtBQUVoRjs7Ozs7O0dBTUc7QUFDSDtJQUFBQTtJQUdBQyxDQUFDQTtJQUFERCxlQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFIcUIsZ0JBQVEsV0FHN0IsQ0FBQTtBQUVELGlDQUFpQyxJQUFTO0lBQ3hDRSxNQUFNQSxDQUFDQSxJQUFJQSxZQUFZQSx3Q0FBb0JBLENBQUNBO0FBQzlDQSxDQUFDQTtBQUVEO0lBQytCQyw2QkFBUUE7SUFDckNBLG1CQUFvQkEsaUJBQW1DQTtRQUFJQyxpQkFBT0EsQ0FBQ0E7UUFBL0NBLHNCQUFpQkEsR0FBakJBLGlCQUFpQkEsQ0FBa0JBO0lBQWFBLENBQUNBO0lBRXJFRCxpQ0FBYUEsR0FBYkEsVUFBY0EsYUFBbUJBO1FBQy9CRSxJQUFJQSxTQUFTQSxHQUFHQSxzQkFBU0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDckRBLElBQUlBLG9CQUFvQkEsR0FBR0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxDQUFDQTtRQUVuRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsTUFBTUEsSUFBSUEsMEJBQWFBLENBQ25CQSwyQ0FBeUNBLGdCQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxXQUFRQSxDQUFDQSxDQUFDQTtRQUNqRkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0Esc0JBQWNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM3RUEsQ0FBQ0E7SUFFT0Ysb0NBQWdCQSxHQUF4QkEsVUFBeUJBLG9CQUEwQ0E7UUFDakVHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQTtJQUNyRUEsQ0FBQ0E7SUFFREgsOEJBQVVBLEdBQVZBLGNBQWVJLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFuQnZESjtRQUFDQSxlQUFVQSxFQUFFQTs7a0JBb0JaQTtJQUFEQSxnQkFBQ0E7QUFBREEsQ0FBQ0EsQUFwQkQsRUFDK0IsUUFBUSxFQW1CdEM7QUFuQlksaUJBQVMsWUFtQnJCLENBQUE7QUFFRCxpQ0FBd0MsUUFBa0IsRUFDbEIsb0JBQTBDO0lBQ2hGSyxNQUFNQSxDQUFPQSxRQUFTQSxDQUFDQSxnQkFBZ0JBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7QUFDaEVBLENBQUNBO0FBSGUsK0JBQXVCLDBCQUd0QyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQcm90b1ZpZXdSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3JlZic7XG5pbXBvcnQge1Byb3RvVmlld0ZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9wcm90b192aWV3X2ZhY3RvcnknO1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7VHlwZSwgaXNCbGFuaywgc3RyaW5naWZ5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7Q29tcGlsZWRIb3N0VGVtcGxhdGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci90ZW1wbGF0ZV9jb21tYW5kcyc7XG5cbi8qKlxuICogTG93LWxldmVsIHNlcnZpY2UgZm9yIGNvbXBpbGluZyB7QGxpbmsgQ29tcG9uZW50fXMgaW50byB7QGxpbmsgUHJvdG9WaWV3UmVmIFByb3RvVmlld3N9cywgd2hpY2hcbiAqIGNhbiBsYXRlciBiZSB1c2VkIHRvIGNyZWF0ZSBhbmQgcmVuZGVyIGEgQ29tcG9uZW50IGluc3RhbmNlLlxuICpcbiAqIE1vc3QgYXBwbGljYXRpb25zIHNob3VsZCBpbnN0ZWFkIHVzZSBoaWdoZXItbGV2ZWwge0BsaW5rIER5bmFtaWNDb21wb25lbnRMb2FkZXJ9IHNlcnZpY2UsIHdoaWNoXG4gKiBib3RoIGNvbXBpbGVzIGFuZCBpbnN0YW50aWF0ZXMgYSBDb21wb25lbnQuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21waWxlciB7XG4gIGFic3RyYWN0IGNvbXBpbGVJbkhvc3QoY29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8UHJvdG9WaWV3UmVmPjtcbiAgYWJzdHJhY3QgY2xlYXJDYWNoZSgpO1xufVxuXG5mdW5jdGlvbiBfaXNDb21waWxlZEhvc3RUZW1wbGF0ZSh0eXBlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGUgaW5zdGFuY2VvZiBDb21waWxlZEhvc3RUZW1wbGF0ZTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbXBpbGVyXyBleHRlbmRzIENvbXBpbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcHJvdG9WaWV3RmFjdG9yeTogUHJvdG9WaWV3RmFjdG9yeSkgeyBzdXBlcigpOyB9XG5cbiAgY29tcGlsZUluSG9zdChjb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxQcm90b1ZpZXdSZWY+IHtcbiAgICB2YXIgbWV0YWRhdGFzID0gcmVmbGVjdG9yLmFubm90YXRpb25zKGNvbXBvbmVudFR5cGUpO1xuICAgIHZhciBjb21waWxlZEhvc3RUZW1wbGF0ZSA9IG1ldGFkYXRhcy5maW5kKF9pc0NvbXBpbGVkSG9zdFRlbXBsYXRlKTtcblxuICAgIGlmIChpc0JsYW5rKGNvbXBpbGVkSG9zdFRlbXBsYXRlKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYE5vIHByZWNvbXBpbGVkIHRlbXBsYXRlIGZvciBjb21wb25lbnQgJHtzdHJpbmdpZnkoY29tcG9uZW50VHlwZSl9IGZvdW5kYCk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuX2NyZWF0ZVByb3RvVmlldyhjb21waWxlZEhvc3RUZW1wbGF0ZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlUHJvdG9WaWV3KGNvbXBpbGVkSG9zdFRlbXBsYXRlOiBDb21waWxlZEhvc3RUZW1wbGF0ZSk6IFByb3RvVmlld1JlZiB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3RvVmlld0ZhY3RvcnkuY3JlYXRlSG9zdChjb21waWxlZEhvc3RUZW1wbGF0ZSkucmVmO1xuICB9XG5cbiAgY2xlYXJDYWNoZSgpIHsgdGhpcy5fcHJvdG9WaWV3RmFjdG9yeS5jbGVhckNhY2hlKCk7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludGVybmFsQ3JlYXRlUHJvdG9WaWV3KGNvbXBpbGVyOiBDb21waWxlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlZEhvc3RUZW1wbGF0ZTogQ29tcGlsZWRIb3N0VGVtcGxhdGUpOiBQcm90b1ZpZXdSZWYge1xuICByZXR1cm4gKDxhbnk+Y29tcGlsZXIpLl9jcmVhdGVQcm90b1ZpZXcoY29tcGlsZWRIb3N0VGVtcGxhdGUpO1xufVxuIl19