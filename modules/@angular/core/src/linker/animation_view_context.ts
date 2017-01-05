/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationGroupPlayer} from '../animation/animation_group_player';
import {AnimationPlayer} from '../animation/animation_player';
import {AnimationQueue} from '../animation/animation_queue';
import {AnimationSequencePlayer} from '../animation/animation_sequence_player';
import {ViewAnimationMap} from '../animation/view_animation_map';

export class AnimationViewContext {
  private _players = new ViewAnimationMap();

  constructor(private _animationQueue: AnimationQueue) {}

  onAllActiveAnimationsDone(callback: () => any): void {
    const activeAnimationPlayers = this._players.getAllPlayers();
    // we check for the length to avoid having GroupAnimationPlayer
    // issue an unnecessary microtask when zero players are passed in
    if (activeAnimationPlayers.length) {
      new AnimationGroupPlayer(activeAnimationPlayers).onDone(() => callback());
    } else {
      callback();
    }
  }

  queueAnimation(element: any, animationName: string, player: AnimationPlayer): void {
    this._animationQueue.enqueue(player);
    this._players.set(element, animationName, player);
    player.onDone(() => this._players.remove(element, animationName, player));
  }

  getAnimationPlayers(element: any, animationName: string = null): AnimationPlayer[] {
    const players: AnimationPlayer[] = [];
    if (animationName) {
      const currentPlayer = this._players.find(element, animationName);
      if (currentPlayer) {
        _recursePlayers(currentPlayer, players);
      }
    } else {
      this._players.findAllPlayersByElement(element).forEach(
          player => _recursePlayers(player, players));
    }
    return players;
  }
}

function _recursePlayers(player: AnimationPlayer, collectedPlayers: AnimationPlayer[]) {
  if ((player instanceof AnimationGroupPlayer) || (player instanceof AnimationSequencePlayer)) {
    player.players.forEach(player => _recursePlayers(player, collectedPlayers));
  } else {
    collectedPlayers.push(player);
  }
}
