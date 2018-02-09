/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, InjectionToken} from '@angular/core';

import {DOCUMENT} from '../dom_tokens';

import {EventManagerPlugin} from './event_manager';

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
 * A DI token that you can use to provide{@link HammerGestureConfig} to Angular. Use it to configure
 * Hammer gestures.
 *
 * @experimental
 */
export const HAMMER_GESTURE_CONFIG = new InjectionToken<HammerGestureConfig>('HammerGestureConfig');

export interface HammerInstance {
  on(eventName: string, callback?: Function): void;
  off(eventName: string, callback?: Function): void;
}

/**
 * @whatItDoes Configures HammerJS.
 *
 * @description
 *
 * Use the `HammerGestureConfig` class to configure
 * [HammerJS](https://hammerjs.github.io/getting-started/),
 * an external library you can use with Angular to support gesture
 * recognition. The
 * [dependency injection token](guide/dependency-injection#dependency-injection-tokens)
 * should be bound to an instance of {@link   HammerGestureConfig}.
 * There are three key parts to the `HammerGestureConfig` class.
 *
 * @experimental
 */
@Injectable()
export class HammerGestureConfig {
  /**
   * The `events` array is an array of strings that specifies the HammerJS
   * [events](https://github.com/angular/angular/blob/master/packages/platform-browser/src/dom/events/hammer_gestures.ts#L15)
   * you're supporting.
   */

  events: string[] = [];

  /**
   * The `overrides` object is a map of recognizer name to configuration that the
   * default implementation uses. For example, to disable the rotate gesture,
   * you would use `{"rotate": {"enabled": false}}`.
   */

  overrides: {[key: string]: Object} = {};


  /**
   * The `buildHammer()` method takes an HTML element and creates a Manager instance,
   * which Angular refers to as `HammerInstance`, with the configuration you specify.
   *
   */
  buildHammer(element: HTMLElement): HammerInstance {
    const mc = new Hammer(element);

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
      @Inject(HAMMER_GESTURE_CONFIG) private _config: HammerGestureConfig) {
    super(doc);
  }

  supports(eventName: string): boolean {
    if (!EVENT_NAMES.hasOwnProperty(eventName.toLowerCase()) && !this.isCustomEvent(eventName)) {
      return false;
    }

    if (!(window as any).Hammer) {
      throw new Error(`Hammer.js is not loaded, can not bind ${eventName} event`);
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
