/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {BrowserModule, platformBrowser} from './browser';
export {Meta, MetaDefinition} from './browser/meta';
export {Title} from './browser/title';
export {disableDebugTools, enableDebugTools} from './browser/tools/tools';
export {By} from './dom/debug/by';
export {NgProbeToken} from './dom/debug/ng_probe';
export {DOCUMENT} from './dom/dom_tokens';
export {EVENT_MANAGER_PLUGINS, EventManager} from './dom/events/event_manager';
export {HAMMER_GESTURE_CONFIG, HammerGestureConfig} from './dom/events/hammer_gestures';
export {DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl, SafeValue} from './security/dom_sanitization_service';
export * from './private_export';
export {VERSION} from './version';
