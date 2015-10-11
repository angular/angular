import {
  PostMessageBus,
  PostMessageBusSink,
  PostMessageBusSource
} from 'angular2/src/web_workers/shared/post_message_bus';
import {Type} from "angular2/src/core/facade/lang";
import {Provider, Injectable} from "angular2/src/core/di";
import {Map} from 'angular2/src/core/facade/collection';
import {Promise} from 'angular2/src/core/facade/async';
import {bootstrapWebWorkerCommon} from "angular2/src/web_workers/worker/application_common";
import {ComponentRef} from "angular2/src/core/linker/dynamic_component_loader";
export * from "angular2/src/web_workers/shared/message_bus";
import {Parse5DomAdapter} from 'angular2/src/core/dom/parse5_adapter';

// TODO(jteplitz602) remove this and compile with lib.webworker.d.ts (#3492)
interface PostMessageInterface {
  (message: any, transferrables?:[ArrayBuffer]): void;
}
var _postMessage: PostMessageInterface = <any>postMessage;

/**
 * Bootstrapping a Webworker Application
 *
 * You instantiate the application side by calling bootstrapWebworker from your webworker index
 * script.
 * You can call bootstrapWebworker() exactly as you would call bootstrap() in a regular Angular
 * application
 * See the bootstrap() docs for more details.
 */
export function bootstrapWebWorker(
    appComponentType: Type, componentInjectableProviders: Array<Type | Provider | any[]> = null):
    Promise<ComponentRef> {
  Parse5DomAdapter.makeCurrent();
  var sink = new PostMessageBusSink({
    postMessage: (message: any, transferrables?:[ArrayBuffer]) => {
      console.log("Sending", message);
      _postMessage(message, transferrables);
    }
  });
  var source = new PostMessageBusSource();
  var bus = new PostMessageBus(sink, source);

  return bootstrapWebWorkerCommon(appComponentType, bus, componentInjectableProviders);
}
