/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, RenderComponentType, Renderer, Renderer2, RendererFactory2, RendererStyleFlags2, RendererType2, RootRenderer} from '@angular/core';

import {MessageBus} from '../shared/message_bus';
import {EVENT_2_CHANNEL, RENDERER_2_CHANNEL} from '../shared/messaging_api';
import {RenderStore} from '../shared/render_store';
import {Serializer, SerializerTypes} from '../shared/serializer';
import {ServiceMessageBroker, ServiceMessageBrokerFactory} from '../shared/service_message_broker';
import {EventDispatcher} from '../ui/event_dispatcher';

@Injectable()
export class MessageBasedRenderer2 {
  private _eventDispatcher: EventDispatcher;

  constructor(
      private _brokerFactory: ServiceMessageBrokerFactory, private _bus: MessageBus,
      private _serializer: Serializer, private _renderStore: RenderStore,
      private _rendererFactory: RendererFactory2) {}

  start(): void {
    const broker = this._brokerFactory.createMessageBroker(RENDERER_2_CHANNEL);

    this._bus.initChannel(EVENT_2_CHANNEL);
    this._eventDispatcher = new EventDispatcher(this._bus.to(EVENT_2_CHANNEL), this._serializer);

    const [RSO, P, CRT] = [
      SerializerTypes.RENDER_STORE_OBJECT,
      SerializerTypes.PRIMITIVE,
      SerializerTypes.RENDERER_TYPE_2,
    ];

    const methods: any[][] = [
      ['createRenderer', this.createRenderer, RSO, CRT, P],
      ['createElement', this.createElement, RSO, P, P, P],
      ['createComment', this.createComment, RSO, P, P], ['createText', this.createText, RSO, P, P],
      ['appendChild', this.appendChild, RSO, RSO, RSO],
      ['insertBefore', this.insertBefore, RSO, RSO, RSO, RSO],
      ['removeChild', this.removeChild, RSO, RSO, RSO],
      ['selectRootElement', this.selectRootElement, RSO, P, P],
      ['parentNode', this.parentNode, RSO, RSO, P], ['nextSibling', this.nextSibling, RSO, RSO, P],
      ['setAttribute', this.setAttribute, RSO, RSO, P, P, P],
      ['removeAttribute', this.removeAttribute, RSO, RSO, P, P],
      ['addClass', this.addClass, RSO, RSO, P], ['removeClass', this.removeClass, RSO, RSO, P],
      ['setStyle', this.setStyle, RSO, RSO, P, P, P],
      ['removeStyle', this.removeStyle, RSO, RSO, P, P],
      ['setProperty', this.setProperty, RSO, RSO, P, P], ['setValue', this.setValue, RSO, RSO, P],
      ['listen', this.listen, RSO, RSO, P, P, P], ['unlisten', this.unlisten, RSO, RSO],
      ['destroy', this.destroy, RSO], ['destroyNode', this.destroyNode, RSO, P]

    ];

    methods.forEach(([name, method, ...argTypes]: any[]) => {
      broker.registerMethod(name, argTypes, method.bind(this));
    });
  }

  private destroy(r: Renderer2) { r.destroy(); }

  private destroyNode(r: Renderer2, node: any) {
    if (r.destroyNode) {
      r.destroyNode(node);
    }
    this._renderStore.remove(node);
  }

  private createRenderer(el: any, type: RendererType2, id: number) {
    this._renderStore.store(this._rendererFactory.createRenderer(el, type), id);
  }

  private createElement(r: Renderer2, name: string, namespace: string, id: number) {
    this._renderStore.store(r.createElement(name, namespace), id);
  }

  private createComment(r: Renderer2, value: string, id: number) {
    this._renderStore.store(r.createComment(value), id);
  }

  private createText(r: Renderer2, value: string, id: number) {
    this._renderStore.store(r.createText(value), id);
  }

  private appendChild(r: Renderer2, parent: any, child: any) { r.appendChild(parent, child); }

  private insertBefore(r: Renderer2, parent: any, child: any, ref: any) {
    r.insertBefore(parent, child, ref);
  }

  private removeChild(r: Renderer2, parent: any, child: any) { r.removeChild(parent, child); }

  private selectRootElement(r: Renderer2, selector: string, id: number) {
    this._renderStore.store(r.selectRootElement(selector), id);
  }

  private parentNode(r: Renderer2, node: any, id: number) {
    this._renderStore.store(r.parentNode(node), id);
  }

  private nextSibling(r: Renderer2, node: any, id: number) {
    this._renderStore.store(r.nextSibling(node), id);
  }

  private setAttribute(r: Renderer2, el: any, name: string, value: string, namespace: string) {
    r.setAttribute(el, name, value, namespace);
  }

  private removeAttribute(r: Renderer2, el: any, name: string, namespace: string) {
    r.removeAttribute(el, name, namespace);
  }

  private addClass(r: Renderer2, el: any, name: string) { r.addClass(el, name); }

  private removeClass(r: Renderer2, el: any, name: string) { r.removeClass(el, name); }

  private setStyle(r: Renderer2, el: any, style: string, value: any, flags: RendererStyleFlags2) {
    r.setStyle(el, style, value, flags);
  }

  private removeStyle(r: Renderer2, el: any, style: string, flags: RendererStyleFlags2) {
    r.removeStyle(el, style, flags);
  }

  private setProperty(r: Renderer2, el: any, name: string, value: any) {
    r.setProperty(el, name, value);
  }

  private setValue(r: Renderer2, node: any, value: string) { r.setValue(node, value); }

  private listen(r: Renderer2, el: any, elName: string, eventName: string, unlistenId: number) {
    const listener = (event: any) => {
      return this._eventDispatcher.dispatchRenderEvent(el, elName, eventName, event);
    };

    const unlisten = r.listen(el || elName, eventName, listener);
    this._renderStore.store(unlisten, unlistenId);
  }

  private unlisten(r: Renderer2, unlisten: () => boolean) { unlisten(); }
}
