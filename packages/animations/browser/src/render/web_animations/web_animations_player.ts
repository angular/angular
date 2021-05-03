/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer} from '@angular/animations';

import {computeStyle} from '../../util';
import {SpecialCasedStyles} from '../special_cased_styles';

import {DOMAnimation} from './dom_animation';

export class WebAnimationsPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _onDestroyFns: Function[] = [];
  private _duration: number;
  private _delay: number;
  private _initialized = false;
  private _finished = false;
  private _started = false;
  private _destroyed = false;
  // TODO(issue/24571): remove '!'.
  private _finalKeyframe!: {[key: string]: string|number};

  // TODO(issue/24571): remove '!'.
  public readonly domPlayer!: DOMAnimation;
  public time = 0;

  public parentPlayer: AnimationPlayer|null = null;
  public currentSnapshot: {[styleName: string]: string|number} = {};

  constructor(
      public element: any, public keyframes: {[key: string]: string|number}[],
      public options: {[key: string]: string|number},
      private _specialStyles?: SpecialCasedStyles|null) {
    this._duration = <number>options['duration'];
    this._delay = <number>options['delay'] || 0;
    this.time = this._duration + this._delay;
  }

  private _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach(fn => fn());
      this._onDoneFns = [];
    }
  }

  init(): void {
    this._buildPlayer();
    this._preparePlayerBeforeStart();
  }

  private _buildPlayer(): void {
    if (this._initialized) return;
    this._initialized = true;

    const keyframes = this.keyframes;
    (this as {domPlayer: DOMAnimation}).domPlayer =
        this._triggerWebAnimation(this.element, keyframes, this.options);
    this._finalKeyframe = keyframes.length ? keyframes[keyframes.length - 1] : {};
    this.domPlayer.addEventListener('finish', () => this._onFinish());
  }

  private _preparePlayerBeforeStart() {
    // this is required so that the player doesn't start to animate right away
    if (this._delay) {
      this._resetDomPlayerState();
    } else {
      this.domPlayer.pause();
    }
  }

  /** @internal */
  _triggerWebAnimation(element: any, keyframes: any[], options: any): DOMAnimation {
    // jscompiler doesn't seem to know animate is a native property because it's not fully
    // supported yet across common browsers (we polyfill it for Edge/Safari) [CL #143630929]
    return element['animate'](keyframes, options) as DOMAnimation;
  }

  onStart(fn: () => void): void {
    this._onStartFns.push(fn);
  }

  onDone(fn: () => void): void {
    this._onDoneFns.push(fn);
  }

  onDestroy(fn: () => void): void {
    this._onDestroyFns.push(fn);
  }

  play(): void {
    this._buildPlayer();
    if (!this.hasStarted()) {
      this._onStartFns.forEach(fn => fn());
      this._onStartFns = [];
      this._started = true;
      if (this._specialStyles) {
        this._specialStyles.start();
      }
    }
    this.domPlayer.play();
  }

  pause(): void {
    this.init();
    this.domPlayer.pause();
  }

  finish(): void {
    this.init();
    if (this._specialStyles) {
      this._specialStyles.finish();
    }
    this._onFinish();
    this.domPlayer.finish();
  }

  reset(): void {
    this._resetDomPlayerState();
    this._destroyed = false;
    this._finished = false;
    this._started = false;
  }

  private _resetDomPlayerState() {
    if (this.domPlayer) {
      this.domPlayer.cancel();
    }
  }

  restart(): void {
    this.reset();
    this.play();
  }

  hasStarted(): boolean {
    return this._started;
  }

  destroy(): void {
    if (!this._destroyed) {
      this._destroyed = true;
      this._resetDomPlayerState();
      this._onFinish();
      if (this._specialStyles) {
        this._specialStyles.destroy();
      }
      this._onDestroyFns.forEach(fn => fn());
      this._onDestroyFns = [];
    }
  }

  setPosition(p: number): void {
    if (this.domPlayer === undefined) {
      this.init();
    }
    this.domPlayer.currentTime = p * this.time;
  }

  getPosition(): number {
    return this.domPlayer.currentTime / this.time;
  }

  get totalTime(): number {
    return this._delay + this._duration;
  }

  beforeDestroy() {
    const styles: {[key: string]: string|number} = {};
    if (this.hasStarted()) {
      Object.keys(this._finalKeyframe).forEach(prop => {
        if (prop != 'offset') {
          styles[prop] =
              this._finished ? this._finalKeyframe[prop] : computeStyle(this.element, prop);
        }
      });
    }
    this.currentSnapshot = styles;
  }

  /** @internal */
  triggerCallback(phaseName: string): void {
    const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
    methods.forEach(fn => fn());
    methods.length = 0;
  }
}
