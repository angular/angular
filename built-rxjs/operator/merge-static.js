var fromArray_1 = require('../observable/fromArray');
var mergeAll_support_1 = require('./mergeAll-support');
var queue_1 = require('../scheduler/queue');
var isScheduler_1 = require('../util/isScheduler');
function merge() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i - 0] = arguments[_i];
    }
    var concurrent = Number.POSITIVE_INFINITY;
    var scheduler = queue_1.queue;
    var last = observables[observables.length - 1];
    if (isScheduler_1.isScheduler(last)) {
        scheduler = observables.pop();
        if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
            concurrent = observables.pop();
        }
    }
    else if (typeof last === 'number') {
        concurrent = observables.pop();
    }
    if (observables.length === 1) {
        return observables[0];
    }
    return new fromArray_1.ArrayObservable(observables, scheduler).lift(new mergeAll_support_1.MergeAllOperator(concurrent));
}
exports.merge = merge;
//# sourceMappingURL=merge-static.js.map