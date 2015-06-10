import {Binding, resolveForwardRef, Injectable} from 'angular2/di';
import {
  Type,
  isBlank,
  isPresent,
  BaseException,
  normalizeBlank,
  stringify
} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';

import {DirectiveResolver} from './directive_resolver';

import {AppProtoView} from './view';
import {ElementBinder} from './element_binder';
import {ProtoViewRef} from './view_ref';
import {DirectiveBinding} from './element_injector';
import {TemplateResolver} from './template_resolver';
import {View} from '../annotations_impl/view';
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
  _cache: Map<Type, AppProtoView> = MapWrapper.create();

  set(component: Type, protoView: AppProtoView): void {
    MapWrapper.set(this._cache, component, protoView);
  }

  get(component: Type): AppProtoView {
    var result = MapWrapper.get(this._cache, component);
    return normalizeBlank(result);
  }

  clear(): void { MapWrapper.clear(this._cache); }
}

/**
 * @exportedAs angular2/view
 */
@Injectable()
export class Compiler {
  private _reader: DirectiveResolver;
  private _compilerCache: CompilerCache;
  private _compiling: Map<Type, Promise<AppProtoView>>;
  private _templateResolver: TemplateResolver;
  private _componentUrlMapper: ComponentUrlMapper;
  private _urlResolver: UrlResolver;
  private _appUrl: string;
  private _render: renderApi.RenderCompiler;
  private _protoViewFactory: ProtoViewFactory;

  constructor(reader: DirectiveResolver, cache: CompilerCache, templateResolver: TemplateResolver,
              componentUrlMapper: ComponentUrlMapper, urlResolver: UrlResolver,
              render: renderApi.RenderCompiler, protoViewFactory: ProtoViewFactory) {
    this._reader = reader;
    this._compilerCache = cache;
    this._compiling = MapWrapper.create();
    this._templateResolver = templateResolver;
    this._componentUrlMapper = componentUrlMapper;
    this._urlResolver = urlResolver;
    this._appUrl = urlResolver.resolve(null, './');
    this._render = render;
    this._protoViewFactory = protoViewFactory;
  }

  private _bindDirective(directiveTypeOrBinding): DirectiveBinding {
    if (directiveTypeOrBinding instanceof DirectiveBinding) {
      return directiveTypeOrBinding;
    } else if (directiveTypeOrBinding instanceof Binding) {
      let annotation = this._reader.resolve(directiveTypeOrBinding.token);
      return DirectiveBinding.createFromBinding(directiveTypeOrBinding, annotation);
    } else {
      let annotation = this._reader.resolve(directiveTypeOrBinding);
      return DirectiveBinding.createFromType(directiveTypeOrBinding, annotation);
    }
  }

  // Create a hostView as if the compiler encountered <hostcmp></hostcmp>.
  // Used for bootstrapping.
  compileInHost(componentTypeOrBinding: Type | Binding): Promise<ProtoViewRef> {
    var componentBinding = this._bindDirective(componentTypeOrBinding);
    Compiler._assertTypeIsComponent(componentBinding);

    var directiveMetadata = componentBinding.metadata;
    return this._render.compileHost(directiveMetadata)
        .then((hostRenderPv) => {
          return this._compileNestedProtoViews(componentBinding, hostRenderPv, [componentBinding]);
        })
        .then((appProtoView) => { return new ProtoViewRef(appProtoView); });
  }

  compile(component: Type): Promise<ProtoViewRef> {
    var componentBinding = this._bindDirective(component);
    Compiler._assertTypeIsComponent(componentBinding);
    var pvOrPromise = this._compile(componentBinding);
    var pvPromise = PromiseWrapper.isPromise(pvOrPromise) ? <Promise<AppProtoView>>pvOrPromise :
                                                            PromiseWrapper.resolve(pvOrPromise);
    return pvPromise.then((appProtoView) => { return new ProtoViewRef(appProtoView); });
  }

  private _compile(componentBinding: DirectiveBinding): Promise<AppProtoView>| AppProtoView {
    var component = <Type>componentBinding.key.token;
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
    if (isBlank(template)) {
      return null;
    }

    var directives = this._flattenDirectives(template);

    for (var i = 0; i < directives.length; i++) {
      if (!Compiler._isValidDirective(directives[i])) {
        throw new BaseException(
            `Unexpected directive value '${stringify(directives[i])}' on the View of component '${stringify(component)}'`);
      }
    }

    var boundDirectives =
        ListWrapper.map(directives, (directive) => this._bindDirective(directive));

    var renderTemplate = this._buildRenderTemplate(component, template, boundDirectives);
    pvPromise =
        this._render.compile(renderTemplate)
            .then((renderPv) => {
              return this._compileNestedProtoViews(componentBinding, renderPv, boundDirectives);
            });

    MapWrapper.set(this._compiling, component, pvPromise);
    return pvPromise;
  }

  private _compileNestedProtoViews(componentBinding, renderPv, directives): Promise<AppProtoView>|
      AppProtoView {
    var protoViews =
        this._protoViewFactory.createAppProtoViews(componentBinding, renderPv, directives);
    var protoView = protoViews[0];
    // TODO(tbosch): we should be caching host protoViews as well!
    // -> need a separate cache for this...
    if (renderPv.type === renderApi.ViewType.COMPONENT && isPresent(componentBinding)) {
      // Populate the cache before compiling the nested components,
      // so that components can reference themselves in their template.
      var component = componentBinding.key.token;
      this._compilerCache.set(component, protoView);
      MapWrapper.delete(this._compiling, component);
    }

    var nestedPVPromises = [];
    ListWrapper.forEach(this._collectComponentElementBinders(protoViews), (elementBinder) => {
      var nestedComponent = elementBinder.componentDirective;
      var elementBinderDone =
          (nestedPv: AppProtoView) => { elementBinder.nestedProtoView = nestedPv; };
      var nestedCall = this._compile(nestedComponent);
      if (PromiseWrapper.isPromise(nestedCall)) {
        ListWrapper.push(nestedPVPromises,
                         (<Promise<AppProtoView>>nestedCall).then(elementBinderDone));
      } else if (isPresent(nestedCall)) {
        elementBinderDone(<AppProtoView>nestedCall);
      }
    });

    if (nestedPVPromises.length > 0) {
      return PromiseWrapper.all(nestedPVPromises).then((_) => protoView);
    } else {
      return protoView;
    }
  }

  private _collectComponentElementBinders(protoViews: List<AppProtoView>): List<ElementBinder> {
    var componentElementBinders = [];
    ListWrapper.forEach(protoViews, (protoView) => {
      ListWrapper.forEach(protoView.elementBinders, (elementBinder) => {
        if (isPresent(elementBinder.componentDirective)) {
          ListWrapper.push(componentElementBinders, elementBinder);
        }
      });
    });
    return componentElementBinders;
  }

  private _buildRenderTemplate(component, view, directives): renderApi.ViewDefinition {
    var componentUrl =
        this._urlResolver.resolve(this._appUrl, this._componentUrlMapper.getUrl(component));
    var templateAbsUrl = null;
    var styleAbsUrls = null;
    if (isPresent(view.templateUrl)) {
      templateAbsUrl = this._urlResolver.resolve(componentUrl, view.templateUrl);
    } else if (isPresent(view.template)) {
      // Note: If we have an inline template, we also need to send
      // the url for the component to the render so that it
      // is able to resolve urls in stylesheets.
      templateAbsUrl = componentUrl;
    }
    if (isPresent(view.styleUrls)) {
      styleAbsUrls =
          ListWrapper.map(view.styleUrls, url => this._urlResolver.resolve(componentUrl, url));
    }
    return new renderApi.ViewDefinition({
      componentId: stringify(component),
      templateAbsUrl: templateAbsUrl, template: view.template,
      styleAbsUrls: styleAbsUrls,
      styles: view.styles,
      directives: ListWrapper.map(directives, directiveBinding => directiveBinding.metadata)
    });
  }

  private _flattenDirectives(template: View): List<Type> {
    if (isBlank(template.directives)) return [];

    var directives = [];
    this._flattenList(template.directives, directives);

    return directives;
  }

  private _flattenList(tree: List<any>, out: List<Type | Binding | List<any>>): void {
    for (var i = 0; i < tree.length; i++) {
      var item = resolveForwardRef(tree[i]);
      if (ListWrapper.isList(item)) {
        this._flattenList(item, out);
      } else {
        ListWrapper.push(out, item);
      }
    }
  }

  private static _isValidDirective(value: Type | Binding): boolean {
    return isPresent(value) && (value instanceof Type || value instanceof Binding);
  }

  private static _assertTypeIsComponent(directiveBinding: DirectiveBinding): void {
    if (directiveBinding.metadata.type !== renderApi.DirectiveMetadata.COMPONENT_TYPE) {
      throw new BaseException(
          `Could not load '${stringify(directiveBinding.key.token)}' because it is not a component.`);
    }
  }
}
