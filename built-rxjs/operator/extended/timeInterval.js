var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../../Subscriber');
var queue_1 = require('../../scheduler/queue');
function timeInterval(scheduler) {
    if (scheduler === void 0) { scheduler = queue_1.queue; }
    return this.lift(new TimeIntervalOperator(scheduler));
}
exports.timeInterval = timeInterval;
var TimeInterval = (function () {
    function TimeInterval(value, interval) {
        this.value = value;
        this.interval = interval;
    }
    return TimeInterval;
})();
exports.TimeInterval = TimeInterval;
;
var TimeIntervalOperator = (function () {
    function TimeIntervalOperator(scheduler) {
        this.scheduler = scheduler;
    }
    TimeIntervalOperator.prototype.call = function (observer) {
        return new TimeIntervalSubscriber(observer, this.scheduler);
    };
    return TimeIntervalOperator;
})();
var TimeIntervalSubscriber = (function (_super) {
    __extends(TimeIntervalSubscriber, _super);
    function TimeIntervalSubscriber(destination, scheduler) {
        _super.call(this, destination);
        this.scheduler = scheduler;
        this.lastTime = 0;
        this.lastTime = scheduler.now();
    }
    TimeIntervalSubscriber.prototype._next = function (value) {
        var now = this.scheduler.now();
        var span = now - this.lastTime;
        this.lastTime = now;
        this.destination.next(new TimeInterval(value, span));
    };
    return TimeIntervalSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=timeInterval.js.map