/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LocationChangeListener} from '@angular/common';
import {Injectable} from '@angular/core';

import {EventEmitter} from '../../facade/async';
import {BrowserPlatformLocation} from '../../private_import_platform-browser';
import {MessageBus} from '../shared/message_bus';
import {ROUTER_CHANNEL} from '../shared/messaging_api';
import {LocationType} from '../shared/serialized_types';
import {PRIMITIVE, Serializer} from '../shared/serializer';
import {ServiceMessageBroker, ServiceMessageBrokerFactory} from '../shared/service_message_broker';

@Injectable()
export class MessageBasedPlatformLocation {
  private _channelSink: EventEmitter<Object>;
  private _broker: ServiceMessageBroker;

  constructor(
      private _brokerFactory: ServiceMessageBrokerFactory,
      private _platformLocation: BrowserPlatformLocation, bus: MessageBus,
      private _serializer: Serializer) {
    this._platformLocation.onPopState(<LocationChangeListener>this._sendUrlChangeEvent.bind(this));
    this._platformLocation.onHashChange(
        <LocationChangeListener>this._sendUrlChangeEvent.bind(this));
    this._broker = this._brokerFactory.createMessageBroker(ROUTER_CHANNEL);
    this._channelSink = bus.to(ROUTER_CHANNEL);
  }

  start(): void {
    this._broker.registerMethod('getLocation', null, this._getLocation.bind(this), LocationType);
    this._broker.registerMethod('setPathname', [PRIMITIVE], this._setPathname.bind(this));
    this._broker.registerMethod(
        'pushState', [PRIMITIVE, PRIMITIVE, PRIMITIVE],
        this._platformLocation.pushState.bind(this._platformLocation));
    this._broker.registerMethod(
        'replaceState', [PRIMITIVE, PRIMITIVE, PRIMITIVE],
        this._platformLocation.replaceState.bind(this._platformLocation));
    this._broker.registerMethod(
        'forward', null, this._platformLocation.forward.bind(this._platformLocation));
    this._broker.registerMethod(
        'back', null, this._platformLocation.back.bind(this._platformLocation));
  }

  private _getLocation(): Promise<Location> {
    return Promise.resolve(this._platformLocation.location);
  }


  private _sendUrlChangeEvent(e: Event): void {
    let loc = this._serializer.serialize(this._platformLocation.location, LocationType);
    let serializedEvent = {'type': e.type};
    this._channelSink.emit({'event': serializedEvent, 'location': loc});
  }

  private _setPathname(pathname: string): void { this._platformLocation.pathname = pathname; }
}
