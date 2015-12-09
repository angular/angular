var AsyncSubject_1 = require('../subject/AsyncSubject');
var multicast_1 = require('./multicast');
function publishLast() {
    return multicast_1.multicast.call(this, new AsyncSubject_1.AsyncSubject());
}
exports.publishLast = publishLast;
//# sourceMappingURL=publishLast.js.map