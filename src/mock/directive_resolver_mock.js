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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlX3Jlc29sdmVyX21vY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvbW9jay9kaXJlY3RpdmVfcmVzb2x2ZXJfbW9jay50cyJdLCJuYW1lcyI6WyJNb2NrRGlyZWN0aXZlUmVzb2x2ZXIiLCJNb2NrRGlyZWN0aXZlUmVzb2x2ZXIuY29uc3RydWN0b3IiLCJNb2NrRGlyZWN0aXZlUmVzb2x2ZXIucmVzb2x2ZSIsIk1vY2tEaXJlY3RpdmVSZXNvbHZlci5zZXRCaW5kaW5nc092ZXJyaWRlIiwiTW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFZpZXdCaW5kaW5nc092ZXJyaWRlIiwiTW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFByb3ZpZGVyc092ZXJyaWRlIiwiTW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFZpZXdQcm92aWRlcnNPdmVycmlkZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCwyQkFBMkMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM1RSxxQkFBeUQsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRix5QkFBbUQsa0JBQWtCLENBQUMsQ0FBQTtBQUN0RSxtQ0FBZ0MsNkNBQTZDLENBQUMsQ0FBQTtBQUU5RTtJQUMyQ0EseUNBQWlCQTtJQUQ1REE7UUFDMkNDLDhCQUFpQkE7UUFDbERBLHVCQUFrQkEsR0FBR0EsSUFBSUEsZ0JBQUdBLEVBQWVBLENBQUNBO1FBQzVDQSwwQkFBcUJBLEdBQUdBLElBQUlBLGdCQUFHQSxFQUFlQSxDQUFDQTtJQWlFekRBLENBQUNBO0lBL0RDRCx1Q0FBT0EsR0FBUEEsVUFBUUEsSUFBVUE7UUFDaEJFLElBQUlBLEVBQUVBLEdBQUdBLGdCQUFLQSxDQUFDQSxPQUFPQSxZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUU3QkEsSUFBSUEsaUJBQWlCQSxHQUFHQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLEdBQUdBLENBQUNB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LElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7SUFDckRBLENBQUNBO0lBbkVITjtRQUFDQSxlQUFVQSxFQUFFQTs7OEJBb0VaQTtJQUFEQSw0QkFBQ0E7QUFBREEsQ0FBQ0EsQUFwRUQsRUFDMkMsc0NBQWlCLEVBbUUzRDtBQW5FWSw2QkFBcUIsd0JBbUVqQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge01hcCwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgc3RyaW5naWZ5LCBpc0JsYW5rLCBwcmludH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7RGlyZWN0aXZlTWV0YWRhdGEsIENvbXBvbmVudE1ldGFkYXRhfSBmcm9tICcuLi9jb3JlL21ldGFkYXRhJztcbmltcG9ydCB7RGlyZWN0aXZlUmVzb2x2ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9kaXJlY3RpdmVfcmVzb2x2ZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja0RpcmVjdGl2ZVJlc29sdmVyIGV4dGVuZHMgRGlyZWN0aXZlUmVzb2x2ZXIge1xuICBwcml2YXRlIF9wcm92aWRlck92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgYW55W10+KCk7XG4gIHByaXZhdGUgdmlld1Byb3ZpZGVyT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBhbnlbXT4oKTtcblxuICByZXNvbHZlKHR5cGU6IFR5cGUpOiBEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgdmFyIGRtID0gc3VwZXIucmVzb2x2ZSh0eXBlKTtcblxuICAgIHZhciBwcm92aWRlck92ZXJyaWRlcyA9IHRoaXMuX3Byb3ZpZGVyT3ZlcnJpZGVzLmdldCh0eXBlKTtcbiAgICB2YXIgdmlld1Byb3ZpZGVyT3ZlcnJpZGVzID0gdGhpcy52aWV3UHJvdmlkZXJPdmVycmlkZXMuZ2V0KHR5cGUpO1xuXG4gICAgdmFyIHByb3ZpZGVycyA9IGRtLnByb3ZpZGVycztcbiAgICBpZiAoaXNQcmVzZW50KHByb3ZpZGVyT3ZlcnJpZGVzKSkge1xuICAgICAgcHJvdmlkZXJzID0gZG0ucHJvdmlkZXJzLmNvbmNhdChwcm92aWRlck92ZXJyaWRlcyk7XG4gICAgfVxuXG4gICAgaWYgKGRtIGluc3RhbmNlb2YgQ29tcG9uZW50TWV0YWRhdGEpIHtcbiAgICAgIHZhciB2aWV3UHJvdmlkZXJzID0gZG0udmlld1Byb3ZpZGVycztcbiAgICAgIGlmIChpc1ByZXNlbnQodmlld1Byb3ZpZGVyT3ZlcnJpZGVzKSkge1xuICAgICAgICB2aWV3UHJvdmlkZXJzID0gZG0udmlld1Byb3ZpZGVycy5jb25jYXQodmlld1Byb3ZpZGVyT3ZlcnJpZGVzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBDb21wb25lbnRNZXRhZGF0YSh7XG4gICAgICAgIHNlbGVjdG9yOiBkbS5zZWxlY3RvcixcbiAgICAgICAgaW5wdXRzOiBkbS5pbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IGRtLm91dHB1dHMsXG4gICAgICAgIGhvc3Q6IGRtLmhvc3QsXG4gICAgICAgIGV4cG9ydEFzOiBkbS5leHBvcnRBcyxcbiAgICAgICAgbW9kdWxlSWQ6IGRtLm1vZHVsZUlkLFxuICAgICAgICBxdWVyaWVzOiBkbS5xdWVyaWVzLFxuICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IGRtLmNoYW5nZURldGVjdGlvbixcbiAgICAgICAgcHJvdmlkZXJzOiBwcm92aWRlcnMsXG4gICAgICAgIHZpZXdQcm92aWRlcnM6IHZpZXdQcm92aWRlcnNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgRGlyZWN0aXZlTWV0YWRhdGEoe1xuICAgICAgc2VsZWN0b3I6IGRtLnNlbGVjdG9yLFxuICAgICAgaW5wdXRzOiBkbS5pbnB1dHMsXG4gICAgICBvdXRwdXRzOiBkbS5vdXRwdXRzLFxuICAgICAgaG9zdDogZG0uaG9zdCxcbiAgICAgIHByb3ZpZGVyczogcHJvdmlkZXJzLFxuICAgICAgZXhwb3J0QXM6IGRtLmV4cG9ydEFzLFxuICAgICAgcXVlcmllczogZG0ucXVlcmllc1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBzZXRCaW5kaW5nc092ZXJyaWRlKHR5cGU6IFR5cGUsIGJpbmRpbmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIHRoaXMuX3Byb3ZpZGVyT3ZlcnJpZGVzLnNldCh0eXBlLCBiaW5kaW5ncyk7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIHNldFZpZXdCaW5kaW5nc092ZXJyaWRlKHR5cGU6IFR5cGUsIHZpZXdCaW5kaW5nczogYW55W10pOiB2b2lkIHtcbiAgICB0aGlzLnZpZXdQcm92aWRlck92ZXJyaWRlcy5zZXQodHlwZSwgdmlld0JpbmRpbmdzKTtcbiAgfVxuXG4gIHNldFByb3ZpZGVyc092ZXJyaWRlKHR5cGU6IFR5cGUsIGJpbmRpbmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIHRoaXMuX3Byb3ZpZGVyT3ZlcnJpZGVzLnNldCh0eXBlLCBiaW5kaW5ncyk7XG4gIH1cblxuICBzZXRWaWV3UHJvdmlkZXJzT3ZlcnJpZGUodHlwZTogVHlwZSwgdmlld0JpbmRpbmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIHRoaXMudmlld1Byb3ZpZGVyT3ZlcnJpZGVzLnNldCh0eXBlLCB2aWV3QmluZGluZ3MpO1xuICB9XG59XG4iXX0=