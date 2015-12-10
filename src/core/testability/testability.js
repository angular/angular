'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var ng_zone_1 = require('../zone/ng_zone');
var async_1 = require('angular2/src/facade/async');
/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
var Testability = (function () {
    function Testability(_ngZone) {
        /** @internal */
        this._pendingCount = 0;
        /** @internal */
        this._callbacks = [];
        /** @internal */
        this._isAngularEventPending = false;
        this._watchAngularEvents(_ngZone);
    }
    /** @internal */
    Testability.prototype._watchAngularEvents = function (_ngZone) {
        var _this = this;
        async_1.ObservableWrapper.subscribe(_ngZone.onTurnStart, function (_) { _this._isAngularEventPending = true; });
        _ngZone.runOutsideAngular(function () {
            async_1.ObservableWrapper.subscribe(_ngZone.onEventDone, function (_) {
                if (!_ngZone.hasPendingTimers) {
                    _this._isAngularEventPending = false;
                    _this._runCallbacksIfReady();
                }
            });
        });
    };
    Testability.prototype.increasePendingRequestCount = function () {
        this._pendingCount += 1;
        return this._pendingCount;
    };
    Testability.prototype.decreasePendingRequestCount = function () {
        this._pendingCount -= 1;
        if (this._pendingCount < 0) {
            throw new exceptions_1.BaseException('pending async requests below zero');
        }
        this._runCallbacksIfReady();
        return this._pendingCount;
    };
    Testability.prototype.isStable = function () { return this._pendingCount == 0 && !this._isAngularEventPending; };
    /** @internal */
    Testability.prototype._runCallbacksIfReady = function () {
        var _this = this;
        if (!this.isStable()) {
            return; // Not ready
        }
        // Schedules the call backs in a new frame so that it is always async.
        async_1.PromiseWrapper.resolve(null).then(function (_) {
            while (_this._callbacks.length !== 0) {
                (_this._callbacks.pop())();
            }
        });
    };
    Testability.prototype.whenStable = function (callback) {
        this._callbacks.push(callback);
        this._runCallbacksIfReady();
    };
    Testability.prototype.getPendingRequestCount = function () { return this._pendingCount; };
    // This only accounts for ngZone, and not pending counts. Use `whenStable` to
    // check for stability.
    Testability.prototype.isAngularEventPending = function () { return this._isAngularEventPending; };
    Testability.prototype.findBindings = function (using, provider, exactMatch) {
        // TODO(juliemr): implement.
        return [];
    };
    Testability.prototype.findProviders = function (using, provider, exactMatch) {
        // TODO(juliemr): implement.
        return [];
    };
    Testability = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [ng_zone_1.NgZone])
    ], Testability);
    return Testability;
})();
exports.Testability = Testability;
var TestabilityRegistry = (function () {
    function TestabilityRegistry() {
        /** @internal */
        this._applications = new collection_1.Map();
        _testabilityGetter.addToWindow(this);
    }
    TestabilityRegistry.prototype.registerApplication = function (token, testability) {
        this._applications.set(token, testability);
    };
    TestabilityRegistry.prototype.getTestability = function (elem) { return this._applications.get(elem); };
    TestabilityRegistry.prototype.getAllTestabilities = function () { return collection_1.MapWrapper.values(this._applications); };
    TestabilityRegistry.prototype.findTestabilityInTree = function (elem, findInAncestors) {
        if (findInAncestors === void 0) { findInAncestors = true; }
        return _testabilityGetter.findTestabilityInTree(this, elem, findInAncestors);
    };
    TestabilityRegistry = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], TestabilityRegistry);
    return TestabilityRegistry;
})();
exports.TestabilityRegistry = TestabilityRegistry;
var _NoopGetTestability = (function () {
    function _NoopGetTestability() {
    }
    _NoopGetTestability.prototype.addToWindow = function (registry) { };
    _NoopGetTestability.prototype.findTestabilityInTree = function (registry, elem, findInAncestors) {
        return null;
    };
    _NoopGetTestability = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], _NoopGetTestability);
    return _NoopGetTestability;
})();
function setTestabilityGetter(getter) {
    _testabilityGetter = getter;
}
exports.setTestabilityGetter = setTestabilityGetter;
var _testabilityGetter = lang_1.CONST_EXPR(new _NoopGetTestability());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS90ZXN0YWJpbGl0eS90ZXN0YWJpbGl0eS50cyJdLCJuYW1lcyI6WyJUZXN0YWJpbGl0eSIsIlRlc3RhYmlsaXR5LmNvbnN0cnVjdG9yIiwiVGVzdGFiaWxpdHkuX3dhdGNoQW5ndWxhckV2ZW50cyIsIlRlc3RhYmlsaXR5LmluY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmRlY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmlzU3RhYmxlIiwiVGVzdGFiaWxpdHkuX3J1bkNhbGxiYWNrc0lmUmVhZHkiLCJUZXN0YWJpbGl0eS53aGVuU3RhYmxlIiwiVGVzdGFiaWxpdHkuZ2V0UGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmlzQW5ndWxhckV2ZW50UGVuZGluZyIsIlRlc3RhYmlsaXR5LmZpbmRCaW5kaW5ncyIsIlRlc3RhYmlsaXR5LmZpbmRQcm92aWRlcnMiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5IiwiVGVzdGFiaWxpdHlSZWdpc3RyeS5jb25zdHJ1Y3RvciIsIlRlc3RhYmlsaXR5UmVnaXN0cnkucmVnaXN0ZXJBcHBsaWNhdGlvbiIsIlRlc3RhYmlsaXR5UmVnaXN0cnkuZ2V0VGVzdGFiaWxpdHkiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5LmdldEFsbFRlc3RhYmlsaXRpZXMiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5LmZpbmRUZXN0YWJpbGl0eUluVHJlZSIsIl9Ob29wR2V0VGVzdGFiaWxpdHkiLCJfTm9vcEdldFRlc3RhYmlsaXR5LmNvbnN0cnVjdG9yIiwiX05vb3BHZXRUZXN0YWJpbGl0eS5hZGRUb1dpbmRvdyIsIl9Ob29wR2V0VGVzdGFiaWxpdHkuZmluZFRlc3RhYmlsaXR5SW5UcmVlIiwic2V0VGVzdGFiaWxpdHlHZXR0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1CQUF5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SSxrQkFBa0JBLEdBQUdBLE1BQU1BLENBQUNBO0FBQzlCQSxDQUFDQTtBQUZlLDRCQUFvQix1QkFFbkMsQ0FBQTtBQUVELElBQUksa0JBQWtCLEdBQW1CLGlCQUFVLENBQUMsSUFBSSxtQkFBbUIsRUFBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7TWFwLCBNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7Q09OU1QsIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnLi4vem9uZS9uZ196b25lJztcbmltcG9ydCB7UHJvbWlzZVdyYXBwZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuXG4vKipcbiAqIFRoZSBUZXN0YWJpbGl0eSBzZXJ2aWNlIHByb3ZpZGVzIHRlc3RpbmcgaG9va3MgdGhhdCBjYW4gYmUgYWNjZXNzZWQgZnJvbVxuICogdGhlIGJyb3dzZXIgYW5kIGJ5IHNlcnZpY2VzIHN1Y2ggYXMgUHJvdHJhY3Rvci4gRWFjaCBib290c3RyYXBwZWQgQW5ndWxhclxuICogYXBwbGljYXRpb24gb24gdGhlIHBhZ2Ugd2lsbCBoYXZlIGFuIGluc3RhbmNlIG9mIFRlc3RhYmlsaXR5LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGVzdGFiaWxpdHkge1xuICAvKiogQGludGVybmFsICovXG4gIF9wZW5kaW5nQ291bnQ6IG51bWJlciA9IDA7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NhbGxiYWNrczogRnVuY3Rpb25bXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIF9pc0FuZ3VsYXJFdmVudFBlbmRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgY29uc3RydWN0b3IoX25nWm9uZTogTmdab25lKSB7IHRoaXMuX3dhdGNoQW5ndWxhckV2ZW50cyhfbmdab25lKTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3dhdGNoQW5ndWxhckV2ZW50cyhfbmdab25lOiBOZ1pvbmUpOiB2b2lkIHtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoX25nWm9uZS5vblR1cm5TdGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKF8pID0+IHsgdGhpcy5faXNBbmd1bGFyRXZlbnRQZW5kaW5nID0gdHJ1ZTsgfSk7XG5cbiAgICBfbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShfbmdab25lLm9uRXZlbnREb25lLCAoXykgPT4ge1xuICAgICAgICBpZiAoIV9uZ1pvbmUuaGFzUGVuZGluZ1RpbWVycykge1xuICAgICAgICAgIHRoaXMuX2lzQW5ndWxhckV2ZW50UGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuX3J1bkNhbGxiYWNrc0lmUmVhZHkoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpbmNyZWFzZVBlbmRpbmdSZXF1ZXN0Q291bnQoKTogbnVtYmVyIHtcbiAgICB0aGlzLl9wZW5kaW5nQ291bnQgKz0gMTtcbiAgICByZXR1cm4gdGhpcy5fcGVuZGluZ0NvdW50O1xuICB9XG5cbiAgZGVjcmVhc2VQZW5kaW5nUmVxdWVzdENvdW50KCk6IG51bWJlciB7XG4gICAgdGhpcy5fcGVuZGluZ0NvdW50IC09IDE7XG4gICAgaWYgKHRoaXMuX3BlbmRpbmdDb3VudCA8IDApIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdwZW5kaW5nIGFzeW5jIHJlcXVlc3RzIGJlbG93IHplcm8nKTtcbiAgICB9XG4gICAgdGhpcy5fcnVuQ2FsbGJhY2tzSWZSZWFkeSgpO1xuICAgIHJldHVybiB0aGlzLl9wZW5kaW5nQ291bnQ7XG4gIH1cblxuICBpc1N0YWJsZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3BlbmRpbmdDb3VudCA9PSAwICYmICF0aGlzLl9pc0FuZ3VsYXJFdmVudFBlbmRpbmc7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9ydW5DYWxsYmFja3NJZlJlYWR5KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pc1N0YWJsZSgpKSB7XG4gICAgICByZXR1cm47ICAvLyBOb3QgcmVhZHlcbiAgICB9XG5cbiAgICAvLyBTY2hlZHVsZXMgdGhlIGNhbGwgYmFja3MgaW4gYSBuZXcgZnJhbWUgc28gdGhhdCBpdCBpcyBhbHdheXMgYXN5bmMuXG4gICAgUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShudWxsKS50aGVuKChfKSA9PiB7XG4gICAgICB3aGlsZSAodGhpcy5fY2FsbGJhY2tzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAodGhpcy5fY2FsbGJhY2tzLnBvcCgpKSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgd2hlblN0YWJsZShjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICB0aGlzLl9jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgdGhpcy5fcnVuQ2FsbGJhY2tzSWZSZWFkeSgpO1xuICB9XG5cbiAgZ2V0UGVuZGluZ1JlcXVlc3RDb3VudCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fcGVuZGluZ0NvdW50OyB9XG5cbiAgLy8gVGhpcyBvbmx5IGFjY291bnRzIGZvciBuZ1pvbmUsIGFuZCBub3QgcGVuZGluZyBjb3VudHMuIFVzZSBgd2hlblN0YWJsZWAgdG9cbiAgLy8gY2hlY2sgZm9yIHN0YWJpbGl0eS5cbiAgaXNBbmd1bGFyRXZlbnRQZW5kaW5nKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faXNBbmd1bGFyRXZlbnRQZW5kaW5nOyB9XG5cbiAgZmluZEJpbmRpbmdzKHVzaW5nOiBhbnksIHByb3ZpZGVyOiBzdHJpbmcsIGV4YWN0TWF0Y2g6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgLy8gVE9ETyhqdWxpZW1yKTogaW1wbGVtZW50LlxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGZpbmRQcm92aWRlcnModXNpbmc6IGFueSwgcHJvdmlkZXI6IHN0cmluZywgZXhhY3RNYXRjaDogYm9vbGVhbik6IGFueVtdIHtcbiAgICAvLyBUT0RPKGp1bGllbXIpOiBpbXBsZW1lbnQuXG4gICAgcmV0dXJuIFtdO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZXN0YWJpbGl0eVJlZ2lzdHJ5IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXBwbGljYXRpb25zID0gbmV3IE1hcDxhbnksIFRlc3RhYmlsaXR5PigpO1xuXG4gIGNvbnN0cnVjdG9yKCkgeyBfdGVzdGFiaWxpdHlHZXR0ZXIuYWRkVG9XaW5kb3codGhpcyk7IH1cblxuICByZWdpc3RlckFwcGxpY2F0aW9uKHRva2VuOiBhbnksIHRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSkge1xuICAgIHRoaXMuX2FwcGxpY2F0aW9ucy5zZXQodG9rZW4sIHRlc3RhYmlsaXR5KTtcbiAgfVxuXG4gIGdldFRlc3RhYmlsaXR5KGVsZW06IGFueSk6IFRlc3RhYmlsaXR5IHsgcmV0dXJuIHRoaXMuX2FwcGxpY2F0aW9ucy5nZXQoZWxlbSk7IH1cblxuICBnZXRBbGxUZXN0YWJpbGl0aWVzKCk6IFRlc3RhYmlsaXR5W10geyByZXR1cm4gTWFwV3JhcHBlci52YWx1ZXModGhpcy5fYXBwbGljYXRpb25zKTsgfVxuXG4gIGZpbmRUZXN0YWJpbGl0eUluVHJlZShlbGVtOiBOb2RlLCBmaW5kSW5BbmNlc3RvcnM6IGJvb2xlYW4gPSB0cnVlKTogVGVzdGFiaWxpdHkge1xuICAgIHJldHVybiBfdGVzdGFiaWxpdHlHZXR0ZXIuZmluZFRlc3RhYmlsaXR5SW5UcmVlKHRoaXMsIGVsZW0sIGZpbmRJbkFuY2VzdG9ycyk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBHZXRUZXN0YWJpbGl0eSB7XG4gIGFkZFRvV2luZG93KHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5KTogdm9pZDtcbiAgZmluZFRlc3RhYmlsaXR5SW5UcmVlKHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBlbGVtOiBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5kSW5BbmNlc3RvcnM6IGJvb2xlYW4pOiBUZXN0YWJpbGl0eTtcbn1cblxuQENPTlNUKClcbmNsYXNzIF9Ob29wR2V0VGVzdGFiaWxpdHkgaW1wbGVtZW50cyBHZXRUZXN0YWJpbGl0eSB7XG4gIGFkZFRvV2luZG93KHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5KTogdm9pZCB7fVxuICBmaW5kVGVzdGFiaWxpdHlJblRyZWUocmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnksIGVsZW06IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmRJbkFuY2VzdG9yczogYm9vbGVhbik6IFRlc3RhYmlsaXR5IHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0VGVzdGFiaWxpdHlHZXR0ZXIoZ2V0dGVyOiBHZXRUZXN0YWJpbGl0eSk6IHZvaWQge1xuICBfdGVzdGFiaWxpdHlHZXR0ZXIgPSBnZXR0ZXI7XG59XG5cbnZhciBfdGVzdGFiaWxpdHlHZXR0ZXI6IEdldFRlc3RhYmlsaXR5ID0gQ09OU1RfRVhQUihuZXcgX05vb3BHZXRUZXN0YWJpbGl0eSgpKTtcbiJdfQ==