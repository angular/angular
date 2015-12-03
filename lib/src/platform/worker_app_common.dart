library angular2.src.platform.worker_app_common;

import "package:angular2/src/compiler/xhr.dart" show XHR;
import "package:angular2/src/web_workers/worker/xhr_impl.dart"
    show WebWorkerXHRImpl;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/compiler/app_root_url.dart" show AppRootUrl;
import "package:angular2/src/web_workers/worker/renderer.dart"
    show WebWorkerRenderer;
import "package:angular2/src/facade/lang.dart" show print, Type, isPresent;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "package:angular2/src/core/render/api.dart" show Renderer;
import "package:angular2/core.dart"
    show
        PLATFORM_DIRECTIVES,
        PLATFORM_PIPES,
        ExceptionHandler,
        APPLICATION_COMMON_PROVIDERS,
        PLATFORM_COMMON_PROVIDERS;
import "package:angular2/common.dart"
    show COMMON_DIRECTIVES, COMMON_PIPES, FORM_PROVIDERS;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show ClientMessageBrokerFactory, ClientMessageBrokerFactory_;
import "package:angular2/src/web_workers/shared/service_message_broker.dart"
    show ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_;
import "package:angular2/src/compiler/compiler.dart" show COMPILER_PROVIDERS;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer;
import "package:angular2/src/web_workers/shared/api.dart" show ON_WEB_WORKER;
import "package:angular2/src/core/di.dart" show Provider;
import "package:angular2/src/web_workers/shared/render_proto_view_ref_store.dart"
    show RenderProtoViewRefStore;
import "package:angular2/src/web_workers/shared/render_view_with_fragments_store.dart"
    show RenderViewWithFragmentsStore;
import "package:angular2/src/web_workers/worker/event_dispatcher.dart"
    show WebWorkerEventDispatcher;
import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;
import "package:angular2/src/facade/async.dart"
    show Future, PromiseWrapper, PromiseCompleter;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show SETUP_CHANNEL;
import "package:angular2/src/facade/async.dart" show ObservableWrapper;

class PrintLogger {
  var log = print;
  var logError = print;
  var logGroup = print;
  logGroupEnd() {}
}

const List<dynamic> WORKER_APP_PLATFORM = const [PLATFORM_COMMON_PROVIDERS];
const List<dynamic> WORKER_APP_COMMON_PROVIDERS = const [
  APPLICATION_COMMON_PROVIDERS,
  COMPILER_PROVIDERS,
  FORM_PROVIDERS,
  Serializer,
  const Provider(PLATFORM_PIPES, useValue: COMMON_PIPES, multi: true),
  const Provider(PLATFORM_DIRECTIVES, useValue: COMMON_DIRECTIVES, multi: true),
  const Provider(ClientMessageBrokerFactory,
      useClass: ClientMessageBrokerFactory_),
  const Provider(ServiceMessageBrokerFactory,
      useClass: ServiceMessageBrokerFactory_),
  WebWorkerRenderer,
  const Provider(Renderer, useExisting: WebWorkerRenderer),
  const Provider(ON_WEB_WORKER, useValue: true),
  RenderViewWithFragmentsStore,
  RenderProtoViewRefStore,
  const Provider(ExceptionHandler,
      useFactory: _exceptionHandler, deps: const []),
  WebWorkerXHRImpl,
  const Provider(XHR, useExisting: WebWorkerXHRImpl),
  WebWorkerEventDispatcher
];
ExceptionHandler _exceptionHandler() {
  return new ExceptionHandler(new PrintLogger());
}

/**
 * Asynchronously returns a list of providers that can be used to initialize the
 * Application injector.
 * Also takes care of attaching the [MessageBus] to the given [NgZone].
 */
Future<
    List<
        dynamic /* Type | Provider | List < dynamic > */ >> genericWorkerAppProviders(
    MessageBus bus, NgZone zone) {
  PromiseCompleter<dynamic> bootstrapProcess = PromiseWrapper.completer();
  bus.attachToZone(zone);
  bus.initChannel(SETUP_CHANNEL, false);
  dynamic subscription;
  var emitter = bus.from(SETUP_CHANNEL);
  subscription = ObservableWrapper.subscribe(emitter,
      (Map<String, dynamic> initData) {
    var bindings = ListWrapper.concat(WORKER_APP_COMMON_PROVIDERS, [
      new Provider(MessageBus, useValue: bus),
      new Provider(AppRootUrl, useValue: new AppRootUrl(initData["rootUrl"]))
    ]);
    bootstrapProcess.resolve(bindings);
    ObservableWrapper.dispose(subscription);
  });
  ObservableWrapper.callNext(bus.to(SETUP_CHANNEL), "ready");
  return bootstrapProcess.promise;
}
