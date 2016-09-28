/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import * as browser from './browser';
import * as browserDomAdapter from './browser/browser_adapter';
import * as location from './browser/location/browser_platform_location';
import * as testability from './browser/testability';
import * as ng_probe from './dom/debug/ng_probe';
import * as dom_adapter from './dom/dom_adapter';
import * as dom_renderer from './dom/dom_renderer';
import * as dom_events from './dom/events/dom_events';
import * as hammer_gesture from './dom/events/hammer_gestures';
import * as key_events from './dom/events/key_events';
import * as shared_styles_host from './dom/shared_styles_host';



export var __platform_browser_private__: {
  _BrowserPlatformLocation?: location.BrowserPlatformLocation,
  BrowserPlatformLocation: typeof location.BrowserPlatformLocation,
  _DomAdapter?: dom_adapter.DomAdapter,
  DomAdapter: typeof dom_adapter.DomAdapter,
  _BrowserDomAdapter?: browserDomAdapter.BrowserDomAdapter,
  BrowserDomAdapter: typeof browserDomAdapter.BrowserDomAdapter,
  _BrowserGetTestability?: testability.BrowserGetTestability,
  BrowserGetTestability: typeof testability.BrowserGetTestability,
  getDOM: typeof dom_adapter.getDOM,
  setRootDomAdapter: typeof dom_adapter.setRootDomAdapter,
  _DomRootRenderer?: dom_renderer.DomRootRenderer,
  DomRootRenderer: typeof dom_renderer.DomRootRenderer,
  _DomRootRenderer_?: dom_renderer.DomRootRenderer,
  DomRootRenderer_: typeof dom_renderer.DomRootRenderer_,
  _DomSharedStylesHost?: shared_styles_host.DomSharedStylesHost,
  DomSharedStylesHost: typeof shared_styles_host.DomSharedStylesHost,
  _SharedStylesHost?: shared_styles_host.SharedStylesHost,
  SharedStylesHost: typeof shared_styles_host.SharedStylesHost,
  ELEMENT_PROBE_PROVIDERS: typeof ng_probe.ELEMENT_PROBE_PROVIDERS,
  _DomEventsPlugin?: dom_events.DomEventsPlugin,
  DomEventsPlugin: typeof dom_events.DomEventsPlugin, _KeyEventsPlugin?: key_events.KeyEventsPlugin,
  KeyEventsPlugin: typeof key_events.KeyEventsPlugin,
  _HammerGesturesPlugin?: hammer_gesture.HammerGesturesPlugin,
  HammerGesturesPlugin: typeof hammer_gesture.HammerGesturesPlugin,
  initDomAdapter: typeof browser.initDomAdapter,
  INTERNAL_BROWSER_PLATFORM_PROVIDERS: typeof browser.INTERNAL_BROWSER_PLATFORM_PROVIDERS,
  BROWSER_SANITIZATION_PROVIDERS: typeof browser.BROWSER_SANITIZATION_PROVIDERS
} = {
  BrowserPlatformLocation: location.BrowserPlatformLocation,
  DomAdapter: dom_adapter.DomAdapter,
  BrowserDomAdapter: browserDomAdapter.BrowserDomAdapter,
  BrowserGetTestability: testability.BrowserGetTestability,
  getDOM: dom_adapter.getDOM,
  setRootDomAdapter: dom_adapter.setRootDomAdapter,
  DomRootRenderer_: dom_renderer.DomRootRenderer_,
  DomRootRenderer: dom_renderer.DomRootRenderer,
  DomSharedStylesHost: shared_styles_host.DomSharedStylesHost,
  SharedStylesHost: shared_styles_host.SharedStylesHost,
  ELEMENT_PROBE_PROVIDERS: ng_probe.ELEMENT_PROBE_PROVIDERS,
  DomEventsPlugin: dom_events.DomEventsPlugin,
  KeyEventsPlugin: key_events.KeyEventsPlugin,
  HammerGesturesPlugin: hammer_gesture.HammerGesturesPlugin,
  initDomAdapter: browser.initDomAdapter,
  INTERNAL_BROWSER_PLATFORM_PROVIDERS: browser.INTERNAL_BROWSER_PLATFORM_PROVIDERS,
  BROWSER_SANITIZATION_PROVIDERS: browser.BROWSER_SANITIZATION_PROVIDERS
};
