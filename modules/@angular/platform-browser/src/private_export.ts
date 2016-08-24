/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ClassProvider, ExistingProvider, FactoryProvider, Provider, TypeProvider, ValueProvider} from '@angular/core';

import * as browser from './browser';
import * as browserDomAdapter from './browser/browser_adapter';
import * as ng_probe from './dom/debug/ng_probe';
import * as dom_adapter from './dom/dom_adapter';
import * as dom_renderer from './dom/dom_renderer';
import * as dom_events from './dom/events/dom_events';
import * as shared_styles_host from './dom/shared_styles_host';

export var __platform_browser_private__: {
  _DomAdapter?: typeof dom_adapter.DomAdapter; DomAdapter: typeof dom_adapter.DomAdapter;
  _BrowserDomAdapter?: typeof browserDomAdapter.BrowserDomAdapter;
  BrowserDomAdapter: typeof browserDomAdapter.BrowserDomAdapter;
  getDOM: typeof dom_adapter.getDOM;
  setRootDomAdapter: typeof dom_adapter.setRootDomAdapter;
  _DomRootRenderer_?: typeof dom_renderer.DomRootRenderer;
  DomRootRenderer_: typeof dom_renderer.DomRootRenderer_;
  _DomSharedStylesHost?: typeof shared_styles_host.DomSharedStylesHost;
  DomSharedStylesHost: typeof shared_styles_host.DomSharedStylesHost;
  _SharedStylesHost?: typeof shared_styles_host.SharedStylesHost;
  SharedStylesHost: typeof shared_styles_host.SharedStylesHost;
  ELEMENT_PROBE_PROVIDERS: typeof ng_probe.ELEMENT_PROBE_PROVIDERS;
  _DomEventsPlugin?: typeof dom_events.DomEventsPlugin;
  DomEventsPlugin: typeof dom_events.DomEventsPlugin;
  _initDomAdapter?: typeof browser.initDomAdapter,
  initDomAdapter: typeof browser.initDomAdapter,
  INTERNAL_BROWSER_PLATFORM_PROVIDERS: typeof browser.INTERNAL_BROWSER_PLATFORM_PROVIDERS;
} = {
  DomAdapter: dom_adapter.DomAdapter,
  BrowserDomAdapter: browserDomAdapter.BrowserDomAdapter,
  getDOM: dom_adapter.getDOM,
  setRootDomAdapter: dom_adapter.setRootDomAdapter,
  DomRootRenderer_: dom_renderer.DomRootRenderer_,
  DomSharedStylesHost: shared_styles_host.DomSharedStylesHost,
  SharedStylesHost: shared_styles_host.SharedStylesHost,
  ELEMENT_PROBE_PROVIDERS: ng_probe.ELEMENT_PROBE_PROVIDERS,
  DomEventsPlugin: dom_events.DomEventsPlugin,
  initDomAdapter: browser.initDomAdapter,
  INTERNAL_BROWSER_PLATFORM_PROVIDERS: browser.INTERNAL_BROWSER_PLATFORM_PROVIDERS
};
