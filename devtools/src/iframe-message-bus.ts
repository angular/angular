/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Events, MessageBus, Parameters} from 'protocol';

type AnyEventCallback<Ev> = <E extends keyof Ev>(topic: E, args: Parameters<Ev[E]>) => void;

export class IFrameMessageBus extends MessageBus<Events> {
  private _listeners: any[] = [];

  constructor(
      private _source: string, private _destination: string, private _docWindow: () => Window) {
    super();
  }

  onAny(cb: AnyEventCallback<Events>): () => void {
    const listener = (e: MessageEvent) => {
      if (!e.data || !e.data.topic || e.data.source !== this._destination) {
        return;
      }
      cb(e.data.topic, e.data.args);
    };
    window.addEventListener('message', listener);
    this._listeners.push(listener);
    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1);
      window.removeEventListener('message', listener);
    };
  }

  on<E extends keyof Events>(topic: E, cb: Events[E]): () => void {
    const listener = (e: MessageEvent) => {
      if (!e.data || e.data.source !== this._destination || !e.data.topic) {
        return;
      }
      if (e.data.topic === topic) {
        cb.apply(null, e.data.args);
      }
    };
    window.addEventListener('message', listener);
    this._listeners.push(listener);
    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1);
      window.removeEventListener('message', listener);
    };
  }

  once<E extends keyof Events>(topic: E, cb: Events[E]): void {
    const listener = (e: MessageEvent) => {
      if (!e.data || e.data.source !== this._destination || !e.data.topic) {
        return;
      }
      if (e.data.topic === topic) {
        cb.apply(null, e.data.args);
        window.removeEventListener('message', listener);
      }
    };
    window.addEventListener('message', listener);
  }

  emit<E extends keyof Events>(topic: E, args?: Parameters<Events[E]>): boolean {
    this._docWindow().postMessage(
        {
          source: this._source,
          topic,
          args,
        },
        '*');
    return true;
  }

  destroy(): void {
    this._listeners.forEach((l) => window.removeEventListener('message', l));
    this._listeners = [];
  }
}
