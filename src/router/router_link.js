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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlcl9saW5rLnRzIl0sIm5hbWVzIjpbIlJvdXRlckxpbmsiLCJSb3V0ZXJMaW5rLmNvbnN0cnVjdG9yIiwiUm91dGVyTGluay5pc1JvdXRlQWN0aXZlIiwiUm91dGVyTGluay5yb3V0ZVBhcmFtcyIsIlJvdXRlckxpbmsub25DbGljayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEscUJBQXdCLGVBQWUsQ0FBQyxDQUFBO0FBQ3hDLHFCQUF1QiwwQkFBMEIsQ0FBQyxDQUFBO0FBRWxELHVCQUFxQixVQUFVLENBQUMsQ0FBQTtBQUNoQyx5QkFBdUIsWUFBWSxDQUFDLENBQUE7QUFHcEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Qkc7QUFDSDtJQW1CRUEsb0JBQW9CQSxPQUFlQSxFQUFVQSxTQUFtQkE7UUFBNUNDLFlBQU9BLEdBQVBBLE9BQU9BLENBQVFBO1FBQVVBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO0lBQUdBLENBQUNBO0lBRXBFRCxzQkFBSUEscUNBQWFBO2FBQWpCQSxjQUErQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBRWhHQSxzQkFBSUEsbUNBQVdBO2FBQWZBLFVBQWdCQSxPQUFjQTtZQUM1QkcsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsT0FBT0EsQ0FBQ0E7WUFDNUJBLElBQUlBLENBQUNBLHNCQUFzQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7WUFFdkVBLElBQUlBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7WUFDN0RBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7UUFDdkVBLENBQUNBOzs7T0FBQUg7SUFFREEsNEJBQU9BLEdBQVBBO1FBQ0VJLHdFQUF3RUE7UUFDeEVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGVBQVFBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLElBQUlBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ3JEQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxxQkFBcUJBLENBQUNBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsQ0FBQ0E7WUFDaEVBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2ZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBdENISjtRQUFDQSxnQkFBU0EsQ0FBQ0E7WUFDVEEsUUFBUUEsRUFBRUEsZUFBZUE7WUFDekJBLE1BQU1BLEVBQUVBLENBQUNBLHlCQUF5QkEsRUFBRUEsZ0JBQWdCQSxDQUFDQTtZQUNyREEsSUFBSUEsRUFBRUE7Z0JBQ0pBLFNBQVNBLEVBQUVBLFdBQVdBO2dCQUN0QkEsYUFBYUEsRUFBRUEsYUFBYUE7Z0JBQzVCQSw0QkFBNEJBLEVBQUVBLGVBQWVBO2FBQzlDQTtTQUNGQSxDQUFDQTs7bUJBK0JEQTtJQUFEQSxpQkFBQ0E7QUFBREEsQ0FBQ0EsQUF2Q0QsSUF1Q0M7QUE5Qlksa0JBQVUsYUE4QnRCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2lzU3RyaW5nfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge1JvdXRlcn0gZnJvbSAnLi9yb3V0ZXInO1xuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnLi9sb2NhdGlvbic7XG5pbXBvcnQge0luc3RydWN0aW9ufSBmcm9tICcuL2luc3RydWN0aW9uJztcblxuLyoqXG4gKiBUaGUgUm91dGVyTGluayBkaXJlY3RpdmUgbGV0cyB5b3UgbGluayB0byBzcGVjaWZpYyBwYXJ0cyBvZiB5b3VyIGFwcC5cbiAqXG4gKiBDb25zaWRlciB0aGUgZm9sbG93aW5nIHJvdXRlIGNvbmZpZ3VyYXRpb246XG5cbiAqIGBgYFxuICogQFJvdXRlQ29uZmlnKFtcbiAqICAgeyBwYXRoOiAnL3VzZXInLCBjb21wb25lbnQ6IFVzZXJDbXAsIGFzOiAnVXNlcicgfVxuICogXSk7XG4gKiBjbGFzcyBNeUNvbXAge31cbiAqIGBgYFxuICpcbiAqIFdoZW4gbGlua2luZyB0byB0aGlzIGBVc2VyYCByb3V0ZSwgeW91IGNhbiB3cml0ZTpcbiAqXG4gKiBgYGBcbiAqIDxhIFtyb3V0ZXItbGlua109XCJbJy4vVXNlciddXCI+bGluayB0byB1c2VyIGNvbXBvbmVudDwvYT5cbiAqIGBgYFxuICpcbiAqIFJvdXRlckxpbmsgZXhwZWN0cyB0aGUgdmFsdWUgdG8gYmUgYW4gYXJyYXkgb2Ygcm91dGUgbmFtZXMsIGZvbGxvd2VkIGJ5IHRoZSBwYXJhbXNcbiAqIGZvciB0aGF0IGxldmVsIG9mIHJvdXRpbmcuIEZvciBpbnN0YW5jZSBgWycvVGVhbScsIHt0ZWFtSWQ6IDF9LCAnVXNlcicsIHt1c2VySWQ6IDJ9XWBcbiAqIG1lYW5zIHRoYXQgd2Ugd2FudCB0byBnZW5lcmF0ZSBhIGxpbmsgZm9yIHRoZSBgVGVhbWAgcm91dGUgd2l0aCBwYXJhbXMgYHt0ZWFtSWQ6IDF9YCxcbiAqIGFuZCB3aXRoIGEgY2hpbGQgcm91dGUgYFVzZXJgIHdpdGggcGFyYW1zIGB7dXNlcklkOiAyfWAuXG4gKlxuICogVGhlIGZpcnN0IHJvdXRlIG5hbWUgc2hvdWxkIGJlIHByZXBlbmRlZCB3aXRoIGAvYCwgYC4vYCwgb3IgYC4uL2AuXG4gKiBJZiB0aGUgcm91dGUgYmVnaW5zIHdpdGggYC9gLCB0aGUgcm91dGVyIHdpbGwgbG9vayB1cCB0aGUgcm91dGUgZnJvbSB0aGUgcm9vdCBvZiB0aGUgYXBwLlxuICogSWYgdGhlIHJvdXRlIGJlZ2lucyB3aXRoIGAuL2AsIHRoZSByb3V0ZXIgd2lsbCBpbnN0ZWFkIGxvb2sgaW4gdGhlIGN1cnJlbnQgY29tcG9uZW50J3NcbiAqIGNoaWxkcmVuIGZvciB0aGUgcm91dGUuIEFuZCBpZiB0aGUgcm91dGUgYmVnaW5zIHdpdGggYC4uL2AsIHRoZSByb3V0ZXIgd2lsbCBsb29rIGF0IHRoZVxuICogY3VycmVudCBjb21wb25lbnQncyBwYXJlbnQuXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tyb3V0ZXItbGlua10nLFxuICBpbnB1dHM6IFsncm91dGVQYXJhbXM6IHJvdXRlckxpbmsnLCAndGFyZ2V0OiB0YXJnZXQnXSxcbiAgaG9zdDoge1xuICAgICcoY2xpY2spJzogJ29uQ2xpY2soKScsXG4gICAgJ1thdHRyLmhyZWZdJzogJ3Zpc2libGVIcmVmJyxcbiAgICAnW2NsYXNzLnJvdXRlci1saW5rLWFjdGl2ZV0nOiAnaXNSb3V0ZUFjdGl2ZSdcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJMaW5rIHtcbiAgcHJpdmF0ZSBfcm91dGVQYXJhbXM6IGFueVtdO1xuXG4gIC8vIHRoZSB1cmwgZGlzcGxheWVkIG9uIHRoZSBhbmNob3IgZWxlbWVudC5cbiAgdmlzaWJsZUhyZWY6IHN0cmluZztcbiAgdGFyZ2V0OiBzdHJpbmc7XG5cbiAgLy8gdGhlIGluc3RydWN0aW9uIHBhc3NlZCB0byB0aGUgcm91dGVyIHRvIG5hdmlnYXRlXG4gIHByaXZhdGUgX25hdmlnYXRpb25JbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb247XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcm91dGVyOiBSb3V0ZXIsIHByaXZhdGUgX2xvY2F0aW9uOiBMb2NhdGlvbikge31cblxuICBnZXQgaXNSb3V0ZUFjdGl2ZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3JvdXRlci5pc1JvdXRlQWN0aXZlKHRoaXMuX25hdmlnYXRpb25JbnN0cnVjdGlvbik7IH1cblxuICBzZXQgcm91dGVQYXJhbXMoY2hhbmdlczogYW55W10pIHtcbiAgICB0aGlzLl9yb3V0ZVBhcmFtcyA9IGNoYW5nZXM7XG4gICAgdGhpcy5fbmF2aWdhdGlvbkluc3RydWN0aW9uID0gdGhpcy5fcm91dGVyLmdlbmVyYXRlKHRoaXMuX3JvdXRlUGFyYW1zKTtcblxuICAgIHZhciBuYXZpZ2F0aW9uSHJlZiA9IHRoaXMuX25hdmlnYXRpb25JbnN0cnVjdGlvbi50b0xpbmtVcmwoKTtcbiAgICB0aGlzLnZpc2libGVIcmVmID0gdGhpcy5fbG9jYXRpb24ucHJlcGFyZUV4dGVybmFsVXJsKG5hdmlnYXRpb25IcmVmKTtcbiAgfVxuXG4gIG9uQ2xpY2soKTogYm9vbGVhbiB7XG4gICAgLy8gSWYgbm8gdGFyZ2V0LCBvciBpZiB0YXJnZXQgaXMgX3NlbGYsIHByZXZlbnQgZGVmYXVsdCBicm93c2VyIGJlaGF2aW9yXG4gICAgaWYgKCFpc1N0cmluZyh0aGlzLnRhcmdldCkgfHwgdGhpcy50YXJnZXQgPT0gJ19zZWxmJykge1xuICAgICAgdGhpcy5fcm91dGVyLm5hdmlnYXRlQnlJbnN0cnVjdGlvbih0aGlzLl9uYXZpZ2F0aW9uSW5zdHJ1Y3Rpb24pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19