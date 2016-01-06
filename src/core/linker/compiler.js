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
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var async_1 = require('angular2/src/facade/async');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var view_1 = require('angular2/src/core/linker/view');
var view_ref_1 = require('angular2/src/core/linker/view_ref');
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
function isHostViewFactory(type) {
    return type instanceof view_1.HostViewFactory;
}
var Compiler_ = (function (_super) {
    __extends(Compiler_, _super);
    function Compiler_() {
        _super.apply(this, arguments);
    }
    Compiler_.prototype.compileInHost = function (componentType) {
        var metadatas = reflection_1.reflector.annotations(componentType);
        var hostViewFactory = metadatas.find(isHostViewFactory);
        if (lang_1.isBlank(hostViewFactory)) {
            throw new exceptions_1.BaseException("No precompiled component " + lang_1.stringify(componentType) + " found");
        }
        return async_1.PromiseWrapper.resolve(new view_ref_1.HostViewFactoryRef_(hostViewFactory));
    };
    Compiler_.prototype.clearCache = function () { };
    Compiler_ = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], Compiler_);
    return Compiler_;
})(Compiler);
exports.Compiler_ = Compiler_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcGlsZXIudHMiXSwibmFtZXMiOlsiQ29tcGlsZXIiLCJDb21waWxlci5jb25zdHJ1Y3RvciIsImlzSG9zdFZpZXdGYWN0b3J5IiwiQ29tcGlsZXJfIiwiQ29tcGlsZXJfLmNvbnN0cnVjdG9yIiwiQ29tcGlsZXJfLmNvbXBpbGVJbkhvc3QiLCJDb21waWxlcl8uY2xlYXJDYWNoZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFFQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNsRSwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCxzQkFBc0MsMkJBQTJCLENBQUMsQ0FBQTtBQUNsRSwyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUNsRSxxQkFBOEIsK0JBQStCLENBQUMsQ0FBQTtBQUM5RCx5QkFBa0MsbUNBQW1DLENBQUMsQ0FBQTtBQUV0RTs7Ozs7O0dBTUc7QUFDSDtJQUFBQTtJQUdBQyxDQUFDQTtJQUFERCxlQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFIcUIsZ0JBQVEsV0FHN0IsQ0FBQTtBQUVELDJCQUEyQixJQUFTO0lBQ2xDRSxNQUFNQSxDQUFDQSxJQUFJQSxZQUFZQSxzQkFBZUEsQ0FBQ0E7QUFDekNBLENBQUNBO0FBRUQ7SUFDK0JDLDZCQUFRQTtJQUR2Q0E7UUFDK0JDLDhCQUFRQTtJQVl2Q0EsQ0FBQ0E7SUFYQ0QsaUNBQWFBLEdBQWJBLFVBQWNBLGFBQW1CQTtRQUMvQkUsSUFBSUEsU0FBU0EsR0FBR0Esc0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBQ3JEQSxJQUFJQSxlQUFlQSxHQUFHQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBO1FBRXhEQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3QkEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLDhCQUE0QkEsZ0JBQVNBLENBQUNBLGFBQWFBLENBQUNBLFdBQVFBLENBQUNBLENBQUNBO1FBQ3hGQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxzQkFBY0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsOEJBQW1CQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMxRUEsQ0FBQ0E7SUFFREYsOEJBQVVBLEdBQVZBLGNBQWNHLENBQUNBO0lBWmpCSDtRQUFDQSxlQUFVQSxFQUFFQTs7a0JBYVpBO0lBQURBLGdCQUFDQTtBQUFEQSxDQUFDQSxBQWJELEVBQytCLFFBQVEsRUFZdEM7QUFaWSxpQkFBUyxZQVlyQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtIb3N0Vmlld0ZhY3RvcnlSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3JlZic7XG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlLCBpc0JsYW5rLCBzdHJpbmdpZnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1Byb21pc2UsIFByb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtIb3N0Vmlld0ZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3JztcbmltcG9ydCB7SG9zdFZpZXdGYWN0b3J5UmVmX30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfcmVmJztcblxuLyoqXG4gKiBMb3ctbGV2ZWwgc2VydmljZSBmb3IgY29tcGlsaW5nIHtAbGluayBDb21wb25lbnR9cyBpbnRvIHtAbGluayBQcm90b1ZpZXdSZWYgUHJvdG9WaWV3c31zLCB3aGljaFxuICogY2FuIGxhdGVyIGJlIHVzZWQgdG8gY3JlYXRlIGFuZCByZW5kZXIgYSBDb21wb25lbnQgaW5zdGFuY2UuXG4gKlxuICogTW9zdCBhcHBsaWNhdGlvbnMgc2hvdWxkIGluc3RlYWQgdXNlIGhpZ2hlci1sZXZlbCB7QGxpbmsgRHluYW1pY0NvbXBvbmVudExvYWRlcn0gc2VydmljZSwgd2hpY2hcbiAqIGJvdGggY29tcGlsZXMgYW5kIGluc3RhbnRpYXRlcyBhIENvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBpbGVyIHtcbiAgYWJzdHJhY3QgY29tcGlsZUluSG9zdChjb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxIb3N0Vmlld0ZhY3RvcnlSZWY+O1xuICBhYnN0cmFjdCBjbGVhckNhY2hlKCk7XG59XG5cbmZ1bmN0aW9uIGlzSG9zdFZpZXdGYWN0b3J5KHR5cGU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZSBpbnN0YW5jZW9mIEhvc3RWaWV3RmFjdG9yeTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbXBpbGVyXyBleHRlbmRzIENvbXBpbGVyIHtcbiAgY29tcGlsZUluSG9zdChjb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxIb3N0Vmlld0ZhY3RvcnlSZWZfPiB7XG4gICAgdmFyIG1ldGFkYXRhcyA9IHJlZmxlY3Rvci5hbm5vdGF0aW9ucyhjb21wb25lbnRUeXBlKTtcbiAgICB2YXIgaG9zdFZpZXdGYWN0b3J5ID0gbWV0YWRhdGFzLmZpbmQoaXNIb3N0Vmlld0ZhY3RvcnkpO1xuXG4gICAgaWYgKGlzQmxhbmsoaG9zdFZpZXdGYWN0b3J5KSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYE5vIHByZWNvbXBpbGVkIGNvbXBvbmVudCAke3N0cmluZ2lmeShjb21wb25lbnRUeXBlKX0gZm91bmRgKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUobmV3IEhvc3RWaWV3RmFjdG9yeVJlZl8oaG9zdFZpZXdGYWN0b3J5KSk7XG4gIH1cblxuICBjbGVhckNhY2hlKCkge31cbn1cbiJdfQ==