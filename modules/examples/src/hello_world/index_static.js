import *  as app from './index_common';

import {Component, Decorator, Template, NgElement} from 'angular2/angular2';
import {Lexer, Parser, ChangeDetection, ChangeDetector} from 'angular2/change_detection';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';

import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {ShadowDomStrategy, NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {TemplateLoader} from 'angular2/src/core/compiler/template_loader';
import {TemplateResolver} from 'angular2/src/core/compiler/template_resolver';
import {XHR} from 'angular2/src/core/compiler/xhr/xhr';
import {XHRImpl} from 'angular2/src/core/compiler/xhr/xhr_impl';

import {reflector} from 'angular2/src/reflection/reflection';

function setup() {
  reflector.registerType(app.HelloCmp, {
    "factory": (service) => new app.HelloCmp(service),
    "parameters": [[app.GreetingService]],
    "annotations" : [
      new Component({
        selector: 'hello-app',
        componentServices: [app.GreetingService]
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
                resolver) =>
      new Compiler(changeDetection, templateLoader, reader, parser, compilerCache, shadowDomStrategy,
        resolver),
    "parameters": [[ChangeDetection], [TemplateLoader], [DirectiveMetadataReader], [Parser],
                   [CompilerCache], [ShadowDomStrategy], [TemplateResolver]],
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
    "factory": (xhr) => new TemplateLoader(xhr),
    "parameters": [[XHR]],
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
    "factory": () => new NativeShadowDomStrategy(),
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
