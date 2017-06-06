'use strict';"use strict";
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
var core_1 = require('angular2/core');
var router_1 = require('../router');
var segments_1 = require('../segments');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var RouterLink = (function () {
    function RouterLink(_routeSegment, _router) {
        var _this = this;
        this._routeSegment = _routeSegment;
        this._router = _router;
        this._changes = [];
        this._subscription =
            async_1.ObservableWrapper.subscribe(_router.changes, function (_) { _this._updateTargetUrlAndHref(); });
    }
    RouterLink.prototype.ngOnDestroy = function () { async_1.ObservableWrapper.dispose(this._subscription); };
    Object.defineProperty(RouterLink.prototype, "routerLink", {
        set: function (data) {
            this._changes = data;
            this._updateTargetUrlAndHref();
        },
        enumerable: true,
        configurable: true
    });
    RouterLink.prototype.onClick = function () {
        if (!lang_1.isString(this.target) || this.target == '_self') {
            this._router.navigate(this._changes, this._routeSegment);
            return false;
        }
        return true;
    };
    RouterLink.prototype._updateTargetUrlAndHref = function () {
        var tree = this._router.createUrlTree(this._changes, this._routeSegment);
        if (lang_1.isPresent(tree)) {
            this.href = this._router.serializeUrl(tree);
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], RouterLink.prototype, "target", void 0);
    __decorate([
        core_1.HostBinding(), 
        __metadata('design:type', String)
    ], RouterLink.prototype, "href", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array), 
        __metadata('design:paramtypes', [Array])
    ], RouterLink.prototype, "routerLink", null);
    __decorate([
        core_1.HostListener("click"), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', Boolean)
    ], RouterLink.prototype, "onClick", null);
    RouterLink = __decorate([
        core_1.Directive({ selector: '[routerLink]' }),
        __param(0, core_1.Optional()), 
        __metadata('design:paramtypes', [segments_1.RouteSegment, router_1.Router])
    ], RouterLink);
    return RouterLink;
}());
exports.RouterLink = RouterLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvYWx0X3JvdXRlci9kaXJlY3RpdmVzL3JvdXRlcl9saW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxxQkFlTyxlQUFlLENBQUMsQ0FBQTtBQUN2Qix1QkFBc0MsV0FBVyxDQUFDLENBQUE7QUFDbEQseUJBQTZDLGFBQWEsQ0FBQyxDQUFBO0FBQzNELHFCQUFrQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzdELHNCQUFnQywyQkFBMkIsQ0FBQyxDQUFBO0FBRzVEO0lBT0Usb0JBQWdDLGFBQTJCLEVBQVUsT0FBZTtRQVB0RixpQkFtQ0M7UUE1QmlDLGtCQUFhLEdBQWIsYUFBYSxDQUFjO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUw1RSxhQUFRLEdBQVUsRUFBRSxDQUFDO1FBTTNCLElBQUksQ0FBQyxhQUFhO1lBQ2QseUJBQWlCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsVUFBQyxDQUFDLElBQU8sS0FBSSxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRixDQUFDO0lBRUQsZ0NBQVcsR0FBWCxjQUFnQix5QkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUdoRSxzQkFBSSxrQ0FBVTthQUFkLFVBQWUsSUFBVztZQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNyQixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUNqQyxDQUFDOzs7T0FBQTtJQUdELDRCQUFPLEdBQVA7UUFDRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTyw0Q0FBdUIsR0FBL0I7UUFDRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN6RSxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlDLENBQUM7SUFDSCxDQUFDO0lBakNEO1FBQUMsWUFBSyxFQUFFOzs4Q0FBQTtJQUlSO1FBQUMsa0JBQVcsRUFBRTs7NENBQUE7SUFTZDtRQUFDLFlBQUssRUFBRTs7O2dEQUFBO0lBTVI7UUFBQyxtQkFBWSxDQUFDLE9BQU8sQ0FBQzs7Ozs2Q0FBQTtJQXJCeEI7UUFBQyxnQkFBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGNBQWMsRUFBQyxDQUFDO21CQVF2QixlQUFRLEVBQUU7O2tCQVJhO0lBb0N0QyxpQkFBQztBQUFELENBQUMsQUFuQ0QsSUFtQ0M7QUFuQ1ksa0JBQVUsYUFtQ3RCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBSZXNvbHZlZFJlZmxlY3RpdmVQcm92aWRlcixcbiAgRGlyZWN0aXZlLFxuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBBdHRyaWJ1dGUsXG4gIENvbXBvbmVudFJlZixcbiAgQ29tcG9uZW50RmFjdG9yeSxcbiAgUmVmbGVjdGl2ZUluamVjdG9yLFxuICBPbkluaXQsXG4gIEhvc3RMaXN0ZW5lcixcbiAgSG9zdEJpbmRpbmcsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtSb3V0ZXJPdXRsZXRNYXAsIFJvdXRlcn0gZnJvbSAnLi4vcm91dGVyJztcbmltcG9ydCB7Um91dGVTZWdtZW50LCBVcmxTZWdtZW50LCBUcmVlfSBmcm9tICcuLi9zZWdtZW50cyc7XG5pbXBvcnQge2lzU3RyaW5nLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbcm91dGVyTGlua10nfSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJMaW5rIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgQElucHV0KCkgdGFyZ2V0OiBzdHJpbmc7XG4gIHByaXZhdGUgX2NoYW5nZXM6IGFueVtdID0gW107XG4gIHByaXZhdGUgX3N1YnNjcmlwdGlvbjogYW55O1xuXG4gIEBIb3N0QmluZGluZygpIHByaXZhdGUgaHJlZjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIHByaXZhdGUgX3JvdXRlU2VnbWVudDogUm91dGVTZWdtZW50LCBwcml2YXRlIF9yb3V0ZXI6IFJvdXRlcikge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9XG4gICAgICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShfcm91dGVyLmNoYW5nZXMsIChfKSA9PiB7IHRoaXMuX3VwZGF0ZVRhcmdldFVybEFuZEhyZWYoKTsgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHsgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLl9zdWJzY3JpcHRpb24pOyB9XG5cbiAgQElucHV0KClcbiAgc2V0IHJvdXRlckxpbmsoZGF0YTogYW55W10pIHtcbiAgICB0aGlzLl9jaGFuZ2VzID0gZGF0YTtcbiAgICB0aGlzLl91cGRhdGVUYXJnZXRVcmxBbmRIcmVmKCk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKFwiY2xpY2tcIilcbiAgb25DbGljaygpOiBib29sZWFuIHtcbiAgICBpZiAoIWlzU3RyaW5nKHRoaXMudGFyZ2V0KSB8fCB0aGlzLnRhcmdldCA9PSAnX3NlbGYnKSB7XG4gICAgICB0aGlzLl9yb3V0ZXIubmF2aWdhdGUodGhpcy5fY2hhbmdlcywgdGhpcy5fcm91dGVTZWdtZW50KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVUYXJnZXRVcmxBbmRIcmVmKCk6IHZvaWQge1xuICAgIGxldCB0cmVlID0gdGhpcy5fcm91dGVyLmNyZWF0ZVVybFRyZWUodGhpcy5fY2hhbmdlcywgdGhpcy5fcm91dGVTZWdtZW50KTtcbiAgICBpZiAoaXNQcmVzZW50KHRyZWUpKSB7XG4gICAgICB0aGlzLmhyZWYgPSB0aGlzLl9yb3V0ZXIuc2VyaWFsaXplVXJsKHRyZWUpO1xuICAgIH1cbiAgfVxufSJdfQ==