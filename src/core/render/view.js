'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var api_1 = require('./api');
var DefaultProtoViewRef = (function (_super) {
    __extends(DefaultProtoViewRef, _super);
    function DefaultProtoViewRef(template, cmds) {
        _super.call(this);
        this.template = template;
        this.cmds = cmds;
    }
    return DefaultProtoViewRef;
})(api_1.RenderProtoViewRef);
exports.DefaultProtoViewRef = DefaultProtoViewRef;
var DefaultRenderFragmentRef = (function (_super) {
    __extends(DefaultRenderFragmentRef, _super);
    function DefaultRenderFragmentRef(nodes) {
        _super.call(this);
        this.nodes = nodes;
    }
    return DefaultRenderFragmentRef;
})(api_1.RenderFragmentRef);
exports.DefaultRenderFragmentRef = DefaultRenderFragmentRef;
var DefaultRenderView = (function (_super) {
    __extends(DefaultRenderView, _super);
    function DefaultRenderView(fragments, boundTextNodes, boundElements, nativeShadowRoots, globalEventAdders, rootContentInsertionPoints) {
        _super.call(this);
        this.fragments = fragments;
        this.boundTextNodes = boundTextNodes;
        this.boundElements = boundElements;
        this.nativeShadowRoots = nativeShadowRoots;
        this.globalEventAdders = globalEventAdders;
        this.rootContentInsertionPoints = rootContentInsertionPoints;
        this.hydrated = false;
        this.eventDispatcher = null;
        this.globalEventRemovers = null;
    }
    DefaultRenderView.prototype.hydrate = function () {
        if (this.hydrated)
            throw new exceptions_1.BaseException('The view is already hydrated.');
        this.hydrated = true;
        this.globalEventRemovers = collection_1.ListWrapper.createFixedSize(this.globalEventAdders.length);
        for (var i = 0; i < this.globalEventAdders.length; i++) {
            this.globalEventRemovers[i] = this.globalEventAdders[i]();
        }
    };
    DefaultRenderView.prototype.dehydrate = function () {
        if (!this.hydrated)
            throw new exceptions_1.BaseException('The view is already dehydrated.');
        for (var i = 0; i < this.globalEventRemovers.length; i++) {
            this.globalEventRemovers[i]();
        }
        this.globalEventRemovers = null;
        this.hydrated = false;
    };
    DefaultRenderView.prototype.setEventDispatcher = function (dispatcher) { this.eventDispatcher = dispatcher; };
    DefaultRenderView.prototype.dispatchRenderEvent = function (boundElementIndex, eventName, event) {
        var allowDefaultBehavior = true;
        if (lang_1.isPresent(this.eventDispatcher)) {
            var locals = new collection_1.Map();
            locals.set('$event', event);
            allowDefaultBehavior =
                this.eventDispatcher.dispatchRenderEvent(boundElementIndex, eventName, locals);
        }
        return allowDefaultBehavior;
    };
    return DefaultRenderView;
})(api_1.RenderViewRef);
exports.DefaultRenderView = DefaultRenderView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci92aWV3LnRzIl0sIm5hbWVzIjpbIkRlZmF1bHRQcm90b1ZpZXdSZWYiLCJEZWZhdWx0UHJvdG9WaWV3UmVmLmNvbnN0cnVjdG9yIiwiRGVmYXVsdFJlbmRlckZyYWdtZW50UmVmIiwiRGVmYXVsdFJlbmRlckZyYWdtZW50UmVmLmNvbnN0cnVjdG9yIiwiRGVmYXVsdFJlbmRlclZpZXciLCJEZWZhdWx0UmVuZGVyVmlldy5jb25zdHJ1Y3RvciIsIkRlZmF1bHRSZW5kZXJWaWV3Lmh5ZHJhdGUiLCJEZWZhdWx0UmVuZGVyVmlldy5kZWh5ZHJhdGUiLCJEZWZhdWx0UmVuZGVyVmlldy5zZXRFdmVudERpc3BhdGNoZXIiLCJEZWZhdWx0UmVuZGVyVmlldy5kaXNwYXRjaFJlbmRlckV2ZW50Il0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELDJCQUE2RCxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzlGLHFCQUE0QywwQkFBMEIsQ0FBQyxDQUFBO0FBRXZFLG9CQU9PLE9BQU8sQ0FBQyxDQUFBO0FBRWY7SUFBeUNBLHVDQUFrQkE7SUFDekRBLDZCQUFtQkEsUUFBaUNBLEVBQVNBLElBQXlCQTtRQUNwRkMsaUJBQU9BLENBQUNBO1FBRFNBLGFBQVFBLEdBQVJBLFFBQVFBLENBQXlCQTtRQUFTQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFxQkE7SUFFdEZBLENBQUNBO0lBQ0hELDBCQUFDQTtBQUFEQSxDQUFDQSxBQUpELEVBQXlDLHdCQUFrQixFQUkxRDtBQUpZLDJCQUFtQixzQkFJL0IsQ0FBQTtBQUVEO0lBQWlERSw0Q0FBaUJBO0lBQ2hFQSxrQ0FBbUJBLEtBQVVBO1FBQUlDLGlCQUFPQSxDQUFDQTtRQUF0QkEsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBS0E7SUFBYUEsQ0FBQ0E7SUFDN0NELCtCQUFDQTtBQUFEQSxDQUFDQSxB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QUVBLEtBQUtBLENBQUNBLENBQUNBO1lBQzVCQSxvQkFBb0JBO2dCQUNoQkEsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxpQkFBaUJBLEVBQUVBLFNBQVNBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3JGQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxvQkFBb0JBLENBQUNBO0lBQzlCQSxDQUFDQTtJQUNITCx3QkFBQ0E7QUFBREEsQ0FBQ0EsQUF6Q0QsRUFBMEMsbUJBQWEsRUF5Q3REO0FBekNZLHlCQUFpQixvQkF5QzdCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyLCBNYXAsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgc3RyaW5naWZ5fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge1xuICBSZW5kZXJDb21wb25lbnRUZW1wbGF0ZSxcbiAgUmVuZGVyVmlld1JlZixcbiAgUmVuZGVyRXZlbnREaXNwYXRjaGVyLFxuICBSZW5kZXJUZW1wbGF0ZUNtZCxcbiAgUmVuZGVyUHJvdG9WaWV3UmVmLFxuICBSZW5kZXJGcmFnbWVudFJlZlxufSBmcm9tICcuL2FwaSc7XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0UHJvdG9WaWV3UmVmIGV4dGVuZHMgUmVuZGVyUHJvdG9WaWV3UmVmIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRlbXBsYXRlOiBSZW5kZXJDb21wb25lbnRUZW1wbGF0ZSwgcHVibGljIGNtZHM6IFJlbmRlclRlbXBsYXRlQ21kW10pIHtcbiAgICBzdXBlcigpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0UmVuZGVyRnJhZ21lbnRSZWY8Tj4gZXh0ZW5kcyBSZW5kZXJGcmFnbWVudFJlZiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBub2RlczogTltdKSB7IHN1cGVyKCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIERlZmF1bHRSZW5kZXJWaWV3PE4+IGV4dGVuZHMgUmVuZGVyVmlld1JlZiB7XG4gIGh5ZHJhdGVkOiBib29sZWFuID0gZmFsc2U7XG4gIGV2ZW50RGlzcGF0Y2hlcjogUmVuZGVyRXZlbnREaXNwYXRjaGVyID0gbnVsbDtcbiAgZ2xvYmFsRXZlbnRSZW1vdmVyczogRnVuY3Rpb25bXSA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGZyYWdtZW50czogRGVmYXVsdFJlbmRlckZyYWdtZW50UmVmPE4+W10sIHB1YmxpYyBib3VuZFRleHROb2RlczogTltdLFxuICAgICAgICAgICAgICBwdWJsaWMgYm91bmRFbGVtZW50czogTltdLCBwdWJsaWMgbmF0aXZlU2hhZG93Um9vdHM6IE5bXSxcbiAgICAgICAgICAgICAgcHVibGljIGdsb2JhbEV2ZW50QWRkZXJzOiBGdW5jdGlvbltdLCBwdWJsaWMgcm9vdENvbnRlbnRJbnNlcnRpb25Qb2ludHM6IE5bXSkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBoeWRyYXRlKCkge1xuICAgIGlmICh0aGlzLmh5ZHJhdGVkKSB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignVGhlIHZpZXcgaXMgYWxyZWFkeSBoeWRyYXRlZC4nKTtcbiAgICB0aGlzLmh5ZHJhdGVkID0gdHJ1ZTtcbiAgICB0aGlzLmdsb2JhbEV2ZW50UmVtb3ZlcnMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUodGhpcy5nbG9iYWxFdmVudEFkZGVycy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5nbG9iYWxFdmVudEFkZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5nbG9iYWxFdmVudFJlbW92ZXJzW2ldID0gdGhpcy5nbG9iYWxFdmVudEFkZGVyc1tpXSgpO1xuICAgIH1cbiAgfVxuXG4gIGRlaHlkcmF0ZSgpIHtcbiAgICBpZiAoIXRoaXMuaHlkcmF0ZWQpIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdUaGUgdmlldyBpcyBhbHJlYWR5IGRlaHlkcmF0ZWQuJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdsb2JhbEV2ZW50UmVtb3ZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuZ2xvYmFsRXZlbnRSZW1vdmVyc1tpXSgpO1xuICAgIH1cbiAgICB0aGlzLmdsb2JhbEV2ZW50UmVtb3ZlcnMgPSBudWxsO1xuICAgIHRoaXMuaHlkcmF0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHNldEV2ZW50RGlzcGF0Y2hlcihkaXNwYXRjaGVyOiBSZW5kZXJFdmVudERpc3BhdGNoZXIpIHsgdGhpcy5ldmVudERpc3BhdGNoZXIgPSBkaXNwYXRjaGVyOyB9XG5cbiAgZGlzcGF0Y2hSZW5kZXJFdmVudChib3VuZEVsZW1lbnRJbmRleDogbnVtYmVyLCBldmVudE5hbWU6IHN0cmluZywgZXZlbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIHZhciBhbGxvd0RlZmF1bHRCZWhhdmlvciA9IHRydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmV2ZW50RGlzcGF0Y2hlcikpIHtcbiAgICAgIHZhciBsb2NhbHMgPSBuZXcgTWFwPHN0cmluZywgYW55PigpO1xuICAgICAgbG9jYWxzLnNldCgnJGV2ZW50JywgZXZlbnQpO1xuICAgICAgYWxsb3dEZWZhdWx0QmVoYXZpb3IgPVxuICAgICAgICAgIHRoaXMuZXZlbnREaXNwYXRjaGVyLmRpc3BhdGNoUmVuZGVyRXZlbnQoYm91bmRFbGVtZW50SW5kZXgsIGV2ZW50TmFtZSwgbG9jYWxzKTtcbiAgICB9XG4gICAgcmV0dXJuIGFsbG93RGVmYXVsdEJlaGF2aW9yO1xuICB9XG59XG4iXX0=