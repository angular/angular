/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, InjectionToken, NgModule, Optional, Provider, ɵConsole as Console} from '@angular/core';

import {EVENT_MANAGER_PLUGINS, EventManagerPlugin} from './event_manager';



/**
 * Supported HammerJS recognizer event names.
 */
const EVENT_NAMES = {
  // pan
  'pan': true,
  'panstart': true,
  'panmove': true,
  'panend': true,
  'pancancel': true,
  'panleft': true,
  'panright': true,
  'panup': true,
  'pandown': true,
  // pinch
  'pinch': true,
  'pinchstart': true,
  'pinchmove': true,
  'pinchend': true,
  'pinchcancel': true,
  'pinchin': true,
  'pinchout': true,
  // press
  'press': true,
  'pressup': true,
  // rotate
  'rotate': true,
  'rotatestart': true,
  'rotatemove': true,
  'rotateend': true,
  'rotatecancel': true,
  // swipe
  'swipe': true,
  'swipeleft': true,
  'swiperight': true,
  'swipeup': true,
  'swipedown': true,
  // tap
  'tap': true,
  'doubletap': true
};

/**
 * DI token for providing [HammerJS](https://hammerjs.github.io/) support to Angular.
 * @see `HammerGestureConfig`
 *
 * @ngModule HammerModule
 * @publicApi
 */
export const HAMMER_GESTURE_CONFIG = new InjectionToken<HammerGestureConfig>('HammerGestureConfig');


/**
 * Function that loads HammerJS, returning a promise that is resolved once HammerJs is loaded.
 *
 * @publicApi
 */
export type HammerLoader = () => Promise<void>;

/**
 * Injection token used to provide a {@link HammerLoader} to Angular.
 *
 * @publicApi
 */
export const HAMMER_LOADER = new InjectionToken<HammerLoader>('HammerLoader');

export interface HammerInstance {
  on(eventName: string, callback?: Function): void;
  off(eventName: string, callback?: Function): void;
  destroy?(): void;
}

/**
 * An injectable [HammerJS Manager](https://hammerjs.github.io/api/#hammermanager)
 * for gesture recognition. Configures specific event recognition.
 * @publicApi
 */
@Injectable()
export class HammerGestureConfig {
  /**
   * A set of supported event names for gestures to be used in Angular.
   * Angular supports all built-in recognizers, as listed in
   * [HammerJS documentation](https://hammerjs.github.io/).
   */
  events: string[] = [];

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
  overrides: {[key: string]: Object} = {};

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
  buildHammer(element: HTMLElement): HammerInstance {
    const mc = new Hammer!(element, this.options);

    mc.get('pinch').set({enable: true});
    mc.get('rotate').set({enable: true});

    for (const eventName in this.overrides) {
      mc.get(eventName).set(this.overrides[eventName]);
    }

    return mc;
  }
}

/**
 * Event plugin that adds Hammer support to an application.
 *
 * @ngModule HammerModule
 */
@Injectable()
export class HammerGesturesPlugin extends EventManagerPlugin {
  private _loaderPromise: Promise<void>|null = null;

  constructor(
      @Inject(DOCUMENT) doc: any,
      @Inject(HAMMER_GESTURE_CONFIG) private _config: HammerGestureConfig, private console: Console,
      @Optional() @Inject(HAMMER_LOADER) private loader?: HammerLoader|null) {
    super(doc);
  }

  override supports(eventName: string): boolean {
    if (!EVENT_NAMES.hasOwnProperty(eventName.toLowerCase()) && !this.isCustomEvent(eventName)) {
      return false;
    }

    if (!(window as any).Hammer && !this.loader) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        this.console.warn(
            `The "${eventName}" event cannot be bound because Hammer.JS is not ` +
            `loaded and no custom loader has been specified.`);
      }
      return false;
    }

    return true;
  }

  override addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    const zone = this.manager.getZone();
    eventName = eventName.toLowerCase();

    // If Hammer is not present but a loader is specified, we defer adding the event listener
    // until Hammer is loaded.
    if (!(window as any).Hammer && this.loader) {
      this._loaderPromise = this._loaderPromise || this.loader();
      // This `addEventListener` method returns a function to remove the added listener.
      // Until Hammer is loaded, the returned function needs to *cancel* the registration rather
      // than remove anything.
      let cancelRegistration = false;
      let deregister: Function = () => {
        cancelRegistration = true;
      };

      this._loaderPromise
          .then(() => {
            // If Hammer isn't actually loaded when the custom loader resolves, give up.
            if (!(window as any).Hammer) {
              if (typeof ngDevMode === 'undefined' || ngDevMode) {
                this.console.warn(
                    `The custom HAMMER_LOADER completed, but Hammer.JS is not present.`);
              }
              deregister = () => {};
              return;
            }

            if (!cancelRegistration) {
              // Now that Hammer is loaded and the listener is being loaded for real,
              // the deregistration function changes from canceling registration to removal.
              deregister = this.addEventListener(element, eventName, handler);
            }
          })
          .catch(() => {
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
              this.console.warn(
                  `The "${eventName}" event cannot be bound because the custom ` +
                  `Hammer.JS loader failed.`);
            }
            deregister = () => {};
          });

      // Return a function that *executes* `deregister` (and not `deregister` itself) so that we
      // can change the behavior of `deregister` once the listener is added. Using a closure in
      // this way allows us to avoid any additional data structures to track listener removal.
      return () => {
        deregister();
      };
    }

    return zone.runOutsideAngular(() => {
      // Creating the manager bind events, must be done outside of angular
      const mc = this._config.buildHammer(element);
      const callback = function(eventObj: HammerInput) {
        zone.runGuarded(function() {
          handler(eventObj);
        });
      };
      mc.on(eventName, callback);
      return () => {
        mc.off(eventName, callback);
        // destroy mc to prevent memory leak
        if (typeof mc.destroy === 'function') {
          mc.destroy();
        }
      };
    });
  }

  isCustomEvent(eventName: string): boolean {
    return this._config.events.indexOf(eventName) > -1;
  }
}

/**
 * In Ivy, support for Hammer gestures is optional, so applications must
 * import the `HammerModule` at root to turn on support. This means that
 * Hammer-specific code can be tree-shaken away if not needed.
 */
export const HAMMER_PROVIDERS__POST_R3__ = [];

/**
 * In View Engine, support for Hammer gestures is built-in by default.
 */
export const HAMMER_PROVIDERS__PRE_R3__: Provider[] = [
  {
    provide: EVENT_MANAGER_PLUGINS,
    useClass: HammerGesturesPlugin,
    multi: true,
    deps: [DOCUMENT, HAMMER_GESTURE_CONFIG, Console, [new Optional(), HAMMER_LOADER]]
  },
  {provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig, deps: []},
];

export const HAMMER_PROVIDERS = HAMMER_PROVIDERS__PRE_R3__;

/**
 * Adds support for HammerJS.
 *
 * Import this module at the root of your application so that Angular can work with
 * HammerJS to detect gesture events.
 *
 * Note that applications still need to include the HammerJS script itself. This module
 * simply sets up the coordination layer between HammerJS and Angular's EventManager.
 *
 * @publicApi
 */
@NgModule({providers: HAMMER_PROVIDERS__PRE_R3__})
export class HammerModule {
}
