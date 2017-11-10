/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer} from '@angular/animations';

import {allowPreviousPlayerStylesMerge, copyStyles, eraseStyles, setStyles} from '../../util';

import {DOMAnimation} from './dom_animation';

export class WebAnimationsPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _onDestroyFns: Function[] = [];
  private _duration: number;
  private _delay: number;
  private _initialized = false;
  private _finished = false;
  private _started = false;
  private _destroyed = false;
  private _finalKeyframe: {[key: string]: string | number};

  public readonly domPlayer: DOMAnimation;
  public time = 0;

  public parentPlayer: AnimationPlayer|null = null;
  public previousStyles: {[styleName: string]: string | number} = {};
  public currentSnapshot: {[styleName: string]: string | number} = {};

  constructor(
      public element: any, public keyframes: {[key: string]: string | number}[],
      public options: {[key: string]: string | number},
      private _startStyles?: {[key: string]: string | number},
      private _endStyles?: {[key: string]: string | number},
      previousPlayers?: WebAnimationsPlayer[]) {
    this._duration = <number>options['duration'];
    this._delay = <number>options['delay'] || 0;
    this.time = this._duration + this._delay;

    if (previousPlayers && allowPreviousPlayerStylesMerge(this._duration, this._delay)) {
      previousPlayers.forEach(player => {
        let styles = player.currentSnapshot;
        Object.keys(styles).forEach(prop => this.previousStyles[prop] = styles[prop]);
      });
    }
  }

  init(): void {
    this._buildPlayer();
    this._preparePlayerBeforeStart();
  }

  private _buildPlayer(): void {
    if (this._initialized) return;
    this._initialized = true;

    const keyframes = this.keyframes.map(styles => copyStyles(styles, false));
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

    (this as{domPlayer: DOMAnimation}).domPlayer =
        this._triggerWebAnimation(this.element, keyframes, this.options);
    this._finalKeyframe = keyframes.length ? keyframes[keyframes.length - 1] : {};
    this.domPlayer.addEventListener('finish', () => this._onFinish());
  }

  private _preparePlayerBeforeStart() {
    // this is required so that the player doesn't start to animate right away
    if (this._delay) {
      this._resetDomPlayerState();
    } else {
      this.domPlayer.pause();
    }
  }

  /** @internal */
  _triggerWebAnimation(element: any, keyframes: any[], options: any): DOMAnimation {
    // jscompiler doesn't seem to know animate is a native property because it's not fully
    // supported yet across common browsers (we polyfill it for Edge/Safari) [CL #143630929]
    return element['animate'](keyframes, options) as DOMAnimation;
  }

  onStart(fn: () => void): void { this._onStartFns.push(fn); }

  onDone(fn: () => void): void { this._onDoneFns.push(fn); }

  onDestroy(fn: () => void): void { this._onDestroyFns.push(fn); }

  play(): void {
    this._buildPlayer();
    this._onStart();
    this.domPlayer.play();
  }

  private _onStart() {
    if (!this._started) {
      if (this._startStyles) {
        setStyles(this.element, this._startStyles);
      }

      this._started = true;
      this._onStartFns.forEach(fn => fn());
      this._onStartFns = [];
    }
  }

  pause(): void {
    this.init();
    this.domPlayer.pause();
  }

  finish(): void {
    this.init();
    this._onFinish();
    this.domPlayer.finish();
  }

  private _onFinish() {
    if (!this._finished) {
      if (this._startStyles) {
        eraseStyles(this.element, this._startStyles);
      }
      if (this._endStyles) {
        setStyles(this.element, this._endStyles);
      }
      this._finished = true;
      this._onDoneFns.forEach(fn => fn());
      this._onDoneFns = [];
    }
  }

  reset(): void {
    this._resetDomPlayerState();
    this._destroyed = false;
    this._finished = false;
    this._started = false;
  }

  private _resetDomPlayerState() {
    if (this.domPlayer) {
      this.domPlayer.cancel();
    }
  }

  restart(): void {
    this.reset();
    this.play();
  }

  hasStarted(): boolean { return this._started; }

  destroy(): void {
    if (!this._destroyed) {
      this._destroyed = true;
      this._resetDomPlayerState();
      this._onFinish();
      if (this._endStyles) {
        eraseStyles(this.element, this._endStyles);
      }
      this._onDestroyFns.forEach(fn => fn());
      this._onDestroyFns = [];
    }
  }

  setPosition(p: number): void { this.domPlayer.currentTime = p * this.time; }

  getPosition(): number { return this.domPlayer.currentTime / this.time; }

  get totalTime(): number { return this._delay + this._duration; }

  beforeDestroy() {
    const styles: {[key: string]: string | number} = {};
    if (this.hasStarted()) {
      Object.keys(this._finalKeyframe).forEach(prop => {
        if (prop != 'offset') {
          styles[prop] =
              this._finished ? this._finalKeyframe[prop] : _computeStyle(this.element, prop);
        }
      });
    }
    this.currentSnapshot = styles;
  }

  /* @internal */
  triggerCallback(phaseName: string): void {
    const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
    methods.forEach(fn => fn());
    methods.length = 0;
  }
}

function _computeStyle(element: any, prop: string): string {
  return (<any>window.getComputedStyle(element))[prop];
}
