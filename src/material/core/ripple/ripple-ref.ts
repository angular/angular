/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Possible states for a ripple element. */
export const enum RippleState {
  FADING_IN,
  VISIBLE,
  FADING_OUT,
  HIDDEN,
}

export type RippleConfig = {
  color?: string;
  centered?: boolean;
  radius?: number;
  persistent?: boolean;
  animation?: RippleAnimationConfig;
  terminateOnPointerUp?: boolean;
};

/**
 * Interface that describes the configuration for the animation of a ripple.
 * There are two animation phases with different durations for the ripples.
 */
export interface RippleAnimationConfig {
  /** Duration in milliseconds for the enter animation (expansion from point of contact). */
  enterDuration?: number;
  /** Duration in milliseconds for the exit animation (fade-out). */
  exitDuration?: number;
}

/**
 * Reference to a previously launched ripple element.
 */
export class RippleRef {
  /** Current state of the ripple. */
  state: RippleState = RippleState.HIDDEN;

  constructor(
    private _renderer: {fadeOutRipple(ref: RippleRef): void},
    /** Reference to the ripple HTML element. */
    public element: HTMLElement,
    /** Ripple configuration used for the ripple. */
    public config: RippleConfig,
    /* Whether animations are forcibly disabled for ripples through CSS. */
    public _animationForciblyDisabledThroughCss = false,
  ) {}

  /** Fades out the ripple element. */
  fadeOut() {
    this._renderer.fadeOutRipple(this);
  }
}
