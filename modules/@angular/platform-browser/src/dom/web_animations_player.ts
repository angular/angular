/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AUTO_STYLE} from '@angular/core';

import {StringMapWrapper} from '../facade/collection';
import {isPresent} from '../facade/lang';
import {AnimationPlayer} from '../private_import_core';

import {getDOM} from './dom_adapter';
import {DomAnimatePlayer} from './dom_animate_player';

export class WebAnimationsPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _finished = false;
  private _initialized = false;
  private _player: DomAnimatePlayer;
  private _started: boolean = false;
  private _duration: number;

  public parentPlayer: AnimationPlayer = null;

  constructor(
      public element: any, public keyframes: {[key: string]: string | number}[],
      public options: {[key: string]: string | number}) {
    this._duration = <number>options['duration'];
  }

  private _onFinish() {
    if (!this._finished) {
      this._finished = true;
      if (!isPresent(this.parentPlayer)) {
        this.destroy();
      }
      this._onDoneFns.forEach(fn => fn());
      this._onDoneFns = [];
    }
  }

  init(): void {
    if (this._initialized) return;
    this._initialized = true;

    var keyframes = this.keyframes.map(styles => {
      var formattedKeyframe: {[key: string]: string | number} = {};
      StringMapWrapper.forEach(styles, (value: string | number, prop: string) => {
        formattedKeyframe[prop] = value == AUTO_STYLE ? _computeStyle(this.element, prop) : value;
      });
      return formattedKeyframe;
    });

    this._player = this._triggerWebAnimation(this.element, keyframes, this.options);

    // this is required so that the player doesn't start to animate right away
    this.reset();
    this._player.onfinish = () => this._onFinish();
  }

  /** @internal */
  _triggerWebAnimation(element: any, keyframes: any[], options: any): DomAnimatePlayer {
    return <DomAnimatePlayer>element.animate(keyframes, options);
  }

  onStart(fn: () => void): void { this._onStartFns.push(fn); }

  onDone(fn: () => void): void { this._onDoneFns.push(fn); }

  play(): void {
    this.init();
    if (!this.hasStarted()) {
      this._onStartFns.forEach(fn => fn());
      this._onStartFns = [];
      this._started = true;
    }
    this._player.play();
  }

  pause(): void {
    this.init();
    this._player.pause();
  }

  finish(): void {
    this.init();
    this._onFinish();
    this._player.finish();
  }

  reset(): void { this._player.cancel(); }

  restart(): void {
    this.reset();
    this.play();
  }

  hasStarted(): boolean { return this._started; }

  destroy(): void {
    this.reset();
    this._onFinish();
  }

  get totalTime(): number { return this._duration; }

  setPosition(p: number): void { this._player.currentTime = p * this.totalTime; }

  getPosition(): number { return this._player.currentTime / this.totalTime; }
}

function _computeStyle(element: any, prop: string): string {
  return getDOM().getComputedStyle(element)[prop];
}
