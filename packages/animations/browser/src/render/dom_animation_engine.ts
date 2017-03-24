/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationEvent, AnimationPlayer, AnimationTriggerMetadata, NoopAnimationPlayer, ɵAnimationGroupPlayer, ɵStyleData} from '@angular/animations';

import {AnimationTimelineInstruction} from '../dsl/animation_timeline_instruction';
import {AnimationTransitionInstruction} from '../dsl/animation_transition_instruction';
import {AnimationTrigger, buildTrigger} from '../dsl/animation_trigger';
import {AnimationStyleNormalizer} from '../dsl/style_normalization/animation_style_normalizer';
import {eraseStyles, setStyles} from '../util';

import {AnimationDriver} from './animation_driver';

export interface QueuedAnimationTransitionTuple {
  element: any;
  player: AnimationPlayer;
  triggerName: string;
  event: AnimationEvent;
}

export interface TriggerListenerTuple {
  triggerName: string;
  phase: string;
  callback: (event: any) => any;
}

const MARKED_FOR_ANIMATION_CLASSNAME = 'ng-animating';
const MARKED_FOR_ANIMATION_SELECTOR = '.ng-animating';
const MARKED_FOR_REMOVAL = '$$ngRemove';
const VOID_STATE = 'void';

export class DomAnimationEngine {
  private _flaggedInserts = new Set<any>();
  private _queuedRemovals = new Map<any, () => any>();
  private _queuedTransitionAnimations: QueuedAnimationTransitionTuple[] = [];
  private _activeTransitionAnimations = new Map<any, {[triggerName: string]: AnimationPlayer}>();
  private _activeElementAnimations = new Map<any, AnimationPlayer[]>();

  private _elementTriggerStates = new Map<any, {[triggerName: string]: string}>();

  private _triggers: {[triggerName: string]: AnimationTrigger} = Object.create(null);
  private _triggerListeners = new Map<any, TriggerListenerTuple[]>();

  private _pendingListenerRemovals = new Map<any, TriggerListenerTuple[]>();

  constructor(private _driver: AnimationDriver, private _normalizer: AnimationStyleNormalizer) {}

  get queuedPlayers(): AnimationPlayer[] {
    return this._queuedTransitionAnimations.map(q => q.player);
  }

  get activePlayers(): AnimationPlayer[] {
    const players: AnimationPlayer[] = [];
    this._activeElementAnimations.forEach(activePlayers => players.push(...activePlayers));
    return players;
  }

  registerTrigger(trigger: AnimationTriggerMetadata, name?: string): void {
    name = name || trigger.name;
    if (this._triggers[name]) {
      return;
    }
    this._triggers[name] = buildTrigger(name, trigger.definitions);
  }

  onInsert(element: any, domFn: () => any): void {
    if (element['nodeType'] == 1) {
      this._flaggedInserts.add(element);
    }
    domFn();
  }

  onRemove(element: any, domFn: () => any): void {
    if (element['nodeType'] != 1) {
      domFn();
      return;
    }

    let lookupRef = this._elementTriggerStates.get(element);
    if (lookupRef) {
      const possibleTriggers = Object.keys(lookupRef);
      const hasRemoval = possibleTriggers.some(triggerName => {
        const oldValue = lookupRef ![triggerName];
        const instruction = this._triggers[triggerName].matchTransition(oldValue, VOID_STATE);
        return !!instruction;
      });
      if (hasRemoval) {
        element[MARKED_FOR_REMOVAL] = true;
        this._queuedRemovals.set(element, domFn);
        return;
      }
    }

    // this means that there are no animations to take on this
    // leave operation therefore we should fire the done|start callbacks
    if (this._triggerListeners.has(element)) {
      element[MARKED_FOR_REMOVAL] = true;
      this._queuedRemovals.set(element, () => {});
    }
    this._onRemovalTransition(element).forEach(player => player.destroy());
    domFn();
  }

  setProperty(element: any, property: string, value: any): void {
    const trigger = this._triggers[property];
    if (!trigger) {
      throw new Error(`The provided animation trigger "${property}" has not been registered!`);
    }

    let lookupRef = this._elementTriggerStates.get(element);
    if (!lookupRef) {
      this._elementTriggerStates.set(element, lookupRef = {});
    }

    let oldValue = lookupRef.hasOwnProperty(property) ? lookupRef[property] : VOID_STATE;
    if (oldValue !== value) {
      value = normalizeTriggerValue(value);
      let instruction = trigger.matchTransition(oldValue, value);
      if (!instruction) {
        // we do this to make sure we always have an animation player so
        // that callback operations are properly called
        instruction = trigger.createFallbackInstruction(oldValue, value);
      }
      this.animateTransition(element, instruction);
      lookupRef[property] = value;
    }
  }

  listen(element: any, eventName: string, eventPhase: string, callback: (event: any) => any):
      () => void {
    if (!eventPhase) {
      throw new Error(
          `Unable to listen on the animation trigger "${eventName}" because the provided event is undefined!`);
    }
    if (!this._triggers[eventName]) {
      throw new Error(
          `Unable to listen on the animation trigger event "${eventPhase}" because the animation trigger "${eventName}" doesn't exist!`);
    }
    let elementListeners = this._triggerListeners.get(element);
    if (!elementListeners) {
      this._triggerListeners.set(element, elementListeners = []);
    }
    validatePlayerEvent(eventName, eventPhase);
    const tuple = <TriggerListenerTuple>{triggerName: eventName, phase: eventPhase, callback};
    elementListeners.push(tuple);
    return () => {
      // this is queued up in the event that a removal animation is set
      // to fire on the element (the listeners need to be set during flush)
      getOrSetAsInMap(this._pendingListenerRemovals, element, []).push(tuple);
    };
  }

  private _clearPendingListenerRemovals() {
    this._pendingListenerRemovals.forEach((tuples: TriggerListenerTuple[], element: any) => {
      const elementListeners = this._triggerListeners.get(element);
      if (elementListeners) {
        tuples.forEach(tuple => {
          const index = elementListeners.indexOf(tuple);
          if (index >= 0) {
            elementListeners.splice(index, 1);
          }
        });
      }
    });
    this._pendingListenerRemovals.clear();
  }

  private _onRemovalTransition(element: any): AnimationPlayer[] {
    // when a parent animation is set to trigger a removal we want to
    // find all of the children that are currently animating and clear
    // them out by destroying each of them.
    const elms = element.querySelectorAll(MARKED_FOR_ANIMATION_SELECTOR);
    for (let i = 0; i < elms.length; i++) {
      const elm = elms[i];
      const activePlayers = this._activeElementAnimations.get(elm);
      if (activePlayers) {
        activePlayers.forEach(player => player.destroy());
      }

      const activeTransitions = this._activeTransitionAnimations.get(elm);
      if (activeTransitions) {
        Object.keys(activeTransitions).forEach(triggerName => {
          const player = activeTransitions[triggerName];
          if (player) {
            player.destroy();
          }
        });
      }
    }

    // we make a copy of the array because the actual source array is modified
    // each time a player is finished/destroyed (the forEach loop would fail otherwise)
    return copyArray(this._activeElementAnimations.get(element) !);
  }

  animateTransition(element: any, instruction: AnimationTransitionInstruction): AnimationPlayer {
    const triggerName = instruction.triggerName;

    let previousPlayers: AnimationPlayer[];
    if (instruction.isRemovalTransition) {
      previousPlayers = this._onRemovalTransition(element);
    } else {
      previousPlayers = [];
      const existingTransitions = this._activeTransitionAnimations.get(element);
      const existingPlayer = existingTransitions ? existingTransitions[triggerName] : null;
      if (existingPlayer) {
        previousPlayers.push(existingPlayer);
      }
    }

    // it's important to do this step before destroying the players
    // so that the onDone callback below won't fire before this
    eraseStyles(element, instruction.fromStyles);

    // we first run this so that the previous animation player
    // data can be passed into the successive animation players
    let totalTime = 0;
    const players = instruction.timelines.map((timelineInstruction, i) => {
      totalTime = Math.max(totalTime, timelineInstruction.totalTime);
      return this._buildPlayer(element, timelineInstruction, previousPlayers, i);
    });

    previousPlayers.forEach(previousPlayer => previousPlayer.destroy());
    const player = optimizeGroupPlayer(players);
    player.onDone(() => {
      player.destroy();
      const elmTransitionMap = this._activeTransitionAnimations.get(element);
      if (elmTransitionMap) {
        delete elmTransitionMap[triggerName];
        if (Object.keys(elmTransitionMap).length == 0) {
          this._activeTransitionAnimations.delete(element);
        }
      }
      deleteFromArrayMap(this._activeElementAnimations, element, player);
      setStyles(element, instruction.toStyles);
    });

    const elmTransitionMap = getOrSetAsInMap(this._activeTransitionAnimations, element, {});
    elmTransitionMap[triggerName] = player;

    this._queuePlayer(
        element, triggerName, player,
        makeAnimationEvent(
            element, triggerName, instruction.fromState, instruction.toState,
            null,  // this will be filled in during event creation
            totalTime));

    return player;
  }

  public animateTimeline(
      element: any, instructions: AnimationTimelineInstruction[],
      previousPlayers: AnimationPlayer[] = []): AnimationPlayer {
    const players = instructions.map((instruction, i) => {
      const player = this._buildPlayer(element, instruction, previousPlayers, i);
      player.onDestroy(
          () => { deleteFromArrayMap(this._activeElementAnimations, element, player); });
      this._markPlayerAsActive(element, player);
      return player;
    });
    return optimizeGroupPlayer(players);
  }

  private _buildPlayer(
      element: any, instruction: AnimationTimelineInstruction, previousPlayers: AnimationPlayer[],
      index: number = 0): AnimationPlayer {
    // only the very first animation can absorb the previous styles. This
    // is here to prevent the an overlap situation where a group animation
    // absorbs previous styles multiple times for the same element.
    if (index && previousPlayers.length) {
      previousPlayers = [];
    }
    return this._driver.animate(
        element, this._normalizeKeyframes(instruction.keyframes), instruction.duration,
        instruction.delay, instruction.easing, previousPlayers);
  }

  private _normalizeKeyframes(keyframes: ɵStyleData[]): ɵStyleData[] {
    const errors: string[] = [];
    const normalizedKeyframes: ɵStyleData[] = [];
    keyframes.forEach(kf => {
      const normalizedKeyframe: ɵStyleData = {};
      Object.keys(kf).forEach(prop => {
        let normalizedProp = prop;
        let normalizedValue = kf[prop];
        if (prop != 'offset') {
          normalizedProp = this._normalizer.normalizePropertyName(prop, errors);
          normalizedValue =
              this._normalizer.normalizeStyleValue(prop, normalizedProp, kf[prop], errors);
        }
        normalizedKeyframe[normalizedProp] = normalizedValue;
      });
      normalizedKeyframes.push(normalizedKeyframe);
    });
    if (errors.length) {
      const LINE_START = '\n - ';
      throw new Error(
          `Unable to animate due to the following errors:${LINE_START}${errors.join(LINE_START)}`);
    }
    return normalizedKeyframes;
  }

  private _markPlayerAsActive(element: any, player: AnimationPlayer) {
    const elementAnimations = getOrSetAsInMap(this._activeElementAnimations, element, []);
    elementAnimations.push(player);
  }

  private _queuePlayer(
      element: any, triggerName: string, player: AnimationPlayer, event: AnimationEvent) {
    const tuple = <QueuedAnimationTransitionTuple>{element, player, triggerName, event};
    this._queuedTransitionAnimations.push(tuple);
    player.init();

    element.classList.add(MARKED_FOR_ANIMATION_CLASSNAME);
    player.onDone(() => { element.classList.remove(MARKED_FOR_ANIMATION_CLASSNAME); });
  }

  private _flushQueuedAnimations() {
    parentLoop: while (this._queuedTransitionAnimations.length) {
      const {player, element, triggerName, event} = this._queuedTransitionAnimations.shift() !;

      let parent = element;
      while (parent = parent.parentNode) {
        // this means that a parent element will or will not
        // have its own animation operation which in this case
        // there's no point in even trying to do an animation
        if (parent[MARKED_FOR_REMOVAL]) continue parentLoop;
      }

      const listeners = this._triggerListeners.get(element);
      if (listeners) {
        listeners.forEach(tuple => {
          if (tuple.triggerName == triggerName) {
            listenOnPlayer(player, tuple.phase, event, tuple.callback);
          }
        });
      }

      // if a removal exists for the given element then we need cancel
      // all the queued players so that a proper removal animation can go
      if (this._queuedRemovals.has(element)) {
        player.destroy();
        continue;
      }

      this._markPlayerAsActive(element, player);

      // in the event that an animation throws an error then we do
      // not want to re-run animations on any previous animations
      // if they have already been kicked off beforehand
      player.init();
      if (!player.hasStarted()) {
        player.play();
      }
    }
  }

  flush() {
    const leaveListeners = new Map<any, TriggerListenerTuple[]>();
    this._queuedRemovals.forEach((callback, element) => {
      const tuple = this._pendingListenerRemovals.get(element);
      if (tuple) {
        leaveListeners.set(element, tuple);
        this._pendingListenerRemovals.delete(element);
      }
    });

    this._clearPendingListenerRemovals();
    this._pendingListenerRemovals = leaveListeners;

    this._flushQueuedAnimations();

    let flushAgain = false;
    this._queuedRemovals.forEach((callback, element) => {
      // an item that was inserted/removed in the same flush means
      // that an animation should not happen anyway
      if (this._flaggedInserts.has(element)) return;

      let parent = element;
      let players: AnimationPlayer[] = [];
      while (parent = parent.parentNode) {
        // there is no reason to even try to
        if (parent[MARKED_FOR_REMOVAL]) {
          callback();
          return;
        }

        const match = this._activeElementAnimations.get(parent);
        if (match) {
          players.push(...match);
          break;
        }
      }

      // the loop was unable to find an parent that is animating even
      // though this element has set to be removed, so the algorithm
      // should check to see if there are any triggers on the element
      // that are present to handle a leave animation and then setup
      // those players to facilitate the callback after done
      if (players.length == 0) {
        // this means that the element has valid state triggers
        const stateDetails = this._elementTriggerStates.get(element);
        if (stateDetails) {
          Object.keys(stateDetails).forEach(triggerName => {
            flushAgain = true;
            const oldValue = stateDetails[triggerName];
            const instruction = this._triggers[triggerName].matchTransition(oldValue, VOID_STATE);
            if (instruction) {
              players.push(this.animateTransition(element, instruction));
            } else {
              const event = makeAnimationEvent(element, triggerName, oldValue, VOID_STATE, '', 0);
              const player = new NoopAnimationPlayer();
              this._queuePlayer(element, triggerName, player, event);
            }
          });
        }
      }

      if (players.length) {
        optimizeGroupPlayer(players).onDone(callback);
      } else {
        callback();
      }
    });

    this._queuedRemovals.clear();
    this._flaggedInserts.clear();

    // this means that one or more leave animations were detected
    if (flushAgain) {
      this._flushQueuedAnimations();
      this._clearPendingListenerRemovals();
    }
  }
}

function getOrSetAsInMap(map: Map<any, any>, key: any, defaultValue: any) {
  let value = map.get(key);
  if (!value) {
    map.set(key, value = defaultValue);
  }
  return value;
}

function deleteFromArrayMap(map: Map<any, any[]>, key: any, value: any) {
  let arr = map.get(key);
  if (arr) {
    const index = arr.indexOf(value);
    if (index >= 0) {
      arr.splice(index, 1);
      if (arr.length == 0) {
        map.delete(key);
      }
    }
  }
}

function optimizeGroupPlayer(players: AnimationPlayer[]): AnimationPlayer {
  switch (players.length) {
    case 0:
      return new NoopAnimationPlayer();
    case 1:
      return players[0];
    default:
      return new ɵAnimationGroupPlayer(players);
  }
}

function copyArray(source: any[]): any[] {
  return source ? source.splice(0) : [];
}

function validatePlayerEvent(triggerName: string, eventName: string) {
  switch (eventName) {
    case 'start':
    case 'done':
      return;
    default:
      throw new Error(
          `The provided animation trigger event "${eventName}" for the animation trigger "${triggerName}" is not supported!`);
  }
}

function listenOnPlayer(
    player: AnimationPlayer, eventName: string, baseEvent: AnimationEvent,
    callback: (event: any) => any) {
  switch (eventName) {
    case 'start':
      player.onStart(() => {
        const event = copyAnimationEvent(baseEvent);
        event.phaseName = 'start';
        callback(event);
      });
      break;
    case 'done':
      player.onDone(() => {
        const event = copyAnimationEvent(baseEvent);
        event.phaseName = 'done';
        callback(event);
      });
      break;
  }
}

function copyAnimationEvent(e: AnimationEvent): AnimationEvent {
  return makeAnimationEvent(
      e.element, e.triggerName, e.fromState, e.toState, e.phaseName, e.totalTime);
}

function makeAnimationEvent(
    element: any, triggerName: string, fromState: string, toState: string, phaseName: string | null,
    totalTime: number): AnimationEvent {
  return <AnimationEvent>{element, triggerName, fromState, toState, phaseName, totalTime};
}

function normalizeTriggerValue(value: any): string {
  switch (typeof value) {
    case 'boolean':
      return value ? '1' : '0';
    default:
      return value ? value.toString() : null;
  }
}
