library angular2.platform.worker_app;

export "package:angular2/src/platform/worker_app_common.dart"
    show WORKER_APP_PLATFORM, WORKER_APP_APPLICATION_COMMON;
export "package:angular2/src/core/angular_entrypoint.dart"
    show AngularEntrypoint;
export "package:angular2/src/platform/worker_app.dart"
    show WORKER_APP_APPLICATION, RENDER_SEND_PORT;
export 'package:angular2/src/web_workers/shared/client_message_broker.dart'
    show ClientMessageBroker, ClientMessageBrokerFactory, FnArg, UiArguments;
export 'package:angular2/src/web_workers/shared/service_message_broker.dart'
    show ReceivedMessage, ServiceMessageBroker, ServiceMessageBrokerFactory;
export 'package:angular2/src/web_workers/shared/serializer.dart' show PRIMITIVE;
export 'package:angular2/src/web_workers/shared/message_bus.dart';
export 'package:angular2/src/web_workers/worker/router_providers.dart'
  show WORKER_APP_ROUTER;
