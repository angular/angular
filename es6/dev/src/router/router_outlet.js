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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvcm91dGVyX291dGxldC50cyJdLCJuYW1lcyI6WyJSb3V0ZXJPdXRsZXQiLCJSb3V0ZXJPdXRsZXQuY29uc3RydWN0b3IiLCJSb3V0ZXJPdXRsZXQuYWN0aXZhdGUiLCJSb3V0ZXJPdXRsZXQucmV1c2UiLCJSb3V0ZXJPdXRsZXQuZGVhY3RpdmF0ZSIsIlJvdXRlck91dGxldC5yb3V0ZXJDYW5EZWFjdGl2YXRlIiwiUm91dGVyT3V0bGV0LnJvdXRlckNhblJldXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFVLGNBQWMsRUFBQyxNQUFNLDJCQUEyQjtPQUMxRCxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3hELEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUNwRCxFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FFdkUsRUFDTCxTQUFTLEVBQ1QsU0FBUyxFQUNULHNCQUFzQixFQUV0QixVQUFVLEVBQ1YsUUFBUSxFQUNSLE9BQU8sRUFFUixNQUFNLGVBQWU7T0FFZixLQUFLLFNBQVMsTUFBTSxVQUFVO09BQzlCLEVBQXVCLFdBQVcsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlO09BQ25FLEtBQUssT0FBTyxNQUFNLHlCQUF5QjtPQUMzQyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sNkJBQTZCO0FBRzVELElBQUksY0FBYyxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFbEQ7Ozs7Ozs7O0dBUUc7QUFDSDtJQU1FQSxZQUFvQkEsV0FBdUJBLEVBQVVBLE9BQStCQSxFQUNoRUEsYUFBK0JBLEVBQXFCQSxRQUFnQkE7UUFEcEVDLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFZQTtRQUFVQSxZQUFPQSxHQUFQQSxPQUFPQSxDQUF3QkE7UUFDaEVBLGtCQUFhQSxHQUFiQSxh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Y0FBY0EsQ0FBQ0EsZUFBZUEsRUFBRUEsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQTtRQUMxRUEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsR0FBR0EsZUFBZUEsSUFBSUEsSUFBSUEsQ0FBQ0EsbUJBQW1CQTtnQkFDM0NBLENBQUNBLFNBQVNBLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7b0JBQy9FQSxnQkFBZ0JBLENBQUNBLE1BQU1BLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDOUZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQ3hDQSxDQUFDQTtBQUNITixDQUFDQTtBQTlIRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUMsQ0FBQztJQU9nQixXQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQTs7aUJBdUh4RTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBBdHRyaWJ1dGUsXG4gIER5bmFtaWNDb21wb25lbnRMb2FkZXIsXG4gIENvbXBvbmVudFJlZixcbiAgRWxlbWVudFJlZixcbiAgSW5qZWN0b3IsXG4gIHByb3ZpZGUsXG4gIERlcGVuZGVuY3lcbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCAqIGFzIHJvdXRlck1vZCBmcm9tICcuL3JvdXRlcic7XG5pbXBvcnQge0NvbXBvbmVudEluc3RydWN0aW9uLCBSb3V0ZVBhcmFtcywgUm91dGVEYXRhfSBmcm9tICcuL2luc3RydWN0aW9uJztcbmltcG9ydCAqIGFzIGhvb2tNb2QgZnJvbSAnLi9saWZlY3ljbGVfYW5ub3RhdGlvbnMnO1xuaW1wb3J0IHtoYXNMaWZlY3ljbGVIb29rfSBmcm9tICcuL3JvdXRlX2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtPbkFjdGl2YXRlLCBDYW5SZXVzZSwgT25SZXVzZSwgT25EZWFjdGl2YXRlLCBDYW5EZWFjdGl2YXRlfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5sZXQgX3Jlc29sdmVUb1RydWUgPSBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRydWUpO1xuXG4vKipcbiAqIEEgcm91dGVyIG91dGxldCBpcyBhIHBsYWNlaG9sZGVyIHRoYXQgQW5ndWxhciBkeW5hbWljYWxseSBmaWxscyBiYXNlZCBvbiB0aGUgYXBwbGljYXRpb24ncyByb3V0ZS5cbiAqXG4gKiAjIyBVc2VcbiAqXG4gKiBgYGBcbiAqIDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD5cbiAqIGBgYFxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ3JvdXRlci1vdXRsZXQnfSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJPdXRsZXQge1xuICBuYW1lOiBzdHJpbmcgPSBudWxsO1xuICBwcml2YXRlIF9jb21wb25lbnRSZWY6IENvbXBvbmVudFJlZiA9IG51bGw7XG4gIHByaXZhdGUgX2N1cnJlbnRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHByaXZhdGUgX2xvYWRlcjogRHluYW1pY0NvbXBvbmVudExvYWRlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfcGFyZW50Um91dGVyOiByb3V0ZXJNb2QuUm91dGVyLCBAQXR0cmlidXRlKCduYW1lJykgbmFtZUF0dHI6IHN0cmluZykge1xuICAgIGlmIChpc1ByZXNlbnQobmFtZUF0dHIpKSB7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lQXR0cjtcbiAgICAgIHRoaXMuX3BhcmVudFJvdXRlci5yZWdpc3RlckF1eE91dGxldCh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcGFyZW50Um91dGVyLnJlZ2lzdGVyUHJpbWFyeU91dGxldCh0aGlzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSBSb3V0ZXIgdG8gaW5zdGFudGlhdGUgYSBuZXcgY29tcG9uZW50IGR1cmluZyB0aGUgY29tbWl0IHBoYXNlIG9mIGEgbmF2aWdhdGlvbi5cbiAgICogVGhpcyBtZXRob2QgaW4gdHVybiBpcyByZXNwb25zaWJsZSBmb3IgY2FsbGluZyB0aGUgYHJvdXRlck9uQWN0aXZhdGVgIGhvb2sgb2YgaXRzIGNoaWxkLlxuICAgKi9cbiAgYWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIHByZXZpb3VzSW5zdHJ1Y3Rpb24gPSB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb247XG4gICAgdGhpcy5fY3VycmVudEluc3RydWN0aW9uID0gbmV4dEluc3RydWN0aW9uO1xuICAgIHZhciBjb21wb25lbnRUeXBlID0gbmV4dEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGU7XG4gICAgdmFyIGNoaWxkUm91dGVyID0gdGhpcy5fcGFyZW50Um91dGVyLmNoaWxkUm91dGVyKGNvbXBvbmVudFR5cGUpO1xuXG4gICAgdmFyIHByb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoW1xuICAgICAgcHJvdmlkZShSb3V0ZURhdGEsIHt1c2VWYWx1ZTogbmV4dEluc3RydWN0aW9uLnJvdXRlRGF0YX0pLFxuICAgICAgcHJvdmlkZShSb3V0ZVBhcmFtcywge3VzZVZhbHVlOiBuZXcgUm91dGVQYXJhbXMobmV4dEluc3RydWN0aW9uLnBhcmFtcyl9KSxcbiAgICAgIHByb3ZpZGUocm91dGVyTW9kLlJvdXRlciwge3VzZVZhbHVlOiBjaGlsZFJvdXRlcn0pXG4gICAgXSk7XG4gICAgcmV0dXJuIHRoaXMuX2xvYWRlci5sb2FkTmV4dFRvTG9jYXRpb24oY29tcG9uZW50VHlwZSwgdGhpcy5fZWxlbWVudFJlZiwgcHJvdmlkZXJzKVxuICAgICAgICAudGhlbigoY29tcG9uZW50UmVmKSA9PiB7XG4gICAgICAgICAgdGhpcy5fY29tcG9uZW50UmVmID0gY29tcG9uZW50UmVmO1xuICAgICAgICAgIGlmIChoYXNMaWZlY3ljbGVIb29rKGhvb2tNb2Qucm91dGVyT25BY3RpdmF0ZSwgY29tcG9uZW50VHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoPE9uQWN0aXZhdGU+dGhpcy5fY29tcG9uZW50UmVmLmluc3RhbmNlKVxuICAgICAgICAgICAgICAgIC5yb3V0ZXJPbkFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgcHJldmlvdXNJbnN0cnVjdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGR1cmluZyB0aGUgY29tbWl0IHBoYXNlIG9mIGEgbmF2aWdhdGlvbiB3aGVuIGFuIG91dGxldFxuICAgKiByZXVzZXMgYSBjb21wb25lbnQgYmV0d2VlbiBkaWZmZXJlbnQgcm91dGVzLlxuICAgKiBUaGlzIG1ldGhvZCBpbiB0dXJuIGlzIHJlc3BvbnNpYmxlIGZvciBjYWxsaW5nIHRoZSBgcm91dGVyT25SZXVzZWAgaG9vayBvZiBpdHMgY2hpbGQuXG4gICAqL1xuICByZXVzZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgcHJldmlvdXNJbnN0cnVjdGlvbiA9IHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbjtcbiAgICB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24gPSBuZXh0SW5zdHJ1Y3Rpb247XG5cbiAgICBpZiAoaXNCbGFuayh0aGlzLl9jb21wb25lbnRSZWYpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2Fubm90IHJldXNlIGFuIG91dGxldCB0aGF0IGRvZXMgbm90IGNvbnRhaW4gYSBjb21wb25lbnQuYCk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKFxuICAgICAgICBoYXNMaWZlY3ljbGVIb29rKGhvb2tNb2Qucm91dGVyT25SZXVzZSwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpID9cbiAgICAgICAgICAgICg8T25SZXVzZT50aGlzLl9jb21wb25lbnRSZWYuaW5zdGFuY2UpXG4gICAgICAgICAgICAgICAgLnJvdXRlck9uUmV1c2UobmV4dEluc3RydWN0aW9uLCBwcmV2aW91c0luc3RydWN0aW9uKSA6XG4gICAgICAgICAgICB0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IHdoZW4gYW4gb3V0bGV0IGRpc3Bvc2VzIG9mIGEgY29tcG9uZW50J3MgY29udGVudHMuXG4gICAqIFRoaXMgbWV0aG9kIGluIHR1cm4gaXMgcmVzcG9uc2libGUgZm9yIGNhbGxpbmcgdGhlIGByb3V0ZXJPbkRlYWN0aXZhdGVgIGhvb2sgb2YgaXRzIGNoaWxkLlxuICAgKi9cbiAgZGVhY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgbmV4dCA9IF9yZXNvbHZlVG9UcnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY29tcG9uZW50UmVmKSAmJiBpc1ByZXNlbnQodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSAmJlxuICAgICAgICBoYXNMaWZlY3ljbGVIb29rKGhvb2tNb2Qucm91dGVyT25EZWFjdGl2YXRlLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIG5leHQgPSBQcm9taXNlV3JhcHBlci5yZXNvbHZlKFxuICAgICAgICAgICg8T25EZWFjdGl2YXRlPnRoaXMuX2NvbXBvbmVudFJlZi5pbnN0YW5jZSlcbiAgICAgICAgICAgICAgLnJvdXRlck9uRGVhY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb24sIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV4dC50aGVuKChfKSA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NvbXBvbmVudFJlZikpIHtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50UmVmLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fY29tcG9uZW50UmVmID0gbnVsbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGR1cmluZyByZWNvZ25pdGlvbiBwaGFzZSBvZiBhIG5hdmlnYXRpb24uXG4gICAqXG4gICAqIElmIHRoaXMgcmVzb2x2ZXMgdG8gYGZhbHNlYCwgdGhlIGdpdmVuIG5hdmlnYXRpb24gaXMgY2FuY2VsbGVkLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBkZWxlZ2F0ZXMgdG8gdGhlIGNoaWxkIGNvbXBvbmVudCdzIGByb3V0ZXJDYW5EZWFjdGl2YXRlYCBob29rIGlmIGl0IGV4aXN0cyxcbiAgICogYW5kIG90aGVyd2lzZSByZXNvbHZlcyB0byB0cnVlLlxuICAgKi9cbiAgcm91dGVyQ2FuRGVhY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICAgIH1cbiAgICBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlckNhbkRlYWN0aXZhdGUsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSkge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUoXG4gICAgICAgICAgKDxDYW5EZWFjdGl2YXRlPnRoaXMuX2NvbXBvbmVudFJlZi5pbnN0YW5jZSlcbiAgICAgICAgICAgICAgLnJvdXRlckNhbkRlYWN0aXZhdGUobmV4dEluc3RydWN0aW9uLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24pKTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXNvbHZlVG9UcnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSB0aGUge0BsaW5rIFJvdXRlcn0gZHVyaW5nIHJlY29nbml0aW9uIHBoYXNlIG9mIGEgbmF2aWdhdGlvbi5cbiAgICpcbiAgICogSWYgdGhlIG5ldyBjaGlsZCBjb21wb25lbnQgaGFzIGEgZGlmZmVyZW50IFR5cGUgdGhhbiB0aGUgZXhpc3RpbmcgY2hpbGQgY29tcG9uZW50LFxuICAgKiB0aGlzIHdpbGwgcmVzb2x2ZSB0byBgZmFsc2VgLiBZb3UgY2FuJ3QgcmV1c2UgYW4gb2xkIGNvbXBvbmVudCB3aGVuIHRoZSBuZXcgY29tcG9uZW50XG4gICAqIGlzIG9mIGEgZGlmZmVyZW50IFR5cGUuXG4gICAqXG4gICAqIE90aGVyd2lzZSwgdGhpcyBtZXRob2QgZGVsZWdhdGVzIHRvIHRoZSBjaGlsZCBjb21wb25lbnQncyBgcm91dGVyQ2FuUmV1c2VgIGhvb2sgaWYgaXQgZXhpc3RzLFxuICAgKiBvciByZXNvbHZlcyB0byB0cnVlIGlmIHRoZSBob29rIGlzIG5vdCBwcmVzZW50LlxuICAgKi9cbiAgcm91dGVyQ2FuUmV1c2UobmV4dEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHZhciByZXN1bHQ7XG5cbiAgICBpZiAoaXNCbGFuayh0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24pIHx8XG4gICAgICAgIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlICE9IG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSB7XG4gICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGhhc0xpZmVjeWNsZUhvb2soaG9va01vZC5yb3V0ZXJDYW5SZXVzZSwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICByZXN1bHQgPSAoPENhblJldXNlPnRoaXMuX2NvbXBvbmVudFJlZi5pbnN0YW5jZSlcbiAgICAgICAgICAgICAgICAgICAucm91dGVyQ2FuUmV1c2UobmV4dEluc3RydWN0aW9uLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBuZXh0SW5zdHJ1Y3Rpb24gPT0gdGhpcy5fY3VycmVudEluc3RydWN0aW9uIHx8XG4gICAgICAgICAgICAgICAoaXNQcmVzZW50KG5leHRJbnN0cnVjdGlvbi5wYXJhbXMpICYmIGlzUHJlc2VudCh0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24ucGFyYW1zKSAmJlxuICAgICAgICAgICAgICAgIFN0cmluZ01hcFdyYXBwZXIuZXF1YWxzKG5leHRJbnN0cnVjdGlvbi5wYXJhbXMsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5wYXJhbXMpKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUocmVzdWx0KTtcbiAgfVxufVxuIl19