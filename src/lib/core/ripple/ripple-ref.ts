import {RippleConfig, RippleRenderer} from './ripple-renderer';

/**
 * Reference to a previously launched ripple element.
 */
export class RippleRef {

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
