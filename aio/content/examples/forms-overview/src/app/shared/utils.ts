export function createNewEvent(eventName: string, bubbles = false, cancelable = false) {
  let evt = document.createEvent('CustomEvent');
  evt.initCustomEvent(eventName, bubbles, cancelable, null);
  return evt;
}
