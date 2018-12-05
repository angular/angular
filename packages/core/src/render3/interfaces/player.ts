/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Observable} from 'rxjs';

/**
 * A base interface player for all animations.
 *
 * @publicApi
 */
export interface Player {
  parent?: Player|null;
  state: PlayState;
  getStatus(): Observable<PlayState|string>;
  play(): void;
  pause(): void;
  finish(replacementPlayer?: Player|null): void;
  destroy(replacementPlayer?: Player|null): void;
}

/**
 * The type of binding passed into the player factory
 *
 * @publicApi
 */
export const enum BindingType {
  Unset = 0,
  Class = 1,
  Style = 2,
}

/**
 * Used to provide extra information about the state of players and
 * styling present on the element that is being set for animation.
 *
 * @publicApi
 */
export interface PlayerFactoryBuildOptions { isFirstRender: boolean; }

/**
 * Defines the shape which produces the Player.
 *
 * Used to produce a player that will be placed on an element that contains
 * styling bindings that make use of the player. This function is designed
 * to be used with `PlayerFactory`.
 *
 * @publicApi
 */
export interface PlayerFactoryBuildFn {
  (element: HTMLElement, type: BindingType, values: {[key: string]: any},
   currentPlayer: Player|null, options: PlayerFactoryBuildOptions): Player|null;
}

/**
 * Used as a reference to build a player from a styling template binding
 * (`[style]` and `[class]`).
 *
 * The `fn` function will be called once any styling-related changes are
 * evaluated on an element and is expected to return a player that will
 * be then run on the element.
 *
 * `[style]`, `[style.prop]`, `[class]` and `[class.name]` template bindings
 * all accept a `PlayerFactory` as input and this player factories.
 *
 * @publicApi
 */
export interface PlayerFactory { '__brand__': 'Brand for PlayerFactory that nothing will match'; }

export interface BindingStore { setValue(prop: string, value: any): void; }

export interface PlayerBuilder extends BindingStore {
  buildPlayer(currentPlayer: Player|null, isFirstRender: boolean): Player|undefined|null;
}

/**
 * The state of a given player
 *
 * Do not change the increasing nature of the numbers since the player
 * code may compare state by checking if a number is higher or lower than
 * a certain numeric value.
 *
 * @publicApi
 */
export const enum PlayState {Pending = 0, Running = 1, Paused = 2, Finished = 100, Destroyed = 200}

/**
 * The context that stores all the active players and queued player factories present on an element.
 *
 * @publicApi
 */
export interface PlayerContext extends Array<null|number|Player|PlayerBuilder> {
  [PlayerIndex.NonBuilderPlayersStart]: number;
  [PlayerIndex.ClassMapPlayerBuilderPosition]: PlayerBuilder|null;
  [PlayerIndex.ClassMapPlayerPosition]: Player|null;
  [PlayerIndex.StyleMapPlayerBuilderPosition]: PlayerBuilder|null;
  [PlayerIndex.StyleMapPlayerPosition]: Player|null;
}

/**
 * Designed to be used as an injection service to capture all animation players.
 *
 * When present all animation players will be passed into the flush method below.
 * This feature is designed to service application-wide animation testing, live
 * debugging as well as custom animation choreographing tools.
 *
 * @publicApi
 */
export interface PlayerHandler {
  /**
   * Designed to kick off the player at the end of change detection
   */
  flushPlayers(): void;

  /**
   * @param player The player that has been scheduled to run within the application.
   * @param context The context as to where the player was bound to
   */
  queuePlayer(player: Player, context: ComponentInstance|DirectiveInstance|HTMLElement): void;
}

export const enum PlayerIndex {
  // The position where the index that reveals where players start in the PlayerContext
  NonBuilderPlayersStart = 0,
  // The position where the player builder lives (which handles {key:value} map expression) for
  // classes
  ClassMapPlayerBuilderPosition = 1,
  // The position where the last player assigned to the class player builder is stored
  ClassMapPlayerPosition = 2,
  // The position where the player builder lives (which handles {key:value} map expression) for
  // styles
  StyleMapPlayerBuilderPosition = 3,
  // The position where the last player assigned to the style player builder is stored
  StyleMapPlayerPosition = 4,
  // The position where any player builders start in the PlayerContext
  PlayerBuildersStartPosition = 1,
  // The position where non map-based player builders start in the PlayerContext
  SinglePlayerBuildersStartPosition = 5,
  // For each player builder there is a player in the player context (therefore size = 2)
  PlayerAndPlayerBuildersTupleSize = 2,
  // The player exists next to the player builder in the list
  PlayerOffsetPosition = 1,
}

/**
 * A named symbol that represents an instance of a component
 *
 * @publicApi
 */
export declare type ComponentInstance = {};

/**
 * A named symbol that represents an instance of a directive
 *
 * @publicApi
 */
export declare type DirectiveInstance = {};
