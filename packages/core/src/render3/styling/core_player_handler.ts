/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PlayState, Player, PlayerHandler} from '../interfaces/player';

export class CorePlayerHandler implements PlayerHandler {
  private _players: Player[] = [];

  flushPlayers() {
    for (let i = 0; i < this._players.length; i++) {
      const player = this._players[i];
      if (!player.parent && player.state === PlayState.Pending) {
        player.play();
      }
    }
    this._players.length = 0;
  }

  queuePlayer(player: Player) { this._players.push(player); }
}
