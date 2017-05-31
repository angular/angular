/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {scheduleMicroTask} from '../util';

/**
 * AnimationPlayer controls an animation sequence that was produced from a programmatic animation.
 * (see {@link AnimationBuilder AnimationBuilder} for more information on how to create programmatic
 * animations.)
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationPlayer {
  onDone(fn: () => void): void;
  onStart(fn: () => void): void;
  onDestroy(fn: () => void): void;
  init(): void;
  hasStarted(): boolean;
  play(): void;
  pause(): void;
  restart(): void;
  finish(): void;
  destroy(): void;
  reset(): void;
  setPosition(p: any /** TODO #9100 */): void;
  getPosition(): number;
  parentPlayer: AnimationPlayer|null;
  readonly totalTime: number;
  beforeDestroy?: () => any;
}

/**
 * @experimental Animation support is experimental.
 */
export class NoopAnimationPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _onDestroyFns: Function[] = [];
  private _started = false;
  private _destroyed = false;
  private _finished = false;
  public parentPlayer: AnimationPlayer|null = null;
  public totalTime = 0;
  constructor() {}
  private _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach(fn => fn());
      this._onDoneFns = [];
    }
  }
  onStart(fn: () => void): void { this._onStartFns.push(fn); }
  onDone(fn: () => void): void { this._onDoneFns.push(fn); }
  onDestroy(fn: () => void): void { this._onDestroyFns.push(fn); }
  hasStarted(): boolean { return this._started; }
  init(): void {}
  play(): void {
    if (!this.hasStarted()) {
      this.triggerMicrotask();
      this._onStart();
    }
    this._started = true;
  }

  /* @internal */
  triggerMicrotask() { scheduleMicroTask(() => this._onFinish()); }

  private _onStart() {
    this._onStartFns.forEach(fn => fn());
    this._onStartFns = [];
  }

  pause(): void {}
  restart(): void {}
  finish(): void { this._onFinish(); }
  destroy(): void {
    if (!this._destroyed) {
      this._destroyed = true;
      if (!this.hasStarted()) {
        this._onStart();
      }
      this.finish();
      this._onDestroyFns.forEach(fn => fn());
      this._onDestroyFns = [];
    }
  }
  reset(): void {}
  setPosition(p: number): void {}
  getPosition(): number { return 0; }
}
