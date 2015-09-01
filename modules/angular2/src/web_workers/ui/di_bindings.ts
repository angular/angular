// TODO (jteplitz602): This whole file is nearly identical to core/application.ts.
// There should be a way to refactor application so that this file is unnecessary. See #3277
import {Injector, bind, Binding} from "angular2/di";
import {Reflector, reflector} from 'angular2/src/core/reflection/reflection';
import {
  Parser,
  Lexer,
  ChangeDetection,
  DynamicChangeDetection,
  JitChangeDetection,
  PreGeneratedChangeDetection
} from 'angular2/src/core/change_detection/change_detection';
import {DEFAULT_PIPES} from 'angular2/pipes';
import {EventManager, DomEventsPlugin} from 'angular2/src/core/render/dom/events/event_manager';
import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {BrowserDomAdapter} from 'angular2/src/core/dom/browser_adapter';
import {KeyEventsPlugin} from 'angular2/src/core/render/dom/events/key_events';
import {HammerGesturesPlugin} from 'angular2/src/core/render/dom/events/hammer_gestures';
import {AppViewPool, APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';
import {Renderer, RenderCompiler} from 'angular2/src/core/render/api';
import {AppRootUrl} from 'angular2/src/core/services/app_root_url';
import {
  DomRenderer,
  DOCUMENT,
  DefaultDomCompiler,
  APP_ID_RANDOM_BINDING,
  MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE,
  TemplateCloner
} from 'angular2/src/core/render/render';
import {ElementSchemaRegistry} from 'angular2/src/core/render/dom/schema/element_schema_registry';
import {
  DomElementSchemaRegistry
} from 'angular2/src/core/render/dom/schema/dom_element_schema_registry';
import {
  SharedStylesHost,
  DomSharedStylesHost
} from 'angular2/src/core/render/dom/view/shared_styles_host';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';
import {AppViewListener} from 'angular2/src/core/compiler/view_listener';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {ViewResolver} from 'angular2/src/core/compiler/view_resolver';
import {ViewLoader} from 'angular2/src/core/render/dom/compiler/view_loader';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {StyleInliner} from 'angular2/src/core/render/dom/compiler/style_inliner';
import {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {StyleUrlResolver} from 'angular2/src/core/render/dom/compiler/style_url_resolver';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';
import {Testability} from 'angular2/src/core/testability/testability';
import {XHR} from 'angular2/src/core/render/xhr';
import {XHRImpl} from 'angular2/src/core/render/xhr_impl';
import {Serializer} from 'angular2/src/web_workers/shared/serializer';
import {ON_WEB_WORKER} from 'angular2/src/web_workers/shared/api';
import {RenderProtoViewRefStore} from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import {
  RenderViewWithFragmentsStore
} from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import {AnchorBasedAppRootUrl} from 'angular2/src/core/services/anchor_based_app_root_url';
import {WebWorkerApplication} from 'angular2/src/web_workers/ui/impl';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {MessageBasedRenderCompiler} from 'angular2/src/web_workers/ui/render_compiler';
import {MessageBasedRenderer} from 'angular2/src/web_workers/ui/renderer';
import {MessageBasedXHRImpl} from 'angular2/src/web_workers/ui/xhr_impl';
import {WebWorkerSetup} from 'angular2/src/web_workers/ui/setup';
import {ServiceMessageBrokerFactory} from 'angular2/src/web_workers/shared/service_message_broker';
import {ClientMessageBrokerFactory} from 'angular2/src/web_workers/shared/client_message_broker';

var _rootInjector: Injector;

// Contains everything that is safe to share between applications.
var _rootBindings = [bind(Reflector).toValue(reflector)];

// TODO: This code is nearly identitcal to core/application. There should be a way to only write it
// once
function _injectorBindings(): any[] {
  var bestChangeDetection = new DynamicChangeDetection();
  if (PreGeneratedChangeDetection.isSupported()) {
    bestChangeDetection = new PreGeneratedChangeDetection();
  } else if (JitChangeDetection.isSupported()) {
    bestChangeDetection = new JitChangeDetection();
  }

  return [
    bind(DOCUMENT)
        .toValue(DOM.defaultDoc()),
    bind(EventManager)
        .toFactory(
            (ngZone) => {
              var plugins =
                  [new HammerGesturesPlugin(), new KeyEventsPlugin(), new DomEventsPlugin()];
              return new EventManager(plugins, ngZone);
            },
            [NgZone]),
    DomRenderer,
    bind(Renderer).toAlias(DomRenderer),
    APP_ID_RANDOM_BINDING,
    TemplateCloner,
    bind(MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE).toValue(20),
    DefaultDomCompiler,
    bind(RenderCompiler).toAlias(DefaultDomCompiler),
    DomSharedStylesHost,
    bind(SharedStylesHost).toAlias(DomSharedStylesHost),
    Serializer,
    bind(ON_WEB_WORKER).toValue(false),
    bind(ElementSchemaRegistry).toValue(new DomElementSchemaRegistry()),
    RenderViewWithFragmentsStore,
    RenderProtoViewRefStore,
    ProtoViewFactory,
    AppViewPool,
    bind(APP_VIEW_POOL_CAPACITY).toValue(10000),
    AppViewManager,
    AppViewManagerUtils,
    AppViewListener,
    Compiler,
    CompilerCache,
    ViewResolver,
    DEFAULT_PIPES,
    bind(ChangeDetection).toValue(bestChangeDetection),
    ViewLoader,
    DirectiveResolver,
    Parser,
    Lexer,
    bind(ExceptionHandler).toFactory(() => new ExceptionHandler(DOM), []),
    bind(XHR).toValue(new XHRImpl()),
    ComponentUrlMapper,
    UrlResolver,
    StyleUrlResolver,
    StyleInliner,
    DynamicComponentLoader,
    Testability,
    AnchorBasedAppRootUrl,
    bind(AppRootUrl).toAlias(AnchorBasedAppRootUrl),
    WebWorkerApplication,
    WebWorkerSetup,
    MessageBasedRenderCompiler,
    MessageBasedXHRImpl,
    MessageBasedRenderer,
    ServiceMessageBrokerFactory,
    ClientMessageBrokerFactory
  ];
}

export function createInjector(zone: NgZone, bus: MessageBus): Injector {
  BrowserDomAdapter.makeCurrent();
  _rootBindings.push(bind(NgZone).toValue(zone));
  _rootBindings.push(bind(MessageBus).toValue(bus));
  var injector: Injector = Injector.resolveAndCreate(_rootBindings);
  return injector.resolveAndCreateChild(_injectorBindings());
}
