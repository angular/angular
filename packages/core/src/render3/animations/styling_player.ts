/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Observable, Subject} from 'rxjs';

import {PlayState, Player} from '../interfaces/player';

import {Animator, StylingEffect, Timing} from './interfaces';
import {hyphenateProp} from './util';

export class StylingPlayer implements Player {
  parent: Player|null = null;
  state = PlayState.Pending;
  private _subject !: Subject<PlayState|string>| null;
  private _effect: StylingEffect;

  constructor(
      public element: HTMLElement, private _animator: Animator, timing: Timing,
      classes: {[key: string]: any}|null, styles: {[key: string]: any}|null) {
    this._effect = {timing, classes, styles: styles ? hyphenateStyles(styles) : null};
  }

  getStatus(): Observable<PlayState|string> {
    if (!this._subject) {
      this._subject = new Subject<PlayState|string>();
    }
    return this._subject.asObservable();
  }

  private _emit(value: PlayState|string) {
    if (this._subject) {
      this._subject.next(value);
    }
  }

  play(): void {
    if (this.state === PlayState.Pending) {
      this._animator.addEffect(this._effect);
      this._animator.onAllEffectsDone(() => this._onFinish());
      this._animator.scheduleFlush();
      this._emit(this.state = PlayState.Running);
    } else if (this.state === PlayState.Paused) {
      this._emit(this.state = PlayState.Running);
    }
  }

  pause(): void {
    if (this.state === PlayState.Running) {
      this._emit(this.state = PlayState.Paused);
    }
  }

  finish(): void {
    if (this.state < PlayState.Finished) {
      this._animator.finishEffect(this._effect);
      this._onFinish();
    }
  }

  private _onFinish() {
    if (this.state < PlayState.Finished) {
      this._emit(this.state = PlayState.Finished);
    }
  }

  destroy(replacementPlayer?: Player|null): void {
    if (this.state < PlayState.Destroyed) {
      const removeEffect = !replacementPlayer || !(replacementPlayer instanceof StylingPlayer);
      if (removeEffect) {
        this._animator.destroyEffect(this._effect);
      }
      this._onFinish();
      this._emit(this.state = PlayState.Destroyed);
      if (this._subject) {
        this._subject.complete();
      }
    }
  }
}

function hyphenateStyles(styles: {[key: string]: any}): {[key: string]: any} {
  const props = Object.keys(styles);
  const newStyles: {[key: string]: any} = {};
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    newStyles[hyphenateProp(prop)] = styles[prop];
  }
  return newStyles;
}