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
import { Location } from 'angular2/platform/common';
import { Inject, Injectable } from 'angular2/core';
import { RouteRegistry, ROUTER_PRIMARY_COMPONENT } from './route_registry';
import { getCanActivateHook } from './lifecycle/route_lifecycle_reflector';
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
export let Router = class Router {
    constructor(registry, parent, hostComponent, root) {
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
        if (isPresent(this._outlet)) {
            throw new BaseException(`Primary outlet is already registered.`);
        }
        this._outlet = outlet;
        if (isPresent(this.currentInstruction)) {
            return this.commit(this.currentInstruction, false);
        }
        return _resolveToTrue;
    }
    /**
     * Unregister an outlet (because it was destroyed, etc).
     *
     * You probably don't need to use this unless you're writing a custom outlet implementation.
     */
    unregisterPrimaryOutlet(outlet) {
        if (isPresent(outlet.name)) {
            throw new BaseException(`registerPrimaryOutlet expects to be called with an unnamed outlet.`);
        }
        this._outlet = null;
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
        if (isPresent(this.currentInstruction) &&
            isPresent(auxInstruction = this.currentInstruction.auxInstruction[outletName])) {
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
        if (isBlank(this.currentInstruction)) {
            return false;
        }
        // `instruction` corresponds to the root router
        while (isPresent(router.parent) && isPresent(instruction.child)) {
            router = router.parent;
            instruction = instruction.child;
        }
        if (isBlank(instruction.component) || isBlank(this.currentInstruction.component) ||
            this.currentInstruction.component.routeName != instruction.component.routeName) {
            return false;
        }
        let paramEquals = true;
        if (isPresent(this.currentInstruction.component.params)) {
            StringMapWrapper.forEach(instruction.component.params, (value, key) => {
                if (this.currentInstruction.component.params[key] !== value) {
                    paramEquals = false;
                }
            });
        }
        return paramEquals;
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
    _emitNavigationFinish(url) { ObservableWrapper.callEmit(this._subject, url); }
    /** @internal */
    _emitNavigationFail(url) { ObservableWrapper.callError(this._subject, url); }
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
        return canActivateOne(nextInstruction, this.currentInstruction);
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
                // TODO: ideally, this closure would map to async-await in Dart.
                // For now, casting to any to suppress an error.
                return this._childRouter._routerCanDeactivate(childInstruction);
            }
            return true;
        });
    }
    /**
     * Updates this router and all descendant routers according to the given instruction
     */
    commit(instruction, _skipLocationChange = false) {
        this.currentInstruction = instruction;
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
    subscribe(onNext, onError) {
        return ObservableWrapper.subscribe(this._subject, onNext, onError);
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
        var ancestorInstructions = [this.currentInstruction];
        var ancestorRouter = this;
        while (isPresent(ancestorRouter = ancestorRouter.parent)) {
            ancestorInstructions.unshift(ancestorRouter.currentInstruction);
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
};
Router = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [RouteRegistry, Router, Object, Router])
], Router);
export let RootRouter = class RootRouter extends Router {
    constructor(registry, location, primaryComponent) {
        super(registry, null, primaryComponent);
        this.root = this;
        this._location = location;
        this._locationSub = this._location.subscribe((change) => {
            // we call recognize ourselves
            this.recognize(change['url'])
                .then((instruction) => {
                if (isPresent(instruction)) {
                    this.navigateByInstruction(instruction, isPresent(change['pop']))
                        .then((_) => {
                        // this is a popstate event; no need to change the URL
                        if (isPresent(change['pop']) && change['type'] != 'hashchange') {
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
                            if (instruction.toRootUrl() != this._location.path()) {
                                this._location.replaceState(emitPath, emitQuery);
                            }
                        }
                        else {
                            this._location.go(emitPath, emitQuery);
                        }
                    });
                }
                else {
                    this._emitNavigationFail(change['url']);
                }
            });
        });
        this.registry.configFromComponent(primaryComponent);
        this.navigateByUrl(location.path());
    }
    commit(instruction, _skipLocationChange = false) {
        var emitPath = instruction.toUrlPath();
        var emitQuery = instruction.toUrlQuery();
        if (emitPath.length > 0 && emitPath[0] != '/') {
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
        super(parent.registry, parent, hostComponent, parent.root);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL3JvdXRlci9yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxjQUFjLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BQ2xGLEVBQUMsR0FBRyxFQUFFLGdCQUFnQixFQUEwQixNQUFNLGdDQUFnQztPQUN0RixFQUFDLE9BQU8sRUFBWSxTQUFTLEVBQUUsSUFBSSxFQUFVLE1BQU0sMEJBQTBCO09BQzdFLEVBQUMsYUFBYSxFQUFtQixNQUFNLGdDQUFnQztPQUN2RSxFQUFDLFFBQVEsRUFBQyxNQUFNLDBCQUEwQjtPQUMxQyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlO09BRXpDLEVBQUMsYUFBYSxFQUFFLHdCQUF3QixFQUFDLE1BQU0sa0JBQWtCO09BTWpFLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSx1Q0FBdUM7QUFHeEUsSUFBSSxjQUFjLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRCxJQUFJLGVBQWUsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRXBEOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBRUg7SUFpQkUsWUFBbUIsUUFBdUIsRUFBUyxNQUFjLEVBQVMsYUFBa0IsRUFDekUsSUFBYTtRQURiLGFBQVEsR0FBUixRQUFRLENBQWU7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQVMsa0JBQWEsR0FBYixhQUFhLENBQUs7UUFDekUsU0FBSSxHQUFKLElBQUksQ0FBUztRQWpCaEMsZUFBVSxHQUFZLEtBQUssQ0FBQztRQUU1Qjs7V0FFRztRQUNJLHVCQUFrQixHQUFnQixJQUFJLENBQUM7UUFFdEMsdUJBQWtCLEdBQWlCLGNB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Q0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQyxJQUFJLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQ3JCLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxlQUFlLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBVSxDQUFDLE1BQWU7UUFDeEMsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDcEIsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxJQUFJLElBQUksR0FBRyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUN6QixTQUFTLENBQUMsZUFBZSxDQUFDLEdBQUcsZUFBZSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM3RSxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvbWlzZVdyYXBwZXIsIEV2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtNYXAsIFN0cmluZ01hcFdyYXBwZXIsIE1hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtpc0JsYW5rLCBpc1N0cmluZywgaXNQcmVzZW50LCBUeXBlLCBpc0FycmF5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtSb3V0ZVJlZ2lzdHJ5LCBST1VURVJfUFJJTUFSWV9DT01QT05FTlR9IGZyb20gJy4vcm91dGVfcmVnaXN0cnknO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gIEluc3RydWN0aW9uLFxufSBmcm9tICcuL2luc3RydWN0aW9uJztcbmltcG9ydCB7Um91dGVyT3V0bGV0fSBmcm9tICcuL2RpcmVjdGl2ZXMvcm91dGVyX291dGxldCc7XG5pbXBvcnQge2dldENhbkFjdGl2YXRlSG9va30gZnJvbSAnLi9saWZlY3ljbGUvcm91dGVfbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge1JvdXRlRGVmaW5pdGlvbn0gZnJvbSAnLi9yb3V0ZV9jb25maWcvcm91dGVfY29uZmlnX2ltcGwnO1xuXG5sZXQgX3Jlc29sdmVUb1RydWUgPSBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRydWUpO1xubGV0IF9yZXNvbHZlVG9GYWxzZSA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUoZmFsc2UpO1xuXG4vKipcbiAqIFRoZSBgUm91dGVyYCBpcyByZXNwb25zaWJsZSBmb3IgbWFwcGluZyBVUkxzIHRvIGNvbXBvbmVudHMuXG4gKlxuICogWW91IGNhbiBzZWUgdGhlIHN0YXRlIG9mIHRoZSByb3V0ZXIgYnkgaW5zcGVjdGluZyB0aGUgcmVhZC1vbmx5IGZpZWxkIGByb3V0ZXIubmF2aWdhdGluZ2AuXG4gKiBUaGlzIG1heSBiZSB1c2VmdWwgZm9yIHNob3dpbmcgYSBzcGlubmVyLCBmb3IgaW5zdGFuY2UuXG4gKlxuICogIyMgQ29uY2VwdHNcbiAqXG4gKiBSb3V0ZXJzIGFuZCBjb21wb25lbnQgaW5zdGFuY2VzIGhhdmUgYSAxOjEgY29ycmVzcG9uZGVuY2UuXG4gKlxuICogVGhlIHJvdXRlciBob2xkcyByZWZlcmVuY2UgdG8gYSBudW1iZXIgb2Yge0BsaW5rIFJvdXRlck91dGxldH0uXG4gKiBBbiBvdXRsZXQgaXMgYSBwbGFjZWhvbGRlciB0aGF0IHRoZSByb3V0ZXIgZHluYW1pY2FsbHkgZmlsbHMgaW4gZGVwZW5kaW5nIG9uIHRoZSBjdXJyZW50IFVSTC5cbiAqXG4gKiBXaGVuIHRoZSByb3V0ZXIgbmF2aWdhdGVzIGZyb20gYSBVUkwsIGl0IG11c3QgZmlyc3QgcmVjb2duaXplIGl0IGFuZCBzZXJpYWxpemUgaXQgaW50byBhblxuICogYEluc3RydWN0aW9uYC5cbiAqIFRoZSByb3V0ZXIgdXNlcyB0aGUgYFJvdXRlUmVnaXN0cnlgIHRvIGdldCBhbiBgSW5zdHJ1Y3Rpb25gLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm91dGVyIHtcbiAgbmF2aWdhdGluZzogYm9vbGVhbiA9IGZhbHNlO1xuICBsYXN0TmF2aWdhdGlvbkF0dGVtcHQ6IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBjdXJyZW50IGBJbnN0cnVjdGlvbmAgZm9yIHRoZSByb3V0ZXJcbiAgICovXG4gIHB1YmxpYyBjdXJyZW50SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gbnVsbDtcblxuICBwcml2YXRlIF9jdXJyZW50TmF2aWdhdGlvbjogUHJvbWlzZTxhbnk+ID0gX3Jlc29sdmVUb1RydWU7XG4gIHByaXZhdGUgX291dGxldDogUm91dGVyT3V0bGV0ID0gbnVsbDtcblxuICBwcml2YXRlIF9hdXhSb3V0ZXJzID0gbmV3IE1hcDxzdHJpbmcsIFJvdXRlcj4oKTtcbiAgcHJpdmF0ZSBfY2hpbGRSb3V0ZXI6IFJvdXRlcjtcblxuICBwcml2YXRlIF9zdWJqZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWdpc3RyeTogUm91dGVSZWdpc3RyeSwgcHVibGljIHBhcmVudDogUm91dGVyLCBwdWJsaWMgaG9zdENvbXBvbmVudDogYW55LFxuICAgICAgICAgICAgICBwdWJsaWMgcm9vdD86IFJvdXRlcikge31cblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIGNoaWxkIHJvdXRlci4gWW91IHByb2JhYmx5IGRvbid0IG5lZWQgdG8gdXNlIHRoaXMgdW5sZXNzIHlvdSdyZSB3cml0aW5nIGEgcmV1c2FibGVcbiAgICogY29tcG9uZW50LlxuICAgKi9cbiAgY2hpbGRSb3V0ZXIoaG9zdENvbXBvbmVudDogYW55KTogUm91dGVyIHtcbiAgICByZXR1cm4gdGhpcy5fY2hpbGRSb3V0ZXIgPSBuZXcgQ2hpbGRSb3V0ZXIodGhpcywgaG9zdENvbXBvbmVudCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgY2hpbGQgcm91dGVyLiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZVxuICAgKiBjb21wb25lbnQuXG4gICAqL1xuICBhdXhSb3V0ZXIoaG9zdENvbXBvbmVudDogYW55KTogUm91dGVyIHsgcmV0dXJuIG5ldyBDaGlsZFJvdXRlcih0aGlzLCBob3N0Q29tcG9uZW50KTsgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhbiBvdXRsZXQgdG8gYmUgbm90aWZpZWQgb2YgcHJpbWFyeSByb3V0ZSBjaGFuZ2VzLlxuICAgKlxuICAgKiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZSBjb21wb25lbnQuXG4gICAqL1xuICByZWdpc3RlclByaW1hcnlPdXRsZXQob3V0bGV0OiBSb3V0ZXJPdXRsZXQpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChpc1ByZXNlbnQob3V0bGV0Lm5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgcmVnaXN0ZXJQcmltYXJ5T3V0bGV0IGV4cGVjdHMgdG8gYmUgY2FsbGVkIHdpdGggYW4gdW5uYW1lZCBvdXRsZXQuYCk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgUHJpbWFyeSBvdXRsZXQgaXMgYWxyZWFkeSByZWdpc3RlcmVkLmApO1xuICAgIH1cblxuICAgIHRoaXMuX291dGxldCA9IG91dGxldDtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY3VycmVudEluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tbWl0KHRoaXMuY3VycmVudEluc3RydWN0aW9uLCBmYWxzZSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnJlZ2lzdGVyIGFuIG91dGxldCAoYmVjYXVzZSBpdCB3YXMgZGVzdHJveWVkLCBldGMpLlxuICAgKlxuICAgKiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSBjdXN0b20gb3V0bGV0IGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgdW5yZWdpc3RlclByaW1hcnlPdXRsZXQob3V0bGV0OiBSb3V0ZXJPdXRsZXQpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KG91dGxldC5uYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYHJlZ2lzdGVyUHJpbWFyeU91dGxldCBleHBlY3RzIHRvIGJlIGNhbGxlZCB3aXRoIGFuIHVubmFtZWQgb3V0bGV0LmApO1xuICAgIH1cbiAgICB0aGlzLl9vdXRsZXQgPSBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gb3V0bGV0IHRvIG5vdGlmaWVkIG9mIGF1eGlsaWFyeSByb3V0ZSBjaGFuZ2VzLlxuICAgKlxuICAgKiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZSBjb21wb25lbnQuXG4gICAqL1xuICByZWdpc3RlckF1eE91dGxldChvdXRsZXQ6IFJvdXRlck91dGxldCk6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIG91dGxldE5hbWUgPSBvdXRsZXQubmFtZTtcbiAgICBpZiAoaXNCbGFuayhvdXRsZXROYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYHJlZ2lzdGVyQXV4T3V0bGV0IGV4cGVjdHMgdG8gYmUgY2FsbGVkIHdpdGggYW4gb3V0bGV0IHdpdGggYSBuYW1lLmApO1xuICAgIH1cblxuICAgIHZhciByb3V0ZXIgPSB0aGlzLmF1eFJvdXRlcih0aGlzLmhvc3RDb21wb25lbnQpO1xuXG4gICAgdGhpcy5fYXV4Um91dGVycy5zZXQob3V0bGV0TmFtZSwgcm91dGVyKTtcbiAgICByb3V0ZXIuX291dGxldCA9IG91dGxldDtcblxuICAgIHZhciBhdXhJbnN0cnVjdGlvbjtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY3VycmVudEluc3RydWN0aW9uKSAmJlxuICAgICAgICBpc1ByZXNlbnQoYXV4SW5zdHJ1Y3Rpb24gPSB0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbltvdXRsZXROYW1lXSkpIHtcbiAgICAgIHJldHVybiByb3V0ZXIuY29tbWl0KGF1eEluc3RydWN0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYW4gaW5zdHJ1Y3Rpb24sIHJldHVybnMgYHRydWVgIGlmIHRoZSBpbnN0cnVjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLFxuICAgKiBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICovXG4gIGlzUm91dGVBY3RpdmUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogYm9vbGVhbiB7XG4gICAgdmFyIHJvdXRlcjogUm91dGVyID0gdGhpcztcblxuICAgIGlmIChpc0JsYW5rKHRoaXMuY3VycmVudEluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIGBpbnN0cnVjdGlvbmAgY29ycmVzcG9uZHMgdG8gdGhlIHJvb3Qgcm91dGVyXG4gICAgd2hpbGUgKGlzUHJlc2VudChyb3V0ZXIucGFyZW50KSAmJiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgICByb3V0ZXIgPSByb3V0ZXIucGFyZW50O1xuICAgICAgaW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jaGlsZDtcbiAgICB9XG5cbiAgICBpZiAoaXNCbGFuayhpbnN0cnVjdGlvbi5jb21wb25lbnQpIHx8IGlzQmxhbmsodGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50KSB8fFxuICAgICAgICB0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQucm91dGVOYW1lICE9IGluc3RydWN0aW9uLmNvbXBvbmVudC5yb3V0ZU5hbWUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgcGFyYW1FcXVhbHMgPSB0cnVlO1xuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQucGFyYW1zKSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGluc3RydWN0aW9uLmNvbXBvbmVudC5wYXJhbXMsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQucGFyYW1zW2tleV0gIT09IHZhbHVlKSB7XG4gICAgICAgICAgcGFyYW1FcXVhbHMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcmFtRXF1YWxzO1xuICB9XG5cblxuICAvKipcbiAgICogRHluYW1pY2FsbHkgdXBkYXRlIHRoZSByb3V0aW5nIGNvbmZpZ3VyYXRpb24gYW5kIHRyaWdnZXIgYSBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiAjIyMgVXNhZ2VcbiAgICpcbiAgICogYGBgXG4gICAqIHJvdXRlci5jb25maWcoW1xuICAgKiAgIHsgJ3BhdGgnOiAnLycsICdjb21wb25lbnQnOiBJbmRleENvbXAgfSxcbiAgICogICB7ICdwYXRoJzogJy91c2VyLzppZCcsICdjb21wb25lbnQnOiBVc2VyQ29tcCB9LFxuICAgKiBdKTtcbiAgICogYGBgXG4gICAqL1xuICBjb25maWcoZGVmaW5pdGlvbnM6IFJvdXRlRGVmaW5pdGlvbltdKTogUHJvbWlzZTxhbnk+IHtcbiAgICBkZWZpbml0aW9ucy5mb3JFYWNoKFxuICAgICAgICAocm91dGVEZWZpbml0aW9uKSA9PiB7IHRoaXMucmVnaXN0cnkuY29uZmlnKHRoaXMuaG9zdENvbXBvbmVudCwgcm91dGVEZWZpbml0aW9uKTsgfSk7XG4gICAgcmV0dXJuIHRoaXMucmVuYXZpZ2F0ZSgpO1xuICB9XG5cblxuICAvKipcbiAgICogTmF2aWdhdGUgYmFzZWQgb24gdGhlIHByb3ZpZGVkIFJvdXRlIExpbmsgRFNMLiBJdCdzIHByZWZlcnJlZCB0byBuYXZpZ2F0ZSB3aXRoIHRoaXMgbWV0aG9kXG4gICAqIG92ZXIgYG5hdmlnYXRlQnlVcmxgLlxuICAgKlxuICAgKiAjIyMgVXNhZ2VcbiAgICpcbiAgICogVGhpcyBtZXRob2QgdGFrZXMgYW4gYXJyYXkgcmVwcmVzZW50aW5nIHRoZSBSb3V0ZSBMaW5rIERTTDpcbiAgICogYGBgXG4gICAqIFsnLi9NeUNtcCcsIHtwYXJhbTogM31dXG4gICAqIGBgYFxuICAgKiBTZWUgdGhlIHtAbGluayBSb3V0ZXJMaW5rfSBkaXJlY3RpdmUgZm9yIG1vcmUuXG4gICAqL1xuICBuYXZpZ2F0ZShsaW5rUGFyYW1zOiBhbnlbXSk6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIGluc3RydWN0aW9uID0gdGhpcy5nZW5lcmF0ZShsaW5rUGFyYW1zKTtcbiAgICByZXR1cm4gdGhpcy5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24sIGZhbHNlKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlIHRvIGEgVVJMLiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gbmF2aWdhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICogSXQncyBwcmVmZXJyZWQgdG8gbmF2aWdhdGUgd2l0aCBgbmF2aWdhdGVgIGluc3RlYWQgb2YgdGhpcyBtZXRob2QsIHNpbmNlIFVSTHMgYXJlIG1vcmUgYnJpdHRsZS5cbiAgICpcbiAgICogSWYgdGhlIGdpdmVuIFVSTCBiZWdpbnMgd2l0aCBhIGAvYCwgcm91dGVyIHdpbGwgbmF2aWdhdGUgYWJzb2x1dGVseS5cbiAgICogSWYgdGhlIGdpdmVuIFVSTCBkb2VzIG5vdCBiZWdpbiB3aXRoIGAvYCwgdGhlIHJvdXRlciB3aWxsIG5hdmlnYXRlIHJlbGF0aXZlIHRvIHRoaXMgY29tcG9uZW50LlxuICAgKi9cbiAgbmF2aWdhdGVCeVVybCh1cmw6IHN0cmluZywgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudE5hdmlnYXRpb24gPSB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbi50aGVuKChfKSA9PiB7XG4gICAgICB0aGlzLmxhc3ROYXZpZ2F0aW9uQXR0ZW1wdCA9IHVybDtcbiAgICAgIHRoaXMuX3N0YXJ0TmF2aWdhdGluZygpO1xuICAgICAgcmV0dXJuIHRoaXMuX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmcodGhpcy5yZWNvZ25pemUodXJsKS50aGVuKChpbnN0cnVjdGlvbikgPT4ge1xuICAgICAgICBpZiAoaXNCbGFuayhpbnN0cnVjdGlvbikpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX25hdmlnYXRlKGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKTtcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlIHZpYSB0aGUgcHJvdmlkZWQgaW5zdHJ1Y3Rpb24uIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBuYXZpZ2F0aW9uIGlzXG4gICAqIGNvbXBsZXRlLlxuICAgKi9cbiAgbmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzQmxhbmsoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb0ZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY3VycmVudE5hdmlnYXRpb24gPSB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbi50aGVuKChfKSA9PiB7XG4gICAgICB0aGlzLl9zdGFydE5hdmlnYXRpbmcoKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZnRlclByb21pc2VGaW5pc2hOYXZpZ2F0aW5nKHRoaXMuX25hdmlnYXRlKGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBpbnN0cnVjdGlvbi5yZXNvbHZlQ29tcG9uZW50KCkudGhlbigoXykgPT4ge1xuICAgICAgdmFyIHVuc2V0dGxlZEluc3RydWN0aW9uczogQXJyYXk8UHJvbWlzZTxhbnk+PiA9IFtdO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICAgICAgaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJldXNlID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgICAgIHVuc2V0dGxlZEluc3RydWN0aW9ucy5wdXNoKHRoaXMuX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uLmNoaWxkKSk7XG4gICAgICB9XG5cbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChpbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbiwgKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgXykgPT4ge1xuICAgICAgICB1bnNldHRsZWRJbnN0cnVjdGlvbnMucHVzaCh0aGlzLl9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbikpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsKHVuc2V0dGxlZEluc3RydWN0aW9ucyk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9uYXZpZ2F0ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbilcbiAgICAgICAgLnRoZW4oKF8pID0+IHRoaXMuX3JvdXRlckNhblJldXNlKGluc3RydWN0aW9uKSlcbiAgICAgICAgLnRoZW4oKF8pID0+IHRoaXMuX2NhbkFjdGl2YXRlKGluc3RydWN0aW9uKSlcbiAgICAgICAgLnRoZW4oKHJlc3VsdDogYm9vbGVhbikgPT4ge1xuICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLl9yb3V0ZXJDYW5EZWFjdGl2YXRlKGluc3RydWN0aW9uKVxuICAgICAgICAgICAgICAudGhlbigocmVzdWx0OiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tbWl0KGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKVxuICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbWl0TmF2aWdhdGlvbkZpbmlzaChpbnN0cnVjdGlvbi50b1Jvb3RVcmwoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2VtaXROYXZpZ2F0aW9uRmluaXNoKHVybCk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLl9zdWJqZWN0LCB1cmwpOyB9XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2VtaXROYXZpZ2F0aW9uRmFpbCh1cmwpOiB2b2lkIHsgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVycm9yKHRoaXMuX3N1YmplY3QsIHVybCk7IH1cblxuICBwcml2YXRlIF9hZnRlclByb21pc2VGaW5pc2hOYXZpZ2F0aW5nKHByb21pc2U6IFByb21pc2U8YW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmNhdGNoRXJyb3IocHJvbWlzZS50aGVuKChfKSA9PiB0aGlzLl9maW5pc2hOYXZpZ2F0aW5nKCkpLCAoZXJyKSA9PiB7XG4gICAgICB0aGlzLl9maW5pc2hOYXZpZ2F0aW5nKCk7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG4gIH1cblxuICAvKlxuICAgKiBSZWN1cnNpdmVseSBzZXQgcmV1c2UgZmxhZ3NcbiAgICovXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JvdXRlckNhblJldXNlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fb3V0bGV0KSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9GYWxzZTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsoaW5zdHJ1Y3Rpb24uY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb3V0bGV0LnJvdXRlckNhblJldXNlKGluc3RydWN0aW9uLmNvbXBvbmVudClcbiAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZSA9IHJlc3VsdDtcbiAgICAgICAgICBpZiAocmVzdWx0ICYmIGlzUHJlc2VudCh0aGlzLl9jaGlsZFJvdXRlcikgJiYgaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkUm91dGVyLl9yb3V0ZXJDYW5SZXVzZShpbnN0cnVjdGlvbi5jaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NhbkFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gY2FuQWN0aXZhdGVPbmUobmV4dEluc3RydWN0aW9uLCB0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbik7XG4gIH1cblxuICBwcml2YXRlIF9yb3V0ZXJDYW5EZWFjdGl2YXRlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX291dGxldCkpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9XG4gICAgdmFyIG5leHQ6IFByb21pc2U8Ym9vbGVhbj47XG4gICAgdmFyIGNoaWxkSW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gbnVsbDtcbiAgICB2YXIgcmV1c2U6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uID0gbnVsbDtcbiAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uKSkge1xuICAgICAgY2hpbGRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNoaWxkO1xuICAgICAgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgICByZXVzZSA9IGlzQmxhbmsoaW5zdHJ1Y3Rpb24uY29tcG9uZW50KSB8fCBpbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2U7XG4gICAgfVxuICAgIGlmIChyZXVzZSkge1xuICAgICAgbmV4dCA9IF9yZXNvbHZlVG9UcnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0ID0gdGhpcy5fb3V0bGV0LnJvdXRlckNhbkRlYWN0aXZhdGUoY29tcG9uZW50SW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICAvLyBUT0RPOiBhdXggcm91dGUgbGlmZWN5Y2xlIGhvb2tzXG4gICAgcmV0dXJuIG5leHQudGhlbjxib29sZWFuPigocmVzdWx0KTogYm9vbGVhbiB8IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgaWYgKHJlc3VsdCA9PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSkge1xuICAgICAgICAvLyBUT0RPOiBpZGVhbGx5LCB0aGlzIGNsb3N1cmUgd291bGQgbWFwIHRvIGFzeW5jLWF3YWl0IGluIERhcnQuXG4gICAgICAgIC8vIEZvciBub3csIGNhc3RpbmcgdG8gYW55IHRvIHN1cHByZXNzIGFuIGVycm9yLlxuICAgICAgICByZXR1cm4gPGFueT50aGlzLl9jaGlsZFJvdXRlci5fcm91dGVyQ2FuRGVhY3RpdmF0ZShjaGlsZEluc3RydWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhpcyByb3V0ZXIgYW5kIGFsbCBkZXNjZW5kYW50IHJvdXRlcnMgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBpbnN0cnVjdGlvblxuICAgKi9cbiAgY29tbWl0KGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICB0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uO1xuXG4gICAgdmFyIG5leHQ6IFByb21pc2U8YW55PiA9IF9yZXNvbHZlVG9UcnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fb3V0bGV0KSAmJiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY29tcG9uZW50KSkge1xuICAgICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICAgICAgaWYgKGNvbXBvbmVudEluc3RydWN0aW9uLnJldXNlKSB7XG4gICAgICAgIG5leHQgPSB0aGlzLl9vdXRsZXQucmV1c2UoY29tcG9uZW50SW5zdHJ1Y3Rpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dCA9XG4gICAgICAgICAgICB0aGlzLmRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb24pLnRoZW4oKF8pID0+IHRoaXMuX291dGxldC5hY3RpdmF0ZShjb21wb25lbnRJbnN0cnVjdGlvbikpO1xuICAgICAgfVxuICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgICAgbmV4dCA9IG5leHQudGhlbigoXykgPT4ge1xuICAgICAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRSb3V0ZXIuY29tbWl0KGluc3RydWN0aW9uLmNoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcm9taXNlczogUHJvbWlzZTxhbnk+W10gPSBbXTtcbiAgICB0aGlzLl9hdXhSb3V0ZXJzLmZvckVhY2goKHJvdXRlciwgbmFtZSkgPT4ge1xuICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbltuYW1lXSkpIHtcbiAgICAgICAgcHJvbWlzZXMucHVzaChyb3V0ZXIuY29tbWl0KGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uW25hbWVdKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV4dC50aGVuKChfKSA9PiBQcm9taXNlV3JhcHBlci5hbGwocHJvbWlzZXMpKTtcbiAgfVxuXG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RhcnROYXZpZ2F0aW5nKCk6IHZvaWQgeyB0aGlzLm5hdmlnYXRpbmcgPSB0cnVlOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmluaXNoTmF2aWdhdGluZygpOiB2b2lkIHsgdGhpcy5uYXZpZ2F0aW5nID0gZmFsc2U7IH1cblxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gVVJMIHVwZGF0ZXMgZnJvbSB0aGUgcm91dGVyXG4gICAqL1xuICBzdWJzY3JpYmUob25OZXh0OiAodmFsdWU6IGFueSkgPT4gdm9pZCwgb25FcnJvcj86ICh2YWx1ZTogYW55KSA9PiB2b2lkKTogT2JqZWN0IHtcbiAgICByZXR1cm4gT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHRoaXMuX3N1YmplY3QsIG9uTmV4dCwgb25FcnJvcik7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBjb250ZW50cyBvZiB0aGlzIHJvdXRlcidzIG91dGxldCBhbmQgYWxsIGRlc2NlbmRhbnQgb3V0bGV0c1xuICAgKi9cbiAgZGVhY3RpdmF0ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBjaGlsZEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbikpIHtcbiAgICAgIGNoaWxkSW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jaGlsZDtcbiAgICAgIGNvbXBvbmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICAgIH1cbiAgICB2YXIgbmV4dDogUHJvbWlzZTxhbnk+ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jaGlsZFJvdXRlcikpIHtcbiAgICAgIG5leHQgPSB0aGlzLl9jaGlsZFJvdXRlci5kZWFjdGl2YXRlKGNoaWxkSW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX291dGxldCkpIHtcbiAgICAgIG5leHQgPSBuZXh0LnRoZW4oKF8pID0+IHRoaXMuX291dGxldC5kZWFjdGl2YXRlKGNvbXBvbmVudEluc3RydWN0aW9uKSk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogaGFuZGxlIGF1eCByb3V0ZXNcblxuICAgIHJldHVybiBuZXh0O1xuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYSBVUkwsIHJldHVybnMgYW4gaW5zdHJ1Y3Rpb24gcmVwcmVzZW50aW5nIHRoZSBjb21wb25lbnQgZ3JhcGhcbiAgICovXG4gIHJlY29nbml6ZSh1cmw6IHN0cmluZyk6IFByb21pc2U8SW5zdHJ1Y3Rpb24+IHtcbiAgICB2YXIgYW5jZXN0b3JDb21wb25lbnRzID0gdGhpcy5fZ2V0QW5jZXN0b3JJbnN0cnVjdGlvbnMoKTtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyeS5yZWNvZ25pemUodXJsLCBhbmNlc3RvckNvbXBvbmVudHMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0QW5jZXN0b3JJbnN0cnVjdGlvbnMoKTogSW5zdHJ1Y3Rpb25bXSB7XG4gICAgdmFyIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdID0gW3RoaXMuY3VycmVudEluc3RydWN0aW9uXTtcbiAgICB2YXIgYW5jZXN0b3JSb3V0ZXI6IFJvdXRlciA9IHRoaXM7XG4gICAgd2hpbGUgKGlzUHJlc2VudChhbmNlc3RvclJvdXRlciA9IGFuY2VzdG9yUm91dGVyLnBhcmVudCkpIHtcbiAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLnVuc2hpZnQoYW5jZXN0b3JSb3V0ZXIuY3VycmVudEluc3RydWN0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zO1xuICB9XG5cblxuICAvKipcbiAgICogTmF2aWdhdGVzIHRvIGVpdGhlciB0aGUgbGFzdCBVUkwgc3VjY2Vzc2Z1bGx5IG5hdmlnYXRlZCB0bywgb3IgdGhlIGxhc3QgVVJMIHJlcXVlc3RlZCBpZiB0aGVcbiAgICogcm91dGVyIGhhcyB5ZXQgdG8gc3VjY2Vzc2Z1bGx5IG5hdmlnYXRlLlxuICAgKi9cbiAgcmVuYXZpZ2F0ZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMubGFzdE5hdmlnYXRpb25BdHRlbXB0KSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5uYXZpZ2F0ZUJ5VXJsKHRoaXMubGFzdE5hdmlnYXRpb25BdHRlbXB0KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGFuIGBJbnN0cnVjdGlvbmAgYmFzZWQgb24gdGhlIHByb3ZpZGVkIFJvdXRlIExpbmsgRFNMLlxuICAgKi9cbiAgZ2VuZXJhdGUobGlua1BhcmFtczogYW55W10pOiBJbnN0cnVjdGlvbiB7XG4gICAgdmFyIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zID0gdGhpcy5fZ2V0QW5jZXN0b3JJbnN0cnVjdGlvbnMoKTtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyeS5nZW5lcmF0ZShsaW5rUGFyYW1zLCBhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvb3RSb3V0ZXIgZXh0ZW5kcyBSb3V0ZXIge1xuICAvKiogQGludGVybmFsICovXG4gIF9sb2NhdGlvbjogTG9jYXRpb247XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xvY2F0aW9uU3ViOiBPYmplY3Q7XG5cbiAgY29uc3RydWN0b3IocmVnaXN0cnk6IFJvdXRlUmVnaXN0cnksIGxvY2F0aW9uOiBMb2NhdGlvbixcbiAgICAgICAgICAgICAgQEluamVjdChST1VURVJfUFJJTUFSWV9DT01QT05FTlQpIHByaW1hcnlDb21wb25lbnQ6IFR5cGUpIHtcbiAgICBzdXBlcihyZWdpc3RyeSwgbnVsbCwgcHJpbWFyeUNvbXBvbmVudCk7XG4gICAgdGhpcy5yb290ID0gdGhpcztcbiAgICB0aGlzLl9sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICAgIHRoaXMuX2xvY2F0aW9uU3ViID0gdGhpcy5fbG9jYXRpb24uc3Vic2NyaWJlKChjaGFuZ2UpID0+IHtcbiAgICAgIC8vIHdlIGNhbGwgcmVjb2duaXplIG91cnNlbHZlc1xuICAgICAgdGhpcy5yZWNvZ25pemUoY2hhbmdlWyd1cmwnXSlcbiAgICAgICAgICAudGhlbigoaW5zdHJ1Y3Rpb24pID0+IHtcbiAgICAgICAgICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICAgICAgICAgIHRoaXMubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uLCBpc1ByZXNlbnQoY2hhbmdlWydwb3AnXSkpXG4gICAgICAgICAgICAgICAgICAudGhlbigoXykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGEgcG9wc3RhdGUgZXZlbnQ7IG5vIG5lZWQgdG8gY2hhbmdlIHRoZSBVUkxcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChjaGFuZ2VbJ3BvcCddKSAmJiBjaGFuZ2VbJ3R5cGUnXSAhPSAnaGFzaGNoYW5nZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGVtaXRQYXRoID0gaW5zdHJ1Y3Rpb24udG9VcmxQYXRoKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbWl0UXVlcnkgPSBpbnN0cnVjdGlvbi50b1VybFF1ZXJ5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbWl0UGF0aC5sZW5ndGggPiAwICYmIGVtaXRQYXRoWzBdICE9ICcvJykge1xuICAgICAgICAgICAgICAgICAgICAgIGVtaXRQYXRoID0gJy8nICsgZW1pdFBhdGg7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBXZSd2ZSBvcHRlZCB0byB1c2UgcHVzaHN0YXRlIGFuZCBwb3BTdGF0ZSBBUElzIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB5b3VcbiAgICAgICAgICAgICAgICAgICAgLy8gYW4gYXBwIHVzZXMgSGFzaExvY2F0aW9uU3RyYXRlZ3kgb3IgUGF0aExvY2F0aW9uU3RyYXRlZ3kuXG4gICAgICAgICAgICAgICAgICAgIC8vIEhvd2V2ZXIsIGFwcHMgdGhhdCBhcmUgbWlncmF0aW5nIG1pZ2h0IGhhdmUgaGFzaCBsaW5rcyB0aGF0IG9wZXJhdGUgb3V0c2lkZVxuICAgICAgICAgICAgICAgICAgICAvLyBhbmd1bGFyIHRvIHdoaWNoIHJvdXRpbmcgbXVzdCByZXNwb25kLlxuICAgICAgICAgICAgICAgICAgICAvLyBUaGVyZWZvcmUgd2Uga25vdyB0aGF0IGFsbCBoYXNoY2hhbmdlIGV2ZW50cyBvY2N1ciBvdXRzaWRlIEFuZ3VsYXIuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRvIHN1cHBvcnQgdGhlc2UgY2FzZXMgd2hlcmUgd2UgcmVzcG9uZCB0byBoYXNoY2hhbmdlcyBhbmQgcmVkaXJlY3QgYXMgYVxuICAgICAgICAgICAgICAgICAgICAvLyByZXN1bHQsIHdlIG5lZWQgdG8gcmVwbGFjZSB0aGUgdG9wIGl0ZW0gb24gdGhlIHN0YWNrLlxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hhbmdlWyd0eXBlJ10gPT0gJ2hhc2hjaGFuZ2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RydWN0aW9uLnRvUm9vdFVybCgpICE9IHRoaXMuX2xvY2F0aW9uLnBhdGgoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9jYXRpb24ucmVwbGFjZVN0YXRlKGVtaXRQYXRoLCBlbWl0UXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2NhdGlvbi5nbyhlbWl0UGF0aCwgZW1pdFF1ZXJ5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLl9lbWl0TmF2aWdhdGlvbkZhaWwoY2hhbmdlWyd1cmwnXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQocHJpbWFyeUNvbXBvbmVudCk7XG4gICAgdGhpcy5uYXZpZ2F0ZUJ5VXJsKGxvY2F0aW9uLnBhdGgoKSk7XG4gIH1cblxuICBjb21taXQoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBlbWl0UGF0aCA9IGluc3RydWN0aW9uLnRvVXJsUGF0aCgpO1xuICAgIHZhciBlbWl0UXVlcnkgPSBpbnN0cnVjdGlvbi50b1VybFF1ZXJ5KCk7XG4gICAgaWYgKGVtaXRQYXRoLmxlbmd0aCA+IDAgJiYgZW1pdFBhdGhbMF0gIT0gJy8nKSB7XG4gICAgICBlbWl0UGF0aCA9ICcvJyArIGVtaXRQYXRoO1xuICAgIH1cbiAgICB2YXIgcHJvbWlzZSA9IHN1cGVyLmNvbW1pdChpbnN0cnVjdGlvbik7XG4gICAgaWYgKCFfc2tpcExvY2F0aW9uQ2hhbmdlKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKChfKSA9PiB7IHRoaXMuX2xvY2F0aW9uLmdvKGVtaXRQYXRoLCBlbWl0UXVlcnkpOyB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fbG9jYXRpb25TdWIpKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuX2xvY2F0aW9uU3ViKTtcbiAgICAgIHRoaXMuX2xvY2F0aW9uU3ViID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ2hpbGRSb3V0ZXIgZXh0ZW5kcyBSb3V0ZXIge1xuICBjb25zdHJ1Y3RvcihwYXJlbnQ6IFJvdXRlciwgaG9zdENvbXBvbmVudCkge1xuICAgIHN1cGVyKHBhcmVudC5yZWdpc3RyeSwgcGFyZW50LCBob3N0Q29tcG9uZW50LCBwYXJlbnQucm9vdCk7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gIH1cblxuXG4gIG5hdmlnYXRlQnlVcmwodXJsOiBzdHJpbmcsIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgLy8gRGVsZWdhdGUgbmF2aWdhdGlvbiB0byB0aGUgcm9vdCByb3V0ZXJcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQubmF2aWdhdGVCeVVybCh1cmwsIF9za2lwTG9jYXRpb25DaGFuZ2UpO1xuICB9XG5cbiAgbmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgLy8gRGVsZWdhdGUgbmF2aWdhdGlvbiB0byB0aGUgcm9vdCByb3V0ZXJcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGNhbkFjdGl2YXRlT25lKG5leHRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHZhciBuZXh0ID0gX3Jlc29sdmVUb1RydWU7XG4gIGlmIChpc0JsYW5rKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgcmV0dXJuIG5leHQ7XG4gIH1cbiAgaWYgKGlzUHJlc2VudChuZXh0SW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgbmV4dCA9IGNhbkFjdGl2YXRlT25lKG5leHRJbnN0cnVjdGlvbi5jaGlsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaXNQcmVzZW50KHByZXZJbnN0cnVjdGlvbikgPyBwcmV2SW5zdHJ1Y3Rpb24uY2hpbGQgOiBudWxsKTtcbiAgfVxuICByZXR1cm4gbmV4dC50aGVuPGJvb2xlYW4+KChyZXN1bHQ6IGJvb2xlYW4pOiBib29sZWFuID0+IHtcbiAgICBpZiAocmVzdWx0ID09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJldXNlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIGhvb2sgPSBnZXRDYW5BY3RpdmF0ZUhvb2sobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudC5jb21wb25lbnRUeXBlKTtcbiAgICBpZiAoaXNQcmVzZW50KGhvb2spKSB7XG4gICAgICByZXR1cm4gaG9vayhuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgaXNQcmVzZW50KHByZXZJbnN0cnVjdGlvbikgPyBwcmV2SW5zdHJ1Y3Rpb24uY29tcG9uZW50IDogbnVsbCk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9KTtcbn1cbiJdfQ==