import {Injectable} from '@angular/core';
import {PRIMITIVE} from '../shared/serializer';
import {ServiceMessageBrokerFactory} from '../shared/service_message_broker';
import {XHR_CHANNEL} from '../shared/messaging_api';
import {XHR} from '@angular/compiler';
import {FunctionWrapper} from '../../facade/lang';

/**
 * XHR requests triggered on the worker side are executed on the UI side.
 *
 * This is only strictly required for Dart where the isolates do not have access to XHRs.
 *
 * @internal
 */
@Injectable()
export class MessageBasedXHRImpl {
  constructor(private _brokerFactory: ServiceMessageBrokerFactory, private _xhr: XHR) {}

  start(): void {
    var broker = this._brokerFactory.createMessageBroker(XHR_CHANNEL);
    broker.registerMethod("get", [PRIMITIVE], FunctionWrapper.bind(this._xhr.get, this._xhr),
                          PRIMITIVE);
  }
}
