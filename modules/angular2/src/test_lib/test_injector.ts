import {bind, Binding} from 'angular2/di';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {Reflector, reflector} from 'angular2/src/reflection/reflection';
import {
  Parser,
  Lexer,
  ChangeDetection,
  DynamicChangeDetection,
  PipeRegistry,
  defaultPipeRegistry
} from 'angular2/change_detection';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {TemplateLoader} from 'angular2/src/render/dom/compiler/template_loader';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
import {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {ShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/shadow_dom_strategy';
import {
  EmulatedUnscopedShadowDomStrategy
} from 'angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy';
import {XHR} from 'angular2/src/render/xhr';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';
import {NgZone} from 'angular2/src/core/zone/ng_zone';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {EventManager, DomEventsPlugin} from 'angular2/src/render/dom/events/event_manager';

import {MockTemplateResolver} from 'angular2/src/mock/template_resolver_mock';
import {MockXHR} from 'angular2/src/render/xhr_mock';
import {MockNgZone} from 'angular2/src/mock/ng_zone_mock';

import {TestBed} from './test_bed';
import {TestComponentBuilder} from './test_component_builder';

import {Injector} from 'angular2/di';

import {List, ListWrapper} from 'angular2/src/facade/collection';
import {FunctionWrapper, Type} from 'angular2/src/facade/lang';

import {AppViewPool, APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';
import {AppViewManagerUtils} from 'angular2/src/core/compiler/view_manager_utils';
import {ELEMENT_PROBE_CONFIG} from 'angular2/debug';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {RenderCompiler, Renderer} from 'angular2/src/render/api';
import {DomRenderer, DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';
import {DefaultDomCompiler} from 'angular2/src/render/dom/compiler/compiler';

/**
 * Returns the root injector bindings.
 *
 * This must be kept in sync with the _rootBindings in application.js
 *
 * @returns {any[]}
 */
function _getRootBindings() {
  return [
    bind(Reflector)
        .toValue(reflector),
  ];
}

/**
 * Returns the application injector bindings.
 *
 * This must be kept in sync with _injectorBindings() in application.js
 *
 * @returns {any[]}
 */
function _getAppBindings() {
  var appDoc;

  // The document is only available in browser environment
  try {
    appDoc = DOM.defaultDoc();
  } catch (e) {
    appDoc = null;
  }
  return [
    bind(DOCUMENT_TOKEN)
        .toValue(appDoc),
    bind(ShadowDomStrategy)
        .toFactory((styleUrlResolver, doc) =>
                       new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, doc.head),
                   [StyleUrlResolver, DOCUMENT_TOKEN]),
    DomRenderer,
    DefaultDomCompiler,
    bind(Renderer).toAlias(DomRenderer),
    bind(RenderCompiler).toAlias(DefaultDomCompiler),
    ProtoViewFactory,
    AppViewPool,
    AppViewManager,
    AppViewManagerUtils,
    ELEMENT_PROBE_CONFIG,
    bind(APP_VIEW_POOL_CAPACITY).toValue(500),
    Compiler,
    CompilerCache,
    bind(TemplateResolver).toClass(MockTemplateResolver),
    bind(PipeRegistry).toValue(defaultPipeRegistry),
    bind(ChangeDetection).toClass(DynamicChangeDetection),
    TemplateLoader,
    DynamicComponentLoader,
    DirectiveResolver,
    Parser,
    Lexer,
    ExceptionHandler,
    bind(XHR).toClass(MockXHR),
    ComponentUrlMapper,
    UrlResolver,
    StyleUrlResolver,
    StyleInliner,
    TestBed,
    TestComponentBuilder,
    bind(NgZone).toClass(MockNgZone),
    bind(EventManager)
        .toFactory(
            (zone) => {
              var plugins = [
                new DomEventsPlugin(),
              ];
              return new EventManager(plugins, zone);
            },
            [NgZone]),
  ];
}

export function createTestInjector(bindings: List<Type | Binding | List<any>>): Injector {
  var rootInjector = Injector.resolveAndCreate(_getRootBindings());
  return rootInjector.resolveAndCreateChild(ListWrapper.concat(_getAppBindings(), bindings));
}

/**
 * Allows injecting dependencies in `beforeEach()` and `it()`.
 *
 * Example:
 *
 * ```
 * beforeEach(inject([Dependency, AClass], (dep, object) => {
 *   // some code that uses `dep` and `object`
 *   // ...
 * }));
 *
 * it('...', inject([AClass, AsyncTestCompleter], (object, async) => {
 *   object.doSomething().then(() => {
 *     expect(...);
 *     async.done();
 *   });
 * })
 * ```
 *
 * Notes:
 * - injecting an `AsyncTestCompleter` allow completing async tests - this is the equivalent of
 *   adding a `done` parameter in Jasmine,
 * - inject is currently a function because of some Traceur limitation the syntax should eventually
 *   becomes `it('...', @Inject (object: AClass, async: AsyncTestCompleter) => { ... });`
 *
 * @param {Array} tokens
 * @param {Function} fn
 * @return {FunctionWithParamTokens}
 * @exportedAs angular2/test
 */
export function inject(tokens: List<any>, fn: Function): FunctionWithParamTokens {
  return new FunctionWithParamTokens(tokens, fn);
}

export class FunctionWithParamTokens {
  _tokens: List<any>;
  _fn: Function;

  constructor(tokens: List<any>, fn: Function) {
    this._tokens = tokens;
    this._fn = fn;
  }

  execute(injector: Injector): void {
    var params = ListWrapper.map(this._tokens, (t) => injector.get(t));
    FunctionWrapper.apply(this._fn, params);
  }
}
