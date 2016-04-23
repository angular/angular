library angular2.platform.worker_render;

import 'package:angular2/src/platform/worker_render.dart';
import 'package:angular2/src/platform/worker_render_common.dart';
import 'package:angular2/core.dart';
import 'package:angular2/src/facade/lang.dart';
import 'dart:async';

export 'package:angular2/src/platform/worker_render_common.dart'
    show
        WORKER_SCRIPT,
        WORKER_RENDER_PLATFORM,
        WORKER_RENDER_APPLICATION_COMMON,
        initializeGenericWorkerRenderer;

export 'package:angular2/src/platform/worker_render.dart'
    show WORKER_RENDER_APPLICATION, WebWorkerInstance;

export '../src/web_workers/shared/client_message_broker.dart'
    show ClientMessageBroker, ClientMessageBrokerFactory, FnArg, UiArguments;

export '../src/web_workers/shared/service_message_broker.dart'
    show ReceivedMessage, ServiceMessageBroker, ServiceMessageBrokerFactory;

export '../src/web_workers/shared/serializer.dart' show PRIMITIVE;
export '../src/web_workers/shared/message_bus.dart';
export '../src/web_workers/ui/router_providers.dart' show WORKER_RENDER_ROUTER;


const WORKER_RENDER_APP = WORKER_RENDER_APPLICATION_COMMON;

PlatformRef workerRenderPlatform() {
  if (isBlank(getPlatform())) {
    createPlatform(ReflectiveInjector.resolveAndCreate(WORKER_RENDER_PLATFORM));
  }
  return assertPlatform(WORKER_RENDER_PLATFORM_MARKER);
}

Future<ApplicationRef> bootstrapRender(
    String workerScriptUri,
    [List<dynamic /*Type | Provider | any[]*/> customProviders]) {
  return initIsolate(workerScriptUri).then( (appProviders) {
    var appInjector =  ReflectiveInjector.resolveAndCreate([
      appProviders,
      isPresent(customProviders) ? customProviders : []
    ], workerRenderPlatform().injector);
    return appInjector.get(ApplicationRef);
  });
}
