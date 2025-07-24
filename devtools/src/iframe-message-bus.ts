/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Events, MessageBus, Parameters} from '../projects/protocol';

export class IFrameMessageBus extends MessageBus<Events> {
  private listeners: any[] = [];

  constructor(
    private readonly source: string,
    private readonly destination: string,
    private readonly docWindow: () => Window,
  ) {
    super();
  }

  override on<E extends keyof Events>(topic: E, cb: Events[E]): () => void {
    const listener = (e: MessageEvent) => {
      if (!e.data || e.data.source !== this.destination || !e.data.topic) {
        return;
      }
      if (e.data.topic === topic) {
        (cb as () => void).apply(null, e.data.args);
      }
    };
    window.addEventListener('message', listener);
    this.listeners.push(listener);
    return () => {
      this.listeners.splice(this.listeners.indexOf(listener), 1);
      window.removeEventListener('message', listener);
    };
  }

  override once<E extends keyof Events>(topic: E, cb: Events[E]): void {
    const listener = (e: MessageEvent) => {
      if (!e.data || e.data.source !== this.destination || !e.data.topic) {
        return;
      }
      if (e.data.topic === topic) {
        (cb as any).apply(null, e.data.args);
        window.removeEventListener('message', listener);
      }
    };
    window.addEventListener('message', listener);
  }

  override emit<E extends keyof Events>(topic: E, args?: Parameters<Events[E]>): boolean {
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

  override destroy(): void {
    this.listeners.forEach((l) => window.removeEventListener('message', l));
    this.listeners = [];
  }
}
