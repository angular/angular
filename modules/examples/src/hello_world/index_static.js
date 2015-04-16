import *  as app from './index_common';

import {Component, Decorator, View, NgElement} from 'angular2/angular2';
import {Lexer, Parser, ChangeDetection, ChangeDetector, PipeRegistry, DynamicChangeDetection} from 'angular2/change_detection';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {ShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/shadow_dom_strategy';
import {NativeShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/native_shadow_dom_strategy';
import {EmulatedUnscopedShadowDomStrategy} from 'angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy';
import {TemplateLoader} from 'angular2/src/render/dom/compiler/template_loader';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {XHR} from 'angular2/src/services/xhr';
import {XHRImpl} from 'angular2/src/services/xhr_impl';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';
import {EventManager} from 'angular2/src/render/dom/events/event_manager';
import {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';

import {reflector} from 'angular2/src/reflection/reflection';

import {ViewFactory, VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_factory';
import {AppViewHydrator} from 'angular2/src/core/compiler/view_hydrator';
import {ProtoViewFactory} from 'angular2/src/core/compiler/proto_view_factory';
import {Renderer} from 'angular2/src/render/api';
import {DirectDomRenderer} from 'angular2/src/render/dom/direct_dom_renderer';
import * as rc from 'angular2/src/render/dom/compiler/compiler';
import * as rvf from 'angular2/src/render/dom/view/view_factory';
import * as rvh from 'angular2/src/render/dom/view/view_hydrator';
import {Inject} from 'angular2/di';

function setup() {
  reflector.registerType(app.HelloCmp, {
    "factory": (service) => new app.HelloCmp(service),
    "parameters": [[app.GreetingService]],
    "annotations" : [
      new Component({
        selector: 'hello-app',
        injectables: [app.GreetingService]
      }),
      new View({
        directives: [app.RedDec],
        template: `<div class="greeting">{{greeting}} <span red>world</span>!</div>
                 <button class="changeButton" (click)="changeGreeting()">change greeting</button>`
      })]
  });

  reflector.registerType(app.RedDec, {
    "factory": (el) => new app.RedDec(el),
    "parameters": [[NgElement]],
    "annotations" : [new Decorator({selector: '[red]'})]
  });

  reflector.registerType(app.GreetingService, {
    "factory": () => new app.GreetingService(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(Compiler, {
    "factory": (reader, compilerCache, tplResolver, cmpUrlMapper, urlResolver, renderer,
                protoViewFactory) =>
      new Compiler(reader, compilerCache, tplResolver, cmpUrlMapper, urlResolver, renderer,
                protoViewFactory),
    "parameters": [[DirectiveMetadataReader], [CompilerCache], [TemplateResolver], [ComponentUrlMapper],
                   [UrlResolver], [Renderer], [ProtoViewFactory]],
    "annotations": []
  });

  reflector.registerType(CompilerCache, {
    "factory": () => new CompilerCache(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(Parser, {
    "factory": (lexer) => new Parser(lexer),
    "parameters": [[Lexer]],
    "annotations": []
  });

  reflector.registerType(TemplateLoader, {
    "factory": (xhr, urlResolver) => new TemplateLoader(xhr, urlResolver),
    "parameters": [[XHR], [UrlResolver]],
    "annotations": []
  });

  reflector.registerType(TemplateResolver, {
    "factory": () => new TemplateResolver(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(XHR, {
    "factory": () => new XHRImpl(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(DirectiveMetadataReader, {
    "factory": () => new DirectiveMetadataReader(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(Lexer, {
    "factory": () => new Lexer(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(ExceptionHandler, {
    "factory": () => new ExceptionHandler(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(LifeCycle, {
    "factory": (exHandler, cd) => new LifeCycle(exHandler, cd),
    "parameters": [[ExceptionHandler], [ChangeDetector]],
    "annotations": []
  });

  reflector.registerType(ShadowDomStrategy, {
    "factory": (strategy) => strategy,
    "parameters": [[NativeShadowDomStrategy]],
    "annotations": []
  });

  reflector.registerType(NativeShadowDomStrategy, {
    "factory": (styleUrlResolver) => new NativeShadowDomStrategy(styleUrlResolver),
    "parameters": [[StyleUrlResolver]],
    "annotations": []
  });

  reflector.registerType(EmulatedUnscopedShadowDomStrategy, {
    "factory": (styleUrlResolver) => new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, null),
    "parameters": [[StyleUrlResolver]],
    "annotations": []
  });

  reflector.registerType(StyleUrlResolver, {
    "factory": (urlResolver) => new StyleUrlResolver(urlResolver),
    "parameters": [[UrlResolver]],
    "annotations": []
  });

  reflector.registerType(UrlResolver, {
    "factory": () => new UrlResolver(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(ComponentUrlMapper, {
    "factory": () => new ComponentUrlMapper(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(StyleInliner, {
    "factory": (xhr, styleUrlResolver, urlResolver) =>
      new StyleInliner(xhr, styleUrlResolver, urlResolver),
    "parameters": [[XHR], [StyleUrlResolver], [UrlResolver]],
    "annotations": []
  });

  reflector.registerType(EventManager, {
    "factory": () => new EventManager([], null),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(DynamicComponentLoader, {
    "factory": (compiler, reader, viewFactory, appViewHydrator) =>
      new DynamicComponentLoader(compiler, reader, viewFactory, appViewHydrator),
    "parameters": [[Compiler], [DirectiveMetadataReader], [ViewFactory], [AppViewHydrator]],
    "annotations": []
  });

  reflector.registerType(rc.DefaultCompiler, {
    "factory": (parser, shadowDomStrategy, templateLoader) =>
      new rc.DefaultCompiler(parser, shadowDomStrategy, templateLoader),
    "parameters": [[Parser], [ShadowDomStrategy], [TemplateLoader]],
    "annotations": []
  });

  reflector.registerType(rvf.ViewFactory, {
    "factory": (capacity, eventManager, shadowDomStrategy) =>
      new rvf.ViewFactory(capacity, eventManager, shadowDomStrategy),
    "parameters": [[new Inject(rvf.VIEW_POOL_CAPACITY)], [EventManager], [ShadowDomStrategy]],
    "annotations": []
  });

  reflector.registerType(rvf.VIEW_POOL_CAPACITY, {
    "factory": () => 10000,
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(rvh.RenderViewHydrator, {
    "factory": (eventManager, viewFactory) =>
      new rvh.RenderViewHydrator(eventManager, viewFactory),
    "parameters": [[rvf.ViewFactory], [EventManager]],
    "annotations": []
  });

  reflector.registerType(ProtoViewFactory, {
    "factory": (changeDetection) =>
      new ProtoViewFactory(changeDetection),
    "parameters": [[ChangeDetection]],
    "annotations": []
  });

  reflector.registerType(ViewFactory, {
    "factory": (capacity, renderer) =>
      new ViewFactory(capacity, renderer, appViewHydrator),
    "parameters": [[new Inject(VIEW_POOL_CAPACITY)],[Renderer],[AppViewHydrator]],
    "annotations": []
  });

  reflector.registerType(AppViewHydrator, {
    "factory": (renderer) =>
      new AppViewHydrator(renderer),
    "parameters": [[Renderer]],
    "annotations": []
  });

  reflector.registerType(VIEW_POOL_CAPACITY, {
    "factory": () => 10000,
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(TestabilityRegistry, {
    "factory": () => new TestabilityRegistry(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(Testability, {
    "factory": () => new Testability(),
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(DynamicChangeDetection, {
    "factory": (registry) => new DynamicChangeDetection(registry),
    "parameters": [[PipeRegistry]],
    "annotations": []
  });

  reflector.registerType(DirectDomRenderer, {
    "factory": (renderCompiler, renderViewFactory, renderViewHydrator, shadowDomStrategy) =>
      new DirectDomRenderer(renderCompiler, renderViewFactory, renderViewHydrator, shadowDomStrategy),
    "parameters": [[rc.Compiler], [rvf.ViewFactory], [rvh.RenderViewHydrator], [ShadowDomStrategy]],
    "annotations": []
  });

  reflector.registerType(rc.DefaultCompiler, {
    "factory": (parser, shadowDomStrategy, templateLoader) =>
      new rc.DefaultCompiler(parser, shadowDomStrategy, templateLoader),
    "parameters": [[Parser], [ShadowDomStrategy], [TemplateLoader]],
    "annotations": []
  });

  reflector.registerType(rvf.ViewFactory, {
    "factory": (capacity, eventManager, shadowDomStrategy) =>
      new rvf.ViewFactory(capacity, eventManager, shadowDomStrategy),
    "parameters": [[new Inject(rvf.VIEW_POOL_CAPACITY)], [EventManager], [ShadowDomStrategy]],
    "annotations": []
  });

  reflector.registerType(rvf.VIEW_POOL_CAPACITY, {
    "factory": () => 10000,
    "parameters": [],
    "annotations": []
  });

  reflector.registerType(VIEW_POOL_CAPACITY, {
    "factory": () => 10000,
    "parameters": [],
    "annotations": []
  });

  reflector.registerGetters({
    "greeting": (a) => a.greeting
  });

  reflector.registerSetters({
    "greeting": (a,v) => a.greeting = v
  });

  reflector.registerMethods({
    "changeGreeting": (obj, args) => obj.changeGreeting()
  });
}

export function main() {
  setup();
  app.main();
}
