import { PostMessageBus, PostMessageBusSink, PostMessageBusSource } from 'angular2/src/web_workers/shared/post_message_bus';
import { bootstrapUICommon } from 'angular2/src/web_workers/ui/impl';
export { WebWorkerApplication } from 'angular2/src/web_workers/ui/impl';
export * from 'angular2/src/web_workers/shared/message_bus';
/**
 * Bootstrapping a WebWorker
 *
 * You instantiate a WebWorker application by calling bootstrap with the URI of your worker's index
 * script
 * Note: The WebWorker script must call bootstrapWebworker once it is set up to complete the
 * bootstrapping process
 */
export function bootstrap(uri) {
    var instance = spawnWebWorker(uri);
    instance.app = bootstrapUICommon(instance.bus);
    return instance;
}
export function spawnWebWorker(uri) {
    var webWorker = new Worker(uri);
    var sink = new PostMessageBusSink(webWorker);
    var source = new PostMessageBusSource(webWorker);
    var bus = new PostMessageBus(sink, source);
    return new WebWorkerInstance(null, webWorker, bus);
}
/**
 * Wrapper class that exposes the {@link WebWorkerApplication}
 * Isolate instance and underlying {@link MessageBus} for lower level message passing.
 */
export class WebWorkerInstance {
    constructor(app, worker, bus) {
        this.app = app;
        this.worker = worker;
        this.bus = bus;
    }
}
//# sourceMappingURL=application.js.map