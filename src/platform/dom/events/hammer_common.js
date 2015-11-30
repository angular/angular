'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_manager_1 = require('./event_manager');
var collection_1 = require('angular2/src/facade/collection');
var _eventNames = {
    // pan
    'pan': true,
    'panstart': true,
    'panmove': true,
    'panend': true,
    'pancancel': true,
    'panleft': true,
    'panright': true,
    'panup': true,
    'pandown': true,
    // pinch
    'pinch': true,
    'pinchstart': true,
    'pinchmove': true,
    'pinchend': true,
    'pinchcancel': true,
    'pinchin': true,
    'pinchout': true,
    // press
    'press': true,
    'pressup': true,
    // rotate
    'rotate': true,
    'rotatestart': true,
    'rotatemove': true,
    'rotateend': true,
    'rotatecancel': true,
    // swipe
    'swipe': true,
    'swipeleft': true,
    'swiperight': true,
    'swipeup': true,
    'swipedown': true,
    // tap
    'tap': true,
};
var HammerGesturesPluginCommon = (function (_super) {
    __extends(HammerGesturesPluginCommon, _super);
    function HammerGesturesPluginCommon() {
        _super.call(this);
    }
    HammerGesturesPluginCommon.prototype.supports = function (eventName) {
        eventName = eventName.toLowerCase();
        return collection_1.StringMapWrapper.contains(_eventNames, eventName);
    };
    return HammerGesturesPluginCommon;
})(event_manager_1.EventManagerPlugin);
exports.HammerGesturesPluginCommon = HammerGesturesPluginCommon;
//# sourceMappingURL=hammer_common.js.map