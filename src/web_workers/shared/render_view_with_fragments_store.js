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
var collection_1 = require("angular2/src/facade/collection");
var RenderViewWithFragmentsStore = (function () {
    function RenderViewWithFragmentsStore(onWebWorker) {
        this._nextIndex = 0;
        this._onWebWorker = onWebWorker;
        this._lookupByIndex = new Map();
        this._lookupByView = new Map();
        this._viewFragments = new Map();
    }
    RenderViewWithFragmentsStore.prototype.allocate = function (fragmentCount) {
        var initialIndex = this._nextIndex;
        var viewRef = new WebWorkerRenderViewRef(this._nextIndex++);
        var fragmentRefs = collection_1.ListWrapper.createGrowableSize(fragmentCount);
        for (var i = 0; i < fragmentCount; i++) {
            fragmentRefs[i] = new WebWorkerRenderFragmentRef(this._nextIndex++);
        }
        var renderViewWithFragments = new api_1.RenderViewWithFragments(viewRef, fragmentRefs);
        this.store(renderViewWithFragments, initialIndex);
        return renderViewWithFragments;
    };
    RenderViewWithFragmentsStore.prototype.store = function (view, startIndex) {
        var _this = this;
        this._lookupByIndex.set(startIndex, view.viewRef);
        this._lookupByView.set(view.viewRef, startIndex);
        startIndex++;
        view.fragmentRefs.forEach(function (ref) {
            _this._lookupByIndex.set(startIndex, ref);
            _this._lookupByView.set(ref, startIndex);
            startIndex++;
        });
        this._viewFragments.set(view.viewRef, view.fragmentRefs);
    };
    RenderViewWithFragmentsStore.prototype.remove = function (view) {
        var _this = this;
        this._removeRef(view);
        var fragments = this._viewFragments.get(view);
        fragments.forEach(function (fragment) { _this._removeRef(fragment); });
        this._viewFragments.delete(view);
    };
    RenderViewWithFragmentsStore.prototype._removeRef = function (ref) {
        var index = this._lookupByView.get(ref);
        this._lookupByView.delete(ref);
        this._lookupByIndex.delete(index);
    };
    RenderViewWithFragmentsStore.prototype.serializeRenderViewRef = function (viewRef) {
        return this._serializeRenderFragmentOrViewRef(viewRef);
    };
    RenderViewWithFragmentsStore.prototype.serializeRenderFragmentRef = function (fragmentRef) {
        return this._serializeRenderFragmentOrViewRef(fragmentRef);
    };
    RenderViewWithFragmentsStore.prototype.deserializeRenderViewRef = function (ref) {
        if (ref == null) {
            return null;
        }
        return this._retrieve(ref);
    };
    RenderViewWithFragmentsStore.prototype.deserializeRenderFragmentRef = function (ref) {
        if (ref == null) {
            return null;
        }
        return this._retrieve(ref);
    };
    RenderViewWithFragmentsStore.prototype._retrieve = function (ref) {
        if (ref == null) {
            return null;
        }
        if (!this._lookupByIndex.has(ref)) {
            return null;
        }
        return this._lookupByIndex.get(ref);
    };
    RenderViewWithFragmentsStore.prototype._serializeRenderFragmentOrViewRef = function (ref) {
        if (ref == null) {
            return null;
        }
        if (this._onWebWorker) {
            return ref.serialize();
        }
        else {
            return this._lookupByView.get(ref);
        }
    };
    RenderViewWithFragmentsStore.prototype.serializeViewWithFragments = function (view) {
        var _this = this;
        if (view == null) {
            return null;
        }
        if (this._onWebWorker) {
            return {
                'viewRef': view.viewRef.serialize(),
                'fragmentRefs': view.fragmentRefs.map(function (val) { return val.serialize(); })
            };
        }
        else {
            return {
                'viewRef': this._lookupByView.get(view.viewRef),
                'fragmentRefs': view.fragmentRefs.map(function (val) { return _this._lookupByView.get(val); })
            };
        }
    };
    RenderViewWithFragmentsStore.prototype.deserializeViewWithFragments = function (obj) {
        var _this = this;
        if (obj == null) {
            return null;
        }
        var viewRef = this.deserializeRenderViewRef(obj['viewRef']);
        var fragments = obj['fragmentRefs'].map(function (val) { return _this.deserializeRenderFragmentRef(val); });
        return new api_1.RenderViewWithFragments(viewRef, fragments);
    };
    RenderViewWithFragmentsStore = __decorate([
        di_1.Injectable(),
        __param(0, di_1.Inject(api_2.ON_WEB_WORKER)), 
        __metadata('design:paramtypes', [Object])
    ], RenderViewWithFragmentsStore);
    return RenderViewWithFragmentsStore;
})();
exports.RenderViewWithFragmentsStore = RenderViewWithFragmentsStore;
var WebWorkerRenderViewRef = (function (_super) {
    __extends(WebWorkerRenderViewRef, _super);
    function WebWorkerRenderViewRef(refNumber) {
        _super.call(this);
        this.refNumber = refNumber;
    }
    WebWorkerRenderViewRef.prototype.serialize = function () { return this.refNumber; };
    WebWorkerRenderViewRef.deserialize = function (ref) {
        return new WebWorkerRenderViewRef(ref);
    };
    return WebWorkerRenderViewRef;
})(api_1.RenderViewRef);
exports.WebWorkerRenderViewRef = WebWorkerRenderViewRef;
var WebWorkerRenderFragmentRef = (function (_super) {
    __extends(WebWorkerRenderFragmentRef, _super);
    function WebWorkerRenderFragmentRef(refNumber) {
        _super.call(this);
        this.refNumber = refNumber;
    }
    WebWorkerRenderFragmentRef.prototype.serialize = function () { return this.refNumber; };
    WebWorkerRenderFragmentRef.deserialize = function (ref) {
        return new WebWorkerRenderFragmentRef(ref);
    };
    return WebWorkerRenderFragmentRef;
})(api_1.RenderFragmentRef);
exports.WebWorkerRenderFragmentRef = WebWorkerRenderFragmentRef;
//# sourceMappingURL=render_view_with_fragments_store.js.map