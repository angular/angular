/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AnimationPlayer} from './animation_player';

/**
 * A programmatic controller for a group of reusable animations.
 * Used internally to control animations.
 *
 * @see {@link AnimationPlayer}
 * @see {@link animations/group group}
 *
 */
export class AnimationGroupPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _finished = false;
  private _started = false;
  private _destroyed = false;
  private _onDestroyFns: Function[] = [];

  public parentPlayer: AnimationPlayer | null = null;
  public totalTime: number = 0;
  public readonly players: AnimationPlayer[];

  constructor(_players: AnimationPlayer[]) {
    this.players = _players;
    let doneCount = 0;
    let destroyCount = 0;
    let startCount = 0;
    const total = this.players.length;

    if (total == 0) {
      queueMicrotask(() => this._onFinish());
    } else {
      this.players.forEach((player) => {
        player.onDone(() => {
          if (++doneCount == total) {
            this._onFinish();
          }
        });
        player.onDestroy(() => {
          if (++destroyCount == total) {
            this._onDestroy();
          }
        });
        player.onStart(() => {
          if (++startCount == total) {
            this._onStart();
          }
        });
      });
    }

    this.totalTime = this.players.reduce((time, player) => Math.max(time, player.totalTime), 0);
  }

  private _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach((fn) => fn());
      this._onDoneFns = [];
    }
  }

  init(): void {
    this.players.forEach((player) => player.init());
  }

  onStart(fn: () => void): void {
    this._onStartFns.push(fn);
  }

  private _onStart() {
    if (!this.hasStarted()) {
      this._started = true;
      this._onStartFns.forEach((fn) => fn());
      this._onStartFns = [];
    }
  }

  onDone(fn: () => void): void {
    this._onDoneFns.push(fn);
  }

  onDestroy(fn: () => void): void {
    this._onDestroyFns.push(fn);
  }

  hasStarted() {
    return this._started;
  }

  play() {
    if (!this.parentPlayer) {
      this.init();
    }
    this._onStart();
    this.players.forEach((player) => player.play());
  }

  pause(): void {
    this.players.forEach((player) => player.pause());
  }

  restart(): void {
    this.players.forEach((player) => player.restart());
  }

  finish(): void {
    this._onFinish();
    this.players.forEach((player) => player.finish());
  }

  destroy(): void {
    this._onDestroy();
  }

  private _onDestroy() {
    if (!this._destroyed) {
      this._destroyed = true;
      this._onFinish();
      this.players.forEach((player) => player.destroy());
      this._onDestroyFns.forEach((fn) => fn());
      this._onDestroyFns = [];
    }
  }

  reset(): void {
    this.players.forEach((player) => player.reset());
    this._destroyed = false;
    this._finished = false;
    this._started = false;
  }

  setPosition(p: number): void {
    const timeAtPosition = p * this.totalTime;
    this.players.forEach((player) => {
      const position = player.totalTime ? Math.min(1, timeAtPosition / player.totalTime) : 1;
      player.setPosition(position);
    });
  }

  getPosition(): number {
    const longestPlayer = this.players.reduce(
      (longestSoFar: AnimationPlayer | null, player: AnimationPlayer) => {
        const newPlayerIsLongest =
          longestSoFar === null || player.totalTime > longestSoFar.totalTime;
        return newPlayerIsLongest ? player : longestSoFar;
      },
      null,
    );
    return longestPlayer != null ? longestPlayer.getPosition() : 0;
  }

  beforeDestroy(): void {
    this.players.forEach((player) => {
      if (player.beforeDestroy) {
        player.beforeDestroy();
      }
    });
  }

  /** @internal */
  triggerCallback(phaseName: string): void {
    const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
    methods.forEach((fn) => fn());
    methods.length = 0;
  }
}
