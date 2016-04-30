import {
  DynamicComponentLoader,
  OpaqueToken,
  Inject,
  Injectable,
  ElementRef
} from 'angular2/core';
import {OverlayState} from './overlay-state';
import {DomPortalHost} from '../portal/dom-portal-host';
import {OverlayRef} from './overlay-ref';
import {GlobalPositionStrategy} from './position/global-position-strategy';
import {RelativePositionStrategy} from './position/relative-position-strategy';


// Re-export overlay-related modules so they can be imported directly from here.
export {OverlayState} from './overlay-state';
export {OverlayRef} from './overlay-ref';
export {createOverlayContainer} from './overlay-container';

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
      private _dynamicComponentLoader: DynamicComponentLoader) {
  }

  /**
   * Creates an overlay.
   * @param state State to apply to the overlay.
   * @returns A reference to the created overlay.
   */
  create(state: OverlayState = defaultState): Promise<OverlayRef> {
    return this._createPaneElement(state).then(pane => this._createOverlayRef(pane));
  }

  /**
   * Returns a position builder that can be used, via fluent API,
   * to construct and configure a position strategy.
   */
  position() {
    return POSITION_BUILDER;
  }

  /**
   * Creates the DOM element for an overlay.
   * @param state State to apply to the created element.
   * @returns Promise resolving to the created element.
   */
  private _createPaneElement(state: OverlayState): Promise<HTMLElement> {
    var pane = document.createElement('div');
    pane.id  = `md-overlay-${nextUniqueId++}`;
    pane.classList.add('md-overlay-pane');

    this.applyState(pane, state);
    this._overlayContainerElement.appendChild(pane);

    return Promise.resolve(pane);
  }

  /**
   * Applies a given state to the given pane element.
   * @param pane The pane to modify.
   * @param state The state to apply.
   */
  applyState(pane: HTMLElement, state: OverlayState) {
    if (state.positionStrategy != null) {
      state.positionStrategy.apply(pane);
    }
  }

  /**
   * Create a DomPortalHost into which the overlay content can be loaded.
   * @param pane The DOM element to turn into a portal host.
   * @returns A portal host for the given DOM element.
   */
  private _createPortalHost(pane: HTMLElement): DomPortalHost {
    return new DomPortalHost(
        pane,
        this._dynamicComponentLoader);
  }

  /**
   * Creates an OverlayRef for an overlay in the given DOM element.
   * @param pane DOM element for the overlay
   * @returns {OverlayRef}
   */
  private _createOverlayRef(pane: HTMLElement): OverlayRef {
    return new OverlayRef(this._createPortalHost(pane));
  }
}


/** Builder for overlay position strategy. */
export class OverlayPositionBuilder {
  /** Creates a global position strategy. */
  global() {
    return new GlobalPositionStrategy();
  }

  /** Creates a relative position strategy. */
  relativeTo(elementRef: ElementRef) {
    return new RelativePositionStrategy(elementRef);
  }
}

// We only ever need one position builder.
let POSITION_BUILDER: OverlayPositionBuilder = new OverlayPositionBuilder();
