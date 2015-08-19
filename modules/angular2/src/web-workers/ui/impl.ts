/*
 * This file is the entry point for the main thread
 * It takes care of spawning the worker and sending it the initial init message
 * It also acts and the messenger between the worker thread and the renderer running on the UI
 * thread
*/

import {createInjector} from "./di_bindings";
import {MessageBus, MessageBusSink} from "angular2/src/web-workers/shared/message_bus";
import {createNgZone} from 'angular2/src/core/application_common';
import {Injectable} from 'angular2/di';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';
import {wtfInit} from 'angular2/src/profile/wtf_init';
import {WebWorkerSetup} from 'angular2/src/web-workers/ui/setup';
import {MessageBasedRenderCompiler} from 'angular2/src/web-workers/ui/render_compiler';
import {MessageBasedRenderer} from 'angular2/src/web-workers/ui/renderer';
import {MessageBasedXHRImpl} from 'angular2/src/web-workers/ui/xhr_impl';

/**
 * Creates a zone, sets up the DI bindings
 * And then creates a new WebWorkerMain object to handle messages from the worker
 */
export function bootstrapUICommon(bus: MessageBus) {
  BrowserDomAdapter.makeCurrent();
  var zone = createNgZone();
  wtfInit();
  zone.run(() => {
    var injector = createInjector(zone, bus);
    // necessary to kick off all the message based components
    injector.get(WebWorkerMain);
  });
}

@Injectable()
export class WebWorkerMain {
  constructor(public renderCompiler: MessageBasedRenderCompiler,
              public renderer: MessageBasedRenderer, public xhr: MessageBasedXHRImpl,
              public setup: WebWorkerSetup) {}
}

export class ReceivedMessage {
  method: string;
  args: List<any>;
  id: string;
  type: string;

  constructor(data: StringMap<string, any>) {
    this.method = data['method'];
    this.args = data['args'];
    this.id = data['id'];
    this.type = data['type'];
  }
}

export interface UIComponent { attachToMessageBus(bus: MessageBus): void; }
