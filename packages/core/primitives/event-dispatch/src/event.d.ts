/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EventHandlerInfo } from './event_handler';
/**
 * Gets a browser event type, if it would differ from the JSAction event type.
 */
export declare function getBrowserEventType(eventType: string): string;
/**
 * Registers the event handler function with the given DOM element for
 * the given event type.
 *
 * @param element The element.
 * @param eventType The event type.
 * @param handler The handler function to install.
 * @param passive A boolean value that, if `true`, indicates that the function
 *     specified by `handler` will never call `preventDefault()`.
 * @return Information needed to uninstall the event handler eventually.
 */
export declare function addEventListener(element: Element, eventType: string, handler: (event: Event) => void, passive?: boolean): EventHandlerInfo;
/**
 * Removes the event handler for the given event from the element.
 * the given event type.
 *
 * @param element The element.
 * @param info The information needed to deregister the handler, as returned by
 *     addEventListener(), above.
 */
export declare function removeEventListener(element: Element, info: EventHandlerInfo): void;
/**
 * Cancels propagation of an event.
 * @param e The event to cancel propagation for.
 */
export declare function stopPropagation(e: Event): void;
/**
 * Prevents the default action of an event.
 * @param e The event to prevent the default action for.
 */
export declare function preventDefault(e: Event): void;
/**
 * Gets the target Element of the event. In Firefox, a text node may appear as
 * the target of the event, in which case we return the parent element of the
 * text node.
 * @param e The event to get the target of.
 * @return The target element.
 */
export declare function getTarget(e: Event): Element;
/**
 * Determines and returns whether the given event (which is assumed
 * to be a click event) is modified. A middle click is considered a modified
 * click to retain the default browser action, which opens a link in a new tab.
 * @param e The event.
 * @return Whether the given event is modified.
 */
export declare function isModifiedClickEvent(e: Event): boolean;
/** Whether we are on WebKit (e.g., Chrome). */
export declare const isWebKit: boolean;
/** Whether we are on IE. */
export declare const isIe: boolean;
/** Whether we are on Gecko (e.g., Firefox). */
export declare const isGecko: boolean;
/**
 * Determines and returns whether the given element is a valid target for
 * keypress/keydown DOM events that act like regular DOM clicks.
 * @param el The element.
 * @return Whether the given element is a valid action key target.
 */
export declare function isValidActionKeyTarget(el: Element): boolean;
/**
 * Determines and returns whether the given event has a target that already
 * has event handlers attached because it is a native HTML control. Used to
 * determine if preventDefault should be called when isActionKeyEvent is true.
 * @param e The event.
 * @return If preventDefault should be called.
 */
export declare function shouldCallPreventDefaultOnNativeHtmlControl(e: Event): boolean;
/**
 * Determines and returns whether the given event acts like a regular DOM click,
 * and should be handled instead of the click.  If this returns true, the caller
 * will call preventDefault() to prevent a possible duplicate event.
 * This is represented by a keypress (keydown on Gecko browsers) on Enter or
 * Space key.
 * @param e The event.
 * @return True, if the event emulates a DOM click.
 */
export declare function isActionKeyEvent(e: Event): boolean;
/** @return True, if the Space key was pressed. */
export declare function isSpaceKeyEvent(e: Event): boolean;
/**
 * Determines whether the event corresponds to a non-bubbling mouse
 * event type (mouseenter, mouseleave, pointerenter, and pointerleave).
 *
 * During mouseover (mouseenter) and pointerover (pointerenter), the
 * relatedTarget is the element being entered from. During mouseout (mouseleave)
 * and pointerout (pointerleave), the relatedTarget is the element being exited
 * to.
 *
 * In both cases, if relatedTarget is outside target, then the corresponding
 * special event has occurred, otherwise it hasn't.
 *
 * @param e The mouseover/mouseout event.
 * @param type The type of the mouse special event.
 * @param element The element on which the jsaction for the
 *     mouseenter/mouseleave event is defined.
 * @return True if the event is a mouseenter/mouseleave event.
 */
export declare function isMouseSpecialEvent(e: Event, type: string, element: Element): boolean;
/**
 * Creates a new EventLike object for a mouseenter/mouseleave event that's
 * derived from the original corresponding mouseover/mouseout event.
 * @param e The event.
 * @param target The element on which the jsaction for the mouseenter/mouseleave
 *     event is defined.
 * @return A modified event-like object copied from the event object passed into
 *     this function.
 */
export declare function createMouseSpecialEvent(e: Event, target: Element): Event;
/**
 * Returns touch data extracted from the touch event: clientX, clientY, screenX
 * and screenY. If the event has no touch information at all, the returned
 * value is null.
 *
 * The fields of this Object are unquoted.
 *
 * @param event A touch event.
 */
export declare function getTouchData(event: TouchEvent): {
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
} | null;
/**
 * Creates a new EventLike object for a "click" event that's derived from the
 * original corresponding "touchend" event for a fast-click implementation.
 *
 * It takes a touch event, adds common fields found in a click event and
 * changes the type to 'click', so that the resulting event looks more like
 * a real click event.
 *
 * @param event A touch event.
 * @return A modified event-like object copied from the event object passed into
 *     this function.
 */
export declare function recreateTouchEventAsClick(event: TouchEvent): MouseEvent;
/**
 * Mapping of HTML element identifiers (ARIA role, type, or tagName) to the
 * keys (enter and/or space) that should activate them. A value of zero means
 * that both should activate them.
 */
export declare const IDENTIFIER_TO_KEY_TRIGGER_MAPPING: {
    [key: string]: number;
};
/**
 * Returns if the given element is a native HTML control.
 * @param el The element.
 * @return If the given element is a native HTML control.
 */
export declare function isNativeHTMLControl(el: Element): boolean;
/** Exported for testing. */
export declare const testing: {
    setIsMac(value: boolean): void;
};
