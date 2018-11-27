/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '../ng_dev_mode';

import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {getContext} from '../context_discovery';
import {ACTIVE_INDEX, LContainer} from '../interfaces/container';
import {LContext} from '../interfaces/context';
import {PlayState, Player, PlayerContext, PlayerIndex} from '../interfaces/player';
import {RElement} from '../interfaces/renderer';
import {InitialStyles, StylingContext, StylingIndex} from '../interfaces/styling';
import {FLAGS, HEADER_OFFSET, HOST, LViewData, RootContext} from '../interfaces/view';
import {getTNode} from '../util';

import {CorePlayerHandler} from './core_player_handler';

export function createEmptyStylingContext(
    element?: RElement | null, sanitizer?: StyleSanitizeFn | null,
    initialStylingValues?: InitialStyles): StylingContext {
  return [
    null,                            // PlayerContext
    sanitizer || null,               // StyleSanitizer
    initialStylingValues || [null],  // InitialStyles
    0,                               // MasterFlags
    0,                               // ClassOffset
    element || null,                 // Element
    null,                            // PreviousMultiClassValue
    null                             // PreviousMultiStyleValue
  ];
}

/**
 * Used clone a copy of a pre-computed template of a styling context.
 *
 * A pre-computed template is designed to be computed once for a given element
 * (instructions.ts has logic for caching this).
 */
export function allocStylingContext(
    element: RElement | null, templateStyleContext: StylingContext): StylingContext {
  // each instance gets a copy
  const context = templateStyleContext.slice() as any as StylingContext;
  context[StylingIndex.ElementPosition] = element;
  return context;
}

/**
 * Retrieve the `StylingContext` at a given index.
 *
 * This method lazily creates the `StylingContext`. This is because in most cases
 * we have styling without any bindings. Creating `StylingContext` eagerly would mean that
 * every style declaration such as `<div style="color: red">` would result `StyleContext`
 * which would create unnecessary memory pressure.
 *
 * @param index Index of the style allocation. See: `elementStyling`.
 * @param viewData The view to search for the styling context
 */
export function getStylingContext(index: number, viewData: LViewData): StylingContext {
  let storageIndex = index + HEADER_OFFSET;
  let slotValue: LContainer|LViewData|StylingContext|RElement = viewData[storageIndex];
  let wrapper: LContainer|LViewData|StylingContext = viewData;

  while (Array.isArray(slotValue)) {
    wrapper = slotValue;
    slotValue = slotValue[HOST] as LViewData | StylingContext | RElement;
  }

  if (isStylingContext(wrapper)) {
    return wrapper as StylingContext;
  } else {
    // This is an LViewData or an LContainer
    const stylingTemplate = getTNode(index, viewData).stylingTemplate;

    if (wrapper !== viewData) {
      storageIndex = HOST;
    }

    return wrapper[storageIndex] = stylingTemplate ?
        allocStylingContext(slotValue, stylingTemplate) :
        createEmptyStylingContext(slotValue);
  }
}

function isStylingContext(value: LViewData | LContainer | StylingContext) {
  // Not an LViewData or an LContainer
  return typeof value[FLAGS] !== 'number' && typeof value[ACTIVE_INDEX] !== 'number';
}

export function addPlayerInternal(
    playerContext: PlayerContext, rootContext: RootContext, element: HTMLElement,
    player: Player | null, playerContextIndex: number, ref?: any): boolean {
  ref = ref || element;
  if (playerContextIndex) {
    playerContext[playerContextIndex] = player;
  } else {
    playerContext.push(player);
  }

  if (player) {
    player.addEventListener(PlayState.Destroyed, () => {
      const index = playerContext.indexOf(player);
      const nonFactoryPlayerIndex = playerContext[PlayerIndex.NonBuilderPlayersStart];

      // if the player is being removed from the factory side of the context
      // (which is where the [style] and [class] bindings do their thing) then
      // that side of the array cannot be resized since the respective bindings
      // have pointer index values that point to the associated factory instance
      if (index) {
        if (index < nonFactoryPlayerIndex) {
          playerContext[index] = null;
        } else {
          playerContext.splice(index, 1);
        }
      }
      player.destroy();
    });

    const playerHandler =
        rootContext.playerHandler || (rootContext.playerHandler = new CorePlayerHandler());
    playerHandler.queuePlayer(player, ref);
    return true;
  }

  return false;
}

export function getPlayersInternal(playerContext: PlayerContext): Player[] {
  const players: Player[] = [];
  const nonFactoryPlayersStart = playerContext[PlayerIndex.NonBuilderPlayersStart];

  // add all factory-based players (which are apart of [style] and [class] bindings)
  for (let i = PlayerIndex.PlayerBuildersStartPosition + PlayerIndex.PlayerOffsetPosition;
       i < nonFactoryPlayersStart; i += PlayerIndex.PlayerAndPlayerBuildersTupleSize) {
    const player = playerContext[i] as Player | null;
    if (player) {
      players.push(player);
    }
  }

  // add all custom players (not apart of [style] and [class] bindings)
  for (let i = nonFactoryPlayersStart; i < playerContext.length; i++) {
    players.push(playerContext[i] as Player);
  }

  return players;
}


export function getOrCreatePlayerContext(target: {}, context?: LContext | null): PlayerContext|
    null {
  context = context || getContext(target) !;
  if (!context) {
    ngDevMode && throwInvalidRefError();
    return null;
  }

  const {lViewData, nodeIndex} = context;
  const stylingContext = getStylingContext(nodeIndex - HEADER_OFFSET, lViewData);
  return getPlayerContext(stylingContext) || allocPlayerContext(stylingContext);
}

export function getPlayerContext(stylingContext: StylingContext): PlayerContext|null {
  return stylingContext[StylingIndex.PlayerContext];
}

export function allocPlayerContext(data: StylingContext): PlayerContext {
  return data[StylingIndex.PlayerContext] =
             [PlayerIndex.SinglePlayerBuildersStartPosition, null, null, null, null];
}

export function throwInvalidRefError() {
  throw new Error('Only elements that exist in an Angular application can be used for animations');
}
