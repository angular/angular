'use strict';var lang_1 = require('angular2/src/facade/lang');
var trace;
var events;
function detectWTF() {
    var wtf = lang_1.global['wtf'];
    if (wtf) {
        trace = wtf['trace'];
        if (trace) {
            events = trace['events'];
            return true;
        }
    }
    return false;
}
exports.detectWTF = detectWTF;
function createScope(signature, flags) {
    if (flags === void 0) { flags = null; }
    return events.createScope(signature, flags);
}
exports.createScope = createScope;
function leave(scope, returnValue) {
    trace.leaveScope(scope, returnValue);
    return returnValue;
}
exports.leave = leave;
function startTimeRange(rangeType, action) {
    return trace.beginTimeRange(rangeType, action);
}
exports.startTimeRange = startTimeRange;
function endTimeRange(range) {
    trace.endTimeRange(range);
}
exports.endTimeRange = endTimeRange;
//# sourceMappingURL=wtf_impl.js.map