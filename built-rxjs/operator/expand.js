var expand_support_1 = require('./expand-support');
function expand(project, concurrent, scheduler) {
    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
    if (scheduler === void 0) { scheduler = undefined; }
    concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;
    return this.lift(new expand_support_1.ExpandOperator(project, concurrent, scheduler));
}
exports.expand = expand;
//# sourceMappingURL=expand.js.map