/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, RenderComponentType, Renderer, Renderer2, RendererFactory2, RendererStyleFlags2, RendererType2, RootRenderer, ViewEncapsulation} from '@angular/core';

import {ClientMessageBroker, ClientMessageBrokerFactory, FnArg, UiArguments} from '../shared/client_message_broker';
import {MessageBus} from '../shared/message_bus';
import {EVENT_2_CHANNEL, RENDERER_2_CHANNEL} from '../shared/messaging_api';
import {RenderStore} from '../shared/render_store';
import {Serializer, SerializerTypes} from '../shared/serializer';

export class NamedEventEmitter {
  private _listeners: Map<string, Function[]>;

  listen(eventName: string, callback: Function) { this._getListeners(eventName).push(callback); }

  unlisten(eventName: string, listener: Function) {
    const listeners = this._getListeners(eventName);
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  dispatchEvent(eventName: string, event: any) {
    const listeners = this._getListeners(eventName);
    for (let i = 0; i < listeners.length; i++) {
      listeners[i](event);
    }
  }

  private _getListeners(eventName: string): Function[] {
    if (!this._listeners) {
      this._listeners = new Map<string, Function[]>();
    }
    let listeners = this._listeners.get(eventName);
    if (!listeners) {
      listeners = [];
      this._listeners.set(eventName, listeners);
    }
    return listeners;
  }
}


function eventNameWithTarget(target: string, eventName: string): string {
  return `${target}:${eventName}`;
}

@Injectable()
export class WebWorkerRendererFactory2 implements RendererFactory2 {
  globalEvents = new NamedEventEmitter();

  private _messageBroker: ClientMessageBroker;

  constructor(
      messageBrokerFactory: ClientMessageBrokerFactory, bus: MessageBus,
      private _serializer: Serializer, public renderStore: RenderStore) {
    this._messageBroker = messageBrokerFactory.createMessageBroker(RENDERER_2_CHANNEL);
    bus.initChannel(EVENT_2_CHANNEL);
    const source = bus.from(EVENT_2_CHANNEL);
    source.subscribe({next: (message: any) => this._dispatchEvent(message)});
  }

  createRenderer(element: any, type: RendererType2|null): Renderer2 {
    const renderer = new WebWorkerRenderer2(this);

    const id = this.renderStore.allocateId();
    this.renderStore.store(renderer, id);
    this.callUI('createRenderer', [
      new FnArg(element, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(type, SerializerTypes.RENDERER_TYPE_2),
      new FnArg(renderer, SerializerTypes.RENDER_STORE_OBJECT),
    ]);

    return renderer;
  }

  begin() {}
  end() {}

  callUI(fnName: string, fnArgs: FnArg[]) {
    const args = new UiArguments(fnName, fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  allocateNode(): WebWorkerRenderNode {
    const result = new WebWorkerRenderNode();
    const id = this.renderStore.allocateId();
    this.renderStore.store(result, id);
    return result;
  }

  freeNode(node: any) { this.renderStore.remove(node); }

  allocateId(): number { return this.renderStore.allocateId(); }

  private _dispatchEvent(message: {[key: string]: any}): void {
    const element: WebWorkerRenderNode =
        this._serializer.deserialize(message['element'], SerializerTypes.RENDER_STORE_OBJECT);

    const eventName = message['eventName'];
    const target = message['eventTarget'];
    const event = message['event'];

    if (target) {
      this.globalEvents.dispatchEvent(eventNameWithTarget(target, eventName), event);
    } else {
      element.events.dispatchEvent(eventName, event);
    }
  }
}


export class WebWorkerRenderer2 implements Renderer2 {
  data: {[key: string]: any} = Object.create(null);

  constructor(private _rendererFactory: WebWorkerRendererFactory2) {}

  private asFnArg = new FnArg(this, SerializerTypes.RENDER_STORE_OBJECT);

  destroy(): void { this.callUIWithRenderer('destroy'); }

  destroyNode(node: any) {
    this.callUIWithRenderer('destroyNode', [new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT)]);
    this._rendererFactory.freeNode(node);
  }

  createElement(name: string, namespace?: string): any {
    const node = this._rendererFactory.allocateNode();
    this.callUIWithRenderer('createElement', [
      new FnArg(name),
      new FnArg(namespace),
      new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
    return node;
  }

  createComment(value: string): any {
    const node = this._rendererFactory.allocateNode();
    this.callUIWithRenderer('createComment', [
      new FnArg(value),
      new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
    return node;
  }

  createText(value: string): any {
    const node = this._rendererFactory.allocateNode();
    this.callUIWithRenderer('createText', [
      new FnArg(value),
      new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
    return node;
  }

  appendChild(parent: any, newChild: any): void {
    this.callUIWithRenderer('appendChild', [
      new FnArg(parent, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(newChild, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
  }

  insertBefore(parent: any, newChild: any, refChild: any): void {
    if (!parent) {
      return;
    }

    this.callUIWithRenderer('insertBefore', [
      new FnArg(parent, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(newChild, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(refChild, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
  }

  removeChild(parent: any, oldChild: any): void {
    this.callUIWithRenderer('removeChild', [
      new FnArg(parent, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(oldChild, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
  }

  selectRootElement(selectorOrNode: string|any): any {
    const node = this._rendererFactory.allocateNode();
    this.callUIWithRenderer('selectRootElement', [
      new FnArg(selectorOrNode),
      new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
    return node;
  }

  parentNode(node: any): any {
    const res = this._rendererFactory.allocateNode();
    this.callUIWithRenderer('parentNode', [
      new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(res, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
    return res;
  }

  nextSibling(node: any): any {
    const res = this._rendererFactory.allocateNode();
    this.callUIWithRenderer('nextSibling', [
      new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(res, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
    return res;
  }

  setAttribute(el: any, name: string, value: string, namespace?: string): void {
    this.callUIWithRenderer('setAttribute', [
      new FnArg(el, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(name),
      new FnArg(value),
      new FnArg(namespace),
    ]);
  }

  removeAttribute(el: any, name: string, namespace?: string): void {
    this.callUIWithRenderer('removeAttribute', [
      new FnArg(el, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(name),
      new FnArg(namespace),
    ]);
  }

  addClass(el: any, name: string): void {
    this.callUIWithRenderer('addClass', [
      new FnArg(el, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(name),
    ]);
  }

  removeClass(el: any, name: string): void {
    this.callUIWithRenderer('removeClass', [
      new FnArg(el, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(name),
    ]);
  }

  setStyle(el: any, style: string, value: any, flags: RendererStyleFlags2): void {
    this.callUIWithRenderer('setStyle', [
      new FnArg(el, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(style),
      new FnArg(value),
      new FnArg(flags),
    ]);
  }

  removeStyle(el: any, style: string, flags: RendererStyleFlags2): void {
    this.callUIWithRenderer('removeStyle', [
      new FnArg(el, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(style),
      new FnArg(flags),
    ]);
  }

  setProperty(el: any, name: string, value: any): void {
    this.callUIWithRenderer('setProperty', [
      new FnArg(el, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(name),
      new FnArg(value),
    ]);
  }

  setValue(node: any, value: string): void {
    this.callUIWithRenderer('setValue', [
      new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(value),
    ]);
  }

  listen(
      target: 'window'|'document'|'body'|any, eventName: string,
      listener: (event: any) => boolean): () => void {
    const unlistenId = this._rendererFactory.allocateId();

    const [targetEl, targetName, fullName]: [any, string | null, string | null] =
        typeof target === 'string' ? [null, target, `${target}:${eventName}`] :
                                     [target, null, null];

    if (fullName) {
      this._rendererFactory.globalEvents.listen(fullName, listener);
    } else {
      targetEl.events.listen(eventName, listener);
    }

    this.callUIWithRenderer('listen', [
      new FnArg(targetEl, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(targetName),
      new FnArg(eventName),
      new FnArg(unlistenId),
    ]);

    return () => {
      if (fullName) {
        this._rendererFactory.globalEvents.unlisten(fullName, listener);
      } else {
        targetEl.events.unlisten(eventName, listener);
      }
      this.callUIWithRenderer('unlisten', [new FnArg(unlistenId)]);
    };
  }

  private callUIWithRenderer(fnName: string, fnArgs: FnArg[] = []) {
    // always pass the renderer as the first arg
    this._rendererFactory.callUI(fnName, [this.asFnArg, ...fnArgs]);
  }
}

export class WebWorkerRenderNode { events = new NamedEventEmitter(); }
