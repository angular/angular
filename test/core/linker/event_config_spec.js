var event_config_1 = require('angular2/src/core/linker/event_config');
var testing_internal_1 = require('angular2/testing_internal');
function main() {
    testing_internal_1.describe('EventConfig', function () {
        testing_internal_1.describe('parse', function () {
            testing_internal_1.it('should handle short form events', function () {
                var eventConfig = event_config_1.EventConfig.parse('shortForm');
                testing_internal_1.expect(eventConfig.fieldName).toEqual('shortForm');
                testing_internal_1.expect(eventConfig.eventName).toEqual('shortForm');
                testing_internal_1.expect(eventConfig.isLongForm).toEqual(false);
            });
            testing_internal_1.it('should handle long form events', function () {
                var eventConfig = event_config_1.EventConfig.parse('fieldName: eventName');
                testing_internal_1.expect(eventConfig.fieldName).toEqual('fieldName');
                testing_internal_1.expect(eventConfig.eventName).toEqual('eventName');
                testing_internal_1.expect(eventConfig.isLongForm).toEqual(true);
            });
        });
        testing_internal_1.describe('getFullName', function () {
            testing_internal_1.it('should handle short form events', function () {
                var eventConfig = new event_config_1.EventConfig('shortForm', 'shortForm', false);
                testing_internal_1.expect(eventConfig.getFullName()).toEqual('shortForm');
            });
            testing_internal_1.it('should handle long form events', function () {
                var eventConfig = new event_config_1.EventConfig('fieldName', 'eventName', true);
                testing_internal_1.expect(eventConfig.getFullName()).toEqual('fieldName:eventName');
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=event_config_spec.js.map