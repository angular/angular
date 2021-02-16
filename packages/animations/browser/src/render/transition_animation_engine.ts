/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationOptions, AnimationPlayer, AUTO_STYLE, NoopAnimationPlayer, ɵAnimationGroupPlayer as AnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE, ɵStyleData} from '@angular/animations';

import {AnimationTimelineInstruction} from '../dsl/animation_timeline_instruction';
import {AnimationTransitionFactory} from '../dsl/animation_transition_factory';
import {AnimationTransitionInstruction} from '../dsl/animation_transition_instruction';
import {AnimationTrigger} from '../dsl/animation_trigger';
import {ElementInstructionMap} from '../dsl/element_instruction_map';
import {AnimationStyleNormalizer} from '../dsl/style_normalization/animation_style_normalizer';
import {copyObj, ENTER_CLASSNAME, eraseStyles, iteratorToArray, LEAVE_CLASSNAME, NG_ANIMATING_CLASSNAME, NG_ANIMATING_SELECTOR, NG_TRIGGER_CLASSNAME, NG_TRIGGER_SELECTOR, setStyles} from '../util';

import {AnimationDriver} from './animation_driver';
import {getOrSetAsInMap, listenOnPlayer, makeAnimationEvent, normalizeKeyframes, optimizeGroupPlayer} from './shared';

const QUEUED_CLASSNAME = 'ng-animate-queued';
const QUEUED_SELECTOR = '.ng-animate-queued';
const DISABLED_CLASSNAME = 'ng-animate-disabled';
const DISABLED_SELECTOR = '.ng-animate-disabled';
const STAR_CLASSNAME = 'ng-star-inserted';
const STAR_SELECTOR = '.ng-star-inserted';

const EMPTY_PLAYER_ARRAY: TransitionAnimationPlayer[] = [];
const NULL_REMOVAL_STATE: ElementAnimationState = {
  namespaceId: '',
  setForRemoval: false,
  setForMove: false,
  hasAnimation: false,
  removedBeforeQueried: false
};
const NULL_REMOVED_QUERIED_STATE: ElementAnimationState = {
  namespaceId: '',
  setForMove: false,
  setForRemoval: false,
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
  setForRemoval: boolean;
  setForMove: boolean;
  hasAnimation: boolean;
  namespaceId: string;
  removedBeforeQueried: boolean;
}

export class StateValue {
  public value: string;
  public options: AnimationOptions;

  get params(): {[key: string]: any} {
    return this.options.params as {[key: string]: any};
  }

  constructor(input: any, public namespaceId: string = '') {
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
      const oldParams = this.options.params!;
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
      throw new Error(`Unable to listen on the animation trigger event "${
          phase}" because the animation trigger "${name}" doesn\'t exist!`);
    }

    if (phase == null || phase.length == 0) {
      throw new Error(`Unable to listen on the animation trigger "${
          name}" because the provided event is undefined!`);
    }

    if (!isTriggerEventValid(phase)) {
      throw new Error(`The provided animation trigger event "${phase}" for the animation trigger "${
          name}" is not supported!`);
    }

    const listeners = getOrSetAsInMap(this._elementListeners, element, []);
    const data = {name, phase, callback};
    listeners.push(data);

    const triggersWithStates = getOrSetAsInMap(this._engine.statesByElement, element, {});
    if (!triggersWithStates.hasOwnProperty(name)) {
      addClass(element, NG_TRIGGER_CLASSNAME);
      addClass(element, NG_TRIGGER_CLASSNAME + '-' + name);
      triggersWithStates[name] = DEFAULT_STATE_VALUE;
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
    const toState = new StateValue(value, this.id);

    const isObj = value && value.hasOwnProperty('value');
    if (!isObj && fromState) {
      toState.absorbOptions(fromState.options);
    }

    triggersWithStates[triggerName] = toState;

    if (!fromState) {
      fromState = DEFAULT_STATE_VALUE;
    }

    const isRemoval = toState.value === VOID_VALUE;

    // normally this isn't reached by here, however, if an object expression
    // is passed in then it may be a new object each time. Comparing the value
    // is important since that will stay the same despite there being a new object.
    // The removal arc here is special cased because the same element is triggered
    // twice in the event that it contains animations on the outer/inner portions
    // of the host container
    if (!isRemoval && fromState.value === toState.value) {
      // this means that despite the value not changing, some inner params
      // have changed which means that the animation final styles need to be applied
      if (!objEquals(fromState.params, toState.params)) {
        const errors: any[] = [];
        const fromStyles = trigger.matchStyles(fromState.value, fromState.params, errors);
        const toStyles = trigger.matchStyles(toState.value, toState.params, errors);
        if (errors.length) {
          this._engine.reportError(errors);
        } else {
          this._engine.afterFlush(() => {
            eraseStyles(element, fromStyles);
            setStyles(element, toStyles);
          });
        }
      }
      return;
    }

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

    let transition =
        trigger.matchTransition(fromState.value, toState.value, element, toState.params);
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
      player.onStart(() => {
        removeClass(element, QUEUED_CLASSNAME);
      });
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

    this._engine.statesByElement.forEach((stateMap, element) => {
      delete stateMap[name];
    });

    this._elementListeners.forEach((listeners, element) => {
      this._elementListeners.set(element, listeners.filter(entry => {
        return entry.name != name;
      }));
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

  private _signalRemovalForInnerTriggers(rootElement: any, context: any) {
    const elements = this._engine.driver.query(rootElement, NG_TRIGGER_SELECTOR, true);

    // emulate a leave animation for all inner nodes within this node.
    // If there are no animations found for any of the nodes then clear the cache
    // for the element.
    elements.forEach(elm => {
      // this means that an inner remove() operation has already kicked off
      // the animation on this element...
      if (elm[REMOVAL_FLAG]) return;

      const namespaces = this._engine.fetchNamespacesByElement(elm);
      if (namespaces.size) {
        namespaces.forEach(ns => ns.triggerLeaveAnimation(elm, context, false, true));
      } else {
        this.clearElementCache(elm);
      }
    });

    // If the child elements were removed along with the parent, their animations might not
    // have completed. Clear all the elements from the cache so we don't end up with a memory leak.
    this._engine.afterFlushAnimationsDone(
        () => elements.forEach(elm => this.clearElementCache(elm)));
  }

  triggerLeaveAnimation(
      element: any, context: any, destroyAfterComplete?: boolean,
      defaultToFallback?: boolean): boolean {
    const triggerStates = this._engine.statesByElement.get(element);
    if (triggerStates) {
      const players: TransitionAnimationPlayer[] = [];
      Object.keys(triggerStates).forEach(triggerName => {
        // this check is here in the event that an element is removed
        // twice (both on the host level and the component level)
        if (this._triggers[triggerName]) {
          const player = this.trigger(element, triggerName, VOID_VALUE, defaultToFallback);
          if (player) {
            players.push(player);
          }
        }
      });

      if (players.length) {
        this._engine.markElementAsRemoved(this.id, element, true, context);
        if (destroyAfterComplete) {
          optimizeGroupPlayer(players).onDone(() => this._engine.processLeaveNode(element));
        }
        return true;
      }
    }
    return false;
  }

  prepareLeaveAnimationListeners(element: any) {
    const listeners = this._elementListeners.get(element);
    const elementStates = this._engine.statesByElement.get(element);

    // if this statement fails then it means that the element was picked up
    // by an earlier flush (or there are no listeners at all to track the leave).
    if (listeners && elementStates) {
      const visitedTriggers = new Set<string>();
      listeners.forEach(listener => {
        const triggerName = listener.name;
        if (visitedTriggers.has(triggerName)) return;
        visitedTriggers.add(triggerName);

        const trigger = this._triggers[triggerName];
        const transition = trigger.fallbackTransition;
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
  }

  removeNode(element: any, context: any): void {
    const engine = this._engine;
    if (element.childElementCount) {
      this._signalRemovalForInnerTriggers(element, context);
    }

    // this means that a * => VOID animation was detected and kicked off
    if (this.triggerLeaveAnimation(element, context, true)) return;

    // find the player that is animating and make sure that the
    // removal is delayed until that player has completed
    let containsPotentialParentTransition = false;
    if (engine.totalAnimations) {
      const currentPlayers =
          engine.players.length ? engine.playersByQueriedElement.get(element) : [];

      // when this `if statement` does not continue forward it means that
      // a previous animation query has selected the current element and
      // is animating it. In this situation want to continue forwards and
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
    this.prepareLeaveAnimationListeners(element);

    // whether or not a parent has an animation we need to delay the deferral of the leave
    // operation until we have more information (which we do after flush() has been called)
    if (containsPotentialParentTransition) {
      engine.markElementAsRemoved(this.id, element, false, context);
    } else {
      const removalFlag = element[REMOVAL_FLAG];
      if (!removalFlag || removalFlag === NULL_REMOVAL_STATE) {
        // we do this after the flush has occurred such
        // that the callbacks can be fired
        engine.afterFlush(() => this.clearElementCache(element));
        engine.destroyInnerAnimations(element);
        engine._onRemovalComplete(element, context);
      }
    }
  }

  insertNode(element: any, parent: any): void {
    addClass(element, this._hostClassName);
  }

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
    this._signalRemovalForInnerTriggers(this.hostElement, context);
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

  /** @internal */
  _onRemovalComplete(element: any, context: any) {
    this.onRemovalComplete(element, context);
  }

  constructor(
      public bodyNode: any, public driver: AnimationDriver,
      private _normalizer: AnimationStyleNormalizer) {}

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

  private _fetchNamespace(id: string) {
    return this._namespaceLookup[id];
  }

  fetchNamespacesByElement(element: any): Set<AnimationTransitionNamespace> {
    // normally there should only be one namespace per element, however
    // if @triggers are placed on both the component element and then
    // its host element (within the component code) then there will be
    // two namespaces returned. We use a set here to simply the dedupe
    // of namespaces incase there are multiple triggers both the elm and host
    const namespaces = new Set<AnimationTransitionNamespace>();
    const elementStates = this.statesByElement.get(element);
    if (elementStates) {
      const keys = Object.keys(elementStates);
      for (let i = 0; i < keys.length; i++) {
        const nsId = elementStates[keys[i]].namespaceId;
        if (nsId) {
          const ns = this._fetchNamespace(nsId);
          if (ns) {
            namespaces.add(ns);
          }
        }
      }
    }
    return namespaces;
  }

  trigger(namespaceId: string, element: any, name: string, value: any): boolean {
    if (isElementNode(element)) {
      const ns = this._fetchNamespace(namespaceId);
      if (ns) {
        ns.trigger(element, name, value);
        return true;
      }
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
      details.setForMove = true;
      const index = this.collectedLeaveElements.indexOf(element);
      if (index >= 0) {
        this.collectedLeaveElements.splice(index, 1);
      }
    }

    // in the event that the namespaceId is blank then the caller
    // code does not contain any animation code in it, but it is
    // just being called so that the node is marked as being inserted
    if (namespaceId) {
      const ns = this._fetchNamespace(namespaceId);
      // This if-statement is a workaround for router issue #21947.
      // The router sometimes hits a race condition where while a route
      // is being instantiated a new navigation arrives, triggering leave
      // animation of DOM that has not been fully initialized, until this
      // is resolved, we need to handle the scenario when DOM is not in a
      // consistent state during the animation.
      if (ns) {
        ns.insertNode(element, parent);
      }
    }

    // only *directives and host elements are inserted before
    if (insertBefore) {
      this.collectEnterElement(element);
    }
  }

  collectEnterElement(element: any) {
    this.collectedEnterElements.push(element);
  }

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

  removeNode(namespaceId: string, element: any, isHostElement: boolean, context: any): void {
    if (isElementNode(element)) {
      const ns = namespaceId ? this._fetchNamespace(namespaceId) : null;
      if (ns) {
        ns.removeNode(element, context);
      } else {
        this.markElementAsRemoved(namespaceId, element, false, context);
      }

      if (isHostElement) {
        const hostNS = this.namespacesByHostElement.get(element);
        if (hostNS && hostNS.id !== namespaceId) {
          hostNS.removeNode(element, context);
        }
      }
    } else {
      this._onRemovalComplete(element, context);
    }
  }

  markElementAsRemoved(namespaceId: string, element: any, hasAnimation?: boolean, context?: any) {
    this.collectedLeaveElements.push(element);
    element[REMOVAL_FLAG] =
        {namespaceId, setForRemoval: context, hasAnimation, removedBeforeQueried: false};
  }

  listen(
      namespaceId: string, element: any, name: string, phase: string,
      callback: (event: any) => boolean): () => any {
    if (isElementNode(element)) {
      return this._fetchNamespace(namespaceId).listen(element, name, phase, callback);
    }
    return () => {};
  }

  private _buildInstruction(
      entry: QueueInstruction, subTimelines: ElementInstructionMap, enterClassName: string,
      leaveClassName: string, skipBuildAst?: boolean) {
    return entry.transition.build(
        this.driver, entry.element, entry.fromState.value, entry.toState.value, enterClassName,
        leaveClassName, entry.fromState.options, entry.toState.options, subTimelines, skipBuildAst);
  }

  destroyInnerAnimations(containerElement: any) {
    let elements = this.driver.query(containerElement, NG_TRIGGER_SELECTOR, true);
    elements.forEach(element => this.destroyActiveAnimationsForElement(element));

    if (this.playersByQueriedElement.size == 0) return;

    elements = this.driver.query(containerElement, NG_ANIMATING_SELECTOR, true);
    elements.forEach(element => this.finishActiveQueriedAnimationOnElement(element));
  }

  destroyActiveAnimationsForElement(element: any) {
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
  }

  finishActiveQueriedAnimationOnElement(element: any) {
    const players = this.playersByQueriedElement.get(element);
    if (players) {
      players.forEach(player => player.finish());
    }
  }

  whenRenderingDone(): Promise<any> {
    return new Promise<void>(resolve => {
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
      this.markElementAsDisabled(node, false);
    });
  }

  flush(microtaskId: number = -1) {
    let players: AnimationPlayer[] = [];
    if (this.newHostElements.size) {
      this.newHostElements.forEach((ns, element) => this._balanceNamespaceList(ns, element));
      this.newHostElements.clear();
    }

    if (this.totalAnimations && this.collectedEnterElements.length) {
      for (let i = 0; i < this.collectedEnterElements.length; i++) {
        const elm = this.collectedEnterElements[i];
        addClass(elm, STAR_CLASSNAME);
      }
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
        optimizeGroupPlayer(players).onDone(() => {
          quietFns.forEach(fn => fn());
        });
      } else {
        quietFns.forEach(fn => fn());
      }
    }
  }

  reportError(errors: string[]) {
    throw new Error(
        `Unable to process animations due to the following failed trigger transitions\n ${
            errors.join('\n')}`);
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
      disabledElementsSet.add(node);
      const nodesThatAreDisabled = this.driver.query(node, QUEUED_SELECTOR, true);
      for (let i = 0; i < nodesThatAreDisabled.length; i++) {
        disabledElementsSet.add(nodesThatAreDisabled[i]);
      }
    });

    const bodyNode = this.bodyNode;
    const allTriggerElements = Array.from(this.statesByElement.keys());
    const enterNodeMap = buildRootMap(allTriggerElements, this.collectedEnterElements);

    // this must occur before the instructions are built below such that
    // the :enter queries match the elements (since the timeline queries
    // are fired during instruction building).
    const enterNodeMapIds = new Map<any, string>();
    let i = 0;
    enterNodeMap.forEach((nodes, root) => {
      const className = ENTER_CLASSNAME + i++;
      enterNodeMapIds.set(root, className);
      nodes.forEach(node => addClass(node, className));
    });

    const allLeaveNodes: any[] = [];
    const mergedLeaveNodes = new Set<any>();
    const leaveNodesWithoutAnimations = new Set<any>();
    for (let i = 0; i < this.collectedLeaveElements.length; i++) {
      const element = this.collectedLeaveElements[i];
      const details = element[REMOVAL_FLAG] as ElementAnimationState;
      if (details && details.setForRemoval) {
        allLeaveNodes.push(element);
        mergedLeaveNodes.add(element);
        if (details.hasAnimation) {
          this.driver.query(element, STAR_SELECTOR, true).forEach(elm => mergedLeaveNodes.add(elm));
        } else {
          leaveNodesWithoutAnimations.add(element);
        }
      }
    }

    const leaveNodeMapIds = new Map<any, string>();
    const leaveNodeMap = buildRootMap(allTriggerElements, Array.from(mergedLeaveNodes));
    leaveNodeMap.forEach((nodes, root) => {
      const className = LEAVE_CLASSNAME + i++;
      leaveNodeMapIds.set(root, className);
      nodes.forEach(node => addClass(node, className));
    });

    cleanupFns.push(() => {
      enterNodeMap.forEach((nodes, root) => {
        const className = enterNodeMapIds.get(root)!;
        nodes.forEach(node => removeClass(node, className));
      });

      leaveNodeMap.forEach((nodes, root) => {
        const className = leaveNodeMapIds.get(root)!;
        nodes.forEach(node => removeClass(node, className));
      });

      allLeaveNodes.forEach(element => {
        this.processLeaveNode(element);
      });
    });

    const allPlayers: TransitionAnimationPlayer[] = [];
    const erroneousTransitions: AnimationTransitionInstruction[] = [];
    for (let i = this._namespaceList.length - 1; i >= 0; i--) {
      const ns = this._namespaceList[i];
      ns.drainQueuedTransitions(microtaskId).forEach(entry => {
        const player = entry.player;
        const element = entry.element;
        allPlayers.push(player);

        if (this.collectedEnterElements.length) {
          const details = element[REMOVAL_FLAG] as ElementAnimationState;
          // move animations are currently not supported...
          if (details && details.setForMove) {
            player.destroy();
            return;
          }
        }

        const nodeIsOrphaned = !bodyNode || !this.driver.containsElement(bodyNode, element);
        const leaveClassName = leaveNodeMapIds.get(element)!;
        const enterClassName = enterNodeMapIds.get(element)!;
        const instruction = this._buildInstruction(
            entry, subTimelines, enterClassName, leaveClassName, nodeIsOrphaned)!;
        if (instruction.errors && instruction.errors.length) {
          erroneousTransitions.push(instruction);
          return;
        }

        // even though the element may not be apart of the DOM, it may
        // still be added at a later point (due to the mechanics of content
        // projection and/or dynamic component insertion) therefore it's
        // important we still style the element.
        if (nodeIsOrphaned) {
          player.onStart(() => eraseStyles(element, instruction.fromStyles));
          player.onDestroy(() => setStyles(element, instruction.toStyles));
          skippedPlayers.push(player);
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
            let setVal: Set<string> = allPreStyleElements.get(element)!;
            if (!setVal) {
              allPreStyleElements.set(element, setVal = new Set<string>());
            }
            props.forEach(prop => setVal.add(prop));
          }
        });

        instruction.postStyleProps.forEach((stringMap, element) => {
          const props = Object.keys(stringMap);
          let setVal: Set<string> = allPostStyleElements.get(element)!;
          if (!setVal) {
            allPostStyleElements.set(element, setVal = new Set<string>());
          }
          props.forEach(prop => setVal.add(prop));
        });
      });
    }

    if (erroneousTransitions.length) {
      const errors: string[] = [];
      erroneousTransitions.forEach(instruction => {
        errors.push(`@${instruction.triggerName} has failed due to:\n`);
        instruction.errors!.forEach(error => errors.push(`- ${error}\n`));
      });

      allPlayers.forEach(player => player.destroy());
      this.reportError(errors);
    }

    const allPreviousPlayersMap = new Map<any, TransitionAnimationPlayer[]>();
    // this map works to tell which element in the DOM tree is contained by
    // which animation. Further down below this map will get populated once
    // the players are built and in doing so it can efficiently figure out
    // if a sub player is skipped due to a parent player having priority.
    const animationElementMap = new Map<any, any>();
    queuedInstructions.forEach(entry => {
      const element = entry.element;
      if (subTimelines.has(element)) {
        animationElementMap.set(element, element);
        this._beforeAnimationBuild(
            entry.player.namespaceId, entry.instruction, allPreviousPlayersMap);
      }
    });

    skippedPlayers.forEach(player => {
      const element = player.element;
      const previousPlayers =
          this._getPreviousPlayers(element, false, player.namespaceId, player.triggerName, null);
      previousPlayers.forEach(prevPlayer => {
        getOrSetAsInMap(allPreviousPlayersMap, element, []).push(prevPlayer);
        prevPlayer.destroy();
      });
    });

    // this is a special case for nodes that will be removed (either by)
    // having their own leave animations or by being queried in a container
    // that will be removed once a parent animation is complete. The idea
    // here is that * styles must be identical to ! styles because of
    // backwards compatibility (* is also filled in by default in many places).
    // Otherwise * styles will return an empty value or auto since the element
    // that is being getComputedStyle'd will not be visible (since * = destination)
    const replaceNodes = allLeaveNodes.filter(node => {
      return replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements);
    });

    // POST STAGE: fill the * styles
    const postStylesMap = new Map<any, ɵStyleData>();
    const allLeaveQueriedNodes = cloakAndComputeStyles(
        postStylesMap, this.driver, leaveNodesWithoutAnimations, allPostStyleElements, AUTO_STYLE);

    allLeaveQueriedNodes.forEach(node => {
      if (replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements)) {
        replaceNodes.push(node);
      }
    });

    // PRE STAGE: fill the ! styles
    const preStylesMap = new Map<any, ɵStyleData>();
    enterNodeMap.forEach((nodes, root) => {
      cloakAndComputeStyles(
          preStylesMap, this.driver, new Set(nodes), allPreStyleElements, PRE_STYLE);
    });

    replaceNodes.forEach(node => {
      const post = postStylesMap.get(node);
      const pre = preStylesMap.get(node);
      postStylesMap.set(node, {...post, ...pre} as any);
    });

    const rootPlayers: TransitionAnimationPlayer[] = [];
    const subPlayers: TransitionAnimationPlayer[] = [];
    const NO_PARENT_ANIMATION_ELEMENT_DETECTED = {};
    queuedInstructions.forEach(entry => {
      const {element, player, instruction} = entry;
      // this means that it was never consumed by a parent animation which
      // means that it is independent and therefore should be set for animation
      if (subTimelines.has(element)) {
        if (disabledElementsSet.has(element)) {
          player.onDestroy(() => setStyles(element, instruction.toStyles));
          player.disabled = true;
          player.overrideTotalTime(instruction.totalTime);
          skippedPlayers.push(player);
          return;
        }

        // this will flow up the DOM and query the map to figure out
        // if a parent animation has priority over it. In the situation
        // that a parent is detected then it will cancel the loop. If
        // nothing is detected, or it takes a few hops to find a parent,
        // then it will fill in the missing nodes and signal them as having
        // a detected parent (or a NO_PARENT value via a special constant).
        let parentWithAnimation: any = NO_PARENT_ANIMATION_ELEMENT_DETECTED;
        if (animationElementMap.size > 1) {
          let elm = element;
          const parentsToAdd: any[] = [];
          while (elm = elm.parentNode) {
            const detectedParent = animationElementMap.get(elm);
            if (detectedParent) {
              parentWithAnimation = detectedParent;
              break;
            }
            parentsToAdd.push(elm);
          }
          parentsToAdd.forEach(parent => animationElementMap.set(parent, parentWithAnimation));
        }

        const innerPlayer = this._buildAnimation(
            player.namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap,
            postStylesMap);

        player.setRealPlayer(innerPlayer);

        if (parentWithAnimation === NO_PARENT_ANIMATION_ELEMENT_DETECTED) {
          rootPlayers.push(player);
        } else {
          const parentPlayers = this.playersByElement.get(parentWithAnimation);
          if (parentPlayers && parentPlayers.length) {
            player.parentPlayer = optimizeGroupPlayer(parentPlayers);
          }
          skippedPlayers.push(player);
        }
      } else {
        eraseStyles(element, instruction.fromStyles);
        player.onDestroy(() => setStyles(element, instruction.toStyles));
        // there still might be a ancestor player animating this
        // element therefore we will still add it as a sub player
        // even if its animation may be disabled
        subPlayers.push(player);
        if (disabledElementsSet.has(element)) {
          skippedPlayers.push(player);
        }
      }
    });

    // find all of the sub players' corresponding inner animation player
    subPlayers.forEach(player => {
      // even if any players are not found for a sub animation then it
      // will still complete itself after the next tick since it's Noop
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
        player.syncPlayerEvents(player.parentPlayer);
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

      let players: TransitionAnimationPlayer[] = [];

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

      const activePlayers = players.filter(p => !p.destroyed);
      if (activePlayers.length) {
        removeNodesAfterAnimationDone(this, element, activePlayers);
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

  afterFlush(callback: () => any) {
    this._flushFns.push(callback);
  }

  afterFlushAnimationsDone(callback: () => any) {
    this._whenQuietFns.push(callback);
  }

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
    const triggerName = instruction.triggerName;
    const rootElement = instruction.element;

    // when a removal animation occurs, ALL previous players are collected
    // and destroyed (even if they are outside of the current namespace)
    const targetNameSpaceId: string|undefined =
        instruction.isRemovalTransition ? undefined : namespaceId;
    const targetTriggerName: string|undefined =
        instruction.isRemovalTransition ? undefined : triggerName;

    for (const timelineInstruction of instruction.timelines) {
      const element = timelineInstruction.element;
      const isQueriedElement = element !== rootElement;
      const players = getOrSetAsInMap(allPreviousPlayersMap, element, []);
      const previousPlayers = this._getPreviousPlayers(
          element, isQueriedElement, targetNameSpaceId, targetTriggerName, instruction.toState);
      previousPlayers.forEach(player => {
        const realPlayer = (player as TransitionAnimationPlayer).getRealPlayer() as any;
        if (realPlayer.beforeDestroy) {
          realPlayer.beforeDestroy();
        }
        player.destroy();
        players.push(player);
      });
    }

    // this needs to be done so that the PRE/POST styles can be
    // computed properly without interfering with the previous animation
    eraseStyles(rootElement, instruction.fromStyles);
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
      if (details && details.removedBeforeQueried)
        return new NoopAnimationPlayer(timelineInstruction.duration, timelineInstruction.delay);

      const isQueriedElement = element !== rootElement;
      const previousPlayers =
          flattenGroupPlayers((allPreviousPlayersMap.get(element) || EMPTY_PLAYER_ARRAY)
                                  .map(p => p.getRealPlayer()))
              .filter(p => {
                // the `element` is not apart of the AnimationPlayer definition, but
                // Mock/WebAnimations
                // use the element within their implementation. This will be added in Angular5 to
                // AnimationPlayer
                const pp = p as any;
                return pp.element ? pp.element === element : false;
              });

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
    allSubElements.forEach(element => {
      getOrSetAsInMap(skippedPlayersMap, element, []).push(player);
    });

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
    return new NoopAnimationPlayer(instruction.duration, instruction.delay);
  }
}

export class TransitionAnimationPlayer implements AnimationPlayer {
  private _player: AnimationPlayer = new NoopAnimationPlayer();
  private _containsRealPlayer = false;

  private _queuedCallbacks: {[name: string]: (() => any)[]} = {};
  public readonly destroyed = false;
  // TODO(issue/24571): remove '!'.
  public parentPlayer!: AnimationPlayer;

  public markedForDestroy: boolean = false;
  public disabled = false;

  readonly queued: boolean = true;
  public readonly totalTime: number = 0;

  constructor(public namespaceId: string, public triggerName: string, public element: any) {}

  setRealPlayer(player: AnimationPlayer) {
    if (this._containsRealPlayer) return;

    this._player = player;
    Object.keys(this._queuedCallbacks).forEach(phase => {
      this._queuedCallbacks[phase].forEach(
          callback => listenOnPlayer(player, phase, undefined, callback));
    });
    this._queuedCallbacks = {};
    this._containsRealPlayer = true;
    this.overrideTotalTime(player.totalTime);
    (this as {queued: boolean}).queued = false;
  }

  getRealPlayer() {
    return this._player;
  }

  overrideTotalTime(totalTime: number) {
    (this as any).totalTime = totalTime;
  }

  syncPlayerEvents(player: AnimationPlayer) {
    const p = this._player as any;
    if (p.triggerCallback) {
      player.onStart(() => p.triggerCallback!('start'));
    }
    player.onDone(() => this.finish());
    player.onDestroy(() => this.destroy());
  }

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

  init(): void {
    this._player.init();
  }

  hasStarted(): boolean {
    return this.queued ? false : this._player.hasStarted();
  }

  play(): void {
    !this.queued && this._player.play();
  }

  pause(): void {
    !this.queued && this._player.pause();
  }

  restart(): void {
    !this.queued && this._player.restart();
  }

  finish(): void {
    this._player.finish();
  }

  destroy(): void {
    (this as {destroyed: boolean}).destroyed = true;
    this._player.destroy();
  }

  reset(): void {
    !this.queued && this._player.reset();
  }

  setPosition(p: any): void {
    if (!this.queued) {
      this._player.setPosition(p);
    }
  }

  getPosition(): number {
    return this.queued ? 0 : this._player.getPosition();
  }

  /** @internal */
  triggerCallback(phaseName: string): void {
    const p = this._player as any;
    if (p.triggerCallback) {
      p.triggerCallback(phaseName);
    }
  }
}

function deleteOrUnsetInMap(map: Map<any, any[]>|{[key: string]: any}, key: any, value: any) {
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

function normalizeTriggerValue(value: any): any {
  // we use `!= null` here because it's the most simple
  // way to test against a "falsy" value without mixing
  // in empty strings or a zero value. DO NOT OPTIMIZE.
  return value != null ? value : null;
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
    valuesMap: Map<any, ɵStyleData>, driver: AnimationDriver, elements: Set<any>,
    elementPropsMap: Map<any, Set<string>>, defaultStyle: string): any[] {
  const cloakVals: string[] = [];
  elements.forEach(element => cloakVals.push(cloakElement(element)));

  const failedElements: any[] = [];

  elementPropsMap.forEach((props: Set<string>, element: any) => {
    const styles: ɵStyleData = {};
    props.forEach(prop => {
      const value = styles[prop] = driver.computeStyle(element, prop, defaultStyle);

      // there is no easy way to detect this because a sub element could be removed
      // by a parent animation element being detached.
      if (!value || value.length == 0) {
        element[REMOVAL_FLAG] = NULL_REMOVED_QUERIED_STATE;
        failedElements.push(element);
      }
    });
    valuesMap.set(element, styles);
  });

  // we use a index variable here since Set.forEach(a, i) does not return
  // an index value for the closure (but instead just the value)
  let i = 0;
  elements.forEach(element => cloakElement(element, cloakVals[i++]));

  return failedElements;
}

/*
Since the Angular renderer code will return a collection of inserted
nodes in all areas of a DOM tree, it's up to this algorithm to figure
out which nodes are roots for each animation @trigger.

By placing each inserted node into a Set and traversing upwards, it
is possible to find the @trigger elements and well any direct *star
insertion nodes, if a @trigger root is found then the enter element
is placed into the Map[@trigger] spot.
 */
function buildRootMap(roots: any[], nodes: any[]): Map<any, any[]> {
  const rootMap = new Map<any, any[]>();
  roots.forEach(root => rootMap.set(root, []));

  if (nodes.length == 0) return rootMap;

  const NULL_NODE = 1;
  const nodeSet = new Set(nodes);
  const localRootMap = new Map<any, any>();

  function getRoot(node: any): any {
    if (!node) return NULL_NODE;

    let root = localRootMap.get(node);
    if (root) return root;

    const parent = node.parentNode;
    if (rootMap.has(parent)) {  // ngIf inside @trigger
      root = parent;
    } else if (nodeSet.has(parent)) {  // ngIf inside ngIf
      root = NULL_NODE;
    } else {  // recurse upwards
      root = getRoot(parent);
    }

    localRootMap.set(node, root);
    return root;
  }

  nodes.forEach(node => {
    const root = getRoot(node);
    if (root !== NULL_NODE) {
      rootMap.get(root)!.push(node);
    }
  });

  return rootMap;
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
      finalPlayers.push(player);
    }
  }
}

function objEquals(a: {[key: string]: any}, b: {[key: string]: any}): boolean {
  const k1 = Object.keys(a);
  const k2 = Object.keys(b);
  if (k1.length != k2.length) return false;
  for (let i = 0; i < k1.length; i++) {
    const prop = k1[i];
    if (!b.hasOwnProperty(prop) || a[prop] !== b[prop]) return false;
  }
  return true;
}

function replacePostStylesAsPre(
    element: any, allPreStyleElements: Map<any, Set<string>>,
    allPostStyleElements: Map<any, Set<string>>): boolean {
  const postEntry = allPostStyleElements.get(element);
  if (!postEntry) return false;

  let preEntry = allPreStyleElements.get(element);
  if (preEntry) {
    postEntry.forEach(data => preEntry!.add(data));
  } else {
    allPreStyleElements.set(element, postEntry);
  }

  allPostStyleElements.delete(element);
  return true;
}
