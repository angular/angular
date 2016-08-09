/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, NgZone, OpaqueToken} from '@angular/core';
import {getDOM} from '../dom_adapter';
import {HammerGesturesPluginCommon} from './hammer_common';


/**
 * A DI token that you can use to provide{@link HammerGestureConfig} to Angular. Use it to configure
 * Hammer gestures.
 *
 * @experimental
 */
export const HAMMER_GESTURE_CONFIG: OpaqueToken = new OpaqueToken('HammerGestureConfig');

export interface HammerInstance {
  on(eventName: string, callback: Function): void;
  off(eventName: string, callback: Function): void;
}

/**
 * @experimental
 */
@Injectable()
export class HammerGestureConfig {
  events: string[] = [];

  overrides: {[key: string]: Object} = {};

  buildHammer(element: HTMLElement): HammerInstance {
    const mc = new Hammer(element);

    mc.get('pinch').set({enable: true});
    mc.get('rotate').set({enable: true});

    for (let eventName in this.overrides) {
      mc.get(eventName).set(this.overrides[eventName]);
    }

    return mc;
  }
}

@Injectable()
export class HammerGesturesPlugin extends HammerGesturesPluginCommon {
  constructor(@Inject(HAMMER_GESTURE_CONFIG) private _config: HammerGestureConfig) { super(); }

  supports(eventName: string): boolean {
    if (!super.supports(eventName) && !this.isCustomEvent(eventName)) return false;

    if (!(window as any /** TODO #???? */)['Hammer']) {
      throw new Error(`Hammer.js is not loaded, can not bind ${eventName} event`);
    }

    return true;
  }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    const zone: NgZone = this.manager.getZone();
    const name: string = eventName.toLowerCase();

    return zone.runOutsideAngular(() => {
      // Creating the manager bind events, must be done outside of angular
      const mc: HammerInstance = this._config.buildHammer(element);
      const callback = (event: Event) => { zone.runGuarded(() => { handler(event); }); };
      mc.on(name, callback);
      return () => mc.off(name, callback);
    });
  }

  addGlobalEventListener(element: string, eventName: string, handler: Function): Function {
    const target: HTMLElement = getDOM().getGlobalEventTarget(element);
    return this.addEventListener(target, eventName, handler);
  }

  isCustomEvent(eventName: string): boolean { return this._config.events.indexOf(eventName) > -1; }
}
