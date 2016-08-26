/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ClassProvider, ExistingProvider, FactoryProvider, TypeProvider, ValueProvider} from '@angular/core';

import * as browser from './src/browser';
import * as browserDomAdapter from './src/browser/browser_adapter';
import * as ng_probe from './src/dom/debug/ng_probe';
import * as dom_adapter from './src/dom/dom_adapter';
import * as dom_renderer from './src/dom/dom_renderer';
import * as dom_events from './src/dom/events/dom_events';
import * as shared_styles_host from './src/dom/shared_styles_host';

export interface __platform_browser_private_types__ {
  DomAdapter: dom_adapter.DomAdapter;
  BrowserDomAdapter: typeof browserDomAdapter.BrowserDomAdapter;
  getDOM: typeof dom_adapter.getDOM;
  DomRootRenderer: dom_renderer.DomRootRenderer;
  DomRootRenderer_: dom_renderer.DomRootRenderer_;
  DomSharedStylesHost: shared_styles_host.DomSharedStylesHost;
  SharedStylesHost: shared_styles_host.SharedStylesHost;
  ELEMENT_PROBE_PROVIDERS: typeof ng_probe.ELEMENT_PROBE_PROVIDERS;
  DomEventsPlugin: dom_events.DomEventsPlugin;
  INTERNAL_BROWSER_PLATFORM_PROVIDERS: typeof browser.INTERNAL_BROWSER_PLATFORM_PROVIDERS;
}

export var __platform_browser_private__ = {
  DomAdapter: dom_adapter.DomAdapter,
  BrowserDomAdapter: browserDomAdapter.BrowserDomAdapter,
  getDOM: dom_adapter.getDOM,
  setRootDomAdapter: dom_adapter.setRootDomAdapter,
  DomRootRenderer: dom_renderer.DomRootRenderer,
  DomRootRenderer_: dom_renderer.DomRootRenderer_,
  DomSharedStylesHost: shared_styles_host.DomSharedStylesHost,
  SharedStylesHost: shared_styles_host.SharedStylesHost,
  ELEMENT_PROBE_PROVIDERS: ng_probe.ELEMENT_PROBE_PROVIDERS,
  DomEventsPlugin: dom_events.DomEventsPlugin,
  initDomAdapter: browser.initDomAdapter,
  INTERNAL_BROWSER_PLATFORM_PROVIDERS: browser.INTERNAL_BROWSER_PLATFORM_PROVIDERS
};
