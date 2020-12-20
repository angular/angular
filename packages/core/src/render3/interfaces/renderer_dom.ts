/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TrustedHTML, TrustedScript, TrustedScriptURL} from '../../util/security/trusted_type_defs';

/**
 * The goal here is to make sure that the browser DOM API is the Renderer.
 * We do this by defining a subset of DOM API to be the renderer and then
 * use that at runtime for rendering.
 *
 * At runtime we can then use the DOM api directly, in server or web-worker
 * it will be easy to implement such API.
 */

/** Subset of API needed for appending elements and text nodes. */
export interface RNode {
  /**
   * Returns the parent Element, Document, or DocumentFragment
   */
  parentNode: RNode|null;


  /**
   * Returns the parent Element if there is one
   */
  parentElement: RElement|null;

  /**
   * Gets the Node immediately following this one in the parent's childNodes
   */
  nextSibling: RNode|null;

  /**
   * Removes a child from the current node and returns the removed node
   * @param oldChild the child node to remove
   */
  removeChild(oldChild: RNode): RNode;

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
  style: RCssStyleDeclaration;
  classList: RDomTokenList;
  className: string;
  textContent: string|null;
  setAttribute(name: string, value: string|TrustedHTML|TrustedScript|TrustedScriptURL): void;
  removeAttribute(name: string): void;
  setAttributeNS(
      namespaceURI: string, qualifiedName: string,
      value: string|TrustedHTML|TrustedScript|TrustedScriptURL): void;
  addEventListener(type: string, listener: EventListener, useCapture?: boolean): void;
  removeEventListener(type: string, listener?: EventListener, options?: boolean): void;

  setProperty?(name: string, value: any): void;
}

export interface RCssStyleDeclaration {
  removeProperty(propertyName: string): string;
  setProperty(propertyName: string, value: string|null, priority?: string): void;
}

export interface RDomTokenList {
  add(token: string): void;
  remove(token: string): void;
}

export interface RText extends RNode {
  textContent: string|null;
}

export interface RComment extends RNode {
  textContent: string|null;
}

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
