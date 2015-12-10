'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
 * <a [router-link]="['./User']">link to user component</a>
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
        this._router = _router;
        this._location = _location;
    }
    Object.defineProperty(RouterLink.prototype, "isRouteActive", {
        get: function () { return this._router.isRouteActive(this._navigationInstruction); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RouterLink.prototype, "routeParams", {
        set: function (changes) {
            this._routeParams = changes;
            this._navigationInstruction = this._router.generate(this._routeParams);
            var navigationHref = this._navigationInstruction.toLinkUrl();
            this.visibleHref = this._location.prepareExternalUrl(navigationHref);
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
            selector: '[router-link]',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlcl9saW5rLnRzIl0sIm5hbWVzIjpbIlJvdXRlckxpbmsiLCJSb3V0ZXJMaW5rLmNvbnN0cnVjdG9yIiwiUm91dGVyTGluay5pc1JvdXRlQWN0aXZlIiwiUm91dGVyTGluay5yb3V0ZVBhcmFtcyIsIlJvdXRlckxpbmsub25DbGljayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxxQkFBd0IsZUFBZSxDQUFDLENBQUE7QUFDeEMscUJBQXVCLDBCQUEwQixDQUFDLENBQUE7QUFFbEQsdUJBQXFCLFVBQVUsQ0FBQyxDQUFBO0FBQ2hDLHlCQUF1QixZQUFZLENBQUMsQ0FBQTtBQUdwQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNIO0lBbUJFQSxvQkFBb0JBLE9BQWVBLEVBQVVBLFNBQW1CQTtRQUE1Q0MsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBUUE7UUFBVUEsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBVUE7SUFBR0EsQ0FBQ0E7SUFFcEVELHNCQUFJQSxxQ0FBYUE7YUFBakJBLGNBQStCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7SUFFaEdBLHNCQUFJQSxtQ0FBV0E7YUFBZkEsVUFBZ0JBLE9BQWNBO1lBQzVCRyxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxPQUFPQSxDQUFDQTtZQUM1QkEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtZQUV2RUEsSUFBSUEsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtZQUM3REEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtRQUN2RUEsQ0FBQ0E7OztPQUFBSDtJQUVEQSw0QkFBT0EsR0FBUEE7UUFDRUksd0VBQXdFQTtRQUN4RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsSUFBSUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckRBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLHFCQUFxQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxDQUFDQTtZQUNoRUEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUF0Q0hKO1FBQUNBLGdCQUFTQSxDQUFDQTtZQUNUQSxRQUFRQSxFQUFFQSxlQUFlQTtZQUN6QkEsTUFBTUEsRUFBRUEsQ0FBQ0EseUJBQXlCQSxFQUFFQSxnQkFBZ0JBLENBQUNBO1lBQ3JEQSxJQUFJQSxFQUFFQTtnQkFDSkEsU0FBU0EsRUFBRUEsV0FBV0E7Z0JBQ3RCQSxhQUFhQSxFQUFFQSxhQUFhQTtnQkFDNUJBLDRCQUE0QkEsRUFBRUEsZUFBZUE7YUFDOUNBO1NBQ0ZBLENBQUNBOzttQkErQkRBO0lBQURBLGlCQUFDQTtBQUFEQSxDQUFDQSxBQXZDRCxJQXVDQztBQTlCWSxrQkFBVSxhQThCdEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNTdHJpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7Um91dGVyfSBmcm9tICcuL3JvdXRlcic7XG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICcuL2xvY2F0aW9uJztcbmltcG9ydCB7SW5zdHJ1Y3Rpb259IGZyb20gJy4vaW5zdHJ1Y3Rpb24nO1xuXG4vKipcbiAqIFRoZSBSb3V0ZXJMaW5rIGRpcmVjdGl2ZSBsZXRzIHlvdSBsaW5rIHRvIHNwZWNpZmljIHBhcnRzIG9mIHlvdXIgYXBwLlxuICpcbiAqIENvbnNpZGVyIHRoZSBmb2xsb3dpbmcgcm91dGUgY29uZmlndXJhdGlvbjpcblxuICogYGBgXG4gKiBAUm91dGVDb25maWcoW1xuICogICB7IHBhdGg6ICcvdXNlcicsIGNvbXBvbmVudDogVXNlckNtcCwgYXM6ICdVc2VyJyB9XG4gKiBdKTtcbiAqIGNsYXNzIE15Q29tcCB7fVxuICogYGBgXG4gKlxuICogV2hlbiBsaW5raW5nIHRvIHRoaXMgYFVzZXJgIHJvdXRlLCB5b3UgY2FuIHdyaXRlOlxuICpcbiAqIGBgYFxuICogPGEgW3JvdXRlci1saW5rXT1cIlsnLi9Vc2VyJ11cIj5saW5rIHRvIHVzZXIgY29tcG9uZW50PC9hPlxuICogYGBgXG4gKlxuICogUm91dGVyTGluayBleHBlY3RzIHRoZSB2YWx1ZSB0byBiZSBhbiBhcnJheSBvZiByb3V0ZSBuYW1lcywgZm9sbG93ZWQgYnkgdGhlIHBhcmFtc1xuICogZm9yIHRoYXQgbGV2ZWwgb2Ygcm91dGluZy4gRm9yIGluc3RhbmNlIGBbJy9UZWFtJywge3RlYW1JZDogMX0sICdVc2VyJywge3VzZXJJZDogMn1dYFxuICogbWVhbnMgdGhhdCB3ZSB3YW50IHRvIGdlbmVyYXRlIGEgbGluayBmb3IgdGhlIGBUZWFtYCByb3V0ZSB3aXRoIHBhcmFtcyBge3RlYW1JZDogMX1gLFxuICogYW5kIHdpdGggYSBjaGlsZCByb3V0ZSBgVXNlcmAgd2l0aCBwYXJhbXMgYHt1c2VySWQ6IDJ9YC5cbiAqXG4gKiBUaGUgZmlyc3Qgcm91dGUgbmFtZSBzaG91bGQgYmUgcHJlcGVuZGVkIHdpdGggYC9gLCBgLi9gLCBvciBgLi4vYC5cbiAqIElmIHRoZSByb3V0ZSBiZWdpbnMgd2l0aCBgL2AsIHRoZSByb3V0ZXIgd2lsbCBsb29rIHVwIHRoZSByb3V0ZSBmcm9tIHRoZSByb290IG9mIHRoZSBhcHAuXG4gKiBJZiB0aGUgcm91dGUgYmVnaW5zIHdpdGggYC4vYCwgdGhlIHJvdXRlciB3aWxsIGluc3RlYWQgbG9vayBpbiB0aGUgY3VycmVudCBjb21wb25lbnQnc1xuICogY2hpbGRyZW4gZm9yIHRoZSByb3V0ZS4gQW5kIGlmIHRoZSByb3V0ZSBiZWdpbnMgd2l0aCBgLi4vYCwgdGhlIHJvdXRlciB3aWxsIGxvb2sgYXQgdGhlXG4gKiBjdXJyZW50IGNvbXBvbmVudCdzIHBhcmVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3JvdXRlci1saW5rXScsXG4gIGlucHV0czogWydyb3V0ZVBhcmFtczogcm91dGVyTGluaycsICd0YXJnZXQ6IHRhcmdldCddLFxuICBob3N0OiB7XG4gICAgJyhjbGljayknOiAnb25DbGljaygpJyxcbiAgICAnW2F0dHIuaHJlZl0nOiAndmlzaWJsZUhyZWYnLFxuICAgICdbY2xhc3Mucm91dGVyLWxpbmstYWN0aXZlXSc6ICdpc1JvdXRlQWN0aXZlJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIFJvdXRlckxpbmsge1xuICBwcml2YXRlIF9yb3V0ZVBhcmFtczogYW55W107XG5cbiAgLy8gdGhlIHVybCBkaXNwbGF5ZWQgb24gdGhlIGFuY2hvciBlbGVtZW50LlxuICB2aXNpYmxlSHJlZjogc3RyaW5nO1xuICB0YXJnZXQ6IHN0cmluZztcblxuICAvLyB0aGUgaW5zdHJ1Y3Rpb24gcGFzc2VkIHRvIHRoZSByb3V0ZXIgdG8gbmF2aWdhdGVcbiAgcHJpdmF0ZSBfbmF2aWdhdGlvbkluc3RydWN0aW9uOiBJbnN0cnVjdGlvbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yb3V0ZXI6IFJvdXRlciwgcHJpdmF0ZSBfbG9jYXRpb246IExvY2F0aW9uKSB7fVxuXG4gIGdldCBpc1JvdXRlQWN0aXZlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fcm91dGVyLmlzUm91dGVBY3RpdmUodGhpcy5fbmF2aWdhdGlvbkluc3RydWN0aW9uKTsgfVxuXG4gIHNldCByb3V0ZVBhcmFtcyhjaGFuZ2VzOiBhbnlbXSkge1xuICAgIHRoaXMuX3JvdXRlUGFyYW1zID0gY2hhbmdlcztcbiAgICB0aGlzLl9uYXZpZ2F0aW9uSW5zdHJ1Y3Rpb24gPSB0aGlzLl9yb3V0ZXIuZ2VuZXJhdGUodGhpcy5fcm91dGVQYXJhbXMpO1xuXG4gICAgdmFyIG5hdmlnYXRpb25IcmVmID0gdGhpcy5fbmF2aWdhdGlvbkluc3RydWN0aW9uLnRvTGlua1VybCgpO1xuICAgIHRoaXMudmlzaWJsZUhyZWYgPSB0aGlzLl9sb2NhdGlvbi5wcmVwYXJlRXh0ZXJuYWxVcmwobmF2aWdhdGlvbkhyZWYpO1xuICB9XG5cbiAgb25DbGljaygpOiBib29sZWFuIHtcbiAgICAvLyBJZiBubyB0YXJnZXQsIG9yIGlmIHRhcmdldCBpcyBfc2VsZiwgcHJldmVudCBkZWZhdWx0IGJyb3dzZXIgYmVoYXZpb3JcbiAgICBpZiAoIWlzU3RyaW5nKHRoaXMudGFyZ2V0KSB8fCB0aGlzLnRhcmdldCA9PSAnX3NlbGYnKSB7XG4gICAgICB0aGlzLl9yb3V0ZXIubmF2aWdhdGVCeUluc3RydWN0aW9uKHRoaXMuX25hdmlnYXRpb25JbnN0cnVjdGlvbik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iXX0=