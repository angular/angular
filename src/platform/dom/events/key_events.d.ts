import { EventManagerPlugin } from './event_manager';
import { NgZone } from 'angular2/src/core/zone/ng_zone';
export declare class KeyEventsPlugin extends EventManagerPlugin {
    constructor();
    supports(eventName: string): boolean;
    addEventListener(element: HTMLElement, eventName: string, handler: (Event: any) => any): void;
    static parseEventName(eventName: string): {
        [key: string]: string;
    };
    static getEventFullKey(event: KeyboardEvent): string;
    static eventCallback(element: HTMLElement, fullKey: any, handler: (e: Event) => any, zone: NgZone): (event: KeyboardEvent) => void;
}
