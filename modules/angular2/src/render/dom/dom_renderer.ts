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
  RenderViewWithFragments,
  RenderTemplateCmd,
  RenderTemplateCmdType,
  RenderBeginElementCmd,
  RenderTextCmd,
  RenderNgContentCmd,
  RenderBeginComponentCmd
} from '../api';

import {RenderViewBuilder, ComponentTemplateResolver} from '../view_builder';

import {DOCUMENT, DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES} from './dom_tokens';

const REFLECT_PREFIX: string = 'ng-reflect-';

@Injectable()
export class DomRenderer extends Renderer implements ComponentTemplateResolver {
  _document;
  _reflectPropertiesAsAttributes: boolean;
  _componentTemplates:Map<string, RenderTemplateCmd[]> = new Map();

  constructor(private _eventManager: EventManager,
              private _domSharedStylesHost: DomSharedStylesHost,
              @Inject(DOCUMENT) document,
              @Inject(DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES) reflectPropertiesAsAttributes:
                  boolean) {
    super();
    this._reflectPropertiesAsAttributes = reflectPropertiesAsAttributes;
    this._document = document;
  }
  
  resolveComponentTemplate(templateId:string):RenderTemplateCmd[] {
    return this._componentTemplates.get(templateId);    
  }

  addComponentTemplate(templateId:string, commands:RenderTemplateCmd[], styles: string[]) {
    this._componentTemplates.set(templateId, commands);
    this._domSharedStylesHost.addStyles(styles);
  }
  
  createProtoView(cmds:RenderTemplateCmd[]):RenderProtoViewRef {
    return new DomProtoViewRef(cmds);
  }

  _scope_createRootHostView: WtfScopeFn = wtfCreateScope('DomRenderer#createRootHostView()');
  createRootHostView(hostProtoViewRef: RenderProtoViewRef, fragmentCount: number,
                     hostElementSelector: string): RenderViewWithFragments {
    var s = this._scope_createRootHostView();
    var cmds = resolveInternalDomProtoView(hostProtoViewRef);
    var element = DOM.querySelector(this._document, hostElementSelector);
    if (isBlank(element)) {
      wtfLeave(s);
      throw new BaseException(`The selector "${hostElementSelector}" did not match any elements`);
    }
    return wtfLeave(s, this._createView(cmds, element));
  }

  _scope_createView = wtfCreateScope('DomRenderer#createView()');
  createView(protoViewRef: RenderProtoViewRef, fragmentCount: number): RenderViewWithFragments {
    var s = this._scope_createView();
    var cmds = resolveInternalDomProtoView(protoViewRef);
    return wtfLeave(s, this._createView(cmds, null));
  }

  destroyView(viewRef: RenderViewRef) {
    var view = resolveInternalDomView(viewRef);
    for (var i=0; i<view.nativeShadowRoots.length; i++) {
      var sr = view.nativeShadowRoots[i];
      this._domSharedStylesHost.removeHost(sr);
    }
  }

  getNativeElementSync(location: RenderElementRef): any {
    if (isBlank(location.renderBoundElementIndex)) {
      return null;
    }
    return resolveInternalDomView(location.renderView)
        .boundElements[location.renderBoundElementIndex];
  }

  getRootNodes(fragment: RenderFragmentRef): List<Node> {
    return resolveInternalDomFragment(fragment);
  }

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

  _scope_detachFragment = wtfCreateScope('DomRenderer#detachFragment()');
  detachFragment(fragmentRef: RenderFragmentRef) {
    var s = this._scope_detachFragment();
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
    // TODO
    // view.eventHandlerRemovers = [];
    // var binders = view.proto.elementBinders;
    // for (var binderIdx = 0; binderIdx < binders.length; binderIdx++) {
    //   var binder = binders[binderIdx];
    //   if (isPresent(binder.globalEvents)) {
    //     for (var i = 0; i < binder.globalEvents.length; i++) {
    //       var globalEvent = binder.globalEvents[i];
    //       var remover = this._createGlobalEventListener(view, binderIdx, globalEvent.name,
    //                                                     globalEvent.target, globalEvent.fullName);
    //       view.eventHandlerRemovers.push(remover);
    //     }
    //   }
    // }
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
    // Reflect the property value as an attribute value with ng-reflect- prefix.
    if (this._reflectPropertiesAsAttributes) {
      this.setElementAttribute(location, `${REFLECT_PREFIX}${camelCaseToDashCase(propertyName)}`,
                               `${propertyValue}`);
    }
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

  invokeElementMethod(location: RenderElementRef, methodName: string, args: List<any>): void {
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

  _scope_setEventDispatcher = wtfCreateScope('DomRenderer#setEventDispatcher()');
  setEventDispatcher(viewRef: RenderViewRef, dispatcher: any /*api.EventDispatcher*/): void {
    var s = this._scope_setEventDispatcher();
    var view = resolveInternalDomView(viewRef);
    view.eventDispatcher = dispatcher;
    wtfLeave(s);
  }

  _createView(cmds: RenderTemplateCmd[], inplaceElement: HTMLElement): RenderViewWithFragments {
    var builder = new DomViewBuilder(this);
    var renderView = builder.build(cmds, inplaceElement);
    var embeddedFragments = [];
    for (var i=0; i<renderView.fragments.length; i++) {
      embeddedFragments.push(new DomFragmentRef(renderView.fragments[i]));
    }
    for (var i=0; i<renderView.nativeShadowRoots.length; i++) {
      var sr = renderView.nativeShadowRoots[i];
      this._domSharedStylesHost.addHost(sr);
    }
    return new RenderViewWithFragments(new DomViewRef(new DomView(null, renderView.boundTextNodes, <Element[]>renderView.boundElements, renderView.nativeShadowRoots)),
      embeddedFragments);
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

class DomViewBuilder extends RenderViewBuilder<Node> {
  constructor(templateResolver:ComponentTemplateResolver) {
    super(templateResolver);
  }
  protected createElement(name:string, attrs:string[]):Node {
    var el = DOM.createElement(name);
    for (var attrIdx = 0; attrIdx<attrs.length; attrIdx+=2) {
      DOM.setAttribute(el, attrs[attrIdx], attrs[attrIdx+1]);
    }
    return el;    
  }
  
  protected createTemplateAnchor(attrs:string[]):Node {
    var el = DOM.createElement('template'); 
    for (var attrIdx = 0; attrIdx<attrs.length; attrIdx+=2) {
      DOM.setAttribute(el, attrs[attrIdx], attrs[attrIdx+1]);
    }
    return el;
  }
  
  protected createShadowRoot(host:Node):Node {
    return DOM.createShadowRoot(host);
  }
  
  protected mergeElement(existing:Node, attrs:string[]) {
    DOM.clearNodes(existing);
    for (var attrIdx = 0; attrIdx<attrs.length; attrIdx+=2) {
      DOM.setAttribute(existing, attrs[attrIdx], attrs[attrIdx+1]);
    }
  }
  
  protected createText(value:string): Node {
    return DOM.createTextNode(value);
  }
  
  protected appendChild(parent:Node, child:Node) {
    DOM.appendChild(parent, child);
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
