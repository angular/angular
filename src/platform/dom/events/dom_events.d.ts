import { EventManagerPlugin, EventManager } from 'angular2/core';
export declare class DomEventsPlugin extends EventManagerPlugin {
    manager: EventManager;
    supports(eventName: string): boolean;
    addEventListener(element: HTMLElement, eventName: string, handler: Function): void;
    addGlobalEventListener(target: string, eventName: string, handler: Function): Function;
}
