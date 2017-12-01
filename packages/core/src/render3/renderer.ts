/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The goal here is to make sure that the browser DOM API is the Renderer.
 * We do this by defining a subset of DOM API to be the renderer and than
 * use that time for rendering.
 *
 * At runtime we can than use the DOM api directly, in server or web-worker
 * it will be easy to implement such API.
 */


/**
 * Subset of API needed to create elements and text nodes.
 */
export interface Renderer3 {
  createComment(data: string): RComment;
  createElement(tagName: string): RElement;
  createElementNS(namespaceURI: string|null, qualifiedName: string): RElement;
  createTextNode(data: string): RText;

  querySelector(selectors: string): RElement|null;
}

/**
 * Subset of API needed for appending elements and text nodes.
 */
export interface RNode {
  removeChild(oldChild: RNode): void;

  /**
   * Insert a child node.
   *
   * Used exclusively for adding View root nodes into ViewAnchor location.
   */
  insertBefore(newChild: RNode, refChild: RNode|null, isViewRoot: boolean): void;

  /**
   * Append a child node.
   *
   * Used exclusively for building up DOM which are static (ie not View roots)
   */
  appendChild(newChild: RNode): RNode;
}

/**
 * Subset of API needed for writing attributes, properties, and setting up
 * listeners on Element.
 */
export interface RElement extends RNode {
  style: RCSSStyleDeclaration;
  classList: RDOMTokenList;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  setAttributeNS(namespaceURI: string, qualifiedName: string, value: string): void;
  addEventListener(type: string, listener: EventListener, useCapture?: boolean): void;
  removeEventListener(type: string, listener?: EventListener, options?: boolean): void;

  setProperty?(name: string, value: any): void;
}

export interface RCSSStyleDeclaration {
  removeProperty(propertyName: string): string;
  setProperty(propertyName: string, value: string|null, priority?: string): void;
}

export interface RDOMTokenList {
  add(token: string): void;
  remove(token: string): void;
}

export interface RText extends RNode { textContent: string|null; }

export interface RComment extends RNode {}
