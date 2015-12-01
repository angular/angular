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
     * This method in turn is responsible for calling the `onActivate` hook of its child.
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
            if (hasLifecycleHook(hookMod.onActivate, componentType)) {
                return this._componentRef.instance.onActivate(nextInstruction, previousInstruction);
            }
        });
    }
    /**
     * Called by the {@link Router} during the commit phase of a navigation when an outlet
     * reuses a component between different routes.
     * This method in turn is responsible for calling the `onReuse` hook of its child.
     */
    reuse(nextInstruction) {
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = nextInstruction;
        if (isBlank(this._componentRef)) {
            throw new BaseException(`Cannot reuse an outlet that does not contain a component.`);
        }
        return PromiseWrapper.resolve(hasLifecycleHook(hookMod.onReuse, this._currentInstruction.componentType) ?
            this._componentRef.instance.onReuse(nextInstruction, previousInstruction) :
            true);
    }
    /**
     * Called by the {@link Router} when an outlet disposes of a component's contents.
     * This method in turn is responsible for calling the `onDeactivate` hook of its child.
     */
    deactivate(nextInstruction) {
        var next = _resolveToTrue;
        if (isPresent(this._componentRef) && isPresent(this._currentInstruction) &&
            hasLifecycleHook(hookMod.onDeactivate, this._currentInstruction.componentType)) {
            next = PromiseWrapper.resolve(this._componentRef.instance.onDeactivate(nextInstruction, this._currentInstruction));
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
     * This method delegates to the child component's `canDeactivate` hook if it exists,
     * and otherwise resolves to true.
     */
    canDeactivate(nextInstruction) {
        if (isBlank(this._currentInstruction)) {
            return _resolveToTrue;
        }
        if (hasLifecycleHook(hookMod.canDeactivate, this._currentInstruction.componentType)) {
            return PromiseWrapper.resolve(this._componentRef.instance.canDeactivate(nextInstruction, this._currentInstruction));
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
     * Otherwise, this method delegates to the child component's `canReuse` hook if it exists,
     * or resolves to true if the hook is not present.
     */
    canReuse(nextInstruction) {
        var result;
        if (isBlank(this._currentInstruction) ||
            this._currentInstruction.componentType != nextInstruction.componentType) {
            result = false;
        }
        else if (hasLifecycleHook(hookMod.canReuse, this._currentInstruction.componentType)) {
            result = this._componentRef.instance.canReuse(nextInstruction, this._currentInstruction);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvcm91dGVyX291dGxldC50cyJdLCJuYW1lcyI6WyJSb3V0ZXJPdXRsZXQiLCJSb3V0ZXJPdXRsZXQuY29uc3RydWN0b3IiLCJSb3V0ZXJPdXRsZXQuYWN0aXZhdGUiLCJSb3V0ZXJPdXRsZXQucmV1c2UiLCJSb3V0ZXJPdXRsZXQuZGVhY3RpdmF0ZSIsIlJvdXRlck91dGxldC5jYW5EZWFjdGl2YXRlIiwiUm91dGVyT3V0bGV0LmNhblJldXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztPQUFPLEVBQVUsY0FBYyxFQUFDLE1BQU0sMkJBQTJCO09BQzFELEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDeEQsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFDLE1BQU0sMEJBQTBCO09BQ3BELEVBQUMsYUFBYSxFQUFtQixNQUFNLGdDQUFnQztPQUV2RSxFQUNMLFNBQVMsRUFDVCxTQUFTLEVBQ1Qsc0JBQXNCLEVBRXRCLFVBQVUsRUFDVixRQUFRLEVBQ1IsT0FBTyxFQUVSLE1BQU0sZUFBZTtPQUVmLEtBQUssU0FBUyxNQUFNLFVBQVU7T0FDOUIsRUFBdUIsV0FBVyxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWU7T0FDbkUsS0FBSyxPQUFPLE1BQU0seUJBQXlCO09BQzNDLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw2QkFBNkI7QUFFNUQsSUFBSSxjQUFjLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUVsRDs7Ozs7Ozs7R0FRRztBQUNIO0lBTUVBLFlBQW9CQSxXQUF1QkEsRUFBVUEsT0FBK0JBLEVBQ2hFQSxhQUErQkEsRUFBcUJBLFFBQWdCQTtRQURwRUMsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVlBO1FBQVVBLFlBQU9BLEdBQVBBLE9BQU9BLENBQXdCQTtRQUNoRUEsa0JBQWFBLEdBQWJBLGFBQWFBLENBQWtC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QUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0E7UUFDM0ZBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLEdBQUdBLGVBQWVBLElBQUlBLElBQUlBLENBQUNBLG1CQUFtQkE7Z0JBQzNDQSxDQUFDQSxTQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLE1BQU1BLENBQUNBO29CQUMvRUEsZ0JBQWdCQSxDQUFDQSxNQUFNQSxDQUFDQSxlQUFlQSxDQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1FBQzlGQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUN4Q0EsQ0FBQ0E7QUFDSE4sQ0FBQ0E7QUF6SEQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsZUFBZSxFQUFDLENBQUM7SUFPZ0IsV0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7O2lCQWtIeEU7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtpc0JsYW5rLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgQXR0cmlidXRlLFxuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICBDb21wb25lbnRSZWYsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdG9yLFxuICBwcm92aWRlLFxuICBEZXBlbmRlbmN5XG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyByb3V0ZXJNb2QgZnJvbSAnLi9yb3V0ZXInO1xuaW1wb3J0IHtDb21wb25lbnRJbnN0cnVjdGlvbiwgUm91dGVQYXJhbXMsIFJvdXRlRGF0YX0gZnJvbSAnLi9pbnN0cnVjdGlvbic7XG5pbXBvcnQgKiBhcyBob29rTW9kIGZyb20gJy4vbGlmZWN5Y2xlX2Fubm90YXRpb25zJztcbmltcG9ydCB7aGFzTGlmZWN5Y2xlSG9va30gZnJvbSAnLi9yb3V0ZV9saWZlY3ljbGVfcmVmbGVjdG9yJztcblxubGV0IF9yZXNvbHZlVG9UcnVlID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0cnVlKTtcblxuLyoqXG4gKiBBIHJvdXRlciBvdXRsZXQgaXMgYSBwbGFjZWhvbGRlciB0aGF0IEFuZ3VsYXIgZHluYW1pY2FsbHkgZmlsbHMgYmFzZWQgb24gdGhlIGFwcGxpY2F0aW9uJ3Mgcm91dGUuXG4gKlxuICogIyMgVXNlXG4gKlxuICogYGBgXG4gKiA8cm91dGVyLW91dGxldD48L3JvdXRlci1vdXRsZXQ+XG4gKiBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdyb3V0ZXItb3V0bGV0J30pXG5leHBvcnQgY2xhc3MgUm91dGVyT3V0bGV0IHtcbiAgbmFtZTogc3RyaW5nID0gbnVsbDtcbiAgcHJpdmF0ZSBfY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWYgPSBudWxsO1xuICBwcml2YXRlIF9jdXJyZW50SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLCBwcml2YXRlIF9sb2FkZXI6IER5bmFtaWNDb21wb25lbnRMb2FkZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3BhcmVudFJvdXRlcjogcm91dGVyTW9kLlJvdXRlciwgQEF0dHJpYnV0ZSgnbmFtZScpIG5hbWVBdHRyOiBzdHJpbmcpIHtcbiAgICBpZiAoaXNQcmVzZW50KG5hbWVBdHRyKSkge1xuICAgICAgdGhpcy5uYW1lID0gbmFtZUF0dHI7XG4gICAgICB0aGlzLl9wYXJlbnRSb3V0ZXIucmVnaXN0ZXJBdXhPdXRsZXQodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BhcmVudFJvdXRlci5yZWdpc3RlclByaW1hcnlPdXRsZXQodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSB0aGUgUm91dGVyIHRvIGluc3RhbnRpYXRlIGEgbmV3IGNvbXBvbmVudCBkdXJpbmcgdGhlIGNvbW1pdCBwaGFzZSBvZiBhIG5hdmlnYXRpb24uXG4gICAqIFRoaXMgbWV0aG9kIGluIHR1cm4gaXMgcmVzcG9uc2libGUgZm9yIGNhbGxpbmcgdGhlIGBvbkFjdGl2YXRlYCBob29rIG9mIGl0cyBjaGlsZC5cbiAgICovXG4gIGFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBwcmV2aW91c0luc3RydWN0aW9uID0gdGhpcy5fY3VycmVudEluc3RydWN0aW9uO1xuICAgIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbiA9IG5leHRJbnN0cnVjdGlvbjtcbiAgICB2YXIgY29tcG9uZW50VHlwZSA9IG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlO1xuICAgIHZhciBjaGlsZFJvdXRlciA9IHRoaXMuX3BhcmVudFJvdXRlci5jaGlsZFJvdXRlcihjb21wb25lbnRUeXBlKTtcblxuICAgIHZhciBwcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKFtcbiAgICAgIHByb3ZpZGUoUm91dGVEYXRhLCB7dXNlVmFsdWU6IG5leHRJbnN0cnVjdGlvbi5yb3V0ZURhdGF9KSxcbiAgICAgIHByb3ZpZGUoUm91dGVQYXJhbXMsIHt1c2VWYWx1ZTogbmV3IFJvdXRlUGFyYW1zKG5leHRJbnN0cnVjdGlvbi5wYXJhbXMpfSksXG4gICAgICBwcm92aWRlKHJvdXRlck1vZC5Sb3V0ZXIsIHt1c2VWYWx1ZTogY2hpbGRSb3V0ZXJ9KVxuICAgIF0pO1xuICAgIHJldHVybiB0aGlzLl9sb2FkZXIubG9hZE5leHRUb0xvY2F0aW9uKGNvbXBvbmVudFR5cGUsIHRoaXMuX2VsZW1lbnRSZWYsIHByb3ZpZGVycylcbiAgICAgICAgLnRoZW4oKGNvbXBvbmVudFJlZikgPT4ge1xuICAgICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IGNvbXBvbmVudFJlZjtcbiAgICAgICAgICBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLm9uQWN0aXZhdGUsIGNvbXBvbmVudFR5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29tcG9uZW50UmVmLmluc3RhbmNlLm9uQWN0aXZhdGUobmV4dEluc3RydWN0aW9uLCBwcmV2aW91c0luc3RydWN0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSB0aGUge0BsaW5rIFJvdXRlcn0gZHVyaW5nIHRoZSBjb21taXQgcGhhc2Ugb2YgYSBuYXZpZ2F0aW9uIHdoZW4gYW4gb3V0bGV0XG4gICAqIHJldXNlcyBhIGNvbXBvbmVudCBiZXR3ZWVuIGRpZmZlcmVudCByb3V0ZXMuXG4gICAqIFRoaXMgbWV0aG9kIGluIHR1cm4gaXMgcmVzcG9uc2libGUgZm9yIGNhbGxpbmcgdGhlIGBvblJldXNlYCBob29rIG9mIGl0cyBjaGlsZC5cbiAgICovXG4gIHJldXNlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBwcmV2aW91c0luc3RydWN0aW9uID0gdGhpcy5fY3VycmVudEluc3RydWN0aW9uO1xuICAgIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbiA9IG5leHRJbnN0cnVjdGlvbjtcblxuICAgIGlmIChpc0JsYW5rKHRoaXMuX2NvbXBvbmVudFJlZikpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgcmV1c2UgYW4gb3V0bGV0IHRoYXQgZG9lcyBub3QgY29udGFpbiBhIGNvbXBvbmVudC5gKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUoXG4gICAgICAgIGhhc0xpZmVjeWNsZUhvb2soaG9va01vZC5vblJldXNlLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkgP1xuICAgICAgICAgICAgdGhpcy5fY29tcG9uZW50UmVmLmluc3RhbmNlLm9uUmV1c2UobmV4dEluc3RydWN0aW9uLCBwcmV2aW91c0luc3RydWN0aW9uKSA6XG4gICAgICAgICAgICB0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IHdoZW4gYW4gb3V0bGV0IGRpc3Bvc2VzIG9mIGEgY29tcG9uZW50J3MgY29udGVudHMuXG4gICAqIFRoaXMgbWV0aG9kIGluIHR1cm4gaXMgcmVzcG9uc2libGUgZm9yIGNhbGxpbmcgdGhlIGBvbkRlYWN0aXZhdGVgIGhvb2sgb2YgaXRzIGNoaWxkLlxuICAgKi9cbiAgZGVhY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgbmV4dCA9IF9yZXNvbHZlVG9UcnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY29tcG9uZW50UmVmKSAmJiBpc1ByZXNlbnQodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSAmJlxuICAgICAgICBoYXNMaWZlY3ljbGVIb29rKGhvb2tNb2Qub25EZWFjdGl2YXRlLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIG5leHQgPSBQcm9taXNlV3JhcHBlci5yZXNvbHZlKFxuICAgICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZi5pbnN0YW5jZS5vbkRlYWN0aXZhdGUobmV4dEluc3RydWN0aW9uLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24pKTtcbiAgICB9XG4gICAgcmV0dXJuIG5leHQudGhlbigoXykgPT4ge1xuICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jb21wb25lbnRSZWYpKSB7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZi5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSBkdXJpbmcgcmVjb2duaXRpb24gcGhhc2Ugb2YgYSBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiBJZiB0aGlzIHJlc29sdmVzIHRvIGBmYWxzZWAsIHRoZSBnaXZlbiBuYXZpZ2F0aW9uIGlzIGNhbmNlbGxlZC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgZGVsZWdhdGVzIHRvIHRoZSBjaGlsZCBjb21wb25lbnQncyBgY2FuRGVhY3RpdmF0ZWAgaG9vayBpZiBpdCBleGlzdHMsXG4gICAqIGFuZCBvdGhlcndpc2UgcmVzb2x2ZXMgdG8gdHJ1ZS5cbiAgICovXG4gIGNhbkRlYWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9XG4gICAgaWYgKGhhc0xpZmVjeWNsZUhvb2soaG9va01vZC5jYW5EZWFjdGl2YXRlLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKFxuICAgICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZi5pbnN0YW5jZS5jYW5EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGR1cmluZyByZWNvZ25pdGlvbiBwaGFzZSBvZiBhIG5hdmlnYXRpb24uXG4gICAqXG4gICAqIElmIHRoZSBuZXcgY2hpbGQgY29tcG9uZW50IGhhcyBhIGRpZmZlcmVudCBUeXBlIHRoYW4gdGhlIGV4aXN0aW5nIGNoaWxkIGNvbXBvbmVudCxcbiAgICogdGhpcyB3aWxsIHJlc29sdmUgdG8gYGZhbHNlYC4gWW91IGNhbid0IHJldXNlIGFuIG9sZCBjb21wb25lbnQgd2hlbiB0aGUgbmV3IGNvbXBvbmVudFxuICAgKiBpcyBvZiBhIGRpZmZlcmVudCBUeXBlLlxuICAgKlxuICAgKiBPdGhlcndpc2UsIHRoaXMgbWV0aG9kIGRlbGVnYXRlcyB0byB0aGUgY2hpbGQgY29tcG9uZW50J3MgYGNhblJldXNlYCBob29rIGlmIGl0IGV4aXN0cyxcbiAgICogb3IgcmVzb2x2ZXMgdG8gdHJ1ZSBpZiB0aGUgaG9vayBpcyBub3QgcHJlc2VudC5cbiAgICovXG4gIGNhblJldXNlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB2YXIgcmVzdWx0O1xuXG4gICAgaWYgKGlzQmxhbmsodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSB8fFxuICAgICAgICB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSAhPSBuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkge1xuICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChoYXNMaWZlY3ljbGVIb29rKGhvb2tNb2QuY2FuUmV1c2UsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fY29tcG9uZW50UmVmLmluc3RhbmNlLmNhblJldXNlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gbmV4dEluc3RydWN0aW9uID09IHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbiB8fFxuICAgICAgICAgICAgICAgKGlzUHJlc2VudChuZXh0SW5zdHJ1Y3Rpb24ucGFyYW1zKSAmJiBpc1ByZXNlbnQodGhpcy5fY3VycmVudEluc3RydWN0aW9uLnBhcmFtcykgJiZcbiAgICAgICAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmVxdWFscyhuZXh0SW5zdHJ1Y3Rpb24ucGFyYW1zLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24ucGFyYW1zKSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHJlc3VsdCk7XG4gIH1cbn1cbiJdfQ==