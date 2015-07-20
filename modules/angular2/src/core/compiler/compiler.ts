import {Binding, resolveForwardRef, Injectable} from 'angular2/di';
import {
  Type,
  isBlank,
  isType,
  isPresent,
  BaseException,
  normalizeBlank,
  stringify,
  isArray,
  isPromise
} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';

import {DirectiveResolver} from './directive_resolver';

import {AppProtoView, AppProtoViewMergeMapping} from './view';
import {ProtoViewRef} from './view_ref';
import {DirectiveBinding} from './element_injector';
import {ViewResolver} from './view_resolver';
import {View} from '../annotations_impl/view';
import {ComponentUrlMapper} from './component_url_mapper';
import {ProtoViewFactory} from './proto_view_factory';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {AppRootUrl} from 'angular2/src/services/app_root_url';
import {ElementBinder} from './element_binder';

import * as renderApi from 'angular2/src/render/api';

/**
 * Cache that stores the AppProtoView of the template of a component.
 * Used to prevent duplicate work and resolve cyclic dependencies.
 */
@Injectable()
export class CompilerCache {
  _cache: Map<Type, AppProtoView> = new Map();
  _hostCache: Map<Type, AppProtoView> = new Map();

  set(component: Type, protoView: AppProtoView): void { this._cache.set(component, protoView); }

  get(component: Type): AppProtoView {
    var result = this._cache.get(component);
    return normalizeBlank(result);
  }

  setHost(component: Type, protoView: AppProtoView): void {
    this._hostCache.set(component, protoView);
  }

  getHost(component: Type): AppProtoView {
    var result = this._hostCache.get(component);
    return normalizeBlank(result);
  }

  clear(): void {
    this._cache.clear();
    this._hostCache.clear();
  }
}

/**
 *
 * ## URL Resolution
 *
 * ```
 * var appRootUrl: AppRootUrl = ...;
 * var componentUrlMapper: ComponentUrlMapper = ...;
 * var urlResolver: UrlResolver = ...;
 *
 * var componentType: Type = ...;
 * var componentAnnotation: ComponentAnnotation = ...;
 * var viewAnnotation: ViewAnnotation = ...;
 *
 * // Resolving a URL
 *
 * var url = viewAnnotation.templateUrl;
 * var componentUrl = componentUrlMapper.getUrl(componentType);
 * var componentResolvedUrl = urlResolver.resolve(appRootUrl.value, componentUrl);
 * var templateResolvedUrl = urlResolver.resolve(componetResolvedUrl, url);
 * ```
 */
@Injectable()
export class Compiler {
  private _reader: DirectiveResolver;
  private _compilerCache: CompilerCache;
  private _compiling: Map<Type, Promise<AppProtoView>>;
  private _viewResolver: ViewResolver;
  private _componentUrlMapper: ComponentUrlMapper;
  private _urlResolver: UrlResolver;
  private _appUrl: string;
  private _render: renderApi.RenderCompiler;
  private _protoViewFactory: ProtoViewFactory;
  private _protoViewsToBeMerged: AppProtoView[] = [];

  /**
   * @private
   */
  constructor(reader: DirectiveResolver, cache: CompilerCache, viewResolver: ViewResolver,
              componentUrlMapper: ComponentUrlMapper, urlResolver: UrlResolver,
              render: renderApi.RenderCompiler, protoViewFactory: ProtoViewFactory,
              appUrl: AppRootUrl) {
    this._reader = reader;
    this._compilerCache = cache;
    this._compiling = new Map();
    this._viewResolver = viewResolver;
    this._componentUrlMapper = componentUrlMapper;
    this._urlResolver = urlResolver;
    this._appUrl = appUrl.value;
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
    var componentType = isType(componentTypeOrBinding) ? componentTypeOrBinding :
                                                         (<Binding>componentTypeOrBinding).token;

    var hostAppProtoView = this._compilerCache.getHost(componentType);
    var hostPvPromise;
    if (isPresent(hostAppProtoView)) {
      hostPvPromise = PromiseWrapper.resolve(hostAppProtoView);
    } else {
      var componentBinding: DirectiveBinding = this._bindDirective(componentTypeOrBinding);
      Compiler._assertTypeIsComponent(componentBinding);

      var directiveMetadata = componentBinding.metadata;
      hostPvPromise =
          this._render.compileHost(directiveMetadata)
              .then((hostRenderPv) => {
                var protoView = this._protoViewFactory.createAppProtoViews(
                    componentBinding, hostRenderPv, [componentBinding]);
                this._compilerCache.setHost(componentType, protoView);
                return this._compileNestedProtoViews(hostRenderPv, protoView, componentType);
              });
    }
    return hostPvPromise.then(hostAppProtoView =>
                                  this._mergeUnmergedProtoViews().then(_ => hostAppProtoView.ref));
  }

  private _mergeUnmergedProtoViews(): Promise<any> {
    var protoViewsToBeMerged = this._protoViewsToBeMerged;
    this._protoViewsToBeMerged = [];
    return PromiseWrapper.all(protoViewsToBeMerged.map((appProtoView) => {
      return this._render.mergeProtoViewsRecursively(
                             this._collectMergeRenderProtoViews(appProtoView))
          .then((mergeResult: renderApi.RenderProtoViewMergeMapping) => {
            appProtoView.mergeMapping = new AppProtoViewMergeMapping(mergeResult);
          });
    }));
  }

  private _collectMergeRenderProtoViews(
      appProtoView: AppProtoView): List<renderApi.RenderProtoViewRef | List<any>> {
    var result = [appProtoView.render];
    for (var i = 0; i < appProtoView.elementBinders.length; i++) {
      var binder = appProtoView.elementBinders[i];
      if (isPresent(binder.nestedProtoView)) {
        if (binder.hasStaticComponent() ||
            (binder.hasEmbeddedProtoView() && binder.nestedProtoView.isEmbeddedFragment)) {
          result.push(this._collectMergeRenderProtoViews(binder.nestedProtoView));
        } else {
          result.push(null);
        }
      }
    }
    return result;
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

    var resultPromise = this._compiling.get(component);
    if (isPresent(resultPromise)) {
      // The component is already being compiled, attach to the existing Promise
      // instead of re-compiling the component.
      // It happens when a template references a component multiple times.
      return resultPromise;
    }
    var view = this._viewResolver.resolve(component);

    var directives = this._flattenDirectives(view);

    for (var i = 0; i < directives.length; i++) {
      if (!Compiler._isValidDirective(directives[i])) {
        throw new BaseException(
            `Unexpected directive value '${stringify(directives[i])}' on the View of component '${stringify(component)}'`);
      }
    }

    var boundDirectives = this._removeDuplicatedDirectives(
        ListWrapper.map(directives, (directive) => this._bindDirective(directive)));

    var renderTemplate = this._buildRenderTemplate(component, view, boundDirectives);
    resultPromise = this._render.compile(renderTemplate)
                        .then((renderPv) => {
                          var protoView = this._protoViewFactory.createAppProtoViews(
                              componentBinding, renderPv, boundDirectives);
                          // Populate the cache before compiling the nested components,
                          // so that components can reference themselves in their template.
                          this._compilerCache.set(component, protoView);
                          MapWrapper.delete(this._compiling, component);

                          return this._compileNestedProtoViews(renderPv, protoView, component);
                        });
    this._compiling.set(component, resultPromise);
    return resultPromise;
  }

  private _removeDuplicatedDirectives(directives: List<DirectiveBinding>): List<DirectiveBinding> {
    var directivesMap: Map<number, DirectiveBinding> = new Map();
    directives.forEach((dirBinding) => { directivesMap.set(dirBinding.key.id, dirBinding); });
    return MapWrapper.values(directivesMap);
  }

  private _compileNestedProtoViews(renderProtoView: renderApi.ProtoViewDto,
                                   appProtoView: AppProtoView,
                                   componentType: Type): Promise<AppProtoView> {
    var nestedPVPromises = [];
    this._loopComponentElementBinders(appProtoView, (parentPv, elementBinder: ElementBinder) => {
      var nestedComponent = elementBinder.componentDirective;
      var elementBinderDone =
          (nestedPv: AppProtoView) => { elementBinder.nestedProtoView = nestedPv; };
      var nestedCall = this._compile(nestedComponent);
      if (isPromise(nestedCall)) {
        nestedPVPromises.push((<Promise<AppProtoView>>nestedCall).then(elementBinderDone));
      } else {
        elementBinderDone(<AppProtoView>nestedCall);
      }
    });
    return PromiseWrapper.all(nestedPVPromises)
        .then((_) => {
          this._collectMergableProtoViews(appProtoView, componentType);
          return appProtoView;
        });
  }

  private _collectMergableProtoViews(appProtoView: AppProtoView, componentType: Type) {
    var isRecursive = false;
    for (var i = 0; i < appProtoView.elementBinders.length; i++) {
      var binder = appProtoView.elementBinders[i];
      if (binder.hasStaticComponent()) {
        if (isBlank(binder.nestedProtoView.isRecursive)) {
          // cycle via a component. We are in the tail recursion,
          // so all components should have their isRecursive flag set already.
          isRecursive = true;
          break;
        }
      } else if (binder.hasEmbeddedProtoView()) {
        this._collectMergableProtoViews(binder.nestedProtoView, componentType);
      }
    }
    if (isRecursive) {
      if (appProtoView.isEmbeddedFragment) {
        throw new BaseException(
            `<ng-content> is used within the recursive path of ${stringify(componentType)}`);
      }
      if (appProtoView.type === renderApi.ViewType.COMPONENT) {
        throw new BaseException(`Unconditional component cycle in ${stringify(componentType)}`);
      }
    }
    if (appProtoView.type === renderApi.ViewType.EMBEDDED ||
        appProtoView.type === renderApi.ViewType.HOST) {
      this._protoViewsToBeMerged.push(appProtoView);
    }
    appProtoView.isRecursive = isRecursive;
  }

  private _loopComponentElementBinders(appProtoView: AppProtoView, callback: Function) {
    appProtoView.elementBinders.forEach((elementBinder) => {
      if (isPresent(elementBinder.componentDirective)) {
        callback(appProtoView, elementBinder);
      } else if (isPresent(elementBinder.nestedProtoView)) {
        this._loopComponentElementBinders(elementBinder.nestedProtoView, callback);
      }
    });
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
      if (isArray(item)) {
        this._flattenList(item, out);
      } else {
        out.push(item);
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
