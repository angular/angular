/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LocationChangeListener, PlatformLocation} from '@angular/common';
import {EventEmitter, Injectable} from '@angular/core';
import {ClientMessageBroker, ClientMessageBrokerFactory, FnArg, UiArguments} from '../shared/client_message_broker';
import {MessageBus} from '../shared/message_bus';
import {ROUTER_CHANNEL} from '../shared/messaging_api';
import {LocationType, Serializer, SerializerTypes} from '../shared/serializer';

@Injectable()
export class WebWorkerPlatformLocation extends PlatformLocation {
  private _broker: ClientMessageBroker;
  private _popStateListeners: Array<Function> = [];
  private _hashChangeListeners: Array<Function> = [];
  private _location: LocationType = null !;
  private _channelSource: EventEmitter<Object>;
  public initialized: Promise<any>;
  private initializedResolve: () => void;

  constructor(
      brokerFactory: ClientMessageBrokerFactory, bus: MessageBus, private _serializer: Serializer) {
    super();
    this._broker = brokerFactory.createMessageBroker(ROUTER_CHANNEL);
    this._channelSource = bus.from(ROUTER_CHANNEL);

    this._channelSource.subscribe({
      next: (msg: {[key: string]: any}) => {
        let listeners: Array<Function>|null = null;
        if (msg.hasOwnProperty('event')) {
          const type: string = msg['event']['type'];
          if (type === 'popstate') {
            listeners = this._popStateListeners;
          } else if (type === 'hashchange') {
            listeners = this._hashChangeListeners;
          }

          if (listeners) {
            // There was a popState or hashChange event, so the location object thas been updated
            this._location = this._serializer.deserialize(msg['location'], LocationType);
            listeners.forEach((fn: Function) => fn(msg['event']));
          }
        }
      }
    });
    this.initialized = new Promise(res => this.initializedResolve = res);
  }

  /** @internal **/
  init(): Promise<boolean> {
    const args: UiArguments = new UiArguments('getLocation');

    return this._broker.runOnService(args, LocationType) !.then(
        (val: LocationType) => {
          this._location = val;
          this.initializedResolve();
          return true;
        },
        err => { throw new Error(err); });
  }

  getBaseHrefFromDOM(): string {
    throw new Error(
        'Attempt to get base href from DOM from WebWorker. You must either provide a value for the APP_BASE_HREF token through DI or use the hash location strategy.');
  }

  onPopState(fn: LocationChangeListener): void { this._popStateListeners.push(fn); }

  onHashChange(fn: LocationChangeListener): void { this._hashChangeListeners.push(fn); }

  get pathname(): string { return this._location ? this._location.pathname ! : '<unknown>'; }

  get search(): string { return this._location ? this._location.search : '<unknown>'; }

  get hash(): string { return this._location ? this._location.hash : '<unknown>'; }

  set pathname(newPath: string) {
    if (this._location === null) {
      throw new Error('Attempt to set pathname before value is obtained from UI');
    }

    this._location.pathname = newPath;

    const fnArgs = [new FnArg(newPath, SerializerTypes.PRIMITIVE)];
    const args = new UiArguments('setPathname', fnArgs);
    this._broker.runOnService(args, null);
  }

  pushState(state: any, title: string, url: string): void {
    const fnArgs = [
      new FnArg(state, SerializerTypes.PRIMITIVE),
      new FnArg(title, SerializerTypes.PRIMITIVE),
      new FnArg(url, SerializerTypes.PRIMITIVE),
    ];
    const args = new UiArguments('pushState', fnArgs);
    this._broker.runOnService(args, null);
  }

  replaceState(state: any, title: string, url: string): void {
    const fnArgs = [
      new FnArg(state, SerializerTypes.PRIMITIVE),
      new FnArg(title, SerializerTypes.PRIMITIVE),
      new FnArg(url, SerializerTypes.PRIMITIVE),
    ];
    const args = new UiArguments('replaceState', fnArgs);
    this._broker.runOnService(args, null);
  }

  forward(): void {
    const args = new UiArguments('forward');
    this._broker.runOnService(args, null);
  }

  back(): void {
    const args = new UiArguments('back');
    this._broker.runOnService(args, null);
  }
}
