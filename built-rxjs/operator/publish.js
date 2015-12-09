var Subject_1 = require('../Subject');
var multicast_1 = require('./multicast');
function publish() {
    return multicast_1.multicast.call(this, new Subject_1.Subject());
}
exports.publish = publish;
//# sourceMappingURL=publish.js.map