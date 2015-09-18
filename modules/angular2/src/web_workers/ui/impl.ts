/*
 * This file is the entry point for the main thread
 * It takes care of spawning the worker and sending it the initial init message
 * It also acts and the messenger between the worker thread and the renderer running on the UI
 * thread
*/

import {createInjector} from "./di_bindings";
import {MessageBus, MessageBusSink} from "angular2/src/web_workers/shared/message_bus";
import {createNgZone} from 'angular2/src/core/application_ref';
import {Injectable} from 'angular2/src/core/di';
import {BrowserDomAdapter} from 'angular2/src/core/dom/browser_adapter';
import {wtfInit} from 'angular2/src/core/profile/wtf_init';
import {WebWorkerSetup} from 'angular2/src/web_workers/ui/setup';
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
 * Creates a zone, sets up the DI providers
 * And then creates a new WebWorkerMain object to handle messages from the worker
 */
export function bootstrapUICommon(bus: MessageBus): WebWorkerApplication {
  BrowserDomAdapter.makeCurrent();
  var zone = createNgZone();
  wtfInit();
  bus.attachToZone(zone);
  return zone.run(() => {
    var injector = createInjector(zone, bus);
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

  createClientMessageBroker(channel: string, runInZone: boolean = true): ClientMessageBroker {
    return this._clientMessageBrokerFactory.createMessageBroker(channel, runInZone);
  }

  createServiceMessageBroker(channel: string, runInZone: boolean = true): ServiceMessageBroker {
    return this._serviceMessageBrokerFactory.createMessageBroker(channel, runInZone);
  }
}
