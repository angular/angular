import {Injectable} from 'angular2/di';
import {Promise} from 'angular2/src/facade/async';
import {XHR} from 'angular2/src/render/xhr';
import {FnArg, UiArguments, MessageBroker} from 'angular2/src/web-workers/worker/broker';

/**
 * Implementation of render/xhr that relays XHR requests to the UI side where they are sent
 * and the result is proxied back to the worker
 */
@Injectable()
export class WebWorkerXHRImpl extends XHR {
  constructor(private _messageBroker: MessageBroker) { super(); }

  get(url: string): Promise<string> {
    var fnArgs: List<FnArg> = [new FnArg(url, null)];
    var args: UiArguments = new UiArguments("xhr", "get", fnArgs);
    return this._messageBroker.runOnUiThread(args, String);
  }
}
