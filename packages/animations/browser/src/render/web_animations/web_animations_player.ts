/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, ɵStyleDataMap} from '@angular/animations';

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
  private _finalKeyframe?: ɵStyleDataMap;

  // the following original fns are persistent copies of the _onStartFns and _onDoneFns
  // and are used to reset the fns to their original values upon reset()
  // (since the _onStartFns and _onDoneFns get deleted after they are called)
  private _originalOnDoneFns: Function[] = [];
  private _originalOnStartFns: Function[] = [];

  // using non-null assertion because it's re(set) by init();
  public readonly domPlayer!: DOMAnimation;
  public time = 0;

  public parentPlayer: AnimationPlayer|null = null;
  public currentSnapshot: ɵStyleDataMap = new Map();

  constructor(
      public element: any, public keyframes: Array<ɵStyleDataMap>,
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
    // @ts-expect-error overwriting a readonly property
    this.domPlayer = this._triggerWebAnimation(this.element, keyframes, this.options);
    this._finalKeyframe = keyframes.length ? keyframes[keyframes.length - 1] : new Map();
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

  private _convertKeyframesToObject(keyframes: Array<ɵStyleDataMap>): any[] {
    const kfs: any[] = [];
    keyframes.forEach(frame => {
      kfs.push(Object.fromEntries(frame));
    });
    return kfs;
  }

  /** @internal */
  _triggerWebAnimation(element: any, keyframes: Array<ɵStyleDataMap>, options: any): DOMAnimation {
    // jscompiler doesn't seem to know animate is a native property because it's not fully
    // supported yet across common browsers (we polyfill it for Edge/Safari) [CL #143630929]
    return element['animate'](this._convertKeyframesToObject(keyframes), options) as DOMAnimation;
  }

  onStart(fn: () => void): void {
    this._originalOnStartFns.push(fn);
    this._onStartFns.push(fn);
  }

  onDone(fn: () => void): void {
    this._originalOnDoneFns.push(fn);
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
    this._onStartFns = this._originalOnStartFns;
    this._onDoneFns = this._originalOnDoneFns;
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
    const styles: ɵStyleDataMap = new Map();
    if (this.hasStarted()) {
      // note: this code is invoked only when the `play` function was called prior to this
      // (thus `hasStarted` returns true), this implies that the code that initializes
      // `_finalKeyframe` has also been executed and the non-null assertion can be safely used here
      const finalKeyframe = this._finalKeyframe!;
      finalKeyframe.forEach((val, prop) => {
        if (prop !== 'offset') {
          styles.set(prop, this._finished ? val : computeStyle(this.element, prop));
        }
      });
    }

    this.currentSnapshot = styles;
  }

  /** @internal */
  triggerCallback(phaseName: string): void {
    const methods = phaseName === 'start' ? this._onStartFns : this._onDoneFns;
    methods.forEach(fn => fn());
    methods.length = 0;
  }
}
