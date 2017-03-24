/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {scheduleMicroTask} from '../util';
import {AnimationPlayer} from './animation_player';

export class AnimationGroupPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _finished = false;
  private _started = false;
  private _destroyed = false;
  private _onDestroyFns: Function[] = [];

  public parentPlayer: AnimationPlayer|null = null;

  constructor(private _players: AnimationPlayer[]) {
    let count = 0;
    const total = this._players.length;
    if (total == 0) {
      scheduleMicroTask(() => this._onFinish());
    } else {
      this._players.forEach(player => {
        player.parentPlayer = this;
        player.onDone(() => {
          if (++count >= total) {
            this._onFinish();
          }
        });
      });
    }
  }

  private _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach(fn => fn());
      this._onDoneFns = [];
    }
  }

  init(): void { this._players.forEach(player => player.init()); }

  onStart(fn: () => void): void { this._onStartFns.push(fn); }

  onDone(fn: () => void): void { this._onDoneFns.push(fn); }

  onDestroy(fn: () => void): void { this._onDestroyFns.push(fn); }

  hasStarted() { return this._started; }

  play() {
    if (!this.parentPlayer) {
      this.init();
    }
    if (!this.hasStarted()) {
      this._onStartFns.forEach(fn => fn());
      this._onStartFns = [];
      this._started = true;
    }
    this._players.forEach(player => player.play());
  }

  pause(): void { this._players.forEach(player => player.pause()); }

  restart(): void { this._players.forEach(player => player.restart()); }

  finish(): void {
    this._onFinish();
    this._players.forEach(player => player.finish());
  }

  destroy(): void {
    if (!this._destroyed) {
      this._onFinish();
      this._players.forEach(player => player.destroy());
      this._destroyed = true;
      this._onDestroyFns.forEach(fn => fn());
      this._onDestroyFns = [];
    }
  }

  reset(): void {
    this._players.forEach(player => player.reset());
    this._destroyed = false;
    this._finished = false;
    this._started = false;
  }

  setPosition(p: number): void {
    this._players.forEach(player => { player.setPosition(p); });
  }

  getPosition(): number {
    let min = 0;
    this._players.forEach(player => {
      const p = player.getPosition();
      min = Math.min(p, min);
    });
    return min;
  }

  get players(): AnimationPlayer[] { return this._players; }
}
