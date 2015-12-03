import { Type } from 'angular2/src/facade/lang';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { Provider } from 'angular2/src/core/di';
import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { Promise } from 'angular2/src/facade/async';
export declare const WORKER_APP_PLATFORM: Array<any>;
export declare const WORKER_APP_COMMON_PROVIDERS: Array<any>;
/**
 * Asynchronously returns a list of providers that can be used to initialize the
 * Application injector.
 * Also takes care of attaching the {@link MessageBus} to the given {@link NgZone}.
 */
export declare function genericWorkerAppProviders(bus: MessageBus, zone: NgZone): Promise<Array<Type | Provider | any[]>>;
