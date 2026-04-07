/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CssPropertyValue} from './parser';

export type AnimationConfig = {
  /**
   * In milliseconds. How much the time increments or decrements when you go forward or back in time.
   * In the case of auto play, the timestep virtually acts as FPS (frames per second).
   *
   * Default: `100`
   */
  timestep: number;
};

export type Styles = {[key: string]: string};

export type ParsedStyles = {[key: string]: CssPropertyValue};

interface AnimationRuleBase {
  /**
   * Selector in the form of `LAYER_ID >> OBJECT_SELECTOR`.
   * The object selector should be a class (prefixed with dot: `.my-class`) and is optional.
   */
  selector: string;
}

/** Animation definition */
export interface DynamicAnimationRule<T extends Styles | ParsedStyles> extends AnimationRuleBase {
  at?: never;

  /** In seconds. Marks the time frame between which the styles are applied (`[START, END]`). */
  timeframe: [number, number];
  /** Start styles.  */
  from: T;
  /** End styles. */
  to: T;
}

export interface StaticAnimationRule<T extends Styles | ParsedStyles> extends AnimationRuleBase {
  timeframe?: never;

  /** In seconds. Time at which the styles are applied. */
  at: number;
  /** Styles to be applied. */
  styles: T;
}

export type AnimationRule<T extends Styles | ParsedStyles> =
  | DynamicAnimationRule<T>
  | StaticAnimationRule<T>;

export type AnimationDefinition = AnimationRule<Styles>[];
