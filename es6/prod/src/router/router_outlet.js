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
import { PromiseWrapper } from 'angular2/src/facade/async';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { isBlank, isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Directive, Attribute, DynamicComponentLoader, ElementRef, Injector, provide } from 'angular2/core';
import * as routerMod from './router';
import { RouteParams, RouteData } from './instruction';
import * as hookMod from './lifecycle_annotations';
import { hasLifecycleHook } from './route_lifecycle_reflector';
let _resolveToTrue = PromiseWrapper.resolve(true);
/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Use
 *
 * ```
 * <router-outlet></router-outlet>
 * ```
 */
export let RouterOutlet = class {
    constructor(_elementRef, _loader, _parentRouter, nameAttr) {
        this._elementRef = _elementRef;
        this._loader = _loader;
        this._parentRouter = _parentRouter;
        this.name = null;
        this._componentRef = null;
        this._currentInstruction = null;
        if (isPresent(nameAttr)) {
            this.name = nameAttr;
            this._parentRouter.registerAuxOutlet(this);
        }
        else {
            this._parentRouter.registerPrimaryOutlet(this);
        }
    }
    /**
     * Called by the Router to instantiate a new component during the commit phase of a navigation.
     * This method in turn is responsible for calling the `routerOnActivate` hook of its child.
     */
    activate(nextInstruction) {
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = nextInstruction;
        var componentType = nextInstruction.componentType;
        var childRouter = this._parentRouter.childRouter(componentType);
        var providers = Injector.resolve([
            provide(RouteData, { useValue: nextInstruction.routeData }),
            provide(RouteParams, { useValue: new RouteParams(nextInstruction.params) }),
            provide(routerMod.Router, { useValue: childRouter })
        ]);
        return this._loader.loadNextToLocation(componentType, this._elementRef, providers)
            .then((componentRef) => {
            this._componentRef = componentRef;
            if (hasLifecycleHook(hookMod.routerOnActivate, componentType)) {
                return this._componentRef.instance
                    .routerOnActivate(nextInstruction, previousInstruction);
            }
        });
    }
    /**
     * Called by the {@link Router} during the commit phase of a navigation when an outlet
     * reuses a component between different routes.
     * This method in turn is responsible for calling the `routerOnReuse` hook of its child.
     */
    reuse(nextInstruction) {
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = nextInstruction;
        if (isBlank(this._componentRef)) {
            throw new BaseException(`Cannot reuse an outlet that does not contain a component.`);
        }
        return PromiseWrapper.resolve(hasLifecycleHook(hookMod.routerOnReuse, this._currentInstruction.componentType) ?
            this._componentRef.instance
                .routerOnReuse(nextInstruction, previousInstruction) :
            true);
    }
    /**
     * Called by the {@link Router} when an outlet disposes of a component's contents.
     * This method in turn is responsible for calling the `routerOnDeactivate` hook of its child.
     */
    deactivate(nextInstruction) {
        var next = _resolveToTrue;
        if (isPresent(this._componentRef) && isPresent(this._currentInstruction) &&
            hasLifecycleHook(hookMod.routerOnDeactivate, this._currentInstruction.componentType)) {
            next = PromiseWrapper.resolve(this._componentRef.instance
                .routerOnDeactivate(nextInstruction, this._currentInstruction));
        }
        return next.then((_) => {
            if (isPresent(this._componentRef)) {
                this._componentRef.dispose();
                this._componentRef = null;
            }
        });
    }
    /**
     * Called by the {@link Router} during recognition phase of a navigation.
     *
     * If this resolves to `false`, the given navigation is cancelled.
     *
     * This method delegates to the child component's `routerCanDeactivate` hook if it exists,
     * and otherwise resolves to true.
     */
    routerCanDeactivate(nextInstruction) {
        if (isBlank(this._currentInstruction)) {
            return _resolveToTrue;
        }
        if (hasLifecycleHook(hookMod.routerCanDeactivate, this._currentInstruction.componentType)) {
            return PromiseWrapper.resolve(this._componentRef.instance
                .routerCanDeactivate(nextInstruction, this._currentInstruction));
        }
        return _resolveToTrue;
    }
    /**
     * Called by the {@link Router} during recognition phase of a navigation.
     *
     * If the new child component has a different Type than the existing child component,
     * this will resolve to `false`. You can't reuse an old component when the new component
     * is of a different Type.
     *
     * Otherwise, this method delegates to the child component's `routerCanReuse` hook if it exists,
     * or resolves to true if the hook is not present.
     */
    routerCanReuse(nextInstruction) {
        var result;
        if (isBlank(this._currentInstruction) ||
            this._currentInstruction.componentType != nextInstruction.componentType) {
            result = false;
        }
        else if (hasLifecycleHook(hookMod.routerCanReuse, this._currentInstruction.componentType)) {
            result = this._componentRef.instance
                .routerCanReuse(nextInstruction, this._currentInstruction);
        }
        else {
            result = nextInstruction == this._currentInstruction ||
                (isPresent(nextInstruction.params) && isPresent(this._currentInstruction.params) &&
                    StringMapWrapper.equals(nextInstruction.params, this._currentInstruction.params));
        }
        return PromiseWrapper.resolve(result);
    }
};
RouterOutlet = __decorate([
    Directive({ selector: 'router-outlet' }),
    __param(3, Attribute('name')), 
    __metadata('design:paramtypes', [ElementRef, DynamicComponentLoader, routerMod.Router, String])
], RouterOutlet);
