import {
  createFakeEvent,
  createKeyboardEvent,
  createMouseEvent
} from './event-objects';

/** Shorthand to dispatch a fake event on a specified node. */
export function dispatchFakeEvent(node: Node, type: string) {
  node.dispatchEvent(createFakeEvent(type));
}

/** Shorthand to dispatch a keyboard event with a specified key code. */
export function dispatchKeyboardEvent(node: Node, type: string, keyCode: number) {
  node.dispatchEvent(createKeyboardEvent(type, keyCode));
}

/** Shorthand to dispatch a mouse event on the specified coordinates. */
export function dispatchMouseEvent(node: Node, type: string, x = 0, y = 0) {
  node.dispatchEvent(createMouseEvent(type, x, y));
}
