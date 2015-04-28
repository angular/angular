import {Injectable} from 'angular2/di';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent, BaseException} from 'angular2/src/facade/lang';

import * as api from '../api';
import {RenderView} from './view/view';
import {RenderProtoView} from './view/proto_view';
import {ViewFactory} from './view/view_factory';
import {RenderViewHydrator} from './view/view_hydrator';
import {Compiler} from './compiler/compiler';
import {ShadowDomStrategy} from './shadow_dom/shadow_dom_strategy';
import {ProtoViewBuilder} from './view/proto_view_builder';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {ViewContainer} from './view/view_container';

function _resolveViewContainer(vc:api.RenderViewContainerRef) {
  return _resolveView(vc.view).getOrCreateViewContainer(vc.elementIndex);
}

function _resolveView(viewRef:DirectDomViewRef) {
  return isPresent(viewRef) ? viewRef.delegate : null;
}

function _resolveProtoView(protoViewRef:DirectDomProtoViewRef) {
  return isPresent(protoViewRef) ? protoViewRef.delegate : null;
}

function _wrapView(view:RenderView) {
  return new DirectDomViewRef(view);
}

function _collectComponentChildViewRefs(view, target = null) {
  if (isBlank(target)) {
    target = [];
  }
  ListWrapper.push(target, _wrapView(view));
  ListWrapper.forEach(view.componentChildViews, (view) => {
    if (isPresent(view)) {
      _collectComponentChildViewRefs(view, target);
    }
  });
  return target;
}



// public so that the compiler can use it.
export class DirectDomProtoViewRef extends api.ProtoViewRef {
  delegate:RenderProtoView;

  constructor(delegate:RenderProtoView) {
    super();
    this.delegate = delegate;
  }
}

export class DirectDomViewRef extends api.ViewRef {
  delegate:RenderView;

  constructor(delegate:RenderView) {
    super();
    this.delegate = delegate;
  }
}

@Injectable()
export class DirectDomRenderer extends api.Renderer {
  _compiler: Compiler;
  _viewFactory: ViewFactory;
  _viewHydrator: RenderViewHydrator;
  _shadowDomStrategy: ShadowDomStrategy;

  constructor(
      compiler: Compiler, viewFactory: ViewFactory, viewHydrator: RenderViewHydrator, shadowDomStrategy: ShadowDomStrategy) {
    super();
    this._compiler = compiler;
    this._viewFactory = viewFactory;
    this._viewHydrator = viewHydrator;
    this._shadowDomStrategy = shadowDomStrategy;
  }

  createHostProtoView(componentId):Promise<api.ProtoViewDto> {
    var rootElement = DOM.createElement('div');
    var hostProtoViewBuilder = new ProtoViewBuilder(rootElement);
    var elBinder = hostProtoViewBuilder.bindElement(rootElement, 'root element');
    elBinder.setComponentId(componentId);
    elBinder.bindDirective(0);

    this._shadowDomStrategy.processElement(null, componentId, rootElement);
    return PromiseWrapper.resolve(hostProtoViewBuilder.build());
  }

  createImperativeComponentProtoView(rendererId):Promise<api.ProtoViewDto> {
    var protoViewBuilder = new ProtoViewBuilder(null);
    protoViewBuilder.setImperativeRendererId(rendererId);
    return PromiseWrapper.resolve(protoViewBuilder.build());
  }

  compile(template:api.ViewDefinition):Promise<api.ProtoViewDto> {
    // Note: compiler already uses a DirectDomProtoViewRef, so we don't
    // need to do anything here
    return this._compiler.compile(template);
  }

  mergeChildComponentProtoViews(protoViewRef:api.ProtoViewRef, protoViewRefs:List<api.ProtoViewRef>) {
    _resolveProtoView(protoViewRef).mergeChildComponentProtoViews(
      ListWrapper.map(protoViewRefs, _resolveProtoView)
    );
  }

  createViewInContainer(vcRef:api.RenderViewContainerRef, atIndex:number, protoViewRef:api.ProtoViewRef):List<api.ViewRef> {
    var view = this._viewFactory.getView(_resolveProtoView(protoViewRef));
    var vc = _resolveViewContainer(vcRef);
    this._viewHydrator.hydrateViewInViewContainer(vc, view);
    vc.insert(view, atIndex);
    return _collectComponentChildViewRefs(view);
  }

  destroyViewInContainer(vcRef:api.RenderViewContainerRef, atIndex:number):void {
    var vc = _resolveViewContainer(vcRef);
    var view = vc.detach(atIndex);
    this._viewHydrator.dehydrateViewInViewContainer(vc, view);
    this._viewFactory.returnView(view);
  }

  insertViewIntoContainer(vcRef:api.RenderViewContainerRef, atIndex=-1, viewRef:api.ViewRef):void {
    _resolveViewContainer(vcRef).insert(_resolveView(viewRef), atIndex);
  }

  detachViewFromContainer(vcRef:api.RenderViewContainerRef, atIndex:number):void {
    _resolveViewContainer(vcRef).detach(atIndex);
  }

  createDynamicComponentView(hostViewRef:api.ViewRef, elementIndex:number, componentViewRef:api.ProtoViewRef):List<api.ViewRef> {
    var hostView = _resolveView(hostViewRef);
    var componentView = this._viewFactory.getView(_resolveProtoView(componentViewRef));
    this._viewHydrator.hydrateDynamicComponentView(hostView, elementIndex, componentView);
    return _collectComponentChildViewRefs(componentView);
  }

  destroyDynamicComponentView(hostViewRef:api.ViewRef, elementIndex:number):void {
    throw new BaseException('Not supported yet');
    // Something along these lines:
    // var hostView = _resolveView(hostViewRef);
    // var componentView = hostView.childComponentViews[elementIndex];
    // this._viewHydrator.dehydrateDynamicComponentView(hostView, componentView);
  }

  createInPlaceHostView(parentViewRef:api.ViewRef, hostElementSelector, hostProtoViewRef:api.ProtoViewRef):List<api.ViewRef> {
    var parentView = _resolveView(parentViewRef);
    var hostView = this._viewFactory.createInPlaceHostView(hostElementSelector, _resolveProtoView(hostProtoViewRef));
    this._viewHydrator.hydrateInPlaceHostView(parentView, hostView);
    return _collectComponentChildViewRefs(hostView);
  }

  /**
   * Destroys the given host view in the given parent view.
   */
  destroyInPlaceHostView(parentViewRef:api.ViewRef, hostViewRef:api.ViewRef):void {
    var parentView = _resolveView(parentViewRef);
    var hostView = _resolveView(hostViewRef);
    this._viewHydrator.dehydrateInPlaceHostView(parentView, hostView);
  }

  setImperativeComponentRootNodes(parentViewRef:api.ViewRef, elementIndex:number, nodes:List):void {
    var parentView = _resolveView(parentViewRef);
    var hostElement = parentView.boundElements[elementIndex];
    var componentView = parentView.componentChildViews[elementIndex];
    if (isBlank(componentView)) {
      throw new BaseException(`There is no componentChildView at index ${elementIndex}`);
    }
    if (isBlank(componentView.proto.imperativeRendererId)) {
      throw new BaseException(`This component view has no imperative renderer`);
    }
    ViewContainer.removeViewNodes(componentView);
    componentView.rootNodes = nodes;
    this._shadowDomStrategy.attachTemplate(hostElement, componentView);
  }

  setElementProperty(viewRef:api.ViewRef, elementIndex:number, propertyName:string, propertyValue:any):void {
    _resolveView(viewRef).setElementProperty(elementIndex, propertyName, propertyValue);
  }

  setText(viewRef:api.ViewRef, textNodeIndex:number, text:string):void {
    _resolveView(viewRef).setText(textNodeIndex, text);
  }

  setEventDispatcher(viewRef:api.ViewRef, dispatcher:any/*api.EventDispatcher*/):void {
    _resolveView(viewRef).setEventDispatcher(dispatcher);
  }
}
