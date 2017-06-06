import { HammerGesturesPluginCommon } from './hammer_common';
import { OpaqueToken } from 'angular2/core';
export declare const HAMMER_GESTURE_CONFIG: OpaqueToken;
export interface HammerInstance {
    on(eventName: string, callback: Function): void;
    off(eventName: string, callback: Function): void;
}
export declare class HammerGestureConfig {
    events: string[];
    overrides: {
        [key: string]: Object;
    };
    buildHammer(element: HTMLElement): HammerInstance;
}
export declare class HammerGesturesPlugin extends HammerGesturesPluginCommon {
    private _config;
    constructor(_config: HammerGestureConfig);
    supports(eventName: string): boolean;
    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;
    isCustomEvent(eventName: string): boolean;
}
