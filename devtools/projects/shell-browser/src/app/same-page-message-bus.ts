/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Events, MessageBus, Parameters} from '../../../protocol';

type AnyEventCallback<Ev> = <E extends keyof Ev>(topic: E, args: Parameters<Ev[E]>) => void;

type ListenerFn = (e: MessageEvent) => void;

export class SamePageMessageBus extends MessageBus<Events> {
  private _listeners: ListenerFn[] = [];

  constructor(
    private _source: string,
    private _destination: string,
  ) {
    super();
  }

  onAny(cb: AnyEventCallback<Events>): () => void {
    const listener: ListenerFn = (e) => {
      if (e.source !== window || !e.data || !e.data.topic || e.data.source !== this._destination) {
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

  override on<E extends keyof Events>(topic: E, cb: Events[E]): () => void {
    const listener: ListenerFn = (e) => {
      if (e.source !== window || !e.data || e.data.source !== this._destination || !e.data.topic) {
        return;
      }
      if (e.data.topic === topic) {
        (cb as any).apply(null, e.data.args);
      }
    };
    window.addEventListener('message', listener);
    this._listeners.push(listener);
    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1);
      window.removeEventListener('message', listener);
    };
  }

  override once<E extends keyof Events>(topic: E, cb: Events[E]): void {
    const listener: ListenerFn = (e) => {
      if (e.source !== window || !e.data || e.data.source !== this._destination || !e.data.topic) {
        return;
      }
      if (e.data.topic === topic) {
        (cb as any).apply(null, e.data.args);
      }
      window.removeEventListener('message', listener);
    };
    window.addEventListener('message', listener);
  }

  override emit<E extends keyof Events>(topic: E, args?: Parameters<Events[E]>): boolean {
    window.postMessage(
      {
        source: this._source,
        topic,
        args,
        __ignore_ng_zone__: true,
        __NG_DEVTOOLS_EVENT__: true,
      },
      '*',
    );
    return true;
  }

  override destroy(): void {
    this._listeners.forEach((l) => window.removeEventListener('message', l));
    this._listeners = [];
  }
}
