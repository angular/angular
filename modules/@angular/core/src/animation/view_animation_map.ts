/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StringMapWrapper} from '../facade/collection';
import {isPresent} from '../facade/lang';

import {AnimationPlayer} from './animation_player';

export class ViewAnimationMap {
  private _map = new Map<any, {[key: string]: AnimationPlayer}>();
  private _allPlayers: AnimationPlayer[] = [];

  get length(): number { return this.getAllPlayers().length; }

  find(element: any, animationName: string): AnimationPlayer {
    var playersByAnimation = this._map.get(element);
    if (isPresent(playersByAnimation)) {
      return playersByAnimation[animationName];
    }
  }

  findAllPlayersByElement(element: any): AnimationPlayer[] {
    const el = this._map.get(element);

    return el ? StringMapWrapper.values(el) : [];
  }

  set(element: any, animationName: string, player: AnimationPlayer): void {
    var playersByAnimation = this._map.get(element);
    if (!isPresent(playersByAnimation)) {
      playersByAnimation = {};
    }
    var existingEntry = playersByAnimation[animationName];
    if (isPresent(existingEntry)) {
      this.remove(element, animationName);
    }
    playersByAnimation[animationName] = player;
    this._allPlayers.push(player);
    this._map.set(element, playersByAnimation);
  }

  getAllPlayers(): AnimationPlayer[] { return this._allPlayers; }

  remove(element: any, animationName: string): void {
    const playersByAnimation = this._map.get(element);
    if (playersByAnimation) {
      const player = playersByAnimation[animationName];
      delete playersByAnimation[animationName];
      const index = this._allPlayers.indexOf(player);
      this._allPlayers.splice(index, 1);

      if (StringMapWrapper.isEmpty(playersByAnimation)) {
        this._map.delete(element);
      }
    }
  }
}
