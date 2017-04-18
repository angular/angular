/** Creates a browser MouseEvent with the specified options. */
export function createMouseEvent(type: string, x = 0, y = 0) {
  let event = document.createEvent('MouseEvent');

  event.initMouseEvent(type,
    false, /* canBubble */
    false, /* cancelable */
    window, /* view */
    0, /* detail */
    x, /* screenX */
    y, /* screenY */
    x, /* clientX */
    y, /* clientY */
    false, /* ctrlKey */
    false, /* altKey */
    false, /* shiftKey */
    false, /* metaKey */
    0, /* button */
    null /* relatedTarget */);

  return event;
}

/** Dispatches a keydown event from an element. */
export function createKeyboardEvent(type: string, keyCode: number) {
  let event = document.createEvent('KeyboardEvent') as any;
  // Firefox does not support `initKeyboardEvent`, but supports `initKeyEvent`.
  let initEventFn = (event.initKeyEvent || event.initKeyboardEvent).bind(event);

  initEventFn(type, true, true, window, 0, 0, 0, 0, 0, keyCode);

  // Webkit Browsers don't set the keyCode when calling the init function.
  // See related bug https://bugs.webkit.org/show_bug.cgi?id=16735
  Object.defineProperty(event, 'keyCode', {
    get: function() { return keyCode; }
  });

  return event;
}

/** Creates a fake event object with any desired event type. */
export function createFakeEvent(type: string) {
  let event = document.createEvent('Event');
  event.initEvent(type, true, true);
  return event;
}
