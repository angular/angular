/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AUTO_STYLE, AnimationEvent, AnimationPlayer, NoopAnimationPlayer, ɵAnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE, ɵStyleData} from '@angular/animations';

import {AnimationStyleNormalizer} from '../../src/dsl/style_normalization/animation_style_normalizer';
import {AnimationDriver} from '../../src/render/animation_driver';

export function optimizeGroupPlayer(players: AnimationPlayer[]): AnimationPlayer {
  switch (players.length) {
    case 0:
      return new NoopAnimationPlayer();
    case 1:
      return players[0];
    default:
      return new ɵAnimationGroupPlayer(players);
  }
}

export function normalizeKeyframes(
    driver: AnimationDriver, normalizer: AnimationStyleNormalizer, element: any,
    keyframes: ɵStyleData[], preStyles: ɵStyleData = {},
    postStyles: ɵStyleData = {}): ɵStyleData[] {
  const errors: string[] = [];
  const normalizedKeyframes: ɵStyleData[] = [];
  let previousOffset = -1;
  let previousKeyframe: ɵStyleData|null = null;
  keyframes.forEach(kf => {
    const offset = kf['offset'] as number;
    const isSameOffset = offset == previousOffset;
    const normalizedKeyframe: ɵStyleData = (isSameOffset && previousKeyframe) || {};
    Object.keys(kf).forEach(prop => {
      let normalizedProp = prop;
      let normalizedValue = kf[prop];
      if (normalizedValue == PRE_STYLE) {
        normalizedValue = preStyles[prop];
      } else if (normalizedValue == AUTO_STYLE) {
        normalizedValue = postStyles[prop];
      } else if (prop != 'offset') {
        normalizedProp = normalizer.normalizePropertyName(prop, errors);
        normalizedValue = normalizer.normalizeStyleValue(prop, normalizedProp, kf[prop], errors);
      }
      normalizedKeyframe[normalizedProp] = normalizedValue;
    });
    if (!isSameOffset) {
      normalizedKeyframes.push(normalizedKeyframe);
    }
    previousKeyframe = normalizedKeyframe;
    previousOffset = offset;
  });
  if (errors.length) {
    const LINE_START = '\n - ';
    throw new Error(
        `Unable to animate due to the following errors:${LINE_START}${errors.join(LINE_START)}`);
  }

  return normalizedKeyframes;
}

export function listenOnPlayer(
    player: AnimationPlayer, eventName: string, event: AnimationEvent | undefined,
    callback: (event: any) => any) {
  switch (eventName) {
    case 'start':
      player.onStart(() => callback(event && copyAnimationEvent(event, 'start', player.totalTime)));
      break;
    case 'done':
      player.onDone(() => callback(event && copyAnimationEvent(event, 'done', player.totalTime)));
      break;
    case 'destroy':
      player.onDestroy(
          () => callback(event && copyAnimationEvent(event, 'destroy', player.totalTime)));
      break;
  }
}

export function copyAnimationEvent(
    e: AnimationEvent, phaseName?: string, totalTime?: number): AnimationEvent {
  return makeAnimationEvent(
      e.element, e.triggerName, e.fromState, e.toState, phaseName || e.phaseName,
      totalTime == undefined ? e.totalTime : totalTime);
}

export function makeAnimationEvent(
    element: any, triggerName: string, fromState: string, toState: string, phaseName: string = '',
    totalTime: number = 0): AnimationEvent {
  return {element, triggerName, fromState, toState, phaseName, totalTime};
}

export function getOrSetAsInMap(
    map: Map<any, any>| {[key: string]: any}, key: any, defaultValue: any) {
  let value: any;
  if (map instanceof Map) {
    value = map.get(key);
    if (!value) {
      map.set(key, value = defaultValue);
    }
  } else {
    value = map[key];
    if (!value) {
      value = map[key] = defaultValue;
    }
  }
  return value;
}

export function parseTimelineCommand(command: string): [string, string] {
  const separatorPos = command.indexOf(':');
  const id = command.substring(1, separatorPos);
  const action = command.substr(separatorPos + 1);
  return [id, action];
}
