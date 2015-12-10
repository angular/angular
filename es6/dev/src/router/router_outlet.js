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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvcm91dGVyX291dGxldC50cyJdLCJuYW1lcyI6WyJSb3V0ZXJPdXRsZXQiLCJSb3V0ZXJPdXRsZXQuY29uc3RydWN0b3IiLCJSb3V0ZXJPdXRsZXQuYWN0aXZhdGUiLCJSb3V0ZXJPdXRsZXQucmV1c2UiLCJSb3V0ZXJPdXRsZXQuZGVhY3RpdmF0ZSIsIlJvdXRlck91dGxldC5yb3V0ZXJDYW5EZWFjdGl2YXRlIiwiUm91dGVyT3V0bGV0LnJvdXRlckNhblJldXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztPQUFPLEVBQVUsY0FBYyxFQUFDLE1BQU0sMkJBQTJCO09BQzFELEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDeEQsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFDLE1BQU0sMEJBQTBCO09BQ3BELEVBQUMsYUFBYSxFQUFtQixNQUFNLGdDQUFnQztPQUV2RSxFQUNMLFNBQVMsRUFDVCxTQUFTLEVBQ1Qsc0JBQXNCLEVBRXRCLFVBQVUsRUFDVixRQUFRLEVBQ1IsT0FBTyxFQUVSLE1BQU0sZUFBZTtPQUVmLEtBQUssU0FBUyxNQUFNLFVBQVU7T0FDOUIsRUFBdUIsV0FBVyxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWU7T0FDbkUsS0FBSyxPQUFPLE1BQU0seUJBQXlCO09BQzNDLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw2QkFBNkI7QUFHNUQsSUFBSSxjQUFjLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUVsRDs7Ozs7Ozs7R0FRRztBQUNIO0lBTUVBLFlBQW9CQSxXQUF1QkEsRUFBVUEsT0FBK0JBLEVBQ2hFQSxhQUErQkEsRUFBcUJBLFFBQWdCQTtRQURwRUMsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVlBO1FBQVVBLFlBQU9BLEdBQVBBLE9BQU9BLENBQXdCQTtRQUNoRUEsa0JBQWFBLEdBQWJB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QUFDQSxlQUFxQ0E7UUFDdkRLLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdENBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBO1FBQ3hCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE9BQU9BLENBQUNBLG1CQUFtQkEsRUFBRUEsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxRkEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsT0FBT0EsQ0FDVEEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsUUFBU0E7aUJBQ3ZDQSxtQkFBbUJBLENBQUNBLGVBQWVBLEVBQUVBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0VBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBO0lBQ3hCQSxDQUFDQTtJQUVETDs7Ozs7Ozs7O09BU0dBO0lBQ0hBLGNBQWNBLENBQUNBLGVBQXFDQTtRQUNsRE0sSUFBSUEsTUFBTUEsQ0FBQ0E7UUFFWEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQTtZQUNqQ0EsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxhQUFhQSxJQUFJQSxlQUFlQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1RUEsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDakJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsY0FBY0EsRUFBRUEsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1RkEsTUFBTUEsR0FBY0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsUUFBU0E7aUJBQ2xDQSxjQUFjQSxDQUFDQSxlQUFlQSxFQUFFQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBO1FBQzFFQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxHQUFHQSxlQUFlQSxJQUFJQSxJQUFJQSxDQUFDQSxtQkFBbUJBO2dCQUMzQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxNQUFNQSxDQUFDQTtvQkFDL0VBLGdCQUFnQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM5RkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDeENBLENBQUNBO0FBQ0hOLENBQUNBO0FBOUhEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGVBQWUsRUFBQyxDQUFDO0lBT2dCLFdBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBOztpQkF1SHhFO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1Byb21pc2UsIFByb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEF0dHJpYnV0ZSxcbiAgRHluYW1pY0NvbXBvbmVudExvYWRlcixcbiAgQ29tcG9uZW50UmVmLFxuICBFbGVtZW50UmVmLFxuICBJbmplY3RvcixcbiAgcHJvdmlkZSxcbiAgRGVwZW5kZW5jeVxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0ICogYXMgcm91dGVyTW9kIGZyb20gJy4vcm91dGVyJztcbmltcG9ydCB7Q29tcG9uZW50SW5zdHJ1Y3Rpb24sIFJvdXRlUGFyYW1zLCBSb3V0ZURhdGF9IGZyb20gJy4vaW5zdHJ1Y3Rpb24nO1xuaW1wb3J0ICogYXMgaG9va01vZCBmcm9tICcuL2xpZmVjeWNsZV9hbm5vdGF0aW9ucyc7XG5pbXBvcnQge2hhc0xpZmVjeWNsZUhvb2t9IGZyb20gJy4vcm91dGVfbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge09uQWN0aXZhdGUsIENhblJldXNlLCBPblJldXNlLCBPbkRlYWN0aXZhdGUsIENhbkRlYWN0aXZhdGV9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmxldCBfcmVzb2x2ZVRvVHJ1ZSA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUodHJ1ZSk7XG5cbi8qKlxuICogQSByb3V0ZXIgb3V0bGV0IGlzIGEgcGxhY2Vob2xkZXIgdGhhdCBBbmd1bGFyIGR5bmFtaWNhbGx5IGZpbGxzIGJhc2VkIG9uIHRoZSBhcHBsaWNhdGlvbidzIHJvdXRlLlxuICpcbiAqICMjIFVzZVxuICpcbiAqIGBgYFxuICogPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PlxuICogYGBgXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAncm91dGVyLW91dGxldCd9KVxuZXhwb3J0IGNsYXNzIFJvdXRlck91dGxldCB7XG4gIG5hbWU6IHN0cmluZyA9IG51bGw7XG4gIHByaXZhdGUgX2NvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmID0gbnVsbDtcbiAgcHJpdmF0ZSBfY3VycmVudEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbiA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZiwgcHJpdmF0ZSBfbG9hZGVyOiBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF9wYXJlbnRSb3V0ZXI6IHJvdXRlck1vZC5Sb3V0ZXIsIEBBdHRyaWJ1dGUoJ25hbWUnKSBuYW1lQXR0cjogc3RyaW5nKSB7XG4gICAgaWYgKGlzUHJlc2VudChuYW1lQXR0cikpIHtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWVBdHRyO1xuICAgICAgdGhpcy5fcGFyZW50Um91dGVyLnJlZ2lzdGVyQXV4T3V0bGV0KHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wYXJlbnRSb3V0ZXIucmVnaXN0ZXJQcmltYXJ5T3V0bGV0KHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIFJvdXRlciB0byBpbnN0YW50aWF0ZSBhIG5ldyBjb21wb25lbnQgZHVyaW5nIHRoZSBjb21taXQgcGhhc2Ugb2YgYSBuYXZpZ2F0aW9uLlxuICAgKiBUaGlzIG1ldGhvZCBpbiB0dXJuIGlzIHJlc3BvbnNpYmxlIGZvciBjYWxsaW5nIHRoZSBgcm91dGVyT25BY3RpdmF0ZWAgaG9vayBvZiBpdHMgY2hpbGQuXG4gICAqL1xuICBhY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgcHJldmlvdXNJbnN0cnVjdGlvbiA9IHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbjtcbiAgICB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gPSBuZXh0SW5zdHJ1Y3Rpb247XG4gICAgdmFyIGNvbXBvbmVudFR5cGUgPSBuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZTtcbiAgICB2YXIgY2hpbGRSb3V0ZXIgPSB0aGlzLl9wYXJlbnRSb3V0ZXIuY2hpbGRSb3V0ZXIoY29tcG9uZW50VHlwZSk7XG5cbiAgICB2YXIgcHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShbXG4gICAgICBwcm92aWRlKFJvdXRlRGF0YSwge3VzZVZhbHVlOiBuZXh0SW5zdHJ1Y3Rpb24ucm91dGVEYXRhfSksXG4gICAgICBwcm92aWRlKFJvdXRlUGFyYW1zLCB7dXNlVmFsdWU6IG5ldyBSb3V0ZVBhcmFtcyhuZXh0SW5zdHJ1Y3Rpb24ucGFyYW1zKX0pLFxuICAgICAgcHJvdmlkZShyb3V0ZXJNb2QuUm91dGVyLCB7dXNlVmFsdWU6IGNoaWxkUm91dGVyfSlcbiAgICBdKTtcbiAgICByZXR1cm4gdGhpcy5fbG9hZGVyLmxvYWROZXh0VG9Mb2NhdGlvbihjb21wb25lbnRUeXBlLCB0aGlzLl9lbGVtZW50UmVmLCBwcm92aWRlcnMpXG4gICAgICAgIC50aGVuKChjb21wb25lbnRSZWYpID0+IHtcbiAgICAgICAgICB0aGlzLl9jb21wb25lbnRSZWYgPSBjb21wb25lbnRSZWY7XG4gICAgICAgICAgaWYgKGhhc0xpZmVjeWNsZUhvb2soaG9va01vZC5yb3V0ZXJPbkFjdGl2YXRlLCBjb21wb25lbnRUeXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuICg8T25BY3RpdmF0ZT50aGlzLl9jb21wb25lbnRSZWYuaW5zdGFuY2UpXG4gICAgICAgICAgICAgICAgLnJvdXRlck9uQWN0aXZhdGUobmV4dEluc3RydWN0aW9uLCBwcmV2aW91c0luc3RydWN0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSB0aGUge0BsaW5rIFJvdXRlcn0gZHVyaW5nIHRoZSBjb21taXQgcGhhc2Ugb2YgYSBuYXZpZ2F0aW9uIHdoZW4gYW4gb3V0bGV0XG4gICAqIHJldXNlcyBhIGNvbXBvbmVudCBiZXR3ZWVuIGRpZmZlcmVudCByb3V0ZXMuXG4gICAqIFRoaXMgbWV0aG9kIGluIHR1cm4gaXMgcmVzcG9uc2libGUgZm9yIGNhbGxpbmcgdGhlIGByb3V0ZXJPblJldXNlYCBob29rIG9mIGl0cyBjaGlsZC5cbiAgICovXG4gIHJldXNlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBwcmV2aW91c0luc3RydWN0aW9uID0gdGhpcy5fY3VycmVudEluc3RydWN0aW9uO1xuICAgIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbiA9IG5leHRJbnN0cnVjdGlvbjtcblxuICAgIGlmIChpc0JsYW5rKHRoaXMuX2NvbXBvbmVudFJlZikpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgcmV1c2UgYW4gb3V0bGV0IHRoYXQgZG9lcyBub3QgY29udGFpbiBhIGNvbXBvbmVudC5gKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUoXG4gICAgICAgIGhhc0xpZmVjeWNsZUhvb2soaG9va01vZC5yb3V0ZXJPblJldXNlLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkgP1xuICAgICAgICAgICAgKDxPblJldXNlPnRoaXMuX2NvbXBvbmVudFJlZi5pbnN0YW5jZSlcbiAgICAgICAgICAgICAgICAucm91dGVyT25SZXVzZShuZXh0SW5zdHJ1Y3Rpb24sIHByZXZpb3VzSW5zdHJ1Y3Rpb24pIDpcbiAgICAgICAgICAgIHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSB0aGUge0BsaW5rIFJvdXRlcn0gd2hlbiBhbiBvdXRsZXQgZGlzcG9zZXMgb2YgYSBjb21wb25lbnQncyBjb250ZW50cy5cbiAgICogVGhpcyBtZXRob2QgaW4gdHVybiBpcyByZXNwb25zaWJsZSBmb3IgY2FsbGluZyB0aGUgYHJvdXRlck9uRGVhY3RpdmF0ZWAgaG9vayBvZiBpdHMgY2hpbGQuXG4gICAqL1xuICBkZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBuZXh0ID0gX3Jlc29sdmVUb1RydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jb21wb25lbnRSZWYpICYmIGlzUHJlc2VudCh0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24pICYmXG4gICAgICAgIGhhc0xpZmVjeWNsZUhvb2soaG9va01vZC5yb3V0ZXJPbkRlYWN0aXZhdGUsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSkge1xuICAgICAgbmV4dCA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUoXG4gICAgICAgICAgKDxPbkRlYWN0aXZhdGU+dGhpcy5fY29tcG9uZW50UmVmLmluc3RhbmNlKVxuICAgICAgICAgICAgICAucm91dGVyT25EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXh0LnRoZW4oKF8pID0+IHtcbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY29tcG9uZW50UmVmKSkge1xuICAgICAgICB0aGlzLl9jb21wb25lbnRSZWYuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9jb21wb25lbnRSZWYgPSBudWxsO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSB0aGUge0BsaW5rIFJvdXRlcn0gZHVyaW5nIHJlY29nbml0aW9uIHBoYXNlIG9mIGEgbmF2aWdhdGlvbi5cbiAgICpcbiAgICogSWYgdGhpcyByZXNvbHZlcyB0byBgZmFsc2VgLCB0aGUgZ2l2ZW4gbmF2aWdhdGlvbiBpcyBjYW5jZWxsZWQuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGRlbGVnYXRlcyB0byB0aGUgY2hpbGQgY29tcG9uZW50J3MgYHJvdXRlckNhbkRlYWN0aXZhdGVgIGhvb2sgaWYgaXQgZXhpc3RzLFxuICAgKiBhbmQgb3RoZXJ3aXNlIHJlc29sdmVzIHRvIHRydWUuXG4gICAqL1xuICByb3V0ZXJDYW5EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24pKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gICAgfVxuICAgIGlmIChoYXNMaWZlY3ljbGVIb29rKGhvb2tNb2Qucm91dGVyQ2FuRGVhY3RpdmF0ZSwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShcbiAgICAgICAgICAoPENhbkRlYWN0aXZhdGU+dGhpcy5fY29tcG9uZW50UmVmLmluc3RhbmNlKVxuICAgICAgICAgICAgICAucm91dGVyQ2FuRGVhY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb24sIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikpO1xuICAgIH1cbiAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSBkdXJpbmcgcmVjb2duaXRpb24gcGhhc2Ugb2YgYSBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiBJZiB0aGUgbmV3IGNoaWxkIGNvbXBvbmVudCBoYXMgYSBkaWZmZXJlbnQgVHlwZSB0aGFuIHRoZSBleGlzdGluZyBjaGlsZCBjb21wb25lbnQsXG4gICAqIHRoaXMgd2lsbCByZXNvbHZlIHRvIGBmYWxzZWAuIFlvdSBjYW4ndCByZXVzZSBhbiBvbGQgY29tcG9uZW50IHdoZW4gdGhlIG5ldyBjb21wb25lbnRcbiAgICogaXMgb2YgYSBkaWZmZXJlbnQgVHlwZS5cbiAgICpcbiAgICogT3RoZXJ3aXNlLCB0aGlzIG1ldGhvZCBkZWxlZ2F0ZXMgdG8gdGhlIGNoaWxkIGNvbXBvbmVudCdzIGByb3V0ZXJDYW5SZXVzZWAgaG9vayBpZiBpdCBleGlzdHMsXG4gICAqIG9yIHJlc29sdmVzIHRvIHRydWUgaWYgdGhlIGhvb2sgaXMgbm90IHByZXNlbnQuXG4gICAqL1xuICByb3V0ZXJDYW5SZXVzZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIGlmIChpc0JsYW5rKHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikgfHxcbiAgICAgICAgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUgIT0gbmV4dEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpIHtcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlckNhblJldXNlLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIHJlc3VsdCA9ICg8Q2FuUmV1c2U+dGhpcy5fY29tcG9uZW50UmVmLmluc3RhbmNlKVxuICAgICAgICAgICAgICAgICAgIC5yb3V0ZXJDYW5SZXVzZShuZXh0SW5zdHJ1Y3Rpb24sIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IG5leHRJbnN0cnVjdGlvbiA9PSB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gfHxcbiAgICAgICAgICAgICAgIChpc1ByZXNlbnQobmV4dEluc3RydWN0aW9uLnBhcmFtcykgJiYgaXNQcmVzZW50KHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5wYXJhbXMpICYmXG4gICAgICAgICAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5lcXVhbHMobmV4dEluc3RydWN0aW9uLnBhcmFtcywgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLnBhcmFtcykpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShyZXN1bHQpO1xuICB9XG59XG4iXX0=