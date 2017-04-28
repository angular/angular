import {createFakeEvent, createKeyboardEvent, createMouseEvent} from './event-objects';

/** Utility to dispatch any event on a Node. */
export function dispatchEvent(node: Node | Window, event: Event): Event {
  node.dispatchEvent(event);
  return event;
}

/** Shorthand to dispatch a fake event on a specified node. */
export function dispatchFakeEvent(node: Node | Window, type: string): Event {
  return dispatchEvent(node, createFakeEvent(type));
}

/** Shorthand to dispatch a keyboard event with a specified key code. */
export function dispatchKeyboardEvent(node: Node, type: string, keyCode: number): KeyboardEvent {
  return dispatchEvent(node, createKeyboardEvent(type, keyCode)) as KeyboardEvent;
}

/** Shorthand to dispatch a mouse event on the specified coordinates. */
export function dispatchMouseEvent(node: Node, type: string, x = 0, y = 0): MouseEvent {
  return dispatchEvent(node, createMouseEvent(type, x, y)) as MouseEvent;
}
