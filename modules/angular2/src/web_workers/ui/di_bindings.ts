// TODO (jteplitz602): This whole file is nearly identical to core/application.ts.
// There should be a way to refactor application so that this file is unnecessary. See #3277
import {Injector, provide, Provider} from "angular2/src/core/di";
import {DEFAULT_PIPES} from 'angular2/src/core/pipes';
import {AnimationBuilder} from 'angular2/src/animate/animation_builder';
import {BrowserDetails} from 'angular2/src/animate/browser_details';
import {Reflector, reflector} from 'angular2/src/core/reflection/reflection';
import {Parser, Lexer} from 'angular2/src/core/change_detection/change_detection';
import {
  EventManager,
  DomEventsPlugin,
  EVENT_MANAGER_PLUGINS
} from 'angular2/src/core/render/dom/events/event_manager';
import {ProtoViewFactory} from 'angular2/src/core/linker/proto_view_factory';
import {BrowserDomAdapter} from 'angular2/src/core/dom/browser_adapter';
import {KeyEventsPlugin} from 'angular2/src/core/render/dom/events/key_events';
import {HammerGesturesPlugin} from 'angular2/src/core/render/dom/events/hammer_gestures';
import {AppViewPool, APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/linker/view_pool';
import {Renderer} from 'angular2/src/core/render/api';
import {AppRootUrl} from 'angular2/src/core/compiler/app_root_url';
import {DomRenderer, DomRenderer_, DOCUMENT} from 'angular2/src/core/render/render';
import {APP_ID_RANDOM_PROVIDER} from 'angular2/src/core/application_tokens';
import {ElementSchemaRegistry} from 'angular2/src/core/compiler/schema/element_schema_registry';
import {
  DomElementSchemaRegistry
} from 'angular2/src/core/compiler/schema/dom_element_schema_registry';
import {
  SharedStylesHost,
  DomSharedStylesHost
} from 'angular2/src/core/render/dom/shared_styles_host';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {AppViewManager, AppViewManager_} from 'angular2/src/core/linker/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/linker/view_manager_utils';
import {AppViewListener} from 'angular2/src/core/linker/view_listener';
import {ViewResolver} from 'angular2/src/core/linker/view_resolver';
import {DirectiveResolver} from 'angular2/src/core/linker/directive_resolver';
import {ExceptionHandler} from 'angular2/src/core/facade/exceptions';
import {
  DynamicComponentLoader,
  DynamicComponentLoader_
} from 'angular2/src/core/linker/dynamic_component_loader';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';
import {Testability} from 'angular2/src/core/testability/testability';
import {XHR} from 'angular2/src/core/compiler/xhr';
import {XHRImpl} from 'angular2/src/core/compiler/xhr_impl';
import {Serializer} from 'angular2/src/web_workers/shared/serializer';
import {ON_WEB_WORKER} from 'angular2/src/web_workers/shared/api';
import {RenderProtoViewRefStore} from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import {
  RenderViewWithFragmentsStore
} from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import {AnchorBasedAppRootUrl} from 'angular2/src/core/compiler/anchor_based_app_root_url';
import {WebWorkerApplication} from 'angular2/src/web_workers/ui/impl';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {MessageBasedRenderer} from 'angular2/src/web_workers/ui/renderer';
import {MessageBasedXHRImpl} from 'angular2/src/web_workers/ui/xhr_impl';
import {WebWorkerSetup} from 'angular2/src/web_workers/ui/setup';
import {
  ServiceMessageBrokerFactory,
  ServiceMessageBrokerFactory_
} from 'angular2/src/web_workers/shared/service_message_broker';
import {
  ClientMessageBrokerFactory,
  ClientMessageBrokerFactory_
} from 'angular2/src/web_workers/shared/client_message_broker';

var _rootInjector: Injector;

// Contains everything that is safe to share between applications.
var _rootProviders = [provide(Reflector, {useValue: reflector})];

// TODO: This code is nearly identical to core/application. There should be a way to only write it
// once
function _injectorProviders(): any[] {
  return [
    provide(DOCUMENT, {useValue: DOM.defaultDoc()}),
    EventManager,
    new Provider(EVENT_MANAGER_PLUGINS, {useClass: DomEventsPlugin, multi: true}),
    new Provider(EVENT_MANAGER_PLUGINS, {useClass: KeyEventsPlugin, multi: true}),
    new Provider(EVENT_MANAGER_PLUGINS, {useClass: HammerGesturesPlugin, multi: true}),
    provide(DomRenderer, {useClass: DomRenderer_}),
    provide(Renderer, {useExisting: DomRenderer}),
    APP_ID_RANDOM_PROVIDER,
    DomSharedStylesHost,
    provide(SharedStylesHost, {useExisting: DomSharedStylesHost}),
    Serializer,
    provide(ON_WEB_WORKER, {useValue: false}),
    provide(ElementSchemaRegistry, {useValue: new DomElementSchemaRegistry()}),
    RenderViewWithFragmentsStore,
    RenderProtoViewRefStore,
    AppViewPool,
    provide(APP_VIEW_POOL_CAPACITY, {useValue: 10000}),
    provide(AppViewManager, {useClass: AppViewManager_}),
    AppViewManagerUtils,
    AppViewListener,
    ProtoViewFactory,
    ViewResolver,
    DEFAULT_PIPES,
    DirectiveResolver,
    Parser,
    Lexer,
    provide(ExceptionHandler, {useFactory: () => new ExceptionHandler(DOM), deps: []}),
    provide(XHR, {useValue: new XHRImpl()}),
    UrlResolver,
    provide(DynamicComponentLoader, {useClass: DynamicComponentLoader_}),
    Testability,
    AnchorBasedAppRootUrl,
    provide(AppRootUrl, {useExisting: AnchorBasedAppRootUrl}),
    WebWorkerApplication,
    WebWorkerSetup,
    MessageBasedXHRImpl,
    MessageBasedRenderer,
    provide(ServiceMessageBrokerFactory, {useClass: ServiceMessageBrokerFactory_}),
    provide(ClientMessageBrokerFactory, {useClass: ClientMessageBrokerFactory_}),
    BrowserDetails,
    AnimationBuilder
  ];
}

export function createInjector(zone: NgZone, bus: MessageBus): Injector {
  BrowserDomAdapter.makeCurrent();
  _rootProviders.push(provide(NgZone, {useValue: zone}));
  _rootProviders.push(provide(MessageBus, {useValue: bus}));
  var injector: Injector = Injector.resolveAndCreate(_rootProviders);
  return injector.resolveAndCreateChild(_injectorProviders());
}
