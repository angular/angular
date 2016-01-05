'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19wb29sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfcG9vbC50cyJdLCJuYW1lcyI6WyJBcHBWaWV3UG9vbCIsIkFwcFZpZXdQb29sLmNvbnN0cnVjdG9yIiwiQXBwVmlld1Bvb2wuZ2V0VmlldyIsIkFwcFZpZXdQb29sLnJldHVyblZpZXciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1CQUE4QyxzQkFBc0IsQ0FBQyxDQUFBO0FBRXJFLHFCQUE2QywwQkFBMEIsQ0FBQyxDQUFBO0FBQ3hFLDJCQUE4QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBSWxELDhCQUFzQixHQUFHLGlCQUFVLENBQUMsSUFBSSxnQkFBVyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztBQUVsRztJQU9FQSxxQkFBNENBLHdCQUF3QkE7UUFIcEVDLGdCQUFnQkE7UUFDaEJBLDZCQUF3QkEsR0FBR0EsSUFBSUEsZ0JBQUdBLEVBQXNEQSxDQUFDQTtRQUd2RkEsSUFBSUEsQ0FBQ0EseUJBQXlCQSxHQUFHQSx3QkFBd0JBLENBQUNBO0lBQzVEQSxDQUFDQTtJQUVERCw2QkFBT0EsR0FBUEEsVUFBUUEsU0FBa0NBO1FBQ3hDRSxJQUFJQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSx3QkFBd0JBLENBQUNBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQy9EQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsV0FBV0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckRBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO1FBQzNCQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVERixnQ0FBVUEsR0FBVkEsVUFBV0EsSUFBd0JBO1FBQ2pDRyxJQUFJQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUMzQkEsSUFBSUEsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0Esd0JBQXdCQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUMvREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLFdBQVdBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ2pCQSxJQUFJQSxDQUFDQSx3QkFBd0JBLENBQUNBLEdBQUdBLENBQUNBLFNBQVNBLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBO1FBQzVEQSxDQUFDQTtRQUNEQSxJQUFJQSxxQkFBcUJBLEdBQUdBLFdBQVdBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLHlCQUF5QkEsQ0FBQ0E7UUFDaEZBLEVBQUVBLENBQUNBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMUJBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3pCQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxxQkFBcUJBLENBQUNBO0lBQy9CQSxDQUFDQTtJQS9CSEg7UUFBQ0EsZUFBVUEsRUFBRUE7UUFPQ0EsV0FBQ0EsV0FBTUEsQ0FBQ0EsOEJBQXNCQSxDQUFDQSxDQUFBQTs7b0JBeUI1Q0E7SUFBREEsa0JBQUNBO0FBQURBLENBQUNBLEFBaENELElBZ0NDO0FBL0JZLG1CQUFXLGNBK0J2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE9wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtNYXBXcmFwcGVyLCBNYXB9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCAqIGFzIHZpZXdNb2R1bGUgZnJvbSAnLi92aWV3JztcblxuZXhwb3J0IGNvbnN0IEFQUF9WSUVXX1BPT0xfQ0FQQUNJVFkgPSBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbignQXBwVmlld1Bvb2wudmlld1Bvb2xDYXBhY2l0eScpKTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFwcFZpZXdQb29sIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcG9vbENhcGFjaXR5UGVyUHJvdG9WaWV3OiBudW1iZXI7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Bvb2xlZFZpZXdzUGVyUHJvdG9WaWV3ID0gbmV3IE1hcDx2aWV3TW9kdWxlLkFwcFByb3RvVmlldywgQXJyYXk8dmlld01vZHVsZS5BcHBWaWV3Pj4oKTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KEFQUF9WSUVXX1BPT0xfQ0FQQUNJVFkpIHBvb2xDYXBhY2l0eVBlclByb3RvVmlldykge1xuICAgIHRoaXMuX3Bvb2xDYXBhY2l0eVBlclByb3RvVmlldyA9IHBvb2xDYXBhY2l0eVBlclByb3RvVmlldztcbiAgfVxuXG4gIGdldFZpZXcocHJvdG9WaWV3OiB2aWV3TW9kdWxlLkFwcFByb3RvVmlldyk6IHZpZXdNb2R1bGUuQXBwVmlldyB7XG4gICAgdmFyIHBvb2xlZFZpZXdzID0gdGhpcy5fcG9vbGVkVmlld3NQZXJQcm90b1ZpZXcuZ2V0KHByb3RvVmlldyk7XG4gICAgaWYgKGlzUHJlc2VudChwb29sZWRWaWV3cykgJiYgcG9vbGVkVmlld3MubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHBvb2xlZFZpZXdzLnBvcCgpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVyblZpZXcodmlldzogdmlld01vZHVsZS5BcHBWaWV3KTogYm9vbGVhbiB7XG4gICAgdmFyIHByb3RvVmlldyA9IHZpZXcucHJvdG87XG4gICAgdmFyIHBvb2xlZFZpZXdzID0gdGhpcy5fcG9vbGVkVmlld3NQZXJQcm90b1ZpZXcuZ2V0KHByb3RvVmlldyk7XG4gICAgaWYgKGlzQmxhbmsocG9vbGVkVmlld3MpKSB7XG4gICAgICBwb29sZWRWaWV3cyA9IFtdO1xuICAgICAgdGhpcy5fcG9vbGVkVmlld3NQZXJQcm90b1ZpZXcuc2V0KHByb3RvVmlldywgcG9vbGVkVmlld3MpO1xuICAgIH1cbiAgICB2YXIgaGF2ZVJlbWFpbmluZ0NhcGFjaXR5ID0gcG9vbGVkVmlld3MubGVuZ3RoIDwgdGhpcy5fcG9vbENhcGFjaXR5UGVyUHJvdG9WaWV3O1xuICAgIGlmIChoYXZlUmVtYWluaW5nQ2FwYWNpdHkpIHtcbiAgICAgIHBvb2xlZFZpZXdzLnB1c2godmlldyk7XG4gICAgfVxuICAgIHJldHVybiBoYXZlUmVtYWluaW5nQ2FwYWNpdHk7XG4gIH1cbn1cbiJdfQ==