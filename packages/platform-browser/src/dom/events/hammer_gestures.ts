/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, InjectionToken, ɵConsole as Console} from '@angular/core';

import {DOCUMENT} from '../dom_tokens';

import {EventManagerPlugin} from './event_manager';

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
};

/**
 * DI token for providing [HammerJS](http://hammerjs.github.io/) support to Angular.
 * @see `HammerGestureConfig`
 *
 * @experimental
 */
export const HAMMER_GESTURE_CONFIG = new InjectionToken<HammerGestureConfig>('HammerGestureConfig');

export interface HammerInstance {
  on(eventName: string, callback?: Function): void;
  off(eventName: string, callback?: Function): void;
}

/**
 * An injectable [HammerJS Manager](http://hammerjs.github.io/api/#hammer.manager)
 * for gesture recognition. Configures specific event recognition.
 * @experimental
 */
@Injectable()
export class HammerGestureConfig {
  /**
   * @description A set of supported event names for gestures to be used in Angular.
   * Angular supports all built-in recognizers, as listed in
   * [HammerJS documentation](http://hammerjs.github.io/).
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
   * [HammerJS documentation](http://hammerjs.github.io/).
   *
   */
  overrides: {[key: string]: Object} = {};

  /**
   * Properties whose default values can be overridden for a given event.
   * Different sets of properties apply to different events.
   * For information about which properties are supported for which events,
   * and their allowed and default values, see
   * [HammerJS documentation](http://hammerjs.github.io/).
   */
  options?: {
    cssProps?: any; domEvents?: boolean; enable?: boolean | ((manager: any) => boolean);
    preset?: any[];
    touchAction?: string;
    recognizers?: any[];
    inputClass?: any;
    inputTarget?: EventTarget;
  };

  /**
   * Creates a [HammerJS Manager](http://hammerjs.github.io/api/#hammer.manager)
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

@Injectable()
export class HammerGesturesPlugin extends EventManagerPlugin {
  constructor(
      @Inject(DOCUMENT) doc: any,
      @Inject(HAMMER_GESTURE_CONFIG) private _config: HammerGestureConfig,
      private console: Console) {
    super(doc);
  }
 
  supports(eventName: string): boolean {
    if (!EVENT_NAMES.hasOwnProperty(eventName.toLowerCase()) && !this.isCustomEvent(eventName)) {
      return false;
    }

    if (!(window as any).Hammer) {
      this.console.warn(`Hammer.js is not loaded, can not bind '${eventName}' event.`);
      return false;
    }

    return true;
  }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    const zone = this.manager.getZone();
    eventName = eventName.toLowerCase();

    return zone.runOutsideAngular(() => {
      // Creating the manager bind events, must be done outside of angular
      const mc = this._config.buildHammer(element);
      const callback = function(eventObj: HammerInput) {
        zone.runGuarded(function() { handler(eventObj); });
      };
      mc.on(eventName, callback);
      return () => mc.off(eventName, callback);
    });
  }

  isCustomEvent(eventName: string): boolean { return this._config.events.indexOf(eventName) > -1; }
}
