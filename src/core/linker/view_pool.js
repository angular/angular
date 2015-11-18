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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
exports.APP_VIEW_POOL_CAPACITY = lang_1.CONST_EXPR(new di_1.OpaqueToken('AppViewPool.viewPoolCapacity'));
var AppViewPool = (function () {
    function AppViewPool(poolCapacityPerProtoView) {
        /** @internal */
        this._pooledViewsPerProtoView = new collection_1.Map();
        this._poolCapacityPerProtoView = poolCapacityPerProtoView;
    }
    AppViewPool.prototype.getView = function (protoView) {
        var pooledViews = this._pooledViewsPerProtoView.get(protoView);
        if (lang_1.isPresent(pooledViews) && pooledViews.length > 0) {
            return pooledViews.pop();
        }
        return null;
    };
    AppViewPool.prototype.returnView = function (view) {
        var protoView = view.proto;
        var pooledViews = this._pooledViewsPerProtoView.get(protoView);
        if (lang_1.isBlank(pooledViews)) {
            pooledViews = [];
            this._pooledViewsPerProtoView.set(protoView, pooledViews);
        }
        var haveRemainingCapacity = pooledViews.length < this._poolCapacityPerProtoView;
        if (haveRemainingCapacity) {
            pooledViews.push(view);
        }
        return haveRemainingCapacity;
    };
    AppViewPool = __decorate([
        di_1.Injectable(),
        __param(0, di_1.Inject(exports.APP_VIEW_POOL_CAPACITY)), 
        __metadata('design:paramtypes', [Object])
    ], AppViewPool);
    return AppViewPool;
})();
exports.AppViewPool = AppViewPool;
//# sourceMappingURL=view_pool.js.map