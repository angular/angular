var reduce_support_1 = require('./reduce-support');
function reduce(project, seed) {
    return this.lift(new reduce_support_1.ReduceOperator(project, seed));
}
exports.reduce = reduce;
//# sourceMappingURL=reduce.js.map