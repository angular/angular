/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationEvent, AnimationTriggerMetadata} from '@angular/animations';
import {Injectable, NgZone, RendererFactoryV2, RendererTypeV2, RendererV2} from '@angular/core';

import {AnimationEngine} from '../animation_engine';

@Injectable()
export class AnimationRendererFactory implements RendererFactoryV2 {
  constructor(
      private delegate: RendererFactoryV2, private _engine: AnimationEngine,
      private _zone: NgZone) {}

  createRenderer(hostElement: any, type: RendererTypeV2): RendererV2 {
    let delegate = this.delegate.createRenderer(hostElement, type);
    if (!hostElement || !type || !type.data || !type.data['animation']) return delegate;

    let animationRenderer = delegate.data['animationRenderer'];
    if (!animationRenderer) {
      const namespaceId = type.id;
      const animationTriggers = type.data['animation'] as AnimationTriggerMetadata[];
      animationTriggers.forEach(
          trigger =>
              this._engine.registerTrigger(trigger, namespaceify(namespaceId, trigger.name)));
      animationRenderer = new AnimationRenderer(delegate, this._engine, this._zone, namespaceId);
      delegate.data['animationRenderer'] = animationRenderer;
    }
    return animationRenderer;
  }
}

export class AnimationRenderer implements RendererV2 {
  public destroyNode: (node: any) => (void|any) = null;
  private _flushPromise: Promise<any> = null;

  constructor(
      public delegate: RendererV2, private _engine: AnimationEngine, private _zone: NgZone,
      private _namespaceId: string) {
    this.destroyNode = this.delegate.destroyNode ? (n) => delegate.destroyNode(n) : null;
  }

  get data() { return this.delegate.data; }

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
    this._queueFlush();
  }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    this._engine.onInsert(newChild, () => this.delegate.insertBefore(parent, newChild, refChild));
    this._queueFlush();
  }

  removeChild(parent: any, oldChild: any): void {
    this._engine.onRemove(oldChild, () => this.delegate.removeChild(parent, oldChild));
    this._queueFlush();
  }

  setProperty(el: any, name: string, value: any): void {
    if (name.charAt(0) == '@') {
      this._engine.setProperty(el, namespaceify(this._namespaceId, name.substr(1)), value);
      this._queueFlush();
    } else {
      this.delegate.setProperty(el, name, value);
    }
  }

  listen(target: 'window'|'document'|'body'|any, eventName: string, callback: (event: any) => any):
      () => void {
    if (eventName.charAt(0) == '@') {
      const element = resolveElementFromTarget(target);
      const [name, phase] = parseTriggerCallbackName(eventName.substr(1));
      return this._engine.listen(
          element, namespaceify(this._namespaceId, name), phase, (event: any) => {
            const e = event as any;
            if (e.triggerName) {
              e.triggerName = deNamespaceify(this._namespaceId, e.triggerName);
            }
            this._zone.run(() => callback(event));
          });
    }
    return this.delegate.listen(target, eventName, callback);
  }

  private _queueFlush() {
    if (!this._flushPromise) {
      this._zone.runOutsideAngular(() => {
        this._flushPromise = Promise.resolve(null).then(() => {
          this._flushPromise = null;
          this._engine.flush();
        });
      });
    }
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

function namespaceify(namespaceId: string, value: string): string {
  return `${namespaceId}#${value}`;
}

function deNamespaceify(namespaceId: string, value: string): string {
  return value.replace(namespaceId + '#', '');
}
