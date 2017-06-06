'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var common_1 = require('angular2/platform/common');
var core_1 = require('angular2/core');
var route_registry_1 = require('./route_registry');
var route_lifecycle_reflector_1 = require('./lifecycle/route_lifecycle_reflector');
var _resolveToTrue = async_1.PromiseWrapper.resolve(true);
var _resolveToFalse = async_1.PromiseWrapper.resolve(false);
/**
 * The `Router` is responsible for mapping URLs to components.
 *
 * You can see the state of the router by inspecting the read-only field `router.navigating`.
 * This may be useful for showing a spinner, for instance.
 *
 * ## Concepts
 *
 * Routers and component instances have a 1:1 correspondence.
 *
 * The router holds reference to a number of {@link RouterOutlet}.
 * An outlet is a placeholder that the router dynamically fills in depending on the current URL.
 *
 * When the router navigates from a URL, it must first recognize it and serialize it into an
 * `Instruction`.
 * The router uses the `RouteRegistry` to get an `Instruction`.
 */
var Router = (function () {
    function Router(registry, parent, hostComponent, root) {
        this.registry = registry;
        this.parent = parent;
        this.hostComponent = hostComponent;
        this.root = root;
        this.navigating = false;
        /**
         * The current `Instruction` for the router
         */
        this.currentInstruction = null;
        this._currentNavigation = _resolveToTrue;
        this._outlet = null;
        this._auxRouters = new collection_1.Map();
        this._subject = new async_1.EventEmitter();
    }
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    Router.prototype.childRouter = function (hostComponent) {
        return this._childRouter = new ChildRouter(this, hostComponent);
    };
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    Router.prototype.auxRouter = function (hostComponent) { return new ChildRouter(this, hostComponent); };
    /**
     * Register an outlet to be notified of primary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    Router.prototype.registerPrimaryOutlet = function (outlet) {
        if (lang_1.isPresent(outlet.name)) {
            throw new exceptions_1.BaseException("registerPrimaryOutlet expects to be called with an unnamed outlet.");
        }
        if (lang_1.isPresent(this._outlet)) {
            throw new exceptions_1.BaseException("Primary outlet is already registered.");
        }
        this._outlet = outlet;
        if (lang_1.isPresent(this.currentInstruction)) {
            return this.commit(this.currentInstruction, false);
        }
        return _resolveToTrue;
    };
    /**
     * Unregister an outlet (because it was destroyed, etc).
     *
     * You probably don't need to use this unless you're writing a custom outlet implementation.
     */
    Router.prototype.unregisterPrimaryOutlet = function (outlet) {
        if (lang_1.isPresent(outlet.name)) {
            throw new exceptions_1.BaseException("registerPrimaryOutlet expects to be called with an unnamed outlet.");
        }
        this._outlet = null;
    };
    /**
     * Register an outlet to notified of auxiliary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    Router.prototype.registerAuxOutlet = function (outlet) {
        var outletName = outlet.name;
        if (lang_1.isBlank(outletName)) {
            throw new exceptions_1.BaseException("registerAuxOutlet expects to be called with an outlet with a name.");
        }
        var router = this.auxRouter(this.hostComponent);
        this._auxRouters.set(outletName, router);
        router._outlet = outlet;
        var auxInstruction;
        if (lang_1.isPresent(this.currentInstruction) &&
            lang_1.isPresent(auxInstruction = this.currentInstruction.auxInstruction[outletName])) {
            return router.commit(auxInstruction);
        }
        return _resolveToTrue;
    };
    /**
     * Given an instruction, returns `true` if the instruction is currently active,
     * otherwise `false`.
     */
    Router.prototype.isRouteActive = function (instruction) {
        var _this = this;
        var router = this;
        if (lang_1.isBlank(this.currentInstruction)) {
            return false;
        }
        // `instruction` corresponds to the root router
        while (lang_1.isPresent(router.parent) && lang_1.isPresent(instruction.child)) {
            router = router.parent;
            instruction = instruction.child;
        }
        if (lang_1.isBlank(instruction.component) || lang_1.isBlank(this.currentInstruction.component) ||
            this.currentInstruction.component.routeName != instruction.component.routeName) {
            return false;
        }
        var paramEquals = true;
        if (lang_1.isPresent(this.currentInstruction.component.params)) {
            collection_1.StringMapWrapper.forEach(instruction.component.params, function (value, key) {
                if (_this.currentInstruction.component.params[key] !== value) {
                    paramEquals = false;
                }
            });
        }
        return paramEquals;
    };
    /**
     * Dynamically update the routing configuration and trigger a navigation.
     *
     * ### Usage
     *
     * ```
     * router.config([
     *   { 'path': '/', 'component': IndexComp },
     *   { 'path': '/user/:id', 'component': UserComp },
     * ]);
     * ```
     */
    Router.prototype.config = function (definitions) {
        var _this = this;
        definitions.forEach(function (routeDefinition) { _this.registry.config(_this.hostComponent, routeDefinition); });
        return this.renavigate();
    };
    /**
     * Navigate based on the provided Route Link DSL. It's preferred to navigate with this method
     * over `navigateByUrl`.
     *
     * ### Usage
     *
     * This method takes an array representing the Route Link DSL:
     * ```
     * ['./MyCmp', {param: 3}]
     * ```
     * See the {@link RouterLink} directive for more.
     */
    Router.prototype.navigate = function (linkParams) {
        var instruction = this.generate(linkParams);
        return this.navigateByInstruction(instruction, false);
    };
    /**
     * Navigate to a URL. Returns a promise that resolves when navigation is complete.
     * It's preferred to navigate with `navigate` instead of this method, since URLs are more brittle.
     *
     * If the given URL begins with a `/`, router will navigate absolutely.
     * If the given URL does not begin with `/`, the router will navigate relative to this component.
     */
    Router.prototype.navigateByUrl = function (url, _skipLocationChange) {
        var _this = this;
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        return this._currentNavigation = this._currentNavigation.then(function (_) {
            _this.lastNavigationAttempt = url;
            _this._startNavigating();
            return _this._afterPromiseFinishNavigating(_this.recognize(url).then(function (instruction) {
                if (lang_1.isBlank(instruction)) {
                    return false;
                }
                return _this._navigate(instruction, _skipLocationChange);
            }));
        });
    };
    /**
     * Navigate via the provided instruction. Returns a promise that resolves when navigation is
     * complete.
     */
    Router.prototype.navigateByInstruction = function (instruction, _skipLocationChange) {
        var _this = this;
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        if (lang_1.isBlank(instruction)) {
            return _resolveToFalse;
        }
        return this._currentNavigation = this._currentNavigation.then(function (_) {
            _this._startNavigating();
            return _this._afterPromiseFinishNavigating(_this._navigate(instruction, _skipLocationChange));
        });
    };
    /** @internal */
    Router.prototype._settleInstruction = function (instruction) {
        var _this = this;
        return instruction.resolveComponent().then(function (_) {
            var unsettledInstructions = [];
            if (lang_1.isPresent(instruction.component)) {
                instruction.component.reuse = false;
            }
            if (lang_1.isPresent(instruction.child)) {
                unsettledInstructions.push(_this._settleInstruction(instruction.child));
            }
            collection_1.StringMapWrapper.forEach(instruction.auxInstruction, function (instruction, _) {
                unsettledInstructions.push(_this._settleInstruction(instruction));
            });
            return async_1.PromiseWrapper.all(unsettledInstructions);
        });
    };
    /** @internal */
    Router.prototype._navigate = function (instruction, _skipLocationChange) {
        var _this = this;
        return this._settleInstruction(instruction)
            .then(function (_) { return _this._routerCanReuse(instruction); })
            .then(function (_) { return _this._canActivate(instruction); })
            .then(function (result) {
            if (!result) {
                return false;
            }
            return _this._routerCanDeactivate(instruction)
                .then(function (result) {
                if (result) {
                    return _this.commit(instruction, _skipLocationChange)
                        .then(function (_) {
                        _this._emitNavigationFinish(instruction.toRootUrl());
                        return true;
                    });
                }
            });
        });
    };
    Router.prototype._emitNavigationFinish = function (url) { async_1.ObservableWrapper.callEmit(this._subject, url); };
    /** @internal */
    Router.prototype._emitNavigationFail = function (url) { async_1.ObservableWrapper.callError(this._subject, url); };
    Router.prototype._afterPromiseFinishNavigating = function (promise) {
        var _this = this;
        return async_1.PromiseWrapper.catchError(promise.then(function (_) { return _this._finishNavigating(); }), function (err) {
            _this._finishNavigating();
            throw err;
        });
    };
    /*
     * Recursively set reuse flags
     */
    /** @internal */
    Router.prototype._routerCanReuse = function (instruction) {
        var _this = this;
        if (lang_1.isBlank(this._outlet)) {
            return _resolveToFalse;
        }
        if (lang_1.isBlank(instruction.component)) {
            return _resolveToTrue;
        }
        return this._outlet.routerCanReuse(instruction.component)
            .then(function (result) {
            instruction.component.reuse = result;
            if (result && lang_1.isPresent(_this._childRouter) && lang_1.isPresent(instruction.child)) {
                return _this._childRouter._routerCanReuse(instruction.child);
            }
        });
    };
    Router.prototype._canActivate = function (nextInstruction) {
        return canActivateOne(nextInstruction, this.currentInstruction);
    };
    Router.prototype._routerCanDeactivate = function (instruction) {
        var _this = this;
        if (lang_1.isBlank(this._outlet)) {
            return _resolveToTrue;
        }
        var next;
        var childInstruction = null;
        var reuse = false;
        var componentInstruction = null;
        if (lang_1.isPresent(instruction)) {
            childInstruction = instruction.child;
            componentInstruction = instruction.component;
            reuse = lang_1.isBlank(instruction.component) || instruction.component.reuse;
        }
        if (reuse) {
            next = _resolveToTrue;
        }
        else {
            next = this._outlet.routerCanDeactivate(componentInstruction);
        }
        // TODO: aux route lifecycle hooks
        return next.then(function (result) {
            if (result == false) {
                return false;
            }
            if (lang_1.isPresent(_this._childRouter)) {
                // TODO: ideally, this closure would map to async-await in Dart.
                // For now, casting to any to suppress an error.
                return _this._childRouter._routerCanDeactivate(childInstruction);
            }
            return true;
        });
    };
    /**
     * Updates this router and all descendant routers according to the given instruction
     */
    Router.prototype.commit = function (instruction, _skipLocationChange) {
        var _this = this;
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        this.currentInstruction = instruction;
        var next = _resolveToTrue;
        if (lang_1.isPresent(this._outlet) && lang_1.isPresent(instruction.component)) {
            var componentInstruction = instruction.component;
            if (componentInstruction.reuse) {
                next = this._outlet.reuse(componentInstruction);
            }
            else {
                next =
                    this.deactivate(instruction).then(function (_) { return _this._outlet.activate(componentInstruction); });
            }
            if (lang_1.isPresent(instruction.child)) {
                next = next.then(function (_) {
                    if (lang_1.isPresent(_this._childRouter)) {
                        return _this._childRouter.commit(instruction.child);
                    }
                });
            }
        }
        var promises = [];
        this._auxRouters.forEach(function (router, name) {
            if (lang_1.isPresent(instruction.auxInstruction[name])) {
                promises.push(router.commit(instruction.auxInstruction[name]));
            }
        });
        return next.then(function (_) { return async_1.PromiseWrapper.all(promises); });
    };
    /** @internal */
    Router.prototype._startNavigating = function () { this.navigating = true; };
    /** @internal */
    Router.prototype._finishNavigating = function () { this.navigating = false; };
    /**
     * Subscribe to URL updates from the router
     */
    Router.prototype.subscribe = function (onNext, onError) {
        return async_1.ObservableWrapper.subscribe(this._subject, onNext, onError);
    };
    /**
     * Removes the contents of this router's outlet and all descendant outlets
     */
    Router.prototype.deactivate = function (instruction) {
        var _this = this;
        var childInstruction = null;
        var componentInstruction = null;
        if (lang_1.isPresent(instruction)) {
            childInstruction = instruction.child;
            componentInstruction = instruction.component;
        }
        var next = _resolveToTrue;
        if (lang_1.isPresent(this._childRouter)) {
            next = this._childRouter.deactivate(childInstruction);
        }
        if (lang_1.isPresent(this._outlet)) {
            next = next.then(function (_) { return _this._outlet.deactivate(componentInstruction); });
        }
        // TODO: handle aux routes
        return next;
    };
    /**
     * Given a URL, returns an instruction representing the component graph
     */
    Router.prototype.recognize = function (url) {
        var ancestorComponents = this._getAncestorInstructions();
        return this.registry.recognize(url, ancestorComponents);
    };
    Router.prototype._getAncestorInstructions = function () {
        var ancestorInstructions = [this.currentInstruction];
        var ancestorRouter = this;
        while (lang_1.isPresent(ancestorRouter = ancestorRouter.parent)) {
            ancestorInstructions.unshift(ancestorRouter.currentInstruction);
        }
        return ancestorInstructions;
    };
    /**
     * Navigates to either the last URL successfully navigated to, or the last URL requested if the
     * router has yet to successfully navigate.
     */
    Router.prototype.renavigate = function () {
        if (lang_1.isBlank(this.lastNavigationAttempt)) {
            return this._currentNavigation;
        }
        return this.navigateByUrl(this.lastNavigationAttempt);
    };
    /**
     * Generate an `Instruction` based on the provided Route Link DSL.
     */
    Router.prototype.generate = function (linkParams) {
        var ancestorInstructions = this._getAncestorInstructions();
        return this.registry.generate(linkParams, ancestorInstructions);
    };
    Router = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [route_registry_1.RouteRegistry, Router, Object, Router])
    ], Router);
    return Router;
}());
exports.Router = Router;
var RootRouter = (function (_super) {
    __extends(RootRouter, _super);
    function RootRouter(registry, location, primaryComponent) {
        var _this = this;
        _super.call(this, registry, null, primaryComponent);
        this.root = this;
        this._location = location;
        this._locationSub = this._location.subscribe(function (change) {
            // we call recognize ourselves
            _this.recognize(change['url'])
                .then(function (instruction) {
                if (lang_1.isPresent(instruction)) {
                    _this.navigateByInstruction(instruction, lang_1.isPresent(change['pop']))
                        .then(function (_) {
                        // this is a popstate event; no need to change the URL
                        if (lang_1.isPresent(change['pop']) && change['type'] != 'hashchange') {
                            return;
                        }
                        var emitPath = instruction.toUrlPath();
                        var emitQuery = instruction.toUrlQuery();
                        if (emitPath.length > 0 && emitPath[0] != '/') {
                            emitPath = '/' + emitPath;
                        }
                        // We've opted to use pushstate and popState APIs regardless of whether you
                        // an app uses HashLocationStrategy or PathLocationStrategy.
                        // However, apps that are migrating might have hash links that operate outside
                        // angular to which routing must respond.
                        // Therefore we know that all hashchange events occur outside Angular.
                        // To support these cases where we respond to hashchanges and redirect as a
                        // result, we need to replace the top item on the stack.
                        if (change['type'] == 'hashchange') {
                            if (instruction.toRootUrl() != _this._location.path()) {
                                _this._location.replaceState(emitPath, emitQuery);
                            }
                        }
                        else {
                            _this._location.go(emitPath, emitQuery);
                        }
                    });
                }
                else {
                    _this._emitNavigationFail(change['url']);
                }
            });
        });
        this.registry.configFromComponent(primaryComponent);
        this.navigateByUrl(location.path());
    }
    RootRouter.prototype.commit = function (instruction, _skipLocationChange) {
        var _this = this;
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        var emitPath = instruction.toUrlPath();
        var emitQuery = instruction.toUrlQuery();
        if (emitPath.length > 0 && emitPath[0] != '/') {
            emitPath = '/' + emitPath;
        }
        var promise = _super.prototype.commit.call(this, instruction);
        if (!_skipLocationChange) {
            promise = promise.then(function (_) { _this._location.go(emitPath, emitQuery); });
        }
        return promise;
    };
    RootRouter.prototype.dispose = function () {
        if (lang_1.isPresent(this._locationSub)) {
            async_1.ObservableWrapper.dispose(this._locationSub);
            this._locationSub = null;
        }
    };
    RootRouter = __decorate([
        core_1.Injectable(),
        __param(2, core_1.Inject(route_registry_1.ROUTER_PRIMARY_COMPONENT)), 
        __metadata('design:paramtypes', [route_registry_1.RouteRegistry, common_1.Location, lang_1.Type])
    ], RootRouter);
    return RootRouter;
}(Router));
exports.RootRouter = RootRouter;
var ChildRouter = (function (_super) {
    __extends(ChildRouter, _super);
    function ChildRouter(parent, hostComponent) {
        _super.call(this, parent.registry, parent, hostComponent, parent.root);
        this.parent = parent;
    }
    ChildRouter.prototype.navigateByUrl = function (url, _skipLocationChange) {
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        // Delegate navigation to the root router
        return this.parent.navigateByUrl(url, _skipLocationChange);
    };
    ChildRouter.prototype.navigateByInstruction = function (instruction, _skipLocationChange) {
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        // Delegate navigation to the root router
        return this.parent.navigateByInstruction(instruction, _skipLocationChange);
    };
    return ChildRouter;
}(Router));
function canActivateOne(nextInstruction, prevInstruction) {
    var next = _resolveToTrue;
    if (lang_1.isBlank(nextInstruction.component)) {
        return next;
    }
    if (lang_1.isPresent(nextInstruction.child)) {
        next = canActivateOne(nextInstruction.child, lang_1.isPresent(prevInstruction) ? prevInstruction.child : null);
    }
    return next.then(function (result) {
        if (result == false) {
            return false;
        }
        if (nextInstruction.component.reuse) {
            return true;
        }
        var hook = route_lifecycle_reflector_1.getCanActivateHook(nextInstruction.component.componentType);
        if (lang_1.isPresent(hook)) {
            return hook(nextInstruction.component, lang_1.isPresent(prevInstruction) ? prevInstruction.component : null);
        }
        return true;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL3JvdXRlci9yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0JBQThELDJCQUEyQixDQUFDLENBQUE7QUFDMUYsMkJBQTZELGdDQUFnQyxDQUFDLENBQUE7QUFDOUYscUJBQTBELDBCQUEwQixDQUFDLENBQUE7QUFDckYsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsdUJBQXVCLDBCQUEwQixDQUFDLENBQUE7QUFDbEQscUJBQWlDLGVBQWUsQ0FBQyxDQUFBO0FBRWpELCtCQUFzRCxrQkFBa0IsQ0FBQyxDQUFBO0FBTXpFLDBDQUFpQyx1Q0FBdUMsQ0FBQyxDQUFBO0FBR3pFLElBQUksY0FBYyxHQUFHLHNCQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xELElBQUksZUFBZSxHQUFHLHNCQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRXBEOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBRUg7SUFpQkUsZ0JBQW1CLFFBQXVCLEVBQVMsTUFBYyxFQUFTLGFBQWtCLEVBQ3pFLElBQWE7UUFEYixhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFTLGtCQUFhLEdBQWIsYUFBYSxDQUFLO1FBQ3pFLFNBQUksR0FBSixJQUFJLENBQVM7UUFqQmhDLGVBQVUsR0FBWSxLQUFLLENBQUM7UUFFNUI7O1dBRUc7UUFDSSx1QkFBa0IsR0FBZ0IsSUFBSSxDQUFDO1FBRXRDLHVCQUFrQixHQUFpQixjQUFjLENBQUM7UUFDbEQsWUFBTyxHQUFpQixJQUFJLENBQUM7UUFFN0IsZ0JBQVcsR0FBRyxJQUFJLGdCQUFHLEVBQWtCLENBQUM7UUFHeEMsYUFBUSxHQUFzQixJQUFJ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LEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxJQUFJLElBQUksR0FBRyw4Q0FBa0IsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZFLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFDekIsZ0JBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxlQUFlLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzdFLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQcm9taXNlV3JhcHBlciwgRXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge01hcCwgU3RyaW5nTWFwV3JhcHBlciwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzQmxhbmssIGlzU3RyaW5nLCBpc1ByZXNlbnQsIFR5cGUsIGlzQXJyYXl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1JvdXRlUmVnaXN0cnksIFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVH0gZnJvbSAnLi9yb3V0ZV9yZWdpc3RyeSc7XG5pbXBvcnQge1xuICBDb21wb25lbnRJbnN0cnVjdGlvbixcbiAgSW5zdHJ1Y3Rpb24sXG59IGZyb20gJy4vaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtSb3V0ZXJPdXRsZXR9IGZyb20gJy4vZGlyZWN0aXZlcy9yb3V0ZXJfb3V0bGV0JztcbmltcG9ydCB7Z2V0Q2FuQWN0aXZhdGVIb29rfSBmcm9tICcuL2xpZmVjeWNsZS9yb3V0ZV9saWZlY3ljbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7Um91dGVEZWZpbml0aW9ufSBmcm9tICcuL3JvdXRlX2NvbmZpZy9yb3V0ZV9jb25maWdfaW1wbCc7XG5cbmxldCBfcmVzb2x2ZVRvVHJ1ZSA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUodHJ1ZSk7XG5sZXQgX3Jlc29sdmVUb0ZhbHNlID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShmYWxzZSk7XG5cbi8qKlxuICogVGhlIGBSb3V0ZXJgIGlzIHJlc3BvbnNpYmxlIGZvciBtYXBwaW5nIFVSTHMgdG8gY29tcG9uZW50cy5cbiAqXG4gKiBZb3UgY2FuIHNlZSB0aGUgc3RhdGUgb2YgdGhlIHJvdXRlciBieSBpbnNwZWN0aW5nIHRoZSByZWFkLW9ubHkgZmllbGQgYHJvdXRlci5uYXZpZ2F0aW5nYC5cbiAqIFRoaXMgbWF5IGJlIHVzZWZ1bCBmb3Igc2hvd2luZyBhIHNwaW5uZXIsIGZvciBpbnN0YW5jZS5cbiAqXG4gKiAjIyBDb25jZXB0c1xuICpcbiAqIFJvdXRlcnMgYW5kIGNvbXBvbmVudCBpbnN0YW5jZXMgaGF2ZSBhIDE6MSBjb3JyZXNwb25kZW5jZS5cbiAqXG4gKiBUaGUgcm91dGVyIGhvbGRzIHJlZmVyZW5jZSB0byBhIG51bWJlciBvZiB7QGxpbmsgUm91dGVyT3V0bGV0fS5cbiAqIEFuIG91dGxldCBpcyBhIHBsYWNlaG9sZGVyIHRoYXQgdGhlIHJvdXRlciBkeW5hbWljYWxseSBmaWxscyBpbiBkZXBlbmRpbmcgb24gdGhlIGN1cnJlbnQgVVJMLlxuICpcbiAqIFdoZW4gdGhlIHJvdXRlciBuYXZpZ2F0ZXMgZnJvbSBhIFVSTCwgaXQgbXVzdCBmaXJzdCByZWNvZ25pemUgaXQgYW5kIHNlcmlhbGl6ZSBpdCBpbnRvIGFuXG4gKiBgSW5zdHJ1Y3Rpb25gLlxuICogVGhlIHJvdXRlciB1c2VzIHRoZSBgUm91dGVSZWdpc3RyeWAgdG8gZ2V0IGFuIGBJbnN0cnVjdGlvbmAuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb3V0ZXIge1xuICBuYXZpZ2F0aW5nOiBib29sZWFuID0gZmFsc2U7XG4gIGxhc3ROYXZpZ2F0aW9uQXR0ZW1wdDogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIGN1cnJlbnQgYEluc3RydWN0aW9uYCBmb3IgdGhlIHJvdXRlclxuICAgKi9cbiAgcHVibGljIGN1cnJlbnRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuXG4gIHByaXZhdGUgX2N1cnJlbnROYXZpZ2F0aW9uOiBQcm9taXNlPGFueT4gPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgcHJpdmF0ZSBfb3V0bGV0OiBSb3V0ZXJPdXRsZXQgPSBudWxsO1xuXG4gIHByaXZhdGUgX2F1eFJvdXRlcnMgPSBuZXcgTWFwPHN0cmluZywgUm91dGVyPigpO1xuICBwcml2YXRlIF9jaGlsZFJvdXRlcjogUm91dGVyO1xuXG4gIHByaXZhdGUgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG5cbiAgY29uc3RydWN0b3IocHVibGljIHJlZ2lzdHJ5OiBSb3V0ZVJlZ2lzdHJ5LCBwdWJsaWMgcGFyZW50OiBSb3V0ZXIsIHB1YmxpYyBob3N0Q29tcG9uZW50OiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyByb290PzogUm91dGVyKSB7fVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgY2hpbGQgcm91dGVyLiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZVxuICAgKiBjb21wb25lbnQuXG4gICAqL1xuICBjaGlsZFJvdXRlcihob3N0Q29tcG9uZW50OiBhbnkpOiBSb3V0ZXIge1xuICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlciA9IG5ldyBDaGlsZFJvdXRlcih0aGlzLCBob3N0Q29tcG9uZW50KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBjaGlsZCByb3V0ZXIuIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlXG4gICAqIGNvbXBvbmVudC5cbiAgICovXG4gIGF1eFJvdXRlcihob3N0Q29tcG9uZW50OiBhbnkpOiBSb3V0ZXIgeyByZXR1cm4gbmV3IENoaWxkUm91dGVyKHRoaXMsIGhvc3RDb21wb25lbnQpOyB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGFuIG91dGxldCB0byBiZSBub3RpZmllZCBvZiBwcmltYXJ5IHJvdXRlIGNoYW5nZXMuXG4gICAqXG4gICAqIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlIGNvbXBvbmVudC5cbiAgICovXG4gIHJlZ2lzdGVyUHJpbWFyeU91dGxldChvdXRsZXQ6IFJvdXRlck91dGxldCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzUHJlc2VudChvdXRsZXQubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGByZWdpc3RlclByaW1hcnlPdXRsZXQgZXhwZWN0cyB0byBiZSBjYWxsZWQgd2l0aCBhbiB1bm5hbWVkIG91dGxldC5gKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX291dGxldCkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBQcmltYXJ5IG91dGxldCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuYCk7XG4gICAgfVxuXG4gICAgdGhpcy5fb3V0bGV0ID0gb3V0bGV0O1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24pKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21taXQodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24sIGZhbHNlKTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFVucmVnaXN0ZXIgYW4gb3V0bGV0IChiZWNhdXNlIGl0IHdhcyBkZXN0cm95ZWQsIGV0YykuXG4gICAqXG4gICAqIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIGN1c3RvbSBvdXRsZXQgaW1wbGVtZW50YXRpb24uXG4gICAqL1xuICB1bnJlZ2lzdGVyUHJpbWFyeU91dGxldChvdXRsZXQ6IFJvdXRlck91dGxldCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQob3V0bGV0Lm5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgcmVnaXN0ZXJQcmltYXJ5T3V0bGV0IGV4cGVjdHMgdG8gYmUgY2FsbGVkIHdpdGggYW4gdW5uYW1lZCBvdXRsZXQuYCk7XG4gICAgfVxuICAgIHRoaXMuX291dGxldCA9IG51bGw7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbiBvdXRsZXQgdG8gbm90aWZpZWQgb2YgYXV4aWxpYXJ5IHJvdXRlIGNoYW5nZXMuXG4gICAqXG4gICAqIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlIGNvbXBvbmVudC5cbiAgICovXG4gIHJlZ2lzdGVyQXV4T3V0bGV0KG91dGxldDogUm91dGVyT3V0bGV0KTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgb3V0bGV0TmFtZSA9IG91dGxldC5uYW1lO1xuICAgIGlmIChpc0JsYW5rKG91dGxldE5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgcmVnaXN0ZXJBdXhPdXRsZXQgZXhwZWN0cyB0byBiZSBjYWxsZWQgd2l0aCBhbiBvdXRsZXQgd2l0aCBhIG5hbWUuYCk7XG4gICAgfVxuXG4gICAgdmFyIHJvdXRlciA9IHRoaXMuYXV4Um91dGVyKHRoaXMuaG9zdENvbXBvbmVudCk7XG5cbiAgICB0aGlzLl9hdXhSb3V0ZXJzLnNldChvdXRsZXROYW1lLCByb3V0ZXIpO1xuICAgIHJvdXRlci5fb3V0bGV0ID0gb3V0bGV0O1xuXG4gICAgdmFyIGF1eEluc3RydWN0aW9uO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24pICYmXG4gICAgICAgIGlzUHJlc2VudChhdXhJbnN0cnVjdGlvbiA9IHRoaXMuY3VycmVudEluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uW291dGxldE5hbWVdKSkge1xuICAgICAgcmV0dXJuIHJvdXRlci5jb21taXQoYXV4SW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhbiBpbnN0cnVjdGlvbiwgcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGluc3RydWN0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmUsXG4gICAqIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgKi9cbiAgaXNSb3V0ZUFjdGl2ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBib29sZWFuIHtcbiAgICB2YXIgcm91dGVyOiBSb3V0ZXIgPSB0aGlzO1xuXG4gICAgaWYgKGlzQmxhbmsodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gYGluc3RydWN0aW9uYCBjb3JyZXNwb25kcyB0byB0aGUgcm9vdCByb3V0ZXJcbiAgICB3aGlsZSAoaXNQcmVzZW50KHJvdXRlci5wYXJlbnQpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgIHJvdXRlciA9IHJvdXRlci5wYXJlbnQ7XG4gICAgICBpbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNoaWxkO1xuICAgIH1cblxuICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uLmNvbXBvbmVudCkgfHwgaXNCbGFuayh0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQpIHx8XG4gICAgICAgIHRoaXMuY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5yb3V0ZU5hbWUgIT0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJvdXRlTmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBwYXJhbUVxdWFscyA9IHRydWU7XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5wYXJhbXMpKSB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnBhcmFtcywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5wYXJhbXNba2V5XSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICBwYXJhbUVxdWFscyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyYW1FcXVhbHM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEeW5hbWljYWxseSB1cGRhdGUgdGhlIHJvdXRpbmcgY29uZmlndXJhdGlvbiBhbmQgdHJpZ2dlciBhIG5hdmlnYXRpb24uXG4gICAqXG4gICAqICMjIyBVc2FnZVxuICAgKlxuICAgKiBgYGBcbiAgICogcm91dGVyLmNvbmZpZyhbXG4gICAqICAgeyAncGF0aCc6ICcvJywgJ2NvbXBvbmVudCc6IEluZGV4Q29tcCB9LFxuICAgKiAgIHsgJ3BhdGgnOiAnL3VzZXIvOmlkJywgJ2NvbXBvbmVudCc6IFVzZXJDb21wIH0sXG4gICAqIF0pO1xuICAgKiBgYGBcbiAgICovXG4gIGNvbmZpZyhkZWZpbml0aW9uczogUm91dGVEZWZpbml0aW9uW10pOiBQcm9taXNlPGFueT4ge1xuICAgIGRlZmluaXRpb25zLmZvckVhY2goXG4gICAgICAgIChyb3V0ZURlZmluaXRpb24pID0+IHsgdGhpcy5yZWdpc3RyeS5jb25maWcodGhpcy5ob3N0Q29tcG9uZW50LCByb3V0ZURlZmluaXRpb24pOyB9KTtcbiAgICByZXR1cm4gdGhpcy5yZW5hdmlnYXRlKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgUm91dGUgTGluayBEU0wuIEl0J3MgcHJlZmVycmVkIHRvIG5hdmlnYXRlIHdpdGggdGhpcyBtZXRob2RcbiAgICogb3ZlciBgbmF2aWdhdGVCeVVybGAuXG4gICAqXG4gICAqICMjIyBVc2FnZVxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCB0YWtlcyBhbiBhcnJheSByZXByZXNlbnRpbmcgdGhlIFJvdXRlIExpbmsgRFNMOlxuICAgKiBgYGBcbiAgICogWycuL015Q21wJywge3BhcmFtOiAzfV1cbiAgICogYGBgXG4gICAqIFNlZSB0aGUge0BsaW5rIFJvdXRlckxpbmt9IGRpcmVjdGl2ZSBmb3IgbW9yZS5cbiAgICovXG4gIG5hdmlnYXRlKGxpbmtQYXJhbXM6IGFueVtdKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgaW5zdHJ1Y3Rpb24gPSB0aGlzLmdlbmVyYXRlKGxpbmtQYXJhbXMpO1xuICAgIHJldHVybiB0aGlzLm5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbiwgZmFsc2UpO1xuICB9XG5cblxuICAvKipcbiAgICogTmF2aWdhdGUgdG8gYSBVUkwuIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBuYXZpZ2F0aW9uIGlzIGNvbXBsZXRlLlxuICAgKiBJdCdzIHByZWZlcnJlZCB0byBuYXZpZ2F0ZSB3aXRoIGBuYXZpZ2F0ZWAgaW5zdGVhZCBvZiB0aGlzIG1ldGhvZCwgc2luY2UgVVJMcyBhcmUgbW9yZSBicml0dGxlLlxuICAgKlxuICAgKiBJZiB0aGUgZ2l2ZW4gVVJMIGJlZ2lucyB3aXRoIGEgYC9gLCByb3V0ZXIgd2lsbCBuYXZpZ2F0ZSBhYnNvbHV0ZWx5LlxuICAgKiBJZiB0aGUgZ2l2ZW4gVVJMIGRvZXMgbm90IGJlZ2luIHdpdGggYC9gLCB0aGUgcm91dGVyIHdpbGwgbmF2aWdhdGUgcmVsYXRpdmUgdG8gdGhpcyBjb21wb25lbnQuXG4gICAqL1xuICBuYXZpZ2F0ZUJ5VXJsKHVybDogc3RyaW5nLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbiA9IHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uLnRoZW4oKF8pID0+IHtcbiAgICAgIHRoaXMubGFzdE5hdmlnYXRpb25BdHRlbXB0ID0gdXJsO1xuICAgICAgdGhpcy5fc3RhcnROYXZpZ2F0aW5nKCk7XG4gICAgICByZXR1cm4gdGhpcy5fYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyh0aGlzLnJlY29nbml6ZSh1cmwpLnRoZW4oKGluc3RydWN0aW9uKSA9PiB7XG4gICAgICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fbmF2aWdhdGUoaW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2UpO1xuICAgICAgfSkpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogTmF2aWdhdGUgdmlhIHRoZSBwcm92aWRlZCBpbnN0cnVjdGlvbi4gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIG5hdmlnYXRpb24gaXNcbiAgICogY29tcGxldGUuXG4gICAqL1xuICBuYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNCbGFuayhpbnN0cnVjdGlvbikpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvRmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbiA9IHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uLnRoZW4oKF8pID0+IHtcbiAgICAgIHRoaXMuX3N0YXJ0TmF2aWdhdGluZygpO1xuICAgICAgcmV0dXJuIHRoaXMuX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmcodGhpcy5fbmF2aWdhdGUoaW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2UpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGluc3RydWN0aW9uLnJlc29sdmVDb21wb25lbnQoKS50aGVuKChfKSA9PiB7XG4gICAgICB2YXIgdW5zZXR0bGVkSW5zdHJ1Y3Rpb25zOiBBcnJheTxQcm9taXNlPGFueT4+ID0gW107XG5cbiAgICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY29tcG9uZW50KSkge1xuICAgICAgICBpbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2UgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgICAgdW5zZXR0bGVkSW5zdHJ1Y3Rpb25zLnB1c2godGhpcy5fc2V0dGxlSW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24uY2hpbGQpKTtcbiAgICAgIH1cblxuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uLCAoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfKSA9PiB7XG4gICAgICAgIHVuc2V0dGxlZEluc3RydWN0aW9ucy5wdXNoKHRoaXMuX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5hbGwodW5zZXR0bGVkSW5zdHJ1Y3Rpb25zKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25hdmlnYXRlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uKVxuICAgICAgICAudGhlbigoXykgPT4gdGhpcy5fcm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb24pKVxuICAgICAgICAudGhlbigoXykgPT4gdGhpcy5fY2FuQWN0aXZhdGUoaW5zdHJ1Y3Rpb24pKVxuICAgICAgICAudGhlbigocmVzdWx0OiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3JvdXRlckNhbkRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb24pXG4gICAgICAgICAgICAgIC50aGVuKChyZXN1bHQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb21taXQoaW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKF8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VtaXROYXZpZ2F0aW9uRmluaXNoKGluc3RydWN0aW9uLnRvUm9vdFVybCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW1pdE5hdmlnYXRpb25GaW5pc2godXJsKTogdm9pZCB7IE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3N1YmplY3QsIHVybCk7IH1cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZW1pdE5hdmlnYXRpb25GYWlsKHVybCk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRXJyb3IodGhpcy5fc3ViamVjdCwgdXJsKTsgfVxuXG4gIHByaXZhdGUgX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmcocHJvbWlzZTogUHJvbWlzZTxhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuY2F0Y2hFcnJvcihwcm9taXNlLnRoZW4oKF8pID0+IHRoaXMuX2ZpbmlzaE5hdmlnYXRpbmcoKSksIChlcnIpID0+IHtcbiAgICAgIHRoaXMuX2ZpbmlzaE5hdmlnYXRpbmcoKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIFJlY3Vyc2l2ZWx5IHNldCByZXVzZSBmbGFnc1xuICAgKi9cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb0ZhbHNlO1xuICAgIH1cbiAgICBpZiAoaXNCbGFuayhpbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vdXRsZXQucm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb24uY29tcG9uZW50KVxuICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJldXNlID0gcmVzdWx0O1xuICAgICAgICAgIGlmIChyZXN1bHQgJiYgaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSAmJiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRSb3V0ZXIuX3JvdXRlckNhblJldXNlKGluc3RydWN0aW9uLmNoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FuQWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBjYW5BY3RpdmF0ZU9uZShuZXh0SW5zdHJ1Y3Rpb24sIHRoaXMuY3VycmVudEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JvdXRlckNhbkRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fb3V0bGV0KSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICAgIH1cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxib29sZWFuPjtcbiAgICB2YXIgY2hpbGRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIHZhciByZXVzZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICBjaGlsZEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY2hpbGQ7XG4gICAgICBjb21wb25lbnRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgICAgIHJldXNlID0gaXNCbGFuayhpbnN0cnVjdGlvbi5jb21wb25lbnQpIHx8IGluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZTtcbiAgICB9XG4gICAgaWYgKHJldXNlKSB7XG4gICAgICBuZXh0ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQgPSB0aGlzLl9vdXRsZXQucm91dGVyQ2FuRGVhY3RpdmF0ZShjb21wb25lbnRJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIC8vIFRPRE86IGF1eCByb3V0ZSBsaWZlY3ljbGUgaG9va3NcbiAgICByZXR1cm4gbmV4dC50aGVuPGJvb2xlYW4+KChyZXN1bHQpOiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICBpZiAocmVzdWx0ID09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpKSB7XG4gICAgICAgIC8vIFRPRE86IGlkZWFsbHksIHRoaXMgY2xvc3VyZSB3b3VsZCBtYXAgdG8gYXN5bmMtYXdhaXQgaW4gRGFydC5cbiAgICAgICAgLy8gRm9yIG5vdywgY2FzdGluZyB0byBhbnkgdG8gc3VwcHJlc3MgYW4gZXJyb3IuXG4gICAgICAgIHJldHVybiA8YW55PnRoaXMuX2NoaWxkUm91dGVyLl9yb3V0ZXJDYW5EZWFjdGl2YXRlKGNoaWxkSW5zdHJ1Y3Rpb24pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGlzIHJvdXRlciBhbmQgYWxsIGRlc2NlbmRhbnQgcm91dGVycyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGluc3RydWN0aW9uXG4gICAqL1xuICBjb21taXQoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHRoaXMuY3VycmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb247XG5cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxhbnk+ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vdXRsZXQpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgICBpZiAoY29tcG9uZW50SW5zdHJ1Y3Rpb24ucmV1c2UpIHtcbiAgICAgICAgbmV4dCA9IHRoaXMuX291dGxldC5yZXVzZShjb21wb25lbnRJbnN0cnVjdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0ID1cbiAgICAgICAgICAgIHRoaXMuZGVhY3RpdmF0ZShpbnN0cnVjdGlvbikudGhlbigoXykgPT4gdGhpcy5fb3V0bGV0LmFjdGl2YXRlKGNvbXBvbmVudEluc3RydWN0aW9uKSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgICBuZXh0ID0gbmV4dC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jaGlsZFJvdXRlcikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlci5jb21taXQoaW5zdHJ1Y3Rpb24uY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2VzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuICAgIHRoaXMuX2F1eFJvdXRlcnMuZm9yRWFjaCgocm91dGVyLCBuYW1lKSA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uW25hbWVdKSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKHJvdXRlci5jb21taXQoaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb25bbmFtZV0pKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBuZXh0LnRoZW4oKF8pID0+IFByb21pc2VXcmFwcGVyLmFsbChwcm9taXNlcykpO1xuICB9XG5cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdGFydE5hdmlnYXRpbmcoKTogdm9pZCB7IHRoaXMubmF2aWdhdGluZyA9IHRydWU7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5pc2hOYXZpZ2F0aW5nKCk6IHZvaWQgeyB0aGlzLm5hdmlnYXRpbmcgPSBmYWxzZTsgfVxuXG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byBVUkwgdXBkYXRlcyBmcm9tIHRoZSByb3V0ZXJcbiAgICovXG4gIHN1YnNjcmliZShvbk5leHQ6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCBvbkVycm9yPzogKHZhbHVlOiBhbnkpID0+IHZvaWQpOiBPYmplY3Qge1xuICAgIHJldHVybiBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fc3ViamVjdCwgb25OZXh0LCBvbkVycm9yKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGNvbnRlbnRzIG9mIHRoaXMgcm91dGVyJ3Mgb3V0bGV0IGFuZCBhbGwgZGVzY2VuZGFudCBvdXRsZXRzXG4gICAqL1xuICBkZWFjdGl2YXRlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIGNoaWxkSW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gbnVsbDtcbiAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uID0gbnVsbDtcbiAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uKSkge1xuICAgICAgY2hpbGRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNoaWxkO1xuICAgICAgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgfVxuICAgIHZhciBuZXh0OiBQcm9taXNlPGFueT4gPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSkge1xuICAgICAgbmV4dCA9IHRoaXMuX2NoaWxkUm91dGVyLmRlYWN0aXZhdGUoY2hpbGRJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fb3V0bGV0KSkge1xuICAgICAgbmV4dCA9IG5leHQudGhlbigoXykgPT4gdGhpcy5fb3V0bGV0LmRlYWN0aXZhdGUoY29tcG9uZW50SW5zdHJ1Y3Rpb24pKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBoYW5kbGUgYXV4IHJvdXRlc1xuXG4gICAgcmV0dXJuIG5leHQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFVSTCwgcmV0dXJucyBhbiBpbnN0cnVjdGlvbiByZXByZXNlbnRpbmcgdGhlIGNvbXBvbmVudCBncmFwaFxuICAgKi9cbiAgcmVjb2duaXplKHVybDogc3RyaW5nKTogUHJvbWlzZTxJbnN0cnVjdGlvbj4ge1xuICAgIHZhciBhbmNlc3RvckNvbXBvbmVudHMgPSB0aGlzLl9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LnJlY29nbml6ZSh1cmwsIGFuY2VzdG9yQ29tcG9uZW50cyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpOiBJbnN0cnVjdGlvbltdIHtcbiAgICB2YXIgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10gPSBbdGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb25dO1xuICAgIHZhciBhbmNlc3RvclJvdXRlcjogUm91dGVyID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGFuY2VzdG9yUm91dGVyID0gYW5jZXN0b3JSb3V0ZXIucGFyZW50KSkge1xuICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMudW5zaGlmdChhbmNlc3RvclJvdXRlci5jdXJyZW50SW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICByZXR1cm4gYW5jZXN0b3JJbnN0cnVjdGlvbnM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgdG8gZWl0aGVyIHRoZSBsYXN0IFVSTCBzdWNjZXNzZnVsbHkgbmF2aWdhdGVkIHRvLCBvciB0aGUgbGFzdCBVUkwgcmVxdWVzdGVkIGlmIHRoZVxuICAgKiByb3V0ZXIgaGFzIHlldCB0byBzdWNjZXNzZnVsbHkgbmF2aWdhdGUuXG4gICAqL1xuICByZW5hdmlnYXRlKCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudE5hdmlnYXRpb247XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm5hdmlnYXRlQnlVcmwodGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQpO1xuICB9XG5cblxuICAvKipcbiAgICogR2VuZXJhdGUgYW4gYEluc3RydWN0aW9uYCBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgUm91dGUgTGluayBEU0wuXG4gICAqL1xuICBnZW5lcmF0ZShsaW5rUGFyYW1zOiBhbnlbXSk6IEluc3RydWN0aW9uIHtcbiAgICB2YXIgYW5jZXN0b3JJbnN0cnVjdGlvbnMgPSB0aGlzLl9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdlbmVyYXRlKGxpbmtQYXJhbXMsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm9vdFJvdXRlciBleHRlbmRzIFJvdXRlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xvY2F0aW9uOiBMb2NhdGlvbjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9jYXRpb25TdWI6IE9iamVjdDtcblxuICBjb25zdHJ1Y3RvcihyZWdpc3RyeTogUm91dGVSZWdpc3RyeSwgbG9jYXRpb246IExvY2F0aW9uLFxuICAgICAgICAgICAgICBASW5qZWN0KFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCkgcHJpbWFyeUNvbXBvbmVudDogVHlwZSkge1xuICAgIHN1cGVyKHJlZ2lzdHJ5LCBudWxsLCBwcmltYXJ5Q29tcG9uZW50KTtcbiAgICB0aGlzLnJvb3QgPSB0aGlzO1xuICAgIHRoaXMuX2xvY2F0aW9uID0gbG9jYXRpb247XG4gICAgdGhpcy5fbG9jYXRpb25TdWIgPSB0aGlzLl9sb2NhdGlvbi5zdWJzY3JpYmUoKGNoYW5nZSkgPT4ge1xuICAgICAgLy8gd2UgY2FsbCByZWNvZ25pemUgb3Vyc2VsdmVzXG4gICAgICB0aGlzLnJlY29nbml6ZShjaGFuZ2VbJ3VybCddKVxuICAgICAgICAgIC50aGVuKChpbnN0cnVjdGlvbikgPT4ge1xuICAgICAgICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbikpIHtcbiAgICAgICAgICAgICAgdGhpcy5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24sIGlzUHJlc2VudChjaGFuZ2VbJ3BvcCddKSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYSBwb3BzdGF0ZSBldmVudDsgbm8gbmVlZCB0byBjaGFuZ2UgdGhlIFVSTFxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZVsncG9wJ10pICYmIGNoYW5nZVsndHlwZSddICE9ICdoYXNoY2hhbmdlJykge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgZW1pdFBhdGggPSBpbnN0cnVjdGlvbi50b1VybFBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVtaXRRdWVyeSA9IGluc3RydWN0aW9uLnRvVXJsUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVtaXRQYXRoLmxlbmd0aCA+IDAgJiYgZW1pdFBhdGhbMF0gIT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgZW1pdFBhdGggPSAnLycgKyBlbWl0UGF0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlJ3ZlIG9wdGVkIHRvIHVzZSBwdXNoc3RhdGUgYW5kIHBvcFN0YXRlIEFQSXMgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHlvdVxuICAgICAgICAgICAgICAgICAgICAvLyBhbiBhcHAgdXNlcyBIYXNoTG9jYXRpb25TdHJhdGVneSBvciBQYXRoTG9jYXRpb25TdHJhdGVneS5cbiAgICAgICAgICAgICAgICAgICAgLy8gSG93ZXZlciwgYXBwcyB0aGF0IGFyZSBtaWdyYXRpbmcgbWlnaHQgaGF2ZSBoYXNoIGxpbmtzIHRoYXQgb3BlcmF0ZSBvdXRzaWRlXG4gICAgICAgICAgICAgICAgICAgIC8vIGFuZ3VsYXIgdG8gd2hpY2ggcm91dGluZyBtdXN0IHJlc3BvbmQuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZXJlZm9yZSB3ZSBrbm93IHRoYXQgYWxsIGhhc2hjaGFuZ2UgZXZlbnRzIG9jY3VyIG91dHNpZGUgQW5ndWxhci5cbiAgICAgICAgICAgICAgICAgICAgLy8gVG8gc3VwcG9ydCB0aGVzZSBjYXNlcyB3aGVyZSB3ZSByZXNwb25kIHRvIGhhc2hjaGFuZ2VzIGFuZCByZWRpcmVjdCBhcyBhXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlc3VsdCwgd2UgbmVlZCB0byByZXBsYWNlIHRoZSB0b3AgaXRlbSBvbiB0aGUgc3RhY2suXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGFuZ2VbJ3R5cGUnXSA9PSAnaGFzaGNoYW5nZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdHJ1Y3Rpb24udG9Sb290VXJsKCkgIT0gdGhpcy5fbG9jYXRpb24ucGF0aCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2NhdGlvbi5yZXBsYWNlU3RhdGUoZW1pdFBhdGgsIGVtaXRRdWVyeSk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvY2F0aW9uLmdvKGVtaXRQYXRoLCBlbWl0UXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuX2VtaXROYXZpZ2F0aW9uRmFpbChjaGFuZ2VbJ3VybCddKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVnaXN0cnkuY29uZmlnRnJvbUNvbXBvbmVudChwcmltYXJ5Q29tcG9uZW50KTtcbiAgICB0aGlzLm5hdmlnYXRlQnlVcmwobG9jYXRpb24ucGF0aCgpKTtcbiAgfVxuXG4gIGNvbW1pdChpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIGVtaXRQYXRoID0gaW5zdHJ1Y3Rpb24udG9VcmxQYXRoKCk7XG4gICAgdmFyIGVtaXRRdWVyeSA9IGluc3RydWN0aW9uLnRvVXJsUXVlcnkoKTtcbiAgICBpZiAoZW1pdFBhdGgubGVuZ3RoID4gMCAmJiBlbWl0UGF0aFswXSAhPSAnLycpIHtcbiAgICAgIGVtaXRQYXRoID0gJy8nICsgZW1pdFBhdGg7XG4gICAgfVxuICAgIHZhciBwcm9taXNlID0gc3VwZXIuY29tbWl0KGluc3RydWN0aW9uKTtcbiAgICBpZiAoIV9za2lwTG9jYXRpb25DaGFuZ2UpIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oKF8pID0+IHsgdGhpcy5fbG9jYXRpb24uZ28oZW1pdFBhdGgsIGVtaXRRdWVyeSk7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9sb2NhdGlvblN1YikpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5fbG9jYXRpb25TdWIpO1xuICAgICAgdGhpcy5fbG9jYXRpb25TdWIgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDaGlsZFJvdXRlciBleHRlbmRzIFJvdXRlciB7XG4gIGNvbnN0cnVjdG9yKHBhcmVudDogUm91dGVyLCBob3N0Q29tcG9uZW50KSB7XG4gICAgc3VwZXIocGFyZW50LnJlZ2lzdHJ5LCBwYXJlbnQsIGhvc3RDb21wb25lbnQsIHBhcmVudC5yb290KTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgfVxuXG5cbiAgbmF2aWdhdGVCeVVybCh1cmw6IHN0cmluZywgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAvLyBEZWxlZ2F0ZSBuYXZpZ2F0aW9uIHRvIHRoZSByb290IHJvdXRlclxuICAgIHJldHVybiB0aGlzLnBhcmVudC5uYXZpZ2F0ZUJ5VXJsKHVybCwgX3NraXBMb2NhdGlvbkNoYW5nZSk7XG4gIH1cblxuICBuYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAvLyBEZWxlZ2F0ZSBuYXZpZ2F0aW9uIHRvIHRoZSByb290IHJvdXRlclxuICAgIHJldHVybiB0aGlzLnBhcmVudC5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2UpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gY2FuQWN0aXZhdGVPbmUobmV4dEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdmFyIG5leHQgPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgaWYgKGlzQmxhbmsobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICByZXR1cm4gbmV4dDtcbiAgfVxuICBpZiAoaXNQcmVzZW50KG5leHRJbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICBuZXh0ID0gY2FuQWN0aXZhdGVPbmUobmV4dEluc3RydWN0aW9uLmNoaWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpc1ByZXNlbnQocHJldkluc3RydWN0aW9uKSA/IHByZXZJbnN0cnVjdGlvbi5jaGlsZCA6IG51bGwpO1xuICB9XG4gIHJldHVybiBuZXh0LnRoZW48Ym9vbGVhbj4oKHJlc3VsdDogYm9vbGVhbik6IGJvb2xlYW4gPT4ge1xuICAgIGlmIChyZXN1bHQgPT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2UpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YXIgaG9vayA9IGdldENhbkFjdGl2YXRlSG9vayhuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50LmNvbXBvbmVudFR5cGUpO1xuICAgIGlmIChpc1ByZXNlbnQoaG9vaykpIHtcbiAgICAgIHJldHVybiBob29rKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICBpc1ByZXNlbnQocHJldkluc3RydWN0aW9uKSA/IHByZXZJbnN0cnVjdGlvbi5jb21wb25lbnQgOiBudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuIl19