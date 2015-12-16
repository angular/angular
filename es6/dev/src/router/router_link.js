var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive } from 'angular2/core';
import { isString } from 'angular2/src/facade/lang';
import { Router } from './router';
import { Location } from './location';
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
export let RouterLink = class {
    constructor(_router, _location) {
        this._router = _router;
        this._location = _location;
    }
    get isRouteActive() { return this._router.isRouteActive(this._navigationInstruction); }
    set routeParams(changes) {
        this._routeParams = changes;
        this._navigationInstruction = this._router.generate(this._routeParams);
        var navigationHref = this._navigationInstruction.toLinkUrl();
        this.visibleHref = this._location.prepareExternalUrl(navigationHref);
    }
    onClick() {
        // If no target, or if target is _self, prevent default browser behavior
        if (!isString(this.target) || this.target == '_self') {
            this._router.navigateByInstruction(this._navigationInstruction);
            return false;
        }
        return true;
    }
};
RouterLink = __decorate([
    Directive({
        selector: '[routerLink]',
        inputs: ['routeParams: routerLink', 'target: target'],
        host: {
            '(click)': 'onClick()',
            '[attr.href]': 'visibleHref',
            '[class.router-link-active]': 'isRouteActive'
        }
    }), 
    __metadata('design:paramtypes', [Router, Location])
], RouterLink);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlcl9saW5rLnRzIl0sIm5hbWVzIjpbIlJvdXRlckxpbmsiLCJSb3V0ZXJMaW5rLmNvbnN0cnVjdG9yIiwiUm91dGVyTGluay5pc1JvdXRlQWN0aXZlIiwiUm91dGVyTGluay5yb3V0ZVBhcmFtcyIsIlJvdXRlckxpbmsub25DbGljayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxlQUFlO09BQ2hDLEVBQUMsUUFBUSxFQUFDLE1BQU0sMEJBQTBCO09BRTFDLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVTtPQUN4QixFQUFDLFFBQVEsRUFBQyxNQUFNLFlBQVk7QUFHbkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Qkc7QUFDSDtJQW1CRUEsWUFBb0JBLE9BQWVBLEVBQVVBLFNBQW1CQTtRQUE1Q0MsWUFBT0EsR0FBUEEsT0FBT0EsQ0FBUUE7UUFBVUEsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBVUE7SUFBR0EsQ0FBQ0E7SUFFcEVELElBQUlBLGFBQWFBLEtBQWNFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFaEdGLElBQUlBLFdBQVdBLENBQUNBLE9BQWNBO1FBQzVCRyxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxPQUFPQSxDQUFDQTtRQUM1QkEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUV2RUEsSUFBSUEsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUM3REEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtJQUN2RUEsQ0FBQ0E7SUFFREgsT0FBT0E7UUFDTEksd0VBQXdFQTtRQUN4RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsSUFBSUEsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckRBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLHFCQUFxQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxDQUFDQTtZQUNoRUEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7QUFDSEosQ0FBQ0E7QUF2Q0Q7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsY0FBYztRQUN4QixNQUFNLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxnQkFBZ0IsQ0FBQztRQUNyRCxJQUFJLEVBQUU7WUFDSixTQUFTLEVBQUUsV0FBVztZQUN0QixhQUFhLEVBQUUsYUFBYTtZQUM1Qiw0QkFBNEIsRUFBRSxlQUFlO1NBQzlDO0tBQ0YsQ0FBQzs7ZUErQkQ7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7aXNTdHJpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7Um91dGVyfSBmcm9tICcuL3JvdXRlcic7XG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICcuL2xvY2F0aW9uJztcbmltcG9ydCB7SW5zdHJ1Y3Rpb259IGZyb20gJy4vaW5zdHJ1Y3Rpb24nO1xuXG4vKipcbiAqIFRoZSBSb3V0ZXJMaW5rIGRpcmVjdGl2ZSBsZXRzIHlvdSBsaW5rIHRvIHNwZWNpZmljIHBhcnRzIG9mIHlvdXIgYXBwLlxuICpcbiAqIENvbnNpZGVyIHRoZSBmb2xsb3dpbmcgcm91dGUgY29uZmlndXJhdGlvbjpcblxuICogYGBgXG4gKiBAUm91dGVDb25maWcoW1xuICogICB7IHBhdGg6ICcvdXNlcicsIGNvbXBvbmVudDogVXNlckNtcCwgYXM6ICdVc2VyJyB9XG4gKiBdKTtcbiAqIGNsYXNzIE15Q29tcCB7fVxuICogYGBgXG4gKlxuICogV2hlbiBsaW5raW5nIHRvIHRoaXMgYFVzZXJgIHJvdXRlLCB5b3UgY2FuIHdyaXRlOlxuICpcbiAqIGBgYFxuICogPGEgW3JvdXRlckxpbmtdPVwiWycuL1VzZXInXVwiPmxpbmsgdG8gdXNlciBjb21wb25lbnQ8L2E+XG4gKiBgYGBcbiAqXG4gKiBSb3V0ZXJMaW5rIGV4cGVjdHMgdGhlIHZhbHVlIHRvIGJlIGFuIGFycmF5IG9mIHJvdXRlIG5hbWVzLCBmb2xsb3dlZCBieSB0aGUgcGFyYW1zXG4gKiBmb3IgdGhhdCBsZXZlbCBvZiByb3V0aW5nLiBGb3IgaW5zdGFuY2UgYFsnL1RlYW0nLCB7dGVhbUlkOiAxfSwgJ1VzZXInLCB7dXNlcklkOiAyfV1gXG4gKiBtZWFucyB0aGF0IHdlIHdhbnQgdG8gZ2VuZXJhdGUgYSBsaW5rIGZvciB0aGUgYFRlYW1gIHJvdXRlIHdpdGggcGFyYW1zIGB7dGVhbUlkOiAxfWAsXG4gKiBhbmQgd2l0aCBhIGNoaWxkIHJvdXRlIGBVc2VyYCB3aXRoIHBhcmFtcyBge3VzZXJJZDogMn1gLlxuICpcbiAqIFRoZSBmaXJzdCByb3V0ZSBuYW1lIHNob3VsZCBiZSBwcmVwZW5kZWQgd2l0aCBgL2AsIGAuL2AsIG9yIGAuLi9gLlxuICogSWYgdGhlIHJvdXRlIGJlZ2lucyB3aXRoIGAvYCwgdGhlIHJvdXRlciB3aWxsIGxvb2sgdXAgdGhlIHJvdXRlIGZyb20gdGhlIHJvb3Qgb2YgdGhlIGFwcC5cbiAqIElmIHRoZSByb3V0ZSBiZWdpbnMgd2l0aCBgLi9gLCB0aGUgcm91dGVyIHdpbGwgaW5zdGVhZCBsb29rIGluIHRoZSBjdXJyZW50IGNvbXBvbmVudCdzXG4gKiBjaGlsZHJlbiBmb3IgdGhlIHJvdXRlLiBBbmQgaWYgdGhlIHJvdXRlIGJlZ2lucyB3aXRoIGAuLi9gLCB0aGUgcm91dGVyIHdpbGwgbG9vayBhdCB0aGVcbiAqIGN1cnJlbnQgY29tcG9uZW50J3MgcGFyZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcm91dGVyTGlua10nLFxuICBpbnB1dHM6IFsncm91dGVQYXJhbXM6IHJvdXRlckxpbmsnLCAndGFyZ2V0OiB0YXJnZXQnXSxcbiAgaG9zdDoge1xuICAgICcoY2xpY2spJzogJ29uQ2xpY2soKScsXG4gICAgJ1thdHRyLmhyZWZdJzogJ3Zpc2libGVIcmVmJyxcbiAgICAnW2NsYXNzLnJvdXRlci1saW5rLWFjdGl2ZV0nOiAnaXNSb3V0ZUFjdGl2ZSdcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJMaW5rIHtcbiAgcHJpdmF0ZSBfcm91dGVQYXJhbXM6IGFueVtdO1xuXG4gIC8vIHRoZSB1cmwgZGlzcGxheWVkIG9uIHRoZSBhbmNob3IgZWxlbWVudC5cbiAgdmlzaWJsZUhyZWY6IHN0cmluZztcbiAgdGFyZ2V0OiBzdHJpbmc7XG5cbiAgLy8gdGhlIGluc3RydWN0aW9uIHBhc3NlZCB0byB0aGUgcm91dGVyIHRvIG5hdmlnYXRlXG4gIHByaXZhdGUgX25hdmlnYXRpb25JbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb247XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcm91dGVyOiBSb3V0ZXIsIHByaXZhdGUgX2xvY2F0aW9uOiBMb2NhdGlvbikge31cblxuICBnZXQgaXNSb3V0ZUFjdGl2ZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3JvdXRlci5pc1JvdXRlQWN0aXZlKHRoaXMuX25hdmlnYXRpb25JbnN0cnVjdGlvbik7IH1cblxuICBzZXQgcm91dGVQYXJhbXMoY2hhbmdlczogYW55W10pIHtcbiAgICB0aGlzLl9yb3V0ZVBhcmFtcyA9IGNoYW5nZXM7XG4gICAgdGhpcy5fbmF2aWdhdGlvbkluc3RydWN0aW9uID0gdGhpcy5fcm91dGVyLmdlbmVyYXRlKHRoaXMuX3JvdXRlUGFyYW1zKTtcblxuICAgIHZhciBuYXZpZ2F0aW9uSHJlZiA9IHRoaXMuX25hdmlnYXRpb25JbnN0cnVjdGlvbi50b0xpbmtVcmwoKTtcbiAgICB0aGlzLnZpc2libGVIcmVmID0gdGhpcy5fbG9jYXRpb24ucHJlcGFyZUV4dGVybmFsVXJsKG5hdmlnYXRpb25IcmVmKTtcbiAgfVxuXG4gIG9uQ2xpY2soKTogYm9vbGVhbiB7XG4gICAgLy8gSWYgbm8gdGFyZ2V0LCBvciBpZiB0YXJnZXQgaXMgX3NlbGYsIHByZXZlbnQgZGVmYXVsdCBicm93c2VyIGJlaGF2aW9yXG4gICAgaWYgKCFpc1N0cmluZyh0aGlzLnRhcmdldCkgfHwgdGhpcy50YXJnZXQgPT0gJ19zZWxmJykge1xuICAgICAgdGhpcy5fcm91dGVyLm5hdmlnYXRlQnlJbnN0cnVjdGlvbih0aGlzLl9uYXZpZ2F0aW9uSW5zdHJ1Y3Rpb24pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19