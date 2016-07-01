/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseException} from '../facade/exceptions';
import {scheduleMicroTask} from '../facade/lang';


/**
 * @experimental Animation support is experimental.
 */
export abstract class AnimationPlayer {
  abstract onDone(fn: Function): void;
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
  get parentPlayer(): AnimationPlayer { throw new BaseException('NOT IMPLEMENTED: Base Class'); }
  set parentPlayer(player: AnimationPlayer) {
    throw new BaseException('NOT IMPLEMENTED: Base Class');
  }
}

export class NoOpAnimationPlayer implements AnimationPlayer {
  private _subscriptions: any[] /** TODO #9100 */ = [];
  private _started = false;
  public parentPlayer: AnimationPlayer = null;
  constructor() { scheduleMicroTask(() => this._onFinish()); }
  /** @internal */
  _onFinish() {
    this._subscriptions.forEach(entry => { entry(); });
    this._subscriptions = [];
  }
  onDone(fn: Function): void { this._subscriptions.push(fn); }
  hasStarted(): boolean { return this._started; }
  init(): void {}
  play(): void { this._started = true; }
  pause(): void {}
  restart(): void {}
  finish(): void { this._onFinish(); }
  destroy(): void {}
  reset(): void {}
  setPosition(p: any /** TODO #9100 */): void {}
  getPosition(): number { return 0; }
}
