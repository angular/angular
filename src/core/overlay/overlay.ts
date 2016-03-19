import {
  DynamicComponentLoader,
  AppViewManager,
  OpaqueToken,
  Inject,
  Injectable} from 'angular2/core';
import {CONST_EXPR} from 'angular2/src/facade/lang';
import {OverlayState} from './overlay-state';
import {DomPortalHost} from '../portal/dom-portal-host';
import {OverlayRef} from './overlay-ref';
import {DOM} from '../platform/dom/dom_adapter';

// Re-export OverlayState and OverlayRef so they can be imported directly from here.
export {OverlayState} from './overlay-state';
export {OverlayRef} from './overlay-ref';

/** Token used to inject the DOM element that serves as the overlay container. */
export const OVERLAY_CONTAINER_TOKEN = CONST_EXPR(new OpaqueToken('overlayContainer'));

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
      @Inject(OVERLAY_CONTAINER_TOKEN) private _overlayContainerElement: Element,
      private _dynamicComponentLoader: DynamicComponentLoader,
      private _appViewManager: AppViewManager) {
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
   * Creates the DOM element for an overlay.
   * @param state State to apply to the created element.
   * @returns Promise resolving to the created element.
   */
  private _createPaneElement(state: OverlayState): Promise<Element> {
    var pane = DOM.createElement('div');
    pane.id  = `md-overlay-${nextUniqueId++}`;
    DOM.addClass(pane, 'md-overlay-pane');

    this.applyState(pane, state);
    this._overlayContainerElement.appendChild(pane);

    return Promise.resolve(pane);
  }

  /**
   * Applies a given state to the given pane element.
   * @param pane The pane to modify.
   * @param state The state to apply.
   */
  applyState(pane: Element, state: OverlayState) {
    // Not yet implemented.
    // TODO(jelbourn): apply state to the pane element.
  }

  /**
   * Create a DomPortalHost into which the overlay content can be loaded.
   * @param pane The DOM element to turn into a portal host.
   * @returns A portal host for the given DOM element.
   */
  private _createPortalHost(pane: Element): DomPortalHost {
    return new DomPortalHost(
        pane,
        this._dynamicComponentLoader,
        this._appViewManager);
  }

  /**
   * Creates an OverlayRef for an overlay in the given DOM element.
   * @param pane DOM element for the overlay
   * @returns {OverlayRef}
   */
  private _createOverlayRef(pane: Element): OverlayRef {
    return new OverlayRef(this._createPortalHost(pane));
  }
}
