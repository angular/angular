/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export {
  bootstrapApplication,
  BrowserModule,
  createApplication,
  platformBrowser,
  provideProtractorTestingSupport,
} from './browser';
export {Meta} from './browser/meta';
export {Title} from './browser/title';
export {disableDebugTools, enableDebugTools} from './browser/tools/tools';
export {By} from './dom/debug/by';
export {REMOVE_STYLES_ON_COMPONENT_DESTROY} from './dom/dom_renderer';
export {EVENT_MANAGER_PLUGINS, EventManager, EventManagerPlugin} from './dom/events/event_manager';
export {
  HAMMER_GESTURE_CONFIG,
  HAMMER_LOADER,
  HammerGestureConfig,
  HammerModule,
} from './dom/events/hammer_gestures';
export {DomSanitizer} from './security/dom_sanitization_service';
export {
  HydrationFeatureKind,
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
  withI18nSupport,
  withNoHttpTransferCache,
  withIncrementalHydration,
} from './hydration';
export * from './private_export';
export {VERSION} from './version';
//# sourceMappingURL=platform-browser.js.map
