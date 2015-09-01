import {Injector, bind, OpaqueToken, Binding} from 'angular2/di';
import {
  NumberWrapper,
  Type,
  isBlank,
  isPresent,
  BaseException,
  assertionsEnabled,
  print,
  stringify
} from 'angular2/src/core/facade/lang';
import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {Reflector, reflector} from 'angular2/src/core/reflection/reflection';
import {
  Parser,
  Lexer,
  ChangeDetection,
  DynamicChangeDetection,
  JitChangeDetection,
  PreGeneratedChangeDetection,
  IterableDiffers,
  defaultIterableDiffers,
  KeyValueDiffers,
  defaultKeyValueDiffers
} from 'angular2/src/core/change_detection/change_detection';
import {DEFAULT_PIPES} from 'angular2/pipes';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {StyleUrlResolver} from 'angular2/src/core/render/dom/compiler/style_url_resolver';
import {PipeResolver} from 'angular2/src/core/compiler/pipe_resolver';
import {ViewResolver} from 'angular2/src/core/compiler/view_resolver';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {Promise, PromiseWrapper, PromiseCompleter} from 'angular2/src/core/facade/async';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {XHR} from 'angular2/src/core/render/xhr';
import {WebWorkerXHRImpl} from 'angular2/src/web_workers/worker/xhr_impl';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';
import {AppRootUrl} from 'angular2/src/core/services/app_root_url';
import {
  ComponentRef,
  DynamicComponentLoader
} from 'angular2/src/core/compiler/dynamic_component_loader';
import {AppViewPool, APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';
import {AppViewListener} from 'angular2/src/core/compiler/view_listener';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {WebWorkerRenderer, WebWorkerCompiler} from './renderer';
import {Renderer, RenderCompiler} from 'angular2/src/core/render/api';
import {internalView} from 'angular2/src/core/compiler/view_ref';
import {ClientMessageBrokerFactory} from 'angular2/src/web_workers/shared/client_message_broker';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {APP_COMPONENT_REF_PROMISE, APP_COMPONENT} from 'angular2/src/core/application_tokens';
import {ApplicationRef} from 'angular2/src/core/application_ref';
import {Serializer} from "angular2/src/web_workers/shared/serializer";
import {ON_WEB_WORKER} from "angular2/src/web_workers/shared/api";
import {RenderProtoViewRefStore} from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import {
  RenderViewWithFragmentsStore
} from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import {ObservableWrapper} from 'angular2/src/core/facade/async';
import {SETUP_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {WebWorkerEventDispatcher} from 'angular2/src/web_workers/worker/event_dispatcher';

var _rootInjector: Injector;

// Contains everything that is safe to share between applications.
var _rootBindings = [bind(Reflector).toValue(reflector)];

class PrintLogger {
  log = print;
  logError = print;
  logGroup = print;
  logGroupEnd() {}
}

function _injectorBindings(appComponentType, bus: MessageBus, initData: StringMap<string, any>):
    Array<Type | Binding | any[]> {
  var bestChangeDetection = new DynamicChangeDetection();
  if (PreGeneratedChangeDetection.isSupported()) {
    bestChangeDetection = new PreGeneratedChangeDetection();
  } else if (JitChangeDetection.isSupported()) {
    bestChangeDetection = new JitChangeDetection();
  }
  return [
    bind(APP_COMPONENT)
        .toValue(appComponentType),
    bind(APP_COMPONENT_REF_PROMISE)
        .toFactory(
            (dynamicComponentLoader, injector) => {

              // TODO(rado): investigate whether to support bindings on root component.
              return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector)
                  .then((componentRef) => { return componentRef; });
            },
            [DynamicComponentLoader, Injector]),

    bind(appComponentType).toFactory((ref) => ref.instance, [APP_COMPONENT_REF_PROMISE]),
    bind(LifeCycle).toFactory((exceptionHandler) => new LifeCycle(null, assertionsEnabled()),
                              [ExceptionHandler]),
    Serializer,
    bind(MessageBus).toValue(bus),
    ClientMessageBrokerFactory,
    WebWorkerRenderer,
    bind(Renderer).toAlias(WebWorkerRenderer),
    WebWorkerCompiler,
    bind(RenderCompiler).toAlias(WebWorkerCompiler),
    bind(ON_WEB_WORKER).toValue(true),
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
    bind(IterableDiffers).toValue(defaultIterableDiffers),
    bind(KeyValueDiffers).toValue(defaultKeyValueDiffers),
    bind(ChangeDetection).toValue(bestChangeDetection),
    DirectiveResolver,
    UrlResolver,
    StyleUrlResolver,
    PipeResolver,
    Parser,
    Lexer,
    bind(ExceptionHandler).toFactory(() => new ExceptionHandler(new PrintLogger()), []),
    WebWorkerXHRImpl,
    bind(XHR).toAlias(WebWorkerXHRImpl),
    ComponentUrlMapper,
    DynamicComponentLoader,
    bind(AppRootUrl).toValue(new AppRootUrl(initData['rootUrl'])),
    WebWorkerEventDispatcher
  ];
}

export function bootstrapWebWorkerCommon(
    appComponentType: Type, bus: MessageBus,
    componentInjectableBindings: Array<Type | Binding | any[]> = null): Promise<ApplicationRef> {
  var bootstrapProcess: PromiseCompleter<any> = PromiseWrapper.completer();

  var zone = new NgZone({enableLongStackTrace: assertionsEnabled()});
  zone.run(() => {
    // TODO(rado): prepopulate template cache, so applications with only
    // index.html and main.js are possible.
    //


    var subscription: any;
    var emitter = bus.from(SETUP_CHANNEL);
    subscription = ObservableWrapper.subscribe(emitter, (message: StringMap<string, any>) => {
      var appInjector =
          _createAppInjector(appComponentType, componentInjectableBindings, zone, bus, message);
      var compRefToken = PromiseWrapper.wrap(() => {
        try {
          return appInjector.get(APP_COMPONENT_REF_PROMISE);
        } catch (e) {
          throw e;
        }
      });
      var tick = (componentRef) => {
        var appChangeDetector = internalView(componentRef.hostView).changeDetector;
        // retrieve life cycle: may have already been created if injected in root component
        var lc = appInjector.get(LifeCycle);
        lc.registerWith(zone, appChangeDetector);
        lc.tick();  // the first tick that will bootstrap the app

        bootstrapProcess.resolve(new ApplicationRef(componentRef, appComponentType, appInjector));
      };
      PromiseWrapper.then(compRefToken, tick,
                          (err, stackTrace) => { bootstrapProcess.reject(err, stackTrace); });

      ObservableWrapper.dispose(subscription);
    });

    ObservableWrapper.callNext(bus.to(SETUP_CHANNEL), "ready");
  });

  return bootstrapProcess.promise;
}

function _createAppInjector(appComponentType: Type, bindings: Array<Type | Binding | any[]>,
                            zone: NgZone, bus: MessageBus, initData: StringMap<string, any>):
    Injector {
  if (isBlank(_rootInjector)) _rootInjector = Injector.resolveAndCreate(_rootBindings);
  var mergedBindings: any[] =
      isPresent(bindings) ?
          ListWrapper.concat(_injectorBindings(appComponentType, bus, initData), bindings) :
          _injectorBindings(appComponentType, bus, initData);
  mergedBindings.push(bind(NgZone).toValue(zone));
  return _rootInjector.resolveAndCreateChild(mergedBindings);
}
