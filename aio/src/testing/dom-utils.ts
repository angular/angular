/**
 * Create a `CustomEvent` (even on browsers where `CustomEvent` is not a constructor).
 */
export function createCustomEvent(doc: Document, name: string, detail: any): CustomEvent {
  const bubbles = false;
  const cancelable = false;

  // On IE11, `CustomEvent` is not a constructor.
  if (typeof CustomEvent !== 'function') {
    const event = doc.createEvent('CustomEvent');
    event.initCustomEvent(name, bubbles, cancelable, detail);
    return event;
  }

  return new CustomEvent(name, {bubbles, cancelable, detail});
}
