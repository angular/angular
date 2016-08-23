/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationPlayer} from '@angular/core';
import {isPresent} from './facade/lang';

export class MockAnimationPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _finished = false;
  private _destroyed = false;
  private _started: boolean = false;

  public parentPlayer: AnimationPlayer = null;

  public log: any[] /** TODO #9100 */ = [];

  private _onFinish(): void {
    if (!this._finished) {
      this._finished = true;
      this.log.push('finish');

      this._onDoneFns.forEach(fn => fn());
      this._onDoneFns = [];
      if (!isPresent(this.parentPlayer)) {
        this.destroy();
      }
    }
  }

  init(): void { this.log.push('init'); }

  onDone(fn: () => void): void { this._onDoneFns.push(fn); }

  onStart(fn: () => void): void { this._onStartFns.push(fn); }

  hasStarted() { return this._started; }

  play(): void {
    if (!this.hasStarted()) {
      this._onStartFns.forEach(fn => fn());
      this._onStartFns = [];
      this._started = true;
    }
    this.log.push('play');
  }

  pause(): void { this.log.push('pause'); }

  restart(): void { this.log.push('restart'); }

  finish(): void { this._onFinish(); }

  reset(): void { this.log.push('reset'); }

  destroy(): void {
    if (!this._destroyed) {
      this._destroyed = true;
      this.finish();
      this.log.push('destroy');
    }
  }

  setPosition(p: any /** TODO #9100 */): void {}
  getPosition(): number { return 0; }
}
