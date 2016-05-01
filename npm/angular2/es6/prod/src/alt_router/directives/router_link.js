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
