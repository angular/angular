var reduce_support_1 = require('../reduce-support');
function max(comparer) {
    var max = (typeof comparer === 'function')
        ? comparer
        : function (x, y) { return x > y ? x : y; };
    return this.lift(new reduce_support_1.ReduceOperator(max));
}
exports.max = max;
//# sourceMappingURL=max.js.map