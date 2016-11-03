/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_ID, Inject, Injectable, RenderComponentType, Renderer, RootRenderer, ViewEncapsulation} from '@angular/core';

import {isBlank, isPresent, stringify} from '../facade/lang';
import {AnimationKeyframe, AnimationPlayer, AnimationStyles, DirectRenderer, RenderDebugInfo} from '../private_import_core';

import {AnimationDriver} from './animation_driver';
import {DOCUMENT} from './dom_tokens';
import {EventManager} from './events/event_manager';
import {DomSharedStylesHost} from './shared_styles_host';
import {camelCaseToDashCase} from './util';

export const NAMESPACE_URIS: {[ns: string]: string} = {
  'xlink': 'http://www.w3.org/1999/xlink',
  'svg': 'http://www.w3.org/2000/svg',
  'xhtml': 'http://www.w3.org/1999/xhtml'
};
const TEMPLATE_COMMENT_TEXT = 'template bindings={}';
const TEMPLATE_BINDINGS_EXP = /^template bindings=(.*)$/;

export abstract class DomRootRenderer implements RootRenderer {
  protected registeredComponents: Map<string, DomRenderer> = new Map<string, DomRenderer>();

  constructor(
      public document: Document, public eventManager: EventManager,
      public sharedStylesHost: DomSharedStylesHost, public animationDriver: AnimationDriver,
      public appId: string) {}

  renderComponent(componentProto: RenderComponentType): Renderer {
    let renderer = this.registeredComponents.get(componentProto.id);
    if (!renderer) {
      renderer = new DomRenderer(
          this, componentProto, this.animationDriver, `${this.appId}-${componentProto.id}`);
      this.registeredComponents.set(componentProto.id, renderer);
    }
    return renderer;
  }
}

@Injectable()
export class DomRootRenderer_ extends DomRootRenderer {
  constructor(
      @Inject(DOCUMENT) _document: any, _eventManager: EventManager,
      sharedStylesHost: DomSharedStylesHost, animationDriver: AnimationDriver,
      @Inject(APP_ID) appId: string) {
    super(_document, _eventManager, sharedStylesHost, animationDriver, appId);
  }
}

export const DIRECT_DOM_RENDERER: DirectRenderer = {
  remove(node: Text | Comment | Element) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  },
  appendChild(node: Node, parent: Element) { parent.appendChild(node);},
  insertBefore(node: Node, refNode: Node) { refNode.parentNode.insertBefore(node, refNode);},
  nextSibling(node: Node) { return node.nextSibling;},
  parentElement(node: Node): Element{return node.parentNode as Element;}
};

export class DomRenderer implements Renderer {
  private _contentAttr: string;
  private _hostAttr: string;
  private _styles: string[];

  directRenderer: DirectRenderer = DIRECT_DOM_RENDERER;

  constructor(
      private _rootRenderer: DomRootRenderer, private componentProto: RenderComponentType,
      private _animationDriver: AnimationDriver, styleShimId: string) {
    this._styles = flattenStyles(styleShimId, componentProto.styles, []);
    if (componentProto.encapsulation !== ViewEncapsulation.Native) {
      this._rootRenderer.sharedStylesHost.addStyles(this._styles);
    }
    if (this.componentProto.encapsulation === ViewEncapsulation.Emulated) {
      this._contentAttr = shimContentAttribute(styleShimId);
      this._hostAttr = shimHostAttribute(styleShimId);
    } else {
      this._contentAttr = null;
      this._hostAttr = null;
    }
  }

  selectRootElement(selectorOrNode: string|Element, debugInfo: RenderDebugInfo): Element {
    let el: Element;
    if (typeof selectorOrNode === 'string') {
      el = this._rootRenderer.document.querySelector(selectorOrNode);
      if (!el) {
        throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
      }
    } else {
      el = selectorOrNode;
    }
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
    return el;
  }

  createElement(parent: Element|DocumentFragment, name: string, debugInfo: RenderDebugInfo):
      Element {
    let el: Element;
    if (isNamespaced(name)) {
      const nsAndName = splitNamespace(name);
      el = document.createElementNS((NAMESPACE_URIS)[nsAndName[0]], nsAndName[1]);
    } else {
      el = document.createElement(name);
    }
    if (this._contentAttr) {
      el.setAttribute(this._contentAttr, '');
    }
    if (parent) {
      parent.appendChild(el);
    }
    return el;
  }

  createViewRoot(hostElement: Element): Element|DocumentFragment {
    let nodesParent: Element|DocumentFragment;
    if (this.componentProto.encapsulation === ViewEncapsulation.Native) {
      nodesParent = (hostElement as any).createShadowRoot();
      this._rootRenderer.sharedStylesHost.addHost(nodesParent);
      for (let i = 0; i < this._styles.length; i++) {
        const styleEl = document.createElement('style');
        styleEl.textContent = this._styles[i];
        nodesParent.appendChild(styleEl);
      }
    } else {
      if (this._hostAttr) {
        hostElement.setAttribute(this._hostAttr, '');
      }
      nodesParent = hostElement;
    }
    return nodesParent;
  }

  createTemplateAnchor(parentElement: Element|DocumentFragment, debugInfo: RenderDebugInfo):
      Comment {
    const comment = document.createComment(TEMPLATE_COMMENT_TEXT);
    if (parentElement) {
      parentElement.appendChild(comment);
    }
    return comment;
  }

  createText(parentElement: Element|DocumentFragment, value: string, debugInfo: RenderDebugInfo):
      any {
    const node = document.createTextNode(value);
    if (parentElement) {
      parentElement.appendChild(node);
    }
    return node;
  }

  projectNodes(parentElement: Element|DocumentFragment, nodes: Node[]) {
    if (!parentElement) return;
    appendNodes(parentElement, nodes);
  }

  attachViewAfter(node: Node, viewRootNodes: Node[]) { moveNodesAfterSibling(node, viewRootNodes); }

  detachView(viewRootNodes: (Element|Text|Comment)[]) {
    for (let i = 0; i < viewRootNodes.length; i++) {
      const node = viewRootNodes[i];
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
  }

  destroyView(hostElement: Element|DocumentFragment, viewAllNodes: Node[]) {
    if (this.componentProto.encapsulation === ViewEncapsulation.Native && hostElement) {
      this._rootRenderer.sharedStylesHost.removeHost((hostElement as any).shadowRoot);
    }
  }

  listen(renderElement: any, name: string, callback: Function): Function {
    return this._rootRenderer.eventManager.addEventListener(
        renderElement, name, decoratePreventDefault(callback));
  }

  listenGlobal(target: string, name: string, callback: Function): Function {
    return this._rootRenderer.eventManager.addGlobalEventListener(
        target, name, decoratePreventDefault(callback));
  }

  setElementProperty(
      renderElement: Element|DocumentFragment, propertyName: string, propertyValue: any): void {
    (renderElement as any)[propertyName] = propertyValue;
  }

  setElementAttribute(renderElement: Element, attributeName: string, attributeValue: string): void {
    let attrNs: string;
    let attrNameWithoutNs = attributeName;
    if (isNamespaced(attributeName)) {
      const nsAndName = splitNamespace(attributeName);
      attrNameWithoutNs = nsAndName[1];
      attributeName = nsAndName[0] + ':' + nsAndName[1];
      attrNs = NAMESPACE_URIS[nsAndName[0]];
    }
    if (isPresent(attributeValue)) {
      if (attrNs) {
        renderElement.setAttributeNS(attrNs, attributeName, attributeValue);
      } else {
        renderElement.setAttribute(attributeName, attributeValue);
      }
    } else {
      if (isPresent(attrNs)) {
        renderElement.removeAttributeNS(attrNs, attrNameWithoutNs);
      } else {
        renderElement.removeAttribute(attributeName);
      }
    }
  }

  setBindingDebugInfo(renderElement: Element, propertyName: string, propertyValue: string): void {
    if (renderElement.nodeType === Node.COMMENT_NODE) {
      const existingBindings =
          renderElement.nodeValue.replace(/\n/g, '').match(TEMPLATE_BINDINGS_EXP);
      const parsedBindings = JSON.parse(existingBindings[1]);
      parsedBindings[propertyName] = propertyValue;
      renderElement.nodeValue =
          TEMPLATE_COMMENT_TEXT.replace('{}', JSON.stringify(parsedBindings, null, 2));
    } else {
      this.setElementAttribute(renderElement, propertyName, propertyValue);
    }
  }

  setElementClass(renderElement: Element, className: string, isAdd: boolean): void {
    if (isAdd) {
      renderElement.classList.add(className);
    } else {
      renderElement.classList.remove(className);
    }
  }

  setElementStyle(renderElement: HTMLElement, styleName: string, styleValue: string): void {
    if (isPresent(styleValue)) {
      (renderElement.style as any)[styleName] = stringify(styleValue);
    } else {
      // IE requires '' instead of null
      // see https://github.com/angular/angular/issues/7916
      (renderElement.style as any)[styleName] = '';
    }
  }

  invokeElementMethod(renderElement: Element, methodName: string, args: any[]): void {
    (renderElement as any)[methodName].apply(renderElement, args);
  }

  setText(renderNode: Text, text: string): void { renderNode.nodeValue = text; }

  animate(
      element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[],
      duration: number, delay: number, easing: string): AnimationPlayer {
    return this._animationDriver.animate(
        element, startingStyles, keyframes, duration, delay, easing);
  }
}

function moveNodesAfterSibling(sibling: Node, nodes: Node[]) {
  const parent = sibling.parentNode;
  if (nodes.length > 0 && parent) {
    const nextSibling = sibling.nextSibling;
    if (nextSibling) {
      for (let i = 0; i < nodes.length; i++) {
        parent.insertBefore(nodes[i], nextSibling);
      }
    } else {
      for (let i = 0; i < nodes.length; i++) {
        parent.appendChild(nodes[i]);
      }
    }
  }
}

function appendNodes(parent: Element | DocumentFragment, nodes: Node[]) {
  for (let i = 0; i < nodes.length; i++) {
    parent.appendChild(nodes[i]);
  }
}

function decoratePreventDefault(eventHandler: Function): Function {
  return (event: any) => {
    const allowDefaultBehavior = eventHandler(event);
    if (allowDefaultBehavior === false) {
      // TODO(tbosch): move preventDefault into event plugins...
      event.preventDefault();
      event.returnValue = false;
    }
  };
}

const COMPONENT_REGEX = /%COMP%/g;
export const COMPONENT_VARIABLE = '%COMP%';
export const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
export const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;

export function shimContentAttribute(componentShortId: string): string {
  return CONTENT_ATTR.replace(COMPONENT_REGEX, componentShortId);
}

export function shimHostAttribute(componentShortId: string): string {
  return HOST_ATTR.replace(COMPONENT_REGEX, componentShortId);
}

export function flattenStyles(
    compId: string, styles: Array<any|any[]>, target: string[]): string[] {
  for (let i = 0; i < styles.length; i++) {
    let style = styles[i];

    if (Array.isArray(style)) {
      flattenStyles(compId, style, target);
    } else {
      style = style.replace(COMPONENT_REGEX, compId);
      target.push(style);
    }
  }
  return target;
}

const NS_PREFIX_RE = /^:([^:]+):(.+)$/;

export function isNamespaced(name: string) {
  return name[0] === ':';
}

export function splitNamespace(name: string): string[] {
  const match = name.match(NS_PREFIX_RE);
  return [match[1], match[2]];
}
