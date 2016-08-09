/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone} from '@angular/core';
import {getDOM} from '../dom_adapter';
import {EventManagerPlugin} from './event_manager';

const MODIFIER_KEYS = ['alt', 'control', 'meta', 'shift'];
const MODIFIER_KEY_GETTERS: {[key: string]: (event: KeyboardEvent) => boolean} = {
  'alt': (event: KeyboardEvent) => event.altKey,
  'control': (event: KeyboardEvent) => event.ctrlKey,
  'meta': (event: KeyboardEvent) => event.metaKey,
  'shift': (event: KeyboardEvent) => event.shiftKey
};

export interface ParsedEvent {
  fullKey: string;
  domEventName: string;
}

/**
 * @experimental
 */
@Injectable()
export class KeyEventsPlugin extends EventManagerPlugin {
  constructor() { super(); }

  supports(eventName: string): boolean { return !!KeyEventsPlugin.parseEventName(eventName); }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    const parsedEvent: ParsedEvent = KeyEventsPlugin.parseEventName(eventName);

    const outsideHandler: Function =
        KeyEventsPlugin._eventCallback(parsedEvent.fullKey, handler, this.manager.getZone());

    return this.manager.getZone().runOutsideAngular(
        () => getDOM().onAndCancel(element, parsedEvent.domEventName, outsideHandler));
  }

  addGlobalEventListener(element: string, eventName: string, handler: Function): Function {
    const target: HTMLElement = getDOM().getGlobalEventTarget(element);
    return this.addEventListener(target, eventName, handler);
  }

  static parseEventName(eventName: string): ParsedEvent {
    const parts: string[] = eventName.toLowerCase().split('.');

    const domEventName: string = parts.shift();
    if ((parts.length === 0) || !((domEventName === 'keydown') || (domEventName === 'keyup'))) {
      return null;
    }

    const key: string = KeyEventsPlugin._normalizeKey(parts.pop());

    let fullKey: string = '';
    MODIFIER_KEYS.forEach(modifierName => {
      const index: number = parts.indexOf(modifierName);
      if (index > -1) {
        parts.splice(index, 1);
        fullKey += modifierName + '.';
      }
    });
    fullKey += key;

    if (parts.length !== 0 || key.length === 0) {
      // returning null instead of throwing to let another plugin process the event
      return null;
    }
    return {fullKey, domEventName};
  }

  static getEventFullKey(event: KeyboardEvent): string {
    let fullKey: string = '';
    let key: string = getDOM().getEventKey(event).toLowerCase();
    if (key === ' ') {
      key = 'space';  // for readability
    } else if (key === '.') {
      key = 'dot';  // because '.' is used as a separator in event names
    }
    MODIFIER_KEYS.forEach(modifierName => {
      if (modifierName !== key) {
        const modifierGetter: (event: Event) => boolean = MODIFIER_KEY_GETTERS[modifierName];
        if (modifierGetter && modifierGetter(event)) {
          fullKey += modifierName + '.';
        }
      }
    });
    fullKey += key;
    return fullKey;
  }

  /** @internal */
  static _eventCallback(fullKey: string, handler: Function, zone: NgZone): Function {
    return (event: KeyboardEvent) => {
      if (KeyEventsPlugin.getEventFullKey(event) === fullKey) {
        zone.runGuarded(() => handler(event));
      }
    };
  }

  /** @internal */
  static _normalizeKey(keyName: string): string {
    // TODO: switch to a StringMap if the mapping grows too much
    switch (keyName) {
      case 'esc':
        return 'escape';
      default:
        return keyName;
    }
  }
}
