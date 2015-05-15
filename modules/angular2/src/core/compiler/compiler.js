import {Binding} from 'angular2/di';
import {Injectable} from 'angular2/src/di/annotations_impl';
import {Type, isBlank, isPresent, BaseException, normalizeBlank, stringify} from 'angular2/src/facade/lang';
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
  _reader: DirectiveResolver;
  _compilerCache:CompilerCache;
  _compiling:Map<Type, Promise>;
  _templateResolver: TemplateResolver;
  _componentUrlMapper: ComponentUrlMapper;
  _urlResolver: UrlResolver;
  _appUrl: string;
  _render: renderApi.RenderCompiler;
  _protoViewFactory:ProtoViewFactory;

  constructor(reader: DirectiveResolver,
              cache:CompilerCache,
              templateResolver: TemplateResolver,
              componentUrlMapper: ComponentUrlMapper,
              urlResolver: UrlResolver,
              render: renderApi.RenderCompiler,
              protoViewFactory: ProtoViewFactory) {
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

  _bindDirective(directiveTypeOrBinding):DirectiveBinding {
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
  compileInHost(componentTypeOrBinding:any):Promise<ProtoViewRef> {
    var componentBinding = this._bindDirective(componentTypeOrBinding);
    Compiler._assertTypeIsComponent(componentBinding);

    var directiveMetadata = componentBinding.metadata;
    return this._render.compileHost(directiveMetadata).then( (hostRenderPv) => {
      return this._compileNestedProtoViews(componentBinding, hostRenderPv, [componentBinding]);
    }).then( (appProtoView) => {
      return new ProtoViewRef(appProtoView);
    });
  }

  compile(component: Type):Promise<ProtoViewRef> {
    var componentBinding = this._bindDirective(component);
    Compiler._assertTypeIsComponent(componentBinding);
    var protoView = this._compile(componentBinding);
    var pvPromise = PromiseWrapper.isPromise(protoView) ? protoView : PromiseWrapper.resolve(protoView);
    return pvPromise.then( (appProtoView) => {
      return new ProtoViewRef(appProtoView);
    });
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

    var boundDirectives = ListWrapper.map(directives,  (directive) => this._bindDirective(directive));

    var renderTemplate = this._buildRenderTemplate(component, template, boundDirectives);
    pvPromise = this._render.compile(renderTemplate).then( (renderPv) => {
      return this._compileNestedProtoViews(componentBinding, renderPv, boundDirectives);
    });

    MapWrapper.set(this._compiling, component, pvPromise);
    return pvPromise;
  }

  // TODO(tbosch): union type return AppProtoView or Promise<AppProtoView>
  _compileNestedProtoViews(componentBinding, renderPv, directives) {
    var protoViews = this._protoViewFactory.createAppProtoViews(componentBinding, renderPv, directives);
    var protoView = protoViews[0];
    // TODO(tbosch): we should be caching host protoViews as well!
    // -> need a separate cache for this...
    if (renderPv.type === renderApi.ProtoViewDto.COMPONENT_VIEW_TYPE && isPresent(componentBinding)) {
      // Populate the cache before compiling the nested components,
      // so that components can reference themselves in their template.
      var component = componentBinding.key.token;
      this._compilerCache.set(component, protoView);
      MapWrapper.delete(this._compiling, component);
    }

    var nestedPVPromises = [];
    ListWrapper.forEach(this._collectComponentElementBinders(protoViews), (elementBinder) => {
      var nestedComponent = elementBinder.componentDirective;
      var elementBinderDone = (nestedPv) => {
        elementBinder.nestedProtoView = nestedPv;
      };
      var nestedCall = this._compile(nestedComponent);
      if (PromiseWrapper.isPromise(nestedCall)) {
        ListWrapper.push(nestedPVPromises, nestedCall.then(elementBinderDone));
      } else if (isPresent(nestedCall)) {
        elementBinderDone(nestedCall);
      }
    });

    var protoViewDone = (_) => {
      return protoView;
    };
    if (nestedPVPromises.length > 0) {
      return PromiseWrapper.all(nestedPVPromises).then(protoViewDone);
    } else {
      return protoViewDone(null);
    }
  }

  _collectComponentElementBinders(protoViews:List<AppProtoView>):List<ElementBinder> {
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

  _buildRenderTemplate(component, view, directives): renderApi.ViewDefinition {
    var componentUrl = this._urlResolver.resolve(
        this._appUrl, this._componentUrlMapper.getUrl(component)
    );
    var templateAbsUrl = null;
    if (isPresent(view.templateUrl)) {
      templateAbsUrl = this._urlResolver.resolve(componentUrl, view.templateUrl);
    } else if (isPresent(view.template)) {
      // Note: If we have an inline template, we also need to send
      // the url for the component to the render so that it
      // is able to resolve urls in stylesheets.
      templateAbsUrl = componentUrl;
    }
    return new renderApi.ViewDefinition({
      componentId: stringify(component),
      absUrl: templateAbsUrl,
      template: view.template,
      directives: ListWrapper.map(directives, directiveBinding => directiveBinding.metadata )
    });
  }

  _flattenDirectives(template: View):List<Type> {
    if (isBlank(template.directives)) return [];

    var directives = [];
    this._flattenList(template.directives, directives);

    return directives;
  }

  _flattenList(tree:List<any>, out:List<any> /*<Type|Binding>*/):void {
    for (var i = 0; i < tree.length; i++) {
      var item = tree[i];
      if (ListWrapper.isList(item)) {
        this._flattenList(item, out);
      } else {
        ListWrapper.push(out, item);
      }
    }
  }

  static _isValidDirective(value: any): boolean {
    return isPresent(value) && (value instanceof Type || value instanceof Binding);
  }

  static _assertTypeIsComponent(directiveBinding:DirectiveBinding):void {
    if (directiveBinding.metadata.type !== renderApi.DirectiveMetadata.COMPONENT_TYPE) {
      throw new BaseException(`Could not load '${stringify(directiveBinding.key.token)}' because it is not a component.`);
    }
  }
}
