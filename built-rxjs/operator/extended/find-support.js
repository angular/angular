var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../../Subscriber');
var tryCatch_1 = require('../../util/tryCatch');
var errorObject_1 = require('../../util/errorObject');
var bindCallback_1 = require('../../util/bindCallback');
var FindValueOperator = (function () {
    function FindValueOperator(predicate, source, yieldIndex, thisArg) {
        this.predicate = predicate;
        this.source = source;
        this.yieldIndex = yieldIndex;
        this.thisArg = thisArg;
    }
    FindValueOperator.prototype.call = function (observer) {
        return new FindValueSubscriber(observer, this.predicate, this.source, this.yieldIndex, this.thisArg);
    };
    return FindValueOperator;
})();
exports.FindValueOperator = FindValueOperator;
var FindValueSubscriber = (function (_super) {
    __extends(FindValueSubscriber, _super);
    function FindValueSubscriber(destination, predicate, source, yieldIndex, thisArg) {
        _super.call(this, destination);
        this.source = source;
        this.yieldIndex = yieldIndex;
        this.thisArg = thisArg;
        this.index = 0;
        if (typeof predicate === 'function') {
            this.predicate = bindCallback_1.bindCallback(predicate, thisArg, 3);
        }
    }
    FindValueSubscriber.prototype.notifyComplete = function (value) {
        var destination = this.destination;
        destination.next(value);
        destination.complete();
    };
    FindValueSubscriber.prototype._next = function (value) {
        var predicate = this.predicate;
        var index = this.index++;
        var result = tryCatch_1.tryCatch(predicate)(value, index, this.source);
        if (result === errorObject_1.errorObject) {
            this.destination.error(result.e);
        }
        else if (result) {
            this.notifyComplete(this.yieldIndex ? index : value);
        }
    };
    FindValueSubscriber.prototype._complete = function () {
        this.notifyComplete(this.yieldIndex ? -1 : undefined);
    };
    return FindValueSubscriber;
})(Subscriber_1.Subscriber);
exports.FindValueSubscriber = FindValueSubscriber;
//# sourceMappingURL=find-support.js.map