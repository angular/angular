/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgZone} from '@angular/core';
import {Events, MessageBus, Parameters} from 'protocol';

import {ChromeMessageBus} from './chrome-message-bus';

export class ZoneAwareChromeMessageBus extends MessageBus<Events> {
  private _bus: ChromeMessageBus;
  constructor(port: chrome.runtime.Port, private _ngZone: NgZone) {
    super();
    this._bus = new ChromeMessageBus(port);
  }

  on<E extends keyof Events>(topic: E, cb: Events[E]): void {
    this._bus.on(topic, function(): void {
      this._ngZone.run(() => cb.apply(null, arguments));
    }.bind(this));
  }

  once<E extends keyof Events>(topic: E, cb: Events[E]): void {
    this._bus.once(topic, function(): void {
      this._ngZone.run(() => cb.apply(null, arguments));
    }.bind(this));
  }

  emit<E extends keyof Events>(topic: E, args?: Parameters<Events[E]>): boolean {
    this._ngZone.run(() => this._bus.emit(topic, args));
    return true;
  }

  destroy(): void {
    this._bus.destroy();
  }
}
