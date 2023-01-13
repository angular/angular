/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {KeyEventsPlugin} from '@angular/platform-browser/src/dom/events/key_events';

{
  describe('KeyEventsPlugin', () => {
    it('should ignore unrecognized events', () => {
      expect(KeyEventsPlugin.parseEventName('keydown')).toEqual(null);
      expect(KeyEventsPlugin.parseEventName('keyup')).toEqual(null);
      expect(KeyEventsPlugin.parseEventName('keydown.unknownmodifier.enter')).toEqual(null);
      expect(KeyEventsPlugin.parseEventName('keyup.unknownmodifier.enter')).toEqual(null);
      expect(KeyEventsPlugin.parseEventName('unknownevent.control.shift.enter')).toEqual(null);
      expect(KeyEventsPlugin.parseEventName('unknownevent.enter')).toEqual(null);
    });

    it('should correctly parse event names', () => {
      // key with no modifier
      expect(KeyEventsPlugin.parseEventName('keydown.enter'))
          .toEqual({'domEventName': 'keydown', 'fullKey': 'enter'});
      expect(KeyEventsPlugin.parseEventName('keyup.enter'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'enter'});

      // key with modifiers:
      expect(KeyEventsPlugin.parseEventName('keydown.control.shift.enter'))
          .toEqual({'domEventName': 'keydown', 'fullKey': 'control.shift.enter'});
      expect(KeyEventsPlugin.parseEventName('keyup.control.shift.enter'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'control.shift.enter'});

      // key with modifiers in a different order:
      expect(KeyEventsPlugin.parseEventName('keydown.shift.control.enter'))
          .toEqual({'domEventName': 'keydown', 'fullKey': 'control.shift.enter'});
      expect(KeyEventsPlugin.parseEventName('keyup.shift.control.enter'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'control.shift.enter'});

      // key that is also a modifier:
      expect(KeyEventsPlugin.parseEventName('keydown.shift.control'))
          .toEqual({'domEventName': 'keydown', 'fullKey': 'shift.control'});
      expect(KeyEventsPlugin.parseEventName('keyup.shift.control'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'shift.control'});

      expect(KeyEventsPlugin.parseEventName('keydown.control.shift'))
          .toEqual({'domEventName': 'keydown', 'fullKey': 'control.shift'});
      expect(KeyEventsPlugin.parseEventName('keyup.control.shift'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'control.shift'});

      // key code ordering
      expect(KeyEventsPlugin.parseEventName('keyup.code.control.shift'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'code.control.shift'});
      expect(KeyEventsPlugin.parseEventName('keyup.control.code.shift'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'code.control.shift'});
      // capitalization gets lowercased
      expect(KeyEventsPlugin.parseEventName('keyup.control.code.shift.KeyS'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'code.control.shift.keys'});
      // user provided order of `code.` does not matter
      expect(KeyEventsPlugin.parseEventName('keyup.control.shift.code.KeyS'))
          .toEqual({'domEventName': 'keyup', 'fullKey': 'code.control.shift.keys'});
      // except for putting `code` at the end
      expect(KeyEventsPlugin.parseEventName('keyup.control.shift.KeyS.code')).toBeNull();
    });

    it('should alias esc to escape', () => {
      expect(KeyEventsPlugin.parseEventName('keyup.control.esc'))
          .toEqual(KeyEventsPlugin.parseEventName('keyup.control.escape'));
      expect(KeyEventsPlugin.parseEventName('keyup.control.Esc'))
          .toEqual(KeyEventsPlugin.parseEventName('keyup.control.escape'));
    });

    it('should match key field', () => {
      const baseKeyboardEvent = {
        isTrusted: true,
        bubbles: true,
        cancelBubble: false,
        cancelable: true,
        composed: true,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        type: 'keydown'
      };
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown', {...baseKeyboardEvent, key: 'ß', code: 'KeyS', altKey: true}),
                 'alt.ß'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown', {...baseKeyboardEvent, key: 'S', code: 'KeyS', altKey: true}),
                 'alt.s'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown', {...baseKeyboardEvent, key: 'F', code: 'KeyF', metaKey: true}),
                 'meta.f'))
          .toBeTruthy();
      expect(
          KeyEventsPlugin.matchEventFullKeyCode(
              new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'ArrowUp', code: 'ArrowUp'}),
              'arrowup'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown', {...baseKeyboardEvent, key: 'ArrowDown', code: 'ArrowDown'}),
                 'arrowdown'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'A', code: 'KeyA'}), 'a'))
          .toBeTruthy();

      // special characters
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'Esc', code: 'Escape'}),
                 'escape'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {...baseKeyboardEvent, key: '\x1B', code: 'Escape'}),
                 'escape'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {...baseKeyboardEvent, key: '\b', code: 'Backspace'}),
                 'backspace'))
          .toBeTruthy();
      expect(
          KeyEventsPlugin.matchEventFullKeyCode(
              new KeyboardEvent('keydown', {...baseKeyboardEvent, key: '\t', code: 'Tab'}), 'tab'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'Del', code: 'Delete'}),
                 'delete'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {...baseKeyboardEvent, key: '\x7F', code: 'Delete'}),
                 'delete'))
          .toBeTruthy();
      expect(
          KeyEventsPlugin.matchEventFullKeyCode(
              new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'Left', code: 'ArrowLeft'}),
              'arrowleft'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown', {...baseKeyboardEvent, key: 'Right', code: 'ArrowRight'}),
                 'arrowright'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'Up', code: 'ArrowUp'}),
                 'arrowup'))
          .toBeTruthy();
      expect(
          KeyEventsPlugin.matchEventFullKeyCode(
              new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'Down', code: 'ArrowDown'}),
              'arrowdown'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown', {...baseKeyboardEvent, key: 'Menu', code: 'ContextMenu'}),
                 'contextmenu'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown', {...baseKeyboardEvent, key: 'Scroll', code: 'ScrollLock'}),
                 'scrolllock'))
          .toBeTruthy();
      expect(
          KeyEventsPlugin.matchEventFullKeyCode(
              new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'Win', code: 'OS'}), 'os'))
          .toBeTruthy();
    });

    it('should match code field', () => {
      const baseKeyboardEvent = {
        isTrusted: true,
        bubbles: true,
        cancelBubble: false,
        cancelable: true,
        composed: true,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        type: 'keydown'
      };
      // Windows
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown', {...baseKeyboardEvent, key: 's', code: 'KeyS', altKey: true}),
                 'code.alt.keys'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown', {...baseKeyboardEvent, key: 's', code: 'KeyS', altKey: true}),
                 'alt.s'))
          .toBeTruthy();

      // MacOS
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown', {...baseKeyboardEvent, key: 'ß', code: 'KeyS', altKey: true}),
                 'code.alt.keys'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown', {...baseKeyboardEvent, key: 'ß', code: 'KeyS', altKey: true}),
                 'alt.s'))
          .toBeFalsy();

      // Arrow Keys
      expect(
          KeyEventsPlugin.matchEventFullKeyCode(
              new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'ArrowUp', code: 'ArrowUp'}),
              'code.arrowup'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown', {...baseKeyboardEvent, key: 'ArrowDown', code: 'ArrowDown'}),
                 'arrowdown'))
          .toBeTruthy();

      // Basic key match
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'A', code: 'KeyA'}), 'a'))
          .toBeTruthy();

      // Basic code match
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'A', code: 'KeyA'}),
                 'code.a'))
          .toBeFalsy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'A', code: 'KeyA'}),
                 'code.keya'))
          .toBeTruthy();

      // basic special key
      expect(
          KeyEventsPlugin.matchEventFullKeyCode(
              new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'Shift', code: 'LeftShift'}),
              'code.shift'))
          .toBeFalsy();
      expect(
          KeyEventsPlugin.matchEventFullKeyCode(
              new KeyboardEvent('keydown', {...baseKeyboardEvent, key: 'Shift', code: 'LeftShift'}),
              'code.leftshift'))
          .toBeTruthy();

      // combination keys with code match
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {
                   ...baseKeyboardEvent,
                   key: 'Alt',
                   code: 'AltLeft',
                   shiftKey: true,
                   altKey: true
                 }),
                 'code.alt.shift.altleft'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {
                   ...baseKeyboardEvent,
                   key: 'Alt',
                   code: 'AltLeft',
                   shiftKey: true,
                   altKey: true
                 }),
                 'code.shift.altleft'))
          .toBeFalsy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {
                   ...baseKeyboardEvent,
                   key: 'Meta',
                   code: 'MetaLeft',
                   shiftKey: true,
                   metaKey: true
                 }),
                 'code.meta.shift.metaleft'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {
                   ...baseKeyboardEvent,
                   key: 'Alt',
                   code: 'MetaLeft',
                   shiftKey: true,
                   metaKey: true
                 }),
                 'code.shift.meta'))
          .toBeFalsy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown',
                     {...baseKeyboardEvent, key: 'S', code: 'KeyS', shiftKey: true, metaKey: true}),
                 'code.meta.shift.keys'))
          .toBeTruthy();

      // combination keys without code match
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {
                   ...baseKeyboardEvent,
                   key: 'Alt',
                   code: 'AltLeft',
                   shiftKey: true,
                   altKey: true
                 }),
                 'shift.alt'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {
                   ...baseKeyboardEvent,
                   key: 'Meta',
                   code: 'MetaLeft',
                   shiftKey: true,
                   metaKey: true
                 }),
                 'shift.meta'))
          .toBeTruthy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent(
                     'keydown',
                     {...baseKeyboardEvent, key: 'S', code: 'KeyS', shiftKey: true, metaKey: true}),
                 'meta.shift.s'))
          .toBeTruthy();

      // OS mismatch
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {
                   ...baseKeyboardEvent,
                   key: 'Meta',
                   code: 'MetaLeft',
                   shiftKey: true,
                   metaKey: true
                 }),
                 'shift.alt'))
          .toBeFalsy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {
                   ...baseKeyboardEvent,
                   key: 'Alt',
                   code: 'AltLeft',
                   shiftKey: true,
                   altKey: true
                 }),
                 'shift.meta'))
          .toBeFalsy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {
                   ...baseKeyboardEvent,
                   key: 'Meta',
                   code: 'MetaLeft',
                   shiftKey: true,
                   metaKey: true
                 }),
                 'code.shift.altleft'))
          .toBeFalsy();
      expect(KeyEventsPlugin.matchEventFullKeyCode(
                 new KeyboardEvent('keydown', {
                   ...baseKeyboardEvent,
                   key: 'Alt',
                   code: 'AltLeft',
                   shiftKey: true,
                   altKey: true
                 }),
                 'code.shift.metaleft'))
          .toBeFalsy();

      // special key character cases
      expect(
          KeyEventsPlugin.matchEventFullKeyCode(
              new KeyboardEvent(
                  'keydown',
                  {...baseKeyboardEvent, key: ' ', code: 'Space', shiftKey: false, altKey: false}),
              'space'))
          .toBeTruthy();

      expect(
          KeyEventsPlugin.matchEventFullKeyCode(
              new KeyboardEvent(
                  'keydown',
                  {...baseKeyboardEvent, key: '.', code: 'Period', shiftKey: false, altKey: false}),
              'dot'))
          .toBeTruthy();
    });

    // unidentified key
    it('should return false when key is unidentified', () => {
      const baseKeyboardEvent = {
        isTrusted: true,
        bubbles: true,
        cancelBubble: false,
        cancelable: true,
        composed: true,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        type: 'keydown'
      };
      expect(
          KeyEventsPlugin.matchEventFullKeyCode(
              new KeyboardEvent('keydown', {...baseKeyboardEvent, shiftKey: false, altKey: false}),
              ''))
          .toBeFalsy();
    });
  });
}
