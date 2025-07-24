/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AnimationEvent,
  AnimationPlayer,
  AUTO_STYLE,
  NoopAnimationPlayer,
  ɵAnimationGroupPlayer,
  ɵPRE_STYLE as PRE_STYLE,
  ɵStyleDataMap,
} from '../../../src/animations';

import {AnimationStyleNormalizer} from '../../src/dsl/style_normalization/animation_style_normalizer';
import {animationFailed} from '../error_helpers';

import {ANIMATABLE_PROP_SET} from './web_animations/animatable_props_set';

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
  normalizer: AnimationStyleNormalizer,
  keyframes: Array<ɵStyleDataMap>,
  preStyles: ɵStyleDataMap = new Map(),
  postStyles: ɵStyleDataMap = new Map(),
): Array<ɵStyleDataMap> {
  const errors: Error[] = [];
  const normalizedKeyframes: Array<ɵStyleDataMap> = [];
  let previousOffset = -1;
  let previousKeyframe: ɵStyleDataMap | null = null;
  keyframes.forEach((kf) => {
    const offset = kf.get('offset') as number;
    const isSameOffset = offset == previousOffset;
    const normalizedKeyframe: ɵStyleDataMap = (isSameOffset && previousKeyframe) || new Map();
    kf.forEach((val, prop) => {
      let normalizedProp = prop;
      let normalizedValue = val;
      if (prop !== 'offset') {
        normalizedProp = normalizer.normalizePropertyName(normalizedProp, errors);
        switch (normalizedValue) {
          case PRE_STYLE:
            normalizedValue = preStyles.get(prop)!;
            break;

          case AUTO_STYLE:
            normalizedValue = postStyles.get(prop)!;
            break;

          default:
            normalizedValue = normalizer.normalizeStyleValue(
              prop,
              normalizedProp,
              normalizedValue,
              errors,
            );
            break;
        }
      }
      normalizedKeyframe.set(normalizedProp, normalizedValue);
    });
    if (!isSameOffset) {
      normalizedKeyframes.push(normalizedKeyframe);
    }
    previousKeyframe = normalizedKeyframe;
    previousOffset = offset;
  });
  if (errors.length) {
    throw animationFailed(errors);
  }

  return normalizedKeyframes;
}

export function listenOnPlayer(
  player: AnimationPlayer,
  eventName: string,
  event: AnimationEvent | undefined,
  callback: (event: any) => any,
) {
  switch (eventName) {
    case 'start':
      player.onStart(() => callback(event && copyAnimationEvent(event, 'start', player)));
      break;
    case 'done':
      player.onDone(() => callback(event && copyAnimationEvent(event, 'done', player)));
      break;
    case 'destroy':
      player.onDestroy(() => callback(event && copyAnimationEvent(event, 'destroy', player)));
      break;
  }
}

export function copyAnimationEvent(
  e: AnimationEvent,
  phaseName: string,
  player: AnimationPlayer,
): AnimationEvent {
  const totalTime = player.totalTime;
  const disabled = (player as any).disabled ? true : false;
  const event = makeAnimationEvent(
    e.element,
    e.triggerName,
    e.fromState,
    e.toState,
    phaseName || e.phaseName,
    totalTime == undefined ? e.totalTime : totalTime,
    disabled,
  );
  const data = (e as any)['_data'];
  if (data != null) {
    (event as any)['_data'] = data;
  }
  return event;
}

export function makeAnimationEvent(
  element: any,
  triggerName: string,
  fromState: string,
  toState: string,
  phaseName: string = '',
  totalTime: number = 0,
  disabled?: boolean,
): AnimationEvent {
  return {element, triggerName, fromState, toState, phaseName, totalTime, disabled: !!disabled};
}

export function getOrSetDefaultValue<T, V>(map: Map<T, V>, key: T, defaultValue: V) {
  let value = map.get(key);
  if (!value) {
    map.set(key, (value = defaultValue));
  }
  return value;
}

export function parseTimelineCommand(command: string): [string, string] {
  const separatorPos = command.indexOf(':');
  const id = command.substring(1, separatorPos);
  const action = command.slice(separatorPos + 1);
  return [id, action];
}

const documentElement: HTMLElement | null = /* @__PURE__ */ (() =>
  typeof document === 'undefined' ? null : document.documentElement)();

export function getParentElement(element: any): unknown | null {
  const parent = element.parentNode || element.host || null; // consider host to support shadow DOM
  if (parent === documentElement) {
    return null;
  }
  return parent;
}

function containsVendorPrefix(prop: string): boolean {
  // Webkit is the only real popular vendor prefix nowadays
  // cc: http://shouldiprefix.com/
  return prop.substring(1, 6) == 'ebkit'; // webkit or Webkit
}

let _CACHED_BODY: {style: any} | null = null;
let _IS_WEBKIT = false;
export function validateStyleProperty(prop: string): boolean {
  if (!_CACHED_BODY) {
    _CACHED_BODY = getBodyNode() || {};
    _IS_WEBKIT = _CACHED_BODY!.style ? 'WebkitAppearance' in _CACHED_BODY!.style : false;
  }

  let result = true;
  if (_CACHED_BODY!.style && !containsVendorPrefix(prop)) {
    result = prop in _CACHED_BODY!.style;
    if (!result && _IS_WEBKIT) {
      const camelProp = 'Webkit' + prop.charAt(0).toUpperCase() + prop.slice(1);
      result = camelProp in _CACHED_BODY!.style;
    }
  }

  return result;
}

export function validateWebAnimatableStyleProperty(prop: string): boolean {
  return ANIMATABLE_PROP_SET.has(prop);
}

export function getBodyNode(): any | null {
  if (typeof document != 'undefined') {
    return document.body;
  }
  return null;
}

export function containsElement(elm1: any, elm2: any): boolean {
  while (elm2) {
    if (elm2 === elm1) {
      return true;
    }
    elm2 = getParentElement(elm2);
  }
  return false;
}

export function invokeQuery(element: any, selector: string, multi: boolean): any[] {
  if (multi) {
    return Array.from(element.querySelectorAll(selector));
  }
  const elem = element.querySelector(selector);
  return elem ? [elem] : [];
}

export function hypenatePropsKeys(original: ɵStyleDataMap): ɵStyleDataMap {
  const newMap: ɵStyleDataMap = new Map();
  original.forEach((val, prop) => {
    const newProp = prop.replace(/([a-z])([A-Z])/g, '$1-$2');
    newMap.set(newProp, val);
  });
  return newMap;
}
