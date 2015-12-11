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
var view_ref_1 = require('angular2/src/core/linker/view_ref');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21wb25lbnRfYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXIudHMiXSwibmFtZXMiOlsiQ29tcG9uZW50Rml4dHVyZSIsIkNvbXBvbmVudEZpeHR1cmUuY29uc3RydWN0b3IiLCJDb21wb25lbnRGaXh0dXJlXyIsIkNvbXBvbmVudEZpeHR1cmVfLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50Rml4dHVyZV8uZGV0ZWN0Q2hhbmdlcyIsIkNvbXBvbmVudEZpeHR1cmVfLmRlc3Ryb3kiLCJUZXN0Q29tcG9uZW50QnVpbGRlciIsIlRlc3RDb21wb25lbnRCdWlsZGVyLmNvbnN0cnVjdG9yIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIuX2Nsb25lIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVUZW1wbGF0ZSIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlVmlldyIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlRGlyZWN0aXZlIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVQcm92aWRlcnMiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZUJpbmRpbmdzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVWaWV3UHJvdmlkZXJzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVWaWV3QmluZGluZ3MiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5jcmVhdGVBc3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFXTyxlQUFlLENBQUMsQ0FBQTtBQUV2QixxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUVsRSwyQkFBc0MsZ0NBQWdDLENBQUMsQ0FBQTtBQUd2RSx5QkFBMkIsbUNBQW1DLENBQUMsQ0FBQTtBQUUvRCxzQkFBaUIsU0FBUyxDQUFDLENBQUE7QUFFM0IsMkJBQXVCLHNDQUFzQyxD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SUEsQ0FBQ0EsVUFBQ0EsWUFBWUEsSUFBT0EsTUFBTUEsQ0FBQ0EsSUFBSUEsaUJBQWlCQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMvRUEsQ0FBQ0E7SUF0S0hWO1FBQUNBLGlCQUFVQSxFQUFFQTs7NkJBdUtaQTtJQUFEQSwyQkFBQ0E7QUFBREEsQ0FBQ0EsQUF2S0QsSUF1S0M7QUF0S1ksNEJBQW9CLHVCQXNLaEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudFJlZixcbiAgRGVidWdFbGVtZW50LFxuICBEaXJlY3RpdmVSZXNvbHZlcixcbiAgRHluYW1pY0NvbXBvbmVudExvYWRlcixcbiAgSW5qZWN0b3IsXG4gIEluamVjdGFibGUsXG4gIFZpZXdNZXRhZGF0YSxcbiAgVmlld1JlZixcbiAgVmlld1Jlc29sdmVyLFxuICBwcm92aWRlXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UHJvbWlzZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge0FwcFZpZXd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3JztcbmltcG9ydCB7aW50ZXJuYWxWaWV3fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYnO1xuXG5pbXBvcnQge2VsfSBmcm9tICcuL3V0aWxzJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fdG9rZW5zJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcblxuaW1wb3J0IHtEZWJ1Z0VsZW1lbnRffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kZWJ1Zy9kZWJ1Z19lbGVtZW50JztcblxuXG4vKipcbiAqIEZpeHR1cmUgZm9yIGRlYnVnZ2luZyBhbmQgdGVzdGluZyBhIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBvbmVudEZpeHR1cmUge1xuICAvKipcbiAgICogVGhlIERlYnVnRWxlbWVudCBhc3NvY2lhdGVkIHdpdGggdGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGNvbXBvbmVudC5cbiAgICovXG4gIGRlYnVnRWxlbWVudDogRGVidWdFbGVtZW50O1xuXG4gIC8qKlxuICAgKiBUaGUgaW5zdGFuY2Ugb2YgdGhlIHJvb3QgY29tcG9uZW50IGNsYXNzLlxuICAgKi9cbiAgY29tcG9uZW50SW5zdGFuY2U6IGFueTtcblxuICAvKipcbiAgICogVGhlIG5hdGl2ZSBlbGVtZW50IGF0IHRoZSByb290IG9mIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBuYXRpdmVFbGVtZW50OiBhbnk7XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlIGZvciB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGNvbXBvbmVudCBkZXN0cnVjdGlvbi5cbiAgICovXG4gIGFic3RyYWN0IGRlc3Ryb3koKTogdm9pZDtcbn1cblxuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50Rml4dHVyZV8gZXh0ZW5kcyBDb21wb25lbnRGaXh0dXJlIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbXBvbmVudFBhcmVudFZpZXc6IEFwcFZpZXc7XG5cbiAgY29uc3RydWN0b3IoY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWYpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZGVidWdFbGVtZW50ID0gbmV3IERlYnVnRWxlbWVudF8oaW50ZXJuYWxWaWV3KDxWaWV3UmVmPmNvbXBvbmVudFJlZi5ob3N0VmlldyksIDApO1xuICAgIHRoaXMuY29tcG9uZW50SW5zdGFuY2UgPSB0aGlzLmRlYnVnRWxlbWVudC5jb21wb25lbnRJbnN0YW5jZTtcbiAgICB0aGlzLm5hdGl2ZUVsZW1lbnQgPSB0aGlzLmRlYnVnRWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICAgIHRoaXMuX2NvbXBvbmVudFBhcmVudFZpZXcgPSBpbnRlcm5hbFZpZXcoPFZpZXdSZWY+Y29tcG9uZW50UmVmLmhvc3RWaWV3KTtcbiAgICB0aGlzLl9jb21wb25lbnRSZWYgPSBjb21wb25lbnRSZWY7XG4gIH1cblxuICBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbXBvbmVudFBhcmVudFZpZXcuY2hhbmdlRGV0ZWN0b3IuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIHRoaXMuX2NvbXBvbmVudFBhcmVudFZpZXcuY2hhbmdlRGV0ZWN0b3IuY2hlY2tOb0NoYW5nZXMoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX2NvbXBvbmVudFJlZi5kaXNwb3NlKCk7IH1cbn1cblxudmFyIF9uZXh0Um9vdEVsZW1lbnRJZCA9IDA7XG5cbi8qKlxuICogQnVpbGRzIGEgQ29tcG9uZW50Rml4dHVyZSBmb3IgdXNlIGluIGNvbXBvbmVudCBsZXZlbCB0ZXN0cy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYmluZGluZ3NPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIGFueVtdPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9kaXJlY3RpdmVPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIE1hcDxUeXBlLCBUeXBlPj4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdGVtcGxhdGVPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIHN0cmluZz4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlld0JpbmRpbmdzT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBhbnlbXT4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlld092ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgVmlld01ldGFkYXRhPigpO1xuXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Nsb25lKCk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSBuZXcgVGVzdENvbXBvbmVudEJ1aWxkZXIodGhpcy5faW5qZWN0b3IpO1xuICAgIGNsb25lLl92aWV3T3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl92aWV3T3ZlcnJpZGVzKTtcbiAgICBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl9kaXJlY3RpdmVPdmVycmlkZXMpO1xuICAgIGNsb25lLl90ZW1wbGF0ZU92ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fdGVtcGxhdGVPdmVycmlkZXMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgb25seSB0aGUgaHRtbCBvZiBhIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0uXG4gICAqIEFsbCB0aGUgb3RoZXIgcHJvcGVydGllcyBvZiB0aGUgY29tcG9uZW50J3Mge0BsaW5rIFZpZXdNZXRhZGF0YX0gYXJlIHByZXNlcnZlZC5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGh0bWxcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVRlbXBsYXRlKGNvbXBvbmVudFR5cGU6IFR5cGUsIHRlbXBsYXRlOiBzdHJpbmcpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fdGVtcGxhdGVPdmVycmlkZXMuc2V0KGNvbXBvbmVudFR5cGUsIHRlbXBsYXRlKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIGEgY29tcG9uZW50J3Mge0BsaW5rIFZpZXdNZXRhZGF0YX0uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7dmlld30gVmlld1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlVmlldyhjb21wb25lbnRUeXBlOiBUeXBlLCB2aWV3OiBWaWV3TWV0YWRhdGEpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fdmlld092ZXJyaWRlcy5zZXQoY29tcG9uZW50VHlwZSwgdmlldyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyB0aGUgZGlyZWN0aXZlcyBmcm9tIHRoZSBjb21wb25lbnQge0BsaW5rIFZpZXdNZXRhZGF0YX0uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7VHlwZX0gZnJvbVxuICAgKiBAcGFyYW0ge1R5cGV9IHRvXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVEaXJlY3RpdmUoY29tcG9uZW50VHlwZTogVHlwZSwgZnJvbTogVHlwZSwgdG86IFR5cGUpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICB2YXIgb3ZlcnJpZGVzRm9yQ29tcG9uZW50ID0gY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcy5nZXQoY29tcG9uZW50VHlwZSk7XG4gICAgaWYgKCFpc1ByZXNlbnQob3ZlcnJpZGVzRm9yQ29tcG9uZW50KSkge1xuICAgICAgY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcy5zZXQoY29tcG9uZW50VHlwZSwgbmV3IE1hcDxUeXBlLCBUeXBlPigpKTtcbiAgICAgIG92ZXJyaWRlc0ZvckNvbXBvbmVudCA9IGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMuZ2V0KGNvbXBvbmVudFR5cGUpO1xuICAgIH1cbiAgICBvdmVycmlkZXNGb3JDb21wb25lbnQuc2V0KGZyb20sIHRvKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIG9uZSBvciBtb3JlIGluamVjdGFibGVzIGNvbmZpZ3VyZWQgdmlhIGBwcm92aWRlcnNgIG1ldGFkYXRhIHByb3BlcnR5IG9mIGEgZGlyZWN0aXZlXG4gICAqIG9yXG4gICAqIGNvbXBvbmVudC5cbiAgICogVmVyeSB1c2VmdWwgd2hlbiBjZXJ0YWluIHByb3ZpZGVycyBuZWVkIHRvIGJlIG1vY2tlZCBvdXQuXG4gICAqXG4gICAqIFRoZSBwcm92aWRlcnMgc3BlY2lmaWVkIHZpYSB0aGlzIG1ldGhvZCBhcmUgYXBwZW5kZWQgdG8gdGhlIGV4aXN0aW5nIGBwcm92aWRlcnNgIGNhdXNpbmcgdGhlXG4gICAqIGR1cGxpY2F0ZWQgcHJvdmlkZXJzIHRvXG4gICAqIGJlIG92ZXJyaWRkZW4uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7YW55W119IHByb3ZpZGVyc1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlUHJvdmlkZXJzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fYmluZGluZ3NPdmVycmlkZXMuc2V0KHR5cGUsIHByb3ZpZGVycyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBvdmVycmlkZUJpbmRpbmdzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgcmV0dXJuIHRoaXMub3ZlcnJpZGVQcm92aWRlcnModHlwZSwgcHJvdmlkZXJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgb25lIG9yIG1vcmUgaW5qZWN0YWJsZXMgY29uZmlndXJlZCB2aWEgYHByb3ZpZGVyc2AgbWV0YWRhdGEgcHJvcGVydHkgb2YgYSBkaXJlY3RpdmVcbiAgICogb3JcbiAgICogY29tcG9uZW50LlxuICAgKiBWZXJ5IHVzZWZ1bCB3aGVuIGNlcnRhaW4gcHJvdmlkZXJzIG5lZWQgdG8gYmUgbW9ja2VkIG91dC5cbiAgICpcbiAgICogVGhlIHByb3ZpZGVycyBzcGVjaWZpZWQgdmlhIHRoaXMgbWV0aG9kIGFyZSBhcHBlbmRlZCB0byB0aGUgZXhpc3RpbmcgYHByb3ZpZGVyc2AgY2F1c2luZyB0aGVcbiAgICogZHVwbGljYXRlZCBwcm92aWRlcnMgdG9cbiAgICogYmUgb3ZlcnJpZGRlbi5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHthbnlbXX0gcHJvdmlkZXJzXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVWaWV3UHJvdmlkZXJzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fdmlld0JpbmRpbmdzT3ZlcnJpZGVzLnNldCh0eXBlLCBwcm92aWRlcnMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgb3ZlcnJpZGVWaWV3QmluZGluZ3ModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5vdmVycmlkZVZpZXdQcm92aWRlcnModHlwZSwgcHJvdmlkZXJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIHJldHVybnMgYSBDb21wb25lbnRGaXh0dXJlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPENvbXBvbmVudEZpeHR1cmU+fVxuICAgKi9cbiAgY3JlYXRlQXN5bmMocm9vdENvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPENvbXBvbmVudEZpeHR1cmU+IHtcbiAgICB2YXIgbW9ja0RpcmVjdGl2ZVJlc29sdmVyID0gdGhpcy5faW5qZWN0b3IuZ2V0KERpcmVjdGl2ZVJlc29sdmVyKTtcbiAgICB2YXIgbW9ja1ZpZXdSZXNvbHZlciA9IHRoaXMuX2luamVjdG9yLmdldChWaWV3UmVzb2x2ZXIpO1xuICAgIHRoaXMuX3ZpZXdPdmVycmlkZXMuZm9yRWFjaCgodmlldywgdHlwZSkgPT4gbW9ja1ZpZXdSZXNvbHZlci5zZXRWaWV3KHR5cGUsIHZpZXcpKTtcbiAgICB0aGlzLl90ZW1wbGF0ZU92ZXJyaWRlcy5mb3JFYWNoKCh0ZW1wbGF0ZSwgdHlwZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2NrVmlld1Jlc29sdmVyLnNldElubGluZVRlbXBsYXRlKHR5cGUsIHRlbXBsYXRlKSk7XG4gICAgdGhpcy5fZGlyZWN0aXZlT3ZlcnJpZGVzLmZvckVhY2goKG92ZXJyaWRlcywgY29tcG9uZW50KSA9PiB7XG4gICAgICBvdmVycmlkZXMuZm9yRWFjaChcbiAgICAgICAgICAodG8sIGZyb20pID0+IHsgbW9ja1ZpZXdSZXNvbHZlci5vdmVycmlkZVZpZXdEaXJlY3RpdmUoY29tcG9uZW50LCBmcm9tLCB0byk7IH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fYmluZGluZ3NPdmVycmlkZXMuZm9yRWFjaCgoYmluZGluZ3MsIHR5cGUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldEJpbmRpbmdzT3ZlcnJpZGUodHlwZSwgYmluZGluZ3MpKTtcbiAgICB0aGlzLl92aWV3QmluZGluZ3NPdmVycmlkZXMuZm9yRWFjaChcbiAgICAgICAgKGJpbmRpbmdzLCB0eXBlKSA9PiBtb2NrRGlyZWN0aXZlUmVzb2x2ZXIuc2V0Vmlld0JpbmRpbmdzT3ZlcnJpZGUodHlwZSwgYmluZGluZ3MpKTtcblxuICAgIHZhciByb290RWxJZCA9IGByb290JHtfbmV4dFJvb3RFbGVtZW50SWQrK31gO1xuICAgIHZhciByb290RWwgPSBlbChgPGRpdiBpZD1cIiR7cm9vdEVsSWR9XCI+PC9kaXY+YCk7XG4gICAgdmFyIGRvYyA9IHRoaXMuX2luamVjdG9yLmdldChET0NVTUVOVCk7XG5cbiAgICAvLyBUT0RPKGp1bGllbXIpOiBjYW4vc2hvdWxkIHRoaXMgYmUgb3B0aW9uYWw/XG4gICAgdmFyIG9sZFJvb3RzID0gRE9NLnF1ZXJ5U2VsZWN0b3JBbGwoZG9jLCAnW2lkXj1yb290XScpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2xkUm9vdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIERPTS5yZW1vdmUob2xkUm9vdHNbaV0pO1xuICAgIH1cbiAgICBET00uYXBwZW5kQ2hpbGQoZG9jLmJvZHksIHJvb3RFbCk7XG5cblxuICAgIHJldHVybiB0aGlzLl9pbmplY3Rvci5nZXQoRHluYW1pY0NvbXBvbmVudExvYWRlcilcbiAgICAgICAgLmxvYWRBc1Jvb3Qocm9vdENvbXBvbmVudFR5cGUsIGAjJHtyb290RWxJZH1gLCB0aGlzLl9pbmplY3RvcilcbiAgICAgICAgLnRoZW4oKGNvbXBvbmVudFJlZikgPT4geyByZXR1cm4gbmV3IENvbXBvbmVudEZpeHR1cmVfKGNvbXBvbmVudFJlZik7IH0pO1xuICB9XG59XG4iXX0=