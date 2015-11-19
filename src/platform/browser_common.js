'use strict';var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var core_1 = require("angular2/core");
var common_1 = require("angular2/common");
var render_1 = require('angular2/render');
var testability_1 = require('angular2/src/core/testability/testability');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var dom_events_1 = require('angular2/src/platform/dom/events/dom_events');
var key_events_1 = require('angular2/src/platform/dom/events/key_events');
var hammer_gestures_1 = require('angular2/src/platform/dom/events/hammer_gestures');
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
var dom_renderer_1 = require('angular2/src/platform/dom/dom_renderer');
var shared_styles_host_1 = require('angular2/src/platform/dom/shared_styles_host');
var shared_styles_host_2 = require("angular2/src/platform/dom/shared_styles_host");
var browser_details_1 = require("angular2/src/animate/browser_details");
var animation_builder_1 = require("angular2/src/animate/animation_builder");
var browser_adapter_1 = require('./browser/browser_adapter');
var testability_2 = require('angular2/src/platform/browser/testability');
var wtf_init_1 = require('angular2/src/core/profile/wtf_init');
var dom_tokens_2 = require('angular2/src/platform/dom/dom_tokens');
exports.DOCUMENT = dom_tokens_2.DOCUMENT;
var title_1 = require('angular2/src/platform/browser/title');
exports.Title = title_1.Title;
var debug_element_view_listener_1 = require('angular2/src/platform/browser/debug/debug_element_view_listener');
exports.ELEMENT_PROBE_PROVIDERS = debug_element_view_listener_1.ELEMENT_PROBE_PROVIDERS;
exports.ELEMENT_PROBE_BINDINGS = debug_element_view_listener_1.ELEMENT_PROBE_BINDINGS;
exports.inspectNativeElement = debug_element_view_listener_1.inspectNativeElement;
var by_1 = require('angular2/src/platform/browser/debug/by');
exports.By = by_1.By;
var browser_adapter_2 = require('./browser/browser_adapter');
exports.BrowserDomAdapter = browser_adapter_2.BrowserDomAdapter;
exports.BROWSER_PROVIDERS = lang_1.CONST_EXPR([
    core_1.PLATFORM_COMMON_PROVIDERS,
    new di_1.Provider(core_1.PLATFORM_INITIALIZER, { useValue: initDomAdapter, multi: true }),
]);
function _exceptionHandler() {
    return new core_1.ExceptionHandler(dom_adapter_1.DOM, false);
}
function _document() {
    return dom_adapter_1.DOM.defaultDoc();
}
exports.BROWSER_APP_COMMON_PROVIDERS = lang_1.CONST_EXPR([
    core_1.APPLICATION_COMMON_PROVIDERS,
    common_1.FORM_PROVIDERS,
    new di_1.Provider(core_1.PLATFORM_PIPES, { useValue: common_1.COMMON_PIPES, multi: true }),
    new di_1.Provider(core_1.PLATFORM_DIRECTIVES, { useValue: common_1.COMMON_DIRECTIVES, multi: true }),
    new di_1.Provider(core_1.ExceptionHandler, { useFactory: _exceptionHandler, deps: [] }),
    new di_1.Provider(dom_tokens_1.DOCUMENT, { useFactory: _document, deps: [] }),
    new di_1.Provider(core_1.EVENT_MANAGER_PLUGINS, { useClass: dom_events_1.DomEventsPlugin, multi: true }),
    new di_1.Provider(core_1.EVENT_MANAGER_PLUGINS, { useClass: key_events_1.KeyEventsPlugin, multi: true }),
    new di_1.Provider(core_1.EVENT_MANAGER_PLUGINS, { useClass: hammer_gestures_1.HammerGesturesPlugin, multi: true }),
    new di_1.Provider(dom_renderer_1.DomRenderer, { useClass: dom_renderer_1.DomRenderer_ }),
    new di_1.Provider(render_1.Renderer, { useExisting: dom_renderer_1.DomRenderer }),
    new di_1.Provider(shared_styles_host_2.SharedStylesHost, { useExisting: shared_styles_host_1.DomSharedStylesHost }),
    shared_styles_host_1.DomSharedStylesHost,
    testability_1.Testability,
    browser_details_1.BrowserDetails,
    animation_builder_1.AnimationBuilder
]);
function initDomAdapter() {
    browser_adapter_1.BrowserDomAdapter.makeCurrent();
    wtf_init_1.wtfInit();
    testability_2.BrowserGetTestability.init();
}
exports.initDomAdapter = initDomAdapter;
//# sourceMappingURL=browser_common.js.map