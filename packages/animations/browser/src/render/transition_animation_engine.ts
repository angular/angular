/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AUTO_STYLE, AnimationOptions, AnimationPlayer, NoopAnimationPlayer, ɵAnimationGroupPlayer as AnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE, ɵStyleData} from '@angular/animations';

import {AnimationTimelineInstruction} from '../dsl/animation_timeline_instruction';
import {AnimationTransitionFactory} from '../dsl/animation_transition_factory';
import {AnimationTransitionInstruction} from '../dsl/animation_transition_instruction';
import {AnimationTrigger} from '../dsl/animation_trigger';
import {ElementInstructionMap} from '../dsl/element_instruction_map';
import {AnimationStyleNormalizer} from '../dsl/style_normalization/animation_style_normalizer';
import {ENTER_CLASSNAME, LEAVE_CLASSNAME, NG_ANIMATING_CLASSNAME, NG_ANIMATING_SELECTOR, NG_TRIGGER_CLASSNAME, NG_TRIGGER_SELECTOR, copyObj, eraseStyles, setStyles} from '../util';

import {AnimationDriver} from './animation_driver';
import {getOrSetAsInMap, listenOnPlayer, makeAnimationEvent, normalizeKeyframes, optimizeGroupPlayer} from './shared';

const QUEUED_CLASSNAME = 'ng-animate-queued';
const QUEUED_SELECTOR = '.ng-animate-queued';
const DISABLED_CLASSNAME = 'ng-animate-disabled';
const DISABLED_SELECTOR = '.ng-animate-disabled';

const EMPTY_PLAYER_ARRAY: TransitionAnimationPlayer[] = [];
const NULL_REMOVAL_STATE: ElementAnimationState = {
  namespaceId: '',
  setForRemoval: null,
  hasAnimation: false,
  removedBeforeQueried: false
};
const NULL_REMOVED_QUERIED_STATE: ElementAnimationState = {
  namespaceId: '',
  setForRemoval: null,
  hasAnimation: false,
  removedBeforeQueried: true
};

interface TriggerListener {
  name: string;
  phase: string;
  callback: (event: any) => any;
}

export interface QueueInstruction {
  element: any;
  triggerName: string;
  fromState: StateValue;
  toState: StateValue;
  transition: AnimationTransitionFactory;
  player: TransitionAnimationPlayer;
  isFallbackTransition: boolean;
}

export const REMOVAL_FLAG = '__ng_removed';

export interface ElementAnimationState {
  setForRemoval: any;
  hasAnimation: boolean;
  namespaceId: string;
  removedBeforeQueried: boolean;
}

export class StateValue {
  public value: string;
  public options: AnimationOptions;

  constructor(input: any) {
    const isObj = input && input.hasOwnProperty('value');
    const value = isObj ? input['value'] : input;
    this.value = normalizeTriggerValue(value);
    if (isObj) {
      const options = copyObj(input as any);
      delete options['value'];
      this.options = options as AnimationOptions;
    } else {
      this.options = {};
    }
    if (!this.options.params) {
      this.options.params = {};
    }
  }

  absorbOptions(options: AnimationOptions) {
    const newParams = options.params;
    if (newParams) {
      const oldParams = this.options.params !;
      Object.keys(newParams).forEach(prop => {
        if (oldParams[prop] == null) {
          oldParams[prop] = newParams[prop];
        }
      });
    }
  }
}

export const VOID_VALUE = 'void';
export const DEFAULT_STATE_VALUE = new StateValue(VOID_VALUE);
export const DELETED_STATE_VALUE = new StateValue('DELETED');

export class AnimationTransitionNamespace {
  public players: TransitionAnimationPlayer[] = [];

  private _triggers: {[triggerName: string]: AnimationTrigger} = {};
  private _queue: QueueInstruction[] = [];

  private _elementListeners = new Map<any, TriggerListener[]>();

  private _hostClassName: string;

  constructor(
      public id: string, public hostElement: any, private _engine: TransitionAnimationEngine) {
    this._hostClassName = 'ng-tns-' + id;
    addClass(hostElement, this._hostClassName);
  }

  listen(element: any, name: string, phase: string, callback: (event: any) => boolean): () => any {
    if (!this._triggers.hasOwnProperty(name)) {
      throw new Error(
          `Unable to listen on the animation trigger event "${phase}" because the animation trigger "${name}" doesn\'t exist!`);
    }

    if (phase == null || phase.length == 0) {
      throw new Error(
          `Unable to listen on the animation trigger "${name}" because the provided event is undefined!`);
    }

    if (!isTriggerEventValid(phase)) {
      throw new Error(
          `The provided animation trigger event "${phase}" for the animation trigger "${name}" is not supported!`);
    }

    const listeners = getOrSetAsInMap(this._elementListeners, element, []);
    const data = {name, phase, callback};
    listeners.push(data);

    const triggersWithStates = getOrSetAsInMap(this._engine.statesByElement, element, {});
    if (!triggersWithStates.hasOwnProperty(name)) {
      addClass(element, NG_TRIGGER_CLASSNAME);
      addClass(element, NG_TRIGGER_CLASSNAME + '-' + name);
      triggersWithStates[name] = null;
    }

    return () => {
      // the event listener is removed AFTER the flush has occurred such
      // that leave animations callbacks can fire (otherwise if the node
      // is removed in between then the listeners would be deregistered)
      this._engine.afterFlush(() => {
        const index = listeners.indexOf(data);
        if (index >= 0) {
          listeners.splice(index, 1);
        }

        if (!this._triggers[name]) {
          delete triggersWithStates[name];
        }
      });
    };
  }

  register(name: string, ast: AnimationTrigger): boolean {
    if (this._triggers[name]) {
      // throw
      return false;
    } else {
      this._triggers[name] = ast;
      return true;
    }
  }

  private _getTrigger(name: string) {
    const trigger = this._triggers[name];
    if (!trigger) {
      throw new Error(`The provided animation trigger "${name}" has not been registered!`);
    }
    return trigger;
  }

  trigger(element: any, triggerName: string, value: any, defaultToFallback: boolean = true):
      TransitionAnimationPlayer|undefined {
    const trigger = this._getTrigger(triggerName);
    const player = new TransitionAnimationPlayer(this.id, triggerName, element);

    let triggersWithStates = this._engine.statesByElement.get(element);
    if (!triggersWithStates) {
      addClass(element, NG_TRIGGER_CLASSNAME);
      addClass(element, NG_TRIGGER_CLASSNAME + '-' + triggerName);
      this._engine.statesByElement.set(element, triggersWithStates = {});
    }

    let fromState = triggersWithStates[triggerName];
    const toState = new StateValue(value);

    const isObj = value && value.hasOwnProperty('value');
    if (!isObj && fromState) {
      toState.absorbOptions(fromState.options);
    }

    triggersWithStates[triggerName] = toState;

    if (!fromState) {
      fromState = DEFAULT_STATE_VALUE;
    } else if (fromState === DELETED_STATE_VALUE) {
      return player;
    }

    const isRemoval = toState.value === VOID_VALUE;

    // normally this isn't reached by here, however, if an object expression
    // is passed in then it may be a new object each time. Comparing the value
    // is important since that will stay the same despite there being a new object.
    // The removal arc here is special cased because the same element is triggered
    // twice in the event that it contains animations on the outer/inner portions
    // of the host container
    if (!isRemoval && fromState.value === toState.value) return;

    const playersOnElement: TransitionAnimationPlayer[] =
        getOrSetAsInMap(this._engine.playersByElement, element, []);
    playersOnElement.forEach(player => {
      // only remove the player if it is queued on the EXACT same trigger/namespace
      // we only also deal with queued players here because if the animation has
      // started then we want to keep the player alive until the flush happens
      // (which is where the previousPlayers are passed into the new palyer)
      if (player.namespaceId == this.id && player.triggerName == triggerName && player.queued) {
        player.destroy();
      }
    });

    let transition = trigger.matchTransition(fromState.value, toState.value);
    let isFallbackTransition = false;
    if (!transition) {
      if (!defaultToFallback) return;
      transition = trigger.fallbackTransition;
      isFallbackTransition = true;
    }

    this._engine.totalQueuedPlayers++;
    this._queue.push(
        {element, triggerName, transition, fromState, toState, player, isFallbackTransition});

    if (!isFallbackTransition) {
      addClass(element, QUEUED_CLASSNAME);
      player.onStart(() => { removeClass(element, QUEUED_CLASSNAME); });
    }

    player.onDone(() => {
      let index = this.players.indexOf(player);
      if (index >= 0) {
        this.players.splice(index, 1);
      }

      const players = this._engine.playersByElement.get(element);
      if (players) {
        let index = players.indexOf(player);
        if (index >= 0) {
          players.splice(index, 1);
        }
      }
    });

    this.players.push(player);
    playersOnElement.push(player);

    return player;
  }

  deregister(name: string) {
    delete this._triggers[name];

    this._engine.statesByElement.forEach((stateMap, element) => { delete stateMap[name]; });

    this._elementListeners.forEach((listeners, element) => {
      this._elementListeners.set(
          element, listeners.filter(entry => { return entry.name != name; }));
    });
  }

  clearElementCache(element: any) {
    this._engine.statesByElement.delete(element);
    this._elementListeners.delete(element);
    const elementPlayers = this._engine.playersByElement.get(element);
    if (elementPlayers) {
      elementPlayers.forEach(player => player.destroy());
      this._engine.playersByElement.delete(element);
    }
  }

  private _destroyInnerNodes(rootElement: any, context: any, animate: boolean = false) {
    this._engine.driver.query(rootElement, NG_TRIGGER_SELECTOR, true).forEach(elm => {
      if (animate && containsClass(elm, this._hostClassName)) {
        const innerNs = this._engine.namespacesByHostElement.get(elm);

        // special case for a host element with animations on the same element
        if (innerNs) {
          innerNs.removeNode(elm, context, true);
        }

        this.removeNode(elm, context, true);
      } else {
        this.clearElementCache(elm);
      }
    });
  }

  removeNode(element: any, context: any, doNotRecurse?: boolean): void {
    const engine = this._engine;

    if (!doNotRecurse && element.childElementCount) {
      this._destroyInnerNodes(element, context, true);
    }

    const triggerStates = engine.statesByElement.get(element);
    if (triggerStates) {
      const players: TransitionAnimationPlayer[] = [];
      Object.keys(triggerStates).forEach(triggerName => {
        // this check is here in the event that an element is removed
        // twice (both on the host level and the component level)
        if (this._triggers[triggerName]) {
          const player = this.trigger(element, triggerName, VOID_VALUE, false);
          if (player) {
            players.push(player);
          }
        }
      });

      if (players.length) {
        engine.markElementAsRemoved(this.id, element, true, context);
        optimizeGroupPlayer(players).onDone(() => engine.processLeaveNode(element));
        return;
      }
    }

    // find the player that is animating and make sure that the
    // removal is delayed until that player has completed
    let containsPotentialParentTransition = false;
    if (engine.totalAnimations) {
      const currentPlayers =
          engine.players.length ? engine.playersByQueriedElement.get(element) : [];

      // when this `if statement` does not continue forward it means that
      // a previous animation query has selected the current element and
      // is animating it. In this situation want to continue fowards and
      // allow the element to be queued up for animation later.
      if (currentPlayers && currentPlayers.length) {
        containsPotentialParentTransition = true;
      } else {
        let parent = element;
        while (parent = parent.parentNode) {
          const triggers = engine.statesByElement.get(parent);
          if (triggers) {
            containsPotentialParentTransition = true;
            break;
          }
        }
      }
    }

    // at this stage we know that the element will either get removed
    // during flush or will be picked up by a parent query. Either way
    // we need to fire the listeners for this element when it DOES get
    // removed (once the query parent animation is done or after flush)
    const listeners = this._elementListeners.get(element);
    if (listeners) {
      const visitedTriggers = new Set<string>();
      listeners.forEach(listener => {
        const triggerName = listener.name;
        if (visitedTriggers.has(triggerName)) return;
        visitedTriggers.add(triggerName);

        const trigger = this._triggers[triggerName];
        const transition = trigger.fallbackTransition;
        const elementStates = engine.statesByElement.get(element) !;
        const fromState = elementStates[triggerName] || DEFAULT_STATE_VALUE;
        const toState = new StateValue(VOID_VALUE);
        const player = new TransitionAnimationPlayer(this.id, triggerName, element);

        this._engine.totalQueuedPlayers++;
        this._queue.push({
          element,
          triggerName,
          transition,
          fromState,
          toState,
          player,
          isFallbackTransition: true
        });
      });
    }

    // whether or not a parent has an animation we need to delay the deferral of the leave
    // operation until we have more information (which we do after flush() has been called)
    if (containsPotentialParentTransition) {
      engine.markElementAsRemoved(this.id, element, false, context);
    } else {
      // we do this after the flush has occurred such
      // that the callbacks can be fired
      engine.afterFlush(() => this.clearElementCache(element));
      engine.destroyInnerAnimations(element);
      engine._onRemovalComplete(element, context);
    }
  }

  insertNode(element: any, parent: any): void { addClass(element, this._hostClassName); }

  drainQueuedTransitions(microtaskId: number): QueueInstruction[] {
    const instructions: QueueInstruction[] = [];
    this._queue.forEach(entry => {
      const player = entry.player;
      if (player.destroyed) return;

      const element = entry.element;
      const listeners = this._elementListeners.get(element);
      if (listeners) {
        listeners.forEach((listener: TriggerListener) => {
          if (listener.name == entry.triggerName) {
            const baseEvent = makeAnimationEvent(
                element, entry.triggerName, entry.fromState.value, entry.toState.value);
            (baseEvent as any)['_data'] = microtaskId;
            listenOnPlayer(entry.player, listener.phase, baseEvent, listener.callback);
          }
        });
      }

      if (player.markedForDestroy) {
        this._engine.afterFlush(() => {
          // now we can destroy the element properly since the event listeners have
          // been bound to the player
          player.destroy();
        });
      } else {
        instructions.push(entry);
      }
    });

    this._queue = [];

    return instructions.sort((a, b) => {
      // if depCount == 0 them move to front
      // otherwise if a contains b then move back
      const d0 = a.transition.ast.depCount;
      const d1 = b.transition.ast.depCount;
      if (d0 == 0 || d1 == 0) {
        return d0 - d1;
      }
      return this._engine.driver.containsElement(a.element, b.element) ? 1 : -1;
    });
  }

  destroy(context: any) {
    this.players.forEach(p => p.destroy());
    this._destroyInnerNodes(this.hostElement, context);
  }

  elementContainsData(element: any): boolean {
    let containsData = false;
    if (this._elementListeners.has(element)) containsData = true;
    containsData =
        (this._queue.find(entry => entry.element === element) ? true : false) || containsData;
    return containsData;
  }
}

export interface QueuedTransition {
  element: any;
  instruction: AnimationTransitionInstruction;
  player: TransitionAnimationPlayer;
}

export class TransitionAnimationEngine {
  public players: TransitionAnimationPlayer[] = [];
  public newHostElements = new Map<any, AnimationTransitionNamespace>();
  public playersByElement = new Map<any, TransitionAnimationPlayer[]>();
  public playersByQueriedElement = new Map<any, TransitionAnimationPlayer[]>();
  public statesByElement = new Map<any, {[triggerName: string]: StateValue}>();
  public disabledNodes = new Set<any>();

  public totalAnimations = 0;
  public totalQueuedPlayers = 0;

  private _namespaceLookup: {[id: string]: AnimationTransitionNamespace} = {};
  private _namespaceList: AnimationTransitionNamespace[] = [];
  private _flushFns: (() => any)[] = [];
  private _whenQuietFns: (() => any)[] = [];

  public namespacesByHostElement = new Map<any, AnimationTransitionNamespace>();
  public collectedEnterElements: any[] = [];
  public collectedLeaveElements: any[] = [];

  // this method is designed to be overridden by the code that uses this engine
  public onRemovalComplete = (element: any, context: any) => {};

  _onRemovalComplete(element: any, context: any) { this.onRemovalComplete(element, context); }

  constructor(public driver: AnimationDriver, private _normalizer: AnimationStyleNormalizer) {}

  get queuedPlayers(): TransitionAnimationPlayer[] {
    const players: TransitionAnimationPlayer[] = [];
    this._namespaceList.forEach(ns => {
      ns.players.forEach(player => {
        if (player.queued) {
          players.push(player);
        }
      });
    });
    return players;
  }

  createNamespace(namespaceId: string, hostElement: any) {
    const ns = new AnimationTransitionNamespace(namespaceId, hostElement, this);
    if (hostElement.parentNode) {
      this._balanceNamespaceList(ns, hostElement);
    } else {
      // defer this later until flush during when the host element has
      // been inserted so that we know exactly where to place it in
      // the namespace list
      this.newHostElements.set(hostElement, ns);

      // given that this host element is apart of the animation code, it
      // may or may not be inserted by a parent node that is an of an
      // animation renderer type. If this happens then we can still have
      // access to this item when we query for :enter nodes. If the parent
      // is a renderer then the set data-structure will normalize the entry
      this.collectEnterElement(hostElement);
    }
    return this._namespaceLookup[namespaceId] = ns;
  }

  private _balanceNamespaceList(ns: AnimationTransitionNamespace, hostElement: any) {
    const limit = this._namespaceList.length - 1;
    if (limit >= 0) {
      let found = false;
      for (let i = limit; i >= 0; i--) {
        const nextNamespace = this._namespaceList[i];
        if (this.driver.containsElement(nextNamespace.hostElement, hostElement)) {
          this._namespaceList.splice(i + 1, 0, ns);
          found = true;
          break;
        }
      }
      if (!found) {
        this._namespaceList.splice(0, 0, ns);
      }
    } else {
      this._namespaceList.push(ns);
    }

    this.namespacesByHostElement.set(hostElement, ns);
    return ns;
  }

  register(namespaceId: string, hostElement: any) {
    let ns = this._namespaceLookup[namespaceId];
    if (!ns) {
      ns = this.createNamespace(namespaceId, hostElement);
    }
    return ns;
  }

  registerTrigger(namespaceId: string, name: string, trigger: AnimationTrigger) {
    let ns = this._namespaceLookup[namespaceId];
    if (ns && ns.register(name, trigger)) {
      this.totalAnimations++;
    }
  }

  destroy(namespaceId: string, context: any) {
    if (!namespaceId) return;

    const ns = this._fetchNamespace(namespaceId);

    this.afterFlush(() => {
      this.namespacesByHostElement.delete(ns.hostElement);
      delete this._namespaceLookup[namespaceId];
      const index = this._namespaceList.indexOf(ns);
      if (index >= 0) {
        this._namespaceList.splice(index, 1);
      }
    });

    this.afterFlushAnimationsDone(() => ns.destroy(context));
  }

  private _fetchNamespace(id: string) { return this._namespaceLookup[id]; }

  trigger(namespaceId: string, element: any, name: string, value: any): boolean {
    if (isElementNode(element)) {
      this._fetchNamespace(namespaceId).trigger(element, name, value);
      return true;
    }
    return false;
  }

  insertNode(namespaceId: string, element: any, parent: any, insertBefore: boolean): void {
    if (!isElementNode(element)) return;

    // special case for when an element is removed and reinserted (move operation)
    // when this occurs we do not want to use the element for deletion later
    const details = element[REMOVAL_FLAG] as ElementAnimationState;
    if (details && details.setForRemoval) {
      details.setForRemoval = false;
    }

    // in the event that the namespaceId is blank then the caller
    // code does not contain any animation code in it, but it is
    // just being called so that the node is marked as being inserted
    if (namespaceId) {
      this._fetchNamespace(namespaceId).insertNode(element, parent);
    }

    // only *directives and host elements are inserted before
    if (insertBefore) {
      this.collectEnterElement(element);
    }
  }

  collectEnterElement(element: any) { this.collectedEnterElements.push(element); }

  markElementAsDisabled(element: any, value: boolean) {
    if (value) {
      if (!this.disabledNodes.has(element)) {
        this.disabledNodes.add(element);
        addClass(element, DISABLED_CLASSNAME);
      }
    } else if (this.disabledNodes.has(element)) {
      this.disabledNodes.delete(element);
      removeClass(element, DISABLED_CLASSNAME);
    }
  }

  removeNode(namespaceId: string, element: any, context: any, doNotRecurse?: boolean): void {
    if (!isElementNode(element)) {
      this._onRemovalComplete(element, context);
      return;
    }

    const ns = namespaceId ? this._fetchNamespace(namespaceId) : null;
    if (ns) {
      ns.removeNode(element, context, doNotRecurse);
    } else {
      this.markElementAsRemoved(namespaceId, element, false, context);
    }
  }

  markElementAsRemoved(namespaceId: string, element: any, hasAnimation?: boolean, context?: any) {
    this.collectedLeaveElements.push(element);
    element[REMOVAL_FLAG] = {
      namespaceId,
      setForRemoval: context, hasAnimation,
      removedBeforeQueried: false
    };
  }

  listen(
      namespaceId: string, element: any, name: string, phase: string,
      callback: (event: any) => boolean): () => any {
    if (isElementNode(element)) {
      return this._fetchNamespace(namespaceId).listen(element, name, phase, callback);
    }
    return () => {};
  }

  private _buildInstruction(entry: QueueInstruction, subTimelines: ElementInstructionMap) {
    return entry.transition.build(
        this.driver, entry.element, entry.fromState.value, entry.toState.value,
        entry.toState.options, subTimelines);
  }

  destroyInnerAnimations(containerElement: any) {
    let elements = this.driver.query(containerElement, NG_TRIGGER_SELECTOR, true);
    elements.forEach(element => {
      const players = this.playersByElement.get(element);
      if (players) {
        players.forEach(player => {
          // special case for when an element is set for destruction, but hasn't started.
          // in this situation we want to delay the destruction until the flush occurs
          // so that any event listeners attached to the player are triggered.
          if (player.queued) {
            player.markedForDestroy = true;
          } else {
            player.destroy();
          }
        });
      }
      const stateMap = this.statesByElement.get(element);
      if (stateMap) {
        Object.keys(stateMap).forEach(triggerName => stateMap[triggerName] = DELETED_STATE_VALUE);
      }
    });

    if (this.playersByQueriedElement.size == 0) return;

    elements = this.driver.query(containerElement, NG_ANIMATING_SELECTOR, true);
    if (elements.length) {
      elements.forEach(element => {
        const players = this.playersByQueriedElement.get(element);
        if (players) {
          players.forEach(player => player.finish());
        }
      });
    }
  }

  whenRenderingDone(): Promise<any> {
    return new Promise(resolve => {
      if (this.players.length) {
        return optimizeGroupPlayer(this.players).onDone(() => resolve());
      } else {
        resolve();
      }
    });
  }

  processLeaveNode(element: any) {
    const details = element[REMOVAL_FLAG] as ElementAnimationState;
    if (details && details.setForRemoval) {
      // this will prevent it from removing it twice
      element[REMOVAL_FLAG] = NULL_REMOVAL_STATE;
      if (details.namespaceId) {
        this.destroyInnerAnimations(element);
        const ns = this._fetchNamespace(details.namespaceId);
        if (ns) {
          ns.clearElementCache(element);
        }
      }
      this._onRemovalComplete(element, details.setForRemoval);
    }

    if (this.driver.matchesElement(element, DISABLED_SELECTOR)) {
      this.markElementAsDisabled(element, false);
    }

    this.driver.query(element, DISABLED_SELECTOR, true).forEach(node => {
      this.markElementAsDisabled(element, false);
    });
  }

  flush(microtaskId: number = -1) {
    let players: AnimationPlayer[] = [];
    if (this.newHostElements.size) {
      this.newHostElements.forEach((ns, element) => this._balanceNamespaceList(ns, element));
      this.newHostElements.clear();
    }

    if (this._namespaceList.length &&
        (this.totalQueuedPlayers || this.collectedLeaveElements.length)) {
      const cleanupFns: Function[] = [];
      try {
        players = this._flushAnimations(cleanupFns, microtaskId);
      } finally {
        for (let i = 0; i < cleanupFns.length; i++) {
          cleanupFns[i]();
        }
      }
    } else {
      for (let i = 0; i < this.collectedLeaveElements.length; i++) {
        const element = this.collectedLeaveElements[i];
        this.processLeaveNode(element);
      }
    }

    this.totalQueuedPlayers = 0;
    this.collectedEnterElements.length = 0;
    this.collectedLeaveElements.length = 0;
    this._flushFns.forEach(fn => fn());
    this._flushFns = [];

    if (this._whenQuietFns.length) {
      // we move these over to a variable so that
      // if any new callbacks are registered in another
      // flush they do not populate the existing set
      const quietFns = this._whenQuietFns;
      this._whenQuietFns = [];

      if (players.length) {
        optimizeGroupPlayer(players).onDone(() => { quietFns.forEach(fn => fn()); });
      } else {
        quietFns.forEach(fn => fn());
      }
    }
  }

  private _flushAnimations(cleanupFns: Function[], microtaskId: number):
      TransitionAnimationPlayer[] {
    const subTimelines = new ElementInstructionMap();
    const skippedPlayers: TransitionAnimationPlayer[] = [];
    const skippedPlayersMap = new Map<any, AnimationPlayer[]>();
    const queuedInstructions: QueuedTransition[] = [];
    const queriedElements = new Map<any, TransitionAnimationPlayer[]>();
    const allPreStyleElements = new Map<any, Set<string>>();
    const allPostStyleElements = new Map<any, Set<string>>();

    const disabledElementsSet = new Set<any>();
    this.disabledNodes.forEach(node => {
      const nodesThatAreDisabled = this.driver.query(node, QUEUED_SELECTOR, true);
      for (let i = 0; i < nodesThatAreDisabled.length; i++) {
        disabledElementsSet.add(nodesThatAreDisabled[i]);
      }
    });

    const bodyNode = getBodyNode();
    const allEnterNodes: any[] = this.collectedEnterElements.length ?
        this.collectedEnterElements.filter(createIsRootFilterFn(this.collectedEnterElements)) :
        [];

    // this must occur before the instructions are built below such that
    // the :enter queries match the elements (since the timeline queries
    // are fired during instruction building).
    for (let i = 0; i < allEnterNodes.length; i++) {
      addClass(allEnterNodes[i], ENTER_CLASSNAME);
    }

    const allLeaveNodes: any[] = [];
    const leaveNodesWithoutAnimations: any[] = [];
    for (let i = 0; i < this.collectedLeaveElements.length; i++) {
      const element = this.collectedLeaveElements[i];
      const details = element[REMOVAL_FLAG] as ElementAnimationState;
      if (details && details.setForRemoval) {
        addClass(element, LEAVE_CLASSNAME);
        allLeaveNodes.push(element);
        if (!details.hasAnimation) {
          leaveNodesWithoutAnimations.push(element);
        }
      }
    }

    cleanupFns.push(() => {
      allEnterNodes.forEach(element => removeClass(element, ENTER_CLASSNAME));
      allLeaveNodes.forEach(element => {
        removeClass(element, LEAVE_CLASSNAME);
        this.processLeaveNode(element);
      });
    });

    const allPlayers: TransitionAnimationPlayer[] = [];
    const erroneousTransitions: AnimationTransitionInstruction[] = [];
    for (let i = this._namespaceList.length - 1; i >= 0; i--) {
      const ns = this._namespaceList[i];
      ns.drainQueuedTransitions(microtaskId).forEach(entry => {
        const player = entry.player;
        allPlayers.push(player);

        const element = entry.element;
        if (!bodyNode || !this.driver.containsElement(bodyNode, element)) {
          player.destroy();
          return;
        }

        const instruction = this._buildInstruction(entry, subTimelines) !;
        if (instruction.errors && instruction.errors.length) {
          erroneousTransitions.push(instruction);
          return;
        }

        // if a unmatched transition is queued to go then it SHOULD NOT render
        // an animation and cancel the previously running animations.
        if (entry.isFallbackTransition) {
          player.onStart(() => eraseStyles(element, instruction.fromStyles));
          player.onDestroy(() => setStyles(element, instruction.toStyles));
          skippedPlayers.push(player);
          return;
        }

        // this means that if a parent animation uses this animation as a sub trigger
        // then it will instruct the timeline builder to not add a player delay, but
        // instead stretch the first keyframe gap up until the animation starts. The
        // reason this is important is to prevent extra initialization styles from being
        // required by the user in the animation.
        instruction.timelines.forEach(tl => tl.stretchStartingKeyframe = true);

        subTimelines.append(element, instruction.timelines);

        const tuple = {instruction, player, element};

        queuedInstructions.push(tuple);

        instruction.queriedElements.forEach(
            element => getOrSetAsInMap(queriedElements, element, []).push(player));

        instruction.preStyleProps.forEach((stringMap, element) => {
          const props = Object.keys(stringMap);
          if (props.length) {
            let setVal: Set<string> = allPreStyleElements.get(element) !;
            if (!setVal) {
              allPreStyleElements.set(element, setVal = new Set<string>());
            }
            props.forEach(prop => setVal.add(prop));
          }
        });

        instruction.postStyleProps.forEach((stringMap, element) => {
          const props = Object.keys(stringMap);
          let setVal: Set<string> = allPostStyleElements.get(element) !;
          if (!setVal) {
            allPostStyleElements.set(element, setVal = new Set<string>());
          }
          props.forEach(prop => setVal.add(prop));
        });
      });
    }

    if (erroneousTransitions.length) {
      let msg = `Unable to process animations due to the following failed trigger transitions\n`;
      erroneousTransitions.forEach(instruction => {
        msg += `@${instruction.triggerName} has failed due to:\n`;
        instruction.errors !.forEach(error => { msg += `- ${error}\n`; });
      });

      allPlayers.forEach(player => player.destroy());
      throw new Error(msg);
    }

    // these can only be detected here since we have a map of all the elements
    // that have animations attached to them...
    const enterNodesWithoutAnimations: any[] = [];
    for (let i = 0; i < allEnterNodes.length; i++) {
      const element = allEnterNodes[i];
      if (!subTimelines.has(element)) {
        enterNodesWithoutAnimations.push(element);
      }
    }

    const allPreviousPlayersMap = new Map<any, TransitionAnimationPlayer[]>();
    let sortedParentElements: any[] = [];
    queuedInstructions.forEach(entry => {
      const element = entry.element;
      if (subTimelines.has(element)) {
        sortedParentElements.unshift(element);
        this._beforeAnimationBuild(
            entry.player.namespaceId, entry.instruction, allPreviousPlayersMap);
      }
    });

    skippedPlayers.forEach(player => {
      const element = player.element;
      const previousPlayers =
          this._getPreviousPlayers(element, false, player.namespaceId, player.triggerName, null);
      previousPlayers.forEach(
          prevPlayer => { getOrSetAsInMap(allPreviousPlayersMap, element, []).push(prevPlayer); });
    });

    allPreviousPlayersMap.forEach(players => players.forEach(player => player.destroy()));

    // PRE STAGE: fill the ! styles
    const preStylesMap = allPreStyleElements.size ?
        cloakAndComputeStyles(
            this.driver, enterNodesWithoutAnimations, allPreStyleElements, PRE_STYLE) :
        new Map<any, ɵStyleData>();

    // POST STAGE: fill the * styles
    const postStylesMap = cloakAndComputeStyles(
        this.driver, leaveNodesWithoutAnimations, allPostStyleElements, AUTO_STYLE);

    const rootPlayers: TransitionAnimationPlayer[] = [];
    const subPlayers: TransitionAnimationPlayer[] = [];
    queuedInstructions.forEach(entry => {
      const {element, player, instruction} = entry;
      // this means that it was never consumed by a parent animation which
      // means that it is independent and therefore should be set for animation
      if (subTimelines.has(element)) {
        if (disabledElementsSet.has(element)) {
          skippedPlayers.push(player);
          return;
        }

        const innerPlayer = this._buildAnimation(
            player.namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap,
            postStylesMap);
        player.setRealPlayer(innerPlayer);

        let parentHasPriority: any = null;
        for (let i = 0; i < sortedParentElements.length; i++) {
          const parent = sortedParentElements[i];
          if (parent === element) break;
          if (this.driver.containsElement(parent, element)) {
            parentHasPriority = parent;
            break;
          }
        }

        if (parentHasPriority) {
          const parentPlayers = this.playersByElement.get(parentHasPriority);
          if (parentPlayers && parentPlayers.length) {
            player.parentPlayer = optimizeGroupPlayer(parentPlayers);
          }
          skippedPlayers.push(player);
        } else {
          rootPlayers.push(player);
        }
      } else {
        eraseStyles(element, instruction.fromStyles);
        player.onDestroy(() => setStyles(element, instruction.toStyles));
        subPlayers.push(player);
      }
    });

    subPlayers.forEach(player => {
      const playersForElement = skippedPlayersMap.get(player.element);
      if (playersForElement && playersForElement.length) {
        const innerPlayer = optimizeGroupPlayer(playersForElement);
        player.setRealPlayer(innerPlayer);
      }
    });

    // the reason why we don't actually play the animation is
    // because all that a skipped player is designed to do is to
    // fire the start/done transition callback events
    skippedPlayers.forEach(player => {
      if (player.parentPlayer) {
        player.parentPlayer.onDestroy(() => player.destroy());
      } else {
        player.destroy();
      }
    });

    // run through all of the queued removals and see if they
    // were picked up by a query. If not then perform the removal
    // operation right away unless a parent animation is ongoing.
    for (let i = 0; i < allLeaveNodes.length; i++) {
      const element = allLeaveNodes[i];
      const details = element[REMOVAL_FLAG] as ElementAnimationState;
      removeClass(element, LEAVE_CLASSNAME);

      // this means the element has a removal animation that is being
      // taken care of and therefore the inner elements will hang around
      // until that animation is over (or the parent queried animation)
      if (details && details.hasAnimation) continue;

      let players: AnimationPlayer[] = [];

      // if this element is queried or if it contains queried children
      // then we want for the element not to be removed from the page
      // until the queried animations have finished
      if (queriedElements.size) {
        let queriedPlayerResults = queriedElements.get(element);
        if (queriedPlayerResults && queriedPlayerResults.length) {
          players.push(...queriedPlayerResults);
        }

        let queriedInnerElements = this.driver.query(element, NG_ANIMATING_SELECTOR, true);
        for (let j = 0; j < queriedInnerElements.length; j++) {
          let queriedPlayers = queriedElements.get(queriedInnerElements[j]);
          if (queriedPlayers && queriedPlayers.length) {
            players.push(...queriedPlayers);
          }
        }
      }
      if (players.length) {
        removeNodesAfterAnimationDone(this, element, players);
      } else {
        this.processLeaveNode(element);
      }
    }

    // this is required so the cleanup method doesn't remove them
    allLeaveNodes.length = 0;

    rootPlayers.forEach(player => {
      this.players.push(player);
      player.onDone(() => {
        player.destroy();

        const index = this.players.indexOf(player);
        this.players.splice(index, 1);
      });
      player.play();
    });

    return rootPlayers;
  }

  elementContainsData(namespaceId: string, element: any) {
    let containsData = false;
    const details = element[REMOVAL_FLAG] as ElementAnimationState;
    if (details && details.setForRemoval) containsData = true;
    if (this.playersByElement.has(element)) containsData = true;
    if (this.playersByQueriedElement.has(element)) containsData = true;
    if (this.statesByElement.has(element)) containsData = true;
    return this._fetchNamespace(namespaceId).elementContainsData(element) || containsData;
  }

  afterFlush(callback: () => any) { this._flushFns.push(callback); }

  afterFlushAnimationsDone(callback: () => any) { this._whenQuietFns.push(callback); }

  private _getPreviousPlayers(
      element: string, isQueriedElement: boolean, namespaceId?: string, triggerName?: string,
      toStateValue?: any): TransitionAnimationPlayer[] {
    let players: TransitionAnimationPlayer[] = [];
    if (isQueriedElement) {
      const queriedElementPlayers = this.playersByQueriedElement.get(element);
      if (queriedElementPlayers) {
        players = queriedElementPlayers;
      }
    } else {
      const elementPlayers = this.playersByElement.get(element);
      if (elementPlayers) {
        const isRemovalAnimation = !toStateValue || toStateValue == VOID_VALUE;
        elementPlayers.forEach(player => {
          if (player.queued) return;
          if (!isRemovalAnimation && player.triggerName != triggerName) return;
          players.push(player);
        });
      }
    }
    if (namespaceId || triggerName) {
      players = players.filter(player => {
        if (namespaceId && namespaceId != player.namespaceId) return false;
        if (triggerName && triggerName != player.triggerName) return false;
        return true;
      });
    }
    return players;
  }

  private _beforeAnimationBuild(
      namespaceId: string, instruction: AnimationTransitionInstruction,
      allPreviousPlayersMap: Map<any, TransitionAnimationPlayer[]>) {
    // it's important to do this step before destroying the players
    // so that the onDone callback below won't fire before this
    eraseStyles(instruction.element, instruction.fromStyles);

    const triggerName = instruction.triggerName;
    const rootElement = instruction.element;

    // when a removal animation occurs, ALL previous players are collected
    // and destroyed (even if they are outside of the current namespace)
    const targetNameSpaceId: string|undefined =
        instruction.isRemovalTransition ? undefined : namespaceId;
    const targetTriggerName: string|undefined =
        instruction.isRemovalTransition ? undefined : triggerName;

    instruction.timelines.map(timelineInstruction => {
      const element = timelineInstruction.element;
      const isQueriedElement = element !== rootElement;
      const players = getOrSetAsInMap(allPreviousPlayersMap, element, []);
      const previousPlayers = this._getPreviousPlayers(
          element, isQueriedElement, targetNameSpaceId, targetTriggerName, instruction.toState);
      previousPlayers.forEach(player => {
        const realPlayer = player.getRealPlayer() as any;
        if (realPlayer.beforeDestroy) {
          realPlayer.beforeDestroy();
        }
        players.push(player);
      });
    });
  }

  private _buildAnimation(
      namespaceId: string, instruction: AnimationTransitionInstruction,
      allPreviousPlayersMap: Map<any, TransitionAnimationPlayer[]>,
      skippedPlayersMap: Map<any, AnimationPlayer[]>, preStylesMap: Map<any, ɵStyleData>,
      postStylesMap: Map<any, ɵStyleData>): AnimationPlayer {
    const triggerName = instruction.triggerName;
    const rootElement = instruction.element;

    // we first run this so that the previous animation player
    // data can be passed into the successive animation players
    const allQueriedPlayers: TransitionAnimationPlayer[] = [];
    const allConsumedElements = new Set<any>();
    const allSubElements = new Set<any>();
    const allNewPlayers = instruction.timelines.map(timelineInstruction => {
      const element = timelineInstruction.element;
      allConsumedElements.add(element);

      // FIXME (matsko): make sure to-be-removed animations are removed properly
      const details = element[REMOVAL_FLAG];
      if (details && details.removedBeforeQueried) return new NoopAnimationPlayer();

      const isQueriedElement = element !== rootElement;
      const previousPlayers = flattenGroupPlayers(
          (allPreviousPlayersMap.get(element) || EMPTY_PLAYER_ARRAY).map(p => p.getRealPlayer()));

      const preStyles = preStylesMap.get(element);
      const postStyles = postStylesMap.get(element);
      const keyframes = normalizeKeyframes(
          this.driver, this._normalizer, element, timelineInstruction.keyframes, preStyles,
          postStyles);
      const player = this._buildPlayer(timelineInstruction, keyframes, previousPlayers);

      // this means that this particular player belongs to a sub trigger. It is
      // important that we match this player up with the corresponding (@trigger.listener)
      if (timelineInstruction.subTimeline && skippedPlayersMap) {
        allSubElements.add(element);
      }

      if (isQueriedElement) {
        const wrappedPlayer = new TransitionAnimationPlayer(namespaceId, triggerName, element);
        wrappedPlayer.setRealPlayer(player);
        allQueriedPlayers.push(wrappedPlayer);
      }

      return player;
    });

    allQueriedPlayers.forEach(player => {
      getOrSetAsInMap(this.playersByQueriedElement, player.element, []).push(player);
      player.onDone(() => deleteOrUnsetInMap(this.playersByQueriedElement, player.element, player));
    });

    allConsumedElements.forEach(element => addClass(element, NG_ANIMATING_CLASSNAME));
    const player = optimizeGroupPlayer(allNewPlayers);
    player.onDestroy(() => {
      allConsumedElements.forEach(element => removeClass(element, NG_ANIMATING_CLASSNAME));
      setStyles(rootElement, instruction.toStyles);
    });

    // this basically makes all of the callbacks for sub element animations
    // be dependent on the upper players for when they finish
    allSubElements.forEach(
        element => { getOrSetAsInMap(skippedPlayersMap, element, []).push(player); });

    return player;
  }

  private _buildPlayer(
      instruction: AnimationTimelineInstruction, keyframes: ɵStyleData[],
      previousPlayers: AnimationPlayer[]): AnimationPlayer {
    if (keyframes.length > 0) {
      return this.driver.animate(
          instruction.element, keyframes, instruction.duration, instruction.delay,
          instruction.easing, previousPlayers);
    }

    // special case for when an empty transition|definition is provided
    // ... there is no point in rendering an empty animation
    return new NoopAnimationPlayer();
  }
}

export class TransitionAnimationPlayer implements AnimationPlayer {
  private _player: AnimationPlayer = new NoopAnimationPlayer();
  private _containsRealPlayer = false;

  private _queuedCallbacks: {[name: string]: (() => any)[]} = {};
  private _destroyed = false;
  public parentPlayer: AnimationPlayer;

  public markedForDestroy: boolean = false;

  constructor(public namespaceId: string, public triggerName: string, public element: any) {}

  get queued() { return this._containsRealPlayer == false; }

  get destroyed() { return this._destroyed; }

  setRealPlayer(player: AnimationPlayer) {
    if (this._containsRealPlayer) return;

    this._player = player;
    Object.keys(this._queuedCallbacks).forEach(phase => {
      this._queuedCallbacks[phase].forEach(
          callback => listenOnPlayer(player, phase, undefined, callback));
    });
    this._queuedCallbacks = {};
    this._containsRealPlayer = true;
  }

  getRealPlayer() { return this._player; }

  private _queueEvent(name: string, callback: (event: any) => any): void {
    getOrSetAsInMap(this._queuedCallbacks, name, []).push(callback);
  }

  onDone(fn: () => void): void {
    if (this.queued) {
      this._queueEvent('done', fn);
    }
    this._player.onDone(fn);
  }

  onStart(fn: () => void): void {
    if (this.queued) {
      this._queueEvent('start', fn);
    }
    this._player.onStart(fn);
  }

  onDestroy(fn: () => void): void {
    if (this.queued) {
      this._queueEvent('destroy', fn);
    }
    this._player.onDestroy(fn);
  }

  init(): void { this._player.init(); }

  hasStarted(): boolean { return this.queued ? false : this._player.hasStarted(); }

  play(): void { !this.queued && this._player.play(); }

  pause(): void { !this.queued && this._player.pause(); }

  restart(): void { !this.queued && this._player.restart(); }

  finish(): void { this._player.finish(); }

  destroy(): void {
    this._destroyed = true;
    this._player.destroy();
  }

  reset(): void { !this.queued && this._player.reset(); }

  setPosition(p: any): void {
    if (!this.queued) {
      this._player.setPosition(p);
    }
  }

  getPosition(): number { return this.queued ? 0 : this._player.getPosition(); }

  get totalTime(): number { return this._player.totalTime; }
}

function deleteOrUnsetInMap(map: Map<any, any[]>| {[key: string]: any}, key: any, value: any) {
  let currentValues: any[]|null|undefined;
  if (map instanceof Map) {
    currentValues = map.get(key);
    if (currentValues) {
      if (currentValues.length) {
        const index = currentValues.indexOf(value);
        currentValues.splice(index, 1);
      }
      if (currentValues.length == 0) {
        map.delete(key);
      }
    }
  } else {
    currentValues = map[key];
    if (currentValues) {
      if (currentValues.length) {
        const index = currentValues.indexOf(value);
        currentValues.splice(index, 1);
      }
      if (currentValues.length == 0) {
        delete map[key];
      }
    }
  }
  return currentValues;
}

function normalizeTriggerValue(value: any): string {
  switch (typeof value) {
    case 'boolean':
      return value ? '1' : '0';
    default:
      return value != null ? value.toString() : null;
  }
}

function isElementNode(node: any) {
  return node && node['nodeType'] === 1;
}

function isTriggerEventValid(eventName: string): boolean {
  return eventName == 'start' || eventName == 'done';
}

function cloakElement(element: any, value?: string) {
  const oldValue = element.style.display;
  element.style.display = value != null ? value : 'none';
  return oldValue;
}

function cloakAndComputeStyles(
    driver: AnimationDriver, elements: any[], elementPropsMap: Map<any, Set<string>>,
    defaultStyle: string): Map<any, ɵStyleData> {
  const cloakVals = elements.map(element => cloakElement(element));
  const valuesMap = new Map<any, ɵStyleData>();

  elementPropsMap.forEach((props: Set<string>, element: any) => {
    const styles: ɵStyleData = {};
    props.forEach(prop => {
      const value = styles[prop] = driver.computeStyle(element, prop, defaultStyle);

      // there is no easy way to detect this because a sub element could be removed
      // by a parent animation element being detached.
      if (!value || value.length == 0) {
        element[REMOVAL_FLAG] = NULL_REMOVED_QUERIED_STATE;
      }
    });
    valuesMap.set(element, styles);
  });

  elements.forEach((element, i) => cloakElement(element, cloakVals[i]));
  return valuesMap;
}

/*
Since the Angular renderer code will return a collection of inserted
nodes in all areas of a DOM tree, it's up to this algorithm to figure
out which nodes are roots.

By placing all nodes into a set and traversing upwards to the edge,
the recursive code can figure out if a clean path from the DOM node
to the edge container is clear. If no other node is detected in the
set then it is a root element.

This algorithm also keeps track of all nodes along the path so that
if other sibling nodes are also tracked then the lookup process can
skip a lot of steps in between and avoid traversing the entire tree
multiple times to the edge.
 */
function createIsRootFilterFn(nodes: any): (node: any) => boolean {
  const nodeSet = new Set(nodes);
  const knownRootContainer = new Set();
  let isRoot: (node: any) => boolean;
  isRoot = node => {
    if (!node) return true;
    if (nodeSet.has(node.parentNode)) return false;
    if (knownRootContainer.has(node.parentNode)) return true;
    if (isRoot(node.parentNode)) {
      knownRootContainer.add(node);
      return true;
    }
    return false;
  };
  return isRoot;
}

const CLASSES_CACHE_KEY = '$$classes';
function containsClass(element: any, className: string): boolean {
  if (element.classList) {
    return element.classList.contains(className);
  } else {
    const classes = element[CLASSES_CACHE_KEY];
    return classes && classes[className];
  }
}

function addClass(element: any, className: string) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    let classes: {[className: string]: boolean} = element[CLASSES_CACHE_KEY];
    if (!classes) {
      classes = element[CLASSES_CACHE_KEY] = {};
    }
    classes[className] = true;
  }
}

function removeClass(element: any, className: string) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    let classes: {[className: string]: boolean} = element[CLASSES_CACHE_KEY];
    if (classes) {
      delete classes[className];
    }
  }
}

function getBodyNode(): any|null {
  if (typeof document != 'undefined') {
    return document.body;
  }
  return null;
}

function removeNodesAfterAnimationDone(
    engine: TransitionAnimationEngine, element: any, players: AnimationPlayer[]) {
  optimizeGroupPlayer(players).onDone(() => engine.processLeaveNode(element));
}

function flattenGroupPlayers(players: AnimationPlayer[]): AnimationPlayer[] {
  const finalPlayers: AnimationPlayer[] = [];
  _flattenGroupPlayersRecur(players, finalPlayers);
  return finalPlayers;
}

function _flattenGroupPlayersRecur(players: AnimationPlayer[], finalPlayers: AnimationPlayer[]) {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (player instanceof AnimationGroupPlayer) {
      _flattenGroupPlayersRecur(player.players, finalPlayers);
    } else {
      finalPlayers.push(player as AnimationPlayer);
    }
  }
}
