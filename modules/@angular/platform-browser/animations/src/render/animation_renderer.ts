/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationTriggerMetadata} from '@angular/animations';
import {Injectable, RendererFactoryV2, RendererTypeV2, RendererV2} from '@angular/core';

import {AnimationEngine} from './animation_engine';

@Injectable()
export class AnimationRendererFactory implements RendererFactoryV2 {
  constructor(private delegate: RendererFactoryV2, private _engine: AnimationEngine) {}

  createRenderer(hostElement: any, type: RendererTypeV2): RendererV2 {
    let delegate = this.delegate.createRenderer(hostElement, type);
    if (!hostElement || !type) return delegate;

    let animationRenderer = type.data['__animationRenderer__'] as any as AnimationRenderer;
    if (animationRenderer && delegate == animationRenderer.delegate) {
      return animationRenderer;
    }
    const animationTriggers = type.data['animation'] as AnimationTriggerMetadata[];
    animationRenderer = (type.data as any)['__animationRenderer__'] =
        new AnimationRenderer(delegate, this._engine, animationTriggers);
    return animationRenderer;
  }
}

export class AnimationRenderer implements RendererV2 {
  public destroyNode: (node: any) => (void|any) = null;

  constructor(
      public delegate: RendererV2, private _engine: AnimationEngine,
      _triggers: AnimationTriggerMetadata[] = null) {
    this.destroyNode = this.delegate.destroyNode ? (n) => delegate.destroyNode(n) : null;
    if (_triggers) {
      _triggers.forEach(trigger => _engine.registerTrigger(trigger));
    }
  }

  destroy(): void { this.delegate.destroy(); }

  createElement(name: string, namespace?: string): any {
    return this.delegate.createElement(name, namespace);
  }

  createComment(value: string): any { return this.delegate.createComment(value); }

  createText(value: string): any { return this.delegate.createText(value); }

  selectRootElement(selectorOrNode: string|any): any {
    return this.delegate.selectRootElement(selectorOrNode);
  }

  parentNode(node: any): any { return this.delegate.parentNode(node); }

  nextSibling(node: any): any { return this.delegate.nextSibling(node); }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    this.delegate.setAttribute(el, name, value, namespace);
  }

  removeAttribute(el: any, name: string, namespace?: string): void {
    this.delegate.removeAttribute(el, name, namespace);
  }

  addClass(el: any, name: string): void { this.delegate.addClass(el, name); }

  removeClass(el: any, name: string): void { this.delegate.removeClass(el, name); }

  setStyle(el: any, style: string, value: any, hasVendorPrefix: boolean, hasImportant: boolean):
      void {
    this.delegate.setStyle(el, style, value, hasVendorPrefix, hasImportant);
  }

  removeStyle(el: any, style: string, hasVendorPrefix: boolean): void {
    this.delegate.removeStyle(el, style, hasVendorPrefix);
  }

  setValue(node: any, value: string): void { this.delegate.setValue(node, value); }

  appendChild(parent: any, newChild: any): void {
    this._engine.onInsert(newChild, () => this.delegate.appendChild(parent, newChild));
  }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    this._engine.onInsert(newChild, () => this.delegate.insertBefore(parent, newChild, refChild));
  }

  removeChild(parent: any, oldChild: any): void {
    this._engine.onRemove(oldChild, () => this.delegate.removeChild(parent, oldChild));
  }

  setProperty(el: any, name: string, value: any): void {
    if (name.charAt(0) == '@') {
      this._engine.setProperty(el, name.substr(1), value);
    } else {
      this.delegate.setProperty(el, name, value);
    }
  }

  listen(target: 'window'|'document'|'body'|any, eventName: string, callback: (event: any) => any):
      () => void {
    if (eventName.charAt(0) == '@') {
      const element = resolveElementFromTarget(target);
      const [name, phase] = parseTriggerCallbackName(eventName.substr(1));
      return this._engine.listen(element, name, phase, callback);
    }
    return this.delegate.listen(target, eventName, callback);
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
  const phase = triggerName.substr(dotIndex + 1);
  return [trigger, phase];
}
