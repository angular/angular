import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { Type } from 'angular2/src/facade/lang';
import { Provider, Injector } from 'angular2/src/core/di';
import { Promise } from 'angular2/src/facade/async';
import { ComponentRef } from 'angular2/src/core/linker/dynamic_component_loader';
import { ChangeDetectorRef } from 'angular2/src/core/change_detection/change_detector_ref';
/**
 * Create an Angular zone.
 */
export declare function createNgZone(): NgZone;
/**
 * Initialize the Angular 'platform' on the page.
 *
 * See {@link PlatformRef} for details on the Angular platform.
 *
 * It is also possible to specify providers to be made in the new platform. These providers
 * will be shared between all applications on the page. For example, an abstraction for
 * the browser cookie jar should be bound at the platform level, because there is only one
 * cookie jar regardless of how many applications on the page will be accessing it.
 *
 * The platform function can be called multiple times as long as the same list of providers
 * is passed into each call. If the platform function is called with a different set of
 * provides, Angular will throw an exception.
 */
export declare function platform(providers?: Array<Type | Provider | any[]>): PlatformRef;
/**
 * Dispose the existing platform.
 */
export declare function disposePlatform(): void;
/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
 * explicitly by calling {@link platform}().
 */
export declare abstract class PlatformRef {
    /**
     * Register a listener to be called when the platform is disposed.
     */
    abstract registerDisposeListener(dispose: () => void): void;
    /**
     * Retrieve the platform {@link Injector}, which is the parent injector for
     * every Angular application on the page and provides singleton providers.
     */
    injector: Injector;
    /**
     * Instantiate a new Angular application on the page.
     *
     * ### What is an application?
     *
     * Each Angular application has its own zone, change detection, compiler,
     * renderer, and other framework components. An application hosts one or more
     * root components, which can be initialized via `ApplicationRef.bootstrap()`.
     *
     * ### Application Providers
     *
     * Angular applications require numerous providers to be properly instantiated.
     * When using `application()` to create a new app on the page, these providers
     * must be provided. Fortunately, there are helper functions to configure
     * typical providers, as shown in the example below.
     *
     * ### Example
     *
     * {@example core/ts/platform/platform.ts region='longform'}
     * ### See Also
     *
     * See the {@link bootstrap} documentation for more details.
     */
    abstract application(providers: Array<Type | Provider | any[]>): ApplicationRef;
    /**
     * Instantiate a new Angular application on the page, using providers which
     * are only available asynchronously. One such use case is to initialize an
     * application running in a web worker.
     *
     * ### Usage
     *
     * `bindingFn` is a function that will be called in the new application's zone.
     * It should return a `Promise` to a list of providers to be used for the
     * new application. Once this promise resolves, the application will be
     * constructed in the same manner as a normal `application()`.
     */
    abstract asyncApplication(bindingFn: (zone: NgZone) => Promise<Array<Type | Provider | any[]>>, providers?: Array<Type | Provider | any[]>): Promise<ApplicationRef>;
    /**
     * Destroy the Angular platform and all Angular applications on the page.
     */
    abstract dispose(): void;
}
export declare class PlatformRef_ extends PlatformRef {
    private _injector;
    private _dispose;
    constructor(_injector: Injector, _dispose: () => void);
    registerDisposeListener(dispose: () => void): void;
    injector: Injector;
    application(providers: Array<Type | Provider | any[]>): ApplicationRef;
    asyncApplication(bindingFn: (zone: NgZone) => Promise<Array<Type | Provider | any[]>>, additionalProviders?: Array<Type | Provider | any[]>): Promise<ApplicationRef>;
    private _initApp(zone, providers);
    dispose(): void;
}
/**
 * A reference to an Angular application running on a page.
 *
 * For more about Angular applications, see the documentation for {@link bootstrap}.
 */
export declare abstract class ApplicationRef {
    /**
     * Register a listener to be called each time `bootstrap()` is called to bootstrap
     * a new root component.
     */
    abstract registerBootstrapListener(listener: (ref: ComponentRef) => void): void;
    /**
     * Register a listener to be called when the application is disposed.
     */
    abstract registerDisposeListener(dispose: () => void): void;
    /**
     * Bootstrap a new component at the root level of the application.
     *
     * ### Bootstrap process
     *
     * When bootstrapping a new root component into an application, Angular mounts the
     * specified application component onto DOM elements identified by the [componentType]'s
     * selector and kicks off automatic change detection to finish initializing the component.
     *
     * ### Optional Providers
     *
     * Providers for the given component can optionally be overridden via the `providers`
     * parameter. These providers will only apply for the root component being added and any
     * child components under it.
     *
     * ### Example
     * {@example core/ts/platform/platform.ts region='longform'}
     */
    abstract bootstrap(componentType: Type, providers?: Array<Type | Provider | any[]>): Promise<ComponentRef>;
    /**
     * Retrieve the application {@link Injector}.
     */
    injector: Injector;
    /**
     * Retrieve the application {@link NgZone}.
     */
    zone: NgZone;
    /**
     * Dispose of this application and all of its components.
     */
    abstract dispose(): void;
    /**
     * Invoke this method to explicitly process change detection and its side-effects.
     *
     * In development mode, `tick()` also performs a second change detection cycle to ensure that no
     * further changes are detected. If additional changes are picked up during this second cycle,
     * bindings in the app have side-effects that cannot be resolved in a single change detection
     * pass.
     * In this case, Angular throws an error, since an Angular application can only have one change
     * detection pass during which all change detection must complete.
     */
    abstract tick(): void;
    /**
     * Get a list of component types registered to this application.
     */
    componentTypes: Type[];
}
export declare class ApplicationRef_ extends ApplicationRef {
    private _platform;
    private _zone;
    private _injector;
    constructor(_platform: PlatformRef_, _zone: NgZone, _injector: Injector);
    registerBootstrapListener(listener: (ref: ComponentRef) => void): void;
    registerDisposeListener(dispose: () => void): void;
    registerChangeDetector(changeDetector: ChangeDetectorRef): void;
    unregisterChangeDetector(changeDetector: ChangeDetectorRef): void;
    bootstrap(componentType: Type, providers?: Array<Type | Provider | any[]>): Promise<ComponentRef>;
    injector: Injector;
    zone: NgZone;
    tick(): void;
    dispose(): void;
    componentTypes: any[];
}
