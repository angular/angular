/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {isPresent} from '../facade/lang';

import {AnimationPlayer} from './animation_player';

export class ViewAnimationMap {
  private _map = new Map<any, {[key: string]: AnimationPlayer[]}>();
  private _allPlayers: AnimationPlayer[] = [];

  find(element: any, animationName: string): AnimationPlayer[] {
    const playersByAnimation = this._map.get(element);
    if (isPresent(playersByAnimation)) {
      const players = playersByAnimation[animationName];
      if (players) {
        return players;
      }
    }
    return [];
  }

  findAllPlayersByElement(element: any): AnimationPlayer[] {
    const players: AnimationPlayer[] = [];
    const playersByElement = this._map.get(element);
    if (playersByElement) {
      Object.keys(playersByElement).forEach(animationName => {
        players.push(...playersByElement[animationName]);
      });
    }
    return players;
  }

  set(element: any, animationName: string, player: AnimationPlayer): void {
    let playersByAnimation = this._map.get(element);
    if (!isPresent(playersByAnimation)) {
      this._map.set(element, playersByAnimation = {});
    }

    let players = playersByAnimation[animationName];
    if (!isPresent(players)) {
      players = playersByAnimation[animationName] = [];
    }

    players.push(player);
    this._allPlayers.push(player);
  }

  getAllPlayers(): AnimationPlayer[] { return this._allPlayers; }

  remove(element: any, animationName: string, targetPlayer: AnimationPlayer = null): void {
    const playersByAnimation = this._map.get(element);
    if (playersByAnimation) {
      let playersToRemove: AnimationPlayer[];
      const players = playersByAnimation[animationName];
      if (players) {
        if (targetPlayer) {
          playersToRemove = [];
          const innerIndex = players.indexOf(targetPlayer);
          if (innerIndex >= 0) {
            players.splice(innerIndex, 1);
            playersToRemove.push(targetPlayer);
          }
        } else {
          playersToRemove = players;
          delete playersByAnimation[animationName];
        }
      }

      playersToRemove.forEach(player => {
        const outerIndex = this._allPlayers.indexOf(player);
        if (outerIndex >= 0) {
          this._allPlayers.splice(outerIndex, 1);
        }
      });

      if (Object.keys(playersByAnimation).length === 0) {
        this._map.delete(element);
      }
    }
  }
}
