import { Injector } from 'angular2/src/core/di';
import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
import { ViewMetadata } from '../core/metadata';
import { ComponentRef } from 'angular2/src/core/linker/dynamic_component_loader';
import { DebugElement } from 'angular2/src/core/debug/debug_element';
/**
 * @deprecated Use ComponentFixture
 */
export declare abstract class RootTestComponent {
    debugElement: DebugElement;
    abstract detectChanges(): void;
    abstract destroy(): void;
}
export declare abstract class ComponentFixture extends RootTestComponent {
}
export declare class ComponentFixture_ extends ComponentFixture {
    constructor(componentRef: ComponentRef);
    detectChanges(): void;
    destroy(): void;
}
/**
 * Builds a ComponentFixture for use in component level tests.
 */
export declare class TestComponentBuilder {
    private _injector;
    constructor(_injector: Injector);
    /**
     * Overrides only the html of a {@link ComponentMetadata}.
     * All the other properties of the component's {@link ViewMetadata} are preserved.
     *
     * @param {Type} component
     * @param {string} html
     *
     * @return {TestComponentBuilder}
     */
    overrideTemplate(componentType: Type, template: string): TestComponentBuilder;
    /**
     * Overrides a component's {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {view} View
     *
     * @return {TestComponentBuilder}
     */
    overrideView(componentType: Type, view: ViewMetadata): TestComponentBuilder;
    /**
     * Overrides the directives from the component {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {Type} from
     * @param {Type} to
     *
     * @return {TestComponentBuilder}
     */
    overrideDirective(componentType: Type, from: Type, to: Type): TestComponentBuilder;
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
    overrideProviders(type: Type, providers: any[]): TestComponentBuilder;
    /**
     * @deprecated
     */
    overrideBindings(type: Type, providers: any[]): TestComponentBuilder;
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
    overrideViewProviders(type: Type, providers: any[]): TestComponentBuilder;
    /**
     * @deprecated
     */
    overrideViewBindings(type: Type, providers: any[]): TestComponentBuilder;
    /**
     * Builds and returns a ComponentFixture.
     *
     * @return {Promise<ComponentFixture>}
     */
    createAsync(rootComponentType: Type): Promise<ComponentFixture>;
}
