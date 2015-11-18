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
//# sourceMappingURL=render_proto_view_ref_store.js.map