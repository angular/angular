var testing_internal_1 = require('angular2/testing_internal');
var key_events_1 = require('angular2/src/core/render/dom/events/key_events');
function main() {
    testing_internal_1.describe('KeyEvents', function () {
        testing_internal_1.it('should ignore unrecognized events', function () {
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keydown')).toEqual(null);
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keyup')).toEqual(null);
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keydown.unknownmodifier.enter')).toEqual(null);
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keyup.unknownmodifier.enter')).toEqual(null);
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('unknownevent.control.shift.enter')).toEqual(null);
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('unknownevent.enter')).toEqual(null);
        });
        testing_internal_1.it('should correctly parse event names', function () {
            // key with no modifier
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keydown.enter'))
                .toEqual({ 'domEventName': 'keydown', 'fullKey': 'enter' });
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keyup.enter'))
                .toEqual({ 'domEventName': 'keyup', 'fullKey': 'enter' });
            // key with modifiers:
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keydown.control.shift.enter'))
                .toEqual({ 'domEventName': 'keydown', 'fullKey': 'control.shift.enter' });
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keyup.control.shift.enter'))
                .toEqual({ 'domEventName': 'keyup', 'fullKey': 'control.shift.enter' });
            // key with modifiers in a different order:
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keydown.shift.control.enter'))
                .toEqual({ 'domEventName': 'keydown', 'fullKey': 'control.shift.enter' });
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keyup.shift.control.enter'))
                .toEqual({ 'domEventName': 'keyup', 'fullKey': 'control.shift.enter' });
            // key that is also a modifier:
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keydown.shift.control'))
                .toEqual({ 'domEventName': 'keydown', 'fullKey': 'shift.control' });
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keyup.shift.control'))
                .toEqual({ 'domEventName': 'keyup', 'fullKey': 'shift.control' });
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keydown.control.shift'))
                .toEqual({ 'domEventName': 'keydown', 'fullKey': 'control.shift' });
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keyup.control.shift'))
                .toEqual({ 'domEventName': 'keyup', 'fullKey': 'control.shift' });
        });
        testing_internal_1.it('should alias esc to escape', function () {
            testing_internal_1.expect(key_events_1.KeyEventsPlugin.parseEventName('keyup.control.esc'))
                .toEqual(key_events_1.KeyEventsPlugin.parseEventName('keyup.control.escape'));
        });
    });
}
exports.main = main;
//# sourceMappingURL=key_events_spec.js.map