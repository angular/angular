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
     * Register an outlet to notified of primary route changes.
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
        // TODO...
        // what is the host of an aux route???
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
            .then((_) => this._canReuse(instruction))
            .then((_) => this._canActivate(instruction))
            .then((result) => {
            if (!result) {
                return false;
            }
            return this._canDeactivate(instruction)
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
            instruction.component.reuse = false;
            var unsettledInstructions = [];
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
    _canReuse(instruction) {
        if (isBlank(this._outlet)) {
            return _resolveToFalse;
        }
        return this._outlet.canReuse(instruction.component)
            .then((result) => {
            instruction.component.reuse = result;
            if (result && isPresent(this._childRouter) && isPresent(instruction.child)) {
                return this._childRouter._canReuse(instruction.child);
            }
        });
    }
    _canActivate(nextInstruction) {
        return canActivateOne(nextInstruction, this._currentInstruction);
    }
    _canDeactivate(instruction) {
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
            reuse = instruction.component.reuse;
        }
        if (reuse) {
            next = _resolveToTrue;
        }
        else {
            next = this._outlet.canDeactivate(componentInstruction);
        }
        // TODO: aux route lifecycle hooks
        return next.then((result) => {
            if (result == false) {
                return false;
            }
            if (isPresent(this._childRouter)) {
                return this._childRouter._canDeactivate(childInstruction);
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
        if (isPresent(this._outlet)) {
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
        var ancestorComponents = [];
        var ancestorRouter = this;
        while (isPresent(ancestorRouter.parent) &&
            isPresent(ancestorRouter.parent._currentInstruction)) {
            ancestorRouter = ancestorRouter.parent;
            ancestorComponents.unshift(ancestorRouter._currentInstruction);
        }
        return ancestorComponents;
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
     * Generate a URL from a component name and optional map of parameters. The URL is relative to the
     * app's base href.
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
        this._locationSub = this._location.subscribe((change) => this.navigateByUrl(change['url'], isPresent(change['pop'])));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3JvdXRlci9yb3V0ZXIudHMiXSwibmFtZXMiOlsiUm91dGVyIiwiUm91dGVyLmNvbnN0cnVjdG9yIiwiUm91dGVyLmNoaWxkUm91dGVyIiwiUm91dGVyLmF1eFJvdXRlciIsIlJvdXRlci5yZWdpc3RlclByaW1hcnlPdXRsZXQiLCJSb3V0ZXIucmVnaXN0ZXJBdXhPdXRsZXQiLCJSb3V0ZXIuaXNSb3V0ZUFjdGl2ZSIsIlJvdXRlci5jb25maWciLCJSb3V0ZXIubmF2aWdhdGUiLCJSb3V0ZXIubmF2aWdhdGVCeVVybCIsIlJvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24iLCJSb3V0ZXIuX25hdmlnYXRlIiwiUm91dGVyLl9zZXR0bGVJbnN0cnVjdGlvbiIsIlJvdXRlci5fZW1pdE5hdmlnYXRpb25GaW5pc2giLCJSb3V0ZXIuX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmciLCJSb3V0ZXIuX2NhblJldXNlIiwiUm91dGVyLl9jYW5BY3RpdmF0ZSIsIlJvdXRlci5fY2FuRGVhY3RpdmF0ZSIsIlJvdXRlci5jb21taXQiLCJSb3V0ZXIuX3N0YXJ0TmF2aWdhdGluZyIsIlJvdXRlci5fZmluaXNoTmF2aWdhdGluZyIsIlJvdXRlci5zdWJzY3JpYmUiLCJSb3V0ZXIuZGVhY3RpdmF0ZSIsIlJvdXRlci5yZWNvZ25pemUiLCJSb3V0ZXIuX2dldEFuY2VzdG9ySW5zdHJ1Y3Rpb25zIiwiUm91dGVyLnJlbmF2aWdhdGUiLCJSb3V0ZXIuZ2VuZXJhdGUiLCJSb290Um91dGVyIiwiUm9vdFJvdXRlci5jb25zdHJ1Y3RvciIsIlJvb3RSb3V0ZXIuY29tbWl0IiwiUm9vdFJvdXRlci5kaXNwb3NlIiwiQ2hpbGRSb3V0ZXIiLCJDaGlsZFJvdXRlci5jb25zdHJ1Y3RvciIsIkNoaWxkUm91dGVyLm5hdmlnYXRlQnlVcmwiLCJDaGlsZFJvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rp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TUEsUUFBUUEsRUFBRUEsSUFBSUEsRUFBRUEsZ0JBQWdCQSxDQUFDQSxDQUFDQTtRQUN4Q0EsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDMUJBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLENBQ3hDQSxDQUFDQSxNQUFNQSxLQUFLQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUFFQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM3RUEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO1FBQ3BEQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUN0Q0EsQ0FBQ0E7SUFFREQsTUFBTUEsQ0FBQ0EsV0FBd0JBLEVBQUVBLG1CQUFtQkEsR0FBWUEsS0FBS0E7UUFDbkVFLElBQUlBLFFBQVFBLEdBQUdBLFdBQVdBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1FBQ3ZDQSxJQUFJQSxTQUFTQSxHQUFHQSxXQUFXQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtRQUN6Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLFFBQVFBLEdBQUdBLEdBQUdBLEdBQUdBLFFBQVFBLENBQUNBO1FBQzVCQSxDQUFDQTtRQUNEQSxJQUFJQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUN4Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6QkEsT0FBT0EsR0FBR0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FB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QSxDQUFDQTtRQUM3RUEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDTEEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1Byb21pc2UsIFByb21pc2VXcmFwcGVyLCBFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TWFwLCBTdHJpbmdNYXBXcmFwcGVyLCBNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNCbGFuaywgaXNTdHJpbmcsIGlzUHJlc2VudCwgVHlwZSwgaXNBcnJheX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtSb3V0ZVJlZ2lzdHJ5LCBST1VURVJfUFJJTUFSWV9DT01QT05FTlR9IGZyb20gJy4vcm91dGVfcmVnaXN0cnknO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gIEluc3RydWN0aW9uLFxufSBmcm9tICcuL2luc3RydWN0aW9uJztcbmltcG9ydCB7Um91dGVyT3V0bGV0fSBmcm9tICcuL3JvdXRlcl9vdXRsZXQnO1xuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnLi9sb2NhdGlvbic7XG5pbXBvcnQge2dldENhbkFjdGl2YXRlSG9va30gZnJvbSAnLi9yb3V0ZV9saWZlY3ljbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7Um91dGVEZWZpbml0aW9ufSBmcm9tICcuL3JvdXRlX2NvbmZpZ19pbXBsJztcblxubGV0IF9yZXNvbHZlVG9UcnVlID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0cnVlKTtcbmxldCBfcmVzb2x2ZVRvRmFsc2UgPSBQcm9taXNlV3JhcHBlci5yZXNvbHZlKGZhbHNlKTtcblxuLyoqXG4gKiBUaGUgYFJvdXRlcmAgaXMgcmVzcG9uc2libGUgZm9yIG1hcHBpbmcgVVJMcyB0byBjb21wb25lbnRzLlxuICpcbiAqIFlvdSBjYW4gc2VlIHRoZSBzdGF0ZSBvZiB0aGUgcm91dGVyIGJ5IGluc3BlY3RpbmcgdGhlIHJlYWQtb25seSBmaWVsZCBgcm91dGVyLm5hdmlnYXRpbmdgLlxuICogVGhpcyBtYXkgYmUgdXNlZnVsIGZvciBzaG93aW5nIGEgc3Bpbm5lciwgZm9yIGluc3RhbmNlLlxuICpcbiAqICMjIENvbmNlcHRzXG4gKlxuICogUm91dGVycyBhbmQgY29tcG9uZW50IGluc3RhbmNlcyBoYXZlIGEgMToxIGNvcnJlc3BvbmRlbmNlLlxuICpcbiAqIFRoZSByb3V0ZXIgaG9sZHMgcmVmZXJlbmNlIHRvIGEgbnVtYmVyIG9mIHtAbGluayBSb3V0ZXJPdXRsZXR9LlxuICogQW4gb3V0bGV0IGlzIGEgcGxhY2Vob2xkZXIgdGhhdCB0aGUgcm91dGVyIGR5bmFtaWNhbGx5IGZpbGxzIGluIGRlcGVuZGluZyBvbiB0aGUgY3VycmVudCBVUkwuXG4gKlxuICogV2hlbiB0aGUgcm91dGVyIG5hdmlnYXRlcyBmcm9tIGEgVVJMLCBpdCBtdXN0IGZpcnN0IHJlY29nbml6ZSBpdCBhbmQgc2VyaWFsaXplIGl0IGludG8gYW5cbiAqIGBJbnN0cnVjdGlvbmAuXG4gKiBUaGUgcm91dGVyIHVzZXMgdGhlIGBSb3V0ZVJlZ2lzdHJ5YCB0byBnZXQgYW4gYEluc3RydWN0aW9uYC5cbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlciB7XG4gIG5hdmlnYXRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgbGFzdE5hdmlnYXRpb25BdHRlbXB0OiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBfY3VycmVudEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfY3VycmVudE5hdmlnYXRpb246IFByb21pc2U8YW55PiA9IF9yZXNvbHZlVG9UcnVlO1xuICBwcml2YXRlIF9vdXRsZXQ6IFJvdXRlck91dGxldCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfYXV4Um91dGVycyA9IG5ldyBNYXA8c3RyaW5nLCBSb3V0ZXI+KCk7XG4gIHByaXZhdGUgX2NoaWxkUm91dGVyOiBSb3V0ZXI7XG5cbiAgcHJpdmF0ZSBfc3ViamVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVnaXN0cnk6IFJvdXRlUmVnaXN0cnksIHB1YmxpYyBwYXJlbnQ6IFJvdXRlciwgcHVibGljIGhvc3RDb21wb25lbnQ6IGFueSkge31cblxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgY2hpbGQgcm91dGVyLiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZVxuICAgKiBjb21wb25lbnQuXG4gICAqL1xuICBjaGlsZFJvdXRlcihob3N0Q29tcG9uZW50OiBhbnkpOiBSb3V0ZXIge1xuICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlciA9IG5ldyBDaGlsZFJvdXRlcih0aGlzLCBob3N0Q29tcG9uZW50KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBjaGlsZCByb3V0ZXIuIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlXG4gICAqIGNvbXBvbmVudC5cbiAgICovXG4gIGF1eFJvdXRlcihob3N0Q29tcG9uZW50OiBhbnkpOiBSb3V0ZXIgeyByZXR1cm4gbmV3IENoaWxkUm91dGVyKHRoaXMsIGhvc3RDb21wb25lbnQpOyB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGFuIG91dGxldCB0byBub3RpZmllZCBvZiBwcmltYXJ5IHJvdXRlIGNoYW5nZXMuXG4gICAqXG4gICAqIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlIGNvbXBvbmVudC5cbiAgICovXG4gIHJlZ2lzdGVyUHJpbWFyeU91dGxldChvdXRsZXQ6IFJvdXRlck91dGxldCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChpc1ByZXNlbnQob3V0bGV0Lm5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgcmVnaXN0ZXJQcmltYXJ5T3V0bGV0IGV4cGVjdHMgdG8gYmUgY2FsbGVkIHdpdGggYW4gdW5uYW1lZCBvdXRsZXQuYCk7XG4gICAgfVxuXG4gICAgdGhpcy5fb3V0bGV0ID0gb3V0bGV0O1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tbWl0KHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbiwgZmFsc2UpO1xuICAgIH1cbiAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gb3V0bGV0IHRvIG5vdGlmaWVkIG9mIGF1eGlsaWFyeSByb3V0ZSBjaGFuZ2VzLlxuICAgKlxuICAgKiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZSBjb21wb25lbnQuXG4gICAqL1xuICByZWdpc3RlckF1eE91dGxldChvdXRsZXQ6IFJvdXRlck91dGxldCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHZhciBvdXRsZXROYW1lID0gb3V0bGV0Lm5hbWU7XG4gICAgaWYgKGlzQmxhbmsob3V0bGV0TmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGByZWdpc3RlckF1eE91dGxldCBleHBlY3RzIHRvIGJlIGNhbGxlZCB3aXRoIGFuIG91dGxldCB3aXRoIGEgbmFtZS5gKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPLi4uXG4gICAgLy8gd2hhdCBpcyB0aGUgaG9zdCBvZiBhbiBhdXggcm91dGU/Pz9cbiAgICB2YXIgcm91dGVyID0gdGhpcy5hdXhSb3V0ZXIodGhpcy5ob3N0Q29tcG9uZW50KTtcblxuICAgIHRoaXMuX2F1eFJvdXRlcnMuc2V0KG91dGxldE5hbWUsIHJvdXRlcik7XG4gICAgcm91dGVyLl9vdXRsZXQgPSBvdXRsZXQ7XG5cbiAgICB2YXIgYXV4SW5zdHJ1Y3Rpb247XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24pICYmXG4gICAgICAgIGlzUHJlc2VudChhdXhJbnN0cnVjdGlvbiA9IHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbltvdXRsZXROYW1lXSkpIHtcbiAgICAgIHJldHVybiByb3V0ZXIuY29tbWl0KGF1eEluc3RydWN0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYW4gaW5zdHJ1Y3Rpb24sIHJldHVybnMgYHRydWVgIGlmIHRoZSBpbnN0cnVjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLFxuICAgKiBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICovXG4gIGlzUm91dGVBY3RpdmUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogYm9vbGVhbiB7XG4gICAgdmFyIHJvdXRlciA9IHRoaXM7XG4gICAgd2hpbGUgKGlzUHJlc2VudChyb3V0ZXIucGFyZW50KSAmJiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgICByb3V0ZXIgPSByb3V0ZXIucGFyZW50O1xuICAgICAgaW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jaGlsZDtcbiAgICB9XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24pICYmXG4gICAgICAgICAgIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQgPT0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICB9XG5cblxuICAvKipcbiAgICogRHluYW1pY2FsbHkgdXBkYXRlIHRoZSByb3V0aW5nIGNvbmZpZ3VyYXRpb24gYW5kIHRyaWdnZXIgYSBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiAjIyMgVXNhZ2VcbiAgICpcbiAgICogYGBgXG4gICAqIHJvdXRlci5jb25maWcoW1xuICAgKiAgIHsgJ3BhdGgnOiAnLycsICdjb21wb25lbnQnOiBJbmRleENvbXAgfSxcbiAgICogICB7ICdwYXRoJzogJy91c2VyLzppZCcsICdjb21wb25lbnQnOiBVc2VyQ29tcCB9LFxuICAgKiBdKTtcbiAgICogYGBgXG4gICAqL1xuICBjb25maWcoZGVmaW5pdGlvbnM6IFJvdXRlRGVmaW5pdGlvbltdKTogUHJvbWlzZTxhbnk+IHtcbiAgICBkZWZpbml0aW9ucy5mb3JFYWNoKFxuICAgICAgICAocm91dGVEZWZpbml0aW9uKSA9PiB7IHRoaXMucmVnaXN0cnkuY29uZmlnKHRoaXMuaG9zdENvbXBvbmVudCwgcm91dGVEZWZpbml0aW9uKTsgfSk7XG4gICAgcmV0dXJuIHRoaXMucmVuYXZpZ2F0ZSgpO1xuICB9XG5cblxuICAvKipcbiAgICogTmF2aWdhdGUgYmFzZWQgb24gdGhlIHByb3ZpZGVkIFJvdXRlIExpbmsgRFNMLiBJdCdzIHByZWZlcnJlZCB0byBuYXZpZ2F0ZSB3aXRoIHRoaXMgbWV0aG9kXG4gICAqIG92ZXIgYG5hdmlnYXRlQnlVcmxgLlxuICAgKlxuICAgKiAjIyMgVXNhZ2VcbiAgICpcbiAgICogVGhpcyBtZXRob2QgdGFrZXMgYW4gYXJyYXkgcmVwcmVzZW50aW5nIHRoZSBSb3V0ZSBMaW5rIERTTDpcbiAgICogYGBgXG4gICAqIFsnLi9NeUNtcCcsIHtwYXJhbTogM31dXG4gICAqIGBgYFxuICAgKiBTZWUgdGhlIHtAbGluayBSb3V0ZXJMaW5rfSBkaXJlY3RpdmUgZm9yIG1vcmUuXG4gICAqL1xuICBuYXZpZ2F0ZShsaW5rUGFyYW1zOiBhbnlbXSk6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIGluc3RydWN0aW9uID0gdGhpcy5nZW5lcmF0ZShsaW5rUGFyYW1zKTtcbiAgICByZXR1cm4gdGhpcy5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24sIGZhbHNlKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlIHRvIGEgVVJMLiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gbmF2aWdhdGlvbiBpcyBjb21wbGV0ZS5cbiAgICogSXQncyBwcmVmZXJyZWQgdG8gbmF2aWdhdGUgd2l0aCBgbmF2aWdhdGVgIGluc3RlYWQgb2YgdGhpcyBtZXRob2QsIHNpbmNlIFVSTHMgYXJlIG1vcmUgYnJpdHRsZS5cbiAgICpcbiAgICogSWYgdGhlIGdpdmVuIFVSTCBiZWdpbnMgd2l0aCBhIGAvYCwgcm91dGVyIHdpbGwgbmF2aWdhdGUgYWJzb2x1dGVseS5cbiAgICogSWYgdGhlIGdpdmVuIFVSTCBkb2VzIG5vdCBiZWdpbiB3aXRoIGAvYCwgdGhlIHJvdXRlciB3aWxsIG5hdmlnYXRlIHJlbGF0aXZlIHRvIHRoaXMgY29tcG9uZW50LlxuICAgKi9cbiAgbmF2aWdhdGVCeVVybCh1cmw6IHN0cmluZywgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudE5hdmlnYXRpb24gPSB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbi50aGVuKChfKSA9PiB7XG4gICAgICB0aGlzLmxhc3ROYXZpZ2F0aW9uQXR0ZW1wdCA9IHVybDtcbiAgICAgIHRoaXMuX3N0YXJ0TmF2aWdhdGluZygpO1xuICAgICAgcmV0dXJuIHRoaXMuX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmcodGhpcy5yZWNvZ25pemUodXJsKS50aGVuKChpbnN0cnVjdGlvbikgPT4ge1xuICAgICAgICBpZiAoaXNCbGFuayhpbnN0cnVjdGlvbikpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX25hdmlnYXRlKGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKTtcbiAgICAgIH0pKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlIHZpYSB0aGUgcHJvdmlkZWQgaW5zdHJ1Y3Rpb24uIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBuYXZpZ2F0aW9uIGlzXG4gICAqIGNvbXBsZXRlLlxuICAgKi9cbiAgbmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKGlzQmxhbmsoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb0ZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY3VycmVudE5hdmlnYXRpb24gPSB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbi50aGVuKChfKSA9PiB7XG4gICAgICB0aGlzLl9zdGFydE5hdmlnYXRpbmcoKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZnRlclByb21pc2VGaW5pc2hOYXZpZ2F0aW5nKHRoaXMuX25hdmlnYXRlKGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9uYXZpZ2F0ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbilcbiAgICAgICAgLnRoZW4oKF8pID0+IHRoaXMuX2NhblJldXNlKGluc3RydWN0aW9uKSlcbiAgICAgICAgLnRoZW4oKF8pID0+IHRoaXMuX2NhbkFjdGl2YXRlKGluc3RydWN0aW9uKSlcbiAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLl9jYW5EZWFjdGl2YXRlKGluc3RydWN0aW9uKVxuICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tbWl0KGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKVxuICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbWl0TmF2aWdhdGlvbkZpbmlzaChpbnN0cnVjdGlvbi50b1Jvb3RVcmwoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3NldHRsZUluc3RydWN0aW9uKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGluc3RydWN0aW9uLnJlc29sdmVDb21wb25lbnQoKS50aGVuKChfKSA9PiB7XG4gICAgICBpbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2UgPSBmYWxzZTtcblxuICAgICAgdmFyIHVuc2V0dGxlZEluc3RydWN0aW9uczogQXJyYXk8UHJvbWlzZTxhbnk+PiA9IFtdO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgICB1bnNldHRsZWRJbnN0cnVjdGlvbnMucHVzaCh0aGlzLl9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbi5jaGlsZCkpO1xuICAgICAgfVxuXG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb24sIChpbnN0cnVjdGlvbiwgXykgPT4ge1xuICAgICAgICB1bnNldHRsZWRJbnN0cnVjdGlvbnMucHVzaCh0aGlzLl9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbikpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsKHVuc2V0dGxlZEluc3RydWN0aW9ucyk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9lbWl0TmF2aWdhdGlvbkZpbmlzaCh1cmwpOiB2b2lkIHsgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fc3ViamVjdCwgdXJsKTsgfVxuXG4gIHByaXZhdGUgX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmcocHJvbWlzZTogUHJvbWlzZTxhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuY2F0Y2hFcnJvcihwcm9taXNlLnRoZW4oKF8pID0+IHRoaXMuX2ZpbmlzaE5hdmlnYXRpbmcoKSksIChlcnIpID0+IHtcbiAgICAgIHRoaXMuX2ZpbmlzaE5hdmlnYXRpbmcoKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIFJlY3Vyc2l2ZWx5IHNldCByZXVzZSBmbGFnc1xuICAgKi9cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY2FuUmV1c2UoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb0ZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb3V0bGV0LmNhblJldXNlKGluc3RydWN0aW9uLmNvbXBvbmVudClcbiAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZSA9IHJlc3VsdDtcbiAgICAgICAgICBpZiAocmVzdWx0ICYmIGlzUHJlc2VudCh0aGlzLl9jaGlsZFJvdXRlcikgJiYgaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkUm91dGVyLl9jYW5SZXVzZShpbnN0cnVjdGlvbi5jaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NhbkFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gY2FuQWN0aXZhdGVPbmUobmV4dEluc3RydWN0aW9uLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FuRGVhY3RpdmF0ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gICAgfVxuICAgIHZhciBuZXh0OiBQcm9taXNlPGJvb2xlYW4+O1xuICAgIHZhciBjaGlsZEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgdmFyIHJldXNlOiBib29sZWFuID0gZmFsc2U7XG4gICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbikpIHtcbiAgICAgIGNoaWxkSW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jaGlsZDtcbiAgICAgIGNvbXBvbmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICAgICAgcmV1c2UgPSBpbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2U7XG4gICAgfVxuICAgIGlmIChyZXVzZSkge1xuICAgICAgbmV4dCA9IF9yZXNvbHZlVG9UcnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0ID0gdGhpcy5fb3V0bGV0LmNhbkRlYWN0aXZhdGUoY29tcG9uZW50SW5zdHJ1Y3Rpb24pO1xuICAgIH1cbiAgICAvLyBUT0RPOiBhdXggcm91dGUgbGlmZWN5Y2xlIGhvb2tzXG4gICAgcmV0dXJuIG5leHQudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICBpZiAocmVzdWx0ID09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlci5fY2FuRGVhY3RpdmF0ZShjaGlsZEluc3RydWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhpcyByb3V0ZXIgYW5kIGFsbCBkZXNjZW5kYW50IHJvdXRlcnMgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBpbnN0cnVjdGlvblxuICAgKi9cbiAgY29tbWl0KGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbjtcbiAgICB2YXIgbmV4dDogUHJvbWlzZTxhbnk+ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgICBpZiAoY29tcG9uZW50SW5zdHJ1Y3Rpb24ucmV1c2UpIHtcbiAgICAgICAgbmV4dCA9IHRoaXMuX291dGxldC5yZXVzZShjb21wb25lbnRJbnN0cnVjdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0ID1cbiAgICAgICAgICAgIHRoaXMuZGVhY3RpdmF0ZShpbnN0cnVjdGlvbikudGhlbigoXykgPT4gdGhpcy5fb3V0bGV0LmFjdGl2YXRlKGNvbXBvbmVudEluc3RydWN0aW9uKSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgICBuZXh0ID0gbmV4dC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jaGlsZFJvdXRlcikpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlci5jb21taXQoaW5zdHJ1Y3Rpb24uY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2VzID0gW107XG4gICAgdGhpcy5fYXV4Um91dGVycy5mb3JFYWNoKChyb3V0ZXIsIG5hbWUpID0+IHtcbiAgICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb25bbmFtZV0pKSB7XG4gICAgICAgIHByb21pc2VzLnB1c2gocm91dGVyLmNvbW1pdChpbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbltuYW1lXSkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5leHQudGhlbigoXykgPT4gUHJvbWlzZVdyYXBwZXIuYWxsKHByb21pc2VzKSk7XG4gIH1cblxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0YXJ0TmF2aWdhdGluZygpOiB2b2lkIHsgdGhpcy5uYXZpZ2F0aW5nID0gdHJ1ZTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2ZpbmlzaE5hdmlnYXRpbmcoKTogdm9pZCB7IHRoaXMubmF2aWdhdGluZyA9IGZhbHNlOyB9XG5cblxuICAvKipcbiAgICogU3Vic2NyaWJlIHRvIFVSTCB1cGRhdGVzIGZyb20gdGhlIHJvdXRlclxuICAgKi9cbiAgc3Vic2NyaWJlKG9uTmV4dDogKHZhbHVlOiBhbnkpID0+IHZvaWQpOiBPYmplY3Qge1xuICAgIHJldHVybiBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fc3ViamVjdCwgb25OZXh0KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGNvbnRlbnRzIG9mIHRoaXMgcm91dGVyJ3Mgb3V0bGV0IGFuZCBhbGwgZGVzY2VuZGFudCBvdXRsZXRzXG4gICAqL1xuICBkZWFjdGl2YXRlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIGNoaWxkSW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gbnVsbDtcbiAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uID0gbnVsbDtcbiAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uKSkge1xuICAgICAgY2hpbGRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNoaWxkO1xuICAgICAgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgfVxuICAgIHZhciBuZXh0OiBQcm9taXNlPGFueT4gPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSkge1xuICAgICAgbmV4dCA9IHRoaXMuX2NoaWxkUm91dGVyLmRlYWN0aXZhdGUoY2hpbGRJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fb3V0bGV0KSkge1xuICAgICAgbmV4dCA9IG5leHQudGhlbigoXykgPT4gdGhpcy5fb3V0bGV0LmRlYWN0aXZhdGUoY29tcG9uZW50SW5zdHJ1Y3Rpb24pKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBoYW5kbGUgYXV4IHJvdXRlc1xuXG4gICAgcmV0dXJuIG5leHQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFVSTCwgcmV0dXJucyBhbiBpbnN0cnVjdGlvbiByZXByZXNlbnRpbmcgdGhlIGNvbXBvbmVudCBncmFwaFxuICAgKi9cbiAgcmVjb2duaXplKHVybDogc3RyaW5nKTogUHJvbWlzZTxJbnN0cnVjdGlvbj4ge1xuICAgIHZhciBhbmNlc3RvckNvbXBvbmVudHMgPSB0aGlzLl9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJ5LnJlY29nbml6ZSh1cmwsIGFuY2VzdG9yQ29tcG9uZW50cyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRBbmNlc3Rvckluc3RydWN0aW9ucygpOiBJbnN0cnVjdGlvbltdIHtcbiAgICB2YXIgYW5jZXN0b3JDb21wb25lbnRzID0gW107XG4gICAgdmFyIGFuY2VzdG9yUm91dGVyID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGFuY2VzdG9yUm91dGVyLnBhcmVudCkgJiZcbiAgICAgICAgICAgaXNQcmVzZW50KGFuY2VzdG9yUm91dGVyLnBhcmVudC5fY3VycmVudEluc3RydWN0aW9uKSkge1xuICAgICAgYW5jZXN0b3JSb3V0ZXIgPSBhbmNlc3RvclJvdXRlci5wYXJlbnQ7XG4gICAgICBhbmNlc3RvckNvbXBvbmVudHMudW5zaGlmdChhbmNlc3RvclJvdXRlci5fY3VycmVudEluc3RydWN0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYW5jZXN0b3JDb21wb25lbnRzO1xuICB9XG5cblxuICAvKipcbiAgICogTmF2aWdhdGVzIHRvIGVpdGhlciB0aGUgbGFzdCBVUkwgc3VjY2Vzc2Z1bGx5IG5hdmlnYXRlZCB0bywgb3IgdGhlIGxhc3QgVVJMIHJlcXVlc3RlZCBpZiB0aGVcbiAgICogcm91dGVyIGhhcyB5ZXQgdG8gc3VjY2Vzc2Z1bGx5IG5hdmlnYXRlLlxuICAgKi9cbiAgcmVuYXZpZ2F0ZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMubGFzdE5hdmlnYXRpb25BdHRlbXB0KSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5uYXZpZ2F0ZUJ5VXJsKHRoaXMubGFzdE5hdmlnYXRpb25BdHRlbXB0KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgVVJMIGZyb20gYSBjb21wb25lbnQgbmFtZSBhbmQgb3B0aW9uYWwgbWFwIG9mIHBhcmFtZXRlcnMuIFRoZSBVUkwgaXMgcmVsYXRpdmUgdG8gdGhlXG4gICAqIGFwcCdzIGJhc2UgaHJlZi5cbiAgICovXG4gIGdlbmVyYXRlKGxpbmtQYXJhbXM6IGFueVtdKTogSW5zdHJ1Y3Rpb24ge1xuICAgIHZhciBhbmNlc3Rvckluc3RydWN0aW9ucyA9IHRoaXMuX2dldEFuY2VzdG9ySW5zdHJ1Y3Rpb25zKCk7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cnkuZ2VuZXJhdGUobGlua1BhcmFtcywgYW5jZXN0b3JJbnN0cnVjdGlvbnMpO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb290Um91dGVyIGV4dGVuZHMgUm91dGVyIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9jYXRpb246IExvY2F0aW9uO1xuICAvKiogQGludGVybmFsICovXG4gIF9sb2NhdGlvblN1YjogT2JqZWN0O1xuXG4gIGNvbnN0cnVjdG9yKHJlZ2lzdHJ5OiBSb3V0ZVJlZ2lzdHJ5LCBsb2NhdGlvbjogTG9jYXRpb24sXG4gICAgICAgICAgICAgIEBJbmplY3QoUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UKSBwcmltYXJ5Q29tcG9uZW50OiBUeXBlKSB7XG4gICAgc3VwZXIocmVnaXN0cnksIG51bGwsIHByaW1hcnlDb21wb25lbnQpO1xuICAgIHRoaXMuX2xvY2F0aW9uID0gbG9jYXRpb247XG4gICAgdGhpcy5fbG9jYXRpb25TdWIgPSB0aGlzLl9sb2NhdGlvbi5zdWJzY3JpYmUoXG4gICAgICAgIChjaGFuZ2UpID0+IHRoaXMubmF2aWdhdGVCeVVybChjaGFuZ2VbJ3VybCddLCBpc1ByZXNlbnQoY2hhbmdlWydwb3AnXSkpKTtcbiAgICB0aGlzLnJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQocHJpbWFyeUNvbXBvbmVudCk7XG4gICAgdGhpcy5uYXZpZ2F0ZUJ5VXJsKGxvY2F0aW9uLnBhdGgoKSk7XG4gIH1cblxuICBjb21taXQoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBlbWl0UGF0aCA9IGluc3RydWN0aW9uLnRvVXJsUGF0aCgpO1xuICAgIHZhciBlbWl0UXVlcnkgPSBpbnN0cnVjdGlvbi50b1VybFF1ZXJ5KCk7XG4gICAgaWYgKGVtaXRQYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgIGVtaXRQYXRoID0gJy8nICsgZW1pdFBhdGg7XG4gICAgfVxuICAgIHZhciBwcm9taXNlID0gc3VwZXIuY29tbWl0KGluc3RydWN0aW9uKTtcbiAgICBpZiAoIV9za2lwTG9jYXRpb25DaGFuZ2UpIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oKF8pID0+IHsgdGhpcy5fbG9jYXRpb24uZ28oZW1pdFBhdGgsIGVtaXRRdWVyeSk7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9sb2NhdGlvblN1YikpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5fbG9jYXRpb25TdWIpO1xuICAgICAgdGhpcy5fbG9jYXRpb25TdWIgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDaGlsZFJvdXRlciBleHRlbmRzIFJvdXRlciB7XG4gIGNvbnN0cnVjdG9yKHBhcmVudDogUm91dGVyLCBob3N0Q29tcG9uZW50KSB7XG4gICAgc3VwZXIocGFyZW50LnJlZ2lzdHJ5LCBwYXJlbnQsIGhvc3RDb21wb25lbnQpO1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICB9XG5cblxuICBuYXZpZ2F0ZUJ5VXJsKHVybDogc3RyaW5nLCBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIERlbGVnYXRlIG5hdmlnYXRpb24gdG8gdGhlIHJvb3Qgcm91dGVyXG4gICAgcmV0dXJuIHRoaXMucGFyZW50Lm5hdmlnYXRlQnlVcmwodXJsLCBfc2tpcExvY2F0aW9uQ2hhbmdlKTtcbiAgfVxuXG4gIG5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIERlbGVnYXRlIG5hdmlnYXRpb24gdG8gdGhlIHJvb3Qgcm91dGVyXG4gICAgcmV0dXJuIHRoaXMucGFyZW50Lm5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBjYW5BY3RpdmF0ZU9uZShuZXh0SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldkluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB2YXIgbmV4dCA9IF9yZXNvbHZlVG9UcnVlO1xuICBpZiAoaXNQcmVzZW50KG5leHRJbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICBuZXh0ID0gY2FuQWN0aXZhdGVPbmUobmV4dEluc3RydWN0aW9uLmNoaWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpc1ByZXNlbnQocHJldkluc3RydWN0aW9uKSA/IHByZXZJbnN0cnVjdGlvbi5jaGlsZCA6IG51bGwpO1xuICB9XG4gIHJldHVybiBuZXh0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgIGlmIChyZXN1bHQgPT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2UpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YXIgaG9vayA9IGdldENhbkFjdGl2YXRlSG9vayhuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50LmNvbXBvbmVudFR5cGUpO1xuICAgIGlmIChpc1ByZXNlbnQoaG9vaykpIHtcbiAgICAgIHJldHVybiBob29rKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICBpc1ByZXNlbnQocHJldkluc3RydWN0aW9uKSA/IHByZXZJbnN0cnVjdGlvbi5jb21wb25lbnQgOiBudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuIl19