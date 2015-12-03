import { Injector, OpaqueToken } from 'angular2/src/core/di';
export declare const WORKER_SCRIPT: OpaqueToken;
export declare const WORKER_RENDER_MESSAGING_PROVIDERS: Array<any>;
export declare const WORKER_RENDER_PLATFORM: Array<any>;
export declare const WORKER_RENDER_APP_COMMON: Array<any>;
export declare function initializeGenericWorkerRenderer(injector: Injector): void;
export declare function initWebWorkerRenderPlatform(): void;
