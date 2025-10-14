/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken, Injector } from '@angular/core';
import { EventManagerPlugin } from './event_manager';
/**
 * DI token for providing [HammerJS](https://hammerjs.github.io/) support to Angular.
 * @see {@link HammerGestureConfig}
 *
 * @ngModule HammerModule
 * @publicApi
 *
 * @deprecated The HammerJS integration is deprecated. Replace it by your own implementation.
 */
export declare const HAMMER_GESTURE_CONFIG: InjectionToken<HammerGestureConfig>;
/**
 * Function that loads HammerJS, returning a promise that is resolved once HammerJs is loaded.
 *
 * @publicApi
 *
 * @deprecated The hammerjs integration is deprecated. Replace it by your own implementation.
 */
export type HammerLoader = () => Promise<void>;
/**
 * Injection token used to provide a HammerLoader to Angular.
 *
 * @see {@link HammerLoader}
 *
 * @publicApi
 *
 * @deprecated The HammerJS integration is deprecated. Replace it by your own implementation.
 */
export declare const HAMMER_LOADER: InjectionToken<HammerLoader>;
export interface HammerInstance {
    on(eventName: string, callback?: Function): void;
    off(eventName: string, callback?: Function): void;
    destroy?(): void;
}
/**
 * An injectable [HammerJS Manager](https://hammerjs.github.io/api/#hammermanager)
 * for gesture recognition. Configures specific event recognition.
 * @publicApi
 *
 * @deprecated The HammerJS integration is deprecated. Replace it by your own implementation.
 */
export declare class HammerGestureConfig {
    /**
     * A set of supported event names for gestures to be used in Angular.
     * Angular supports all built-in recognizers, as listed in
     * [HammerJS documentation](https://hammerjs.github.io/).
     */
    events: string[];
    /**
     * Maps gesture event names to a set of configuration options
     * that specify overrides to the default values for specific properties.
     *
     * The key is a supported event name to be configured,
     * and the options object contains a set of properties, with override values
     * to be applied to the named recognizer event.
     * For example, to disable recognition of the rotate event, specify
     *  `{"rotate": {"enable": false}}`.
     *
     * Properties that are not present take the HammerJS default values.
     * For information about which properties are supported for which events,
     * and their allowed and default values, see
     * [HammerJS documentation](https://hammerjs.github.io/).
     *
     */
    overrides: {
        [key: string]: Object;
    };
    /**
     * Properties whose default values can be overridden for a given event.
     * Different sets of properties apply to different events.
     * For information about which properties are supported for which events,
     * and their allowed and default values, see
     * [HammerJS documentation](https://hammerjs.github.io/).
     */
    options?: {
        cssProps?: any;
        domEvents?: boolean;
        enable?: boolean | ((manager: any) => boolean);
        preset?: any[];
        touchAction?: string;
        recognizers?: any[];
        inputClass?: any;
        inputTarget?: EventTarget;
    };
    /**
     * Creates a [HammerJS Manager](https://hammerjs.github.io/api/#hammermanager)
     * and attaches it to a given HTML element.
     * @param element The element that will recognize gestures.
     * @returns A HammerJS event-manager object.
     */
    buildHammer(element: HTMLElement): HammerInstance;
}
/**
 * Event plugin that adds Hammer support to an application.
 *
 * @ngModule HammerModule
 */
export declare class HammerGesturesPlugin extends EventManagerPlugin {
    private _config;
    private _injector;
    private loader?;
    private _loaderPromise;
    constructor(doc: any, _config: HammerGestureConfig, _injector: Injector, loader?: (HammerLoader | null) | undefined);
    supports(eventName: string): boolean;
    addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;
    isCustomEvent(eventName: string): boolean;
}
/**
 * Adds support for HammerJS.
 *
 * Import this module at the root of your application so that Angular can work with
 * HammerJS to detect gesture events.
 *
 * Note that applications still need to include the HammerJS script itself. This module
 * simply sets up the coordination layer between HammerJS and Angular's `EventManager`.
 *
 * @publicApi
 *
 * @deprecated The hammer integration is deprecated. Replace it by your own implementation.
 */
export declare class HammerModule {
}
