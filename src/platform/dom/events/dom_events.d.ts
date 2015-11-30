import { EventManagerPlugin, EventManager } from './event_manager';
export declare class DomEventsPlugin extends EventManagerPlugin {
    manager: EventManager;
    supports(eventName: string): boolean;
    addEventListener(element: HTMLElement, eventName: string, handler: Function): void;
    addGlobalEventListener(target: string, eventName: string, handler: Function): Function;
}
