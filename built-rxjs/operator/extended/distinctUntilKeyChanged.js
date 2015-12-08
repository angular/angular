var distinctUntilChanged_1 = require('../distinctUntilChanged');
function distinctUntilKeyChanged(key, compare, thisArg) {
    return distinctUntilChanged_1.distinctUntilChanged.call(this, function (x, y) {
        if (compare) {
            return compare.call(thisArg, x[key], y[key]);
        }
        return x[key] === y[key];
    });
}
exports.distinctUntilKeyChanged = distinctUntilKeyChanged;
//# sourceMappingURL=distinctUntilKeyChanged.js.map