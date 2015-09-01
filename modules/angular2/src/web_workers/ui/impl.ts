/*
 * This file is the entry point for the main thread
 * It takes care of spawning the worker and sending it the initial init message
 * It also acts and the messenger between the worker thread and the renderer running on the UI
 * thread
*/

import {createInjector} from "./di_bindings";
import {MessageBus, MessageBusSink} from "angular2/src/web_workers/shared/message_bus";
import {createNgZone} from 'angular2/src/core/application_common';
import {Injectable} from 'angular2/di';
import {BrowserDomAdapter} from 'angular2/src/core/dom/browser_adapter';
import {wtfInit} from 'angular2/src/core/profile/wtf_init';
import {WebWorkerSetup} from 'angular2/src/web_workers/ui/setup';
import {MessageBasedRenderCompiler} from 'angular2/src/web_workers/ui/render_compiler';
import {MessageBasedRenderer} from 'angular2/src/web_workers/ui/renderer';
import {MessageBasedXHRImpl} from 'angular2/src/web_workers/ui/xhr_impl';
import {
  ClientMessageBrokerFactory,
  ClientMessageBroker,
} from 'angular2/src/web_workers/shared/client_message_broker';
import {
  ServiceMessageBrokerFactory,
  ServiceMessageBroker
} from 'angular2/src/web_workers/shared/service_message_broker';

/**
 * Creates a zone, sets up the DI bindings
 * And then creates a new WebWorkerMain object to handle messages from the worker
 */
export function bootstrapUICommon(bus: MessageBus): WebWorkerApplication {
  BrowserDomAdapter.makeCurrent();
  var zone = createNgZone();
  wtfInit();
  return zone.run(() => {
    var injector = createInjector(zone, bus);
    injector.get(MessageBasedRenderCompiler).start();
    injector.get(MessageBasedRenderer).start();
    injector.get(MessageBasedXHRImpl).start();
    injector.get(WebWorkerSetup).start();
    return injector.get(WebWorkerApplication);
  });
}

@Injectable()
export class WebWorkerApplication {
  constructor(private _clientMessageBrokerFactory: ClientMessageBrokerFactory,
              private _serviceMessageBrokerFactory: ServiceMessageBrokerFactory) {}

  createClientMessageBroker(channel: string): ClientMessageBroker {
    return this._clientMessageBrokerFactory.createMessageBroker(channel);
  }

  createServiceMessageBroker(channel: string): ServiceMessageBroker {
    return this._serviceMessageBrokerFactory.createMessageBroker(channel);
  }
}
