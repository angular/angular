import {Type, isBlank, isPresent, BaseException, normalizeBlank} from 'facade/lang';
import {Promise, PromiseWrapper} from 'facade/async';
import {List, ListWrapper, MapWrapper, Map} from 'facade/collection';
import {DOM, Element, TemplateElement} from 'facade/dom';

import {ChangeDetection, Parser} from 'change_detection/change_detection';

import {DirectiveMetadataReader} from './directive_metadata_reader';
import {ProtoView} from './view';
import {CompilePipeline} from './pipeline/compile_pipeline';
import {CompileElement} from './pipeline/compile_element';
import {createDefaultSteps} from './pipeline/default_steps';
import {TemplateLoader} from './template_loader';
import {DirectiveMetadata} from './directive_metadata';
import {Component} from '../annotations/annotations';
import {Content} from './shadow_dom_emulation/content_tag';
import {WebComponentPolyfill} from './shadow_dom_emulation/webcmp_polyfill';
import {ShadowDomTransformer} from './shadow_dom_emulation/shadow_dom_transformer';

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
    return normalizeBlank(MapWrapper.get(this._cache, component));
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
  _tplLoader:TemplateLoader;
  _compiling: Map<Type, Promise>;
  _shadowDomTransformer: ShadowDomTransformer;
  _webComponentPolyfill: WebComponentPolyfill;

  constructor(changeDetection:ChangeDetection,
              templateLoader:TemplateLoader,
              reader: DirectiveMetadataReader,
              parser:Parser,
              cache:CompilerCache,
              webComponentPolyfill: WebComponentPolyfill,
              shadowDomTransformer: ShadowDomTransformer) {
    this._changeDetection = changeDetection;
    this._reader = reader;
    this._parser = parser;
    this._compilerCache = cache;
    this._tplLoader = templateLoader;
    this._compiling = MapWrapper.create();
    this._shadowDomTransformer = shadowDomTransformer;
    this._webComponentPolyfill = webComponentPolyfill;
  }

  createSteps(component:DirectiveMetadata):List<CompileStep> {
    var dirs = ListWrapper.map(component.componentDirectives, (d) => this._reader.read(d));
    return createDefaultSteps(this._changeDetection, this._parser, component, dirs);
  }

  compile(component:Type, templateRoot:Element = null):Promise<ProtoView> {
    // todo(vicb) - templateCache in TemplateLoader
    var templateCache = null;
    return this._compile(this._reader.read(component), templateRoot);
  }

  _compile(cmpMetadata: DirectiveMetadata, templateRoot:Element = null) {
    var pvCached = this._compilerCache.get(cmpMetadata.type);
    if (isPresent(pvCached)) {
      // The component has already been compiled into a ProtoView,
      // returns a resolved Promise.
      return PromiseWrapper.resolve(pvCached);
    }

    // todo(vicb): unit test
    var pvPromise = MapWrapper.get(this._compiling, cmpMetadata.type);
    if (isPresent(pvPromise)) {
      // The component is already being compiled, attach to the existing Promise
      // instead of re-compiling the component.
      // It happens when a template references a component multiple times.
      return pvPromise;
    }

    var tplPromise = isBlank(templateRoot) ?
        this._tplLoader.loadTemplate(cmpMetadata) :
        PromiseWrapper.resolve(templateRoot);

    var cssPromise = this._tplLoader.loadStyles(cmpMetadata).then((styles) => {
      for (var i = 0; i < styles.length; i++) {
        this._shadowDomTransformer.transformStyle(styles[i], cmpMetadata);
      }
      return styles;
    });

    pvPromise = tplPromise.then((template) => {
      var inlineStyles = _extractStyles(template);
      this._shadowDomTransformer.transformTemplate(template, cmpMetadata);
      var pipeline = new CompilePipeline(this.createSteps(cmpMetadata));
      var compileElements = pipeline.process(template);
      var protoView = compileElements[0].inheritedProtoView;
      protoView.webComponentPolyfill = this._webComponentPolyfill;

      // Populate the cache before compiling the template, so that components can
      // reference themselves in their template.
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

      for (var i = 0; i < inlineStyles.length; i++) {
        var style = this._shadowDomTransformer.transformStyle(inlineStyles[i], cmpMetadata);
        protoView.addStyle(style);
      }

      // The protoView is resolved after all the components in the template
      // have been compiled.
      return PromiseWrapper.all(componentPromises)
        .then(function(_) { return cssPromise; })
        .then((styles) => {
          for (var i = 0; i < styles.length; i++) {
            protoView.addStyle(styles[i]);
          }
          return protoView;
        });
    });

    MapWrapper.set(this._compiling, cmpMetadata.type, pvPromise);

    return pvPromise;
  }

  _compileNestedProtoView(ce: CompileElement):Promise<ProtoView> {
    var pvPromise = this._compile(ce.componentDirective);
    pvPromise.then(function(protoView) {
      ce.inheritedElementBinder.nestedProtoView = protoView;
    });
    return pvPromise;
  }

  compileAllLoaded(templateCache, component:DirectiveMetadata, templateRoot:Element = null):ProtoView {
    // todo(vicb) empty placeholder for now - fix perf tests
    // public so that we can compile in sync in performance tests.
    return null;
  }
}

// Detach the styles from the template and returns them
function _extractStyles(template: TemplateElement) {
  var styles = DOM.querySelectorAll(template.content, 'style');
  for (var i = 0; i < styles.length; i++) {
    DOM.detach(styles[i]);
  }
  return styles;
}

