/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, RenderComponentType, Renderer, RootRenderer, ViewEncapsulation} from '@angular/core';

import {ListWrapper} from '../../facade/collection';
import {isPresent} from '../../facade/lang';
import {AnimationKeyframe, AnimationPlayer, AnimationStyles, RenderDebugInfo} from '../../private_import_core';
import {ClientMessageBrokerFactory, FnArg, UiArguments} from '../shared/client_message_broker';
import {MessageBus} from '../shared/message_bus';
import {EVENT_CHANNEL, RENDERER_CHANNEL} from '../shared/messaging_api';
import {RenderStore} from '../shared/render_store';
import {ANIMATION_WORKER_PLAYER_PREFIX, RenderStoreObject, Serializer} from '../shared/serializer';
import {deserializeGenericEvent} from './event_deserializer';

@Injectable()
export class WebWorkerRootRenderer implements RootRenderer {
  private _messageBroker: any /** TODO #9100 */;
  public globalEvents: NamedEventEmitter = new NamedEventEmitter();
  private _componentRenderers: Map<string, WebWorkerRenderer> =
      new Map<string, WebWorkerRenderer>();

  constructor(
      messageBrokerFactory: ClientMessageBrokerFactory, bus: MessageBus,
      private _serializer: Serializer, public renderStore: RenderStore) {
    this._messageBroker = messageBrokerFactory.createMessageBroker(RENDERER_CHANNEL);
    bus.initChannel(EVENT_CHANNEL);
    var source = bus.from(EVENT_CHANNEL);
    source.subscribe({next: (message: any) => this._dispatchEvent(message)});
  }

  private _dispatchEvent(message: {[key: string]: any}): void {
    var element =
        <WebWorkerRenderNode>this._serializer.deserialize(message['element'], RenderStoreObject);
    var playerData = message['animationPlayer'];
    if (playerData) {
      var phaseName = message['phaseName'];
      var player = <AnimationPlayer>this._serializer.deserialize(playerData, RenderStoreObject);
      element.animationPlayerEvents.dispatchEvent(player, phaseName);
    } else {
      var eventName = message['eventName'];
      var target = message['eventTarget'];
      var event = deserializeGenericEvent(message['event']);
      if (isPresent(target)) {
        this.globalEvents.dispatchEvent(eventNameWithTarget(target, eventName), event);
      } else {
        element.events.dispatchEvent(eventName, event);
      }
    }
  }

  renderComponent(componentType: RenderComponentType): Renderer {
    var result = this._componentRenderers.get(componentType.id);
    if (!result) {
      result = new WebWorkerRenderer(this, componentType);
      this._componentRenderers.set(componentType.id, result);
      var id = this.renderStore.allocateId();
      this.renderStore.store(result, id);
      this.runOnService('renderComponent', [
        new FnArg(componentType, RenderComponentType),
        new FnArg(result, RenderStoreObject),
      ]);
    }
    return result;
  }

  runOnService(fnName: string, fnArgs: FnArg[]) {
    var args = new UiArguments(fnName, fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  allocateNode(): WebWorkerRenderNode {
    var result = new WebWorkerRenderNode();
    var id = this.renderStore.allocateId();
    this.renderStore.store(result, id);
    return result;
  }

  allocateId(): number { return this.renderStore.allocateId(); }

  destroyNodes(nodes: any[]) {
    for (var i = 0; i < nodes.length; i++) {
      this.renderStore.remove(nodes[i]);
    }
  }
}

export class WebWorkerRenderer implements Renderer, RenderStoreObject {
  constructor(
      private _rootRenderer: WebWorkerRootRenderer, private _componentType: RenderComponentType) {}

  private _runOnService(fnName: string, fnArgs: FnArg[]) {
    var fnArgsWithRenderer = [new FnArg(this, RenderStoreObject)].concat(fnArgs);
    this._rootRenderer.runOnService(fnName, fnArgsWithRenderer);
  }

  selectRootElement(selectorOrNode: string, debugInfo?: RenderDebugInfo): any {
    var node = this._rootRenderer.allocateNode();
    this._runOnService(
        'selectRootElement', [new FnArg(selectorOrNode, null), new FnArg(node, RenderStoreObject)]);
    return node;
  }

  createElement(parentElement: any, name: string, debugInfo?: RenderDebugInfo): any {
    var node = this._rootRenderer.allocateNode();
    this._runOnService('createElement', [
      new FnArg(parentElement, RenderStoreObject), new FnArg(name, null),
      new FnArg(node, RenderStoreObject)
    ]);
    return node;
  }

  createViewRoot(hostElement: any): any {
    var viewRoot = this._componentType.encapsulation === ViewEncapsulation.Native ?
        this._rootRenderer.allocateNode() :
        hostElement;
    this._runOnService(
        'createViewRoot',
        [new FnArg(hostElement, RenderStoreObject), new FnArg(viewRoot, RenderStoreObject)]);
    return viewRoot;
  }

  createTemplateAnchor(parentElement: any, debugInfo?: RenderDebugInfo): any {
    var node = this._rootRenderer.allocateNode();
    this._runOnService(
        'createTemplateAnchor',
        [new FnArg(parentElement, RenderStoreObject), new FnArg(node, RenderStoreObject)]);
    return node;
  }

  createText(parentElement: any, value: string, debugInfo?: RenderDebugInfo): any {
    var node = this._rootRenderer.allocateNode();
    this._runOnService('createText', [
      new FnArg(parentElement, RenderStoreObject), new FnArg(value, null),
      new FnArg(node, RenderStoreObject)
    ]);
    return node;
  }

  projectNodes(parentElement: any, nodes: any[]) {
    this._runOnService(
        'projectNodes',
        [new FnArg(parentElement, RenderStoreObject), new FnArg(nodes, RenderStoreObject)]);
  }

  attachViewAfter(node: any, viewRootNodes: any[]) {
    this._runOnService(
        'attachViewAfter',
        [new FnArg(node, RenderStoreObject), new FnArg(viewRootNodes, RenderStoreObject)]);
  }

  detachView(viewRootNodes: any[]) {
    this._runOnService('detachView', [new FnArg(viewRootNodes, RenderStoreObject)]);
  }

  destroyView(hostElement: any, viewAllNodes: any[]) {
    this._runOnService(
        'destroyView',
        [new FnArg(hostElement, RenderStoreObject), new FnArg(viewAllNodes, RenderStoreObject)]);
    this._rootRenderer.destroyNodes(viewAllNodes);
  }

  setElementProperty(renderElement: any, propertyName: string, propertyValue: any) {
    this._runOnService('setElementProperty', [
      new FnArg(renderElement, RenderStoreObject), new FnArg(propertyName, null),
      new FnArg(propertyValue, null)
    ]);
  }

  setElementAttribute(renderElement: any, attributeName: string, attributeValue: string) {
    this._runOnService('setElementAttribute', [
      new FnArg(renderElement, RenderStoreObject), new FnArg(attributeName, null),
      new FnArg(attributeValue, null)
    ]);
  }

  setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string) {
    this._runOnService('setBindingDebugInfo', [
      new FnArg(renderElement, RenderStoreObject), new FnArg(propertyName, null),
      new FnArg(propertyValue, null)
    ]);
  }

  setElementClass(renderElement: any, className: string, isAdd: boolean) {
    this._runOnService('setElementClass', [
      new FnArg(renderElement, RenderStoreObject), new FnArg(className, null),
      new FnArg(isAdd, null)
    ]);
  }

  setElementStyle(renderElement: any, styleName: string, styleValue: string) {
    this._runOnService('setElementStyle', [
      new FnArg(renderElement, RenderStoreObject), new FnArg(styleName, null),
      new FnArg(styleValue, null)
    ]);
  }

  invokeElementMethod(renderElement: any, methodName: string, args?: any[]) {
    this._runOnService('invokeElementMethod', [
      new FnArg(renderElement, RenderStoreObject), new FnArg(methodName, null),
      new FnArg(args, null)
    ]);
  }

  setText(renderNode: any, text: string) {
    this._runOnService(
        'setText', [new FnArg(renderNode, RenderStoreObject), new FnArg(text, null)]);
  }

  listen(renderElement: WebWorkerRenderNode, name: string, callback: Function): Function {
    renderElement.events.listen(name, callback);
    var unlistenCallbackId = this._rootRenderer.allocateId();
    this._runOnService('listen', [
      new FnArg(renderElement, RenderStoreObject), new FnArg(name, null),
      new FnArg(unlistenCallbackId, null)
    ]);
    return () => {
      renderElement.events.unlisten(name, callback);
      this._runOnService('listenDone', [new FnArg(unlistenCallbackId, null)]);
    };
  }

  listenGlobal(target: string, name: string, callback: Function): Function {
    this._rootRenderer.globalEvents.listen(eventNameWithTarget(target, name), callback);
    var unlistenCallbackId = this._rootRenderer.allocateId();
    this._runOnService(
        'listenGlobal',
        [new FnArg(target, null), new FnArg(name, null), new FnArg(unlistenCallbackId, null)]);
    return () => {
      this._rootRenderer.globalEvents.unlisten(eventNameWithTarget(target, name), callback);
      this._runOnService('listenDone', [new FnArg(unlistenCallbackId, null)]);
    };
  }

  animate(
      renderElement: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[],
      duration: number, delay: number, easing: string): AnimationPlayer {
    const playerId = this._rootRenderer.allocateId();

    this._runOnService('animate', [
      new FnArg(renderElement, RenderStoreObject), new FnArg(startingStyles, null),
      new FnArg(keyframes, null), new FnArg(duration, null), new FnArg(delay, null),
      new FnArg(easing, null), new FnArg(playerId, null)
    ]);

    const player = new _AnimationWorkerRendererPlayer(this._rootRenderer, renderElement);
    this._rootRenderer.renderStore.store(player, playerId);

    return player;
  }
}

export class NamedEventEmitter {
  private _listeners: Map<string, Function[]>;

  private _getListeners(eventName: string): Function[] {
    if (!this._listeners) {
      this._listeners = new Map<string, Function[]>();
    }
    var listeners = this._listeners.get(eventName);
    if (!listeners) {
      listeners = [];
      this._listeners.set(eventName, listeners);
    }
    return listeners;
  }

  listen(eventName: string, callback: Function) { this._getListeners(eventName).push(callback); }

  unlisten(eventName: string, callback: Function) {
    ListWrapper.remove(this._getListeners(eventName), callback);
  }

  dispatchEvent(eventName: string, event: any) {
    var listeners = this._getListeners(eventName);
    for (var i = 0; i < listeners.length; i++) {
      listeners[i](event);
    }
  }
}

export class AnimationPlayerEmitter {
  private _listeners: Map<AnimationPlayer, {[phaseName: string]: Function[]}>;

  private _getListeners(player: AnimationPlayer, phaseName: string): Function[] {
    if (!this._listeners) {
      this._listeners = new Map<AnimationPlayer, {[phaseName: string]: Function[]}>();
    }
    var phaseMap = this._listeners.get(player);
    if (!phaseMap) {
      this._listeners.set(player, phaseMap = {});
    }
    var phaseFns = phaseMap[phaseName];
    if (!phaseFns) {
      phaseFns = phaseMap[phaseName] = [];
    }
    return phaseFns;
  }

  listen(player: AnimationPlayer, phaseName: string, callback: Function) {
    this._getListeners(player, phaseName).push(callback);
  }

  unlisten(player: AnimationPlayer) { this._listeners.delete(player); }

  dispatchEvent(player: AnimationPlayer, phaseName: string) {
    var listeners = this._getListeners(player, phaseName);
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]();
    }
  }
}

function eventNameWithTarget(target: string, eventName: string): string {
  return `${target}:${eventName}`;
}

export class WebWorkerRenderNode {
  events = new NamedEventEmitter();
  animationPlayerEvents = new AnimationPlayerEmitter();
}

class _AnimationWorkerRendererPlayer implements AnimationPlayer, RenderStoreObject {
  public parentPlayer: AnimationPlayer = null;

  private _destroyed: boolean = false;
  private _started: boolean = false;

  constructor(private _rootRenderer: WebWorkerRootRenderer, private _renderElement: any) {}

  private _runOnService(fnName: string, fnArgs: FnArg[]) {
    if (!this._destroyed) {
      var fnArgsWithRenderer = [
        new FnArg(this, RenderStoreObject), new FnArg(this._renderElement, RenderStoreObject)
      ].concat(fnArgs);
      this._rootRenderer.runOnService(ANIMATION_WORKER_PLAYER_PREFIX + fnName, fnArgsWithRenderer);
    }
  }

  onStart(fn: () => void): void {
    this._renderElement.animationPlayerEvents.listen(this, 'onStart', fn);
    this._runOnService('onStart', []);
  }

  onDone(fn: () => void): void {
    this._renderElement.animationPlayerEvents.listen(this, 'onDone', fn);
    this._runOnService('onDone', []);
  }

  hasStarted(): boolean { return this._started; }

  init(): void { this._runOnService('init', []); }

  play(): void {
    this._started = true;
    this._runOnService('play', []);
  }

  pause(): void { this._runOnService('pause', []); }

  restart(): void { this._runOnService('restart', []); }

  finish(): void { this._runOnService('finish', []); }

  destroy(): void {
    if (!this._destroyed) {
      this._renderElement.animationPlayerEvents.unlisten(this);
      this._runOnService('destroy', []);
      this._rootRenderer.renderStore.remove(this);
      this._destroyed = true;
    }
  }

  reset(): void { this._runOnService('reset', []); }

  setPosition(p: number): void { this._runOnService('setPosition', [new FnArg(p, null)]); }

  getPosition(): number { return 0; }
}
