import {PortalHost, Portal} from '../portal/portal';
import {OverlayState} from './overlay-state';

/**
 * Reference to an overlay that has been created with the Overlay service.
 * Used to manipulate or dispose of said overlay.
 */
export class OverlayRef implements PortalHost {
  constructor(
      private _portalHost: PortalHost,
      private _pane: HTMLElement,
      private _state: OverlayState) { }

  attach(portal: Portal<any>): Promise<any> {
    return this._portalHost.attach(portal).then(() => {
      this._updatePosition();
    });
  }

  detach(): Promise<any> {
    return this._portalHost.detach();
  }

  dispose(): void {
    this._portalHost.dispose();
  }

  hasAttached(): boolean {
    return this._portalHost.hasAttached();
  }

  /** Gets the current state config of the overlay. */
  getState() {
    return this._state;
  }

  /** Updates the position of the overlay based on the position strategy. */
  private _updatePosition() {
    if (this._state.positionStrategy) {
      this._state.positionStrategy.apply(this._pane);
    }
  }

  // TODO(jelbourn): add additional methods for manipulating the overlay.
}
