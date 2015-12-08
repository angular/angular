var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var ReduceOperator = (function () {
    function ReduceOperator(project, seed) {
        this.project = project;
        this.seed = seed;
    }
    ReduceOperator.prototype.call = function (subscriber) {
        return new ReduceSubscriber(subscriber, this.project, this.seed);
    };
    return ReduceOperator;
})();
exports.ReduceOperator = ReduceOperator;
var ReduceSubscriber = (function (_super) {
    __extends(ReduceSubscriber, _super);
    function ReduceSubscriber(destination, project, seed) {
        _super.call(this, destination);
        this.hasValue = false;
        this.acc = seed;
        this.project = project;
        this.hasSeed = typeof seed !== 'undefined';
    }
    ReduceSubscriber.prototype._next = function (x) {
        if (this.hasValue || (this.hasValue = this.hasSeed)) {
            var result = tryCatch_1.tryCatch(this.project).call(this, this.acc, x);
            if (result === errorObject_1.errorObject) {
                this.destination.error(errorObject_1.errorObject.e);
            }
            else {
                this.acc = result;
            }
        }
        else {
            this.acc = x;
            this.hasValue = true;
        }
    };
    ReduceSubscriber.prototype._complete = function () {
        if (this.hasValue || this.hasSeed) {
            this.destination.next(this.acc);
        }
        this.destination.complete();
    };
    return ReduceSubscriber;
})(Subscriber_1.Subscriber);
exports.ReduceSubscriber = ReduceSubscriber;
//# sourceMappingURL=reduce-support.js.map