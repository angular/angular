/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './ng_dev_mode';

import {getContext} from './context_discovery';
import {getRootContext} from './discovery_utils';
import {scheduleTick} from './instructions';
import {ComponentInstance, DirectiveInstance, Player} from './interfaces/player';
import {HEADER_OFFSET, RootContextFlags} from './interfaces/view';
import {addPlayerInternal, getOrCreatePlayerContext, getPlayerContext, getPlayersInternal, getStylingContext, throwInvalidRefError} from './styling/util';

/**
 * Adds a player to an element, directive or component instance that will later be
 * animated once change detection has passed.
 *
 * When a player is added to a reference it will stay active until `player.destroy()`
 * is called. Once called then the player will be removed from the active players
 * present on the associated ref instance.
 *
 * To get a list of all the active players on an element see [getPlayers].
 *
 * @param ref The element, directive or component that the player will be placed on.
 * @param player The player that will be triggered to play once change detection has run.
 */
export function addPlayer(
    ref: ComponentInstance | DirectiveInstance | HTMLElement, player: Player): void {
  const context = getContext(ref);
  if (!context) {
    ngDevMode && throwInvalidRefError();
    return;
  }

  const element = context.native as HTMLElement;
  const lViewData = context.lViewData;
  const playerContext = getOrCreatePlayerContext(element, context) !;
  const rootContext = getRootContext(lViewData);
  addPlayerInternal(playerContext, rootContext, element, player, 0, ref);
  scheduleTick(rootContext, RootContextFlags.FlushPlayers);
}

/**
 * Returns a list of all the active players present on the provided ref instance (which can
 * be an instance of a directive, component or element).
 *
 * This function will only return players that have been added to the ref instance using
 * `addPlayer` or any players that are active through any template styling bindings
 * (`[style]`, `[style.prop]`, `[class]` and `[class.name]`).
 *
 * @publicApi
 */
export function getPlayers(ref: ComponentInstance | DirectiveInstance | HTMLElement): Player[] {
  const context = getContext(ref);
  if (!context) {
    ngDevMode && throwInvalidRefError();
    return [];
  }

  const stylingContext = getStylingContext(context.nodeIndex - HEADER_OFFSET, context.lViewData);
  const playerContext = stylingContext ? getPlayerContext(stylingContext) : null;
  return playerContext ? getPlayersInternal(playerContext) : [];
}
