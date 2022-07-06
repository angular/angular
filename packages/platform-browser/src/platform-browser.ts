/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {ApplicationConfig, bootstrapApplication, BrowserModule, createApplication, platformBrowser, provideProtractorTestingSupport} from './browser';
export {Meta, MetaDefinition} from './browser/meta';
export {Title} from './browser/title';
export {disableDebugTools, enableDebugTools} from './browser/tools/tools';
export {BrowserTransferStateModule, makeStateKey, StateKey, TransferState} from './browser/transfer_state';
export {By} from './dom/debug/by';
export {EVENT_MANAGER_PLUGINS, EventManager} from './dom/events/event_manager';
export {HAMMER_GESTURE_CONFIG, HAMMER_LOADER, HammerGestureConfig, HammerLoader, HammerModule} from './dom/events/hammer_gestures';
export {DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl, SafeValue} from './security/dom_sanitization_service';

export * from './private_export';
export {VERSION} from './version';
