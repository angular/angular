/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationTriggerMetadata} from '@angular/animations';
import {ɵAnimationEngine as AnimationEngine} from '@angular/animations/browser';
import {Injectable, NgZone, Renderer2, RendererFactory2, RendererStyleFlags2, RendererType2} from '@angular/core';

@Injectable()
export class AnimationRendererFactory implements RendererFactory2 {
  private _currentId: number = 0;
  private _currentFlushId: number = 1;
  private _animationCallbacksBuffer: [(e: any) => any, any][] = [];

  constructor(
      private delegate: RendererFactory2, private _engine: AnimationEngine, private _zone: NgZone) {
    _engine.onRemovalComplete = (element: any, delegate: any) => {
      // Note: if an component element has a leave animation, and the component
      // a host leave animation, the view engine will call `removeChild` for the parent
      // component renderer as well as for the child component renderer.
      // Therefore, we need to check if we already removed the element.
      if (delegate && delegate.parentNode(element)) {
        delegate.removeChild(element.parentNode, element);
      }
    };
  }

  createRenderer(hostElement: any, type: RendererType2): Renderer2 {
    let delegate = this.delegate.createRenderer(hostElement, type);
    if (!hostElement || !type || !type.data || !type.data['animation']) return delegate;

    const componentId = type.id;
    const namespaceId = type.id + '-' + this._currentId;
    this._currentId++;

    const animationTriggers = type.data['animation'] as AnimationTriggerMetadata[];
    animationTriggers.forEach(
        trigger => this._engine.registerTrigger(
            componentId, namespaceId, hostElement, trigger.name, trigger));
    return new AnimationRenderer(this, delegate, this._engine, this._zone, namespaceId);
  }

  begin() {
    if (this.delegate.begin) {
      this.delegate.begin();
    }
  }

  private _scheduleCountTask() {
    Zone.current.scheduleMicroTask(
        'incremenet the animation microtask', () => { this._currentFlushId++; });
  }

  /* @internal */
  scheduleListenerCallback(count: number, fn: (e: any) => any, data: any) {
    if (count >= 0 && count < this._currentFlushId) {
      this._zone.run(() => fn(data));
      return;
    }

    if (this._animationCallbacksBuffer.length == 0) {
      Promise.resolve(null).then(() => {
        this._zone.run(() => {
          this._animationCallbacksBuffer.forEach(tuple => {
            const [fn, data] = tuple;
            fn(data);
          });
          this._animationCallbacksBuffer = [];
        });
      });
    }

    this._animationCallbacksBuffer.push([fn, data]);
  }

  end() {
    this._zone.runOutsideAngular(() => {
      this._scheduleCountTask();
      this._engine.flush(this._currentFlushId);
    });
    if (this.delegate.end) {
      this.delegate.end();
    }
  }

  whenRenderingDone(): Promise<any> { return this._engine.whenRenderingDone(); }
}

export class AnimationRenderer implements Renderer2 {
  public destroyNode: ((node: any) => any)|null = null;
  public microtaskCount: number = 0;

  constructor(
      private _factory: AnimationRendererFactory, public delegate: Renderer2,
      private _engine: AnimationEngine, private _zone: NgZone, private _namespaceId: string) {
    this.destroyNode = this.delegate.destroyNode ? (n) => delegate.destroyNode !(n) : null;
  }

  get data() { return this.delegate.data; }

  destroy(): void {
    this._engine.destroy(this._namespaceId, this.delegate);
    this.delegate.destroy();
  }

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

  setStyle(el: any, style: string, value: any, flags: RendererStyleFlags2): void {
    this.delegate.setStyle(el, style, value, flags);
  }

  removeStyle(el: any, style: string, flags: RendererStyleFlags2): void {
    this.delegate.removeStyle(el, style, flags);
  }

  setValue(node: any, value: string): void { this.delegate.setValue(node, value); }

  appendChild(parent: any, newChild: any): void {
    this.delegate.appendChild(parent, newChild);
    this._engine.onInsert(this._namespaceId, newChild, parent, false);
  }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    this.delegate.insertBefore(parent, newChild, refChild);
    this._engine.onInsert(this._namespaceId, newChild, parent, true);
  }

  removeChild(parent: any, oldChild: any): void {
    this._engine.onRemove(this._namespaceId, oldChild, this.delegate);
  }

  setProperty(el: any, name: string, value: any): void {
    if (name.charAt(0) == '@') {
      name = name.substr(1);
      this._engine.setProperty(this._namespaceId, el, name, value);
    } else {
      this.delegate.setProperty(el, name, value);
    }
  }

  listen(target: 'window'|'document'|'body'|any, eventName: string, callback: (event: any) => any):
      () => void {
    if (eventName.charAt(0) == '@') {
      const element = resolveElementFromTarget(target);
      let name = eventName.substr(1);
      let phase = '';
      if (name.charAt(0) != '@') {  // transition-specific
        [name, phase] = parseTriggerCallbackName(name);
      }
      return this._engine.listen(this._namespaceId, element, name, phase, event => {
        const countId = (event as any)['_data'] || -1;
        this._factory.scheduleListenerCallback(countId, callback, event);
      });
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
