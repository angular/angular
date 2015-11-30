'use strict';function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
/**
 * This is a set of classes and objects that can be used both in the browser and on the server.
 */
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
exports.DOM = dom_adapter_1.DOM;
exports.setRootDomAdapter = dom_adapter_1.setRootDomAdapter;
exports.DomAdapter = dom_adapter_1.DomAdapter;
var dom_renderer_1 = require('angular2/src/platform/dom/dom_renderer');
exports.DomRenderer = dom_renderer_1.DomRenderer;
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
exports.DOCUMENT = dom_tokens_1.DOCUMENT;
var shared_styles_host_1 = require('angular2/src/platform/dom/shared_styles_host');
exports.SharedStylesHost = shared_styles_host_1.SharedStylesHost;
exports.DomSharedStylesHost = shared_styles_host_1.DomSharedStylesHost;
var dom_events_1 = require('angular2/src/platform/dom/events/dom_events');
exports.DomEventsPlugin = dom_events_1.DomEventsPlugin;
var event_manager_1 = require('angular2/src/platform/dom/events/event_manager');
exports.EVENT_MANAGER_PLUGINS = event_manager_1.EVENT_MANAGER_PLUGINS;
exports.EventManager = event_manager_1.EventManager;
exports.EventManagerPlugin = event_manager_1.EventManagerPlugin;
__export(require('angular2/src/platform/dom/debug/by'));
__export(require('angular2/src/platform/dom/debug/debug_element_view_listener'));
//# sourceMappingURL=common_dom.js.map