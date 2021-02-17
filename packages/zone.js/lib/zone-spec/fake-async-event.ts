/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export function createEventTargetPrototype(onProps?: string[]) {
  const EventTargetPrototype: {
    eventListeners: {eventName: string, listener: EventListenerOrEventListenerObject}[],
    addEventListener: (eventName: string, listener: EventListenerOrEventListenerObject) => void,
    removeEventListener: (eventName: string, listener: EventListenerOrEventListenerObject) => void,
    triggerEvent: (eventName: string, evt: any) => void,
  } = {
    eventListeners: [],
    addEventListener: function(eventName: string, listener: EventListenerOrEventListenerObject) {
      this.eventListeners.push({eventName, listener});
    },
    removeEventListener: function(eventName: string, listener: EventListenerOrEventListenerObject) {
      for (let i = 0; i < this.eventListeners.length; i++) {
        if (this.eventListeners[i].eventName === eventName &&
            this.eventListeners[i].listener === listener) {
          this.eventListeners.splice(i, 1);
          break;
        }
      }
    },
    triggerEvent: function(eventName: string, evt: any) {
      this.eventListeners.filter(el => el.eventName === eventName).forEach(el => {
        if (typeof el.listener === 'function') {
          el.listener.call(this, evt);
        } else {
          el.listener.handleEvent.call(this, evt);
        }
      });
    }
  };
  if (onProps) {
    onProps.forEach(onProp => {
      Object.defineProperty(EventTargetPrototype, onProp, {
        configurable: true,
        enumerable: true,
        get: () => {
          return (EventTargetPrototype as any)[Zone.__symbol__(onProp)];
        },
        set: (listener: EventListener) => {
          const currListener = (EventTargetPrototype as any)[Zone.__symbol__(onProp)];
          const eventName = onProp.substr(2);
          currListener && EventTargetPrototype.removeEventListener(eventName, currListener);
          EventTargetPrototype.addEventListener(eventName, listener);
        }
      });
    });
  }
  return EventTargetPrototype;
}
