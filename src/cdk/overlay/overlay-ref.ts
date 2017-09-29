/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgZone} from '@angular/core';
import {PortalHost, Portal} from '@angular/cdk/portal';
import {OverlayConfig} from './overlay-config';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';


/**
 * Reference to an overlay that has been created with the Overlay service.
 * Used to manipulate or dispose of said overlay.
 */
export class OverlayRef implements PortalHost {
  private _backdropElement: HTMLElement | null = null;
  private _backdropClick: Subject<any> = new Subject();
  private _attachments = new Subject<void>();
  private _detachments = new Subject<void>();

  constructor(
      private _portalHost: PortalHost,
      private _pane: HTMLElement,
      private _config: OverlayConfig,
      private _ngZone: NgZone) {

    if (_config.scrollStrategy) {
      _config.scrollStrategy.attach(this);
    }
  }

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
    let attachResult = this._portalHost.attach(portal);

    if (this._config.positionStrategy) {
      this._config.positionStrategy.attach(this);
    }

    // Update the pane element with the given configuration.
    this._updateStackingOrder();
    this.updateSize();
    this.updateDirection();
    this.updatePosition();

    if (this._config.scrollStrategy) {
      this._config.scrollStrategy.enable();
    }

    // Enable pointer events for the overlay pane element.
    this._togglePointerEvents(true);

    if (this._config.hasBackdrop) {
      this._attachBackdrop();
    }

    if (this._config.panelClass) {
      // We can't do a spread here, because IE doesn't support setting multiple classes.
      if (Array.isArray(this._config.panelClass)) {
        this._config.panelClass.forEach(cls => this._pane.classList.add(cls));
      } else {
        this._pane.classList.add(this._config.panelClass);
      }
    }

    // Only emit the `attachments` event once all other setup is done.
    this._attachments.next();

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

    if (this._config.scrollStrategy) {
      this._config.scrollStrategy.disable();
    }

    let detachmentResult = this._portalHost.detach();

    // Only emit after everything is detached.
    this._detachments.next();

    return detachmentResult;
  }

  /**
   * Cleans up the overlay from the DOM.
   */
  dispose(): void {
    if (this._config.positionStrategy) {
      this._config.positionStrategy.dispose();
    }

    if (this._config.scrollStrategy) {
      this._config.scrollStrategy.disable();
    }

    this.detachBackdrop();
    this._portalHost.dispose();
    this._attachments.complete();
    this._backdropClick.complete();
    this._detachments.next();
    this._detachments.complete();
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

  /** Returns an observable that emits when the overlay has been attached. */
  attachments(): Observable<void> {
    return this._attachments.asObservable();
  }

  /** Returns an observable that emits when the overlay has been detached. */
  detachments(): Observable<void> {
    return this._detachments.asObservable();
  }

  /**
   * Gets the current config of the overlay.
   */
  getConfig(): OverlayConfig {
    return this._config;
  }

  /** Updates the position of the overlay based on the position strategy. */
  updatePosition() {
    if (this._config.positionStrategy) {
      this._config.positionStrategy.apply();
    }
  }

  /** Updates the text direction of the overlay panel. */
  private updateDirection() {
    this._pane.setAttribute('dir', this._config.direction!);
  }

  /** Updates the size of the overlay based on the overlay config. */
  updateSize() {
    if (this._config.width || this._config.width === 0) {
      this._pane.style.width = formatCssUnit(this._config.width);
    }

    if (this._config.height || this._config.height === 0) {
      this._pane.style.height = formatCssUnit(this._config.height);
    }

    if (this._config.minWidth || this._config.minWidth === 0) {
      this._pane.style.minWidth = formatCssUnit(this._config.minWidth);
    }

    if (this._config.minHeight || this._config.minHeight === 0) {
      this._pane.style.minHeight = formatCssUnit(this._config.minHeight);
    }

    if (this._config.maxWidth || this._config.maxWidth === 0) {
      this._pane.style.maxWidth = formatCssUnit(this._config.maxWidth);
    }

    if (this._config.maxHeight || this._config.maxHeight === 0) {
      this._pane.style.maxHeight = formatCssUnit(this._config.maxHeight);
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

    if (this._config.backdropClass) {
      this._backdropElement.classList.add(this._config.backdropClass);
    }

    // Insert the backdrop before the pane in the DOM order,
    // in order to handle stacked overlays properly.
    this._pane.parentElement!.insertBefore(this._backdropElement, this._pane);

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

  /**
   * Updates the stacking order of the element, moving it to the top if necessary.
   * This is required in cases where one overlay was detached, while another one,
   * that should be behind it, was destroyed. The next time both of them are opened,
   * the stacking will be wrong, because the detached element's pane will still be
   * in its original DOM position.
   */
  private _updateStackingOrder() {
    if (this._pane.nextSibling) {
      this._pane.parentNode!.appendChild(this._pane);
    }
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

      if (this._config.backdropClass) {
        backdropToDetach.classList.remove(this._config.backdropClass);
      }

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
