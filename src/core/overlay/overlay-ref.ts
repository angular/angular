import {PortalHost, Portal} from '../portal/portal';

/**
 * Reference to an overlay that has been created with the Overlay service.
 * Used to manipulate or dispose of said overlay.
 */
export class OverlayRef implements PortalHost {
  constructor(private _portalHost: PortalHost) { }

  attach(portal: Portal<any>): Promise<any> {
    return this._portalHost.attach(portal);
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

  // TODO(jelbourn): add additional methods for manipulating the overlay.
}
