library angular2.platform.worker_app;

export "package:angular2/src/platform/worker_app_common.dart"
    show WORKER_APP_PLATFORM, genericWorkerAppProviders;
export "package:angular2/src/platform/worker_app.dart";
export "../src/web_workers/shared/client_message_broker.dart"
    show ClientMessageBroker, ClientMessageBrokerFactory, FnArg, UiArguments;
export "../src/web_workers/shared/service_message_broker.dart"
    show ReceivedMessage, ServiceMessageBroker, ServiceMessageBrokerFactory;
export "../src/web_workers/shared/serializer.dart" show PRIMITIVE;
export "../src/web_workers/shared/message_bus.dart";
export "package:angular2/src/core/angular_entrypoint.dart"
    show AngularEntrypoint;
