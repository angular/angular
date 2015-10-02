import {Injectable} from 'angular2/src/core/di';
import {PRIMITIVE} from 'angular2/src/web_workers/shared/serializer';
import {XHR_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {XHR} from 'angular2/src/core/compiler/xhr';
import {ServiceMessageBrokerFactory} from 'angular2/src/web_workers/shared/service_message_broker';
import {bind} from './bind';

@Injectable()
export class MessageBasedXHRImpl {
  constructor(private _brokerFactory: ServiceMessageBrokerFactory, private _xhr: XHR) {}

  start(): void {
    var broker = this._brokerFactory.createMessageBroker(XHR_CHANNEL);
    broker.registerMethod("get", [PRIMITIVE], bind(this._xhr.get, this._xhr), PRIMITIVE);
  }
}
