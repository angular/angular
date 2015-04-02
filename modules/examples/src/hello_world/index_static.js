import *  as app from './index_common';

import {Component, Decorator, Template, NgElement} from 'angular2/angular2';
import {Lexer, Parser, ChangeDetection, ChangeDetector} from 'angular2/change_detection';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {ShadowDomStrategy, NativeShadowDomStrategy, EmulatedUnscopedShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {Content} from 'angular2/src/core/compiler/shadow_dom_emulation/content_tag';
import {DestinationLightDom} from 'angular2/src/core/compiler/shadow_dom_emulation/light_dom';
import {TemplateLoader} from 'angular2/src/render/dom/compiler/template_loader';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {XHR} from 'angular2/src/services/xhr';
import {XHRImpl} from 'angular2/src/services/xhr_impl';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';
import {EventManager} from 'angular2/src/render/dom/events/event_manager';
import {PrivateComponentLoader} from 'angular2/src/core/compiler/private_component_loader';
import {TestabilityRegistry, Testability} from 'angular2/src/core/testability/testability';

import {reflector} from 'angular2/src/reflection/reflection';

function setup() {
  reflector.registerType(app.HelloCmp, {
    "factory": (service) => new app.HelloCmp(service),
    "parameters": [[app.GreetingService]],
    "annotations" : [
      new Component({
        selector: 'hello-app',
        services: [app.GreetingService]
      }),
      new Template({
        directives: [app.RedDec],
        inline: `<div class="greeting">{{greeting}} <span red>world</span>!</div>
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
    "factory": (changeDetection, templateLoader, reader, parser, compilerCache, shadowDomStrategy,
                tplResolver, cmpUrlMapper, urlResolver) =>
      new Compiler(changeDetection, templateLoader, reader, parser, compilerCache, shadowDomStrategy,
        tplResolver, cmpUrlMapper, urlResolver),
    "parameters": [[ChangeDetection], [TemplateLoader], [DirectiveMetadataReader], [Parser],
                   [CompilerCache], [ShadowDomStrategy], [TemplateResolver], [ComponentUrlMapper],
                   [UrlResolver]],
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

  reflector.registerType(Content, {
    "factory": (lightDom, el, selector) => new Content(lightDom, el, selector),
    "parameters": [[DestinationLightDom], [NgElement], [String]],
    "annotations" : []
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

  reflector.registerType(PrivateComponentLoader, {
    "factory": (compiler, strategy, eventMgr, reader) =>
      new PrivateComponentLoader(compiler, strategy, eventMgr, reader),
    "parameters": [[Compiler], [ShadowDomStrategy], [EventManager], [DirectiveMetadataReader]],
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
