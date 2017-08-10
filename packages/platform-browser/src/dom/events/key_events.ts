/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, NgZone} from '@angular/core';

import {getDOM} from '../dom_adapter';
import {DOCUMENT} from '../dom_tokens';

import {EventManagerPlugin} from './event_manager';

const MODIFIER_KEYS = ['alt', 'control', 'meta', 'shift'];
const MODIFIER_KEY_GETTERS: {[key: string]: (event: KeyboardEvent) => boolean} = {
  'alt': (event: KeyboardEvent) => event.altKey,
  'control': (event: KeyboardEvent) => event.ctrlKey,
  'meta': (event: KeyboardEvent) => event.metaKey,
  'shift': (event: KeyboardEvent) => event.shiftKey
};

/**
 * @experimental
 */
@Injectable()
export class KeyEventsPlugin extends EventManagerPlugin {
  constructor(@Inject(DOCUMENT) doc: any) { super(doc); }

  supports(eventName: string): boolean { return KeyEventsPlugin.parseEventName(eventName) != null; }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    const parsedEvent = KeyEventsPlugin.parseEventName(eventName) !;

    const outsideHandler =
        KeyEventsPlugin.eventCallback(parsedEvent['fullKey'], handler, this.manager.getZone());

    return this.manager.getZone().runOutsideAngular(() => {
      return getDOM().onAndCancel(element, parsedEvent['domEventName'], outsideHandler);
    });
  }

  static parseEventName(eventName: string): {[key: string]: string}|null {
    const parts: string[] = eventName.toLowerCase().split('.');

    const domEventName = parts.shift();
    if ((parts.length === 0) || !(domEventName === 'keydown' || domEventName === 'keyup')) {
      return null;
    }

    const key = KeyEventsPlugin._normalizeKey(parts.pop() !);

    let fullKey = '';
    MODIFIER_KEYS.forEach(modifierName => {
      const index: number = parts.indexOf(modifierName);
      if (index > -1) {
        parts.splice(index, 1);
        fullKey += modifierName + '.';
      }
    });
    fullKey += key;

    if (parts.length != 0 || key.length === 0) {
      // returning null instead of throwing to let another plugin process the event
      return null;
    }

    const result: {[k: string]: string} = {};
    result['domEventName'] = domEventName;
    result['fullKey'] = fullKey;
    return result;
  }

  static getEventFullKey(event: KeyboardEvent): string {
    let fullKey = '';
    let key = getDOM().getEventKey(event);
    key = key.toLowerCase();
    if (key === ' ') {
      key = 'space';  // for readability
    } else if (key === '.') {
      key = 'dot';  // because '.' is used as a separator in event names
    }
    MODIFIER_KEYS.forEach(modifierName => {
      if (modifierName != key) {
        const modifierGetter = MODIFIER_KEY_GETTERS[modifierName];
        if (modifierGetter(event)) {
          fullKey += modifierName + '.';
        }
      }
    });
    fullKey += key;
    return fullKey;
  }

  static eventCallback(fullKey: any, handler: Function, zone: NgZone): Function {
    return (event: any /** TODO #9100 */) => {
      if (KeyEventsPlugin.getEventFullKey(event) === fullKey) {
        zone.runGuarded(() => handler(event));
      }
    };
  }

  /** @internal */
  static _normalizeKey(keyName: string): string {
    // TODO: switch to a Map if the mapping grows too much
    switch (keyName) {
      case 'esc':
        return 'escape';
      default:
        return keyName;
    }
  }
}
