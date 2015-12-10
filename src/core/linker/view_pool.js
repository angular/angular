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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19wb29sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfcG9vbC50cyJdLCJuYW1lcyI6WyJBcHBWaWV3UG9vbCIsIkFwcFZpZXdQb29sLmNvbnN0cnVjdG9yIiwiQXBwVmlld1Bvb2wuZ2V0VmlldyIsIkFwcFZpZXdQb29sLnJldHVyblZpZXciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQThDLHNCQUFzQixDQUFDLENBQUE7QUFFckUscUJBQTZDLDBCQUEwQixDQUFDLENBQUE7QUFDeEUsMkJBQThCLGdDQUFnQyxDQUFDLENBQUE7QUFJbEQsOEJBQXNCLEdBQUcsaUJBQVUsQ0FBQyxJQUFJLGdCQUFXLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO0FBRWxHO0lBT0VBLHFCQUE0Q0Esd0JBQXdCQTtRQUhwRUMsZ0JBQWdCQTtRQUNoQkEsNkJBQXdCQSxHQUFHQSxJQUFJQSxnQkFBR0EsRUFBc0RBLENBQUNBO1FBR3ZGQSxJQUFJQSxDQUFDQSx5QkFBeUJBLEdBQUdBLHdCQUF3QkEsQ0FBQ0E7SUFDNURBLENBQUNBO0lBRURELDZCQUFPQSxHQUFQQSxVQUFRQSxTQUFrQ0E7UUFDeENFLElBQUlBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLHdCQUF3QkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDL0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxXQUFXQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyREEsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDM0JBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBRURGLGdDQUFVQSxHQUFWQSxVQUFXQSxJQUF3QkE7UUFDakNHLElBQUlBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1FBQzNCQSxJQUFJQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSx3QkFBd0JBLENBQUNBLEdBQUdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQy9EQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6QkEsV0FBV0EsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDakJBLElBQUlBLENBQUNBLHdCQUF3QkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDNURBLENBQUNBO1FBQ0RBLElBQUlBLHFCQUFxQkEsR0FBR0EsV0FBV0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EseUJBQXlCQSxDQUFDQTtRQUNoRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EscUJBQXFCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxQkEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDekJBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLHFCQUFxQkEsQ0FBQ0E7SUFDL0JBLENBQUNBO0lBL0JISDtRQUFDQSxlQUFVQSxFQUFFQTtRQU9DQSxXQUFDQSxXQUFNQSxDQUFDQSw4QkFBc0JBLENBQUNBLENBQUFBOztvQkF5QjVDQTtJQUFEQSxrQkFBQ0E7QUFBREEsQ0FBQ0EsQUFoQ0QsSUFnQ0M7QUEvQlksbUJBQVcsY0ErQnZCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge01hcFdyYXBwZXIsIE1hcH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0ICogYXMgdmlld01vZHVsZSBmcm9tICcuL3ZpZXcnO1xuXG5leHBvcnQgY29uc3QgQVBQX1ZJRVdfUE9PTF9DQVBBQ0lUWSA9IENPTlNUX0VYUFIobmV3IE9wYXF1ZVRva2VuKCdBcHBWaWV3UG9vbC52aWV3UG9vbENhcGFjaXR5JykpO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQXBwVmlld1Bvb2wge1xuICAvKiogQGludGVybmFsICovXG4gIF9wb29sQ2FwYWNpdHlQZXJQcm90b1ZpZXc6IG51bWJlcjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcG9vbGVkVmlld3NQZXJQcm90b1ZpZXcgPSBuZXcgTWFwPHZpZXdNb2R1bGUuQXBwUHJvdG9WaWV3LCBBcnJheTx2aWV3TW9kdWxlLkFwcFZpZXc+PigpO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoQVBQX1ZJRVdfUE9PTF9DQVBBQ0lUWSkgcG9vbENhcGFjaXR5UGVyUHJvdG9WaWV3KSB7XG4gICAgdGhpcy5fcG9vbENhcGFjaXR5UGVyUHJvdG9WaWV3ID0gcG9vbENhcGFjaXR5UGVyUHJvdG9WaWV3O1xuICB9XG5cbiAgZ2V0Vmlldyhwcm90b1ZpZXc6IHZpZXdNb2R1bGUuQXBwUHJvdG9WaWV3KTogdmlld01vZHVsZS5BcHBWaWV3IHtcbiAgICB2YXIgcG9vbGVkVmlld3MgPSB0aGlzLl9wb29sZWRWaWV3c1BlclByb3RvVmlldy5nZXQocHJvdG9WaWV3KTtcbiAgICBpZiAoaXNQcmVzZW50KHBvb2xlZFZpZXdzKSAmJiBwb29sZWRWaWV3cy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gcG9vbGVkVmlld3MucG9wKCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuVmlldyh2aWV3OiB2aWV3TW9kdWxlLkFwcFZpZXcpOiBib29sZWFuIHtcbiAgICB2YXIgcHJvdG9WaWV3ID0gdmlldy5wcm90bztcbiAgICB2YXIgcG9vbGVkVmlld3MgPSB0aGlzLl9wb29sZWRWaWV3c1BlclByb3RvVmlldy5nZXQocHJvdG9WaWV3KTtcbiAgICBpZiAoaXNCbGFuayhwb29sZWRWaWV3cykpIHtcbiAgICAgIHBvb2xlZFZpZXdzID0gW107XG4gICAgICB0aGlzLl9wb29sZWRWaWV3c1BlclByb3RvVmlldy5zZXQocHJvdG9WaWV3LCBwb29sZWRWaWV3cyk7XG4gICAgfVxuICAgIHZhciBoYXZlUmVtYWluaW5nQ2FwYWNpdHkgPSBwb29sZWRWaWV3cy5sZW5ndGggPCB0aGlzLl9wb29sQ2FwYWNpdHlQZXJQcm90b1ZpZXc7XG4gICAgaWYgKGhhdmVSZW1haW5pbmdDYXBhY2l0eSkge1xuICAgICAgcG9vbGVkVmlld3MucHVzaCh2aWV3KTtcbiAgICB9XG4gICAgcmV0dXJuIGhhdmVSZW1haW5pbmdDYXBhY2l0eTtcbiAgfVxufVxuIl19