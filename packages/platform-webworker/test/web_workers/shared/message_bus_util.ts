/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MessageBus} from '@angular/platform-webworker/src/web_workers/shared/message_bus';
import {PostMessageBus, PostMessageBusSink, PostMessageBusSource} from '@angular/platform-webworker/src/web_workers/shared/post_message_bus';


/*
 * Returns a PostMessageBus thats sink is connected to its own source.
 * Useful for testing the sink and source.
 */
export function createConnectedMessageBus(): MessageBus {
  const mockPostMessage = new MockPostMessage();
  const source = new PostMessageBusSource(<any>mockPostMessage);
  const sink = new PostMessageBusSink(mockPostMessage);

  return new PostMessageBus(sink, source);
}

class MockPostMessage {
  private _listener: EventListener;

  addEventListener(type: string, listener: EventListener, useCapture?: boolean): void {
    if (type === 'message') {
      this._listener = listener;
    }
  }

  postMessage(data: any, transfer?: [ArrayBuffer]): void { this._listener(<any>{data: data}); }
}
