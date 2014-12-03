import *  as app from './app';

import {Component, Decorator, TemplateConfig, NgElement} from 'core/core';
import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';

import {Compiler} from 'core/compiler/compiler';
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
        inline: `{{greeting}} <span red>world</span>!`})
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
    "factory": (templateLoader, reader, parser) => new Compiler(templateLoader, reader, parser),
    "parameters": [[TemplateLoader], [DirectiveMetadataReader], [Parser]],
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


  reflector.registerGetters({
    "greeting": (a) => a.greeting
  });

  reflector.registerSetters({
    "greeting": (a,v) => a.greeting = v
  });
}

export function main() {
  setup();
  app.main();
}
