export const EVENT_TARGET_SEPARATOR = ':';
export class EventConfig {
    constructor(fieldName, eventName, isLongForm) {
        this.fieldName = fieldName;
        this.eventName = eventName;
        this.isLongForm = isLongForm;
    }
    static parse(eventConfig) {
        var fieldName = eventConfig, eventName = eventConfig, isLongForm = false;
        var separatorIdx = eventConfig.indexOf(EVENT_TARGET_SEPARATOR);
        if (separatorIdx > -1) {
            // long format: 'fieldName: eventName'
            fieldName = eventConfig.substring(0, separatorIdx).trim();
            eventName = eventConfig.substring(separatorIdx + 1).trim();
            isLongForm = true;
        }
        return new EventConfig(fieldName, eventName, isLongForm);
    }
    getFullName() {
        return this.isLongForm ? `${this.fieldName}${EVENT_TARGET_SEPARATOR}${this.eventName}` :
            this.eventName;
    }
}
