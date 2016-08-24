/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {BrowserModule, platformBrowser} from './browser';
export {BrowserPlatformLocation} from './browser/location/browser_platform_location';
export {Title} from './browser/title';
export {disableDebugTools, enableDebugTools} from './browser/tools/tools';
export {AnimationDriver} from './dom/animation_driver';
export {By} from './dom/debug/by';
export {DOCUMENT} from './dom/dom_tokens';
export {EVENT_MANAGER_PLUGINS, EventManager} from './dom/events/event_manager';
export {HAMMER_GESTURE_CONFIG, HammerGestureConfig} from './dom/events/hammer_gestures';
export {DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl} from './security/dom_sanitization_service';
// Web Workers
export {ClientMessageBroker, ClientMessageBrokerFactory, FnArg, UiArguments} from './web_workers/shared/client_message_broker';
export {PRIMITIVE} from './web_workers/shared/serializer';
export {ReceivedMessage, ServiceMessageBroker, ServiceMessageBrokerFactory} from './web_workers/shared/service_message_broker';

export * from './web_workers/shared/message_bus';
export {WORKER_APP_LOCATION_PROVIDERS} from './web_workers/worker/location_providers';
export {WORKER_UI_LOCATION_PROVIDERS} from './web_workers/ui/location_providers';

export {NgProbeToken} from './dom/debug/ng_probe';
export {platformWorkerUi, WebWorkerInstance, WORKER_SCRIPT, WORKER_UI_STARTABLE_MESSAGING_SERVICE} from './worker_render';
export {platformWorkerApp, WorkerAppModule} from './worker_app';
export * from './private_export';
