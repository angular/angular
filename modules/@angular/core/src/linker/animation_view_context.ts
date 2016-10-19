/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationGroupPlayer} from '../animation/animation_group_player';
import {AnimationPlayer} from '../animation/animation_player';
import {queueAnimation as queueAnimationGlobally} from '../animation/animation_queue';
import {AnimationTransitionEvent} from '../animation/animation_transition_event';
import {ViewAnimationMap} from '../animation/view_animation_map';

export class AnimationViewContext {
  private _players = new ViewAnimationMap();

  onAllActiveAnimationsDone(callback: () => any): void {
    var activeAnimationPlayers = this._players.getAllPlayers();
    // we check for the length to avoid having GroupAnimationPlayer
    // issue an unnecessary microtask when zero players are passed in
    if (activeAnimationPlayers.length) {
      new AnimationGroupPlayer(activeAnimationPlayers).onDone(() => callback());
    } else {
      callback();
    }
  }

  queueAnimation(element: any, animationName: string, player: AnimationPlayer): void {
    queueAnimationGlobally(player);
    this._players.set(element, animationName, player);
  }

  cancelActiveAnimation(element: any, animationName: string, removeAllAnimations: boolean = false):
      void {
    if (removeAllAnimations) {
      this._players.findAllPlayersByElement(element).forEach(player => player.destroy());
    } else {
      var player = this._players.find(element, animationName);
      if (player) {
        player.destroy();
      }
    }
  }
}
