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
import { PromiseWrapper, EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
import { Map, StringMapWrapper } from 'angular2/src/facade/collection';
import { isBlank, isPresent, Type } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Inject, Injectable } from 'angular2/core';
import { RouteRegistry, ROUTER_PRIMARY_COMPONENT } from './route_registry';
import { Location } from './location';
import { getCanActivateHook } from './route_lifecycle_reflector';
let _resolveToTrue = PromiseWrapper.resolve(true);
let _resolveToFalse = PromiseWrapper.resolve(false);
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
export class Router {
    constructor(registry, parent, hostComponent) {
        this.registry = registry;
        this.parent = parent;
        this.hostComponent = hostComponent;
        this.navigating = false;
        this._currentInstruction = null;
        this._currentNavigation = _resolveToTrue;
        this._outlet = null;
        this._auxRouters = new Map();
        this._subject = new EventEmitter();
    }
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    childRouter(hostComponent) {
        return this._childRouter = new ChildRouter(this, hostComponent);
    }
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    auxRouter(hostComponent) { return new ChildRouter(this, hostComponent); }
    /**
     * Register an outlet to be notified of primary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    registerPrimaryOutlet(outlet) {
        if (isPresent(outlet.name)) {
            throw new BaseException(`registerPrimaryOutlet expects to be called with an unnamed outlet.`);
        }
        this._outlet = outlet;
        if (isPresent(this._currentInstruction)) {
            return this.commit(this._currentInstruction, false);
        }
        return _resolveToTrue;
    }
    /**
     * Register an outlet to notified of auxiliary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    registerAuxOutlet(outlet) {
        var outletName = outlet.name;
        if (isBlank(outletName)) {
            throw new BaseException(`registerAuxOutlet expects to be called with an outlet with a name.`);
        }
        var router = this.auxRouter(this.hostComponent);
        this._auxRouters.set(outletName, router);
        router._outlet = outlet;
        var auxInstruction;
        if (isPresent(this._currentInstruction) &&
            isPresent(auxInstruction = this._currentInstruction.auxInstruction[outletName])) {
            return router.commit(auxInstruction);
        }
        return _resolveToTrue;
    }
    /**
     * Given an instruction, returns `true` if the instruction is currently active,
     * otherwise `false`.
     */
    isRouteActive(instruction) {
        var router = this;
        while (isPresent(router.parent) && isPresent(instruction.child)) {
            router = router.parent;
            instruction = instruction.child;
        }
        return isPresent(this._currentInstruction) &&
            this._currentInstruction.component == instruction.component;
    }
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
    config(definitions) {
        definitions.forEach((routeDefinition) => { this.registry.config(this.hostComponent, routeDefinition); });
        return this.renavigate();
    }
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
    navigate(linkParams) {
        var instruction = this.generate(linkParams);
        return this.navigateByInstruction(instruction, false);
    }
    /**
     * Navigate to a URL. Returns a promise that resolves when navigation is complete.
     * It's preferred to navigate with `navigate` instead of this method, since URLs are more brittle.
     *
     * If the given URL begins with a `/`, router will navigate absolutely.
     * If the given URL does not begin with `/`, the router will navigate relative to this component.
     */
    navigateByUrl(url, _skipLocationChange = false) {
        return this._currentNavigation = this._currentNavigation.then((_) => {
            this.lastNavigationAttempt = url;
            this._startNavigating();
            return this._afterPromiseFinishNavigating(this.recognize(url).then((instruction) => {
                if (isBlank(instruction)) {
                    return false;
                }
                return this._navigate(instruction, _skipLocationChange);
            }));
        });
    }
    /**
     * Navigate via the provided instruction. Returns a promise that resolves when navigation is
     * complete.
     */
    navigateByInstruction(instruction, _skipLocationChange = false) {
        if (isBlank(instruction)) {
            return _resolveToFalse;
        }
        return this._currentNavigation = this._currentNavigation.then((_) => {
            this._startNavigating();
            return this._afterPromiseFinishNavigating(this._navigate(instruction, _skipLocationChange));
        });
    }
    /** @internal */
    _navigate(instruction, _skipLocationChange) {
        return this._settleInstruction(instruction)
            .then((_) => this._routerCanReuse(instruction))
            .then((_) => this._canActivate(instruction))
            .then((result) => {
            if (!result) {
                return false;
            }
            return this._routerCanDeactivate(instruction)
                .then((result) => {
                if (result) {
                    return this.commit(instruction, _skipLocationChange)
                        .then((_) => {
                        this._emitNavigationFinish(instruction.toRootUrl());
                        return true;
                    });
                }
            });
        });
    }
    /** @internal */
    _settleInstruction(instruction) {
        return instruction.resolveComponent().then((_) => {
            var unsettledInstructions = [];
            if (isPresent(instruction.component)) {
                instruction.component.reuse = false;
            }
            if (isPresent(instruction.child)) {
                unsettledInstructions.push(this._settleInstruction(instruction.child));
            }
            StringMapWrapper.forEach(instruction.auxInstruction, (instruction, _) => {
                unsettledInstructions.push(this._settleInstruction(instruction));
            });
            return PromiseWrapper.all(unsettledInstructions);
        });
    }
    _emitNavigationFinish(url) { ObservableWrapper.callEmit(this._subject, url); }
    _afterPromiseFinishNavigating(promise) {
        return PromiseWrapper.catchError(promise.then((_) => this._finishNavigating()), (err) => {
            this._finishNavigating();
            throw err;
        });
    }
    /*
     * Recursively set reuse flags
     */
    /** @internal */
    _routerCanReuse(instruction) {
        if (isBlank(this._outlet)) {
            return _resolveToFalse;
        }
        if (isBlank(instruction.component)) {
            return _resolveToTrue;
        }
        return this._outlet.routerCanReuse(instruction.component)
            .then((result) => {
            instruction.component.reuse = result;
            if (result && isPresent(this._childRouter) && isPresent(instruction.child)) {
                return this._childRouter._routerCanReuse(instruction.child);
            }
        });
    }
    _canActivate(nextInstruction) {
        return canActivateOne(nextInstruction, this._currentInstruction);
    }
    _routerCanDeactivate(instruction) {
        if (isBlank(this._outlet)) {
            return _resolveToTrue;
        }
        var next;
        var childInstruction = null;
        var reuse = false;
        var componentInstruction = null;
        if (isPresent(instruction)) {
            childInstruction = instruction.child;
            componentInstruction = instruction.component;
            reuse = isBlank(instruction.component) || instruction.component.reuse;
        }
        if (reuse) {
            next = _resolveToTrue;
        }
        else {
            next = this._outlet.routerCanDeactivate(componentInstruction);
        }
        // TODO: aux route lifecycle hooks
        return next.then((result) => {
            if (result == false) {
                return false;
            }
            if (isPresent(this._childRouter)) {
                return this._childRouter._routerCanDeactivate(childInstruction);
            }
            return true;
        });
    }
    /**
     * Updates this router and all descendant routers according to the given instruction
     */
    commit(instruction, _skipLocationChange = false) {
        this._currentInstruction = instruction;
        var next = _resolveToTrue;
        if (isPresent(this._outlet) && isPresent(instruction.component)) {
            var componentInstruction = instruction.component;
            if (componentInstruction.reuse) {
                next = this._outlet.reuse(componentInstruction);
            }
            else {
                next =
                    this.deactivate(instruction).then((_) => this._outlet.activate(componentInstruction));
            }
            if (isPresent(instruction.child)) {
                next = next.then((_) => {
                    if (isPresent(this._childRouter)) {
                        return this._childRouter.commit(instruction.child);
                    }
                });
            }
        }
        var promises = [];
        this._auxRouters.forEach((router, name) => {
            if (isPresent(instruction.auxInstruction[name])) {
                promises.push(router.commit(instruction.auxInstruction[name]));
            }
        });
        return next.then((_) => PromiseWrapper.all(promises));
    }
    /** @internal */
    _startNavigating() { this.navigating = true; }
    /** @internal */
    _finishNavigating() { this.navigating = false; }
    /**
     * Subscribe to URL updates from the router
     */
    subscribe(onNext) {
        return ObservableWrapper.subscribe(this._subject, onNext);
    }
    /**
     * Removes the contents of this router's outlet and all descendant outlets
     */
    deactivate(instruction) {
        var childInstruction = null;
        var componentInstruction = null;
        if (isPresent(instruction)) {
            childInstruction = instruction.child;
            componentInstruction = instruction.component;
        }
        var next = _resolveToTrue;
        if (isPresent(this._childRouter)) {
            next = this._childRouter.deactivate(childInstruction);
        }
        if (isPresent(this._outlet)) {
            next = next.then((_) => this._outlet.deactivate(componentInstruction));
        }
        // TODO: handle aux routes
        return next;
    }
    /**
     * Given a URL, returns an instruction representing the component graph
     */
    recognize(url) {
        var ancestorComponents = this._getAncestorInstructions();
        return this.registry.recognize(url, ancestorComponents);
    }
    _getAncestorInstructions() {
        var ancestorInstructions = [this._currentInstruction];
        var ancestorRouter = this;
        while (isPresent(ancestorRouter = ancestorRouter.parent)) {
            ancestorInstructions.unshift(ancestorRouter._currentInstruction);
        }
        return ancestorInstructions;
    }
    /**
     * Navigates to either the last URL successfully navigated to, or the last URL requested if the
     * router has yet to successfully navigate.
     */
    renavigate() {
        if (isBlank(this.lastNavigationAttempt)) {
            return this._currentNavigation;
        }
        return this.navigateByUrl(this.lastNavigationAttempt);
    }
    /**
     * Generate an `Instruction` based on the provided Route Link DSL.
     */
    generate(linkParams) {
        var ancestorInstructions = this._getAncestorInstructions();
        return this.registry.generate(linkParams, ancestorInstructions);
    }
}
export let RootRouter = class extends Router {
    constructor(registry, location, primaryComponent) {
        super(registry, null, primaryComponent);
        this._location = location;
        this._locationSub = this._location.subscribe((change) => {
            // we call recognize ourselves
            this.recognize(change['url'])
                .then((instruction) => {
                this.navigateByInstruction(instruction, isPresent(change['pop']))
                    .then((_) => {
                    // this is a popstate event; no need to change the URL
                    if (isPresent(change['pop']) && change['type'] != 'hashchange') {
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
                        if (instruction.toRootUrl() != this._location.path()) {
                            this._location.replaceState(emitPath, emitQuery);
                        }
                    }
                    else {
                        this._location.go(emitPath, emitQuery);
                    }
                });
            });
        });
        this.registry.configFromComponent(primaryComponent);
        this.navigateByUrl(location.path());
    }
    commit(instruction, _skipLocationChange = false) {
        var emitPath = instruction.toUrlPath();
        var emitQuery = instruction.toUrlQuery();
        if (emitPath.length > 0) {
            emitPath = '/' + emitPath;
        }
        var promise = super.commit(instruction);
        if (!_skipLocationChange) {
            promise = promise.then((_) => { this._location.go(emitPath, emitQuery); });
        }
        return promise;
    }
    dispose() {
        if (isPresent(this._locationSub)) {
            ObservableWrapper.dispose(this._locationSub);
            this._locationSub = null;
        }
    }
};
RootRouter = __decorate([
    Injectable(),
    __param(2, Inject(ROUTER_PRIMARY_COMPONENT)), 
    __metadata('design:paramtypes', [RouteRegistry, Location, Type])
], RootRouter);
class ChildRouter extends Router {
    constructor(parent, hostComponent) {
        super(parent.registry, parent, hostComponent);
        this.parent = parent;
    }
    navigateByUrl(url, _skipLocationChange = false) {
        // Delegate navigation to the root router
        return this.parent.navigateByUrl(url, _skipLocationChange);
    }
    navigateByInstruction(instruction, _skipLocationChange = false) {
        // Delegate navigation to the root router
        return this.parent.navigateByInstruction(instruction, _skipLocationChange);
    }
}
function canActivateOne(nextInstruction, prevInstruction) {
    var next = _resolveToTrue;
    if (isBlank(nextInstruction.component)) {
        return next;
    }
    if (isPresent(nextInstruction.child)) {
        next = canActivateOne(nextInstruction.child, isPresent(prevInstruction) ? prevInstruction.child : null);
    }
    return next.then((result) => {
        if (result == false) {
            return false;
        }
        if (nextInstruction.component.reuse) {
            return true;
        }
        var hook = getCanActivateHook(nextInstruction.component.componentType);
        if (isPresent(hook)) {
            return hook(nextInstruction.component, isPresent(prevInstruction) ? prevInstruction.component : null);
        }
        return true;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3JvdXRlci9yb3V0ZXIudHMiXSwibmFtZXMiOlsiUm91dGVyIiwiUm91dGVyLmNvbnN0cnVjdG9yIiwiUm91dGVyLmNoaWxkUm91dGVyIiwiUm91dGVyLmF1eFJvdXRlciIsIlJvdXRlci5yZWdpc3RlclByaW1hcnlPdXRsZXQiLCJSb3V0ZXIucmVnaXN0ZXJBdXhPdXRsZXQiLCJSb3V0ZXIuaXNSb3V0ZUFjdGl2ZSIsIlJvdXRlci5jb25maWciLCJSb3V0ZXIubmF2aWdhdGUiLCJSb3V0ZXIubmF2aWdhdGVCeVVybCIsIlJvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24iLCJSb3V0ZXIuX25hdmlnYXRlIiwiUm91dGVyLl9zZXR0bGVJbnN0cnVjdGlvbiIsIlJvdXRlci5fZW1pdE5hdmlnYXRpb25GaW5pc2giLCJSb3V0ZXIuX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmciLCJSb3V0ZXIuX3JvdXRlckNhblJldXNlIiwiUm91dGVyLl9jYW5BY3RpdmF0ZSIsIlJvdXRlci5fcm91dGVyQ2FuRGVhY3RpdmF0ZSIsIlJvdXRlci5jb21taXQiLCJSb3V0ZXIuX3N0YXJ0TmF2aWdhdGluZyIsIlJvdXRlci5fZmluaXNoTmF2aWdhdGluZyIsIlJvdXRlci5zdWJzY3JpYmUiLCJSb3V0ZXIuZGVhY3RpdmF0ZSIsIlJvdXRlci5yZWNvZ25pemUiLCJSb3V0ZXIuX2dldEFuY2VzdG9ySW5zdHJ1Y3Rpb25zIiwiUm91dGVyLnJlbmF2aWdhdGUiLCJSb3V0ZXIuZ2VuZXJhdGUiLCJSb290Um91dGVyIiwiUm9vdFJvdXRlci5jb25zdHJ1Y3RvciIsIlJvb3RSb3V0ZXIuY29tbWl0IiwiUm9vdFJvdXRlci5kaXNwb3NlIiwiQ2hpbGRSb3V0ZXIiLCJDaGlsZFJvdXRlci5jb25zdHJ1Y3RvciIsIkNoaWxkUm91dGVyLm5hdmlnYXRlQnlVcmwiLCJDaGlsZFJvdXRlci5uYXZpZ2F0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QUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxNQUFNQTtRQUN0QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2ZBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGVBQWVBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUNEQSxJQUFJQSxJQUFJQSxHQUFHQSxrQkFBa0JBLENBQUNBLGVBQWVBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBQ3ZFQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsRUFDekJBLFNBQVNBLENBQUNBLGVBQWVBLENBQUNBLEdBQUdBLGVBQWVBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO1FBQzdFQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNMQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXIsIEV2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtNYXAsIFN0cmluZ01hcFdyYXBwZXIsIE1hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtpc0JsYW5rLCBpc1N0cmluZywgaXNQcmVzZW50LCBUeXBlLCBpc0FycmF5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1JvdXRlUmVnaXN0cnksIFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVH0gZnJvbSAnLi9yb3V0ZV9yZWdpc3RyeSc7XG5pbXBvcnQge1xuICBDb21wb25lbnRJbnN0cnVjdGlvbixcbiAgSW5zdHJ1Y3Rpb24sXG59IGZyb20gJy4vaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0IHtSb3V0ZXJPdXRsZXR9IGZyb20gJy4vcm91dGVyX291dGxldCc7XG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICcuL2xvY2F0aW9uJztcbmltcG9ydCB7Z2V0Q2FuQWN0aXZhdGVIb29rfSBmcm9tICcuL3JvdXRlX2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtSb3V0ZURlZmluaXRpb259IGZyb20gJy4vcm91dGVfY29uZmlnX2ltcGwnO1xuXG5sZXQgX3Jlc29sdmVUb1RydWUgPSBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRydWUpO1xubGV0IF9yZXNvbHZlVG9GYWxzZSA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUoZmFsc2UpO1xuXG4vKipcbiAqIFRoZSBgUm91dGVyYCBpcyByZXNwb25zaWJsZSBmb3IgbWFwcGluZyBVUkxzIHRvIGNvbXBvbmVudHMuXG4gKlxuICogWW91IGNhbiBzZWUgdGhlIHN0YXRlIG9mIHRoZSByb3V0ZXIgYnkgaW5zcGVjdGluZyB0aGUgcmVhZC1vbmx5IGZpZWxkIGByb3V0ZXIubmF2aWdhdGluZ2AuXG4gKiBUaGlzIG1heSBiZSB1c2VmdWwgZm9yIHNob3dpbmcgYSBzcGlubmVyLCBmb3IgaW5zdGFuY2UuXG4gKlxuICogIyMgQ29uY2VwdHNcbiAqXG4gKiBSb3V0ZXJzIGFuZCBjb21wb25lbnQgaW5zdGFuY2VzIGhhdmUgYSAxOjEgY29ycmVzcG9uZGVuY2UuXG4gKlxuICogVGhlIHJvdXRlciBob2xkcyByZWZlcmVuY2UgdG8gYSBudW1iZXIgb2Yge0BsaW5rIFJvdXRlck91dGxldH0uXG4gKiBBbiBvdXRsZXQgaXMgYSBwbGFjZWhvbGRlciB0aGF0IHRoZSByb3V0ZXIgZHluYW1pY2FsbHkgZmlsbHMgaW4gZGVwZW5kaW5nIG9uIHRoZSBjdXJyZW50IFVSTC5cbiAqXG4gKiBXaGVuIHRoZSByb3V0ZXIgbmF2aWdhdGVzIGZyb20gYSBVUkwsIGl0IG11c3QgZmlyc3QgcmVjb2duaXplIGl0IGFuZCBzZXJpYWxpemUgaXQgaW50byBhblxuICogYEluc3RydWN0aW9uYC5cbiAqIFRoZSByb3V0ZXIgdXNlcyB0aGUgYFJvdXRlUmVnaXN0cnlgIHRvIGdldCBhbiBgSW5zdHJ1Y3Rpb25gLlxuICovXG5leHBvcnQgY2xhc3MgUm91dGVyIHtcbiAgbmF2aWdhdGluZzogYm9vbGVhbiA9IGZhbHNlO1xuICBsYXN0TmF2aWdhdGlvbkF0dGVtcHQ6IHN0cmluZztcblxuICBwcml2YXRlIF9jdXJyZW50SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gbnVsbDtcblxuICBwcml2YXRlIF9jdXJyZW50TmF2aWdhdGlvbjogUHJvbWlzZTxhbnk+ID0gX3Jlc29sdmVUb1RydWU7XG4gIHByaXZhdGUgX291dGxldDogUm91dGVyT3V0bGV0ID0gbnVsbDtcblxuICBwcml2YXRlIF9hdXhSb3V0ZXJzID0gbmV3IE1hcDxzdHJpbmcsIFJvdXRlcj4oKTtcbiAgcHJpdmF0ZSBfY2hpbGRSb3V0ZXI6IFJvdXRlcjtcblxuICBwcml2YXRlIF9zdWJqZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWdpc3RyeTogUm91dGVSZWdpc3RyeSwgcHVibGljIHBhcmVudDogUm91dGVyLCBwdWJsaWMgaG9zdENvbXBvbmVudDogYW55KSB7fVxuXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBjaGlsZCByb3V0ZXIuIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlXG4gICAqIGNvbXBvbmVudC5cbiAgICovXG4gIGNoaWxkUm91dGVyKGhvc3RDb21wb25lbnQ6IGFueSk6IFJvdXRlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NoaWxkUm91dGVyID0gbmV3IENoaWxkUm91dGVyKHRoaXMsIGhvc3RDb21wb25lbnQpO1xuICB9XG5cblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIGNoaWxkIHJvdXRlci4gWW91IHByb2JhYmx5IGRvbid0IG5lZWQgdG8gdXNlIHRoaXMgdW5sZXNzIHlvdSdyZSB3cml0aW5nIGEgcmV1c2FibGVcbiAgICogY29tcG9uZW50LlxuICAgKi9cbiAgYXV4Um91dGVyKGhvc3RDb21wb25lbnQ6IGFueSk6IFJvdXRlciB7IHJldHVybiBuZXcgQ2hpbGRSb3V0ZXIodGhpcywgaG9zdENvbXBvbmVudCk7IH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gb3V0bGV0IHRvIGJlIG5vdGlmaWVkIG9mIHByaW1hcnkgcm91dGUgY2hhbmdlcy5cbiAgICpcbiAgICogWW91IHByb2JhYmx5IGRvbid0IG5lZWQgdG8gdXNlIHRoaXMgdW5sZXNzIHlvdSdyZSB3cml0aW5nIGEgcmV1c2FibGUgY29tcG9uZW50LlxuICAgKi9cbiAgcmVnaXN0ZXJQcmltYXJ5T3V0bGV0KG91dGxldDogUm91dGVyT3V0bGV0KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGlzUHJlc2VudChvdXRsZXQubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGByZWdpc3RlclByaW1hcnlPdXRsZXQgZXhwZWN0cyB0byBiZSBjYWxsZWQgd2l0aCBhbiB1bm5hbWVkIG91dGxldC5gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vdXRsZXQgPSBvdXRsZXQ7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24pKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21taXQodGhpcy5fY3VycmVudEluc3RydWN0aW9uLCBmYWxzZSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbiBvdXRsZXQgdG8gbm90aWZpZWQgb2YgYXV4aWxpYXJ5IHJvdXRlIGNoYW5nZXMuXG4gICAqXG4gICAqIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlIGNvbXBvbmVudC5cbiAgICovXG4gIHJlZ2lzdGVyQXV4T3V0bGV0KG91dGxldDogUm91dGVyT3V0bGV0KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdmFyIG91dGxldE5hbWUgPSBvdXRsZXQubmFtZTtcbiAgICBpZiAoaXNCbGFuayhvdXRsZXROYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYHJlZ2lzdGVyQXV4T3V0bGV0IGV4cGVjdHMgdG8gYmUgY2FsbGVkIHdpdGggYW4gb3V0bGV0IHdpdGggYSBuYW1lLmApO1xuICAgIH1cblxuICAgIHZhciByb3V0ZXIgPSB0aGlzLmF1eFJvdXRlcih0aGlzLmhvc3RDb21wb25lbnQpO1xuXG4gICAgdGhpcy5fYXV4Um91dGVycy5zZXQob3V0bGV0TmFtZSwgcm91dGVyKTtcbiAgICByb3V0ZXIuX291dGxldCA9IG91dGxldDtcblxuICAgIHZhciBhdXhJbnN0cnVjdGlvbjtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikgJiZcbiAgICAgICAgaXNQcmVzZW50KGF1eEluc3RydWN0aW9uID0gdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uW291dGxldE5hbWVdKSkge1xuICAgICAgcmV0dXJuIHJvdXRlci5jb21taXQoYXV4SW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhbiBpbnN0cnVjdGlvbiwgcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGluc3RydWN0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmUsXG4gICAqIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgKi9cbiAgaXNSb3V0ZUFjdGl2ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBib29sZWFuIHtcbiAgICB2YXIgcm91dGVyOiBSb3V0ZXIgPSB0aGlzO1xuICAgIHdoaWxlIChpc1ByZXNlbnQocm91dGVyLnBhcmVudCkgJiYgaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgcm91dGVyID0gcm91dGVyLnBhcmVudDtcbiAgICAgIGluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY2hpbGQ7XG4gICAgfVxuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSAmJlxuICAgICAgICAgICB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50ID09IGluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIER5bmFtaWNhbGx5IHVwZGF0ZSB0aGUgcm91dGluZyBjb25maWd1cmF0aW9uIGFuZCB0cmlnZ2VyIGEgbmF2aWdhdGlvbi5cbiAgICpcbiAgICogIyMjIFVzYWdlXG4gICAqXG4gICAqIGBgYFxuICAgKiByb3V0ZXIuY29uZmlnKFtcbiAgICogICB7ICdwYXRoJzogJy8nLCAnY29tcG9uZW50JzogSW5kZXhDb21wIH0sXG4gICAqICAgeyAncGF0aCc6ICcvdXNlci86aWQnLCAnY29tcG9uZW50JzogVXNlckNvbXAgfSxcbiAgICogXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgY29uZmlnKGRlZmluaXRpb25zOiBSb3V0ZURlZmluaXRpb25bXSk6IFByb21pc2U8YW55PiB7XG4gICAgZGVmaW5pdGlvbnMuZm9yRWFjaChcbiAgICAgICAgKHJvdXRlRGVmaW5pdGlvbikgPT4geyB0aGlzLnJlZ2lzdHJ5LmNvbmZpZyh0aGlzLmhvc3RDb21wb25lbnQsIHJvdXRlRGVmaW5pdGlvbik7IH0pO1xuICAgIHJldHVybiB0aGlzLnJlbmF2aWdhdGUoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBSb3V0ZSBMaW5rIERTTC4gSXQncyBwcmVmZXJyZWQgdG8gbmF2aWdhdGUgd2l0aCB0aGlzIG1ldGhvZFxuICAgKiBvdmVyIGBuYXZpZ2F0ZUJ5VXJsYC5cbiAgICpcbiAgICogIyMjIFVzYWdlXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIHRha2VzIGFuIGFycmF5IHJlcHJlc2VudGluZyB0aGUgUm91dGUgTGluayBEU0w6XG4gICAqIGBgYFxuICAgKiBbJy4vTXlDbXAnLCB7cGFyYW06IDN9XVxuICAgKiBgYGBcbiAgICogU2VlIHRoZSB7QGxpbmsgUm91dGVyTGlua30gZGlyZWN0aXZlIGZvciBtb3JlLlxuICAgKi9cbiAgbmF2aWdhdGUobGlua1BhcmFtczogYW55W10pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBpbnN0cnVjdGlvbiA9IHRoaXMuZ2VuZXJhdGUobGlua1BhcmFtcyk7XG4gICAgcmV0dXJuIHRoaXMubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uLCBmYWxzZSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSB0byBhIFVSTC4gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIG5hdmlnYXRpb24gaXMgY29tcGxldGUuXG4gICAqIEl0J3MgcHJlZmVycmVkIHRvIG5hdmlnYXRlIHdpdGggYG5hdmlnYXRlYCBpbnN0ZWFkIG9mIHRoaXMgbWV0aG9kLCBzaW5jZSBVUkxzIGFyZSBtb3JlIGJyaXR0bGUuXG4gICAqXG4gICAqIElmIHRoZSBnaXZlbiBVUkwgYmVnaW5zIHdpdGggYSBgL2AsIHJvdXRlciB3aWxsIG5hdmlnYXRlIGFic29sdXRlbHkuXG4gICAqIElmIHRoZSBnaXZlbiBVUkwgZG9lcyBub3QgYmVnaW4gd2l0aCBgL2AsIHRoZSByb3V0ZXIgd2lsbCBuYXZpZ2F0ZSByZWxhdGl2ZSB0byB0aGlzIGNvbXBvbmVudC5cbiAgICovXG4gIG5hdmlnYXRlQnlVcmwodXJsOiBzdHJpbmcsIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uID0gdGhpcy5fY3VycmVudE5hdmlnYXRpb24udGhlbigoXykgPT4ge1xuICAgICAgdGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQgPSB1cmw7XG4gICAgICB0aGlzLl9zdGFydE5hdmlnYXRpbmcoKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZnRlclByb21pc2VGaW5pc2hOYXZpZ2F0aW5nKHRoaXMucmVjb2duaXplKHVybCkudGhlbigoaW5zdHJ1Y3Rpb24pID0+IHtcbiAgICAgICAgaWYgKGlzQmxhbmsoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9uYXZpZ2F0ZShpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSk7XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSB2aWEgdGhlIHByb3ZpZGVkIGluc3RydWN0aW9uLiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gbmF2aWdhdGlvbiBpc1xuICAgKiBjb21wbGV0ZS5cbiAgICovXG4gIG5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9GYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uID0gdGhpcy5fY3VycmVudE5hdmlnYXRpb24udGhlbigoXykgPT4ge1xuICAgICAgdGhpcy5fc3RhcnROYXZpZ2F0aW5nKCk7XG4gICAgICByZXR1cm4gdGhpcy5fYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyh0aGlzLl9uYXZpZ2F0ZShpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmF2aWdhdGUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5fc2V0dGxlSW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24pXG4gICAgICAgIC50aGVuKChfKSA9PiB0aGlzLl9yb3V0ZXJDYW5SZXVzZShpbnN0cnVjdGlvbikpXG4gICAgICAgIC50aGVuKChfKSA9PiB0aGlzLl9jYW5BY3RpdmF0ZShpbnN0cnVjdGlvbikpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcy5fcm91dGVyQ2FuRGVhY3RpdmF0ZShpbnN0cnVjdGlvbilcbiAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbW1pdChpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSlcbiAgICAgICAgICAgICAgICAgICAgICAudGhlbigoXykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW1pdE5hdmlnYXRpb25GaW5pc2goaW5zdHJ1Y3Rpb24udG9Sb290VXJsKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBpbnN0cnVjdGlvbi5yZXNvbHZlQ29tcG9uZW50KCkudGhlbigoXykgPT4ge1xuICAgICAgdmFyIHVuc2V0dGxlZEluc3RydWN0aW9uczogQXJyYXk8UHJvbWlzZTxhbnk+PiA9IFtdO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICAgICAgaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJldXNlID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgICAgIHVuc2V0dGxlZEluc3RydWN0aW9ucy5wdXNoKHRoaXMuX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uLmNoaWxkKSk7XG4gICAgICB9XG5cbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChpbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbiwgKGluc3RydWN0aW9uLCBfKSA9PiB7XG4gICAgICAgIHVuc2V0dGxlZEluc3RydWN0aW9ucy5wdXNoKHRoaXMuX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5hbGwodW5zZXR0bGVkSW5zdHJ1Y3Rpb25zKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2VtaXROYXZpZ2F0aW9uRmluaXNoKHVybCk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLl9zdWJqZWN0LCB1cmwpOyB9XG5cbiAgcHJpdmF0ZSBfYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyhwcm9taXNlOiBQcm9taXNlPGFueT4pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5jYXRjaEVycm9yKHByb21pc2UudGhlbigoXykgPT4gdGhpcy5fZmluaXNoTmF2aWdhdGluZygpKSwgKGVycikgPT4ge1xuICAgICAgdGhpcy5fZmluaXNoTmF2aWdhdGluZygpO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH0pO1xuICB9XG5cbiAgLypcbiAgICogUmVjdXJzaXZlbHkgc2V0IHJldXNlIGZsYWdzXG4gICAqL1xuICAvKiogQGludGVybmFsICovXG4gIF9yb3V0ZXJDYW5SZXVzZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX291dGxldCkpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvRmFsc2U7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX291dGxldC5yb3V0ZXJDYW5SZXVzZShpbnN0cnVjdGlvbi5jb21wb25lbnQpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBpbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2UgPSByZXN1bHQ7XG4gICAgICAgICAgaWYgKHJlc3VsdCAmJiBpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlci5fcm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb24uY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jYW5BY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGNhbkFjdGl2YXRlT25lKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgX3JvdXRlckNhbkRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fb3V0bGV0KSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICAgIH1cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxib29sZWFuPjtcbiAgICB2YXIgY2hpbGRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIHZhciByZXVzZTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICBjaGlsZEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY2hpbGQ7XG4gICAgICBjb21wb25lbnRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgICAgIHJldXNlID0gaXNCbGFuayhpbnN0cnVjdGlvbi5jb21wb25lbnQpIHx8IGluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZTtcbiAgICB9XG4gICAgaWYgKHJldXNlKSB7XG4gICAgICBuZXh0ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQgPSB0aGlzLl9vdXRsZXQucm91dGVyQ2FuRGVhY3RpdmF0ZShjb21wb25lbnRJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIC8vIFRPRE86IGF1eCByb3V0ZSBsaWZlY3ljbGUgaG9va3NcbiAgICByZXR1cm4gbmV4dC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgIGlmIChyZXN1bHQgPT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jaGlsZFJvdXRlcikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkUm91dGVyLl9yb3V0ZXJDYW5EZWFjdGl2YXRlKGNoaWxkSW5zdHJ1Y3Rpb24pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGlzIHJvdXRlciBhbmQgYWxsIGRlc2NlbmRhbnQgcm91dGVycyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGluc3RydWN0aW9uXG4gICAqL1xuICBjb21taXQoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uO1xuXG4gICAgdmFyIG5leHQ6IFByb21pc2U8YW55PiA9IF9yZXNvbHZlVG9UcnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fb3V0bGV0KSAmJiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY29tcG9uZW50KSkge1xuICAgICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICAgICAgaWYgKGNvbXBvbmVudEluc3RydWN0aW9uLnJldXNlKSB7XG4gICAgICAgIG5leHQgPSB0aGlzLl9vdXRsZXQucmV1c2UoY29tcG9uZW50SW5zdHJ1Y3Rpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dCA9XG4gICAgICAgICAgICB0aGlzLmRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb24pLnRoZW4oKF8pID0+IHRoaXMuX291dGxldC5hY3RpdmF0ZShjb21wb25lbnRJbnN0cnVjdGlvbikpO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgICAgbmV4dCA9IG5leHQudGhlbigoXykgPT4ge1xuICAgICAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRSb3V0ZXIuY29tbWl0KGluc3RydWN0aW9uLmNoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcm9taXNlcyA9IFtdO1xuICAgIHRoaXMuX2F1eFJvdXRlcnMuZm9yRWFjaCgocm91dGVyLCBuYW1lKSA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uW25hbWVdKSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKHJvdXRlci5jb21taXQoaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb25bbmFtZV0pKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBuZXh0LnRoZW4oKF8pID0+IFByb21pc2VXcmFwcGVyLmFsbChwcm9taXNlcykpO1xuICB9XG5cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdGFydE5hdmlnYXRpbmcoKTogdm9pZCB7IHRoaXMubmF2aWdhdGluZyA9IHRydWU7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9maW5pc2hOYXZpZ2F0aW5nKCk6IHZvaWQgeyB0aGlzLm5hdmlnYXRpbmcgPSBmYWxzZTsgfVxuXG5cbiAgLyoqXG4gICAqIFN1YnNjcmliZSB0byBVUkwgdXBkYXRlcyBmcm9tIHRoZSByb3V0ZXJcbiAgICovXG4gIHN1YnNjcmliZShvbk5leHQ6ICh2YWx1ZTogYW55KSA9PiB2b2lkKTogT2JqZWN0IHtcbiAgICByZXR1cm4gT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHRoaXMuX3N1YmplY3QsIG9uTmV4dCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBjb250ZW50cyBvZiB0aGlzIHJvdXRlcidzIG91dGxldCBhbmQgYWxsIGRlc2NlbmRhbnQgb3V0bGV0c1xuICAgKi9cbiAgZGVhY3RpdmF0ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBjaGlsZEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbikpIHtcbiAgICAgIGNoaWxkSW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jaGlsZDtcbiAgICAgIGNvbXBvbmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICAgIH1cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxhbnk+ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jaGlsZFJvdXRlcikpIHtcbiAgICAgIG5leHQgPSB0aGlzLl9jaGlsZFJvdXRlci5kZWFjdGl2YXRlKGNoaWxkSW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX291dGxldCkpIHtcbiAgICAgIG5leHQgPSBuZXh0LnRoZW4oKF8pID0+IHRoaXMuX291dGxldC5kZWFjdGl2YXRlKGNvbXBvbmVudEluc3RydWN0aW9uKSk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogaGFuZGxlIGF1eCByb3V0ZXNcblxuICAgIHJldHVybiBuZXh0O1xuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYSBVUkwsIHJldHVybnMgYW4gaW5zdHJ1Y3Rpb24gcmVwcmVzZW50aW5nIHRoZSBjb21wb25lbnQgZ3JhcGhcbiAgICovXG4gIHJlY29nbml6ZSh1cmw6IHN0cmluZyk6IFByb21pc2U8SW5zdHJ1Y3Rpb24+IHtcbiAgICB2YXIgYW5jZXN0b3JDb21wb25lbnRzID0gdGhpcy5fZ2V0QW5jZXN0b3JJbnN0cnVjdGlvbnMoKTtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyeS5yZWNvZ25pemUodXJsLCBhbmNlc3RvckNvbXBvbmVudHMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QW5jZXN0b3JJbnN0cnVjdGlvbnMoKTogSW5zdHJ1Y3Rpb25bXSB7XG4gICAgdmFyIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zID0gW3RoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbl07XG4gICAgdmFyIGFuY2VzdG9yUm91dGVyOiBSb3V0ZXIgPSB0aGlzO1xuICAgIHdoaWxlIChpc1ByZXNlbnQoYW5jZXN0b3JSb3V0ZXIgPSBhbmNlc3RvclJvdXRlci5wYXJlbnQpKSB7XG4gICAgICBhbmNlc3Rvckluc3RydWN0aW9ucy51bnNoaWZ0KGFuY2VzdG9yUm91dGVyLl9jdXJyZW50SW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICByZXR1cm4gYW5jZXN0b3JJbnN0cnVjdGlvbnM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZXMgdG8gZWl0aGVyIHRoZSBsYXN0IFVSTCBzdWNjZXNzZnVsbHkgbmF2aWdhdGVkIHRvLCBvciB0aGUgbGFzdCBVUkwgcmVxdWVzdGVkIGlmIHRoZVxuICAgKiByb3V0ZXIgaGFzIHlldCB0byBzdWNjZXNzZnVsbHkgbmF2aWdhdGUuXG4gICAqL1xuICByZW5hdmlnYXRlKCk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudE5hdmlnYXRpb247XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm5hdmlnYXRlQnlVcmwodGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQpO1xuICB9XG5cblxuICAvKipcbiAgICogR2VuZXJhdGUgYW4gYEluc3RydWN0aW9uYCBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgUm91dGUgTGluayBEU0wuXG4gICAqL1xuICBnZW5lcmF0ZShsaW5rUGFyYW1zOiBhbnlbXSk6IEluc3RydWN0aW9uIHtcbiAgICB2YXIgYW5jZXN0b3JJbnN0cnVjdGlvbnMgPSB0aGlzLl9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LmdlbmVyYXRlKGxpbmtQYXJhbXMsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm9vdFJvdXRlciBleHRlbmRzIFJvdXRlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xvY2F0aW9uOiBMb2NhdGlvbjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9jYXRpb25TdWI6IE9iamVjdDtcblxuICBjb25zdHJ1Y3RvcihyZWdpc3RyeTogUm91dGVSZWdpc3RyeSwgbG9jYXRpb246IExvY2F0aW9uLFxuICAgICAgICAgICAgICBASW5qZWN0KFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCkgcHJpbWFyeUNvbXBvbmVudDogVHlwZSkge1xuICAgIHN1cGVyKHJlZ2lzdHJ5LCBudWxsLCBwcmltYXJ5Q29tcG9uZW50KTtcbiAgICB0aGlzLl9sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICAgIHRoaXMuX2xvY2F0aW9uU3ViID0gdGhpcy5fbG9jYXRpb24uc3Vic2NyaWJlKChjaGFuZ2UpID0+IHtcbiAgICAgIC8vIHdlIGNhbGwgcmVjb2duaXplIG91cnNlbHZlc1xuICAgICAgdGhpcy5yZWNvZ25pemUoY2hhbmdlWyd1cmwnXSlcbiAgICAgICAgICAudGhlbigoaW5zdHJ1Y3Rpb24pID0+IHtcbiAgICAgICAgICAgIHRoaXMubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uLCBpc1ByZXNlbnQoY2hhbmdlWydwb3AnXSkpXG4gICAgICAgICAgICAgICAgLnRoZW4oKF8pID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYSBwb3BzdGF0ZSBldmVudDsgbm8gbmVlZCB0byBjaGFuZ2UgdGhlIFVSTFxuICAgICAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChjaGFuZ2VbJ3BvcCddKSAmJiBjaGFuZ2VbJ3R5cGUnXSAhPSAnaGFzaGNoYW5nZScpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgdmFyIGVtaXRQYXRoID0gaW5zdHJ1Y3Rpb24udG9VcmxQYXRoKCk7XG4gICAgICAgICAgICAgICAgICB2YXIgZW1pdFF1ZXJ5ID0gaW5zdHJ1Y3Rpb24udG9VcmxRdWVyeSgpO1xuICAgICAgICAgICAgICAgICAgaWYgKGVtaXRQYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZW1pdFBhdGggPSAnLycgKyBlbWl0UGF0aDtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSd2ZSBvcHRlZCB0byB1c2UgQWxsIGhhc2hjaGFuZ2UgZXZlbnRzIG9jY3VyIG91dHNpZGUgQW5ndWxhci5cbiAgICAgICAgICAgICAgICAgIC8vIEhvd2V2ZXIsIGFwcHMgdGhhdCBhcmUgbWlncmF0aW5nIG1pZ2h0IGhhdmUgaGFzaCBsaW5rcyB0aGF0IG9wZXJhdGUgb3V0c2lkZVxuICAgICAgICAgICAgICAgICAgLy8gYW5ndWxhciB0byB3aGljaCByb3V0aW5nIG11c3QgcmVzcG9uZC5cbiAgICAgICAgICAgICAgICAgIC8vIFRvIHN1cHBvcnQgdGhlc2UgY2FzZXMgd2hlcmUgd2UgcmVzcG9uZCB0byBoYXNoY2hhbmdlcyBhbmQgcmVkaXJlY3QgYXMgYVxuICAgICAgICAgICAgICAgICAgLy8gcmVzdWx0LCB3ZSBuZWVkIHRvIHJlcGxhY2UgdGhlIHRvcCBpdGVtIG9uIHRoZSBzdGFjay5cbiAgICAgICAgICAgICAgICAgIGlmIChjaGFuZ2VbJ3R5cGUnXSA9PSAnaGFzaGNoYW5nZScpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RydWN0aW9uLnRvUm9vdFVybCgpICE9IHRoaXMuX2xvY2F0aW9uLnBhdGgoKSkge1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvY2F0aW9uLnJlcGxhY2VTdGF0ZShlbWl0UGF0aCwgZW1pdFF1ZXJ5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9jYXRpb24uZ28oZW1pdFBhdGgsIGVtaXRRdWVyeSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQocHJpbWFyeUNvbXBvbmVudCk7XG4gICAgdGhpcy5uYXZpZ2F0ZUJ5VXJsKGxvY2F0aW9uLnBhdGgoKSk7XG4gIH1cblxuICBjb21taXQoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBlbWl0UGF0aCA9IGluc3RydWN0aW9uLnRvVXJsUGF0aCgpO1xuICAgIHZhciBlbWl0UXVlcnkgPSBpbnN0cnVjdGlvbi50b1VybFF1ZXJ5KCk7XG4gICAgaWYgKGVtaXRQYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgIGVtaXRQYXRoID0gJy8nICsgZW1pdFBhdGg7XG4gICAgfVxuICAgIHZhciBwcm9taXNlID0gc3VwZXIuY29tbWl0KGluc3RydWN0aW9uKTtcbiAgICBpZiAoIV9za2lwTG9jYXRpb25DaGFuZ2UpIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oKF8pID0+IHsgdGhpcy5fbG9jYXRpb24uZ28oZW1pdFBhdGgsIGVtaXRRdWVyeSk7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9sb2NhdGlvblN1YikpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5fbG9jYXRpb25TdWIpO1xuICAgICAgdGhpcy5fbG9jYXRpb25TdWIgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDaGlsZFJvdXRlciBleHRlbmRzIFJvdXRlciB7XG4gIGNvbnN0cnVjdG9yKHBhcmVudDogUm91dGVyLCBob3N0Q29tcG9uZW50KSB7XG4gICAgc3VwZXIocGFyZW50LnJlZ2lzdHJ5LCBwYXJlbnQsIGhvc3RDb21wb25lbnQpO1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICB9XG5cblxuICBuYXZpZ2F0ZUJ5VXJsKHVybDogc3RyaW5nLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIERlbGVnYXRlIG5hdmlnYXRpb24gdG8gdGhlIHJvb3Qgcm91dGVyXG4gICAgcmV0dXJuIHRoaXMucGFyZW50Lm5hdmlnYXRlQnlVcmwodXJsLCBfc2tpcExvY2F0aW9uQ2hhbmdlKTtcbiAgfVxuXG4gIG5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIERlbGVnYXRlIG5hdmlnYXRpb24gdG8gdGhlIHJvb3Qgcm91dGVyXG4gICAgcmV0dXJuIHRoaXMucGFyZW50Lm5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBjYW5BY3RpdmF0ZU9uZShuZXh0SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldkluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB2YXIgbmV4dCA9IF9yZXNvbHZlVG9UcnVlO1xuICBpZiAoaXNCbGFuayhuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50KSkge1xuICAgIHJldHVybiBuZXh0O1xuICB9XG4gIGlmIChpc1ByZXNlbnQobmV4dEluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgIG5leHQgPSBjYW5BY3RpdmF0ZU9uZShuZXh0SW5zdHJ1Y3Rpb24uY2hpbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJlc2VudChwcmV2SW5zdHJ1Y3Rpb24pID8gcHJldkluc3RydWN0aW9uLmNoaWxkIDogbnVsbCk7XG4gIH1cbiAgcmV0dXJuIG5leHQudGhlbigocmVzdWx0KSA9PiB7XG4gICAgaWYgKHJlc3VsdCA9PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHZhciBob29rID0gZ2V0Q2FuQWN0aXZhdGVIb29rKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZSk7XG4gICAgaWYgKGlzUHJlc2VudChob29rKSkge1xuICAgICAgcmV0dXJuIGhvb2sobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgIGlzUHJlc2VudChwcmV2SW5zdHJ1Y3Rpb24pID8gcHJldkluc3RydWN0aW9uLmNvbXBvbmVudCA6IG51bGwpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG4iXX0=