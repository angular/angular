/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EventHandlerInfo} from './event_handler';
import {isCaptureEventType, EventType} from './event_type';
import {KeyCode} from './key_code';

/**
 * Gets a browser event type, if it would differ from the JSAction event type.
 */
export function getBrowserEventType(eventType: string) {
  // Mouseenter and mouseleave events are not handled directly because they
  // are not available everywhere. In browsers where they are available, they
  // don't bubble and aren't visible at the container boundary. Instead, we
  // synthesize the mouseenter and mouseleave events from mouseover and
  // mouseout events, respectively. Cf. eventcontract.js.
  if (eventType === EventType.MOUSEENTER) {
    return EventType.MOUSEOVER;
  } else if (eventType === EventType.MOUSELEAVE) {
    return EventType.MOUSEOUT;
  } else if (eventType === EventType.POINTERENTER) {
    return EventType.POINTEROVER;
  } else if (eventType === EventType.POINTERLEAVE) {
    return EventType.POINTEROUT;
  }
  return eventType;
}

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
export function addEventListener(
  element: Element,
  eventType: string,
  handler: (event: Event) => void,
  passive?: boolean,
): EventHandlerInfo {
  // All event handlers are registered in the bubbling
  // phase.
  //
  // All browsers support focus and blur, but these events only are propagated
  // in the capture phase. Very legacy browsers do not support focusin or
  // focusout.
  //
  // It would be a bad idea to register all event handlers in the
  // capture phase because then regular onclick handlers would not be
  // executed at all on events that trigger a jsaction. That's not
  // entirely what we want, at least for now.
  //
  // Error and load events (i.e. on images) do not bubble so they are also
  // handled in the capture phase.
  let capture = false;

  if (isCaptureEventType(eventType)) {
    capture = true;
  }

  const options = typeof passive === 'boolean' ? {capture, passive} : capture;
  element.addEventListener(eventType, handler, options);

  return {eventType, handler, capture, passive};
}

/**
 * Removes the event handler for the given event from the element.
 * the given event type.
 *
 * @param element The element.
 * @param info The information needed to deregister the handler, as returned by
 *     addEventListener(), above.
 */
export function removeEventListener(element: Element, info: EventHandlerInfo) {
  if (element.removeEventListener) {
    // It's worth noting that some browser releases have been inconsistent on this, and unless
    // you have specific reasons otherwise, it's probably wise to use the same values used for
    // the call to addEventListener() when calling removeEventListener().
    const options = typeof info.passive === 'boolean' ? {capture: info.capture} : info.capture;
    element.removeEventListener(info.eventType, info.handler as EventListener, options);
    // `detachEvent` is an old DOM API.
  } else if ((element as any).detachEvent) {
    // `detachEvent` is an old DOM API.
    (element as any).detachEvent(`on${info.eventType}`, info.handler);
  }
}

/**
 * Cancels propagation of an event.
 * @param e The event to cancel propagation for.
 */
export function stopPropagation(e: Event) {
  e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
}

/**
 * Prevents the default action of an event.
 * @param e The event to prevent the default action for.
 */
export function preventDefault(e: Event) {
  e.preventDefault ? e.preventDefault() : (e.returnValue = false);
}

/**
 * Gets the target Element of the event. In Firefox, a text node may appear as
 * the target of the event, in which case we return the parent element of the
 * text node.
 * @param e The event to get the target of.
 * @return The target element.
 */
export function getTarget(e: Event): Element {
  let el = e.target as Element;

  // In Firefox, the event may have a text node as its target. We always
  // want the parent Element the text node belongs to, however.
  if (!el.getAttribute && el.parentNode) {
    el = el.parentNode as Element;
  }

  return el;
}

/**
 * Whether we are on a Mac. Not pulling in useragent just for this.
 */
let isMac: boolean = typeof navigator !== 'undefined' && /Macintosh/.test(navigator.userAgent);

/**
 * Determines and returns whether the given event (which is assumed to be a
 * click event) is a middle click.
 * NOTE: There is not a consistent way to identify middle click
 * http://www.unixpapa.com/js/mouse.html
 */
function isMiddleClick(e: Event): boolean {
  return (
    // `which` is an old DOM API.
    (e as any).which === 2 ||
    // `which` is an old DOM API.
    ((e as any).which == null &&
      // `button` is an old DOM API.
      (e as any).button === 4) // middle click for IE
  );
}

/**
 * Determines and returns whether the given event (which is assumed
 * to be a click event) is modified. A middle click is considered a modified
 * click to retain the default browser action, which opens a link in a new tab.
 * @param e The event.
 * @return Whether the given event is modified.
 */
export function isModifiedClickEvent(e: Event): boolean {
  return (
    // `metaKey` is an old DOM API.
    (isMac && (e as any).metaKey) ||
    // `ctrlKey` is an old DOM API.
    (!isMac && (e as any).ctrlKey) ||
    isMiddleClick(e) ||
    // `shiftKey` is an old DOM API.
    (e as any).shiftKey
  );
}

/** Whether we are on WebKit (e.g., Chrome). */
export const isWebKit: boolean =
  typeof navigator !== 'undefined' &&
  !/Opera/.test(navigator.userAgent) &&
  /WebKit/.test(navigator.userAgent);

/** Whether we are on IE. */
export const isIe: boolean =
  typeof navigator !== 'undefined' &&
  (/MSIE/.test(navigator.userAgent) || /Trident/.test(navigator.userAgent));

/** Whether we are on Gecko (e.g., Firefox). */
export const isGecko: boolean =
  typeof navigator !== 'undefined' &&
  !/Opera|WebKit/.test(navigator.userAgent) &&
  /Gecko/.test(navigator.product);

/**
 * Determines and returns whether the given element is a valid target for
 * keypress/keydown DOM events that act like regular DOM clicks.
 * @param el The element.
 * @return Whether the given element is a valid action key target.
 */
export function isValidActionKeyTarget(el: Element): boolean {
  if (!('getAttribute' in el)) {
    return false;
  }
  if (isTextControl(el)) {
    return false;
  }
  if (isNativelyActivatable(el)) {
    return false;
  }
  // `isContentEditable` is an old DOM API.
  if ((el as any).isContentEditable) {
    return false;
  }

  return true;
}

/**
 * Whether an event has a modifier key activated.
 * @param e The event.
 * @return True, if a modifier key is activated.
 */
function hasModifierKey(e: Event): boolean {
  return (
    // `ctrlKey` is an old DOM API.
    (e as any).ctrlKey ||
    // `shiftKey` is an old DOM API.
    (e as any).shiftKey ||
    // `altKey` is an old DOM API.
    (e as any).altKey ||
    // `metaKey` is an old DOM API.
    (e as any).metaKey
  );
}

/**
 * Determines and returns whether the given event has a target that already
 * has event handlers attached because it is a native HTML control. Used to
 * determine if preventDefault should be called when isActionKeyEvent is true.
 * @param e The event.
 * @return If preventDefault should be called.
 */
export function shouldCallPreventDefaultOnNativeHtmlControl(e: Event): boolean {
  const el = getTarget(e);
  const tagName = el.tagName.toUpperCase();
  const role = (el.getAttribute('role') || '').toUpperCase();

  if (tagName === 'BUTTON' || role === 'BUTTON') {
    return true;
  }
  if (!isNativeHTMLControl(el)) {
    return false;
  }
  if (tagName === 'A') {
    return false;
  }
  /**
   * Fix for physical d-pads on feature phone platforms; the native event
   * (ie. isTrusted: true) needs to fire to show the OPTION list. See
   * b/135288469 for more info.
   */
  if (tagName === 'SELECT') {
    return false;
  }
  if (processSpace(el)) {
    return false;
  }
  if (isTextControl(el)) {
    return false;
  }
  return true;
}

/**
 * Determines and returns whether the given event acts like a regular DOM click,
 * and should be handled instead of the click.  If this returns true, the caller
 * will call preventDefault() to prevent a possible duplicate event.
 * This is represented by a keypress (keydown on Gecko browsers) on Enter or
 * Space key.
 * @param e The event.
 * @return True, if the event emulates a DOM click.
 */
export function isActionKeyEvent(e: Event): boolean {
  let key =
    // `which` is an old DOM API.
    (e as any).which ||
    // `keyCode` is an old DOM API.
    (e as any).keyCode;
  if (!key && (e as KeyboardEvent).key) {
    key = ACTION_KEY_TO_KEYCODE[(e as KeyboardEvent).key];
  }
  if (isWebKit && key === KeyCode.MAC_ENTER) {
    key = KeyCode.ENTER;
  }
  if (key !== KeyCode.ENTER && key !== KeyCode.SPACE) {
    return false;
  }
  const el = getTarget(e);
  if (e.type !== EventType.KEYDOWN || !isValidActionKeyTarget(el) || hasModifierKey(e)) {
    return false;
  }

  // For <input type="checkbox">, we must only handle the browser's native click
  // event, so that the browser can toggle the checkbox.
  if (processSpace(el) && key === KeyCode.SPACE) {
    return false;
  }

  // If this element is non-focusable, ignore stray keystrokes (b/18337209)
  // Sscreen readers can move without tab focus, so any tabIndex is focusable.
  // See B/21809604
  if (!isFocusable(el)) {
    return false;
  }

  const type = (
    el.getAttribute('role') ||
    (el as HTMLInputElement).type ||
    el.tagName
  ).toUpperCase();
  const isSpecificTriggerKey = IDENTIFIER_TO_KEY_TRIGGER_MAPPING[type] % key === 0;
  const isDefaultTriggerKey = !(type in IDENTIFIER_TO_KEY_TRIGGER_MAPPING) && key === KeyCode.ENTER;
  const hasType = el.tagName.toUpperCase() !== 'INPUT' || !!(el as HTMLInputElement).type;
  return (isSpecificTriggerKey || isDefaultTriggerKey) && hasType;
}

/**
 * Checks whether a DOM element can receive keyboard focus.
 * This code is based on goog.dom.isFocusable, but simplified since we shouldn't
 * care about visibility if we're already handling a keyboard event.
 */
function isFocusable(el: Element): boolean {
  return (
    (el.tagName in NATIVELY_FOCUSABLE_ELEMENTS || hasSpecifiedTabIndex(el)) &&
    !(el as HTMLInputElement).disabled
  );
}

/**
 * @param element Element to check.
 * @return Whether the element has a specified tab index.
 */
function hasSpecifiedTabIndex(element: Element): boolean {
  // IE returns 0 for an unset tabIndex, so we must use getAttributeNode(),
  // which returns an object with a 'specified' property if tabIndex is
  // specified.  This works on other browsers, too.
  const attrNode = element.getAttributeNode('tabindex'); // Must be lowercase!
  return attrNode != null && attrNode.specified;
}

/** Element tagnames that are focusable by default. */
const NATIVELY_FOCUSABLE_ELEMENTS: {[key: string]: number} = {
  'A': 1,
  'INPUT': 1,
  'TEXTAREA': 1,
  'SELECT': 1,
  'BUTTON': 1,
};

/** @return True, if the Space key was pressed. */
export function isSpaceKeyEvent(e: Event): boolean {
  const key =
    // `which` is an old DOM API.
    (e as any).which ||
    // `keyCode` is an old DOM API.
    (e as any).keyCode;
  const el = getTarget(e);
  const elementName = ((el as HTMLInputElement).type || el.tagName).toUpperCase();
  return key === KeyCode.SPACE && elementName !== 'CHECKBOX';
}

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
export function isMouseSpecialEvent(e: Event, type: string, element: Element): boolean {
  // `relatedTarget` is an old DOM API.
  const related = (e as any).relatedTarget as Node;

  return (
    ((e.type === EventType.MOUSEOVER && type === EventType.MOUSEENTER) ||
      (e.type === EventType.MOUSEOUT && type === EventType.MOUSELEAVE) ||
      (e.type === EventType.POINTEROVER && type === EventType.POINTERENTER) ||
      (e.type === EventType.POINTEROUT && type === EventType.POINTERLEAVE)) &&
    (!related || (related !== element && !element.contains(related)))
  );
}

/**
 * Creates a new EventLike object for a mouseenter/mouseleave event that's
 * derived from the original corresponding mouseover/mouseout event.
 * @param e The event.
 * @param target The element on which the jsaction for the mouseenter/mouseleave
 *     event is defined.
 * @return A modified event-like object copied from the event object passed into
 *     this function.
 */
export function createMouseSpecialEvent(e: Event, target: Element): Event {
  // We have to create a copy of the event object because we need to mutate
  // its fields. We do this for the special mouse events because the event
  // target needs to be retargeted to the action element rather than the real
  // element (since we are simulating the special mouse events with mouseover/
  // mouseout).
  //
  // Since we're making a copy anyways, we might as well attempt to convert
  // this event into a pseudo-real mouseenter/mouseleave event by adjusting
  // its type.
  //
  const copy: {-readonly [P in keyof Event]?: Event[P]} & {'_originalEvent'?: Event} = {};
  for (const property in e) {
    if (property === 'srcElement' || property === 'target') {
      continue;
    }
    const key = property as keyof Event;
    // Making a copy requires iterating through all properties of `Event`.
    const value = e[key];
    if (typeof value === 'function') {
      continue;
    }
    // Value should be the expected type, but the value of `key` is not known
    // statically.
    copy[key] = value as any;
  }
  if (e.type === EventType.MOUSEOVER) {
    copy['type'] = EventType.MOUSEENTER;
  } else if (e.type === EventType.MOUSEOUT) {
    copy['type'] = EventType.MOUSELEAVE;
  } else if (e.type === EventType.POINTEROVER) {
    copy['type'] = EventType.POINTERENTER;
  } else {
    copy['type'] = EventType.POINTERLEAVE;
  }
  copy['target'] = copy['srcElement'] = target;
  copy['bubbles'] = false;
  copy['_originalEvent'] = e;
  return copy as Event;
}

/**
 * Returns touch data extracted from the touch event: clientX, clientY, screenX
 * and screenY. If the event has no touch information at all, the returned
 * value is null.
 *
 * The fields of this Object are unquoted.
 *
 * @param event A touch event.
 */
export function getTouchData(
  event: TouchEvent,
): {clientX: number; clientY: number; screenX: number; screenY: number} | null {
  const touch =
    (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]);
  if (!touch) {
    return null;
  }
  return {
    clientX: touch.clientX,
    clientY: touch.clientY,
    screenX: touch.screenX,
    screenY: touch.screenY,
  };
}

declare interface SyntheticMouseEvent extends Event {
  // Redeclared from Event to indicate that it is not readonly.
  defaultPrevented: boolean;
  originalEventType: string;
  _propagationStopped?: boolean;
}

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
export function recreateTouchEventAsClick(event: TouchEvent): MouseEvent {
  const click: {-readonly [P in keyof MouseEvent]?: MouseEvent[P]} & Partial<SyntheticMouseEvent> =
    {};
  click['originalEventType'] = event.type;
  click['type'] = EventType.CLICK;
  for (const property in event) {
    if (property === 'type' || property === 'srcElement') {
      continue;
    }
    const key = property as keyof TouchEvent;
    // Making a copy requires iterating through all properties of `TouchEvent`.
    const value = event[key];
    if (typeof value === 'function') {
      continue;
    }
    // Value should be the expected type, but the value of `key` is not known
    // statically.
    click[key as keyof MouseEvent] = value as any;
  }

  // Ensure that the event has the most recent timestamp. This timestamp
  // may be used in the future to validate or cancel subsequent click events.
  click['timeStamp'] = Date.now();

  // Emulate preventDefault and stopPropagation behavior
  click['defaultPrevented'] = false;
  click['preventDefault'] = syntheticPreventDefault;
  click['_propagationStopped'] = false;
  click['stopPropagation'] = syntheticStopPropagation;

  // Emulate click coordinates using touch info
  const touch = getTouchData(event);
  if (touch) {
    click['clientX'] = touch.clientX;
    click['clientY'] = touch.clientY;
    click['screenX'] = touch.screenX;
    click['screenY'] = touch.screenY;
  }
  return click as MouseEvent;
}

/**
 * An implementation of "preventDefault" for a synthesized event. Simply
 * sets "defaultPrevented" property to true.
 */
function syntheticPreventDefault(this: Event) {
  (this as SyntheticMouseEvent).defaultPrevented = true;
}

/**
 * An implementation of "stopPropagation" for a synthesized event. It simply
 * sets a synthetic non-standard "_propagationStopped" property to true.
 */
function syntheticStopPropagation(this: Event) {
  (this as SyntheticMouseEvent)._propagationStopped = true;
}

/**
 * Mapping of KeyboardEvent.key values to
 * KeyCode values.
 */
const ACTION_KEY_TO_KEYCODE: {[key: string]: number} = {
  'Enter': KeyCode.ENTER,
  ' ': KeyCode.SPACE,
};

/**
 * Mapping of HTML element identifiers (ARIA role, type, or tagName) to the
 * keys (enter and/or space) that should activate them. A value of zero means
 * that both should activate them.
 */
export const IDENTIFIER_TO_KEY_TRIGGER_MAPPING: {[key: string]: number} = {
  'A': KeyCode.ENTER,
  'BUTTON': 0,
  'CHECKBOX': KeyCode.SPACE,
  'COMBOBOX': KeyCode.ENTER,
  'FILE': 0,
  'GRIDCELL': KeyCode.ENTER,
  'LINK': KeyCode.ENTER,
  'LISTBOX': KeyCode.ENTER,
  'MENU': 0,
  'MENUBAR': 0,
  'MENUITEM': 0,
  'MENUITEMCHECKBOX': 0,
  'MENUITEMRADIO': 0,
  'OPTION': 0,
  'RADIO': KeyCode.SPACE,
  'RADIOGROUP': KeyCode.SPACE,
  'RESET': 0,
  'SUBMIT': 0,
  'SWITCH': KeyCode.SPACE,
  'TAB': 0,
  'TREE': KeyCode.ENTER,
  'TREEITEM': KeyCode.ENTER,
};

/**
 * Returns whether or not to process space based on the type of the element;
 * checks to make sure that type is not null.
 * @param element The element.
 * @return Whether or not to process space based on type.
 */
function processSpace(element: Element): boolean {
  const type = (element.getAttribute('type') || element.tagName).toUpperCase();
  return type in PROCESS_SPACE;
}

/**
 * Returns whether or not the given element is a text control.
 * @param el The element.
 * @return Whether or not the given element is a text control.
 */
function isTextControl(el: Element): boolean {
  const type = (el.getAttribute('type') || el.tagName).toUpperCase();
  return type in TEXT_CONTROLS;
}

/**
 * Returns if the given element is a native HTML control.
 * @param el The element.
 * @return If the given element is a native HTML control.
 */
export function isNativeHTMLControl(el: Element): boolean {
  return el.tagName.toUpperCase() in NATIVE_HTML_CONTROLS;
}

/**
 * Returns if the given element is natively activatable. Browsers emit click
 * events for natively activatable elements, even when activated via keyboard.
 * For these elements, we don't need to raise a11y click events.
 * @param el The element.
 * @return If the given element is a native HTML control.
 */
function isNativelyActivatable(el: Element): boolean {
  return (
    el.tagName.toUpperCase() === 'BUTTON' ||
    (!!(el as HTMLInputElement).type && (el as HTMLInputElement).type.toUpperCase() === 'FILE')
  );
}

/**
 * HTML <input> types (not ARIA roles) which will auto-trigger a click event for
 * the Space key, with side-effects. We will not call preventDefault if space is
 * pressed, nor will we raise a11y click events.  For all other elements, we can
 * suppress the default event (which has no desired side-effects) and handle the
 * keydown ourselves.
 */
const PROCESS_SPACE: {[key: string]: boolean} = {
  'CHECKBOX': true,
  'FILE': true,
  'OPTION': true,
  'RADIO': true,
};

/** TagNames and Input types for which to not process enter/space as click. */
const TEXT_CONTROLS: {[key: string]: boolean} = {
  'COLOR': true,
  'DATE': true,
  'DATETIME': true,
  'DATETIME-LOCAL': true,
  'EMAIL': true,
  'MONTH': true,
  'NUMBER': true,
  'PASSWORD': true,
  'RANGE': true,
  'SEARCH': true,
  'TEL': true,
  'TEXT': true,
  'TEXTAREA': true,
  'TIME': true,
  'URL': true,
  'WEEK': true,
};

/** TagNames that are native HTML controls. */
const NATIVE_HTML_CONTROLS: {[key: string]: boolean} = {
  'A': true,
  'AREA': true,
  'BUTTON': true,
  'DIALOG': true,
  'IMG': true,
  'INPUT': true,
  'LINK': true,
  'MENU': true,
  'OPTGROUP': true,
  'OPTION': true,
  'PROGRESS': true,
  'SELECT': true,
  'TEXTAREA': true,
};

/** Exported for testing. */
export const testing = {
  setIsMac(value: boolean) {
    isMac = value;
  },
};
