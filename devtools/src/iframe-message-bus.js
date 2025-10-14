/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {MessageBus} from '../projects/protocol';
export class IFrameMessageBus extends MessageBus {
  constructor(source, destination, docWindow) {
    super();
    this.source = source;
    this.destination = destination;
    this.docWindow = docWindow;
    this.listeners = [];
  }
  on(topic, cb) {
    const listener = (e) => {
      if (!e.data || e.data.source !== this.destination || !e.data.topic) {
        return;
      }
      if (e.data.topic === topic) {
        cb.apply(null, e.data.args);
      }
    };
    window.addEventListener('message', listener);
    this.listeners.push(listener);
    return () => {
      this.listeners.splice(this.listeners.indexOf(listener), 1);
      window.removeEventListener('message', listener);
    };
  }
  once(topic, cb) {
    const listener = (e) => {
      if (!e.data || e.data.source !== this.destination || !e.data.topic) {
        return;
      }
      if (e.data.topic === topic) {
        cb.apply(null, e.data.args);
        window.removeEventListener('message', listener);
      }
    };
    window.addEventListener('message', listener);
  }
  emit(topic, args) {
    this.docWindow().postMessage(
      {
        source: this.source,
        topic,
        args,
        // Since both the devtools app and the demo app use IframeMessageBus,
        // we want to only ignore the ngZone for the demo app. This will let us
        // prevent infinite change detection loops triggered by message
        // event listeners but also not prevent the NgZone in the devtools app
        // from updating its UI.
        __ignore_ng_zone__: this.source === 'angular-devtools',
        __NG_DEVTOOLS_EVENT__: true,
      },
      '*',
    );
    return true;
  }
  destroy() {
    this.listeners.forEach((l) => window.removeEventListener('message', l));
    this.listeners = [];
  }
}
//# sourceMappingURL=iframe-message-bus.js.map
