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
        /**
         * Whether any work was done since the last 'whenStable' callback. This is
         * useful to detect if this could have potentially destabilized another
         * component while it is stabilizing.
         * @internal
         */
        this._didWork = false;
        /** @internal */
        this._callbacks = [];
        /** @internal */
        this._isAngularEventPending = false;
        this._watchAngularEvents(_ngZone);
    }
    /** @internal */
    Testability.prototype._watchAngularEvents = function (_ngZone) {
        var _this = this;
        async_1.ObservableWrapper.subscribe(_ngZone.onTurnStart, function (_) {
            _this._didWork = true;
            _this._isAngularEventPending = true;
        });
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
        this._didWork = true;
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
            this._didWork = true;
            return; // Not ready
        }
        // Schedules the call backs in a new frame so that it is always async.
        async_1.PromiseWrapper.resolve(null).then(function (_) {
            while (_this._callbacks.length !== 0) {
                (_this._callbacks.pop())(_this._didWork);
            }
            _this._didWork = false;
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
/**
 * A global registry of {@link Testability} instances for specific elements.
 */
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
/**
 * Set the {@link GetTestability} implementation used by the Angular testing framework.
 */
function setTestabilityGetter(getter) {
    _testabilityGetter = getter;
}
exports.setTestabilityGetter = setTestabilityGetter;
var _testabilityGetter = lang_1.CONST_EXPR(new _NoopGetTestability());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS90ZXN0YWJpbGl0eS90ZXN0YWJpbGl0eS50cyJdLCJuYW1lcyI6WyJUZXN0YWJpbGl0eSIsIlRlc3RhYmlsaXR5LmNvbnN0cnVjdG9yIiwiVGVzdGFiaWxpdHkuX3dhdGNoQW5ndWxhckV2ZW50cyIsIlRlc3RhYmlsaXR5LmluY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmRlY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmlzU3RhYmxlIiwiVGVzdGFiaWxpdHkuX3J1bkNhbGxiYWNrc0lmUmVhZHkiLCJUZXN0YWJpbGl0eS53aGVuU3RhYmxlIiwiVGVzdGFiaWxpdHkuZ2V0UGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmlzQW5ndWxhckV2ZW50UGVuZGluZyIsIlRlc3RhYmlsaXR5LmZpbmRCaW5kaW5ncyIsIlRlc3RhYmlsaXR5LmZpbmRQcm92aWRlcnMiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5IiwiVGVzdGFiaWxpdHlSZWdpc3RyeS5jb25zdHJ1Y3RvciIsIlRlc3RhYmlsaXR5UmVnaXN0cnkucmVnaXN0ZXJBcHBsaWNhdGlvbiIsIlRlc3RhYmlsaXR5UmVnaXN0cnkuZ2V0VGVzdGFiaWxpdHkiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5LmdldEFsbFRlc3RhYmlsaXRpZXMiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5LmZpbmRUZXN0YWJpbGl0eUluVHJlZSIsIl9Ob29wR2V0VGVzdGFiaWxpdHkiLCJfTm9vcEdldFRlc3RhYmlsaXR5LmNvbnN0cnVjdG9yIiwiX05vb3BHZXRUZXN0YWJpbGl0eS5hZGRUb1dpbmRvdyIsIl9Ob29wR2V0VGVzdGFiaWxpdHkuZmluZFRlc3RhYmlsaXR5SW5UcmVlIiwic2V0VGVzdGFiaWxpdHlHZXR0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG1CQUF5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QU07SUFPQUMsQ0FBQ0E7SUFMQ0QseUNBQVdBLEdBQVhBLFVBQVlBLFFBQTZCQSxJQUFTRSxDQUFDQTtJQUNuREYsbURBQXFCQSxHQUFyQkEsVUFBc0JBLFFBQTZCQSxFQUFFQSxJQUFTQSxFQUN4Q0EsZUFBd0JBO1FBQzVDRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQU5ISDtRQUFDQSxZQUFLQSxFQUFFQTs7NEJBT1BBO0lBQURBLDBCQUFDQTtBQUFEQSxDQUFDQSxBQVBELElBT0M7QUFFRDs7R0FFRztBQUNILDhCQUFxQyxNQUFzQjtJQUN6REksa0JBQWtCQSxHQUFHQSxNQUFNQSxDQUFDQTtBQUM5QkEsQ0FBQ0E7QUFGZSw0QkFBb0IsdUJBRW5DLENBQUE7QUFFRCxJQUFJLGtCQUFrQixHQUFtQixpQkFBVSxDQUFDLElBQUksbUJBQW1CLEVBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge01hcCwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0NPTlNULCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJy4uL3pvbmUvbmdfem9uZSc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cblxuLyoqXG4gKiBUaGUgVGVzdGFiaWxpdHkgc2VydmljZSBwcm92aWRlcyB0ZXN0aW5nIGhvb2tzIHRoYXQgY2FuIGJlIGFjY2Vzc2VkIGZyb21cbiAqIHRoZSBicm93c2VyIGFuZCBieSBzZXJ2aWNlcyBzdWNoIGFzIFByb3RyYWN0b3IuIEVhY2ggYm9vdHN0cmFwcGVkIEFuZ3VsYXJcbiAqIGFwcGxpY2F0aW9uIG9uIHRoZSBwYWdlIHdpbGwgaGF2ZSBhbiBpbnN0YW5jZSBvZiBUZXN0YWJpbGl0eS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlc3RhYmlsaXR5IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGVuZGluZ0NvdW50OiBudW1iZXIgPSAwO1xuICAvKipcbiAgICogV2hldGhlciBhbnkgd29yayB3YXMgZG9uZSBzaW5jZSB0aGUgbGFzdCAnd2hlblN0YWJsZScgY2FsbGJhY2suIFRoaXMgaXNcbiAgICogdXNlZnVsIHRvIGRldGVjdCBpZiB0aGlzIGNvdWxkIGhhdmUgcG90ZW50aWFsbHkgZGVzdGFiaWxpemVkIGFub3RoZXJcbiAgICogY29tcG9uZW50IHdoaWxlIGl0IGlzIHN0YWJpbGl6aW5nLlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIF9kaWRXb3JrOiBib29sZWFuID0gZmFsc2U7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NhbGxiYWNrczogRnVuY3Rpb25bXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIF9pc0FuZ3VsYXJFdmVudFBlbmRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcbiAgY29uc3RydWN0b3IoX25nWm9uZTogTmdab25lKSB7IHRoaXMuX3dhdGNoQW5ndWxhckV2ZW50cyhfbmdab25lKTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3dhdGNoQW5ndWxhckV2ZW50cyhfbmdab25lOiBOZ1pvbmUpOiB2b2lkIHtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoX25nWm9uZS5vblR1cm5TdGFydCwgKF8pID0+IHtcbiAgICAgIHRoaXMuX2RpZFdvcmsgPSB0cnVlO1xuICAgICAgdGhpcy5faXNBbmd1bGFyRXZlbnRQZW5kaW5nID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIF9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKF9uZ1pvbmUub25FdmVudERvbmUsIChfKSA9PiB7XG4gICAgICAgIGlmICghX25nWm9uZS5oYXNQZW5kaW5nVGltZXJzKSB7XG4gICAgICAgICAgdGhpcy5faXNBbmd1bGFyRXZlbnRQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5fcnVuQ2FsbGJhY2tzSWZSZWFkeSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGluY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCgpOiBudW1iZXIge1xuICAgIHRoaXMuX3BlbmRpbmdDb3VudCArPSAxO1xuICAgIHRoaXMuX2RpZFdvcmsgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLl9wZW5kaW5nQ291bnQ7XG4gIH1cblxuICBkZWNyZWFzZVBlbmRpbmdSZXF1ZXN0Q291bnQoKTogbnVtYmVyIHtcbiAgICB0aGlzLl9wZW5kaW5nQ291bnQgLT0gMTtcbiAgICBpZiAodGhpcy5fcGVuZGluZ0NvdW50IDwgMCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ3BlbmRpbmcgYXN5bmMgcmVxdWVzdHMgYmVsb3cgemVybycpO1xuICAgIH1cbiAgICB0aGlzLl9ydW5DYWxsYmFja3NJZlJlYWR5KCk7XG4gICAgcmV0dXJuIHRoaXMuX3BlbmRpbmdDb3VudDtcbiAgfVxuXG4gIGlzU3RhYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fcGVuZGluZ0NvdW50ID09IDAgJiYgIXRoaXMuX2lzQW5ndWxhckV2ZW50UGVuZGluZzsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3J1bkNhbGxiYWNrc0lmUmVhZHkoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlzU3RhYmxlKCkpIHtcbiAgICAgIHRoaXMuX2RpZFdvcmsgPSB0cnVlO1xuICAgICAgcmV0dXJuOyAgLy8gTm90IHJlYWR5XG4gICAgfVxuXG4gICAgLy8gU2NoZWR1bGVzIHRoZSBjYWxsIGJhY2tzIGluIGEgbmV3IGZyYW1lIHNvIHRoYXQgaXQgaXMgYWx3YXlzIGFzeW5jLlxuICAgIFByb21pc2VXcmFwcGVyLnJlc29sdmUobnVsbCkudGhlbigoXykgPT4ge1xuICAgICAgd2hpbGUgKHRoaXMuX2NhbGxiYWNrcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgKHRoaXMuX2NhbGxiYWNrcy5wb3AoKSkodGhpcy5fZGlkV29yayk7XG4gICAgICB9XG4gICAgICB0aGlzLl9kaWRXb3JrID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICB3aGVuU3RhYmxlKGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB0aGlzLl9ydW5DYWxsYmFja3NJZlJlYWR5KCk7XG4gIH1cblxuICBnZXRQZW5kaW5nUmVxdWVzdENvdW50KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9wZW5kaW5nQ291bnQ7IH1cblxuICAvLyBUaGlzIG9ubHkgYWNjb3VudHMgZm9yIG5nWm9uZSwgYW5kIG5vdCBwZW5kaW5nIGNvdW50cy4gVXNlIGB3aGVuU3RhYmxlYCB0b1xuICAvLyBjaGVjayBmb3Igc3RhYmlsaXR5LlxuICBpc0FuZ3VsYXJFdmVudFBlbmRpbmcoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9pc0FuZ3VsYXJFdmVudFBlbmRpbmc7IH1cblxuICBmaW5kQmluZGluZ3ModXNpbmc6IGFueSwgcHJvdmlkZXI6IHN0cmluZywgZXhhY3RNYXRjaDogYm9vbGVhbik6IGFueVtdIHtcbiAgICAvLyBUT0RPKGp1bGllbXIpOiBpbXBsZW1lbnQuXG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgZmluZFByb3ZpZGVycyh1c2luZzogYW55LCBwcm92aWRlcjogc3RyaW5nLCBleGFjdE1hdGNoOiBib29sZWFuKTogYW55W10ge1xuICAgIC8vIFRPRE8oanVsaWVtcik6IGltcGxlbWVudC5cbiAgICByZXR1cm4gW107XG4gIH1cbn1cblxuLyoqXG4gKiBBIGdsb2JhbCByZWdpc3RyeSBvZiB7QGxpbmsgVGVzdGFiaWxpdHl9IGluc3RhbmNlcyBmb3Igc3BlY2lmaWMgZWxlbWVudHMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZXN0YWJpbGl0eVJlZ2lzdHJ5IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXBwbGljYXRpb25zID0gbmV3IE1hcDxhbnksIFRlc3RhYmlsaXR5PigpO1xuXG4gIGNvbnN0cnVjdG9yKCkgeyBfdGVzdGFiaWxpdHlHZXR0ZXIuYWRkVG9XaW5kb3codGhpcyk7IH1cblxuICByZWdpc3RlckFwcGxpY2F0aW9uKHRva2VuOiBhbnksIHRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSkge1xuICAgIHRoaXMuX2FwcGxpY2F0aW9ucy5zZXQodG9rZW4sIHRlc3RhYmlsaXR5KTtcbiAgfVxuXG4gIGdldFRlc3RhYmlsaXR5KGVsZW06IGFueSk6IFRlc3RhYmlsaXR5IHsgcmV0dXJuIHRoaXMuX2FwcGxpY2F0aW9ucy5nZXQoZWxlbSk7IH1cblxuICBnZXRBbGxUZXN0YWJpbGl0aWVzKCk6IFRlc3RhYmlsaXR5W10geyByZXR1cm4gTWFwV3JhcHBlci52YWx1ZXModGhpcy5fYXBwbGljYXRpb25zKTsgfVxuXG4gIGZpbmRUZXN0YWJpbGl0eUluVHJlZShlbGVtOiBOb2RlLCBmaW5kSW5BbmNlc3RvcnM6IGJvb2xlYW4gPSB0cnVlKTogVGVzdGFiaWxpdHkge1xuICAgIHJldHVybiBfdGVzdGFiaWxpdHlHZXR0ZXIuZmluZFRlc3RhYmlsaXR5SW5UcmVlKHRoaXMsIGVsZW0sIGZpbmRJbkFuY2VzdG9ycyk7XG4gIH1cbn1cblxuLyoqXG4gKiBBZGFwdGVyIGludGVyZmFjZSBmb3IgcmV0cmlldmluZyB0aGUgYFRlc3RhYmlsaXR5YCBzZXJ2aWNlIGFzc29jaWF0ZWQgZm9yIGFcbiAqIHBhcnRpY3VsYXIgY29udGV4dC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHZXRUZXN0YWJpbGl0eSB7XG4gIGFkZFRvV2luZG93KHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5KTogdm9pZDtcbiAgZmluZFRlc3RhYmlsaXR5SW5UcmVlKHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBlbGVtOiBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5kSW5BbmNlc3RvcnM6IGJvb2xlYW4pOiBUZXN0YWJpbGl0eTtcbn1cblxuQENPTlNUKClcbmNsYXNzIF9Ob29wR2V0VGVzdGFiaWxpdHkgaW1wbGVtZW50cyBHZXRUZXN0YWJpbGl0eSB7XG4gIGFkZFRvV2luZG93KHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5KTogdm9pZCB7fVxuICBmaW5kVGVzdGFiaWxpdHlJblRyZWUocmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnksIGVsZW06IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmRJbkFuY2VzdG9yczogYm9vbGVhbik6IFRlc3RhYmlsaXR5IHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFNldCB0aGUge0BsaW5rIEdldFRlc3RhYmlsaXR5fSBpbXBsZW1lbnRhdGlvbiB1c2VkIGJ5IHRoZSBBbmd1bGFyIHRlc3RpbmcgZnJhbWV3b3JrLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VGVzdGFiaWxpdHlHZXR0ZXIoZ2V0dGVyOiBHZXRUZXN0YWJpbGl0eSk6IHZvaWQge1xuICBfdGVzdGFiaWxpdHlHZXR0ZXIgPSBnZXR0ZXI7XG59XG5cbnZhciBfdGVzdGFiaWxpdHlHZXR0ZXI6IEdldFRlc3RhYmlsaXR5ID0gQ09OU1RfRVhQUihuZXcgX05vb3BHZXRUZXN0YWJpbGl0eSgpKTtcbiJdfQ==