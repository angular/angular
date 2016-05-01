var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { isBlank, isPresent, assertionsEnabled, lockMode, isPromise } from 'angular2/src/facade/lang';
import { Injector, Injectable } from 'angular2/src/core/di';
import { PLATFORM_INITIALIZER, APP_INITIALIZER } from './application_tokens';
import { PromiseWrapper, ObservableWrapper } from 'angular2/src/facade/async';
import { ListWrapper } from 'angular2/src/facade/collection';
import { TestabilityRegistry, Testability } from 'angular2/src/core/testability/testability';
import { ComponentResolver } from 'angular2/src/core/linker/component_resolver';
import { BaseException, ExceptionHandler, unimplemented } from 'angular2/src/facade/exceptions';
import { Console } from 'angular2/src/core/console';
import { wtfLeave, wtfCreateScope } from './profile/profile';
/**
 * Create an Angular zone.
 */
export function createNgZone() {
    return new NgZone({ enableLongStackTrace: assertionsEnabled() });
}
var _platform;
var _inPlatformCreate = false;
/**
 * Creates a platform.
 * Platforms have to be eagerly created via this function.
 */
export function createPlatform(injector) {
    if (_inPlatformCreate) {
        throw new BaseException('Already creating a platform...');
    }
    if (isPresent(_platform) && !_platform.disposed) {
        throw new BaseException("There can be only one platform. Destroy the previous one to create a new one.");
    }
    lockMode();
    _inPlatformCreate = true;
    try {
        _platform = injector.get(PlatformRef);
    }
    finally {
        _inPlatformCreate = false;
    }
    return _platform;
}
/**
 * Checks that there currently is a platform
 * which contains the given token as a provider.
 */
export function assertPlatform(requiredToken) {
    var platform = getPlatform();
    if (isBlank(platform)) {
        throw new BaseException('Not platform exists!');
    }
    if (isPresent(platform) && isBlank(platform.injector.get(requiredToken, null))) {
        throw new BaseException('A platform with a different configuration has been created. Please destroy it first.');
    }
    return platform;
}
/**
 * Dispose the existing platform.
 */
export function disposePlatform() {
    if (isPresent(_platform) && !_platform.disposed) {
        _platform.dispose();
    }
}
/**
 * Returns the current platform.
 */
export function getPlatform() {
    return isPresent(_platform) && !_platform.disposed ? _platform : null;
}
/**
 * Shortcut for ApplicationRef.bootstrap.
 * Requires a platform the be created first.
 */
export function coreBootstrap(injector, componentFactory) {
    var appRef = injector.get(ApplicationRef);
    return appRef.bootstrap(componentFactory);
}
/**
 * Resolves the componentFactory for the given component,
 * waits for asynchronous initializers and bootstraps the component.
 * Requires a platform the be created first.
 */
export function coreLoadAndBootstrap(injector, componentType) {
    var appRef = injector.get(ApplicationRef);
    return appRef.run(() => {
        var componentResolver = injector.get(ComponentResolver);
        return PromiseWrapper
            .all([componentResolver.resolveComponent(componentType), appRef.waitForAsyncInitializers()])
            .then((arr) => appRef.bootstrap(arr[0]));
    });
}
/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
 * explicitly by calling {@link createPlatform}().
 */
export class PlatformRef {
    /**
     * Retrieve the platform {@link Injector}, which is the parent injector for
     * every Angular application on the page and provides singleton providers.
     */
    get injector() { throw unimplemented(); }
    ;
    get disposed() { throw unimplemented(); }
}
export let PlatformRef_ = class PlatformRef_ extends PlatformRef {
    constructor(_injector) {
        super();
        this._injector = _injector;
        /** @internal */
        this._applications = [];
        /** @internal */
        this._disposeListeners = [];
        this._disposed = false;
        if (!_inPlatformCreate) {
            throw new BaseException('Platforms have to be created via `createPlatform`!');
        }
        let inits = _injector.get(PLATFORM_INITIALIZER, null);
        if (isPresent(inits))
            inits.forEach(init => init());
    }
    registerDisposeListener(dispose) { this._disposeListeners.push(dispose); }
    get injector() { return this._injector; }
    get disposed() { return this._disposed; }
    addApplication(appRef) { this._applications.push(appRef); }
    dispose() {
        ListWrapper.clone(this._applications).forEach((app) => app.dispose());
        this._disposeListeners.forEach((dispose) => dispose());
        this._disposed = true;
    }
    /** @internal */
    _applicationDisposed(app) { ListWrapper.remove(this._applications, app); }
};
PlatformRef_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Injector])
], PlatformRef_);
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
let ApplicationRef_1;
export let ApplicationRef_ = ApplicationRef_1 = class ApplicationRef_ extends ApplicationRef {
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
        var zone = _injector.get(NgZone);
        this._enforceNoNewChanges = assertionsEnabled();
        zone.run(() => { this._exceptionHandler = _injector.get(ExceptionHandler); });
        this._asyncInitDonePromise = this.run(() => {
            let inits = _injector.get(APP_INITIALIZER, null);
            var asyncInitResults = [];
            var asyncInitDonePromise;
            if (isPresent(inits)) {
                for (var i = 0; i < inits.length; i++) {
                    var initResult = inits[i]();
                    if (isPromise(initResult)) {
                        asyncInitResults.push(initResult);
                    }
                }
            }
            if (asyncInitResults.length > 0) {
                asyncInitDonePromise =
                    PromiseWrapper.all(asyncInitResults).then((_) => this._asyncInitDone = true);
                this._asyncInitDone = false;
            }
            else {
                this._asyncInitDone = true;
                asyncInitDonePromise = PromiseWrapper.resolve(true);
            }
            return asyncInitDonePromise;
        });
        ObservableWrapper.subscribe(zone.onError, (error) => {
            this._exceptionHandler.call(error.error, error.stackTrace);
        });
        ObservableWrapper.subscribe(this._zone.onMicrotaskEmpty, (_) => { this._zone.run(() => { this.tick(); }); });
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
    waitForAsyncInitializers() { return this._asyncInitDonePromise; }
    run(callback) {
        var zone = this.injector.get(NgZone);
        var result;
        // Note: Don't use zone.runGuarded as we want to know about
        // the thrown exception!
        // Note: the completer needs to be created outside
        // of `zone.run` as Dart swallows rejected promises
        // via the onError callback of the promise.
        var completer = PromiseWrapper.completer();
        zone.run(() => {
            try {
                result = callback();
                if (isPromise(result)) {
                    PromiseWrapper.then(result, (ref) => { completer.resolve(ref); }, (err, stackTrace) => {
                        completer.reject(err, stackTrace);
                        this._exceptionHandler.call(err, stackTrace);
                    });
                }
            }
            catch (e) {
                this._exceptionHandler.call(e, e.stack);
                throw e;
            }
        });
        return isPromise(result) ? completer.promise : result;
    }
    bootstrap(componentFactory) {
        if (!this._asyncInitDone) {
            throw new BaseException('Cannot bootstrap as there are still asynchronous initializers running. Wait for them using waitForAsyncInitializers().');
        }
        return this.run(() => {
            this._rootComponentTypes.push(componentFactory.componentType);
            var compRef = componentFactory.create(this._injector, [], componentFactory.selector);
            compRef.onDestroy(() => { this._unloadComponent(compRef); });
            var testability = compRef.injector.get(Testability, null);
            if (isPresent(testability)) {
                compRef.injector.get(TestabilityRegistry)
                    .registerApplication(compRef.location.nativeElement, testability);
            }
            this._loadComponent(compRef);
            let c = this._injector.get(Console);
            if (assertionsEnabled()) {
                c.log("Angular 2 is running in the development mode. Call enableProdMode() to enable the production mode.");
            }
            return compRef;
        });
    }
    /** @internal */
    _loadComponent(componentRef) {
        this._changeDetectorRefs.push(componentRef.changeDetectorRef);
        this.tick();
        this._rootComponents.push(componentRef);
        this._bootstrapListeners.forEach((listener) => listener(componentRef));
    }
    /** @internal */
    _unloadComponent(componentRef) {
        if (!ListWrapper.contains(this._rootComponents, componentRef)) {
            return;
        }
        this.unregisterChangeDetector(componentRef.changeDetectorRef);
        ListWrapper.remove(this._rootComponents, componentRef);
    }
    get injector() { return this._injector; }
    get zone() { return this._zone; }
    tick() {
        if (this._runningTick) {
            throw new BaseException("ApplicationRef.tick is called recursively");
        }
        var s = ApplicationRef_1._tickScope();
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
        ListWrapper.clone(this._rootComponents).forEach((ref) => ref.destroy());
        this._disposeListeners.forEach((dispose) => dispose());
        this._platform._applicationDisposed(this);
    }
    get componentTypes() { return this._rootComponentTypes; }
};
/** @internal */
ApplicationRef_._tickScope = wtfCreateScope('ApplicationRef#tick()');
ApplicationRef_ = ApplicationRef_1 = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [PlatformRef_, NgZone, Injector])
], ApplicationRef_);
/**
 * @internal
 */
export const PLATFORM_CORE_PROVIDERS = 
/*@ts2dart_const*/ [
    PlatformRef_,
    /*@ts2dart_const*/ (
    /* @ts2dart_Provider */ { provide: PlatformRef, useExisting: PlatformRef_ })
];
/**
 * @internal
 */
export const APPLICATION_CORE_PROVIDERS = [
    /* @ts2dart_Provider */ { provide: NgZone, useFactory: createNgZone, deps: [] },
    ApplicationRef_,
    /* @ts2dart_Provider */ { provide: ApplicationRef, useExisting: ApplicationRef_ }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsTUFBTSxFQUFjLE1BQU0sZ0NBQWdDO09BQzNELEVBRUwsT0FBTyxFQUNQLFNBQVMsRUFDVCxpQkFBaUIsRUFHakIsUUFBUSxFQUNSLFNBQVMsRUFDVixNQUFNLDBCQUEwQjtPQUMxQixFQUFvQixRQUFRLEVBQUUsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3JFLEVBQXlCLG9CQUFvQixFQUFFLGVBQWUsRUFBQyxNQUFNLHNCQUFzQjtPQUMzRixFQUFDLGNBQWMsRUFBb0IsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7T0FDdEYsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDbkQsRUFBQyxtQkFBbUIsRUFBRSxXQUFXLEVBQUMsTUFBTSwyQ0FBMkM7T0FDbkYsRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDZDQUE2QztPQUV0RSxFQUNMLGFBQWEsRUFFYixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNkLE1BQU0sZ0NBQWdDO09BQ2hDLEVBQUMsT0FBTyxFQUFDLE1BQU0sMkJBQTJCO09BQzFDLEVBQUMsUUFBUSxFQUFFLGNBQWMsRUFBYSxNQUFNLG1CQUFtQjtBQUd0RTs7R0FFRztBQUNIO0lBQ0UsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLEVBQUMsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsRUFBQyxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUVELElBQUksU0FBc0IsQ0FBQztBQUMzQixJQUFJLGlCQUFpQixHQUFZLEtBQUssQ0FBQztBQUV2Qzs7O0dBR0c7QUFDSCwrQkFBK0IsUUFBa0I7SUFDL0MsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sSUFBSSxhQUFhLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDaEQsTUFBTSxJQUFJLGFBQWEsQ0FDbkIsK0VBQStFLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBQ0QsUUFBUSxFQUFFLENBQUM7SUFDWCxpQkFBaUIsR0FBRyxJQUFJLENBQUM7SUFDekIsSUFBSSxDQUFDO1FBQ0gsU0FBUyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDeEMsQ0FBQztZQUFTLENBQUM7UUFDVCxpQkFBaUIsR0FBRyxLQUFLLENBQUM7SUFDNUIsQ0FBQztJQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbkIsQ0FBQztBQUVEOzs7R0FHRztBQUNILCtCQUErQixhQUFrQjtJQUMvQyxJQUFJLFFBQVEsR0FBRyxXQUFXLEVBQUUsQ0FBQztJQUM3QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sSUFBSSxhQUFhLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0UsTUFBTSxJQUFJLGFBQWEsQ0FDbkIsc0ZBQXNGLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNsQixDQUFDO0FBRUQ7O0dBRUc7QUFDSDtJQUNFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2hELFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN0QixDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0g7SUFDRSxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3hFLENBQUM7QUFFRDs7O0dBR0c7QUFDSCw4QkFBaUMsUUFBa0IsRUFDbEIsZ0JBQXFDO0lBQ3BFLElBQUksTUFBTSxHQUFtQixRQUFRLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzFELE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxxQ0FBcUMsUUFBa0IsRUFDbEIsYUFBbUI7SUFDdEQsSUFBSSxNQUFNLEdBQW1CLFFBQVEsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDMUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDaEIsSUFBSSxpQkFBaUIsR0FBc0IsUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzNFLE1BQU0sQ0FBQyxjQUFjO2FBQ2hCLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUM7YUFDM0YsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0g7SUFNRTs7O09BR0c7SUFDSCxJQUFJLFFBQVEsS0FBZSxNQUFNLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7SUFPbkQsSUFBSSxRQUFRLEtBQWMsTUFBTSxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQUdELHFEQUFrQyxXQUFXO0lBUTNDLFlBQW9CLFNBQW1CO1FBQ3JDLE9BQU8sQ0FBQztRQURVLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFQdkMsZ0JBQWdCO1FBQ2hCLGtCQUFhLEdBQXFCLEVBQUUsQ0FBQztRQUNyQyxnQkFBZ0I7UUFDaEIsc0JBQWlCLEdBQWUsRUFBRSxDQUFDO1FBRTNCLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFJakMsRUFBRSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDdkIsTUFBTSxJQUFJLGFBQWEsQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFDRCxJQUFJLEtBQUssR0FBMkIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5RSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxPQUFtQixJQUFVLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTVGLElBQUksUUFBUSxLQUFlLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUVuRCxJQUFJLFFBQVEsS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFFekMsY0FBYyxDQUFDLE1BQXNCLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTNFLE9BQU87UUFDTCxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sS0FBSyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsb0JBQW9CLENBQUMsR0FBbUIsSUFBVSxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xHLENBQUM7QUFsQ0Q7SUFBQyxVQUFVLEVBQUU7O2dCQUFBO0FBb0NiOzs7O0dBSUc7QUFDSDtJQXNDRTs7T0FFRztJQUNILElBQUksUUFBUSxLQUFlLE1BQU0sQ0FBVyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0lBRTlEOztPQUVHO0lBQ0gsSUFBSSxJQUFJLEtBQWEsTUFBTSxDQUFTLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7SUFtQnREOztPQUVHO0lBQ0gsSUFBSSxjQUFjLEtBQWEsTUFBTSxDQUFTLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFDbEUsQ0FBQztBQUdEOzhFQUFxQyxjQUFjO0lBd0JqRCxZQUFvQixTQUF1QixFQUFVLEtBQWEsRUFBVSxTQUFtQjtRQUM3RixPQUFPLENBQUM7UUFEVSxjQUFTLEdBQVQsU0FBUyxDQUFjO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFwQi9GLGdCQUFnQjtRQUNSLHdCQUFtQixHQUFlLEVBQUUsQ0FBQztRQUM3QyxnQkFBZ0I7UUFDUixzQkFBaUIsR0FBZSxFQUFFLENBQUM7UUFDM0MsZ0JBQWdCO1FBQ1Isb0JBQWUsR0FBd0IsRUFBRSxDQUFDO1FBQ2xELGdCQUFnQjtRQUNSLHdCQUFtQixHQUFXLEVBQUUsQ0FBQztRQUN6QyxnQkFBZ0I7UUFDUix3QkFBbUIsR0FBd0IsRUFBRSxDQUFDO1FBQ3RELGdCQUFnQjtRQUNSLGlCQUFZLEdBQVksS0FBSyxDQUFDO1FBQ3RDLGdCQUFnQjtRQUNSLHlCQUFvQixHQUFZLEtBQUssQ0FBQztRQVM1QyxJQUFJLElBQUksR0FBVyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxpQkFBaUIsRUFBRSxDQUFDO1FBQ2hELElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUUsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDcEMsSUFBSSxLQUFLLEdBQWUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0QsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7WUFDMUIsSUFBSSxvQkFBb0IsQ0FBQztZQUN6QixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDdEMsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQzVCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFCLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDcEMsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxvQkFBb0I7b0JBQ2hCLGNBQWMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDakYsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFDOUIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUMzQixvQkFBb0IsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RELENBQUM7WUFDRCxNQUFNLENBQUMsb0JBQW9CLENBQUM7UUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFDSCxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQWtCO1lBQzNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0QsQ0FBQyxDQUFDLENBQUM7UUFDSCxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFDM0IsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFRCx5QkFBeUIsQ0FBQyxRQUEwQztRQUNsRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxPQUFtQixJQUFVLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTVGLHNCQUFzQixDQUFDLGNBQWlDO1FBQ3RELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELHdCQUF3QixDQUFDLGNBQWlDO1FBQ3hELFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCx3QkFBd0IsS0FBbUIsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7SUFFL0UsR0FBRyxDQUFDLFFBQWtCO1FBQ3BCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLElBQUksTUFBTSxDQUFDO1FBQ1gsMkRBQTJEO1FBQzNELHdCQUF3QjtRQUN4QixrREFBa0Q7UUFDbEQsbURBQW1EO1FBQ25ELDJDQUEyQztRQUMzQyxJQUFJLFNBQVMsR0FBRyxjQUFjLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNQLElBQUksQ0FBQztnQkFDSCxNQUFNLEdBQUcsUUFBUSxFQUFFLENBQUM7Z0JBQ3BCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RCLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsVUFBVTt3QkFDaEYsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7d0JBQ2xDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUMvQyxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO1lBQ0gsQ0FBRTtZQUFBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLENBQUMsQ0FBQztZQUNWLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDeEQsQ0FBQztJQUVELFNBQVMsQ0FBSSxnQkFBcUM7UUFDaEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUN6QixNQUFNLElBQUksYUFBYSxDQUNuQix3SEFBd0gsQ0FBQyxDQUFDO1FBQ2hJLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNkLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDOUQsSUFBSSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JGLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RCxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7cUJBQ3BDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3hFLENBQUM7WUFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxHQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixDQUFDLENBQUMsR0FBRyxDQUNELG9HQUFvRyxDQUFDLENBQUM7WUFDNUcsQ0FBQztZQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLGNBQWMsQ0FBQyxZQUErQjtRQUM1QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixnQkFBZ0IsQ0FBQyxZQUErQjtRQUM5QyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUQsTUFBTSxDQUFDO1FBQ1QsQ0FBQztRQUNELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM5RCxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELElBQUksUUFBUSxLQUFlLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUVuRCxJQUFJLElBQUksS0FBYSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFekMsSUFBSTtRQUNGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sSUFBSSxhQUFhLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRUQsSUFBSSxDQUFDLEdBQUcsZ0JBQWUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUM7WUFDSCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFDNUUsQ0FBQztRQUNILENBQUM7Z0JBQVMsQ0FBQztZQUNULElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTztRQUNMLHVDQUF1QztRQUN2QyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDeEUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sS0FBSyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELElBQUksY0FBYyxLQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0FBQ25FLENBQUM7QUEzS0MsZ0JBQWdCO0FBQ1QsMEJBQVUsR0FBZSxjQUFjLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUgxRTtJQUFDLFVBQVUsRUFBRTs7bUJBQUE7QUErS2I7O0dBRUc7QUFDSCxPQUFPLE1BQU0sdUJBQXVCO0FBQ2hDLGtCQUFrQixDQUFBO0lBQ2hCLFlBQVk7SUFDWixrQkFBa0IsQ0FBQztJQUNmLHVCQUF1QixDQUFDLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFDLENBQUM7Q0FDL0UsQ0FBQztBQUVOOztHQUVHO0FBQ0gsT0FBTyxNQUFNLDBCQUEwQixHQUFxQjtJQUMxRCx1QkFBdUIsQ0FBQyxFQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDO0lBQzdFLGVBQWU7SUFDZix1QkFBdUIsQ0FBQyxFQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBQztDQUNoRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ1pvbmUsIE5nWm9uZUVycm9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuaW1wb3J0IHtcbiAgVHlwZSxcbiAgaXNCbGFuayxcbiAgaXNQcmVzZW50LFxuICBhc3NlcnRpb25zRW5hYmxlZCxcbiAgcHJpbnQsXG4gIElTX0RBUlQsXG4gIGxvY2tNb2RlLFxuICBpc1Byb21pc2Vcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7cHJvdmlkZSwgUHJvdmlkZXIsIEluamVjdG9yLCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0FQUF9JRF9SQU5ET01fUFJPVklERVIsIFBMQVRGT1JNX0lOSVRJQUxJWkVSLCBBUFBfSU5JVElBTElaRVJ9IGZyb20gJy4vYXBwbGljYXRpb25fdG9rZW5zJztcbmltcG9ydCB7UHJvbWlzZVdyYXBwZXIsIFByb21pc2VDb21wbGV0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1Rlc3RhYmlsaXR5UmVnaXN0cnksIFRlc3RhYmlsaXR5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS90ZXN0YWJpbGl0eS90ZXN0YWJpbGl0eSc7XG5pbXBvcnQge0NvbXBvbmVudFJlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X3Jlc29sdmVyJztcbmltcG9ydCB7Q29tcG9uZW50UmVmLCBDb21wb25lbnRGYWN0b3J5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnknO1xuaW1wb3J0IHtcbiAgQmFzZUV4Y2VwdGlvbixcbiAgV3JhcHBlZEV4Y2VwdGlvbixcbiAgRXhjZXB0aW9uSGFuZGxlcixcbiAgdW5pbXBsZW1lbnRlZFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtDb25zb2xlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jb25zb2xlJztcbmltcG9ydCB7d3RmTGVhdmUsIHd0ZkNyZWF0ZVNjb3BlLCBXdGZTY29wZUZufSBmcm9tICcuL3Byb2ZpbGUvcHJvZmlsZSc7XG5pbXBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBBbmd1bGFyIHpvbmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOZ1pvbmUoKTogTmdab25lIHtcbiAgcmV0dXJuIG5ldyBOZ1pvbmUoe2VuYWJsZUxvbmdTdGFja1RyYWNlOiBhc3NlcnRpb25zRW5hYmxlZCgpfSk7XG59XG5cbnZhciBfcGxhdGZvcm06IFBsYXRmb3JtUmVmO1xudmFyIF9pblBsYXRmb3JtQ3JlYXRlOiBib29sZWFuID0gZmFsc2U7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHBsYXRmb3JtLlxuICogUGxhdGZvcm1zIGhhdmUgdG8gYmUgZWFnZXJseSBjcmVhdGVkIHZpYSB0aGlzIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGxhdGZvcm0oaW5qZWN0b3I6IEluamVjdG9yKTogUGxhdGZvcm1SZWYge1xuICBpZiAoX2luUGxhdGZvcm1DcmVhdGUpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQWxyZWFkeSBjcmVhdGluZyBhIHBsYXRmb3JtLi4uJyk7XG4gIH1cbiAgaWYgKGlzUHJlc2VudChfcGxhdGZvcm0pICYmICFfcGxhdGZvcm0uZGlzcG9zZWQpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgXCJUaGVyZSBjYW4gYmUgb25seSBvbmUgcGxhdGZvcm0uIERlc3Ryb3kgdGhlIHByZXZpb3VzIG9uZSB0byBjcmVhdGUgYSBuZXcgb25lLlwiKTtcbiAgfVxuICBsb2NrTW9kZSgpO1xuICBfaW5QbGF0Zm9ybUNyZWF0ZSA9IHRydWU7XG4gIHRyeSB7XG4gICAgX3BsYXRmb3JtID0gaW5qZWN0b3IuZ2V0KFBsYXRmb3JtUmVmKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBfaW5QbGF0Zm9ybUNyZWF0ZSA9IGZhbHNlO1xuICB9XG4gIHJldHVybiBfcGxhdGZvcm07XG59XG5cbi8qKlxuICogQ2hlY2tzIHRoYXQgdGhlcmUgY3VycmVudGx5IGlzIGEgcGxhdGZvcm1cbiAqIHdoaWNoIGNvbnRhaW5zIHRoZSBnaXZlbiB0b2tlbiBhcyBhIHByb3ZpZGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0UGxhdGZvcm0ocmVxdWlyZWRUb2tlbjogYW55KTogUGxhdGZvcm1SZWYge1xuICB2YXIgcGxhdGZvcm0gPSBnZXRQbGF0Zm9ybSgpO1xuICBpZiAoaXNCbGFuayhwbGF0Zm9ybSkpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignTm90IHBsYXRmb3JtIGV4aXN0cyEnKTtcbiAgfVxuICBpZiAoaXNQcmVzZW50KHBsYXRmb3JtKSAmJiBpc0JsYW5rKHBsYXRmb3JtLmluamVjdG9yLmdldChyZXF1aXJlZFRva2VuLCBudWxsKSkpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgJ0EgcGxhdGZvcm0gd2l0aCBhIGRpZmZlcmVudCBjb25maWd1cmF0aW9uIGhhcyBiZWVuIGNyZWF0ZWQuIFBsZWFzZSBkZXN0cm95IGl0IGZpcnN0LicpO1xuICB9XG4gIHJldHVybiBwbGF0Zm9ybTtcbn1cblxuLyoqXG4gKiBEaXNwb3NlIHRoZSBleGlzdGluZyBwbGF0Zm9ybS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3Bvc2VQbGF0Zm9ybSgpOiB2b2lkIHtcbiAgaWYgKGlzUHJlc2VudChfcGxhdGZvcm0pICYmICFfcGxhdGZvcm0uZGlzcG9zZWQpIHtcbiAgICBfcGxhdGZvcm0uZGlzcG9zZSgpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudCBwbGF0Zm9ybS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBsYXRmb3JtKCk6IFBsYXRmb3JtUmVmIHtcbiAgcmV0dXJuIGlzUHJlc2VudChfcGxhdGZvcm0pICYmICFfcGxhdGZvcm0uZGlzcG9zZWQgPyBfcGxhdGZvcm0gOiBudWxsO1xufVxuXG4vKipcbiAqIFNob3J0Y3V0IGZvciBBcHBsaWNhdGlvblJlZi5ib290c3RyYXAuXG4gKiBSZXF1aXJlcyBhIHBsYXRmb3JtIHRoZSBiZSBjcmVhdGVkIGZpcnN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29yZUJvb3RzdHJhcDxDPihpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PEM+KTogQ29tcG9uZW50UmVmPEM+IHtcbiAgdmFyIGFwcFJlZjogQXBwbGljYXRpb25SZWYgPSBpbmplY3Rvci5nZXQoQXBwbGljYXRpb25SZWYpO1xuICByZXR1cm4gYXBwUmVmLmJvb3RzdHJhcChjb21wb25lbnRGYWN0b3J5KTtcbn1cblxuLyoqXG4gKiBSZXNvbHZlcyB0aGUgY29tcG9uZW50RmFjdG9yeSBmb3IgdGhlIGdpdmVuIGNvbXBvbmVudCxcbiAqIHdhaXRzIGZvciBhc3luY2hyb25vdXMgaW5pdGlhbGl6ZXJzIGFuZCBib290c3RyYXBzIHRoZSBjb21wb25lbnQuXG4gKiBSZXF1aXJlcyBhIHBsYXRmb3JtIHRoZSBiZSBjcmVhdGVkIGZpcnN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29yZUxvYWRBbmRCb290c3RyYXAoaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGU6IFR5cGUpOiBQcm9taXNlPENvbXBvbmVudFJlZjxhbnk+PiB7XG4gIHZhciBhcHBSZWY6IEFwcGxpY2F0aW9uUmVmID0gaW5qZWN0b3IuZ2V0KEFwcGxpY2F0aW9uUmVmKTtcbiAgcmV0dXJuIGFwcFJlZi5ydW4oKCkgPT4ge1xuICAgIHZhciBjb21wb25lbnRSZXNvbHZlcjogQ29tcG9uZW50UmVzb2x2ZXIgPSBpbmplY3Rvci5nZXQoQ29tcG9uZW50UmVzb2x2ZXIpO1xuICAgIHJldHVybiBQcm9taXNlV3JhcHBlclxuICAgICAgICAuYWxsKFtjb21wb25lbnRSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50KGNvbXBvbmVudFR5cGUpLCBhcHBSZWYud2FpdEZvckFzeW5jSW5pdGlhbGl6ZXJzKCldKVxuICAgICAgICAudGhlbigoYXJyKSA9PiBhcHBSZWYuYm9vdHN0cmFwKGFyclswXSkpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaGUgQW5ndWxhciBwbGF0Zm9ybSBpcyB0aGUgZW50cnkgcG9pbnQgZm9yIEFuZ3VsYXIgb24gYSB3ZWIgcGFnZS4gRWFjaCBwYWdlXG4gKiBoYXMgZXhhY3RseSBvbmUgcGxhdGZvcm0sIGFuZCBzZXJ2aWNlcyAoc3VjaCBhcyByZWZsZWN0aW9uKSB3aGljaCBhcmUgY29tbW9uXG4gKiB0byBldmVyeSBBbmd1bGFyIGFwcGxpY2F0aW9uIHJ1bm5pbmcgb24gdGhlIHBhZ2UgYXJlIGJvdW5kIGluIGl0cyBzY29wZS5cbiAqXG4gKiBBIHBhZ2UncyBwbGF0Zm9ybSBpcyBpbml0aWFsaXplZCBpbXBsaWNpdGx5IHdoZW4ge0BsaW5rIGJvb3RzdHJhcH0oKSBpcyBjYWxsZWQsIG9yXG4gKiBleHBsaWNpdGx5IGJ5IGNhbGxpbmcge0BsaW5rIGNyZWF0ZVBsYXRmb3JtfSgpLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUGxhdGZvcm1SZWYge1xuICAvKipcbiAgICogUmVnaXN0ZXIgYSBsaXN0ZW5lciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgcGxhdGZvcm0gaXMgZGlzcG9zZWQuXG4gICAqL1xuICBhYnN0cmFjdCByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZDtcblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIHBsYXRmb3JtIHtAbGluayBJbmplY3Rvcn0sIHdoaWNoIGlzIHRoZSBwYXJlbnQgaW5qZWN0b3IgZm9yXG4gICAqIGV2ZXJ5IEFuZ3VsYXIgYXBwbGljYXRpb24gb24gdGhlIHBhZ2UgYW5kIHByb3ZpZGVzIHNpbmdsZXRvbiBwcm92aWRlcnMuXG4gICAqL1xuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyB0aHJvdyB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIEFuZ3VsYXIgcGxhdGZvcm0gYW5kIGFsbCBBbmd1bGFyIGFwcGxpY2F0aW9ucyBvbiB0aGUgcGFnZS5cbiAgICovXG4gIGFic3RyYWN0IGRpc3Bvc2UoKTogdm9pZDtcblxuICBnZXQgZGlzcG9zZWQoKTogYm9vbGVhbiB7IHRocm93IHVuaW1wbGVtZW50ZWQoKTsgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGxhdGZvcm1SZWZfIGV4dGVuZHMgUGxhdGZvcm1SZWYge1xuICAvKiogQGludGVybmFsICovXG4gIF9hcHBsaWNhdGlvbnM6IEFwcGxpY2F0aW9uUmVmW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGlzcG9zZUxpc3RlbmVyczogRnVuY3Rpb25bXSA9IFtdO1xuXG4gIHByaXZhdGUgX2Rpc3Bvc2VkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoIV9pblBsYXRmb3JtQ3JlYXRlKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignUGxhdGZvcm1zIGhhdmUgdG8gYmUgY3JlYXRlZCB2aWEgYGNyZWF0ZVBsYXRmb3JtYCEnKTtcbiAgICB9XG4gICAgbGV0IGluaXRzOiBGdW5jdGlvbltdID0gPEZ1bmN0aW9uW10+X2luamVjdG9yLmdldChQTEFURk9STV9JTklUSUFMSVpFUiwgbnVsbCk7XG4gICAgaWYgKGlzUHJlc2VudChpbml0cykpIGluaXRzLmZvckVhY2goaW5pdCA9PiBpbml0KCkpO1xuICB9XG5cbiAgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLnB1c2goZGlzcG9zZSk7IH1cblxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5faW5qZWN0b3I7IH1cblxuICBnZXQgZGlzcG9zZWQoKSB7IHJldHVybiB0aGlzLl9kaXNwb3NlZDsgfVxuXG4gIGFkZEFwcGxpY2F0aW9uKGFwcFJlZjogQXBwbGljYXRpb25SZWYpIHsgdGhpcy5fYXBwbGljYXRpb25zLnB1c2goYXBwUmVmKTsgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIuY2xvbmUodGhpcy5fYXBwbGljYXRpb25zKS5mb3JFYWNoKChhcHApID0+IGFwcC5kaXNwb3NlKCkpO1xuICAgIHRoaXMuX2Rpc3Bvc2VMaXN0ZW5lcnMuZm9yRWFjaCgoZGlzcG9zZSkgPT4gZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlZCA9IHRydWU7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hcHBsaWNhdGlvbkRpc3Bvc2VkKGFwcDogQXBwbGljYXRpb25SZWYpOiB2b2lkIHsgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuX2FwcGxpY2F0aW9ucywgYXBwKTsgfVxufVxuXG4vKipcbiAqIEEgcmVmZXJlbmNlIHRvIGFuIEFuZ3VsYXIgYXBwbGljYXRpb24gcnVubmluZyBvbiBhIHBhZ2UuXG4gKlxuICogRm9yIG1vcmUgYWJvdXQgQW5ndWxhciBhcHBsaWNhdGlvbnMsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3Ige0BsaW5rIGJvb3RzdHJhcH0uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBcHBsaWNhdGlvblJlZiB7XG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCBlYWNoIHRpbWUgYGJvb3RzdHJhcCgpYCBpcyBjYWxsZWQgdG8gYm9vdHN0cmFwXG4gICAqIGEgbmV3IHJvb3QgY29tcG9uZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgcmVnaXN0ZXJCb290c3RyYXBMaXN0ZW5lcihsaXN0ZW5lcjogKHJlZjogQ29tcG9uZW50UmVmPGFueT4pID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhcHBsaWNhdGlvbiBpcyBkaXNwb3NlZC5cbiAgICovXG4gIGFic3RyYWN0IHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYWxsIGFzeW5jaHJvbm91cyBhcHBsaWNhdGlvbiBpbml0aWFsaXplcnNcbiAgICogYXJlIGRvbmUuXG4gICAqL1xuICBhYnN0cmFjdCB3YWl0Rm9yQXN5bmNJbml0aWFsaXplcnMoKTogUHJvbWlzZTxhbnk+O1xuXG4gIC8qKlxuICAgKiBSdW5zIHRoZSBnaXZlbiBjYWxsYmFjayBpbiB0aGUgem9uZSBhbmQgcmV0dXJucyB0aGUgcmVzdWx0IG9mIHRoZSBjYWxsYmFjay5cbiAgICogRXhjZXB0aW9ucyB3aWxsIGJlIGZvcndhcmRlZCB0byB0aGUgRXhjZXB0aW9uSGFuZGxlciBhbmQgcmV0aHJvd24uXG4gICAqL1xuICBhYnN0cmFjdCBydW4oY2FsbGJhY2s6IEZ1bmN0aW9uKTogYW55O1xuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYSBuZXcgY29tcG9uZW50IGF0IHRoZSByb290IGxldmVsIG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogIyMjIEJvb3RzdHJhcCBwcm9jZXNzXG4gICAqXG4gICAqIFdoZW4gYm9vdHN0cmFwcGluZyBhIG5ldyByb290IGNvbXBvbmVudCBpbnRvIGFuIGFwcGxpY2F0aW9uLCBBbmd1bGFyIG1vdW50cyB0aGVcbiAgICogc3BlY2lmaWVkIGFwcGxpY2F0aW9uIGNvbXBvbmVudCBvbnRvIERPTSBlbGVtZW50cyBpZGVudGlmaWVkIGJ5IHRoZSBbY29tcG9uZW50VHlwZV0nc1xuICAgKiBzZWxlY3RvciBhbmQga2lja3Mgb2ZmIGF1dG9tYXRpYyBjaGFuZ2UgZGV0ZWN0aW9uIHRvIGZpbmlzaCBpbml0aWFsaXppbmcgdGhlIGNvbXBvbmVudC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICoge0BleGFtcGxlIGNvcmUvdHMvcGxhdGZvcm0vcGxhdGZvcm0udHMgcmVnaW9uPSdsb25nZm9ybSd9XG4gICAqL1xuICBhYnN0cmFjdCBib290c3RyYXA8Qz4oY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxDPik6IENvbXBvbmVudFJlZjxDPjtcblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGFwcGxpY2F0aW9uIHtAbGluayBJbmplY3Rvcn0uXG4gICAqL1xuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gPEluamVjdG9yPnVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGFwcGxpY2F0aW9uIHtAbGluayBOZ1pvbmV9LlxuICAgKi9cbiAgZ2V0IHpvbmUoKTogTmdab25lIHsgcmV0dXJuIDxOZ1pvbmU+dW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBEaXNwb3NlIG9mIHRoaXMgYXBwbGljYXRpb24gYW5kIGFsbCBvZiBpdHMgY29tcG9uZW50cy5cbiAgICovXG4gIGFic3RyYWN0IGRpc3Bvc2UoKTogdm9pZDtcblxuICAvKipcbiAgICogSW52b2tlIHRoaXMgbWV0aG9kIHRvIGV4cGxpY2l0bHkgcHJvY2VzcyBjaGFuZ2UgZGV0ZWN0aW9uIGFuZCBpdHMgc2lkZS1lZmZlY3RzLlxuICAgKlxuICAgKiBJbiBkZXZlbG9wbWVudCBtb2RlLCBgdGljaygpYCBhbHNvIHBlcmZvcm1zIGEgc2Vjb25kIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUgdG8gZW5zdXJlIHRoYXQgbm9cbiAgICogZnVydGhlciBjaGFuZ2VzIGFyZSBkZXRlY3RlZC4gSWYgYWRkaXRpb25hbCBjaGFuZ2VzIGFyZSBwaWNrZWQgdXAgZHVyaW5nIHRoaXMgc2Vjb25kIGN5Y2xlLFxuICAgKiBiaW5kaW5ncyBpbiB0aGUgYXBwIGhhdmUgc2lkZS1lZmZlY3RzIHRoYXQgY2Fubm90IGJlIHJlc29sdmVkIGluIGEgc2luZ2xlIGNoYW5nZSBkZXRlY3Rpb25cbiAgICogcGFzcy5cbiAgICogSW4gdGhpcyBjYXNlLCBBbmd1bGFyIHRocm93cyBhbiBlcnJvciwgc2luY2UgYW4gQW5ndWxhciBhcHBsaWNhdGlvbiBjYW4gb25seSBoYXZlIG9uZSBjaGFuZ2VcbiAgICogZGV0ZWN0aW9uIHBhc3MgZHVyaW5nIHdoaWNoIGFsbCBjaGFuZ2UgZGV0ZWN0aW9uIG11c3QgY29tcGxldGUuXG4gICAqL1xuICBhYnN0cmFjdCB0aWNrKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEdldCBhIGxpc3Qgb2YgY29tcG9uZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhpcyBhcHBsaWNhdGlvbi5cbiAgICovXG4gIGdldCBjb21wb25lbnRUeXBlcygpOiBUeXBlW10geyByZXR1cm4gPFR5cGVbXT51bmltcGxlbWVudGVkKCk7IH07XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvblJlZl8gZXh0ZW5kcyBBcHBsaWNhdGlvblJlZiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF90aWNrU2NvcGU6IFd0ZlNjb3BlRm4gPSB3dGZDcmVhdGVTY29wZSgnQXBwbGljYXRpb25SZWYjdGljaygpJyk7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9ib290c3RyYXBMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9kaXNwb3NlTGlzdGVuZXJzOiBGdW5jdGlvbltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfcm9vdENvbXBvbmVudHM6IENvbXBvbmVudFJlZjxhbnk+W10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yb290Q29tcG9uZW50VHlwZXM6IFR5cGVbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmczogQ2hhbmdlRGV0ZWN0b3JSZWZbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3J1bm5pbmdUaWNrOiBib29sZWFuID0gZmFsc2U7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfZW5mb3JjZU5vTmV3Q2hhbmdlczogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX2V4Y2VwdGlvbkhhbmRsZXI6IEV4Y2VwdGlvbkhhbmRsZXI7XG5cbiAgcHJpdmF0ZSBfYXN5bmNJbml0RG9uZVByb21pc2U6IFByb21pc2U8YW55PjtcbiAgcHJpdmF0ZSBfYXN5bmNJbml0RG9uZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm1SZWZfLCBwcml2YXRlIF96b25lOiBOZ1pvbmUsIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHN1cGVyKCk7XG4gICAgdmFyIHpvbmU6IE5nWm9uZSA9IF9pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICB0aGlzLl9lbmZvcmNlTm9OZXdDaGFuZ2VzID0gYXNzZXJ0aW9uc0VuYWJsZWQoKTtcbiAgICB6b25lLnJ1bigoKSA9PiB7IHRoaXMuX2V4Y2VwdGlvbkhhbmRsZXIgPSBfaW5qZWN0b3IuZ2V0KEV4Y2VwdGlvbkhhbmRsZXIpOyB9KTtcbiAgICB0aGlzLl9hc3luY0luaXREb25lUHJvbWlzZSA9IHRoaXMucnVuKCgpID0+IHtcbiAgICAgIGxldCBpbml0czogRnVuY3Rpb25bXSA9IF9pbmplY3Rvci5nZXQoQVBQX0lOSVRJQUxJWkVSLCBudWxsKTtcbiAgICAgIHZhciBhc3luY0luaXRSZXN1bHRzID0gW107XG4gICAgICB2YXIgYXN5bmNJbml0RG9uZVByb21pc2U7XG4gICAgICBpZiAoaXNQcmVzZW50KGluaXRzKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluaXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGluaXRSZXN1bHQgPSBpbml0c1tpXSgpO1xuICAgICAgICAgIGlmIChpc1Byb21pc2UoaW5pdFJlc3VsdCkpIHtcbiAgICAgICAgICAgIGFzeW5jSW5pdFJlc3VsdHMucHVzaChpbml0UmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChhc3luY0luaXRSZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYXN5bmNJbml0RG9uZVByb21pc2UgPVxuICAgICAgICAgICAgUHJvbWlzZVdyYXBwZXIuYWxsKGFzeW5jSW5pdFJlc3VsdHMpLnRoZW4oKF8pID0+IHRoaXMuX2FzeW5jSW5pdERvbmUgPSB0cnVlKTtcbiAgICAgICAgdGhpcy5fYXN5bmNJbml0RG9uZSA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYXN5bmNJbml0RG9uZSA9IHRydWU7XG4gICAgICAgIGFzeW5jSW5pdERvbmVQcm9taXNlID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhc3luY0luaXREb25lUHJvbWlzZTtcbiAgICB9KTtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoem9uZS5vbkVycm9yLCAoZXJyb3I6IE5nWm9uZUVycm9yKSA9PiB7XG4gICAgICB0aGlzLl9leGNlcHRpb25IYW5kbGVyLmNhbGwoZXJyb3IuZXJyb3IsIGVycm9yLnN0YWNrVHJhY2UpO1xuICAgIH0pO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSh0aGlzLl96b25lLm9uTWljcm90YXNrRW1wdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfKSA9PiB7IHRoaXMuX3pvbmUucnVuKCgpID0+IHsgdGhpcy50aWNrKCk7IH0pOyB9KTtcbiAgfVxuXG4gIHJlZ2lzdGVyQm9vdHN0cmFwTGlzdGVuZXIobGlzdGVuZXI6IChyZWY6IENvbXBvbmVudFJlZjxhbnk+KSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fYm9vdHN0cmFwTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICB9XG5cbiAgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLnB1c2goZGlzcG9zZSk7IH1cblxuICByZWdpc3RlckNoYW5nZURldGVjdG9yKGNoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZik6IHZvaWQge1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcy5wdXNoKGNoYW5nZURldGVjdG9yKTtcbiAgfVxuXG4gIHVucmVnaXN0ZXJDaGFuZ2VEZXRlY3RvcihjaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYpOiB2b2lkIHtcbiAgICBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWZzLCBjaGFuZ2VEZXRlY3Rvcik7XG4gIH1cblxuICB3YWl0Rm9yQXN5bmNJbml0aWFsaXplcnMoKTogUHJvbWlzZTxhbnk+IHsgcmV0dXJuIHRoaXMuX2FzeW5jSW5pdERvbmVQcm9taXNlOyB9XG5cbiAgcnVuKGNhbGxiYWNrOiBGdW5jdGlvbik6IGFueSB7XG4gICAgdmFyIHpvbmUgPSB0aGlzLmluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgIHZhciByZXN1bHQ7XG4gICAgLy8gTm90ZTogRG9uJ3QgdXNlIHpvbmUucnVuR3VhcmRlZCBhcyB3ZSB3YW50IHRvIGtub3cgYWJvdXRcbiAgICAvLyB0aGUgdGhyb3duIGV4Y2VwdGlvbiFcbiAgICAvLyBOb3RlOiB0aGUgY29tcGxldGVyIG5lZWRzIHRvIGJlIGNyZWF0ZWQgb3V0c2lkZVxuICAgIC8vIG9mIGB6b25lLnJ1bmAgYXMgRGFydCBzd2FsbG93cyByZWplY3RlZCBwcm9taXNlc1xuICAgIC8vIHZpYSB0aGUgb25FcnJvciBjYWxsYmFjayBvZiB0aGUgcHJvbWlzZS5cbiAgICB2YXIgY29tcGxldGVyID0gUHJvbWlzZVdyYXBwZXIuY29tcGxldGVyKCk7XG4gICAgem9uZS5ydW4oKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gY2FsbGJhY2soKTtcbiAgICAgICAgaWYgKGlzUHJvbWlzZShyZXN1bHQpKSB7XG4gICAgICAgICAgUHJvbWlzZVdyYXBwZXIudGhlbihyZXN1bHQsIChyZWYpID0+IHsgY29tcGxldGVyLnJlc29sdmUocmVmKTsgfSwgKGVyciwgc3RhY2tUcmFjZSkgPT4ge1xuICAgICAgICAgICAgY29tcGxldGVyLnJlamVjdChlcnIsIHN0YWNrVHJhY2UpO1xuICAgICAgICAgICAgdGhpcy5fZXhjZXB0aW9uSGFuZGxlci5jYWxsKGVyciwgc3RhY2tUcmFjZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5fZXhjZXB0aW9uSGFuZGxlci5jYWxsKGUsIGUuc3RhY2spO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBpc1Byb21pc2UocmVzdWx0KSA/IGNvbXBsZXRlci5wcm9taXNlIDogcmVzdWx0O1xuICB9XG5cbiAgYm9vdHN0cmFwPEM+KGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8Qz4pOiBDb21wb25lbnRSZWY8Qz4ge1xuICAgIGlmICghdGhpcy5fYXN5bmNJbml0RG9uZSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgJ0Nhbm5vdCBib290c3RyYXAgYXMgdGhlcmUgYXJlIHN0aWxsIGFzeW5jaHJvbm91cyBpbml0aWFsaXplcnMgcnVubmluZy4gV2FpdCBmb3IgdGhlbSB1c2luZyB3YWl0Rm9yQXN5bmNJbml0aWFsaXplcnMoKS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucnVuKCgpID0+IHtcbiAgICAgIHRoaXMuX3Jvb3RDb21wb25lbnRUeXBlcy5wdXNoKGNvbXBvbmVudEZhY3RvcnkuY29tcG9uZW50VHlwZSk7XG4gICAgICB2YXIgY29tcFJlZiA9IGNvbXBvbmVudEZhY3RvcnkuY3JlYXRlKHRoaXMuX2luamVjdG9yLCBbXSwgY29tcG9uZW50RmFjdG9yeS5zZWxlY3Rvcik7XG4gICAgICBjb21wUmVmLm9uRGVzdHJveSgoKSA9PiB7IHRoaXMuX3VubG9hZENvbXBvbmVudChjb21wUmVmKTsgfSk7XG4gICAgICB2YXIgdGVzdGFiaWxpdHkgPSBjb21wUmVmLmluamVjdG9yLmdldChUZXN0YWJpbGl0eSwgbnVsbCk7XG4gICAgICBpZiAoaXNQcmVzZW50KHRlc3RhYmlsaXR5KSkge1xuICAgICAgICBjb21wUmVmLmluamVjdG9yLmdldChUZXN0YWJpbGl0eVJlZ2lzdHJ5KVxuICAgICAgICAgICAgLnJlZ2lzdGVyQXBwbGljYXRpb24oY29tcFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50LCB0ZXN0YWJpbGl0eSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2xvYWRDb21wb25lbnQoY29tcFJlZik7XG4gICAgICBsZXQgYzogQ29uc29sZSA9IHRoaXMuX2luamVjdG9yLmdldChDb25zb2xlKTtcbiAgICAgIGlmIChhc3NlcnRpb25zRW5hYmxlZCgpKSB7XG4gICAgICAgIGMubG9nKFxuICAgICAgICAgICAgXCJBbmd1bGFyIDIgaXMgcnVubmluZyBpbiB0aGUgZGV2ZWxvcG1lbnQgbW9kZS4gQ2FsbCBlbmFibGVQcm9kTW9kZSgpIHRvIGVuYWJsZSB0aGUgcHJvZHVjdGlvbiBtb2RlLlwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb21wUmVmO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9hZENvbXBvbmVudChjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+KTogdm9pZCB7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWZzLnB1c2goY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmKTtcbiAgICB0aGlzLnRpY2soKTtcbiAgICB0aGlzLl9yb290Q29tcG9uZW50cy5wdXNoKGNvbXBvbmVudFJlZik7XG4gICAgdGhpcy5fYm9vdHN0cmFwTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcihjb21wb25lbnRSZWYpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VubG9hZENvbXBvbmVudChjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+KTogdm9pZCB7XG4gICAgaWYgKCFMaXN0V3JhcHBlci5jb250YWlucyh0aGlzLl9yb290Q29tcG9uZW50cywgY29tcG9uZW50UmVmKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnVucmVnaXN0ZXJDaGFuZ2VEZXRlY3Rvcihjb21wb25lbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWYpO1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9yb290Q29tcG9uZW50cywgY29tcG9uZW50UmVmKTtcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9pbmplY3RvcjsgfVxuXG4gIGdldCB6b25lKCk6IE5nWm9uZSB7IHJldHVybiB0aGlzLl96b25lOyB9XG5cbiAgdGljaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcnVubmluZ1RpY2spIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiQXBwbGljYXRpb25SZWYudGljayBpcyBjYWxsZWQgcmVjdXJzaXZlbHlcIik7XG4gICAgfVxuXG4gICAgdmFyIHMgPSBBcHBsaWNhdGlvblJlZl8uX3RpY2tTY29wZSgpO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IHRydWU7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMuZm9yRWFjaCgoZGV0ZWN0b3IpID0+IGRldGVjdG9yLmRldGVjdENoYW5nZXMoKSk7XG4gICAgICBpZiAodGhpcy5fZW5mb3JjZU5vTmV3Q2hhbmdlcykge1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMuZm9yRWFjaCgoZGV0ZWN0b3IpID0+IGRldGVjdG9yLmNoZWNrTm9DaGFuZ2VzKCkpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IGZhbHNlO1xuICAgICAgd3RmTGVhdmUocyk7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICAvLyBUT0RPKGFseGh1Yik6IERpc3Bvc2Ugb2YgdGhlIE5nWm9uZS5cbiAgICBMaXN0V3JhcHBlci5jbG9uZSh0aGlzLl9yb290Q29tcG9uZW50cykuZm9yRWFjaCgocmVmKSA9PiByZWYuZGVzdHJveSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLmZvckVhY2goKGRpc3Bvc2UpID0+IGRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fcGxhdGZvcm0uX2FwcGxpY2F0aW9uRGlzcG9zZWQodGhpcyk7XG4gIH1cblxuICBnZXQgY29tcG9uZW50VHlwZXMoKTogVHlwZVtdIHsgcmV0dXJuIHRoaXMuX3Jvb3RDb21wb25lbnRUeXBlczsgfVxufVxuXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgY29uc3QgUExBVEZPUk1fQ09SRV9QUk9WSURFUlMgPVxuICAgIC8qQHRzMmRhcnRfY29uc3QqL1tcbiAgICAgIFBsYXRmb3JtUmVmXyxcbiAgICAgIC8qQHRzMmRhcnRfY29uc3QqLyAoXG4gICAgICAgICAgLyogQHRzMmRhcnRfUHJvdmlkZXIgKi8ge3Byb3ZpZGU6IFBsYXRmb3JtUmVmLCB1c2VFeGlzdGluZzogUGxhdGZvcm1SZWZffSlcbiAgICBdO1xuXG4vKipcbiAqIEBpbnRlcm5hbFxuICovXG5leHBvcnQgY29uc3QgQVBQTElDQVRJT05fQ09SRV9QUk9WSURFUlMgPSAvKkB0czJkYXJ0X2NvbnN0Ki9bXG4gIC8qIEB0czJkYXJ0X1Byb3ZpZGVyICovIHtwcm92aWRlOiBOZ1pvbmUsIHVzZUZhY3Rvcnk6IGNyZWF0ZU5nWm9uZSwgZGVwczogW119LFxuICBBcHBsaWNhdGlvblJlZl8sXG4gIC8qIEB0czJkYXJ0X1Byb3ZpZGVyICovIHtwcm92aWRlOiBBcHBsaWNhdGlvblJlZiwgdXNlRXhpc3Rpbmc6IEFwcGxpY2F0aW9uUmVmX31cbl07XG4iXX0=