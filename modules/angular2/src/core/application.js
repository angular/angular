import {Injector, bind, OpaqueToken, Optional} from 'angular2/di';
import {NumberWrapper, Type, isBlank, isPresent, BaseException,
    assertionsEnabled, print, stringify} from 'angular2/src/facade/lang';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Compiler, CompilerCache} from './compiler/compiler';
import {Reflector, reflector} from 'angular2/src/reflection/reflection';
import {Parser, Lexer, ChangeDetection, DynamicChangeDetection, PipeRegistry, defaultPipeRegistry} from 'angular2/change_detection';
import {ExceptionHandler} from './exception_handler';
import {TemplateLoader} from 'angular2/src/render/dom/compiler/template_loader';
import {TemplateResolver} from './compiler/template_resolver';
import {DirectiveMetadataReader} from './compiler/directive_metadata_reader';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {VmTurnZone} from 'angular2/src/core/zone/vm_turn_zone';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {ShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/shadow_dom_strategy';
import {EmulatedUnscopedShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy';
import {XHR} from 'angular2/src/services/xhr';
import {XHRImpl} from 'angular2/src/services/xhr_impl';
import {EventManager, DomEventsPlugin} from 'angular2/src/render/dom/events/event_manager';
import {KeyEventsPlugin} from 'angular2/src/render/dom/events/key_events';
import {HammerGesturesPlugin} from 'angular2/src/render/dom/events/hammer_gestures';
import {Binding} from 'angular2/src/di/binding';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';
import {ComponentRef, DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';
import {AppViewPool, APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {Renderer} from 'angular2/src/render/api';
import {DirectDomRenderer} from 'angular2/src/render/dom/direct_dom_renderer';
import * as rc from 'angular2/src/render/dom/compiler/compiler';
import * as rvf from 'angular2/src/render/dom/view/view_factory';
import * as rvh from 'angular2/src/render/dom/view/view_hydrator';

import {
  appComponentRefToken,
  appChangeDetectorToken,
  appElementToken,
  appComponentAnnotatedTypeToken,
  appDocumentToken,
} from './application_tokens';

var _rootInjector: Injector;

// Contains everything that is safe to share between applications.
var _rootBindings = [
  bind(Reflector).toValue(reflector),
  TestabilityRegistry
];

function _injectorBindings(appComponentType): List<Binding> {
  return [
      bind(appDocumentToken).toValue(DOM.defaultDoc()),
      bind(appComponentAnnotatedTypeToken).toFactory((reader) => {
        // TODO(rado): investigate whether to support bindings on root component.
        return reader.read(appComponentType);
      }, [DirectiveMetadataReader]),

      bind(appElementToken).toFactory((appComponentAnnotatedType, appDocument) => {
        var selector = appComponentAnnotatedType.annotation.selector;
        var element = DOM.querySelector(appDocument, selector);
        if (isBlank(element)) {
          throw new BaseException(`The app selector "${selector}" did not match any elements`);
        }
        return element;
      }, [appComponentAnnotatedTypeToken, appDocumentToken]),
      bind(appComponentRefToken).toAsyncFactory((dynamicComponentLoader, injector, appElement,
        appComponentAnnotatedType, testability, registry) => {

        // We need to do this here to ensure that we create Testability and
        // it's ready on the window for users.
        registry.registerApplication(appElement, testability);
        return dynamicComponentLoader.loadIntoNewLocation(appComponentAnnotatedType.type, null, appElement, injector);
      }, [DynamicComponentLoader, Injector, appElementToken, appComponentAnnotatedTypeToken,
        Testability, TestabilityRegistry]),

      bind(appChangeDetectorToken).toFactory((ref) => ref.hostView.changeDetector,
          [appComponentRefToken]),
      bind(appComponentType).toFactory((ref) => ref.instance,
          [appComponentRefToken]),
      bind(LifeCycle).toFactory((exceptionHandler) => new LifeCycle(exceptionHandler, null, assertionsEnabled()),[ExceptionHandler]),
      bind(EventManager).toFactory((zone) => {
        var plugins = [new HammerGesturesPlugin(), new KeyEventsPlugin(), new DomEventsPlugin()];
        return new EventManager(plugins, zone);
      }, [VmTurnZone]),
      bind(ShadowDomStrategy).toFactory(
          (styleUrlResolver, doc) => new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, doc.head),
          [StyleUrlResolver, appDocumentToken]),
      DirectDomRenderer,
      bind(Renderer).toClass(DirectDomRenderer),
      bind(rc.Compiler).toClass(rc.DefaultCompiler),
      // TODO(tbosch): We need an explicit factory here, as
      // we are getting errors in dart2js with mirrors...
      bind(rvf.ViewFactory).toFactory(
        (capacity, eventManager, shadowDomStrategy) => new rvf.ViewFactory(capacity, eventManager, shadowDomStrategy),
        [rvf.VIEW_POOL_CAPACITY, EventManager, ShadowDomStrategy]
      ),
      bind(rvf.VIEW_POOL_CAPACITY).toValue(10000),
      rvh.RenderViewHydrator,
      ProtoViewFactory,
      // TODO(tbosch): We need an explicit factory here, as
      // we are getting errors in dart2js with mirrors...
      bind(AppViewPool).toFactory(
        (capacity) => new AppViewPool(capacity),
        [APP_VIEW_POOL_CAPACITY]
      ),
      bind(APP_VIEW_POOL_CAPACITY).toValue(10000),
      AppViewManager,
      AppViewManagerUtils,
      Compiler,
      CompilerCache,
      TemplateResolver,
      bind(PipeRegistry).toValue(defaultPipeRegistry),
      bind(ChangeDetection).toClass(DynamicChangeDetection),
      TemplateLoader,
      DirectiveMetadataReader,
      Parser,
      Lexer,
      ExceptionHandler,
      bind(XHR).toValue(new XHRImpl()),
      ComponentUrlMapper,
      UrlResolver,
      StyleUrlResolver,
      StyleInliner,
      DynamicComponentLoader,
      Testability
  ];
}

function _createVmZone(givenReporter:Function): VmTurnZone {
  var defaultErrorReporter = (exception, stackTrace) => {
    var longStackTrace = ListWrapper.join(stackTrace, "\n\n-----async gap-----\n");
    print(`${exception}\n\n${longStackTrace}`);
    throw exception;
  };

  var reporter = isPresent(givenReporter) ? givenReporter : defaultErrorReporter;

  var zone = new VmTurnZone({enableLongStackTrace: assertionsEnabled()});
  zone.initCallbacks({onErrorHandler: reporter});
  return zone;
}

/**
 * Bootstrapping for Angular applications.
 *
 * You instantiate an Angular application by explicitly specifying a component to use as the root component for your
 * application via the `bootstrap()` method.
 *
 * ## Simple Example
 *
 * Assuming this `index.html`:
 *
 * ```html
 * <html>
 *   <!-- load Angular script tags here. -->
 *   <body>
 *     <my-app>loading...</my-app>
 *   </body>
 * </html>
 * ```
 *
 * An application is bootstrapped inside an existing browser DOM, typically `index.html`. Unlike Angular 1, Angular 2
 * does not compile/process bindings in `index.html`. This is mainly for security reasons, as well as architectural
 * changes in Angular 2. This means that `index.html` can safely be processed using server-side technologies such as
 * bindings. Bindings can thus use double-curly `{{ syntax }}` without collision from Angular 2 component double-curly
 * `{{ syntax }}`.
 *
 * We can use this script code:
 *
 * ```
 * @Component({
 *    selector: 'my-app'
 * })
 * @View({
 *    template: 'Hello {{ name }}!'
 * })
 * class MyApp {
 *   name:string;
 *
 *   constructor() {
 *     this.name = 'World';
 *   }
 * }
 *
 * main() {
 *   return bootstrap(MyApp);
 * }
 * ```
 *
 * When the app developer invokes `bootstrap()` with the root component `MyApp` as its argument, Angular performs the
 * following tasks:
 *
 *  1. It uses the component's `selector` property to locate the DOM element which needs to be upgraded into
 *     the angular component.
 *  2. It creates a new child injector (from the platform injector) and configures the injector with the component's
 *     `injectables`. Optionally, you can also override the injector configuration for an app by invoking
 *     `bootstrap` with the `componentInjectableBindings` argument.
 *  3. It creates a new `Zone` and connects it to the angular application's change detection domain instance.
 *  4. It creates a shadow DOM on the selected component's host element and loads the template into it.
 *  5. It instantiates the specified component.
 *  6. Finally, Angular performs change detection to apply the initial data bindings for the application.
 *
 *
 * ## Instantiating Multiple Applications on a Single Page
 *
 * There are two ways to do this.
 *
 *
 * ### Isolated Applications
 *
 * Angular creates a new application each time that the `bootstrap()` method is invoked. When multiple applications
 * are created for a page, Angular treats each application as independent within an isolated change detection and
 * `Zone` domain. If you need to share data between applications, use the strategy described in the next
 * section, "Applications That Share Change Detection."
 *
 *
 * ### Applications That Share Change Detection
 *
 * If you need to bootstrap multiple applications that share common data, the applications must share a common
 * change detection and zone. To do that, create a meta-component that lists the application components in its template.
 * By only invoking the `bootstrap()` method once, with the meta-component as its argument, you ensure that only a
 * single change detection zone is created and therefore data can be shared across the applications.
 *
 *
 * ## Platform Injector
 *
 * When working within a browser window, there are many singleton resources: cookies, title, location, and others.
 * Angular services that represent these resources must likewise be shared across all Angular applications that
 * occupy the same browser window.  For this reason, Angular creates exactly one global platform injector which stores
 * all shared services, and each angular application injector has the platform injector as its parent.
 *
 * Each application has its own private injector as well. When there are multiple applications on a page, Angular treats
 * each application injector's services as private to that application.
 *
 *
 * # API
 * - `appComponentType`: The root component which should act as the application. This is a reference to a `Type`
 *   which is annotated with `@Component(...)`.
 * - `componentInjectableBindings`: An additional set of bindings that can be added to `injectables` for the
 * {@link Component} to override default injection behavior.
 * - `errorReporter`: `function(exception:any, stackTrace:string)` a default error reporter for unhandled exceptions.
 *
 * Returns a `Promise` with the application`s private {@link Injector}.
 *
 * @exportedAs angular2/core
 */
export function bootstrap(appComponentType: Type,
                          componentInjectableBindings: List<Binding> = null,
                          errorReporter: Function = null): Promise<ComponentRef> {
  BrowserDomAdapter.makeCurrent();
  var bootstrapProcess = PromiseWrapper.completer();

  var zone = _createVmZone(errorReporter);
  zone.run(() => {
    // TODO(rado): prepopulate template cache, so applications with only
    // index.html and main.js are possible.

    var appInjector = _createAppInjector(appComponentType, componentInjectableBindings, zone);

    PromiseWrapper.then(appInjector.asyncGet(appComponentRefToken),
      (componentRef) => {
        var appChangeDetector = componentRef.hostView.changeDetector;
        // retrieve life cycle: may have already been created if injected in root component
        var lc = appInjector.get(LifeCycle);
        lc.registerWith(zone, appChangeDetector);
        lc.tick(); //the first tick that will bootstrap the app

        bootstrapProcess.resolve(componentRef);
      },

      (err) => {
        bootstrapProcess.reject(err)
      });
  });

  return bootstrapProcess.promise;
}

function _createAppInjector(appComponentType: Type, bindings: List<Binding>, zone: VmTurnZone): Injector {
  if (isBlank(_rootInjector)) _rootInjector = Injector.resolveAndCreate(_rootBindings);
  var mergedBindings = isPresent(bindings) ?
      ListWrapper.concat(_injectorBindings(appComponentType), bindings) :
      _injectorBindings(appComponentType);
  ListWrapper.push(mergedBindings, bind(VmTurnZone).toValue(zone));
  return _rootInjector.resolveAndCreateChild(mergedBindings);
}
