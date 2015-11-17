var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var core_1 = require("angular2/core");
var common_1 = require("angular2/common");
var render_1 = require('angular2/render');
var testability_1 = require('angular2/src/core/testability/testability');
// TODO change these imports once dom_adapter is moved out of core
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var event_manager_1 = require('angular2/src/core/render/dom/events/event_manager');
var key_events_1 = require('angular2/src/core/render/dom/events/key_events');
var hammer_gestures_1 = require('angular2/src/core/render/dom/events/hammer_gestures');
var dom_tokens_1 = require('angular2/src/core/render/dom/dom_tokens');
var dom_renderer_1 = require('angular2/src/core/render/dom/dom_renderer');
var shared_styles_host_1 = require('angular2/src/core/render/dom/shared_styles_host');
var shared_styles_host_2 = require("angular2/src/core/render/dom/shared_styles_host");
var browser_details_1 = require("angular2/src/animate/browser_details");
var animation_builder_1 = require("angular2/src/animate/animation_builder");
var browser_adapter_1 = require('angular2/src/core/dom/browser_adapter');
var browser_testability_1 = require('angular2/src/core/testability/browser_testability');
var wtf_init_1 = require('angular2/src/core/profile/wtf_init');
exports.BROWSER_PROVIDERS = lang_1.CONST_EXPR([core_1.PLATFORM_COMMON_PROVIDERS]);
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
    new di_1.Provider(event_manager_1.EVENT_MANAGER_PLUGINS, { useClass: event_manager_1.DomEventsPlugin, multi: true }),
    new di_1.Provider(event_manager_1.EVENT_MANAGER_PLUGINS, { useClass: key_events_1.KeyEventsPlugin, multi: true }),
    new di_1.Provider(event_manager_1.EVENT_MANAGER_PLUGINS, { useClass: hammer_gestures_1.HammerGesturesPlugin, multi: true }),
    new di_1.Provider(dom_renderer_1.DomRenderer, { useClass: dom_renderer_1.DomRenderer_ }),
    new di_1.Provider(render_1.Renderer, { useExisting: dom_renderer_1.DomRenderer }),
    new di_1.Provider(shared_styles_host_2.SharedStylesHost, { useExisting: shared_styles_host_1.DomSharedStylesHost }),
    shared_styles_host_1.DomSharedStylesHost,
    testability_1.Testability,
    browser_details_1.BrowserDetails,
    animation_builder_1.AnimationBuilder
]);
function initDomAdapter() {
    // TODO: refactor into a generic init function
    browser_adapter_1.BrowserDomAdapter.makeCurrent();
    wtf_init_1.wtfInit();
    browser_testability_1.BrowserGetTestability.init();
}
exports.initDomAdapter = initDomAdapter;
//# sourceMappingURL=browser_common.js.map