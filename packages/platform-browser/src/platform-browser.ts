/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {ApplicationConfig, bootstrapApplication, BrowserModule, platformBrowser} from './browser.js';
export {Meta, MetaDefinition} from './browser/meta.js';
export {Title} from './browser/title.js';
export {disableDebugTools, enableDebugTools} from './browser/tools/tools.js';
export {BrowserTransferStateModule, makeStateKey, StateKey, TransferState} from './browser/transfer_state.js';
export {By} from './dom/debug/by.js';
export {EVENT_MANAGER_PLUGINS, EventManager} from './dom/events/event_manager.js';
export {HAMMER_GESTURE_CONFIG, HAMMER_LOADER, HammerGestureConfig, HammerLoader, HammerModule} from './dom/events/hammer_gestures.js';
export {DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl, SafeValue} from './security/dom_sanitization_service.js';

export * from './private_export.js';
export {VERSION} from './version.js';
