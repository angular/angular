'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyX3Byb3RvX3ZpZXdfcmVmX3N0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9yZW5kZXJfcHJvdG9fdmlld19yZWZfc3RvcmUudHMiXSwibmFtZXMiOlsiUmVuZGVyUHJvdG9WaWV3UmVmU3RvcmUiLCJSZW5kZXJQcm90b1ZpZXdSZWZTdG9yZS5jb25zdHJ1Y3RvciIsIlJlbmRlclByb3RvVmlld1JlZlN0b3JlLmFsbG9jYXRlIiwiUmVuZGVyUHJvdG9WaWV3UmVmU3RvcmUuc3RvcmUiLCJSZW5kZXJQcm90b1ZpZXdSZWZTdG9yZS5kZXNlcmlhbGl6ZSIsIlJlbmRlclByb3RvVmlld1JlZlN0b3JlLnNlcmlhbGl6ZSIsIldlYldvcmtlclJlbmRlclByb3RvVmlld1JlZiIsIldlYldvcmtlclJlbmRlclByb3RvVmlld1JlZi5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBaUMsc0JBQXNCLENBQUMsQ0FBQTtBQUN4RCxvQkFBaUMsOEJBQThCLENBQUMsQ0FBQTtBQUNoRSxvQkFBNEIscUNBQXFDLENBQUMsQ0FBQTtBQUVsRTtJQVFFQSxpQ0FBbUNBLFdBQVdBO1FBTnRDQyxtQkFBY0EsR0FBb0NBLElBQUlBLEdBQUdBLEVBQThCQSxDQUFDQTtRQUN4RkEsdUJBQWtCQSxHQUN0QkEsSUFBSUEsR0FBR0EsRUFBOEJBLENBQUNBO1FBQ2xDQSxlQUFVQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUdtQkEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsV0FBV0EsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFFcEZELDBDQUFRQSxHQUFSQTtRQUNFRSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtRQUM5QkEsSUFBSUEsTUFBTUEsR0FBR0EsSUFBSUEsMkJBQTJCQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNwREEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDMUJBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUVERix1Q0FBS0EsR0FBTEEsVUFBTUEsR0FBdUJBLEVBQUVBLEtBQWFBO1FBQzFDRyxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3hDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN0Q0EsQ0FBQ0E7SUFFREgsNkNBQVdBLEdBQVhBLFVBQVlBLEtBQWFBO1FBQ3ZCSSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDeENBLENBQUNBO0lBRURKLDJDQUFTQSxHQUFUQSxVQUFVQSxHQUF1QkE7UUFDL0JLLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0QkEsTUFBTUEsQ0FBK0JBLEdBQUlBLENBQUNBLFNBQVNBLENBQUNBO1FBQ3REQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQzFDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQXRDSEw7UUFBQ0EsZUFBVUEsRUFBRUE7UUFRQ0EsV0FBQ0EsV0FBTUEsQ0FBQ0EsbUJBQWFBLENBQUNBLENBQUFBOztnQ0ErQm5DQTtJQUFEQSw4QkFBQ0E7QUFBREEsQ0FBQ0EsQUF2Q0QsSUF1Q0M7QUF0Q1ksK0JBQXVCLDBCQXNDbkMsQ0FBQTtBQUVEO0lBQWlETSwrQ0FBa0JBO0lBQ2pFQSxxQ0FBbUJBLFNBQWlCQTtRQUFJQyxpQkFBT0EsQ0FBQ0E7UUFBN0JBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVFBO0lBQWFBLENBQUNBO0lBQ3BERCxrQ0FBQ0E7QUFBREEsQ0FBQ0EsQUFGRCxFQUFpRCx3QkFBa0IsRUFFbEU7QUFGWSxtQ0FBMkIsOEJBRXZDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGUsIEluamVjdH0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb3JlL2RpXCI7XG5pbXBvcnQge1JlbmRlclByb3RvVmlld1JlZn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGlcIjtcbmltcG9ydCB7T05fV0VCX1dPUktFUn0gZnJvbSBcImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvYXBpXCI7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSZW5kZXJQcm90b1ZpZXdSZWZTdG9yZSB7XG4gIHByaXZhdGUgX2xvb2t1cEJ5SW5kZXg6IE1hcDxudW1iZXIsIFJlbmRlclByb3RvVmlld1JlZj4gPSBuZXcgTWFwPG51bWJlciwgUmVuZGVyUHJvdG9WaWV3UmVmPigpO1xuICBwcml2YXRlIF9sb29rdXBCeVByb3RvVmlldzogTWFwPFJlbmRlclByb3RvVmlld1JlZiwgbnVtYmVyPiA9XG4gICAgICBuZXcgTWFwPFJlbmRlclByb3RvVmlld1JlZiwgbnVtYmVyPigpO1xuICBwcml2YXRlIF9uZXh0SW5kZXg6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgX29uV2Vid29ya2VyOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoT05fV0VCX1dPUktFUikgb25XZWJ3b3JrZXIpIHsgdGhpcy5fb25XZWJ3b3JrZXIgPSBvbldlYndvcmtlcjsgfVxuXG4gIGFsbG9jYXRlKCk6IFJlbmRlclByb3RvVmlld1JlZiB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fbmV4dEluZGV4Kys7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBXZWJXb3JrZXJSZW5kZXJQcm90b1ZpZXdSZWYoaW5kZXgpO1xuICAgIHRoaXMuc3RvcmUocmVzdWx0LCBpbmRleCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHN0b3JlKHJlZjogUmVuZGVyUHJvdG9WaWV3UmVmLCBpbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fbG9va3VwQnlQcm90b1ZpZXcuc2V0KHJlZiwgaW5kZXgpO1xuICAgIHRoaXMuX2xvb2t1cEJ5SW5kZXguc2V0KGluZGV4LCByZWYpO1xuICB9XG5cbiAgZGVzZXJpYWxpemUoaW5kZXg6IG51bWJlcik6IFJlbmRlclByb3RvVmlld1JlZiB7XG4gICAgaWYgKGluZGV4ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbG9va3VwQnlJbmRleC5nZXQoaW5kZXgpO1xuICB9XG5cbiAgc2VyaWFsaXplKHJlZjogUmVuZGVyUHJvdG9WaWV3UmVmKTogbnVtYmVyIHtcbiAgICBpZiAocmVmID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fb25XZWJ3b3JrZXIpIHtcbiAgICAgIHJldHVybiAoPFdlYldvcmtlclJlbmRlclByb3RvVmlld1JlZj5yZWYpLnJlZk51bWJlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2xvb2t1cEJ5UHJvdG9WaWV3LmdldChyZWYpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyUmVuZGVyUHJvdG9WaWV3UmVmIGV4dGVuZHMgUmVuZGVyUHJvdG9WaWV3UmVmIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlZk51bWJlcjogbnVtYmVyKSB7IHN1cGVyKCk7IH1cbn1cbiJdfQ==