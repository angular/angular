import {Type, FIELD, isBlank, isPresent, BaseException, stringify} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {DOM, Element} from 'angular2/src/facade/dom';

import {ChangeDetection, Parser} from 'angular2/change_detection';

import {DirectiveMetadataReader} from './directive_metadata_reader';
import {ProtoView} from './view';
import {CompilePipeline} from './pipeline/compile_pipeline';
import {CompileElement} from './pipeline/compile_element';
import {createDefaultSteps} from './pipeline/default_steps';
import {TemplateLoader} from './template_loader';
import {DirectiveMetadata} from './directive_metadata';
import {Component} from '../annotations/annotations';
import {Content} from './shadow_dom_emulation/content_tag';

/**
 * Cache that stores the ProtoView of the template of a component.
 * Used to prevent duplicate work and resolve cyclic dependencies.
 */
export class CompilerCache {
  _cache:Map;
  constructor() {
    this._cache = MapWrapper.create();
  }

  set(component:Type, protoView:ProtoView) {
    MapWrapper.set(this._cache, component, protoView);
  }

  get(component:Type):ProtoView {
    var result = MapWrapper.get(this._cache, component);
    if (isBlank(result)) {
      // need to normalize undefined to null so that type checking passes :-(
      return null;
    }
    return result;
  }

  clear() {
    this._cache = MapWrapper.create();
  }
}

/**
 * The compiler loads and translates the html templates of components into
 * nested ProtoViews. To decompose its functionality it uses
 * the CompilePipeline and the CompileSteps.
 */
export class Compiler {
  _reader: DirectiveMetadataReader;
  _parser:Parser;
  _compilerCache:CompilerCache;
  _changeDetection:ChangeDetection;

  constructor(changeDetection:ChangeDetection, templateLoader:TemplateLoader, reader: DirectiveMetadataReader, parser:Parser, cache:CompilerCache) {
    this._changeDetection = changeDetection;
    this._reader = reader;
    this._parser = parser;
    this._compilerCache = cache;
  }

  createSteps(component:DirectiveMetadata):List<CompileStep> {
    var dirs = ListWrapper.map(component.componentDirectives, (d) => this._reader.read(d));
    return createDefaultSteps(this._changeDetection, this._parser, component, dirs);
  }

  compile(component:Type, templateRoot:Element = null):Promise<ProtoView> {
    var templateCache = null;
    // TODO load all components that have urls
    // transitively via the _templateLoader and store them in templateCache

    return PromiseWrapper.resolve(this.compileAllLoaded(
      templateCache, this._reader.read(component), templateRoot)
    );
  }

  // public so that we can compile in sync in performance tests.
  compileAllLoaded(templateCache, component:DirectiveMetadata, templateRoot:Element = null):ProtoView {
    var rootProtoView = this._compilerCache.get(component.type);
    if (isPresent(rootProtoView)) {
      return rootProtoView;
    }

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
    rootProtoView = compileElements[0].inheritedProtoView;
    // Save the rootProtoView before we recurse so that we are able
    // to compile components that use themselves in their template.
    this._compilerCache.set(component.type, rootProtoView);

    for (var i=0; i<compileElements.length; i++) {
      var ce = compileElements[i];
      if (isPresent(ce.componentDirective)) {
        ce.inheritedElementBinder.nestedProtoView = this.compileAllLoaded(templateCache, ce.componentDirective, null);
      }
    }

    return rootProtoView;
  }
}
