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
      public player: AnimationPlayer, private _triggerName: string, private _fromState: string, private _toState: string,
      private _totalTime: number) {}

  private _createEvent(phaseName: string): AnimationTransitionEvent {
    return new AnimationTransitionEvent({
      fromState: this._fromState,
      toState: this._toState,
      totalTime: this._totalTime,
      triggerName: this._triggerName,
      phaseName: phaseName,
    });
  }

  onStart(callback: (event: AnimationTransitionEvent) => any): void {
    const fn =
        <() => void>Zone.current.wrap(() => callback(this._createEvent('start')), 'player.onStart');
    this.player.onStart(fn);
  }

  onDone(callback: (event: AnimationTransitionEvent) => any): void {
    const fn =
        <() => void>Zone.current.wrap(() => callback(this._createEvent('done')), 'player.onDone');
    this.player.onDone(fn);
  }
}
