/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationPlayer, Injectable, RenderComponentType, Renderer, RendererFactoryV2, RendererTypeV2, RendererV2, RootRenderer} from '@angular/core';

import {MessageBus} from '../shared/message_bus';
import {EVENT_CHANNEL, EVENT_V2_CHANNEL, RENDERER_CHANNEL, RENDERER_V2_CHANNEL} from '../shared/messaging_api';
import {RenderStore} from '../shared/render_store';
import {ANIMATION_WORKER_PLAYER_PREFIX, Serializer, SerializerTypes} from '../shared/serializer';
import {ServiceMessageBroker, ServiceMessageBrokerFactory} from '../shared/service_message_broker';
import {EventDispatcher} from '../ui/event_dispatcher';

@Injectable()
export class MessageBasedRenderer {
  private _eventDispatcher: EventDispatcher;

  constructor(
      private _brokerFactory: ServiceMessageBrokerFactory, private _bus: MessageBus,
      private _serializer: Serializer, private _renderStore: RenderStore,
      private _rootRenderer: RootRenderer) {}

  start(): void {
    const broker = this._brokerFactory.createMessageBroker(RENDERER_CHANNEL);

    this._bus.initChannel(EVENT_CHANNEL);
    this._eventDispatcher = new EventDispatcher(this._bus.to(EVENT_CHANNEL), this._serializer);

    const [RCT, RSO, P] = [
      RenderComponentType,
      SerializerTypes.RENDER_STORE_OBJECT,
      SerializerTypes.PRIMITIVE,
    ];

    const methods: any[][] = [
      ['renderComponent', this._renderComponent, RCT, P],
      ['selectRootElement', this._selectRootElement, RSO, P, P],
      ['createElement', this._createElement, RSO, RSO, P, P],
      ['createViewRoot', this._createViewRoot, RSO, RSO, P],
      ['createTemplateAnchor', this._createTemplateAnchor, RSO, RSO, P],
      ['createText', this._createText, RSO, RSO, P, P],
      ['projectNodes', this._projectNodes, RSO, RSO, RSO],
      ['attachViewAfter', this._attachViewAfter, RSO, RSO, RSO],
      ['detachView', this._detachView, RSO, RSO],
      ['destroyView', this._destroyView, RSO, RSO, RSO],
      ['setElementProperty', this._setElementProperty, RSO, RSO, P, P],
      ['setElementAttribute', this._setElementAttribute, RSO, RSO, P, P],
      ['setBindingDebugInfo', this._setBindingDebugInfo, RSO, RSO, P, P],
      ['setElementClass', this._setElementClass, RSO, RSO, P, P],
      ['setElementStyle', this._setElementStyle, RSO, RSO, P, P],
      ['invokeElementMethod', this._invokeElementMethod, RSO, RSO, P, P],
      ['setText', this._setText, RSO, RSO, P],
      ['listen', this._listen, RSO, RSO, P, P],
      ['listenGlobal', this._listenGlobal, RSO, P, P, P],
      ['listenDone', this._listenDone, RSO, RSO],
      ['animate', this._animate, RSO, RSO, P, P, P, P, P, P, P],
    ];

    methods.forEach(([name, method, ...argTypes]: any[]) => {
      broker.registerMethod(name, argTypes, method.bind(this));
    });

    this._bindAnimationPlayerMethods(broker);
  }

  private _bindAnimationPlayerMethods(broker: ServiceMessageBroker) {
    const [P, RSO] = [SerializerTypes.PRIMITIVE, SerializerTypes.RENDER_STORE_OBJECT];

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'play', [RSO, RSO],
        (player: AnimationPlayer, element: any) => player.play());

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'pause', [RSO, RSO],
        (player: AnimationPlayer, element: any) => player.pause());

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'init', [RSO, RSO],
        (player: AnimationPlayer, element: any) => player.init());

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'restart', [RSO, RSO],
        (player: AnimationPlayer, element: any) => player.restart());

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'destroy', [RSO, RSO],
        (player: AnimationPlayer, element: any) => {
          player.destroy();
          this._renderStore.remove(player);
        });

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'finish', [RSO, RSO],
        (player: AnimationPlayer, element: any) => player.finish());

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'getPosition', [RSO, RSO],
        (player: AnimationPlayer, element: any) => player.getPosition());

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'onStart', [RSO, RSO, P],
        (player: AnimationPlayer, element: any) =>
            this._listenOnAnimationPlayer(player, element, 'onStart'));

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'onDone', [RSO, RSO, P],
        (player: AnimationPlayer, element: any) =>
            this._listenOnAnimationPlayer(player, element, 'onDone'));

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'setPosition', [RSO, RSO, P],
        (player: AnimationPlayer, element: any, position: number) => player.setPosition(position));
  }

  private _renderComponent(renderComponentType: RenderComponentType, rendererId: number) {
    const renderer = this._rootRenderer.renderComponent(renderComponentType);
    this._renderStore.store(renderer, rendererId);
  }

  private _selectRootElement(renderer: Renderer, selector: string, elId: number) {
    this._renderStore.store(renderer.selectRootElement(selector, null), elId);
  }

  private _createElement(renderer: Renderer, parentElement: any, name: string, elId: number) {
    this._renderStore.store(renderer.createElement(parentElement, name, null), elId);
  }

  private _createViewRoot(renderer: Renderer, hostElement: any, elId: number) {
    const viewRoot = renderer.createViewRoot(hostElement);
    if (this._renderStore.serialize(hostElement) !== elId) {
      this._renderStore.store(viewRoot, elId);
    }
  }

  private _createTemplateAnchor(renderer: Renderer, parentElement: any, elId: number) {
    this._renderStore.store(renderer.createTemplateAnchor(parentElement, null), elId);
  }

  private _createText(renderer: Renderer, parentElement: any, value: string, elId: number) {
    this._renderStore.store(renderer.createText(parentElement, value, null), elId);
  }

  private _projectNodes(renderer: Renderer, parentElement: any, nodes: any[]) {
    renderer.projectNodes(parentElement, nodes);
  }

  private _attachViewAfter(renderer: Renderer, node: any, viewRootNodes: any[]) {
    renderer.attachViewAfter(node, viewRootNodes);
  }

  private _detachView(renderer: Renderer, viewRootNodes: any[]) {
    renderer.detachView(viewRootNodes);
  }

  private _destroyView(renderer: Renderer, hostElement: any, viewAllNodes: any[]) {
    renderer.destroyView(hostElement, viewAllNodes);
    for (let i = 0; i < viewAllNodes.length; i++) {
      this._renderStore.remove(viewAllNodes[i]);
    }
  }

  private _setElementProperty(
      renderer: Renderer, renderElement: any, propertyName: string, propertyValue: any) {
    renderer.setElementProperty(renderElement, propertyName, propertyValue);
  }

  private _setElementAttribute(
      renderer: Renderer, renderElement: any, attributeName: string, attributeValue: string) {
    renderer.setElementAttribute(renderElement, attributeName, attributeValue);
  }

  private _setBindingDebugInfo(
      renderer: Renderer, renderElement: any, propertyName: string, propertyValue: string) {
    renderer.setBindingDebugInfo(renderElement, propertyName, propertyValue);
  }

  private _setElementClass(
      renderer: Renderer, renderElement: any, className: string, isAdd: boolean) {
    renderer.setElementClass(renderElement, className, isAdd);
  }

  private _setElementStyle(
      renderer: Renderer, renderElement: any, styleName: string, styleValue: string) {
    renderer.setElementStyle(renderElement, styleName, styleValue);
  }

  private _invokeElementMethod(
      renderer: Renderer, renderElement: any, methodName: string, args: any[]) {
    renderer.invokeElementMethod(renderElement, methodName, args);
  }

  private _setText(renderer: Renderer, renderNode: any, text: string) {
    renderer.setText(renderNode, text);
  }

  private _listen(renderer: Renderer, renderElement: any, eventName: string, unlistenId: number) {
    const unregisterCallback = renderer.listen(
        renderElement, eventName, (event: any) => this._eventDispatcher.dispatchRenderEvent(
                                      renderElement, null, eventName, event));
    this._renderStore.store(unregisterCallback, unlistenId);
  }

  private _listenGlobal(
      renderer: Renderer, eventTarget: string, eventName: string, unlistenId: number) {
    const unregisterCallback = renderer.listenGlobal(
        eventTarget, eventName, (event: any) => this._eventDispatcher.dispatchRenderEvent(
                                    null, eventTarget, eventName, event));
    this._renderStore.store(unregisterCallback, unlistenId);
  }

  private _listenDone(renderer: Renderer, unlistenCallback: Function) { unlistenCallback(); }

  private _animate(
      renderer: Renderer, element: any, startingStyles: any, keyframes: any[], duration: number,
      delay: number, easing: string, previousPlayers: number[], playerId: any) {
    let normalizedPreviousPlayers: AnimationPlayer[];
    if (previousPlayers && previousPlayers.length) {
      normalizedPreviousPlayers =
          previousPlayers.map(playerId => this._renderStore.deserialize(playerId));
    }
    const player = renderer.animate(
        element, startingStyles, keyframes, duration, delay, easing, normalizedPreviousPlayers);
    this._renderStore.store(player, playerId);
  }

  private _listenOnAnimationPlayer(player: AnimationPlayer, element: any, phaseName: string) {
    const onEventComplete =
        () => { this._eventDispatcher.dispatchAnimationEvent(player, phaseName, element); };

    // there is no need to register a unlistener value here since the
    // internal player callbacks are removed when the player is destroyed
    if (phaseName == 'onDone') {
      player.onDone(() => onEventComplete());
    } else {
      player.onStart(() => onEventComplete());
    }
  }
}

@Injectable()
export class MessageBasedRendererV2 {
  private _eventDispatcher: EventDispatcher;

  constructor(
      private _brokerFactory: ServiceMessageBrokerFactory, private _bus: MessageBus,
      private _serializer: Serializer, private _renderStore: RenderStore,
      private _rendererFactory: RendererFactoryV2) {}

  start(): void {
    const broker = this._brokerFactory.createMessageBroker(RENDERER_V2_CHANNEL);

    this._bus.initChannel(EVENT_V2_CHANNEL);
    this._eventDispatcher = new EventDispatcher(this._bus.to(EVENT_V2_CHANNEL), this._serializer);

    const [RSO, P, CRT] = [
      SerializerTypes.RENDER_STORE_OBJECT,
      SerializerTypes.PRIMITIVE,
      SerializerTypes.RENDERER_TYPE_V2,
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
      ['setStyle', this.setStyle, RSO, RSO, P, P, P, P],
      ['removeStyle', this.removeStyle, RSO, RSO, P, P],
      ['setProperty', this.setProperty, RSO, RSO, P, P], ['setValue', this.setValue, RSO, RSO, P],
      ['listen', this.listen, RSO, RSO, P, P, P], ['unlisten', this.unlisten, RSO, RSO],
      ['destroy', this.destroy, RSO], ['destroyNode', this.destroyNode, RSO, P]

    ];

    methods.forEach(([name, method, ...argTypes]: any[]) => {
      broker.registerMethod(name, argTypes, method.bind(this));
    });
  }

  private destroy(r: RendererV2) { r.destroy(); }

  private destroyNode(r: RendererV2, node: any) {
    if (r.destroyNode) {
      r.destroyNode(node);
    }
    this._renderStore.remove(node);
  }

  private createRenderer(el: any, type: RendererTypeV2, id: number) {
    this._renderStore.store(this._rendererFactory.createRenderer(el, type), id);
  }

  private createElement(r: RendererV2, name: string, namespace: string, id: number) {
    this._renderStore.store(r.createElement(name, namespace), id);
  }

  private createComment(r: RendererV2, value: string, id: number) {
    this._renderStore.store(r.createComment(value), id);
  }

  private createText(r: RendererV2, value: string, id: number) {
    this._renderStore.store(r.createText(value), id);
  }

  private appendChild(r: RendererV2, parent: any, child: any) { r.appendChild(parent, child); }

  private insertBefore(r: RendererV2, parent: any, child: any, ref: any) {
    r.insertBefore(parent, child, ref);
  }

  private removeChild(r: RendererV2, parent: any, child: any) { r.removeChild(parent, child); }

  private selectRootElement(r: RendererV2, selector: string, id: number) {
    this._renderStore.store(r.selectRootElement(selector), id);
  }

  private parentNode(r: RendererV2, node: any, id: number) {
    this._renderStore.store(r.parentNode(node), id);
  }

  private nextSibling(r: RendererV2, node: any, id: number) {
    this._renderStore.store(r.nextSibling(node), id);
  }

  private setAttribute(r: RendererV2, el: any, name: string, value: string, namespace: string) {
    r.setAttribute(el, name, value, namespace);
  }

  private removeAttribute(r: RendererV2, el: any, name: string, namespace: string) {
    r.removeAttribute(el, name, namespace);
  }

  private addClass(r: RendererV2, el: any, name: string) { r.addClass(el, name); }

  private removeClass(r: RendererV2, el: any, name: string) { r.removeClass(el, name); }

  private setStyle(
      r: RendererV2, el: any, style: string, value: any, hasVendorPrefix: boolean,
      hasImportant: boolean) {
    r.setStyle(el, style, value, hasVendorPrefix, hasImportant);
  }

  private removeStyle(r: RendererV2, el: any, style: string, hasVendorPrefix: boolean) {
    r.removeStyle(el, style, hasVendorPrefix);
  }

  private setProperty(r: RendererV2, el: any, name: string, value: any) {
    r.setProperty(el, name, value);
  }

  private setValue(r: RendererV2, node: any, value: string) { r.setValue(node, value); }

  private listen(r: RendererV2, el: any, elName: string, eventName: string, unlistenId: number) {
    const listener = (event: any) => {
      return this._eventDispatcher.dispatchRenderEvent(el, elName, eventName, event);
    };

    const unlisten = r.listen(el || elName, eventName, listener);
    this._renderStore.store(unlisten, unlistenId);
  }

  private unlisten(r: RendererV2, unlisten: () => boolean) { unlisten(); }
}
