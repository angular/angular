var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fromPromise_1 = require('./fromPromise');
var IteratorObservable_1 = require('./IteratorObservable');
var fromArray_1 = require('./fromArray');
var SymbolShim_1 = require('../util/SymbolShim');
var Observable_1 = require('../Observable');
var observeOn_support_1 = require('../operator/observeOn-support');
var queue_1 = require('../scheduler/queue');
var isArray = Array.isArray;
var FromObservable = (function (_super) {
    __extends(FromObservable, _super);
    function FromObservable(ish, scheduler) {
        _super.call(this, null);
        this.ish = ish;
        this.scheduler = scheduler;
    }
    FromObservable.create = function (ish, scheduler) {
        if (scheduler === void 0) { scheduler = queue_1.queue; }
        if (ish) {
            if (isArray(ish)) {
                return new fromArray_1.ArrayObservable(ish, scheduler);
            }
            else if (typeof ish.then === 'function') {
                return new fromPromise_1.PromiseObservable(ish, scheduler);
            }
            else if (typeof ish[SymbolShim_1.SymbolShim.observable] === 'function') {
                if (ish instanceof Observable_1.Observable) {
                    return ish;
                }
                return new FromObservable(ish, scheduler);
            }
            else if (typeof ish[SymbolShim_1.SymbolShim.iterator] === 'function') {
                return new IteratorObservable_1.IteratorObservable(ish, null, null, scheduler);
            }
        }
        throw new TypeError((typeof ish) + ' is not observable');
    };
    FromObservable.prototype._subscribe = function (subscriber) {
        var ish = this.ish;
        var scheduler = this.scheduler;
        if (scheduler === queue_1.queue) {
            return ish[SymbolShim_1.SymbolShim.observable]().subscribe(subscriber);
        }
        else {
            return ish[SymbolShim_1.SymbolShim.observable]().subscribe(new observeOn_support_1.ObserveOnSubscriber(subscriber, scheduler, 0));
        }
    };
    return FromObservable;
})(Observable_1.Observable);
exports.FromObservable = FromObservable;
//# sourceMappingURL=from.js.map