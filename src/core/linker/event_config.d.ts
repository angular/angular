export declare const EVENT_TARGET_SEPARATOR: string;
export declare class EventConfig {
    fieldName: string;
    eventName: string;
    isLongForm: boolean;
    constructor(fieldName: string, eventName: string, isLongForm: boolean);
    static parse(eventConfig: string): EventConfig;
    getFullName(): string;
}
