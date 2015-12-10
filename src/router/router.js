'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
var core_1 = require('angular2/core');
var route_registry_1 = require('./route_registry');
var location_1 = require('./location');
var route_lifecycle_reflector_1 = require('./route_lifecycle_reflector');
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
    function Router(registry, parent, hostComponent) {
        this.registry = registry;
        this.parent = parent;
        this.hostComponent = hostComponent;
        this.navigating = false;
        this._currentInstruction = null;
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
        this._outlet = outlet;
        if (lang_1.isPresent(this._currentInstruction)) {
            return this.commit(this._currentInstruction, false);
        }
        return _resolveToTrue;
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
        // TODO...
        // what is the host of an aux route???
        var router = this.auxRouter(this.hostComponent);
        this._auxRouters.set(outletName, router);
        router._outlet = outlet;
        var auxInstruction;
        if (lang_1.isPresent(this._currentInstruction) &&
            lang_1.isPresent(auxInstruction = this._currentInstruction.auxInstruction[outletName])) {
            return router.commit(auxInstruction);
        }
        return _resolveToTrue;
    };
    /**
     * Given an instruction, returns `true` if the instruction is currently active,
     * otherwise `false`.
     */
    Router.prototype.isRouteActive = function (instruction) {
        var router = this;
        while (lang_1.isPresent(router.parent) && lang_1.isPresent(instruction.child)) {
            router = router.parent;
            instruction = instruction.child;
        }
        return lang_1.isPresent(this._currentInstruction) &&
            this._currentInstruction.component == instruction.component;
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
    /** @internal */
    Router.prototype._settleInstruction = function (instruction) {
        var _this = this;
        return instruction.resolveComponent().then(function (_) {
            instruction.component.reuse = false;
            var unsettledInstructions = [];
            if (lang_1.isPresent(instruction.child)) {
                unsettledInstructions.push(_this._settleInstruction(instruction.child));
            }
            collection_1.StringMapWrapper.forEach(instruction.auxInstruction, function (instruction, _) {
                unsettledInstructions.push(_this._settleInstruction(instruction));
            });
            return async_1.PromiseWrapper.all(unsettledInstructions);
        });
    };
    Router.prototype._emitNavigationFinish = function (url) { async_1.ObservableWrapper.callEmit(this._subject, url); };
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
        return this._outlet.routerCanReuse(instruction.component)
            .then(function (result) {
            instruction.component.reuse = result;
            if (result && lang_1.isPresent(_this._childRouter) && lang_1.isPresent(instruction.child)) {
                return _this._childRouter._routerCanReuse(instruction.child);
            }
        });
    };
    Router.prototype._canActivate = function (nextInstruction) {
        return canActivateOne(nextInstruction, this._currentInstruction);
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
            reuse = instruction.component.reuse;
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
        this._currentInstruction = instruction;
        var next = _resolveToTrue;
        if (lang_1.isPresent(this._outlet)) {
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
    Router.prototype.subscribe = function (onNext) {
        return async_1.ObservableWrapper.subscribe(this._subject, onNext);
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
        var ancestorComponents = [];
        var ancestorRouter = this;
        while (lang_1.isPresent(ancestorRouter.parent) &&
            lang_1.isPresent(ancestorRouter.parent._currentInstruction)) {
            ancestorRouter = ancestorRouter.parent;
            ancestorComponents.unshift(ancestorRouter._currentInstruction);
        }
        return ancestorComponents;
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
    return Router;
})();
exports.Router = Router;
var RootRouter = (function (_super) {
    __extends(RootRouter, _super);
    function RootRouter(registry, location, primaryComponent) {
        var _this = this;
        _super.call(this, registry, null, primaryComponent);
        this._location = location;
        this._locationSub = this._location.subscribe(function (change) {
            // we call recognize ourselves
            _this.recognize(change['url'])
                .then(function (instruction) {
                _this.navigateByInstruction(instruction, lang_1.isPresent(change['pop']))
                    .then(function (_) {
                    // this is a popstate event; no need to change the URL
                    if (lang_1.isPresent(change['pop']) && change['type'] != 'hashchange') {
                        return;
                    }
                    var emitPath = instruction.toUrlPath();
                    var emitQuery = instruction.toUrlQuery();
                    if (emitPath.length > 0) {
                        emitPath = '/' + emitPath;
                    }
                    // Because we've opted to use All hashchange events occur outside Angular.
                    // However, apps that are migrating might have hash links that operate outside
                    // angular to which routing must respond.
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
        if (emitPath.length > 0) {
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
        __metadata('design:paramtypes', [route_registry_1.RouteRegistry, location_1.Location, lang_1.Type])
    ], RootRouter);
    return RootRouter;
})(Router);
exports.RootRouter = RootRouter;
var ChildRouter = (function (_super) {
    __extends(ChildRouter, _super);
    function ChildRouter(parent, hostComponent) {
        _super.call(this, parent.registry, parent, hostComponent);
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
})(Router);
function canActivateOne(nextInstruction, prevInstruction) {
    var next = _resolveToTrue;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3JvdXRlci9yb3V0ZXIudHMiXSwibmFtZXMiOlsiUm91dGVyIiwiUm91dGVyLmNvbnN0cnVjdG9yIiwiUm91dGVyLmNoaWxkUm91dGVyIiwiUm91dGVyLmF1eFJvdXRlciIsIlJvdXRlci5yZWdpc3RlclByaW1hcnlPdXRsZXQiLCJSb3V0ZXIucmVnaXN0ZXJBdXhPdXRsZXQiLCJSb3V0ZXIuaXNSb3V0ZUFjdGl2ZSIsIlJvdXRlci5jb25maWciLCJSb3V0ZXIubmF2aWdhdGUiLCJSb3V0ZXIubmF2aWdhdGVCeVVybCIsIlJvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24iLCJSb3V0ZXIuX25hdmlnYXRlIiwiUm91dGVyLl9zZXR0bGVJbnN0cnVjdGlvbiIsIlJvdXRlci5fZW1pdE5hdmlnYXRpb25GaW5pc2giLCJSb3V0ZXIuX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmciLCJSb3V0ZXIuX3JvdXRlckNhblJldXNlIiwiUm91dGVyLl9jYW5BY3RpdmF0ZSIsIlJvdXRlci5fcm91dGVyQ2FuRGVhY3RpdmF0ZSIsIlJvdXRlci5jb21taXQiLCJSb3V0ZXIuX3N0YXJ0TmF2aWdhdGluZyIsIlJvdXRlci5fZmluaXNoTmF2aWdhdGluZyIsIlJvdXRlci5zdWJzY3JpYmUiLCJSb3V0ZXIuZGVhY3RpdmF0ZSIsIlJvdXRlci5yZWNvZ25pemUiLCJSb3V0ZXIuX2dldEFuY2VzdG9ySW5zdHJ1Y3Rpb25zIiwiUm91dGVyLnJlbmF2aWdhdGUiLCJSb3V0ZXIuZ2VuZXJhdGUiLCJSb290Um91dGVyIiwiUm9vdFJvdXRlci5jb25zdHJ1Y3RvciIsIlJvb3RSb3V0ZXIuY29tbWl0IiwiUm9vdFJvdXRlci5kaXNwb3NlIiwiQ2hpbGRSb3V0ZXIiLCJDaGlsZFJvdXRlci5jb25zdHJ1Y3RvciIsIkNoaWxkUm91dGVyLm5hdmlnYXRlQnlVcmwiLCJDaGlsZFJvdXRlci5uYXZpZ2F0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Q0EsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDN0VBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBLENBQUNBLENBQUNBO0FBQ0xBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlciwgRXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge01hcCwgU3RyaW5nTWFwV3JhcHBlciwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzQmxhbmssIGlzU3RyaW5nLCBpc1ByZXNlbnQsIFR5cGUsIGlzQXJyYXl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7Um91dGVSZWdpc3RyeSwgUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UfSBmcm9tICcuL3JvdXRlX3JlZ2lzdHJ5JztcbmltcG9ydCB7XG4gIENvbXBvbmVudEluc3RydWN0aW9uLFxuICBJbnN0cnVjdGlvbixcbn0gZnJvbSAnLi9pbnN0cnVjdGlvbic7XG5pbXBvcnQge1JvdXRlck91dGxldH0gZnJvbSAnLi9yb3V0ZXJfb3V0bGV0JztcbmltcG9ydCB7TG9jYXRpb259IGZyb20gJy4vbG9jYXRpb24nO1xuaW1wb3J0IHtnZXRDYW5BY3RpdmF0ZUhvb2t9IGZyb20gJy4vcm91dGVfbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge1JvdXRlRGVmaW5pdGlvbn0gZnJvbSAnLi9yb3V0ZV9jb25maWdfaW1wbCc7XG5cbmxldCBfcmVzb2x2ZVRvVHJ1ZSA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUodHJ1ZSk7XG5sZXQgX3Jlc29sdmVUb0ZhbHNlID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShmYWxzZSk7XG5cbi8qKlxuICogVGhlIGBSb3V0ZXJgIGlzIHJlc3BvbnNpYmxlIGZvciBtYXBwaW5nIFVSTHMgdG8gY29tcG9uZW50cy5cbiAqXG4gKiBZb3UgY2FuIHNlZSB0aGUgc3RhdGUgb2YgdGhlIHJvdXRlciBieSBpbnNwZWN0aW5nIHRoZSByZWFkLW9ubHkgZmllbGQgYHJvdXRlci5uYXZpZ2F0aW5nYC5cbiAqIFRoaXMgbWF5IGJlIHVzZWZ1bCBmb3Igc2hvd2luZyBhIHNwaW5uZXIsIGZvciBpbnN0YW5jZS5cbiAqXG4gKiAjIyBDb25jZXB0c1xuICpcbiAqIFJvdXRlcnMgYW5kIGNvbXBvbmVudCBpbnN0YW5jZXMgaGF2ZSBhIDE6MSBjb3JyZXNwb25kZW5jZS5cbiAqXG4gKiBUaGUgcm91dGVyIGhvbGRzIHJlZmVyZW5jZSB0byBhIG51bWJlciBvZiB7QGxpbmsgUm91dGVyT3V0bGV0fS5cbiAqIEFuIG91dGxldCBpcyBhIHBsYWNlaG9sZGVyIHRoYXQgdGhlIHJvdXRlciBkeW5hbWljYWxseSBmaWxscyBpbiBkZXBlbmRpbmcgb24gdGhlIGN1cnJlbnQgVVJMLlxuICpcbiAqIFdoZW4gdGhlIHJvdXRlciBuYXZpZ2F0ZXMgZnJvbSBhIFVSTCwgaXQgbXVzdCBmaXJzdCByZWNvZ25pemUgaXQgYW5kIHNlcmlhbGl6ZSBpdCBpbnRvIGFuXG4gKiBgSW5zdHJ1Y3Rpb25gLlxuICogVGhlIHJvdXRlciB1c2VzIHRoZSBgUm91dGVSZWdpc3RyeWAgdG8gZ2V0IGFuIGBJbnN0cnVjdGlvbmAuXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZXIge1xuICBuYXZpZ2F0aW5nOiBib29sZWFuID0gZmFsc2U7XG4gIGxhc3ROYXZpZ2F0aW9uQXR0ZW1wdDogc3RyaW5nO1xuXG4gIHByaXZhdGUgX2N1cnJlbnRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuXG4gIHByaXZhdGUgX2N1cnJlbnROYXZpZ2F0aW9uOiBQcm9taXNlPGFueT4gPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgcHJpdmF0ZSBfb3V0bGV0OiBSb3V0ZXJPdXRsZXQgPSBudWxsO1xuXG4gIHByaXZhdGUgX2F1eFJvdXRlcnMgPSBuZXcgTWFwPHN0cmluZywgUm91dGVyPigpO1xuICBwcml2YXRlIF9jaGlsZFJvdXRlcjogUm91dGVyO1xuXG4gIHByaXZhdGUgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG5cbiAgY29uc3RydWN0b3IocHVibGljIHJlZ2lzdHJ5OiBSb3V0ZVJlZ2lzdHJ5LCBwdWJsaWMgcGFyZW50OiBSb3V0ZXIsIHB1YmxpYyBob3N0Q29tcG9uZW50OiBhbnkpIHt9XG5cblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIGNoaWxkIHJvdXRlci4gWW91IHByb2JhYmx5IGRvbid0IG5lZWQgdG8gdXNlIHRoaXMgdW5sZXNzIHlvdSdyZSB3cml0aW5nIGEgcmV1c2FibGVcbiAgICogY29tcG9uZW50LlxuICAgKi9cbiAgY2hpbGRSb3V0ZXIoaG9zdENvbXBvbmVudDogYW55KTogUm91dGVyIHtcbiAgICByZXR1cm4gdGhpcy5fY2hpbGRSb3V0ZXIgPSBuZXcgQ2hpbGRSb3V0ZXIodGhpcywgaG9zdENvbXBvbmVudCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgY2hpbGQgcm91dGVyLiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZVxuICAgKiBjb21wb25lbnQuXG4gICAqL1xuICBhdXhSb3V0ZXIoaG9zdENvbXBvbmVudDogYW55KTogUm91dGVyIHsgcmV0dXJuIG5ldyBDaGlsZFJvdXRlcih0aGlzLCBob3N0Q29tcG9uZW50KTsgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbiBvdXRsZXQgdG8gYmUgbm90aWZpZWQgb2YgcHJpbWFyeSByb3V0ZSBjaGFuZ2VzLlxuICAgKlxuICAgKiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZSBjb21wb25lbnQuXG4gICAqL1xuICByZWdpc3RlclByaW1hcnlPdXRsZXQob3V0bGV0OiBSb3V0ZXJPdXRsZXQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoaXNQcmVzZW50KG91dGxldC5uYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYHJlZ2lzdGVyUHJpbWFyeU91dGxldCBleHBlY3RzIHRvIGJlIGNhbGxlZCB3aXRoIGFuIHVubmFtZWQgb3V0bGV0LmApO1xuICAgIH1cblxuICAgIHRoaXMuX291dGxldCA9IG91dGxldDtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbW1pdCh0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24sIGZhbHNlKTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGFuIG91dGxldCB0byBub3RpZmllZCBvZiBhdXhpbGlhcnkgcm91dGUgY2hhbmdlcy5cbiAgICpcbiAgICogWW91IHByb2JhYmx5IGRvbid0IG5lZWQgdG8gdXNlIHRoaXMgdW5sZXNzIHlvdSdyZSB3cml0aW5nIGEgcmV1c2FibGUgY29tcG9uZW50LlxuICAgKi9cbiAgcmVnaXN0ZXJBdXhPdXRsZXQob3V0bGV0OiBSb3V0ZXJPdXRsZXQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB2YXIgb3V0bGV0TmFtZSA9IG91dGxldC5uYW1lO1xuICAgIGlmIChpc0JsYW5rKG91dGxldE5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgcmVnaXN0ZXJBdXhPdXRsZXQgZXhwZWN0cyB0byBiZSBjYWxsZWQgd2l0aCBhbiBvdXRsZXQgd2l0aCBhIG5hbWUuYCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETy4uLlxuICAgIC8vIHdoYXQgaXMgdGhlIGhvc3Qgb2YgYW4gYXV4IHJvdXRlPz8/XG4gICAgdmFyIHJvdXRlciA9IHRoaXMuYXV4Um91dGVyKHRoaXMuaG9zdENvbXBvbmVudCk7XG5cbiAgICB0aGlzLl9hdXhSb3V0ZXJzLnNldChvdXRsZXROYW1lLCByb3V0ZXIpO1xuICAgIHJvdXRlci5fb3V0bGV0ID0gb3V0bGV0O1xuXG4gICAgdmFyIGF1eEluc3RydWN0aW9uO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSAmJlxuICAgICAgICBpc1ByZXNlbnQoYXV4SW5zdHJ1Y3Rpb24gPSB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb25bb3V0bGV0TmFtZV0pKSB7XG4gICAgICByZXR1cm4gcm91dGVyLmNvbW1pdChhdXhJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdpdmVuIGFuIGluc3RydWN0aW9uLCByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaW5zdHJ1Y3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZSxcbiAgICogb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAqL1xuICBpc1JvdXRlQWN0aXZlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IGJvb2xlYW4ge1xuICAgIHZhciByb3V0ZXIgPSB0aGlzO1xuICAgIHdoaWxlIChpc1ByZXNlbnQocm91dGVyLnBhcmVudCkgJiYgaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgcm91dGVyID0gcm91dGVyLnBhcmVudDtcbiAgICAgIGluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY2hpbGQ7XG4gICAgfVxuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSAmJlxuICAgICAgICAgICB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50ID09IGluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIER5bmFtaWNhbGx5IHVwZGF0ZSB0aGUgcm91dGluZyBjb25maWd1cmF0aW9uIGFuZCB0cmlnZ2VyIGEgbmF2aWdhdGlvbi5cbiAgICpcbiAgICogIyMjIFVzYWdlXG4gICAqXG4gICAqIGBgYFxuICAgKiByb3V0ZXIuY29uZmlnKFtcbiAgICogICB7ICdwYXRoJzogJy8nLCAnY29tcG9uZW50JzogSW5kZXhDb21wIH0sXG4gICAqICAgeyAncGF0aCc6ICcvdXNlci86aWQnLCAnY29tcG9uZW50JzogVXNlckNvbXAgfSxcbiAgICogXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgY29uZmlnKGRlZmluaXRpb25zOiBSb3V0ZURlZmluaXRpb25bXSk6IFByb21pc2U8YW55PiB7XG4gICAgZGVmaW5pdGlvbnMuZm9yRWFjaChcbiAgICAgICAgKHJvdXRlRGVmaW5pdGlvbikgPT4geyB0aGlzLnJlZ2lzdHJ5LmNvbmZpZyh0aGlzLmhvc3RDb21wb25lbnQsIHJvdXRlRGVmaW5pdGlvbik7IH0pO1xuICAgIHJldHVybiB0aGlzLnJlbmF2aWdhdGUoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBSb3V0ZSBMaW5rIERTTC4gSXQncyBwcmVmZXJyZWQgdG8gbmF2aWdhdGUgd2l0aCB0aGlzIG1ldGhvZFxuICAgKiBvdmVyIGBuYXZpZ2F0ZUJ5VXJsYC5cbiAgICpcbiAgICogIyMjIFVzYWdlXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIHRha2VzIGFuIGFycmF5IHJlcHJlc2VudGluZyB0aGUgUm91dGUgTGluayBEU0w6XG4gICAqIGBgYFxuICAgKiBbJy4vTXlDbXAnLCB7cGFyYW06IDN9XVxuICAgKiBgYGBcbiAgICogU2VlIHRoZSB7QGxpbmsgUm91dGVyTGlua30gZGlyZWN0aXZlIGZvciBtb3JlLlxuICAgKi9cbiAgbmF2aWdhdGUobGlua1BhcmFtczogYW55W10pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBpbnN0cnVjdGlvbiA9IHRoaXMuZ2VuZXJhdGUobGlua1BhcmFtcyk7XG4gICAgcmV0dXJuIHRoaXMubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uLCBmYWxzZSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSB0byBhIFVSTC4gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIG5hdmlnYXRpb24gaXMgY29tcGxldGUuXG4gICAqIEl0J3MgcHJlZmVycmVkIHRvIG5hdmlnYXRlIHdpdGggYG5hdmlnYXRlYCBpbnN0ZWFkIG9mIHRoaXMgbWV0aG9kLCBzaW5jZSBVUkxzIGFyZSBtb3JlIGJyaXR0bGUuXG4gICAqXG4gICAqIElmIHRoZSBnaXZlbiBVUkwgYmVnaW5zIHdpdGggYSBgL2AsIHJvdXRlciB3aWxsIG5hdmlnYXRlIGFic29sdXRlbHkuXG4gICAqIElmIHRoZSBnaXZlbiBVUkwgZG9lcyBub3QgYmVnaW4gd2l0aCBgL2AsIHRoZSByb3V0ZXIgd2lsbCBuYXZpZ2F0ZSByZWxhdGl2ZSB0byB0aGlzIGNvbXBvbmVudC5cbiAgICovXG4gIG5hdmlnYXRlQnlVcmwodXJsOiBzdHJpbmcsIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uID0gdGhpcy5fY3VycmVudE5hdmlnYXRpb24udGhlbigoXykgPT4ge1xuICAgICAgdGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQgPSB1cmw7XG4gICAgICB0aGlzLl9zdGFydE5hdmlnYXRpbmcoKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZnRlclByb21pc2VGaW5pc2hOYXZpZ2F0aW5nKHRoaXMucmVjb2duaXplKHVybCkudGhlbigoaW5zdHJ1Y3Rpb24pID0+IHtcbiAgICAgICAgaWYgKGlzQmxhbmsoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9uYXZpZ2F0ZShpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSk7XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSB2aWEgdGhlIHByb3ZpZGVkIGluc3RydWN0aW9uLiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gbmF2aWdhdGlvbiBpc1xuICAgKiBjb21wbGV0ZS5cbiAgICovXG4gIG5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9GYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uID0gdGhpcy5fY3VycmVudE5hdmlnYXRpb24udGhlbigoXykgPT4ge1xuICAgICAgdGhpcy5fc3RhcnROYXZpZ2F0aW5nKCk7XG4gICAgICByZXR1cm4gdGhpcy5fYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyh0aGlzLl9uYXZpZ2F0ZShpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmF2aWdhdGUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5fc2V0dGxlSW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24pXG4gICAgICAgIC50aGVuKChfKSA9PiB0aGlzLl9yb3V0ZXJDYW5SZXVzZShpbnN0cnVjdGlvbikpXG4gICAgICAgIC50aGVuKChfKSA9PiB0aGlzLl9jYW5BY3RpdmF0ZShpbnN0cnVjdGlvbikpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcy5fcm91dGVyQ2FuRGVhY3RpdmF0ZShpbnN0cnVjdGlvbilcbiAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbW1pdChpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSlcbiAgICAgICAgICAgICAgICAgICAgICAudGhlbigoXykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW1pdE5hdmlnYXRpb25GaW5pc2goaW5zdHJ1Y3Rpb24udG9Sb290VXJsKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBpbnN0cnVjdGlvbi5yZXNvbHZlQ29tcG9uZW50KCkudGhlbigoXykgPT4ge1xuICAgICAgaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJldXNlID0gZmFsc2U7XG5cbiAgICAgIHZhciB1bnNldHRsZWRJbnN0cnVjdGlvbnM6IEFycmF5PFByb21pc2U8YW55Pj4gPSBbXTtcblxuICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgICAgdW5zZXR0bGVkSW5zdHJ1Y3Rpb25zLnB1c2godGhpcy5fc2V0dGxlSW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24uY2hpbGQpKTtcbiAgICAgIH1cblxuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uLCAoaW5zdHJ1Y3Rpb24sIF8pID0+IHtcbiAgICAgICAgdW5zZXR0bGVkSW5zdHJ1Y3Rpb25zLnB1c2godGhpcy5fc2V0dGxlSW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24pKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmFsbCh1bnNldHRsZWRJbnN0cnVjdGlvbnMpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW1pdE5hdmlnYXRpb25GaW5pc2godXJsKTogdm9pZCB7IE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3N1YmplY3QsIHVybCk7IH1cblxuICBwcml2YXRlIF9hZnRlclByb21pc2VGaW5pc2hOYXZpZ2F0aW5nKHByb21pc2U6IFByb21pc2U8YW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmNhdGNoRXJyb3IocHJvbWlzZS50aGVuKChfKSA9PiB0aGlzLl9maW5pc2hOYXZpZ2F0aW5nKCkpLCAoZXJyKSA9PiB7XG4gICAgICB0aGlzLl9maW5pc2hOYXZpZ2F0aW5nKCk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG4gIH1cblxuICAvKlxuICAgKiBSZWN1cnNpdmVseSBzZXQgcmV1c2UgZmxhZ3NcbiAgICovXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JvdXRlckNhblJldXNlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fb3V0bGV0KSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9GYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX291dGxldC5yb3V0ZXJDYW5SZXVzZShpbnN0cnVjdGlvbi5jb21wb25lbnQpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBpbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2UgPSByZXN1bHQ7XG4gICAgICAgICAgaWYgKHJlc3VsdCAmJiBpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlci5fcm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb24uY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jYW5BY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGNhbkFjdGl2YXRlT25lKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JvdXRlckNhbkRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fb3V0bGV0KSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICAgIH1cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxib29sZWFuPjtcbiAgICB2YXIgY2hpbGRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIHZhciByZXVzZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICBjaGlsZEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY2hpbGQ7XG4gICAgICBjb21wb25lbnRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgICAgIHJldXNlID0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJldXNlO1xuICAgIH1cbiAgICBpZiAocmV1c2UpIHtcbiAgICAgIG5leHQgPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dCA9IHRoaXMuX291dGxldC5yb3V0ZXJDYW5EZWFjdGl2YXRlKGNvbXBvbmVudEluc3RydWN0aW9uKTtcbiAgICB9XG4gICAgLy8gVE9ETzogYXV4IHJvdXRlIGxpZmVjeWNsZSBob29rc1xuICAgIHJldHVybiBuZXh0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgaWYgKHJlc3VsdCA9PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRSb3V0ZXIuX3JvdXRlckNhbkRlYWN0aXZhdGUoY2hpbGRJbnN0cnVjdGlvbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoaXMgcm91dGVyIGFuZCBhbGwgZGVzY2VuZGFudCByb3V0ZXJzIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gaW5zdHJ1Y3Rpb25cbiAgICovXG4gIGNvbW1pdChpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgdGhpcy5fY3VycmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb247XG4gICAgdmFyIG5leHQ6IFByb21pc2U8YW55PiA9IF9yZXNvbHZlVG9UcnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fb3V0bGV0KSkge1xuICAgICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICAgICAgaWYgKGNvbXBvbmVudEluc3RydWN0aW9uLnJldXNlKSB7XG4gICAgICAgIG5leHQgPSB0aGlzLl9vdXRsZXQucmV1c2UoY29tcG9uZW50SW5zdHJ1Y3Rpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dCA9XG4gICAgICAgICAgICB0aGlzLmRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb24pLnRoZW4oKF8pID0+IHRoaXMuX291dGxldC5hY3RpdmF0ZShjb21wb25lbnRJbnN0cnVjdGlvbikpO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgICAgbmV4dCA9IG5leHQudGhlbigoXykgPT4ge1xuICAgICAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRSb3V0ZXIuY29tbWl0KGluc3RydWN0aW9uLmNoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgIHRoaXMuX2F1eFJvdXRlcnMuZm9yRWFjaCgocm91dGVyLCBuYW1lKSA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uW25hbWVdKSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKHJvdXRlci5jb21taXQoaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb25bbmFtZV0pKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBuZXh0LnRoZW4oKF8pID0+IFByb21pc2VXcmFwcGVyLmFsbChwcm9taXNlcykpO1xuICB9XG5cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdGFydE5hdmlnYXRpbmcoKTogdm9pZCB7IHRoaXMubmF2aWdhdGluZyA9IHRydWU7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5pc2hOYXZpZ2F0aW5nKCk6IHZvaWQgeyB0aGlzLm5hdmlnYXRpbmcgPSBmYWxzZTsgfVxuXG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byBVUkwgdXBkYXRlcyBmcm9tIHRoZSByb3V0ZXJcbiAgICovXG4gIHN1YnNjcmliZShvbk5leHQ6ICh2YWx1ZTogYW55KSA9PiB2b2lkKTogT2JqZWN0IHtcbiAgICByZXR1cm4gT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHRoaXMuX3N1YmplY3QsIG9uTmV4dCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBjb250ZW50cyBvZiB0aGlzIHJvdXRlcidzIG91dGxldCBhbmQgYWxsIGRlc2NlbmRhbnQgb3V0bGV0c1xuICAgKi9cbiAgZGVhY3RpdmF0ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBjaGlsZEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbikpIHtcbiAgICAgIGNoaWxkSW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jaGlsZDtcbiAgICAgIGNvbXBvbmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICAgIH1cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxhbnk+ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jaGlsZFJvdXRlcikpIHtcbiAgICAgIG5leHQgPSB0aGlzLl9jaGlsZFJvdXRlci5kZWFjdGl2YXRlKGNoaWxkSW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX291dGxldCkpIHtcbiAgICAgIG5leHQgPSBuZXh0LnRoZW4oKF8pID0+IHRoaXMuX291dGxldC5kZWFjdGl2YXRlKGNvbXBvbmVudEluc3RydWN0aW9uKSk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogaGFuZGxlIGF1eCByb3V0ZXNcblxuICAgIHJldHVybiBuZXh0O1xuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYSBVUkwsIHJldHVybnMgYW4gaW5zdHJ1Y3Rpb24gcmVwcmVzZW50aW5nIHRoZSBjb21wb25lbnQgZ3JhcGhcbiAgICovXG4gIHJlY29nbml6ZSh1cmw6IHN0cmluZyk6IFByb21pc2U8SW5zdHJ1Y3Rpb24+IHtcbiAgICB2YXIgYW5jZXN0b3JDb21wb25lbnRzID0gdGhpcy5fZ2V0QW5jZXN0b3JJbnN0cnVjdGlvbnMoKTtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyeS5yZWNvZ25pemUodXJsLCBhbmNlc3RvckNvbXBvbmVudHMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QW5jZXN0b3JJbnN0cnVjdGlvbnMoKTogSW5zdHJ1Y3Rpb25bXSB7XG4gICAgdmFyIGFuY2VzdG9yQ29tcG9uZW50cyA9IFtdO1xuICAgIHZhciBhbmNlc3RvclJvdXRlciA9IHRoaXM7XG4gICAgd2hpbGUgKGlzUHJlc2VudChhbmNlc3RvclJvdXRlci5wYXJlbnQpICYmXG4gICAgICAgICAgIGlzUHJlc2VudChhbmNlc3RvclJvdXRlci5wYXJlbnQuX2N1cnJlbnRJbnN0cnVjdGlvbikpIHtcbiAgICAgIGFuY2VzdG9yUm91dGVyID0gYW5jZXN0b3JSb3V0ZXIucGFyZW50O1xuICAgICAgYW5jZXN0b3JDb21wb25lbnRzLnVuc2hpZnQoYW5jZXN0b3JSb3V0ZXIuX2N1cnJlbnRJbnN0cnVjdGlvbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFuY2VzdG9yQ29tcG9uZW50cztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyB0byBlaXRoZXIgdGhlIGxhc3QgVVJMIHN1Y2Nlc3NmdWxseSBuYXZpZ2F0ZWQgdG8sIG9yIHRoZSBsYXN0IFVSTCByZXF1ZXN0ZWQgaWYgdGhlXG4gICAqIHJvdXRlciBoYXMgeWV0IHRvIHN1Y2Nlc3NmdWxseSBuYXZpZ2F0ZS5cbiAgICovXG4gIHJlbmF2aWdhdGUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLmxhc3ROYXZpZ2F0aW9uQXR0ZW1wdCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubmF2aWdhdGVCeVVybCh0aGlzLmxhc3ROYXZpZ2F0aW9uQXR0ZW1wdCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhbiBgSW5zdHJ1Y3Rpb25gIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBSb3V0ZSBMaW5rIERTTC5cbiAgICovXG4gIGdlbmVyYXRlKGxpbmtQYXJhbXM6IGFueVtdKTogSW5zdHJ1Y3Rpb24ge1xuICAgIHZhciBhbmNlc3Rvckluc3RydWN0aW9ucyA9IHRoaXMuX2dldEFuY2VzdG9ySW5zdHJ1Y3Rpb25zKCk7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cnkuZ2VuZXJhdGUobGlua1BhcmFtcywgYW5jZXN0b3JJbnN0cnVjdGlvbnMpO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb290Um91dGVyIGV4dGVuZHMgUm91dGVyIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9jYXRpb246IExvY2F0aW9uO1xuICAvKiogQGludGVybmFsICovXG4gIF9sb2NhdGlvblN1YjogT2JqZWN0O1xuXG4gIGNvbnN0cnVjdG9yKHJlZ2lzdHJ5OiBSb3V0ZVJlZ2lzdHJ5LCBsb2NhdGlvbjogTG9jYXRpb24sXG4gICAgICAgICAgICAgIEBJbmplY3QoUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UKSBwcmltYXJ5Q29tcG9uZW50OiBUeXBlKSB7XG4gICAgc3VwZXIocmVnaXN0cnksIG51bGwsIHByaW1hcnlDb21wb25lbnQpO1xuICAgIHRoaXMuX2xvY2F0aW9uID0gbG9jYXRpb247XG4gICAgdGhpcy5fbG9jYXRpb25TdWIgPSB0aGlzLl9sb2NhdGlvbi5zdWJzY3JpYmUoKGNoYW5nZSkgPT4ge1xuICAgICAgLy8gd2UgY2FsbCByZWNvZ25pemUgb3Vyc2VsdmVzXG4gICAgICB0aGlzLnJlY29nbml6ZShjaGFuZ2VbJ3VybCddKVxuICAgICAgICAgIC50aGVuKChpbnN0cnVjdGlvbikgPT4ge1xuICAgICAgICAgICAgdGhpcy5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24sIGlzUHJlc2VudChjaGFuZ2VbJ3BvcCddKSlcbiAgICAgICAgICAgICAgICAudGhlbigoXykgPT4ge1xuICAgICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhIHBvcHN0YXRlIGV2ZW50OyBubyBuZWVkIHRvIGNoYW5nZSB0aGUgVVJMXG4gICAgICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KGNoYW5nZVsncG9wJ10pICYmIGNoYW5nZVsndHlwZSddICE9ICdoYXNoY2hhbmdlJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB2YXIgZW1pdFBhdGggPSBpbnN0cnVjdGlvbi50b1VybFBhdGgoKTtcbiAgICAgICAgICAgICAgICAgIHZhciBlbWl0UXVlcnkgPSBpbnN0cnVjdGlvbi50b1VybFF1ZXJ5KCk7XG4gICAgICAgICAgICAgICAgICBpZiAoZW1pdFBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBlbWl0UGF0aCA9ICcvJyArIGVtaXRQYXRoO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBCZWNhdXNlIHdlJ3ZlIG9wdGVkIHRvIHVzZSBBbGwgaGFzaGNoYW5nZSBldmVudHMgb2NjdXIgb3V0c2lkZSBBbmd1bGFyLlxuICAgICAgICAgICAgICAgICAgLy8gSG93ZXZlciwgYXBwcyB0aGF0IGFyZSBtaWdyYXRpbmcgbWlnaHQgaGF2ZSBoYXNoIGxpbmtzIHRoYXQgb3BlcmF0ZSBvdXRzaWRlXG4gICAgICAgICAgICAgICAgICAvLyBhbmd1bGFyIHRvIHdoaWNoIHJvdXRpbmcgbXVzdCByZXNwb25kLlxuICAgICAgICAgICAgICAgICAgLy8gVG8gc3VwcG9ydCB0aGVzZSBjYXNlcyB3aGVyZSB3ZSByZXNwb25kIHRvIGhhc2hjaGFuZ2VzIGFuZCByZWRpcmVjdCBhcyBhXG4gICAgICAgICAgICAgICAgICAvLyByZXN1bHQsIHdlIG5lZWQgdG8gcmVwbGFjZSB0aGUgdG9wIGl0ZW0gb24gdGhlIHN0YWNrLlxuICAgICAgICAgICAgICAgICAgaWYgKGNoYW5nZVsndHlwZSddID09ICdoYXNoY2hhbmdlJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdHJ1Y3Rpb24udG9Sb290VXJsKCkgIT0gdGhpcy5fbG9jYXRpb24ucGF0aCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9jYXRpb24ucmVwbGFjZVN0YXRlKGVtaXRQYXRoLCBlbWl0UXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2NhdGlvbi5nbyhlbWl0UGF0aCwgZW1pdFF1ZXJ5KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVnaXN0cnkuY29uZmlnRnJvbUNvbXBvbmVudChwcmltYXJ5Q29tcG9uZW50KTtcbiAgICB0aGlzLm5hdmlnYXRlQnlVcmwobG9jYXRpb24ucGF0aCgpKTtcbiAgfVxuXG4gIGNvbW1pdChpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIGVtaXRQYXRoID0gaW5zdHJ1Y3Rpb24udG9VcmxQYXRoKCk7XG4gICAgdmFyIGVtaXRRdWVyeSA9IGluc3RydWN0aW9uLnRvVXJsUXVlcnkoKTtcbiAgICBpZiAoZW1pdFBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgZW1pdFBhdGggPSAnLycgKyBlbWl0UGF0aDtcbiAgICB9XG4gICAgdmFyIHByb21pc2UgPSBzdXBlci5jb21taXQoaW5zdHJ1Y3Rpb24pO1xuICAgIGlmICghX3NraXBMb2NhdGlvbkNoYW5nZSkge1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbigoXykgPT4geyB0aGlzLl9sb2NhdGlvbi5nbyhlbWl0UGF0aCwgZW1pdFF1ZXJ5KTsgfSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2xvY2F0aW9uU3ViKSkge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLl9sb2NhdGlvblN1Yik7XG4gICAgICB0aGlzLl9sb2NhdGlvblN1YiA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIENoaWxkUm91dGVyIGV4dGVuZHMgUm91dGVyIHtcbiAgY29uc3RydWN0b3IocGFyZW50OiBSb3V0ZXIsIGhvc3RDb21wb25lbnQpIHtcbiAgICBzdXBlcihwYXJlbnQucmVnaXN0cnksIHBhcmVudCwgaG9zdENvbXBvbmVudCk7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gIH1cblxuXG4gIG5hdmlnYXRlQnlVcmwodXJsOiBzdHJpbmcsIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgLy8gRGVsZWdhdGUgbmF2aWdhdGlvbiB0byB0aGUgcm9vdCByb3V0ZXJcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQubmF2aWdhdGVCeVVybCh1cmwsIF9za2lwTG9jYXRpb25DaGFuZ2UpO1xuICB9XG5cbiAgbmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgLy8gRGVsZWdhdGUgbmF2aWdhdGlvbiB0byB0aGUgcm9vdCByb3V0ZXJcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGNhbkFjdGl2YXRlT25lKG5leHRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHZhciBuZXh0ID0gX3Jlc29sdmVUb1RydWU7XG4gIGlmIChpc1ByZXNlbnQobmV4dEluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgIG5leHQgPSBjYW5BY3RpdmF0ZU9uZShuZXh0SW5zdHJ1Y3Rpb24uY2hpbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJlc2VudChwcmV2SW5zdHJ1Y3Rpb24pID8gcHJldkluc3RydWN0aW9uLmNoaWxkIDogbnVsbCk7XG4gIH1cbiAgcmV0dXJuIG5leHQudGhlbigocmVzdWx0KSA9PiB7XG4gICAgaWYgKHJlc3VsdCA9PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHZhciBob29rID0gZ2V0Q2FuQWN0aXZhdGVIb29rKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZSk7XG4gICAgaWYgKGlzUHJlc2VudChob29rKSkge1xuICAgICAgcmV0dXJuIGhvb2sobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgIGlzUHJlc2VudChwcmV2SW5zdHJ1Y3Rpb24pID8gcHJldkluc3RydWN0aW9uLmNvbXBvbmVudCA6IG51bGwpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG4iXX0=