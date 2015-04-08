import {Injectable} from 'angular2/di';
import {Type, isBlank, isPresent, BaseException, normalizeBlank, stringify} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';

import {DirectiveMetadataReader} from './directive_metadata_reader';
import {Component, Viewport, DynamicComponent, Decorator} from '../annotations/annotations';
import {ProtoView} from './view';
import {DirectiveBinding} from './element_injector';
import {TemplateResolver} from './template_resolver';
import {Template} from '../annotations/template';
import {ComponentUrlMapper} from './component_url_mapper';
import {ProtoViewFactory} from './proto_view_factory';
import {UrlResolver} from 'angular2/src/services/url_resolver';

import * as renderApi from 'angular2/src/render/api';

/**
 * Cache that stores the ProtoView of the template of a component.
 * Used to prevent duplicate work and resolve cyclic dependencies.
 */
@Injectable()
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


export class Compiler {
  _reader: DirectiveMetadataReader;
  _compilerCache:CompilerCache;
  _compiling:Map<Type, Promise>;
  _templateResolver: TemplateResolver;
  _componentUrlMapper: ComponentUrlMapper;
  _urlResolver: UrlResolver;
  _appUrl: string;
  _renderer: renderApi.Renderer;
  _protoViewFactory:ProtoViewFactory;

  constructor(reader: DirectiveMetadataReader,
              cache:CompilerCache,
              templateResolver: TemplateResolver,
              componentUrlMapper: ComponentUrlMapper,
              urlResolver: UrlResolver,
              renderer: renderApi.Renderer,
              protoViewFactory: ProtoViewFactory) {
    this._reader = reader;
    this._compilerCache = cache;
    this._compiling = MapWrapper.create();
    this._templateResolver = templateResolver;
    this._componentUrlMapper = componentUrlMapper;
    this._urlResolver = urlResolver;
    this._appUrl = urlResolver.resolve(null, './');
    this._renderer = renderer;
    this._protoViewFactory = protoViewFactory;
  }

  _bindDirective(directiveTypeOrBinding) {
    if (directiveTypeOrBinding instanceof DirectiveBinding) {
      return directiveTypeOrBinding;
    }
    var meta = this._reader.read(directiveTypeOrBinding);
    return DirectiveBinding.createFromType(meta.type, meta.annotation);
  }

  // Create a rootView as if the compiler encountered <rootcmp></rootcmp>.
  // Used for bootstrapping.
  compileRoot(elementOrSelector, componentTypeOrBinding:any):Promise<ProtoView> {
    return this._renderer.createRootProtoView(elementOrSelector, 'root').then( (rootRenderPv) => {
      return this._compileNestedProtoViews(null, rootRenderPv, [this._bindDirective(componentTypeOrBinding)], true);
    });
  }

  compile(component: Type):Promise<ProtoView> {
    var protoView = this._compile(this._bindDirective(component));
    return PromiseWrapper.isPromise(protoView) ? protoView : PromiseWrapper.resolve(protoView);
  }

  // TODO(vicb): union type return ProtoView or Promise<ProtoView>
  _compile(componentBinding: DirectiveBinding) {
    var component = componentBinding.key.token;
    var protoView = this._compilerCache.get(component);
    if (isPresent(protoView)) {
      // The component has already been compiled into a ProtoView,
      // returns a plain ProtoView, not wrapped inside of a Promise.
      // Needed for recursive components.
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
    var directives = ListWrapper.map(
      this._flattenDirectives(template),
      (directive) => this._bindDirective(directive)
    );
    var renderTemplate = this._buildRenderTemplate(component, template, directives);
    pvPromise = this._renderer.compile(renderTemplate).then( (renderPv) => {
      return this._compileNestedProtoViews(componentBinding, renderPv, directives, true);
    });

    MapWrapper.set(this._compiling, component, pvPromise);
    return pvPromise;
  }

  // TODO(tbosch): union type return ProtoView or Promise<ProtoView>
  _compileNestedProtoViews(componentBinding, renderPv, directives, isComponentRootView) {
    var nestedPVPromises = [];
    var protoView = this._protoViewFactory.createProtoView(componentBinding, renderPv, directives);
    if (isComponentRootView && isPresent(componentBinding)) {
      // Populate the cache before compiling the nested components,
      // so that components can reference themselves in their template.
      var component = componentBinding.key.token;
      this._compilerCache.set(component, protoView);
      MapWrapper.delete(this._compiling, component);
    }

    var binderIndex = 0;
    ListWrapper.forEach(protoView.elementBinders, (elementBinder) => {
      var nestedComponent = elementBinder.componentDirective;
      var nestedRenderProtoView = renderPv.elementBinders[binderIndex].nestedProtoView;
      var elementBinderDone = (nestedPv) => {
        elementBinder.nestedProtoView = nestedPv;
        // Can't set the parentProtoView for components,
        // as their ProtoView might be used in multiple other components.
        nestedPv.parentProtoView = isPresent(nestedComponent) ? null : protoView;
      };
      var nestedCall = null;
      if (isPresent(nestedComponent)) {
        if (!(nestedComponent.annotation instanceof DynamicComponent)) {
          nestedCall = this._compile(nestedComponent);
        }
      } else if (isPresent(nestedRenderProtoView)) {
        nestedCall = this._compileNestedProtoViews(componentBinding, nestedRenderProtoView, directives, false);
      }
      if (PromiseWrapper.isPromise(nestedCall)) {
        ListWrapper.push(nestedPVPromises, nestedCall.then(elementBinderDone));
      } else if (isPresent(nestedCall)) {
        elementBinderDone(nestedCall);
      }
      binderIndex++;
    });

    var protoViewDone = (_) => {
      var childComponentRenderPvRefs = [];
      ListWrapper.forEach(protoView.elementBinders, (eb) => {
        if (isPresent(eb.componentDirective)) {
          var componentPv = eb.nestedProtoView;
          ListWrapper.push(childComponentRenderPvRefs, isPresent(componentPv) ? componentPv.render : null);
        }
      });
      this._renderer.mergeChildComponentProtoViews(protoView.render, childComponentRenderPvRefs);
      return protoView;
    };
    if (nestedPVPromises.length > 0) {
      return PromiseWrapper.all(nestedPVPromises).then(protoViewDone);
    } else {
      return protoViewDone(null);
    }
  }

  _buildRenderTemplate(component, template, directives) {
    var componentUrl = this._urlResolver.resolve(
        this._appUrl, this._componentUrlMapper.getUrl(component)
    );
    var templateAbsUrl = null;
    if (isPresent(template.url)) {
      templateAbsUrl = this._urlResolver.resolve(componentUrl, template.url);
    } else {
      // Note: If we have an inline template, we also need to send
      // the url for the component to the renderer so that it
      // is able to resolve urls in stylesheets.
      templateAbsUrl = componentUrl;
    }
    return new renderApi.Template({
      componentId: stringify(component),
      absUrl: templateAbsUrl,
      inline: template.inline,
      directives: ListWrapper.map(directives, this._buildRenderDirective)
    });
  }

  _buildRenderDirective(directiveBinding) {
    var ann = directiveBinding.annotation;
    var renderType;
    var compileChildren = true;
    if ((ann instanceof Component) || (ann instanceof DynamicComponent)) {
      renderType = renderApi.DirectiveMetadata.COMPONENT_TYPE;
    } else if (ann instanceof Viewport) {
      renderType = renderApi.DirectiveMetadata.VIEWPORT_TYPE;
    } else if (ann instanceof Decorator) {
      renderType = renderApi.DirectiveMetadata.DECORATOR_TYPE;
      compileChildren = ann.compileChildren;
    }
    var setters = [];
    var readAttributes = [];
    ListWrapper.forEach(directiveBinding.dependencies, (dep) => {
      if (isPresent(dep.propSetterName)) {
        ListWrapper.push(setters, dep.propSetterName);
      }
      if (isPresent(dep.attributeName)) {
        ListWrapper.push(readAttributes, dep.attributeName);
      }
    });
    return new renderApi.DirectiveMetadata({
      id: stringify(directiveBinding.key.token),
      type: renderType,
      selector: ann.selector,
      compileChildren: compileChildren,
      events: isPresent(ann.events) ? MapWrapper.createFromStringMap(ann.events) : null,
      bind: isPresent(ann.bind) ? MapWrapper.createFromStringMap(ann.bind) : null,
      setters: setters,
      readAttributes: readAttributes
    });
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
