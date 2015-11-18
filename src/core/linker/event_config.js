'use strict';exports.EVENT_TARGET_SEPARATOR = ':';
var EventConfig = (function () {
    function EventConfig(fieldName, eventName, isLongForm) {
        this.fieldName = fieldName;
        this.eventName = eventName;
        this.isLongForm = isLongForm;
    }
    EventConfig.parse = function (eventConfig) {
        var fieldName = eventConfig, eventName = eventConfig, isLongForm = false;
        var separatorIdx = eventConfig.indexOf(exports.EVENT_TARGET_SEPARATOR);
        if (separatorIdx > -1) {
            // long format: 'fieldName: eventName'
            fieldName = eventConfig.substring(0, separatorIdx).trim();
            eventName = eventConfig.substring(separatorIdx + 1).trim();
            isLongForm = true;
        }
        return new EventConfig(fieldName, eventName, isLongForm);
    };
    EventConfig.prototype.getFullName = function () {
        return this.isLongForm ? "" + this.fieldName + exports.EVENT_TARGET_SEPARATOR + this.eventName :
            this.eventName;
    };
    return EventConfig;
})();
exports.EventConfig = EventConfig;
//# sourceMappingURL=event_config.js.map