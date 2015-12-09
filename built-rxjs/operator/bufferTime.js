var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var asap_1 = require('../scheduler/asap');
/**
 * buffers values from the source for a specific time period. Optionally allows new buffers to be set up at an interval.
 * @param {number} the amount of time to fill each buffer for before emitting them and clearing them.
 * @param {number} [bufferCreationInterval] the interval at which to start new buffers.
 * @param {Scheduler} [scheduler] (optional, defaults to `asap` scheduler) The scheduler on which to schedule the
 *  intervals that determine buffer boundaries.
 * @returns {Observable<T[]>} an observable of arrays of buffered values.
 */
function bufferTime(bufferTimeSpan, bufferCreationInterval, scheduler) {
    if (bufferCreationInterval === void 0) { bufferCreationInterval = null; }
    if (scheduler === void 0) { scheduler = asap_1.asap; }
    return this.lift(new BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, scheduler));
}
exports.bufferTime = bufferTime;
var BufferTimeOperator = (function () {
    function BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, scheduler) {
        this.bufferTimeSpan = bufferTimeSpan;
        this.bufferCreationInterval = bufferCreationInterval;
        this.scheduler = scheduler;
    }
    BufferTimeOperator.prototype.call = function (subscriber) {
        return new BufferTimeSubscriber(subscriber, this.bufferTimeSpan, this.bufferCreationInterval, this.scheduler);
    };
    return BufferTimeOperator;
})();
var BufferTimeSubscriber = (function (_super) {
    __extends(BufferTimeSubscriber, _super);
    function BufferTimeSubscriber(destination, bufferTimeSpan, bufferCreationInterval, scheduler) {
        _super.call(this, destination);
        this.bufferTimeSpan = bufferTimeSpan;
        this.bufferCreationInterval = bufferCreationInterval;
        this.scheduler = scheduler;
        this.buffers = [];
        var buffer = this.openBuffer();
        if (bufferCreationInterval !== null && bufferCreationInterval >= 0) {
            var closeState = { subscriber: this, buffer: buffer };
            var creationState = { bufferTimeSpan: bufferTimeSpan, bufferCreationInterval: bufferCreationInterval, subscriber: this, scheduler: scheduler };
            this.add(scheduler.schedule(dispatchBufferClose, bufferTimeSpan, closeState));
            this.add(scheduler.schedule(dispatchBufferCreation, bufferCreationInterval, creationState));
        }
        else {
            var timeSpanOnlyState = { subscriber: this, buffer: buffer, bufferTimeSpan: bufferTimeSpan };
            this.add(scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
        }
    }
    BufferTimeSubscriber.prototype._next = function (value) {
        var buffers = this.buffers;
        var len = buffers.length;
        for (var i = 0; i < len; i++) {
            buffers[i].push(value);
        }
    };
    BufferTimeSubscriber.prototype._error = function (err) {
        this.buffers.length = 0;
        this.destination.error(err);
    };
    BufferTimeSubscriber.prototype._complete = function () {
        var buffers = this.buffers;
        while (buffers.length > 0) {
            this.destination.next(buffers.shift());
        }
        this.destination.complete();
    };
    BufferTimeSubscriber.prototype.openBuffer = function () {
        var buffer = [];
        this.buffers.push(buffer);
        return buffer;
    };
    BufferTimeSubscriber.prototype.closeBuffer = function (buffer) {
        this.destination.next(buffer);
        var buffers = this.buffers;
        buffers.splice(buffers.indexOf(buffer), 1);
    };
    return BufferTimeSubscriber;
})(Subscriber_1.Subscriber);
function dispatchBufferTimeSpanOnly(state) {
    var subscriber = state.subscriber;
    var prevBuffer = state.buffer;
    if (prevBuffer) {
        subscriber.closeBuffer(prevBuffer);
    }
    state.buffer = subscriber.openBuffer();
    if (!subscriber.isUnsubscribed) {
        this.schedule(state, state.bufferTimeSpan);
    }
}
function dispatchBufferCreation(state) {
    var bufferCreationInterval = state.bufferCreationInterval, bufferTimeSpan = state.bufferTimeSpan, subscriber = state.subscriber, scheduler = state.scheduler;
    var buffer = subscriber.openBuffer();
    var action = this;
    if (!subscriber.isUnsubscribed) {
        action.add(scheduler.schedule(dispatchBufferClose, bufferTimeSpan, { subscriber: subscriber, buffer: buffer }));
        action.schedule(state, bufferCreationInterval);
    }
}
function dispatchBufferClose(_a) {
    var subscriber = _a.subscriber, buffer = _a.buffer;
    subscriber.closeBuffer(buffer);
}
//# sourceMappingURL=bufferTime.js.map