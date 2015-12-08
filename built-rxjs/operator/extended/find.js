var find_support_1 = require('./find-support');
function find(predicate, thisArg) {
    return this.lift(new find_support_1.FindValueOperator(predicate, this, false, thisArg));
}
exports.find = find;
//# sourceMappingURL=find.js.map