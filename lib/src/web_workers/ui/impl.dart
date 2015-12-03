/*
 * This file is the entry point for the main thread
 * It takes care of spawning the worker and sending it the initial init message
 * It also acts and the messenger between the worker thread and the renderer running on the UI
 * thread
*/
library angular2.src.web_workers.ui.impl;

import "di_bindings.dart" show createInjector;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus, MessageBusSink;
import "package:angular2/src/core/application_ref.dart" show createNgZone;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/platform/browser/browser_adapter.dart"
    show BrowserDomAdapter;
import "package:angular2/src/core/profile/wtf_init.dart" show wtfInit;
import "package:angular2/src/web_workers/ui/setup.dart" show WebWorkerSetup;
import "package:angular2/src/web_workers/ui/renderer.dart"
    show MessageBasedRenderer;
import "package:angular2/src/web_workers/ui/xhr_impl.dart"
    show MessageBasedXHRImpl;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show ClientMessageBrokerFactory, ClientMessageBroker;
import "package:angular2/src/web_workers/shared/service_message_broker.dart"
    show ServiceMessageBrokerFactory, ServiceMessageBroker;

/**
 * Creates a zone, sets up the DI providers
 * And then creates a new WebWorkerMain object to handle messages from the worker
 */
WebWorkerApplication bootstrapUICommon(MessageBus bus) {
  BrowserDomAdapter.makeCurrent();
  var zone = createNgZone();
  wtfInit();
  bus.attachToZone(zone);
  return zone.run(() {
    var injector = createInjector(zone, bus);
    injector.get(MessageBasedRenderer).start();
    injector.get(MessageBasedXHRImpl).start();
    injector.get(WebWorkerSetup).start();
    return injector.get(WebWorkerApplication);
  });
}

@Injectable()
class WebWorkerApplication {
  ClientMessageBrokerFactory _clientMessageBrokerFactory;
  ServiceMessageBrokerFactory _serviceMessageBrokerFactory;
  WebWorkerApplication(
      this._clientMessageBrokerFactory, this._serviceMessageBrokerFactory) {}
  ClientMessageBroker createClientMessageBroker(String channel,
      [bool runInZone = true]) {
    return this
        ._clientMessageBrokerFactory
        .createMessageBroker(channel, runInZone);
  }

  ServiceMessageBroker createServiceMessageBroker(String channel,
      [bool runInZone = true]) {
    return this
        ._serviceMessageBrokerFactory
        .createMessageBroker(channel, runInZone);
  }
}
