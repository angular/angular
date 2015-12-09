var BehaviorSubject_1 = require('../subject/BehaviorSubject');
var multicast_1 = require('./multicast');
function publishBehavior(value) {
    return multicast_1.multicast.call(this, new BehaviorSubject_1.BehaviorSubject(value));
}
exports.publishBehavior = publishBehavior;
//# sourceMappingURL=publishBehavior.js.map