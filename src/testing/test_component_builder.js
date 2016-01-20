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
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var compiler_1 = require('angular2/src/core/linker/compiler');
var view_listener_1 = require('angular2/src/core/linker/view_listener');
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
var TestViewFactoryProxy = (function () {
    function TestViewFactoryProxy() {
        this._componentFactoryOverrides = new Map();
    }
    TestViewFactoryProxy.prototype.getComponentViewFactory = function (component, originalViewFactory) {
        var override = this._componentFactoryOverrides.get(component);
        return lang_1.isPresent(override) ? override : originalViewFactory;
    };
    TestViewFactoryProxy.prototype.setComponentViewFactory = function (component, viewFactory) {
        this._componentFactoryOverrides.set(component, viewFactory);
    };
    TestViewFactoryProxy = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], TestViewFactoryProxy);
    return TestViewFactoryProxy;
})();
exports.TestViewFactoryProxy = TestViewFactoryProxy;
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
        /** @internal */
        this._componentOverrides = new Map();
    }
    /** @internal */
    TestComponentBuilder.prototype._clone = function () {
        var clone = new TestComponentBuilder(this._injector);
        clone._viewOverrides = collection_1.MapWrapper.clone(this._viewOverrides);
        clone._directiveOverrides = collection_1.MapWrapper.clone(this._directiveOverrides);
        clone._templateOverrides = collection_1.MapWrapper.clone(this._templateOverrides);
        clone._componentOverrides = collection_1.MapWrapper.clone(this._componentOverrides);
        return clone;
    };
    /**
     * Overrides a component with another component.
     * This also works with precompiled templates if they were generated
     * in development mode.
     *
     * @param {Type} original component
     * @param {Type} mock component
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideComponent = function (componentType, mockType) {
        var clone = this._clone();
        clone._componentOverrides.set(componentType, mockType);
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
        var _this = this;
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
        var originalCompTypes = [];
        var mockHostViewFactoryPromises = [];
        var compiler = this._injector.get(compiler_1.Compiler);
        var viewFactoryProxy = this._injector.get(TestViewFactoryProxy);
        this._componentOverrides.forEach(function (mockCompType, originalCompType) {
            originalCompTypes.push(originalCompType);
            mockHostViewFactoryPromises.push(compiler.compileInHost(mockCompType));
        });
        return async_1.PromiseWrapper.all(mockHostViewFactoryPromises)
            .then(function (mockHostViewFactories) {
            for (var i = 0; i < mockHostViewFactories.length; i++) {
                var originalCompType = originalCompTypes[i];
                viewFactoryProxy.setComponentViewFactory(originalCompType, mockHostViewFactories[i].internalHostViewFactory.componentViewFactory);
            }
            return _this._injector.get(core_1.DynamicComponentLoader)
                .loadAsRoot(rootComponentType, "#" + rootElId, _this._injector)
                .then(function (componentRef) { return new ComponentFixture_(componentRef); });
        });
    };
    TestComponentBuilder = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [core_1.Injector])
    ], TestComponentBuilder);
    return TestComponentBuilder;
})();
exports.TestComponentBuilder = TestComponentBuilder;
exports.TEST_COMPONENT_BUILDER_PROVIDERS = lang_1.CONST_EXPR([
    TestViewFactoryProxy,
    lang_1.CONST_EXPR(new core_1.Provider(view_listener_1.ViewFactoryProxy, { useExisting: TestViewFactoryProxy })),
    TestComponentBuilder
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21wb25lbnRfYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXIudHMiXSwibmFtZXMiOlsiQ29tcG9uZW50Rml4dHVyZSIsIkNvbXBvbmVudEZpeHR1cmUuY29uc3RydWN0b3IiLCJDb21wb25lbnRGaXh0dXJlXyIsIkNvbXBvbmVudEZpeHR1cmVfLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50Rml4dHVyZV8uZGV0ZWN0Q2hhbmdlcyIsIkNvbXBvbmVudEZpeHR1cmVfLmRlc3Ryb3kiLCJUZXN0Vmlld0ZhY3RvcnlQcm94eSIsIlRlc3RWaWV3RmFjdG9yeVByb3h5LmNvbnN0cnVjdG9yIiwiVGVzdFZpZXdGYWN0b3J5UHJveHkuZ2V0Q29tcG9uZW50Vmlld0ZhY3RvcnkiLCJUZXN0Vmlld0ZhY3RvcnlQcm94eS5zZXRDb21wb25lbnRWaWV3RmFjdG9yeSIsIlRlc3RDb21wb25lbnRCdWlsZGVyIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIuY29uc3RydWN0b3IiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5fY2xvbmUiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZUNvbXBvbmVudCIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlVGVtcGxhdGUiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZVZpZXciLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZURpcmVjdGl2ZSIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlUHJvdmlkZXJzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVCaW5kaW5ncyIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlVmlld1Byb3ZpZGVycyIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlVmlld0JpbmRpbmdzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIuY3JlYXRlQXN5bmMi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QkEsRUFDaEJBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO1lBQzdFQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSw2QkFBc0JBLENBQUNBO2lCQUM1Q0EsVUFBVUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxNQUFJQSxRQUFVQSxFQUFFQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtpQkFDN0RBLElBQUlBLENBQUNBLFVBQUNBLFlBQVlBLElBQU9BLE1BQU1BLENBQUNBLElBQUlBLGlCQUFpQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0VBLENBQUNBLENBQUNBLENBQUNBO0lBQ1RBLENBQUNBO0lBdk1IWDtRQUFDQSxpQkFBVUEsRUFBRUE7OzZCQXdNWkE7SUFBREEsMkJBQUNBO0FBQURBLENBQUNBLEFBeE1ELElBd01DO0FBdk1ZLDRCQUFvQix1QkF1TWhDLENBQUE7QUFFWSx3Q0FBZ0MsR0FBRyxpQkFBVSxDQUFDO0lBQ3pELG9CQUFvQjtJQUNwQixpQkFBVSxDQUFDLElBQUksZUFBUSxDQUFDLGdDQUFnQixFQUFFLEVBQUMsV0FBVyxFQUFFLG9CQUFvQixFQUFDLENBQUMsQ0FBQztJQUMvRSxvQkFBb0I7Q0FDckIsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50UmVmLFxuICBEZWJ1Z0VsZW1lbnQsXG4gIERpcmVjdGl2ZVJlc29sdmVyLFxuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICBJbmplY3RvcixcbiAgSW5qZWN0YWJsZSxcbiAgVmlld01ldGFkYXRhLFxuICBFbWJlZGRlZFZpZXdSZWYsXG4gIFZpZXdSZXNvbHZlcixcbiAgcHJvdmlkZSxcbiAgUHJvdmlkZXJcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7VHlwZSwgaXNQcmVzZW50LCBpc0JsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtDb21waWxlciwgQ29tcGlsZXJffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcGlsZXInO1xuaW1wb3J0IHtWaWV3RmFjdG9yeVByb3h5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19saXN0ZW5lcic7XG5cbmltcG9ydCB7Vmlld1JlZl8sIEhvc3RWaWV3RmFjdG9yeVJlZl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3JlZic7XG5pbXBvcnQge0FwcFZpZXd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3JztcblxuaW1wb3J0IHtlbH0gZnJvbSAnLi91dGlscyc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX3Rva2Vucyc7XG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5cbmltcG9ydCB7RGVidWdFbGVtZW50X30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGVidWcvZGVidWdfZWxlbWVudCc7XG5cbi8qKlxuICogRml4dHVyZSBmb3IgZGVidWdnaW5nIGFuZCB0ZXN0aW5nIGEgY29tcG9uZW50LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50Rml4dHVyZSB7XG4gIC8qKlxuICAgKiBUaGUgRGVidWdFbGVtZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgY29tcG9uZW50LlxuICAgKi9cbiAgZGVidWdFbGVtZW50OiBEZWJ1Z0VsZW1lbnQ7XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgcm9vdCBjb21wb25lbnQgY2xhc3MuXG4gICAqL1xuICBjb21wb25lbnRJbnN0YW5jZTogYW55O1xuXG4gIC8qKlxuICAgKiBUaGUgbmF0aXZlIGVsZW1lbnQgYXQgdGhlIHJvb3Qgb2YgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIG5hdGl2ZUVsZW1lbnQ6IGFueTtcblxuICAvKipcbiAgICogVHJpZ2dlciBhIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUgZm9yIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBhYnN0cmFjdCBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgY29tcG9uZW50IGRlc3RydWN0aW9uLlxuICAgKi9cbiAgYWJzdHJhY3QgZGVzdHJveSgpOiB2b2lkO1xufVxuXG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRGaXh0dXJlXyBleHRlbmRzIENvbXBvbmVudEZpeHR1cmUge1xuICAvKiogQGludGVybmFsICovXG4gIF9jb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29tcG9uZW50UGFyZW50VmlldzogQXBwVmlldztcblxuICBjb25zdHJ1Y3Rvcihjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fY29tcG9uZW50UGFyZW50VmlldyA9ICg8Vmlld1JlZl8+Y29tcG9uZW50UmVmLmhvc3RWaWV3KS5pbnRlcm5hbFZpZXc7XG4gICAgdGhpcy5kZWJ1Z0VsZW1lbnQgPSBuZXcgRGVidWdFbGVtZW50Xyh0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3LmFwcEVsZW1lbnRzWzBdKTtcbiAgICB0aGlzLmNvbXBvbmVudEluc3RhbmNlID0gdGhpcy5kZWJ1Z0VsZW1lbnQuY29tcG9uZW50SW5zdGFuY2U7XG4gICAgdGhpcy5uYXRpdmVFbGVtZW50ID0gdGhpcy5kZWJ1Z0VsZW1lbnQubmF0aXZlRWxlbWVudDtcbiAgICB0aGlzLl9jb21wb25lbnRSZWYgPSBjb21wb25lbnRSZWY7XG4gIH1cblxuICBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbXBvbmVudFBhcmVudFZpZXcuY2hhbmdlRGV0ZWN0b3IuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIHRoaXMuX2NvbXBvbmVudFBhcmVudFZpZXcuY2hhbmdlRGV0ZWN0b3IuY2hlY2tOb0NoYW5nZXMoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7IHRoaXMuX2NvbXBvbmVudFJlZi5kaXNwb3NlKCk7IH1cbn1cblxudmFyIF9uZXh0Um9vdEVsZW1lbnRJZCA9IDA7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZXN0Vmlld0ZhY3RvcnlQcm94eSBpbXBsZW1lbnRzIFZpZXdGYWN0b3J5UHJveHkge1xuICBwcml2YXRlIF9jb21wb25lbnRGYWN0b3J5T3ZlcnJpZGVzOiBNYXA8VHlwZSwgRnVuY3Rpb24+ID0gbmV3IE1hcDxUeXBlLCBGdW5jdGlvbj4oKTtcblxuICBnZXRDb21wb25lbnRWaWV3RmFjdG9yeShjb21wb25lbnQ6IFR5cGUsIG9yaWdpbmFsVmlld0ZhY3Rvcnk6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHZhciBvdmVycmlkZSA9IHRoaXMuX2NvbXBvbmVudEZhY3RvcnlPdmVycmlkZXMuZ2V0KGNvbXBvbmVudCk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChvdmVycmlkZSkgPyBvdmVycmlkZSA6IG9yaWdpbmFsVmlld0ZhY3Rvcnk7XG4gIH1cblxuICBzZXRDb21wb25lbnRWaWV3RmFjdG9yeShjb21wb25lbnQ6IFR5cGUsIHZpZXdGYWN0b3J5OiBGdW5jdGlvbikge1xuICAgIHRoaXMuX2NvbXBvbmVudEZhY3RvcnlPdmVycmlkZXMuc2V0KGNvbXBvbmVudCwgdmlld0ZhY3RvcnkpO1xuICB9XG59XG5cbi8qKlxuICogQnVpbGRzIGEgQ29tcG9uZW50Rml4dHVyZSBmb3IgdXNlIGluIGNvbXBvbmVudCBsZXZlbCB0ZXN0cy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYmluZGluZ3NPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIGFueVtdPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9kaXJlY3RpdmVPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIE1hcDxUeXBlLCBUeXBlPj4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdGVtcGxhdGVPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIHN0cmluZz4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlld0JpbmRpbmdzT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBhbnlbXT4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlld092ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgVmlld01ldGFkYXRhPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9jb21wb25lbnRPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIFR5cGU+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Nsb25lKCk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSBuZXcgVGVzdENvbXBvbmVudEJ1aWxkZXIodGhpcy5faW5qZWN0b3IpO1xuICAgIGNsb25lLl92aWV3T3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl92aWV3T3ZlcnJpZGVzKTtcbiAgICBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl9kaXJlY3RpdmVPdmVycmlkZXMpO1xuICAgIGNsb25lLl90ZW1wbGF0ZU92ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fdGVtcGxhdGVPdmVycmlkZXMpO1xuICAgIGNsb25lLl9jb21wb25lbnRPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX2NvbXBvbmVudE92ZXJyaWRlcyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBhIGNvbXBvbmVudCB3aXRoIGFub3RoZXIgY29tcG9uZW50LlxuICAgKiBUaGlzIGFsc28gd29ya3Mgd2l0aCBwcmVjb21waWxlZCB0ZW1wbGF0ZXMgaWYgdGhleSB3ZXJlIGdlbmVyYXRlZFxuICAgKiBpbiBkZXZlbG9wbWVudCBtb2RlLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IG9yaWdpbmFsIGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge1R5cGV9IG1vY2sgY29tcG9uZW50XG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVDb21wb25lbnQoY29tcG9uZW50VHlwZTogVHlwZSwgbW9ja1R5cGU6IFR5cGUpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gdGhpcy5fY2xvbmUoKTtcbiAgICBjbG9uZS5fY29tcG9uZW50T3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCBtb2NrVHlwZSk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmx5IHRoZSBodG1sIG9mIGEge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfS5cbiAgICogQWxsIHRoZSBvdGhlciBwcm9wZXJ0aWVzIG9mIHRoZSBjb21wb25lbnQncyB7QGxpbmsgVmlld01ldGFkYXRhfSBhcmUgcHJlc2VydmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlVGVtcGxhdGUoY29tcG9uZW50VHlwZTogVHlwZSwgdGVtcGxhdGU6IHN0cmluZyk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl90ZW1wbGF0ZU92ZXJyaWRlcy5zZXQoY29tcG9uZW50VHlwZSwgdGVtcGxhdGUpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgYSBjb21wb25lbnQncyB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHt2aWV3fSBWaWV3XG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVWaWV3KGNvbXBvbmVudFR5cGU6IFR5cGUsIHZpZXc6IFZpZXdNZXRhZGF0YSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl92aWV3T3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCB2aWV3KTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIHRoZSBkaXJlY3RpdmVzIGZyb20gdGhlIGNvbXBvbmVudCB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHtUeXBlfSBmcm9tXG4gICAqIEBwYXJhbSB7VHlwZX0gdG9cbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZURpcmVjdGl2ZShjb21wb25lbnRUeXBlOiBUeXBlLCBmcm9tOiBUeXBlLCB0bzogVHlwZSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIHZhciBvdmVycmlkZXNGb3JDb21wb25lbnQgPSBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLmdldChjb21wb25lbnRUeXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChvdmVycmlkZXNGb3JDb21wb25lbnQpKSB7XG4gICAgICBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCBuZXcgTWFwPFR5cGUsIFR5cGU+KCkpO1xuICAgICAgb3ZlcnJpZGVzRm9yQ29tcG9uZW50ID0gY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcy5nZXQoY29tcG9uZW50VHlwZSk7XG4gICAgfVxuICAgIG92ZXJyaWRlc0ZvckNvbXBvbmVudC5zZXQoZnJvbSwgdG8pO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgb25lIG9yIG1vcmUgaW5qZWN0YWJsZXMgY29uZmlndXJlZCB2aWEgYHByb3ZpZGVyc2AgbWV0YWRhdGEgcHJvcGVydHkgb2YgYSBkaXJlY3RpdmVcbiAgICogb3JcbiAgICogY29tcG9uZW50LlxuICAgKiBWZXJ5IHVzZWZ1bCB3aGVuIGNlcnRhaW4gcHJvdmlkZXJzIG5lZWQgdG8gYmUgbW9ja2VkIG91dC5cbiAgICpcbiAgICogVGhlIHByb3ZpZGVycyBzcGVjaWZpZWQgdmlhIHRoaXMgbWV0aG9kIGFyZSBhcHBlbmRlZCB0byB0aGUgZXhpc3RpbmcgYHByb3ZpZGVyc2AgY2F1c2luZyB0aGVcbiAgICogZHVwbGljYXRlZCBwcm92aWRlcnMgdG9cbiAgICogYmUgb3ZlcnJpZGRlbi5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHthbnlbXX0gcHJvdmlkZXJzXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVQcm92aWRlcnModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl9iaW5kaW5nc092ZXJyaWRlcy5zZXQodHlwZSwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIG92ZXJyaWRlQmluZGluZ3ModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5vdmVycmlkZVByb3ZpZGVycyh0eXBlLCBwcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmUgb3IgbW9yZSBpbmplY3RhYmxlcyBjb25maWd1cmVkIHZpYSBgcHJvdmlkZXJzYCBtZXRhZGF0YSBwcm9wZXJ0eSBvZiBhIGRpcmVjdGl2ZVxuICAgKiBvclxuICAgKiBjb21wb25lbnQuXG4gICAqIFZlcnkgdXNlZnVsIHdoZW4gY2VydGFpbiBwcm92aWRlcnMgbmVlZCB0byBiZSBtb2NrZWQgb3V0LlxuICAgKlxuICAgKiBUaGUgcHJvdmlkZXJzIHNwZWNpZmllZCB2aWEgdGhpcyBtZXRob2QgYXJlIGFwcGVuZGVkIHRvIHRoZSBleGlzdGluZyBgcHJvdmlkZXJzYCBjYXVzaW5nIHRoZVxuICAgKiBkdXBsaWNhdGVkIHByb3ZpZGVycyB0b1xuICAgKiBiZSBvdmVycmlkZGVuLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge2FueVtdfSBwcm92aWRlcnNcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVZpZXdQcm92aWRlcnModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl92aWV3QmluZGluZ3NPdmVycmlkZXMuc2V0KHR5cGUsIHByb3ZpZGVycyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBvdmVycmlkZVZpZXdCaW5kaW5ncyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHJldHVybiB0aGlzLm92ZXJyaWRlVmlld1Byb3ZpZGVycyh0eXBlLCBwcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbmQgcmV0dXJucyBhIENvbXBvbmVudEZpeHR1cmUuXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb21pc2U8Q29tcG9uZW50Rml4dHVyZT59XG4gICAqL1xuICBjcmVhdGVBc3luYyhyb290Q29tcG9uZW50VHlwZTogVHlwZSk6IFByb21pc2U8Q29tcG9uZW50Rml4dHVyZT4ge1xuICAgIHZhciBtb2NrRGlyZWN0aXZlUmVzb2x2ZXIgPSB0aGlzLl9pbmplY3Rvci5nZXQoRGlyZWN0aXZlUmVzb2x2ZXIpO1xuICAgIHZhciBtb2NrVmlld1Jlc29sdmVyID0gdGhpcy5faW5qZWN0b3IuZ2V0KFZpZXdSZXNvbHZlcik7XG4gICAgdGhpcy5fdmlld092ZXJyaWRlcy5mb3JFYWNoKCh2aWV3LCB0eXBlKSA9PiBtb2NrVmlld1Jlc29sdmVyLnNldFZpZXcodHlwZSwgdmlldykpO1xuICAgIHRoaXMuX3RlbXBsYXRlT3ZlcnJpZGVzLmZvckVhY2goKHRlbXBsYXRlLCB0eXBlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vY2tWaWV3UmVzb2x2ZXIuc2V0SW5saW5lVGVtcGxhdGUodHlwZSwgdGVtcGxhdGUpKTtcbiAgICB0aGlzLl9kaXJlY3RpdmVPdmVycmlkZXMuZm9yRWFjaCgob3ZlcnJpZGVzLCBjb21wb25lbnQpID0+IHtcbiAgICAgIG92ZXJyaWRlcy5mb3JFYWNoKFxuICAgICAgICAgICh0bywgZnJvbSkgPT4geyBtb2NrVmlld1Jlc29sdmVyLm92ZXJyaWRlVmlld0RpcmVjdGl2ZShjb21wb25lbnQsIGZyb20sIHRvKTsgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9iaW5kaW5nc092ZXJyaWRlcy5mb3JFYWNoKChiaW5kaW5ncywgdHlwZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2NrRGlyZWN0aXZlUmVzb2x2ZXIuc2V0QmluZGluZ3NPdmVycmlkZSh0eXBlLCBiaW5kaW5ncykpO1xuICAgIHRoaXMuX3ZpZXdCaW5kaW5nc092ZXJyaWRlcy5mb3JFYWNoKFxuICAgICAgICAoYmluZGluZ3MsIHR5cGUpID0+IG1vY2tEaXJlY3RpdmVSZXNvbHZlci5zZXRWaWV3QmluZGluZ3NPdmVycmlkZSh0eXBlLCBiaW5kaW5ncykpO1xuXG4gICAgdmFyIHJvb3RFbElkID0gYHJvb3Qke19uZXh0Um9vdEVsZW1lbnRJZCsrfWA7XG4gICAgdmFyIHJvb3RFbCA9IGVsKGA8ZGl2IGlkPVwiJHtyb290RWxJZH1cIj48L2Rpdj5gKTtcbiAgICB2YXIgZG9jID0gdGhpcy5faW5qZWN0b3IuZ2V0KERPQ1VNRU5UKTtcblxuICAgIC8vIFRPRE8oanVsaWVtcik6IGNhbi9zaG91bGQgdGhpcyBiZSBvcHRpb25hbD9cbiAgICB2YXIgb2xkUm9vdHMgPSBET00ucXVlcnlTZWxlY3RvckFsbChkb2MsICdbaWRePXJvb3RdJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbGRSb290cy5sZW5ndGg7IGkrKykge1xuICAgICAgRE9NLnJlbW92ZShvbGRSb290c1tpXSk7XG4gICAgfVxuICAgIERPTS5hcHBlbmRDaGlsZChkb2MuYm9keSwgcm9vdEVsKTtcbiAgICB2YXIgb3JpZ2luYWxDb21wVHlwZXMgPSBbXTtcbiAgICB2YXIgbW9ja0hvc3RWaWV3RmFjdG9yeVByb21pc2VzID0gW107XG4gICAgdmFyIGNvbXBpbGVyOiBDb21waWxlcl8gPSB0aGlzLl9pbmplY3Rvci5nZXQoQ29tcGlsZXIpO1xuICAgIHZhciB2aWV3RmFjdG9yeVByb3h5OiBUZXN0Vmlld0ZhY3RvcnlQcm94eSA9IHRoaXMuX2luamVjdG9yLmdldChUZXN0Vmlld0ZhY3RvcnlQcm94eSk7XG4gICAgdGhpcy5fY29tcG9uZW50T3ZlcnJpZGVzLmZvckVhY2goKG1vY2tDb21wVHlwZSwgb3JpZ2luYWxDb21wVHlwZSkgPT4ge1xuICAgICAgb3JpZ2luYWxDb21wVHlwZXMucHVzaChvcmlnaW5hbENvbXBUeXBlKTtcbiAgICAgIG1vY2tIb3N0Vmlld0ZhY3RvcnlQcm9taXNlcy5wdXNoKGNvbXBpbGVyLmNvbXBpbGVJbkhvc3QobW9ja0NvbXBUeXBlKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmFsbChtb2NrSG9zdFZpZXdGYWN0b3J5UHJvbWlzZXMpXG4gICAgICAgIC50aGVuKChtb2NrSG9zdFZpZXdGYWN0b3JpZXM6IEhvc3RWaWV3RmFjdG9yeVJlZl9bXSkgPT4ge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9ja0hvc3RWaWV3RmFjdG9yaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgb3JpZ2luYWxDb21wVHlwZSA9IG9yaWdpbmFsQ29tcFR5cGVzW2ldO1xuICAgICAgICAgICAgdmlld0ZhY3RvcnlQcm94eS5zZXRDb21wb25lbnRWaWV3RmFjdG9yeShcbiAgICAgICAgICAgICAgICBvcmlnaW5hbENvbXBUeXBlLFxuICAgICAgICAgICAgICAgIG1vY2tIb3N0Vmlld0ZhY3Rvcmllc1tpXS5pbnRlcm5hbEhvc3RWaWV3RmFjdG9yeS5jb21wb25lbnRWaWV3RmFjdG9yeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLl9pbmplY3Rvci5nZXQoRHluYW1pY0NvbXBvbmVudExvYWRlcilcbiAgICAgICAgICAgICAgLmxvYWRBc1Jvb3Qocm9vdENvbXBvbmVudFR5cGUsIGAjJHtyb290RWxJZH1gLCB0aGlzLl9pbmplY3RvcilcbiAgICAgICAgICAgICAgLnRoZW4oKGNvbXBvbmVudFJlZikgPT4geyByZXR1cm4gbmV3IENvbXBvbmVudEZpeHR1cmVfKGNvbXBvbmVudFJlZik7IH0pO1xuICAgICAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgVEVTVF9DT01QT05FTlRfQlVJTERFUl9QUk9WSURFUlMgPSBDT05TVF9FWFBSKFtcbiAgVGVzdFZpZXdGYWN0b3J5UHJveHksXG4gIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKFZpZXdGYWN0b3J5UHJveHksIHt1c2VFeGlzdGluZzogVGVzdFZpZXdGYWN0b3J5UHJveHl9KSksXG4gIFRlc3RDb21wb25lbnRCdWlsZGVyXG5dKTtcbiJdfQ==