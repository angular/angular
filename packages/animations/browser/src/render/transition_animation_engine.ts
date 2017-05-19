/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AUTO_STYLE, AnimationOptions, AnimationPlayer, NoopAnimationPlayer, ɵPRE_STYLE as PRE_STYLE, ɵStyleData} from '@angular/animations';

import {AnimationTimelineInstruction} from '../dsl/animation_timeline_instruction';
import {AnimationTransitionFactory} from '../dsl/animation_transition_factory';
import {AnimationTransitionInstruction} from '../dsl/animation_transition_instruction';
import {AnimationTrigger} from '../dsl/animation_trigger';
import {ElementInstructionMap} from '../dsl/element_instruction_map';
import {AnimationStyleNormalizer} from '../dsl/style_normalization/animation_style_normalizer';
import {ENTER_CLASSNAME, LEAVE_CLASSNAME, LEAVE_SELECTOR, NG_ANIMATING_CLASSNAME, NG_TRIGGER_CLASSNAME, NG_TRIGGER_SELECTOR, copyObj, eraseStyles, iteratorToArray, setStyles} from '../util';

import {AnimationDriver} from './animation_driver';
import {getOrSetAsInMap, listenOnPlayer, makeAnimationEvent, normalizeKeyframes, optimizeGroupPlayer} from './shared';

const EMPTY_PLAYER_ARRAY: AnimationPlayer[] = [];

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

const POTENTIAL_ENTER_CLASSNAME = ENTER_CLASSNAME + '-temp';
const POTENTIAL_ENTER_SELECTOR = '.' + POTENTIAL_ENTER_CLASSNAME;

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
      addClass(element, NG_ANIMATING_CLASSNAME);
    }

    player.onDone(() => {
      removeClass(element, NG_ANIMATING_CLASSNAME);

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

  private _onElementDestroy(element: any) {
    this._engine.statesByElement.delete(element);
    this._elementListeners.delete(element);
    const elementPlayers = this._engine.playersByElement.get(element);
    if (elementPlayers) {
      elementPlayers.forEach(player => player.destroy());
      this._engine.playersByElement.delete(element);
    }
  }

  private _destroyInnerNodes(rootElement: any, context: any, animate: boolean = false) {
    listToArray(this._engine.driver.query(rootElement, NG_TRIGGER_SELECTOR, true)).forEach(elm => {
      if (animate && containsClass(elm, this._hostClassName)) {
        const innerNs = this._engine.namespacesByHostElement.get(elm);

        // special case for a host element with animations on the same element
        if (innerNs) {
          innerNs.removeNode(elm, context, true);
        }

        this.removeNode(elm, context, true);
      } else {
        this._onElementDestroy(elm);
      }
    });
  }

  removeNode(element: any, context: any, doNotRecurse?: boolean): void {
    const engine = this._engine;

    addClass(element, LEAVE_CLASSNAME);
    engine.afterFlush(() => removeClass(element, LEAVE_CLASSNAME));

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
        optimizeGroupPlayer(players).onDone(() => {
          engine.destroyInnerAnimations(element);
          this._onElementDestroy(element);
          engine._onRemovalComplete(element, context);
        });

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
      engine.queuedRemovals.set(element, () => {
        engine.destroyInnerAnimations(element);
        this._onElementDestroy(element);
        engine._onRemovalComplete(element, context);
      });
    } else {
      // we do this after the flush has occurred such
      // that the callbacks can be fired
      engine.afterFlush(() => this._onElementDestroy(element));
      engine.destroyInnerAnimations(element);
      engine._onRemovalComplete(element, context);
    }
  }

  insertNode(element: any, parent: any): void { addClass(element, this._hostClassName); }

  drainQueuedTransitions(countId: number): QueueInstruction[] {
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
            (baseEvent as any)['_data'] = countId;
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
  public queuedRemovals = new Map<any, () => any>();
  public newlyInserted = new Set<any>();
  public newHostElements = new Map<any, AnimationTransitionNamespace>();
  public playersByElement = new Map<any, TransitionAnimationPlayer[]>();
  public playersByQueriedElement = new Map<any, TransitionAnimationPlayer[]>();
  public statesByElement = new Map<any, {[triggerName: string]: StateValue}>();
  public totalAnimations = 0;
  public totalQueuedPlayers = 0;

  private _namespaceLookup: {[id: string]: AnimationTransitionNamespace} = {};
  private _namespaceList: AnimationTransitionNamespace[] = [];
  private _flushFns: (() => any)[] = [];
  private _whenQuietFns: (() => any)[] = [];

  public namespacesByHostElement = new Map<any, AnimationTransitionNamespace>();

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
      this.newlyInserted.add(hostElement);
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

  register(namespaceId: string, hostElement: any, name: string, trigger: AnimationTrigger) {
    let ns = this._namespaceLookup[namespaceId];
    if (!ns) {
      ns = this.createNamespace(namespaceId, hostElement);
    }
    if (ns.register(name, trigger)) {
      this.totalAnimations++;
    }
  }

  destroy(namespaceId: string, context: any) {
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

    this._fetchNamespace(namespaceId).insertNode(element, parent);

    // only *directives and host elements are inserted before
    if (insertBefore) {
      this.newlyInserted.add(element);
    }
  }

  removeNode(namespaceId: string, element: any, context: any, doNotRecurse?: boolean): void {
    const ns = this._fetchNamespace(namespaceId);
    if (!isElementNode(element) || !ns) {
      this._onRemovalComplete(element, context);
    } else {
      ns.removeNode(element, context, doNotRecurse);
    }
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
    listToArray(this.driver.query(containerElement, NG_TRIGGER_SELECTOR, true)).forEach(element => {
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

  flush(countId: number = -1) {
    let players: AnimationPlayer[] = [];
    if (this.newHostElements.size) {
      this.newHostElements.forEach((ns, element) => { this._balanceNamespaceList(ns, element); });
      this.newHostElements.clear();
    }

    if (this._namespaceList.length && (this.totalQueuedPlayers || this.queuedRemovals.size)) {
      players = this._flushAnimations(countId);
    }

    this.totalQueuedPlayers = 0;
    this.queuedRemovals.clear();
    this.newlyInserted.clear();
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

  private _flushAnimations(countId: number): TransitionAnimationPlayer[] {
    const subTimelines = new ElementInstructionMap();
    const skippedPlayers: TransitionAnimationPlayer[] = [];
    const skippedPlayersMap = new Map<any, AnimationPlayer[]>();
    const queuedInstructions: QueuedTransition[] = [];
    const queriedElements = new Map<any, TransitionAnimationPlayer[]>();
    const allPreStyleElements = new Map<any, Set<string>>();
    const allPostStyleElements = new Map<any, Set<string>>();

    // this must occur before the instructions are built below such that
    // the :enter queries match the elements (since the timeline queries
    // are fired during instruction building).
    const allEnterNodes = iteratorToArray(this.newlyInserted.values());
    const enterNodes: any[] = collectEnterElements(this.driver, allEnterNodes);
    const bodyNode = getBodyNode();

    for (let i = this._namespaceList.length - 1; i >= 0; i--) {
      const ns = this._namespaceList[i];
      ns.drainQueuedTransitions(countId).forEach(entry => {
        const player = entry.player;

        const element = entry.element;
        if (!bodyNode || !this.driver.containsElement(bodyNode, element)) {
          player.destroy();
          return;
        }

        const instruction = this._buildInstruction(entry, subTimelines);
        if (!instruction) return;

        // if a unmatched transition is queued to go then it SHOULD NOT render
        // an animation and cancel the previously running animations.
        if (entry.isFallbackTransition && !instruction.isRemovalTransition) {
          eraseStyles(element, instruction.fromStyles);
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

    allPreviousPlayersMap.forEach(players => players.forEach(player => player.destroy()));

    const leaveNodes: any[] = bodyNode && allPostStyleElements.size ?
        listToArray(this.driver.query(bodyNode, LEAVE_SELECTOR, true)) :
        [];

    // PRE STAGE: fill the ! styles
    const preStylesMap = allPreStyleElements.size ?
        cloakAndComputeStyles(this.driver, enterNodes, allPreStyleElements, PRE_STYLE) :
        new Map<any, ɵStyleData>();

    // POST STAGE: fill the * styles
    const postStylesMap =
        cloakAndComputeStyles(this.driver, leaveNodes, allPostStyleElements, AUTO_STYLE);

    const rootPlayers: TransitionAnimationPlayer[] = [];
    const subPlayers: TransitionAnimationPlayer[] = [];
    queuedInstructions.forEach(entry => {
      const {element, player, instruction} = entry;
      // this means that it was never consumed by a parent animation which
      // means that it is independent and therefore should be set for animation
      if (subTimelines.has(element)) {
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
    this.queuedRemovals.forEach((fn, element) => {
      const players = queriedElements.get(element);
      if (players) {
        optimizeGroupPlayer(players).onDone(fn);
      } else {
        let elementPlayers: AnimationPlayer[]|null = null;

        let parent = element;
        while (parent = parent.parentNode) {
          const playersForThisElement = this.playersByElement.get(parent);
          if (playersForThisElement && playersForThisElement.length) {
            elementPlayers = playersForThisElement;
            break;
          }
        }

        if (elementPlayers) {
          optimizeGroupPlayer(elementPlayers).onDone(fn);
        } else {
          fn();
        }
      }
    });

    rootPlayers.forEach(player => {
      this.players.push(player);
      player.onDone(() => {
        player.destroy();

        const index = this.players.indexOf(player);
        this.players.splice(index, 1);
      });
      player.play();
    });

    enterNodes.forEach(element => removeClass(element, ENTER_CLASSNAME));

    return rootPlayers;
  }

  elementContainsData(namespaceId: string, element: any) {
    let containsData = false;
    if (this.queuedRemovals.has(element)) containsData = true;
    if (this.newlyInserted.has(element)) containsData = true;
    if (this.playersByElement.has(element)) containsData = true;
    if (this.playersByQueriedElement.has(element)) containsData = true;
    if (this.statesByElement.has(element)) containsData = true;
    return this._fetchNamespace(namespaceId).elementContainsData(element) || containsData;
  }

  afterFlush(callback: () => any) { this._flushFns.push(callback); }

  afterFlushAnimationsDone(callback: () => any) { this._whenQuietFns.push(callback); }

  private _getPreviousPlayers(
      element: string, instruction: AnimationTransitionInstruction, isQueriedElement: boolean,
      namespaceId?: string, triggerName?: string): TransitionAnimationPlayer[] {
    let players: TransitionAnimationPlayer[] = [];
    if (isQueriedElement) {
      const queriedElementPlayers = this.playersByQueriedElement.get(element);
      if (queriedElementPlayers) {
        players = queriedElementPlayers;
      }
    } else {
      const elementPlayers = this.playersByElement.get(element);
      if (elementPlayers) {
        const isRemovalAnimation = instruction.toState == VOID_VALUE;
        elementPlayers.forEach(player => {
          if (player.queued) return;
          if (!isRemovalAnimation && player.triggerName != instruction.triggerName) return;
          players.push(player);
        });
      }
    }
    if (namespaceId || triggerName) {
      players = players.filter(player => {
        if (namespaceId && namespaceId != player.namespaceId) return false;
        if (triggerName && triggerName != player.triggerName) return false;
        return true;
      })
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
          element, instruction, isQueriedElement, targetNameSpaceId, targetTriggerName);
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

      // FIXME (matsko): make sure to-be-removed animations are removed properly
      if (element['REMOVED']) return new NoopAnimationPlayer();

      const isQueriedElement = element !== rootElement;
      let previousPlayers: AnimationPlayer[] = EMPTY_PLAYER_ARRAY;
      if (!allConsumedElements.has(element)) {
        allConsumedElements.add(element);
        const _previousPlayers = allPreviousPlayersMap.get(element);
        if (_previousPlayers) {
          previousPlayers = _previousPlayers.map(p => p.getRealPlayer());
        }
      }
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
      player.onDone(
          () => { deleteOrUnsetInMap(this.playersByQueriedElement, player.element, player); });
    });

    allConsumedElements.forEach(element => addClass(element, NG_ANIMATING_CLASSNAME));

    const player = optimizeGroupPlayer(allNewPlayers);
    player.onDone(() => {
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
      return value ? value.toString() : null;
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

function filterNodeClasses(
    driver: AnimationDriver, rootElement: any | null, selector: string): any[] {
  const rootElements: any[] = [];
  if (!rootElement) return rootElements;

  let cursor: any = rootElement;
  let nextCursor: any = {};
  do {
    nextCursor = driver.query(cursor, selector, false)[0];
    if (!nextCursor) {
      cursor = cursor.parentElement;
      if (!cursor) break;
      nextCursor = cursor = cursor.nextElementSibling;
    } else {
      while (nextCursor && driver.matchesElement(nextCursor, selector)) {
        rootElements.push(nextCursor);
        nextCursor = nextCursor.nextElementSibling;
        if (nextCursor) {
          cursor = nextCursor;
        } else {
          cursor = cursor.parentElement;
          if (!cursor) break;
          nextCursor = cursor = cursor.nextElementSibling;
        }
      }
    }
  } while (nextCursor && nextCursor !== rootElement);

  return rootElements;
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
        element['REMOVED'] = true;
      }
    });
    valuesMap.set(element, styles);
  });

  elements.forEach((element, i) => cloakElement(element, cloakVals[i]));
  return valuesMap;
}

function listToArray(list: any): any[] {
  const arr: any[] = [];
  arr.push(...(list as any[]));
  return arr;
}

function collectEnterElements(driver: AnimationDriver, allEnterNodes: any[]) {
  allEnterNodes.forEach(element => addClass(element, POTENTIAL_ENTER_CLASSNAME));
  const enterNodes = filterNodeClasses(driver, getBodyNode(), POTENTIAL_ENTER_SELECTOR);
  enterNodes.forEach(element => addClass(element, ENTER_CLASSNAME));
  allEnterNodes.forEach(element => removeClass(element, POTENTIAL_ENTER_CLASSNAME));
  return enterNodes;
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
