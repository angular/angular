'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    return MockNgZone;
})(ng_zone_1.NgZone);
exports.MockNgZone = MockNgZone;
//# sourceMappingURL=ng_zone_mock.js.map