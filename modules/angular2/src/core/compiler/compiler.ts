import {Binding, resolveForwardRef, Injectable, Inject} from 'angular2/di';
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
} from 'angular2/src/core/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';
import {ListWrapper, Map, MapWrapper} from 'angular2/src/core/facade/collection';

import {DirectiveResolver} from './directive_resolver';

import {AppProtoView, AppProtoViewMergeMapping} from './view';
import {ProtoViewRef} from './view_ref';
import {DirectiveBinding} from './element_injector';
import {ViewResolver} from './view_resolver';
import {PipeResolver} from './pipe_resolver';
import {ViewMetadata} from 'angular2/metadata';
import {ComponentUrlMapper} from './component_url_mapper';
import {ProtoViewFactory} from './proto_view_factory';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';
import {AppRootUrl} from 'angular2/src/core/services/app_root_url';
import {ElementBinder} from './element_binder';
import {wtfStartTimeRange, wtfEndTimeRange} from '../profile/profile';
import {PipeBinding} from '../pipes/pipe_binding';
import {DEFAULT_PIPES_TOKEN} from 'angular2/pipes';

import {
  RenderDirectiveMetadata,
  ViewDefinition,
  RenderCompiler,
  ViewType,
  RenderProtoViewMergeMapping,
  RenderProtoViewRef
} from 'angular2/src/core/render/api';

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
  private _compiling: Map<Type, Promise<AppProtoView>> = new Map();
  private _appUrl: string;
  private _defaultPipes: Type[];

  /**
   * @private
   */
  constructor(private _directiveResolver: DirectiveResolver, private _pipeResolver: PipeResolver,
              @Inject(DEFAULT_PIPES_TOKEN) _defaultPipes: Type[],
              private _compilerCache: CompilerCache, private _viewResolver: ViewResolver,
              private _componentUrlMapper: ComponentUrlMapper, private _urlResolver: UrlResolver,
              private _render: RenderCompiler, private _protoViewFactory: ProtoViewFactory,
              appUrl: AppRootUrl) {
    this._defaultPipes = _defaultPipes;
    this._appUrl = appUrl.value;
  }

  private _bindDirective(directiveTypeOrBinding): DirectiveBinding {
    if (directiveTypeOrBinding instanceof DirectiveBinding) {
      return directiveTypeOrBinding;
    } else if (directiveTypeOrBinding instanceof Binding) {
      let annotation = this._directiveResolver.resolve(directiveTypeOrBinding.token);
      return DirectiveBinding.createFromBinding(directiveTypeOrBinding, annotation);
    } else {
      let annotation = this._directiveResolver.resolve(directiveTypeOrBinding);
      return DirectiveBinding.createFromType(directiveTypeOrBinding, annotation);
    }
  }

  private _bindPipe(typeOrBinding): PipeBinding {
    let meta = this._pipeResolver.resolve(typeOrBinding);
    return PipeBinding.createFromType(typeOrBinding, meta);
  }

  // Create a hostView as if the compiler encountered <hostcmp></hostcmp>.
  // Used for bootstrapping.
  compileInHost(componentTypeOrBinding: Type | Binding): Promise<ProtoViewRef> {
    var componentType = isType(componentTypeOrBinding) ? componentTypeOrBinding :
                                                         (<Binding>componentTypeOrBinding).token;
    var r = wtfStartTimeRange('Compiler#compile()', stringify(componentType));

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
                var protoViews = this._protoViewFactory.createAppProtoViews(
                    componentBinding, hostRenderPv, [componentBinding], []);
                return this._compileNestedProtoViews(protoViews, componentType, new Map());
              })
              .then((appProtoView) => {
                this._compilerCache.setHost(componentType, appProtoView);
                return appProtoView;
              });
    }
    return hostPvPromise.then((hostAppProtoView) => {
      wtfEndTimeRange(r);
      return hostAppProtoView.ref;
    });
  }

  private _compile(componentBinding: DirectiveBinding,
                   componentPath: Map<Type, AppProtoView>): Promise<AppProtoView>|
      AppProtoView {
    var component = <Type>componentBinding.key.token;
    var protoView = this._compilerCache.get(component);
    if (isPresent(protoView)) {
      // The component has already been compiled into an AppProtoView,
      // returns a plain AppProtoView, not wrapped inside of a Promise, for performance reasons.
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
        directives.map(directive => this._bindDirective(directive)));

    var pipes = this._flattenPipes(view);
    var boundPipes = pipes.map(pipe => this._bindPipe(pipe));

    var renderTemplate = this._buildRenderTemplate(component, view, boundDirectives);
    resultPromise =
        this._render.compile(renderTemplate)
            .then((renderPv) => {
              var protoViews = this._protoViewFactory.createAppProtoViews(
                  componentBinding, renderPv, boundDirectives, boundPipes);
              return this._compileNestedProtoViews(protoViews, component, componentPath);
            })
            .then((appProtoView) => {
              this._compilerCache.set(component, appProtoView);
              MapWrapper.delete(this._compiling, component);
              return appProtoView;
            });
    this._compiling.set(component, resultPromise);
    return resultPromise;
  }

  private _removeDuplicatedDirectives(directives: DirectiveBinding[]): DirectiveBinding[] {
    var directivesMap: Map<number, DirectiveBinding> = new Map();
    directives.forEach((dirBinding) => { directivesMap.set(dirBinding.key.id, dirBinding); });
    return MapWrapper.values(directivesMap);
  }

  private _compileNestedProtoViews(appProtoViews: AppProtoView[], componentType: Type,
                                   componentPath: Map<Type, AppProtoView>): Promise<AppProtoView> {
    var nestedPVPromises = [];
    componentPath = MapWrapper.clone(componentPath);
    if (appProtoViews[0].type === ViewType.COMPONENT) {
      componentPath.set(componentType, appProtoViews[0]);
    }
    appProtoViews.forEach(appProtoView => {
      this._collectComponentElementBinders(appProtoView)
          .forEach((elementBinder: ElementBinder) => {
            var nestedComponent = elementBinder.componentDirective;
            var nestedComponentType = <Type>nestedComponent.key.token;
            var elementBinderDone =
                (nestedPv: AppProtoView) => { elementBinder.nestedProtoView = nestedPv; };
            if (componentPath.has(nestedComponentType)) {
              // cycle...
              if (appProtoView.isEmbeddedFragment) {
                throw new BaseException(
                    `<ng-content> is used within the recursive path of ${stringify(nestedComponentType)}`);
              } else if (appProtoView.type === ViewType.COMPONENT) {
                throw new BaseException(
                    `Unconditional component cycle in ${stringify(nestedComponentType)}`);
              } else {
                elementBinderDone(componentPath.get(nestedComponentType));
              }
            } else {
              var nestedCall = this._compile(nestedComponent, componentPath);
              if (isPromise(nestedCall)) {
                nestedPVPromises.push((<Promise<AppProtoView>>nestedCall).then(elementBinderDone));
              } else {
                elementBinderDone(<AppProtoView>nestedCall);
              }
            }
          });
    });
    return PromiseWrapper.all(nestedPVPromises)
        .then(_ => PromiseWrapper.all(
                  appProtoViews.map(appProtoView => this._mergeProtoView(appProtoView))))
        .then(_ => appProtoViews[0]);
  }

  private _mergeProtoView(appProtoView: AppProtoView): Promise<any> {
    if (appProtoView.type !== ViewType.HOST && appProtoView.type !== ViewType.EMBEDDED) {
      return null;
    }
    return this._render.mergeProtoViewsRecursively(this._collectMergeRenderProtoViews(appProtoView))
        .then((mergeResult: RenderProtoViewMergeMapping) => {
          appProtoView.mergeMapping = new AppProtoViewMergeMapping(mergeResult);
        });
  }

  private _collectMergeRenderProtoViews(appProtoView:
                                            AppProtoView): Array<RenderProtoViewRef | any[]> {
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

  private _collectComponentElementBinders(appProtoView: AppProtoView): ElementBinder[] {
    var componentElementBinders = [];
    appProtoView.elementBinders.forEach((elementBinder) => {
      if (isPresent(elementBinder.componentDirective)) {
        componentElementBinders.push(elementBinder);
      }
    });
    return componentElementBinders;
  }

  private _buildRenderTemplate(component, view, directives): ViewDefinition {
    var componentUrl =
        this._urlResolver.resolve(this._appUrl, this._componentUrlMapper.getUrl(component));
    var templateAbsUrl = null;
    var styleAbsUrls = null;
    if (isPresent(view.templateUrl) && view.templateUrl.trim().length > 0) {
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
    return new ViewDefinition({
      componentId: stringify(component),
      templateAbsUrl: templateAbsUrl, template: view.template,
      styleAbsUrls: styleAbsUrls,
      styles: view.styles,
      directives: ListWrapper.map(directives, directiveBinding => directiveBinding.metadata),
      encapsulation: view.encapsulation
    });
  }

  private _flattenPipes(view: ViewMetadata): any[] {
    if (isBlank(view.pipes)) return this._defaultPipes;
    var pipes = ListWrapper.clone(this._defaultPipes);
    this._flattenList(view.pipes, pipes);
    return pipes;
  }

  private _flattenDirectives(view: ViewMetadata): Type[] {
    if (isBlank(view.directives)) return [];
    var directives = [];
    this._flattenList(view.directives, directives);
    return directives;
  }

  private _flattenList(tree: any[], out: Array<Type | Binding | any[]>): void {
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
    if (directiveBinding.metadata.type !== RenderDirectiveMetadata.COMPONENT_TYPE) {
      throw new BaseException(
          `Could not load '${stringify(directiveBinding.key.token)}' because it is not a component.`);
    }
  }
}
