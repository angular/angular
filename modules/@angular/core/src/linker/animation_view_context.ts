/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationGroupPlayer} from '../animation/animation_group_player';
import {NoOpAnimationPlayer} from "../animation/animation_player";
import {AnimationPlayer} from '../animation/animation_player';
import {AnimationQueue} from '../animation/animation_queue';
import {AnimationSequencePlayer} from '../animation/animation_sequence_player';
import {AnimationTransition} from '../animation/animation_transition';
import {ViewAnimationMap} from '../animation/view_animation_map';

export class AnimationViewContext {
  private _players = new ViewAnimationMap();

  constructor(public animationQueue: AnimationQueue) {}

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

  queueAnimation(view: any, element: any, animationName: string, player: AnimationPlayer): void {
    this.animationQueue.enqueue(view, player);
    this.assignPlayer(element, animationName, player);
  }

  assignPlayer(element: any, animationName: string, player: AnimationPlayer) {
    this._players.set(element, animationName, player);
    player.onDone(() => this._players.remove(element, animationName, player));
  }

  removePlayer(element: any, animationName: string, player: AnimationPlayer) {
    this._players.remove(element, animationName, player);
  }

  getElementAnimationPlayers(element: any): AnimationPlayer[] {
    return this._players.findAllPlayersByElement(element);
  }

  getAnimationPlayers(element: any, animationName: string = null, traverseIntoQueries: boolean = false): [AnimationPlayer, AnimationPlayer[]] {
    let rootPlayers: AnimationPlayer[] = [];
    const leafPlayers: AnimationPlayer[] = [];
    if (animationName) {
      const currentPlayers = this._players.find(element, animationName);
      if (currentPlayers.length) {
        rootPlayers = currentPlayers;
        currentPlayers.forEach(player => {
          _recurseAndCollectLeafPlayers(player, leafPlayers, traverseIntoQueries);
        });
      }
    } else {
      this.getElementAnimationPlayers(element).forEach(player => {
        rootPlayers.push(player);
        _recurseAndCollectLeafPlayers(player, leafPlayers, traverseIntoQueries);
      });
    }

    const rootPlayer = rootPlayers.length == 1 ? rootPlayers[0] : new AnimationGroupPlayer(rootPlayers);
    return [rootPlayer, leafPlayers];
  }
}

function _recurseAndCollectLeafPlayers(player: AnimationPlayer, collectedPlayers: AnimationPlayer[], traverseIntoQueries: boolean) {
  if (!traverseIntoQueries && player.flaggedForQuery) return;

  if ((player instanceof AnimationGroupPlayer) || (player instanceof AnimationSequencePlayer)) {
    player.players.forEach(player => _recurseAndCollectLeafPlayers(player, collectedPlayers, traverseIntoQueries));
  } else {
    collectedPlayers.push(player);
  }
}
