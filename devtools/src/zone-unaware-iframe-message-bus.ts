/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Events, MessageBus, Parameters} from '../projects/protocol';

import {IFrameMessageBus} from './iframe-message-bus';

const runOutsideAngular = (f: () => any) => {
  const w = window as any;
  if (!w.Zone || w.Zone.current._name !== 'angular') {
    f();
    return;
  }
  w.Zone.current._parent.run(f);
};

export class ZoneUnawareIFrameMessageBus extends MessageBus<Events> {
  private delegate: IFrameMessageBus;

  constructor(source: string, destination: string, docWindow: () => Window) {
    super();
    this.delegate = new IFrameMessageBus(source, destination, docWindow);
  }

  override on<E extends keyof Events>(topic: E, cb: Events[E]): any {
    let result: any;
    runOutsideAngular(() => {
      result = this.delegate.on(topic, cb);
    });
    return result;
  }

  override once<E extends keyof Events>(topic: E, cb: Events[E]): any {
    let result: any;
    runOutsideAngular(() => {
      result = this.delegate.once(topic, cb);
    });
    return result;
  }

  // Need to be run in the zone because otherwise it won't be caught by the
  // listener in the extension.
  override emit<E extends keyof Events>(topic: E, args?: Parameters<Events[E]>): boolean {
    return this.delegate.emit(topic, args);
  }

  override destroy(): void {
    this.delegate.destroy();
  }
}
