/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {scheduleMicroTask} from '../facade/lang';


/**
 * @experimental Animation support is experimental.
 */
export abstract class AnimationPlayer {
  abstract onDone(fn: () => void): void;
  abstract onStart(fn: () => void): void;
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
  get parentPlayer(): AnimationPlayer { throw new Error('NOT IMPLEMENTED: Base Class'); }
  set parentPlayer(player: AnimationPlayer) { throw new Error('NOT IMPLEMENTED: Base Class'); }
}

export class NoOpAnimationPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _started = false;
  public parentPlayer: AnimationPlayer = null;
  constructor() { scheduleMicroTask(() => this._onFinish()); }
  /** @internal */
  _onFinish() {
    this._onDoneFns.forEach(fn => fn());
    this._onDoneFns = [];
  }
  onStart(fn: () => void): void { this._onStartFns.push(fn); }
  onDone(fn: () => void): void { this._onDoneFns.push(fn); }
  hasStarted(): boolean { return this._started; }
  init(): void {}
  play(): void {
    if (!this.hasStarted()) {
      this._onStartFns.forEach(fn => fn());
      this._onStartFns = [];
    }
    this._started = true;
  }
  pause(): void {}
  restart(): void {}
  finish(): void { this._onFinish(); }
  destroy(): void {}
  reset(): void {}
  setPosition(p: any /** TODO #9100 */): void {}
  getPosition(): number { return 0; }
}
