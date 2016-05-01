import { Injector, OpaqueToken } from 'angular2/src/core/di';
export declare const WORKER_SCRIPT: OpaqueToken;
export declare const WORKER_RENDER_MESSAGING_PROVIDERS: Array<any>;
export declare const WORKER_RENDER_PLATFORM_MARKER: OpaqueToken;
export declare const WORKER_RENDER_PLATFORM: Array<any>;
/**
 * A list of {@link Provider}s. To use the router in a Worker enabled application you must
 * include these providers when setting up the render thread.
 */
export declare const WORKER_RENDER_ROUTER: Array<any>;
export declare const WORKER_RENDER_APPLICATION_COMMON: Array<any>;
export declare function initializeGenericWorkerRenderer(injector: Injector): void;
export declare function initWebWorkerRenderPlatform(): void;
