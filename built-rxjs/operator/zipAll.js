var zip_support_1 = require('./zip-support');
function zipAll(project) {
    return this.lift(new zip_support_1.ZipOperator(project));
}
exports.zipAll = zipAll;
//# sourceMappingURL=zipAll.js.map