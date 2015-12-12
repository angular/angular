library angular2.src.platform.worker_render_common;

import "package:angular2/src/facade/lang.dart" show IS_DART;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;
import "package:angular2/core.dart"
    show
        PLATFORM_DIRECTIVES,
        PLATFORM_PIPES,
        ComponentRef,
        platform,
        ExceptionHandler,
        Reflector,
        reflector,
        APPLICATION_COMMON_PROVIDERS,
        PLATFORM_COMMON_PROVIDERS,
        Renderer,
        PLATFORM_INITIALIZER,
        APP_INITIALIZER;
import "package:angular2/platform/common_dom.dart"
    show EVENT_MANAGER_PLUGINS, EventManager;
import "package:angular2/src/core/di.dart"
    show provide, Provider, Injector, OpaqueToken;
// TODO change these imports once dom_adapter is moved out of core
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
import "package:angular2/compiler.dart" show XHR;
import "package:angular2/src/platform/browser/xhr_impl.dart" show XHRImpl;
import "package:angular2/src/core/testability/testability.dart"
    show Testability;
import "package:angular2/src/platform/browser/testability.dart"
    show BrowserGetTestability;
import "browser/browser_adapter.dart" show BrowserDomAdapter;
import "package:angular2/src/core/profile/wtf_init.dart" show wtfInit;
import "package:angular2/src/web_workers/ui/renderer.dart"
    show MessageBasedRenderer;
import "package:angular2/src/web_workers/ui/xhr_impl.dart"
    show MessageBasedXHRImpl;
import "package:angular2/src/web_workers/shared/service_message_broker.dart"
    show ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show ClientMessageBrokerFactory, ClientMessageBrokerFactory_;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer;
import "package:angular2/src/web_workers/shared/api.dart" show ON_WEB_WORKER;
import "package:angular2/src/web_workers/shared/render_proto_view_ref_store.dart"
    show RenderProtoViewRefStore;
import "package:angular2/src/web_workers/shared/render_view_with_fragments_store.dart"
    show RenderViewWithFragmentsStore;

const OpaqueToken WORKER_SCRIPT = const OpaqueToken("WebWorkerScript");
// Message based Worker classes that listen on the MessageBus
const List<dynamic> WORKER_RENDER_MESSAGING_PROVIDERS = const [
  MessageBasedRenderer,
  MessageBasedXHRImpl
];
const List<dynamic> WORKER_RENDER_PLATFORM = const [
  PLATFORM_COMMON_PROVIDERS,
  const Provider(PLATFORM_INITIALIZER,
      useValue: initWebWorkerRenderPlatform, multi: true)
];
const List<dynamic> WORKER_RENDER_APP_COMMON = const [
  APPLICATION_COMMON_PROVIDERS, WORKER_RENDER_MESSAGING_PROVIDERS,
  const Provider(ExceptionHandler,
      useFactory: _exceptionHandler, deps: const []),
  const Provider(DOCUMENT, useFactory: _document, deps: const []),
  // TODO(jteplitz602): Investigate if we definitely need EVENT_MANAGER on the render thread

  // #5298
  const Provider(EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true), const Provider(EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true),
  const Provider(EVENT_MANAGER_PLUGINS, useClass: HammerGesturesPlugin, multi: true),
  const Provider(DomRenderer, useClass: DomRenderer_), const Provider(Renderer, useExisting: DomRenderer),
  const Provider(SharedStylesHost, useExisting: DomSharedStylesHost), const Provider(XHR, useClass: XHRImpl), MessageBasedXHRImpl,
  const Provider(ServiceMessageBrokerFactory, useClass: ServiceMessageBrokerFactory_),
  const Provider(ClientMessageBrokerFactory, useClass: ClientMessageBrokerFactory_), Serializer,
  const Provider(ON_WEB_WORKER, useValue: false), RenderViewWithFragmentsStore, RenderProtoViewRefStore,
  DomSharedStylesHost, Testability, BrowserDetails, AnimationBuilder, EventManager
];
initializeGenericWorkerRenderer(Injector injector) {
  var bus = injector.get(MessageBus);
  var zone = injector.get(NgZone);
  bus.attachToZone(zone);
  zone.run(() {
    WORKER_RENDER_MESSAGING_PROVIDERS.forEach((token) {
      injector.get(token).start();
    });
  });
}

void initWebWorkerRenderPlatform() {
  BrowserDomAdapter.makeCurrent();
  wtfInit();
  BrowserGetTestability.init();
}

ExceptionHandler _exceptionHandler() {
  return new ExceptionHandler(DOM, !IS_DART);
}

dynamic _document() {
  return DOM.defaultDoc();
}
