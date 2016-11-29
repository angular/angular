/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StringMapWrapper} from '../facade/collection';
import {isPresent} from '../facade/lang';

import {FILL_STYLE_FLAG} from './animation_constants';
import {AUTO_STYLE} from './animation_metadata';

import {AnimationPlayer, NoOpAnimationPlayer} from '../animation/animation_player';
import {AnimationGroupPlayer} from '../animation/animation_group_player';
import {AnimationQueryList} from '../linker/query_list';

import {AnimationViewContext} from "../linker/animation_view_context";
import {AnimationQueue} from './animation_queue';

export function prepareFinalAnimationStyles(
    previousStyles: {[key: string]: string | number}, newStyles: {[key: string]: string | number},
    nullValue: string = null): {[key: string]: string} {
  const finalStyles: {[key: string]: string} = {};

  Object.keys(newStyles).forEach(prop => {
    const value = newStyles[prop];
    finalStyles[prop] = value == AUTO_STYLE ? nullValue : value.toString();
  });

  Object.keys(previousStyles).forEach(prop => {
    if (!isPresent(finalStyles[prop])) {
      finalStyles[prop] = nullValue;
    }
  });

  return finalStyles;
}

function _getElementCollectedStyles(collectedStylesArr: {[key: string]: string | number}[], elementId: any): {[key: string]: string|number} {
  let value = collectedStylesArr[elementId];
  if (!value) {
    collectedStylesArr[elementId] = value = {};
  }
  return value;
}

export function balanceAnimationKeyframes(
    collectedStylesArr: {[key: string]: string | number}[],
    elementId: number,
    finalStateStyles: {[key: string]: string | number}, keyframes: any[]): any[] {
  const limit = keyframes.length - 1;
  const firstKeyframe = keyframes[0];

  const collectedStyles = _getElementCollectedStyles(collectedStylesArr, elementId);

  // phase 1: copy all the styles from the first keyframe into the lookup map
  const flatenedFirstKeyframeStyles = flattenStyles(firstKeyframe.styles.styles);

  const extraFirstKeyframeStyles: {[key: string]: string} = {};
  let hasExtraFirstStyles = false;
  Object.keys(collectedStyles).forEach(prop => {
    const value = collectedStyles[prop] as string;
    // if the style is already defined in the first keyframe then
    // we do not replace it.
    if (!flatenedFirstKeyframeStyles[prop]) {
      flatenedFirstKeyframeStyles[prop] = value;
      extraFirstKeyframeStyles[prop] = value;
      hasExtraFirstStyles = true;
    }
  });

  const keyframeCollectedStyles = StringMapWrapper.merge({}, flatenedFirstKeyframeStyles);

  // phase 2: normalize the final keyframe
  const finalKeyframe = keyframes[limit];
  finalKeyframe.styles.styles.unshift(finalStateStyles);

  const flatenedFinalKeyframeStyles = flattenStyles(finalKeyframe.styles.styles);
  const extraFinalKeyframeStyles: {[key: string]: string} = {};
  let hasExtraFinalStyles = false;
  Object.keys(keyframeCollectedStyles).forEach(prop => {
    if (!isPresent(flatenedFinalKeyframeStyles[prop])) {
      extraFinalKeyframeStyles[prop] = AUTO_STYLE;
      hasExtraFinalStyles = true;
    }
  });

  if (hasExtraFinalStyles) {
    finalKeyframe.styles.styles.push(extraFinalKeyframeStyles);
  }

  Object.keys(flatenedFinalKeyframeStyles).forEach(prop => {
    if (!isPresent(flatenedFirstKeyframeStyles[prop])) {
      extraFirstKeyframeStyles[prop] = AUTO_STYLE;
      hasExtraFirstStyles = true;
    }
  });

  if (hasExtraFirstStyles) {
    firstKeyframe.styles.styles.push(extraFirstKeyframeStyles);
  }

  collectAndResolveStyles(collectedStylesArr, elementId, [finalStateStyles]);

  return keyframes;
}

export function clearStyles(styles: {[key: string]: string | number}): {[key: string]: string} {
  const finalStyles: {[key: string]: string} = {};
  Object.keys(styles).forEach(key => { finalStyles[key] = null; });
  return finalStyles;
}

export function collectAndResolveStyles(
    collectedStylesArr: {[key: string]: string | number}[], elementId: number, styles: {[key: string]: string | number}[]) {
  const collection = _getElementCollectedStyles(collectedStylesArr, elementId);
  return styles.map(entry => {
    const stylesObj: {[key: string]: string | number} = {};
    Object.keys(entry).forEach(prop => {
      let value = entry[prop];
      if (value == FILL_STYLE_FLAG) {
        value = collection[prop];
        if (!isPresent(value)) {
          value = AUTO_STYLE;
        }
      }
      collection[prop] = value;
      stylesObj[prop] = value;
    });
    return stylesObj;
  });
}

export function renderStyles(
    element: any, renderer: any, styles: {[key: string]: string | number}): void {
  Object.keys(styles).forEach(prop => { renderer.setElementStyle(element, prop, styles[prop]); });
}

export function flattenStyles(styles: {[key: string]: string | number}[]): {[key: string]: string} {
  const finalStyles: {[key: string]: string} = {};
  styles.forEach(entry => {
    Object.keys(entry).forEach(prop => { finalStyles[prop] = entry[prop] as string; });
  });
  return finalStyles;
}

export function animateQuery(context: AnimationViewContext,
                             animationName: string,
                             elementIdMap: AnimationElementIdMap,
                             query: AnimationQueryList<any>,
                             fetchPreviousPlayers: boolean,
                             animationFn: (element: any, id: number, players: AnimationPlayer[]) => AnimationPlayer): AnimationPlayer {
  const players: AnimationPlayer[] = [];
  query.forEach(tuple => {
    let [view, elms] = tuple;
    context.animationQueue.flagViewAsQueried(view);

    elms.forEach(elm => {
      let previousPlayers:AnimationPlayer[];
      if (fetchPreviousPlayers) {
        previousPlayers = context.getAnimationPlayers(elm, null, true)[1];
        previousPlayers = previousPlayers.filter(player => {
          // only return the players that are actively animating
          // (this avoids returning the inner player that has been
          // prepared already within a potential inner animation)
          return player.hasStarted();
        });
      } else {
        previousPlayers = [];
      }

      const id = elementIdMap.getOrCreateElementId(elm);
      const player = animationFn(elm, id, previousPlayers);

      // we do this so that when animation players are scanned then they
      // will not bother looking inside of player that is set for query
      player.flaggedForQuery = true;
      if (view.delayDetach) {
        view.delayDetachPlayer = player;
      }

      context.assignPlayer(elm, animationName, player);
      player.onDone(() => context.removePlayer(elm, animationName, player));

      players.push(player);
    });
  });
  return players.length == 1 ? players[0] : new AnimationGroupPlayer(players);
}

export function fetchElementAnimation(element: any, context: AnimationViewContext, duration: number, delay: number, easing: string, collectedStyles: any): AnimationPlayer {
  if (duration === 0) {
    return new NoOpAnimationPlayer();
  }

  const players = context.getElementAnimationPlayers(element);

  let player: AnimationPlayer;
  switch (players.length) {
    case 0:
      player = new NoOpAnimationPlayer();
      break;
    case 1:
      player = players[0];
      break;
    default:
      player = new AnimationGroupPlayer(players);
      break;
  }

  if (duration > 1) {
    player.setSpeed(player.duration / duration);
  }

  // this will instruct the animation_queue code not to start
  // this particular player since it will be started by the parent
  // animation that has queried and fetched this animation player
  player.flaggedForQuery = true;

  return player;
}

export class AnimationElementIdMap {
  registry = new Map<any, number>();
  count = 0;

  constructor(public element: any) {
    this.getOrCreateElementId(element);
  }

  getOrCreateElementId(element: any) {
    let id = this.registry.get(element);
    if (!isPresent(id)) {
      this.registry.set(element, id = this.count++);
    }
    return id;
  }
}
