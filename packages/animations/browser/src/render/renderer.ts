/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const ANIMATION_PREFIX = '@';
const DISABLE_ANIMATIONS_FLAG = '@.disabled';

import {
  Renderer2,
  RendererFactory2,
  RendererStyleFlags2,
  ɵAnimationRendererType as AnimationRendererType,
  type ListenerOptions,
} from '@angular/core';
import type {AnimationEngine} from './animation_engine_next';

type AnimationFactoryWithListenerCallback = RendererFactory2 & {
  scheduleListenerCallback: (count: number, fn: (e: any) => any, data: any) => void;
};

export class BaseAnimationRenderer implements Renderer2 {
  // We need to explicitly type this property because of an api-extractor bug
  // See https://github.com/microsoft/rushstack/issues/4390
  readonly ɵtype: AnimationRendererType.Regular = AnimationRendererType.Regular;

  constructor(
    protected namespaceId: string,
    public delegate: Renderer2,
    public engine: AnimationEngine,
    private _onDestroy?: () => void,
  ) {}

  get data() {
    return this.delegate.data;
  }

  destroyNode(node: any): void {
    this.delegate.destroyNode?.(node);
  }

  destroy(): void {
    this.engine.destroy(this.namespaceId, this.delegate);
    this.engine.afterFlushAnimationsDone(() => {
      // Call the renderer destroy method after the animations has finished as otherwise
      // styles will be removed too early which will cause an unstyled animation.
      queueMicrotask(() => {
        this.delegate.destroy();
      });
    });

    this._onDestroy?.();
  }

  createElement(name: string, namespace?: string | null | undefined) {
    return this.delegate.createElement(name, namespace);
  }

  createComment(value: string) {
    return this.delegate.createComment(value);
  }

  createText(value: string) {
    return this.delegate.createText(value);
  }

  appendChild(parent: any, newChild: any): void {
    this.delegate.appendChild(parent, newChild);
    this.engine.onInsert(this.namespaceId, newChild, parent, false);
  }

  insertBefore(parent: any, newChild: any, refChild: any, isMove: boolean = true): void {
    this.delegate.insertBefore(parent, newChild, refChild);
    // If `isMove` true than we should animate this insert.
    this.engine.onInsert(this.namespaceId, newChild, parent, isMove);
  }

  removeChild(parent: any, oldChild: any, isHostElement?: boolean): void {
    // Prior to the changes in #57203, this method wasn't being called at all by `core` if the child
    // doesn't have a parent. There appears to be some animation-specific downstream logic that
    // depends on the null check happening before the animation engine. This check keeps the old
    // behavior while allowing `core` to not have to check for the parent element anymore.
    if (this.parentNode(oldChild)) {
      this.engine.onRemove(this.namespaceId, oldChild, this.delegate);
    }
  }

  selectRootElement(selectorOrNode: any, preserveContent?: boolean) {
    return this.delegate.selectRootElement(selectorOrNode, preserveContent);
  }

  parentNode(node: any) {
    return this.delegate.parentNode(node);
  }

  nextSibling(node: any) {
    return this.delegate.nextSibling(node);
  }

  setAttribute(el: any, name: string, value: string, namespace?: string | null | undefined): void {
    this.delegate.setAttribute(el, name, value, namespace);
  }

  removeAttribute(el: any, name: string, namespace?: string | null | undefined): void {
    this.delegate.removeAttribute(el, name, namespace);
  }

  addClass(el: any, name: string): void {
    this.delegate.addClass(el, name);
  }

  removeClass(el: any, name: string): void {
    this.delegate.removeClass(el, name);
  }

  setStyle(el: any, style: string, value: any, flags?: RendererStyleFlags2 | undefined): void {
    this.delegate.setStyle(el, style, value, flags);
  }

  removeStyle(el: any, style: string, flags?: RendererStyleFlags2 | undefined): void {
    this.delegate.removeStyle(el, style, flags);
  }

  setProperty(el: any, name: string, value: any): void {
    if (name.charAt(0) == ANIMATION_PREFIX && name == DISABLE_ANIMATIONS_FLAG) {
      this.disableAnimations(el, !!value);
    } else {
      this.delegate.setProperty(el, name, value);
    }
  }

  setValue(node: any, value: string): void {
    this.delegate.setValue(node, value);
  }

  listen(
    target: any,
    eventName: string,
    callback: (event: any) => boolean | void,
    options?: ListenerOptions,
  ): () => void {
    return this.delegate.listen(target, eventName, callback, options);
  }

  protected disableAnimations(element: any, value: boolean) {
    this.engine.disableAnimations(element, value);
  }
}

export class AnimationRenderer extends BaseAnimationRenderer implements Renderer2 {
  constructor(
    public factory: AnimationFactoryWithListenerCallback,
    namespaceId: string,
    delegate: Renderer2,
    engine: AnimationEngine,
    onDestroy?: () => void,
  ) {
    super(namespaceId, delegate, engine, onDestroy);
    this.namespaceId = namespaceId;
  }

  override setProperty(el: any, name: string, value: any): void {
    if (name.charAt(0) == ANIMATION_PREFIX) {
      if (name.charAt(1) == '.' && name == DISABLE_ANIMATIONS_FLAG) {
        value = value === undefined ? true : !!value;
        this.disableAnimations(el, value as boolean);
      } else {
        this.engine.process(this.namespaceId, el, name.slice(1), value);
      }
    } else {
      this.delegate.setProperty(el, name, value);
    }
  }

  override listen(
    target: 'window' | 'document' | 'body' | any,
    eventName: string,
    callback: (event: any) => any,
    options?: ListenerOptions,
  ): () => void {
    if (eventName.charAt(0) == ANIMATION_PREFIX) {
      const element = resolveElementFromTarget(target);
      let name = eventName.slice(1);
      let phase = '';
      // @listener.phase is for trigger animation callbacks
      // @@listener is for animation builder callbacks
      if (name.charAt(0) != ANIMATION_PREFIX) {
        [name, phase] = parseTriggerCallbackName(name);
      }
      return this.engine.listen(this.namespaceId, element, name, phase, (event) => {
        const countId = (event as any)['_data'] || -1;
        this.factory.scheduleListenerCallback(countId, callback, event);
      });
    }
    return this.delegate.listen(target, eventName, callback, options);
  }
}

function resolveElementFromTarget(target: 'window' | 'document' | 'body' | any): any {
  switch (target) {
    case 'body':
      return document.body;
    case 'document':
      return document;
    case 'window':
      return window;
    default:
      return target;
  }
}

function parseTriggerCallbackName(triggerName: string) {
  const dotIndex = triggerName.indexOf('.');
  const trigger = triggerName.substring(0, dotIndex);
  const phase = triggerName.slice(dotIndex + 1);
  return [trigger, phase];
}
