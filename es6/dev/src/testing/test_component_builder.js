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
import { Injector, Injectable } from 'angular2/src/core/di';
import { isPresent } from 'angular2/src/facade/lang';
import { MapWrapper } from 'angular2/src/facade/collection';
import { DirectiveResolver } from 'angular2/src/core/linker/directive_resolver';
import { ViewResolver } from 'angular2/src/core/linker/view_resolver';
import { internalView } from 'angular2/src/core/linker/view_ref';
import { DynamicComponentLoader } from 'angular2/src/core/linker/dynamic_component_loader';
import { el } from './utils';
import { DOCUMENT } from 'angular2/src/platform/dom/dom_tokens';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { DebugElement_ } from 'angular2/src/core/debug/debug_element';
/**
 * @deprecated Use ComponentFixture
 */
export class RootTestComponent {
}
export class ComponentFixture extends RootTestComponent {
}
export class ComponentFixture_ extends ComponentFixture {
    constructor(componentRef) {
        super();
        this.debugElement = new DebugElement_(internalView(componentRef.hostView), 0);
        this._componentParentView = internalView(componentRef.hostView);
        this._componentRef = componentRef;
    }
    detectChanges() {
        this._componentParentView.changeDetector.detectChanges();
        this._componentParentView.changeDetector.checkNoChanges();
    }
    destroy() { this._componentRef.dispose(); }
}
var _nextRootElementId = 0;
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
    }
    /** @internal */
    _clone() {
        var clone = new TestComponentBuilder(this._injector);
        clone._viewOverrides = MapWrapper.clone(this._viewOverrides);
        clone._directiveOverrides = MapWrapper.clone(this._directiveOverrides);
        clone._templateOverrides = MapWrapper.clone(this._templateOverrides);
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
        return this._injector.get(DynamicComponentLoader)
            .loadAsRoot(rootComponentType, `#${rootElId}`, this._injector)
            .then((componentRef) => { return new ComponentFixture_(componentRef); });
    }
};
TestComponentBuilder = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Injector])
], TestComponentBuilder);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21wb25lbnRfYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXIudHMiXSwibmFtZXMiOlsiUm9vdFRlc3RDb21wb25lbnQiLCJDb21wb25lbnRGaXh0dXJlIiwiQ29tcG9uZW50Rml4dHVyZV8iLCJDb21wb25lbnRGaXh0dXJlXy5jb25zdHJ1Y3RvciIsIkNvbXBvbmVudEZpeHR1cmVfLmRldGVjdENoYW5nZXMiLCJDb21wb25lbnRGaXh0dXJlXy5kZXN0cm95IiwiVGVzdENvbXBvbmVudEJ1aWxkZXIiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5jb25zdHJ1Y3RvciIsIlRlc3RDb21wb25lbnRCdWlsZGVyLl9jbG9uZSIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlVGVtcGxhdGUiLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZVZpZXciLCJUZXN0Q29tcG9uZW50QnVpbGRlci5vdmVycmlkZURpcmVjdGl2ZSIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlUHJvdmlkZXJzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIub3ZlcnJpZGVCaW5kaW5ncyIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlVmlld1Byb3ZpZGVycyIsIlRlc3RDb21wb25lbnRCdWlsZGVyLm92ZXJyaWRlVmlld0JpbmRpbmdzIiwiVGVzdENvbXBvbmVudEJ1aWxkZXIuY3JlYXRlQXN5bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxRQUFRLEVBQVcsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BRTNELEVBQU8sU0FBUyxFQUFVLE1BQU0sMEJBQTBCO09BRTFELEVBQWMsVUFBVSxFQUFDLE1BQU0sZ0NBQWdDO09BSS9ELEVBQUMsaUJBQWlCLEVBQUMsTUFBTSw2Q0FBNkM7T0FDdEUsRUFBQyxZQUFZLEVBQUMsTUFBTSx3Q0FBd0M7T0FF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LFVBQVVBLENBQUNBLENBQUNBO1FBQ2hEQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUV2Q0EsOENBQThDQTtRQUM5Q0EsSUFBSUEsUUFBUUEsR0FBR0EsR0FBR0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxFQUFFQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUN2REEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDekNBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzFCQSxDQUFDQTtRQUNEQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUdsQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0Esc0JBQXNCQSxDQUFDQTthQUM1Q0EsVUFBVUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxJQUFJQSxRQUFRQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTthQUM3REEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsWUFBWUEsT0FBT0EsTUFBTUEsQ0FBQ0EsSUFBSUEsaUJBQWlCQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMvRUEsQ0FBQ0E7QUFDSFYsQ0FBQ0E7QUF2S0Q7SUFBQyxVQUFVLEVBQUU7O3lCQXVLWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RvciwgcHJvdmlkZSwgSW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5pbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UHJvbWlzZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG5pbXBvcnQge1ZpZXdNZXRhZGF0YX0gZnJvbSAnLi4vY29yZS9tZXRhZGF0YSc7XG5cbmltcG9ydCB7RGlyZWN0aXZlUmVzb2x2ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9kaXJlY3RpdmVfcmVzb2x2ZXInO1xuaW1wb3J0IHtWaWV3UmVzb2x2ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3Jlc29sdmVyJztcbmltcG9ydCB7QXBwVmlld30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXcnO1xuaW1wb3J0IHtpbnRlcm5hbFZpZXcsIFZpZXdSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3JlZic7XG5pbXBvcnQge1xuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICBDb21wb25lbnRSZWZcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2R5bmFtaWNfY29tcG9uZW50X2xvYWRlcic7XG5cbmltcG9ydCB7ZWx9IGZyb20gJy4vdXRpbHMnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV90b2tlbnMnO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuXG5pbXBvcnQge0RlYnVnRWxlbWVudCwgRGVidWdFbGVtZW50X30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGVidWcvZGVidWdfZWxlbWVudCc7XG5cblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBVc2UgQ29tcG9uZW50Rml4dHVyZVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUm9vdFRlc3RDb21wb25lbnQge1xuICBkZWJ1Z0VsZW1lbnQ6IERlYnVnRWxlbWVudDtcblxuICBhYnN0cmFjdCBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQ7XG4gIGFic3RyYWN0IGRlc3Ryb3koKTogdm9pZDtcbn1cblxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50Rml4dHVyZSBleHRlbmRzIFJvb3RUZXN0Q29tcG9uZW50IHt9XG5cblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEZpeHR1cmVfIGV4dGVuZHMgQ29tcG9uZW50Rml4dHVyZSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmO1xuICAvKiogQGludGVybmFsICovXG4gIF9jb21wb25lbnRQYXJlbnRWaWV3OiBBcHBWaWV3O1xuXG4gIGNvbnN0cnVjdG9yKGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmRlYnVnRWxlbWVudCA9IG5ldyBEZWJ1Z0VsZW1lbnRfKGludGVybmFsVmlldyg8Vmlld1JlZj5jb21wb25lbnRSZWYuaG9zdFZpZXcpLCAwKTtcbiAgICB0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3ID0gaW50ZXJuYWxWaWV3KDxWaWV3UmVmPmNvbXBvbmVudFJlZi5ob3N0Vmlldyk7XG4gICAgdGhpcy5fY29tcG9uZW50UmVmID0gY29tcG9uZW50UmVmO1xuICB9XG5cbiAgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3LmNoYW5nZURldGVjdG9yLmRldGVjdENoYW5nZXMoKTtcbiAgICB0aGlzLl9jb21wb25lbnRQYXJlbnRWaWV3LmNoYW5nZURldGVjdG9yLmNoZWNrTm9DaGFuZ2VzKCk7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQgeyB0aGlzLl9jb21wb25lbnRSZWYuZGlzcG9zZSgpOyB9XG59XG5cbnZhciBfbmV4dFJvb3RFbGVtZW50SWQgPSAwO1xuXG4vKipcbiAqIEJ1aWxkcyBhIENvbXBvbmVudEZpeHR1cmUgZm9yIHVzZSBpbiBjb21wb25lbnQgbGV2ZWwgdGVzdHMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2JpbmRpbmdzT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBhbnlbXT4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGlyZWN0aXZlT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBNYXA8VHlwZSwgVHlwZT4+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RlbXBsYXRlT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBzdHJpbmc+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZpZXdCaW5kaW5nc092ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgYW55W10+KCk7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZpZXdPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIFZpZXdNZXRhZGF0YT4oKTtcblxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2luamVjdG9yOiBJbmplY3Rvcikge31cblxuICAvKiogQGludGVybmFsICovXG4gIF9jbG9uZSgpOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgdmFyIGNsb25lID0gbmV3IFRlc3RDb21wb25lbnRCdWlsZGVyKHRoaXMuX2luamVjdG9yKTtcbiAgICBjbG9uZS5fdmlld092ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fdmlld092ZXJyaWRlcyk7XG4gICAgY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fZGlyZWN0aXZlT3ZlcnJpZGVzKTtcbiAgICBjbG9uZS5fdGVtcGxhdGVPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX3RlbXBsYXRlT3ZlcnJpZGVzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIG9ubHkgdGhlIGh0bWwgb2YgYSB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9LlxuICAgKiBBbGwgdGhlIG90aGVyIHByb3BlcnRpZXMgb2YgdGhlIGNvbXBvbmVudCdzIHtAbGluayBWaWV3TWV0YWRhdGF9IGFyZSBwcmVzZXJ2ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVUZW1wbGF0ZShjb21wb25lbnRUeXBlOiBUeXBlLCB0ZW1wbGF0ZTogc3RyaW5nKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX3RlbXBsYXRlT3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCB0ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBhIGNvbXBvbmVudCdzIHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge3ZpZXd9IFZpZXdcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVZpZXcoY29tcG9uZW50VHlwZTogVHlwZSwgdmlldzogVmlld01ldGFkYXRhKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX3ZpZXdPdmVycmlkZXMuc2V0KGNvbXBvbmVudFR5cGUsIHZpZXcpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgdGhlIGRpcmVjdGl2ZXMgZnJvbSB0aGUgY29tcG9uZW50IHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge1R5cGV9IGZyb21cbiAgICogQHBhcmFtIHtUeXBlfSB0b1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlRGlyZWN0aXZlKGNvbXBvbmVudFR5cGU6IFR5cGUsIGZyb206IFR5cGUsIHRvOiBUeXBlKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgdmFyIG92ZXJyaWRlc0ZvckNvbXBvbmVudCA9IGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMuZ2V0KGNvbXBvbmVudFR5cGUpO1xuICAgIGlmICghaXNQcmVzZW50KG92ZXJyaWRlc0ZvckNvbXBvbmVudCkpIHtcbiAgICAgIGNsb25lLl9kaXJlY3RpdmVPdmVycmlkZXMuc2V0KGNvbXBvbmVudFR5cGUsIG5ldyBNYXA8VHlwZSwgVHlwZT4oKSk7XG4gICAgICBvdmVycmlkZXNGb3JDb21wb25lbnQgPSBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLmdldChjb21wb25lbnRUeXBlKTtcbiAgICB9XG4gICAgb3ZlcnJpZGVzRm9yQ29tcG9uZW50LnNldChmcm9tLCB0byk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmUgb3IgbW9yZSBpbmplY3RhYmxlcyBjb25maWd1cmVkIHZpYSBgcHJvdmlkZXJzYCBtZXRhZGF0YSBwcm9wZXJ0eSBvZiBhIGRpcmVjdGl2ZVxuICAgKiBvclxuICAgKiBjb21wb25lbnQuXG4gICAqIFZlcnkgdXNlZnVsIHdoZW4gY2VydGFpbiBwcm92aWRlcnMgbmVlZCB0byBiZSBtb2NrZWQgb3V0LlxuICAgKlxuICAgKiBUaGUgcHJvdmlkZXJzIHNwZWNpZmllZCB2aWEgdGhpcyBtZXRob2QgYXJlIGFwcGVuZGVkIHRvIHRoZSBleGlzdGluZyBgcHJvdmlkZXJzYCBjYXVzaW5nIHRoZVxuICAgKiBkdXBsaWNhdGVkIHByb3ZpZGVycyB0b1xuICAgKiBiZSBvdmVycmlkZGVuLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge2FueVtdfSBwcm92aWRlcnNcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVByb3ZpZGVycyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX2JpbmRpbmdzT3ZlcnJpZGVzLnNldCh0eXBlLCBwcm92aWRlcnMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgb3ZlcnJpZGVCaW5kaW5ncyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHJldHVybiB0aGlzLm92ZXJyaWRlUHJvdmlkZXJzKHR5cGUsIHByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIG9uZSBvciBtb3JlIGluamVjdGFibGVzIGNvbmZpZ3VyZWQgdmlhIGBwcm92aWRlcnNgIG1ldGFkYXRhIHByb3BlcnR5IG9mIGEgZGlyZWN0aXZlXG4gICAqIG9yXG4gICAqIGNvbXBvbmVudC5cbiAgICogVmVyeSB1c2VmdWwgd2hlbiBjZXJ0YWluIHByb3ZpZGVycyBuZWVkIHRvIGJlIG1vY2tlZCBvdXQuXG4gICAqXG4gICAqIFRoZSBwcm92aWRlcnMgc3BlY2lmaWVkIHZpYSB0aGlzIG1ldGhvZCBhcmUgYXBwZW5kZWQgdG8gdGhlIGV4aXN0aW5nIGBwcm92aWRlcnNgIGNhdXNpbmcgdGhlXG4gICAqIGR1cGxpY2F0ZWQgcHJvdmlkZXJzIHRvXG4gICAqIGJlIG92ZXJyaWRkZW4uXG4gICAqXG4gICAqIEBwYXJhbSB7VHlwZX0gY29tcG9uZW50XG4gICAqIEBwYXJhbSB7YW55W119IHByb3ZpZGVyc1xuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlVmlld1Byb3ZpZGVycyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHZhciBjbG9uZSA9IHRoaXMuX2Nsb25lKCk7XG4gICAgY2xvbmUuX3ZpZXdCaW5kaW5nc092ZXJyaWRlcy5zZXQodHlwZSwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIG92ZXJyaWRlVmlld0JpbmRpbmdzKHR5cGU6IFR5cGUsIHByb3ZpZGVyczogYW55W10pOiBUZXN0Q29tcG9uZW50QnVpbGRlciB7XG4gICAgcmV0dXJuIHRoaXMub3ZlcnJpZGVWaWV3UHJvdmlkZXJzKHR5cGUsIHByb3ZpZGVycyk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCByZXR1cm5zIGEgQ29tcG9uZW50Rml4dHVyZS5cbiAgICpcbiAgICogQHJldHVybiB7UHJvbWlzZTxDb21wb25lbnRGaXh0dXJlPn1cbiAgICovXG4gIGNyZWF0ZUFzeW5jKHJvb3RDb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxDb21wb25lbnRGaXh0dXJlPiB7XG4gICAgdmFyIG1vY2tEaXJlY3RpdmVSZXNvbHZlciA9IHRoaXMuX2luamVjdG9yLmdldChEaXJlY3RpdmVSZXNvbHZlcik7XG4gICAgdmFyIG1vY2tWaWV3UmVzb2x2ZXIgPSB0aGlzLl9pbmplY3Rvci5nZXQoVmlld1Jlc29sdmVyKTtcbiAgICB0aGlzLl92aWV3T3ZlcnJpZGVzLmZvckVhY2goKHZpZXcsIHR5cGUpID0+IG1vY2tWaWV3UmVzb2x2ZXIuc2V0Vmlldyh0eXBlLCB2aWV3KSk7XG4gICAgdGhpcy5fdGVtcGxhdGVPdmVycmlkZXMuZm9yRWFjaCgodGVtcGxhdGUsIHR5cGUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9ja1ZpZXdSZXNvbHZlci5zZXRJbmxpbmVUZW1wbGF0ZSh0eXBlLCB0ZW1wbGF0ZSkpO1xuICAgIHRoaXMuX2RpcmVjdGl2ZU92ZXJyaWRlcy5mb3JFYWNoKChvdmVycmlkZXMsIGNvbXBvbmVudCkgPT4ge1xuICAgICAgb3ZlcnJpZGVzLmZvckVhY2goXG4gICAgICAgICAgKHRvLCBmcm9tKSA9PiB7IG1vY2tWaWV3UmVzb2x2ZXIub3ZlcnJpZGVWaWV3RGlyZWN0aXZlKGNvbXBvbmVudCwgZnJvbSwgdG8pOyB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2JpbmRpbmdzT3ZlcnJpZGVzLmZvckVhY2goKGJpbmRpbmdzLCB0eXBlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vY2tEaXJlY3RpdmVSZXNvbHZlci5zZXRCaW5kaW5nc092ZXJyaWRlKHR5cGUsIGJpbmRpbmdzKSk7XG4gICAgdGhpcy5fdmlld0JpbmRpbmdzT3ZlcnJpZGVzLmZvckVhY2goXG4gICAgICAgIChiaW5kaW5ncywgdHlwZSkgPT4gbW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFZpZXdCaW5kaW5nc092ZXJyaWRlKHR5cGUsIGJpbmRpbmdzKSk7XG5cbiAgICB2YXIgcm9vdEVsSWQgPSBgcm9vdCR7X25leHRSb290RWxlbWVudElkKyt9YDtcbiAgICB2YXIgcm9vdEVsID0gZWwoYDxkaXYgaWQ9XCIke3Jvb3RFbElkfVwiPjwvZGl2PmApO1xuICAgIHZhciBkb2MgPSB0aGlzLl9pbmplY3Rvci5nZXQoRE9DVU1FTlQpO1xuXG4gICAgLy8gVE9ETyhqdWxpZW1yKTogY2FuL3Nob3VsZCB0aGlzIGJlIG9wdGlvbmFsP1xuICAgIHZhciBvbGRSb290cyA9IERPTS5xdWVyeVNlbGVjdG9yQWxsKGRvYywgJ1tpZF49cm9vdF0nKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9sZFJvb3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBET00ucmVtb3ZlKG9sZFJvb3RzW2ldKTtcbiAgICB9XG4gICAgRE9NLmFwcGVuZENoaWxkKGRvYy5ib2R5LCByb290RWwpO1xuXG5cbiAgICByZXR1cm4gdGhpcy5faW5qZWN0b3IuZ2V0KER5bmFtaWNDb21wb25lbnRMb2FkZXIpXG4gICAgICAgIC5sb2FkQXNSb290KHJvb3RDb21wb25lbnRUeXBlLCBgIyR7cm9vdEVsSWR9YCwgdGhpcy5faW5qZWN0b3IpXG4gICAgICAgIC50aGVuKChjb21wb25lbnRSZWYpID0+IHsgcmV0dXJuIG5ldyBDb21wb25lbnRGaXh0dXJlXyhjb21wb25lbnRSZWYpOyB9KTtcbiAgfVxufVxuIl19