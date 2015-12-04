'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS90ZXN0YWJpbGl0eS90ZXN0YWJpbGl0eS50cyJdLCJuYW1lcyI6WyJUZXN0YWJpbGl0eSIsIlRlc3RhYmlsaXR5LmNvbnN0cnVjdG9yIiwiVGVzdGFiaWxpdHkuX3dhdGNoQW5ndWxhckV2ZW50cyIsIlRlc3RhYmlsaXR5LmluY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmRlY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmlzU3RhYmxlIiwiVGVzdGFiaWxpdHkuX3J1bkNhbGxiYWNrc0lmUmVhZHkiLCJUZXN0YWJpbGl0eS53aGVuU3RhYmxlIiwiVGVzdGFiaWxpdHkuZ2V0UGVuZGluZ1JlcXVlc3RDb3VudCIsIlRlc3RhYmlsaXR5LmlzQW5ndWxhckV2ZW50UGVuZGluZyIsIlRlc3RhYmlsaXR5LmZpbmRCaW5kaW5ncyIsIlRlc3RhYmlsaXR5LmZpbmRQcm92aWRlcnMiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5IiwiVGVzdGFiaWxpdHlSZWdpc3RyeS5jb25zdHJ1Y3RvciIsIlRlc3RhYmlsaXR5UmVnaXN0cnkucmVnaXN0ZXJBcHBsaWNhdGlvbiIsIlRlc3RhYmlsaXR5UmVnaXN0cnkuZ2V0VGVzdGFiaWxpdHkiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5LmdldEFsbFRlc3RhYmlsaXRpZXMiLCJUZXN0YWJpbGl0eVJlZ2lzdHJ5LmZpbmRUZXN0YWJpbGl0eUluVHJlZSIsIl9Ob29wR2V0VGVzdGFiaWxpdHkiLCJfTm9vcEdldFRlc3RhYmlsaXR5LmNvbnN0cnVjdG9yIiwiX05vb3BHZXRUZXN0YWJpbGl0eS5hZGRUb1dpbmRvdyIsIl9Ob29wR2V0VGVzdGFiaWxpdHkuZmluZFRlc3RhYmlsaXR5SW5UcmVlIiwic2V0VGVzdGFiaWxpdHlHZXR0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsbUJB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ekRJLGtCQUFrQkEsR0FBR0EsTUFBTUEsQ0FBQ0E7QUFDOUJBLENBQUNBO0FBRmUsNEJBQW9CLHVCQUVuQyxDQUFBO0FBRUQsSUFBSSxrQkFBa0IsR0FBbUIsaUJBQVUsQ0FBQyxJQUFJLG1CQUFtQixFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtNYXAsIE1hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtDT05TVCwgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Tmdab25lfSBmcm9tICcuLi96b25lL25nX3pvbmUnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5cbi8qKlxuICogVGhlIFRlc3RhYmlsaXR5IHNlcnZpY2UgcHJvdmlkZXMgdGVzdGluZyBob29rcyB0aGF0IGNhbiBiZSBhY2Nlc3NlZCBmcm9tXG4gKiB0aGUgYnJvd3NlciBhbmQgYnkgc2VydmljZXMgc3VjaCBhcyBQcm90cmFjdG9yLiBFYWNoIGJvb3RzdHJhcHBlZCBBbmd1bGFyXG4gKiBhcHBsaWNhdGlvbiBvbiB0aGUgcGFnZSB3aWxsIGhhdmUgYW4gaW5zdGFuY2Ugb2YgVGVzdGFiaWxpdHkuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUZXN0YWJpbGl0eSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BlbmRpbmdDb3VudDogbnVtYmVyID0gMDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY2FsbGJhY2tzOiBGdW5jdGlvbltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2lzQW5ndWxhckV2ZW50UGVuZGluZzogYm9vbGVhbiA9IGZhbHNlO1xuICBjb25zdHJ1Y3Rvcihfbmdab25lOiBOZ1pvbmUpIHsgdGhpcy5fd2F0Y2hBbmd1bGFyRXZlbnRzKF9uZ1pvbmUpOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfd2F0Y2hBbmd1bGFyRXZlbnRzKF9uZ1pvbmU6IE5nWm9uZSk6IHZvaWQge1xuICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShfbmdab25lLm9uVHVyblN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoXykgPT4geyB0aGlzLl9pc0FuZ3VsYXJFdmVudFBlbmRpbmcgPSB0cnVlOyB9KTtcblxuICAgIF9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKF9uZ1pvbmUub25FdmVudERvbmUsIChfKSA9PiB7XG4gICAgICAgIGlmICghX25nWm9uZS5oYXNQZW5kaW5nVGltZXJzKSB7XG4gICAgICAgICAgdGhpcy5faXNBbmd1bGFyRXZlbnRQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5fcnVuQ2FsbGJhY2tzSWZSZWFkeSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGluY3JlYXNlUGVuZGluZ1JlcXVlc3RDb3VudCgpOiBudW1iZXIge1xuICAgIHRoaXMuX3BlbmRpbmdDb3VudCArPSAxO1xuICAgIHJldHVybiB0aGlzLl9wZW5kaW5nQ291bnQ7XG4gIH1cblxuICBkZWNyZWFzZVBlbmRpbmdSZXF1ZXN0Q291bnQoKTogbnVtYmVyIHtcbiAgICB0aGlzLl9wZW5kaW5nQ291bnQgLT0gMTtcbiAgICBpZiAodGhpcy5fcGVuZGluZ0NvdW50IDwgMCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ3BlbmRpbmcgYXN5bmMgcmVxdWVzdHMgYmVsb3cgemVybycpO1xuICAgIH1cbiAgICB0aGlzLl9ydW5DYWxsYmFja3NJZlJlYWR5KCk7XG4gICAgcmV0dXJuIHRoaXMuX3BlbmRpbmdDb3VudDtcbiAgfVxuXG4gIGlzU3RhYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fcGVuZGluZ0NvdW50ID09IDAgJiYgIXRoaXMuX2lzQW5ndWxhckV2ZW50UGVuZGluZzsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3J1bkNhbGxiYWNrc0lmUmVhZHkoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlzU3RhYmxlKCkpIHtcbiAgICAgIHJldHVybjsgIC8vIE5vdCByZWFkeVxuICAgIH1cblxuICAgIC8vIFNjaGVkdWxlcyB0aGUgY2FsbCBiYWNrcyBpbiBhIG5ldyBmcmFtZSBzbyB0aGF0IGl0IGlzIGFsd2F5cyBhc3luYy5cbiAgICBQcm9taXNlV3JhcHBlci5yZXNvbHZlKG51bGwpLnRoZW4oKF8pID0+IHtcbiAgICAgIHdoaWxlICh0aGlzLl9jYWxsYmFja3MubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICh0aGlzLl9jYWxsYmFja3MucG9wKCkpKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB3aGVuU3RhYmxlKGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIHRoaXMuX2NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB0aGlzLl9ydW5DYWxsYmFja3NJZlJlYWR5KCk7XG4gIH1cblxuICBnZXRQZW5kaW5nUmVxdWVzdENvdW50KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9wZW5kaW5nQ291bnQ7IH1cblxuICAvLyBUaGlzIG9ubHkgYWNjb3VudHMgZm9yIG5nWm9uZSwgYW5kIG5vdCBwZW5kaW5nIGNvdW50cy4gVXNlIGB3aGVuU3RhYmxlYCB0b1xuICAvLyBjaGVjayBmb3Igc3RhYmlsaXR5LlxuICBpc0FuZ3VsYXJFdmVudFBlbmRpbmcoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9pc0FuZ3VsYXJFdmVudFBlbmRpbmc7IH1cblxuICBmaW5kQmluZGluZ3ModXNpbmc6IGFueSwgcHJvdmlkZXI6IHN0cmluZywgZXhhY3RNYXRjaDogYm9vbGVhbik6IGFueVtdIHtcbiAgICAvLyBUT0RPKGp1bGllbXIpOiBpbXBsZW1lbnQuXG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgZmluZFByb3ZpZGVycyh1c2luZzogYW55LCBwcm92aWRlcjogc3RyaW5nLCBleGFjdE1hdGNoOiBib29sZWFuKTogYW55W10ge1xuICAgIC8vIFRPRE8oanVsaWVtcik6IGltcGxlbWVudC5cbiAgICByZXR1cm4gW107XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlc3RhYmlsaXR5UmVnaXN0cnkge1xuICAvKiogQGludGVybmFsICovXG4gIF9hcHBsaWNhdGlvbnMgPSBuZXcgTWFwPGFueSwgVGVzdGFiaWxpdHk+KCk7XG5cbiAgY29uc3RydWN0b3IoKSB7IF90ZXN0YWJpbGl0eUdldHRlci5hZGRUb1dpbmRvdyh0aGlzKTsgfVxuXG4gIHJlZ2lzdGVyQXBwbGljYXRpb24odG9rZW46IGFueSwgdGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5KSB7XG4gICAgdGhpcy5fYXBwbGljYXRpb25zLnNldCh0b2tlbiwgdGVzdGFiaWxpdHkpO1xuICB9XG5cbiAgZ2V0VGVzdGFiaWxpdHkoZWxlbTogYW55KTogVGVzdGFiaWxpdHkgeyByZXR1cm4gdGhpcy5fYXBwbGljYXRpb25zLmdldChlbGVtKTsgfVxuXG4gIGdldEFsbFRlc3RhYmlsaXRpZXMoKTogVGVzdGFiaWxpdHlbXSB7IHJldHVybiBNYXBXcmFwcGVyLnZhbHVlcyh0aGlzLl9hcHBsaWNhdGlvbnMpOyB9XG5cbiAgZmluZFRlc3RhYmlsaXR5SW5UcmVlKGVsZW06IE5vZGUsIGZpbmRJbkFuY2VzdG9yczogYm9vbGVhbiA9IHRydWUpOiBUZXN0YWJpbGl0eSB7XG4gICAgcmV0dXJuIF90ZXN0YWJpbGl0eUdldHRlci5maW5kVGVzdGFiaWxpdHlJblRyZWUodGhpcywgZWxlbSwgZmluZEluQW5jZXN0b3JzKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEdldFRlc3RhYmlsaXR5IHtcbiAgYWRkVG9XaW5kb3cocmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnkpOiB2b2lkO1xuICBmaW5kVGVzdGFiaWxpdHlJblRyZWUocmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnksIGVsZW06IGFueSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmRJbkFuY2VzdG9yczogYm9vbGVhbik6IFRlc3RhYmlsaXR5O1xufVxuXG5AQ09OU1QoKVxuY2xhc3MgX05vb3BHZXRUZXN0YWJpbGl0eSBpbXBsZW1lbnRzIEdldFRlc3RhYmlsaXR5IHtcbiAgYWRkVG9XaW5kb3cocmVnaXN0cnk6IFRlc3RhYmlsaXR5UmVnaXN0cnkpOiB2b2lkIHt9XG4gIGZpbmRUZXN0YWJpbGl0eUluVHJlZShyZWdpc3RyeTogVGVzdGFiaWxpdHlSZWdpc3RyeSwgZWxlbTogYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgZmluZEluQW5jZXN0b3JzOiBib29sZWFuKTogVGVzdGFiaWxpdHkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRUZXN0YWJpbGl0eUdldHRlcihnZXR0ZXI6IEdldFRlc3RhYmlsaXR5KTogdm9pZCB7XG4gIF90ZXN0YWJpbGl0eUdldHRlciA9IGdldHRlcjtcbn1cblxudmFyIF90ZXN0YWJpbGl0eUdldHRlcjogR2V0VGVzdGFiaWxpdHkgPSBDT05TVF9FWFBSKG5ldyBfTm9vcEdldFRlc3RhYmlsaXR5KCkpO1xuIl19