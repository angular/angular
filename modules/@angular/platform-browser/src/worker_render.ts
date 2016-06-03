import {isBlank, isPresent} from "./facade/lang";
import {MessageBus} from "./web_workers/shared/message_bus";
import {
  NgZone,
  Injector,
  OpaqueToken,
  Testability,
  ExceptionHandler,
  APPLICATION_COMMON_PROVIDERS,
  PLATFORM_COMMON_PROVIDERS,
  RootRenderer,
  PLATFORM_INITIALIZER,
  PlatformRef,
  getPlatform,
  createPlatform,
  assertPlatform,
  ReflectiveInjector,
  Injectable,
  APP_INITIALIZER,
  ApplicationRef
} from "@angular/core";
import {wtfInit, AnimationDriver, NoOpAnimationDriver} from '../core_private';
import {getDOM} from "./dom/dom_adapter";
import {DomEventsPlugin} from "./dom/events/dom_events";
import {KeyEventsPlugin} from "./dom/events/key_events";
import {HammerGesturesPlugin, HAMMER_GESTURE_CONFIG, HammerGestureConfig} from "./dom/events/hammer_gestures";
import {DOCUMENT} from "./dom/dom_tokens";
import {DomRootRenderer, DomRootRenderer_} from "./dom/dom_renderer";
import {DomSharedStylesHost, SharedStylesHost} from "./dom/shared_styles_host";
import {BrowserGetTestability} from "./browser/testability";
import {BrowserDomAdapter} from "./browser/browser_adapter";
import {MessageBasedRenderer} from "./web_workers/ui/renderer";
import {ServiceMessageBrokerFactory, ServiceMessageBrokerFactory_} from "./web_workers/shared/service_message_broker";
import {ClientMessageBrokerFactory, ClientMessageBrokerFactory_} from "./web_workers/shared/client_message_broker";
import {Serializer} from "./web_workers/shared/serializer";
import {ON_WEB_WORKER} from "./web_workers/shared/api";
import {RenderStore} from "./web_workers/shared/render_store";
import {EventManager, EVENT_MANAGER_PLUGINS} from "./dom/events/event_manager";
import {BROWSER_SANITIZATION_PROVIDERS, BROWSER_APP_COMPILER_PROVIDERS} from "./browser";
import {PostMessageBus, PostMessageBusSink, PostMessageBusSource} from "./web_workers/shared/post_message_bus";
import {BaseException} from "./facade/exceptions";
import {PromiseWrapper} from "./facade/async";

const WORKER_RENDER_PLATFORM_MARKER = new OpaqueToken('WorkerRenderPlatformMarker');

/**
 * Wrapper class that exposes the Worker
 * and underlying {@link MessageBus} for lower level message passing.
 */
@Injectable()
export class WebWorkerInstance {
  public worker: Worker;
  public bus: MessageBus;

  /** @internal */
  public init(worker: Worker, bus: MessageBus) {
    this.worker = worker;
    this.bus = bus;
  }
}

export const WORKER_SCRIPT: OpaqueToken = new OpaqueToken("WebWorkerScript");

/**
 * A multiple providers used to automatically call the `start()` method after the service is
 * created.
 *
 * TODO(vicb): create an interface for startable services to implement
 */
export const WORKER_RENDER_STARTABLE_MESSAGING_SERVICE = new OpaqueToken('WorkerRenderStartableMsgService');

export const WORKER_RENDER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  PLATFORM_COMMON_PROVIDERS,
  {provide: WORKER_RENDER_PLATFORM_MARKER, useValue: true},
  {provide: PLATFORM_INITIALIZER, useValue: initWebWorkerRenderPlatform, multi: true}
];

export const WORKER_RENDER_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    [
      APPLICATION_COMMON_PROVIDERS,
      MessageBasedRenderer,
      {provide: WORKER_RENDER_STARTABLE_MESSAGING_SERVICE, useExisting: MessageBasedRenderer, multi: true},
      BROWSER_SANITIZATION_PROVIDERS,
      {provide: ExceptionHandler, useFactory: _exceptionHandler, deps: []},
      {provide: DOCUMENT, useFactory: _document, deps: []},
      // TODO(jteplitz602): Investigate if we definitely need EVENT_MANAGER on the render thread
      // #5298
      {provide: EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true},
      {provide: EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true},
      {provide: EVENT_MANAGER_PLUGINS, useClass: HammerGesturesPlugin, multi: true},
      {provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig},
      {provide: DomRootRenderer, useClass: DomRootRenderer_},
      {provide: RootRenderer, useExisting: DomRootRenderer},
      {provide: SharedStylesHost, useExisting: DomSharedStylesHost},
      {provide: ServiceMessageBrokerFactory, useClass: ServiceMessageBrokerFactory_},
      {provide: ClientMessageBrokerFactory, useClass: ClientMessageBrokerFactory_},
      {provide: AnimationDriver, useFactory: _resolveDefaultAnimationDriver},
      Serializer,
      {provide: ON_WEB_WORKER, useValue: false},
      RenderStore,
      DomSharedStylesHost,
      Testability,
      EventManager,
      WebWorkerInstance,
      { provide: APP_INITIALIZER, useFactory: initWebWorkerAppFn, multi: true, deps: [Injector] },
      { provide: MessageBus, useFactory: messageBusFactory, deps: [WebWorkerInstance] }
    ];

export function initializeGenericWorkerRenderer(injector: Injector) {
  var bus = injector.get(MessageBus);
  let zone = injector.get(NgZone);
  bus.attachToZone(zone);

  // initialize message services after the bus has been created
  let services = injector.get(WORKER_RENDER_STARTABLE_MESSAGING_SERVICE);
  zone.runGuarded(() => { services.forEach((svc) => { svc.start(); }); });
}

export function bootstrapRender(
  workerScriptUri: string,
  customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ApplicationRef> {
  var app = ReflectiveInjector.resolveAndCreate(
    [
      WORKER_RENDER_APPLICATION_PROVIDERS,
      BROWSER_APP_COMPILER_PROVIDERS,
      {provide: WORKER_SCRIPT, useValue: workerScriptUri},
      isPresent(customProviders) ? customProviders : []
    ],
    workerRenderPlatform().injector);
  // Return a promise so that we keep the same semantics as Dart,
  // and we might want to wait for the app side to come up
  // in the future...
  return PromiseWrapper.resolve(app.get(ApplicationRef));
}

function messageBusFactory(instance: WebWorkerInstance): MessageBus {
  return instance.bus;
}

function initWebWorkerRenderPlatform(): void {
  BrowserDomAdapter.makeCurrent();
  wtfInit();
  BrowserGetTestability.init();
}

export function workerRenderPlatform(): PlatformRef {
  if (isBlank(getPlatform())) {
    createPlatform(ReflectiveInjector.resolveAndCreate(WORKER_RENDER_PLATFORM_PROVIDERS));
  }
  return assertPlatform(WORKER_RENDER_PLATFORM_MARKER);
}

function _exceptionHandler(): ExceptionHandler {
  return new ExceptionHandler(getDOM());
}

function _document(): any {
  return getDOM().defaultDoc();
}

function initWebWorkerAppFn(injector: Injector): () => void {
  return () => {
    var scriptUri: string;
    try {
      scriptUri = injector.get(WORKER_SCRIPT);
    } catch (e) {
      throw new BaseException(
        "You must provide your WebWorker's initialization script with the WORKER_SCRIPT token");
    }

    let instance = injector.get(WebWorkerInstance);
    spawnWebWorker(scriptUri, instance);

    initializeGenericWorkerRenderer(injector);
  };
}

/**
 * Spawns a new class and initializes the WebWorkerInstance
 */
function spawnWebWorker(uri: string, instance: WebWorkerInstance): void {
  var webWorker: Worker = new Worker(uri);
  var sink = new PostMessageBusSink(webWorker);
  var source = new PostMessageBusSource(webWorker);
  var bus = new PostMessageBus(sink, source);

  instance.init(webWorker, bus);
}

function _resolveDefaultAnimationDriver(): AnimationDriver {
  // web workers have not been tested or configured to
  // work with animations just yet...
  return new NoOpAnimationDriver();
}
