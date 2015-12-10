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
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var directive_resolver_1 = require('angular2/src/core/linker/directive_resolver');
var view_resolver_1 = require('angular2/src/core/linker/view_resolver');
var view_ref_1 = require('angular2/src/core/linker/view_ref');
var dynamic_component_loader_1 = require('angular2/src/core/linker/dynamic_component_loader');
var utils_1 = require('./utils');
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var debug_element_1 = require('angular2/src/core/debug/debug_element');
/**
 * Fixture for debugging and testing a component.
 */
var ComponentFixture = (function () {
    function ComponentFixture() {
    }
    return ComponentFixture;
})();
exports.ComponentFixture = ComponentFixture;
var ComponentFixture_ = (function (_super) {
    __extends(ComponentFixture_, _super);
    function ComponentFixture_(componentRef) {
        _super.call(this);
        this.debugElement = new debug_element_1.DebugElement_(view_ref_1.internalView(componentRef.hostView), 0);
        this.componentInstance = this.debugElement.componentInstance;
        this.nativeElement = this.debugElement.nativeElement;
        this._componentParentView = view_ref_1.internalView(componentRef.hostView);
        this._componentRef = componentRef;
    }
    ComponentFixture_.prototype.detectChanges = function () {
        this._componentParentView.changeDetector.detectChanges();
        this._componentParentView.changeDetector.checkNoChanges();
    };
    ComponentFixture_.prototype.destroy = function () { this._componentRef.dispose(); };
    return ComponentFixture_;
})(ComponentFixture);
exports.ComponentFixture_ = ComponentFixture_;
var _nextRootElementId = 0;
/**
 * Builds a ComponentFixture for use in component level tests.
 */
var TestComponentBuilder = (function () {
    function TestComponentBuilder(_injector) {
        this._injector = _injector;
        /** @internal */
        this._bindingsOverrides = new Map();
        /** @internal */
        this._directiveOverrides = new Map();
        /** @internal */
        this._templateOverrides = new Map();
        /** @internal */
        this._viewBindingsOverrides = new Map();
        /** @internal */
        this._viewOverrides = new Map();
    }
    /** @internal */
    TestComponentBuilder.prototype._clone = function () {
        var clone = new TestComponentBuilder(this._injector);
        clone._viewOverrides = collection_1.MapWrapper.clone(this._viewOverrides);
        clone._directiveOverrides = collection_1.MapWrapper.clone(this._directiveOverrides);
        clone._templateOverrides = collection_1.MapWrapper.clone(this._templateOverrides);
        return clone;
    };
    /**
     * Overrides only the html of a {@link ComponentMetadata}.
     * All the other properties of the component's {@link ViewMetadata} are preserved.
     *
     * @param {Type} component
     * @param {string} html
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideTemplate = function (componentType, template) {
        var clone = this._clone();
        clone._templateOverrides.set(componentType, template);
        return clone;
    };
    /**
     * Overrides a component's {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {view} View
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideView = function (componentType, view) {
        var clone = this._clone();
        clone._viewOverrides.set(componentType, view);
        return clone;
    };
    /**
     * Overrides the directives from the component {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {Type} from
     * @param {Type} to
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideDirective = function (componentType, from, to) {
        var clone = this._clone();
        var overridesForComponent = clone._directiveOverrides.get(componentType);
        if (!lang_1.isPresent(overridesForComponent)) {
            clone._directiveOverrides.set(componentType, new Map());
            overridesForComponent = clone._directiveOverrides.get(componentType);
        }
        overridesForComponent.set(from, to);
        return clone;
    };
    /**
     * Overrides one or more injectables configured via `providers` metadata property of a directive
     * or
     * component.
     * Very useful when certain providers need to be mocked out.
     *
     * The providers specified via this method are appended to the existing `providers` causing the
     * duplicated providers to
     * be overridden.
     *
     * @param {Type} component
     * @param {any[]} providers
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideProviders = function (type, providers) {
        var clone = this._clone();
        clone._bindingsOverrides.set(type, providers);
        return clone;
    };
    /**
     * @deprecated
     */
    TestComponentBuilder.prototype.overrideBindings = function (type, providers) {
        return this.overrideProviders(type, providers);
    };
    /**
     * Overrides one or more injectables configured via `providers` metadata property of a directive
     * or
     * component.
     * Very useful when certain providers need to be mocked out.
     *
     * The providers specified via this method are appended to the existing `providers` causing the
     * duplicated providers to
     * be overridden.
     *
     * @param {Type} component
     * @param {any[]} providers
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideViewProviders = function (type, providers) {
        var clone = this._clone();
        clone._viewBindingsOverrides.set(type, providers);
        return clone;
    };
    /**
     * @deprecated
     */
    TestComponentBuilder.prototype.overrideViewBindings = function (type, providers) {
        return this.overrideViewProviders(type, providers);
    };
    /**
     * Builds and returns a ComponentFixture.
     *
     * @return {Promise<ComponentFixture>}
     */
    TestComponentBuilder.prototype.createAsync = function (rootComponentType) {
        var mockDirectiveResolver = this._injector.get(directive_resolver_1.DirectiveResolver);
        var mockViewResolver = this._injector.get(view_resolver_1.ViewResolver);
        this._viewOverrides.forEach(function (view, type) { return mockViewResolver.setView(type, view); });
        this._templateOverrides.forEach(function (template, type) {
            return mockViewResolver.setInlineTemplate(type, template);
        });
        this._directiveOverrides.forEach(function (overrides, component) {
            overrides.forEach(function (to, from) { mockViewResolver.overrideViewDirective(component, from, to); });
        });
        this._bindingsOverrides.forEach(function (bindings, type) {
            return mockDirectiveResolver.setBindingsOverride(type, bindings);
        });
        this._viewBindingsOverrides.forEach(function (bindings, type) { return mockDirectiveResolver.setViewBindingsOverride(type, bindings); });
        var rootElId = "root" + _nextRootElementId++;
        var rootEl = utils_1.el("<div id=\"" + rootElId + "\"></div>");
        var doc = this._injector.get(dom_tokens_1.DOCUMENT);
        // TODO(juliemr): can/should this be optional?
        var oldRoots = dom_adapter_1.DOM.querySelectorAll(doc, '[id^=root]');
        for (var i = 0; i < oldRoots.length; i++) {
            dom_adapter_1.DOM.remove(oldRoots[i]);
        }
        dom_adapter_1.DOM.appendChild(doc.body, rootEl);
        return this._injector.get(dynamic_component_loader_1.DynamicComponentLoader)
            .loadAsRoot(rootComponentType, "#" + rootElId, this._injector)
            .then(function (componentRef) { return new ComponentFixture_(componentRef); });
    };
    TestComponentBuilder = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [di_1.Injector])
    ], TestComponentBuilder);
    return TestComponentBuilder;
})();
exports.TestComponentBuilder = TestComponentBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21wb25lbnRfYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXIudHMiXSwibmFtZXMiOlsiQ29tcG9uZW50Rml4dHVyZSIsIkNvbXBvbmVudEZpeHR1cmUuY29uc3RydWN0b3IiLCJDb21wb25lbnRGaXh0dXJlXyIsIkNvbXBvbmVudEZpeHR1cmVfLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50Rml4dHVyZV8uZGV0ZWN0Q2hhbmdlcyIsIkNvbXBvbmVudEZpeHR1cmVfLmRlc3Ryb3kiLCJUZXN0Q29tcG9uZW50QnVpbGRlciIsIlRlc3RDb21wb25lbnRCdWlsZGVyLmNvbnN0cnVjdG9yIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIuX2Nsb25lIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVUZW1wbGF0ZSIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlVmlldyIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlRGlyZWN0aXZlIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVQcm92aWRlcnMiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZUJpbmRpbmdzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVWaWV3UHJvdmlkZXJzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVWaWV3QmluZGluZ3MiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5jcmVhdGVBc3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1CQUE0QyxzQkFBc0IsQ0FBQyxDQUFBO0FBRW5FLHFCQUF1QywwQkFBMEIsQ0FBQyxDQUFBO0FBRWxFLDJCQUFzQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBSXZFLG1DQUFnQyw2Q0FBNkMsQ0FBQyxDQUFBO0FBQzlFLDhCQUEyQix3Q0FBd0MsQ0FBQyxDQUFBO0FBRXBFLHlCQUFvQyxt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QkEsQ0FBQ0E7YUFDNUNBLFVBQVVBLENBQUNBLGlCQUFpQkEsRUFBRUEsTUFBSUEsUUFBVUEsRUFBRUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7YUFDN0RBLElBQUlBLENBQUNBLFVBQUNBLFlBQVlBLElBQU9BLE1BQU1BLENBQUNBLElBQUlBLGlCQUFpQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDL0VBLENBQUNBO0lBdEtIVjtRQUFDQSxlQUFVQSxFQUFFQTs7NkJBdUtaQTtJQUFEQSwyQkFBQ0E7QUFBREEsQ0FBQ0EsQUF2S0QsSUF1S0M7QUF0S1ksNEJBQW9CLHVCQXNLaEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0b3IsIHByb3ZpZGUsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuaW1wb3J0IHtUeXBlLCBpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2V9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtWaWV3TWV0YWRhdGF9IGZyb20gJy4uL2NvcmUvbWV0YWRhdGEnO1xuXG5pbXBvcnQge0RpcmVjdGl2ZVJlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZGlyZWN0aXZlX3Jlc29sdmVyJztcbmltcG9ydCB7Vmlld1Jlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZXNvbHZlcic7XG5pbXBvcnQge0FwcFZpZXd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3JztcbmltcG9ydCB7aW50ZXJuYWxWaWV3LCBWaWV3UmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYnO1xuaW1wb3J0IHtcbiAgRHluYW1pY0NvbXBvbmVudExvYWRlcixcbiAgQ29tcG9uZW50UmVmXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9keW5hbWljX2NvbXBvbmVudF9sb2FkZXInO1xuXG5pbXBvcnQge2VsfSBmcm9tICcuL3V0aWxzJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fdG9rZW5zJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcblxuaW1wb3J0IHtEZWJ1Z0VsZW1lbnQsIERlYnVnRWxlbWVudF99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RlYnVnL2RlYnVnX2VsZW1lbnQnO1xuXG5cbi8qKlxuICogRml4dHVyZSBmb3IgZGVidWdnaW5nIGFuZCB0ZXN0aW5nIGEgY29tcG9uZW50LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50Rml4dHVyZSB7XG4gIC8qKlxuICAgKiBUaGUgRGVidWdFbGVtZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgY29tcG9uZW50LlxuICAgKi9cbiAgZGVidWdFbGVtZW50OiBEZWJ1Z0VsZW1lbnQ7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgcm9vdCBjb21wb25lbnQgY2xhc3MuXG4gICAqL1xuICBjb21wb25lbnRJbnN0YW5jZTogYW55O1xuXG4gIC8qKlxuICAgKiBUaGUgbmF0aXZlIGVsZW1lbnQgYXQgdGhlIHJvb3Qgb2YgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIG5hdGl2ZUVsZW1lbnQ6IGFueTtcblxuICAvKipcbiAgICogVHJpZ2dlciBhIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUgZm9yIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBhYnN0cmFjdCBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgY29tcG9uZW50IGRlc3RydWN0aW9uLlxuICAgKi9cbiAgYWJzdHJhY3QgZGVzdHJveSgpOiB2b2lkO1xufVxuXG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRGaXh0dXJlXyBleHRlbmRzIENvbXBvbmVudEZpeHR1cmUge1xuICAvKiogQGludGVybmFsICovXG4gIF9jb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29tcG9uZW50UGFyZW50VmlldzogQXBwVmlldztcblxuICBjb25zdHJ1Y3Rvcihjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5kZWJ1Z0VsZW1lbnQgPSBuZXcgRGVidWdFbGVtZW50XyhpbnRlcm5hbFZpZXcoPFZpZXdSZWY+Y29tcG9uZW50UmVmLmhvc3RWaWV3KSwgMCk7XG4gICAgdGhpcy5jb21wb25lbnRJbnN0YW5jZSA9IHRoaXMuZGVidWdFbGVtZW50LmNvbXBvbmVudEluc3RhbmNlO1xuICAgIHRoaXMubmF0aXZlRWxlbWVudCA9IHRoaXMuZGVidWdFbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy5fY29tcG9uZW50UGFyZW50VmlldyA9IGludGVybmFsVmlldyg8Vmlld1JlZj5jb21wb25lbnRSZWYuaG9zdFZpZXcpO1xuICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IGNvbXBvbmVudFJlZjtcbiAgfVxuXG4gIGRldGVjdENoYW5nZXMoKTogdm9pZCB7XG4gICAgdGhpcy5fY29tcG9uZW50UGFyZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgdGhpcy5fY29tcG9uZW50UGFyZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5jaGVja05vQ2hhbmdlcygpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fY29tcG9uZW50UmVmLmRpc3Bvc2UoKTsgfVxufVxuXG52YXIgX25leHRSb290RWxlbWVudElkID0gMDtcblxuLyoqXG4gKiBCdWlsZHMgYSBDb21wb25lbnRGaXh0dXJlIGZvciB1c2UgaW4gY29tcG9uZW50IGxldmVsIHRlc3RzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAvKiogQGludGVybmFsICovXG4gIF9iaW5kaW5nc092ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgYW55W10+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RpcmVjdGl2ZU92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgTWFwPFR5cGUsIFR5cGU+PigpO1xuICAvKiogQGludGVybmFsICovXG4gIF90ZW1wbGF0ZU92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgc3RyaW5nPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3QmluZGluZ3NPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIGFueVtdPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3T3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBWaWV3TWV0YWRhdGE+KCk7XG5cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY2xvbmUoKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IG5ldyBUZXN0Q29tcG9uZW50QnVpbGRlcih0aGlzLl9pbmplY3Rvcik7XG4gICAgY2xvbmUuX3ZpZXdPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX3ZpZXdPdmVycmlkZXMpO1xuICAgIGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX2RpcmVjdGl2ZU92ZXJyaWRlcyk7XG4gICAgY2xvbmUuX3RlbXBsYXRlT3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl90ZW1wbGF0ZU92ZXJyaWRlcyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmx5IHRoZSBodG1sIG9mIGEge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfS5cbiAgICogQWxsIHRoZSBvdGhlciBwcm9wZXJ0aWVzIG9mIHRoZSBjb21wb25lbnQncyB7QGxpbmsgVmlld01ldGFkYXRhfSBhcmUgcHJlc2VydmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlVGVtcGxhdGUoY29tcG9uZW50VHlwZTogVHlwZSwgdGVtcGxhdGU6IHN0cmluZyk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl90ZW1wbGF0ZU92ZXJyaWRlcy5zZXQoY29tcG9uZW50VHlwZSwgdGVtcGxhdGUpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgYSBjb21wb25lbnQncyB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHt2aWV3fSBWaWV3XG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVWaWV3KGNvbXBvbmVudFR5cGU6IFR5cGUsIHZpZXc6IFZpZXdNZXRhZGF0YSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl92aWV3T3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCB2aWV3KTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIHRoZSBkaXJlY3RpdmVzIGZyb20gdGhlIGNvbXBvbmVudCB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHtUeXBlfSBmcm9tXG4gICAqIEBwYXJhbSB7VHlwZX0gdG9cbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZURpcmVjdGl2ZShjb21wb25lbnRUeXBlOiBUeXBlLCBmcm9tOiBUeXBlLCB0bzogVHlwZSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIHZhciBvdmVycmlkZXNGb3JDb21wb25lbnQgPSBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLmdldChjb21wb25lbnRUeXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChvdmVycmlkZXNGb3JDb21wb25lbnQpKSB7XG4gICAgICBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCBuZXcgTWFwPFR5cGUsIFR5cGU+KCkpO1xuICAgICAgb3ZlcnJpZGVzRm9yQ29tcG9uZW50ID0gY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcy5nZXQoY29tcG9uZW50VHlwZSk7XG4gICAgfVxuICAgIG92ZXJyaWRlc0ZvckNvbXBvbmVudC5zZXQoZnJvbSwgdG8pO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgb25lIG9yIG1vcmUgaW5qZWN0YWJsZXMgY29uZmlndXJlZCB2aWEgYHByb3ZpZGVyc2AgbWV0YWRhdGEgcHJvcGVydHkgb2YgYSBkaXJlY3RpdmVcbiAgICogb3JcbiAgICogY29tcG9uZW50LlxuICAgKiBWZXJ5IHVzZWZ1bCB3aGVuIGNlcnRhaW4gcHJvdmlkZXJzIG5lZWQgdG8gYmUgbW9ja2VkIG91dC5cbiAgICpcbiAgICogVGhlIHByb3ZpZGVycyBzcGVjaWZpZWQgdmlhIHRoaXMgbWV0aG9kIGFyZSBhcHBlbmRlZCB0byB0aGUgZXhpc3RpbmcgYHByb3ZpZGVyc2AgY2F1c2luZyB0aGVcbiAgICogZHVwbGljYXRlZCBwcm92aWRlcnMgdG9cbiAgICogYmUgb3ZlcnJpZGRlbi5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHthbnlbXX0gcHJvdmlkZXJzXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVQcm92aWRlcnModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl9iaW5kaW5nc092ZXJyaWRlcy5zZXQodHlwZSwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIG92ZXJyaWRlQmluZGluZ3ModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5vdmVycmlkZVByb3ZpZGVycyh0eXBlLCBwcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmUgb3IgbW9yZSBpbmplY3RhYmxlcyBjb25maWd1cmVkIHZpYSBgcHJvdmlkZXJzYCBtZXRhZGF0YSBwcm9wZXJ0eSBvZiBhIGRpcmVjdGl2ZVxuICAgKiBvclxuICAgKiBjb21wb25lbnQuXG4gICAqIFZlcnkgdXNlZnVsIHdoZW4gY2VydGFpbiBwcm92aWRlcnMgbmVlZCB0byBiZSBtb2NrZWQgb3V0LlxuICAgKlxuICAgKiBUaGUgcHJvdmlkZXJzIHNwZWNpZmllZCB2aWEgdGhpcyBtZXRob2QgYXJlIGFwcGVuZGVkIHRvIHRoZSBleGlzdGluZyBgcHJvdmlkZXJzYCBjYXVzaW5nIHRoZVxuICAgKiBkdXBsaWNhdGVkIHByb3ZpZGVycyB0b1xuICAgKiBiZSBvdmVycmlkZGVuLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge2FueVtdfSBwcm92aWRlcnNcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVZpZXdQcm92aWRlcnModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl92aWV3QmluZGluZ3NPdmVycmlkZXMuc2V0KHR5cGUsIHByb3ZpZGVycyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBvdmVycmlkZVZpZXdCaW5kaW5ncyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHJldHVybiB0aGlzLm92ZXJyaWRlVmlld1Byb3ZpZGVycyh0eXBlLCBwcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbmQgcmV0dXJucyBhIENvbXBvbmVudEZpeHR1cmUuXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb21pc2U8Q29tcG9uZW50Rml4dHVyZT59XG4gICAqL1xuICBjcmVhdGVBc3luYyhyb290Q29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8Q29tcG9uZW50Rml4dHVyZT4ge1xuICAgIHZhciBtb2NrRGlyZWN0aXZlUmVzb2x2ZXIgPSB0aGlzLl9pbmplY3Rvci5nZXQoRGlyZWN0aXZlUmVzb2x2ZXIpO1xuICAgIHZhciBtb2NrVmlld1Jlc29sdmVyID0gdGhpcy5faW5qZWN0b3IuZ2V0KFZpZXdSZXNvbHZlcik7XG4gICAgdGhpcy5fdmlld092ZXJyaWRlcy5mb3JFYWNoKCh2aWV3LCB0eXBlKSA9PiBtb2NrVmlld1Jlc29sdmVyLnNldFZpZXcodHlwZSwgdmlldykpO1xuICAgIHRoaXMuX3RlbXBsYXRlT3ZlcnJpZGVzLmZvckVhY2goKHRlbXBsYXRlLCB0eXBlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vY2tWaWV3UmVzb2x2ZXIuc2V0SW5saW5lVGVtcGxhdGUodHlwZSwgdGVtcGxhdGUpKTtcbiAgICB0aGlzLl9kaXJlY3RpdmVPdmVycmlkZXMuZm9yRWFjaCgob3ZlcnJpZGVzLCBjb21wb25lbnQpID0+IHtcbiAgICAgIG92ZXJyaWRlcy5mb3JFYWNoKFxuICAgICAgICAgICh0bywgZnJvbSkgPT4geyBtb2NrVmlld1Jlc29sdmVyLm92ZXJyaWRlVmlld0RpcmVjdGl2ZShjb21wb25lbnQsIGZyb20sIHRvKTsgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9iaW5kaW5nc092ZXJyaWRlcy5mb3JFYWNoKChiaW5kaW5ncywgdHlwZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2NrRGlyZWN0aXZlUmVzb2x2ZXIuc2V0QmluZGluZ3NPdmVycmlkZSh0eXBlLCBiaW5kaW5ncykpO1xuICAgIHRoaXMuX3ZpZXdCaW5kaW5nc092ZXJyaWRlcy5mb3JFYWNoKFxuICAgICAgICAoYmluZGluZ3MsIHR5cGUpID0+IG1vY2tEaXJlY3RpdmVSZXNvbHZlci5zZXRWaWV3QmluZGluZ3NPdmVycmlkZSh0eXBlLCBiaW5kaW5ncykpO1xuXG4gICAgdmFyIHJvb3RFbElkID0gYHJvb3Qke19uZXh0Um9vdEVsZW1lbnRJZCsrfWA7XG4gICAgdmFyIHJvb3RFbCA9IGVsKGA8ZGl2IGlkPVwiJHtyb290RWxJZH1cIj48L2Rpdj5gKTtcbiAgICB2YXIgZG9jID0gdGhpcy5faW5qZWN0b3IuZ2V0KERPQ1VNRU5UKTtcblxuICAgIC8vIFRPRE8oanVsaWVtcik6IGNhbi9zaG91bGQgdGhpcyBiZSBvcHRpb25hbD9cbiAgICB2YXIgb2xkUm9vdHMgPSBET00ucXVlcnlTZWxlY3RvckFsbChkb2MsICdbaWRePXJvb3RdJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGRSb290cy5sZW5ndGg7IGkrKykge1xuICAgICAgRE9NLnJlbW92ZShvbGRSb290c1tpXSk7XG4gICAgfVxuICAgIERPTS5hcHBlbmRDaGlsZChkb2MuYm9keSwgcm9vdEVsKTtcblxuXG4gICAgcmV0dXJuIHRoaXMuX2luamVjdG9yLmdldChEeW5hbWljQ29tcG9uZW50TG9hZGVyKVxuICAgICAgICAubG9hZEFzUm9vdChyb290Q29tcG9uZW50VHlwZSwgYCMke3Jvb3RFbElkfWAsIHRoaXMuX2luamVjdG9yKVxuICAgICAgICAudGhlbigoY29tcG9uZW50UmVmKSA9PiB7IHJldHVybiBuZXcgQ29tcG9uZW50Rml4dHVyZV8oY29tcG9uZW50UmVmKTsgfSk7XG4gIH1cbn1cbiJdfQ==