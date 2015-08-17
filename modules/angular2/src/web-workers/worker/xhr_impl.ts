import {Injectable} from 'angular2/di';
import {Promise} from 'angular2/src/facade/async';
import {XHR} from 'angular2/src/render/xhr';
import {
  FnArg,
  UiArguments,
  MessageBroker,
  MessageBrokerFactory
} from 'angular2/src/web-workers/worker/broker';
import {XHR_CHANNEL} from 'angular2/src/web-workers/shared/messaging_api';

/**
 * Implementation of render/xhr that relays XHR requests to the UI side where they are sent
 * and the result is proxied back to the worker
 */
@Injectable()
export class WebWorkerXHRImpl extends XHR {
  private _messageBroker: MessageBroker;

  constructor(messageBrokerFactory: MessageBrokerFactory) {
    super();
    this._messageBroker = messageBrokerFactory.createMessageBroker(XHR_CHANNEL);
  }

  get(url: string): Promise<string> {
    var fnArgs: List<FnArg> = [new FnArg(url, null)];
    var args: UiArguments = new UiArguments("get", fnArgs);
    return this._messageBroker.runOnUiThread(args, String);
  }
}
