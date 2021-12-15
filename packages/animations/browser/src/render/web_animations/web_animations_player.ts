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

export class WebAnimationsPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _onDestroyFns: Function[] = [];
  private _duration: number;
  private _delay: number;
  private _finished = false;
  private _started = false;
  private _destroyed = false;
  private _finalKeyframe?: ɵStyleDataMap;

  // the following original fns are persistent copies of the _onStartFns and _onDoneFns
  // and are used to reset the fns to their original values upon reset()
  // (since the _onStartFns and _onDoneFns get deleted after they are called)
  private _originalOnDoneFns: Function[] = [];
  private _originalOnStartFns: Function[] = [];

  private _domPlayer: Animation | undefined;
  private time = 0;

  public parentPlayer: AnimationPlayer | null = null;
  public currentSnapshot: ɵStyleDataMap = new Map();

  constructor(
    public element: any,
    public keyframes: Array<ɵStyleDataMap>,
    public options: {[key: string]: string | number},
    private _specialStyles?: SpecialCasedStyles | null,
  ) {
    this._duration = <number>options['duration'];
    this._delay = <number>options['delay'] || 0;
    this.time = this._duration + this._delay;
  }

  private _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach((fn) => fn());
      this._onDoneFns = [];
    }
  }

  init(): Animation {
    const player = this._buildPlayer();
    // this is required so that the player doesn't start to animate right away
    if (this._delay) {
      this._resetDomPlayerState();
    } else {
      player.pause();
    }

    return player;
  }

  private _buildPlayer(): Animation {
    if (this._domPlayer) return this._domPlayer;

    const keyframes = this.keyframes;
    const player = (this._domPlayer = this._triggerWebAnimation(
      this.element,
      keyframes,
      this.options,
    ));
    this._finalKeyframe = keyframes.length ? keyframes[keyframes.length - 1] : new Map();
    const onFinish = () => this._onFinish();
    player.addEventListener('finish', onFinish);
    this.onDestroy(() => {
      // We must remove the `finish` event listener once an animation has completed all its
      // iterations. This action is necessary to prevent a memory leak since the listener captures
      // `this`, creating a closure that prevents `this` from being garbage collected.
      player.removeEventListener('finish', onFinish);
    });
    return this._domPlayer;
  }

  private _convertKeyframesToObject(keyframes: Array<ɵStyleDataMap>): any[] {
    const kfs: any[] = [];
    keyframes.forEach((frame) => {
      kfs.push(Object.fromEntries(frame));
    });
    return kfs;
  }

  /** @internal */
  _triggerWebAnimation(
    element: HTMLElement,
    keyframes: Array<ɵStyleDataMap>,
    options: any,
  ): Animation {
    return element.animate(this._convertKeyframesToObject(keyframes), options);
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
    if (!this.hasStarted()) {
      this._onStartFns.forEach((fn) => fn());
      this._onStartFns = [];
      this._started = true;
      this._specialStyles?.start();
    }
    this._buildPlayer().play();
  }

  pause(): void {
    const player = this.init();
    player.pause();
  }

  finish(): void {
    this._specialStyles?.finish();
    this._onFinish();
    const player = this.init();
    player.finish();
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
    this._domPlayer?.cancel();
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
      this._onDestroyFns.forEach((fn) => fn());
      this._onDestroyFns = [];
    }
  }

  setPosition(p: number): void {
    const player = this._domPlayer ?? this.init();
    player.currentTime = p * this.time;
  }

  getPosition(): number {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !this._domPlayer) {
      throw new Error('DOM player is not defined.');
    }
    // tsc is complaining with TS2362 without the conversion to number
    return +(this._domPlayer!.currentTime ?? 0) / this.time;
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
    methods.forEach((fn) => fn());
    methods.length = 0;
  }
}
