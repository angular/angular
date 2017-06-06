import { OpaqueToken, ComponentRef, ComponentFactory, Injector, ViewMetadata, ElementRef, ChangeDetectorRef, NgZone } from 'angular2/core';
import { Type } from 'angular2/src/facade/lang';
import { DebugElement } from 'angular2/src/core/debug/debug_node';
export declare var ComponentFixtureAutoDetect: OpaqueToken;
export declare var ComponentFixtureNoNgZone: OpaqueToken;
/**
 * Fixture for debugging and testing a component.
 */
export declare class ComponentFixture<T> {
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
     * The ElementRef for the element at the root of the component.
     */
    elementRef: ElementRef;
    /**
     * The ComponentRef for the component
     */
    componentRef: ComponentRef<T>;
    /**
     * The ChangeDetectorRef for the component
     */
    changeDetectorRef: ChangeDetectorRef;
    /**
     * The NgZone in which this component was instantiated.
     */
    ngZone: NgZone;
    private _autoDetect;
    private _isStable;
    private _completer;
    private _onUnstableSubscription;
    private _onStableSubscription;
    private _onMicrotaskEmptySubscription;
    private _onErrorSubscription;
    constructor(componentRef: ComponentRef<T>, ngZone: NgZone, autoDetect: boolean);
    private _tick(checkNoChanges);
    /**
     * Trigger a change detection cycle for the component.
     */
    detectChanges(checkNoChanges?: boolean): void;
    /**
     * Do a change detection run to make sure there were no changes.
     */
    checkNoChanges(): void;
    /**
     * Set whether the fixture should autodetect changes.
     *
     * Also runs detectChanges once so that any existing change is detected.
     */
    autoDetectChanges(autoDetect?: boolean): void;
    /**
     * Return whether the fixture is currently stable or has async tasks that have not been completed
     * yet.
     */
    isStable(): boolean;
    /**
     * Get a promise that resolves when the fixture is stable.
     *
     * This can be used to resume testing after events have triggered asynchronous activity or
     * asynchronous change detection.
     */
    whenStable(): Promise<any>;
    /**
     * Trigger component destruction.
     */
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
    private _create<C>(ngZone, componentFactory);
    /**
     * Builds and returns a ComponentFixture.
     *
     * @return {Promise<ComponentFixture>}
     */
    createAsync(rootComponentType: Type): Promise<ComponentFixture<any>>;
    createFakeAsync(rootComponentType: Type): ComponentFixture<any>;
    createSync<C>(componentFactory: ComponentFactory<C>): ComponentFixture<C>;
}
