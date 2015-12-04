'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var application_tokens_1 = require('./application_tokens');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var testability_1 = require('angular2/src/core/testability/testability');
var dynamic_component_loader_1 = require('angular2/src/core/linker/dynamic_component_loader');
var exceptions_1 = require('angular2/src/facade/exceptions');
var view_ref_1 = require('angular2/src/core/linker/view_ref');
var profile_1 = require('./profile/profile');
var lang_2 = require('angular2/src/facade/lang');
/**
 * Construct providers specific to an individual root component.
 */
function _componentProviders(appComponentType) {
    return [
        di_1.provide(application_tokens_1.APP_COMPONENT, { useValue: appComponentType }),
        di_1.provide(application_tokens_1.APP_COMPONENT_REF_PROMISE, {
            useFactory: function (dynamicComponentLoader, appRef, injector) {
                // Save the ComponentRef for disposal later.
                var ref;
                // TODO(rado): investigate whether to support providers on root component.
                return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector, function () { appRef._unloadComponent(ref); })
                    .then(function (componentRef) {
                    ref = componentRef;
                    if (lang_1.isPresent(componentRef.location.nativeElement)) {
                        injector.get(testability_1.TestabilityRegistry)
                            .registerApplication(componentRef.location.nativeElement, injector.get(testability_1.Testability));
                    }
                    return componentRef;
                });
            },
            deps: [dynamic_component_loader_1.DynamicComponentLoader, ApplicationRef, di_1.Injector]
        }),
        di_1.provide(appComponentType, {
            useFactory: function (p) { return p.then(function (ref) { return ref.instance; }); },
            deps: [application_tokens_1.APP_COMPONENT_REF_PROMISE]
        }),
    ];
}
/**
 * Create an Angular zone.
 */
function createNgZone() {
    return new ng_zone_1.NgZone({ enableLongStackTrace: lang_1.assertionsEnabled() });
}
exports.createNgZone = createNgZone;
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
function platform(providers) {
    lang_2.lockDevMode();
    if (lang_1.isPresent(_platform)) {
        if (collection_1.ListWrapper.equals(_platformProviders, providers)) {
            return _platform;
        }
        else {
            throw new exceptions_1.BaseException("platform cannot be initialized with different sets of providers.");
        }
    }
    else {
        return _createPlatform(providers);
    }
}
exports.platform = platform;
/**
 * Dispose the existing platform.
 */
function disposePlatform() {
    if (lang_1.isPresent(_platform)) {
        _platform.dispose();
        _platform = null;
    }
}
exports.disposePlatform = disposePlatform;
function _createPlatform(providers) {
    _platformProviders = providers;
    var injector = di_1.Injector.resolveAndCreate(providers);
    _platform = new PlatformRef_(injector, function () {
        _platform = null;
        _platformProviders = null;
    });
    _runPlatformInitializers(injector);
    return _platform;
}
function _runPlatformInitializers(injector) {
    var inits = injector.getOptional(application_tokens_1.PLATFORM_INITIALIZER);
    if (lang_1.isPresent(inits))
        inits.forEach(function (init) { return init(); });
}
/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
 * explicitly by calling {@link platform}().
 */
var PlatformRef = (function () {
    function PlatformRef() {
    }
    Object.defineProperty(PlatformRef.prototype, "injector", {
        /**
         * Retrieve the platform {@link Injector}, which is the parent injector for
         * every Angular application on the page and provides singleton providers.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return PlatformRef;
})();
exports.PlatformRef = PlatformRef;
var PlatformRef_ = (function (_super) {
    __extends(PlatformRef_, _super);
    function PlatformRef_(_injector, _dispose) {
        _super.call(this);
        this._injector = _injector;
        this._dispose = _dispose;
        /** @internal */
        this._applications = [];
        /** @internal */
        this._disposeListeners = [];
    }
    PlatformRef_.prototype.registerDisposeListener = function (dispose) { this._disposeListeners.push(dispose); };
    Object.defineProperty(PlatformRef_.prototype, "injector", {
        get: function () { return this._injector; },
        enumerable: true,
        configurable: true
    });
    PlatformRef_.prototype.application = function (providers) {
        var app = this._initApp(createNgZone(), providers);
        return app;
    };
    PlatformRef_.prototype.asyncApplication = function (bindingFn, additionalProviders) {
        var _this = this;
        var zone = createNgZone();
        var completer = async_1.PromiseWrapper.completer();
        zone.run(function () {
            async_1.PromiseWrapper.then(bindingFn(zone), function (providers) {
                if (lang_1.isPresent(additionalProviders)) {
                    providers = collection_1.ListWrapper.concat(providers, additionalProviders);
                }
                completer.resolve(_this._initApp(zone, providers));
            });
        });
        return completer.promise;
    };
    PlatformRef_.prototype._initApp = function (zone, providers) {
        var _this = this;
        var injector;
        var app;
        zone.run(function () {
            providers = collection_1.ListWrapper.concat(providers, [
                di_1.provide(ng_zone_1.NgZone, { useValue: zone }),
                di_1.provide(ApplicationRef, { useFactory: function () { return app; }, deps: [] })
            ]);
            var exceptionHandler;
            try {
                injector = _this.injector.resolveAndCreateChild(providers);
                exceptionHandler = injector.get(exceptions_1.ExceptionHandler);
                zone.overrideOnErrorHandler(function (e, s) { return exceptionHandler.call(e, s); });
            }
            catch (e) {
                if (lang_1.isPresent(exceptionHandler)) {
                    exceptionHandler.call(e, e.stack);
                }
                else {
                    lang_1.print(e.toString());
                }
            }
        });
        app = new ApplicationRef_(this, zone, injector);
        this._applications.push(app);
        _runAppInitializers(injector);
        return app;
    };
    PlatformRef_.prototype.dispose = function () {
        collection_1.ListWrapper.clone(this._applications).forEach(function (app) { return app.dispose(); });
        this._disposeListeners.forEach(function (dispose) { return dispose(); });
        this._dispose();
    };
    /** @internal */
    PlatformRef_.prototype._applicationDisposed = function (app) { collection_1.ListWrapper.remove(this._applications, app); };
    return PlatformRef_;
})(PlatformRef);
exports.PlatformRef_ = PlatformRef_;
function _runAppInitializers(injector) {
    var inits = injector.getOptional(application_tokens_1.APP_INITIALIZER);
    if (lang_1.isPresent(inits))
        inits.forEach(function (init) { return init(); });
}
/**
 * A reference to an Angular application running on a page.
 *
 * For more about Angular applications, see the documentation for {@link bootstrap}.
 */
var ApplicationRef = (function () {
    function ApplicationRef() {
    }
    Object.defineProperty(ApplicationRef.prototype, "injector", {
        /**
         * Retrieve the application {@link Injector}.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ApplicationRef.prototype, "zone", {
        /**
         * Retrieve the application {@link NgZone}.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ApplicationRef.prototype, "componentTypes", {
        /**
         * Get a list of component types registered to this application.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return ApplicationRef;
})();
exports.ApplicationRef = ApplicationRef;
var ApplicationRef_ = (function (_super) {
    __extends(ApplicationRef_, _super);
    function ApplicationRef_(_platform, _zone, _injector) {
        var _this = this;
        _super.call(this);
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
        if (lang_1.isPresent(this._zone)) {
            async_1.ObservableWrapper.subscribe(this._zone.onTurnDone, function (_) { _this._zone.run(function () { _this.tick(); }); });
        }
        this._enforceNoNewChanges = lang_1.assertionsEnabled();
    }
    ApplicationRef_.prototype.registerBootstrapListener = function (listener) {
        this._bootstrapListeners.push(listener);
    };
    ApplicationRef_.prototype.registerDisposeListener = function (dispose) { this._disposeListeners.push(dispose); };
    ApplicationRef_.prototype.registerChangeDetector = function (changeDetector) {
        this._changeDetectorRefs.push(changeDetector);
    };
    ApplicationRef_.prototype.unregisterChangeDetector = function (changeDetector) {
        collection_1.ListWrapper.remove(this._changeDetectorRefs, changeDetector);
    };
    ApplicationRef_.prototype.bootstrap = function (componentType, providers) {
        var _this = this;
        var completer = async_1.PromiseWrapper.completer();
        this._zone.run(function () {
            var componentProviders = _componentProviders(componentType);
            if (lang_1.isPresent(providers)) {
                componentProviders.push(providers);
            }
            var exceptionHandler = _this._injector.get(exceptions_1.ExceptionHandler);
            _this._rootComponentTypes.push(componentType);
            try {
                var injector = _this._injector.resolveAndCreateChild(componentProviders);
                var compRefToken = injector.get(application_tokens_1.APP_COMPONENT_REF_PROMISE);
                var tick = function (componentRef) {
                    _this._loadComponent(componentRef);
                    completer.resolve(componentRef);
                };
                var tickResult = async_1.PromiseWrapper.then(compRefToken, tick);
                async_1.PromiseWrapper.then(tickResult, function (_) { });
                async_1.PromiseWrapper.then(tickResult, null, function (err, stackTrace) { return completer.reject(err, stackTrace); });
            }
            catch (e) {
                exceptionHandler.call(e, e.stack);
                completer.reject(e, e.stack);
            }
        });
        return completer.promise;
    };
    /** @internal */
    ApplicationRef_.prototype._loadComponent = function (ref) {
        var appChangeDetector = view_ref_1.internalView(ref.hostView).changeDetector;
        this._changeDetectorRefs.push(appChangeDetector.ref);
        this.tick();
        this._rootComponents.push(ref);
        this._bootstrapListeners.forEach(function (listener) { return listener(ref); });
    };
    /** @internal */
    ApplicationRef_.prototype._unloadComponent = function (ref) {
        if (!collection_1.ListWrapper.contains(this._rootComponents, ref)) {
            return;
        }
        this.unregisterChangeDetector(view_ref_1.internalView(ref.hostView).changeDetector.ref);
        collection_1.ListWrapper.remove(this._rootComponents, ref);
    };
    Object.defineProperty(ApplicationRef_.prototype, "injector", {
        get: function () { return this._injector; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ApplicationRef_.prototype, "zone", {
        get: function () { return this._zone; },
        enumerable: true,
        configurable: true
    });
    ApplicationRef_.prototype.tick = function () {
        if (this._runningTick) {
            throw new exceptions_1.BaseException("ApplicationRef.tick is called recursively");
        }
        var s = ApplicationRef_._tickScope();
        try {
            this._runningTick = true;
            this._changeDetectorRefs.forEach(function (detector) { return detector.detectChanges(); });
            if (this._enforceNoNewChanges) {
                this._changeDetectorRefs.forEach(function (detector) { return detector.checkNoChanges(); });
            }
        }
        finally {
            this._runningTick = false;
            profile_1.wtfLeave(s);
        }
    };
    ApplicationRef_.prototype.dispose = function () {
        // TODO(alxhub): Dispose of the NgZone.
        collection_1.ListWrapper.clone(this._rootComponents).forEach(function (ref) { return ref.dispose(); });
        this._disposeListeners.forEach(function (dispose) { return dispose(); });
        this._platform._applicationDisposed(this);
    };
    Object.defineProperty(ApplicationRef_.prototype, "componentTypes", {
        get: function () { return this._rootComponentTypes; },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    ApplicationRef_._tickScope = profile_1.wtfCreateScope('ApplicationRef#tick()');
    return ApplicationRef_;
})(ApplicationRef);
exports.ApplicationRef_ = ApplicationRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmLnRzIl0sIm5hbWVzIjpbIl9jb21wb25lbnRQcm92aWRlcnMiLCJjcmVhdGVOZ1pvbmUiLCJwbGF0Zm9ybSIsImRpc3Bvc2VQbGF0Zm9ybSIsIl9jcmVhdGVQbGF0Zm9ybSIsIl9ydW5QbGF0Zm9ybUluaXRpYWxpemVycyIsIlBsYXRmb3JtUmVmIiwiUGxhdGZvcm1SZWYuY29uc3RydWN0b3IiLCJQbGF0Zm9ybVJlZi5pbmplY3RvciIsIlBsYXRmb3JtUmVmXyIsIlBsYXRmb3JtUmVmXy5jb25zdHJ1Y3RvciIsIlBsYXRmb3JtUmVmXy5yZWdpc3RlckRpc3Bvc2VMaXN0ZW5lciIsIlBsYXRmb3JtUmVmXy5pbmplY3RvciIsIlBsYXRmb3JtUmVmXy5hcHBsaWNhdGlvbiIsIlBsYXRmb3JtUmVmXy5hc3luY0FwcGxpY2F0aW9uIiwiUGxhdGZvcm1SZWZfLl9pbml0QXBwIiwiUGxhdGZvcm1SZWZfLmRpc3Bvc2UiLCJQbGF0Zm9ybVJlZl8uX2FwcGxpY2F0aW9uRGlzcG9zZWQiLCJfcnVuQXBwSW5pdGlhbGl6ZXJzIiwiQXBwbGljYXRpb25SZWYiLCJBcHBsaWNhdGlvblJlZi5jb25zdHJ1Y3RvciIsIkFwcGxpY2F0aW9uUmVmLmluamVjdG9yIiwiQXBwbGljYXRpb25SZWYuem9uZSIsIkFwcGxpY2F0aW9uUmVmLmNvbXBvbmVudFR5cGVzIiwiQXBwbGljYXRpb25SZWZfIiwiQXBwbGljYXRpb25SZWZfLmNvbnN0cnVjdG9yIiwiQXBwbGljYXRpb25SZWZfLnJlZ2lzdGVyQm9vdHN0cmFwTGlzdGVuZXIiLCJBcHBsaWNhdGlvblJlZl8ucmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIiLCJBcHBsaWNhdGlvblJlZl8ucmVnaXN0ZXJDaGFuZ2VEZXRlY3RvciIsIkFwcGxpY2F0aW9uUmVmXy51bnJlZ2lzdGVyQ2hhbmdlRGV0ZWN0b3IiLCJBcHBsaWNhdGlvblJlZl8uYm9vdHN0cmFwIiwiQXBwbGljYXRpb25SZWZfLl9sb2FkQ29tcG9uZW50IiwiQXBwbGljYXRpb25SZWZfLl91bmxvYWRDb21wb25lbnQiLCJBcHBsaWNhdGlvblJlZl8uaW5qZWN0b3IiLCJBcHBsaWNhdGlvblJlZl8uem9uZSIsIkFwcGxpY2F0aW9uUmVmXy50aWNrIiwiQXBwbGljYXRpb25SZWZfLmRpc3Bvc2UiLCJBcHBsaWNhdGlvblJlZl8uY29tcG9uZW50VHlwZXMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0JBQXFCLGdDQUFnQyxDQUFDLENBQUE7QUFDdEQscUJBQWlFLDBCQUEwQixDQUFDLENBQUE7QUFDNUYsbUJBQXVELHNCQUFzQixDQUFDLENBQUE7QUFDOUUsbUNBTU8sc0JBQXNCLENBQUMsQ0FBQTtBQUM5QixzQkFLTywyQkFBMkIsQ0FBQyxDQUFBO0FBQ25DLDJCQUEwQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzNELDRCQUErQywyQ0FBMkMsQ0FBQyxDQUFBO0FBQzNGLHlDQUdPLG1EQUFtRCxDQUFDLENBQUE7QUFDM0QsMkJBS08sZ0NBQWdDLENBQUMsQ0FBQTtBQUN4Qyx5QkFBMkIsbUNBQW1DLENBQUMsQ0FBQTtBQUMvRCx3QkFBbUQsbUJBQW1CLENBQUMsQ0FBQTtBQUV2RSxxQkFBMEIsMEJBQTBCLENBQUMsQ0FBQTtBQUVyRDs7R0FFRztBQUNILDZCQUE2QixnQkFBc0I7SUFDakRBLE1BQU1BLENBQUNBO1FBQ0xBLFlBQU9BLENBQUNBLGtDQUFhQSxFQUFFQSxFQUFDQSxRQUFRQSxFQUFFQSxnQkFBZ0JBLEVBQUNBLENBQUNBO1FBQ3BEQSxZQUFPQSxDQUFDQSw4Q0FBeUJBLEVBQ3pCQTtZQUNFQSxVQUFVQSxFQUFFQSxVQUFDQSxzQkFBOENBLEVBQUVBLE1BQXVCQSxFQUN2RUEsUUFBa0JBO2dCQUM3QkEsNENBQTRDQTtnQkFDNUNBLElBQUlBLEdBQWlCQSxDQUFDQTtnQkFDdEJBLDBFQUEwRUE7Z0JBQzFFQSxNQUFNQSxDQUFDQSxzQkFB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QSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxHQUFHQSxJQUFLQSxPQUFBQSxHQUFHQSxDQUFDQSxPQUFPQSxFQUFFQSxFQUFiQSxDQUFhQSxDQUFDQSxDQUFDQTtRQUN4RUEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxPQUFPQSxJQUFLQSxPQUFBQSxPQUFPQSxFQUFFQSxFQUFUQSxDQUFTQSxDQUFDQSxDQUFDQTtRQUN2REEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUM1Q0EsQ0FBQ0E7SUFFRFosc0JBQUlBLDJDQUFjQTthQUFsQkEsY0FBOEJhLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBYjtJQXZIaEVBLGdCQUFnQkE7SUFDVEEsMEJBQVVBLEdBQWVBLHdCQUFjQSxDQUFDQSx1QkFBdUJBLENBQUNBLENBQUNBO0lBdUgxRUEsc0JBQUNBO0FBQURBLENBQUNBLEFBekhELEVBQXFDLGNBQWMsRUF5SGxEO0FBekhZLHVCQUFlLGtCQXlIM0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Tmdab25lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuaW1wb3J0IHtUeXBlLCBpc0JsYW5rLCBpc1ByZXNlbnQsIGFzc2VydGlvbnNFbmFibGVkLCBwcmludH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7cHJvdmlkZSwgUHJvdmlkZXIsIEluamVjdG9yLCBPcGFxdWVUb2tlbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtcbiAgQVBQX0NPTVBPTkVOVF9SRUZfUFJPTUlTRSxcbiAgQVBQX0NPTVBPTkVOVCxcbiAgQVBQX0lEX1JBTkRPTV9QUk9WSURFUixcbiAgUExBVEZPUk1fSU5JVElBTElaRVIsXG4gIEFQUF9JTklUSUFMSVpFUlxufSBmcm9tICcuL2FwcGxpY2F0aW9uX3Rva2Vucyc7XG5pbXBvcnQge1xuICBQcm9taXNlLFxuICBQcm9taXNlV3JhcHBlcixcbiAgUHJvbWlzZUNvbXBsZXRlcixcbiAgT2JzZXJ2YWJsZVdyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBUZXN0YWJpbGl0eX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvdGVzdGFiaWxpdHkvdGVzdGFiaWxpdHknO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50UmVmLFxuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9keW5hbWljX2NvbXBvbmVudF9sb2FkZXInO1xuaW1wb3J0IHtcbiAgQmFzZUV4Y2VwdGlvbixcbiAgV3JhcHBlZEV4Y2VwdGlvbixcbiAgRXhjZXB0aW9uSGFuZGxlcixcbiAgdW5pbXBsZW1lbnRlZFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtpbnRlcm5hbFZpZXd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3JlZic7XG5pbXBvcnQge3d0ZkxlYXZlLCB3dGZDcmVhdGVTY29wZSwgV3RmU2NvcGVGbn0gZnJvbSAnLi9wcm9maWxlL3Byb2ZpbGUnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7bG9ja0Rldk1vZGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogQ29uc3RydWN0IHByb3ZpZGVycyBzcGVjaWZpYyB0byBhbiBpbmRpdmlkdWFsIHJvb3QgY29tcG9uZW50LlxuICovXG5mdW5jdGlvbiBfY29tcG9uZW50UHJvdmlkZXJzKGFwcENvbXBvbmVudFR5cGU6IFR5cGUpOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4ge1xuICByZXR1cm4gW1xuICAgIHByb3ZpZGUoQVBQX0NPTVBPTkVOVCwge3VzZVZhbHVlOiBhcHBDb21wb25lbnRUeXBlfSksXG4gICAgcHJvdmlkZShBUFBfQ09NUE9ORU5UX1JFRl9QUk9NSVNFLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB1c2VGYWN0b3J5OiAoZHluYW1pY0NvbXBvbmVudExvYWRlcjogRHluYW1pY0NvbXBvbmVudExvYWRlciwgYXBwUmVmOiBBcHBsaWNhdGlvblJlZl8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBTYXZlIHRoZSBDb21wb25lbnRSZWYgZm9yIGRpc3Bvc2FsIGxhdGVyLlxuICAgICAgICAgICAgICAgIHZhciByZWY6IENvbXBvbmVudFJlZjtcbiAgICAgICAgICAgICAgICAvLyBUT0RPKHJhZG8pOiBpbnZlc3RpZ2F0ZSB3aGV0aGVyIHRvIHN1cHBvcnQgcHJvdmlkZXJzIG9uIHJvb3QgY29tcG9uZW50LlxuICAgICAgICAgICAgICAgIHJldHVybiBkeW5hbWljQ29tcG9uZW50TG9hZGVyLmxvYWRBc1Jvb3QoYXBwQ29tcG9uZW50VHlwZSwgbnVsbCwgaW5qZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7IGFwcFJlZi5fdW5sb2FkQ29tcG9uZW50KHJlZik7IH0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChjb21wb25lbnRSZWYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZWYgPSBjb21wb25lbnRSZWY7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChjb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdG9yLmdldChUZXN0YWJpbGl0eVJlZ2lzdHJ5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZWdpc3RlckFwcGxpY2F0aW9uKGNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdG9yLmdldChUZXN0YWJpbGl0eSkpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcG9uZW50UmVmO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZGVwczogW0R5bmFtaWNDb21wb25lbnRMb2FkZXIsIEFwcGxpY2F0aW9uUmVmLCBJbmplY3Rvcl1cbiAgICAgICAgICAgIH0pLFxuICAgIHByb3ZpZGUoYXBwQ29tcG9uZW50VHlwZSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdXNlRmFjdG9yeTogKHA6IFByb21pc2U8YW55PikgPT4gcC50aGVuKHJlZiA9PiByZWYuaW5zdGFuY2UpLFxuICAgICAgICAgICAgICBkZXBzOiBbQVBQX0NPTVBPTkVOVF9SRUZfUFJPTUlTRV1cbiAgICAgICAgICAgIH0pLFxuICBdO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBBbmd1bGFyIHpvbmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOZ1pvbmUoKTogTmdab25lIHtcbiAgcmV0dXJuIG5ldyBOZ1pvbmUoe2VuYWJsZUxvbmdTdGFja1RyYWNlOiBhc3NlcnRpb25zRW5hYmxlZCgpfSk7XG59XG5cbnZhciBfcGxhdGZvcm06IFBsYXRmb3JtUmVmO1xudmFyIF9wbGF0Zm9ybVByb3ZpZGVyczogYW55W107XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgQW5ndWxhciAncGxhdGZvcm0nIG9uIHRoZSBwYWdlLlxuICpcbiAqIFNlZSB7QGxpbmsgUGxhdGZvcm1SZWZ9IGZvciBkZXRhaWxzIG9uIHRoZSBBbmd1bGFyIHBsYXRmb3JtLlxuICpcbiAqIEl0IGlzIGFsc28gcG9zc2libGUgdG8gc3BlY2lmeSBwcm92aWRlcnMgdG8gYmUgbWFkZSBpbiB0aGUgbmV3IHBsYXRmb3JtLiBUaGVzZSBwcm92aWRlcnNcbiAqIHdpbGwgYmUgc2hhcmVkIGJldHdlZW4gYWxsIGFwcGxpY2F0aW9ucyBvbiB0aGUgcGFnZS4gRm9yIGV4YW1wbGUsIGFuIGFic3RyYWN0aW9uIGZvclxuICogdGhlIGJyb3dzZXIgY29va2llIGphciBzaG91bGQgYmUgYm91bmQgYXQgdGhlIHBsYXRmb3JtIGxldmVsLCBiZWNhdXNlIHRoZXJlIGlzIG9ubHkgb25lXG4gKiBjb29raWUgamFyIHJlZ2FyZGxlc3Mgb2YgaG93IG1hbnkgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlIHdpbGwgYmUgYWNjZXNzaW5nIGl0LlxuICpcbiAqIFRoZSBwbGF0Zm9ybSBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGFzIGxvbmcgYXMgdGhlIHNhbWUgbGlzdCBvZiBwcm92aWRlcnNcbiAqIGlzIHBhc3NlZCBpbnRvIGVhY2ggY2FsbC4gSWYgdGhlIHBsYXRmb3JtIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGEgZGlmZmVyZW50IHNldCBvZlxuICogcHJvdmlkZXMsIEFuZ3VsYXIgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwbGF0Zm9ybShwcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQbGF0Zm9ybVJlZiB7XG4gIGxvY2tEZXZNb2RlKCk7XG4gIGlmIChpc1ByZXNlbnQoX3BsYXRmb3JtKSkge1xuICAgIGlmIChMaXN0V3JhcHBlci5lcXVhbHMoX3BsYXRmb3JtUHJvdmlkZXJzLCBwcm92aWRlcnMpKSB7XG4gICAgICByZXR1cm4gX3BsYXRmb3JtO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcInBsYXRmb3JtIGNhbm5vdCBiZSBpbml0aWFsaXplZCB3aXRoIGRpZmZlcmVudCBzZXRzIG9mIHByb3ZpZGVycy5cIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBfY3JlYXRlUGxhdGZvcm0ocHJvdmlkZXJzKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3Bvc2UgdGhlIGV4aXN0aW5nIHBsYXRmb3JtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzcG9zZVBsYXRmb3JtKCk6IHZvaWQge1xuICBpZiAoaXNQcmVzZW50KF9wbGF0Zm9ybSkpIHtcbiAgICBfcGxhdGZvcm0uZGlzcG9zZSgpO1xuICAgIF9wbGF0Zm9ybSA9IG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZVBsYXRmb3JtKHByb3ZpZGVycz86IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFBsYXRmb3JtUmVmIHtcbiAgX3BsYXRmb3JtUHJvdmlkZXJzID0gcHJvdmlkZXJzO1xuICBsZXQgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKHByb3ZpZGVycyk7XG4gIF9wbGF0Zm9ybSA9IG5ldyBQbGF0Zm9ybVJlZl8oaW5qZWN0b3IsICgpID0+IHtcbiAgICBfcGxhdGZvcm0gPSBudWxsO1xuICAgIF9wbGF0Zm9ybVByb3ZpZGVycyA9IG51bGw7XG4gIH0pO1xuICBfcnVuUGxhdGZvcm1Jbml0aWFsaXplcnMoaW5qZWN0b3IpO1xuICByZXR1cm4gX3BsYXRmb3JtO1xufVxuXG5mdW5jdGlvbiBfcnVuUGxhdGZvcm1Jbml0aWFsaXplcnMoaW5qZWN0b3I6IEluamVjdG9yKTogdm9pZCB7XG4gIGxldCBpbml0czogRnVuY3Rpb25bXSA9IGluamVjdG9yLmdldE9wdGlvbmFsKFBMQVRGT1JNX0lOSVRJQUxJWkVSKTtcbiAgaWYgKGlzUHJlc2VudChpbml0cykpIGluaXRzLmZvckVhY2goaW5pdCA9PiBpbml0KCkpO1xufVxuXG4vKipcbiAqIFRoZSBBbmd1bGFyIHBsYXRmb3JtIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgQW5ndWxhciBvbiBhIHdlYiBwYWdlLiBFYWNoIHBhZ2VcbiAqIGhhcyBleGFjdGx5IG9uZSBwbGF0Zm9ybSwgYW5kIHNlcnZpY2VzIChzdWNoIGFzIHJlZmxlY3Rpb24pIHdoaWNoIGFyZSBjb21tb25cbiAqIHRvIGV2ZXJ5IEFuZ3VsYXIgYXBwbGljYXRpb24gcnVubmluZyBvbiB0aGUgcGFnZSBhcmUgYm91bmQgaW4gaXRzIHNjb3BlLlxuICpcbiAqIEEgcGFnZSdzIHBsYXRmb3JtIGlzIGluaXRpYWxpemVkIGltcGxpY2l0bHkgd2hlbiB7QGxpbmsgYm9vdHN0cmFwfSgpIGlzIGNhbGxlZCwgb3JcbiAqIGV4cGxpY2l0bHkgYnkgY2FsbGluZyB7QGxpbmsgcGxhdGZvcm19KCkuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQbGF0Zm9ybVJlZiB7XG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBwbGF0Zm9ybSBpcyBkaXNwb3NlZC5cbiAgICovXG4gIGFic3RyYWN0IHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgcGxhdGZvcm0ge0BsaW5rIEluamVjdG9yfSwgd2hpY2ggaXMgdGhlIHBhcmVudCBpbmplY3RvciBmb3JcbiAgICogZXZlcnkgQW5ndWxhciBhcHBsaWNhdGlvbiBvbiB0aGUgcGFnZSBhbmQgcHJvdmlkZXMgc2luZ2xldG9uIHByb3ZpZGVycy5cbiAgICovXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlIGEgbmV3IEFuZ3VsYXIgYXBwbGljYXRpb24gb24gdGhlIHBhZ2UuXG4gICAqXG4gICAqICMjIyBXaGF0IGlzIGFuIGFwcGxpY2F0aW9uP1xuICAgKlxuICAgKiBFYWNoIEFuZ3VsYXIgYXBwbGljYXRpb24gaGFzIGl0cyBvd24gem9uZSwgY2hhbmdlIGRldGVjdGlvbiwgY29tcGlsZXIsXG4gICAqIHJlbmRlcmVyLCBhbmQgb3RoZXIgZnJhbWV3b3JrIGNvbXBvbmVudHMuIEFuIGFwcGxpY2F0aW9uIGhvc3RzIG9uZSBvciBtb3JlXG4gICAqIHJvb3QgY29tcG9uZW50cywgd2hpY2ggY2FuIGJlIGluaXRpYWxpemVkIHZpYSBgQXBwbGljYXRpb25SZWYuYm9vdHN0cmFwKClgLlxuICAgKlxuICAgKiAjIyMgQXBwbGljYXRpb24gUHJvdmlkZXJzXG4gICAqXG4gICAqIEFuZ3VsYXIgYXBwbGljYXRpb25zIHJlcXVpcmUgbnVtZXJvdXMgcHJvdmlkZXJzIHRvIGJlIHByb3Blcmx5IGluc3RhbnRpYXRlZC5cbiAgICogV2hlbiB1c2luZyBgYXBwbGljYXRpb24oKWAgdG8gY3JlYXRlIGEgbmV3IGFwcCBvbiB0aGUgcGFnZSwgdGhlc2UgcHJvdmlkZXJzXG4gICAqIG11c3QgYmUgcHJvdmlkZWQuIEZvcnR1bmF0ZWx5LCB0aGVyZSBhcmUgaGVscGVyIGZ1bmN0aW9ucyB0byBjb25maWd1cmVcbiAgICogdHlwaWNhbCBwcm92aWRlcnMsIGFzIHNob3duIGluIHRoZSBleGFtcGxlIGJlbG93LlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKiBgYGBcbiAgICogdmFyIG15QXBwUHJvdmlkZXJzID0gW015QXBwU2VydmljZV07XG4gICAqXG4gICAqIHBsYXRmb3JtKClcbiAgICogICAuYXBwbGljYXRpb24oW215QXBwUHJvdmlkZXJzXSlcbiAgICogICAuYm9vdHN0cmFwKE15VG9wTGV2ZWxDb21wb25lbnQpO1xuICAgKiBgYGBcbiAgICogIyMjIFNlZSBBbHNvXG4gICAqXG4gICAqIFNlZSB0aGUge0BsaW5rIGJvb3RzdHJhcH0gZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKi9cbiAgYWJzdHJhY3QgYXBwbGljYXRpb24ocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBBcHBsaWNhdGlvblJlZjtcblxuICAvKipcbiAgICogSW5zdGFudGlhdGUgYSBuZXcgQW5ndWxhciBhcHBsaWNhdGlvbiBvbiB0aGUgcGFnZSwgdXNpbmcgcHJvdmlkZXJzIHdoaWNoXG4gICAqIGFyZSBvbmx5IGF2YWlsYWJsZSBhc3luY2hyb25vdXNseS4gT25lIHN1Y2ggdXNlIGNhc2UgaXMgdG8gaW5pdGlhbGl6ZSBhblxuICAgKiBhcHBsaWNhdGlvbiBydW5uaW5nIGluIGEgd2ViIHdvcmtlci5cbiAgICpcbiAgICogIyMjIFVzYWdlXG4gICAqXG4gICAqIGBiaW5kaW5nRm5gIGlzIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGNhbGxlZCBpbiB0aGUgbmV3IGFwcGxpY2F0aW9uJ3Mgem9uZS5cbiAgICogSXQgc2hvdWxkIHJldHVybiBhIGBQcm9taXNlYCB0byBhIGxpc3Qgb2YgcHJvdmlkZXJzIHRvIGJlIHVzZWQgZm9yIHRoZVxuICAgKiBuZXcgYXBwbGljYXRpb24uIE9uY2UgdGhpcyBwcm9taXNlIHJlc29sdmVzLCB0aGUgYXBwbGljYXRpb24gd2lsbCBiZVxuICAgKiBjb25zdHJ1Y3RlZCBpbiB0aGUgc2FtZSBtYW5uZXIgYXMgYSBub3JtYWwgYGFwcGxpY2F0aW9uKClgLlxuICAgKi9cbiAgYWJzdHJhY3QgYXN5bmNBcHBsaWNhdGlvbihiaW5kaW5nRm46ICh6b25lOiBOZ1pvbmUpID0+IFByb21pc2U8QXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+PixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPEFwcGxpY2F0aW9uUmVmPjtcblxuICAvKipcbiAgICogRGVzdHJveSB0aGUgQW5ndWxhciBwbGF0Zm9ybSBhbmQgYWxsIEFuZ3VsYXIgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlLlxuICAgKi9cbiAgYWJzdHJhY3QgZGlzcG9zZSgpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgUGxhdGZvcm1SZWZfIGV4dGVuZHMgUGxhdGZvcm1SZWYge1xuICAvKiogQGludGVybmFsICovXG4gIF9hcHBsaWNhdGlvbnM6IEFwcGxpY2F0aW9uUmVmW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGlzcG9zZUxpc3RlbmVyczogRnVuY3Rpb25bXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2luamVjdG9yOiBJbmplY3RvciwgcHJpdmF0ZSBfZGlzcG9zZTogKCkgPT4gdm9pZCkgeyBzdXBlcigpOyB9XG5cbiAgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLnB1c2goZGlzcG9zZSk7IH1cblxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5faW5qZWN0b3I7IH1cblxuICBhcHBsaWNhdGlvbihwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IEFwcGxpY2F0aW9uUmVmIHtcbiAgICB2YXIgYXBwID0gdGhpcy5faW5pdEFwcChjcmVhdGVOZ1pvbmUoKSwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gYXBwO1xuICB9XG5cbiAgYXN5bmNBcHBsaWNhdGlvbihiaW5kaW5nRm46ICh6b25lOiBOZ1pvbmUpID0+IFByb21pc2U8QXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+PixcbiAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxBcHBsaWNhdGlvblJlZj4ge1xuICAgIHZhciB6b25lID0gY3JlYXRlTmdab25lKCk7XG4gICAgdmFyIGNvbXBsZXRlciA9IFByb21pc2VXcmFwcGVyLmNvbXBsZXRlcigpO1xuICAgIHpvbmUucnVuKCgpID0+IHtcbiAgICAgIFByb21pc2VXcmFwcGVyLnRoZW4oYmluZGluZ0ZuKHpvbmUpLCAocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pID0+IHtcbiAgICAgICAgaWYgKGlzUHJlc2VudChhZGRpdGlvbmFsUHJvdmlkZXJzKSkge1xuICAgICAgICAgIHByb3ZpZGVycyA9IExpc3RXcmFwcGVyLmNvbmNhdChwcm92aWRlcnMsIGFkZGl0aW9uYWxQcm92aWRlcnMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbXBsZXRlci5yZXNvbHZlKHRoaXMuX2luaXRBcHAoem9uZSwgcHJvdmlkZXJzKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29tcGxldGVyLnByb21pc2U7XG4gIH1cblxuICBwcml2YXRlIF9pbml0QXBwKHpvbmU6IE5nWm9uZSwgcHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBBcHBsaWNhdGlvblJlZiB7XG4gICAgdmFyIGluamVjdG9yOiBJbmplY3RvcjtcbiAgICB2YXIgYXBwOiBBcHBsaWNhdGlvblJlZjtcbiAgICB6b25lLnJ1bigoKSA9PiB7XG4gICAgICBwcm92aWRlcnMgPSBMaXN0V3JhcHBlci5jb25jYXQocHJvdmlkZXJzLCBbXG4gICAgICAgIHByb3ZpZGUoTmdab25lLCB7dXNlVmFsdWU6IHpvbmV9KSxcbiAgICAgICAgcHJvdmlkZShBcHBsaWNhdGlvblJlZiwge3VzZUZhY3Rvcnk6ICgpOiBBcHBsaWNhdGlvblJlZiA9PiBhcHAsIGRlcHM6IFtdfSlcbiAgICAgIF0pO1xuXG4gICAgICB2YXIgZXhjZXB0aW9uSGFuZGxlcjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGluamVjdG9yID0gdGhpcy5pbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQocHJvdmlkZXJzKTtcbiAgICAgICAgZXhjZXB0aW9uSGFuZGxlciA9IGluamVjdG9yLmdldChFeGNlcHRpb25IYW5kbGVyKTtcbiAgICAgICAgem9uZS5vdmVycmlkZU9uRXJyb3JIYW5kbGVyKChlLCBzKSA9PiBleGNlcHRpb25IYW5kbGVyLmNhbGwoZSwgcykpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGV4Y2VwdGlvbkhhbmRsZXIpKSB7XG4gICAgICAgICAgZXhjZXB0aW9uSGFuZGxlci5jYWxsKGUsIGUuc3RhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByaW50KGUudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBhcHAgPSBuZXcgQXBwbGljYXRpb25SZWZfKHRoaXMsIHpvbmUsIGluamVjdG9yKTtcbiAgICB0aGlzLl9hcHBsaWNhdGlvbnMucHVzaChhcHApO1xuICAgIF9ydW5BcHBJbml0aWFsaXplcnMoaW5qZWN0b3IpO1xuICAgIHJldHVybiBhcHA7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLmNsb25lKHRoaXMuX2FwcGxpY2F0aW9ucykuZm9yRWFjaCgoYXBwKSA9PiBhcHAuZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLmZvckVhY2goKGRpc3Bvc2UpID0+IGRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXBwbGljYXRpb25EaXNwb3NlZChhcHA6IEFwcGxpY2F0aW9uUmVmKTogdm9pZCB7IExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9hcHBsaWNhdGlvbnMsIGFwcCk7IH1cbn1cblxuZnVuY3Rpb24gX3J1bkFwcEluaXRpYWxpemVycyhpbmplY3RvcjogSW5qZWN0b3IpOiB2b2lkIHtcbiAgbGV0IGluaXRzOiBGdW5jdGlvbltdID0gaW5qZWN0b3IuZ2V0T3B0aW9uYWwoQVBQX0lOSVRJQUxJWkVSKTtcbiAgaWYgKGlzUHJlc2VudChpbml0cykpIGluaXRzLmZvckVhY2goaW5pdCA9PiBpbml0KCkpO1xufVxuXG4vKipcbiAqIEEgcmVmZXJlbmNlIHRvIGFuIEFuZ3VsYXIgYXBwbGljYXRpb24gcnVubmluZyBvbiBhIHBhZ2UuXG4gKlxuICogRm9yIG1vcmUgYWJvdXQgQW5ndWxhciBhcHBsaWNhdGlvbnMsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3Ige0BsaW5rIGJvb3RzdHJhcH0uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBcHBsaWNhdGlvblJlZiB7XG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCBlYWNoIHRpbWUgYGJvb3RzdHJhcCgpYCBpcyBjYWxsZWQgdG8gYm9vdHN0cmFwXG4gICAqIGEgbmV3IHJvb3QgY29tcG9uZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgcmVnaXN0ZXJCb290c3RyYXBMaXN0ZW5lcihsaXN0ZW5lcjogKHJlZjogQ29tcG9uZW50UmVmKSA9PiB2b2lkKTogdm9pZDtcblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBsaXN0ZW5lciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYXBwbGljYXRpb24gaXMgZGlzcG9zZWQuXG4gICAqL1xuICBhYnN0cmFjdCByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZDtcblxuICAvKipcbiAgICogQm9vdHN0cmFwIGEgbmV3IGNvbXBvbmVudCBhdCB0aGUgcm9vdCBsZXZlbCBvZiB0aGUgYXBwbGljYXRpb24uXG4gICAqXG4gICAqICMjIyBCb290c3RyYXAgcHJvY2Vzc1xuICAgKlxuICAgKiBXaGVuIGJvb3RzdHJhcHBpbmcgYSBuZXcgcm9vdCBjb21wb25lbnQgaW50byBhbiBhcHBsaWNhdGlvbiwgQW5ndWxhciBtb3VudHMgdGhlXG4gICAqIHNwZWNpZmllZCBhcHBsaWNhdGlvbiBjb21wb25lbnQgb250byBET00gZWxlbWVudHMgaWRlbnRpZmllZCBieSB0aGUgW2NvbXBvbmVudFR5cGVdJ3NcbiAgICogc2VsZWN0b3IgYW5kIGtpY2tzIG9mZiBhdXRvbWF0aWMgY2hhbmdlIGRldGVjdGlvbiB0byBmaW5pc2ggaW5pdGlhbGl6aW5nIHRoZSBjb21wb25lbnQuXG4gICAqXG4gICAqICMjIyBPcHRpb25hbCBQcm92aWRlcnNcbiAgICpcbiAgICogUHJvdmlkZXJzIGZvciB0aGUgZ2l2ZW4gY29tcG9uZW50IGNhbiBvcHRpb25hbGx5IGJlIG92ZXJyaWRkZW4gdmlhIHRoZSBgcHJvdmlkZXJzYFxuICAgKiBwYXJhbWV0ZXIuIFRoZXNlIHByb3ZpZGVycyB3aWxsIG9ubHkgYXBwbHkgZm9yIHRoZSByb290IGNvbXBvbmVudCBiZWluZyBhZGRlZCBhbmQgYW55XG4gICAqIGNoaWxkIGNvbXBvbmVudHMgdW5kZXIgaXQuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqIGBgYFxuICAgKiB2YXIgYXBwID0gcGxhdGZvcm0uYXBwbGljYXRpb24oW2FwcFByb3ZpZGVyc107XG4gICAqIGFwcC5ib290c3RyYXAoRmlyc3RSb290Q29tcG9uZW50KTtcbiAgICogYXBwLmJvb3RzdHJhcChTZWNvbmRSb290Q29tcG9uZW50LCBbcHJvdmlkZShPdmVycmlkZUJpbmRpbmcsIHt1c2VDbGFzczogT3ZlcnJpZGRlbkJpbmRpbmd9KV0pO1xuICAgKiBgYGBcbiAgICovXG4gIGFic3RyYWN0IGJvb3RzdHJhcChjb21wb25lbnRUeXBlOiBUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxDb21wb25lbnRSZWY+O1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgYXBwbGljYXRpb24ge0BsaW5rIEluamVjdG9yfS5cbiAgICovXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBhcHBsaWNhdGlvbiB7QGxpbmsgTmdab25lfS5cbiAgICovXG4gIGdldCB6b25lKCk6IE5nWm9uZSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIERpc3Bvc2Ugb2YgdGhpcyBhcHBsaWNhdGlvbiBhbmQgYWxsIG9mIGl0cyBjb21wb25lbnRzLlxuICAgKi9cbiAgYWJzdHJhY3QgZGlzcG9zZSgpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBJbnZva2UgdGhpcyBtZXRob2QgdG8gZXhwbGljaXRseSBwcm9jZXNzIGNoYW5nZSBkZXRlY3Rpb24gYW5kIGl0cyBzaWRlLWVmZmVjdHMuXG4gICAqXG4gICAqIEluIGRldmVsb3BtZW50IG1vZGUsIGB0aWNrKClgIGFsc28gcGVyZm9ybXMgYSBzZWNvbmQgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSB0byBlbnN1cmUgdGhhdCBub1xuICAgKiBmdXJ0aGVyIGNoYW5nZXMgYXJlIGRldGVjdGVkLiBJZiBhZGRpdGlvbmFsIGNoYW5nZXMgYXJlIHBpY2tlZCB1cCBkdXJpbmcgdGhpcyBzZWNvbmQgY3ljbGUsXG4gICAqIGJpbmRpbmdzIGluIHRoZSBhcHAgaGF2ZSBzaWRlLWVmZmVjdHMgdGhhdCBjYW5ub3QgYmUgcmVzb2x2ZWQgaW4gYSBzaW5nbGUgY2hhbmdlIGRldGVjdGlvblxuICAgKiBwYXNzLlxuICAgKiBJbiB0aGlzIGNhc2UsIEFuZ3VsYXIgdGhyb3dzIGFuIGVycm9yLCBzaW5jZSBhbiBBbmd1bGFyIGFwcGxpY2F0aW9uIGNhbiBvbmx5IGhhdmUgb25lIGNoYW5nZVxuICAgKiBkZXRlY3Rpb24gcGFzcyBkdXJpbmcgd2hpY2ggYWxsIGNoYW5nZSBkZXRlY3Rpb24gbXVzdCBjb21wbGV0ZS5cbiAgICovXG4gIGFic3RyYWN0IHRpY2soKTogdm9pZDtcblxuICAvKipcbiAgICogR2V0IGEgbGlzdCBvZiBjb21wb25lbnQgdHlwZXMgcmVnaXN0ZXJlZCB0byB0aGlzIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgZ2V0IGNvbXBvbmVudFR5cGVzKCk6IFR5cGVbXSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG59XG5cbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvblJlZl8gZXh0ZW5kcyBBcHBsaWNhdGlvblJlZiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF90aWNrU2NvcGU6IFd0ZlNjb3BlRm4gPSB3dGZDcmVhdGVTY29wZSgnQXBwbGljYXRpb25SZWYjdGljaygpJyk7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9ib290c3RyYXBMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9kaXNwb3NlTGlzdGVuZXJzOiBGdW5jdGlvbltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfcm9vdENvbXBvbmVudHM6IENvbXBvbmVudFJlZltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfcm9vdENvbXBvbmVudFR5cGVzOiBUeXBlW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZnM6IENoYW5nZURldGVjdG9yUmVmW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9ydW5uaW5nVGljazogYm9vbGVhbiA9IGZhbHNlO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2VuZm9yY2VOb05ld0NoYW5nZXM6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm1SZWZfLCBwcml2YXRlIF96b25lOiBOZ1pvbmUsIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl96b25lKSkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHRoaXMuX3pvbmUub25UdXJuRG9uZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoXykgPT4geyB0aGlzLl96b25lLnJ1bigoKSA9PiB7IHRoaXMudGljaygpOyB9KTsgfSk7XG4gICAgfVxuICAgIHRoaXMuX2VuZm9yY2VOb05ld0NoYW5nZXMgPSBhc3NlcnRpb25zRW5hYmxlZCgpO1xuICB9XG5cbiAgcmVnaXN0ZXJCb290c3RyYXBMaXN0ZW5lcihsaXN0ZW5lcjogKHJlZjogQ29tcG9uZW50UmVmKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5fYm9vdHN0cmFwTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICB9XG5cbiAgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLnB1c2goZGlzcG9zZSk7IH1cblxuICByZWdpc3RlckNoYW5nZURldGVjdG9yKGNoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZik6IHZvaWQge1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcy5wdXNoKGNoYW5nZURldGVjdG9yKTtcbiAgfVxuXG4gIHVucmVnaXN0ZXJDaGFuZ2VEZXRlY3RvcihjaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYpOiB2b2lkIHtcbiAgICBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWZzLCBjaGFuZ2VEZXRlY3Rvcik7XG4gIH1cblxuICBib290c3RyYXAoY29tcG9uZW50VHlwZTogVHlwZSxcbiAgICAgICAgICAgIHByb3ZpZGVycz86IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFByb21pc2U8Q29tcG9uZW50UmVmPiB7XG4gICAgdmFyIGNvbXBsZXRlciA9IFByb21pc2VXcmFwcGVyLmNvbXBsZXRlcigpO1xuICAgIHRoaXMuX3pvbmUucnVuKCgpID0+IHtcbiAgICAgIHZhciBjb21wb25lbnRQcm92aWRlcnMgPSBfY29tcG9uZW50UHJvdmlkZXJzKGNvbXBvbmVudFR5cGUpO1xuICAgICAgaWYgKGlzUHJlc2VudChwcm92aWRlcnMpKSB7XG4gICAgICAgIGNvbXBvbmVudFByb3ZpZGVycy5wdXNoKHByb3ZpZGVycyk7XG4gICAgICB9XG4gICAgICB2YXIgZXhjZXB0aW9uSGFuZGxlciA9IHRoaXMuX2luamVjdG9yLmdldChFeGNlcHRpb25IYW5kbGVyKTtcbiAgICAgIHRoaXMuX3Jvb3RDb21wb25lbnRUeXBlcy5wdXNoKGNvbXBvbmVudFR5cGUpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGluamVjdG9yOiBJbmplY3RvciA9IHRoaXMuX2luamVjdG9yLnJlc29sdmVBbmRDcmVhdGVDaGlsZChjb21wb25lbnRQcm92aWRlcnMpO1xuICAgICAgICB2YXIgY29tcFJlZlRva2VuOiBQcm9taXNlPENvbXBvbmVudFJlZj4gPSBpbmplY3Rvci5nZXQoQVBQX0NPTVBPTkVOVF9SRUZfUFJPTUlTRSk7XG4gICAgICAgIHZhciB0aWNrID0gKGNvbXBvbmVudFJlZikgPT4ge1xuICAgICAgICAgIHRoaXMuX2xvYWRDb21wb25lbnQoY29tcG9uZW50UmVmKTtcbiAgICAgICAgICBjb21wbGV0ZXIucmVzb2x2ZShjb21wb25lbnRSZWYpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciB0aWNrUmVzdWx0ID0gUHJvbWlzZVdyYXBwZXIudGhlbihjb21wUmVmVG9rZW4sIHRpY2spO1xuXG4gICAgICAgIFByb21pc2VXcmFwcGVyLnRoZW4odGlja1Jlc3VsdCwgKF8pID0+IHt9KTtcbiAgICAgICAgUHJvbWlzZVdyYXBwZXIudGhlbih0aWNrUmVzdWx0LCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChlcnIsIHN0YWNrVHJhY2UpID0+IGNvbXBsZXRlci5yZWplY3QoZXJyLCBzdGFja1RyYWNlKSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGV4Y2VwdGlvbkhhbmRsZXIuY2FsbChlLCBlLnN0YWNrKTtcbiAgICAgICAgY29tcGxldGVyLnJlamVjdChlLCBlLnN0YWNrKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29tcGxldGVyLnByb21pc2U7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9sb2FkQ29tcG9uZW50KHJlZik6IHZvaWQge1xuICAgIHZhciBhcHBDaGFuZ2VEZXRlY3RvciA9IGludGVybmFsVmlldyhyZWYuaG9zdFZpZXcpLmNoYW5nZURldGVjdG9yO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcy5wdXNoKGFwcENoYW5nZURldGVjdG9yLnJlZik7XG4gICAgdGhpcy50aWNrKCk7XG4gICAgdGhpcy5fcm9vdENvbXBvbmVudHMucHVzaChyZWYpO1xuICAgIHRoaXMuX2Jvb3RzdHJhcExpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4gbGlzdGVuZXIocmVmKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91bmxvYWRDb21wb25lbnQocmVmKTogdm9pZCB7XG4gICAgaWYgKCFMaXN0V3JhcHBlci5jb250YWlucyh0aGlzLl9yb290Q29tcG9uZW50cywgcmVmKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnVucmVnaXN0ZXJDaGFuZ2VEZXRlY3RvcihpbnRlcm5hbFZpZXcocmVmLmhvc3RWaWV3KS5jaGFuZ2VEZXRlY3Rvci5yZWYpO1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9yb290Q29tcG9uZW50cywgcmVmKTtcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9pbmplY3RvcjsgfVxuXG4gIGdldCB6b25lKCk6IE5nWm9uZSB7IHJldHVybiB0aGlzLl96b25lOyB9XG5cbiAgdGljaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcnVubmluZ1RpY2spIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiQXBwbGljYXRpb25SZWYudGljayBpcyBjYWxsZWQgcmVjdXJzaXZlbHlcIik7XG4gICAgfVxuXG4gICAgdmFyIHMgPSBBcHBsaWNhdGlvblJlZl8uX3RpY2tTY29wZSgpO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IHRydWU7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMuZm9yRWFjaCgoZGV0ZWN0b3IpID0+IGRldGVjdG9yLmRldGVjdENoYW5nZXMoKSk7XG4gICAgICBpZiAodGhpcy5fZW5mb3JjZU5vTmV3Q2hhbmdlcykge1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMuZm9yRWFjaCgoZGV0ZWN0b3IpID0+IGRldGVjdG9yLmNoZWNrTm9DaGFuZ2VzKCkpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IGZhbHNlO1xuICAgICAgd3RmTGVhdmUocyk7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICAvLyBUT0RPKGFseGh1Yik6IERpc3Bvc2Ugb2YgdGhlIE5nWm9uZS5cbiAgICBMaXN0V3JhcHBlci5jbG9uZSh0aGlzLl9yb290Q29tcG9uZW50cykuZm9yRWFjaCgocmVmKSA9PiByZWYuZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLmZvckVhY2goKGRpc3Bvc2UpID0+IGRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fcGxhdGZvcm0uX2FwcGxpY2F0aW9uRGlzcG9zZWQodGhpcyk7XG4gIH1cblxuICBnZXQgY29tcG9uZW50VHlwZXMoKTogYW55W10geyByZXR1cm4gdGhpcy5fcm9vdENvbXBvbmVudFR5cGVzOyB9XG59XG4iXX0=