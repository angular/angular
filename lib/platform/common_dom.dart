/**
 * This is a set of classes and objects that can be used both in the browser and on the server.
 */
library angular2.platform.common_dom;

export "package:angular2/src/platform/dom/dom_adapter.dart"
    show DOM, setRootDomAdapter, DomAdapter;
export "package:angular2/src/platform/dom/dom_renderer.dart" show DomRenderer;
export "package:angular2/src/platform/dom/dom_tokens.dart" show DOCUMENT;
export "package:angular2/src/platform/dom/shared_styles_host.dart"
    show SharedStylesHost, DomSharedStylesHost;
export "package:angular2/src/platform/dom/events/dom_events.dart"
    show DomEventsPlugin;
export "package:angular2/src/platform/dom/debug/by.dart";
export "package:angular2/src/platform/dom/debug/debug_element_view_listener.dart";
