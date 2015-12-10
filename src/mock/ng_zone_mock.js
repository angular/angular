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
var di_1 = require('angular2/src/core/di');
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var async_1 = require('angular2/src/facade/async');
var MockNgZone = (function (_super) {
    __extends(MockNgZone, _super);
    function MockNgZone() {
        _super.call(this, { enableLongStackTrace: false });
        this._mockOnEventDone = new async_1.EventEmitter(false);
    }
    Object.defineProperty(MockNgZone.prototype, "onEventDone", {
        get: function () { return this._mockOnEventDone; },
        enumerable: true,
        configurable: true
    });
    MockNgZone.prototype.run = function (fn) { return fn(); };
    MockNgZone.prototype.runOutsideAngular = function (fn) { return fn(); };
    MockNgZone.prototype.simulateZoneExit = function () { async_1.ObservableWrapper.callNext(this.onEventDone, null); };
    MockNgZone = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockNgZone);
    return MockNgZone;
})(ng_zone_1.NgZone);
exports.MockNgZone = MockNgZone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZV9tb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL21vY2svbmdfem9uZV9tb2NrLnRzIl0sIm5hbWVzIjpbIk1vY2tOZ1pvbmUiLCJNb2NrTmdab25lLmNvbnN0cnVjdG9yIiwiTW9ja05nWm9uZS5vbkV2ZW50RG9uZSIsIk1vY2tOZ1pvbmUucnVuIiwiTW9ja05nWm9uZS5ydW5PdXRzaWRlQW5ndWxhciIsIk1vY2tOZ1pvbmUuc2ltdWxhdGVab25lRXhpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELHdCQUFxQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ3RELHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBRTFFO0lBQ2dDQSw4QkFBTUE7SUFJcENBO1FBQ0VDLGtCQUFNQSxFQUFDQSxvQkFBb0JBLEVBQUVBLEtBQUtBLEVBQUNBLENBQUNBLENBQUNBO1FBQ3JDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLElBQUlBLG9CQUFZQSxDQUFNQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN2REEsQ0FBQ0E7SUFFREQsc0JBQUlBLG1DQUFXQTthQUFmQSxjQUFvQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQTs7O09BQUFGO0lBRW5EQSx3QkFBR0EsR0FBSEEsVUFBSUEsRUFBWUEsSUFBU0csTUFBTUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFdkNILHNDQUFpQkEsR0FBakJBLFVBQWtCQSxFQUFZQSxJQUFTSSxNQUFNQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVyREoscUNBQWdCQSxHQUFoQkEsY0FBMkJLLHlCQUFpQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFoQmxGTDtRQUFDQSxlQUFVQSxFQUFFQTs7bUJBaUJaQTtJQUFEQSxpQkFBQ0E7QUFBREEsQ0FBQ0EsQUFqQkQsRUFDZ0MsZ0JBQU0sRUFnQnJDO0FBaEJZLGtCQUFVLGFBZ0J0QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge05nWm9uZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrTmdab25lIGV4dGVuZHMgTmdab25lIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbW9ja09uRXZlbnREb25lOiBFdmVudEVtaXR0ZXI8YW55PjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7ZW5hYmxlTG9uZ1N0YWNrVHJhY2U6IGZhbHNlfSk7XG4gICAgdGhpcy5fbW9ja09uRXZlbnREb25lID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KGZhbHNlKTtcbiAgfVxuXG4gIGdldCBvbkV2ZW50RG9uZSgpIHsgcmV0dXJuIHRoaXMuX21vY2tPbkV2ZW50RG9uZTsgfVxuXG4gIHJ1bihmbjogRnVuY3Rpb24pOiBhbnkgeyByZXR1cm4gZm4oKTsgfVxuXG4gIHJ1bk91dHNpZGVBbmd1bGFyKGZuOiBGdW5jdGlvbik6IGFueSB7IHJldHVybiBmbigpOyB9XG5cbiAgc2ltdWxhdGVab25lRXhpdCgpOiB2b2lkIHsgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbE5leHQodGhpcy5vbkV2ZW50RG9uZSwgbnVsbCk7IH1cbn1cbiJdfQ==