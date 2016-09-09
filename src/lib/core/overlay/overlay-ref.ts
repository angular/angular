import {PortalHost, Portal} from '../portal/portal';
import {OverlayState} from './overlay-state';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';


/**
 * Reference to an overlay that has been created with the Overlay service.
 * Used to manipulate or dispose of said overlay.
 */
export class OverlayRef implements PortalHost {
  private _backdropElement: HTMLElement = null;
  private _backdropClick: Subject<any> = new Subject();

  constructor(
      private _portalHost: PortalHost,
      private _pane: HTMLElement,
      private _state: OverlayState) { }

  attach(portal: Portal<any>): any {
    if (this._state.hasBackdrop) {
      this._attachBackdrop();
    }

    let attachResult = this._portalHost.attach(portal);
    this.updatePosition();

    return attachResult;
  }

  detach(): Promise<any> {
    this._detatchBackdrop();
    return this._portalHost.detach();
  }

  dispose(): void {
    this._detatchBackdrop();
    this._portalHost.dispose();
  }

  hasAttached(): boolean {
    return this._portalHost.hasAttached();
  }

  backdropClick(): Observable<void> {
    return this._backdropClick.asObservable();
  }

  /** Gets the current state config of the overlay. */
  getState() {
    return this._state;
  }

  /** Updates the position of the overlay based on the position strategy. */
  updatePosition() {
    if (this._state.positionStrategy) {
      this._state.positionStrategy.apply(this._pane);
    }
  }

  /** Attaches a backdrop for this overlay. */
  private _attachBackdrop() {
    this._backdropElement = document.createElement('div');
    this._backdropElement.classList.add('md-overlay-backdrop');
    this._pane.parentElement.appendChild(this._backdropElement);

    // Forward backdrop clicks such that the consumer of the overlay can perform whatever
    // action desired when such a click occurs (usually closing the overlay).
    this._backdropElement.addEventListener('click', () => {
      this._backdropClick.next(null);
    });

    // Add class to fade-in the backdrop after one frame.
    requestAnimationFrame(() => {
      this._backdropElement.classList.add('md-overlay-backdrop-showing');
    });
  }

  /** Detaches the backdrop (if any) associated with the overlay. */
  private _detatchBackdrop(): void {
    let backdropToDetach = this._backdropElement;

    if (backdropToDetach) {
      backdropToDetach.classList.remove('md-overlay-backdrop-showing');
      backdropToDetach.addEventListener('transitionend', () => {
        backdropToDetach.parentNode.removeChild(backdropToDetach);

        // It is possible that a new portal has been attached to this overlay since we started
        // removing the backdrop. If that is the case, only clear the backdrop reference if it
        // is still the same instance that we started to remove.
        if (this._backdropElement == backdropToDetach) {
          this._backdropElement = null;
        }
      });
    }
  }
}
