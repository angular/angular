/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isPresent, scheduleMicroTask} from '../facade/lang';

import {AnimationPlayer, NoOpAnimationPlayer} from './animation_player';

export class AnimationSequencePlayer implements AnimationPlayer {
  private _currentIndex: number = 0;
  private _activePlayer: AnimationPlayer;
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _finished = false;
  private _started = false;
  private _destroyed = false;

  public parentPlayer: AnimationPlayer = null;

  constructor(private _players: AnimationPlayer[]) {
    this._players.forEach(player => { player.parentPlayer = this; });
    this._onNext(false);
  }

  private _onNext(start: boolean) {
    if (this._finished) return;

    if (this._players.length == 0) {
      this._activePlayer = new NoOpAnimationPlayer();
      scheduleMicroTask(() => this._onFinish());
    } else if (this._currentIndex >= this._players.length) {
      this._activePlayer = new NoOpAnimationPlayer();
      this._onFinish();
    } else {
      var player = this._players[this._currentIndex++];
      player.onDone(() => this._onNext(true));

      this._activePlayer = player;
      if (start) {
        player.play();
      }
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

  hasStarted() { return this._started; }

  play(): void {
    if (!isPresent(this.parentPlayer)) {
      this.init();
    }
    if (!this.hasStarted()) {
      this._onStartFns.forEach(fn => fn());
      this._onStartFns = [];
      this._started = true;
    }
    this._activePlayer.play();
  }

  pause(): void { this._activePlayer.pause(); }

  restart(): void {
    this.reset();
    if (this._players.length > 0) {
      this._players[0].restart();
    }
  }

  reset(): void {
    this._players.forEach(player => player.reset());
    this._destroyed = false;
    this._finished = false;
    this._started = false;
  }

  finish(): void {
    this._onFinish();
    this._players.forEach(player => player.finish());
  }

  destroy(): void {
    if (!this._destroyed) {
      this._onFinish();
      this._players.forEach(player => player.destroy());
      this._destroyed = true;
      this._activePlayer = new NoOpAnimationPlayer();
    }
  }

  setPosition(p: any /** TODO #9100 */): void { this._players[0].setPosition(p); }

  getPosition(): number { return this._players[0].getPosition(); }
}
