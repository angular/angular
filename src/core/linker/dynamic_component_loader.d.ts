import { Injector, ResolvedProvider } from 'angular2/src/core/di';
import { Compiler } from './compiler';
import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
import { AppViewManager } from 'angular2/src/core/linker/view_manager';
import { ElementRef } from './element_ref';
import { HostViewRef } from './view_ref';
/**
 * Represents an instance of a Component created via {@link DynamicComponentLoader}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #dispose}
 * method.
 */
export declare abstract class ComponentRef {
    /**
     * The injector provided {@link DynamicComponentLoader#loadAsRoot}.
     *
     * TODO(i): this api is useless and should be replaced by an injector retrieved from
     *     the HostElementRef, which is currently not possible.
     */
    injector: Injector;
    /**
     * Location of the Host Element of this Component Instance.
     */
    location: ElementRef;
    /**
     * The instance of the Component.
     */
    instance: any;
    /**
     * The user defined component type, represented via the constructor function.
     *
     * <!-- TODO: customize wording for Dart docs -->
     */
    componentType: Type;
    /**
     * The {@link ViewRef} of the Host View of this Component instance.
     */
    hostView: HostViewRef;
    /**
     * Destroys the component instance and all of the data structures associated with it.
     *
     * TODO(i): rename to destroy to be consistent with AppViewManager and ViewContainerRef
     */
    abstract dispose(): any;
}
export declare class ComponentRef_ extends ComponentRef {
    private _dispose;
    /**
     * TODO(i): refactor into public/private fields
     */
    constructor(location: ElementRef, instance: any, componentType: Type, injector: Injector, _dispose: () => void);
    dispose(): void;
}
/**
 * Service for instantiating a Component and attaching it to a View at a specified location.
 */
export declare abstract class DynamicComponentLoader {
    /**
     * Creates an instance of a Component `type` and attaches it to the first element in the
     * platform-specific global view that matches the component's selector.
     *
     * In a browser the platform-specific global view is the main DOM Document.
     *
     * If needed, the component's selector can be overridden via `overrideSelector`.
     *
     * You can optionally provide `injector` and this {@link Injector} will be used to instantiate the
     * Component.
     *
     * To be notified when this Component instance is destroyed, you can also optionally provide
     * `onDispose` callback.
     *
     * Returns a promise for the {@link ComponentRef} representing the newly created Component.
     *
     * ### Example
     *
     * ```
     * @Component({
     *   selector: 'child-component',
     *   template: 'Child'
     * })
     * class ChildComponent {
     * }
     *
     * @Component({
     *   selector: 'my-app',
     *   template: 'Parent (<child id="child"></child>)'
     * })
     * class MyApp {
     *   constructor(dcl: DynamicComponentLoader, injector: Injector) {
     *     dcl.loadAsRoot(ChildComponent, '#child', injector);
     *   }
     * }
     *
     * bootstrap(MyApp);
     * ```
     *
     * Resulting DOM:
     *
     * ```
     * <my-app>
     *   Parent (
     *     <child id="child">Child</child>
     *   )
     * </my-app>
     * ```
     */
    abstract loadAsRoot(type: Type, overrideSelector: string, injector: Injector, onDispose?: () => void): Promise<ComponentRef>;
    /**
     * Creates an instance of a Component and attaches it to a View Container located inside of the
     * Component View of another Component instance.
     *
     * The targeted Component Instance is specified via its `hostLocation` {@link ElementRef}. The
     * location within the Component View of this Component Instance is specified via `anchorName`
     * Template Variable Name.
     *
     * You can optionally provide `providers` to configure the {@link Injector} provisioned for this
     * Component Instance.
     *
     * Returns a promise for the {@link ComponentRef} representing the newly created Component.
     *
     * ### Example
     *
     * ```
     * @Component({
     *   selector: 'child-component',
     *   template: 'Child'
     * })
     * class ChildComponent {
     * }
     *
     * @Component({
     *   selector: 'my-app',
     *   template: 'Parent (<div #child></div>)'
     * })
     * class MyApp {
     *   constructor(dcl: DynamicComponentLoader, elementRef: ElementRef) {
     *     dcl.loadIntoLocation(ChildComponent, elementRef, 'child');
     *   }
     * }
     *
     * bootstrap(MyApp);
     * ```
     *
     * Resulting DOM:
     *
     * ```
     * <my-app>
     *    Parent (
     *      <div #child="" class="ng-binding"></div>
     *      <child-component class="ng-binding">Child</child-component>
     *    )
     * </my-app>
     * ```
     */
    abstract loadIntoLocation(type: Type, hostLocation: ElementRef, anchorName: string, providers?: ResolvedProvider[]): Promise<ComponentRef>;
    /**
     * Creates an instance of a Component and attaches it to the View Container found at the
     * `location` specified as {@link ElementRef}.
     *
     * You can optionally provide `providers` to configure the {@link Injector} provisioned for this
     * Component Instance.
     *
     * Returns a promise for the {@link ComponentRef} representing the newly created Component.
     *
     *
     * ### Example
     *
     * ```
     * @Component({
     *   selector: 'child-component',
     *   template: 'Child'
     * })
     * class ChildComponent {
     * }
     *
     * @Component({
     *   selector: 'my-app',
     *   template: 'Parent'
     * })
     * class MyApp {
     *   constructor(dcl: DynamicComponentLoader, elementRef: ElementRef) {
     *     dcl.loadNextToLocation(ChildComponent, elementRef);
     *   }
     * }
     *
     * bootstrap(MyApp);
     * ```
     *
     * Resulting DOM:
     *
     * ```
     * <my-app>Parent</my-app>
     * <child-component>Child</child-component>
     * ```
     */
    abstract loadNextToLocation(type: Type, location: ElementRef, providers?: ResolvedProvider[]): Promise<ComponentRef>;
}
export declare class DynamicComponentLoader_ extends DynamicComponentLoader {
    private _compiler;
    private _viewManager;
    constructor(_compiler: Compiler, _viewManager: AppViewManager);
    loadAsRoot(type: Type, overrideSelector: string, injector: Injector, onDispose?: () => void): Promise<ComponentRef>;
    loadIntoLocation(type: Type, hostLocation: ElementRef, anchorName: string, providers?: ResolvedProvider[]): Promise<ComponentRef>;
    loadNextToLocation(type: Type, location: ElementRef, providers?: ResolvedProvider[]): Promise<ComponentRef>;
}
