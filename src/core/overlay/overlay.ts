import {
  ComponentResolver,
  OpaqueToken,
  Inject,
  Injectable,
} from '@angular/core';
import {OverlayState} from './overlay-state';
import {DomPortalHost} from '../portal/dom-portal-host';
import {OverlayRef} from './overlay-ref';

import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {ViewportRuler} from './position/viewport-ruler';


/** Token used to inject the DOM element that serves as the overlay container. */
export const OVERLAY_CONTAINER_TOKEN = new OpaqueToken('overlayContainer');

/** Next overlay unique ID. */
let nextUniqueId = 0;

/** The default state for newly created overlays. */
let defaultState = new OverlayState();


/**
 * Service to create Overlays. Overlays are dynamically added pieces of floating UI, meant to be
 * used as a low-level building building block for other components. Dialogs, tooltips, menus,
 * selects, etc. can all be built using overlays. The service should primarily be used by authors
 * of re-usable components rather than developers building end-user applications.
 *
 * An overlay *is* a PortalHost, so any kind of Portal can be loaded into one.
 */
 @Injectable()
export class Overlay {
  constructor(
      @Inject(OVERLAY_CONTAINER_TOKEN) private _overlayContainerElement: HTMLElement,
      private _componentResolver: ComponentResolver,
      private _positionBuilder: OverlayPositionBuilder) {
  }

  /**
   * Creates an overlay.
   * @param state State to apply to the overlay.
   * @returns A reference to the created overlay.
   */
  create(state: OverlayState = defaultState): Promise<OverlayRef> {
    return this._createPaneElement().then(pane => this._createOverlayRef(pane, state));
  }

  /**
   * Returns a position builder that can be used, via fluent API,
   * to construct and configure a position strategy.
   */
  position() {
    return this._positionBuilder;
  }

  /**
   * Creates the DOM element for an overlay and appends it to the overlay container.
   * @returns Promise resolving to the created element.
   */
  private _createPaneElement(): Promise<HTMLElement> {
    var pane = document.createElement('div');
    pane.id = `md-overlay-${nextUniqueId++}`;
    pane.classList.add('md-overlay-pane');

    this._overlayContainerElement.appendChild(pane);

    return Promise.resolve(pane);
  }

  /**
   * Create a DomPortalHost into which the overlay content can be loaded.
   * @param pane The DOM element to turn into a portal host.
   * @returns A portal host for the given DOM element.
   */
  private _createPortalHost(pane: HTMLElement): DomPortalHost {
    return new DomPortalHost(
        pane,
        this._componentResolver);
  }

  /**
   * Creates an OverlayRef for an overlay in the given DOM element.
   * @param pane DOM element for the overlay
   * @param state
   * @returns {OverlayRef}
   */
  private _createOverlayRef(pane: HTMLElement, state: OverlayState): OverlayRef {
    return new OverlayRef(this._createPortalHost(pane), pane, state);
  }
}


/** Providers for Overlay and its related injectables. */
export const OVERLAY_PROVIDERS = [
  ViewportRuler,
  OverlayPositionBuilder,
  Overlay,
];
