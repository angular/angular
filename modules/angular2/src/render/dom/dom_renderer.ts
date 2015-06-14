import {Inject, Injectable, OpaqueToken} from 'angular2/di';
import {
  isPresent,
  isBlank,
  BaseException,
  RegExpWrapper,
  CONST_EXPR
} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper, Map, StringMapWrapper, List} from 'angular2/src/facade/collection';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {Content} from './shadow_dom/content_tag';
import {ShadowDomStrategy} from './shadow_dom/shadow_dom_strategy';
import {EventManager} from './events/event_manager';

import {DomProtoView, DomProtoViewRef, resolveInternalDomProtoView} from './view/proto_view';
import {DomView, DomViewRef, resolveInternalDomView} from './view/view';
import {DomElement} from './view/element';
import {DomViewContainer} from './view/view_container';
import {NG_BINDING_CLASS_SELECTOR, NG_BINDING_CLASS} from './util';
import {Renderer, RenderProtoViewRef, RenderViewRef} from '../api';
import {enter, leave, createScope} from 'angular2/src/core/wtf';


export const DOCUMENT_TOKEN = CONST_EXPR(new OpaqueToken('DocumentToken'));


@Injectable()
export class DomRenderer extends Renderer {
  _document;

  constructor(public _eventManager: EventManager, public _shadowDomStrategy: ShadowDomStrategy,
              @Inject(DOCUMENT_TOKEN) document) {
    super();
    this._document = document;
  }

  _scope_createRootHostView = createScope('DomRenderer#createRootHostView()');
  createRootHostView(hostProtoViewRef: RenderProtoViewRef,
                     hostElementSelector: string): RenderViewRef {
    var s = enter(this._scope_createRootHostView);
    var hostProtoView = resolveInternalDomProtoView(hostProtoViewRef);
    var element = DOM.querySelector(this._document, hostElementSelector);
    if (isBlank(element)) {
      leave(s);
      throw new BaseException(`The selector "${hostElementSelector}" did not match any elements`);
    }
    var rVal = new DomViewRef(this._createView(hostProtoView, element));
    leave(s);
    return rVal;
  }

  _scope_createView = createScope('DomRenderer#createView()');
  createView(protoViewRef: RenderProtoViewRef): RenderViewRef {
    var s = enter(this._scope_createView);
    var protoView = resolveInternalDomProtoView(protoViewRef);
    var rVal = new DomViewRef(this._createView(protoView, null));
    leave(s);
    return rVal;
  }

  _scope_destroyView = createScope('DomRenderer#destroyView()');
  destroyView(view: RenderViewRef) {
    // noop for now
    leave(enter(this._scope_destroyView));
  }

  _scope_attachComponentView = createScope('DomRenderer#attachComponentView()');
  attachComponentView(hostViewRef: RenderViewRef, elementIndex: number,
                      componentViewRef: RenderViewRef) {
    var s = enter(this._scope_attachComponentView);
    var hostView = resolveInternalDomView(hostViewRef);
    var componentView = resolveInternalDomView(componentViewRef);
    var element = hostView.boundElements[elementIndex].element;
    var lightDom = hostView.boundElements[elementIndex].lightDom;
    if (isPresent(lightDom)) {
      lightDom.attachShadowDomView(componentView);
    }
    var shadowRoot = this._shadowDomStrategy.prepareShadowRoot(element);
    this._moveViewNodesIntoParent(shadowRoot, componentView);
    componentView.hostLightDom = lightDom;
    componentView.shadowRoot = shadowRoot;
    leave(s);
  }

  _scope_setComponentViewRootNodes = createScope('DomRenderer#setComponentViewRootNodes()');
  setComponentViewRootNodes(componentViewRef: RenderViewRef, rootNodes: List</*node*/ any>) {
    var s = enter(this._scope_setComponentViewRootNodes);
    var componentView = resolveInternalDomView(componentViewRef);
    this._removeViewNodes(componentView);
    componentView.rootNodes = rootNodes;
    this._moveViewNodesIntoParent(componentView.shadowRoot, componentView);
    leave(s);
  }

  _scope_getRootNodes = createScope('DomRenderer#getRootNodes()');
  getRootNodes(viewRef: RenderViewRef): List</*node*/ any> {
    var s = enter(this._scope_getRootNodes);
    var rVal = resolveInternalDomView(viewRef).rootNodes;
    leave(s);
    return rVal;
  }

  _scope_detachComponentView = createScope('DomRenderer#detachComponentView()');
  detachComponentView(hostViewRef: RenderViewRef, boundElementIndex: number,
                      componentViewRef: RenderViewRef) {
    var s = enter(this._scope_detachComponentView);
    var hostView = resolveInternalDomView(hostViewRef);
    var componentView = resolveInternalDomView(componentViewRef);
    this._removeViewNodes(componentView);
    var lightDom = hostView.boundElements[boundElementIndex].lightDom;
    if (isPresent(lightDom)) {
      lightDom.detachShadowDomView();
    }
    componentView.hostLightDom = null;
    componentView.shadowRoot = null;
    leave(s);
  }

  _scope_attachViewInContainer = createScope('DomRenderer#attachViewInContainer()');
  attachViewInContainer(parentViewRef: RenderViewRef, boundElementIndex: number, atIndex: number,
                        viewRef: RenderViewRef) {
    var s = enter(this._scope_attachViewInContainer);
    var parentView = resolveInternalDomView(parentViewRef);
    var view = resolveInternalDomView(viewRef);
    var viewContainer = this._getOrCreateViewContainer(parentView, boundElementIndex);
    ListWrapper.insert(viewContainer.views, atIndex, view);
    view.hostLightDom = parentView.hostLightDom;

    var directParentLightDom = this._directParentLightDom(parentView, boundElementIndex);
    if (isBlank(directParentLightDom)) {
      var siblingToInsertAfter;
      if (atIndex == 0) {
        siblingToInsertAfter = parentView.boundElements[boundElementIndex].element;
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
    leave(s);
  }

  _scope_detachViewInContainer = createScope('DomRenderer#detachViewInContainer()');
  detachViewInContainer(parentViewRef: RenderViewRef, boundElementIndex: number, atIndex: number,
                        viewRef: RenderViewRef) {
    var s = enter(this._scope_detachViewInContainer);
    var parentView = resolveInternalDomView(parentViewRef);
    var view = resolveInternalDomView(viewRef);
    var viewContainer = parentView.boundElements[boundElementIndex].viewContainer;
    var detachedView = viewContainer.views[atIndex];
    ListWrapper.removeAt(viewContainer.views, atIndex);
    var directParentLightDom = this._directParentLightDom(parentView, boundElementIndex);
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
    leave(s);
  }

  hydrateView(viewRef: RenderViewRef) {
    var view = resolveInternalDomView(viewRef);
    if (view.hydrated) throw new BaseException('The view is already hydrated.');
    view.hydrated = true;

    for (var i = 0; i < view.boundElements.length; ++i) {
      var lightDom = view.boundElements[i].lightDom;
      if (isPresent(lightDom)) {
        lightDom.redistribute();
      }
    }

    // add global events
    view.eventHandlerRemovers = [];
    var binders = view.proto.elementBinders;
    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      if (isPresent(binder.globalEvents)) {
        for (var i = 0; i < binder.globalEvents.length; i++) {
          var globalEvent = binder.globalEvents[i];
          var remover = this._createGlobalEventListener(view, binderIdx, globalEvent.name,
                                                        globalEvent.target, globalEvent.fullName);
          view.eventHandlerRemovers.push(remover);
        }
      }
    }
    if (isPresent(view.hostLightDom)) {
      view.hostLightDom.redistribute();
    }
  }

  dehydrateView(viewRef: RenderViewRef) {
    var view = resolveInternalDomView(viewRef);

    // remove global events
    for (var i = 0; i < view.eventHandlerRemovers.length; i++) {
      view.eventHandlerRemovers[i]();
    }

    view.eventHandlerRemovers = null;
    view.hydrated = false;
  }

  setElementProperty(viewRef: RenderViewRef, elementIndex: number, propertyName: string,
                     propertyValue: any): void {
    var view = resolveInternalDomView(viewRef);
    view.setElementProperty(elementIndex, propertyName, propertyValue);
  }

  _scope_callAction = createScope('DomRenderer#callAction()');
  callAction(viewRef: RenderViewRef, elementIndex: number, actionExpression: string,
             actionArgs: any): void {
    var s = enter(this._scope_callAction);
    var view = resolveInternalDomView(viewRef);
    view.callAction(elementIndex, actionExpression, actionArgs);
    leave(s);
  }

  setText(viewRef: RenderViewRef, textNodeIndex: number, text: string): void {
    var view = resolveInternalDomView(viewRef);
    DOM.setText(view.boundTextNodes[textNodeIndex], text);
  }

  _scope_setEventDispatcher = createScope('DomRenderer#setEventDispatcher()');
  setEventDispatcher(viewRef: RenderViewRef, dispatcher: any /*api.EventDispatcher*/): void {
    var s = enter(this._scope_setEventDispatcher);
    var view = resolveInternalDomView(viewRef);
    view.eventDispatcher = dispatcher;
    leave(s);
  }

  _createView(protoView: DomProtoView, inplaceElement): DomView {
    var rootElementClone;
    var elementsWithBindingsDynamic;
    var viewRootNodes;
    if (isPresent(inplaceElement)) {
      rootElementClone = inplaceElement;
      elementsWithBindingsDynamic = [];
      viewRootNodes = [inplaceElement];
    } else if (protoView.isTemplateElement) {
      rootElementClone = DOM.importIntoDoc(DOM.content(protoView.element));
      elementsWithBindingsDynamic =
          DOM.querySelectorAll(rootElementClone, NG_BINDING_CLASS_SELECTOR);
      viewRootNodes = ListWrapper.createFixedSize(protoView.rootNodeCount);
      // Note: An explicit loop is the fastest way to convert a DOM array into a JS array!
      var childNode = DOM.firstChild(rootElementClone);
      for (var i = 0; i < protoView.rootNodeCount; i++, childNode = DOM.nextSibling(childNode)) {
        viewRootNodes[i] = childNode;
      }
    } else {
      rootElementClone = DOM.importIntoDoc(protoView.element);
      elementsWithBindingsDynamic = DOM.getElementsByClassName(rootElementClone, NG_BINDING_CLASS);
      viewRootNodes = [rootElementClone];
    }

    var binders = protoView.elementBinders;
    var boundTextNodes = ListWrapper.createFixedSize(protoView.boundTextNodeCount);
    var boundElements = ListWrapper.createFixedSize(binders.length);
    var boundTextNodeIdx = 0;

    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var element;
      var childNodes;
      if (binderIdx === 0 && protoView.rootBindingOffset === 1) {
        // Note: if the root element was a template,
        // the rootElementClone is a document fragment,
        // which will be empty as soon as the view gets appended
        // to a parent. So we store null in the boundElements array.
        element = protoView.isTemplateElement ? null : rootElementClone;
        childNodes = DOM.childNodes(rootElementClone);
      } else {
        element = elementsWithBindingsDynamic[binderIdx - protoView.rootBindingOffset];
        childNodes = DOM.childNodes(element);
      }

      // boundTextNodes
      var textNodeIndices = binder.textNodeIndices;
      for (var i = 0; i < textNodeIndices.length; i++) {
        boundTextNodes[boundTextNodeIdx++] = childNodes[textNodeIndices[i]];
      }

      // contentTags
      var contentTag = null;
      if (isPresent(binder.contentTagSelector)) {
        contentTag = new Content(element, binder.contentTagSelector);
      }
      boundElements[binderIdx] = new DomElement(binder, element, contentTag);
    }

    var view = new DomView(protoView, viewRootNodes, boundTextNodes, boundElements);

    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var element = boundElements[binderIdx];
      var domEl = element.element;

      // lightDoms
      var lightDom = null;
      // Note: for the root element we can't use the binder.elementIsEmpty
      // information as we don't use the element from the ProtoView
      // but an element from the document.
      if (isPresent(binder.componentId) && (!binder.elementIsEmpty || isPresent(inplaceElement))) {
        lightDom = this._shadowDomStrategy.constructLightDom(view, domEl);
      }
      element.lightDom = lightDom;

      // init contentTags
      var contentTag = element.contentTag;
      if (isPresent(contentTag)) {
        var directParentLightDom = this._directParentLightDom(view, binderIdx);
        contentTag.init(directParentLightDom);
      }

      // events
      if (isPresent(binder.eventLocals) && isPresent(binder.localEvents)) {
        for (var i = 0; i < binder.localEvents.length; i++) {
          this._createEventListener(view, domEl, binderIdx, binder.localEvents[i].name,
                                    binder.eventLocals);
        }
      }
    }

    return view;
  }

  _createEventListener(view, element, elementIndex, eventName, eventLocals) {
    this._eventManager.addEventListener(
        element, eventName, (event) => { view.dispatchEvent(elementIndex, eventName, event); });
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

  _getOrCreateViewContainer(parentView: DomView, boundElementIndex) {
    var el = parentView.boundElements[boundElementIndex];
    var vc = el.viewContainer;
    if (isBlank(vc)) {
      vc = new DomViewContainer();
      el.viewContainer = vc;
    }
    return vc;
  }

  _directParentLightDom(view: DomView, boundElementIndex: number) {
    var directParentEl = view.getDirectParentElement(boundElementIndex);
    return isPresent(directParentEl) ? directParentEl.lightDom : null;
  }

  _createGlobalEventListener(view, elementIndex, eventName, eventTarget, fullName): Function {
    return this._eventManager.addGlobalEventListener(
        eventTarget, eventName, (event) => { view.dispatchEvent(elementIndex, fullName, event); });
  }
}
