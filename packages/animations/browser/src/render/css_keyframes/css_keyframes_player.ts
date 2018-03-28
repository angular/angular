/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer} from '@angular/animations';

import {computeStyle} from '../../util';

import {ElementAnimationStyleHandler} from './element_animation_style_handler';

const DEFAULT_FILL_MODE = 'forwards';
const DEFAULT_EASING = 'linear';
const ANIMATION_END_EVENT = 'animationend';

export enum AnimatorControlState {
  INITIALIZED = 1,
  STARTED = 2,
  FINISHED = 3,
  DESTROYED = 4
}

export class CssKeyframesPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _onDestroyFns: Function[] = [];

  private _started = false;
  private _styler: ElementAnimationStyleHandler;

  public parentPlayer: AnimationPlayer;
  public readonly totalTime: number;
  public readonly easing: string;
  public currentSnapshot: {[key: string]: string} = {};
  public state = 0;

  constructor(
      public readonly element: any, public readonly keyframes: {[key: string]: string | number}[],
      public readonly animationName: string, private readonly _duration: number,
      private readonly _delay: number, easing: string,
      private readonly _finalStyles: {[key: string]: any}) {
    this.easing = easing || DEFAULT_EASING;
    this.totalTime = _duration + _delay;
    this._buildStyler();
  }

  onStart(fn: () => void): void { this._onStartFns.push(fn); }

  onDone(fn: () => void): void { this._onDoneFns.push(fn); }

  onDestroy(fn: () => void): void { this._onDestroyFns.push(fn); }

  destroy() {
    this.init();
    if (this.state >= AnimatorControlState.DESTROYED) return;
    this.state = AnimatorControlState.DESTROYED;
    this._styler.destroy();
    this._flushStartFns();
    this._flushDoneFns();
    this._onDestroyFns.forEach(fn => fn());
    this._onDestroyFns = [];
  }

  private _flushDoneFns() {
    this._onDoneFns.forEach(fn => fn());
    this._onDoneFns = [];
  }

  private _flushStartFns() {
    this._onStartFns.forEach(fn => fn());
    this._onStartFns = [];
  }

  finish() {
    this.init();
    if (this.state >= AnimatorControlState.FINISHED) return;
    this.state = AnimatorControlState.FINISHED;
    this._styler.finish();
    this._flushStartFns();
    this._flushDoneFns();
  }

  setPosition(value: number) { this._styler.setPosition(value); }

  getPosition(): number { return this._styler.getPosition(); }

  hasStarted(): boolean { return this.state >= AnimatorControlState.STARTED; }
  init(): void {
    if (this.state >= AnimatorControlState.INITIALIZED) return;
    this.state = AnimatorControlState.INITIALIZED;
    const elm = this.element;
    this._styler.apply();
    if (this._delay) {
      this._styler.pause();
    }
  }

  play(): void {
    this.init();
    if (!this.hasStarted()) {
      this._flushStartFns();
      this.state = AnimatorControlState.STARTED;
    }
    this._styler.resume();
  }

  pause(): void {
    this.init();
    this._styler.pause();
  }
  restart(): void {
    this.reset();
    this.play();
  }
  reset(): void {
    this._styler.destroy();
    this._buildStyler();
    this._styler.apply();
  }

  private _buildStyler() {
    this._styler = new ElementAnimationStyleHandler(
        this.element, this.animationName, this._duration, this._delay, this.easing,
        DEFAULT_FILL_MODE, () => this.finish());
  }

  /* @internal */
  triggerCallback(phaseName: string): void {
    const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
    methods.forEach(fn => fn());
    methods.length = 0;
  }

  beforeDestroy() {
    this.init();
    const styles: {[key: string]: string} = {};
    if (this.hasStarted()) {
      const finished = this.state >= AnimatorControlState.FINISHED;
      Object.keys(this._finalStyles).forEach(prop => {
        if (prop != 'offset') {
          styles[prop] = finished ? this._finalStyles[prop] : computeStyle(this.element, prop);
        }
      });
    }
    this.currentSnapshot = styles;
  }
}
