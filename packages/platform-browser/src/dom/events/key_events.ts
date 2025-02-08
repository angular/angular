/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, ɵgetDOM as getDOM} from '@angular/common';
import {Inject, Injectable, type ListenerOptions, NgZone} from '@angular/core';

import {EventManagerPlugin} from './event_manager';

/**
 * Defines supported modifiers for key events.
 */
const MODIFIER_KEYS = ['alt', 'control', 'meta', 'shift'];

// The following values are here for cross-browser compatibility and to match the W3C standard
// cf https://www.w3.org/TR/DOM-Level-3-Events-key/
const _keyMap: {[k: string]: string} = {
  '\b': 'Backspace',
  '\t': 'Tab',
  '\x7F': 'Delete',
  '\x1B': 'Escape',
  'Del': 'Delete',
  'Esc': 'Escape',
  'Left': 'ArrowLeft',
  'Right': 'ArrowRight',
  'Up': 'ArrowUp',
  'Down': 'ArrowDown',
  'Menu': 'ContextMenu',
  'Scroll': 'ScrollLock',
  'Win': 'OS',
};

/**
 * Retrieves modifiers from key-event objects.
 */
const MODIFIER_KEY_GETTERS: {[key: string]: (event: KeyboardEvent) => boolean} = {
  'alt': (event: KeyboardEvent) => event.altKey,
  'control': (event: KeyboardEvent) => event.ctrlKey,
  'meta': (event: KeyboardEvent) => event.metaKey,
  'shift': (event: KeyboardEvent) => event.shiftKey,
};

/**
 * A browser plug-in that provides support for handling of key events in Angular.
 */
@Injectable()
export class KeyEventsPlugin extends EventManagerPlugin {
  /**
   * Initializes an instance of the browser plug-in.
   * @param doc The document in which key events will be detected.
   */
  constructor(@Inject(DOCUMENT) doc: any) {
    super(doc);
  }

  /**
   * Reports whether a named key event is supported.
   * @param eventName The event name to query.
   * @return True if the named key event is supported.
   */
  override supports(eventName: string): boolean {
    return KeyEventsPlugin.parseEventName(eventName) != null;
  }

  /**
   * Registers a handler for a specific element and key event.
   * @param element The HTML element to receive event notifications.
   * @param eventName The name of the key event to listen for.
   * @param handler A function to call when the notification occurs. Receives the
   * event object as an argument.
   * @returns The key event that was registered.
   */
  override addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: Function,
    options?: ListenerOptions,
  ): Function {
    const parsedEvent = KeyEventsPlugin.parseEventName(eventName)!;

    const outsideHandler = KeyEventsPlugin.eventCallback(
      parsedEvent['fullKey'],
      handler,
      this.manager.getZone(),
    );

    return this.manager.getZone().runOutsideAngular(() => {
      return getDOM().onAndCancel(element, parsedEvent['domEventName'], outsideHandler, options);
    });
  }

  /**
   * Parses the user provided full keyboard event definition and normalizes it for
   * later internal use. It ensures the string is all lowercase, converts special
   * characters to a standard spelling, and orders all the values consistently.
   *
   * @param eventName The name of the key event to listen for.
   * @returns an object with the full, normalized string, and the dom event name
   * or null in the case when the event doesn't match a keyboard event.
   */
  static parseEventName(eventName: string): {fullKey: string; domEventName: string} | null {
    const parts: string[] = eventName.toLowerCase().split('.');

    const domEventName = parts.shift();
    if (parts.length === 0 || !(domEventName === 'keydown' || domEventName === 'keyup')) {
      return null;
    }

    const key = KeyEventsPlugin._normalizeKey(parts.pop()!);

    let fullKey = '';
    let codeIX = parts.indexOf('code');
    if (codeIX > -1) {
      parts.splice(codeIX, 1);
      fullKey = 'code.';
    }
    MODIFIER_KEYS.forEach((modifierName) => {
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

    // NOTE: Please don't rewrite this as so, as it will break JSCompiler property renaming.
    //       The code must remain in the `result['domEventName']` form.
    // return {domEventName, fullKey};
    const result: {fullKey: string; domEventName: string} = {} as any;
    result['domEventName'] = domEventName;
    result['fullKey'] = fullKey;
    return result;
  }

  /**
   * Determines whether the actual keys pressed match the configured key code string.
   * The `fullKeyCode` event is normalized in the `parseEventName` method when the
   * event is attached to the DOM during the `addEventListener` call. This is unseen
   * by the end user and is normalized for internal consistency and parsing.
   *
   * @param event The keyboard event.
   * @param fullKeyCode The normalized user defined expected key event string
   * @returns boolean.
   */
  static matchEventFullKeyCode(event: KeyboardEvent, fullKeyCode: string): boolean {
    let keycode = _keyMap[event.key] || event.key;
    let key = '';
    if (fullKeyCode.indexOf('code.') > -1) {
      keycode = event.code;
      key = 'code.';
    }
    // the keycode could be unidentified so we have to check here
    if (keycode == null || !keycode) return false;
    keycode = keycode.toLowerCase();
    if (keycode === ' ') {
      keycode = 'space'; // for readability
    } else if (keycode === '.') {
      keycode = 'dot'; // because '.' is used as a separator in event names
    }
    MODIFIER_KEYS.forEach((modifierName) => {
      if (modifierName !== keycode) {
        const modifierGetter = MODIFIER_KEY_GETTERS[modifierName];
        if (modifierGetter(event)) {
          key += modifierName + '.';
        }
      }
    });
    key += keycode;
    return key === fullKeyCode;
  }

  /**
   * Configures a handler callback for a key event.
   * @param fullKey The event name that combines all simultaneous keystrokes.
   * @param handler The function that responds to the key event.
   * @param zone The zone in which the event occurred.
   * @returns A callback function.
   */
  static eventCallback(fullKey: string, handler: Function, zone: NgZone): Function {
    return (event: KeyboardEvent) => {
      if (KeyEventsPlugin.matchEventFullKeyCode(event, fullKey)) {
        zone.runGuarded(() => handler(event));
      }
    };
  }

  /** @internal */
  static _normalizeKey(keyName: string): string {
    return keyName === 'esc' ? 'escape' : keyName;
  }
}
