'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var router_1 = require('./router');
var location_1 = require('./location');
/**
 * The RouterLink directive lets you link to specific parts of your app.
 *
 * Consider the following route configuration:

 * ```
 * @RouteConfig([
 *   { path: '/user', component: UserCmp, as: 'User' }
 * ]);
 * class MyComp {}
 * ```
 *
 * When linking to this `User` route, you can write:
 *
 * ```
 * <a [routerLink]="['./User']">link to user component</a>
 * ```
 *
 * RouterLink expects the value to be an array of route names, followed by the params
 * for that level of routing. For instance `['/Team', {teamId: 1}, 'User', {userId: 2}]`
 * means that we want to generate a link for the `Team` route with params `{teamId: 1}`,
 * and with a child route `User` with params `{userId: 2}`.
 *
 * The first route name should be prepended with `/`, `./`, or `../`.
 * If the route begins with `/`, the router will look up the route from the root of the app.
 * If the route begins with `./`, the router will instead look in the current component's
 * children for the route. And if the route begins with `../`, the router will look at the
 * current component's parent.
 */
var RouterLink = (function () {
    function RouterLink(_router, _location) {
        var _this = this;
        this._router = _router;
        this._location = _location;
        // we need to update the link whenever a route changes to account for aux routes
        this._router.subscribe(function (_) { return _this._updateLink(); });
    }
    // because auxiliary links take existing primary and auxiliary routes into account,
    // we need to update the link whenever params or other routes change.
    RouterLink.prototype._updateLink = function () {
        this._navigationInstruction = this._router.generate(this._routeParams);
        var navigationHref = this._navigationInstruction.toLinkUrl();
        this.visibleHref = this._location.prepareExternalUrl(navigationHref);
    };
    Object.defineProperty(RouterLink.prototype, "isRouteActive", {
        get: function () { return this._router.isRouteActive(this._navigationInstruction); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RouterLink.prototype, "routeParams", {
        set: function (changes) {
            this._routeParams = changes;
            this._updateLink();
        },
        enumerable: true,
        configurable: true
    });
    RouterLink.prototype.onClick = function () {
        // If no target, or if target is _self, prevent default browser behavior
        if (!lang_1.isString(this.target) || this.target == '_self') {
            this._router.navigateByInstruction(this._navigationInstruction);
            return false;
        }
        return true;
    };
    RouterLink = __decorate([
        core_1.Directive({
            selector: '[routerLink]',
            inputs: ['routeParams: routerLink', 'target: target'],
            host: {
                '(click)': 'onClick()',
                '[attr.href]': 'visibleHref',
                '[class.router-link-active]': 'isRouteActive'
            }
        }), 
        __metadata('design:paramtypes', [router_1.Router, location_1.Location])
    ], RouterLink);
    return RouterLink;
})();
exports.RouterLink = RouterLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlcl9saW5rLnRzIl0sIm5hbWVzIjpbIlJvdXRlckxpbmsiLCJSb3V0ZXJMaW5rLmNvbnN0cnVjdG9yIiwiUm91dGVyTGluay5fdXBkYXRlTGluayIsIlJvdXRlckxpbmsuaXNSb3V0ZUFjdGl2ZSIsIlJvdXRlckxpbmsucm91dGVQYXJhbXMiLCJSb3V0ZXJMaW5rLm9uQ2xpY2siXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUF3QixlQUFlLENBQUMsQ0FBQTtBQUN4QyxxQkFBdUIsMEJBQTBCLENBQUMsQ0FBQTtBQUVsRCx1QkFBcUIsVUFBVSxDQUFDLENBQUE7QUFDaEMseUJBQXVCLFlBQVksQ0FBQyxDQUFBO0FBR3BDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEJHO0FBQ0g7SUFtQkVBLG9CQUFvQkEsT0FBZUEsRUFBVUEsU0FBbUJBO1FBbkJsRUMsaUJBK0NDQTtRQTVCcUJBLFlBQU9BLEdBQVBBLE9BQU9BLENBQVFBO1FBQVVBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO1FBQzlEQSxnRkFBZ0ZBO1FBQ2hGQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFDQSxDQUFDQSxJQUFLQSxPQUFBQSxLQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxFQUFsQkEsQ0FBa0JBLENBQUNBLENBQUNBO0lBQ3BEQSxDQUFDQTtJQUVERCxtRkFBbUZBO0lBQ25GQSxxRUFBcUVBO0lBQzdEQSxnQ0FBV0EsR0FBbkJBO1FBQ0VFLElBQUlBLENBQUNBLHNCQUFzQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7UUFDdkVBLElBQUlBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7UUFDN0RBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7SUFDdkVBLENBQUNBO0lBRURGLHNCQUFJQSxxQ0FBYUE7YUFBakJBLGNBQStCRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUg7SUFFaEdBLHNCQUFJQSxtQ0FBV0E7YUFBZkEsVUFBZ0JBLE9BQWNBO1lBQzVCSSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxPQUFPQSxDQUFDQTtZQUM1QkEsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDckJBLENBQUNBOzs7T0FBQUo7SUFFREEsNEJBQU9BLEdBQVBBO1FBQ0VLLHdFQUF3RUE7UUFDeEVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGVBQVFBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLElBQUlBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ3JEQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxxQkFBcUJBLENBQUNBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsQ0FBQ0E7WUFDaEVBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2ZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBOUNITDtRQUFDQSxnQkFBU0EsQ0FBQ0E7WUFDVEEsUUFBUUEsRUFBRUEsY0FBY0E7WUFDeEJBLE1BQU1BLEVBQUVBLENBQUNBLHlCQUF5QkEsRUFBRUEsZ0JBQWdCQSxDQUFDQTtZQUNyREEsSUFBSUEsRUFBRUE7Z0JBQ0pBLFNBQVNBLEVBQUVBLFdBQVdBO2dCQUN0QkEsYUFBYUEsRUFBRUEsYUFBYUE7Z0JBQzVCQSw0QkFBNEJBLEVBQUVBLGVBQWVBO2FBQzlDQTtTQUNGQSxDQUFDQTs7bUJBdUNEQTtJQUFEQSxpQkFBQ0E7QUFBREEsQ0FBQ0EsQUEvQ0QsSUErQ0M7QUF0Q1ksa0JBQVUsYUFzQ3RCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2lzU3RyaW5nfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge1JvdXRlcn0gZnJvbSAnLi9yb3V0ZXInO1xuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnLi9sb2NhdGlvbic7XG5pbXBvcnQge0luc3RydWN0aW9ufSBmcm9tICcuL2luc3RydWN0aW9uJztcblxuLyoqXG4gKiBUaGUgUm91dGVyTGluayBkaXJlY3RpdmUgbGV0cyB5b3UgbGluayB0byBzcGVjaWZpYyBwYXJ0cyBvZiB5b3VyIGFwcC5cbiAqXG4gKiBDb25zaWRlciB0aGUgZm9sbG93aW5nIHJvdXRlIGNvbmZpZ3VyYXRpb246XG5cbiAqIGBgYFxuICogQFJvdXRlQ29uZmlnKFtcbiAqICAgeyBwYXRoOiAnL3VzZXInLCBjb21wb25lbnQ6IFVzZXJDbXAsIGFzOiAnVXNlcicgfVxuICogXSk7XG4gKiBjbGFzcyBNeUNvbXAge31cbiAqIGBgYFxuICpcbiAqIFdoZW4gbGlua2luZyB0byB0aGlzIGBVc2VyYCByb3V0ZSwgeW91IGNhbiB3cml0ZTpcbiAqXG4gKiBgYGBcbiAqIDxhIFtyb3V0ZXJMaW5rXT1cIlsnLi9Vc2VyJ11cIj5saW5rIHRvIHVzZXIgY29tcG9uZW50PC9hPlxuICogYGBgXG4gKlxuICogUm91dGVyTGluayBleHBlY3RzIHRoZSB2YWx1ZSB0byBiZSBhbiBhcnJheSBvZiByb3V0ZSBuYW1lcywgZm9sbG93ZWQgYnkgdGhlIHBhcmFtc1xuICogZm9yIHRoYXQgbGV2ZWwgb2Ygcm91dGluZy4gRm9yIGluc3RhbmNlIGBbJy9UZWFtJywge3RlYW1JZDogMX0sICdVc2VyJywge3VzZXJJZDogMn1dYFxuICogbWVhbnMgdGhhdCB3ZSB3YW50IHRvIGdlbmVyYXRlIGEgbGluayBmb3IgdGhlIGBUZWFtYCByb3V0ZSB3aXRoIHBhcmFtcyBge3RlYW1JZDogMX1gLFxuICogYW5kIHdpdGggYSBjaGlsZCByb3V0ZSBgVXNlcmAgd2l0aCBwYXJhbXMgYHt1c2VySWQ6IDJ9YC5cbiAqXG4gKiBUaGUgZmlyc3Qgcm91dGUgbmFtZSBzaG91bGQgYmUgcHJlcGVuZGVkIHdpdGggYC9gLCBgLi9gLCBvciBgLi4vYC5cbiAqIElmIHRoZSByb3V0ZSBiZWdpbnMgd2l0aCBgL2AsIHRoZSByb3V0ZXIgd2lsbCBsb29rIHVwIHRoZSByb3V0ZSBmcm9tIHRoZSByb290IG9mIHRoZSBhcHAuXG4gKiBJZiB0aGUgcm91dGUgYmVnaW5zIHdpdGggYC4vYCwgdGhlIHJvdXRlciB3aWxsIGluc3RlYWQgbG9vayBpbiB0aGUgY3VycmVudCBjb21wb25lbnQnc1xuICogY2hpbGRyZW4gZm9yIHRoZSByb3V0ZS4gQW5kIGlmIHRoZSByb3V0ZSBiZWdpbnMgd2l0aCBgLi4vYCwgdGhlIHJvdXRlciB3aWxsIGxvb2sgYXQgdGhlXG4gKiBjdXJyZW50IGNvbXBvbmVudCdzIHBhcmVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3JvdXRlckxpbmtdJyxcbiAgaW5wdXRzOiBbJ3JvdXRlUGFyYW1zOiByb3V0ZXJMaW5rJywgJ3RhcmdldDogdGFyZ2V0J10sXG4gIGhvc3Q6IHtcbiAgICAnKGNsaWNrKSc6ICdvbkNsaWNrKCknLFxuICAgICdbYXR0ci5ocmVmXSc6ICd2aXNpYmxlSHJlZicsXG4gICAgJ1tjbGFzcy5yb3V0ZXItbGluay1hY3RpdmVdJzogJ2lzUm91dGVBY3RpdmUnXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgUm91dGVyTGluayB7XG4gIHByaXZhdGUgX3JvdXRlUGFyYW1zOiBhbnlbXTtcblxuICAvLyB0aGUgdXJsIGRpc3BsYXllZCBvbiB0aGUgYW5jaG9yIGVsZW1lbnQuXG4gIHZpc2libGVIcmVmOiBzdHJpbmc7XG4gIHRhcmdldDogc3RyaW5nO1xuXG4gIC8vIHRoZSBpbnN0cnVjdGlvbiBwYXNzZWQgdG8gdGhlIHJvdXRlciB0byBuYXZpZ2F0ZVxuICBwcml2YXRlIF9uYXZpZ2F0aW9uSW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3JvdXRlcjogUm91dGVyLCBwcml2YXRlIF9sb2NhdGlvbjogTG9jYXRpb24pIHtcbiAgICAvLyB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgbGluayB3aGVuZXZlciBhIHJvdXRlIGNoYW5nZXMgdG8gYWNjb3VudCBmb3IgYXV4IHJvdXRlc1xuICAgIHRoaXMuX3JvdXRlci5zdWJzY3JpYmUoKF8pID0+IHRoaXMuX3VwZGF0ZUxpbmsoKSk7XG4gIH1cblxuICAvLyBiZWNhdXNlIGF1eGlsaWFyeSBsaW5rcyB0YWtlIGV4aXN0aW5nIHByaW1hcnkgYW5kIGF1eGlsaWFyeSByb3V0ZXMgaW50byBhY2NvdW50LFxuICAvLyB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgbGluayB3aGVuZXZlciBwYXJhbXMgb3Igb3RoZXIgcm91dGVzIGNoYW5nZS5cbiAgcHJpdmF0ZSBfdXBkYXRlTGluaygpOiB2b2lkIHtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uSW5zdHJ1Y3Rpb24gPSB0aGlzLl9yb3V0ZXIuZ2VuZXJhdGUodGhpcy5fcm91dGVQYXJhbXMpO1xuICAgIHZhciBuYXZpZ2F0aW9uSHJlZiA9IHRoaXMuX25hdmlnYXRpb25JbnN0cnVjdGlvbi50b0xpbmtVcmwoKTtcbiAgICB0aGlzLnZpc2libGVIcmVmID0gdGhpcy5fbG9jYXRpb24ucHJlcGFyZUV4dGVybmFsVXJsKG5hdmlnYXRpb25IcmVmKTtcbiAgfVxuXG4gIGdldCBpc1JvdXRlQWN0aXZlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fcm91dGVyLmlzUm91dGVBY3RpdmUodGhpcy5fbmF2aWdhdGlvbkluc3RydWN0aW9uKTsgfVxuXG4gIHNldCByb3V0ZVBhcmFtcyhjaGFuZ2VzOiBhbnlbXSkge1xuICAgIHRoaXMuX3JvdXRlUGFyYW1zID0gY2hhbmdlcztcbiAgICB0aGlzLl91cGRhdGVMaW5rKCk7XG4gIH1cblxuICBvbkNsaWNrKCk6IGJvb2xlYW4ge1xuICAgIC8vIElmIG5vIHRhcmdldCwgb3IgaWYgdGFyZ2V0IGlzIF9zZWxmLCBwcmV2ZW50IGRlZmF1bHQgYnJvd3NlciBiZWhhdmlvclxuICAgIGlmICghaXNTdHJpbmcodGhpcy50YXJnZXQpIHx8IHRoaXMudGFyZ2V0ID09ICdfc2VsZicpIHtcbiAgICAgIHRoaXMuX3JvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24odGhpcy5fbmF2aWdhdGlvbkluc3RydWN0aW9uKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==