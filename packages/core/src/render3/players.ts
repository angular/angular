/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {getContext} from './context_discovery';
import {scheduleTick} from './instructions';
import {ComponentInstance, DirectiveInstance, PlayState, Player} from './interfaces/player';
import {RootContextFlags} from './interfaces/view';
import {CorePlayerHandler} from './styling/core_player_handler';
import {getOrCreatePlayerContext} from './styling/util';
import {getRootContext} from './util';

export function addPlayer(
    ref: ComponentInstance | DirectiveInstance | HTMLElement, player: Player): void {
  const elementContext = getContext(ref) !;
  const animationContext = getOrCreatePlayerContext(elementContext.native, elementContext) !;
  animationContext.push(player);

  player.addEventListener(PlayState.Destroyed, () => {
    const index = animationContext.indexOf(player);
    if (index >= 0) {
      animationContext.splice(index, 1);
    }
    player.destroy();
  });

  const rootContext = getRootContext(elementContext.lViewData);
  const playerHandler =
      rootContext.playerHandler || (rootContext.playerHandler = new CorePlayerHandler());
  playerHandler.queuePlayer(player, ref);

  const nothingScheduled = rootContext.flags === RootContextFlags.Empty;

  // change detection may or may not happen therefore
  // the core code needs to be kicked off to flush the animations
  rootContext.flags |= RootContextFlags.FlushPlayers;
  if (nothingScheduled) {
    scheduleTick(rootContext);
  }
}

export function getPlayers(ref: ComponentInstance | DirectiveInstance | HTMLElement): Player[] {
  return getOrCreatePlayerContext(ref);
}
