var multicast_1 = require('./multicast');
var Subject_1 = require('../Subject');
function shareSubjectFactory() {
    return new Subject_1.Subject();
}
function share() {
    return multicast_1.multicast.call(this, shareSubjectFactory).refCount();
}
exports.share = share;
;
//# sourceMappingURL=share.js.map