import { Parse5DomAdapter } from 'angular2/src/platform/server/parse5_adapter';
import { PostMessageBus, PostMessageBusSink, PostMessageBusSource } from 'angular2/src/web_workers/shared/post_message_bus';
import { genericWorkerAppProviders } from './worker_app_common';
var _postMessage = postMessage;
export function setupWebWorker(zone) {
    Parse5DomAdapter.makeCurrent();
    var sink = new PostMessageBusSink({
        postMessage: (message, transferrables) => { _postMessage(message, transferrables); }
    });
    var source = new PostMessageBusSource();
    var bus = new PostMessageBus(sink, source);
    return genericWorkerAppProviders(bus, zone);
}
