import {Inject, Injectable} from 'angular2/src/di/annotations_impl';
import {int, isPresent, isBlank, BaseException, RegExpWrapper} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {Content} from './shadow_dom/content_tag';
import {ShadowDomStrategy} from './shadow_dom/shadow_dom_strategy';
import {EventManager} from './events/event_manager';

import {DomProtoView, DomProtoViewRef, resolveInternalDomProtoView} from './view/proto_view';
import {DomView, DomViewRef, resolveInternalDomView} from './view/view';
import {DomViewContainer} from './view/view_container';
import {NG_BINDING_CLASS_SELECTOR, NG_BINDING_CLASS} from './util';

import {Renderer, RenderProtoViewRef, RenderViewRef} from '../api';

// TODO(tbosch): use an OpaqueToken here once our transpiler supports
// const expressions!
export const DOCUMENT_TOKEN = 'DocumentToken';

var _DOCUMENT_SELECTOR_REGEX = RegExpWrapper.create('\\:document(.+)');

@Injectable()
export class DomRenderer extends Renderer {
  _eventManager:EventManager;
  _shadowDomStrategy:ShadowDomStrategy;
  _document;

  constructor(eventManager:EventManager, shadowDomStrategy:ShadowDomStrategy, @Inject(DOCUMENT_TOKEN) document) {
    super();
    this._eventManager = eventManager;
    this._shadowDomStrategy = shadowDomStrategy;
    this._document = document;
  }

  createInPlaceHostView(parentHostViewRef:RenderViewRef, hostElementSelector:string, hostProtoViewRef:RenderProtoViewRef):RenderViewRef {
    var containerNode;
    var documentSelectorMatch = RegExpWrapper.firstMatch(_DOCUMENT_SELECTOR_REGEX, hostElementSelector);
    if (isPresent(documentSelectorMatch)) {
      containerNode = this._document;
      hostElementSelector = documentSelectorMatch[1];
    } else if (isPresent(parentHostViewRef)) {
      var parentHostView = resolveInternalDomView(parentHostViewRef);
      containerNode = parentHostView.shadowRoot;
    } else {
      containerNode = this._document;
    }
    var element = DOM.querySelector(containerNode, hostElementSelector);
    if (isBlank(element)) {
      throw new BaseException(`The selector "${hostElementSelector}" did not match any elements`);
    }
    var hostProtoView = resolveInternalDomProtoView(hostProtoViewRef);
    return new DomViewRef(this._createView(hostProtoView, element));
  }

  destroyInPlaceHostView(parentHostViewRef:RenderViewRef, hostViewRef:RenderViewRef) {
    var hostView = resolveInternalDomView(hostViewRef);
    this._removeViewNodes(hostView);
  }

  createView(protoViewRef:RenderProtoViewRef):RenderViewRef {
    var protoView = resolveInternalDomProtoView(protoViewRef);
    return new DomViewRef(this._createView(protoView, null));
  }

  destroyView(view:RenderViewRef) {
    // noop for now
  }

  attachComponentView(hostViewRef:RenderViewRef, elementIndex:number, componentViewRef:RenderViewRef) {
    var hostView = resolveInternalDomView(hostViewRef);
    var componentView = resolveInternalDomView(componentViewRef);
    var element = hostView.boundElements[elementIndex];
    var lightDom = hostView.lightDoms[elementIndex];
    if (isPresent(lightDom)) {
      lightDom.attachShadowDomView(componentView);
    }
    var shadowRoot = this._shadowDomStrategy.prepareShadowRoot(element);
    this._moveViewNodesIntoParent(shadowRoot, componentView);
    componentView.hostLightDom = lightDom;
    componentView.shadowRoot = shadowRoot;
  }

  setComponentViewRootNodes(componentViewRef:RenderViewRef, rootNodes:List) {
    var componentView = resolveInternalDomView(componentViewRef);
    this._removeViewNodes(componentView);
    componentView.rootNodes = rootNodes;
    this._moveViewNodesIntoParent(componentView.shadowRoot, componentView);
  }

  detachComponentView(hostViewRef:RenderViewRef, boundElementIndex:number, componentViewRef:RenderViewRef) {
    var hostView = resolveInternalDomView(hostViewRef);
    var componentView = resolveInternalDomView(componentViewRef);
    this._removeViewNodes(componentView);
    var lightDom = hostView.lightDoms[boundElementIndex];
    if (isPresent(lightDom)) {
      lightDom.detachShadowDomView();
    }
    componentView.hostLightDom = null;
    componentView.shadowRoot = null;
  }

  attachViewInContainer(parentViewRef:RenderViewRef, boundElementIndex:number, atIndex:number, viewRef:RenderViewRef) {
    var parentView = resolveInternalDomView(parentViewRef);
    var view = resolveInternalDomView(viewRef);
    var viewContainer = this._getOrCreateViewContainer(parentView, boundElementIndex);
    ListWrapper.insert(viewContainer.views, atIndex, view);
    view.hostLightDom = parentView.hostLightDom;

    var directParentLightDom = parentView.getDirectParentLightDom(boundElementIndex);
    if (isBlank(directParentLightDom)) {
      var siblingToInsertAfter;
      if (atIndex == 0) {
        siblingToInsertAfter = parentView.boundElements[boundElementIndex];
      } else {
        siblingToInsertAfter = ListWrapper.last(viewContainer.views[atIndex - 1].rootNodes);
      }
      this._moveViewNodesAfterSibling(siblingToInsertAfter, view);
    } else {
      directParentLightDom.redistribute();
    }
    // new content tags might have appeared, we need to redistribute.
    if (isPresent(parentView.hostLightDom)) {
      parentView.hostLightDom.redistribute();
    }
  }

  detachViewInContainer(parentViewRef:RenderViewRef, boundElementIndex:number, atIndex:number, viewRef:RenderViewRef) {
    var parentView = resolveInternalDomView(parentViewRef);
    var view = resolveInternalDomView(viewRef);
    var viewContainer = parentView.viewContainers[boundElementIndex];
    var detachedView = viewContainer.views[atIndex];
    ListWrapper.removeAt(viewContainer.views, atIndex);
    var directParentLightDom = parentView.getDirectParentLightDom(boundElementIndex);
    if (isBlank(directParentLightDom)) {
      this._removeViewNodes(detachedView);
    } else {
      directParentLightDom.redistribute();
    }
    view.hostLightDom = null;
    // content tags might have disappeared we need to do redistribution.
    if (isPresent(parentView.hostLightDom)) {
      parentView.hostLightDom.redistribute();
    }
  }

  hydrateView(viewRef:RenderViewRef) {
    var view = resolveInternalDomView(viewRef);
    if (view.hydrated) throw new BaseException('The view is already hydrated.');
    view.hydrated = true;

    for (var i = 0; i < view.lightDoms.length; ++i) {
      var lightDom = view.lightDoms[i];
      if (isPresent(lightDom)) {
        lightDom.redistribute();
      }
    }

    //add global events
    view.eventHandlerRemovers = ListWrapper.create();
    var binders = view.proto.elementBinders;
    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      if (isPresent(binder.globalEvents)) {
        for (var i = 0; i < binder.globalEvents.length; i++) {
          var globalEvent = binder.globalEvents[i];
          var remover = this._createGlobalEventListener(view, binderIdx, globalEvent.name, globalEvent.target, globalEvent.fullName);
          ListWrapper.push(view.eventHandlerRemovers, remover);
        }
      }
    }
    if (isPresent(view.hostLightDom)) {
      view.hostLightDom.redistribute();
    }
  }

  dehydrateView(viewRef:RenderViewRef) {
    var view = resolveInternalDomView(viewRef);

    //remove global events
    for (var i = 0; i < view.eventHandlerRemovers.length; i++) {
      view.eventHandlerRemovers[i]();
    }

    view.eventHandlerRemovers = null;
    view.hydrated = false;
  }

  setElementProperty(viewRef:RenderViewRef, elementIndex:number, propertyName:string, propertyValue:any):void {
    var view = resolveInternalDomView(viewRef);
    view.setElementProperty(elementIndex, propertyName, propertyValue);
  }

  callAction(viewRef:RenderViewRef, elementIndex:number, actionExpression:string, actionArgs:any):void {
    var view = resolveInternalDomView(viewRef);
    view.callAction(elementIndex, actionExpression, actionArgs);
  }

  setText(viewRef:RenderViewRef, textNodeIndex:number, text:string):void {
    var view = resolveInternalDomView(viewRef);
    DOM.setText(view.boundTextNodes[textNodeIndex], text);
  }

  setEventDispatcher(viewRef:RenderViewRef, dispatcher:any/*api.EventDispatcher*/):void {
    var view = resolveInternalDomView(viewRef);
    view.eventDispatcher = dispatcher;
  }

  _createView(protoView:DomProtoView, inplaceElement): DomView {
    var rootElementClone = isPresent(inplaceElement) ? inplaceElement : DOM.importIntoDoc(protoView.element);
    var elementsWithBindingsDynamic;
    if (protoView.isTemplateElement) {
      elementsWithBindingsDynamic = DOM.querySelectorAll(DOM.content(rootElementClone), NG_BINDING_CLASS_SELECTOR);
    } else {
      elementsWithBindingsDynamic = DOM.getElementsByClassName(rootElementClone, NG_BINDING_CLASS);
    }

    var elementsWithBindings = ListWrapper.createFixedSize(elementsWithBindingsDynamic.length);
    for (var binderIdx = 0; binderIdx < elementsWithBindingsDynamic.length; ++binderIdx) {
      elementsWithBindings[binderIdx] = elementsWithBindingsDynamic[binderIdx];
    }

    var viewRootNodes;
    if (protoView.isTemplateElement) {
      var childNode = DOM.firstChild(DOM.content(rootElementClone));
      viewRootNodes = []; // TODO(perf): Should be fixed size, since we could pre-compute in in DomProtoView
      // Note: An explicit loop is the fastest way to convert a DOM array into a JS array!
      while(childNode != null) {
        ListWrapper.push(viewRootNodes, childNode);
        childNode = DOM.nextSibling(childNode);
      }
    } else {
      viewRootNodes = [rootElementClone];
    }
    var binders = protoView.elementBinders;
    var boundTextNodes = [];
    var boundElements = ListWrapper.createFixedSize(binders.length);
    var contentTags = ListWrapper.createFixedSize(binders.length);

    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var element;
      if (binderIdx === 0 && protoView.rootBindingOffset === 1) {
        element = rootElementClone;
      } else {
        element = elementsWithBindings[binderIdx - protoView.rootBindingOffset];
      }
      boundElements[binderIdx] = element;

      // boundTextNodes
      var childNodes = DOM.childNodes(DOM.templateAwareRoot(element));
      var textNodeIndices = binder.textNodeIndices;
      for (var i = 0; i<textNodeIndices.length; i++) {
        ListWrapper.push(boundTextNodes, childNodes[textNodeIndices[i]]);
      }

      // contentTags
      var contentTag = null;
      if (isPresent(binder.contentTagSelector)) {
        contentTag = new Content(element, binder.contentTagSelector);
      }
      contentTags[binderIdx] = contentTag;
    }

    var view = new DomView(
      protoView, viewRootNodes,
      boundTextNodes, boundElements, contentTags
    );

    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var element = boundElements[binderIdx];

      // lightDoms
      var lightDom = null;
      if (isPresent(binder.componentId)) {
        lightDom = this._shadowDomStrategy.constructLightDom(view, boundElements[binderIdx]);
      }
      view.lightDoms[binderIdx] = lightDom;

      // init contentTags
      var contentTag = contentTags[binderIdx];
      if (isPresent(contentTag)) {
        var destLightDom = view.getDirectParentLightDom(binderIdx);
        contentTag.init(destLightDom);
      }

      // events
      if (isPresent(binder.eventLocals) && isPresent(binder.localEvents)) {
        for (var i = 0; i < binder.localEvents.length; i++) {
          this._createEventListener(view, element, binderIdx, binder.localEvents[i].name, binder.eventLocals);
        }
      }
    }

    return view;
  }

  _createEventListener(view, element, elementIndex, eventName, eventLocals) {
    this._eventManager.addEventListener(element, eventName, (event) => {
      view.dispatchEvent(elementIndex, eventName, event);
    });
  }


  _moveViewNodesAfterSibling(sibling, view) {
    for (var i = view.rootNodes.length - 1; i >= 0; --i) {
      DOM.insertAfter(sibling, view.rootNodes[i]);
    }
  }

  _moveViewNodesIntoParent(parent, view) {
    for (var i = 0; i < view.rootNodes.length; ++i) {
      DOM.appendChild(parent, view.rootNodes[i]);
    }
  }

  _removeViewNodes(view) {
    var len = view.rootNodes.length;
    if (len == 0) return;
    var parent = view.rootNodes[0].parentNode;
    for (var i = len - 1; i >= 0; --i) {
      DOM.removeChild(parent, view.rootNodes[i]);
    }
  }

  _getOrCreateViewContainer(parentView:DomView, boundElementIndex) {
    var vc = parentView.viewContainers[boundElementIndex];
    if (isBlank(vc)) {
      vc = new DomViewContainer();
      parentView.viewContainers[boundElementIndex] = vc;
    }
    return vc;
  }

  _createGlobalEventListener(view, elementIndex, eventName, eventTarget, fullName): Function {
    return this._eventManager.addGlobalEventListener(eventTarget, eventName, (event) => {
      view.dispatchEvent(elementIndex, fullName, event);
    });
  }

}
