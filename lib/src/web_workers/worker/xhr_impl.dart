library angular2.src.web_workers.worker.xhr_impl;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/async.dart" show Future;
import "package:angular2/src/compiler/xhr.dart" show XHR;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show FnArg, UiArguments, ClientMessageBroker, ClientMessageBrokerFactory;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show XHR_CHANNEL;

/**
 * Implementation of compiler/xhr that relays XHR requests to the UI side where they are sent
 * and the result is proxied back to the worker
 */
@Injectable()
class WebWorkerXHRImpl extends XHR {
  ClientMessageBroker _messageBroker;
  WebWorkerXHRImpl(ClientMessageBrokerFactory messageBrokerFactory) : super() {
    /* super call moved to initializer */;
    this._messageBroker = messageBrokerFactory.createMessageBroker(XHR_CHANNEL);
  }
  Future<String> get(String url) {
    List<FnArg> fnArgs = [new FnArg(url, null)];
    UiArguments args = new UiArguments("get", fnArgs);
    return this._messageBroker.runOnService(args, String);
  }
}
