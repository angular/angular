import {Injectable} from 'angular2/di';
import {PRIMITIVE} from 'angular2/src/web_workers/shared/serializer';
import {XHR_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {XHR} from 'angular2/src/render/xhr';
import {ServiceMessageBrokerFactory} from 'angular2/src/web_workers/shared/service_message_broker';
import {bind} from './bind';

@Injectable()
export class MessageBasedXHRImpl {
  constructor(brokerFactory: ServiceMessageBrokerFactory, private _xhr: XHR) {
    var broker = brokerFactory.createMessageBroker(XHR_CHANNEL);
    broker.registerMethod("get", [PRIMITIVE], bind(this._xhr.get, this._xhr), PRIMITIVE);
  }
}
