import {RippleConfig, RippleRenderer} from './ripple-renderer';

/** Possible states for a ripple element. */
export enum RippleState {
  FADING_IN, VISIBLE, FADING_OUT, HIDDEN
}

/**
 * Reference to a previously launched ripple element.
 */
export class RippleRef {

  /** Current state of the ripple reference. */
  state: RippleState = RippleState.HIDDEN;

  constructor(
    private _renderer: RippleRenderer,
    public element: HTMLElement,
    public config: RippleConfig) {
  }

  /** Fades out the ripple element. */
  fadeOut() {
    this._renderer.fadeOutRipple(this);
  }
}
