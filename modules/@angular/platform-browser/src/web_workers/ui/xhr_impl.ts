import {Injectable} from '@angular/core';
import {PRIMITIVE} from '../shared/serializer';
import {XHR_CHANNEL} from '../shared/messaging_api';
import {XHR} from '@angular/compiler';
import {ServiceMessageBrokerFactory} from '../shared/service_message_broker';
import {bind} from './bind';

@Injectable()
export class MessageBasedXHRImpl {
  constructor(private _brokerFactory: ServiceMessageBrokerFactory, private _xhr: XHR) {}

  start(): void {
    var broker = this._brokerFactory.createMessageBroker(XHR_CHANNEL);
    broker.registerMethod("get", [PRIMITIVE], bind(this._xhr.get, this._xhr), PRIMITIVE);
  }
}
