/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken, NgZone, type ListenerOptions } from '@angular/core';
/**
 * The injection token for plugins of the `EventManager` service.
 *
 * @publicApi
 */
export declare const EVENT_MANAGER_PLUGINS: InjectionToken<EventManagerPlugin[]>;
/**
 * An injectable service that provides event management for Angular
 * through a browser plug-in.
 *
 * @publicApi
 */
export declare class EventManager {
    private _zone;
    private _plugins;
    private _eventNameToPlugin;
    /**
     * Initializes an instance of the event-manager service.
     */
    constructor(plugins: EventManagerPlugin[], _zone: NgZone);
    /**
     * Registers a handler for a specific element and event.
     *
     * @param element The HTML element to receive event notifications.
     * @param eventName The name of the event to listen for.
     * @param handler A function to call when the notification occurs. Receives the
     * event object as an argument.
     * @param options Options that configure how the event listener is bound.
     * @returns  A callback function that can be used to remove the handler.
     */
    addEventListener(element: HTMLElement, eventName: string, handler: Function, options?: ListenerOptions): Function;
    /**
     * Retrieves the compilation zone in which event listeners are registered.
     */
    getZone(): NgZone;
    /** @internal */
    _findPluginFor(eventName: string): EventManagerPlugin;
}
/**
 * The plugin definition for the `EventManager` class
 *
 * It can be used as a base class to create custom manager plugins, i.e. you can create your own
 * class that extends the `EventManagerPlugin` one.
 *
 * @publicApi
 */
export declare abstract class EventManagerPlugin {
    private _doc;
    constructor(_doc: any);
    manager: EventManager;
    /**
     * Should return `true` for every event name that should be supported by this plugin
     */
    abstract supports(eventName: string): boolean;
    /**
     * Implement the behaviour for the supported events
     */
    abstract addEventListener(element: HTMLElement, eventName: string, handler: Function, options?: ListenerOptions): Function;
}
