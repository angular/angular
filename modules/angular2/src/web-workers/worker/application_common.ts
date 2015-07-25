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
} from 'angular2/src/facade/lang';
import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {Reflector, reflector} from 'angular2/src/reflection/reflection';
import {
  Parser,
  Lexer,
  ChangeDetection,
  DynamicChangeDetection,
  JitChangeDetection,
  Pipes,
  defaultPipes,
  PreGeneratedChangeDetection
} from 'angular2/src/change_detection/change_detection';
import {StyleUrlResolver} from 'angular2/src/render/dom/compiler/style_url_resolver';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {ViewResolver} from 'angular2/src/core/compiler/view_resolver';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper, PromiseCompleter} from 'angular2/src/facade/async';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {XHR} from 'angular2/src/render/xhr';
import {XHRImpl} from 'angular2/src/render/xhr_impl';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {AppRootUrl} from 'angular2/src/services/app_root_url';
import {
  ComponentRef,
  DynamicComponentLoader
} from 'angular2/src/core/compiler/dynamic_component_loader';
import {Testability} from 'angular2/src/core/testability/testability';
import {AppViewPool, APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';
import {AppViewListener} from 'angular2/src/core/compiler/view_listener';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {WorkerRenderer, WorkerCompiler} from './renderer';
import {Renderer, RenderCompiler} from 'angular2/src/render/api';
import {internalView} from 'angular2/src/core/compiler/view_ref';

import {MessageBroker} from 'angular2/src/web-workers/worker/broker';
import {WorkerMessageBus} from 'angular2/src/web-workers/worker/application';
import {
  appComponentRefPromiseToken,
  appComponentTypeToken
} from 'angular2/src/core/application_tokens';
import {ApplicationRef} from 'angular2/src/core/application';
import {createNgZone} from 'angular2/src/core/application_common';
import {Serializer} from "angular2/src/web-workers/shared/serializer";
import {ON_WEBWORKER} from "angular2/src/web-workers/shared/api";
import {RenderProtoViewRefStore} from 'angular2/src/web-workers/shared/render_proto_view_ref_store';
import {
  RenderViewWithFragmentsStore
} from 'angular2/src/web-workers/shared/render_view_with_fragments_store';

var _rootInjector: Injector;

// Contains everything that is safe to share between applications.
var _rootBindings = [bind(Reflector).toValue(reflector)];

class PrintLogger {
  log = print;
  logGroup = print;
  logGroupEnd() {}
}

function _injectorBindings(appComponentType, bus: WorkerMessageBus,
                           initData: StringMap<string, any>): List<Type | Binding | List<any>> {
  var bestChangeDetection: Type = DynamicChangeDetection;
  if (PreGeneratedChangeDetection.isSupported()) {
    bestChangeDetection = PreGeneratedChangeDetection;
  } else if (JitChangeDetection.isSupported()) {
    bestChangeDetection = JitChangeDetection;
  }
  return [
    bind(appComponentTypeToken)
        .toValue(appComponentType),
    bind(appComponentRefPromiseToken)
        .toFactory(
            (dynamicComponentLoader, injector) => {

              // TODO(rado): investigate whether to support bindings on root component.
              return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector)
                  .then((componentRef) => { return componentRef; });
            },
            [DynamicComponentLoader, Injector]),

    bind(appComponentType).toFactory((ref) => ref.instance, [appComponentRefPromiseToken]),
    bind(LifeCycle).toFactory((exceptionHandler) => new LifeCycle(null, assertionsEnabled()),
                              [ExceptionHandler]),
    Serializer,
    bind(WorkerMessageBus).toValue(bus),
    bind(MessageBroker)
        .toFactory((a, b) => new MessageBroker(a, b), [WorkerMessageBus, Serializer]),
    WorkerRenderer,
    bind(Renderer).toAlias(WorkerRenderer),
    WorkerCompiler,
    bind(RenderCompiler).toAlias(WorkerCompiler),
    bind(ON_WEBWORKER).toValue(true),
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
    bind(Pipes).toValue(defaultPipes),
    bind(ChangeDetection).toClass(bestChangeDetection),
    DirectiveResolver,
    Parser,
    Lexer,
    bind(ExceptionHandler).toFactory(() => new ExceptionHandler(new PrintLogger()), []),
    bind(XHR).toValue(new XHRImpl()),
    ComponentUrlMapper,
    UrlResolver,
    StyleUrlResolver,
    DynamicComponentLoader,
    Testability,
    bind(AppRootUrl).toValue(new AppRootUrl(initData['rootUrl']))
  ];
}

export function bootstrapWebworkerCommon(
    appComponentType: Type, bus: WorkerMessageBus,
    componentInjectableBindings: List<Type | Binding | List<any>> = null): Promise<ApplicationRef> {
  var bootstrapProcess: PromiseCompleter<any> = PromiseWrapper.completer();

  var zone = createNgZone(new ExceptionHandler(new PrintLogger()));
  zone.run(() => {
    // TODO(rado): prepopulate template cache, so applications with only
    // index.html and main.js are possible.
    //

    var listenerId: int;
    listenerId = bus.source.addListener((message: StringMap<string, any>) => {
      if (message["data"]["type"] !== "init") {
        return;
      }

      var appInjector = _createAppInjector(appComponentType, componentInjectableBindings, zone, bus,
                                           message["data"]["value"]);
      var compRefToken = PromiseWrapper.wrap(() => {
        try {
          return appInjector.get(appComponentRefPromiseToken);
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

      PromiseWrapper.catchError(compRefToken, (err) => {
        print(err);
        bootstrapProcess.reject(err, err.stack);
      });

      bus.source.removeListener(listenerId);
    });

    bus.sink.send({'type': "ready"});
  });

  return bootstrapProcess.promise;
}

function _createAppInjector(appComponentType: Type, bindings: List<Type | Binding | List<any>>,
                            zone: NgZone, bus: WorkerMessageBus, initData: StringMap<string, any>):
    Injector {
  if (isBlank(_rootInjector)) _rootInjector = Injector.resolveAndCreate(_rootBindings);
  var mergedBindings: any[] =
      isPresent(bindings) ?
          ListWrapper.concat(_injectorBindings(appComponentType, bus, initData), bindings) :
          _injectorBindings(appComponentType, bus, initData);
  mergedBindings.push(bind(NgZone).toValue(zone));
  return _rootInjector.resolveAndCreateChild(mergedBindings);
}
