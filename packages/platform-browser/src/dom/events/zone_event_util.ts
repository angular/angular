/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {NgZone} from '@angular/core';
import {EventManagerPluginOptions} from './event_manager';

/**
 *
 * @param element
 * @param eventName
 * @param handler
 * @param ngZone
 * @param options
 *
 * @publicApi
 */
export function onAndCancelWithZone(
    element: any, eventName: string, handler: EventListener, ngZone: NgZone,
    options?: EventManagerPluginOptions): Function {
  const dom = getDOM();
  const zoneOption = options?.zone;
  // remove options.zone and only pass AddEventListenerOptions to the dom
  let hasDOMOptions = false;
  if (typeof options?.capture === 'boolean' || typeof options?.once === 'boolean' ||
      typeof options?.passive === 'boolean') {
    hasDOMOptions = true;
  }
  let listenerOptions = hasDOMOptions ? {...options} : undefined;
  if (listenerOptions) {
    delete listenerOptions.zone;
  }
  if (zoneOption === 'noopZone') {
    if (NgZone.isInAngularZone()) {
      // Currently inside ngZone, we need to add the listener outside of ngZone
      return ngZone.runOutsideAngular(() => {
        return dom.onAndCancel(element, eventName, handler, listenerOptions);
      });
    }
  }
  if (zoneOption === 'ngZone') {
    if (!NgZone.isInAngularZone()) {
      // Currently outside ngZone, we need to add the listener inside ngZone
      return ngZone.run(() => {
        return dom.onAndCancel(element, eventName, handler, listenerOptions);
      });
    }
  }
  return dom.onAndCancel(element, eventName, handler, listenerOptions);
}
