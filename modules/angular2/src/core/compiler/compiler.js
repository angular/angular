import {Type, isBlank, isPresent, BaseException, normalizeBlank, stringify} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';

import {ChangeDetection, Parser} from 'angular2/change_detection';

import {DirectiveMetadataReader} from './directive_metadata_reader';
import {ProtoView} from './view';
import {CompilePipeline} from './pipeline/compile_pipeline';
import {CompileElement} from './pipeline/compile_element';
import {createDefaultSteps} from './pipeline/default_steps';
import {TemplateLoader} from './template_loader';
import {TemplateResolver} from './template_resolver';
import {DirectiveMetadata} from './directive_metadata';
import {Template} from '../annotations/template';
import {ShadowDomStrategy} from './shadow_dom_strategy';
import {CompileStep} from './pipeline/compile_step';
import {ComponentUrlMapper} from './component_url_mapper';
import {UrlResolver} from './url_resolver';


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
  _templateResolver: TemplateResolver;
  _componentUrlMapper: ComponentUrlMapper;
  _urlResolver: UrlResolver;
  _appUrl: string;

  constructor(changeDetection:ChangeDetection,
              templateLoader:TemplateLoader,
              reader: DirectiveMetadataReader,
              parser:Parser,
              cache:CompilerCache,
              shadowDomStrategy: ShadowDomStrategy,
              templateResolver: TemplateResolver,
              componentUrlMapper: ComponentUrlMapper,
              urlResolver: UrlResolver) {
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
    this._templateResolver = templateResolver;
    this._componentUrlMapper = componentUrlMapper;
    this._urlResolver = urlResolver;
    this._appUrl = urlResolver.resolve(null, './');
  }

  createSteps(component:Type, template: Template):List<CompileStep> {
    // Merge directive metadata (from the template and from the shadow dom strategy)
    var dirMetadata = [];
    var tplMetadata = ListWrapper.map(this._flattenDirectives(template),
      (d) => this._reader.read(d));
    dirMetadata = ListWrapper.concat(dirMetadata, tplMetadata);
    dirMetadata = ListWrapper.concat(dirMetadata, this._shadowDomDirectives);

    var cmpMetadata = this._reader.read(component);

    var templateUrl = this._templateLoader.getTemplateUrl(template);

    return createDefaultSteps(this._changeDetection, this._parser, cmpMetadata, dirMetadata,
      this._shadowDomStrategy, templateUrl);
  }

  compile(component: Type):Promise<ProtoView> {
    var protoView = this._compile(component);
    return PromiseWrapper.isPromise(protoView) ? protoView : PromiseWrapper.resolve(protoView);
  }

  // TODO(vicb): union type return ProtoView or Promise<ProtoView>
  _compile(component: Type) {
    var protoView = this._compilerCache.get(component);
    if (isPresent(protoView)) {
      // The component has already been compiled into a ProtoView,
      // returns a resolved Promise.
      return protoView;
    }

    var pvPromise = MapWrapper.get(this._compiling, component);
    if (isPresent(pvPromise)) {
      // The component is already being compiled, attach to the existing Promise
      // instead of re-compiling the component.
      // It happens when a template references a component multiple times.
      return pvPromise;
    }

    var template = this._templateResolver.resolve(component);

    var componentUrl = this._componentUrlMapper.getUrl(component);
    var baseUrl = this._urlResolver.resolve(this._appUrl, componentUrl);
    this._templateLoader.setBaseUrl(template, baseUrl);

    var tplElement = this._templateLoader.load(template);

    if (PromiseWrapper.isPromise(tplElement)) {
      pvPromise = PromiseWrapper.then(tplElement,
        (el) => this._compileTemplate(template, el, component),
        (_) => { throw new BaseException(`Failed to load the template for ${stringify(component)}`); }
      );
      MapWrapper.set(this._compiling, component, pvPromise);
      return pvPromise;
    }

    return this._compileTemplate(template, tplElement, component);
  }

  // TODO(vicb): union type return ProtoView or Promise<ProtoView>
  _compileTemplate(template: Template, tplElement, component: Type) {
    var pipeline = new CompilePipeline(this.createSteps(component, template));
    var compilationCtxtDescription = stringify(this._reader.read(component).type);
    var compileElements;

    try {
      compileElements = pipeline.process(tplElement, compilationCtxtDescription);
    } catch(ex) {
      return PromiseWrapper.reject(ex);
    }

    var protoView = compileElements[0].inheritedProtoView;

    // Populate the cache before compiling the nested components,
    // so that components can reference themselves in their template.
    this._compilerCache.set(component, protoView);
    MapWrapper.delete(this._compiling, component);

    // Compile all the components from the template
    var nestedPVPromises = [];
    for (var i = 0; i < compileElements.length; i++) {
      var ce = compileElements[i];
      if (isPresent(ce.componentDirective)) {
        this._compileNestedProtoView(ce, nestedPVPromises);
      }
    }

    if (protoView.stylePromises.length > 0) {
      // The protoView is ready after all asynchronous styles are ready
      var syncProtoView = protoView;
      protoView = PromiseWrapper.all(syncProtoView.stylePromises).then((_) => syncProtoView);
    }

    if (nestedPVPromises.length > 0) {
      // Returns ProtoView Promise when there are any asynchronous nested ProtoViews.
      // The promise will resolved after nested ProtoViews are compiled.
      return PromiseWrapper.then(PromiseWrapper.all(nestedPVPromises),
        (_) => protoView,
        (e) => { throw new BaseException(`${e.message} -> Failed to compile ${stringify(component)}`); }
      );
    }

    return protoView;
  }

  _compileNestedProtoView(ce: CompileElement, promises: List<Promise>) {
    var protoView = this._compile(ce.componentDirective.type);

    if (PromiseWrapper.isPromise(protoView)) {
      ListWrapper.push(promises, protoView);
      protoView.then(function (protoView) {
        ce.inheritedElementBinder.nestedProtoView = protoView;
      });
    } else {
      ce.inheritedElementBinder.nestedProtoView = protoView;
    }
  }

  _flattenDirectives(template: Template):List<Type> {
    if (isBlank(template.directives)) return [];

    var directives = [];
    this._flattenList(template.directives, directives);

    return directives;
  }

  _flattenList(tree:List<any>, out:List<Type>) {
    for (var i = 0; i < tree.length; i++) {
      var item = tree[i];
      if (ListWrapper.isList(item)) {
        this._flattenList(item, out);
      } else {
        ListWrapper.push(out, item);
      }
    }
  }

}


