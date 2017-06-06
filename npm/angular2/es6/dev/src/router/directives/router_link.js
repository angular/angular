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
import { Location } from 'angular2/platform/common';
import { isString } from 'angular2/src/facade/lang';
import { Router } from '../router';
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
export let RouterLink = class RouterLink {
    constructor(_router, _location) {
        this._router = _router;
        this._location = _location;
        // we need to update the link whenever a route changes to account for aux routes
        this._router.subscribe((_) => this._updateLink());
    }
    // because auxiliary links take existing primary and auxiliary routes into account,
    // we need to update the link whenever params or other routes change.
    _updateLink() {
        this._navigationInstruction = this._router.generate(this._routeParams);
        var navigationHref = this._navigationInstruction.toLinkUrl();
        this.visibleHref = this._location.prepareExternalUrl(navigationHref);
    }
    get isRouteActive() { return this._router.isRouteActive(this._navigationInstruction); }
    set routeParams(changes) {
        this._routeParams = changes;
        this._updateLink();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvcm91dGVyL2RpcmVjdGl2ZXMvcm91dGVyX2xpbmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxlQUFlO09BQ2hDLEVBQUMsUUFBUSxFQUFDLE1BQU0sMEJBQTBCO09BQzFDLEVBQUMsUUFBUSxFQUFDLE1BQU0sMEJBQTBCO09BRTFDLEVBQUMsTUFBTSxFQUFDLE1BQU0sV0FBVztBQUdoQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQVVIO0lBVUUsWUFBb0IsT0FBZSxFQUFVLFNBQW1CO1FBQTVDLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQzlELGdGQUFnRjtRQUNoRixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsbUZBQW1GO0lBQ25GLHFFQUFxRTtJQUM3RCxXQUFXO1FBQ2pCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdkUsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzdELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRUQsSUFBSSxhQUFhLEtBQWMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVoRyxJQUFJLFdBQVcsQ0FBQyxPQUFjO1FBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQsT0FBTztRQUNMLHdFQUF3RTtRQUN4RSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDaEUsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUM7QUEvQ0Q7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsY0FBYztRQUN4QixNQUFNLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxnQkFBZ0IsQ0FBQztRQUNyRCxJQUFJLEVBQUU7WUFDSixTQUFTLEVBQUUsV0FBVztZQUN0QixhQUFhLEVBQUUsYUFBYTtZQUM1Qiw0QkFBNEIsRUFBRSxlQUFlO1NBQzlDO0tBQ0YsQ0FBQzs7Y0FBQTtBQXVDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7TG9jYXRpb259IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbic7XG5pbXBvcnQge2lzU3RyaW5nfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge1JvdXRlcn0gZnJvbSAnLi4vcm91dGVyJztcbmltcG9ydCB7SW5zdHJ1Y3Rpb259IGZyb20gJy4uL2luc3RydWN0aW9uJztcblxuLyoqXG4gKiBUaGUgUm91dGVyTGluayBkaXJlY3RpdmUgbGV0cyB5b3UgbGluayB0byBzcGVjaWZpYyBwYXJ0cyBvZiB5b3VyIGFwcC5cbiAqXG4gKiBDb25zaWRlciB0aGUgZm9sbG93aW5nIHJvdXRlIGNvbmZpZ3VyYXRpb246XG5cbiAqIGBgYFxuICogQFJvdXRlQ29uZmlnKFtcbiAqICAgeyBwYXRoOiAnL3VzZXInLCBjb21wb25lbnQ6IFVzZXJDbXAsIGFzOiAnVXNlcicgfVxuICogXSk7XG4gKiBjbGFzcyBNeUNvbXAge31cbiAqIGBgYFxuICpcbiAqIFdoZW4gbGlua2luZyB0byB0aGlzIGBVc2VyYCByb3V0ZSwgeW91IGNhbiB3cml0ZTpcbiAqXG4gKiBgYGBcbiAqIDxhIFtyb3V0ZXJMaW5rXT1cIlsnLi9Vc2VyJ11cIj5saW5rIHRvIHVzZXIgY29tcG9uZW50PC9hPlxuICogYGBgXG4gKlxuICogUm91dGVyTGluayBleHBlY3RzIHRoZSB2YWx1ZSB0byBiZSBhbiBhcnJheSBvZiByb3V0ZSBuYW1lcywgZm9sbG93ZWQgYnkgdGhlIHBhcmFtc1xuICogZm9yIHRoYXQgbGV2ZWwgb2Ygcm91dGluZy4gRm9yIGluc3RhbmNlIGBbJy9UZWFtJywge3RlYW1JZDogMX0sICdVc2VyJywge3VzZXJJZDogMn1dYFxuICogbWVhbnMgdGhhdCB3ZSB3YW50IHRvIGdlbmVyYXRlIGEgbGluayBmb3IgdGhlIGBUZWFtYCByb3V0ZSB3aXRoIHBhcmFtcyBge3RlYW1JZDogMX1gLFxuICogYW5kIHdpdGggYSBjaGlsZCByb3V0ZSBgVXNlcmAgd2l0aCBwYXJhbXMgYHt1c2VySWQ6IDJ9YC5cbiAqXG4gKiBUaGUgZmlyc3Qgcm91dGUgbmFtZSBzaG91bGQgYmUgcHJlcGVuZGVkIHdpdGggYC9gLCBgLi9gLCBvciBgLi4vYC5cbiAqIElmIHRoZSByb3V0ZSBiZWdpbnMgd2l0aCBgL2AsIHRoZSByb3V0ZXIgd2lsbCBsb29rIHVwIHRoZSByb3V0ZSBmcm9tIHRoZSByb290IG9mIHRoZSBhcHAuXG4gKiBJZiB0aGUgcm91dGUgYmVnaW5zIHdpdGggYC4vYCwgdGhlIHJvdXRlciB3aWxsIGluc3RlYWQgbG9vayBpbiB0aGUgY3VycmVudCBjb21wb25lbnQnc1xuICogY2hpbGRyZW4gZm9yIHRoZSByb3V0ZS4gQW5kIGlmIHRoZSByb3V0ZSBiZWdpbnMgd2l0aCBgLi4vYCwgdGhlIHJvdXRlciB3aWxsIGxvb2sgYXQgdGhlXG4gKiBjdXJyZW50IGNvbXBvbmVudCdzIHBhcmVudC5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW3JvdXRlckxpbmtdJyxcbiAgaW5wdXRzOiBbJ3JvdXRlUGFyYW1zOiByb3V0ZXJMaW5rJywgJ3RhcmdldDogdGFyZ2V0J10sXG4gIGhvc3Q6IHtcbiAgICAnKGNsaWNrKSc6ICdvbkNsaWNrKCknLFxuICAgICdbYXR0ci5ocmVmXSc6ICd2aXNpYmxlSHJlZicsXG4gICAgJ1tjbGFzcy5yb3V0ZXItbGluay1hY3RpdmVdJzogJ2lzUm91dGVBY3RpdmUnXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgUm91dGVyTGluayB7XG4gIHByaXZhdGUgX3JvdXRlUGFyYW1zOiBhbnlbXTtcblxuICAvLyB0aGUgdXJsIGRpc3BsYXllZCBvbiB0aGUgYW5jaG9yIGVsZW1lbnQuXG4gIHZpc2libGVIcmVmOiBzdHJpbmc7XG4gIHRhcmdldDogc3RyaW5nO1xuXG4gIC8vIHRoZSBpbnN0cnVjdGlvbiBwYXNzZWQgdG8gdGhlIHJvdXRlciB0byBuYXZpZ2F0ZVxuICBwcml2YXRlIF9uYXZpZ2F0aW9uSW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3JvdXRlcjogUm91dGVyLCBwcml2YXRlIF9sb2NhdGlvbjogTG9jYXRpb24pIHtcbiAgICAvLyB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgbGluayB3aGVuZXZlciBhIHJvdXRlIGNoYW5nZXMgdG8gYWNjb3VudCBmb3IgYXV4IHJvdXRlc1xuICAgIHRoaXMuX3JvdXRlci5zdWJzY3JpYmUoKF8pID0+IHRoaXMuX3VwZGF0ZUxpbmsoKSk7XG4gIH1cblxuICAvLyBiZWNhdXNlIGF1eGlsaWFyeSBsaW5rcyB0YWtlIGV4aXN0aW5nIHByaW1hcnkgYW5kIGF1eGlsaWFyeSByb3V0ZXMgaW50byBhY2NvdW50LFxuICAvLyB3ZSBuZWVkIHRvIHVwZGF0ZSB0aGUgbGluayB3aGVuZXZlciBwYXJhbXMgb3Igb3RoZXIgcm91dGVzIGNoYW5nZS5cbiAgcHJpdmF0ZSBfdXBkYXRlTGluaygpOiB2b2lkIHtcbiAgICB0aGlzLl9uYXZpZ2F0aW9uSW5zdHJ1Y3Rpb24gPSB0aGlzLl9yb3V0ZXIuZ2VuZXJhdGUodGhpcy5fcm91dGVQYXJhbXMpO1xuICAgIHZhciBuYXZpZ2F0aW9uSHJlZiA9IHRoaXMuX25hdmlnYXRpb25JbnN0cnVjdGlvbi50b0xpbmtVcmwoKTtcbiAgICB0aGlzLnZpc2libGVIcmVmID0gdGhpcy5fbG9jYXRpb24ucHJlcGFyZUV4dGVybmFsVXJsKG5hdmlnYXRpb25IcmVmKTtcbiAgfVxuXG4gIGdldCBpc1JvdXRlQWN0aXZlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fcm91dGVyLmlzUm91dGVBY3RpdmUodGhpcy5fbmF2aWdhdGlvbkluc3RydWN0aW9uKTsgfVxuXG4gIHNldCByb3V0ZVBhcmFtcyhjaGFuZ2VzOiBhbnlbXSkge1xuICAgIHRoaXMuX3JvdXRlUGFyYW1zID0gY2hhbmdlcztcbiAgICB0aGlzLl91cGRhdGVMaW5rKCk7XG4gIH1cblxuICBvbkNsaWNrKCk6IGJvb2xlYW4ge1xuICAgIC8vIElmIG5vIHRhcmdldCwgb3IgaWYgdGFyZ2V0IGlzIF9zZWxmLCBwcmV2ZW50IGRlZmF1bHQgYnJvd3NlciBiZWhhdmlvclxuICAgIGlmICghaXNTdHJpbmcodGhpcy50YXJnZXQpIHx8IHRoaXMudGFyZ2V0ID09ICdfc2VsZicpIHtcbiAgICAgIHRoaXMuX3JvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24odGhpcy5fbmF2aWdhdGlvbkluc3RydWN0aW9uKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==