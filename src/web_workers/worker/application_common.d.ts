import { Provider } from 'angular2/src/core/di';
import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { PlatformRef } from 'angular2/core';
import { ComponentRef } from 'angular2/src/core/linker/dynamic_component_loader';
/**
 * Initialize the Angular 'platform' on the page in a manner suitable for applications
 * running in a web worker. Applications running on a web worker do not have direct
 * access to DOM APIs.
 *
 * See {@link PlatformRef} for details on the Angular platform.
 *
 * ### Without specified providers
 *
 * If no providers are specified, `platform`'s behavior depends on whether an existing
 * platform exists:
 *
 * If no platform exists, a new one will be created with the default {@link platformProviders}.
 *
 * If a platform already exists, it will be returned (regardless of what providers it
 * was created with). This is a convenience feature, allowing for multiple applications
 * to be loaded into the same platform without awareness of each other.
 *
 * ### With specified providers
 *
 * It is also possible to specify providers to be made in the new platform. These providers
 * will be shared between all applications on the page. For example, an abstraction for
 * the browser cookie jar should be bound at the platform level, because there is only one
 * cookie jar regardless of how many applications on the age will be accessing it.
 *
 * If providers are specified directly, `platform` will create the Angular platform with
 * them if a platform did not exist already. If it did exist, however, an error will be
 * thrown.
 *
 * ### For Web Worker Applications
 *
 * This version of `platform` initializes Angular for use with applications
 * that do not directly touch the DOM, such as applications which run in a
 * web worker context. Applications that need direct access to the DOM should
 * use `platform` from `core/application_common` instead.
 */
export declare function platform(providers?: Array<Type | Provider | any[]>): PlatformRef;
export declare function bootstrapWebWorkerCommon(appComponentType: Type, bus: MessageBus, appProviders?: Array<Type | Provider | any[]>): Promise<ComponentRef>;
