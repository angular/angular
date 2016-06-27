/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ng_proble from './src/dom/debug/ng_probe';
import * as dom_adapter from './src/dom/dom_adapter';
import * as dom_renderer from './src/dom/dom_renderer';
import * as dom_events from './src/dom/events/dom_events';
import * as shared_styles_host from './src/dom/shared_styles_host';

export declare namespace __platform_browser_private_types__ {
  export type DomAdapter = dom_adapter.DomAdapter;
  export var DomAdapter: typeof dom_adapter.DomAdapter;
  export var getDOM: typeof dom_adapter.getDOM;
  export var setRootDomAdapter: typeof dom_adapter.setRootDomAdapter;
  export type DomRootRenderer = dom_renderer.DomRootRenderer;
  export var DomRootRenderer: typeof dom_renderer.DomRootRenderer;
  export type DomRootRenderer_ = dom_renderer.DomRootRenderer_;
  export var DomRootRenderer_: typeof dom_renderer.DomRootRenderer_;
  export type DomSharedStylesHost = shared_styles_host.DomSharedStylesHost;
  export var DomSharedStylesHost: typeof shared_styles_host.DomSharedStylesHost;
  export type SharedStylesHost = shared_styles_host.SharedStylesHost;
  export var SharedStylesHost: typeof shared_styles_host.SharedStylesHost;
  export var ELEMENT_PROBE_PROVIDERS: typeof ng_proble.ELEMENT_PROBE_PROVIDERS;
  export type DomEventsPlugin = dom_events.DomEventsPlugin;
  export var DomEventsPlugin: typeof dom_events.DomEventsPlugin;
}

export var __platform_browser_private__ = {
  DomAdapter: dom_adapter.DomAdapter,
  getDOM: dom_adapter.getDOM,
  setRootDomAdapter: dom_adapter.setRootDomAdapter,
  DomRootRenderer: dom_renderer.DomRootRenderer,
  DomRootRenderer_: dom_renderer.DomRootRenderer_,
  DomSharedStylesHost: shared_styles_host.DomSharedStylesHost,
  SharedStylesHost: shared_styles_host.SharedStylesHost,
  ELEMENT_PROBE_PROVIDERS: ng_proble.ELEMENT_PROBE_PROVIDERS,
  DomEventsPlugin: dom_events.DomEventsPlugin
};
