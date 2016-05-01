import { global } from 'angular2/src/facade/lang';
var trace;
var events;
export function detectWTF() {
    var wtf = global['wtf'];
    if (wtf) {
        trace = wtf['trace'];
        if (trace) {
            events = trace['events'];
            return true;
        }
    }
    return false;
}
export function createScope(signature, flags = null) {
    return events.createScope(signature, flags);
}
export function leave(scope, returnValue) {
    trace.leaveScope(scope, returnValue);
    return returnValue;
}
export function startTimeRange(rangeType, action) {
    return trace.beginTimeRange(rangeType, action);
}
export function endTimeRange(range) {
    trace.endTimeRange(range);
}
