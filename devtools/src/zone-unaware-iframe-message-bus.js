/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {MessageBus} from '../projects/protocol';
import {IFrameMessageBus} from './iframe-message-bus';
const runOutsideAngular = (f) => {
  const w = window;
  if (!w.Zone || w.Zone.current._name !== 'angular') {
    f();
    return;
  }
  w.Zone.current._parent.run(f);
};
export class ZoneUnawareIFrameMessageBus extends MessageBus {
  constructor(source, destination, docWindow) {
    super();
    this.delegate = new IFrameMessageBus(source, destination, docWindow);
  }
  on(topic, cb) {
    let result;
    runOutsideAngular(() => {
      result = this.delegate.on(topic, cb);
    });
    return result;
  }
  once(topic, cb) {
    let result;
    runOutsideAngular(() => {
      result = this.delegate.once(topic, cb);
    });
    return result;
  }
  // Need to be run in the zone because otherwise it won't be caught by the
  // listener in the extension.
  emit(topic, args) {
    return this.delegate.emit(topic, args);
  }
  destroy() {
    this.delegate.destroy();
  }
}
//# sourceMappingURL=zone-unaware-iframe-message-bus.js.map
