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
import { Injectable, Inject } from "angular2/src/core/di";
import { RenderProtoViewRef } from "angular2/src/core/render/api";
import { ON_WEB_WORKER } from "angular2/src/web_workers/shared/api";
export let RenderProtoViewRefStore = class {
    constructor(onWebworker) {
        this._lookupByIndex = new Map();
        this._lookupByProtoView = new Map();
        this._nextIndex = 0;
        this._onWebworker = onWebworker;
    }
    allocate() {
        var index = this._nextIndex++;
        var result = new WebWorkerRenderProtoViewRef(index);
        this.store(result, index);
        return result;
    }
    store(ref, index) {
        this._lookupByProtoView.set(ref, index);
        this._lookupByIndex.set(index, ref);
    }
    deserialize(index) {
        if (index == null) {
            return null;
        }
        return this._lookupByIndex.get(index);
    }
    serialize(ref) {
        if (ref == null) {
            return null;
        }
        if (this._onWebworker) {
            return ref.refNumber;
        }
        else {
            return this._lookupByProtoView.get(ref);
        }
    }
};
RenderProtoViewRefStore = __decorate([
    Injectable(),
    __param(0, Inject(ON_WEB_WORKER)), 
    __metadata('design:paramtypes', [Object])
], RenderProtoViewRefStore);
export class WebWorkerRenderProtoViewRef extends RenderProtoViewRef {
    constructor(refNumber) {
        super();
        this.refNumber = refNumber;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyX3Byb3RvX3ZpZXdfcmVmX3N0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9yZW5kZXJfcHJvdG9fdmlld19yZWZfc3RvcmUudHMiXSwibmFtZXMiOlsiUmVuZGVyUHJvdG9WaWV3UmVmU3RvcmUiLCJSZW5kZXJQcm90b1ZpZXdSZWZTdG9yZS5jb25zdHJ1Y3RvciIsIlJlbmRlclByb3RvVmlld1JlZlN0b3JlLmFsbG9jYXRlIiwiUmVuZGVyUHJvdG9WaWV3UmVmU3RvcmUuc3RvcmUiLCJSZW5kZXJQcm90b1ZpZXdSZWZTdG9yZS5kZXNlcmlhbGl6ZSIsIlJlbmRlclByb3RvVmlld1JlZlN0b3JlLnNlcmlhbGl6ZSIsIldlYldvcmtlclJlbmRlclByb3RvVmlld1JlZiIsIldlYldvcmtlclJlbmRlclByb3RvVmlld1JlZi5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sc0JBQXNCO09BQ2hELEVBQUMsa0JBQWtCLEVBQUMsTUFBTSw4QkFBOEI7T0FDeEQsRUFBQyxhQUFhLEVBQUMsTUFBTSxxQ0FBcUM7QUFFakU7SUFRRUEsWUFBbUNBLFdBQVdBO1FBTnRDQyxtQkFBY0EsR0FBb0NBLElBQUlBLEdBQUdBLEVBQThCQSxDQUFDQTtRQUN4RkEsdUJBQWtCQSxHQUN0QkEsSUFBSUEsR0FBR0EsRUFBOEJBLENBQUNBO1FBQ2xDQSxlQUFVQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUdtQkEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsV0FBV0EsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFFcEZELFFBQVFBO1FBQ05FLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO1FBQzlCQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSwyQkFBMkJBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3BEQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUMxQkEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0lBRURGLEtBQUtBLENBQUNBLEdBQXVCQSxFQUFFQSxLQUFhQTtRQUMxQ0csSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUN4Q0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDdENBLENBQUNBO0lBRURILFdBQVdBLENBQUNBLEtBQWFBO1FBQ3ZCSSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDeENBLENBQUNBO0lBRURKLFNBQVNBLENBQUNBLEdBQXVCQTtRQUMvQkssRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxNQUFNQSxDQUErQkEsR0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFDdERBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLENBQUNBO0lBQ0hBLENBQUNBO0FBQ0hMLENBQUNBO0FBdkNEO0lBQUMsVUFBVSxFQUFFO0lBUUMsV0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUE7OzRCQStCbkM7QUFFRCxpREFBaUQsa0JBQWtCO0lBQ2pFTSxZQUFtQkEsU0FBaUJBO1FBQUlDLE9BQU9BLENBQUNBO1FBQTdCQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFRQTtJQUFhQSxDQUFDQTtBQUNwREQsQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0fSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGlcIjtcbmltcG9ydCB7UmVuZGVyUHJvdG9WaWV3UmVmfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaVwiO1xuaW1wb3J0IHtPTl9XRUJfV09SS0VSfSBmcm9tIFwiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9hcGlcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJlbmRlclByb3RvVmlld1JlZlN0b3JlIHtcbiAgcHJpdmF0ZSBfbG9va3VwQnlJbmRleDogTWFwPG51bWJlciwgUmVuZGVyUHJvdG9WaWV3UmVmPiA9IG5ldyBNYXA8bnVtYmVyLCBSZW5kZXJQcm90b1ZpZXdSZWY+KCk7XG4gIHByaXZhdGUgX2xvb2t1cEJ5UHJvdG9WaWV3OiBNYXA8UmVuZGVyUHJvdG9WaWV3UmVmLCBudW1iZXI+ID1cbiAgICAgIG5ldyBNYXA8UmVuZGVyUHJvdG9WaWV3UmVmLCBudW1iZXI+KCk7XG4gIHByaXZhdGUgX25leHRJbmRleDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBfb25XZWJ3b3JrZXI6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChPTl9XRUJfV09SS0VSKSBvbldlYndvcmtlcikgeyB0aGlzLl9vbldlYndvcmtlciA9IG9uV2Vid29ya2VyOyB9XG5cbiAgYWxsb2NhdGUoKTogUmVuZGVyUHJvdG9WaWV3UmVmIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9uZXh0SW5kZXgrKztcbiAgICB2YXIgcmVzdWx0ID0gbmV3IFdlYldvcmtlclJlbmRlclByb3RvVmlld1JlZihpbmRleCk7XG4gICAgdGhpcy5zdG9yZShyZXN1bHQsIGluZGV4KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgc3RvcmUocmVmOiBSZW5kZXJQcm90b1ZpZXdSZWYsIGluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9sb29rdXBCeVByb3RvVmlldy5zZXQocmVmLCBpbmRleCk7XG4gICAgdGhpcy5fbG9va3VwQnlJbmRleC5zZXQoaW5kZXgsIHJlZik7XG4gIH1cblxuICBkZXNlcmlhbGl6ZShpbmRleDogbnVtYmVyKTogUmVuZGVyUHJvdG9WaWV3UmVmIHtcbiAgICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9sb29rdXBCeUluZGV4LmdldChpbmRleCk7XG4gIH1cblxuICBzZXJpYWxpemUocmVmOiBSZW5kZXJQcm90b1ZpZXdSZWYpOiBudW1iZXIge1xuICAgIGlmIChyZWYgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9vbldlYndvcmtlcikge1xuICAgICAgcmV0dXJuICg8V2ViV29ya2VyUmVuZGVyUHJvdG9WaWV3UmVmPnJlZikucmVmTnVtYmVyO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fbG9va3VwQnlQcm90b1ZpZXcuZ2V0KHJlZik7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJSZW5kZXJQcm90b1ZpZXdSZWYgZXh0ZW5kcyBSZW5kZXJQcm90b1ZpZXdSZWYge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVmTnVtYmVyOiBudW1iZXIpIHsgc3VwZXIoKTsgfVxufVxuIl19