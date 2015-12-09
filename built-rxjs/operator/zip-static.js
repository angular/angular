var fromArray_1 = require('../observable/fromArray');
var zip_support_1 = require('./zip-support');
function zip() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i - 0] = arguments[_i];
    }
    var project = observables[observables.length - 1];
    if (typeof project === 'function') {
        observables.pop();
    }
    return new fromArray_1.ArrayObservable(observables).lift(new zip_support_1.ZipOperator(project));
}
exports.zip = zip;
//# sourceMappingURL=zip-static.js.map