import { ComponentRef, DebugElement, Injector, ViewMetadata } from 'angular2/core';
import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
/**
 * Fixture for debugging and testing a component.
 */
export declare abstract class ComponentFixture {
    /**
     * The DebugElement associated with the root element of this component.
     */
    debugElement: DebugElement;
    /**
     * The instance of the root component class.
     */
    componentInstance: any;
    /**
     * The native element at the root of the component.
     */
    nativeElement: any;
    /**
     * Trigger a change detection cycle for the component.
     */
    abstract detectChanges(): void;
    /**
     * Trigger component destruction.
     */
    abstract destroy(): void;
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
