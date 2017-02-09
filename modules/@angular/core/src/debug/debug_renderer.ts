/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationKeyframe} from '../animation/animation_keyframe';
import {AnimationPlayer} from '../animation/animation_player';
import {AnimationStyles} from '../animation/animation_styles';
import {isPresent} from '../facade/lang';
import {RenderComponentType, RenderDebugInfo, Renderer, RendererV2, RootRenderer} from '../render/api';

import {DebugElement, DebugNode, EventListener, getDebugNode, indexDebugNode, removeDebugNodeFromIndex} from './debug_node';

export class DebugDomRootRenderer implements RootRenderer {
  constructor(private _delegate: RootRenderer) {}

  renderComponent(componentProto: RenderComponentType): Renderer {
    return new DebugDomRenderer(this._delegate.renderComponent(componentProto));
  }
}

export class DebugDomRenderer implements Renderer {
  constructor(private _delegate: Renderer) {}

  selectRootElement(selectorOrNode: string|any, debugInfo?: RenderDebugInfo): any {
    const nativeEl = this._delegate.selectRootElement(selectorOrNode, debugInfo);
    const debugEl = new DebugElement(nativeEl, null, debugInfo);
    indexDebugNode(debugEl);
    return nativeEl;
  }

  createElement(parentElement: any, name: string, debugInfo?: RenderDebugInfo): any {
    const nativeEl = this._delegate.createElement(parentElement, name, debugInfo);
    const debugEl = new DebugElement(nativeEl, getDebugNode(parentElement), debugInfo);
    debugEl.name = name;
    indexDebugNode(debugEl);
    return nativeEl;
  }

  createViewRoot(hostElement: any): any { return this._delegate.createViewRoot(hostElement); }

  createTemplateAnchor(parentElement: any, debugInfo?: RenderDebugInfo): any {
    const comment = this._delegate.createTemplateAnchor(parentElement, debugInfo);
    const debugEl = new DebugNode(comment, getDebugNode(parentElement), debugInfo);
    indexDebugNode(debugEl);
    return comment;
  }

  createText(parentElement: any, value: string, debugInfo?: RenderDebugInfo): any {
    const text = this._delegate.createText(parentElement, value, debugInfo);
    const debugEl = new DebugNode(text, getDebugNode(parentElement), debugInfo);
    indexDebugNode(debugEl);
    return text;
  }

  projectNodes(parentElement: any, nodes: any[]) {
    const debugParent = getDebugNode(parentElement);
    if (isPresent(debugParent) && debugParent instanceof DebugElement) {
      const debugElement = debugParent;
      nodes.forEach((node) => { debugElement.addChild(getDebugNode(node)); });
    }
    this._delegate.projectNodes(parentElement, nodes);
  }

  attachViewAfter(node: any, viewRootNodes: any[]) {
    const debugNode = getDebugNode(node);
    if (isPresent(debugNode)) {
      const debugParent = debugNode.parent;
      if (viewRootNodes.length > 0 && isPresent(debugParent)) {
        const debugViewRootNodes: DebugNode[] = [];
        viewRootNodes.forEach((rootNode) => debugViewRootNodes.push(getDebugNode(rootNode)));
        debugParent.insertChildrenAfter(debugNode, debugViewRootNodes);
      }
    }
    this._delegate.attachViewAfter(node, viewRootNodes);
  }

  detachView(viewRootNodes: any[]) {
    viewRootNodes.forEach((node) => {
      const debugNode = getDebugNode(node);
      if (debugNode && debugNode.parent) {
        debugNode.parent.removeChild(debugNode);
      }
    });
    this._delegate.detachView(viewRootNodes);
  }

  destroyView(hostElement: any, viewAllNodes: any[]) {
    viewAllNodes = viewAllNodes || [];
    viewAllNodes.forEach((node) => { removeDebugNodeFromIndex(getDebugNode(node)); });
    this._delegate.destroyView(hostElement, viewAllNodes);
  }

  listen(renderElement: any, name: string, callback: Function): Function {
    const debugEl = getDebugNode(renderElement);
    if (isPresent(debugEl)) {
      debugEl.listeners.push(new EventListener(name, callback));
    }
    return this._delegate.listen(renderElement, name, callback);
  }

  listenGlobal(target: string, name: string, callback: Function): Function {
    return this._delegate.listenGlobal(target, name, callback);
  }

  setElementProperty(renderElement: any, propertyName: string, propertyValue: any) {
    const debugEl = getDebugNode(renderElement);
    if (isPresent(debugEl) && debugEl instanceof DebugElement) {
      debugEl.properties[propertyName] = propertyValue;
    }
    this._delegate.setElementProperty(renderElement, propertyName, propertyValue);
  }

  setElementAttribute(renderElement: any, attributeName: string, attributeValue: string) {
    const debugEl = getDebugNode(renderElement);
    if (isPresent(debugEl) && debugEl instanceof DebugElement) {
      debugEl.attributes[attributeName] = attributeValue;
    }
    this._delegate.setElementAttribute(renderElement, attributeName, attributeValue);
  }

  setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string) {
    this._delegate.setBindingDebugInfo(renderElement, propertyName, propertyValue);
  }

  setElementClass(renderElement: any, className: string, isAdd: boolean) {
    const debugEl = getDebugNode(renderElement);
    if (isPresent(debugEl) && debugEl instanceof DebugElement) {
      debugEl.classes[className] = isAdd;
    }
    this._delegate.setElementClass(renderElement, className, isAdd);
  }

  setElementStyle(renderElement: any, styleName: string, styleValue: string) {
    const debugEl = getDebugNode(renderElement);
    if (isPresent(debugEl) && debugEl instanceof DebugElement) {
      debugEl.styles[styleName] = styleValue;
    }
    this._delegate.setElementStyle(renderElement, styleName, styleValue);
  }

  invokeElementMethod(renderElement: any, methodName: string, args?: any[]) {
    this._delegate.invokeElementMethod(renderElement, methodName, args);
  }

  setText(renderNode: any, text: string) { this._delegate.setText(renderNode, text); }

  animate(
      element: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[],
      duration: number, delay: number, easing: string,
      previousPlayers: AnimationPlayer[] = []): AnimationPlayer {
    return this._delegate.animate(
        element, startingStyles, keyframes, duration, delay, easing, previousPlayers);
  }
}

export class DebugDomRendererV2 implements RendererV2 {
  constructor(private _delegate: RendererV2) {}

  createElement(name: string, namespace?: string, debugInfo?: any): any {
    const el = this._delegate.createElement(name, namespace, debugInfo);
    const debugEl = new DebugElement(el, null, debugInfo);
    debugEl.name = name;
    indexDebugNode(debugEl);
    return el;
  }

  createComment(value: string, debugInfo?: any): any {
    const comment = this._delegate.createComment(value, debugInfo);
    const debugEl = new DebugNode(comment, null, debugInfo);
    indexDebugNode(debugEl);
    return comment;
  }

  createText(value: string, debugInfo?: any): any {
    const text = this._delegate.createText(value, debugInfo);
    const debugEl = new DebugNode(text, null, debugInfo);
    indexDebugNode(debugEl);
    return text;
  }

  appendChild(parent: any, newChild: any): void {
    const debugEl = getDebugNode(parent);
    const debugChildEl = getDebugNode(newChild);
    if (debugEl && debugChildEl && debugEl instanceof DebugElement) {
      debugEl.addChild(debugChildEl);
    }
    this._delegate.appendChild(parent, newChild);
  }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    const debugEl = getDebugNode(parent);
    const debugChildEl = getDebugNode(newChild);
    const debugRefEl = getDebugNode(refChild);
    if (debugEl && debugChildEl && debugEl instanceof DebugElement) {
      debugEl.insertBefore(debugRefEl, debugChildEl);
    }

    this._delegate.insertBefore(parent, newChild, refChild);
  }

  removeChild(parent: any, oldChild: any): void {
    const debugEl = getDebugNode(parent);
    const debugChildEl = getDebugNode(oldChild);
    if (debugEl && debugChildEl && debugEl instanceof DebugElement) {
      debugEl.removeChild(debugChildEl);
    }
    this._delegate.removeChild(parent, oldChild);
  }

  selectRootElement(selectorOrNode: string|any, debugInfo?: any): any {
    const el = this._delegate.selectRootElement(selectorOrNode, debugInfo);
    const debugEl = new DebugElement(el, null, debugInfo);
    indexDebugNode(debugEl);
    return el;
  }

  parentNode(node: any): any { return this._delegate.parentNode(node); }

  nextSibling(node: any): any { return this._delegate.nextSibling(node); }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      const fullName = namespace ? namespace + ':' + name : name;
      debugEl.attributes[fullName] = value;
    }
    this._delegate.setAttribute(el, name, value, namespace);
  }

  removeAttribute(el: any, name: string, namespace?: string): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      const fullName = namespace ? namespace + ':' + name : name;
      debugEl.attributes[fullName] = null;
    }
    this._delegate.removeAttribute(el, name, namespace);
  }

  setBindingDebugInfo(el: any, propertyName: string, propertyValue: string): void {
    this._delegate.setBindingDebugInfo(el, propertyName, propertyValue);
  }

  removeBindingDebugInfo(el: any, propertyName: string): void {
    this._delegate.removeBindingDebugInfo(el, propertyName);
  }

  addClass(el: any, name: string): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      debugEl.classes[name] = true;
    }
    this._delegate.addClass(el, name);
  }

  removeClass(el: any, name: string): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      debugEl.classes[name] = false;
    }
    this._delegate.removeClass(el, name);
  }

  setStyle(el: any, style: string, value: any, hasVendorPrefix: boolean, hasImportant: boolean):
      void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      debugEl.styles[style] = value;
    }
    this._delegate.setStyle(el, style, value, hasVendorPrefix, hasImportant);
  }

  removeStyle(el: any, style: string, hasVendorPrefix: boolean): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      debugEl.styles[style] = null;
    }
    this._delegate.removeStyle(el, style, hasVendorPrefix);
  }

  setProperty(el: any, name: string, value: any): void {
    const debugEl = getDebugNode(el);
    if (debugEl && debugEl instanceof DebugElement) {
      debugEl.properties[name] = value;
    }
    this._delegate.setProperty(el, name, value);
  }

  setText(node: any, value: string): void { this._delegate.setText(node, value); }

  listen(
      target: 'document'|'windows'|'body'|any, eventName: string,
      callback: (event: any) => boolean): () => void {
    if (typeof target !== 'string') {
      const debugEl = getDebugNode(target);
      if (debugEl) {
        debugEl.listeners.push(new EventListener(eventName, callback));
      }
    }

    return this._delegate.listen(target, eventName, callback);
  }
}
