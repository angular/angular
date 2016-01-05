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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyX3ZpZXdfd2l0aF9mcmFnbWVudHNfc3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3JlbmRlcl92aWV3X3dpdGhfZnJhZ21lbnRzX3N0b3JlLnRzIl0sIm5hbWVzIjpbIlJlbmRlclZpZXdXaXRoRnJhZ21lbnRzU3RvcmUiLCJSZW5kZXJWaWV3V2l0aEZyYWdtZW50c1N0b3JlLmNvbnN0cnVjdG9yIiwiUmVuZGVyVmlld1dpdGhGcmFnbWVudHNTdG9yZS5hbGxvY2F0ZSIsIlJlbmRlclZpZXdXaXRoRnJhZ21lbnRzU3RvcmUuc3RvcmUiLCJSZW5kZXJWaWV3V2l0aEZyYWdtZW50c1N0b3JlLnJlbW92ZSIsIlJlbmRlclZpZXdXaXRoRnJhZ21lbnRzU3RvcmUuX3JlbW92ZVJlZiIsIlJlbmRlclZpZXdXaXRoRnJhZ21lbnRzU3RvcmUuc2VyaWFsaXplUmVuZGVyVmlld1JlZiIsIlJlbmRlclZpZXdXaXRoRnJhZ21lbnRzU3RvcmUuc2VyaWFsaXplUmVuZGVyRnJhZ21lbnRSZWYiLCJSZW5kZXJWaWV3V2l0aEZyYWdtZW50c1N0b3JlLmRlc2VyaWFsaXplUmVuZGVyVmlld1JlZiIsIlJlbmRlclZpZXdXaXRoRnJhZ21lbnRzU3RvcmUuZGVzZXJpYWxpemVSZW5kZXJGcmFnbWVudFJlZiIsIlJlbmRlclZpZXdXaXRoRnJhZ21lbnRzU3RvcmUuX3JldHJpZXZlIiwiUmVuZGVyVmlld1dpdGhGcmFnbWVudHNTdG9yZS5fc2VyaWFsaXplUmVuZGVyRnJhZ21lbnRPclZpZXdSZWYiLCJSZW5kZXJWaWV3V2l0aEZyYWdtZW50c1N0b3JlLnNlcmlhbGl6ZVZpZXdXaXRoRnJhZ21lbnRzIiwiUmVuZGVyVmlld1dpdGhGcmFnbWVudHNTdG9yZS5kZXNlcmlhbGl6ZVZpZXdXaXRoRnJhZ21lbnRzIiwiV2ViV29ya2VyUmVuZGVyVmlld1JlZiIsIldlYldvcmtlclJlbmRlclZpZXdSZWYuY29uc3RydWN0b3IiLCJXZWJXb3JrZXJSZW5kZXJWaWV3UmVmLnNlcmlhbGl6ZSIsIldlYldvcmtlclJlbmRlclZpZXdSZWYuZGVzZXJpYWxpemUiLCJXZWJXb3JrZXJSZW5kZXJGcmFnbWVudFJlZiIsIldlYldvcmtlclJlbmRlckZyYWdtZW50UmVmLmNvbnN0cnVjdG9yIiwiV2ViV29ya2VyUmVuZGVyRnJhZ21lbnRSZWYuc2VyaWFsaXplIiwiV2ViV29ya2VyUmVuZGVyRnJhZ21lbnRSZWYuZGVzZXJpYWxpemUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQWlDLHNCQUFzQixDQUFDLENBQUE7QUFDeEQsb0JBSU8sOEJBQThCLENBQUMsQ0FBQTtBQUN0QyxvQkFBNEIscUNBQXFDLENBQUMsQ0FBQTtBQUNsRSwyQkFBc0MsZ0NBQWdDLENBQUMsQ0FBQTtBQUV2RTtJQVFFQSxzQ0FBbUNBLFdBQVdBO1FBTnRDQyxlQUFVQSxHQUFXQSxDQUFDQSxDQUFDQTtRQU83QkEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsV0FBV0EsQ0FBQ0E7UUFDaENBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLEdBQUdBLEVBQTZDQSxDQUFDQTtRQUMzRUEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsR0FBR0EsRUFBNkNBLENBQUNBO1FBQzFFQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFzQ0EsQ0FBQ0E7SUFDdEVBLENBQUNBO0lBRURELCtDQUFRQSxHQUFSQSxVQUFTQSxhQUFxQkE7UUFDNUJFLElBQUlBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBO1FBRW5DQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxzQkFBc0JBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBLENBQUNBO1FBQzVEQSxJQUFJQSxZQUFZQSxHQUFHQSx3QkFBV0EsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUVqRUEs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Q0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFdkNGLGtDQUFXQSxHQUFsQkEsVUFBbUJBLEdBQVdBO1FBQzVCRyxNQUFNQSxDQUFDQSxJQUFJQSxzQkFBc0JBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3pDQSxDQUFDQTtJQUNISCw2QkFBQ0E7QUFBREEsQ0FBQ0EsQUFQRCxFQUE0QyxtQkFBYSxFQU94RDtBQVBZLDhCQUFzQix5QkFPbEMsQ0FBQTtBQUVEO0lBQWdESSw4Q0FBaUJBO0lBQy9EQSxvQ0FBbUJBLFNBQWlCQTtRQUFJQyxpQkFBT0EsQ0FBQ0E7UUFBN0JBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVFBO0lBQWFBLENBQUNBO0lBRWxERCw4Q0FBU0EsR0FBVEEsY0FBc0JFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO0lBRXZDRixzQ0FBV0EsR0FBbEJBLFVBQW1CQSxHQUFXQTtRQUM1QkcsTUFBTUEsQ0FBQ0EsSUFBSUEsMEJBQTBCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7SUFDSEgsaUNBQUNBO0FBQURBLENBQUNBLEFBUkQsRUFBZ0QsdUJBQWlCLEVBUWhFO0FBUlksa0NBQTBCLDZCQVF0QyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3R9IGZyb20gXCJhbmd1bGFyMi9zcmMvY29yZS9kaVwiO1xuaW1wb3J0IHtcbiAgUmVuZGVyVmlld1JlZixcbiAgUmVuZGVyRnJhZ21lbnRSZWYsXG4gIFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpXCI7XG5pbXBvcnQge09OX1dFQl9XT1JLRVJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL2FwaVwiO1xuaW1wb3J0IHtNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvblwiO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUmVuZGVyVmlld1dpdGhGcmFnbWVudHNTdG9yZSB7XG4gIHByaXZhdGUgX25leHRJbmRleDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBfb25XZWJXb3JrZXI6IGJvb2xlYW47XG4gIHByaXZhdGUgX2xvb2t1cEJ5SW5kZXg6IE1hcDxudW1iZXIsIFJlbmRlclZpZXdSZWYgfCBSZW5kZXJGcmFnbWVudFJlZj47XG4gIHByaXZhdGUgX2xvb2t1cEJ5VmlldzogTWFwPFJlbmRlclZpZXdSZWYgfCBSZW5kZXJGcmFnbWVudFJlZiwgbnVtYmVyPjtcbiAgcHJpdmF0ZSBfdmlld0ZyYWdtZW50czogTWFwPFJlbmRlclZpZXdSZWYsIFJlbmRlckZyYWdtZW50UmVmW10+O1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoT05fV0VCX1dPUktFUikgb25XZWJXb3JrZXIpIHtcbiAgICB0aGlzLl9vbldlYldvcmtlciA9IG9uV2ViV29ya2VyO1xuICAgIHRoaXMuX2xvb2t1cEJ5SW5kZXggPSBuZXcgTWFwPG51bWJlciwgUmVuZGVyVmlld1JlZiB8IFJlbmRlckZyYWdtZW50UmVmPigpO1xuICAgIHRoaXMuX2xvb2t1cEJ5VmlldyA9IG5ldyBNYXA8UmVuZGVyVmlld1JlZiB8IFJlbmRlckZyYWdtZW50UmVmLCBudW1iZXI+KCk7XG4gICAgdGhpcy5fdmlld0ZyYWdtZW50cyA9IG5ldyBNYXA8UmVuZGVyVmlld1JlZiwgUmVuZGVyRnJhZ21lbnRSZWZbXT4oKTtcbiAgfVxuXG4gIGFsbG9jYXRlKGZyYWdtZW50Q291bnQ6IG51bWJlcik6IFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzIHtcbiAgICB2YXIgaW5pdGlhbEluZGV4ID0gdGhpcy5fbmV4dEluZGV4O1xuXG4gICAgdmFyIHZpZXdSZWYgPSBuZXcgV2ViV29ya2VyUmVuZGVyVmlld1JlZih0aGlzLl9uZXh0SW5kZXgrKyk7XG4gICAgdmFyIGZyYWdtZW50UmVmcyA9IExpc3RXcmFwcGVyLmNyZWF0ZUdyb3dhYmxlU2l6ZShmcmFnbWVudENvdW50KTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZnJhZ21lbnRDb3VudDsgaSsrKSB7XG4gICAgICBmcmFnbWVudFJlZnNbaV0gPSBuZXcgV2ViV29ya2VyUmVuZGVyRnJhZ21lbnRSZWYodGhpcy5fbmV4dEluZGV4KyspO1xuICAgIH1cbiAgICB2YXIgcmVuZGVyVmlld1dpdGhGcmFnbWVudHMgPSBuZXcgUmVuZGVyVmlld1dpdGhGcmFnbWVudHModmlld1JlZiwgZnJhZ21lbnRSZWZzKTtcbiAgICB0aGlzLnN0b3JlKHJlbmRlclZpZXdXaXRoRnJhZ21lbnRzLCBpbml0aWFsSW5kZXgpO1xuICAgIHJldHVybiByZW5kZXJWaWV3V2l0aEZyYWdtZW50cztcbiAgfVxuXG4gIHN0b3JlKHZpZXc6IFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzLCBzdGFydEluZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9sb29rdXBCeUluZGV4LnNldChzdGFydEluZGV4LCB2aWV3LnZpZXdSZWYpO1xuICAgIHRoaXMuX2xvb2t1cEJ5Vmlldy5zZXQodmlldy52aWV3UmVmLCBzdGFydEluZGV4KTtcbiAgICBzdGFydEluZGV4Kys7XG5cbiAgICB2aWV3LmZyYWdtZW50UmVmcy5mb3JFYWNoKHJlZiA9PiB7XG4gICAgICB0aGlzLl9sb29rdXBCeUluZGV4LnNldChzdGFydEluZGV4LCByZWYpO1xuICAgICAgdGhpcy5fbG9va3VwQnlWaWV3LnNldChyZWYsIHN0YXJ0SW5kZXgpO1xuICAgICAgc3RhcnRJbmRleCsrO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fdmlld0ZyYWdtZW50cy5zZXQodmlldy52aWV3UmVmLCB2aWV3LmZyYWdtZW50UmVmcyk7XG4gIH1cblxuICByZW1vdmUodmlldzogUmVuZGVyVmlld1JlZik6IHZvaWQge1xuICAgIHRoaXMuX3JlbW92ZVJlZih2aWV3KTtcbiAgICB2YXIgZnJhZ21lbnRzID0gdGhpcy5fdmlld0ZyYWdtZW50cy5nZXQodmlldyk7XG4gICAgZnJhZ21lbnRzLmZvckVhY2goKGZyYWdtZW50KSA9PiB7IHRoaXMuX3JlbW92ZVJlZihmcmFnbWVudCk7IH0pO1xuICAgIHRoaXMuX3ZpZXdGcmFnbWVudHMuZGVsZXRlKHZpZXcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVtb3ZlUmVmKHJlZjogUmVuZGVyVmlld1JlZiB8IFJlbmRlckZyYWdtZW50UmVmKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fbG9va3VwQnlWaWV3LmdldChyZWYpO1xuICAgIHRoaXMuX2xvb2t1cEJ5Vmlldy5kZWxldGUocmVmKTtcbiAgICB0aGlzLl9sb29rdXBCeUluZGV4LmRlbGV0ZShpbmRleCk7XG4gIH1cblxuICBzZXJpYWxpemVSZW5kZXJWaWV3UmVmKHZpZXdSZWY6IFJlbmRlclZpZXdSZWYpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9zZXJpYWxpemVSZW5kZXJGcmFnbWVudE9yVmlld1JlZih2aWV3UmVmKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZVJlbmRlckZyYWdtZW50UmVmKGZyYWdtZW50UmVmOiBSZW5kZXJGcmFnbWVudFJlZik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcmlhbGl6ZVJlbmRlckZyYWdtZW50T3JWaWV3UmVmKGZyYWdtZW50UmVmKTtcbiAgfVxuXG4gIGRlc2VyaWFsaXplUmVuZGVyVmlld1JlZihyZWY6IG51bWJlcik6IFJlbmRlclZpZXdSZWYge1xuICAgIGlmIChyZWYgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3JldHJpZXZlKHJlZik7XG4gIH1cblxuICBkZXNlcmlhbGl6ZVJlbmRlckZyYWdtZW50UmVmKHJlZjogbnVtYmVyKTogUmVuZGVyRnJhZ21lbnRSZWYge1xuICAgIGlmIChyZWYgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX3JldHJpZXZlKHJlZik7XG4gIH1cblxuICBwcml2YXRlIF9yZXRyaWV2ZShyZWY6IG51bWJlcik6IFJlbmRlclZpZXdSZWYgfCBSZW5kZXJGcmFnbWVudFJlZiB7XG4gICAgaWYgKHJlZiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX2xvb2t1cEJ5SW5kZXguaGFzKHJlZikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9sb29rdXBCeUluZGV4LmdldChyZWYpO1xuICB9XG5cblxuICBwcml2YXRlIF9zZXJpYWxpemVSZW5kZXJGcmFnbWVudE9yVmlld1JlZihyZWY6IFJlbmRlclZpZXdSZWYgfCBSZW5kZXJGcmFnbWVudFJlZik6IG51bWJlciB7XG4gICAgaWYgKHJlZiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fb25XZWJXb3JrZXIpIHtcbiAgICAgIHJldHVybiAoPFdlYldvcmtlclJlbmRlckZyYWdtZW50UmVmIHwgV2ViV29ya2VyUmVuZGVyVmlld1JlZj5yZWYpLnNlcmlhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fbG9va3VwQnlWaWV3LmdldChyZWYpO1xuICAgIH1cbiAgfVxuXG4gIHNlcmlhbGl6ZVZpZXdXaXRoRnJhZ21lbnRzKHZpZXc6IFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGlmICh2aWV3ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9vbldlYldvcmtlcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ3ZpZXdSZWYnOiAoPFdlYldvcmtlclJlbmRlclZpZXdSZWY+dmlldy52aWV3UmVmKS5zZXJpYWxpemUoKSxcbiAgICAgICAgJ2ZyYWdtZW50UmVmcyc6IHZpZXcuZnJhZ21lbnRSZWZzLm1hcCh2YWwgPT4gKDxhbnk+dmFsKS5zZXJpYWxpemUoKSlcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICd2aWV3UmVmJzogdGhpcy5fbG9va3VwQnlWaWV3LmdldCh2aWV3LnZpZXdSZWYpLFxuICAgICAgICAnZnJhZ21lbnRSZWZzJzogdmlldy5mcmFnbWVudFJlZnMubWFwKHZhbCA9PiB0aGlzLl9sb29rdXBCeVZpZXcuZ2V0KHZhbCkpXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGRlc2VyaWFsaXplVmlld1dpdGhGcmFnbWVudHMob2JqOiB7W2tleTogc3RyaW5nXTogYW55fSk6IFJlbmRlclZpZXdXaXRoRnJhZ21lbnRzIHtcbiAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciB2aWV3UmVmID0gdGhpcy5kZXNlcmlhbGl6ZVJlbmRlclZpZXdSZWYob2JqWyd2aWV3UmVmJ10pO1xuICAgIHZhciBmcmFnbWVudHMgPSAoPGFueVtdPm9ialsnZnJhZ21lbnRSZWZzJ10pLm1hcCh2YWwgPT4gdGhpcy5kZXNlcmlhbGl6ZVJlbmRlckZyYWdtZW50UmVmKHZhbCkpO1xuXG4gICAgcmV0dXJuIG5ldyBSZW5kZXJWaWV3V2l0aEZyYWdtZW50cyh2aWV3UmVmLCBmcmFnbWVudHMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJSZW5kZXJWaWV3UmVmIGV4dGVuZHMgUmVuZGVyVmlld1JlZiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWZOdW1iZXI6IG51bWJlcikgeyBzdXBlcigpOyB9XG4gIHNlcmlhbGl6ZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5yZWZOdW1iZXI7IH1cblxuICBzdGF0aWMgZGVzZXJpYWxpemUocmVmOiBudW1iZXIpOiBXZWJXb3JrZXJSZW5kZXJWaWV3UmVmIHtcbiAgICByZXR1cm4gbmV3IFdlYldvcmtlclJlbmRlclZpZXdSZWYocmVmKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyUmVuZGVyRnJhZ21lbnRSZWYgZXh0ZW5kcyBSZW5kZXJGcmFnbWVudFJlZiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWZOdW1iZXI6IG51bWJlcikgeyBzdXBlcigpOyB9XG5cbiAgc2VyaWFsaXplKCk6IG51bWJlciB7IHJldHVybiB0aGlzLnJlZk51bWJlcjsgfVxuXG4gIHN0YXRpYyBkZXNlcmlhbGl6ZShyZWY6IG51bWJlcik6IFdlYldvcmtlclJlbmRlckZyYWdtZW50UmVmIHtcbiAgICByZXR1cm4gbmV3IFdlYldvcmtlclJlbmRlckZyYWdtZW50UmVmKHJlZik7XG4gIH1cbn1cbiJdfQ==