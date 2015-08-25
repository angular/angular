import {Inject, Injectable, OpaqueToken} from 'angular2/di';
import {
  isPresent,
  isBlank,
  BaseException,
  RegExpWrapper,
  CONST_EXPR
} from 'angular2/src/core/facade/lang';

import {DOM} from 'angular2/src/core/dom/dom_adapter';

import {EventManager} from './events/event_manager';

import {DomProtoView, DomProtoViewRef, resolveInternalDomProtoView} from './view/proto_view';
import {DomView, DomViewRef, resolveInternalDomView} from './view/view';
import {DomFragmentRef, resolveInternalDomFragment} from './view/fragment';
import {DomSharedStylesHost} from './view/shared_styles_host';
import {
  NG_BINDING_CLASS_SELECTOR,
  NG_BINDING_CLASS,
  cloneAndQueryProtoView,
  camelCaseToDashCase
} from './util';
import {WtfScopeFn, wtfLeave, wtfCreateScope} from '../../profile/profile';

import {
  Renderer,
  RenderProtoViewRef,
  RenderViewRef,
  RenderElementRef,
  RenderFragmentRef,
  RenderViewWithFragments
} from '../api';

import {TemplateCloner} from './template_cloner';

import {DOCUMENT} from './dom_tokens';

const REFLECT_PREFIX: string = 'ng-reflect-';


@Injectable()
export class DomRenderer extends Renderer {
  _document;

  constructor(private _eventManager: EventManager,
              private _domSharedStylesHost: DomSharedStylesHost,
              private _templateCloner: TemplateCloner, @Inject(DOCUMENT) document) {
    super();
    this._document = document;
  }

  _createRootHostViewScope: WtfScopeFn = wtfCreateScope('DomRenderer#createRootHostView()');
  createRootHostView(hostProtoViewRef: RenderProtoViewRef, fragmentCount: number,
                     hostElementSelector: string): RenderViewWithFragments {
    var s = this._createRootHostViewScope();
    var hostProtoView = resolveInternalDomProtoView(hostProtoViewRef);
    var element = DOM.querySelector(this._document, hostElementSelector);
    if (isBlank(element)) {
      wtfLeave(s);
      throw new BaseException(`The selector "${hostElementSelector}" did not match any elements`);
    }
    return wtfLeave(s, this._createView(hostProtoView, element));
  }

  _createViewScope = wtfCreateScope('DomRenderer#createView()');
  createView(protoViewRef: RenderProtoViewRef, fragmentCount: number): RenderViewWithFragments {
    var s = this._createViewScope();
    var protoView = resolveInternalDomProtoView(protoViewRef);
    return wtfLeave(s, this._createView(protoView, null));
  }

  destroyView(viewRef: RenderViewRef) {
    var view = resolveInternalDomView(viewRef);
    var elementBinders = view.proto.elementBinders;
    for (var i = 0; i < elementBinders.length; i++) {
      var binder = elementBinders[i];
      if (binder.hasNativeShadowRoot) {
        this._domSharedStylesHost.removeHost(DOM.getShadowRoot(view.boundElements[i]));
      }
    }
  }

  getNativeElementSync(location: RenderElementRef): any {
    if (isBlank(location.renderBoundElementIndex)) {
      return null;
    }
    return resolveInternalDomView(location.renderView)
        .boundElements[location.renderBoundElementIndex];
  }

  getRootNodes(fragment: RenderFragmentRef): Node[] { return resolveInternalDomFragment(fragment); }

  attachFragmentAfterFragment(previousFragmentRef: RenderFragmentRef,
                              fragmentRef: RenderFragmentRef) {
    var previousFragmentNodes = resolveInternalDomFragment(previousFragmentRef);
    if (previousFragmentNodes.length > 0) {
      var sibling = previousFragmentNodes[previousFragmentNodes.length - 1];
      moveNodesAfterSibling(sibling, resolveInternalDomFragment(fragmentRef));
    }
  }

  attachFragmentAfterElement(elementRef: RenderElementRef, fragmentRef: RenderFragmentRef) {
    if (isBlank(elementRef.renderBoundElementIndex)) {
      return;
    }
    var parentView = resolveInternalDomView(elementRef.renderView);
    var element = parentView.boundElements[elementRef.renderBoundElementIndex];
    moveNodesAfterSibling(element, resolveInternalDomFragment(fragmentRef));
  }

  _detachFragmentScope = wtfCreateScope('DomRenderer#detachFragment()');
  detachFragment(fragmentRef: RenderFragmentRef) {
    var s = this._detachFragmentScope();
    var fragmentNodes = resolveInternalDomFragment(fragmentRef);
    for (var i = 0; i < fragmentNodes.length; i++) {
      DOM.remove(fragmentNodes[i]);
    }
    wtfLeave(s);
  }

  hydrateView(viewRef: RenderViewRef) {
    var view = resolveInternalDomView(viewRef);
    if (view.hydrated) throw new BaseException('The view is already hydrated.');
    view.hydrated = true;

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

  setElementProperty(location: RenderElementRef, propertyName: string, propertyValue: any): void {
    if (isBlank(location.renderBoundElementIndex)) {
      return;
    }
    var view = resolveInternalDomView(location.renderView);
    view.setElementProperty(location.renderBoundElementIndex, propertyName, propertyValue);
  }

  setElementAttribute(location: RenderElementRef, attributeName: string, attributeValue: string):
      void {
    if (isBlank(location.renderBoundElementIndex)) {
      return;
    }
    var view = resolveInternalDomView(location.renderView);
    view.setElementAttribute(location.renderBoundElementIndex, attributeName, attributeValue);
  }

  setElementClass(location: RenderElementRef, className: string, isAdd: boolean): void {
    if (isBlank(location.renderBoundElementIndex)) {
      return;
    }
    var view = resolveInternalDomView(location.renderView);
    view.setElementClass(location.renderBoundElementIndex, className, isAdd);
  }

  setElementStyle(location: RenderElementRef, styleName: string, styleValue: string): void {
    if (isBlank(location.renderBoundElementIndex)) {
      return;
    }
    var view = resolveInternalDomView(location.renderView);
    view.setElementStyle(location.renderBoundElementIndex, styleName, styleValue);
  }

  invokeElementMethod(location: RenderElementRef, methodName: string, args: any[]): void {
    if (isBlank(location.renderBoundElementIndex)) {
      return;
    }
    var view = resolveInternalDomView(location.renderView);
    view.invokeElementMethod(location.renderBoundElementIndex, methodName, args);
  }

  setText(viewRef: RenderViewRef, textNodeIndex: number, text: string): void {
    if (isBlank(textNodeIndex)) {
      return;
    }
    var view = resolveInternalDomView(viewRef);
    DOM.setText(view.boundTextNodes[textNodeIndex], text);
  }

  _setEventDispatcherScope = wtfCreateScope('DomRenderer#setEventDispatcher()');
  setEventDispatcher(viewRef: RenderViewRef, dispatcher: any /*api.EventDispatcher*/): void {
    var s = this._setEventDispatcherScope();
    var view = resolveInternalDomView(viewRef);
    view.eventDispatcher = dispatcher;
    wtfLeave(s);
  }

  _createView(protoView: DomProtoView, inplaceElement: HTMLElement): RenderViewWithFragments {
    var clonedProtoView = cloneAndQueryProtoView(this._templateCloner, protoView, true);

    var boundElements = clonedProtoView.boundElements;

    // adopt inplaceElement
    if (isPresent(inplaceElement)) {
      if (protoView.fragmentsRootNodeCount[0] !== 1) {
        throw new BaseException('Root proto views can only contain one element!');
      }
      DOM.clearNodes(inplaceElement);
      var tempRoot = clonedProtoView.fragments[0][0];
      moveChildNodes(tempRoot, inplaceElement);
      if (boundElements.length > 0 && boundElements[0] === tempRoot) {
        boundElements[0] = inplaceElement;
      }
      clonedProtoView.fragments[0][0] = inplaceElement;
    }

    var view = new DomView(protoView, clonedProtoView.boundTextNodes, boundElements);

    var binders = protoView.elementBinders;
    for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
      var binder = binders[binderIdx];
      var element = boundElements[binderIdx];

      // native shadow DOM
      if (binder.hasNativeShadowRoot) {
        var shadowRootWrapper = DOM.firstChild(element);
        var shadowRoot = DOM.createShadowRoot(element);
        this._domSharedStylesHost.addHost(shadowRoot);
        moveChildNodes(shadowRootWrapper, shadowRoot);
        DOM.remove(shadowRootWrapper);
      }

      // events
      if (isPresent(binder.eventLocals) && isPresent(binder.localEvents)) {
        for (var i = 0; i < binder.localEvents.length; i++) {
          this._createEventListener(view, element, binderIdx, binder.localEvents[i].name,
                                    binder.eventLocals);
        }
      }
    }

    return new RenderViewWithFragments(
        new DomViewRef(view), clonedProtoView.fragments.map(nodes => new DomFragmentRef(nodes)));
  }

  _createEventListener(view, element, elementIndex, eventName, eventLocals) {
    this._eventManager.addEventListener(
        element, eventName, (event) => { view.dispatchEvent(elementIndex, eventName, event); });
  }

  _createGlobalEventListener(view, elementIndex, eventName, eventTarget, fullName): Function {
    return this._eventManager.addGlobalEventListener(
        eventTarget, eventName, (event) => { view.dispatchEvent(elementIndex, fullName, event); });
  }
}

function moveNodesAfterSibling(sibling, nodes) {
  if (nodes.length > 0 && isPresent(DOM.parentElement(sibling))) {
    for (var i = 0; i < nodes.length; i++) {
      DOM.insertBefore(sibling, nodes[i]);
    }
    DOM.insertBefore(nodes[nodes.length - 1], sibling);
  }
}

function moveChildNodes(source: Node, target: Node) {
  var currChild = DOM.firstChild(source);
  while (isPresent(currChild)) {
    var nextChild = DOM.nextSibling(currChild);
    DOM.appendChild(target, currChild);
    currChild = nextChild;
  }
}
