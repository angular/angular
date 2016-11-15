/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AUTO_STYLE, AnimationPlayer} from '@angular/core';

export class MockAnimationPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _finished = false;
  private _destroyed = false;
  private _started = false;

  public parentPlayer: AnimationPlayer = null;
  public previousStyles: {[styleName: string]: string | number} = {};

  public log: any[] = [];

  constructor(
      public startingStyles: {[key: string]: string | number} = {},
      public keyframes: Array<[number, {[style: string]: string | number}]> = [],
      previousPlayers: AnimationPlayer[] = []) {
    previousPlayers.forEach(player => {
      if (player instanceof MockAnimationPlayer) {
        const styles = player._captureStyles();
        Object.keys(styles).forEach(prop => this.previousStyles[prop] = styles[prop]);
      }
    });
  }

  private _onFinish(): void {
    if (!this._finished) {
      this._finished = true;
      this.log.push('finish');

      this._onDoneFns.forEach(fn => fn());
      this._onDoneFns = [];
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

  reset(): void {
    this.log.push('reset');
    this._destroyed = false;
    this._finished = false;
    this._started = false;
  }

  destroy(): void {
    if (!this._destroyed) {
      this._destroyed = true;
      this.finish();
      this.log.push('destroy');
    }
  }

  setPosition(p: number): void {}
  getPosition(): number { return 0; }

  private _captureStyles(): {[styleName: string]: string | number} {
    const captures: {[prop: string]: string | number} = {};

    if (this.hasStarted()) {
      // when assembling the captured styles, it's important that
      // we build the keyframe styles in the following order:
      // {startingStyles, ... other styles within keyframes, ... previousStyles }
      Object.keys(this.startingStyles).forEach(prop => {
        captures[prop] = this.startingStyles[prop];
      });

      this.keyframes.forEach(kf => {
        const [offset, styles] = kf;
        const newStyles: {[prop: string]: string | number} = {};
        Object.keys(styles).forEach(
            prop => { captures[prop] = this._finished ? styles[prop] : AUTO_STYLE; });
      });
    }

    Object.keys(this.previousStyles).forEach(prop => {
      captures[prop] = this.previousStyles[prop];
    });

    return captures;
  }
}
