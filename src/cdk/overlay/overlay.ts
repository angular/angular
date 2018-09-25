/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {DomPortalOutlet} from '@angular/cdk/portal';
import {DOCUMENT, Location} from '@angular/common';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  Inject,
  Injectable,
  Injector,
  NgZone,
  Optional,
} from '@angular/core';
import {OverlayKeyboardDispatcher} from './keyboard/overlay-keyboard-dispatcher';
import {OverlayConfig} from './overlay-config';
import {OverlayContainer} from './overlay-container';
import {OverlayRef} from './overlay-ref';
import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {ScrollStrategyOptions} from './scroll/index';


/** Next overlay unique ID. */
let nextUniqueId = 0;

// Note that Overlay is *not* scoped to the app root because the ComponentFactoryResolver
// it needs is different based on where OverlayModule is imported.

/**
 * Service to create Overlays. Overlays are dynamically added pieces of floating UI, meant to be
 * used as a low-level building block for other components. Dialogs, tooltips, menus,
 * selects, etc. can all be built using overlays. The service should primarily be used by authors
 * of re-usable components rather than developers building end-user applications.
 *
 * An overlay *is* a PortalOutlet, so any kind of Portal can be loaded into one.
 */
@Injectable()
export class Overlay {
  private _appRef: ApplicationRef;

  constructor(
              /** Scrolling strategies that can be used when creating an overlay. */
              public scrollStrategies: ScrollStrategyOptions,
              private _overlayContainer: OverlayContainer,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _positionBuilder: OverlayPositionBuilder,
              private _keyboardDispatcher: OverlayKeyboardDispatcher,
              private _injector: Injector,
              private _ngZone: NgZone,
              @Inject(DOCUMENT) private _document: any,
              private _directionality: Directionality,
              // @breaking-change 8.0.0 `_location` parameter to be made required.
              @Optional() private _location?: Location) { }

  /**
   * Creates an overlay.
   * @param config Configuration applied to the overlay.
   * @returns Reference to the created overlay.
   */
  create(config?: OverlayConfig): OverlayRef {
    const host = this._createHostElement();
    const pane = this._createPaneElement(host);
    const portalOutlet = this._createPortalOutlet(pane);
    const overlayConfig = new OverlayConfig(config);

    overlayConfig.direction = overlayConfig.direction || this._directionality.value;

    return new OverlayRef(portalOutlet, host, pane, overlayConfig, this._ngZone,
      this._keyboardDispatcher, this._document, this._location);
  }

  /**
   * Gets a position builder that can be used, via fluent API,
   * to construct and configure a position strategy.
   * @returns An overlay position builder.
   */
  position(): OverlayPositionBuilder {
    return this._positionBuilder;
  }

  /**
   * Creates the DOM element for an overlay and appends it to the overlay container.
   * @returns Newly-created pane element
   */
  private _createPaneElement(host: HTMLElement): HTMLElement {
    const pane = this._document.createElement('div');

    pane.id = `cdk-overlay-${nextUniqueId++}`;
    pane.classList.add('cdk-overlay-pane');
    host.appendChild(pane);

    return pane;
  }

  /**
   * Creates the host element that wraps around an overlay
   * and can be used for advanced positioning.
   * @returns Newly-create host element.
   */
  private _createHostElement(): HTMLElement {
    const host = this._document.createElement('div');
    this._overlayContainer.getContainerElement().appendChild(host);
    return host;
  }

  /**
   * Create a DomPortalOutlet into which the overlay content can be loaded.
   * @param pane The DOM element to turn into a portal outlet.
   * @returns A portal outlet for the given DOM element.
   */
  private _createPortalOutlet(pane: HTMLElement): DomPortalOutlet {
    // We have to resolve the ApplicationRef later in order to allow people
    // to use overlay-based providers during app initialization.
    if (!this._appRef) {
      this._appRef = this._injector.get<ApplicationRef>(ApplicationRef);
    }

    return new DomPortalOutlet(pane, this._componentFactoryResolver, this._appRef, this._injector);
  }
}
