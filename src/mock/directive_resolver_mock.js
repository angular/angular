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
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var metadata_1 = require('../core/metadata');
var directive_resolver_1 = require('angular2/src/core/linker/directive_resolver');
/**
 * An implementation of {@link DirectiveResolver} that allows overriding
 * various properties of directives.
 */
var MockDirectiveResolver = (function (_super) {
    __extends(MockDirectiveResolver, _super);
    function MockDirectiveResolver() {
        _super.apply(this, arguments);
        this._providerOverrides = new collection_1.Map();
        this.viewProviderOverrides = new collection_1.Map();
    }
    MockDirectiveResolver.prototype.resolve = function (type) {
        var dm = _super.prototype.resolve.call(this, type);
        var providerOverrides = this._providerOverrides.get(type);
        var viewProviderOverrides = this.viewProviderOverrides.get(type);
        var providers = dm.providers;
        if (lang_1.isPresent(providerOverrides)) {
            providers = dm.providers.concat(providerOverrides);
        }
        if (dm instanceof metadata_1.ComponentMetadata) {
            var viewProviders = dm.viewProviders;
            if (lang_1.isPresent(viewProviderOverrides)) {
                viewProviders = dm.viewProviders.concat(viewProviderOverrides);
            }
            return new metadata_1.ComponentMetadata({
                selector: dm.selector,
                inputs: dm.inputs,
                outputs: dm.outputs,
                host: dm.host,
                exportAs: dm.exportAs,
                moduleId: dm.moduleId,
                queries: dm.queries,
                changeDetection: dm.changeDetection,
                providers: providers,
                viewProviders: viewProviders
            });
        }
        return new metadata_1.DirectiveMetadata({
            selector: dm.selector,
            inputs: dm.inputs,
            outputs: dm.outputs,
            host: dm.host,
            providers: providers,
            exportAs: dm.exportAs,
            queries: dm.queries
        });
    };
    /**
     * @deprecated
     */
    MockDirectiveResolver.prototype.setBindingsOverride = function (type, bindings) {
        this._providerOverrides.set(type, bindings);
    };
    /**
     * @deprecated
     */
    MockDirectiveResolver.prototype.setViewBindingsOverride = function (type, viewBindings) {
        this.viewProviderOverrides.set(type, viewBindings);
    };
    MockDirectiveResolver.prototype.setProvidersOverride = function (type, bindings) {
        this._providerOverrides.set(type, bindings);
    };
    MockDirectiveResolver.prototype.setViewProvidersOverride = function (type, viewBindings) {
        this.viewProviderOverrides.set(type, viewBindings);
    };
    MockDirectiveResolver = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockDirectiveResolver);
    return MockDirectiveResolver;
})(directive_resolver_1.DirectiveResolver);
exports.MockDirectiveResolver = MockDirectiveResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX3Jlc29sdmVyX21vY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvbW9jay9kaXJlY3RpdmVfcmVzb2x2ZXJfbW9jay50cyJdLCJuYW1lcyI6WyJNb2NrRGlyZWN0aXZlUmVzb2x2ZXIiLCJNb2NrRGlyZWN0aXZlUmVzb2x2ZXIuY29uc3RydWN0b3IiLCJNb2NrRGlyZWN0aXZlUmVzb2x2ZXIucmVzb2x2ZSIsIk1vY2tEaXJlY3RpdmVSZXNvbHZlci5zZXRCaW5kaW5nc092ZXJyaWRlIiwiTW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFZpZXdCaW5kaW5nc092ZXJyaWRlIiwiTW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFByb3ZpZGVyc092ZXJyaWRlIiwiTW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFZpZXdQcm92aWRlcnNPdmVycmlkZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCwyQkFBMkMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM1RSxxQkFBeUQsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRix5QkFBbUQsa0JBQWtCLENBQUMsQ0FBQTtBQUN0RSxtQ0FBZ0MsNkNBQTZDLENBQUMsQ0FBQTtBQUU5RTs7O0dBR0c7QUFDSDtJQUMyQ0EseUNBQWlCQTtJQUQ1REE7UUFDMkNDLDhCQUFpQkE7UUFDbERBLHVCQUFrQkEsR0FBR0EsSUFBSUEsZ0JBQUdBLEVBQWVBLENBQUNBO1FBQzVDQSwwQkFBcUJBLEdBQUdBLElBQUlBLGdCQUFHQSxFQUFlQSxDQUFDQTtJQWlFekRBLENBQUNBO0lBL0RDRCx1Q0FBT0EsR0FBUEEsVUFBUUEsSUFBVUE7UUFDaEJFLElBQUlBLEVBQUVBLEdBQUdBLGdCQUFLQSxDQUFDQSxPQUFPQSxZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUU3QkEsSUFBSUEsaUJBQWlCQSxHQUFHQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNB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QUFtQkE7UUFDdERNLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7SUFDckRBLENBQUNBO0lBbkVITjtRQUFDQSxlQUFVQSxFQUFFQTs7OEJBb0VaQTtJQUFEQSw0QkFBQ0E7QUFBREEsQ0FBQ0EsQUFwRUQsRUFDMkMsc0NBQWlCLEVBbUUzRDtBQW5FWSw2QkFBcUIsd0JBbUVqQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge01hcCwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgc3RyaW5naWZ5LCBpc0JsYW5rLCBwcmludH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7RGlyZWN0aXZlTWV0YWRhdGEsIENvbXBvbmVudE1ldGFkYXRhfSBmcm9tICcuLi9jb3JlL21ldGFkYXRhJztcbmltcG9ydCB7RGlyZWN0aXZlUmVzb2x2ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9kaXJlY3RpdmVfcmVzb2x2ZXInO1xuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIHtAbGluayBEaXJlY3RpdmVSZXNvbHZlcn0gdGhhdCBhbGxvd3Mgb3ZlcnJpZGluZ1xuICogdmFyaW91cyBwcm9wZXJ0aWVzIG9mIGRpcmVjdGl2ZXMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrRGlyZWN0aXZlUmVzb2x2ZXIgZXh0ZW5kcyBEaXJlY3RpdmVSZXNvbHZlciB7XG4gIHByaXZhdGUgX3Byb3ZpZGVyT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBhbnlbXT4oKTtcbiAgcHJpdmF0ZSB2aWV3UHJvdmlkZXJPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIGFueVtdPigpO1xuXG4gIHJlc29sdmUodHlwZTogVHlwZSk6IERpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICB2YXIgZG0gPSBzdXBlci5yZXNvbHZlKHR5cGUpO1xuXG4gICAgdmFyIHByb3ZpZGVyT3ZlcnJpZGVzID0gdGhpcy5fcHJvdmlkZXJPdmVycmlkZXMuZ2V0KHR5cGUpO1xuICAgIHZhciB2aWV3UHJvdmlkZXJPdmVycmlkZXMgPSB0aGlzLnZpZXdQcm92aWRlck92ZXJyaWRlcy5nZXQodHlwZSk7XG5cbiAgICB2YXIgcHJvdmlkZXJzID0gZG0ucHJvdmlkZXJzO1xuICAgIGlmIChpc1ByZXNlbnQocHJvdmlkZXJPdmVycmlkZXMpKSB7XG4gICAgICBwcm92aWRlcnMgPSBkbS5wcm92aWRlcnMuY29uY2F0KHByb3ZpZGVyT3ZlcnJpZGVzKTtcbiAgICB9XG5cbiAgICBpZiAoZG0gaW5zdGFuY2VvZiBDb21wb25lbnRNZXRhZGF0YSkge1xuICAgICAgdmFyIHZpZXdQcm92aWRlcnMgPSBkbS52aWV3UHJvdmlkZXJzO1xuICAgICAgaWYgKGlzUHJlc2VudCh2aWV3UHJvdmlkZXJPdmVycmlkZXMpKSB7XG4gICAgICAgIHZpZXdQcm92aWRlcnMgPSBkbS52aWV3UHJvdmlkZXJzLmNvbmNhdCh2aWV3UHJvdmlkZXJPdmVycmlkZXMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IENvbXBvbmVudE1ldGFkYXRhKHtcbiAgICAgICAgc2VsZWN0b3I6IGRtLnNlbGVjdG9yLFxuICAgICAgICBpbnB1dHM6IGRtLmlucHV0cyxcbiAgICAgICAgb3V0cHV0czogZG0ub3V0cHV0cyxcbiAgICAgICAgaG9zdDogZG0uaG9zdCxcbiAgICAgICAgZXhwb3J0QXM6IGRtLmV4cG9ydEFzLFxuICAgICAgICBtb2R1bGVJZDogZG0ubW9kdWxlSWQsXG4gICAgICAgIHF1ZXJpZXM6IGRtLnF1ZXJpZXMsXG4gICAgICAgIGNoYW5nZURldGVjdGlvbjogZG0uY2hhbmdlRGV0ZWN0aW9uLFxuICAgICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyxcbiAgICAgICAgdmlld1Byb3ZpZGVyczogdmlld1Byb3ZpZGVyc1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBEaXJlY3RpdmVNZXRhZGF0YSh7XG4gICAgICBzZWxlY3RvcjogZG0uc2VsZWN0b3IsXG4gICAgICBpbnB1dHM6IGRtLmlucHV0cyxcbiAgICAgIG91dHB1dHM6IGRtLm91dHB1dHMsXG4gICAgICBob3N0OiBkbS5ob3N0LFxuICAgICAgcHJvdmlkZXJzOiBwcm92aWRlcnMsXG4gICAgICBleHBvcnRBczogZG0uZXhwb3J0QXMsXG4gICAgICBxdWVyaWVzOiBkbS5xdWVyaWVzXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIHNldEJpbmRpbmdzT3ZlcnJpZGUodHlwZTogVHlwZSwgYmluZGluZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvdmlkZXJPdmVycmlkZXMuc2V0KHR5cGUsIGJpbmRpbmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgc2V0Vmlld0JpbmRpbmdzT3ZlcnJpZGUodHlwZTogVHlwZSwgdmlld0JpbmRpbmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIHRoaXMudmlld1Byb3ZpZGVyT3ZlcnJpZGVzLnNldCh0eXBlLCB2aWV3QmluZGluZ3MpO1xuICB9XG5cbiAgc2V0UHJvdmlkZXJzT3ZlcnJpZGUodHlwZTogVHlwZSwgYmluZGluZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvdmlkZXJPdmVycmlkZXMuc2V0KHR5cGUsIGJpbmRpbmdzKTtcbiAgfVxuXG4gIHNldFZpZXdQcm92aWRlcnNPdmVycmlkZSh0eXBlOiBUeXBlLCB2aWV3QmluZGluZ3M6IGFueVtdKTogdm9pZCB7XG4gICAgdGhpcy52aWV3UHJvdmlkZXJPdmVycmlkZXMuc2V0KHR5cGUsIHZpZXdCaW5kaW5ncyk7XG4gIH1cbn1cbiJdfQ==