var reduce_support_1 = require('../reduce-support');
function min(comparer) {
    var min = (typeof comparer === 'function')
        ? comparer
        : function (x, y) { return x < y ? x : y; };
    return this.lift(new reduce_support_1.ReduceOperator(min));
}
exports.min = min;
//# sourceMappingURL=min.js.map