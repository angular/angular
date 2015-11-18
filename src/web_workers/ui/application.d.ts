import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { WebWorkerApplication } from 'angular2/src/web_workers/ui/impl';
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
export declare function bootstrap(uri: string): WebWorkerInstance;
export declare function spawnWebWorker(uri: string): WebWorkerInstance;
/**
 * Wrapper class that exposes the {@link WebWorkerApplication}
 * Isolate instance and underlying {@link MessageBus} for lower level message passing.
 */
export declare class WebWorkerInstance {
    app: WebWorkerApplication;
    worker: Worker;
    bus: MessageBus;
    constructor(app: WebWorkerApplication, worker: Worker, bus: MessageBus);
}
