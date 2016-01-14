import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
/**
 * Wrapper class that exposes the Worker
 * and underlying {@link MessageBus} for lower level message passing.
 */
export declare class WebWorkerInstance {
    worker: Worker;
    bus: MessageBus;
}
/**
 * An array of providers that should be passed into `application()` when initializing a new Worker.
 */
export declare const WORKER_RENDER_APPLICATION: Array<any>;
