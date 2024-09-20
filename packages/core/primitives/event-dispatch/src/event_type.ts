/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/*
 * Names of events that are special to jsaction. These are not all
 * event types that are legal to use in either HTML or the addEvent()
 * API, but these are the ones that are treated specially. All other
 * DOM events can be used in either addEvent() or in the value of the
 * jsaction attribute. Beware of browser specific events or events
 * that don't bubble though: If they are not mentioned here, then
 * event contract doesn't work around their peculiarities.
 */
export const EventType = {
  /**
   * Mouse middle click, introduced in Chrome 55 and not yet supported on
   * other browsers.
   */
  AUXCLICK: 'auxclick',

  /**
   * The change event fired by browsers when the `value` attribute of input,
   * select, and textarea elements are changed.
   */
  CHANGE: 'change',

  /**
   * The click event. In addEvent() refers to all click events, in the
   * jsaction attribute it refers to the unmodified click and Enter/Space
   * keypress events.  In the latter case, a jsaction click will be triggered,
   * for accessibility reasons.  See clickmod and clickonly, below.
   */
  CLICK: 'click',

  /**
   * Specifies the jsaction for a modified click event (i.e. a mouse
   * click with the modifier key Cmd/Ctrl pressed). This event isn't
   * separately enabled in addEvent(), because in the DOM, it's just a
   * click event.
   */
  CLICKMOD: 'clickmod',

  /**
   * Specifies the jsaction for a click-only event.  Click-only doesn't take
   * into account the case where an element with focus receives an Enter/Space
   * keypress.  This event isn't separately enabled in addEvent().
   */
  CLICKONLY: 'clickonly',

  /**
   * The dblclick event.
   */
  DBLCLICK: 'dblclick',

  /**
   * Focus doesn't bubble, but you can use it in addEvent() and
   * jsaction anyway. EventContract does the right thing under the
   * hood.
   */
  FOCUS: 'focus',

  /**
   * This event only exists in IE. For addEvent() and jsaction, use
   * focus instead; EventContract does the right thing even though
   * focus doesn't bubble.
   */
  FOCUSIN: 'focusin',

  /**
   * Analog to focus.
   */
  BLUR: 'blur',

  /**
   * Analog to focusin.
   */
  FOCUSOUT: 'focusout',

  /**
   * Submit doesn't bubble, so it cannot be used with event
   * contract. However, the browser helpfully fires a click event on
   * the submit button of a form (even if the form is not submitted by
   * a click on the submit button). So you should handle click on the
   * submit button instead.
   */
  SUBMIT: 'submit',

  /**
   * The keydown event. In addEvent() and non-click jsaction it represents the
   * regular DOM keydown event. It represents click actions in non-Gecko
   * browsers.
   */
  KEYDOWN: 'keydown',

  /**
   * The keypress event. In addEvent() and non-click jsaction it represents the
   * regular DOM keypress event. It represents click actions in Gecko browsers.
   */
  KEYPRESS: 'keypress',

  /**
   * The keyup event. In addEvent() and non-click jsaction it represents the
   * regular DOM keyup event. It represents click actions in non-Gecko
   * browsers.
   */
  KEYUP: 'keyup',

  /**
   * The mouseup event. Can either be used directly or used implicitly to
   * capture mouseup events. In addEvent(), it represents a regular DOM
   * mouseup event.
   */
  MOUSEUP: 'mouseup',

  /**
   * The mousedown event. Can either be used directly or used implicitly to
   * capture mouseenter events. In addEvent(), it represents a regular DOM
   * mouseover event.
   */
  MOUSEDOWN: 'mousedown',

  /**
   * The mouseover event. Can either be used directly or used implicitly to
   * capture mouseenter events. In addEvent(), it represents a regular DOM
   * mouseover event.
   */
  MOUSEOVER: 'mouseover',

  /**
   * The mouseout event. Can either be used directly or used implicitly to
   * capture mouseover events. In addEvent(), it represents a regular DOM
   * mouseout event.
   */
  MOUSEOUT: 'mouseout',

  /**
   * The mouseenter event. Does not bubble and fires individually on each
   * element being entered within a DOM tree.
   */
  MOUSEENTER: 'mouseenter',

  /**
   * The mouseleave event. Does not bubble and fires individually on each
   * element being entered within a DOM tree.
   */
  MOUSELEAVE: 'mouseleave',

  /**
   * The mousemove event.
   */
  MOUSEMOVE: 'mousemove',

  /**
   * The pointerup event. Can either be used directly or used implicitly to
   * capture pointerup events. In addEvent(), it represents a regular DOM
   * pointerup event.
   */
  POINTERUP: 'pointerup',

  /**
   * The pointerdown event. Can either be used directly or used implicitly to
   * capture pointerenter events. In addEvent(), it represents a regular DOM
   * mouseover event.
   */
  POINTERDOWN: 'pointerdown',

  /**
   * The pointerover event. Can either be used directly or used implicitly to
   * capture pointerenter events. In addEvent(), it represents a regular DOM
   * pointerover event.
   */
  POINTEROVER: 'pointerover',

  /**
   * The pointerout event. Can either be used directly or used implicitly to
   * capture pointerover events. In addEvent(), it represents a regular DOM
   * pointerout event.
   */
  POINTEROUT: 'pointerout',

  /**
   * The pointerenter event. Does not bubble and fires individually on each
   * element being entered within a DOM tree.
   */
  POINTERENTER: 'pointerenter',

  /**
   * The pointerleave event. Does not bubble and fires individually on each
   * element being entered within a DOM tree.
   */
  POINTERLEAVE: 'pointerleave',

  /**
   * The pointermove event.
   */
  POINTERMOVE: 'pointermove',

  /**
   * The pointercancel event.
   */
  POINTERCANCEL: 'pointercancel',

  /**
   * The gotpointercapture event is fired when
   * Element.setPointerCapture(pointerId) is called on a mouse input, or
   * implicitly when a touch input begins.
   */
  GOTPOINTERCAPTURE: 'gotpointercapture',

  /**
   * The lostpointercapture event is fired when
   * Element.releasePointerCapture(pointerId) is called, or implicitly after a
   * touch input ends.
   */
  LOSTPOINTERCAPTURE: 'lostpointercapture',

  /**
   * The error event. The error event doesn't bubble, but you can use it in
   * addEvent() and jsaction anyway. EventContract does the right thing under
   * the hood (except in IE8 which does not use error events).
   */
  ERROR: 'error',

  /**
   * The load event. The load event doesn't bubble, but you can use it in
   * addEvent() and jsaction anyway. EventContract does the right thing
   * under the hood.
   */
  LOAD: 'load',

  /**
   * The unload event.
   */
  UNLOAD: 'unload',

  /**
   * The touchstart event. Bubbles, will only ever fire in browsers with
   * touch support.
   */
  TOUCHSTART: 'touchstart',

  /**
   * The touchend event. Bubbles, will only ever fire in browsers with
   * touch support.
   */
  TOUCHEND: 'touchend',

  /**
   * The touchmove event. Bubbles, will only ever fire in browsers with
   * touch support.
   */
  TOUCHMOVE: 'touchmove',

  /**
   * The input event.
   */
  INPUT: 'input',

  /**
   * The scroll event.
   */
  SCROLL: 'scroll',

  /**
   * The toggle event. The toggle event doesn't bubble, but you can use it in
   * addEvent() and jsaction anyway. EventContract does the right thing
   * under the hood.
   */
  TOGGLE: 'toggle',

  /**
   * A custom event. The actual custom event type is declared as the 'type'
   * field in the event details. Supported in Firefox 6+, IE 9+, and all Chrome
   * versions.
   *
   * This is an internal name. Users should use jsaction's fireCustomEvent to
   * fire custom events instead of relying on this type to create them.
   */
  CUSTOM: '_custom',
};

/** All event types that do not bubble or capture and need a polyfill. */
export const MOUSE_SPECIAL_EVENT_TYPES = [
  EventType.MOUSEENTER,
  EventType.MOUSELEAVE,
  'pointerenter',
  'pointerleave',
];

/** All event types that are registered in the bubble phase. */
export const BUBBLE_EVENT_TYPES = [
  EventType.CLICK,
  EventType.DBLCLICK,
  EventType.FOCUSIN,
  EventType.FOCUSOUT,
  EventType.KEYDOWN,
  EventType.KEYUP,
  EventType.KEYPRESS,
  EventType.MOUSEOVER,
  EventType.MOUSEOUT,
  EventType.SUBMIT,
  EventType.TOUCHSTART,
  EventType.TOUCHEND,
  EventType.TOUCHMOVE,
  'touchcancel',

  'auxclick',
  'change',
  'compositionstart',
  'compositionupdate',
  'compositionend',
  'beforeinput',
  'input',
  'select',

  'copy',
  'cut',
  'paste',
  'mousedown',
  'mouseup',
  'wheel',
  'contextmenu',

  'dragover',
  'dragenter',
  'dragleave',
  'drop',
  'dragstart',
  'dragend',

  'pointerdown',
  'pointermove',
  'pointerup',
  'pointercancel',
  'pointerover',
  'pointerout',
  'gotpointercapture',
  'lostpointercapture',

  // Video events.
  'ended',
  'loadedmetadata',

  // Page visibility events.
  'pagehide',
  'pageshow',
  'visibilitychange',

  // Content visibility events.
  'beforematch',
];

/** All event types that are registered in the capture phase. */
export const CAPTURE_EVENT_TYPES = [
  EventType.FOCUS,
  EventType.BLUR,
  EventType.ERROR,
  EventType.LOAD,
  EventType.TOGGLE,
];

/**
 * Whether or not an event type should be registered in the capture phase.
 * @param eventType
 * @returns bool
 */
export const isCaptureEventType = (eventType: string) =>
  CAPTURE_EVENT_TYPES.indexOf(eventType) >= 0;

/** All event types that are registered early.  */
const EARLY_EVENT_TYPES = BUBBLE_EVENT_TYPES.concat(CAPTURE_EVENT_TYPES);

/**
 * Whether or not an event type is registered in the early contract.
 */
export const isEarlyEventType = (eventType: string) => EARLY_EVENT_TYPES.indexOf(eventType) >= 0;
