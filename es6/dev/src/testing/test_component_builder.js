var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DirectiveResolver, DynamicComponentLoader, Injector, Injectable, ViewResolver, Provider } from 'angular2/core';
import { isPresent, CONST_EXPR } from 'angular2/src/facade/lang';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { MapWrapper } from 'angular2/src/facade/collection';
import { Compiler } from 'angular2/src/core/linker/compiler';
import { ViewFactoryProxy } from 'angular2/src/core/linker/view_listener';
import { el } from './utils';
import { DOCUMENT } from 'angular2/src/platform/dom/dom_tokens';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { DebugElement_ } from 'angular2/src/core/debug/debug_element';
/**
 * Fixture for debugging and testing a component.
 */
export class ComponentFixture {
}
export class ComponentFixture_ extends ComponentFixture {
    constructor(componentRef) {
        super();
        this._componentParentView = componentRef.hostView.internalView;
        this.debugElement = new DebugElement_(this._componentParentView.appElements[0]);
        this.componentInstance = this.debugElement.componentInstance;
        this.nativeElement = this.debugElement.nativeElement;
        this._componentRef = componentRef;
    }
    detectChanges() {
        this._componentParentView.changeDetector.detectChanges();
        this._componentParentView.changeDetector.checkNoChanges();
    }
    destroy() { this._componentRef.dispose(); }
}
var _nextRootElementId = 0;
export let TestViewFactoryProxy = class {
    constructor() {
        this._componentFactoryOverrides = new Map();
    }
    getComponentViewFactory(component, originalViewFactory) {
        var override = this._componentFactoryOverrides.get(component);
        return isPresent(override) ? override : originalViewFactory;
    }
    setComponentViewFactory(component, viewFactory) {
        this._componentFactoryOverrides.set(component, viewFactory);
    }
};
TestViewFactoryProxy = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], TestViewFactoryProxy);
/**
 * Builds a ComponentFixture for use in component level tests.
 */
export let TestComponentBuilder = class {
    constructor(_injector) {
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
    _clone() {
        var clone = new TestComponentBuilder(this._injector);
        clone._viewOverrides = MapWrapper.clone(this._viewOverrides);
        clone._directiveOverrides = MapWrapper.clone(this._directiveOverrides);
        clone._templateOverrides = MapWrapper.clone(this._templateOverrides);
        clone._componentOverrides = MapWrapper.clone(this._componentOverrides);
        return clone;
    }
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
    overrideComponent(componentType, mockType) {
        var clone = this._clone();
        clone._componentOverrides.set(componentType, mockType);
        return clone;
    }
    /**
     * Overrides only the html of a {@link ComponentMetadata}.
     * All the other properties of the component's {@link ViewMetadata} are preserved.
     *
     * @param {Type} component
     * @param {string} html
     *
     * @return {TestComponentBuilder}
     */
    overrideTemplate(componentType, template) {
        var clone = this._clone();
        clone._templateOverrides.set(componentType, template);
        return clone;
    }
    /**
     * Overrides a component's {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {view} View
     *
     * @return {TestComponentBuilder}
     */
    overrideView(componentType, view) {
        var clone = this._clone();
        clone._viewOverrides.set(componentType, view);
        return clone;
    }
    /**
     * Overrides the directives from the component {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {Type} from
     * @param {Type} to
     *
     * @return {TestComponentBuilder}
     */
    overrideDirective(componentType, from, to) {
        var clone = this._clone();
        var overridesForComponent = clone._directiveOverrides.get(componentType);
        if (!isPresent(overridesForComponent)) {
            clone._directiveOverrides.set(componentType, new Map());
            overridesForComponent = clone._directiveOverrides.get(componentType);
        }
        overridesForComponent.set(from, to);
        return clone;
    }
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
    overrideProviders(type, providers) {
        var clone = this._clone();
        clone._bindingsOverrides.set(type, providers);
        return clone;
    }
    /**
     * @deprecated
     */
    overrideBindings(type, providers) {
        return this.overrideProviders(type, providers);
    }
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
    overrideViewProviders(type, providers) {
        var clone = this._clone();
        clone._viewBindingsOverrides.set(type, providers);
        return clone;
    }
    /**
     * @deprecated
     */
    overrideViewBindings(type, providers) {
        return this.overrideViewProviders(type, providers);
    }
    /**
     * Builds and returns a ComponentFixture.
     *
     * @return {Promise<ComponentFixture>}
     */
    createAsync(rootComponentType) {
        var mockDirectiveResolver = this._injector.get(DirectiveResolver);
        var mockViewResolver = this._injector.get(ViewResolver);
        this._viewOverrides.forEach((view, type) => mockViewResolver.setView(type, view));
        this._templateOverrides.forEach((template, type) => mockViewResolver.setInlineTemplate(type, template));
        this._directiveOverrides.forEach((overrides, component) => {
            overrides.forEach((to, from) => { mockViewResolver.overrideViewDirective(component, from, to); });
        });
        this._bindingsOverrides.forEach((bindings, type) => mockDirectiveResolver.setBindingsOverride(type, bindings));
        this._viewBindingsOverrides.forEach((bindings, type) => mockDirectiveResolver.setViewBindingsOverride(type, bindings));
        var rootElId = `root${_nextRootElementId++}`;
        var rootEl = el(`<div id="${rootElId}"></div>`);
        var doc = this._injector.get(DOCUMENT);
        // TODO(juliemr): can/should this be optional?
        var oldRoots = DOM.querySelectorAll(doc, '[id^=root]');
        for (var i = 0; i < oldRoots.length; i++) {
            DOM.remove(oldRoots[i]);
        }
        DOM.appendChild(doc.body, rootEl);
        var originalCompTypes = [];
        var mockHostViewFactoryPromises = [];
        var compiler = this._injector.get(Compiler);
        var viewFactoryProxy = this._injector.get(TestViewFactoryProxy);
        this._componentOverrides.forEach((mockCompType, originalCompType) => {
            originalCompTypes.push(originalCompType);
            mockHostViewFactoryPromises.push(compiler.compileInHost(mockCompType));
        });
        return PromiseWrapper.all(mockHostViewFactoryPromises)
            .then((mockHostViewFactories) => {
            for (var i = 0; i < mockHostViewFactories.length; i++) {
                var originalCompType = originalCompTypes[i];
                viewFactoryProxy.setComponentViewFactory(originalCompType, mockHostViewFactories[i].internalHostViewFactory.componentViewFactory);
            }
            return this._injector.get(DynamicComponentLoader)
                .loadAsRoot(rootComponentType, `#${rootElId}`, this._injector)
                .then((componentRef) => { return new ComponentFixture_(componentRef); });
        });
    }
};
TestComponentBuilder = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Injector])
], TestComponentBuilder);
export const TEST_COMPONENT_BUILDER_PROVIDERS = CONST_EXPR([
    TestViewFactoryProxy,
    CONST_EXPR(new Provider(ViewFactoryProxy, { useExisting: TestViewFactoryProxy })),
    TestComponentBuilder
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21wb25lbnRfYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXIudHMiXSwibmFtZXMiOlsiQ29tcG9uZW50Rml4dHVyZSIsIkNvbXBvbmVudEZpeHR1cmVfIiwiQ29tcG9uZW50Rml4dHVyZV8uY29uc3RydWN0b3IiLCJDb21wb25lbnRGaXh0dXJlXy5kZXRlY3RDaGFuZ2VzIiwiQ29tcG9uZW50Rml4dHVyZV8uZGVzdHJveSIsIlRlc3RWaWV3RmFjdG9yeVByb3h5IiwiVGVzdFZpZXdGYWN0b3J5UHJveHkuY29uc3RydWN0b3IiLCJUZXN0Vmlld0ZhY3RvcnlQcm94eS5nZXRDb21wb25lbnRWaWV3RmFjdG9yeSIsIlRlc3RWaWV3RmFjdG9yeVByb3h5LnNldENvbXBvbmVudFZpZXdGYWN0b3J5IiwiVGVzdENvbXBvbmVudEJ1aWxkZXIiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5jb25zdHJ1Y3RvciIsIlRlc3RDb21wb25lbnRCdWlsZGVyLl9jbG9uZSIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlQ29tcG9uZW50IiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVUZW1wbGF0ZSIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlVmlldyIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlRGlyZWN0aXZlIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVQcm92aWRlcnMiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZUJpbmRpbmdzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVWaWV3UHJvdmlkZXJzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVWaWV3QmluZGluZ3MiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5jcmVhdGVBc3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFH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QSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDVEEsQ0FBQ0E7QUFDSFgsQ0FBQ0E7QUF4TUQ7SUFBQyxVQUFVLEVBQUU7O3lCQXdNWjtBQUVELGFBQWEsZ0NBQWdDLEdBQUcsVUFBVSxDQUFDO0lBQ3pELG9CQUFvQjtJQUNwQixVQUFVLENBQUMsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsRUFBQyxXQUFXLEVBQUUsb0JBQW9CLEVBQUMsQ0FBQyxDQUFDO0lBQy9FLG9CQUFvQjtDQUNyQixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnRSZWYsXG4gIERlYnVnRWxlbWVudCxcbiAgRGlyZWN0aXZlUmVzb2x2ZXIsXG4gIER5bmFtaWNDb21wb25lbnRMb2FkZXIsXG4gIEluamVjdG9yLFxuICBJbmplY3RhYmxlLFxuICBWaWV3TWV0YWRhdGEsXG4gIEVtYmVkZGVkVmlld1JlZixcbiAgVmlld1Jlc29sdmVyLFxuICBwcm92aWRlLFxuICBQcm92aWRlclxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtUeXBlLCBpc1ByZXNlbnQsIGlzQmxhbmssIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2UsIFByb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0NvbXBpbGVyLCBDb21waWxlcl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9jb21waWxlcic7XG5pbXBvcnQge1ZpZXdGYWN0b3J5UHJveHl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X2xpc3RlbmVyJztcblxuaW1wb3J0IHtWaWV3UmVmXywgSG9zdFZpZXdGYWN0b3J5UmVmX30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfcmVmJztcbmltcG9ydCB7QXBwVmlld30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXcnO1xuXG5pbXBvcnQge2VsfSBmcm9tICcuL3V0aWxzJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fdG9rZW5zJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcblxuaW1wb3J0IHtEZWJ1Z0VsZW1lbnRffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kZWJ1Zy9kZWJ1Z19lbGVtZW50JztcblxuLyoqXG4gKiBGaXh0dXJlIGZvciBkZWJ1Z2dpbmcgYW5kIHRlc3RpbmcgYSBjb21wb25lbnQuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnRGaXh0dXJlIHtcbiAgLyoqXG4gICAqIFRoZSBEZWJ1Z0VsZW1lbnQgYXNzb2NpYXRlZCB3aXRoIHRoZSByb290IGVsZW1lbnQgb2YgdGhpcyBjb21wb25lbnQuXG4gICAqL1xuICBkZWJ1Z0VsZW1lbnQ6IERlYnVnRWxlbWVudDtcblxuICAvKipcbiAgICogVGhlIGluc3RhbmNlIG9mIHRoZSByb290IGNvbXBvbmVudCBjbGFzcy5cbiAgICovXG4gIGNvbXBvbmVudEluc3RhbmNlOiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSBuYXRpdmUgZWxlbWVudCBhdCB0aGUgcm9vdCBvZiB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgbmF0aXZlRWxlbWVudDogYW55O1xuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSBmb3IgdGhlIGNvbXBvbmVudC5cbiAgICovXG4gIGFic3RyYWN0IGRldGVjdENoYW5nZXMoKTogdm9pZDtcblxuICAvKipcbiAgICogVHJpZ2dlciBjb21wb25lbnQgZGVzdHJ1Y3Rpb24uXG4gICAqL1xuICBhYnN0cmFjdCBkZXN0cm95KCk6IHZvaWQ7XG59XG5cblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEZpeHR1cmVfIGV4dGVuZHMgQ29tcG9uZW50Rml4dHVyZSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmO1xuICAvKiogQGludGVybmFsICovXG4gIF9jb21wb25lbnRQYXJlbnRWaWV3OiBBcHBWaWV3O1xuXG4gIGNvbnN0cnVjdG9yKGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3ID0gKDxWaWV3UmVmXz5jb21wb25lbnRSZWYuaG9zdFZpZXcpLmludGVybmFsVmlldztcbiAgICB0aGlzLmRlYnVnRWxlbWVudCA9IG5ldyBEZWJ1Z0VsZW1lbnRfKHRoaXMuX2NvbXBvbmVudFBhcmVudFZpZXcuYXBwRWxlbWVudHNbMF0pO1xuICAgIHRoaXMuY29tcG9uZW50SW5zdGFuY2UgPSB0aGlzLmRlYnVnRWxlbWVudC5jb21wb25lbnRJbnN0YW5jZTtcbiAgICB0aGlzLm5hdGl2ZUVsZW1lbnQgPSB0aGlzLmRlYnVnRWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IGNvbXBvbmVudFJlZjtcbiAgfVxuXG4gIGRldGVjdENoYW5nZXMoKTogdm9pZCB7XG4gICAgdGhpcy5fY29tcG9uZW50UGFyZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgdGhpcy5fY29tcG9uZW50UGFyZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5jaGVja05vQ2hhbmdlcygpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHsgdGhpcy5fY29tcG9uZW50UmVmLmRpc3Bvc2UoKTsgfVxufVxuXG52YXIgX25leHRSb290RWxlbWVudElkID0gMDtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlc3RWaWV3RmFjdG9yeVByb3h5IGltcGxlbWVudHMgVmlld0ZhY3RvcnlQcm94eSB7XG4gIHByaXZhdGUgX2NvbXBvbmVudEZhY3RvcnlPdmVycmlkZXM6IE1hcDxUeXBlLCBGdW5jdGlvbj4gPSBuZXcgTWFwPFR5cGUsIEZ1bmN0aW9uPigpO1xuXG4gIGdldENvbXBvbmVudFZpZXdGYWN0b3J5KGNvbXBvbmVudDogVHlwZSwgb3JpZ2luYWxWaWV3RmFjdG9yeTogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgdmFyIG92ZXJyaWRlID0gdGhpcy5fY29tcG9uZW50RmFjdG9yeU92ZXJyaWRlcy5nZXQoY29tcG9uZW50KTtcbiAgICByZXR1cm4gaXNQcmVzZW50KG92ZXJyaWRlKSA/IG92ZXJyaWRlIDogb3JpZ2luYWxWaWV3RmFjdG9yeTtcbiAgfVxuXG4gIHNldENvbXBvbmVudFZpZXdGYWN0b3J5KGNvbXBvbmVudDogVHlwZSwgdmlld0ZhY3Rvcnk6IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5fY29tcG9uZW50RmFjdG9yeU92ZXJyaWRlcy5zZXQoY29tcG9uZW50LCB2aWV3RmFjdG9yeSk7XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZHMgYSBDb21wb25lbnRGaXh0dXJlIGZvciB1c2UgaW4gY29tcG9uZW50IGxldmVsIHRlc3RzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAvKiogQGludGVybmFsICovXG4gIF9iaW5kaW5nc092ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgYW55W10+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2RpcmVjdGl2ZU92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgTWFwPFR5cGUsIFR5cGU+PigpO1xuICAvKiogQGludGVybmFsICovXG4gIF90ZW1wbGF0ZU92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgc3RyaW5nPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3QmluZGluZ3NPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIGFueVtdPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF92aWV3T3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBWaWV3TWV0YWRhdGE+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbXBvbmVudE92ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgVHlwZT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY2xvbmUoKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IG5ldyBUZXN0Q29tcG9uZW50QnVpbGRlcih0aGlzLl9pbmplY3Rvcik7XG4gICAgY2xvbmUuX3ZpZXdPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX3ZpZXdPdmVycmlkZXMpO1xuICAgIGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX2RpcmVjdGl2ZU92ZXJyaWRlcyk7XG4gICAgY2xvbmUuX3RlbXBsYXRlT3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl90ZW1wbGF0ZU92ZXJyaWRlcyk7XG4gICAgY2xvbmUuX2NvbXBvbmVudE92ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fY29tcG9uZW50T3ZlcnJpZGVzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIGEgY29tcG9uZW50IHdpdGggYW5vdGhlciBjb21wb25lbnQuXG4gICAqIFRoaXMgYWxzbyB3b3JrcyB3aXRoIHByZWNvbXBpbGVkIHRlbXBsYXRlcyBpZiB0aGV5IHdlcmUgZ2VuZXJhdGVkXG4gICAqIGluIGRldmVsb3BtZW50IG1vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gb3JpZ2luYWwgY29tcG9uZW50XG4gICAqIEBwYXJhbSB7VHlwZX0gbW9jayBjb21wb25lbnRcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZUNvbXBvbmVudChjb21wb25lbnRUeXBlOiBUeXBlLCBtb2NrVHlwZTogVHlwZSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICB2YXIgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl9jb21wb25lbnRPdmVycmlkZXMuc2V0KGNvbXBvbmVudFR5cGUsIG1vY2tUeXBlKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIG9ubHkgdGhlIGh0bWwgb2YgYSB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9LlxuICAgKiBBbGwgdGhlIG90aGVyIHByb3BlcnRpZXMgb2YgdGhlIGNvbXBvbmVudCdzIHtAbGluayBWaWV3TWV0YWRhdGF9IGFyZSBwcmVzZXJ2ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVUZW1wbGF0ZShjb21wb25lbnRUeXBlOiBUeXBlLCB0ZW1wbGF0ZTogc3RyaW5nKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX3RlbXBsYXRlT3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCB0ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBhIGNvbXBvbmVudCdzIHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge3ZpZXd9IFZpZXdcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVZpZXcoY29tcG9uZW50VHlwZTogVHlwZSwgdmlldzogVmlld01ldGFkYXRhKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX3ZpZXdPdmVycmlkZXMuc2V0KGNvbXBvbmVudFR5cGUsIHZpZXcpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgdGhlIGRpcmVjdGl2ZXMgZnJvbSB0aGUgY29tcG9uZW50IHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge1R5cGV9IGZyb21cbiAgICogQHBhcmFtIHtUeXBlfSB0b1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlRGlyZWN0aXZlKGNvbXBvbmVudFR5cGU6IFR5cGUsIGZyb206IFR5cGUsIHRvOiBUeXBlKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgdmFyIG92ZXJyaWRlc0ZvckNvbXBvbmVudCA9IGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMuZ2V0KGNvbXBvbmVudFR5cGUpO1xuICAgIGlmICghaXNQcmVzZW50KG92ZXJyaWRlc0ZvckNvbXBvbmVudCkpIHtcbiAgICAgIGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMuc2V0KGNvbXBvbmVudFR5cGUsIG5ldyBNYXA8VHlwZSwgVHlwZT4oKSk7XG4gICAgICBvdmVycmlkZXNGb3JDb21wb25lbnQgPSBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLmdldChjb21wb25lbnRUeXBlKTtcbiAgICB9XG4gICAgb3ZlcnJpZGVzRm9yQ29tcG9uZW50LnNldChmcm9tLCB0byk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmUgb3IgbW9yZSBpbmplY3RhYmxlcyBjb25maWd1cmVkIHZpYSBgcHJvdmlkZXJzYCBtZXRhZGF0YSBwcm9wZXJ0eSBvZiBhIGRpcmVjdGl2ZVxuICAgKiBvclxuICAgKiBjb21wb25lbnQuXG4gICAqIFZlcnkgdXNlZnVsIHdoZW4gY2VydGFpbiBwcm92aWRlcnMgbmVlZCB0byBiZSBtb2NrZWQgb3V0LlxuICAgKlxuICAgKiBUaGUgcHJvdmlkZXJzIHNwZWNpZmllZCB2aWEgdGhpcyBtZXRob2QgYXJlIGFwcGVuZGVkIHRvIHRoZSBleGlzdGluZyBgcHJvdmlkZXJzYCBjYXVzaW5nIHRoZVxuICAgKiBkdXBsaWNhdGVkIHByb3ZpZGVycyB0b1xuICAgKiBiZSBvdmVycmlkZGVuLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge2FueVtdfSBwcm92aWRlcnNcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVByb3ZpZGVycyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX2JpbmRpbmdzT3ZlcnJpZGVzLnNldCh0eXBlLCBwcm92aWRlcnMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgb3ZlcnJpZGVCaW5kaW5ncyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHJldHVybiB0aGlzLm92ZXJyaWRlUHJvdmlkZXJzKHR5cGUsIHByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIG9uZSBvciBtb3JlIGluamVjdGFibGVzIGNvbmZpZ3VyZWQgdmlhIGBwcm92aWRlcnNgIG1ldGFkYXRhIHByb3BlcnR5IG9mIGEgZGlyZWN0aXZlXG4gICAqIG9yXG4gICAqIGNvbXBvbmVudC5cbiAgICogVmVyeSB1c2VmdWwgd2hlbiBjZXJ0YWluIHByb3ZpZGVycyBuZWVkIHRvIGJlIG1vY2tlZCBvdXQuXG4gICAqXG4gICAqIFRoZSBwcm92aWRlcnMgc3BlY2lmaWVkIHZpYSB0aGlzIG1ldGhvZCBhcmUgYXBwZW5kZWQgdG8gdGhlIGV4aXN0aW5nIGBwcm92aWRlcnNgIGNhdXNpbmcgdGhlXG4gICAqIGR1cGxpY2F0ZWQgcHJvdmlkZXJzIHRvXG4gICAqIGJlIG92ZXJyaWRkZW4uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7YW55W119IHByb3ZpZGVyc1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlVmlld1Byb3ZpZGVycyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX3ZpZXdCaW5kaW5nc092ZXJyaWRlcy5zZXQodHlwZSwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIG92ZXJyaWRlVmlld0JpbmRpbmdzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgcmV0dXJuIHRoaXMub3ZlcnJpZGVWaWV3UHJvdmlkZXJzKHR5cGUsIHByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCByZXR1cm5zIGEgQ29tcG9uZW50Rml4dHVyZS5cbiAgICpcbiAgICogQHJldHVybiB7UHJvbWlzZTxDb21wb25lbnRGaXh0dXJlPn1cbiAgICovXG4gIGNyZWF0ZUFzeW5jKHJvb3RDb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxDb21wb25lbnRGaXh0dXJlPiB7XG4gICAgdmFyIG1vY2tEaXJlY3RpdmVSZXNvbHZlciA9IHRoaXMuX2luamVjdG9yLmdldChEaXJlY3RpdmVSZXNvbHZlcik7XG4gICAgdmFyIG1vY2tWaWV3UmVzb2x2ZXIgPSB0aGlzLl9pbmplY3Rvci5nZXQoVmlld1Jlc29sdmVyKTtcbiAgICB0aGlzLl92aWV3T3ZlcnJpZGVzLmZvckVhY2goKHZpZXcsIHR5cGUpID0+IG1vY2tWaWV3UmVzb2x2ZXIuc2V0Vmlldyh0eXBlLCB2aWV3KSk7XG4gICAgdGhpcy5fdGVtcGxhdGVPdmVycmlkZXMuZm9yRWFjaCgodGVtcGxhdGUsIHR5cGUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9ja1ZpZXdSZXNvbHZlci5zZXRJbmxpbmVUZW1wbGF0ZSh0eXBlLCB0ZW1wbGF0ZSkpO1xuICAgIHRoaXMuX2RpcmVjdGl2ZU92ZXJyaWRlcy5mb3JFYWNoKChvdmVycmlkZXMsIGNvbXBvbmVudCkgPT4ge1xuICAgICAgb3ZlcnJpZGVzLmZvckVhY2goXG4gICAgICAgICAgKHRvLCBmcm9tKSA9PiB7IG1vY2tWaWV3UmVzb2x2ZXIub3ZlcnJpZGVWaWV3RGlyZWN0aXZlKGNvbXBvbmVudCwgZnJvbSwgdG8pOyB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2JpbmRpbmdzT3ZlcnJpZGVzLmZvckVhY2goKGJpbmRpbmdzLCB0eXBlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vY2tEaXJlY3RpdmVSZXNvbHZlci5zZXRCaW5kaW5nc092ZXJyaWRlKHR5cGUsIGJpbmRpbmdzKSk7XG4gICAgdGhpcy5fdmlld0JpbmRpbmdzT3ZlcnJpZGVzLmZvckVhY2goXG4gICAgICAgIChiaW5kaW5ncywgdHlwZSkgPT4gbW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFZpZXdCaW5kaW5nc092ZXJyaWRlKHR5cGUsIGJpbmRpbmdzKSk7XG5cbiAgICB2YXIgcm9vdEVsSWQgPSBgcm9vdCR7X25leHRSb290RWxlbWVudElkKyt9YDtcbiAgICB2YXIgcm9vdEVsID0gZWwoYDxkaXYgaWQ9XCIke3Jvb3RFbElkfVwiPjwvZGl2PmApO1xuICAgIHZhciBkb2MgPSB0aGlzLl9pbmplY3Rvci5nZXQoRE9DVU1FTlQpO1xuXG4gICAgLy8gVE9ETyhqdWxpZW1yKTogY2FuL3Nob3VsZCB0aGlzIGJlIG9wdGlvbmFsP1xuICAgIHZhciBvbGRSb290cyA9IERPTS5xdWVyeVNlbGVjdG9yQWxsKGRvYywgJ1tpZF49cm9vdF0nKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9sZFJvb3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBET00ucmVtb3ZlKG9sZFJvb3RzW2ldKTtcbiAgICB9XG4gICAgRE9NLmFwcGVuZENoaWxkKGRvYy5ib2R5LCByb290RWwpO1xuICAgIHZhciBvcmlnaW5hbENvbXBUeXBlcyA9IFtdO1xuICAgIHZhciBtb2NrSG9zdFZpZXdGYWN0b3J5UHJvbWlzZXMgPSBbXTtcbiAgICB2YXIgY29tcGlsZXI6IENvbXBpbGVyXyA9IHRoaXMuX2luamVjdG9yLmdldChDb21waWxlcik7XG4gICAgdmFyIHZpZXdGYWN0b3J5UHJveHk6IFRlc3RWaWV3RmFjdG9yeVByb3h5ID0gdGhpcy5faW5qZWN0b3IuZ2V0KFRlc3RWaWV3RmFjdG9yeVByb3h5KTtcbiAgICB0aGlzLl9jb21wb25lbnRPdmVycmlkZXMuZm9yRWFjaCgobW9ja0NvbXBUeXBlLCBvcmlnaW5hbENvbXBUeXBlKSA9PiB7XG4gICAgICBvcmlnaW5hbENvbXBUeXBlcy5wdXNoKG9yaWdpbmFsQ29tcFR5cGUpO1xuICAgICAgbW9ja0hvc3RWaWV3RmFjdG9yeVByb21pc2VzLnB1c2goY29tcGlsZXIuY29tcGlsZUluSG9zdChtb2NrQ29tcFR5cGUpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsKG1vY2tIb3N0Vmlld0ZhY3RvcnlQcm9taXNlcylcbiAgICAgICAgLnRoZW4oKG1vY2tIb3N0Vmlld0ZhY3RvcmllczogSG9zdFZpZXdGYWN0b3J5UmVmX1tdKSA9PiB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2NrSG9zdFZpZXdGYWN0b3JpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBvcmlnaW5hbENvbXBUeXBlID0gb3JpZ2luYWxDb21wVHlwZXNbaV07XG4gICAgICAgICAgICB2aWV3RmFjdG9yeVByb3h5LnNldENvbXBvbmVudFZpZXdGYWN0b3J5KFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsQ29tcFR5cGUsXG4gICAgICAgICAgICAgICAgbW9ja0hvc3RWaWV3RmFjdG9yaWVzW2ldLmludGVybmFsSG9zdFZpZXdGYWN0b3J5LmNvbXBvbmVudFZpZXdGYWN0b3J5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2luamVjdG9yLmdldChEeW5hbWljQ29tcG9uZW50TG9hZGVyKVxuICAgICAgICAgICAgICAubG9hZEFzUm9vdChyb290Q29tcG9uZW50VHlwZSwgYCMke3Jvb3RFbElkfWAsIHRoaXMuX2luamVjdG9yKVxuICAgICAgICAgICAgICAudGhlbigoY29tcG9uZW50UmVmKSA9PiB7IHJldHVybiBuZXcgQ29tcG9uZW50Rml4dHVyZV8oY29tcG9uZW50UmVmKTsgfSk7XG4gICAgICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBURVNUX0NPTVBPTkVOVF9CVUlMREVSX1BST1ZJREVSUyA9IENPTlNUX0VYUFIoW1xuICBUZXN0Vmlld0ZhY3RvcnlQcm94eSxcbiAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoVmlld0ZhY3RvcnlQcm94eSwge3VzZUV4aXN0aW5nOiBUZXN0Vmlld0ZhY3RvcnlQcm94eX0pKSxcbiAgVGVzdENvbXBvbmVudEJ1aWxkZXJcbl0pO1xuIl19