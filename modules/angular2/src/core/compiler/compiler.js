import {Injectable, Binding} from 'angular2/di';
import {Type, isBlank, isPresent, BaseException, normalizeBlank, stringify} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';

import {DirectiveMetadataReader} from './directive_metadata_reader';
import {Component, Viewport, DynamicComponent, Decorator} from '../annotations/annotations';
import {AppProtoView} from './view';
import {DirectiveBinding} from './element_injector';
import {TemplateResolver} from './template_resolver';
import {View} from '../annotations/view';
import {ComponentUrlMapper} from './component_url_mapper';
import {ProtoViewFactory} from './proto_view_factory';
import {UrlResolver} from 'angular2/src/services/url_resolver';

import * as renderApi from 'angular2/src/render/api';

/**
 * Cache that stores the AppProtoView of the template of a component.
 * Used to prevent duplicate work and resolve cyclic dependencies.
 */
@Injectable()
export class CompilerCache {
  _cache:Map;
  constructor() {
    this._cache = MapWrapper.create();
  }

  set(component:Type, protoView:AppProtoView):void {
    MapWrapper.set(this._cache, component, protoView);
  }

  get(component:Type):AppProtoView {
    var result = MapWrapper.get(this._cache, component);
    return normalizeBlank(result);
  }

  clear():void {
    MapWrapper.clear(this._cache);
  }
}

/**
 * @exportedAs angular2/view
 */
@Injectable()
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

  _bindDirective(directiveTypeOrBinding):DirectiveBinding {
    if (directiveTypeOrBinding instanceof DirectiveBinding) {
      return directiveTypeOrBinding;
    } else if (directiveTypeOrBinding instanceof Binding) {
      let meta = this._reader.read(directiveTypeOrBinding.token);
      return DirectiveBinding.createFromBinding(directiveTypeOrBinding, meta.annotation);
    } else {
      let meta = this._reader.read(directiveTypeOrBinding);
      return DirectiveBinding.createFromType(meta.type, meta.annotation);
    }
  }

  // Create a hostView as if the compiler encountered <hostcmp></hostcmp>.
  // Used for bootstrapping.
  compileInHost(componentTypeOrBinding:any):Promise<AppProtoView> {
    var componentBinding = this._bindDirective(componentTypeOrBinding);
    this._assertTypeIsComponent(componentBinding);
    return this._renderer.createHostProtoView('host').then( (hostRenderPv) => {
      return this._compileNestedProtoViews(null, hostRenderPv, [componentBinding], true);
    });
  }

  compile(component: Type):Promise<AppProtoView> {
    var componentBinding = this._bindDirective(component);
    this._assertTypeIsComponent(componentBinding);
    var protoView = this._compile(componentBinding);
    return PromiseWrapper.isPromise(protoView) ? protoView : PromiseWrapper.resolve(protoView);
  }

  // TODO(vicb): union type return AppProtoView or Promise<AppProtoView>
  _compile(componentBinding: DirectiveBinding) {
    var component = componentBinding.key.token;
    var protoView = this._compilerCache.get(component);
    if (isPresent(protoView)) {
      // The component has already been compiled into an AppProtoView,
      // returns a plain AppProtoView, not wrapped inside of a Promise.
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
    if (isPresent(template.renderer)) {
      var directives = [];
      pvPromise = this._renderer.createImperativeComponentProtoView(template.renderer).then( (renderPv) => {
        return this._compileNestedProtoViews(componentBinding, renderPv, directives, true);
      });
    } else {
      var directives = ListWrapper.map(
        this._flattenDirectives(template),
        (directive) => this._bindDirective(directive)
      );
      var renderTemplate = this._buildRenderTemplate(component, template, directives);
      pvPromise = this._renderer.compile(renderTemplate).then( (renderPv) => {
        return this._compileNestedProtoViews(componentBinding, renderPv, directives, true);
      });
    }

    MapWrapper.set(this._compiling, component, pvPromise);
    return pvPromise;
  }

  // TODO(tbosch): union type return AppProtoView or Promise<AppProtoView>
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
        // as their AppProtoView might be used in multiple other components.
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

  _buildRenderTemplate(component, view, directives): renderApi.ViewDefinition {
    var componentUrl = this._urlResolver.resolve(
        this._appUrl, this._componentUrlMapper.getUrl(component)
    );
    var templateAbsUrl = null;
    if (isPresent(view.templateUrl)) {
      templateAbsUrl = this._urlResolver.resolve(componentUrl, view.templateUrl);
    } else {
      // Note: If we have an inline template, we also need to send
      // the url for the component to the renderer so that it
      // is able to resolve urls in stylesheets.
      templateAbsUrl = componentUrl;
    }
    return new renderApi.ViewDefinition({
      componentId: stringify(component),
      absUrl: templateAbsUrl,
      template: view.template,
      directives: ListWrapper.map(directives, Compiler.buildRenderDirective)
    });
  }

  static buildRenderDirective(directiveBinding):renderApi.DirectiveMetadata {
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
    var readAttributes = [];
    ListWrapper.forEach(directiveBinding.dependencies, (dep) => {
      if (isPresent(dep.attributeName)) {
        ListWrapper.push(readAttributes, dep.attributeName);
      }
    });
    return new renderApi.DirectiveMetadata({
      id: stringify(directiveBinding.key.token),
      type: renderType,
      selector: ann.selector,
      compileChildren: compileChildren,
      hostListeners: isPresent(ann.hostListeners) ? MapWrapper.createFromStringMap(ann.hostListeners) : null,
      hostProperties: isPresent(ann.hostProperties) ? MapWrapper.createFromStringMap(ann.hostProperties) : null,
      properties: isPresent(ann.properties) ? MapWrapper.createFromStringMap(ann.properties) : null,
      readAttributes: readAttributes
    });
  }

  _flattenDirectives(template: View):List<Type> {
    if (isBlank(template.directives)) return [];

    var directives = [];
    this._flattenList(template.directives, directives);

    return directives;
  }

  _flattenList(tree:List<any>, out:List<Type>):void {
    for (var i = 0; i < tree.length; i++) {
      var item = tree[i];
      if (ListWrapper.isList(item)) {
        this._flattenList(item, out);
      } else {
        ListWrapper.push(out, item);
      }
    }
  }

  _assertTypeIsComponent(directiveBinding:DirectiveBinding):void {
    if (!(directiveBinding.annotation instanceof Component)) {
      throw new BaseException(`Could not load '${stringify(directiveBinding.key.token)}' because it is not a component.`);
    }
  }
}
