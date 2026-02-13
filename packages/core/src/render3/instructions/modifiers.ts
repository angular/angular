/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Modifier that prevents the default action of the event.
 */
export function ɵɵprevent(fn: (e: any) => any) {
  return function (this: any, e: any) {
    e.preventDefault();
    return fn.apply(this, [e]);
  };
}

/**
 * Modifier that stops the propagation of the event.
 */
export function ɵɵstop(fn: (e: any) => any) {
  return function (this: any, e: any) {
    e.stopPropagation();
    return fn.apply(this, [e]);
  };
}

const MODIFIER_KEYS = ['alt', 'control', 'meta', 'shift'] as const;

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

const MODIFIER_KEY_GETTERS: {[key: string]: (event: KeyboardEvent) => boolean} = {
  'alt': (event: KeyboardEvent) => event.altKey,
  'control': (event: KeyboardEvent) => event.ctrlKey,
  'meta': (event: KeyboardEvent) => event.metaKey,
  'shift': (event: KeyboardEvent) => event.shiftKey,
};

/**
 * Determines whether the actual keys pressed match the configured key code string.
 * The `fullKeyCode` event is normalized by the compiler (parseListenerName).
 * This is unseen by the end user and is normalized for internal consistency and parsing.
 *
 * @param event The keyboard event.
 * @param fullKeyCode The normalized user defined expected key event string
 * @returns boolean.
 */
function matchEventFullKeyCode(event: KeyboardEvent, fullKeyCode: string): boolean {
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
 * Modifier that debounces the event listener.
 * @param delay The delay in milliseconds.
 */
export function ɵɵdebounce(delay: number) {
  return function (fn: (e: any) => any) {
    let timer: any = null;
    return function (this: any, e: any) {
      if (timer) clearTimeout(timer);
      // TODO: runOutside ?
      timer = setTimeout(() => {
        fn.apply(this, [e]);
      }, delay);
    };
  };
}

/**
 * Modifier that handles key events.
 * @param key The key to match.
 */
export function ɵɵkey(key: string) {
  return function (fn: (e: any) => any) {
    return function (this: unknown, event: KeyboardEvent) {
      if (matchEventFullKeyCode(event, key)) {
        return fn.apply(this, [event]);
      } else {
        // TODO: What do here?
      }
    };
  };
}
