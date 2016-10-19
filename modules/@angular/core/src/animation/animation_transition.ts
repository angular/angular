/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer} from './animation_player';
import {AnimationTransitionEvent} from './animation_transition_event';

export class AnimationTransition {
  constructor(
      private _player: AnimationPlayer, private _fromState: string, private _toState: string,
      private _totalTime: number) {}

  private _createEvent(phaseName: string): AnimationTransitionEvent {
    return new AnimationTransitionEvent({
      fromState: this._fromState,
      toState: this._toState,
      totalTime: this._totalTime,
      phaseName: phaseName
    });
  }

  onStart(callback: (event: AnimationTransitionEvent) => any): void {
    const event = this._createEvent('start');
    this._player.onStart(() => callback(event));
  }

  onDone(callback: (event: AnimationTransitionEvent) => any): void {
    const event = this._createEvent('done');
    this._player.onDone(() => callback(event));
  }
}
