/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {BrowserModule, platformBrowser} from './browser';
export {Meta, MetaDefinition} from './browser/meta';
export {Title} from './browser/title';
export {disableDebugTools, enableDebugTools} from './browser/tools/tools';
export {BrowserTransferStateModule, makeStateKey, StateKey, TransferState} from './browser/transfer_state';
export {By} from './dom/debug/by';
export {EVENT_MANAGER_PLUGINS, EventManager} from './dom/events/event_manager';
export {HAMMER_GESTURE_CONFIG, HAMMER_LOADER, HAMMER_PROVIDERS__POST_R3__ as ɵHAMMER_PROVIDERS__POST_R3__, HammerGestureConfig, HammerLoader, HammerModule} from './dom/events/hammer_gestures';
export {DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl, SafeValue} from './security/dom_sanitization_service';

export * from './private_export';
export {VERSION} from './version';
// This must be exported so it doesn't get tree-shaken away prematurely
export {ELEMENT_PROBE_PROVIDERS__POST_R3__ as ɵELEMENT_PROBE_PROVIDERS__POST_R3__} from './dom/debug/ng_probe';
