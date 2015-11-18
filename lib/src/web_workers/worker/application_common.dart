library angular2.src.web_workers.worker.application_common;

import "package:angular2/src/core/di.dart"
    show Injector, provide, OpaqueToken, Provider;
import "package:angular2/src/common/forms.dart" show FORM_PROVIDERS;
import "package:angular2/src/facade/lang.dart"
    show
        NumberWrapper,
        Type,
        isBlank,
        isPresent,
        assertionsEnabled,
        print,
        stringify;
import "package:angular2/src/facade/exceptions.dart" show ExceptionHandler;
import "package:angular2/src/facade/async.dart"
    show Future, PromiseWrapper, PromiseCompleter;
import "package:angular2/src/compiler/xhr.dart" show XHR;
import "package:angular2/src/web_workers/worker/xhr_impl.dart"
    show WebWorkerXHRImpl;
import "package:angular2/src/compiler/app_root_url.dart" show AppRootUrl;
import "renderer.dart" show WebWorkerRenderer;
import "package:angular2/src/core/render/api.dart" show Renderer;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show ClientMessageBrokerFactory, ClientMessageBrokerFactory_;
import "package:angular2/src/web_workers/shared/service_message_broker.dart"
    show ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "package:angular2/core.dart"
    show
        PlatformRef,
        ApplicationRef,
        APPLICATION_COMMON_PROVIDERS,
        PLATFORM_COMMON_PROVIDERS;
import "package:angular2/core.dart" as core;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer;
import "package:angular2/src/web_workers/shared/api.dart" show ON_WEB_WORKER;
import "package:angular2/src/web_workers/shared/render_proto_view_ref_store.dart"
    show RenderProtoViewRefStore;
import "package:angular2/src/web_workers/shared/render_view_with_fragments_store.dart"
    show RenderViewWithFragmentsStore;
import "package:angular2/src/facade/async.dart" show ObservableWrapper;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show SETUP_CHANNEL;
import "package:angular2/src/web_workers/worker/event_dispatcher.dart"
    show WebWorkerEventDispatcher;
import "package:angular2/src/core/linker/dynamic_component_loader.dart"
    show ComponentRef;
import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;
import "package:angular2/src/compiler/compiler.dart" show COMPILER_PROVIDERS;

/**
 * Initialize the Angular 'platform' on the page in a manner suitable for applications
 * running in a web worker. Applications running on a web worker do not have direct
 * access to DOM APIs.
 *
 * See [PlatformRef] for details on the Angular platform.
 *
 * ### Without specified providers
 *
 * If no providers are specified, `platform`'s behavior depends on whether an existing
 * platform exists:
 *
 * If no platform exists, a new one will be created with the default [platformProviders].
 *
 * If a platform already exists, it will be returned (regardless of what providers it
 * was created with). This is a convenience feature, allowing for multiple applications
 * to be loaded into the same platform without awareness of each other.
 *
 * ### With specified providers
 *
 * It is also possible to specify providers to be made in the new platform. These providers
 * will be shared between all applications on the page. For example, an abstraction for
 * the browser cookie jar should be bound at the platform level, because there is only one
 * cookie jar regardless of how many applications on the age will be accessing it.
 *
 * If providers are specified directly, `platform` will create the Angular platform with
 * them if a platform did not exist already. If it did exist, however, an error will be
 * thrown.
 *
 * ### For Web Worker Applications
 *
 * This version of `platform` initializes Angular for use with applications
 * that do not directly touch the DOM, such as applications which run in a
 * web worker context. Applications that need direct access to the DOM should
 * use `platform` from `core/application_common` instead.
 */
PlatformRef platform(
    [List<dynamic /* Type | Provider | List < dynamic > */ > providers]) {
  var platformProviders = isPresent(providers)
      ? [PLATFORM_COMMON_PROVIDERS, providers]
      : PLATFORM_COMMON_PROVIDERS;
  return core.platform(platformProviders);
}

class PrintLogger {
  var log = print;
  var logError = print;
  var logGroup = print;
  logGroupEnd() {}
}

List<dynamic /* Type | Provider | List < dynamic > */ > webWorkerProviders(
    appComponentType, MessageBus bus, Map<String, dynamic> initData) {
  return [
    COMPILER_PROVIDERS,
    Serializer,
    provide(MessageBus, useValue: bus),
    provide(ClientMessageBrokerFactory, useClass: ClientMessageBrokerFactory_),
    provide(ServiceMessageBrokerFactory,
        useClass: ServiceMessageBrokerFactory_),
    WebWorkerRenderer,
    provide(Renderer, useExisting: WebWorkerRenderer),
    provide(ON_WEB_WORKER, useValue: true),
    RenderViewWithFragmentsStore,
    RenderProtoViewRefStore,
    provide(ExceptionHandler,
        useFactory: () => new ExceptionHandler(new PrintLogger()), deps: []),
    WebWorkerXHRImpl,
    provide(XHR, useExisting: WebWorkerXHRImpl),
    provide(AppRootUrl, useValue: new AppRootUrl(initData["rootUrl"])),
    WebWorkerEventDispatcher,
    FORM_PROVIDERS
  ];
}

Future<ComponentRef> bootstrapWebWorkerCommon(
    Type appComponentType, MessageBus bus,
    [List<dynamic /* Type | Provider | List < dynamic > */ > appProviders =
        null]) {
  PromiseCompleter<dynamic> bootstrapProcess = PromiseWrapper.completer();
  var appPromise = platform().asyncApplication((NgZone zone) {
    // TODO(rado): prepopulate template cache, so applications with only

    // index.html and main.js are possible.

    //
    bus.attachToZone(zone);
    bus.initChannel(SETUP_CHANNEL, false);
    dynamic subscription;
    var emitter = bus.from(SETUP_CHANNEL);
    subscription = ObservableWrapper.subscribe(emitter,
        (Map<String, dynamic> message) {
      var bindings = [
        APPLICATION_COMMON_PROVIDERS,
        webWorkerProviders(appComponentType, bus, message)
      ];
      if (isPresent(appProviders)) {
        bindings.add(appProviders);
      }
      bootstrapProcess.resolve(bindings);
      ObservableWrapper.dispose(subscription);
    });
    ObservableWrapper.callEmit(bus.to(SETUP_CHANNEL), "ready");
    return bootstrapProcess.promise;
  });
  return PromiseWrapper.then(
      appPromise, (app) => app.bootstrap(appComponentType));
}
