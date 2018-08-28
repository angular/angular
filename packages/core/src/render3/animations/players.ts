/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '../ng_dev_mode';

import {LContext, getContext} from '../context_discovery';
import {scheduleTick} from '../instructions';
import {LElementNode} from '../interfaces/node';
import {RootContextFlags} from '../interfaces/view';
import {StylingContext, StylingIndex, createEmptyStylingContext} from '../styling';
import {getRootContext} from '../util';

import {CorePlayerHandler} from './core_player_handler';
import {AnimationContext, ComponentInstance, DirectiveInstance, PlayState, Player} from './interfaces';

export function addPlayer(
    ref: ComponentInstance | DirectiveInstance | HTMLElement, player: Player): void {
  const elementContext = getContext(ref) !;
  const animationContext = getOrCreateAnimationContext(elementContext.native, elementContext) !;
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
  return getOrCreateAnimationContext(ref);
}

export function getOrCreateAnimationContext(
    target: {}, context?: LContext | null): AnimationContext {
  context = context || getContext(target) !;
  if (ngDevMode && !context) {
    throw new Error(
        'Only elements that exist in an Angular application can be used for animations');
  }

  const {lViewData, lNodeIndex} = context;
  const value = lViewData[lNodeIndex];
  let stylingContext = value as StylingContext;
  if (!Array.isArray(value)) {
    stylingContext = lViewData[lNodeIndex] = createEmptyStylingContext(value as LElementNode);
  }
  return stylingContext[StylingIndex.AnimationContext] || allocAnimationContext(stylingContext);
}

function allocAnimationContext(data: StylingContext): AnimationContext {
  return data[StylingIndex.AnimationContext] = [];
}
