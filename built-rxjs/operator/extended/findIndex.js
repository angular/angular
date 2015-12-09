var find_support_1 = require('./find-support');
function findIndex(predicate, thisArg) {
    return this.lift(new find_support_1.FindValueOperator(predicate, this, true, thisArg));
}
exports.findIndex = findIndex;
//# sourceMappingURL=findIndex.js.map