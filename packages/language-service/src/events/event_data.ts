/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Map of DOM event names to their corresponding DOM Event interface types.
 * Based on HTMLElementEventMap from lib.dom.d.ts with additional events
 * from other DOM specifications.
 *
 * This map is used for:
 * 1. Providing accurate type hints for event bindings
 * 2. Validating that event names are valid DOM events
 * 3. Providing suggestions for similar event names
 */
export const DOM_EVENT_TYPE_MAP: Readonly<Record<string, string>> = {
  // Pointer/Mouse events - modern browsers use PointerEvent for click/dblclick/contextmenu
  click: 'PointerEvent',
  dblclick: 'PointerEvent',
  contextmenu: 'PointerEvent',
  auxclick: 'PointerEvent',

  // Mouse-specific events (still use MouseEvent)
  mousedown: 'MouseEvent',
  mouseenter: 'MouseEvent',
  mouseleave: 'MouseEvent',
  mousemove: 'MouseEvent',
  mouseout: 'MouseEvent',
  mouseover: 'MouseEvent',
  mouseup: 'MouseEvent',

  // Pointer events
  pointerdown: 'PointerEvent',
  pointerenter: 'PointerEvent',
  pointerleave: 'PointerEvent',
  pointermove: 'PointerEvent',
  pointerout: 'PointerEvent',
  pointerover: 'PointerEvent',
  pointerup: 'PointerEvent',
  pointercancel: 'PointerEvent',
  gotpointercapture: 'PointerEvent',
  lostpointercapture: 'PointerEvent',

  // Keyboard events
  keydown: 'KeyboardEvent',
  keyup: 'KeyboardEvent',
  keypress: 'KeyboardEvent', // Deprecated but still widely used

  // Focus events
  focus: 'FocusEvent',
  blur: 'FocusEvent',
  focusin: 'FocusEvent',
  focusout: 'FocusEvent',

  // Form events
  input: 'InputEvent',
  change: 'Event',
  submit: 'SubmitEvent',
  reset: 'Event',
  invalid: 'Event',
  select: 'Event',
  formdata: 'FormDataEvent',

  // Drag events
  drag: 'DragEvent',
  dragend: 'DragEvent',
  dragenter: 'DragEvent',
  dragleave: 'DragEvent',
  dragover: 'DragEvent',
  dragstart: 'DragEvent',
  drop: 'DragEvent',

  // Touch events
  touchcancel: 'TouchEvent',
  touchend: 'TouchEvent',
  touchmove: 'TouchEvent',
  touchstart: 'TouchEvent',

  // Wheel events
  wheel: 'WheelEvent',
  scroll: 'Event',
  scrollend: 'Event',

  // Clipboard events
  copy: 'ClipboardEvent',
  cut: 'ClipboardEvent',
  paste: 'ClipboardEvent',

  // Composition events
  compositionend: 'CompositionEvent',
  compositionstart: 'CompositionEvent',
  compositionupdate: 'CompositionEvent',

  // Transition/Animation events
  transitioncancel: 'TransitionEvent',
  transitionend: 'TransitionEvent',
  transitionrun: 'TransitionEvent',
  transitionstart: 'TransitionEvent',
  animationcancel: 'AnimationEvent',
  animationend: 'AnimationEvent',
  animationiteration: 'AnimationEvent',
  animationstart: 'AnimationEvent',

  // UI events
  resize: 'UIEvent',

  // Media events
  abort: 'Event',
  canplay: 'Event',
  canplaythrough: 'Event',
  durationchange: 'Event',
  emptied: 'Event',
  ended: 'Event',
  error: 'Event',
  load: 'Event',
  loadeddata: 'Event',
  loadedmetadata: 'Event',
  loadstart: 'Event',
  pause: 'Event',
  play: 'Event',
  playing: 'Event',
  progress: 'ProgressEvent',
  ratechange: 'Event',
  seeked: 'Event',
  seeking: 'Event',
  stalled: 'Event',
  suspend: 'Event',
  timeupdate: 'Event',
  volumechange: 'Event',
  waiting: 'Event',

  // Other HTML events
  toggle: 'Event',
  beforeinput: 'InputEvent',
  securitypolicyviolation: 'SecurityPolicyViolationEvent',
  slotchange: 'Event',
  selectionchange: 'Event',
  selectstart: 'Event',
  beforetoggle: 'Event',
  cancel: 'Event',
  close: 'Event',
  cuechange: 'Event',
  fullscreenchange: 'Event',
  fullscreenerror: 'Event',
  show: 'Event',

  // Storage events
  storage: 'StorageEvent',

  // Hash change
  hashchange: 'HashChangeEvent',

  // Pop state
  popstate: 'PopStateEvent',

  // Page visibility
  visibilitychange: 'Event',

  // Device events
  devicemotion: 'DeviceMotionEvent',
  deviceorientation: 'DeviceOrientationEvent',

  // Gamepad events
  gamepadconnected: 'GamepadEvent',
  gamepaddisconnected: 'GamepadEvent',

  // Window events
  beforeunload: 'BeforeUnloadEvent',
  unload: 'Event',
  pagehide: 'PageTransitionEvent',
  pageshow: 'PageTransitionEvent',

  // Online/offline
  online: 'Event',
  offline: 'Event',

  // Message events
  message: 'MessageEvent',
  messageerror: 'MessageEvent',

  // WebSocket events (use Event, actual MessageEvent comes through onmessage)
  open: 'Event',

  // Print events
  beforeprint: 'Event',
  afterprint: 'Event',

  // App visibility
  languagechange: 'Event',

  // Worker events
  rejectionhandled: 'PromiseRejectionEvent',
  unhandledrejection: 'PromiseRejectionEvent',
};

/**
 * Set of valid DOM event names for quick lookup.
 */
export const VALID_DOM_EVENTS: ReadonlySet<string> = new Set(Object.keys(DOM_EVENT_TYPE_MAP));

/**
 * Checks if an event name is a valid DOM event.
 * This does NOT include Angular outputs or custom events.
 *
 * @param eventName The event name to check (case-insensitive).
 * @returns True if the event name is a known DOM event.
 */
export function isValidDomEvent(eventName: string): boolean {
  // Handle keyboard event modifiers (e.g., keydown.enter, keydown.escape)
  const baseEventName = eventName.split('.')[0].toLowerCase();
  return VALID_DOM_EVENTS.has(baseEventName);
}

/**
 * Gets the DOM Event interface type for an event name.
 * Returns null if the event is not a known DOM event.
 *
 * @param eventName The event name (case-insensitive).
 * @returns The DOM Event interface name (e.g., 'MouseEvent', 'KeyboardEvent'), or null.
 */
export function getDomEventType(eventName: string): string | null {
  const baseEventName = eventName.split('.')[0].toLowerCase();
  return DOM_EVENT_TYPE_MAP[baseEventName] ?? null;
}

/**
 * Event category descriptions for generating hover documentation.
 */
const EVENT_CATEGORY_DESCRIPTIONS: ReadonlyMap<string, string> = new Map([
  [
    'PointerEvent',
    'Pointer events provide a unified way to handle input from pointing devices (mouse, touch, pen).',
  ],
  ['MouseEvent', 'Mouse events are fired when a mouse or similar device is used.'],
  ['KeyboardEvent', 'Keyboard events are fired when a key is pressed or released.'],
  ['FocusEvent', 'Focus events are fired when an element gains or loses focus.'],
  ['InputEvent', 'Input events are fired when the value of an input element changes.'],
  ['DragEvent', 'Drag events are fired during drag and drop operations.'],
  ['TouchEvent', 'Touch events are fired when the user interacts with a touchscreen.'],
  ['WheelEvent', 'Wheel events are fired when the user rotates a mouse wheel or similar device.'],
  ['ClipboardEvent', 'Clipboard events are fired when the user interacts with the clipboard.'],
  [
    'CompositionEvent',
    'Composition events are fired during IME (Input Method Editor) text composition.',
  ],
  [
    'TransitionEvent',
    'Transition events are fired when CSS transitions start, end, or are canceled.',
  ],
  ['AnimationEvent', 'Animation events are fired when CSS animations start, end, or repeat.'],
  ['ProgressEvent', 'Progress events are fired to indicate the progress of an operation.'],
  ['SubmitEvent', 'Submit events are fired when a form is submitted.'],
  ['FormDataEvent', 'FormData events are fired when form data is being constructed.'],
  [
    'SecurityPolicyViolationEvent',
    'Security policy violation events are fired when a CSP violation occurs.',
  ],
  [
    'MessageEvent',
    'Message events are fired when a message is received (e.g., from postMessage, WebSocket).',
  ],
  ['PromiseRejectionEvent', 'Promise rejection events are fired when a Promise is rejected.'],
]);

/**
 * Information about a DOM event for hover documentation.
 */
export interface DomEventDocumentation {
  /** The base event name (e.g., 'click', 'keydown') */
  eventName: string;
  /** The DOM Event interface type (e.g., 'PointerEvent', 'KeyboardEvent') */
  eventType: string;
  /** A description of the event */
  description: string;
  /** MDN documentation URL */
  mdnUrl: string;
}

/**
 * Gets hover documentation for a DOM event.
 * Returns null if the event is not a known DOM event.
 *
 * @param eventName The event name (may include modifiers like 'keydown.enter').
 * @returns Documentation information for the event, or null.
 */
export function getDomEventDocumentation(eventName: string): DomEventDocumentation | null {
  const baseEventName = eventName.split('.')[0].toLowerCase();
  const eventType = DOM_EVENT_TYPE_MAP[baseEventName];

  if (!eventType) {
    return null;
  }

  const categoryDescription = EVENT_CATEGORY_DESCRIPTIONS.get(eventType) ?? '';

  // Generate a description based on the event type
  let description = `The \`${baseEventName}\` event is fired `;
  switch (baseEventName) {
    // Mouse/Pointer events
    case 'click':
      description += 'when a pointing device button is pressed and released on an element.';
      break;
    case 'dblclick':
      description += 'when a pointing device button is clicked twice on an element.';
      break;
    case 'contextmenu':
      description += 'when the context menu is requested (typically right-click).';
      break;
    case 'mousedown':
    case 'pointerdown':
      description += 'when a pointing device button is pressed on an element.';
      break;
    case 'mouseup':
    case 'pointerup':
      description += 'when a pointing device button is released on an element.';
      break;
    case 'mouseenter':
    case 'pointerenter':
      description += 'when a pointing device enters the element boundaries.';
      break;
    case 'mouseleave':
    case 'pointerleave':
      description += 'when a pointing device leaves the element boundaries.';
      break;
    case 'mousemove':
    case 'pointermove':
      description += 'when a pointing device is moved over an element.';
      break;
    case 'mouseover':
    case 'pointerover':
      description += 'when a pointing device is moved onto an element or its descendants.';
      break;
    case 'mouseout':
    case 'pointerout':
      description += 'when a pointing device is moved off an element or its descendants.';
      break;

    // Keyboard events
    case 'keydown':
      description += 'when a key is pressed down.';
      break;
    case 'keyup':
      description += 'when a key is released.';
      break;
    case 'keypress':
      description += 'when a key is pressed (deprecated, use keydown instead).';
      break;

    // Focus events
    case 'focus':
      description += 'when an element receives focus.';
      break;
    case 'blur':
      description += 'when an element loses focus.';
      break;
    case 'focusin':
      description += 'when an element is about to receive focus (bubbles).';
      break;
    case 'focusout':
      description += 'when an element is about to lose focus (bubbles).';
      break;

    // Form events
    case 'input':
      description += 'when the value of an input element changes.';
      break;
    case 'change':
      description += 'when the value of an element has been changed and committed.';
      break;
    case 'submit':
      description += 'when a form is submitted.';
      break;
    case 'reset':
      description += 'when a form is reset.';
      break;
    case 'invalid':
      description += 'when a form element fails validation.';
      break;

    // Drag events
    case 'drag':
      description += 'when an element is being dragged.';
      break;
    case 'dragstart':
      description += 'when the user starts dragging an element.';
      break;
    case 'dragend':
      description += 'when a drag operation ends.';
      break;
    case 'dragenter':
      description += 'when a dragged element enters a valid drop target.';
      break;
    case 'dragleave':
      description += 'when a dragged element leaves a valid drop target.';
      break;
    case 'dragover':
      description += 'when an element is being dragged over a valid drop target.';
      break;
    case 'drop':
      description += 'when an element is dropped on a valid drop target.';
      break;

    // Touch events
    case 'touchstart':
      description += 'when a touch point is placed on the touch surface.';
      break;
    case 'touchend':
      description += 'when a touch point is removed from the touch surface.';
      break;
    case 'touchmove':
      description += 'when a touch point is moved along the touch surface.';
      break;
    case 'touchcancel':
      description += 'when a touch point has been disrupted.';
      break;

    // Scroll/Wheel events
    case 'scroll':
      description += 'when an element scrolls.';
      break;
    case 'scrollend':
      description += 'when scrolling has completed.';
      break;
    case 'wheel':
      description += 'when a wheel button is rotated.';
      break;

    // Loading events
    case 'load':
      description += 'when a resource has loaded.';
      break;
    case 'error':
      description += 'when a resource failed to load.';
      break;
    case 'abort':
      description += 'when loading has been aborted.';
      break;

    // Animation events
    case 'animationstart':
      description += 'when a CSS animation has started.';
      break;
    case 'animationend':
      description += 'when a CSS animation has completed.';
      break;
    case 'animationiteration':
      description += 'when a CSS animation repeats.';
      break;
    case 'animationcancel':
      description += 'when a CSS animation is canceled.';
      break;

    // Transition events
    case 'transitionstart':
      description += 'when a CSS transition has started.';
      break;
    case 'transitionend':
      description += 'when a CSS transition has completed.';
      break;
    case 'transitionrun':
      description += 'when a CSS transition is created.';
      break;
    case 'transitioncancel':
      description += 'when a CSS transition is canceled.';
      break;

    default:
      description += `on the element. ${categoryDescription}`;
  }

  if (categoryDescription && !description.includes(categoryDescription)) {
    description += ` ${categoryDescription}`;
  }

  return {
    eventName: baseEventName,
    eventType,
    description,
    mdnUrl: `https://developer.mozilla.org/en-US/docs/Web/API/Element/${baseEventName}_event`,
  };
}

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for finding similar event names.
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Finds DOM events similar to the given event name.
 * Used for providing "Did you mean?" suggestions.
 *
 * @param eventName The misspelled event name.
 * @param maxSuggestions Maximum number of suggestions to return.
 * @param maxDistance Maximum Levenshtein distance for suggestions.
 * @returns Array of similar event names, sorted by similarity.
 */
export function findSimilarDomEvents(
  eventName: string,
  maxSuggestions = 3,
  maxDistance = 3,
): string[] {
  const baseEventName = eventName.split('.')[0].toLowerCase();

  const suggestions: Array<{name: string; distance: number}> = [];

  for (const validEvent of VALID_DOM_EVENTS) {
    const distance = levenshteinDistance(baseEventName, validEvent);
    if (distance <= maxDistance && distance > 0) {
      suggestions.push({name: validEvent, distance});
    }
  }

  // Sort by distance (closer matches first)
  suggestions.sort((a, b) => a.distance - b.distance);

  return suggestions.slice(0, maxSuggestions).map((s) => s.name);
}
