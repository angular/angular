'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var core_1 = require('angular2/core');
var routerMod = require('./router');
var instruction_1 = require('./instruction');
var hookMod = require('./lifecycle_annotations');
var route_lifecycle_reflector_1 = require('./route_lifecycle_reflector');
var _resolveToTrue = async_1.PromiseWrapper.resolve(true);
/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Use
 *
 * ```
 * <router-outlet></router-outlet>
 * ```
 */
var RouterOutlet = (function () {
    function RouterOutlet(_elementRef, _loader, _parentRouter, nameAttr) {
        this._elementRef = _elementRef;
        this._loader = _loader;
        this._parentRouter = _parentRouter;
        this.name = null;
        this._componentRef = null;
        this._currentInstruction = null;
        if (lang_1.isPresent(nameAttr)) {
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
    RouterOutlet.prototype.activate = function (nextInstruction) {
        var _this = this;
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = nextInstruction;
        var componentType = nextInstruction.componentType;
        var childRouter = this._parentRouter.childRouter(componentType);
        var providers = core_1.Injector.resolve([
            core_1.provide(instruction_1.RouteData, { useValue: nextInstruction.routeData }),
            core_1.provide(instruction_1.RouteParams, { useValue: new instruction_1.RouteParams(nextInstruction.params) }),
            core_1.provide(routerMod.Router, { useValue: childRouter })
        ]);
        return this._loader.loadNextToLocation(componentType, this._elementRef, providers)
            .then(function (componentRef) {
            _this._componentRef = componentRef;
            if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnActivate, componentType)) {
                return _this._componentRef.instance
                    .routerOnActivate(nextInstruction, previousInstruction);
            }
        });
    };
    /**
     * Called by the {@link Router} during the commit phase of a navigation when an outlet
     * reuses a component between different routes.
     * This method in turn is responsible for calling the `routerOnReuse` hook of its child.
     */
    RouterOutlet.prototype.reuse = function (nextInstruction) {
        var previousInstruction = this._currentInstruction;
        this._currentInstruction = nextInstruction;
        if (lang_1.isBlank(this._componentRef)) {
            throw new exceptions_1.BaseException("Cannot reuse an outlet that does not contain a component.");
        }
        return async_1.PromiseWrapper.resolve(route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnReuse, this._currentInstruction.componentType) ?
            this._componentRef.instance
                .routerOnReuse(nextInstruction, previousInstruction) :
            true);
    };
    /**
     * Called by the {@link Router} when an outlet disposes of a component's contents.
     * This method in turn is responsible for calling the `routerOnDeactivate` hook of its child.
     */
    RouterOutlet.prototype.deactivate = function (nextInstruction) {
        var _this = this;
        var next = _resolveToTrue;
        if (lang_1.isPresent(this._componentRef) && lang_1.isPresent(this._currentInstruction) &&
            route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnDeactivate, this._currentInstruction.componentType)) {
            next = async_1.PromiseWrapper.resolve(this._componentRef.instance
                .routerOnDeactivate(nextInstruction, this._currentInstruction));
        }
        return next.then(function (_) {
            if (lang_1.isPresent(_this._componentRef)) {
                _this._componentRef.dispose();
                _this._componentRef = null;
            }
        });
    };
    /**
     * Called by the {@link Router} during recognition phase of a navigation.
     *
     * If this resolves to `false`, the given navigation is cancelled.
     *
     * This method delegates to the child component's `routerCanDeactivate` hook if it exists,
     * and otherwise resolves to true.
     */
    RouterOutlet.prototype.routerCanDeactivate = function (nextInstruction) {
        if (lang_1.isBlank(this._currentInstruction)) {
            return _resolveToTrue;
        }
        if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerCanDeactivate, this._currentInstruction.componentType)) {
            return async_1.PromiseWrapper.resolve(this._componentRef.instance
                .routerCanDeactivate(nextInstruction, this._currentInstruction));
        }
        return _resolveToTrue;
    };
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
    RouterOutlet.prototype.routerCanReuse = function (nextInstruction) {
        var result;
        if (lang_1.isBlank(this._currentInstruction) ||
            this._currentInstruction.componentType != nextInstruction.componentType) {
            result = false;
        }
        else if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerCanReuse, this._currentInstruction.componentType)) {
            result = this._componentRef.instance
                .routerCanReuse(nextInstruction, this._currentInstruction);
        }
        else {
            result = nextInstruction == this._currentInstruction ||
                (lang_1.isPresent(nextInstruction.params) && lang_1.isPresent(this._currentInstruction.params) &&
                    collection_1.StringMapWrapper.equals(nextInstruction.params, this._currentInstruction.params));
        }
        return async_1.PromiseWrapper.resolve(result);
    };
    RouterOutlet = __decorate([
        core_1.Directive({ selector: 'router-outlet' }),
        __param(3, core_1.Attribute('name')), 
        __metadata('design:paramtypes', [core_1.ElementRef, core_1.DynamicComponentLoader, routerMod.Router, String])
    ], RouterOutlet);
    return RouterOutlet;
})();
exports.RouterOutlet = RouterOutlet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvcm91dGVyX291dGxldC50cyJdLCJuYW1lcyI6WyJSb3V0ZXJPdXRsZXQiLCJSb3V0ZXJPdXRsZXQuY29uc3RydWN0b3IiLCJSb3V0ZXJPdXRsZXQuYWN0aXZhdGUiLCJSb3V0ZXJPdXRsZXQucmV1c2UiLCJSb3V0ZXJPdXRsZXQuZGVhY3RpdmF0ZSIsIlJvdXRlck91dGxldC5yb3V0ZXJDYW5EZWFjdGl2YXRlIiwiUm91dGVyT3V0bGV0LnJvdXRlckNhblJldXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxzQkFBc0MsMkJBQTJCLENBQUMsQ0FBQTtBQUNsRSwyQkFBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSxxQkFBaUMsMEJBQTBCLENBQUMsQ0FBQTtBQUM1RCwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUUvRSxxQkFTTyxlQUFlLENBQUMsQ0FBQTtBQUV2QixJQUFZLFNBQVMsV0FBTSxVQUFVLENBQUMsQ0FBQTtBQUN0Qyw0QkFBMkQsZUFBZSxDQUFDLENBQUE7QUFDM0UsSUFBWSxPQUFPLFdBQU0seUJBQXlCLENBQUMsQ0FBQTtBQUNuRCwwQ0FBK0IsNkJBQTZCLENBQUMsQ0FBQTtBQUc3RCxJQUFJLGNBQWMsR0FBRyxzQkFBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUVsRDs7Ozs7Ozs7R0FRRztBQUNIO0lBTUVBLHNCQUFvQkEsV0FBdUJBLEVBQVVBLE9BQStCQSxFQUNoRUEsYUFBK0JBLEVBQXFCQSxRQUFnQkE7UUFEcEVDLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFZQTtRQUFVQSxZQUFPQSxHQUFQQSxPQUFPQSxDQUF3QkE7UUFDaEVBLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUFrQkE7UUFMbkRBLFNBQUlBLEdBQVdBLElBQUlBLENBQUNBO1FBQ1pBLGtCQUFhQSxHQUFpQkEsSUFBSUEsQ0FBQ0E7UUFD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Y0EsQ0FBQ0EsZUFBZUEsRUFBRUEsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQTtRQUMxRUEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsR0FBR0EsZUFBZUEsSUFBSUEsSUFBSUEsQ0FBQ0EsbUJBQW1CQTtnQkFDM0NBLENBQUNBLGdCQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxNQUFNQSxDQUFDQTtvQkFDL0VBLDZCQUFnQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM5RkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0Esc0JBQWNBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQ3hDQSxDQUFDQTtJQTdISE47UUFBQ0EsZ0JBQVNBLENBQUNBLEVBQUNBLFFBQVFBLEVBQUVBLGVBQWVBLEVBQUNBLENBQUNBO1FBT2dCQSxXQUFDQSxnQkFBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQUE7O3FCQXVIeEVBO0lBQURBLG1CQUFDQTtBQUFEQSxDQUFDQSxBQTlIRCxJQThIQztBQTdIWSxvQkFBWSxlQTZIeEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtpc0JsYW5rLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgQXR0cmlidXRlLFxuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICBDb21wb25lbnRSZWYsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdG9yLFxuICBwcm92aWRlLFxuICBEZXBlbmRlbmN5XG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyByb3V0ZXJNb2QgZnJvbSAnLi9yb3V0ZXInO1xuaW1wb3J0IHtDb21wb25lbnRJbnN0cnVjdGlvbiwgUm91dGVQYXJhbXMsIFJvdXRlRGF0YX0gZnJvbSAnLi9pbnN0cnVjdGlvbic7XG5pbXBvcnQgKiBhcyBob29rTW9kIGZyb20gJy4vbGlmZWN5Y2xlX2Fubm90YXRpb25zJztcbmltcG9ydCB7aGFzTGlmZWN5Y2xlSG9va30gZnJvbSAnLi9yb3V0ZV9saWZlY3ljbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7T25BY3RpdmF0ZSwgQ2FuUmV1c2UsIE9uUmV1c2UsIE9uRGVhY3RpdmF0ZSwgQ2FuRGVhY3RpdmF0ZX0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxubGV0IF9yZXNvbHZlVG9UcnVlID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0cnVlKTtcblxuLyoqXG4gKiBBIHJvdXRlciBvdXRsZXQgaXMgYSBwbGFjZWhvbGRlciB0aGF0IEFuZ3VsYXIgZHluYW1pY2FsbHkgZmlsbHMgYmFzZWQgb24gdGhlIGFwcGxpY2F0aW9uJ3Mgcm91dGUuXG4gKlxuICogIyMgVXNlXG4gKlxuICogYGBgXG4gKiA8cm91dGVyLW91dGxldD48L3JvdXRlci1vdXRsZXQ+XG4gKiBgYGBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdyb3V0ZXItb3V0bGV0J30pXG5leHBvcnQgY2xhc3MgUm91dGVyT3V0bGV0IHtcbiAgbmFtZTogc3RyaW5nID0gbnVsbDtcbiAgcHJpdmF0ZSBfY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWYgPSBudWxsO1xuICBwcml2YXRlIF9jdXJyZW50SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLCBwcml2YXRlIF9sb2FkZXI6IER5bmFtaWNDb21wb25lbnRMb2FkZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3BhcmVudFJvdXRlcjogcm91dGVyTW9kLlJvdXRlciwgQEF0dHJpYnV0ZSgnbmFtZScpIG5hbWVBdHRyOiBzdHJpbmcpIHtcbiAgICBpZiAoaXNQcmVzZW50KG5hbWVBdHRyKSkge1xuICAgICAgdGhpcy5uYW1lID0gbmFtZUF0dHI7XG4gICAgICB0aGlzLl9wYXJlbnRSb3V0ZXIucmVnaXN0ZXJBdXhPdXRsZXQodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BhcmVudFJvdXRlci5yZWdpc3RlclByaW1hcnlPdXRsZXQodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBieSB0aGUgUm91dGVyIHRvIGluc3RhbnRpYXRlIGEgbmV3IGNvbXBvbmVudCBkdXJpbmcgdGhlIGNvbW1pdCBwaGFzZSBvZiBhIG5hdmlnYXRpb24uXG4gICAqIFRoaXMgbWV0aG9kIGluIHR1cm4gaXMgcmVzcG9uc2libGUgZm9yIGNhbGxpbmcgdGhlIGByb3V0ZXJPbkFjdGl2YXRlYCBob29rIG9mIGl0cyBjaGlsZC5cbiAgICovXG4gIGFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBwcmV2aW91c0luc3RydWN0aW9uID0gdGhpcy5fY3VycmVudEluc3RydWN0aW9uO1xuICAgIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbiA9IG5leHRJbnN0cnVjdGlvbjtcbiAgICB2YXIgY29tcG9uZW50VHlwZSA9IG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlO1xuICAgIHZhciBjaGlsZFJvdXRlciA9IHRoaXMuX3BhcmVudFJvdXRlci5jaGlsZFJvdXRlcihjb21wb25lbnRUeXBlKTtcblxuICAgIHZhciBwcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKFtcbiAgICAgIHByb3ZpZGUoUm91dGVEYXRhLCB7dXNlVmFsdWU6IG5leHRJbnN0cnVjdGlvbi5yb3V0ZURhdGF9KSxcbiAgICAgIHByb3ZpZGUoUm91dGVQYXJhbXMsIHt1c2VWYWx1ZTogbmV3IFJvdXRlUGFyYW1zKG5leHRJbnN0cnVjdGlvbi5wYXJhbXMpfSksXG4gICAgICBwcm92aWRlKHJvdXRlck1vZC5Sb3V0ZXIsIHt1c2VWYWx1ZTogY2hpbGRSb3V0ZXJ9KVxuICAgIF0pO1xuICAgIHJldHVybiB0aGlzLl9sb2FkZXIubG9hZE5leHRUb0xvY2F0aW9uKGNvbXBvbmVudFR5cGUsIHRoaXMuX2VsZW1lbnRSZWYsIHByb3ZpZGVycylcbiAgICAgICAgLnRoZW4oKGNvbXBvbmVudFJlZikgPT4ge1xuICAgICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IGNvbXBvbmVudFJlZjtcbiAgICAgICAgICBpZiAoaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uQWN0aXZhdGUsIGNvbXBvbmVudFR5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gKDxPbkFjdGl2YXRlPnRoaXMuX2NvbXBvbmVudFJlZi5pbnN0YW5jZSlcbiAgICAgICAgICAgICAgICAucm91dGVyT25BY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb24sIHByZXZpb3VzSW5zdHJ1Y3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSBkdXJpbmcgdGhlIGNvbW1pdCBwaGFzZSBvZiBhIG5hdmlnYXRpb24gd2hlbiBhbiBvdXRsZXRcbiAgICogcmV1c2VzIGEgY29tcG9uZW50IGJldHdlZW4gZGlmZmVyZW50IHJvdXRlcy5cbiAgICogVGhpcyBtZXRob2QgaW4gdHVybiBpcyByZXNwb25zaWJsZSBmb3IgY2FsbGluZyB0aGUgYHJvdXRlck9uUmV1c2VgIGhvb2sgb2YgaXRzIGNoaWxkLlxuICAgKi9cbiAgcmV1c2UobmV4dEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIHByZXZpb3VzSW5zdHJ1Y3Rpb24gPSB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb247XG4gICAgdGhpcy5fY3VycmVudEluc3RydWN0aW9uID0gbmV4dEluc3RydWN0aW9uO1xuXG4gICAgaWYgKGlzQmxhbmsodGhpcy5fY29tcG9uZW50UmVmKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbm5vdCByZXVzZSBhbiBvdXRsZXQgdGhhdCBkb2VzIG5vdCBjb250YWluIGEgY29tcG9uZW50LmApO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShcbiAgICAgICAgaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uUmV1c2UsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSA/XG4gICAgICAgICAgICAoPE9uUmV1c2U+dGhpcy5fY29tcG9uZW50UmVmLmluc3RhbmNlKVxuICAgICAgICAgICAgICAgIC5yb3V0ZXJPblJldXNlKG5leHRJbnN0cnVjdGlvbiwgcHJldmlvdXNJbnN0cnVjdGlvbikgOlxuICAgICAgICAgICAgdHJ1ZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSB3aGVuIGFuIG91dGxldCBkaXNwb3NlcyBvZiBhIGNvbXBvbmVudCdzIGNvbnRlbnRzLlxuICAgKiBUaGlzIG1ldGhvZCBpbiB0dXJuIGlzIHJlc3BvbnNpYmxlIGZvciBjYWxsaW5nIHRoZSBgcm91dGVyT25EZWFjdGl2YXRlYCBob29rIG9mIGl0cyBjaGlsZC5cbiAgICovXG4gIGRlYWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIG5leHQgPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NvbXBvbmVudFJlZikgJiYgaXNQcmVzZW50KHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikgJiZcbiAgICAgICAgaGFzTGlmZWN5Y2xlSG9vayhob29rTW9kLnJvdXRlck9uRGVhY3RpdmF0ZSwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICBuZXh0ID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShcbiAgICAgICAgICAoPE9uRGVhY3RpdmF0ZT50aGlzLl9jb21wb25lbnRSZWYuaW5zdGFuY2UpXG4gICAgICAgICAgICAgIC5yb3V0ZXJPbkRlYWN0aXZhdGUobmV4dEluc3RydWN0aW9uLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24pKTtcbiAgICB9XG4gICAgcmV0dXJuIG5leHQudGhlbigoXykgPT4ge1xuICAgICAgaWYgKGlzUHJlc2VudCh0aGlzLl9jb21wb25lbnRSZWYpKSB7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZi5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuX2NvbXBvbmVudFJlZiA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHRoZSB7QGxpbmsgUm91dGVyfSBkdXJpbmcgcmVjb2duaXRpb24gcGhhc2Ugb2YgYSBuYXZpZ2F0aW9uLlxuICAgKlxuICAgKiBJZiB0aGlzIHJlc29sdmVzIHRvIGBmYWxzZWAsIHRoZSBnaXZlbiBuYXZpZ2F0aW9uIGlzIGNhbmNlbGxlZC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgZGVsZWdhdGVzIHRvIHRoZSBjaGlsZCBjb21wb25lbnQncyBgcm91dGVyQ2FuRGVhY3RpdmF0ZWAgaG9vayBpZiBpdCBleGlzdHMsXG4gICAqIGFuZCBvdGhlcndpc2UgcmVzb2x2ZXMgdG8gdHJ1ZS5cbiAgICovXG4gIHJvdXRlckNhbkRlYWN0aXZhdGUobmV4dEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbikpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9XG4gICAgaWYgKGhhc0xpZmVjeWNsZUhvb2soaG9va01vZC5yb3V0ZXJDYW5EZWFjdGl2YXRlLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKFxuICAgICAgICAgICg8Q2FuRGVhY3RpdmF0ZT50aGlzLl9jb21wb25lbnRSZWYuaW5zdGFuY2UpXG4gICAgICAgICAgICAgIC5yb3V0ZXJDYW5EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgdGhlIHtAbGluayBSb3V0ZXJ9IGR1cmluZyByZWNvZ25pdGlvbiBwaGFzZSBvZiBhIG5hdmlnYXRpb24uXG4gICAqXG4gICAqIElmIHRoZSBuZXcgY2hpbGQgY29tcG9uZW50IGhhcyBhIGRpZmZlcmVudCBUeXBlIHRoYW4gdGhlIGV4aXN0aW5nIGNoaWxkIGNvbXBvbmVudCxcbiAgICogdGhpcyB3aWxsIHJlc29sdmUgdG8gYGZhbHNlYC4gWW91IGNhbid0IHJldXNlIGFuIG9sZCBjb21wb25lbnQgd2hlbiB0aGUgbmV3IGNvbXBvbmVudFxuICAgKiBpcyBvZiBhIGRpZmZlcmVudCBUeXBlLlxuICAgKlxuICAgKiBPdGhlcndpc2UsIHRoaXMgbWV0aG9kIGRlbGVnYXRlcyB0byB0aGUgY2hpbGQgY29tcG9uZW50J3MgYHJvdXRlckNhblJldXNlYCBob29rIGlmIGl0IGV4aXN0cyxcbiAgICogb3IgcmVzb2x2ZXMgdG8gdHJ1ZSBpZiB0aGUgaG9vayBpcyBub3QgcHJlc2VudC5cbiAgICovXG4gIHJvdXRlckNhblJldXNlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB2YXIgcmVzdWx0O1xuXG4gICAgaWYgKGlzQmxhbmsodGhpcy5fY3VycmVudEluc3RydWN0aW9uKSB8fFxuICAgICAgICB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSAhPSBuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkge1xuICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChoYXNMaWZlY3ljbGVIb29rKGhvb2tNb2Qucm91dGVyQ2FuUmV1c2UsIHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSkge1xuICAgICAgcmVzdWx0ID0gKDxDYW5SZXVzZT50aGlzLl9jb21wb25lbnRSZWYuaW5zdGFuY2UpXG4gICAgICAgICAgICAgICAgICAgLnJvdXRlckNhblJldXNlKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5fY3VycmVudEluc3RydWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gbmV4dEluc3RydWN0aW9uID09IHRoaXMuX2N1cnJlbnRJbnN0cnVjdGlvbiB8fFxuICAgICAgICAgICAgICAgKGlzUHJlc2VudChuZXh0SW5zdHJ1Y3Rpb24ucGFyYW1zKSAmJiBpc1ByZXNlbnQodGhpcy5fY3VycmVudEluc3RydWN0aW9uLnBhcmFtcykgJiZcbiAgICAgICAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmVxdWFscyhuZXh0SW5zdHJ1Y3Rpb24ucGFyYW1zLCB0aGlzLl9jdXJyZW50SW5zdHJ1Y3Rpb24ucGFyYW1zKSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHJlc3VsdCk7XG4gIH1cbn1cbiJdfQ==