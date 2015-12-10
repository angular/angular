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
