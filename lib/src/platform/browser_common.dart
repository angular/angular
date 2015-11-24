library angular2.src.platform.browser_common;

import "package:angular2/src/core/di.dart"
    show provide, Provider, Injector, OpaqueToken;
import "package:angular2/core.dart"
    show
        PLATFORM_INITIALIZER,
        PLATFORM_DIRECTIVES,
        PLATFORM_PIPES,
        ComponentRef,
        platform,
        ExceptionHandler,
        Reflector,
        Renderer,
        reflector,
        APPLICATION_COMMON_PROVIDERS,
        PLATFORM_COMMON_PROVIDERS,
        EVENT_MANAGER_PLUGINS;
import "package:angular2/common.dart"
    show COMMON_DIRECTIVES, COMMON_PIPES, FORM_PROVIDERS;
import "package:angular2/src/core/testability/testability.dart"
    show Testability;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/platform/dom/events/dom_events.dart"
    show DomEventsPlugin;
import "package:angular2/src/platform/dom/events/key_events.dart"
    show KeyEventsPlugin;
import "package:angular2/src/platform/dom/events/hammer_gestures.dart"
    show HammerGesturesPlugin;
import "package:angular2/src/platform/dom/dom_tokens.dart" show DOCUMENT;
import "package:angular2/src/platform/dom/dom_renderer.dart"
    show DomRenderer, DomRenderer_;
import "package:angular2/src/platform/dom/shared_styles_host.dart"
    show DomSharedStylesHost;
import "package:angular2/src/platform/dom/shared_styles_host.dart"
    show SharedStylesHost;
import "package:angular2/src/animate/browser_details.dart" show BrowserDetails;
import "package:angular2/src/animate/animation_builder.dart"
    show AnimationBuilder;
import "browser/browser_adapter.dart" show BrowserDomAdapter;
import "package:angular2/src/platform/browser/testability.dart"
    show BrowserGetTestability;
import "package:angular2/src/core/profile/wtf_init.dart" show wtfInit;
export "package:angular2/src/platform/dom/dom_tokens.dart" show DOCUMENT;
export "package:angular2/src/platform/browser/title.dart" show Title;
export "package:angular2/platform/common_dom.dart"
    show
        DebugElementViewListener,
        ELEMENT_PROBE_PROVIDERS,
        ELEMENT_PROBE_BINDINGS,
        inspectNativeElement,
        By;
export "browser/browser_adapter.dart" show BrowserDomAdapter;
export "package:angular2/src/platform/browser/tools/tools.dart"
    show enableDebugTools, disableDebugTools;

const List<dynamic> BROWSER_PROVIDERS = const [
  PLATFORM_COMMON_PROVIDERS,
  const Provider(PLATFORM_INITIALIZER, useValue: initDomAdapter, multi: true)
];
ExceptionHandler _exceptionHandler() {
  return new ExceptionHandler(DOM, false);
}

dynamic _document() {
  return DOM.defaultDoc();
}

const List<dynamic> BROWSER_APP_COMMON_PROVIDERS = const [
  APPLICATION_COMMON_PROVIDERS,
  FORM_PROVIDERS,
  const Provider(PLATFORM_PIPES, useValue: COMMON_PIPES, multi: true),
  const Provider(PLATFORM_DIRECTIVES, useValue: COMMON_DIRECTIVES, multi: true),
  const Provider(ExceptionHandler,
      useFactory: _exceptionHandler, deps: const []),
  const Provider(DOCUMENT, useFactory: _document, deps: const []),
  const Provider(EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true),
  const Provider(EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true),
  const Provider(EVENT_MANAGER_PLUGINS,
      useClass: HammerGesturesPlugin, multi: true),
  const Provider(DomRenderer, useClass: DomRenderer_),
  const Provider(Renderer, useExisting: DomRenderer),
  const Provider(SharedStylesHost, useExisting: DomSharedStylesHost),
  DomSharedStylesHost,
  Testability,
  BrowserDetails,
  AnimationBuilder
];
initDomAdapter() {
  BrowserDomAdapter.makeCurrent();
  wtfInit();
  BrowserGetTestability.init();
}
