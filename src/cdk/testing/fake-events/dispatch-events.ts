/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  createFakeEvent,
  createKeyboardEvent,
  createMouseEvent,
  createTouchEvent,
  ModifierKeys
} from './event-objects';

/**
 * Utility to dispatch any event on a Node.
 * @docs-private
 */
export function dispatchEvent(node: Node | Window, event: Event): Event {
  node.dispatchEvent(event);
  return event;
}

/**
 * Shorthand to dispatch a fake event on a specified node.
 * @docs-private
 */
export function dispatchFakeEvent(node: Node | Window, type: string, canBubble?: boolean): Event {
  return dispatchEvent(node, createFakeEvent(type, canBubble));
}

/**
 * Shorthand to dispatch a keyboard event with a specified key code.
 * @docs-private
 */
export function dispatchKeyboardEvent(node: Node, type: string, keyCode?: number, key?: string,
                                      target?: Element, modifiers?: ModifierKeys): KeyboardEvent {
  return dispatchEvent(node,
      createKeyboardEvent(type, keyCode, key, target, modifiers)) as KeyboardEvent;
}

/**
 * Shorthand to dispatch a mouse event on the specified coordinates.
 * @docs-private
 */
export function dispatchMouseEvent(node: Node, type: string, x = 0, y = 0,
  event = createMouseEvent(type, x, y)): MouseEvent {
  return dispatchEvent(node, event) as MouseEvent;
}

/**
 * Shorthand to dispatch a touch event on the specified coordinates.
 * @docs-private
 */
export function dispatchTouchEvent(node: Node, type: string, x = 0, y = 0) {
  return dispatchEvent(node, createTouchEvent(type, x, y));
}
