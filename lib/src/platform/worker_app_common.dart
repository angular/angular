library angular2.src.platform.worker_app_common;

import "package:angular2/src/compiler/xhr.dart" show XHR;
import "package:angular2/src/web_workers/worker/xhr_impl.dart"
    show WebWorkerXHRImpl;
import "package:angular2/src/web_workers/worker/renderer.dart"
    show WebWorkerRenderer;
import "package:angular2/src/facade/lang.dart" show print, Type, isPresent;
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

class PrintLogger {
  var log = print;
  var logError = print;
  var logGroup = print;
  logGroupEnd() {}
}

const List<dynamic> WORKER_APP_PLATFORM = const [PLATFORM_COMMON_PROVIDERS];
const List<dynamic> WORKER_APP_APPLICATION_COMMON = const [
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
