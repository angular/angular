import {StringWrapper} from 'angular2/src/core/facade/lang';
export const EVENT_TARGET_SEPARATOR = ':';

export class EventConfig {
  constructor(public fieldName: string, public eventName: string, public isLongForm: boolean) {}

  static parse(eventConfig: string): EventConfig {
    var fieldName = eventConfig, eventName = eventConfig, isLongForm = false;
    var separatorIdx = eventConfig.indexOf(EVENT_TARGET_SEPARATOR);
    if (separatorIdx > -1) {
      // long format: 'fieldName: eventName'
      fieldName = StringWrapper.substring(eventConfig, 0, separatorIdx).trim();
      eventName = StringWrapper.substring(eventConfig, separatorIdx + 1).trim();
      isLongForm = true;
    }
    return new EventConfig(fieldName, eventName, isLongForm);
  }

  getFullName(): string {
    return this.isLongForm ? `${this.fieldName}${EVENT_TARGET_SEPARATOR}${this.eventName}` :
                             this.eventName;
  }
}
