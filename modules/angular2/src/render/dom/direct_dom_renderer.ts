/// <reference path="../../../typings/es6-promise/es6-promise.d.ts" />

import {List, ListWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent} from 'angular2/src/facade/lang';

import * as api from '../api';
import {View} from './view/view';
import {ProtoView} from './view/proto_view';
import {ViewFactory} from './view/view_factory';
import {Compiler} from './compiler/compiler';
import {ShadowDomStrategy} from './shadow_dom/shadow_dom_strategy';
import {ProtoViewBuilder} from './view/proto_view_builder';

function _resolveViewContainer(vc:api.ViewContainerRef) {
  return _resolveView(<_DirectDomViewRef>vc.view).viewContainers[vc.elementIndex];
}

function _resolveView(viewRef:_DirectDomViewRef) {
  return isPresent(viewRef) ? viewRef.delegate : null;
}

function _resolveProtoView(protoViewRef:DirectDomProtoViewRef) {
  return isPresent(protoViewRef) ? protoViewRef.delegate : null;
}

function _wrapView(view:View) {
  return new _DirectDomViewRef(view);
}

function _wrapProtoView(protoView:ProtoView) {
  return new DirectDomProtoViewRef(protoView);
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
  delegate:ProtoView;

  constructor(delegate:ProtoView) {
    super();
    this.delegate = delegate;
  }
}

class _DirectDomViewRef extends api.ViewRef {
  delegate:View;

  constructor(delegate:View) {
    super();
    this.delegate = delegate;
  }
}

export class DirectDomRenderer extends api.Renderer {
  _compiler: Compiler;
  _viewFactory: ViewFactory;
  _shadowDomStrategy: ShadowDomStrategy;

  constructor(
    compiler: Compiler, viewFactory: ViewFactory, shadowDomStrategy: ShadowDomStrategy) {
    super();
    this._compiler = compiler;
    this._viewFactory = viewFactory;
    this._shadowDomStrategy = shadowDomStrategy;
  }

  compile(template:api.Template):Promise<api.ProtoView> {
    // Note: compiler already uses a DirectDomProtoViewRef, so we don't
    // need to do anything here
    return this._compiler.compile(template);
  }

  mergeChildComponentProtoViews(protoViewRef:api.ProtoViewRef, protoViewRefs:List<api.ProtoViewRef>):List<api.ProtoViewRef> {
    var protoViews = [];
    _resolveProtoView(<DirectDomProtoViewRef>protoViewRef).mergeChildComponentProtoViews(
      ListWrapper.map(protoViewRefs, _resolveProtoView),
      protoViews
    );
    return ListWrapper.map(protoViews, _wrapProtoView);
  }

  createRootProtoView(selectorOrElement):api.ProtoViewRef {
    var element = selectorOrElement; // TODO: select the element if it is not a real element...
    var rootProtoViewBuilder = new ProtoViewBuilder(element);
    rootProtoViewBuilder.setIsRootView(true);
    rootProtoViewBuilder.bindElement(element, 'root element').setComponentId('root');
    this._shadowDomStrategy.processElement(null, 'root', element);
    return rootProtoViewBuilder.build().render;
  }

  createView(protoViewRef:api.ProtoViewRef):List<api.ViewRef> {
    return _collectComponentChildViewRefs(
      this._viewFactory.getView(_resolveProtoView(<DirectDomProtoViewRef>protoViewRef))
    );
  }

  destroyView(viewRef:api.ViewRef) {
    this._viewFactory.returnView(_resolveView(<_DirectDomViewRef>viewRef));
  }

  insertViewIntoContainer(vcRef:api.ViewContainerRef, viewRef:api.ViewRef, atIndex=-1):void {
    _resolveViewContainer(vcRef).insert(_resolveView(<_DirectDomViewRef>viewRef), atIndex);
  }

  detachViewFromContainer(vcRef:api.ViewContainerRef, atIndex:number):void {
    _resolveViewContainer(vcRef).detach(atIndex);
  }

  setElementProperty(viewRef:api.ViewRef, elementIndex:number, propertyName:string, propertyValue:any):void {
    _resolveView(<_DirectDomViewRef>viewRef).setElementProperty(elementIndex, propertyName, propertyValue);
  }

  setDynamicComponentView(viewRef:api.ViewRef, elementIndex:number, nestedViewRef:api.ViewRef):void {
    _resolveView(<_DirectDomViewRef>viewRef).setComponentView(
      this._shadowDomStrategy,
      elementIndex,
      _resolveView(<_DirectDomViewRef>nestedViewRef)
    );
  }

  setText(viewRef:api.ViewRef, textNodeIndex:number, text:string):void {
    _resolveView(<_DirectDomViewRef>viewRef).setText(textNodeIndex, text);
  }

  setEventDispatcher(viewRef:api.ViewRef, dispatcher:api.EventDispatcher) {
    _resolveView(<_DirectDomViewRef>viewRef).setEventDispatcher(dispatcher);
  }
}
