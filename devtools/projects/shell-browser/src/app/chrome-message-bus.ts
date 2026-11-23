/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

import {Events, MessageBus, Parameters} from '../../../protocol';

interface ChromeMessage<T, K extends keyof T> {
  topic: K;
  args: Parameters<T[K]>;
}

type AnyEventCallback<Ev> = <E extends keyof Ev>(topic: E, args: Parameters<Ev[E]>) => void;

type ListenerFn = (msg: ChromeMessage<Events, keyof Events>) => void;

export class ChromeMessageBus extends MessageBus<Events> {
  private disconnected = false;
  private listeners: ListenerFn[] = [];

  constructor(private port: chrome.runtime.Port) {
    super();

    port.onDisconnect.addListener(() => {
      // console.log('Disconnected the port');
      this.disconnected = true;
    });
  }

  onAny(cb: AnyEventCallback<Events>): () => void {
    const listener = (msg: ChromeMessage<Events, keyof Events>): void => {
      cb(msg.topic, msg.args);
    };
    this.port.onMessage.addListener(listener);
    this.listeners.push(listener);
    return () => {
      this.listeners.splice(this.listeners.indexOf(listener), 1);
      this.port.onMessage.removeListener(listener);
    };
  }

  override on<E extends keyof Events>(topic: E, cb: Events[E]): () => void {
    const listener = (msg: ChromeMessage<Events, keyof Events>): void => {
      if (msg.topic === topic) {
        (cb as any).apply(null, msg.args);
      }
    };
    this.port.onMessage.addListener(listener);
    this.listeners.push(listener);
    return () => {
      this.listeners.splice(this.listeners.indexOf(listener), 1);
      this.port.onMessage.removeListener(listener);
    };
  }

  override once<E extends keyof Events>(topic: E, cb: Events[E]): void {
    const listener = (msg: ChromeMessage<Events, keyof Events>) => {
      if (msg.topic === topic) {
        (cb as any).apply(null, msg.args);
        this.port.onMessage.removeListener(listener);
      }
    };
    this.port.onMessage.addListener(listener);
  }

  override emit<E extends keyof Events>(topic: E, args?: Parameters<Events[E]>): boolean {
    if (this.disconnected) {
      return false;
    }
    this.port.postMessage({
      topic,
      args,
      __ignore_ng_zone__: true,
      __NG_DEVTOOLS_EVENT__: true,
    });
    return true;
  }

  override destroy(): void {
    this.listeners.forEach((l) => this.port.onMessage.removeListener(l));
    this.listeners = [];
  }
}
