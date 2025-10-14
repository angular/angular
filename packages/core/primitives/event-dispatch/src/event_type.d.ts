/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare const EventType: {
    /**
     * Mouse middle click, introduced in Chrome 55 and not yet supported on
     * other browsers.
     */
    AUXCLICK: string;
    /**
     * The change event fired by browsers when the `value` attribute of input,
     * select, and textarea elements are changed.
     */
    CHANGE: string;
    /**
     * The click event. In addEvent() refers to all click events, in the
     * jsaction attribute it refers to the unmodified click and Enter/Space
     * keypress events.  In the latter case, a jsaction click will be triggered,
     * for accessibility reasons.  See clickmod and clickonly, below.
     */
    CLICK: string;
    /**
     * Specifies the jsaction for a modified click event (i.e. a mouse
     * click with the modifier key Cmd/Ctrl pressed). This event isn't
     * separately enabled in addEvent(), because in the DOM, it's just a
     * click event.
     */
    CLICKMOD: string;
    /**
     * Specifies the jsaction for a click-only event.  Click-only doesn't take
     * into account the case where an element with focus receives an Enter/Space
     * keypress.  This event isn't separately enabled in addEvent().
     */
    CLICKONLY: string;
    /**
     * The dblclick event.
     */
    DBLCLICK: string;
    /**
     * Focus doesn't bubble, but you can use it in addEvent() and
     * jsaction anyway. EventContract does the right thing under the
     * hood.
     */
    FOCUS: string;
    /**
     * This event only exists in IE. For addEvent() and jsaction, use
     * focus instead; EventContract does the right thing even though
     * focus doesn't bubble.
     */
    FOCUSIN: string;
    /**
     * Analog to focus.
     */
    BLUR: string;
    /**
     * Analog to focusin.
     */
    FOCUSOUT: string;
    /**
     * Submit doesn't bubble, so it cannot be used with event
     * contract. However, the browser helpfully fires a click event on
     * the submit button of a form (even if the form is not submitted by
     * a click on the submit button). So you should handle click on the
     * submit button instead.
     */
    SUBMIT: string;
    /**
     * The keydown event. In addEvent() and non-click jsaction it represents the
     * regular DOM keydown event. It represents click actions in non-Gecko
     * browsers.
     */
    KEYDOWN: string;
    /**
     * The keypress event. In addEvent() and non-click jsaction it represents the
     * regular DOM keypress event. It represents click actions in Gecko browsers.
     */
    KEYPRESS: string;
    /**
     * The keyup event. In addEvent() and non-click jsaction it represents the
     * regular DOM keyup event. It represents click actions in non-Gecko
     * browsers.
     */
    KEYUP: string;
    /**
     * The mouseup event. Can either be used directly or used implicitly to
     * capture mouseup events. In addEvent(), it represents a regular DOM
     * mouseup event.
     */
    MOUSEUP: string;
    /**
     * The mousedown event. Can either be used directly or used implicitly to
     * capture mouseenter events. In addEvent(), it represents a regular DOM
     * mouseover event.
     */
    MOUSEDOWN: string;
    /**
     * The mouseover event. Can either be used directly or used implicitly to
     * capture mouseenter events. In addEvent(), it represents a regular DOM
     * mouseover event.
     */
    MOUSEOVER: string;
    /**
     * The mouseout event. Can either be used directly or used implicitly to
     * capture mouseover events. In addEvent(), it represents a regular DOM
     * mouseout event.
     */
    MOUSEOUT: string;
    /**
     * The mouseenter event. Does not bubble and fires individually on each
     * element being entered within a DOM tree.
     */
    MOUSEENTER: string;
    /**
     * The mouseleave event. Does not bubble and fires individually on each
     * element being entered within a DOM tree.
     */
    MOUSELEAVE: string;
    /**
     * The mousemove event.
     */
    MOUSEMOVE: string;
    /**
     * The pointerup event. Can either be used directly or used implicitly to
     * capture pointerup events. In addEvent(), it represents a regular DOM
     * pointerup event.
     */
    POINTERUP: string;
    /**
     * The pointerdown event. Can either be used directly or used implicitly to
     * capture pointerenter events. In addEvent(), it represents a regular DOM
     * mouseover event.
     */
    POINTERDOWN: string;
    /**
     * The pointerover event. Can either be used directly or used implicitly to
     * capture pointerenter events. In addEvent(), it represents a regular DOM
     * pointerover event.
     */
    POINTEROVER: string;
    /**
     * The pointerout event. Can either be used directly or used implicitly to
     * capture pointerover events. In addEvent(), it represents a regular DOM
     * pointerout event.
     */
    POINTEROUT: string;
    /**
     * The pointerenter event. Does not bubble and fires individually on each
     * element being entered within a DOM tree.
     */
    POINTERENTER: string;
    /**
     * The pointerleave event. Does not bubble and fires individually on each
     * element being entered within a DOM tree.
     */
    POINTERLEAVE: string;
    /**
     * The pointermove event.
     */
    POINTERMOVE: string;
    /**
     * The pointercancel event.
     */
    POINTERCANCEL: string;
    /**
     * The gotpointercapture event is fired when
     * Element.setPointerCapture(pointerId) is called on a mouse input, or
     * implicitly when a touch input begins.
     */
    GOTPOINTERCAPTURE: string;
    /**
     * The lostpointercapture event is fired when
     * Element.releasePointerCapture(pointerId) is called, or implicitly after a
     * touch input ends.
     */
    LOSTPOINTERCAPTURE: string;
    /**
     * The error event. The error event doesn't bubble, but you can use it in
     * addEvent() and jsaction anyway. EventContract does the right thing under
     * the hood (except in IE8 which does not use error events).
     */
    ERROR: string;
    /**
     * The load event. The load event doesn't bubble, but you can use it in
     * addEvent() and jsaction anyway. EventContract does the right thing
     * under the hood.
     */
    LOAD: string;
    /**
     * The unload event.
     */
    UNLOAD: string;
    /**
     * The touchstart event. Bubbles, will only ever fire in browsers with
     * touch support.
     */
    TOUCHSTART: string;
    /**
     * The touchend event. Bubbles, will only ever fire in browsers with
     * touch support.
     */
    TOUCHEND: string;
    /**
     * The touchmove event. Bubbles, will only ever fire in browsers with
     * touch support.
     */
    TOUCHMOVE: string;
    /**
     * The input event.
     */
    INPUT: string;
    /**
     * The scroll event.
     */
    SCROLL: string;
    /**
     * The toggle event. The toggle event doesn't bubble, but you can use it in
     * addEvent() and jsaction anyway. EventContract does the right thing
     * under the hood.
     */
    TOGGLE: string;
    /**
     * A custom event. The actual custom event type is declared as the 'type'
     * field in the event details. Supported in Firefox 6+, IE 9+, and all Chrome
     * versions.
     *
     * This is an internal name. Users should use jsaction's fireCustomEvent to
     * fire custom events instead of relying on this type to create them.
     */
    CUSTOM: string;
};
/** All event types that do not bubble or capture and need a polyfill. */
export declare const MOUSE_SPECIAL_EVENT_TYPES: string[];
/** All event types that are registered in the bubble phase. */
export declare const BUBBLE_EVENT_TYPES: string[];
/** All event types that are registered in the capture phase. */
export declare const CAPTURE_EVENT_TYPES: string[];
/**
 * Whether or not an event type should be registered in the capture phase.
 * @param eventType
 * @returns bool
 */
export declare const isCaptureEventType: (eventType: string) => boolean;
/**
 * Whether or not an event type is registered in the early contract.
 */
export declare const isEarlyEventType: (eventType: string) => boolean;
