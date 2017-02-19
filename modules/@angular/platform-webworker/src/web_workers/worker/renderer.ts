/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, RenderComponentType, Renderer, RendererFactoryV2, RendererTypeV2, RendererV2, RootRenderer, ViewEncapsulation} from '@angular/core';

import {AnimationKeyframe, AnimationPlayer, AnimationStyles, RenderDebugInfo} from '../../private_import_core';
import {ClientMessageBroker, ClientMessageBrokerFactory, FnArg, UiArguments} from '../shared/client_message_broker';
import {MessageBus} from '../shared/message_bus';
import {EVENT_CHANNEL, EVENT_V2_CHANNEL, RENDERER_CHANNEL, RENDERER_V2_CHANNEL} from '../shared/messaging_api';
import {RenderStore} from '../shared/render_store';
import {ANIMATION_WORKER_PLAYER_PREFIX, Serializer, SerializerTypes} from '../shared/serializer';

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

const globalEvents = new NamedEventEmitter();

@Injectable()
export class WebWorkerRootRenderer implements RootRenderer {
  private _messageBroker: ClientMessageBroker;
  private _componentRenderers = new Map<string, WebWorkerRenderer>();

  constructor(
      messageBrokerFactory: ClientMessageBrokerFactory, bus: MessageBus,
      private _serializer: Serializer, public renderStore: RenderStore) {
    this._messageBroker = messageBrokerFactory.createMessageBroker(RENDERER_CHANNEL);
    bus.initChannel(EVENT_CHANNEL);
    const source = bus.from(EVENT_CHANNEL);
    source.subscribe({next: (message: any) => this._dispatchEvent(message)});
  }

  private _dispatchEvent(message: {[key: string]: any}): void {
    const element: WebWorkerRenderNode =
        this._serializer.deserialize(message['element'], SerializerTypes.RENDER_STORE_OBJECT);
    const playerData = message['animationPlayer'];

    if (playerData) {
      const phaseName = message['phaseName'];
      const player: AnimationPlayer =
          this._serializer.deserialize(playerData, SerializerTypes.RENDER_STORE_OBJECT);
      element.animationPlayerEvents.dispatchEvent(player, phaseName);
    } else {
      const eventName = message['eventName'];
      const target = message['eventTarget'];
      const event = message['event'];
      if (target) {
        globalEvents.dispatchEvent(eventNameWithTarget(target, eventName), event);
      } else {
        element.events.dispatchEvent(eventName, event);
      }
    }
  }

  renderComponent(componentType: RenderComponentType): Renderer {
    let result = this._componentRenderers.get(componentType.id);
    if (!result) {
      result = new WebWorkerRenderer(this, componentType);
      this._componentRenderers.set(componentType.id, result);
      const id = this.renderStore.allocateId();
      this.renderStore.store(result, id);
      this.runOnService('renderComponent', [
        new FnArg(componentType, RenderComponentType),
        new FnArg(result, SerializerTypes.RENDER_STORE_OBJECT),
      ]);
    }
    return result;
  }

  runOnService(fnName: string, fnArgs: FnArg[]) {
    const args = new UiArguments(fnName, fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  allocateNode(): WebWorkerRenderNode {
    const result = new WebWorkerRenderNode();
    const id = this.renderStore.allocateId();
    this.renderStore.store(result, id);
    return result;
  }

  allocateId(): number { return this.renderStore.allocateId(); }

  destroyNodes(nodes: any[]) {
    for (let i = 0; i < nodes.length; i++) {
      this.renderStore.remove(nodes[i]);
    }
  }
}

export class WebWorkerRenderer implements Renderer {
  constructor(
      private _rootRenderer: WebWorkerRootRenderer, private _componentType: RenderComponentType) {}

  private _runOnService(fnName: string, fnArgs: FnArg[]) {
    const fnArgsWithRenderer = [new FnArg(this, SerializerTypes.RENDER_STORE_OBJECT), ...fnArgs];
    this._rootRenderer.runOnService(fnName, fnArgsWithRenderer);
  }

  selectRootElement(selectorOrNode: string, debugInfo?: RenderDebugInfo): any {
    const node = this._rootRenderer.allocateNode();
    this._runOnService('selectRootElement', [
      new FnArg(selectorOrNode),
      new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
    return node;
  }

  createElement(parentElement: any, name: string, debugInfo?: RenderDebugInfo): any {
    const node = this._rootRenderer.allocateNode();
    this._runOnService('createElement', [
      new FnArg(parentElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(name),
      new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
    return node;
  }

  createViewRoot(hostElement: any): any {
    const viewRoot = this._componentType.encapsulation === ViewEncapsulation.Native ?
        this._rootRenderer.allocateNode() :
        hostElement;
    this._runOnService('createViewRoot', [
      new FnArg(hostElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(viewRoot, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
    return viewRoot;
  }

  createTemplateAnchor(parentElement: any, debugInfo?: RenderDebugInfo): any {
    const node = this._rootRenderer.allocateNode();
    this._runOnService('createTemplateAnchor', [
      new FnArg(parentElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
    return node;
  }

  createText(parentElement: any, value: string, debugInfo?: RenderDebugInfo): any {
    const node = this._rootRenderer.allocateNode();
    this._runOnService('createText', [
      new FnArg(parentElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(value),
      new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
    return node;
  }

  projectNodes(parentElement: any, nodes: any[]) {
    this._runOnService('projectNodes', [
      new FnArg(parentElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(nodes, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
  }

  attachViewAfter(node: any, viewRootNodes: any[]) {
    this._runOnService('attachViewAfter', [
      new FnArg(node, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(viewRootNodes, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
  }

  detachView(viewRootNodes: any[]) {
    this._runOnService(
        'detachView', [new FnArg(viewRootNodes, SerializerTypes.RENDER_STORE_OBJECT)]);
  }

  destroyView(hostElement: any, viewAllNodes: any[]) {
    this._runOnService('destroyView', [
      new FnArg(hostElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(viewAllNodes, SerializerTypes.RENDER_STORE_OBJECT),
    ]);
    this._rootRenderer.destroyNodes(viewAllNodes);
  }

  setElementProperty(renderElement: any, propertyName: string, propertyValue: any) {
    this._runOnService('setElementProperty', [
      new FnArg(renderElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(propertyName),
      new FnArg(propertyValue),
    ]);
  }

  setElementAttribute(renderElement: any, attributeName: string, attributeValue: string) {
    this._runOnService('setElementAttribute', [
      new FnArg(renderElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(attributeName),
      new FnArg(attributeValue),
    ]);
  }

  setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string) {
    this._runOnService('setBindingDebugInfo', [
      new FnArg(renderElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(propertyName),
      new FnArg(propertyValue),
    ]);
  }

  setElementClass(renderElement: any, className: string, isAdd: boolean) {
    this._runOnService('setElementClass', [
      new FnArg(renderElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(className),
      new FnArg(isAdd),
    ]);
  }

  setElementStyle(renderElement: any, styleName: string, styleValue: string) {
    this._runOnService('setElementStyle', [
      new FnArg(renderElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(styleName),
      new FnArg(styleValue),
    ]);
  }

  invokeElementMethod(renderElement: any, methodName: string, args?: any[]) {
    this._runOnService('invokeElementMethod', [
      new FnArg(renderElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(methodName),
      new FnArg(args),
    ]);
  }

  setText(renderNode: any, text: string) {
    this._runOnService('setText', [
      new FnArg(renderNode, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(text),
    ]);
  }

  listen(renderElement: WebWorkerRenderNode, name: string, callback: Function): Function {
    renderElement.events.listen(name, callback);
    const unlistenCallbackId = this._rootRenderer.allocateId();
    this._runOnService('listen', [
      new FnArg(renderElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(name),
      new FnArg(unlistenCallbackId),
    ]);
    return () => {
      renderElement.events.unlisten(name, callback);
      this._runOnService('listenDone', [new FnArg(unlistenCallbackId)]);
    };
  }

  listenGlobal(target: string, name: string, callback: Function): Function {
    globalEvents.listen(eventNameWithTarget(target, name), callback);
    const unlistenCallbackId = this._rootRenderer.allocateId();
    this._runOnService('listenGlobal', [
      new FnArg(target),
      new FnArg(name, null),
      new FnArg(unlistenCallbackId),
    ]);
    return () => {
      globalEvents.unlisten(eventNameWithTarget(target, name), callback);
      this._runOnService('listenDone', [new FnArg(unlistenCallbackId)]);
    };
  }

  animate(
      renderElement: any, startingStyles: AnimationStyles, keyframes: AnimationKeyframe[],
      duration: number, delay: number, easing: string,
      previousPlayers: AnimationPlayer[] = []): AnimationPlayer {
    const playerId = this._rootRenderer.allocateId();
    const previousPlayerIds: number[] =
        previousPlayers.map(player => this._rootRenderer.renderStore.serialize(player));

    this._runOnService('animate', [
      new FnArg(renderElement, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(startingStyles),
      new FnArg(keyframes),
      new FnArg(duration),
      new FnArg(delay),
      new FnArg(easing),
      new FnArg(previousPlayerIds),
      new FnArg(playerId),
    ]);

    const player = new _AnimationWorkerRendererPlayer(this._rootRenderer, renderElement);
    this._rootRenderer.renderStore.store(player, playerId);

    return player;
  }
}

function eventNameWithTarget(target: string, eventName: string): string {
  return `${target}:${eventName}`;
}

@Injectable()
export class WebWorkerRendererFactoryV2 implements RendererFactoryV2 {
  private _messageBroker: ClientMessageBroker;

  constructor(
      messageBrokerFactory: ClientMessageBrokerFactory, bus: MessageBus,
      private _serializer: Serializer, public renderStore: RenderStore) {
    this._messageBroker = messageBrokerFactory.createMessageBroker(RENDERER_V2_CHANNEL);
    bus.initChannel(EVENT_V2_CHANNEL);
    const source = bus.from(EVENT_V2_CHANNEL);
    source.subscribe({next: (message: any) => this._dispatchEvent(message)});
  }

  createRenderer(element: any, type: RendererTypeV2): RendererV2 {
    const renderer = new WebWorkerRendererV2(this);

    const id = this.renderStore.allocateId();
    this.renderStore.store(renderer, id);
    this.callUI('createRenderer', [
      new FnArg(element, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(type, SerializerTypes.RENDERER_TYPE_V2),
      new FnArg(renderer, SerializerTypes.RENDER_STORE_OBJECT),
    ]);

    return renderer;
  }

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

  allocateId(): number { return this.renderStore.allocateId(); }

  private _dispatchEvent(message: {[key: string]: any}): void {
    const element: WebWorkerRenderNode =
        this._serializer.deserialize(message['element'], SerializerTypes.RENDER_STORE_OBJECT);

    const eventName = message['eventName'];
    const target = message['eventTarget'];
    const event = message['event'];

    if (target) {
      globalEvents.dispatchEvent(eventNameWithTarget(target, eventName), event);
    } else {
      element.events.dispatchEvent(eventName, event);
    }
  }
}


export class WebWorkerRendererV2 implements RendererV2 {
  constructor(private _rendererFactory: WebWorkerRendererFactoryV2) {}
  destroyNode: (node: any) => void | null = null;

  private asFnArg = new FnArg(this, SerializerTypes.RENDER_STORE_OBJECT);

  // TODO(vicb): destroy the allocated nodes
  destroy(): void { this.callUIWithRenderer('destroy'); }

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

  setStyle(el: any, style: string, value: any, hasVendorPrefix: boolean, hasImportant: boolean):
      void {
    this.callUIWithRenderer('setStyle', [
      new FnArg(el, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(style),
      new FnArg(value),
      new FnArg(hasVendorPrefix),
      new FnArg(hasImportant),
    ]);
  }

  removeStyle(el: any, style: string, hasVendorPrefix: boolean): void {
    this.callUIWithRenderer('removeStyle', [
      new FnArg(el, SerializerTypes.RENDER_STORE_OBJECT),
      new FnArg(style),
      new FnArg(hasVendorPrefix),
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

    const [targetEl, targetName, fullName]: [any, string, string] = typeof target === 'string' ?
        [null, target, `${target}:${eventName}`] :
        [target, null, null];

    if (fullName) {
      globalEvents.listen(fullName, listener);
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
        globalEvents.unlisten(fullName, listener);
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

export class AnimationPlayerEmitter {
  private _listeners: Map<AnimationPlayer, {[phaseName: string]: Function[]}>;

  private _getListeners(player: AnimationPlayer, phaseName: string): Function[] {
    if (!this._listeners) {
      this._listeners = new Map<AnimationPlayer, {[phaseName: string]: Function[]}>();
    }
    let phaseMap = this._listeners.get(player);
    if (!phaseMap) {
      this._listeners.set(player, phaseMap = {});
    }
    let phaseFns = phaseMap[phaseName];
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
    const listeners = this._getListeners(player, phaseName);
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]();
    }
  }
}

export class WebWorkerRenderNode {
  events = new NamedEventEmitter();
  animationPlayerEvents = new AnimationPlayerEmitter();
}

class _AnimationWorkerRendererPlayer {
  public parentPlayer: AnimationPlayer = null;

  private _destroyed: boolean = false;
  private _started: boolean = false;

  constructor(private _rootRenderer: WebWorkerRootRenderer, private _renderElement: any) {}

  private _runOnService(fnName: string, fnArgs: FnArg[]) {
    if (!this._destroyed) {
      const fnArgsWithRenderer = [
        new FnArg(this, SerializerTypes.RENDER_STORE_OBJECT),
        new FnArg(this._renderElement, SerializerTypes.RENDER_STORE_OBJECT), ...fnArgs
      ];
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

  onDestroy(fn: () => void): void {
    this._renderElement.animationPlayerEvents.listen(this, 'onDestroy', fn);
    this._runOnService('onDestroy', []);
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

  setPosition(p: number): void { this._runOnService('setPosition', [new FnArg(p)]); }

  getPosition(): number { return 0; }
}
