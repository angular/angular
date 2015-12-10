'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var di_1 = require("angular2/src/core/di");
var api_1 = require("angular2/src/core/render/api");
var api_2 = require("angular2/src/web_workers/shared/api");
var RenderProtoViewRefStore = (function () {
    function RenderProtoViewRefStore(onWebworker) {
        this._lookupByIndex = new Map();
        this._lookupByProtoView = new Map();
        this._nextIndex = 0;
        this._onWebworker = onWebworker;
    }
    RenderProtoViewRefStore.prototype.allocate = function () {
        var index = this._nextIndex++;
        var result = new WebWorkerRenderProtoViewRef(index);
        this.store(result, index);
        return result;
    };
    RenderProtoViewRefStore.prototype.store = function (ref, index) {
        this._lookupByProtoView.set(ref, index);
        this._lookupByIndex.set(index, ref);
    };
    RenderProtoViewRefStore.prototype.deserialize = function (index) {
        if (index == null) {
            return null;
        }
        return this._lookupByIndex.get(index);
    };
    RenderProtoViewRefStore.prototype.serialize = function (ref) {
        if (ref == null) {
            return null;
        }
        if (this._onWebworker) {
            return ref.refNumber;
        }
        else {
            return this._lookupByProtoView.get(ref);
        }
    };
    RenderProtoViewRefStore = __decorate([
        di_1.Injectable(),
        __param(0, di_1.Inject(api_2.ON_WEB_WORKER)), 
        __metadata('design:paramtypes', [Object])
    ], RenderProtoViewRefStore);
    return RenderProtoViewRefStore;
})();
exports.RenderProtoViewRefStore = RenderProtoViewRefStore;
var WebWorkerRenderProtoViewRef = (function (_super) {
    __extends(WebWorkerRenderProtoViewRef, _super);
    function WebWorkerRenderProtoViewRef(refNumber) {
        _super.call(this);
        this.refNumber = refNumber;
    }
    return WebWorkerRenderProtoViewRef;
})(api_1.RenderProtoViewRef);
exports.WebWorkerRenderProtoViewRef = WebWorkerRenderProtoViewRef;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyX3Byb3RvX3ZpZXdfcmVmX3N0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9yZW5kZXJfcHJvdG9fdmlld19yZWZfc3RvcmUudHMiXSwibmFtZXMiOlsiUmVuZGVyUHJvdG9WaWV3UmVmU3RvcmUiLCJSZW5kZXJQcm90b1ZpZXdSZWZTdG9yZS5jb25zdHJ1Y3RvciIsIlJlbmRlclByb3RvVmlld1JlZlN0b3JlLmFsbG9jYXRlIiwiUmVuZGVyUHJvdG9WaWV3UmVmU3RvcmUuc3RvcmUiLCJSZW5kZXJQcm90b1ZpZXdSZWZTdG9yZS5kZXNlcmlhbGl6ZSIsIlJlbmRlclByb3RvVmlld1JlZlN0b3JlLnNlcmlhbGl6ZSIsIldlYldvcmtlclJlbmRlclByb3RvVmlld1JlZiIsIldlYldvcmtlclJlbmRlclByb3RvVmlld1JlZi5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1CQUFpQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ3hELG9CQUFpQyw4QkFBOEIsQ0FBQyxDQUFBO0FBQ2hFLG9CQUE0QixxQ0FBcUMsQ0FBQyxDQUFBO0FBRWxFO0lBUUVBLGlDQUFtQ0EsV0FBV0E7UUFOdENDLG1CQUFjQSxHQUFvQ0EsSUFBSUEsR0FBR0EsRUFBOEJBLENBQUNBO1FBQ3hGQSx1QkFBa0JBLEdBQ3RCQSxJQUFJQSxHQUFHQSxFQUE4QkEsQ0FBQ0E7UUFDbENBLGVBQVVBLEdBQVdBLENBQUNBLENBQUNBO1FBR21CQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxXQUFXQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUVwRkQsMENBQVFBLEdBQVJBO1FBQ0VFLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO1FBQzlCQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSwyQkFBMkJBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3BEQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMxQkEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0lBRURGLHVDQUFLQSxHQUFMQSxVQUFNQSxHQUF1QkEsRUFBRUEsS0FBYUE7UUFDMUNHLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDeENBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3RDQSxDQUFDQTtJQUVESCw2Q0FBV0EsR0FBWEEsVUFBWUEsS0FBYUE7UUFDdkJJLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN4Q0EsQ0FBQ0E7SUFFREosMkNBQVNBLEdBQVRBLFVBQVVBLEdBQXVCQTtRQUMvQkssRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxNQUFNQSxDQUErQkEsR0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDdERBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLENBQUNBO0lBQ0hBLENBQUNBO0lBdENITDtRQUFDQSxlQUFVQSxFQUFFQTtRQVFDQSxXQUFDQSxXQUFNQSxDQUFDQSxtQkFBYUEsQ0FBQ0EsQ0FBQUE7O2dDQStCbkNBO0lBQURBLDhCQUFDQTtBQUFEQSxDQUFDQSxBQXZDRCxJQXVDQztBQXRDWSwrQkFBdUIsMEJBc0NuQyxDQUFBO0FBRUQ7SUFBaURNLCtDQUFrQkE7SUFDakVBLHFDQUFtQkEsU0FBaUJBO1FBQUlDLGlCQUFPQSxDQUFDQTtRQUE3QkEsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBUUE7SUFBYUEsQ0FBQ0E7SUFDcERELGtDQUFDQTtBQUFEQSxDQUFDQSxBQUZELEVBQWlELHdCQUFrQixFQUVsRTtBQUZZLG1DQUEyQiw4QkFFdkMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0fSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGlcIjtcbmltcG9ydCB7UmVuZGVyUHJvdG9WaWV3UmVmfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaVwiO1xuaW1wb3J0IHtPTl9XRUJfV09SS0VSfSBmcm9tIFwiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9hcGlcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJlbmRlclByb3RvVmlld1JlZlN0b3JlIHtcbiAgcHJpdmF0ZSBfbG9va3VwQnlJbmRleDogTWFwPG51bWJlciwgUmVuZGVyUHJvdG9WaWV3UmVmPiA9IG5ldyBNYXA8bnVtYmVyLCBSZW5kZXJQcm90b1ZpZXdSZWY+KCk7XG4gIHByaXZhdGUgX2xvb2t1cEJ5UHJvdG9WaWV3OiBNYXA8UmVuZGVyUHJvdG9WaWV3UmVmLCBudW1iZXI+ID1cbiAgICAgIG5ldyBNYXA8UmVuZGVyUHJvdG9WaWV3UmVmLCBudW1iZXI+KCk7XG4gIHByaXZhdGUgX25leHRJbmRleDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBfb25XZWJ3b3JrZXI6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChPTl9XRUJfV09SS0VSKSBvbldlYndvcmtlcikgeyB0aGlzLl9vbldlYndvcmtlciA9IG9uV2Vid29ya2VyOyB9XG5cbiAgYWxsb2NhdGUoKTogUmVuZGVyUHJvdG9WaWV3UmVmIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9uZXh0SW5kZXgrKztcbiAgICB2YXIgcmVzdWx0ID0gbmV3IFdlYldvcmtlclJlbmRlclByb3RvVmlld1JlZihpbmRleCk7XG4gICAgdGhpcy5zdG9yZShyZXN1bHQsIGluZGV4KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgc3RvcmUocmVmOiBSZW5kZXJQcm90b1ZpZXdSZWYsIGluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9sb29rdXBCeVByb3RvVmlldy5zZXQocmVmLCBpbmRleCk7XG4gICAgdGhpcy5fbG9va3VwQnlJbmRleC5zZXQoaW5kZXgsIHJlZik7XG4gIH1cblxuICBkZXNlcmlhbGl6ZShpbmRleDogbnVtYmVyKTogUmVuZGVyUHJvdG9WaWV3UmVmIHtcbiAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9sb29rdXBCeUluZGV4LmdldChpbmRleCk7XG4gIH1cblxuICBzZXJpYWxpemUocmVmOiBSZW5kZXJQcm90b1ZpZXdSZWYpOiBudW1iZXIge1xuICAgIGlmIChyZWYgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9vbldlYndvcmtlcikge1xuICAgICAgcmV0dXJuICg8V2ViV29ya2VyUmVuZGVyUHJvdG9WaWV3UmVmPnJlZikucmVmTnVtYmVyO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fbG9va3VwQnlQcm90b1ZpZXcuZ2V0KHJlZik7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJSZW5kZXJQcm90b1ZpZXdSZWYgZXh0ZW5kcyBSZW5kZXJQcm90b1ZpZXdSZWYge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVmTnVtYmVyOiBudW1iZXIpIHsgc3VwZXIoKTsgfVxufVxuIl19