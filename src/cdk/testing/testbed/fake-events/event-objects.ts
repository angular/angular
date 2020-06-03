/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModifierKeys} from '@angular/cdk/testing';

/**
 * Creates a browser MouseEvent with the specified options.
 * @docs-private
 */
export function createMouseEvent(type: string, clientX = 0, clientY = 0, button = 0) {
  const event = document.createEvent('MouseEvent');
  const originalPreventDefault = event.preventDefault.bind(event);

  // Note: We cannot determine the position of the mouse event based on the screen
  // because the dimensions and position of the browser window are not available
  // To provide reasonable `screenX` and `screenY` coordinates, we simply use the
  // client coordinates as if the browser is opened in fullscreen.
  const screenX = clientX;
  const screenY = clientY;

  event.initMouseEvent(type,
    /* canBubble */ true,
    /* cancelable */ true,
    /* view */ window,
    /* detail */ 0,
    /* screenX */ screenX,
    /* screenY */ screenY,
    /* clientX */ clientX,
    /* clientY */ clientY,
    /* ctrlKey */ false,
    /* altKey */ false,
    /* shiftKey */ false,
    /* metaKey */ false,
    /* button */ button,
    /* relatedTarget */ null);

  // `initMouseEvent` doesn't allow us to pass the `buttons` and
  // defaults it to 0 which looks like a fake event.
  defineReadonlyEventProperty(event, 'buttons', 1);

  // IE won't set `defaultPrevented` on synthetic events so we need to do it manually.
  event.preventDefault = function() {
    defineReadonlyEventProperty(event, 'defaultPrevented', true);
    return originalPreventDefault();
  };

  return event;
}

/**
 * Creates a browser `PointerEvent` with the specified options. Pointer events
 * by default will appear as if they are the primary pointer of their type.
 * https://www.w3.org/TR/pointerevents2/#dom-pointerevent-isprimary.
 *
 * For example, if pointer events for a multi-touch interaction are created, the non-primary
 * pointer touches would need to be represented by non-primary pointer events.
 *
 * @docs-private
 */
export function createPointerEvent(type: string, clientX = 0, clientY = 0,
                                   options: PointerEventInit = {isPrimary: true}) {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX,
    clientY,
    ...options,
  });
}

/**
 * Creates a browser TouchEvent with the specified pointer coordinates.
 * @docs-private
 */
export function createTouchEvent(type: string, pageX = 0, pageY = 0) {
  // In favor of creating events that work for most of the browsers, the event is created
  // as a basic UI Event. The necessary details for the event will be set manually.
  const event = document.createEvent('UIEvent');
  const touchDetails = {pageX, pageY};

  // TS3.6 removes the initUIEvent method and suggests porting to "new UIEvent()".
  (event as any).initUIEvent(type, true, true, window, 0);

  // Most of the browsers don't have a "initTouchEvent" method that can be used to define
  // the touch details.
  defineReadonlyEventProperty(event, 'touches', [touchDetails]);
  defineReadonlyEventProperty(event, 'targetTouches', [touchDetails]);
  defineReadonlyEventProperty(event, 'changedTouches', [touchDetails]);

  return event;
}

/**
 * Dispatches a keydown event from an element.
 * @docs-private
 */
export function createKeyboardEvent(type: string, keyCode: number = 0, key: string = '',
                                    target?: Element, modifiers: ModifierKeys = {}) {
  const event = document.createEvent('KeyboardEvent') as any;
  const originalPreventDefault = event.preventDefault;

  // Firefox does not support `initKeyboardEvent`, but supports `initKeyEvent`.
  if (event.initKeyEvent) {
    event.initKeyEvent(type, true, true, window, modifiers.control, modifiers.alt, modifiers.shift,
        modifiers.meta, keyCode);
  } else {
    // `initKeyboardEvent` expects to receive modifiers as a whitespace-delimited string
    // See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyboardEvent
    let modifiersList = '';

    if (modifiers.control) {
      modifiersList += 'Control ';
    }

    if (modifiers.alt) {
      modifiersList += 'Alt ';
    }

    if (modifiers.shift) {
      modifiersList += 'Shift ';
    }

    if (modifiers.meta) {
      modifiersList += 'Meta ';
    }

    event.initKeyboardEvent(type,
        true, /* canBubble */
        true, /* cancelable */
        window, /* view */
        0, /* char */
        key, /* key */
        0, /* location */
        modifiersList.trim(), /* modifiersList */
        false /* repeat */);
  }

  // Webkit Browsers don't set the keyCode when calling the init function.
  // See related bug https://bugs.webkit.org/show_bug.cgi?id=16735
  defineReadonlyEventProperty(event, 'keyCode', keyCode);
  defineReadonlyEventProperty(event, 'key', key);
  defineReadonlyEventProperty(event, 'target', target);
  defineReadonlyEventProperty(event, 'ctrlKey', !!modifiers.control);
  defineReadonlyEventProperty(event, 'altKey', !!modifiers.alt);
  defineReadonlyEventProperty(event, 'shiftKey', !!modifiers.shift);
  defineReadonlyEventProperty(event, 'metaKey', !!modifiers.meta);

  // IE won't set `defaultPrevented` on synthetic events so we need to do it manually.
  event.preventDefault = function() {
    defineReadonlyEventProperty(event, 'defaultPrevented', true);
    return originalPreventDefault.apply(this, arguments);
  };

  return event;
}

/**
 * Creates a fake event object with any desired event type.
 * @docs-private
 */
export function createFakeEvent(type: string, canBubble = false, cancelable = true) {
  const event = document.createEvent('Event');
  event.initEvent(type, canBubble, cancelable);
  return event;
}

/**
 * Defines a readonly property on the given event object. Readonly properties on an event object
 * are always set as configurable as that matches default readonly properties for DOM event objects.
 */
function defineReadonlyEventProperty(event: Event, propertyName: string, value: any) {
  Object.defineProperty(event, propertyName, {get: () => value, configurable: true});
}
