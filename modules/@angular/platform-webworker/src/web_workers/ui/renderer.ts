/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationPlayer, Injectable, RenderComponentType, Renderer, RootRenderer} from '@angular/core';
import {MessageBus} from '../shared/message_bus';
import {EVENT_CHANNEL, RENDERER_CHANNEL} from '../shared/messaging_api';
import {RenderStore} from '../shared/render_store';
import {ANIMATION_WORKER_PLAYER_PREFIX, PRIMITIVE, RenderStoreObject, Serializer} from '../shared/serializer';
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
    var broker = this._brokerFactory.createMessageBroker(RENDERER_CHANNEL);
    this._bus.initChannel(EVENT_CHANNEL);
    this._eventDispatcher = new EventDispatcher(this._bus.to(EVENT_CHANNEL), this._serializer);

    broker.registerMethod(
        'renderComponent', [RenderComponentType, PRIMITIVE], this._renderComponent.bind(this));

    broker.registerMethod(
        'selectRootElement', [RenderStoreObject, PRIMITIVE, PRIMITIVE],
        this._selectRootElement.bind(this));
    broker.registerMethod(
        'createElement', [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        this._createElement.bind(this));
    broker.registerMethod(
        'createViewRoot', [RenderStoreObject, RenderStoreObject, PRIMITIVE],
        this._createViewRoot.bind(this));
    broker.registerMethod(
        'createTemplateAnchor', [RenderStoreObject, RenderStoreObject, PRIMITIVE],
        this._createTemplateAnchor.bind(this));
    broker.registerMethod(
        'createText', [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        this._createText.bind(this));
    broker.registerMethod(
        'projectNodes', [RenderStoreObject, RenderStoreObject, RenderStoreObject],
        this._projectNodes.bind(this));
    broker.registerMethod(
        'attachViewAfter', [RenderStoreObject, RenderStoreObject, RenderStoreObject],
        this._attachViewAfter.bind(this));
    broker.registerMethod(
        'detachView', [RenderStoreObject, RenderStoreObject], this._detachView.bind(this));
    broker.registerMethod(
        'destroyView', [RenderStoreObject, RenderStoreObject, RenderStoreObject],
        this._destroyView.bind(this));
    broker.registerMethod(
        'setElementProperty', [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        this._setElementProperty.bind(this));
    broker.registerMethod(
        'setElementAttribute', [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        this._setElementAttribute.bind(this));
    broker.registerMethod(
        'setBindingDebugInfo', [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        this._setBindingDebugInfo.bind(this));
    broker.registerMethod(
        'setElementClass', [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        this._setElementClass.bind(this));
    broker.registerMethod(
        'setElementStyle', [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        this._setElementStyle.bind(this));
    broker.registerMethod(
        'invokeElementMethod', [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        this._invokeElementMethod.bind(this));
    broker.registerMethod(
        'setText', [RenderStoreObject, RenderStoreObject, PRIMITIVE], this._setText.bind(this));
    broker.registerMethod(
        'listen', [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        this._listen.bind(this));
    broker.registerMethod(
        'listenGlobal', [RenderStoreObject, PRIMITIVE, PRIMITIVE, PRIMITIVE],
        this._listenGlobal.bind(this));
    broker.registerMethod(
        'listenDone', [RenderStoreObject, RenderStoreObject], this._listenDone.bind(this));
    broker.registerMethod(
        'animate',
        [
          RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE, PRIMITIVE, PRIMITIVE,
          PRIMITIVE, PRIMITIVE
        ],
        this._animate.bind(this));

    this._bindAnimationPlayerMethods(broker);
  }

  private _bindAnimationPlayerMethods(broker: ServiceMessageBroker) {
    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'play', [RenderStoreObject, RenderStoreObject],
        (player: AnimationPlayer, element: any) => player.play());

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'pause', [RenderStoreObject, RenderStoreObject],
        (player: AnimationPlayer, element: any) => player.pause());

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'init', [RenderStoreObject, RenderStoreObject],
        (player: AnimationPlayer, element: any) => player.init());

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'restart', [RenderStoreObject, RenderStoreObject],
        (player: AnimationPlayer, element: any) => player.restart());

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'destroy', [RenderStoreObject, RenderStoreObject],
        (player: AnimationPlayer, element: any) => {
          player.destroy();
          this._renderStore.remove(player);
        });

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'finish', [RenderStoreObject, RenderStoreObject],
        (player: AnimationPlayer, element: any) => player.finish());

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'getPosition', [RenderStoreObject, RenderStoreObject],
        (player: AnimationPlayer, element: any) => player.getPosition());

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'onStart',
        [RenderStoreObject, RenderStoreObject, PRIMITIVE],
        (player: AnimationPlayer, element: any) =>
            this._listenOnAnimationPlayer(player, element, 'onStart'));

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'onDone',
        [RenderStoreObject, RenderStoreObject, PRIMITIVE],
        (player: AnimationPlayer, element: any) =>
            this._listenOnAnimationPlayer(player, element, 'onDone'));

    broker.registerMethod(
        ANIMATION_WORKER_PLAYER_PREFIX + 'setPosition',
        [RenderStoreObject, RenderStoreObject, PRIMITIVE],
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
    var unregisterCallback = renderer.listen(
        renderElement, eventName,
        (event: any /** TODO #9100 */) =>
            this._eventDispatcher.dispatchRenderEvent(renderElement, null, eventName, event));
    this._renderStore.store(unregisterCallback, unlistenId);
  }

  private _listenGlobal(
      renderer: Renderer, eventTarget: string, eventName: string, unlistenId: number) {
    var unregisterCallback = renderer.listenGlobal(
        eventTarget, eventName,
        (event: any /** TODO #9100 */) =>
            this._eventDispatcher.dispatchRenderEvent(null, eventTarget, eventName, event));
    this._renderStore.store(unregisterCallback, unlistenId);
  }

  private _listenDone(renderer: Renderer, unlistenCallback: Function) { unlistenCallback(); }

  private _animate(
      renderer: Renderer, element: any, startingStyles: any, keyframes: any[], duration: number,
      delay: number, easing: string, playerId: any) {
    var player = renderer.animate(element, startingStyles, keyframes, duration, delay, easing);
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
