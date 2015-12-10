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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyX3Byb3RvX3ZpZXdfcmVmX3N0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9yZW5kZXJfcHJvdG9fdmlld19yZWZfc3RvcmUudHMiXSwibmFtZXMiOlsiUmVuZGVyUHJvdG9WaWV3UmVmU3RvcmUiLCJSZW5kZXJQcm90b1ZpZXdSZWZTdG9yZS5jb25zdHJ1Y3RvciIsIlJlbmRlclByb3RvVmlld1JlZlN0b3JlLmFsbG9jYXRlIiwiUmVuZGVyUHJvdG9WaWV3UmVmU3RvcmUuc3RvcmUiLCJSZW5kZXJQcm90b1ZpZXdSZWZTdG9yZS5kZXNlcmlhbGl6ZSIsIlJlbmRlclByb3RvVmlld1JlZlN0b3JlLnNlcmlhbGl6ZSIsIldlYldvcmtlclJlbmRlclByb3RvVmlld1JlZiIsIldlYldvcmtlclJlbmRlclByb3RvVmlld1JlZi5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxzQkFBc0I7T0FDaEQsRUFBQyxrQkFBa0IsRUFBQyxNQUFNLDhCQUE4QjtPQUN4RCxFQUFDLGFBQWEsRUFBQyxNQUFNLHFDQUFxQztBQUVqRTtJQVFFQSxZQUFtQ0EsV0FBV0E7UUFOdENDLG1CQUFjQSxHQUFvQ0EsSUFBSUEsR0FBR0EsRUFBOEJBLENBQUNBO1FBQ3hGQSx1QkFBa0JBLEdBQ3RCQSxJQUFJQSxHQUFHQSxFQUE4QkEsQ0FBQ0E7UUFDbENBLGVBQVVBLEdBQVdBLENBQUNBLENBQUNBO1FBR21CQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxXQUFXQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUVwRkQsUUFBUUE7UUFDTkUsSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7UUFDOUJBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLDJCQUEyQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDcERBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQzFCQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7SUFFREYsS0FBS0EsQ0FBQ0EsR0FBdUJBLEVBQUVBLEtBQWFBO1FBQzFDRyxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3hDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN0Q0EsQ0FBQ0E7SUFFREgsV0FBV0EsQ0FBQ0EsS0FBYUE7UUFDdkJJLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN4Q0EsQ0FBQ0E7SUFFREosU0FBU0EsQ0FBQ0EsR0FBdUJBO1FBQy9CSyxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLE1BQU1BLENBQStCQSxHQUFJQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUN0REEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUMxQ0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7QUFDSEwsQ0FBQ0E7QUF2Q0Q7SUFBQyxVQUFVLEVBQUU7SUFRQyxXQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQTs7NEJBK0JuQztBQUVELGlEQUFpRCxrQkFBa0I7SUFDakVNLFlBQW1CQSxTQUFpQkE7UUFBSUMsT0FBT0EsQ0FBQ0E7UUFBN0JBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVFBO0lBQWFBLENBQUNBO0FBQ3BERCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3R9IGZyb20gXCJhbmd1bGFyMi9zcmMvY29yZS9kaVwiO1xuaW1wb3J0IHtSZW5kZXJQcm90b1ZpZXdSZWZ9IGZyb20gXCJhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpXCI7XG5pbXBvcnQge09OX1dFQl9XT1JLRVJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL2FwaVwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUmVuZGVyUHJvdG9WaWV3UmVmU3RvcmUge1xuICBwcml2YXRlIF9sb29rdXBCeUluZGV4OiBNYXA8bnVtYmVyLCBSZW5kZXJQcm90b1ZpZXdSZWY+ID0gbmV3IE1hcDxudW1iZXIsIFJlbmRlclByb3RvVmlld1JlZj4oKTtcbiAgcHJpdmF0ZSBfbG9va3VwQnlQcm90b1ZpZXc6IE1hcDxSZW5kZXJQcm90b1ZpZXdSZWYsIG51bWJlcj4gPVxuICAgICAgbmV3IE1hcDxSZW5kZXJQcm90b1ZpZXdSZWYsIG51bWJlcj4oKTtcbiAgcHJpdmF0ZSBfbmV4dEluZGV4OiBudW1iZXIgPSAwO1xuICBwcml2YXRlIF9vbldlYndvcmtlcjogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KE9OX1dFQl9XT1JLRVIpIG9uV2Vid29ya2VyKSB7IHRoaXMuX29uV2Vid29ya2VyID0gb25XZWJ3b3JrZXI7IH1cblxuICBhbGxvY2F0ZSgpOiBSZW5kZXJQcm90b1ZpZXdSZWYge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX25leHRJbmRleCsrO1xuICAgIHZhciByZXN1bHQgPSBuZXcgV2ViV29ya2VyUmVuZGVyUHJvdG9WaWV3UmVmKGluZGV4KTtcbiAgICB0aGlzLnN0b3JlKHJlc3VsdCwgaW5kZXgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBzdG9yZShyZWY6IFJlbmRlclByb3RvVmlld1JlZiwgaW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX2xvb2t1cEJ5UHJvdG9WaWV3LnNldChyZWYsIGluZGV4KTtcbiAgICB0aGlzLl9sb29rdXBCeUluZGV4LnNldChpbmRleCwgcmVmKTtcbiAgfVxuXG4gIGRlc2VyaWFsaXplKGluZGV4OiBudW1iZXIpOiBSZW5kZXJQcm90b1ZpZXdSZWYge1xuICAgIGlmIChpbmRleCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2xvb2t1cEJ5SW5kZXguZ2V0KGluZGV4KTtcbiAgfVxuXG4gIHNlcmlhbGl6ZShyZWY6IFJlbmRlclByb3RvVmlld1JlZik6IG51bWJlciB7XG4gICAgaWYgKHJlZiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX29uV2Vid29ya2VyKSB7XG4gICAgICByZXR1cm4gKDxXZWJXb3JrZXJSZW5kZXJQcm90b1ZpZXdSZWY+cmVmKS5yZWZOdW1iZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9sb29rdXBCeVByb3RvVmlldy5nZXQocmVmKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFdlYldvcmtlclJlbmRlclByb3RvVmlld1JlZiBleHRlbmRzIFJlbmRlclByb3RvVmlld1JlZiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWZOdW1iZXI6IG51bWJlcikgeyBzdXBlcigpOyB9XG59XG4iXX0=