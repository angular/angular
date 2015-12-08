var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var OuterSubscriber_1 = require('../OuterSubscriber');
var subscribeToResult_1 = require('../util/subscribeToResult');
var CombineLatestOperator = (function () {
    function CombineLatestOperator(project) {
        this.project = project;
    }
    CombineLatestOperator.prototype.call = function (subscriber) {
        return new CombineLatestSubscriber(subscriber, this.project);
    };
    return CombineLatestOperator;
})();
exports.CombineLatestOperator = CombineLatestOperator;
var CombineLatestSubscriber = (function (_super) {
    __extends(CombineLatestSubscriber, _super);
    function CombineLatestSubscriber(destination, project) {
        _super.call(this, destination);
        this.project = project;
        this.active = 0;
        this.values = [];
        this.observables = [];
        this.toRespond = [];
    }
    CombineLatestSubscriber.prototype._next = function (observable) {
        var toRespond = this.toRespond;
        toRespond.push(toRespond.length);
        this.observables.push(observable);
    };
    CombineLatestSubscriber.prototype._complete = function () {
        var observables = this.observables;
        var len = observables.length;
        if (len === 0) {
            this.destination.complete();
        }
        else {
            this.active = len;
            for (var i = 0; i < len; i++) {
                var observable = observables[i];
                this.add(subscribeToResult_1.subscribeToResult(this, observable, observable, i));
            }
        }
    };
    CombineLatestSubscriber.prototype.notifyComplete = function (unused) {
        if ((this.active -= 1) === 0) {
            this.destination.complete();
        }
    };
    CombineLatestSubscriber.prototype.notifyNext = function (observable, value, outerIndex, innerIndex) {
        var values = this.values;
        values[outerIndex] = value;
        var toRespond = this.toRespond;
        if (toRespond.length > 0) {
            var found = toRespond.indexOf(outerIndex);
            if (found !== -1) {
                toRespond.splice(found, 1);
            }
        }
        if (toRespond.length === 0) {
            var project = this.project;
            var destination = this.destination;
            if (project) {
                var result = tryCatch_1.tryCatch(project).apply(this, values);
                if (result === errorObject_1.errorObject) {
                    destination.error(errorObject_1.errorObject.e);
                }
                else {
                    destination.next(result);
                }
            }
            else {
                destination.next(values);
            }
        }
    };
    return CombineLatestSubscriber;
})(OuterSubscriber_1.OuterSubscriber);
exports.CombineLatestSubscriber = CombineLatestSubscriber;
//# sourceMappingURL=combineLatest-support.js.map