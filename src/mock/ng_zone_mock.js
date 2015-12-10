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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZV9tb2NrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL21vY2svbmdfem9uZV9tb2NrLnRzIl0sIm5hbWVzIjpbIk1vY2tOZ1pvbmUiLCJNb2NrTmdab25lLmNvbnN0cnVjdG9yIiwiTW9ja05nWm9uZS5vbkV2ZW50RG9uZSIsIk1vY2tOZ1pvbmUucnVuIiwiTW9ja05nWm9uZS5ydW5PdXRzaWRlQW5ndWxhciIsIk1vY2tOZ1pvbmUuc2ltdWxhdGVab25lRXhpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCx3QkFBcUIsZ0NBQWdDLENBQUMsQ0FBQTtBQUN0RCxzQkFBOEMsMkJBQTJCLENBQUMsQ0FBQTtBQUUxRTtJQUNnQ0EsOEJBQU1BO0lBSXBDQTtRQUNFQyxrQkFBTUEsRUFBQ0Esb0JBQW9CQSxFQUFFQSxLQUFLQSxFQUFDQSxDQUFDQSxDQUFDQTtRQUNyQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxJQUFJQSxvQkFBWUEsQ0FBTUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDdkRBLENBQUNBO0lBRURELHNCQUFJQSxtQ0FBV0E7YUFBZkEsY0FBb0JFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7OztPQUFBRjtJQUVuREEsd0JBQUdBLEdBQUhBLFVBQUlBLEVBQVlBLElBQVNHLE1BQU1BLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBRXZDSCxzQ0FBaUJBLEdBQWpCQSxVQUFrQkEsRUFBWUEsSUFBU0ksTUFBTUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFckRKLHFDQUFnQkEsR0FBaEJBLGNBQTJCSyx5QkFBaUJBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBaEJsRkw7UUFBQ0EsZUFBVUEsRUFBRUE7O21CQWlCWkE7SUFBREEsaUJBQUNBO0FBQURBLENBQUNBLEFBakJELEVBQ2dDLGdCQUFNLEVBZ0JyQztBQWhCWSxrQkFBVSxhQWdCdEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja05nWm9uZSBleHRlbmRzIE5nWm9uZSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX21vY2tPbkV2ZW50RG9uZTogRXZlbnRFbWl0dGVyPGFueT47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoe2VuYWJsZUxvbmdTdGFja1RyYWNlOiBmYWxzZX0pO1xuICAgIHRoaXMuX21vY2tPbkV2ZW50RG9uZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PihmYWxzZSk7XG4gIH1cblxuICBnZXQgb25FdmVudERvbmUoKSB7IHJldHVybiB0aGlzLl9tb2NrT25FdmVudERvbmU7IH1cblxuICBydW4oZm46IEZ1bmN0aW9uKTogYW55IHsgcmV0dXJuIGZuKCk7IH1cblxuICBydW5PdXRzaWRlQW5ndWxhcihmbjogRnVuY3Rpb24pOiBhbnkgeyByZXR1cm4gZm4oKTsgfVxuXG4gIHNpbXVsYXRlWm9uZUV4aXQoKTogdm9pZCB7IE9ic2VydmFibGVXcmFwcGVyLmNhbGxOZXh0KHRoaXMub25FdmVudERvbmUsIG51bGwpOyB9XG59XG4iXX0=