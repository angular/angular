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
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
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
        this._componentParentView = componentRef.hostView.internalView;
        this.debugElement = new debug_element_1.DebugElement_(this._componentParentView.appElements[0]);
        this.componentInstance = this.debugElement.componentInstance;
        this.nativeElement = this.debugElement.nativeElement;
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
        var mockDirectiveResolver = this._injector.get(core_1.DirectiveResolver);
        var mockViewResolver = this._injector.get(core_1.ViewResolver);
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
        return this._injector.get(core_1.DynamicComponentLoader)
            .loadAsRoot(rootComponentType, "#" + rootElId, this._injector)
            .then(function (componentRef) { return new ComponentFixture_(componentRef); });
    };
    TestComponentBuilder = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [core_1.Injector])
    ], TestComponentBuilder);
    return TestComponentBuilder;
})();
exports.TestComponentBuilder = TestComponentBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21wb25lbnRfYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXIudHMiXSwibmFtZXMiOlsiQ29tcG9uZW50Rml4dHVyZSIsIkNvbXBvbmVudEZpeHR1cmUuY29uc3RydWN0b3IiLCJDb21wb25lbnRGaXh0dXJlXyIsIkNvbXBvbmVudEZpeHR1cmVfLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50Rml4dHVyZV8uZGV0ZWN0Q2hhbmdlcyIsIkNvbXBvbmVudEZpeHR1cmVfLmRlc3Ryb3kiLCJUZXN0Q29tcG9uZW50QnVpbGRlciIsIlRlc3RDb21wb25lbnRCdWlsZGVyLmNvbnN0cnVjdG9yIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIuX2Nsb25lIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVUZW1wbGF0ZSIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlVmlldyIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlRGlyZWN0aXZlIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVQcm92aWRlcnMiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZUJpbmRpbmdzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVWaWV3UHJvdmlkZXJzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVWaWV3QmluZGluZ3MiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5jcmVhdGVBc3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFXTyxlQUFlLENBQUMsQ0FBQTtBQUV2QixxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUVsRSwyQkFBc0MsZ0NBQWdDLENBQUMsQ0FBQTtBQUt2RSxzQkFBaUIsU0FBUyxDQUFDLENBQUE7QUFFM0IsMkJBQXVCLHNDQUFzQyxDQUFDLENBQUE7QUFDOUQsNEJBQWtCLHVDQUF1QyxD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Q0EsSUFBSUEsaUJBQWlCQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMvRUEsQ0FBQ0E7SUF0S0hWO1FBQUNBLGlCQUFVQSxFQUFFQTs7NkJBdUtaQTtJQUFEQSwyQkFBQ0E7QUFBREEsQ0FBQ0EsQUF2S0QsSUF1S0M7QUF0S1ksNEJBQW9CLHVCQXNLaEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudFJlZixcbiAgRGVidWdFbGVtZW50LFxuICBEaXJlY3RpdmVSZXNvbHZlcixcbiAgRHluYW1pY0NvbXBvbmVudExvYWRlcixcbiAgSW5qZWN0b3IsXG4gIEluamVjdGFibGUsXG4gIFZpZXdNZXRhZGF0YSxcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBWaWV3UmVzb2x2ZXIsXG4gIHByb3ZpZGVcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7VHlwZSwgaXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7Vmlld1JlZl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3JlZic7XG5pbXBvcnQge0FwcFZpZXd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3JztcblxuaW1wb3J0IHtlbH0gZnJvbSAnLi91dGlscyc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX3Rva2Vucyc7XG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5cbmltcG9ydCB7RGVidWdFbGVtZW50X30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGVidWcvZGVidWdfZWxlbWVudCc7XG5cblxuLyoqXG4gKiBGaXh0dXJlIGZvciBkZWJ1Z2dpbmcgYW5kIHRlc3RpbmcgYSBjb21wb25lbnQuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnRGaXh0dXJlIHtcbiAgLyoqXG4gICAqIFRoZSBEZWJ1Z0VsZW1lbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSByb290IGVsZW1lbnQgb2YgdGhpcyBjb21wb25lbnQuXG4gICAqL1xuICBkZWJ1Z0VsZW1lbnQ6IERlYnVnRWxlbWVudDtcblxuICAvKipcbiAgICogVGhlIGluc3RhbmNlIG9mIHRoZSByb290IGNvbXBvbmVudCBjbGFzcy5cbiAgICovXG4gIGNvbXBvbmVudEluc3RhbmNlOiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSBuYXRpdmUgZWxlbWVudCBhdCB0aGUgcm9vdCBvZiB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgbmF0aXZlRWxlbWVudDogYW55O1xuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSBmb3IgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIGFic3RyYWN0IGRldGVjdENoYW5nZXMoKTogdm9pZDtcblxuICAvKipcbiAgICogVHJpZ2dlciBjb21wb25lbnQgZGVzdHJ1Y3Rpb24uXG4gICAqL1xuICBhYnN0cmFjdCBkZXN0cm95KCk6IHZvaWQ7XG59XG5cblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEZpeHR1cmVfIGV4dGVuZHMgQ29tcG9uZW50Rml4dHVyZSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmO1xuICAvKiogQGludGVybmFsICovXG4gIF9jb21wb25lbnRQYXJlbnRWaWV3OiBBcHBWaWV3O1xuXG4gIGNvbnN0cnVjdG9yKGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3ID0gKDxWaWV3UmVmXz5jb21wb25lbnRSZWYuaG9zdFZpZXcpLmludGVybmFsVmlldztcbiAgICB0aGlzLmRlYnVnRWxlbWVudCA9IG5ldyBEZWJ1Z0VsZW1lbnRfKHRoaXMuX2NvbXBvbmVudFBhcmVudFZpZXcuYXBwRWxlbWVudHNbMF0pO1xuICAgIHRoaXMuY29tcG9uZW50SW5zdGFuY2UgPSB0aGlzLmRlYnVnRWxlbWVudC5jb21wb25lbnRJbnN0YW5jZTtcbiAgICB0aGlzLm5hdGl2ZUVsZW1lbnQgPSB0aGlzLmRlYnVnRWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IGNvbXBvbmVudFJlZjtcbiAgfVxuXG4gIGRldGVjdENoYW5nZXMoKTogdm9pZCB7XG4gICAgdGhpcy5fY29tcG9uZW50UGFyZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgdGhpcy5fY29tcG9uZW50UGFyZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5jaGVja05vQ2hhbmdlcygpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fY29tcG9uZW50UmVmLmRpc3Bvc2UoKTsgfVxufVxuXG52YXIgX25leHRSb290RWxlbWVudElkID0gMDtcblxuLyoqXG4gKiBCdWlsZHMgYSBDb21wb25lbnRGaXh0dXJlIGZvciB1c2UgaW4gY29tcG9uZW50IGxldmVsIHRlc3RzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAvKiogQGludGVybmFsICovXG4gIF9iaW5kaW5nc092ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgYW55W10+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RpcmVjdGl2ZU92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgTWFwPFR5cGUsIFR5cGU+PigpO1xuICAvKiogQGludGVybmFsICovXG4gIF90ZW1wbGF0ZU92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgc3RyaW5nPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3QmluZGluZ3NPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIGFueVtdPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3T3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBWaWV3TWV0YWRhdGE+KCk7XG5cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY2xvbmUoKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IG5ldyBUZXN0Q29tcG9uZW50QnVpbGRlcih0aGlzLl9pbmplY3Rvcik7XG4gICAgY2xvbmUuX3ZpZXdPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX3ZpZXdPdmVycmlkZXMpO1xuICAgIGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX2RpcmVjdGl2ZU92ZXJyaWRlcyk7XG4gICAgY2xvbmUuX3RlbXBsYXRlT3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl90ZW1wbGF0ZU92ZXJyaWRlcyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmx5IHRoZSBodG1sIG9mIGEge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfS5cbiAgICogQWxsIHRoZSBvdGhlciBwcm9wZXJ0aWVzIG9mIHRoZSBjb21wb25lbnQncyB7QGxpbmsgVmlld01ldGFkYXRhfSBhcmUgcHJlc2VydmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlVGVtcGxhdGUoY29tcG9uZW50VHlwZTogVHlwZSwgdGVtcGxhdGU6IHN0cmluZyk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl90ZW1wbGF0ZU92ZXJyaWRlcy5zZXQoY29tcG9uZW50VHlwZSwgdGVtcGxhdGUpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgYSBjb21wb25lbnQncyB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHt2aWV3fSBWaWV3XG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVWaWV3KGNvbXBvbmVudFR5cGU6IFR5cGUsIHZpZXc6IFZpZXdNZXRhZGF0YSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl92aWV3T3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCB2aWV3KTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIHRoZSBkaXJlY3RpdmVzIGZyb20gdGhlIGNvbXBvbmVudCB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHtUeXBlfSBmcm9tXG4gICAqIEBwYXJhbSB7VHlwZX0gdG9cbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZURpcmVjdGl2ZShjb21wb25lbnRUeXBlOiBUeXBlLCBmcm9tOiBUeXBlLCB0bzogVHlwZSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIHZhciBvdmVycmlkZXNGb3JDb21wb25lbnQgPSBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLmdldChjb21wb25lbnRUeXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChvdmVycmlkZXNGb3JDb21wb25lbnQpKSB7XG4gICAgICBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCBuZXcgTWFwPFR5cGUsIFR5cGU+KCkpO1xuICAgICAgb3ZlcnJpZGVzRm9yQ29tcG9uZW50ID0gY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcy5nZXQoY29tcG9uZW50VHlwZSk7XG4gICAgfVxuICAgIG92ZXJyaWRlc0ZvckNvbXBvbmVudC5zZXQoZnJvbSwgdG8pO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgb25lIG9yIG1vcmUgaW5qZWN0YWJsZXMgY29uZmlndXJlZCB2aWEgYHByb3ZpZGVyc2AgbWV0YWRhdGEgcHJvcGVydHkgb2YgYSBkaXJlY3RpdmVcbiAgICogb3JcbiAgICogY29tcG9uZW50LlxuICAgKiBWZXJ5IHVzZWZ1bCB3aGVuIGNlcnRhaW4gcHJvdmlkZXJzIG5lZWQgdG8gYmUgbW9ja2VkIG91dC5cbiAgICpcbiAgICogVGhlIHByb3ZpZGVycyBzcGVjaWZpZWQgdmlhIHRoaXMgbWV0aG9kIGFyZSBhcHBlbmRlZCB0byB0aGUgZXhpc3RpbmcgYHByb3ZpZGVyc2AgY2F1c2luZyB0aGVcbiAgICogZHVwbGljYXRlZCBwcm92aWRlcnMgdG9cbiAgICogYmUgb3ZlcnJpZGRlbi5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHthbnlbXX0gcHJvdmlkZXJzXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVQcm92aWRlcnModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl9iaW5kaW5nc092ZXJyaWRlcy5zZXQodHlwZSwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIG92ZXJyaWRlQmluZGluZ3ModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5vdmVycmlkZVByb3ZpZGVycyh0eXBlLCBwcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmUgb3IgbW9yZSBpbmplY3RhYmxlcyBjb25maWd1cmVkIHZpYSBgcHJvdmlkZXJzYCBtZXRhZGF0YSBwcm9wZXJ0eSBvZiBhIGRpcmVjdGl2ZVxuICAgKiBvclxuICAgKiBjb21wb25lbnQuXG4gICAqIFZlcnkgdXNlZnVsIHdoZW4gY2VydGFpbiBwcm92aWRlcnMgbmVlZCB0byBiZSBtb2NrZWQgb3V0LlxuICAgKlxuICAgKiBUaGUgcHJvdmlkZXJzIHNwZWNpZmllZCB2aWEgdGhpcyBtZXRob2QgYXJlIGFwcGVuZGVkIHRvIHRoZSBleGlzdGluZyBgcHJvdmlkZXJzYCBjYXVzaW5nIHRoZVxuICAgKiBkdXBsaWNhdGVkIHByb3ZpZGVycyB0b1xuICAgKiBiZSBvdmVycmlkZGVuLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge2FueVtdfSBwcm92aWRlcnNcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVZpZXdQcm92aWRlcnModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl92aWV3QmluZGluZ3NPdmVycmlkZXMuc2V0KHR5cGUsIHByb3ZpZGVycyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBvdmVycmlkZVZpZXdCaW5kaW5ncyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHJldHVybiB0aGlzLm92ZXJyaWRlVmlld1Byb3ZpZGVycyh0eXBlLCBwcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbmQgcmV0dXJucyBhIENvbXBvbmVudEZpeHR1cmUuXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb21pc2U8Q29tcG9uZW50Rml4dHVyZT59XG4gICAqL1xuICBjcmVhdGVBc3luYyhyb290Q29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8Q29tcG9uZW50Rml4dHVyZT4ge1xuICAgIHZhciBtb2NrRGlyZWN0aXZlUmVzb2x2ZXIgPSB0aGlzLl9pbmplY3Rvci5nZXQoRGlyZWN0aXZlUmVzb2x2ZXIpO1xuICAgIHZhciBtb2NrVmlld1Jlc29sdmVyID0gdGhpcy5faW5qZWN0b3IuZ2V0KFZpZXdSZXNvbHZlcik7XG4gICAgdGhpcy5fdmlld092ZXJyaWRlcy5mb3JFYWNoKCh2aWV3LCB0eXBlKSA9PiBtb2NrVmlld1Jlc29sdmVyLnNldFZpZXcodHlwZSwgdmlldykpO1xuICAgIHRoaXMuX3RlbXBsYXRlT3ZlcnJpZGVzLmZvckVhY2goKHRlbXBsYXRlLCB0eXBlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vY2tWaWV3UmVzb2x2ZXIuc2V0SW5saW5lVGVtcGxhdGUodHlwZSwgdGVtcGxhdGUpKTtcbiAgICB0aGlzLl9kaXJlY3RpdmVPdmVycmlkZXMuZm9yRWFjaCgob3ZlcnJpZGVzLCBjb21wb25lbnQpID0+IHtcbiAgICAgIG92ZXJyaWRlcy5mb3JFYWNoKFxuICAgICAgICAgICh0bywgZnJvbSkgPT4geyBtb2NrVmlld1Jlc29sdmVyLm92ZXJyaWRlVmlld0RpcmVjdGl2ZShjb21wb25lbnQsIGZyb20sIHRvKTsgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9iaW5kaW5nc092ZXJyaWRlcy5mb3JFYWNoKChiaW5kaW5ncywgdHlwZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2NrRGlyZWN0aXZlUmVzb2x2ZXIuc2V0QmluZGluZ3NPdmVycmlkZSh0eXBlLCBiaW5kaW5ncykpO1xuICAgIHRoaXMuX3ZpZXdCaW5kaW5nc092ZXJyaWRlcy5mb3JFYWNoKFxuICAgICAgICAoYmluZGluZ3MsIHR5cGUpID0+IG1vY2tEaXJlY3RpdmVSZXNvbHZlci5zZXRWaWV3QmluZGluZ3NPdmVycmlkZSh0eXBlLCBiaW5kaW5ncykpO1xuXG4gICAgdmFyIHJvb3RFbElkID0gYHJvb3Qke19uZXh0Um9vdEVsZW1lbnRJZCsrfWA7XG4gICAgdmFyIHJvb3RFbCA9IGVsKGA8ZGl2IGlkPVwiJHtyb290RWxJZH1cIj48L2Rpdj5gKTtcbiAgICB2YXIgZG9jID0gdGhpcy5faW5qZWN0b3IuZ2V0KERPQ1VNRU5UKTtcblxuICAgIC8vIFRPRE8oanVsaWVtcik6IGNhbi9zaG91bGQgdGhpcyBiZSBvcHRpb25hbD9cbiAgICB2YXIgb2xkUm9vdHMgPSBET00ucXVlcnlTZWxlY3RvckFsbChkb2MsICdbaWRePXJvb3RdJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGRSb290cy5sZW5ndGg7IGkrKykge1xuICAgICAgRE9NLnJlbW92ZShvbGRSb290c1tpXSk7XG4gICAgfVxuICAgIERPTS5hcHBlbmRDaGlsZChkb2MuYm9keSwgcm9vdEVsKTtcblxuXG4gICAgcmV0dXJuIHRoaXMuX2luamVjdG9yLmdldChEeW5hbWljQ29tcG9uZW50TG9hZGVyKVxuICAgICAgICAubG9hZEFzUm9vdChyb290Q29tcG9uZW50VHlwZSwgYCMke3Jvb3RFbElkfWAsIHRoaXMuX2luamVjdG9yKVxuICAgICAgICAudGhlbigoY29tcG9uZW50UmVmKSA9PiB7IHJldHVybiBuZXcgQ29tcG9uZW50Rml4dHVyZV8oY29tcG9uZW50UmVmKTsgfSk7XG4gIH1cbn1cbiJdfQ==