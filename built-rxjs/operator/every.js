var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ScalarObservable_1 = require('../observable/ScalarObservable');
var fromArray_1 = require('../observable/fromArray');
var throw_1 = require('../observable/throw');
var Subscriber_1 = require('../Subscriber');
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var bindCallback_1 = require('../util/bindCallback');
function every(predicate, thisArg) {
    var source = this;
    var result;
    if (source._isScalar) {
        result = tryCatch_1.tryCatch(predicate)(source.value, 0, source);
        if (result === errorObject_1.errorObject) {
            return new throw_1.ErrorObservable(errorObject_1.errorObject.e, source.scheduler);
        }
        else {
            return new ScalarObservable_1.ScalarObservable(result, source.scheduler);
        }
    }
    if (source instanceof fromArray_1.ArrayObservable) {
        var array = source.array;
        var result_1 = tryCatch_1.tryCatch(function (array, predicate) { return array.every(predicate); })(array, predicate);
        if (result_1 === errorObject_1.errorObject) {
            return new throw_1.ErrorObservable(errorObject_1.errorObject.e, source.scheduler);
        }
        else {
            return new ScalarObservable_1.ScalarObservable(result_1, source.scheduler);
        }
    }
    return source.lift(new EveryOperator(predicate, thisArg, source));
}
exports.every = every;
var EveryOperator = (function () {
    function EveryOperator(predicate, thisArg, source) {
        this.predicate = predicate;
        this.thisArg = thisArg;
        this.source = source;
    }
    EveryOperator.prototype.call = function (observer) {
        return new EverySubscriber(observer, this.predicate, this.thisArg, this.source);
    };
    return EveryOperator;
})();
var EverySubscriber = (function (_super) {
    __extends(EverySubscriber, _super);
    function EverySubscriber(destination, predicate, thisArg, source) {
        _super.call(this, destination);
        this.thisArg = thisArg;
        this.source = source;
        this.predicate = undefined;
        this.index = 0;
        if (typeof predicate === 'function') {
            this.predicate = bindCallback_1.bindCallback(predicate, thisArg, 3);
        }
    }
    EverySubscriber.prototype.notifyComplete = function (everyValueMatch) {
        this.destination.next(everyValueMatch);
        this.destination.complete();
    };
    EverySubscriber.prototype._next = function (value) {
        var predicate = this.predicate;
        if (predicate === undefined) {
            this.destination.error(new TypeError('predicate must be a function'));
        }
        var result = tryCatch_1.tryCatch(predicate)(value, this.index++, this.source);
        if (result === errorObject_1.errorObject) {
            this.destination.error(result.e);
        }
        else if (!result) {
            this.notifyComplete(false);
        }
    };
    EverySubscriber.prototype._complete = function () {
        this.notifyComplete(true);
    };
    return EverySubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=every.js.map