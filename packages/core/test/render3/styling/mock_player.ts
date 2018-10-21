/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PlayState, Player} from '../../../src/render3/interfaces/player';

export class MockPlayer implements Player {
  parent: Player|null = null;

  log: string[] = [];
  state: PlayState = PlayState.Pending;
  private _listeners: {[state: string]: (() => any)[]} = {};

  constructor(public value?: any) {}

  play(): void {
    if (this.state === PlayState.Running) return;

    this.state = PlayState.Running;
    this._emit(PlayState.Running);
  }

  pause(): void {
    if (this.state === PlayState.Paused) return;

    this.state = PlayState.Paused;
    this._emit(PlayState.Paused);
  }

  finish(): void {
    if (this.state >= PlayState.Finished) return;

    this.state = PlayState.Finished;
    this._emit(PlayState.Finished);
  }

  destroy(): void {
    if (this.state >= PlayState.Destroyed) return;

    this.state = PlayState.Destroyed;
    this._emit(PlayState.Destroyed);
  }

  addEventListener(state: PlayState|number, cb: () => any): void {
    const key = state.toString();
    const arr = this._listeners[key] || (this._listeners[key] = []);
    arr.push(cb);
  }

  private _emit(state: PlayState) {
    const callbacks = this._listeners[state] || [];
    for (let i = 0; i < callbacks.length; i++) {
      const cb = callbacks[i];
      cb();
    }
  }
}
