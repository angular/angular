/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_ID, Inject, Injectable, NgZone, RenderComponentType, Renderer, RootRenderer, ViewEncapsulation} from '@angular/core';
import {AnimationDriver, DOCUMENT} from '@angular/platform-browser';

import {isBlank, isPresent, stringify} from './facade/lang';
import {AnimationKeyframe, AnimationPlayer, AnimationStyles, RenderDebugInfo} from './private_import_core';
import {NAMESPACE_URIS, SharedStylesHost, flattenStyles, getDOM, isNamespaced, shimContentAttribute, shimHostAttribute, splitNamespace} from './private_import_platform-browser';

const TEMPLATE_COMMENT_TEXT = 'template bindings={}';
const TEMPLATE_BINDINGS_EXP = /^template bindings=(.*)$/;

@Injectable()
export class ServerRootRenderer {
  protected registeredComponents: Map<string, ServerRenderer> = new Map<string, ServerRenderer>();
  constructor(
      @Inject(DOCUMENT) public document: any, public sharedStylesHost: SharedStylesHost,
      public animationDriver: AnimationDriver, @Inject(APP_ID) public appId: string,
      private _zone: NgZone) {}
  renderComponent(componentProto: RenderComponentType): Renderer {
    var renderer = this.registeredComponents.get(componentProto.id);
    if (!renderer) {
      renderer = new ServerRenderer(
          this, componentProto, this.animationDriver, `${this.appId}-${componentProto.id}`,
          this._zone);
      this.registeredComponents.set(componentProto.id, renderer);
    }
    return renderer;
  }
}

export class ServerRenderer implements Renderer {
  private _contentAttr: string;
  private _hostAttr: string;
  private _styles: string[];

  constructor(
      private _rootRenderer: ServerRootRenderer, private componentProto: RenderComponentType,
      private _animationDriver: AnimationDriver, styleShimId: string, private _zone: NgZone) {
    this._styles = flattenStyles(styleShimId, componentProto.styles, []);
    if (componentProto.encapsulation === ViewEncapsulation.Native) {
      throw new Error('Native encapsulation is not supported on the server!');
    }
    if (this.componentProto.encapsulation === ViewEncapsulation.Emulated) {
      this._contentAttr = shimContentAttribute(styleShimId);
      this._hostAttr = shimHostAttribute(styleShimId);
    } else {
      this._contentAttr = null;
      this._hostAttr = null;
    }
  }

  selectRootElement(selectorOrNode: string|any, debugInfo: RenderDebugInfo): Element {
    var el: any /** TODO #9100 */;
    if (typeof selectorOrNode === 'string') {
      el = getDOM().querySelector(this._rootRenderer.document, selectorOrNode);
      if (isBlank(el)) {
        throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
      }
    } else {
      el = selectorOrNode;
    }
    getDOM().clearNodes(el);
    return el;
  }

  createElement(parent: Element, name: string, debugInfo: RenderDebugInfo): Node {
    var el: any;
    if (isNamespaced(name)) {
      var nsAndName = splitNamespace(name);
      el = getDOM().createElementNS(NAMESPACE_URIS[nsAndName[0]], nsAndName[1]);
    } else {
      el = getDOM().createElement(name);
    }
    if (isPresent(this._contentAttr)) {
      getDOM().setAttribute(el, this._contentAttr, '');
    }
    if (isPresent(parent)) {
      getDOM().appendChild(parent, el);
    }
    return el;
  }

  createViewRoot(hostElement: any): any {
    var nodesParent: any /** TODO #9100 */;
    if (isPresent(this._hostAttr)) {
      getDOM().setAttribute(hostElement, this._hostAttr, '');
    }
    nodesParent = hostElement;
    return nodesParent;
  }

  createTemplateAnchor(parentElement: any, debugInfo: RenderDebugInfo): any {
    var comment = getDOM().createComment(TEMPLATE_COMMENT_TEXT);
    if (isPresent(parentElement)) {
      getDOM().appendChild(parentElement, comment);
    }
    return comment;
  }

  createText(parentElement: any, value: string, debugInfo: RenderDebugInfo): any {
    var node = getDOM().createTextNode(value);
    if (isPresent(parentElement)) {
      getDOM().appendChild(parentElement, node);
    }
    return node;
  }

  projectNodes(parentElement: any, nodes: any[]) {
    if (isBlank(parentElement)) return;
    appendNodes(parentElement, nodes);
  }

  attachViewAfter(node: any, viewRootNodes: any[]) { moveNodesAfterSibling(node, viewRootNodes); }

  detachView(viewRootNodes: any[]) {
    for (var i = 0; i < viewRootNodes.length; i++) {
      getDOM().remove(viewRootNodes[i]);
    }
  }

  destroyView(hostElement: any, viewAllNodes: any[]) {}

  listen(renderElement: any, name: string, callback: Function): Function {
    // Note: We are not using the EventsPlugin here as this is not needed
    // to run our tests.
    var outsideHandler = (event: any) => this._zone.runGuarded(() => callback(event));
    return this._zone.runOutsideAngular(
        () => getDOM().onAndCancel(renderElement, name, outsideHandler));
  }

  listenGlobal(target: string, name: string, callback: Function): Function {
    var renderElement = getDOM().getGlobalEventTarget(target);
    return this.listen(renderElement, name, callback);
  }

  setElementProperty(renderElement: any, propertyName: string, propertyValue: any): void {
    getDOM().setProperty(renderElement, propertyName, propertyValue);
  }

  setElementAttribute(renderElement: any, attributeName: string, attributeValue: string): void {
    let attrNs: string;
    let attrNameWithoutNs = attributeName;
    if (isNamespaced(attributeName)) {
      const nsAndName = splitNamespace(attributeName);
      attrNameWithoutNs = nsAndName[1];
      attributeName = nsAndName[0] + ':' + nsAndName[1];
      attrNs = NAMESPACE_URIS[nsAndName[0]];
    }
    if (isPresent(attributeValue)) {
      if (isPresent(attrNs)) {
        getDOM().setAttributeNS(renderElement, attrNs, attributeName, attributeValue);
      } else {
        getDOM().setAttribute(renderElement, attributeName, attributeValue);
      }
    } else {
      if (isPresent(attrNs)) {
        getDOM().removeAttributeNS(renderElement, attrNs, attrNameWithoutNs);
      } else {
        getDOM().removeAttribute(renderElement, attributeName);
      }
    }
  }

  setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string): void {
    if (getDOM().isCommentNode(renderElement)) {
      const existingBindings =
          getDOM().getText(renderElement).replace(/\n/g, '').match(TEMPLATE_BINDINGS_EXP);
      var parsedBindings = JSON.parse(existingBindings[1]);
      (parsedBindings as any /** TODO #9100 */)[propertyName] = propertyValue;
      getDOM().setText(
          renderElement,
          TEMPLATE_COMMENT_TEXT.replace('{}', JSON.stringify(parsedBindings, null, 2)));
    } else {
      this.setElementAttribute(renderElement, propertyName, propertyValue);
    }
  }

  setElementClass(renderElement: any, className: string, isAdd: boolean): void {
    if (isAdd) {
      getDOM().addClass(renderElement, className);
    } else {
      getDOM().removeClass(renderElement, className);
    }
  }

  setElementStyle(renderElement: any, styleName: string, styleValue: string): void {
    if (isPresent(styleValue)) {
      getDOM().setStyle(renderElement, styleName, stringify(styleValue));
    } else {
      getDOM().removeStyle(renderElement, styleName);
    }
  }

  invokeElementMethod(renderElement: any, methodName: string, args: any[]): void {
    getDOM().invoke(renderElement, methodName, args);
  }

  setText(renderNode: any, text: string): void { getDOM().setText(renderNode, text); }

  animate(
      element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[],
      duration: number, delay: number, easing: string): AnimationPlayer {
    return this._animationDriver.animate(
        element, startingStyles, keyframes, duration, delay, easing);
  }
}

function moveNodesAfterSibling(sibling: any /** TODO #9100 */, nodes: any /** TODO #9100 */) {
  var parent = getDOM().parentElement(sibling);
  if (nodes.length > 0 && isPresent(parent)) {
    var nextSibling = getDOM().nextSibling(sibling);
    if (isPresent(nextSibling)) {
      for (var i = 0; i < nodes.length; i++) {
        getDOM().insertBefore(nextSibling, nodes[i]);
      }
    } else {
      for (var i = 0; i < nodes.length; i++) {
        getDOM().appendChild(parent, nodes[i]);
      }
    }
  }
}

function appendNodes(parent: any /** TODO #9100 */, nodes: any /** TODO #9100 */) {
  for (var i = 0; i < nodes.length; i++) {
    getDOM().appendChild(parent, nodes[i]);
  }
}

function decoratePreventDefault(eventHandler: Function): Function {
  return (event: any /** TODO #9100 */) => {
    var allowDefaultBehavior = eventHandler(event);
    if (allowDefaultBehavior === false) {
      // TODO(tbosch): move preventDefault into event plugins...
      getDOM().preventDefault(event);
    }
  };
}
