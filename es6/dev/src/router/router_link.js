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
import { Directive } from 'angular2/core';
import { isString } from 'angular2/src/facade/lang';
import { Router } from './router';
import { Location } from './location';
import { stringifyInstruction } from './instruction';
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
export let RouterLink = class {
    constructor(_router, _location) {
        this._router = _router;
        this._location = _location;
    }
    get isRouteActive() { return this._router.isRouteActive(this._navigationInstruction); }
    set routeParams(changes) {
        this._routeParams = changes;
        this._navigationInstruction = this._router.generate(this._routeParams);
        var navigationHref = stringifyInstruction(this._navigationInstruction);
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
        selector: '[router-link]',
        inputs: ['routeParams: routerLink', 'target: target'],
        host: {
            '(click)': 'onClick()',
            '[attr.href]': 'visibleHref',
            '[class.router-link-active]': 'isRouteActive'
        }
    }), 
    __metadata('design:paramtypes', [Router, Location])
], RouterLink);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlcl9saW5rLnRzIl0sIm5hbWVzIjpbIlJvdXRlckxpbmsiLCJSb3V0ZXJMaW5rLmNvbnN0cnVjdG9yIiwiUm91dGVyTGluay5pc1JvdXRlQWN0aXZlIiwiUm91dGVyTGluay5yb3V0ZVBhcmFtcyIsIlJvdXRlckxpbmsub25DbGljayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGVBQWU7T0FDaEMsRUFBQyxRQUFRLEVBQUMsTUFBTSwwQkFBMEI7T0FFMUMsRUFBQyxNQUFNLEVBQUMsTUFBTSxVQUFVO09BQ3hCLEVBQUMsUUFBUSxFQUFDLE1BQU0sWUFBWTtPQUM1QixFQUFjLG9CQUFvQixFQUFDLE1BQU0sZUFBZTtBQUUvRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNIO0lBbUJFQSxZQUFvQkEsT0FBZUEsRUFBVUEsU0FBbUJBO1FBQTVDQyxZQUFPQSxHQUFQQSxPQUFPQSxDQUFRQTtRQUFVQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFVQTtJQUFHQSxDQUFDQTtJQUVwRUQsSUFBSUEsYUFBYUEsS0FBY0UsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVoR0YsSUFBSUEsV0FBV0EsQ0FBQ0EsT0FBY0E7UUFDNUJHLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLE9BQU9BLENBQUNBO1FBQzVCQSxJQUFJQSxDQUFDQSxzQkFBc0JBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBRXZFQSxJQUFJQSxjQUFjQSxHQUFHQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsQ0FBQ0E7UUFDdkVBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7SUFDdkVBLENBQUNBO0lBRURILE9BQU9BO1FBQ0xJLHdFQUF3RUE7UUFDeEVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLElBQUlBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ3JEQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxxQkFBcUJBLENBQUNBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsQ0FBQ0E7WUFDaEVBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2ZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0FBQ0hKLENBQUNBO0FBdkNEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGVBQWU7UUFDekIsTUFBTSxFQUFFLENBQUMseUJBQXlCLEVBQUUsZ0JBQWdCLENBQUM7UUFDckQsSUFBSSxFQUFFO1lBQ0osU0FBUyxFQUFFLFdBQVc7WUFDdEIsYUFBYSxFQUFFLGFBQWE7WUFDNUIsNEJBQTRCLEVBQUUsZUFBZTtTQUM5QztLQUNGLENBQUM7O2VBK0JEO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2lzU3RyaW5nfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge1JvdXRlcn0gZnJvbSAnLi9yb3V0ZXInO1xuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnLi9sb2NhdGlvbic7XG5pbXBvcnQge0luc3RydWN0aW9uLCBzdHJpbmdpZnlJbnN0cnVjdGlvbn0gZnJvbSAnLi9pbnN0cnVjdGlvbic7XG5cbi8qKlxuICogVGhlIFJvdXRlckxpbmsgZGlyZWN0aXZlIGxldHMgeW91IGxpbmsgdG8gc3BlY2lmaWMgcGFydHMgb2YgeW91ciBhcHAuXG4gKlxuICogQ29uc2lkZXIgdGhlIGZvbGxvd2luZyByb3V0ZSBjb25maWd1cmF0aW9uOlxuXG4gKiBgYGBcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgIHsgcGF0aDogJy91c2VyJywgY29tcG9uZW50OiBVc2VyQ21wLCBhczogJ1VzZXInIH1cbiAqIF0pO1xuICogY2xhc3MgTXlDb21wIHt9XG4gKiBgYGBcbiAqXG4gKiBXaGVuIGxpbmtpbmcgdG8gdGhpcyBgVXNlcmAgcm91dGUsIHlvdSBjYW4gd3JpdGU6XG4gKlxuICogYGBgXG4gKiA8YSBbcm91dGVyLWxpbmtdPVwiWycuL1VzZXInXVwiPmxpbmsgdG8gdXNlciBjb21wb25lbnQ8L2E+XG4gKiBgYGBcbiAqXG4gKiBSb3V0ZXJMaW5rIGV4cGVjdHMgdGhlIHZhbHVlIHRvIGJlIGFuIGFycmF5IG9mIHJvdXRlIG5hbWVzLCBmb2xsb3dlZCBieSB0aGUgcGFyYW1zXG4gKiBmb3IgdGhhdCBsZXZlbCBvZiByb3V0aW5nLiBGb3IgaW5zdGFuY2UgYFsnL1RlYW0nLCB7dGVhbUlkOiAxfSwgJ1VzZXInLCB7dXNlcklkOiAyfV1gXG4gKiBtZWFucyB0aGF0IHdlIHdhbnQgdG8gZ2VuZXJhdGUgYSBsaW5rIGZvciB0aGUgYFRlYW1gIHJvdXRlIHdpdGggcGFyYW1zIGB7dGVhbUlkOiAxfWAsXG4gKiBhbmQgd2l0aCBhIGNoaWxkIHJvdXRlIGBVc2VyYCB3aXRoIHBhcmFtcyBge3VzZXJJZDogMn1gLlxuICpcbiAqIFRoZSBmaXJzdCByb3V0ZSBuYW1lIHNob3VsZCBiZSBwcmVwZW5kZWQgd2l0aCBgL2AsIGAuL2AsIG9yIGAuLi9gLlxuICogSWYgdGhlIHJvdXRlIGJlZ2lucyB3aXRoIGAvYCwgdGhlIHJvdXRlciB3aWxsIGxvb2sgdXAgdGhlIHJvdXRlIGZyb20gdGhlIHJvb3Qgb2YgdGhlIGFwcC5cbiAqIElmIHRoZSByb3V0ZSBiZWdpbnMgd2l0aCBgLi9gLCB0aGUgcm91dGVyIHdpbGwgaW5zdGVhZCBsb29rIGluIHRoZSBjdXJyZW50IGNvbXBvbmVudCdzXG4gKiBjaGlsZHJlbiBmb3IgdGhlIHJvdXRlLiBBbmQgaWYgdGhlIHJvdXRlIGJlZ2lucyB3aXRoIGAuLi9gLCB0aGUgcm91dGVyIHdpbGwgbG9vayBhdCB0aGVcbiAqIGN1cnJlbnQgY29tcG9uZW50J3MgcGFyZW50LlxuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbcm91dGVyLWxpbmtdJyxcbiAgaW5wdXRzOiBbJ3JvdXRlUGFyYW1zOiByb3V0ZXJMaW5rJywgJ3RhcmdldDogdGFyZ2V0J10sXG4gIGhvc3Q6IHtcbiAgICAnKGNsaWNrKSc6ICdvbkNsaWNrKCknLFxuICAgICdbYXR0ci5ocmVmXSc6ICd2aXNpYmxlSHJlZicsXG4gICAgJ1tjbGFzcy5yb3V0ZXItbGluay1hY3RpdmVdJzogJ2lzUm91dGVBY3RpdmUnXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgUm91dGVyTGluayB7XG4gIHByaXZhdGUgX3JvdXRlUGFyYW1zOiBhbnlbXTtcblxuICAvLyB0aGUgdXJsIGRpc3BsYXllZCBvbiB0aGUgYW5jaG9yIGVsZW1lbnQuXG4gIHZpc2libGVIcmVmOiBzdHJpbmc7XG4gIHRhcmdldDogc3RyaW5nO1xuXG4gIC8vIHRoZSBpbnN0cnVjdGlvbiBwYXNzZWQgdG8gdGhlIHJvdXRlciB0byBuYXZpZ2F0ZVxuICBwcml2YXRlIF9uYXZpZ2F0aW9uSW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3JvdXRlcjogUm91dGVyLCBwcml2YXRlIF9sb2NhdGlvbjogTG9jYXRpb24pIHt9XG5cbiAgZ2V0IGlzUm91dGVBY3RpdmUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9yb3V0ZXIuaXNSb3V0ZUFjdGl2ZSh0aGlzLl9uYXZpZ2F0aW9uSW5zdHJ1Y3Rpb24pOyB9XG5cbiAgc2V0IHJvdXRlUGFyYW1zKGNoYW5nZXM6IGFueVtdKSB7XG4gICAgdGhpcy5fcm91dGVQYXJhbXMgPSBjaGFuZ2VzO1xuICAgIHRoaXMuX25hdmlnYXRpb25JbnN0cnVjdGlvbiA9IHRoaXMuX3JvdXRlci5nZW5lcmF0ZSh0aGlzLl9yb3V0ZVBhcmFtcyk7XG5cbiAgICB2YXIgbmF2aWdhdGlvbkhyZWYgPSBzdHJpbmdpZnlJbnN0cnVjdGlvbih0aGlzLl9uYXZpZ2F0aW9uSW5zdHJ1Y3Rpb24pO1xuICAgIHRoaXMudmlzaWJsZUhyZWYgPSB0aGlzLl9sb2NhdGlvbi5wcmVwYXJlRXh0ZXJuYWxVcmwobmF2aWdhdGlvbkhyZWYpO1xuICB9XG5cbiAgb25DbGljaygpOiBib29sZWFuIHtcbiAgICAvLyBJZiBubyB0YXJnZXQsIG9yIGlmIHRhcmdldCBpcyBfc2VsZiwgcHJldmVudCBkZWZhdWx0IGJyb3dzZXIgYmVoYXZpb3JcbiAgICBpZiAoIWlzU3RyaW5nKHRoaXMudGFyZ2V0KSB8fCB0aGlzLnRhcmdldCA9PSAnX3NlbGYnKSB7XG4gICAgICB0aGlzLl9yb3V0ZXIubmF2aWdhdGVCeUluc3RydWN0aW9uKHRoaXMuX25hdmlnYXRpb25JbnN0cnVjdGlvbik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iXX0=