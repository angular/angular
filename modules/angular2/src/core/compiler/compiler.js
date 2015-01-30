import {Type, isBlank, isPresent, BaseException, normalizeBlank, stringify} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';
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
import {ShadowDomStrategy} from './shadow_dom_strategy';

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
    return normalizeBlank(result);
  }

  clear() {
    MapWrapper.clear(this._cache);
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
  _templateLoader:TemplateLoader;
  _compiling:Map<Type, Promise>;
  _shadowDomStrategy: ShadowDomStrategy;
  _shadowDomDirectives: List<DirectiveMetadata>;

  constructor(changeDetection:ChangeDetection,
              templateLoader:TemplateLoader,
              reader: DirectiveMetadataReader,
              parser:Parser,
              cache:CompilerCache,
              shadowDomStrategy: ShadowDomStrategy) {
    this._changeDetection = changeDetection;
    this._reader = reader;
    this._parser = parser;
    this._compilerCache = cache;
    this._templateLoader = templateLoader;
    this._compiling = MapWrapper.create();
    this._shadowDomStrategy = shadowDomStrategy;
    this._shadowDomDirectives = [];
    var types = shadowDomStrategy.polyfillDirectives();
    for (var i = 0; i < types.length; i++) {
      ListWrapper.push(this._shadowDomDirectives, reader.read(types[i]));
    }
  }

  createSteps(component:DirectiveMetadata):List<CompileStep> {
    var directives = []
    var cmpDirectives = ListWrapper.map(component.componentDirectives, (d) => this._reader.read(d));
    directives = ListWrapper.concat(directives, cmpDirectives);
    directives = ListWrapper.concat(directives, this._shadowDomDirectives);
    return createDefaultSteps(this._changeDetection, this._parser, component, directives,
      this._shadowDomStrategy);
  }

  compile(component:Type, templateRoot:Element = null):Promise<ProtoView> {
    return this._compile(this._reader.read(component), templateRoot);
  }

  _compile(cmpMetadata: DirectiveMetadata, templateRoot:Element = null) {
    var pvCached = this._compilerCache.get(cmpMetadata.type);
    if (isPresent(pvCached)) {
      // The component has already been compiled into a ProtoView,
      // returns a resolved Promise.
      return PromiseWrapper.resolve(pvCached);
    }

    var pvPromise = MapWrapper.get(this._compiling, cmpMetadata.type);
    if (isPresent(pvPromise)) {
      // The component is already being compiled, attach to the existing Promise
      // instead of re-compiling the component.
      // It happens when a template references a component multiple times.
      return pvPromise;
    }

    var tplPromise = isBlank(templateRoot) ?
        this._templateLoader.load(cmpMetadata) :
        PromiseWrapper.resolve(templateRoot);

    pvPromise = PromiseWrapper.then(tplPromise,
      (el) => this._compileTemplate(el, cmpMetadata),
      (_) => { throw new BaseException(`Failed to load the template for ${stringify(cmpMetadata.type)}`) }
    );

    MapWrapper.set(this._compiling, cmpMetadata.type, pvPromise);

    return pvPromise;
  }

  _compileTemplate(template: Element, cmpMetadata): Promise<ProtoView> {
    this._shadowDomStrategy.processTemplate(template, cmpMetadata);
    var pipeline = new CompilePipeline(this.createSteps(cmpMetadata));
    var compileElements = pipeline.process(template);
    var protoView = compileElements[0].inheritedProtoView;

    // Populate the cache before compiling the nested components,
    // so that components can reference themselves in their template.
    this._compilerCache.set(cmpMetadata.type, protoView);
    MapWrapper.delete(this._compiling, cmpMetadata.type);

    // Compile all the components from the template
    var componentPromises = [];
    for (var i = 0; i < compileElements.length; i++) {
      var ce = compileElements[i];
      if (isPresent(ce.componentDirective)) {
        var componentPromise = this._compileNestedProtoView(ce);
        ListWrapper.push(componentPromises, componentPromise);
      }
    }

    // The protoView is resolved after all the components in the template have been compiled.
    return PromiseWrapper.then(PromiseWrapper.all(componentPromises),
      (_) => protoView,
      (e) => { throw new BaseException(`${e} -> Failed to compile ${stringify(cmpMetadata.type)}`) }
    );
  }

  _compileNestedProtoView(ce: CompileElement):Promise<ProtoView> {
    var pvPromise = this._compile(ce.componentDirective);
    pvPromise.then(function(protoView) {
      ce.inheritedElementBinder.nestedProtoView = protoView;
    });
    return pvPromise;
  }
}
