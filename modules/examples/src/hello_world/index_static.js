import *  as app from './index_common';

import {Component, Decorator, TemplateConfig, NgElement} from 'core/core';
import {Lexer, Parser, ChangeDetector} from 'change_detection/change_detection';
import {LifeCycle} from 'core/life_cycle/life_cycle';

import {Compiler, CompilerCache} from 'core/compiler/compiler';
import {DirectiveMetadataReader} from 'core/compiler/directive_metadata_reader';
import {TemplateLoader} from 'core/compiler/template_loader';

import {reflector} from 'reflection/reflection';

function setup() {
  reflector.registerType(app.HelloCmp, {
    "factory": (service) => new app.HelloCmp(service),
    "parameters": [[app.GreetingService]],
    "annotations" : [new Component({
      selector: 'hello-app',
      componentServices: [app.GreetingService],
      template: new TemplateConfig({
        directives: [app.RedDec],
        inline: `<div class="greeting">{{greeting}} <span red>world</span>!</div>
                 <button class="changeButton" (click)="changeGreeting()">change greeting</button>`})
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
    "factory": (templateLoader, reader, parser, compilerCache) => new Compiler(templateLoader, reader, parser, compilerCache),
    "parameters": [[TemplateLoader], [DirectiveMetadataReader], [Parser], [CompilerCache]],
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
    "factory": () => new TemplateLoader(),
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

  reflector.registerType(LifeCycle, {
    "factory": (cd) => new LifeCycle(cd),
    "parameters": [[ChangeDetector]],
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
