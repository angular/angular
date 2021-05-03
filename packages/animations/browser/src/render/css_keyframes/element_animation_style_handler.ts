/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const ELAPSED_TIME_MAX_DECIMAL_PLACES = 3;
const ANIMATION_PROP = 'animation';
const ANIMATIONEND_EVENT = 'animationend';
const ONE_SECOND = 1000;

export class ElementAnimationStyleHandler {
  private readonly _eventFn: (e: any) => any;
  private _finished = false;
  private _destroyed = false;
  private _startTime = 0;
  private _position = 0;

  constructor(
      private readonly _element: any, private readonly _name: string,
      private readonly _duration: number, private readonly _delay: number,
      private readonly _easing: string, private readonly _fillMode: ''|'both'|'forwards',
      private readonly _onDoneFn: () => any) {
    this._eventFn = (e) => this._handleCallback(e);
  }

  apply() {
    applyKeyframeAnimation(
        this._element,
        `${this._duration}ms ${this._easing} ${this._delay}ms 1 normal ${this._fillMode} ${
            this._name}`);
    addRemoveAnimationEvent(this._element, this._eventFn, false);
    this._startTime = Date.now();
  }

  pause() {
    playPauseAnimation(this._element, this._name, 'paused');
  }

  resume() {
    playPauseAnimation(this._element, this._name, 'running');
  }

  setPosition(position: number) {
    const index = findIndexForAnimation(this._element, this._name);
    this._position = position * this._duration;
    setAnimationStyle(this._element, 'Delay', `-${this._position}ms`, index);
  }

  getPosition() {
    return this._position;
  }

  private _handleCallback(event: any) {
    const timestamp = event._ngTestManualTimestamp || Date.now();
    const elapsedTime =
        parseFloat(event.elapsedTime.toFixed(ELAPSED_TIME_MAX_DECIMAL_PLACES)) * ONE_SECOND;
    if (event.animationName == this._name &&
        Math.max(timestamp - this._startTime, 0) >= this._delay && elapsedTime >= this._duration) {
      this.finish();
    }
  }

  finish() {
    if (this._finished) return;
    this._finished = true;
    this._onDoneFn();
    addRemoveAnimationEvent(this._element, this._eventFn, true);
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.finish();
    removeKeyframeAnimation(this._element, this._name);
  }
}

function playPauseAnimation(element: any, name: string, status: 'running'|'paused') {
  const index = findIndexForAnimation(element, name);
  setAnimationStyle(element, 'PlayState', status, index);
}

function applyKeyframeAnimation(element: any, value: string): number {
  const anim = getAnimationStyle(element, '').trim();
  let index = 0;
  if (anim.length) {
    index = countChars(anim, ',') + 1;
    value = `${anim}, ${value}`;
  }
  setAnimationStyle(element, '', value);
  return index;
}

function removeKeyframeAnimation(element: any, name: string) {
  const anim = getAnimationStyle(element, '');
  const tokens = anim.split(',');
  const index = findMatchingTokenIndex(tokens, name);
  if (index >= 0) {
    tokens.splice(index, 1);
    const newValue = tokens.join(',');
    setAnimationStyle(element, '', newValue);
  }
}

function findIndexForAnimation(element: any, value: string) {
  const anim = getAnimationStyle(element, '');
  if (anim.indexOf(',') > 0) {
    const tokens = anim.split(',');
    return findMatchingTokenIndex(tokens, value);
  }
  return findMatchingTokenIndex([anim], value);
}

function findMatchingTokenIndex(tokens: string[], searchToken: string): number {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].indexOf(searchToken) >= 0) {
      return i;
    }
  }
  return -1;
}

function addRemoveAnimationEvent(element: any, fn: (e: any) => any, doRemove: boolean) {
  doRemove ? element.removeEventListener(ANIMATIONEND_EVENT, fn) :
             element.addEventListener(ANIMATIONEND_EVENT, fn);
}

function setAnimationStyle(element: any, name: string, value: string, index?: number) {
  const prop = ANIMATION_PROP + name;
  if (index != null) {
    const oldValue = element.style[prop];
    if (oldValue.length) {
      const tokens = oldValue.split(',');
      tokens[index] = value;
      value = tokens.join(',');
    }
  }
  element.style[prop] = value;
}

export function getAnimationStyle(element: any, name: string) {
  return element.style[ANIMATION_PROP + name] || '';
}

function countChars(value: string, char: string): number {
  let count = 0;
  for (let i = 0; i < value.length; i++) {
    const c = value.charAt(i);
    if (c === char) count++;
  }
  return count;
}
