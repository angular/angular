import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {Type, CONST_EXPR, isPresent} from 'angular2/src/facade/lang';
import {Provider} from 'angular2/src/core/di';
import {Parse5DomAdapter} from 'angular2/src/platform/server/parse5_adapter';
import {
  PostMessageBus,
  PostMessageBusSink,
  PostMessageBusSource
} from 'angular2/src/web_workers/shared/post_message_bus';
import {genericWorkerAppProviders} from './worker_app_common';

// TODO(jteplitz602) remove this and compile with lib.webworker.d.ts (#3492)
interface PostMessageInterface {
  (message: any, transferrables?:[ArrayBuffer]): void;
}
var _postMessage: PostMessageInterface = <any>postMessage;

export function setupWebWorker(zone: NgZone): Promise<Array<Type | Provider | any[]>> {
  Parse5DomAdapter.makeCurrent();
  var sink = new PostMessageBusSink({
    postMessage:
        (message: any, transferrables?:[ArrayBuffer]) => { _postMessage(message, transferrables); }
  });
  var source = new PostMessageBusSource();
  var bus = new PostMessageBus(sink, source);

  return genericWorkerAppProviders(bus, zone);
}
