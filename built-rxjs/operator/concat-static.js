var queue_1 = require('../scheduler/queue');
var mergeAll_support_1 = require('./mergeAll-support');
var fromArray_1 = require('../observable/fromArray');
var isScheduler_1 = require('../util/isScheduler');
/**
 * Joins multiple observables together by subscribing to them one at a time and merging their results
 * into the returned observable. Will wait for each observable to complete before moving on to the next.
 * @params {...Observable} the observables to concatenate
 * @params {Scheduler} [scheduler] an optional scheduler to schedule each observable subscription on.
 * @returns {Observable} All values of each passed observable merged into a single observable, in order, in serial fashion.
 */
function concat() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i - 0] = arguments[_i];
    }
    var scheduler = queue_1.queue;
    var args = observables;
    if (isScheduler_1.isScheduler(args[observables.length - 1])) {
        scheduler = args.pop();
    }
    return new fromArray_1.ArrayObservable(observables, scheduler).lift(new mergeAll_support_1.MergeAllOperator(1));
}
exports.concat = concat;
//# sourceMappingURL=concat-static.js.map