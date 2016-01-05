import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { isPresent, assertionsEnabled, print, IS_DART } from 'angular2/src/facade/lang';
import { provide, Injector } from 'angular2/src/core/di';
import { APP_COMPONENT_REF_PROMISE, APP_COMPONENT, PLATFORM_INITIALIZER, APP_INITIALIZER } from './application_tokens';
import { PromiseWrapper, ObservableWrapper } from 'angular2/src/facade/async';
import { ListWrapper } from 'angular2/src/facade/collection';
import { TestabilityRegistry, Testability } from 'angular2/src/core/testability/testability';
import { DynamicComponentLoader } from 'angular2/src/core/linker/dynamic_component_loader';
import { BaseException, ExceptionHandler, unimplemented } from 'angular2/src/facade/exceptions';
import { internalView } from 'angular2/src/core/linker/view_ref';
import { Console } from 'angular2/src/core/console';
import { wtfLeave, wtfCreateScope } from './profile/profile';
import { lockMode } from 'angular2/src/facade/lang';
/**
 * Construct providers specific to an individual root component.
 */
function _componentProviders(appComponentType) {
    return [
        provide(APP_COMPONENT, { useValue: appComponentType }),
        provide(APP_COMPONENT_REF_PROMISE, {
            useFactory: (dynamicComponentLoader, appRef, injector) => {
                // Save the ComponentRef for disposal later.
                var ref;
                // TODO(rado): investigate whether to support providers on root component.
                return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector, () => { appRef._unloadComponent(ref); })
                    .then((componentRef) => {
                    ref = componentRef;
                    if (isPresent(componentRef.location.nativeElement)) {
                        injector.get(TestabilityRegistry)
                            .registerApplication(componentRef.location.nativeElement, injector.get(Testability));
                    }
                    return componentRef;
                });
            },
            deps: [DynamicComponentLoader, ApplicationRef, Injector]
        }),
        provide(appComponentType, {
            useFactory: (p) => p.then(ref => ref.instance),
            deps: [APP_COMPONENT_REF_PROMISE]
        }),
    ];
}
/**
 * Create an Angular zone.
 */
export function createNgZone() {
    return new NgZone({ enableLongStackTrace: assertionsEnabled() });
}
var _platform;
var _platformProviders;
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
export function platform(providers) {
    lockMode();
    if (isPresent(_platform)) {
        if (ListWrapper.equals(_platformProviders, providers)) {
            return _platform;
        }
        else {
            throw new BaseException("platform cannot be initialized with different sets of providers.");
        }
    }
    else {
        return _createPlatform(providers);
    }
}
/**
 * Dispose the existing platform.
 */
export function disposePlatform() {
    if (isPresent(_platform)) {
        _platform.dispose();
        _platform = null;
    }
}
function _createPlatform(providers) {
    _platformProviders = providers;
    let injector = Injector.resolveAndCreate(providers);
    _platform = new PlatformRef_(injector, () => {
        _platform = null;
        _platformProviders = null;
    });
    _runPlatformInitializers(injector);
    return _platform;
}
function _runPlatformInitializers(injector) {
    let inits = injector.getOptional(PLATFORM_INITIALIZER);
    if (isPresent(inits))
        inits.forEach(init => init());
}
/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
 * explicitly by calling {@link platform}().
 */
export class PlatformRef {
    /**
     * Retrieve the platform {@link Injector}, which is the parent injector for
     * every Angular application on the page and provides singleton providers.
     */
    get injector() { return unimplemented(); }
    ;
}
export class PlatformRef_ extends PlatformRef {
    constructor(_injector, _dispose) {
        super();
        this._injector = _injector;
        this._dispose = _dispose;
        /** @internal */
        this._applications = [];
        /** @internal */
        this._disposeListeners = [];
    }
    registerDisposeListener(dispose) { this._disposeListeners.push(dispose); }
    get injector() { return this._injector; }
    application(providers) {
        var app = this._initApp(createNgZone(), providers);
        return app;
    }
    asyncApplication(bindingFn, additionalProviders) {
        var zone = createNgZone();
        var completer = PromiseWrapper.completer();
        zone.run(() => {
            PromiseWrapper.then(bindingFn(zone), (providers) => {
                if (isPresent(additionalProviders)) {
                    providers = ListWrapper.concat(providers, additionalProviders);
                }
                completer.resolve(this._initApp(zone, providers));
            });
        });
        return completer.promise;
    }
    _initApp(zone, providers) {
        var injector;
        var app;
        zone.run(() => {
            providers = ListWrapper.concat(providers, [
                provide(NgZone, { useValue: zone }),
                provide(ApplicationRef, { useFactory: () => app, deps: [] })
            ]);
            var exceptionHandler;
            try {
                injector = this.injector.resolveAndCreateChild(providers);
                exceptionHandler = injector.get(ExceptionHandler);
                zone.overrideOnErrorHandler((e, s) => exceptionHandler.call(e, s));
            }
            catch (e) {
                if (isPresent(exceptionHandler)) {
                    exceptionHandler.call(e, e.stack);
                }
                else {
                    print(e.toString());
                }
            }
        });
        app = new ApplicationRef_(this, zone, injector);
        this._applications.push(app);
        _runAppInitializers(injector);
        return app;
    }
    dispose() {
        ListWrapper.clone(this._applications).forEach((app) => app.dispose());
        this._disposeListeners.forEach((dispose) => dispose());
        this._dispose();
    }
    /** @internal */
    _applicationDisposed(app) { ListWrapper.remove(this._applications, app); }
}
function _runAppInitializers(injector) {
    let inits = injector.getOptional(APP_INITIALIZER);
    if (isPresent(inits))
        inits.forEach(init => init());
}
/**
 * A reference to an Angular application running on a page.
 *
 * For more about Angular applications, see the documentation for {@link bootstrap}.
 */
export class ApplicationRef {
    /**
     * Retrieve the application {@link Injector}.
     */
    get injector() { return unimplemented(); }
    ;
    /**
     * Retrieve the application {@link NgZone}.
     */
    get zone() { return unimplemented(); }
    ;
    /**
     * Get a list of component types registered to this application.
     */
    get componentTypes() { return unimplemented(); }
    ;
}
export class ApplicationRef_ extends ApplicationRef {
    constructor(_platform, _zone, _injector) {
        super();
        this._platform = _platform;
        this._zone = _zone;
        this._injector = _injector;
        /** @internal */
        this._bootstrapListeners = [];
        /** @internal */
        this._disposeListeners = [];
        /** @internal */
        this._rootComponents = [];
        /** @internal */
        this._rootComponentTypes = [];
        /** @internal */
        this._changeDetectorRefs = [];
        /** @internal */
        this._runningTick = false;
        /** @internal */
        this._enforceNoNewChanges = false;
        if (isPresent(this._zone)) {
            ObservableWrapper.subscribe(this._zone.onTurnDone, (_) => { this._zone.run(() => { this.tick(); }); });
        }
        this._enforceNoNewChanges = assertionsEnabled();
    }
    registerBootstrapListener(listener) {
        this._bootstrapListeners.push(listener);
    }
    registerDisposeListener(dispose) { this._disposeListeners.push(dispose); }
    registerChangeDetector(changeDetector) {
        this._changeDetectorRefs.push(changeDetector);
    }
    unregisterChangeDetector(changeDetector) {
        ListWrapper.remove(this._changeDetectorRefs, changeDetector);
    }
    bootstrap(componentType, providers) {
        var completer = PromiseWrapper.completer();
        this._zone.run(() => {
            var componentProviders = _componentProviders(componentType);
            if (isPresent(providers)) {
                componentProviders.push(providers);
            }
            var exceptionHandler = this._injector.get(ExceptionHandler);
            this._rootComponentTypes.push(componentType);
            try {
                var injector = this._injector.resolveAndCreateChild(componentProviders);
                var compRefToken = injector.get(APP_COMPONENT_REF_PROMISE);
                var tick = (componentRef) => {
                    this._loadComponent(componentRef);
                    completer.resolve(componentRef);
                };
                var tickResult = PromiseWrapper.then(compRefToken, tick);
                // THIS MUST ONLY RUN IN DART.
                // This is required to report an error when no components with a matching selector found.
                // Otherwise the promise will never be completed.
                // Doing this in JS causes an extra error message to appear.
                if (IS_DART) {
                    PromiseWrapper.then(tickResult, (_) => { });
                }
                PromiseWrapper.then(tickResult, null, (err, stackTrace) => completer.reject(err, stackTrace));
            }
            catch (e) {
                exceptionHandler.call(e, e.stack);
                completer.reject(e, e.stack);
            }
        });
        return completer.promise.then(_ => {
            let c = this._injector.get(Console);
            let modeDescription = assertionsEnabled() ?
                "in the development mode. Call enableProdMode() to enable the production mode." :
                "in the production mode. Call enableDevMode() to enable the development mode.";
            c.log(`Angular 2 is running ${modeDescription}`);
            return _;
        });
    }
    /** @internal */
    _loadComponent(ref) {
        var appChangeDetector = internalView(ref.hostView).changeDetector;
        this._changeDetectorRefs.push(appChangeDetector.ref);
        this.tick();
        this._rootComponents.push(ref);
        this._bootstrapListeners.forEach((listener) => listener(ref));
    }
    /** @internal */
    _unloadComponent(ref) {
        if (!ListWrapper.contains(this._rootComponents, ref)) {
            return;
        }
        this.unregisterChangeDetector(internalView(ref.hostView).changeDetector.ref);
        ListWrapper.remove(this._rootComponents, ref);
    }
    get injector() { return this._injector; }
    get zone() { return this._zone; }
    tick() {
        if (this._runningTick) {
            throw new BaseException("ApplicationRef.tick is called recursively");
        }
        var s = ApplicationRef_._tickScope();
        try {
            this._runningTick = true;
            this._changeDetectorRefs.forEach((detector) => detector.detectChanges());
            if (this._enforceNoNewChanges) {
                this._changeDetectorRefs.forEach((detector) => detector.checkNoChanges());
            }
        }
        finally {
            this._runningTick = false;
            wtfLeave(s);
        }
    }
    dispose() {
        // TODO(alxhub): Dispose of the NgZone.
        ListWrapper.clone(this._rootComponents).forEach((ref) => ref.dispose());
        this._disposeListeners.forEach((dispose) => dispose());
        this._platform._applicationDisposed(this);
    }
    get componentTypes() { return this._rootComponentTypes; }
}
/** @internal */
ApplicationRef_._tickScope = wtfCreateScope('ApplicationRef#tick()');
