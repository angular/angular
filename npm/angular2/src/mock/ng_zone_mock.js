'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
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
var di_1 = require('angular2/src/core/di');
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var async_1 = require('angular2/src/facade/async');
/**
 * A mock implementation of {@link NgZone}.
 */
var MockNgZone = (function (_super) {
    __extends(MockNgZone, _super);
    function MockNgZone() {
        _super.call(this, { enableLongStackTrace: false });
        /** @internal */
        this._mockOnStable = new async_1.EventEmitter(false);
    }
    Object.defineProperty(MockNgZone.prototype, "onStable", {
        get: function () { return this._mockOnStable; },
        enumerable: true,
        configurable: true
    });
    MockNgZone.prototype.run = function (fn) { return fn(); };
    MockNgZone.prototype.runOutsideAngular = function (fn) { return fn(); };
    MockNgZone.prototype.simulateZoneExit = function () { async_1.ObservableWrapper.callNext(this.onStable, null); };
    MockNgZone = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockNgZone);
    return MockNgZone;
}(ng_zone_1.NgZone));
exports.MockNgZone = MockNgZone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZV9tb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL21vY2svbmdfem9uZV9tb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELHdCQUFxQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ3RELHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBRTFFOztHQUVHO0FBRUg7SUFBZ0MsOEJBQU07SUFJcEM7UUFBZ0Isa0JBQU0sRUFBQyxvQkFBb0IsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBSHJELGdCQUFnQjtRQUNSLGtCQUFhLEdBQXNCLElBQUksb0JBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUViLENBQUM7SUFFdkQsc0JBQUksZ0NBQVE7YUFBWixjQUFpQixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBRTdDLHdCQUFHLEdBQUgsVUFBSSxFQUFZLElBQVMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUV2QyxzQ0FBaUIsR0FBakIsVUFBa0IsRUFBWSxJQUFTLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFckQscUNBQWdCLEdBQWhCLGNBQTJCLHlCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQWIvRTtRQUFDLGVBQVUsRUFBRTs7a0JBQUE7SUFjYixpQkFBQztBQUFELENBQUMsQUFiRCxDQUFnQyxnQkFBTSxHQWFyQztBQWJZLGtCQUFVLGFBYXRCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7Tmdab25lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS96b25lL25nX3pvbmUnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuLyoqXG4gKiBBIG1vY2sgaW1wbGVtZW50YXRpb24gb2Yge0BsaW5rIE5nWm9uZX0uXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrTmdab25lIGV4dGVuZHMgTmdab25lIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9tb2NrT25TdGFibGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcihmYWxzZSk7XG5cbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKHtlbmFibGVMb25nU3RhY2tUcmFjZTogZmFsc2V9KTsgfVxuXG4gIGdldCBvblN0YWJsZSgpIHsgcmV0dXJuIHRoaXMuX21vY2tPblN0YWJsZTsgfVxuXG4gIHJ1bihmbjogRnVuY3Rpb24pOiBhbnkgeyByZXR1cm4gZm4oKTsgfVxuXG4gIHJ1bk91dHNpZGVBbmd1bGFyKGZuOiBGdW5jdGlvbik6IGFueSB7IHJldHVybiBmbigpOyB9XG5cbiAgc2ltdWxhdGVab25lRXhpdCgpOiB2b2lkIHsgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbE5leHQodGhpcy5vblN0YWJsZSwgbnVsbCk7IH1cbn1cbiJdfQ==