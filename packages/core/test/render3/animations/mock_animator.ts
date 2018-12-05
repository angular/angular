/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Animator, StylingEffect} from '../../../src/render3/animations/interfaces';

export class MockAnimator implements Animator {
  state = 0;

  public log: {[method: string]: any[]} = {};

  private _log(name: string, value: any = null) {
    const values = this.log[name] = this.log[name] || [];
    values.push(value);
  }

  addEffect(effect: StylingEffect): void { this._log('addEffect', effect); }

  finishEffect(effect: StylingEffect): void { this._log('finishEffect', effect); }

  finishAll(): void { this._log('finishAll'); }

  destroyEffect(effect: StylingEffect): void { this._log('destroyEffect', effect); }

  scheduleFlush(): void { this._log('scheduleFlush'); }

  flushEffects(): boolean {
    this._log('flushEffects');
    return true;
  }

  destroy(): void { this._log('destroy'); }

  onAllEffectsDone(cb: () => any): void { this._log('onAllEffectsDone', cb); }
}