import {NgZone} from '@angular/core';
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
      private _state: OverlayState,
      private _ngZone: NgZone) { }

  /** The overlay's HTML element */
  get overlayElement(): HTMLElement {
    return this._pane;
  }

  /**
   * Attaches the overlay to a portal instance and adds the backdrop.
   * @param portal Portal instance to which to attach the overlay.
   * @returns The portal attachment result.
   */
  attach(portal: Portal<any>): any {
    if (this._state.hasBackdrop) {
      this._attachBackdrop();
    }

    let attachResult = this._portalHost.attach(portal);

    // Update the pane element with the given state configuration.
    this.updateSize();
    this.updateDirection();
    this.updatePosition();

    // Enable pointer events for the overlay pane element.
    this._togglePointerEvents(true);

    return attachResult;
  }

  /**
   * Detaches an overlay from a portal.
   * @returns Resolves when the overlay has been detached.
   */
  detach(): Promise<any> {
    this.detachBackdrop();

    // When the overlay is detached, the pane element should disable pointer events.
    // This is necessary because otherwise the pane element will cover the page and disable
    // pointer events therefore. Depends on the position strategy and the applied pane boundaries.
    this._togglePointerEvents(false);

    return this._portalHost.detach();
  }

  /**
   * Cleans up the overlay from the DOM.
   */
  dispose(): void {
    if (this._state.positionStrategy) {
      this._state.positionStrategy.dispose();
    }

    this.detachBackdrop();
    this._portalHost.dispose();
  }

  /**
   * Checks whether the overlay has been attached.
   */
  hasAttached(): boolean {
    return this._portalHost.hasAttached();
  }

  /**
   * Returns an observable that emits when the backdrop has been clicked.
   */
  backdropClick(): Observable<void> {
    return this._backdropClick.asObservable();
  }

  /**
   * Gets the current state config of the overlay.
   */
  getState(): OverlayState {
    return this._state;
  }

  /** Updates the position of the overlay based on the position strategy. */
  updatePosition() {
    if (this._state.positionStrategy) {
      this._state.positionStrategy.apply(this._pane);
    }
  }

  /** Updates the text direction of the overlay panel. **/
  private updateDirection() {
    this._pane.setAttribute('dir', this._state.direction);
  }

  /** Updates the size of the overlay based on the overlay config. */
  updateSize() {
    if (this._state.width || this._state.width === 0) {
      this._pane.style.width = formatCssUnit(this._state.width);
    }

    if (this._state.height || this._state.height === 0) {
      this._pane.style.height = formatCssUnit(this._state.height);
    }

    if (this._state.minWidth || this._state.minWidth === 0) {
      this._pane.style.minWidth = formatCssUnit(this._state.minWidth);
    }

    if (this._state.minHeight || this._state.minHeight === 0) {
      this._pane.style.minHeight = formatCssUnit(this._state.minHeight);
    }
  }

  /** Toggles the pointer events for the overlay pane element. */
  private _togglePointerEvents(enablePointer: boolean) {
    this._pane.style.pointerEvents = enablePointer ? 'auto' : 'none';
  }

  /** Attaches a backdrop for this overlay. */
  private _attachBackdrop() {
    this._backdropElement = document.createElement('div');
    this._backdropElement.classList.add('cdk-overlay-backdrop');
    this._backdropElement.classList.add(this._state.backdropClass);

    // Insert the backdrop before the pane in the DOM order,
    // in order to handle stacked overlays properly.
    this._pane.parentElement.insertBefore(this._backdropElement, this._pane);

    // Forward backdrop clicks such that the consumer of the overlay can perform whatever
    // action desired when such a click occurs (usually closing the overlay).
    this._backdropElement.addEventListener('click', () => this._backdropClick.next(null));

    // Add class to fade-in the backdrop after one frame.
    requestAnimationFrame(() => {
      if (this._backdropElement) {
        this._backdropElement.classList.add('cdk-overlay-backdrop-showing');
      }
    });
  }

  /** Detaches the backdrop (if any) associated with the overlay. */
  detachBackdrop(): void {
    let backdropToDetach = this._backdropElement;

    if (backdropToDetach) {
      let finishDetach = () => {
        // It may not be attached to anything in certain cases (e.g. unit tests).
        if (backdropToDetach && backdropToDetach.parentNode) {
          backdropToDetach.parentNode.removeChild(backdropToDetach);
        }

        // It is possible that a new portal has been attached to this overlay since we started
        // removing the backdrop. If that is the case, only clear the backdrop reference if it
        // is still the same instance that we started to remove.
        if (this._backdropElement == backdropToDetach) {
          this._backdropElement = null;
        }
      };

      backdropToDetach.classList.remove('cdk-overlay-backdrop-showing');
      backdropToDetach.classList.remove(this._state.backdropClass);
      backdropToDetach.addEventListener('transitionend', finishDetach);

      // If the backdrop doesn't have a transition, the `transitionend` event won't fire.
      // In this case we make it unclickable and we try to remove it after a delay.
      backdropToDetach.style.pointerEvents = 'none';

      // Run this outside the Angular zone because there's nothing that Angular cares about.
      // If it were to run inside the Angular zone, every test that used Overlay would have to be
      // either async or fakeAsync.
      this._ngZone.runOutsideAngular(() => {
        setTimeout(finishDetach, 500);
      });
    }
  }
}

function formatCssUnit(value: number | string) {
  return typeof value === 'string' ? value as string : `${value}px`;
}
