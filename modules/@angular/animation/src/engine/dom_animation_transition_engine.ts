/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, Injectable, ɵAnimationGroupPlayer, ɵNoOpAnimationPlayer, ɵTransitionEngine} from '@angular/core';
import {StyleData} from '../common/style_data';
import {AnimationTimelineInstruction} from '../dsl/animation_timeline_instruction';
import {AnimationTransitionInstruction} from '../dsl/animation_transition_instruction';
import {AnimationStyleNormalizer} from '../dsl/style_normalization/animation_style_normalizer';

import {AnimationDriver} from './animation_driver';
import {AnimationEngineInstruction, AnimationTransitionInstructionType} from './animation_engine_instruction';

export declare type AnimationPlayerTuple = {
  element: any; player: AnimationPlayer;
};

@Injectable()
export class DomAnimationTransitionEngine extends ɵTransitionEngine {
  private _flaggedInserts = new Set<any>();
  private _queuedRemovals: any[] = [];
  private _queuedAnimations: AnimationPlayerTuple[] = [];
  private _activeElementAnimations = new Map<any, AnimationPlayer[]>();
  private _activeTransitionAnimations = new Map<any, {[triggerName: string]: AnimationPlayer}>();

  constructor(private _driver: AnimationDriver, private _normalizer: AnimationStyleNormalizer) {
    super();
  }

  insertNode(container: any, element: any) {
    container.appendChild(element);
    this._flaggedInserts.add(element);
  }

  removeNode(element: any) { this._queuedRemovals.push(element); }

  process(element: any, instructions: AnimationEngineInstruction[]): AnimationPlayer {
    const players = instructions.map(instruction => {
      if (instruction.type == AnimationTransitionInstructionType.TransitionAnimation) {
        return this._handleTransitionAnimation(
            element, <AnimationTransitionInstruction>instruction);
      }
      if (instruction.type == AnimationTransitionInstructionType.TimelineAnimation) {
        return this._handleTimelineAnimation(
            element, <AnimationTimelineInstruction>instruction, []);
      }
      return new ɵNoOpAnimationPlayer();
    });
    return optimizeGroupPlayer(players);
  }

  private _handleTransitionAnimation(element: any, instruction: AnimationTransitionInstruction):
      AnimationPlayer {
    const triggerName = instruction.triggerName;
    const elmTransitionMap = getOrSetAsInMap(this._activeTransitionAnimations, element, {});

    let previousPlayers: AnimationPlayer[];
    if (instruction.isRemovalTransition) {
      // we make a copy of the array because the actual source array is modified
      // each time a player is finished/destroyed (the forEach loop would fail otherwise)
      previousPlayers = copyArray(this._activeElementAnimations.get(element));
    } else {
      previousPlayers = [];
      const existingPlayer = elmTransitionMap[triggerName];
      if (existingPlayer) {
        previousPlayers.push(existingPlayer);
      }
    }

    // it's important to do this step before destroying the players
    // so that the onDone callback below won't fire before this
    eraseStyles(element, instruction.fromStyles);

    // we first run this so that the previous animation player
    // data can be passed into the successive animation players
    const players = instruction.timelines.map(
        timelineInstruction => this._buildPlayer(element, timelineInstruction, previousPlayers));

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

    this._queuePlayer(element, player);
    elmTransitionMap[triggerName] = player;

    return player;
  }

  private _handleTimelineAnimation(
      element: any, instruction: AnimationTimelineInstruction,
      previousPlayers: AnimationPlayer[]): AnimationPlayer {
    const player = this._buildPlayer(element, instruction, previousPlayers);
    player.onDestroy(() => { deleteFromArrayMap(this._activeElementAnimations, element, player); });
    this._queuePlayer(element, player);
    return player;
  }

  private _buildPlayer(
      element: any, instruction: AnimationTimelineInstruction,
      previousPlayers: AnimationPlayer[]): AnimationPlayer {
    return this._driver.animate(
        element, this._normalizeKeyframes(instruction.keyframes), instruction.duration,
        instruction.delay, instruction.easing, previousPlayers);
  }

  private _normalizeKeyframes(keyframes: StyleData[]): StyleData[] {
    const errors: string[] = [];
    const normalizedKeyframes: StyleData[] = [];
    keyframes.forEach(kf => {
      const normalizedKeyframe: StyleData = {};
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

  private _queuePlayer(element: any, player: AnimationPlayer) {
    const tuple = <AnimationPlayerTuple>{element, player};
    this._queuedAnimations.push(tuple);
    player.init();

    const elementAnimations = getOrSetAsInMap(this._activeElementAnimations, element, []);
    elementAnimations.push(player);
  }

  triggerAnimations() {
    while (this._queuedAnimations.length) {
      const {player, element} = this._queuedAnimations.shift();
      // in the event that an animation throws an error then we do
      // not want to re-run animations on any previous animations
      // if they have already been kicked off beforehand
      if (!player.hasStarted()) {
        player.play();
      }
    }

    this._queuedRemovals.forEach(element => {
      if (this._flaggedInserts.has(element)) return;

      let parent = element;
      let players: AnimationPlayer[];
      while (parent = parent.parentNode) {
        const match = this._activeElementAnimations.get(parent);
        if (match) {
          players = match;
          break;
        }
      }
      if (players) {
        optimizeGroupPlayer(players).onDone(() => remove(element));
      } else {
        if (element.parentNode) {
          remove(element);
        }
      }
    });

    this._queuedRemovals = [];
    this._flaggedInserts.clear();
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

function setStyles(element: any, styles: StyleData) {
  Object.keys(styles).forEach(prop => { element.style[prop] = styles[prop]; });
}

function eraseStyles(element: any, styles: StyleData) {
  Object.keys(styles).forEach(prop => {
    // IE requires '' instead of null
    // see https://github.com/angular/angular/issues/7916
    element.style[prop] = '';
  });
}

function optimizeGroupPlayer(players: AnimationPlayer[]): AnimationPlayer {
  return players.length == 1 ? players[0] : new ɵAnimationGroupPlayer(players);
}

function copyArray(source: any[]): any[] {
  return source ? source.splice(0) : [];
}

function remove(element: any) {
  element.parentNode.removeChild(element);
}
