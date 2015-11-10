library angular2.src.web_workers.ui.xhr_impl;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/web_workers/shared/serializer.dart" show PRIMITIVE;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show XHR_CHANNEL;
import "package:angular2/src/compiler/xhr.dart" show XHR;
import "package:angular2/src/web_workers/shared/service_message_broker.dart"
    show ServiceMessageBrokerFactory;
import "bind.dart" show bind;

@Injectable()
class MessageBasedXHRImpl {
  ServiceMessageBrokerFactory _brokerFactory;
  XHR _xhr;
  MessageBasedXHRImpl(this._brokerFactory, this._xhr) {}
  void start() {
    var broker = this._brokerFactory.createMessageBroker(XHR_CHANNEL);
    broker.registerMethod(
        "get", [PRIMITIVE], bind(this._xhr.get, this._xhr), PRIMITIVE);
  }
}
