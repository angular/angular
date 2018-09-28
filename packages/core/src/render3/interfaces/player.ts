/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A shared interface which contains an animation player
 */
export interface Player {
  parent?: Player|null;
  state: PlayState;
  play(): void;
  pause(): void;
  finish(): void;
  destroy(): void;
  addEventListener(state: PlayState|string, cb: (data?: any) => any): void;
}

/**
 * The state of a given player
 *
 * Do not change the increasing nature of the numbers since the player
 * code may compare state by checking if a number is higher or lower than
 * a certain numeric value.
 */
export const enum PlayState {Pending = 0, Running = 1, Paused = 2, Finished = 100, Destroyed = 200}

/**
 * The context that stores all active animation players present on an element.
 */
export declare type PlayerContext = Player[];
export declare type ComponentInstance = {};
export declare type DirectiveInstance = {};

/**
 * Designed to be used as an injection service to capture all animation players.
 *
 * When present all animation players will be passed into the flush method below.
 * This feature is designed to service application-wide animation testing, live
 * debugging as well as custom animation choreographing tools.
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
