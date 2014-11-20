import {Type, FIELD, isBlank, isPresent} from 'facade/lang';
import {Promise, PromiseWrapper} from 'facade/async';
import {List, ListWrapper} from 'facade/collection';
import {DOM, Element} from 'facade/dom';

import {Parser} from 'change_detection/parser/parser';

import {DirectiveMetadataReader} from './directive_metadata_reader';
import {ProtoView} from './view';
import {CompilePipeline} from './pipeline/compile_pipeline';
import {CompileElement} from './pipeline/compile_element';
import {createDefaultSteps} from './pipeline/default_steps';
import {TemplateLoader} from './template_loader';
import {AnnotatedType} from './annotated_type';
import {Component} from '../annotations/annotations';

/**
 * The compiler loads and translates the html templates of components into
 * nested ProtoViews. To decompose its functionality it uses
 * the CompilePipeline and the CompileSteps.
 */
export class Compiler {
  _templateLoader:TemplateLoader;
  _reader: DirectiveMetadataReader;
  _parser:Parser;
  constructor(templateLoader:TemplateLoader, reader: DirectiveMetadataReader, parser:Parser) {
    this._templateLoader = templateLoader;
    this._reader = reader;
    this._parser = parser;
  }

  createSteps(component:AnnotatedType):List<CompileStep> {
    var annotation: Component = component.annotation;
    var directives = annotation.template.directives;
    var annotatedDirectives = ListWrapper.create();
    for (var i=0; i<directives.length; i++) {
      ListWrapper.push(annotatedDirectives, this._reader.annotatedType(directives[i]));
    }
    return createDefaultSteps(this._parser, annotatedDirectives);
  }

  compile(component:Type, templateRoot:Element = null):Promise<ProtoView> {
    // TODO load all components transitively from the cache first
    var cache = null;
    return PromiseWrapper.resolve(this.compileWithCache(
      cache, this._reader.annotatedType(component), templateRoot)
    );
  }

  // public so that we can compile in sync in performance tests.
  compileWithCache(cache, component:AnnotatedType, templateRoot:Element = null):ProtoView {
    if (isBlank(templateRoot)) {
      // TODO: read out the cache if templateRoot = null. Could contain:
      // - templateRoot string
      // - precompiled template
      // - ProtoView
      var annotation:any = component.annotation;
      templateRoot = DOM.createTemplate(annotation.template.inline);
    }
    var pipeline = new CompilePipeline(this.createSteps(component));
    var compileElements = pipeline.process(templateRoot);
    var rootProtoView = compileElements[0].inheritedProtoView;
    // TODO: put the rootProtoView into the cache to support recursive templates!

    for (var i=0; i<compileElements.length; i++) {
      var ce = compileElements[i];
      if (isPresent(ce.componentDirective)) {
        ce.inheritedElementBinder.nestedProtoView = this.compileWithCache(cache, ce.componentDirective, null);
      }
    }

    return rootProtoView;
  }
}
