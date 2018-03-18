/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventOptions, Inject, Injectable, NgZone, ɵglobal as global} from '@angular/core';

import {DOCUMENT} from '../dom_tokens';

import {EventManagerPlugin} from './event_manager';


/**
 * Detect if Zone is present. If it is then bypass 'addEventListener' since Angular can do much more
 * efficient bookkeeping than Zone can, because we have additional information. This speeds up
 * addEventListener by 3x.
 */
const __symbol__ =
    (typeof Zone !== 'undefined') && (Zone as any)['__symbol__'] || function(v: string): string {
      return '__zone_symbol__' + v;
    };
const ADD_EVENT_LISTENER: 'addEventListener' = __symbol__('addEventListener');
const REMOVE_EVENT_LISTENER: 'removeEventListener' = __symbol__('removeEventListener');

@Injectable()
export class DomEventsPlugin extends EventManagerPlugin {
  constructor(@Inject(DOCUMENT) doc: any, private ngZone: NgZone) { super(doc); }

  // This plugin should come last in the list of plugins, because it accepts all
  // events.
  supports(eventName: string): boolean { return true; }

  addEventListener(
      element: HTMLElement, eventName: string, handler: Function,
      eventOptions?: EventOptions): Function {
    /**
     * This code is about to add a listener to the DOM. If Zone.js is present, than
     * `addEventListener` has been patched. The patched code adds overhead in both
     * memory and speed (3x slower) than native. For this reason if we detect that
     * Zone.js is present we bypass zone and use native addEventListener instead.
     * The result is faster registration but the zone will not be restored. We do
     * manual zone restoration in element.ts renderEventHandlerClosure method.
     *
     * NOTE: it is possible that the element is from different iframe, and so we
     * have to check before we execute the method.
     */
    const zoneJsLoaded = element[ADD_EVENT_LISTENER];

    let callback: EventListener = handler as EventListener;
    let addFn: string = 'addEventListener';
    let removeFn: string = 'removeEventListener';
    if (eventOptions) {
      if (eventOptions.zone === 'nozone') {
        if (zoneJsLoaded) {
          addFn = ADD_EVENT_LISTENER;
          removeFn = REMOVE_EVENT_LISTENER;
        }
      } else if (eventOptions.zone === 'ngzone') {
        if (!NgZone.isInAngularZone()) {
          const self = this;
          callback = function() { return self.ngZone.run(callback, this, arguments as any); };
        }
      }
    }
    (element as any)[addFn](eventName, callback, eventOptions ? eventOptions : false);
    return () => (element as any)[removeFn](
               eventName, callback as any, eventOptions ? eventOptions : false);
  }
}
