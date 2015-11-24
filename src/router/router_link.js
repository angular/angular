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
var angular2_1 = require('angular2/angular2');
var lang_1 = require('angular2/src/facade/lang');
var router_1 = require('./router');
var location_1 = require('./location');
var instruction_1 = require('./instruction');
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
            var navigationHref = instruction_1.stringifyInstruction(this._navigationInstruction);
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
        angular2_1.Directive({
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
//# sourceMappingURL=router_link.js.map