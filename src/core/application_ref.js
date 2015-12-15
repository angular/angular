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
var console_1 = require('angular2/src/core/console');
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
    lang_2.lockMode();
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
                // THIS MUST ONLY RUN IN DART.
                // This is required to report an error when no components with a matching selector found.
                // Otherwise the promise will never be completed.
                // Doing this in JS causes an extra error message to appear.
                if (lang_1.IS_DART) {
                    async_1.PromiseWrapper.then(tickResult, function (_) { });
                }
                async_1.PromiseWrapper.then(tickResult, null, function (err, stackTrace) { return completer.reject(err, stackTrace); });
            }
            catch (e) {
                exceptionHandler.call(e, e.stack);
                completer.reject(e, e.stack);
            }
        });
        return completer.promise.then(function (_) {
            var c = _this._injector.get(console_1.Console);
            var modeDescription = lang_1.assertionsEnabled() ?
                "in the development mode. Call enableProdMode() to enable the production mode." :
                "in the production mode. Call enableDevMode() to enable the development mode.";
            c.log("Angular 2 is running " + modeDescription);
            return _;
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmLnRzIl0sIm5hbWVzIjpbIl9jb21wb25lbnRQcm92aWRlcnMiLCJjcmVhdGVOZ1pvbmUiLCJwbGF0Zm9ybSIsImRpc3Bvc2VQbGF0Zm9ybSIsIl9jcmVhdGVQbGF0Zm9ybSIsIl9ydW5QbGF0Zm9ybUluaXRpYWxpemVycyIsIlBsYXRmb3JtUmVmIiwiUGxhdGZvcm1SZWYuY29uc3RydWN0b3IiLCJQbGF0Zm9ybVJlZi5pbmplY3RvciIsIlBsYXRmb3JtUmVmXyIsIlBsYXRmb3JtUmVmXy5jb25zdHJ1Y3RvciIsIlBsYXRmb3JtUmVmXy5yZWdpc3RlckRpc3Bvc2VMaXN0ZW5lciIsIlBsYXRmb3JtUmVmXy5pbmplY3RvciIsIlBsYXRmb3JtUmVmXy5hcHBsaWNhdGlvbiIsIlBsYXRmb3JtUmVmXy5hc3luY0FwcGxpY2F0aW9uIiwiUGxhdGZvcm1SZWZfLl9pbml0QXBwIiwiUGxhdGZvcm1SZWZfLmRpc3Bvc2UiLCJQbGF0Zm9ybVJlZl8uX2FwcGxpY2F0aW9uRGlzcG9zZWQiLCJfcnVuQXBwSW5pdGlhbGl6ZXJzIiwiQXBwbGljYXRpb25SZWYiLCJBcHBsaWNhdGlvblJlZi5jb25zdHJ1Y3RvciIsIkFwcGxpY2F0aW9uUmVmLmluamVjdG9yIiwiQXBwbGljYXRpb25SZWYuem9uZSIsIkFwcGxpY2F0aW9uUmVmLmNvbXBvbmVudFR5cGVzIiwiQXBwbGljYXRpb25SZWZfIiwiQXBwbGljYXRpb25SZWZfLmNvbnN0cnVjdG9yIiwiQXBwbGljYXRpb25SZWZfLnJlZ2lzdGVyQm9vdHN0cmFwTGlzdGVuZXIiLCJBcHBsaWNhdGlvblJlZl8ucmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIiLCJBcHBsaWNhdGlvblJlZl8ucmVnaXN0ZXJDaGFuZ2VEZXRlY3RvciIsIkFwcGxpY2F0aW9uUmVmXy51bnJlZ2lzdGVyQ2hhbmdlRGV0ZWN0b3IiLCJBcHBsaWNhdGlvblJlZl8uYm9vdHN0cmFwIiwiQXBwbGljYXRpb25SZWZfLl9sb2FkQ29tcG9uZW50IiwiQXBwbGljYXRpb25SZWZfLl91bmxvYWRDb21wb25lbnQiLCJBcHBsaWNhdGlvblJlZl8uaW5qZWN0b3IiLCJBcHBsaWNhdGlvblJlZl8uem9uZSIsIkFwcGxpY2F0aW9uUmVmXy50aWNrIiwiQXBwbGljYXRpb25SZWZfLmRpc3Bvc2UiLCJBcHBsaWNhdGlvblJlZl8uY29tcG9uZW50VHlwZXMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0JBQXFCLGdDQUFnQyxDQUFDLENBQUE7QUFDdEQscUJBT08sMEJBQTBCLENBQUMsQ0FBQTtBQUNsQyxtQkFBdUQsc0JBQXNCLENBQUMsQ0FBQTtBQUM5RSxtQ0FNTyxzQkFBc0IsQ0FBQyxDQUFBO0FBQzlCLHNCQUtPLDJCQUEyQixDQUFDLENBQUE7QUFDbkMsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QsNEJBQStDLDJDQUEyQyxDQUFDLENBQUE7QUFDM0YseUNBR08sbURBQW1ELENBQUMsQ0FBQTtBQUMzRCwyQkFLTyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ3hDLHlCQUEyQixtQ0FBbUMsQ0FBQyxDQUFBO0FBQy9ELHdCQUFzQiwyQkFBMkIsQ0FBQyxDQUFBO0FBQ2xELHdCQUFtRCxtQkFBbUIsQ0FBQyxDQUFBO0FBRXZFLHFCQUF1QiwwQkFBMEIsQ0FBQyxDQUFBO0FBRWxEOztHQUVHO0FBQ0gsNkJBQTZCLGdCQUFzQjtJQUNqREEsTUFBTUEsQ0FBQ0E7UUFDTEEsWUFBT0EsQ0FBQ0Esa0NBQWFBLEVBQUVBLEVBQUNBLFFBQVFBLEVBQUVBLGdCQUFnQkEsRUFBQ0EsQ0FBQ0E7UUFDcERBLFlBQU9BLENBQUNBLDhDQUF5QkEsRUFDekJBO1lBQ0VBLFVBQVVBLEVBQUVBLFVBQUNBLHNCQUE4Q0EsRUFBRUEsTUFBdUJBLEVBQ3ZFQSxRQUFrQkE7Z0JBQzdCQSw0Q0FBNENBO2dCQUM1Q0EsSUFBSUEsR0FBaUJBLENBQUNBO2dCQUN0QkEsMEVB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QUFBREEsQ0FBQ0EsQUF4SUQsRUFBcUMsY0FBYyxFQXdJbEQ7QUF4SVksdUJBQWUsa0JBd0kzQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5pbXBvcnQge1xuICBUeXBlLFxuICBpc0JsYW5rLFxuICBpc1ByZXNlbnQsXG4gIGFzc2VydGlvbnNFbmFibGVkLFxuICBwcmludCxcbiAgSVNfREFSVFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtwcm92aWRlLCBQcm92aWRlciwgSW5qZWN0b3IsIE9wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1xuICBBUFBfQ09NUE9ORU5UX1JFRl9QUk9NSVNFLFxuICBBUFBfQ09NUE9ORU5ULFxuICBBUFBfSURfUkFORE9NX1BST1ZJREVSLFxuICBQTEFURk9STV9JTklUSUFMSVpFUixcbiAgQVBQX0lOSVRJQUxJWkVSXG59IGZyb20gJy4vYXBwbGljYXRpb25fdG9rZW5zJztcbmltcG9ydCB7XG4gIFByb21pc2UsXG4gIFByb21pc2VXcmFwcGVyLFxuICBQcm9taXNlQ29tcGxldGVyLFxuICBPYnNlcnZhYmxlV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1Rlc3RhYmlsaXR5UmVnaXN0cnksIFRlc3RhYmlsaXR5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS90ZXN0YWJpbGl0eS90ZXN0YWJpbGl0eSc7XG5pbXBvcnQge1xuICBDb21wb25lbnRSZWYsXG4gIER5bmFtaWNDb21wb25lbnRMb2FkZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2R5bmFtaWNfY29tcG9uZW50X2xvYWRlcic7XG5pbXBvcnQge1xuICBCYXNlRXhjZXB0aW9uLFxuICBXcmFwcGVkRXhjZXB0aW9uLFxuICBFeGNlcHRpb25IYW5kbGVyLFxuICB1bmltcGxlbWVudGVkXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge2ludGVybmFsVmlld30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfcmVmJztcbmltcG9ydCB7Q29uc29sZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY29uc29sZSc7XG5pbXBvcnQge3d0ZkxlYXZlLCB3dGZDcmVhdGVTY29wZSwgV3RmU2NvcGVGbn0gZnJvbSAnLi9wcm9maWxlL3Byb2ZpbGUnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7bG9ja01vZGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogQ29uc3RydWN0IHByb3ZpZGVycyBzcGVjaWZpYyB0byBhbiBpbmRpdmlkdWFsIHJvb3QgY29tcG9uZW50LlxuICovXG5mdW5jdGlvbiBfY29tcG9uZW50UHJvdmlkZXJzKGFwcENvbXBvbmVudFR5cGU6IFR5cGUpOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4ge1xuICByZXR1cm4gW1xuICAgIHByb3ZpZGUoQVBQX0NPTVBPTkVOVCwge3VzZVZhbHVlOiBhcHBDb21wb25lbnRUeXBlfSksXG4gICAgcHJvdmlkZShBUFBfQ09NUE9ORU5UX1JFRl9QUk9NSVNFLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB1c2VGYWN0b3J5OiAoZHluYW1pY0NvbXBvbmVudExvYWRlcjogRHluYW1pY0NvbXBvbmVudExvYWRlciwgYXBwUmVmOiBBcHBsaWNhdGlvblJlZl8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBTYXZlIHRoZSBDb21wb25lbnRSZWYgZm9yIGRpc3Bvc2FsIGxhdGVyLlxuICAgICAgICAgICAgICAgIHZhciByZWY6IENvbXBvbmVudFJlZjtcbiAgICAgICAgICAgICAgICAvLyBUT0RPKHJhZG8pOiBpbnZlc3RpZ2F0ZSB3aGV0aGVyIHRvIHN1cHBvcnQgcHJvdmlkZXJzIG9uIHJvb3QgY29tcG9uZW50LlxuICAgICAgICAgICAgICAgIHJldHVybiBkeW5hbWljQ29tcG9uZW50TG9hZGVyLmxvYWRBc1Jvb3QoYXBwQ29tcG9uZW50VHlwZSwgbnVsbCwgaW5qZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7IGFwcFJlZi5fdW5sb2FkQ29tcG9uZW50KHJlZik7IH0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChjb21wb25lbnRSZWYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZWYgPSBjb21wb25lbnRSZWY7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChjb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdG9yLmdldChUZXN0YWJpbGl0eVJlZ2lzdHJ5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZWdpc3RlckFwcGxpY2F0aW9uKGNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdG9yLmdldChUZXN0YWJpbGl0eSkpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcG9uZW50UmVmO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZGVwczogW0R5bmFtaWNDb21wb25lbnRMb2FkZXIsIEFwcGxpY2F0aW9uUmVmLCBJbmplY3Rvcl1cbiAgICAgICAgICAgIH0pLFxuICAgIHByb3ZpZGUoYXBwQ29tcG9uZW50VHlwZSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdXNlRmFjdG9yeTogKHA6IFByb21pc2U8YW55PikgPT4gcC50aGVuKHJlZiA9PiByZWYuaW5zdGFuY2UpLFxuICAgICAgICAgICAgICBkZXBzOiBbQVBQX0NPTVBPTkVOVF9SRUZfUFJPTUlTRV1cbiAgICAgICAgICAgIH0pLFxuICBdO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBBbmd1bGFyIHpvbmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOZ1pvbmUoKTogTmdab25lIHtcbiAgcmV0dXJuIG5ldyBOZ1pvbmUoe2VuYWJsZUxvbmdTdGFja1RyYWNlOiBhc3NlcnRpb25zRW5hYmxlZCgpfSk7XG59XG5cbnZhciBfcGxhdGZvcm06IFBsYXRmb3JtUmVmO1xudmFyIF9wbGF0Zm9ybVByb3ZpZGVyczogYW55W107XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgQW5ndWxhciAncGxhdGZvcm0nIG9uIHRoZSBwYWdlLlxuICpcbiAqIFNlZSB7QGxpbmsgUGxhdGZvcm1SZWZ9IGZvciBkZXRhaWxzIG9uIHRoZSBBbmd1bGFyIHBsYXRmb3JtLlxuICpcbiAqIEl0IGlzIGFsc28gcG9zc2libGUgdG8gc3BlY2lmeSBwcm92aWRlcnMgdG8gYmUgbWFkZSBpbiB0aGUgbmV3IHBsYXRmb3JtLiBUaGVzZSBwcm92aWRlcnNcbiAqIHdpbGwgYmUgc2hhcmVkIGJldHdlZW4gYWxsIGFwcGxpY2F0aW9ucyBvbiB0aGUgcGFnZS4gRm9yIGV4YW1wbGUsIGFuIGFic3RyYWN0aW9uIGZvclxuICogdGhlIGJyb3dzZXIgY29va2llIGphciBzaG91bGQgYmUgYm91bmQgYXQgdGhlIHBsYXRmb3JtIGxldmVsLCBiZWNhdXNlIHRoZXJlIGlzIG9ubHkgb25lXG4gKiBjb29raWUgamFyIHJlZ2FyZGxlc3Mgb2YgaG93IG1hbnkgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlIHdpbGwgYmUgYWNjZXNzaW5nIGl0LlxuICpcbiAqIFRoZSBwbGF0Zm9ybSBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGFzIGxvbmcgYXMgdGhlIHNhbWUgbGlzdCBvZiBwcm92aWRlcnNcbiAqIGlzIHBhc3NlZCBpbnRvIGVhY2ggY2FsbC4gSWYgdGhlIHBsYXRmb3JtIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGEgZGlmZmVyZW50IHNldCBvZlxuICogcHJvdmlkZXMsIEFuZ3VsYXIgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwbGF0Zm9ybShwcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQbGF0Zm9ybVJlZiB7XG4gIGxvY2tNb2RlKCk7XG4gIGlmIChpc1ByZXNlbnQoX3BsYXRmb3JtKSkge1xuICAgIGlmIChMaXN0V3JhcHBlci5lcXVhbHMoX3BsYXRmb3JtUHJvdmlkZXJzLCBwcm92aWRlcnMpKSB7XG4gICAgICByZXR1cm4gX3BsYXRmb3JtO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcInBsYXRmb3JtIGNhbm5vdCBiZSBpbml0aWFsaXplZCB3aXRoIGRpZmZlcmVudCBzZXRzIG9mIHByb3ZpZGVycy5cIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBfY3JlYXRlUGxhdGZvcm0ocHJvdmlkZXJzKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3Bvc2UgdGhlIGV4aXN0aW5nIHBsYXRmb3JtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzcG9zZVBsYXRmb3JtKCk6IHZvaWQge1xuICBpZiAoaXNQcmVzZW50KF9wbGF0Zm9ybSkpIHtcbiAgICBfcGxhdGZvcm0uZGlzcG9zZSgpO1xuICAgIF9wbGF0Zm9ybSA9IG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZVBsYXRmb3JtKHByb3ZpZGVycz86IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFBsYXRmb3JtUmVmIHtcbiAgX3BsYXRmb3JtUHJvdmlkZXJzID0gcHJvdmlkZXJzO1xuICBsZXQgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKHByb3ZpZGVycyk7XG4gIF9wbGF0Zm9ybSA9IG5ldyBQbGF0Zm9ybVJlZl8oaW5qZWN0b3IsICgpID0+IHtcbiAgICBfcGxhdGZvcm0gPSBudWxsO1xuICAgIF9wbGF0Zm9ybVByb3ZpZGVycyA9IG51bGw7XG4gIH0pO1xuICBfcnVuUGxhdGZvcm1Jbml0aWFsaXplcnMoaW5qZWN0b3IpO1xuICByZXR1cm4gX3BsYXRmb3JtO1xufVxuXG5mdW5jdGlvbiBfcnVuUGxhdGZvcm1Jbml0aWFsaXplcnMoaW5qZWN0b3I6IEluamVjdG9yKTogdm9pZCB7XG4gIGxldCBpbml0czogRnVuY3Rpb25bXSA9IGluamVjdG9yLmdldE9wdGlvbmFsKFBMQVRGT1JNX0lOSVRJQUxJWkVSKTtcbiAgaWYgKGlzUHJlc2VudChpbml0cykpIGluaXRzLmZvckVhY2goaW5pdCA9PiBpbml0KCkpO1xufVxuXG4vKipcbiAqIFRoZSBBbmd1bGFyIHBsYXRmb3JtIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgQW5ndWxhciBvbiBhIHdlYiBwYWdlLiBFYWNoIHBhZ2VcbiAqIGhhcyBleGFjdGx5IG9uZSBwbGF0Zm9ybSwgYW5kIHNlcnZpY2VzIChzdWNoIGFzIHJlZmxlY3Rpb24pIHdoaWNoIGFyZSBjb21tb25cbiAqIHRvIGV2ZXJ5IEFuZ3VsYXIgYXBwbGljYXRpb24gcnVubmluZyBvbiB0aGUgcGFnZSBhcmUgYm91bmQgaW4gaXRzIHNjb3BlLlxuICpcbiAqIEEgcGFnZSdzIHBsYXRmb3JtIGlzIGluaXRpYWxpemVkIGltcGxpY2l0bHkgd2hlbiB7QGxpbmsgYm9vdHN0cmFwfSgpIGlzIGNhbGxlZCwgb3JcbiAqIGV4cGxpY2l0bHkgYnkgY2FsbGluZyB7QGxpbmsgcGxhdGZvcm19KCkuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQbGF0Zm9ybVJlZiB7XG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBwbGF0Zm9ybSBpcyBkaXNwb3NlZC5cbiAgICovXG4gIGFic3RyYWN0IHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgcGxhdGZvcm0ge0BsaW5rIEluamVjdG9yfSwgd2hpY2ggaXMgdGhlIHBhcmVudCBpbmplY3RvciBmb3JcbiAgICogZXZlcnkgQW5ndWxhciBhcHBsaWNhdGlvbiBvbiB0aGUgcGFnZSBhbmQgcHJvdmlkZXMgc2luZ2xldG9uIHByb3ZpZGVycy5cbiAgICovXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlIGEgbmV3IEFuZ3VsYXIgYXBwbGljYXRpb24gb24gdGhlIHBhZ2UuXG4gICAqXG4gICAqICMjIyBXaGF0IGlzIGFuIGFwcGxpY2F0aW9uP1xuICAgKlxuICAgKiBFYWNoIEFuZ3VsYXIgYXBwbGljYXRpb24gaGFzIGl0cyBvd24gem9uZSwgY2hhbmdlIGRldGVjdGlvbiwgY29tcGlsZXIsXG4gICAqIHJlbmRlcmVyLCBhbmQgb3RoZXIgZnJhbWV3b3JrIGNvbXBvbmVudHMuIEFuIGFwcGxpY2F0aW9uIGhvc3RzIG9uZSBvciBtb3JlXG4gICAqIHJvb3QgY29tcG9uZW50cywgd2hpY2ggY2FuIGJlIGluaXRpYWxpemVkIHZpYSBgQXBwbGljYXRpb25SZWYuYm9vdHN0cmFwKClgLlxuICAgKlxuICAgKiAjIyMgQXBwbGljYXRpb24gUHJvdmlkZXJzXG4gICAqXG4gICAqIEFuZ3VsYXIgYXBwbGljYXRpb25zIHJlcXVpcmUgbnVtZXJvdXMgcHJvdmlkZXJzIHRvIGJlIHByb3Blcmx5IGluc3RhbnRpYXRlZC5cbiAgICogV2hlbiB1c2luZyBgYXBwbGljYXRpb24oKWAgdG8gY3JlYXRlIGEgbmV3IGFwcCBvbiB0aGUgcGFnZSwgdGhlc2UgcHJvdmlkZXJzXG4gICAqIG11c3QgYmUgcHJvdmlkZWQuIEZvcnR1bmF0ZWx5LCB0aGVyZSBhcmUgaGVscGVyIGZ1bmN0aW9ucyB0byBjb25maWd1cmVcbiAgICogdHlwaWNhbCBwcm92aWRlcnMsIGFzIHNob3duIGluIHRoZSBleGFtcGxlIGJlbG93LlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgY29yZS90cy9wbGF0Zm9ybS9wbGF0Zm9ybS50cyByZWdpb249J2xvbmdmb3JtJ31cbiAgICogIyMjIFNlZSBBbHNvXG4gICAqXG4gICAqIFNlZSB0aGUge0BsaW5rIGJvb3RzdHJhcH0gZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKi9cbiAgYWJzdHJhY3QgYXBwbGljYXRpb24ocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBBcHBsaWNhdGlvblJlZjtcblxuICAvKipcbiAgICogSW5zdGFudGlhdGUgYSBuZXcgQW5ndWxhciBhcHBsaWNhdGlvbiBvbiB0aGUgcGFnZSwgdXNpbmcgcHJvdmlkZXJzIHdoaWNoXG4gICAqIGFyZSBvbmx5IGF2YWlsYWJsZSBhc3luY2hyb25vdXNseS4gT25lIHN1Y2ggdXNlIGNhc2UgaXMgdG8gaW5pdGlhbGl6ZSBhblxuICAgKiBhcHBsaWNhdGlvbiBydW5uaW5nIGluIGEgd2ViIHdvcmtlci5cbiAgICpcbiAgICogIyMjIFVzYWdlXG4gICAqXG4gICAqIGBiaW5kaW5nRm5gIGlzIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGNhbGxlZCBpbiB0aGUgbmV3IGFwcGxpY2F0aW9uJ3Mgem9uZS5cbiAgICogSXQgc2hvdWxkIHJldHVybiBhIGBQcm9taXNlYCB0byBhIGxpc3Qgb2YgcHJvdmlkZXJzIHRvIGJlIHVzZWQgZm9yIHRoZVxuICAgKiBuZXcgYXBwbGljYXRpb24uIE9uY2UgdGhpcyBwcm9taXNlIHJlc29sdmVzLCB0aGUgYXBwbGljYXRpb24gd2lsbCBiZVxuICAgKiBjb25zdHJ1Y3RlZCBpbiB0aGUgc2FtZSBtYW5uZXIgYXMgYSBub3JtYWwgYGFwcGxpY2F0aW9uKClgLlxuICAgKi9cbiAgYWJzdHJhY3QgYXN5bmNBcHBsaWNhdGlvbihiaW5kaW5nRm46ICh6b25lOiBOZ1pvbmUpID0+IFByb21pc2U8QXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+PixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPEFwcGxpY2F0aW9uUmVmPjtcblxuICAvKipcbiAgICogRGVzdHJveSB0aGUgQW5ndWxhciBwbGF0Zm9ybSBhbmQgYWxsIEFuZ3VsYXIgYXBwbGljYXRpb25zIG9uIHRoZSBwYWdlLlxuICAgKi9cbiAgYWJzdHJhY3QgZGlzcG9zZSgpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgUGxhdGZvcm1SZWZfIGV4dGVuZHMgUGxhdGZvcm1SZWYge1xuICAvKiogQGludGVybmFsICovXG4gIF9hcHBsaWNhdGlvbnM6IEFwcGxpY2F0aW9uUmVmW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZGlzcG9zZUxpc3RlbmVyczogRnVuY3Rpb25bXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2luamVjdG9yOiBJbmplY3RvciwgcHJpdmF0ZSBfZGlzcG9zZTogKCkgPT4gdm9pZCkgeyBzdXBlcigpOyB9XG5cbiAgcmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoZGlzcG9zZTogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLnB1c2goZGlzcG9zZSk7IH1cblxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5faW5qZWN0b3I7IH1cblxuICBhcHBsaWNhdGlvbihwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IEFwcGxpY2F0aW9uUmVmIHtcbiAgICB2YXIgYXBwID0gdGhpcy5faW5pdEFwcChjcmVhdGVOZ1pvbmUoKSwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gYXBwO1xuICB9XG5cbiAgYXN5bmNBcHBsaWNhdGlvbihiaW5kaW5nRm46ICh6b25lOiBOZ1pvbmUpID0+IFByb21pc2U8QXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+PixcbiAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxBcHBsaWNhdGlvblJlZj4ge1xuICAgIHZhciB6b25lID0gY3JlYXRlTmdab25lKCk7XG4gICAgdmFyIGNvbXBsZXRlciA9IFByb21pc2VXcmFwcGVyLmNvbXBsZXRlcigpO1xuICAgIHpvbmUucnVuKCgpID0+IHtcbiAgICAgIFByb21pc2VXcmFwcGVyLnRoZW4oYmluZGluZ0ZuKHpvbmUpLCAocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pID0+IHtcbiAgICAgICAgaWYgKGlzUHJlc2VudChhZGRpdGlvbmFsUHJvdmlkZXJzKSkge1xuICAgICAgICAgIHByb3ZpZGVycyA9IExpc3RXcmFwcGVyLmNvbmNhdChwcm92aWRlcnMsIGFkZGl0aW9uYWxQcm92aWRlcnMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbXBsZXRlci5yZXNvbHZlKHRoaXMuX2luaXRBcHAoem9uZSwgcHJvdmlkZXJzKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29tcGxldGVyLnByb21pc2U7XG4gIH1cblxuICBwcml2YXRlIF9pbml0QXBwKHpvbmU6IE5nWm9uZSwgcHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBBcHBsaWNhdGlvblJlZiB7XG4gICAgdmFyIGluamVjdG9yOiBJbmplY3RvcjtcbiAgICB2YXIgYXBwOiBBcHBsaWNhdGlvblJlZjtcbiAgICB6b25lLnJ1bigoKSA9PiB7XG4gICAgICBwcm92aWRlcnMgPSBMaXN0V3JhcHBlci5jb25jYXQocHJvdmlkZXJzLCBbXG4gICAgICAgIHByb3ZpZGUoTmdab25lLCB7dXNlVmFsdWU6IHpvbmV9KSxcbiAgICAgICAgcHJvdmlkZShBcHBsaWNhdGlvblJlZiwge3VzZUZhY3Rvcnk6ICgpOiBBcHBsaWNhdGlvblJlZiA9PiBhcHAsIGRlcHM6IFtdfSlcbiAgICAgIF0pO1xuXG4gICAgICB2YXIgZXhjZXB0aW9uSGFuZGxlcjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGluamVjdG9yID0gdGhpcy5pbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQocHJvdmlkZXJzKTtcbiAgICAgICAgZXhjZXB0aW9uSGFuZGxlciA9IGluamVjdG9yLmdldChFeGNlcHRpb25IYW5kbGVyKTtcbiAgICAgICAgem9uZS5vdmVycmlkZU9uRXJyb3JIYW5kbGVyKChlLCBzKSA9PiBleGNlcHRpb25IYW5kbGVyLmNhbGwoZSwgcykpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGV4Y2VwdGlvbkhhbmRsZXIpKSB7XG4gICAgICAgICAgZXhjZXB0aW9uSGFuZGxlci5jYWxsKGUsIGUuc3RhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByaW50KGUudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBhcHAgPSBuZXcgQXBwbGljYXRpb25SZWZfKHRoaXMsIHpvbmUsIGluamVjdG9yKTtcbiAgICB0aGlzLl9hcHBsaWNhdGlvbnMucHVzaChhcHApO1xuICAgIF9ydW5BcHBJbml0aWFsaXplcnMoaW5qZWN0b3IpO1xuICAgIHJldHVybiBhcHA7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLmNsb25lKHRoaXMuX2FwcGxpY2F0aW9ucykuZm9yRWFjaCgoYXBwKSA9PiBhcHAuZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLmZvckVhY2goKGRpc3Bvc2UpID0+IGRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXBwbGljYXRpb25EaXNwb3NlZChhcHA6IEFwcGxpY2F0aW9uUmVmKTogdm9pZCB7IExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9hcHBsaWNhdGlvbnMsIGFwcCk7IH1cbn1cblxuZnVuY3Rpb24gX3J1bkFwcEluaXRpYWxpemVycyhpbmplY3RvcjogSW5qZWN0b3IpOiB2b2lkIHtcbiAgbGV0IGluaXRzOiBGdW5jdGlvbltdID0gaW5qZWN0b3IuZ2V0T3B0aW9uYWwoQVBQX0lOSVRJQUxJWkVSKTtcbiAgaWYgKGlzUHJlc2VudChpbml0cykpIGluaXRzLmZvckVhY2goaW5pdCA9PiBpbml0KCkpO1xufVxuXG4vKipcbiAqIEEgcmVmZXJlbmNlIHRvIGFuIEFuZ3VsYXIgYXBwbGljYXRpb24gcnVubmluZyBvbiBhIHBhZ2UuXG4gKlxuICogRm9yIG1vcmUgYWJvdXQgQW5ndWxhciBhcHBsaWNhdGlvbnMsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3Ige0BsaW5rIGJvb3RzdHJhcH0uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBcHBsaWNhdGlvblJlZiB7XG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCBlYWNoIHRpbWUgYGJvb3RzdHJhcCgpYCBpcyBjYWxsZWQgdG8gYm9vdHN0cmFwXG4gICAqIGEgbmV3IHJvb3QgY29tcG9uZW50LlxuICAgKi9cbiAgYWJzdHJhY3QgcmVnaXN0ZXJCb290c3RyYXBMaXN0ZW5lcihsaXN0ZW5lcjogKHJlZjogQ29tcG9uZW50UmVmKSA9PiB2b2lkKTogdm9pZDtcblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBsaXN0ZW5lciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYXBwbGljYXRpb24gaXMgZGlzcG9zZWQuXG4gICAqL1xuICBhYnN0cmFjdCByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZDtcblxuICAvKipcbiAgICogQm9vdHN0cmFwIGEgbmV3IGNvbXBvbmVudCBhdCB0aGUgcm9vdCBsZXZlbCBvZiB0aGUgYXBwbGljYXRpb24uXG4gICAqXG4gICAqICMjIyBCb290c3RyYXAgcHJvY2Vzc1xuICAgKlxuICAgKiBXaGVuIGJvb3RzdHJhcHBpbmcgYSBuZXcgcm9vdCBjb21wb25lbnQgaW50byBhbiBhcHBsaWNhdGlvbiwgQW5ndWxhciBtb3VudHMgdGhlXG4gICAqIHNwZWNpZmllZCBhcHBsaWNhdGlvbiBjb21wb25lbnQgb250byBET00gZWxlbWVudHMgaWRlbnRpZmllZCBieSB0aGUgW2NvbXBvbmVudFR5cGVdJ3NcbiAgICogc2VsZWN0b3IgYW5kIGtpY2tzIG9mZiBhdXRvbWF0aWMgY2hhbmdlIGRldGVjdGlvbiB0byBmaW5pc2ggaW5pdGlhbGl6aW5nIHRoZSBjb21wb25lbnQuXG4gICAqXG4gICAqICMjIyBPcHRpb25hbCBQcm92aWRlcnNcbiAgICpcbiAgICogUHJvdmlkZXJzIGZvciB0aGUgZ2l2ZW4gY29tcG9uZW50IGNhbiBvcHRpb25hbGx5IGJlIG92ZXJyaWRkZW4gdmlhIHRoZSBgcHJvdmlkZXJzYFxuICAgKiBwYXJhbWV0ZXIuIFRoZXNlIHByb3ZpZGVycyB3aWxsIG9ubHkgYXBwbHkgZm9yIHRoZSByb290IGNvbXBvbmVudCBiZWluZyBhZGRlZCBhbmQgYW55XG4gICAqIGNoaWxkIGNvbXBvbmVudHMgdW5kZXIgaXQuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqIHtAZXhhbXBsZSBjb3JlL3RzL3BsYXRmb3JtL3BsYXRmb3JtLnRzIHJlZ2lvbj0nbG9uZ2Zvcm0nfVxuICAgKi9cbiAgYWJzdHJhY3QgYm9vdHN0cmFwKGNvbXBvbmVudFR5cGU6IFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICBwcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPENvbXBvbmVudFJlZj47XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBhcHBsaWNhdGlvbiB7QGxpbmsgSW5qZWN0b3J9LlxuICAgKi9cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGFwcGxpY2F0aW9uIHtAbGluayBOZ1pvbmV9LlxuICAgKi9cbiAgZ2V0IHpvbmUoKTogTmdab25lIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogRGlzcG9zZSBvZiB0aGlzIGFwcGxpY2F0aW9uIGFuZCBhbGwgb2YgaXRzIGNvbXBvbmVudHMuXG4gICAqL1xuICBhYnN0cmFjdCBkaXNwb3NlKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEludm9rZSB0aGlzIG1ldGhvZCB0byBleHBsaWNpdGx5IHByb2Nlc3MgY2hhbmdlIGRldGVjdGlvbiBhbmQgaXRzIHNpZGUtZWZmZWN0cy5cbiAgICpcbiAgICogSW4gZGV2ZWxvcG1lbnQgbW9kZSwgYHRpY2soKWAgYWxzbyBwZXJmb3JtcyBhIHNlY29uZCBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlIHRvIGVuc3VyZSB0aGF0IG5vXG4gICAqIGZ1cnRoZXIgY2hhbmdlcyBhcmUgZGV0ZWN0ZWQuIElmIGFkZGl0aW9uYWwgY2hhbmdlcyBhcmUgcGlja2VkIHVwIGR1cmluZyB0aGlzIHNlY29uZCBjeWNsZSxcbiAgICogYmluZGluZ3MgaW4gdGhlIGFwcCBoYXZlIHNpZGUtZWZmZWN0cyB0aGF0IGNhbm5vdCBiZSByZXNvbHZlZCBpbiBhIHNpbmdsZSBjaGFuZ2UgZGV0ZWN0aW9uXG4gICAqIHBhc3MuXG4gICAqIEluIHRoaXMgY2FzZSwgQW5ndWxhciB0aHJvd3MgYW4gZXJyb3IsIHNpbmNlIGFuIEFuZ3VsYXIgYXBwbGljYXRpb24gY2FuIG9ubHkgaGF2ZSBvbmUgY2hhbmdlXG4gICAqIGRldGVjdGlvbiBwYXNzIGR1cmluZyB3aGljaCBhbGwgY2hhbmdlIGRldGVjdGlvbiBtdXN0IGNvbXBsZXRlLlxuICAgKi9cbiAgYWJzdHJhY3QgdGljaygpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBHZXQgYSBsaXN0IG9mIGNvbXBvbmVudCB0eXBlcyByZWdpc3RlcmVkIHRvIHRoaXMgYXBwbGljYXRpb24uXG4gICAqL1xuICBnZXQgY29tcG9uZW50VHlwZXMoKTogVHlwZVtdIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcbn1cblxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uUmVmXyBleHRlbmRzIEFwcGxpY2F0aW9uUmVmIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX3RpY2tTY29wZTogV3RmU2NvcGVGbiA9IHd0ZkNyZWF0ZVNjb3BlKCdBcHBsaWNhdGlvblJlZiN0aWNrKCknKTtcblxuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Jvb3RzdHJhcExpc3RlbmVyczogRnVuY3Rpb25bXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Rpc3Bvc2VMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yb290Q29tcG9uZW50czogQ29tcG9uZW50UmVmW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yb290Q29tcG9uZW50VHlwZXM6IFR5cGVbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2NoYW5nZURldGVjdG9yUmVmczogQ2hhbmdlRGV0ZWN0b3JSZWZbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3J1bm5pbmdUaWNrOiBib29sZWFuID0gZmFsc2U7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfZW5mb3JjZU5vTmV3Q2hhbmdlczogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybVJlZl8sIHByaXZhdGUgX3pvbmU6IE5nWm9uZSwgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3pvbmUpKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fem9uZS5vblR1cm5Eb25lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfKSA9PiB7IHRoaXMuX3pvbmUucnVuKCgpID0+IHsgdGhpcy50aWNrKCk7IH0pOyB9KTtcbiAgICB9XG4gICAgdGhpcy5fZW5mb3JjZU5vTmV3Q2hhbmdlcyA9IGFzc2VydGlvbnNFbmFibGVkKCk7XG4gIH1cblxuICByZWdpc3RlckJvb3RzdHJhcExpc3RlbmVyKGxpc3RlbmVyOiAocmVmOiBDb21wb25lbnRSZWYpID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLl9ib290c3RyYXBMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gIH1cblxuICByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZCB7IHRoaXMuX2Rpc3Bvc2VMaXN0ZW5lcnMucHVzaChkaXNwb3NlKTsgfVxuXG4gIHJlZ2lzdGVyQ2hhbmdlRGV0ZWN0b3IoY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmKTogdm9pZCB7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWZzLnB1c2goY2hhbmdlRGV0ZWN0b3IpO1xuICB9XG5cbiAgdW5yZWdpc3RlckNoYW5nZURldGVjdG9yKGNoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZik6IHZvaWQge1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMsIGNoYW5nZURldGVjdG9yKTtcbiAgfVxuXG4gIGJvb3RzdHJhcChjb21wb25lbnRUeXBlOiBUeXBlLFxuICAgICAgICAgICAgcHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxDb21wb25lbnRSZWY+IHtcbiAgICB2YXIgY29tcGxldGVyID0gUHJvbWlzZVdyYXBwZXIuY29tcGxldGVyKCk7XG4gICAgdGhpcy5fem9uZS5ydW4oKCkgPT4ge1xuICAgICAgdmFyIGNvbXBvbmVudFByb3ZpZGVycyA9IF9jb21wb25lbnRQcm92aWRlcnMoY29tcG9uZW50VHlwZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KHByb3ZpZGVycykpIHtcbiAgICAgICAgY29tcG9uZW50UHJvdmlkZXJzLnB1c2gocHJvdmlkZXJzKTtcbiAgICAgIH1cbiAgICAgIHZhciBleGNlcHRpb25IYW5kbGVyID0gdGhpcy5faW5qZWN0b3IuZ2V0KEV4Y2VwdGlvbkhhbmRsZXIpO1xuICAgICAgdGhpcy5fcm9vdENvbXBvbmVudFR5cGVzLnB1c2goY29tcG9uZW50VHlwZSk7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgaW5qZWN0b3I6IEluamVjdG9yID0gdGhpcy5faW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZUNoaWxkKGNvbXBvbmVudFByb3ZpZGVycyk7XG4gICAgICAgIHZhciBjb21wUmVmVG9rZW46IFByb21pc2U8Q29tcG9uZW50UmVmPiA9IGluamVjdG9yLmdldChBUFBfQ09NUE9ORU5UX1JFRl9QUk9NSVNFKTtcbiAgICAgICAgdmFyIHRpY2sgPSAoY29tcG9uZW50UmVmKSA9PiB7XG4gICAgICAgICAgdGhpcy5fbG9hZENvbXBvbmVudChjb21wb25lbnRSZWYpO1xuICAgICAgICAgIGNvbXBsZXRlci5yZXNvbHZlKGNvbXBvbmVudFJlZik7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHRpY2tSZXN1bHQgPSBQcm9taXNlV3JhcHBlci50aGVuKGNvbXBSZWZUb2tlbiwgdGljayk7XG5cbiAgICAgICAgLy8gVEhJUyBNVVNUIE9OTFkgUlVOIElOIERBUlQuXG4gICAgICAgIC8vIFRoaXMgaXMgcmVxdWlyZWQgdG8gcmVwb3J0IGFuIGVycm9yIHdoZW4gbm8gY29tcG9uZW50cyB3aXRoIGEgbWF0Y2hpbmcgc2VsZWN0b3IgZm91bmQuXG4gICAgICAgIC8vIE90aGVyd2lzZSB0aGUgcHJvbWlzZSB3aWxsIG5ldmVyIGJlIGNvbXBsZXRlZC5cbiAgICAgICAgLy8gRG9pbmcgdGhpcyBpbiBKUyBjYXVzZXMgYW4gZXh0cmEgZXJyb3IgbWVzc2FnZSB0byBhcHBlYXIuXG4gICAgICAgIGlmIChJU19EQVJUKSB7XG4gICAgICAgICAgUHJvbWlzZVdyYXBwZXIudGhlbih0aWNrUmVzdWx0LCAoXykgPT4ge30pO1xuICAgICAgICB9XG5cbiAgICAgICAgUHJvbWlzZVdyYXBwZXIudGhlbih0aWNrUmVzdWx0LCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChlcnIsIHN0YWNrVHJhY2UpID0+IGNvbXBsZXRlci5yZWplY3QoZXJyLCBzdGFja1RyYWNlKSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGV4Y2VwdGlvbkhhbmRsZXIuY2FsbChlLCBlLnN0YWNrKTtcbiAgICAgICAgY29tcGxldGVyLnJlamVjdChlLCBlLnN0YWNrKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29tcGxldGVyLnByb21pc2UudGhlbihfID0+IHtcbiAgICAgIGxldCBjID0gdGhpcy5faW5qZWN0b3IuZ2V0KENvbnNvbGUpO1xuICAgICAgbGV0IG1vZGVEZXNjcmlwdGlvbiA9XG4gICAgICAgICAgYXNzZXJ0aW9uc0VuYWJsZWQoKSA/XG4gICAgICAgICAgICAgIFwiaW4gdGhlIGRldmVsb3BtZW50IG1vZGUuIENhbGwgZW5hYmxlUHJvZE1vZGUoKSB0byBlbmFibGUgdGhlIHByb2R1Y3Rpb24gbW9kZS5cIiA6XG4gICAgICAgICAgICAgIFwiaW4gdGhlIHByb2R1Y3Rpb24gbW9kZS4gQ2FsbCBlbmFibGVEZXZNb2RlKCkgdG8gZW5hYmxlIHRoZSBkZXZlbG9wbWVudCBtb2RlLlwiO1xuICAgICAgYy5sb2coYEFuZ3VsYXIgMiBpcyBydW5uaW5nICR7bW9kZURlc2NyaXB0aW9ufWApO1xuICAgICAgcmV0dXJuIF87XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9sb2FkQ29tcG9uZW50KHJlZik6IHZvaWQge1xuICAgIHZhciBhcHBDaGFuZ2VEZXRlY3RvciA9IGludGVybmFsVmlldyhyZWYuaG9zdFZpZXcpLmNoYW5nZURldGVjdG9yO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcy5wdXNoKGFwcENoYW5nZURldGVjdG9yLnJlZik7XG4gICAgdGhpcy50aWNrKCk7XG4gICAgdGhpcy5fcm9vdENvbXBvbmVudHMucHVzaChyZWYpO1xuICAgIHRoaXMuX2Jvb3RzdHJhcExpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4gbGlzdGVuZXIocmVmKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91bmxvYWRDb21wb25lbnQocmVmKTogdm9pZCB7XG4gICAgaWYgKCFMaXN0V3JhcHBlci5jb250YWlucyh0aGlzLl9yb290Q29tcG9uZW50cywgcmVmKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnVucmVnaXN0ZXJDaGFuZ2VEZXRlY3RvcihpbnRlcm5hbFZpZXcocmVmLmhvc3RWaWV3KS5jaGFuZ2VEZXRlY3Rvci5yZWYpO1xuICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9yb290Q29tcG9uZW50cywgcmVmKTtcbiAgfVxuXG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9pbmplY3RvcjsgfVxuXG4gIGdldCB6b25lKCk6IE5nWm9uZSB7IHJldHVybiB0aGlzLl96b25lOyB9XG5cbiAgdGljaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcnVubmluZ1RpY2spIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiQXBwbGljYXRpb25SZWYudGljayBpcyBjYWxsZWQgcmVjdXJzaXZlbHlcIik7XG4gICAgfVxuXG4gICAgdmFyIHMgPSBBcHBsaWNhdGlvblJlZl8uX3RpY2tTY29wZSgpO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IHRydWU7XG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMuZm9yRWFjaCgoZGV0ZWN0b3IpID0+IGRldGVjdG9yLmRldGVjdENoYW5nZXMoKSk7XG4gICAgICBpZiAodGhpcy5fZW5mb3JjZU5vTmV3Q2hhbmdlcykge1xuICAgICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMuZm9yRWFjaCgoZGV0ZWN0b3IpID0+IGRldGVjdG9yLmNoZWNrTm9DaGFuZ2VzKCkpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLl9ydW5uaW5nVGljayA9IGZhbHNlO1xuICAgICAgd3RmTGVhdmUocyk7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICAvLyBUT0RPKGFseGh1Yik6IERpc3Bvc2Ugb2YgdGhlIE5nWm9uZS5cbiAgICBMaXN0V3JhcHBlci5jbG9uZSh0aGlzLl9yb290Q29tcG9uZW50cykuZm9yRWFjaCgocmVmKSA9PiByZWYuZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9kaXNwb3NlTGlzdGVuZXJzLmZvckVhY2goKGRpc3Bvc2UpID0+IGRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fcGxhdGZvcm0uX2FwcGxpY2F0aW9uRGlzcG9zZWQodGhpcyk7XG4gIH1cblxuICBnZXQgY29tcG9uZW50VHlwZXMoKTogYW55W10geyByZXR1cm4gdGhpcy5fcm9vdENvbXBvbmVudFR5cGVzOyB9XG59XG4iXX0=