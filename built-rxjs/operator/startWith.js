var fromArray_1 = require('../observable/fromArray');
var ScalarObservable_1 = require('../observable/ScalarObservable');
var empty_1 = require('../observable/empty');
var concat_static_1 = require('./concat-static');
var isScheduler_1 = require('../util/isScheduler');
function startWith() {
    var array = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        array[_i - 0] = arguments[_i];
    }
    var scheduler = array[array.length - 1];
    if (isScheduler_1.isScheduler(scheduler)) {
        array.pop();
    }
    else {
        scheduler = void 0;
    }
    var len = array.length;
    if (len === 1) {
        return concat_static_1.concat(new ScalarObservable_1.ScalarObservable(array[0], scheduler), this);
    }
    else if (len > 1) {
        return concat_static_1.concat(new fromArray_1.ArrayObservable(array, scheduler), this);
    }
    else {
        return concat_static_1.concat(new empty_1.EmptyObservable(scheduler), this);
    }
}
exports.startWith = startWith;
//# sourceMappingURL=startWith.js.map