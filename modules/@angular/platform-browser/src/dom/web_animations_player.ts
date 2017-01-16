/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AUTO_STYLE} from '@angular/core';

import {isPresent} from '../facade/lang';
import {AnimationPlayer} from '../private_import_core';

import {getDOM} from './dom_adapter';
import {DomAnimatePlayer} from './dom_animate_player';

export class WebAnimationsPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _player: DomAnimatePlayer;
  private _duration: number;
  private _initialized = false;
  private _finished = false;
  private _started = false;
  private _destroyed = false;
  private _finalKeyframe: {[key: string]: string | number};

  public parentPlayer: AnimationPlayer = null;
  public previousStyles: {[styleName: string]: string | number};

  constructor(
      public element: any, public keyframes: {[key: string]: string | number}[],
      public options: {[key: string]: string | number},
      previousPlayers: WebAnimationsPlayer[] = []) {
    this._duration = <number>options['duration'];

    this.previousStyles = {};
    previousPlayers.forEach(player => {
      let styles = player._captureStyles();
      Object.keys(styles).forEach(prop => this.previousStyles[prop] = styles[prop]);
    });
  }

  private _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach(fn => fn());
      this._onDoneFns = [];
    }
  }

  init(): void {
    if (this._initialized) return;
    this._initialized = true;

    const keyframes = this.keyframes.map(styles => {
      const formattedKeyframe: {[key: string]: string | number} = {};
      Object.keys(styles).forEach((prop, index) => {
        let value = styles[prop];
        if (value == AUTO_STYLE) {
          value = _computeStyle(this.element, prop);
        }
        if (value != undefined) {
          formattedKeyframe[prop] = value;
        }
      });
      return formattedKeyframe;
    });

    const previousStyleProps = Object.keys(this.previousStyles);
    if (previousStyleProps.length) {
      let startingKeyframe = keyframes[0];
      let missingStyleProps: string[] = [];
      previousStyleProps.forEach(prop => {
        if (!isPresent(startingKeyframe[prop])) {
          missingStyleProps.push(prop);
        }
        startingKeyframe[prop] = this.previousStyles[prop];
      });

      if (missingStyleProps.length) {
        for (let i = 1; i < keyframes.length; i++) {
          let kf = keyframes[i];
          missingStyleProps.forEach(prop => { kf[prop] = _computeStyle(this.element, prop); });
        }
      }
    }

    this._player = this._triggerWebAnimation(this.element, keyframes, this.options);
    this._finalKeyframe = _copyKeyframeStyles(keyframes[keyframes.length - 1]);

    // this is required so that the player doesn't start to animate right away
    this._resetDomPlayerState();
    this._player.addEventListener('finish', () => this._onFinish());
  }

  /** @internal */
  _triggerWebAnimation(element: any, keyframes: any[], options: any): DomAnimatePlayer {
    // jscompiler doesn't seem to know animate is a native property because it's not fully
    // supported yet across common browsers (we polyfill it for Edge/Safari) [CL #143630929]
    return <DomAnimatePlayer>element['animate'](keyframes, options);
  }

  get domPlayer() { return this._player; }

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

  reset(): void {
    this._resetDomPlayerState();
    this._destroyed = false;
    this._finished = false;
    this._started = false;
  }

  private _resetDomPlayerState() {
    if (this._player) {
      this._player.cancel();
    }
  }

  restart(): void {
    this.reset();
    this.play();
  }

  hasStarted(): boolean { return this._started; }

  destroy(): void {
    if (!this._destroyed) {
      this._resetDomPlayerState();
      this._onFinish();
      this._destroyed = true;
    }
  }

  get totalTime(): number { return this._duration; }

  setPosition(p: number): void { this._player.currentTime = p * this.totalTime; }

  getPosition(): number { return this._player.currentTime / this.totalTime; }

  private _captureStyles(): {[prop: string]: string | number} {
    const styles: {[key: string]: string | number} = {};
    if (this.hasStarted()) {
      Object.keys(this._finalKeyframe).forEach(prop => {
        if (prop != 'offset') {
          styles[prop] =
              this._finished ? this._finalKeyframe[prop] : _computeStyle(this.element, prop);
        }
      });
    }

    return styles;
  }
}

function _computeStyle(element: any, prop: string): string {
  return getDOM().getComputedStyle(element)[prop];
}

function _copyKeyframeStyles(styles: {[style: string]: string | number}):
    {[style: string]: string | number} {
  const newStyles: {[style: string]: string | number} = {};
  Object.keys(styles).forEach(prop => {
    if (prop != 'offset') {
      newStyles[prop] = styles[prop];
    }
  });
  return newStyles;
}
