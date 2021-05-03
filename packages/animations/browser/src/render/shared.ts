/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationEvent, AnimationPlayer, AUTO_STYLE, NoopAnimationPlayer, ɵAnimationGroupPlayer, ɵPRE_STYLE as PRE_STYLE, ɵStyleData} from '@angular/animations';

import {AnimationStyleNormalizer} from '../../src/dsl/style_normalization/animation_style_normalizer';
import {AnimationDriver} from '../../src/render/animation_driver';

// We don't include ambient node types here since @angular/animations/browser
// is meant to target the browser so technically it should not depend on node
// types. `process` is just declared locally here as a result.
declare const process: any;

export function isBrowser(): boolean {
  return (typeof window !== 'undefined' && typeof window.document !== 'undefined');
}

export function isNode(): boolean {
  // Checking only for `process` isn't enough to identify whether or not we're in a Node
  // environment, because Webpack by default will polyfill the `process`. While we can discern
  // that Webpack polyfilled it by looking at `process.browser`, it's very Webpack-specific and
  // might not be future-proof. Instead we look at the stringified version of `process` which
  // is `[object process]` in Node and `[object Object]` when polyfilled.
  return typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
}

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
      if (prop !== 'offset') {
        normalizedProp = normalizer.normalizePropertyName(normalizedProp, errors);
        switch (normalizedValue) {
          case PRE_STYLE:
            normalizedValue = preStyles[prop];
            break;

          case AUTO_STYLE:
            normalizedValue = postStyles[prop];
            break;

          default:
            normalizedValue =
                normalizer.normalizeStyleValue(prop, normalizedProp, normalizedValue, errors);
            break;
        }
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
    player: AnimationPlayer, eventName: string, event: AnimationEvent|undefined,
    callback: (event: any) => any) {
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
    e: AnimationEvent, phaseName: string, player: AnimationPlayer): AnimationEvent {
  const totalTime = player.totalTime;
  const disabled = (player as any).disabled ? true : false;
  const event = makeAnimationEvent(
      e.element, e.triggerName, e.fromState, e.toState, phaseName || e.phaseName,
      totalTime == undefined ? e.totalTime : totalTime, disabled);
  const data = (e as any)['_data'];
  if (data != null) {
    (event as any)['_data'] = data;
  }
  return event;
}

export function makeAnimationEvent(
    element: any, triggerName: string, fromState: string, toState: string, phaseName: string = '',
    totalTime: number = 0, disabled?: boolean): AnimationEvent {
  return {element, triggerName, fromState, toState, phaseName, totalTime, disabled: !!disabled};
}

export function getOrSetAsInMap(
    map: Map<any, any>|{[key: string]: any}, key: any, defaultValue: any) {
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

let _contains: (elm1: any, elm2: any) => boolean = (elm1: any, elm2: any) => false;
let _matches: (element: any, selector: string) => boolean = (element: any, selector: string) =>
    false;
let _query: (element: any, selector: string, multi: boolean) => any[] =
    (element: any, selector: string, multi: boolean) => {
      return [];
    };

// Define utility methods for browsers and platform-server(domino) where Element
// and utility methods exist.
const _isNode = isNode();
if (_isNode || typeof Element !== 'undefined') {
  if (!isBrowser()) {
    _contains = (elm1, elm2) => elm1.contains(elm2);
  } else {
    _contains = (elm1, elm2) => {
      while (elm2 && elm2 !== document.documentElement) {
        if (elm2 === elm1) {
          return true;
        }
        elm2 = elm2.parentNode || elm2.host;  // consider host to support shadow DOM
      }
      return false;
    };
  }

  _matches = (() => {
    if (_isNode || Element.prototype.matches) {
      return (element: any, selector: string) => element.matches(selector);
    } else {
      const proto = Element.prototype as any;
      const fn = proto.matchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector ||
          proto.oMatchesSelector || proto.webkitMatchesSelector;
      if (fn) {
        return (element: any, selector: string) => fn.apply(element, [selector]);
      } else {
        return _matches;
      }
    }
  })();

  _query = (element: any, selector: string, multi: boolean): any[] => {
    let results: any[] = [];
    if (multi) {
      // DO NOT REFACTOR TO USE SPREAD SYNTAX.
      // For element queries that return sufficiently large NodeList objects,
      // using spread syntax to populate the results array causes a RangeError
      // due to the call stack limit being reached. `Array.from` can not be used
      // as well, since NodeList is not iterable in IE 11, see
      // https://developer.mozilla.org/en-US/docs/Web/API/NodeList
      // More info is available in #38551.
      const elems = element.querySelectorAll(selector);
      for (let i = 0; i < elems.length; i++) {
        results.push(elems[i]);
      }
    } else {
      const elm = element.querySelector(selector);
      if (elm) {
        results.push(elm);
      }
    }
    return results;
  };
}

function containsVendorPrefix(prop: string): boolean {
  // Webkit is the only real popular vendor prefix nowadays
  // cc: http://shouldiprefix.com/
  return prop.substring(1, 6) == 'ebkit';  // webkit or Webkit
}

let _CACHED_BODY: {style: any}|null = null;
let _IS_WEBKIT = false;
export function validateStyleProperty(prop: string): boolean {
  if (!_CACHED_BODY) {
    _CACHED_BODY = getBodyNode() || {};
    _IS_WEBKIT = _CACHED_BODY!.style ? ('WebkitAppearance' in _CACHED_BODY!.style) : false;
  }

  let result = true;
  if (_CACHED_BODY!.style && !containsVendorPrefix(prop)) {
    result = prop in _CACHED_BODY!.style;
    if (!result && _IS_WEBKIT) {
      const camelProp = 'Webkit' + prop.charAt(0).toUpperCase() + prop.substr(1);
      result = camelProp in _CACHED_BODY!.style;
    }
  }

  return result;
}

export function getBodyNode(): any|null {
  if (typeof document != 'undefined') {
    return document.body;
  }
  return null;
}

export const matchesElement = _matches;
export const containsElement = _contains;
export const invokeQuery = _query;

export function hypenatePropsObject(object: {[key: string]: any}): {[key: string]: any} {
  const newObj: {[key: string]: any} = {};
  Object.keys(object).forEach(prop => {
    const newProp = prop.replace(/([a-z])([A-Z])/g, '$1-$2');
    newObj[newProp] = object[prop];
  });
  return newObj;
}
