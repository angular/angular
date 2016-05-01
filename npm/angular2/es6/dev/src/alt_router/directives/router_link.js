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
import { Directive, HostListener, HostBinding, Input, Optional } from 'angular2/core';
import { Router } from '../router';
import { RouteSegment } from '../segments';
import { isString, isPresent } from 'angular2/src/facade/lang';
import { ObservableWrapper } from 'angular2/src/facade/async';
export let RouterLink = class RouterLink {
    constructor(_routeSegment, _router) {
        this._routeSegment = _routeSegment;
        this._router = _router;
        this._changes = [];
        this._subscription =
            ObservableWrapper.subscribe(_router.changes, (_) => { this._updateTargetUrlAndHref(); });
    }
    ngOnDestroy() { ObservableWrapper.dispose(this._subscription); }
    set routerLink(data) {
        this._changes = data;
        this._updateTargetUrlAndHref();
    }
    onClick() {
        if (!isString(this.target) || this.target == '_self') {
            this._router.navigate(this._changes, this._routeSegment);
            return false;
        }
        return true;
    }
    _updateTargetUrlAndHref() {
        let tree = this._router.createUrlTree(this._changes, this._routeSegment);
        if (isPresent(tree)) {
            this.href = this._router.serializeUrl(tree);
        }
    }
};
__decorate([
    Input(), 
    __metadata('design:type', String)
], RouterLink.prototype, "target", void 0);
__decorate([
    HostBinding(), 
    __metadata('design:type', String)
], RouterLink.prototype, "href", void 0);
__decorate([
    Input(), 
    __metadata('design:type', Array), 
    __metadata('design:paramtypes', [Array])
], RouterLink.prototype, "routerLink", null);
__decorate([
    HostListener("click"), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', []), 
    __metadata('design:returntype', Boolean)
], RouterLink.prototype, "onClick", null);
RouterLink = __decorate([
    Directive({ selector: '[routerLink]' }),
    __param(0, Optional()), 
    __metadata('design:paramtypes', [RouteSegment, Router])
], RouterLink);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX2xpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvYWx0X3JvdXRlci9kaXJlY3RpdmVzL3JvdXRlcl9saW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBRUwsU0FBUyxFQVFULFlBQVksRUFDWixXQUFXLEVBQ1gsS0FBSyxFQUVMLFFBQVEsRUFDVCxNQUFNLGVBQWU7T0FDZixFQUFrQixNQUFNLEVBQUMsTUFBTSxXQUFXO09BQzFDLEVBQUMsWUFBWSxFQUFtQixNQUFNLGFBQWE7T0FDbkQsRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFDLE1BQU0sMEJBQTBCO09BQ3JELEVBQUMsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7QUFHM0Q7SUFPRSxZQUFnQyxhQUEyQixFQUFVLE9BQWU7UUFBcEQsa0JBQWEsR0FBYixhQUFhLENBQWM7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBTDVFLGFBQVEsR0FBVSxFQUFFLENBQUM7UUFNM0IsSUFBSSxDQUFDLGFBQWE7WUFDZCxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9GLENBQUM7SUFFRCxXQUFXLEtBQUssaUJBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFHaEUsSUFBSSxVQUFVLENBQUMsSUFBVztRQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBR0QsT0FBTztRQUNMLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLHVCQUF1QjtRQUM3QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN6RSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBbENDO0lBQUMsS0FBSyxFQUFFOzswQ0FBQTtBQUlSO0lBQUMsV0FBVyxFQUFFOzt3Q0FBQTtBQVNkO0lBQUMsS0FBSyxFQUFFOzs7NENBQUE7QUFNUjtJQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7Ozs7eUNBQUE7QUFyQnhCO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGNBQWMsRUFBQyxDQUFDO2VBUXZCLFFBQVEsRUFBRTs7Y0FSYTtBQW9DckMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBSZXNvbHZlZFJlZmxlY3RpdmVQcm92aWRlcixcbiAgRGlyZWN0aXZlLFxuICBEeW5hbWljQ29tcG9uZW50TG9hZGVyLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBBdHRyaWJ1dGUsXG4gIENvbXBvbmVudFJlZixcbiAgQ29tcG9uZW50RmFjdG9yeSxcbiAgUmVmbGVjdGl2ZUluamVjdG9yLFxuICBPbkluaXQsXG4gIEhvc3RMaXN0ZW5lcixcbiAgSG9zdEJpbmRpbmcsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE9wdGlvbmFsXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtSb3V0ZXJPdXRsZXRNYXAsIFJvdXRlcn0gZnJvbSAnLi4vcm91dGVyJztcbmltcG9ydCB7Um91dGVTZWdtZW50LCBVcmxTZWdtZW50LCBUcmVlfSBmcm9tICcuLi9zZWdtZW50cyc7XG5pbXBvcnQge2lzU3RyaW5nLCBpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge09ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbcm91dGVyTGlua10nfSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJMaW5rIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgQElucHV0KCkgdGFyZ2V0OiBzdHJpbmc7XG4gIHByaXZhdGUgX2NoYW5nZXM6IGFueVtdID0gW107XG4gIHByaXZhdGUgX3N1YnNjcmlwdGlvbjogYW55O1xuXG4gIEBIb3N0QmluZGluZygpIHByaXZhdGUgaHJlZjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIHByaXZhdGUgX3JvdXRlU2VnbWVudDogUm91dGVTZWdtZW50LCBwcml2YXRlIF9yb3V0ZXI6IFJvdXRlcikge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9XG4gICAgICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShfcm91dGVyLmNoYW5nZXMsIChfKSA9PiB7IHRoaXMuX3VwZGF0ZVRhcmdldFVybEFuZEhyZWYoKTsgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHsgT2JzZXJ2YWJsZVdyYXBwZXIuZGlzcG9zZSh0aGlzLl9zdWJzY3JpcHRpb24pOyB9XG5cbiAgQElucHV0KClcbiAgc2V0IHJvdXRlckxpbmsoZGF0YTogYW55W10pIHtcbiAgICB0aGlzLl9jaGFuZ2VzID0gZGF0YTtcbiAgICB0aGlzLl91cGRhdGVUYXJnZXRVcmxBbmRIcmVmKCk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKFwiY2xpY2tcIilcbiAgb25DbGljaygpOiBib29sZWFuIHtcbiAgICBpZiAoIWlzU3RyaW5nKHRoaXMudGFyZ2V0KSB8fCB0aGlzLnRhcmdldCA9PSAnX3NlbGYnKSB7XG4gICAgICB0aGlzLl9yb3V0ZXIubmF2aWdhdGUodGhpcy5fY2hhbmdlcywgdGhpcy5fcm91dGVTZWdtZW50KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVUYXJnZXRVcmxBbmRIcmVmKCk6IHZvaWQge1xuICAgIGxldCB0cmVlID0gdGhpcy5fcm91dGVyLmNyZWF0ZVVybFRyZWUodGhpcy5fY2hhbmdlcywgdGhpcy5fcm91dGVTZWdtZW50KTtcbiAgICBpZiAoaXNQcmVzZW50KHRyZWUpKSB7XG4gICAgICB0aGlzLmhyZWYgPSB0aGlzLl9yb3V0ZXIuc2VyaWFsaXplVXJsKHRyZWUpO1xuICAgIH1cbiAgfVxufSJdfQ==