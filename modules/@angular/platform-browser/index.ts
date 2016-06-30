/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {BROWSER_APP_PROVIDERS, BROWSER_PLATFORM_PROVIDERS, BROWSER_SANITIZATION_PROVIDERS, BrowserModule, bootstrapModuleFactory, browserPlatform} from './src/browser';
export {BrowserPlatformLocation} from './src/browser/location/browser_platform_location';
export {Title} from './src/browser/title';
export {disableDebugTools, enableDebugTools} from './src/browser/tools/tools';
export {AnimationDriver} from './src/dom/animation_driver';
export {By} from './src/dom/debug/by';
export {DOCUMENT} from './src/dom/dom_tokens';
export {EVENT_MANAGER_PLUGINS, EventManager} from './src/dom/events/event_manager';
export {HAMMER_GESTURE_CONFIG, HammerGestureConfig} from './src/dom/events/hammer_gestures';
export {DomSanitizationService, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl} from './src/security/dom_sanitization_service';
// Web Workers
export {ClientMessageBroker, ClientMessageBrokerFactory, FnArg, UiArguments} from './src/web_workers/shared/client_message_broker';
export {PRIMITIVE} from './src/web_workers/shared/serializer';
export {ReceivedMessage, ServiceMessageBroker, ServiceMessageBrokerFactory} from './src/web_workers/shared/service_message_broker';

export * from './src/web_workers/shared/message_bus';
export {WORKER_APP_LOCATION_PROVIDERS} from './src/web_workers/worker/location_providers';
export {WORKER_UI_LOCATION_PROVIDERS} from './src/web_workers/ui/location_providers';

export * from './src/worker_render';
export * from './src/worker_app';

export * from './private_export';
