import { HammerGesturesPluginCommon } from './hammer_common';
export declare class HammerGesturesPlugin extends HammerGesturesPluginCommon {
    supports(eventName: string): boolean;
    addEventListener(element: HTMLElement, eventName: string, handler: Function): void;
}
