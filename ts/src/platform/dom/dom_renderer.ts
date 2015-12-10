import {Inject, Injectable, OpaqueToken} from 'angular2/src/core/di';
import {AnimationBuilder} from 'angular2/src/animate/animation_builder';
import {
  isPresent,
  isBlank,
  Json,
  RegExpWrapper,
  CONST_EXPR,
  stringify,
  StringWrapper
} from 'angular2/src/facade/lang';

import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {DomSharedStylesHost} from './shared_styles_host';
import {WtfScopeFn, wtfLeave, wtfCreateScope} from 'angular2/src/core/profile/profile';

import {
  Renderer,
  RenderProtoViewRef,
  RenderViewRef,
  RenderElementRef,
  RenderFragmentRef,
  RenderViewWithFragments,
  RenderTemplateCmd,
  RenderEventDispatcher,
  RenderComponentTemplate
} from 'angular2/core';

import {EventManager} from './events/event_manager';

import {DOCUMENT} from './dom_tokens';
import {
  createRenderView,
  NodeFactory,
  encapsulateStyles
} from 'angular2/src/core/render/view_factory';
import {
  DefaultRenderView,
  DefaultRenderFragmentRef,
  DefaultProtoViewRef
} from 'angular2/src/core/render/view';
import {ViewEncapsulation} from 'angular2/src/core/metadata';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {camelCaseToDashCase} from './util';

const NAMESPACE_URIS =
    CONST_EXPR({'xlink': 'http://www.w3.org/1999/xlink', 'svg': 'http://www.w3.org/2000/svg'});
const TEMPLATE_COMMENT_TEXT = 'template bindings={}';
var TEMPLATE_BINDINGS_EXP = /^template bindings=(.*)$/g;

export abstract class DomRenderer extends Renderer implements NodeFactory<Node> {
  abstract registerComponentTemplate(template: RenderComponentTemplate);

  abstract resolveComponentTemplate(templateId: string): RenderComponentTemplate;

  abstract createProtoView(componentTemplateId: string,
                           cmds: RenderTemplateCmd[]): RenderProtoViewRef;

  abstract createRootHostView(hostProtoViewRef: RenderProtoViewRef, fragmentCount: number,
                              hostElementSelector: string): RenderViewWithFragments;

  abstract createView(protoViewRef: RenderProtoViewRef,
                      fragmentCount: number): RenderViewWithFragments;

  abstract destroyView(viewRef: RenderViewRef);

  abstract createRootContentInsertionPoint();

  getNativeElementSync(location: RenderElementRef): any {
    return resolveInternalDomView(location.renderView).boundElements[location.boundElementIndex];
  }

  getRootNodes(fragment: RenderFragmentRef): Node[] { return resolveInternalDomFragment(fragment); }

  attachFragmentAfterFragment(previousFragmentRef: RenderFragmentRef,
                              fragmentRef: RenderFragmentRef) {
    var previousFragmentNodes = resolveInternalDomFragment(previousFragmentRef);
    if (previousFragmentNodes.length > 0) {
      var sibling = previousFragmentNodes[previousFragmentNodes.length - 1];
      let nodes = resolveInternalDomFragment(fragmentRef);
      moveNodesAfterSibling(sibling, nodes);
      this.animateNodesEnter(nodes);
    }
  }

  /**
   * Iterates through all nodes being added to the DOM and animates them if necessary
   * @param nodes
   */
  animateNodesEnter(nodes: Node[]) {
    for (let i = 0; i < nodes.length; i++) this.animateNodeEnter(nodes[i]);
  }

  /**
   * Performs animations if necessary
   * @param node
   */
  abstract animateNodeEnter(node: Node);

  /**
   * If animations are necessary, performs animations then removes the element; otherwise, it just
   * removes the element.
   * @param node
   */
  abstract animateNodeLeave(node: Node);

  attachFragmentAfterElement(elementRef: RenderElementRef, fragmentRef: RenderFragmentRef) {
    var parentView = resolveInternalDomView(elementRef.renderView);
    var element = parentView.boundElements[elementRef.boundElementIndex];
    var nodes = resolveInternalDomFragment(fragmentRef);
    moveNodesAfterSibling(element, nodes);
    this.animateNodesEnter(nodes);
  }

  abstract detachFragment(fragmentRef: RenderFragmentRef);

  hydrateView(viewRef: RenderViewRef) { resolveInternalDomView(viewRef).hydrate(); }

  dehydrateView(viewRef: RenderViewRef) { resolveInternalDomView(viewRef).dehydrate(); }

  createTemplateAnchor(attrNameAndValues: string[]): Node {
    return DOM.createComment(TEMPLATE_COMMENT_TEXT);
  }
  abstract createElement(name: string, attrNameAndValues: string[]): Node;
  abstract mergeElement(existing: Node, attrNameAndValues: string[]);
  abstract createShadowRoot(host: Node, templateId: string): Node;
  createText(value: string): Node { return DOM.createTextNode(isPresent(value) ? value : ''); }
  appendChild(parent: Node, child: Node) { DOM.appendChild(parent, child); }
  abstract on(element: Node, eventName: string, callback: Function);
  abstract globalOn(target: string, eventName: string, callback: Function): Function;

  setElementProperty(location: RenderElementRef, propertyName: string, propertyValue: any): void {
    var view = resolveInternalDomView(location.renderView);
    DOM.setProperty(<Element>view.boundElements[location.boundElementIndex], propertyName,
                    propertyValue);
  }

  setElementAttribute(location: RenderElementRef, attributeName: string,
                      attributeValue: string): void {
    var view = resolveInternalDomView(location.renderView);
    var element = view.boundElements[location.boundElementIndex];
    if (isPresent(attributeValue)) {
      DOM.setAttribute(element, attributeName, stringify(attributeValue));
    } else {
      DOM.removeAttribute(element, attributeName);
    }
  }

  /**
   * Used only in debug mode to serialize property changes to comment nodes,
   * such as <template> placeholders.
   */
  setBindingDebugInfo(location: RenderElementRef, propertyName: string,
                      propertyValue: string): void {
    var view: DefaultRenderView<Node> = resolveInternalDomView(location.renderView);
    var element = view.boundElements[location.boundElementIndex];
    var dashCasedPropertyName = camelCaseToDashCase(propertyName);
    if (DOM.isCommentNode(element)) {
      var existingBindings = RegExpWrapper.firstMatch(
          TEMPLATE_BINDINGS_EXP, StringWrapper.replaceAll(DOM.getText(element), /\n/g, ''));
      var parsedBindings = Json.parse(existingBindings[1]);
      parsedBindings[dashCasedPropertyName] = propertyValue;
      DOM.setText(element, StringWrapper.replace(TEMPLATE_COMMENT_TEXT, '{}',
                                                 Json.stringify(parsedBindings)));
    } else {
      this.setElementAttribute(location, propertyName, propertyValue);
    }
  }

  setElementClass(location: RenderElementRef, className: string, isAdd: boolean): void {
    var view = resolveInternalDomView(location.renderView);
    var element = view.boundElements[location.boundElementIndex];
    if (isAdd) {
      DOM.addClass(element, className);
    } else {
      DOM.removeClass(element, className);
    }
  }

  setElementStyle(location: RenderElementRef, styleName: string, styleValue: string): void {
    var view = resolveInternalDomView(location.renderView);
    var element = view.boundElements[location.boundElementIndex];
    if (isPresent(styleValue)) {
      DOM.setStyle(element, styleName, stringify(styleValue));
    } else {
      DOM.removeStyle(element, styleName);
    }
  }

  invokeElementMethod(location: RenderElementRef, methodName: string, args: any[]): void {
    var view = resolveInternalDomView(location.renderView);
    var element = <Element>view.boundElements[location.boundElementIndex];
    DOM.invoke(element, methodName, args);
  }

  setText(viewRef: RenderViewRef, textNodeIndex: number, text: string): void {
    var view = resolveInternalDomView(viewRef);
    DOM.setText(view.boundTextNodes[textNodeIndex], text);
  }

  setEventDispatcher(viewRef: RenderViewRef, dispatcher: RenderEventDispatcher): void {
    resolveInternalDomView(viewRef).setEventDispatcher(dispatcher);
  }
}

@Injectable()
export class DomRenderer_ extends DomRenderer {
  private _componentTpls: Map<string, RenderComponentTemplate> =
      new Map<string, RenderComponentTemplate>();
  private _document;

  constructor(private _eventManager: EventManager,
              private _domSharedStylesHost: DomSharedStylesHost, private _animate: AnimationBuilder,
              @Inject(DOCUMENT) document) {
    super();
    this._document = document;
  }

  registerComponentTemplate(template: RenderComponentTemplate) {
    this._componentTpls.set(template.id, template);
    if (template.encapsulation !== ViewEncapsulation.Native) {
      var encapsulatedStyles = encapsulateStyles(template);
      this._domSharedStylesHost.addStyles(encapsulatedStyles);
    }
  }

  createProtoView(componentTemplateId: string, cmds: RenderTemplateCmd[]): RenderProtoViewRef {
    return new DefaultProtoViewRef(this._componentTpls.get(componentTemplateId), cmds);
  }

  resolveComponentTemplate(templateId: string): RenderComponentTemplate {
    return this._componentTpls.get(templateId);
  }

  /** @internal */
  _createRootHostViewScope: WtfScopeFn = wtfCreateScope('DomRenderer#createRootHostView()');
  createRootHostView(hostProtoViewRef: RenderProtoViewRef, fragmentCount: number,
                     hostElementSelector: string): RenderViewWithFragments {
    var s = this._createRootHostViewScope();
    var element = DOM.querySelector(this._document, hostElementSelector);
    if (isBlank(element)) {
      wtfLeave(s);
      throw new BaseException(`The selector "${hostElementSelector}" did not match any elements`);
    }
    return wtfLeave(s, this._createView(hostProtoViewRef, element));
  }

  /** @internal */
  _createViewScope = wtfCreateScope('DomRenderer#createView()');
  createView(protoViewRef: RenderProtoViewRef, fragmentCount: number): RenderViewWithFragments {
    var s = this._createViewScope();
    return wtfLeave(s, this._createView(protoViewRef, null));
  }

  private _createView(protoViewRef: RenderProtoViewRef,
                      inplaceElement: HTMLElement): RenderViewWithFragments {
    var dpvr = <DefaultProtoViewRef>protoViewRef;
    var view = createRenderView(dpvr.template, dpvr.cmds, inplaceElement, this);
    var sdRoots = view.nativeShadowRoots;
    for (var i = 0; i < sdRoots.length; i++) {
      this._domSharedStylesHost.addHost(sdRoots[i]);
    }
    return new RenderViewWithFragments(view, view.fragments);
  }

  destroyView(viewRef: RenderViewRef) {
    var view = <DefaultRenderView<Node>>viewRef;
    var sdRoots = view.nativeShadowRoots;
    for (var i = 0; i < sdRoots.length; i++) {
      this._domSharedStylesHost.removeHost(sdRoots[i]);
    }
  }

  animateNodeEnter(node: Node) {
    if (DOM.isElementNode(node) && DOM.hasClass(node, 'ng-animate')) {
      DOM.addClass(node, 'ng-enter');
      this._animate.css()
          .addAnimationClass('ng-enter-active')
          .start(<HTMLElement>node)
          .onComplete(() => { DOM.removeClass(node, 'ng-enter'); });
    }
  }

  animateNodeLeave(node: Node) {
    if (DOM.isElementNode(node) && DOM.hasClass(node, 'ng-animate')) {
      DOM.addClass(node, 'ng-leave');
      this._animate.css()
          .addAnimationClass('ng-leave-active')
          .start(<HTMLElement>node)
          .onComplete(() => {
            DOM.removeClass(node, 'ng-leave');
            DOM.remove(node);
          });
    } else {
      DOM.remove(node);
    }
  }

  /** @internal */
  _detachFragmentScope = wtfCreateScope('DomRenderer#detachFragment()');
  detachFragment(fragmentRef: RenderFragmentRef) {
    var s = this._detachFragmentScope();
    var fragmentNodes = resolveInternalDomFragment(fragmentRef);
    for (var i = 0; i < fragmentNodes.length; i++) {
      this.animateNodeLeave(fragmentNodes[i]);
    }
    wtfLeave(s);
  }
  createElement(name: string, attrNameAndValues: string[]): Node {
    var nsAndName = splitNamespace(name);
    var el = isPresent(nsAndName[0]) ?
                 DOM.createElementNS(NAMESPACE_URIS[nsAndName[0]], nsAndName[1]) :
                 DOM.createElement(nsAndName[1]);
    this._setAttributes(el, attrNameAndValues);
    return el;
  }
  mergeElement(existing: Node, attrNameAndValues: string[]) {
    DOM.clearNodes(existing);
    this._setAttributes(existing, attrNameAndValues);
  }
  private _setAttributes(node: Node, attrNameAndValues: string[]) {
    for (var attrIdx = 0; attrIdx < attrNameAndValues.length; attrIdx += 2) {
      var attrNs;
      var attrName = attrNameAndValues[attrIdx];
      var nsAndName = splitNamespace(attrName);
      if (isPresent(nsAndName[0])) {
        attrName = nsAndName[0] + ':' + nsAndName[1];
        attrNs = NAMESPACE_URIS[nsAndName[0]];
      }
      var attrValue = attrNameAndValues[attrIdx + 1];
      if (isPresent(attrNs)) {
        DOM.setAttributeNS(node, attrNs, attrName, attrValue);
      } else {
        DOM.setAttribute(node, nsAndName[1], attrValue);
      }
    }
  }
  createRootContentInsertionPoint(): Node {
    return DOM.createComment('root-content-insertion-point');
  }
  createShadowRoot(host: Node, templateId: string): Node {
    var sr = DOM.createShadowRoot(host);
    var tpl = this._componentTpls.get(templateId);
    for (var i = 0; i < tpl.styles.length; i++) {
      DOM.appendChild(sr, DOM.createStyleElement(tpl.styles[i]));
    }
    return sr;
  }
  on(element: Node, eventName: string, callback: Function) {
    this._eventManager.addEventListener(<HTMLElement>element, eventName,
                                        decoratePreventDefault(callback));
  }
  globalOn(target: string, eventName: string, callback: Function): Function {
    return this._eventManager.addGlobalEventListener(target, eventName,
                                                     decoratePreventDefault(callback));
  }
}

function resolveInternalDomView(viewRef: RenderViewRef): DefaultRenderView<Node> {
  return <DefaultRenderView<Node>>viewRef;
}

function resolveInternalDomFragment(fragmentRef: RenderFragmentRef): Node[] {
  return (<DefaultRenderFragmentRef<Node>>fragmentRef).nodes;
}

function moveNodesAfterSibling(sibling, nodes) {
  var parent = DOM.parentElement(sibling);
  if (nodes.length > 0 && isPresent(parent)) {
    var nextSibling = DOM.nextSibling(sibling);
    if (isPresent(nextSibling)) {
      for (var i = 0; i < nodes.length; i++) {
        DOM.insertBefore(nextSibling, nodes[i]);
      }
    } else {
      for (var i = 0; i < nodes.length; i++) {
        DOM.appendChild(parent, nodes[i]);
      }
    }
  }
}

function decoratePreventDefault(eventHandler: Function): Function {
  return (event) => {
    var allowDefaultBehavior = eventHandler(event);
    if (!allowDefaultBehavior) {
      // TODO(tbosch): move preventDefault into event plugins...
      DOM.preventDefault(event);
    }
  };
}

var NS_PREFIX_RE = /^@([^:]+):(.+)/g;

function splitNamespace(name: string): string[] {
  if (name[0] != '@') {
    return [null, name];
  }
  let match = RegExpWrapper.firstMatch(NS_PREFIX_RE, name);
  return [match[1], match[2]];
}
