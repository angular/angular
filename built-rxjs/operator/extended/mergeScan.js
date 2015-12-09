var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tryCatch_1 = require('../../util/tryCatch');
var errorObject_1 = require('../../util/errorObject');
var subscribeToResult_1 = require('../../util/subscribeToResult');
var OuterSubscriber_1 = require('../../OuterSubscriber');
function mergeScan(project, seed, concurrent) {
    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
    return this.lift(new MergeScanOperator(project, seed, concurrent));
}
exports.mergeScan = mergeScan;
var MergeScanOperator = (function () {
    function MergeScanOperator(project, seed, concurrent) {
        this.project = project;
        this.seed = seed;
        this.concurrent = concurrent;
    }
    MergeScanOperator.prototype.call = function (subscriber) {
        return new MergeScanSubscriber(subscriber, this.project, this.seed, this.concurrent);
    };
    return MergeScanOperator;
})();
exports.MergeScanOperator = MergeScanOperator;
var MergeScanSubscriber = (function (_super) {
    __extends(MergeScanSubscriber, _super);
    function MergeScanSubscriber(destination, project, acc, concurrent) {
        _super.call(this, destination);
        this.project = project;
        this.acc = acc;
        this.concurrent = concurrent;
        this.hasValue = false;
        this.hasCompleted = false;
        this.buffer = [];
        this.active = 0;
        this.index = 0;
    }
    MergeScanSubscriber.prototype._next = function (value) {
        if (this.active < this.concurrent) {
            var index = this.index++;
            var ish = tryCatch_1.tryCatch(this.project)(this.acc, value);
            var destination = this.destination;
            if (ish === errorObject_1.errorObject) {
                destination.error(ish.e);
            }
            else {
                this.active++;
                this._innerSub(ish, value, index);
            }
        }
        else {
            this.buffer.push(value);
        }
    };
    MergeScanSubscriber.prototype._innerSub = function (ish, value, index) {
        this.add(subscribeToResult_1.subscribeToResult(this, ish, value, index));
    };
    MergeScanSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.active === 0 && this.buffer.length === 0) {
            if (this.hasValue === false) {
                this.destination.next(this.acc);
            }
            this.destination.complete();
        }
    };
    MergeScanSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex) {
        var destination = this.destination;
        this.acc = innerValue;
        this.hasValue = true;
        destination.next(innerValue);
    };
    MergeScanSubscriber.prototype.notifyComplete = function (innerSub) {
        var buffer = this.buffer;
        this.remove(innerSub);
        this.active--;
        if (buffer.length > 0) {
            this._next(buffer.shift());
        }
        else if (this.active === 0 && this.hasCompleted) {
            if (this.hasValue === false) {
                this.destination.next(this.acc);
            }
            this.destination.complete();
        }
    };
    return MergeScanSubscriber;
})(OuterSubscriber_1.OuterSubscriber);
exports.MergeScanSubscriber = MergeScanSubscriber;
//# sourceMappingURL=mergeScan.js.map