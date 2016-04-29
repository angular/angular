library angular2.platform.worker_app;

import "package:angular2/src/platform/worker_app_common.dart";
import "package:angular2/src/platform/worker_app.dart";
import 'package:angular2/core.dart';
import 'package:angular2/src/facade/lang.dart';
import 'dart:isolate';
import 'dart:async';

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

PlatformRef _platform = null;
SendPort _renderSendPort = null;

PlatformRef workerAppPlatform(SendPort renderSendPort) {
  if (isBlank(getPlatform())) {
    createPlatform(ReflectiveInjector.resolveAndCreate([
      WORKER_APP_PLATFORM,
      new Provider(RENDER_SEND_PORT, useValue: renderSendPort)
    ]));
  }
  var platform = assertPlatform(WORKER_APP_PLATFORM_MARKER);
  if (platform.injector.get(RENDER_SEND_PORT, null) != renderSendPort) {
    throw 'Platform has already been created with a different SendPort. Please distroy it first.';
  }
  return platform;
}

Future<ComponentRef> bootstrapApp(
    SendPort renderSendPort,
    Type appComponentType,
    [List<dynamic /*Type | Provider | any[]*/> customProviders]) {
  var appInjector = ReflectiveInjector.resolveAndCreate([
    WORKER_APP_APPLICATION,
    isPresent(customProviders) ? customProviders : []
  ], workerAppPlatform(renderSendPort).injector);
  return coreLoadAndBootstrap(appInjector, appComponentType);
}
