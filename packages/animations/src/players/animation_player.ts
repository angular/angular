/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {scheduleMicroTask} from '../util';

/**
 * @experimental Animation support is experimental.
 */
export abstract class AnimationPlayer {
  abstract onDone(fn: () => void): void;
  abstract onStart(fn: () => void): void;
  abstract onDestroy(fn: () => void): void;
  abstract init(): void;
  abstract hasStarted(): boolean;
  abstract play(): void;
  abstract pause(): void;
  abstract restart(): void;
  abstract finish(): void;
  abstract destroy(): void;
  abstract reset(): void;
  abstract setPosition(p: any /** TODO #9100 */): void;
  abstract getPosition(): number;
  get parentPlayer(): AnimationPlayer|null { throw new Error('NOT IMPLEMENTED: Base Class'); }
  set parentPlayer(player: AnimationPlayer|null) { throw new Error('NOT IMPLEMENTED: Base Class'); }
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
      scheduleMicroTask(() => this._onFinish());
      this._onStart();
    }
    this._started = true;
  }
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
