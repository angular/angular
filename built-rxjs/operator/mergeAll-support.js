var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OuterSubscriber_1 = require('../OuterSubscriber');
var subscribeToResult_1 = require('../util/subscribeToResult');
var MergeAllOperator = (function () {
    function MergeAllOperator(concurrent) {
        this.concurrent = concurrent;
    }
    MergeAllOperator.prototype.call = function (observer) {
        return new MergeAllSubscriber(observer, this.concurrent);
    };
    return MergeAllOperator;
})();
exports.MergeAllOperator = MergeAllOperator;
var MergeAllSubscriber = (function (_super) {
    __extends(MergeAllSubscriber, _super);
    function MergeAllSubscriber(destination, concurrent) {
        _super.call(this, destination);
        this.concurrent = concurrent;
        this.hasCompleted = false;
        this.buffer = [];
        this.active = 0;
    }
    MergeAllSubscriber.prototype._next = function (observable) {
        if (this.active < this.concurrent) {
            if (observable._isScalar) {
                this.destination.next(observable.value);
            }
            else {
                this.active++;
                this.add(subscribeToResult_1.subscribeToResult(this, observable));
            }
        }
        else {
            this.buffer.push(observable);
        }
    };
    MergeAllSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.active === 0 && this.buffer.length === 0) {
            this.destination.complete();
        }
    };
    MergeAllSubscriber.prototype.notifyComplete = function (innerSub) {
        var buffer = this.buffer;
        this.remove(innerSub);
        this.active--;
        if (buffer.length > 0) {
            this._next(buffer.shift());
        }
        else if (this.active === 0 && this.hasCompleted) {
            this.destination.complete();
        }
    };
    return MergeAllSubscriber;
})(OuterSubscriber_1.OuterSubscriber);
exports.MergeAllSubscriber = MergeAllSubscriber;
//# sourceMappingURL=mergeAll-support.js.map