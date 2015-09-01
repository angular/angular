import {Injectable} from 'angular2/di';
import {Promise} from 'angular2/src/core/facade/async';
import {XHR} from 'angular2/src/core/render/xhr';
import {
  FnArg,
  UiArguments,
  ClientMessageBroker,
  ClientMessageBrokerFactory
} from 'angular2/src/web_workers/shared/client_message_broker';
import {XHR_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';

/**
 * Implementation of render/xhr that relays XHR requests to the UI side where they are sent
 * and the result is proxied back to the worker
 */
@Injectable()
export class WebWorkerXHRImpl extends XHR {
  private _messageBroker: ClientMessageBroker;

  constructor(messageBrokerFactory: ClientMessageBrokerFactory) {
    super();
    this._messageBroker = messageBrokerFactory.createMessageBroker(XHR_CHANNEL);
  }

  get(url: string): Promise<string> {
    var fnArgs: FnArg[] = [new FnArg(url, null)];
    var args: UiArguments = new UiArguments("get", fnArgs);
    return this._messageBroker.runOnService(args, String);
  }
}
