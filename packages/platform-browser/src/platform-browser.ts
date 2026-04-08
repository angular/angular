/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {
  bootstrapApplication,
  BootstrapContext,
  BrowserModule,
  createApplication,
  platformBrowser,
  provideProtractorTestingSupport,
} from './browser';
export {Meta, MetaDefinition} from './browser/meta';
export {Title} from './browser/title';
export {disableDebugTools, enableDebugTools} from './browser/tools/tools';
export {By} from './dom/debug/by';
export {REMOVE_STYLES_ON_COMPONENT_DESTROY} from './dom/dom_renderer';
export {EVENT_MANAGER_PLUGINS, EventManager} from './dom/events/event_manager';
export {EventManagerPlugin} from './dom/events/event_manager_plugin';
export {
  HydrationFeature,
  HydrationFeatureKind,
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
  withI18nSupport,
  withIncrementalHydration,
  withNoIncrementalHydration,
  withNoHttpTransferCache,
} from './hydration';
export {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
  SafeScript,
  SafeStyle,
  SafeUrl,
  SafeValue,
} from './security/dom_sanitization_service';

export * from './private_export';
export {VERSION} from './version';
