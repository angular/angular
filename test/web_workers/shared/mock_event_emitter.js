var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var async_1 = require('angular2/src/facade/async');
var MockEventEmitter = (function (_super) {
    __extends(MockEventEmitter, _super);
    function MockEventEmitter() {
        _super.call(this);
        this._nextFns = [];
    }
    MockEventEmitter.prototype.subscribe = function (generator) {
        this._nextFns.push(generator.next);
        return new MockDisposable();
    };
    MockEventEmitter.prototype.next = function (value) { this._nextFns.forEach(function (fn) { return fn(value); }); };
    return MockEventEmitter;
})(async_1.EventEmitter);
exports.MockEventEmitter = MockEventEmitter;
var MockDisposable = (function () {
    function MockDisposable() {
        this.isUnsubscribed = false;
    }
    MockDisposable.prototype.unsubscribe = function () { };
    return MockDisposable;
})();
//# sourceMappingURL=mock_event_emitter.js.map