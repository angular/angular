/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="chrome"/>

import {Events, MessageBus, Parameters} from 'protocol';

interface ChromeMessage<T, K extends keyof T> {
  topic: K;
  args: Parameters<T[K]>;
}

type AnyEventCallback<Ev> = <E extends keyof Ev>(topic: E, args: Parameters<Ev[E]>) => void;

export class ChromeMessageBus extends MessageBus<Events> {
  private _disconnected = false;
  private _listeners: any[] = [];

  constructor(private _port: chrome.runtime.Port) {
    super();

    _port.onDisconnect.addListener(() => {
      // console.log('Disconnected the port');
      this._disconnected = true;
    });
  }

  onAny(cb: AnyEventCallback<Events>): () => void {
    const listener = (msg: ChromeMessage<Events, keyof Events>): void => {
      cb(msg.topic, msg.args);
    };
    this._port.onMessage.addListener(listener);
    this._listeners.push(listener);
    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1);
      this._port.onMessage.removeListener(listener);
    };
  }

  on<E extends keyof Events>(topic: E, cb: Events[E]): () => void {
    const listener = (msg: ChromeMessage<Events, keyof Events>): void => {
      if (msg.topic === topic) {
        cb.apply(null, msg.args);
      }
    };
    this._port.onMessage.addListener(listener);
    this._listeners.push(listener);
    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1);
      this._port.onMessage.removeListener(listener);
    };
  }

  once<E extends keyof Events>(topic: E, cb: Events[E]): void {
    const listener = (msg: ChromeMessage<Events, keyof Events>) => {
      if (msg.topic === topic) {
        cb.apply(null, msg.args);
        this._port.onMessage.removeListener(listener);
      }
    };
    this._port.onMessage.addListener(listener);
  }

  emit<E extends keyof Events>(topic: E, args?: Parameters<Events[E]>): boolean {
    if (this._disconnected) {
      return false;
    }
    this._port.postMessage({
      topic,
      args,
    });
    return true;
  }

  destroy(): void {
    this._listeners.forEach((l) => window.removeEventListener('message', l));
    this._listeners = [];
  }
}
