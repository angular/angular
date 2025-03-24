/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RendererStyleFlags2, RendererType2} from '../../render/api_flags';
import type {ListenerOptions} from '../../render/api';
import {TrustedHTML, TrustedScript, TrustedScriptURL} from '../../util/security/trusted_type_defs';

import {RComment, RElement, RNode, RText} from './renderer_dom';

/**
 * The goal here is to make sure that the browser DOM API is the Renderer.
 * We do this by defining a subset of DOM API to be the renderer and then
 * use that at runtime for rendering.
 *
 * At runtime we can then use the DOM api directly, in server or web-worker
 * it will be easy to implement such API.
 */

export type GlobalTargetName = 'document' | 'window' | 'body';

export type GlobalTargetResolver = (element: any) => EventTarget;

/**
 * Procedural style of API needed to create elements and text nodes.
 *
 * In non-native browser environments (e.g. platforms such as web-workers), this is the
 * facade that enables element manipulation. In practice, this is implemented by `Renderer2`.
 */
export interface Renderer {
  destroy(): void;
  createComment(value: string): RComment;
  createElement(name: string, namespace?: string | null): RElement;
  createText(value: string): RText;
  /**
   * This property is allowed to be null / undefined,
   * in which case the view engine won't call it.
   * This is used as a performance optimization for production mode.
   */
  destroyNode?: ((node: RNode) => void) | null;
  appendChild(parent: RElement, newChild: RNode): void;
  insertBefore(parent: RNode, newChild: RNode, refChild: RNode | null, isMove?: boolean): void;
  removeChild(parent: RElement | null, oldChild: RNode, isHostElement?: boolean): void;
  selectRootElement(selectorOrNode: string | any, preserveContent?: boolean): RElement;

  parentNode(node: RNode): RElement | null;
  nextSibling(node: RNode): RNode | null;

  setAttribute(
    el: RElement,
    name: string,
    value: string | TrustedHTML | TrustedScript | TrustedScriptURL,
    namespace?: string | null,
  ): void;
  removeAttribute(el: RElement, name: string, namespace?: string | null): void;
  addClass(el: RElement, name: string): void;
  removeClass(el: RElement, name: string): void;
  setStyle(el: RElement, style: string, value: any, flags?: RendererStyleFlags2): void;
  removeStyle(el: RElement, style: string, flags?: RendererStyleFlags2): void;
  setProperty(el: RElement, name: string, value: any): void;
  setValue(node: RText | RComment, value: string): void;

  // TODO(misko): Deprecate in favor of addEventListener/removeEventListener
  listen(
    target: GlobalTargetName | RNode,
    eventName: string,
    callback: (event: any) => boolean | void,
    options?: ListenerOptions,
  ): () => void;
}

export interface RendererFactory {
  createRenderer(hostElement: RElement | null, rendererType: RendererType2 | null): Renderer;
  begin?(): void;
  end?(): void;
}
