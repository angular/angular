import { EventManagerPlugin } from './event_manager';
export declare class DomEventsPlugin extends EventManagerPlugin {
    supports(eventName: string): boolean;
    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;
    addGlobalEventListener(target: string, eventName: string, handler: Function): Function;
}
