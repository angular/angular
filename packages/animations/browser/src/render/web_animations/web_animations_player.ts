/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AUTO_STYLE, AnimationPlayer} from '@angular/animations';
import {DOMAnimation} from './dom_animation';

export class WebAnimationsPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _onDestroyFns: Function[] = [];
  private _player: DOMAnimation;
  private _duration: number;
  private _delay: number;
  private _initialized = false;
  private _finished = false;
  private _started = false;
  private _destroyed = false;
  private _finalKeyframe: {[key: string]: string | number};
  public time = 0;

  public parentPlayer: AnimationPlayer|null = null;
  public previousStyles: {[styleName: string]: string | number};

  constructor(
      public element: any, public keyframes: {[key: string]: string | number}[],
      public options: {[key: string]: string | number},
      previousPlayers: WebAnimationsPlayer[] = []) {
    this._duration = <number>options['duration'];
    this._delay = <number>options['delay'] || 0;
    this.time = this._duration + this._delay;

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
        if (!startingKeyframe.hasOwnProperty(prop)) {
          missingStyleProps.push(prop);
        }
        startingKeyframe[prop] = this.previousStyles[prop];
      });

      if (missingStyleProps.length) {
        const self = this;
        // tslint:disable-next-line
        for (var i = 1; i < keyframes.length; i++) {
          let kf = keyframes[i];
          missingStyleProps.forEach(function(prop) {
            kf[prop] = _computeStyle(self.element, prop);
          });
        }
      }
    }

    this._player = this._triggerWebAnimation(this.element, keyframes, this.options);
    this._finalKeyframe =
        keyframes.length ? _copyKeyframeStyles(keyframes[keyframes.length - 1]) : {};

    // this is required so that the player doesn't start to animate right away
    this._resetDomPlayerState();
    this._player.addEventListener('finish', () => this._onFinish());
  }

  /** @internal */
  _triggerWebAnimation(element: any, keyframes: any[], options: any): DOMAnimation {
    // jscompiler doesn't seem to know animate is a native property because it's not fully
    // supported yet across common browsers (we polyfill it for Edge/Safari) [CL #143630929]
    return element['animate'](keyframes, options) as DOMAnimation;
  }

  get domPlayer() { return this._player; }

  onStart(fn: () => void): void { this._onStartFns.push(fn); }

  onDone(fn: () => void): void { this._onDoneFns.push(fn); }

  onDestroy(fn: () => void): void { this._onDestroyFns.push(fn); }

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
      this._onDestroyFns.forEach(fn => fn());
      this._onDestroyFns = [];
    }
  }

  setPosition(p: number): void { this._player.currentTime = p * this.time; }

  getPosition(): number { return this._player.currentTime / this.time; }

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
  return (<any>window.getComputedStyle(element))[prop];
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
