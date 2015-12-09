var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('../Observable');
var ErrorObservable = (function (_super) {
    __extends(ErrorObservable, _super);
    function ErrorObservable(error, scheduler) {
        _super.call(this);
        this.error = error;
        this.scheduler = scheduler;
    }
    ErrorObservable.create = function (error, scheduler) {
        return new ErrorObservable(error, scheduler);
    };
    ErrorObservable.dispatch = function (_a) {
        var error = _a.error, subscriber = _a.subscriber;
        subscriber.error(error);
    };
    ErrorObservable.prototype._subscribe = function (subscriber) {
        var error = this.error;
        var scheduler = this.scheduler;
        if (scheduler) {
            subscriber.add(scheduler.schedule(ErrorObservable.dispatch, 0, {
                error: error, subscriber: subscriber
            }));
        }
        else {
            subscriber.error(error);
        }
    };
    return ErrorObservable;
})(Observable_1.Observable);
exports.ErrorObservable = ErrorObservable;
//# sourceMappingURL=throw.js.map