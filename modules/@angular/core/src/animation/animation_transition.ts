/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ElementRef} from '../linker/element_ref';

import {AnimationPlayer} from './animation_player';
import {AnimationTransitionEvent} from './animation_transition_event';

export class AnimationTransition {
  constructor(
      private _player: AnimationPlayer, private _element: ElementRef, private _triggerName: string,
      private _fromState: string, private _toState: string, private _totalTime: number) {}

  private _createEvent(phaseName: string): AnimationTransitionEvent {
    return new AnimationTransitionEvent({
      fromState: this._fromState,
      toState: this._toState,
      totalTime: this._totalTime,
      phaseName: phaseName,
      element: this._element,
      triggerName: this._triggerName
    });
  }

  onStart(callback: (event: AnimationTransitionEvent) => any): void {
    const fn =
        <() => void>Zone.current.wrap(() => callback(this._createEvent('start')), 'player.onStart');
    this._player.onStart(fn);
  }

  onDone(callback: (event: AnimationTransitionEvent) => any): void {
    const fn =
        <() => void>Zone.current.wrap(() => callback(this._createEvent('done')), 'player.onDone');
    this._player.onDone(fn);
  }
}
