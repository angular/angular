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

import {TemplateCloner} from './template_cloner';

import {DOCUMENT, DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES} from './dom_tokens';

const REFLECT_PREFIX: string = 'ng-reflect-';


@Injectable()
export class DomRenderer extends Renderer {
  _document;
  _reflectPropertiesAsAttributes: boolean;

  constructor(private _eventManager: EventManager,
              private _domSharedStylesHost: DomSharedStylesHost,
              private _templateCloner: TemplateCloner, @Inject(DOCUMENT) document,
              @Inject(DOM_REFLECT_PROPERTIES_AS_ATTRIBUTES) reflectPropertiesAsAttributes:
                  boolean) {
    super();
    this._reflectPropertiesAsAttributes = reflectPropertiesAsAttributes;
    this._document = document;
  }
  
  _scope_createProtoView: WtfScopeFn = wtfCreateScope('DomRenderer#createProtoView()');
  createProtoView(fragments:RenderTemplateCmd[][]):RenderProtoViewRef {
    var s = this._scope_createRootHostView();    
    return wtfLeave(s, new DomProtoViewRef(fragments));
  }

  _scope_createRootHostView: WtfScopeFn = wtfCreateScope('DomRenderer#createRootHostView()');
  createRootHostView(hostProtoViewRef: RenderProtoViewRef, fragmentCount: number,
                     hostElementSelector: string): RenderViewWithFragments {
    var s = this._scope_createRootHostView();
    var fragments = resolveInternalDomProtoView(hostProtoViewRef);
    var element = DOM.querySelector(this._document, hostElementSelector);
    if (isBlank(element)) {
      wtfLeave(s);
      throw new BaseException(`The selector "${hostElementSelector}" did not match any elements`);
    }
    return wtfLeave(s, this._createView(fragments, element));
  }

  _scope_createView = wtfCreateScope('DomRenderer#createView()');
  createView(protoViewRef: RenderProtoViewRef, fragmentCount: number): RenderViewWithFragments {
    var s = this._scope_createView();
    var fragments = resolveInternalDomProtoView(protoViewRef);
    return wtfLeave(s, this._createView(fragments, null));
  }

  destroyView(viewRef: RenderViewRef) {
    var view = resolveInternalDomView(viewRef);
    // TODO
    // var elementBinders = view.proto.elementBinders;
    // for (var i = 0; i < elementBinders.length; i++) {
    //   var binder = elementBinders[i];
    //   if (binder.hasNativeShadowRoot) {
    //     this._domSharedStylesHost.removeHost(DOM.getShadowRoot(view.boundElements[i]));
    //   }
    // }
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

  _createView(fragmentsCmds: RenderTemplateCmd[][], inplaceElement: HTMLElement): RenderViewWithFragments {
    var context = new ViewCreateContext(fragmentsCmds);
    createFragments(context, null, inplaceElement);
    var embeddedFragments = [];
    for (var i=0; i<context.embeddedFragments.length; i++) {
      embeddedFragments.push(new DomFragmentRef(context.embeddedFragments[i]));
    }
    return new RenderViewWithFragments(new DomViewRef(new DomView(null, flattenArr(context.boundTextNodes), flattenArr(context.boundElements))), embeddedFragments);
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

function createFragments(context:ViewCreateContext, parentComponent:Component, inplaceElement:Element) {
    var parent:Element | Node | Component = null; // can be a ShadowRoot as well...
    var fragmentRootNodes = [];
    if (isBlank(parentComponent) || context.embeddedFragments.length === 0) {
      context.embeddedFragments.push(fragmentRootNodes);      
    }
    if (isPresent(parentComponent)) {
      parent = parentComponent.childrenRoot;      
    }
    var parentStack:List<Element | Node | Component> = [];
    var boundElements = [];
    var boundTextNodes = [];
    context.boundElements.push(boundElements);
    context.boundTextNodes.push(boundTextNodes);
    var fragmentCmds = context.shiftFragmentCmds();
    for (var cmdIdx=0; cmdIdx<fragmentCmds.length; cmdIdx++) {
      var cmd = fragmentCmds[cmdIdx];
      switch (cmd.type) {
        case RenderTemplateCmdType.BEGIN_COMPONENT:
        case RenderTemplateCmdType.BEGIN_BASIC_ELEMENT: {
          var bec = <RenderBeginElementCmd> cmd;
          var el:Element;
          if (isPresent(inplaceElement)) {
            el = mergeElement(fragmentRootNodes, inplaceElement, bec.attrs);
            inplaceElement = null;
          } else {
            el = createElement(parent, fragmentRootNodes, bec.name, bec.attrs, bec.ngContentId);                          
          }
          if (bec.isBound) {
            boundElements.push(el);
          }
          parentStack.push(parent);
          if (cmd.type === RenderTemplateCmdType.BEGIN_COMPONENT) {
            var root = el;
            if ((<RenderBeginComponentCmd>cmd).nativeShadow) {
              root = DOM.createShadowRoot(el);
            }
            parent = new Component(root);
          } else {
            parent = el;              
          }
          // TODO: events!
          break;
        }
        case RenderTemplateCmdType.END_COMPONENT: {
          var c = <Component> parent;
          createFragments(context, c, null);
          parent = parentStack.pop();
          break;
        }
        case RenderTemplateCmdType.END_BASIC_ELEMENT: {
          parent = parentStack.pop();
          break;
        } 
        case RenderTemplateCmdType.TEMPLATE_ANCHOR: {
          var bec = <RenderBeginElementCmd> cmd;
          var el = createElement(parent, fragmentRootNodes, bec.name, bec.attrs, bec.ngContentId);              
          if (bec.isBound) {
            boundElements.push(el);
          }
          createFragments(context, null, null);
          break;
        }
        case RenderTemplateCmdType.NG_CONTENT: {
          var nct = <RenderNgContentCmd> cmd;
          var id = nct.id;
          parentComponent.project(nct.id, parent, fragmentRootNodes);
        }
        case RenderTemplateCmdType.TEXT: {
          var ttc = <RenderTextCmd> cmd;
          var text = createText(parent, fragmentRootNodes, ttc.value, ttc.ngContentId);
          if (ttc.isBound) {
            boundTextNodes.push(text);
          }
          break;
        }
      }
    }
    return fragmentRootNodes;
}

class ViewCreateContext {
  fragmentIndex:number = 0;
  boundElements:Element[][] = [];
  boundTextNodes:Node[][] = [];
  embeddedFragments:Node[][] = [];
  
  constructor(public fragmentCmds:RenderTemplateCmd[][]) {}
  
  shiftFragmentCmds():RenderTemplateCmd[] {
    return this.fragmentCmds[this.fragmentIndex++];
  }
}

class Component {
  constructor(public childrenRoot:Element | Node) {}
  addLightDom(ngContentId:string, node: Node) {
    // TODO
  }
  project(ngContentId: string, parent: Node | Component, fragmentRootNodes: Node[]) {
    // TODO
  }
}

function createElement(parent:Node | Component, fragmentRootNodes: Node[], name: string, attrs: string[], ngContentId: string):Element {
  var el = DOM.createElement(name);
  for (var attrIdx = 0; attrIdx<attrs.length; attrIdx+=2) {
    DOM.setAttribute(el, attrs[attrIdx], attrs[attrIdx+1]);
  }
  addChild(parent, fragmentRootNodes, el, ngContentId);
  return el;
}

function mergeElement(fragmentRootNodes:Node[], el:Element, attrs: string[]):Element {
  for (var attrIdx = 0; attrIdx<attrs.length; attrIdx+=2) {
    DOM.setAttribute(el, attrs[attrIdx], attrs[attrIdx+1]);
  }
  fragmentRootNodes.push(el);
  return el;
}

function createText(parent:Node | Component, fragmentRootNodes: Node[], value:string, ngContentId: string):Node {
  var t = DOM.createTextNode(value);
  addChild(parent, fragmentRootNodes, t, ngContentId);
  return t;
}

function addChild(parent:Node | Component, fragmentRootNodes: Node[], node: Node, ngContentId: string) {
  if (isPresent(parent)) {
    if (isPresent(ngContentId)) {
      (<Component>parent).addLightDom(ngContentId, node);
    } else {
      DOM.appendChild(parent, node);          
    }
  } else {
    fragmentRootNodes.push(node);
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

function flattenArr(arr:any[][]):any[] {
  var res = [];
  for (var i=0; i<arr.length; i++) {
    var entry = arr[i];
    for (var j=0; j<entry.length; j++) {
      res.push(entry[j]);
    }
  }
  return res;
}