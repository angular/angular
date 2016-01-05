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
import { Inject, Injectable, OpaqueToken } from 'angular2/src/core/di';
import { isPresent, isBlank, CONST_EXPR } from 'angular2/src/facade/lang';
import { Map } from 'angular2/src/facade/collection';
export const APP_VIEW_POOL_CAPACITY = CONST_EXPR(new OpaqueToken('AppViewPool.viewPoolCapacity'));
export let AppViewPool = class {
    constructor(poolCapacityPerProtoView) {
        /** @internal */
        this._pooledViewsPerProtoView = new Map();
        this._poolCapacityPerProtoView = poolCapacityPerProtoView;
    }
    getView(protoView) {
        var pooledViews = this._pooledViewsPerProtoView.get(protoView);
        if (isPresent(pooledViews) && pooledViews.length > 0) {
            return pooledViews.pop();
        }
        return null;
    }
    returnView(view) {
        var protoView = view.proto;
        var pooledViews = this._pooledViewsPerProtoView.get(protoView);
        if (isBlank(pooledViews)) {
            pooledViews = [];
            this._pooledViewsPerProtoView.set(protoView, pooledViews);
        }
        var haveRemainingCapacity = pooledViews.length < this._poolCapacityPerProtoView;
        if (haveRemainingCapacity) {
            pooledViews.push(view);
        }
        return haveRemainingCapacity;
    }
};
AppViewPool = __decorate([
    Injectable(),
    __param(0, Inject(APP_VIEW_POOL_CAPACITY)), 
    __metadata('design:paramtypes', [Object])
], AppViewPool);
