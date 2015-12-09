var merge_static_1 = require('./merge-static');
function merge() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i - 0] = arguments[_i];
    }
    observables.unshift(this);
    return merge_static_1.merge.apply(this, observables);
}
exports.merge = merge;
//# sourceMappingURL=merge.js.map