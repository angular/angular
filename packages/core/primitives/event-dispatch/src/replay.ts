/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview Functions for replaying events by the jsaction
 * Dispatcher.
 * All ts-ignores in this file are due to APIs that are no longer in the browser.
 */

import {createCustomEvent} from './/custom_events';
import * as jsactionEvent from './/event';
import {EventType} from './/event_type';

type Writeable<T> = {
  -readonly[P in keyof T]: T[P]
};

/**
 * Replays an event.
 */
export function replayEvent(
    event: Event,
    targetElement: Element,
    eventType?: string,
) {
  triggerEvent(targetElement, createEvent(event, eventType));
}

/**
 * Checks if a given event was triggered by the keyboard.
 * @param eventType The event type.
 * @return Whether it's a keyboard event.
 */
function isKeyboardEvent(eventType: string): boolean {
  return (
      eventType === EventType.KEYPRESS || eventType === EventType.KEYDOWN ||
      eventType === EventType.KEYUP);
}

/**
 * Checks if a given event was triggered by the mouse.
 * @param eventType The event type.
 * @return Whether it's a mouse event.
 */
function isMouseEvent(eventType: string): boolean {
  // TODO: Verify if Drag events should be bound here.
  return (
      eventType === EventType.CLICK || eventType === EventType.DBLCLICK ||
      eventType === EventType.MOUSEDOWN || eventType === EventType.MOUSEOVER ||
      eventType === EventType.MOUSEOUT || eventType === EventType.MOUSEMOVE);
}

/**
 * Checks if a given event is a general UI event.
 * @param eventType The event type.
 * @return Whether it's a focus event.
 */
function isUiEvent(eventType: string): boolean {
  // Almost nobody supports the W3C method of creating FocusEvents.
  // For now, we're going to use the UIEvent as a super-interface.
  return (
      eventType === EventType.FOCUS || eventType === EventType.BLUR ||
      eventType === EventType.FOCUSIN || eventType === EventType.FOCUSOUT ||
      eventType === EventType.SCROLL);
}

/**
 * Create a whitespace-delineated list of modifier keys that should be
 * considered to be active on the event's key. See details at
 * https://developer.mozilla.org/en/DOM/KeyboardEvent.
 * @param alt Alt pressed.
 * @param ctrl Control pressed.
 * @param meta Command pressed (OSX only).
 * @param shift Shift pressed.
 * @return The constructed modifier keys string.
 */
function createKeyboardModifiersList(
    alt: boolean,
    ctrl: boolean,
    meta: boolean,
    shift: boolean,
    ): string {
  const keys = [];
  if (alt) {
    keys.push('Alt');
  }
  if (ctrl) {
    keys.push('Control');
  }
  if (meta) {
    keys.push('Meta');
  }
  if (shift) {
    keys.push('Shift');
  }
  return keys.join(' ');
}

/**
 * Creates a UI event object for replaying through the DOM.
 * @param original The event to create a new event from.
 * @param opt_eventType The type this event is being handled as by jsaction.
 *     e.g. blur events are handled as focusout
 * @return The event object.
 */
export function createUiEvent(original: Event, opt_eventType?: string): Event {
  let event: Writeable<UIEvent>&{originalTimestamp?: DOMHighResTimeStamp};
  if (document.createEvent) {
    const originalUiEvent = original as UIEvent;
    // Event creation as per W3C event model specification.  This codepath
    // is used by most non-IE browsers and also by IE 9 and later.
    event = document.createEvent('UIEvent');
    // On IE and Opera < 12, we must provide non-undefined values to
    // initEvent, otherwise it will fail.
    event.initUIEvent(
        opt_eventType || originalUiEvent.type,
        originalUiEvent.bubbles !== undefined ? originalUiEvent.bubbles : true,
        originalUiEvent.cancelable || false,
        originalUiEvent.view || window,
        (original as CustomEvent).detail || 0,
    );
    // detail
  } else {
    // Older versions of IE (up to version 8) do not support the
    // W3C event model. Use the IE specific function instead.
    // Suppressing errors for ts-migration.
    //   TS2339: Property 'createEventObject' does not exist on type 'Document'.
    // @ts-ignore
    event = document.createEventObject();
    event.type = opt_eventType || original.type;
    event.bubbles = original.bubbles !== undefined ? original.bubbles : true;
    event.cancelable = original.cancelable || false;
    event.view = (original as Writeable<UIEvent>).view || window;
    event.detail = (original as CustomEvent).detail || 0;
  }
  // Some focus events also have a nullable relatedTarget value which isn't
  // directly supported in the initUIEvent() method.
  (event as Writeable<FocusEvent>).relatedTarget = (original as FocusEvent).relatedTarget || null;
  event.originalTimestamp = original.timeStamp;
  return event;
}

/**
 * Creates a keyboard event object for replaying through the DOM.
 * @param original The event to create a new event from.
 * @param opt_eventType The type this event is being handled as by jsaction.
 *     E.g. a keypress is handled as click in some cases.
 * @return The event object.
 * @suppress {strictMissingProperties} Two definitions of initKeyboardEvent.
 */
export function createKeyboardEvent(
    original: Event,
    opt_eventType?: string,
    ): Event {
  let event;
  const keyboardEvent = original as KeyboardEvent;
  if (document.createEvent) {
    // Event creation as per W3C event model specification.  This codepath
    // is used by most non-IE browsers and also by IE 9 and later.
    event = document.createEvent('KeyboardEvent');
    if (event.initKeyboardEvent) {
      if (jsactionEvent.isIe) {
        // IE9+
        // https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ff975945(v=vs.85)
        const modifiers = createKeyboardModifiersList(
            keyboardEvent.altKey,
            keyboardEvent.ctrlKey,
            keyboardEvent.metaKey,
            keyboardEvent.shiftKey,
        );
        event.initKeyboardEvent(
            opt_eventType || keyboardEvent.type,
            true,
            true,
            window,
            keyboardEvent.key,
            keyboardEvent.location,
            // Suppressing errors for ts-migration.
            //   TS2345: Argument of type 'string' is not assignable to
            //   parameter of type 'boolean | undefined'.
            // @ts-ignore
            modifiers,
            keyboardEvent.repeat,
            // @ts-ignore This doesn't exist
            keyboardEvent.locale,
        );
      } else {
        // W3C DOM Level 3 Events model.
        // https://www.w3.org/TR/uievents/#idl-interface-KeyboardEvent-initializers
        event.initKeyboardEvent(
            opt_eventType || original.type,
            true,
            true,
            window,
            keyboardEvent.key,
            keyboardEvent.location,
            keyboardEvent.ctrlKey,
            keyboardEvent.altKey,
            keyboardEvent.shiftKey,
            keyboardEvent.metaKey,
        );
        Object.defineProperty(event, 'repeat', {
          get: () => (original as KeyboardEvent).repeat,
          enumerable: true,
        });
        // Add missing 'locale' which is not part of the spec.
        // https://bugs.chromium.org/p/chromium/issues/detail?id=168971
        Object.defineProperty(event, 'locale', {
          // Suppressing errors for ts-migration.
          //   TS2339: Property 'locale' does not exist on type 'Event'.
          // @ts-ignore
          get: () => (original.locale),
          enumerable: true,
        });
        // Apple WebKit has a non-standard altGraphKey that is not implemented
        // here.
        // https://developer.apple.com/documentation/webkitjs/keyboardevent/1633753-initkeyboardevent
      }
      // Blink and Webkit had a bug that causes the `charCode`, `keyCode`, and
      // `which` properties to always be unset when synthesizing a keyboard
      // event. Details at: https://bugs.webkit.org/show_bug.cgi?id=16735. With
      // these properties being deprecated, the bug has evolved into affecting
      // the `key` property. We work around it by redefining the `key` and
      // deprecated properties; a simple assignment here would fail because the
      // native properties are readonly.
      if (jsactionEvent.isWebKit) {
        if (keyboardEvent.key && event.key === '') {
          Object.defineProperty(event, 'key', {
            get: () => keyboardEvent.key,
            enumerable: true,
          });
        }
      }
      // Re-implement the deprecated `charCode`, `keyCode` and `which` which
      // are also an issue on IE9+.
      if (jsactionEvent.isWebKit || jsactionEvent.isIe || jsactionEvent.isGecko) {
        Object.defineProperty(event, 'charCode', {
          get: () => (original as KeyboardEvent).charCode,
          enumerable: true,
        });
        const keyCodeGetter = () => (original as KeyboardEvent).keyCode;
        Object.defineProperty(event, 'keyCode', {
          get: keyCodeGetter,
          enumerable: true,
        });
        Object.defineProperty(event, 'which', {
          get: keyCodeGetter,
          enumerable: true,
        });
      }
    } else {
      // Gecko only supports an older/deprecated version from DOM Level 2. See
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyEvent
      // for details.
      // @ts-ignore ditto
      event.initKeyEvent(
          opt_eventType || original.type,
          true,
          true,
          window,
          // Suppressing errors for ts-migration.
          //   TS2339: Property 'ctrlKey' does not exist on type 'Event'.
          // @ts-ignore
          original.ctrlKey,
          // Suppressing errors for ts-migration.
          //   TS2339: Property 'altKey' does not exist on type 'Event'.
          // @ts-ignore
          original.altKey,
          // Suppressing errors for ts-migration.
          //   TS2339: Property 'shiftKey' does not exist on type 'Event'.
          // @ts-ignore
          original.shiftKey,
          // Suppressing errors for ts-migration.
          //   TS2339: Property 'metaKey' does not exist on type 'Event'.
          // @ts-ignore
          original.metaKey,
          // Suppressing errors for ts-migration.
          //   TS2339: Property 'keyCode' does not exist on type 'Event'.
          // @ts-ignore
          original.keyCode,
          // Suppressing errors for ts-migration.
          //   TS2339: Property 'charCode' does not exist on type 'Event'.
          // @ts-ignore
          original.charCode,
      );
    }
  } else {
    // Older versions of IE (up to version 8) do not support the
    // W3C event model. Use the IE specific function instead.
    // Suppressing errors for ts-migration.
    // @ts-ignore
    event = document.createEventObject();
    event.type = opt_eventType || original.type;
    const originalKeyboardEvent = original as KeyboardEvent;
    event.repeat = originalKeyboardEvent.repeat;
    event.ctrlKey = originalKeyboardEvent.ctrlKey;
    event.altKey = originalKeyboardEvent.altKey;
    event.shiftKey = originalKeyboardEvent.shiftKey;
    event.metaKey = originalKeyboardEvent.metaKey;
    event.key = originalKeyboardEvent.key;
    event.keyCode = originalKeyboardEvent.keyCode;
    event.charCode = originalKeyboardEvent.charCode;
  }
  event.originalTimestamp = original.timeStamp;
  return event;
}

/**
 * Creates a mouse event object for replaying through the DOM.
 * @param original The event to create a new event from.
 * @param opt_eventType The type this event is being handled as by jsaction.
 *     E.g. a keypress is handled as click in some cases.
 * @return The event object.
 */
export function createMouseEvent(
    original: Event,
    opt_eventType?: string,
    ): MouseEvent {
  let event;
  const originalMouseEvent = original as MouseEvent;
  if (document.createEvent) {
    // Event creation as per W3C event model specification.  This codepath
    // is used by most non-IE browsers and also by IE 9 and later.
    event = document.createEvent('MouseEvent');
    // On IE and Opera < 12, we must provide non-undefined values to
    // initMouseEvent, otherwise it will fail.
    event.initMouseEvent(
        opt_eventType || original.type,
        true,  // canBubble
        true,  // cancelable
        window,
        (original as CustomEvent).detail || 1,
        originalMouseEvent.screenX || 0,
        originalMouseEvent.screenY || 0,
        originalMouseEvent.clientX || 0,
        originalMouseEvent.clientY || 0,
        originalMouseEvent.ctrlKey || false,
        originalMouseEvent.altKey || false,
        originalMouseEvent.shiftKey || false,
        originalMouseEvent.metaKey || false,
        originalMouseEvent.button || 0,
        originalMouseEvent.relatedTarget || null,
    );
  } else {
    // Older versions of IE (up to version 8) do not support the
    // W3C event model. Use the IE specific function instead.
    // @ts-ignore
    event = document.createEventObject();
    event.type = opt_eventType || original.type;
    event.clientX = originalMouseEvent.clientX;
    event.clientY = originalMouseEvent.clientY;
    event.button = originalMouseEvent.button;
    event.detail = (original as CustomEvent).detail;
    event.ctrlKey = originalMouseEvent.ctrlKey;
    event.altKey = originalMouseEvent.altKey;
    event.shiftKey = originalMouseEvent.shiftKey;
    event.metaKey = originalMouseEvent.metaKey;
  }
  event.originalTimestamp = original.timeStamp;
  return event;
}

/**
 * Creates a generic event object for replaying through the DOM.
 * @param original The event to create a new event from.
 * @param opt_eventType The type this event is being handled as by jsaction.
 *     E.g. a keypress is handled as click in some cases.
 * @return The event object.
 */
function createGenericEvent(original: Event, opt_eventType?: string): Event {
  let event;
  if (document.createEvent) {
    // Event creation as per W3C event model specification.  This codepath
    // is used by most non-IE browsers and also by IE 9 and later.
    event = document.createEvent('Event');
    event.initEvent(opt_eventType || original.type, true, true);
  } else {
    // Older versions of IE (up to version 8) do not support the
    // W3C event model. Use the IE specific function instead.
    // Suppressing errors for ts-migration.
    //   TS2339: Property 'createEventObject' does not exist on type 'Document'.
    // @ts-ignore
    event = document.createEventObject();
    event.type = opt_eventType || original.type;
  }
  event.originalTimestamp = original.timeStamp;
  return event;
}

/**
 * Creates an event object for replaying through the DOM.
 * NOTE: This function is visible just for testing.  Please don't use
 * it outside JsAction internal testing.
 * TODO: Add support for FocusEvent and WheelEvent.
 * @param base The event to create a new event from.
 * @param opt_eventType The type this event is being handled as by jsaction.
 *     E.g. a keypress is handled as click in some cases.
 * @return The event object.
 */
export function createEvent(base: unknown, opt_eventType?: string): Event {
  const original = base as Event;
  let event;
  let eventType;
  if (original.type === EventType.CUSTOM) {
    eventType = EventType.CUSTOM;
  } else {
    eventType = opt_eventType || original.type;
  }

  if (isKeyboardEvent(eventType)) {
    event = createKeyboardEvent(original, opt_eventType);
  } else if (isMouseEvent(eventType)) {
    event = createMouseEvent(original, opt_eventType);
  } else if (isUiEvent(eventType)) {
    event = createUiEvent(original, opt_eventType);
  } else if (eventType === EventType.CUSTOM) {
    event = createCustomEvent(
        opt_eventType!,
        (original as CustomEvent)['detail']['data'],
        (original as CustomEvent)['detail']['triggeringEvent'],
    );
    (event as {originalTimestamp?: number | null} | null)!.originalTimestamp = original.timeStamp;
  } else {
    // This ensures we don't send an undefined event object to the replayer.
    event = createGenericEvent(original, opt_eventType);
  }
  return event;
}

/**
 * Sends an event for replay to the DOM.
 * @param target The target for the event.
 * @param event The event object.
 * @return The return value of the event replay, i.e., whether preventDefault()
 *     was called on it.
 */
export function triggerEvent(target: EventTarget, event: Event): boolean {
  if (target.dispatchEvent) {
    return target.dispatchEvent(event);
  } else {
    // Suppressing errors for ts-migration.
    //   TS2339: Property 'fireEvent' does not exist on type 'Element'.
    // @ts-ignore
    return (target as Element).fireEvent('on' + event.type, event);
  }
}

/** Do not use outiside of testing. */
export const testing = {
  createKeyboardModifiersList,
  createGenericEvent,
  isKeyboardEvent,
  isMouseEvent,
  isUiEvent,
};
