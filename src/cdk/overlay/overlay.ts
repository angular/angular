/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentFactoryResolver,
  Injectable,
  ApplicationRef,
  Injector,
  NgZone,
  Inject,
} from '@angular/core';
import {DomPortalOutlet} from '@angular/cdk/portal';
import {OverlayConfig} from './overlay-config';
import {OverlayRef} from './overlay-ref';
import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {OverlayKeyboardDispatcher} from './keyboard/overlay-keyboard-dispatcher';
import {OverlayContainer} from './overlay-container';
import {ScrollStrategyOptions} from './scroll/index';
import {DOCUMENT} from '@angular/common';


/** Next overlay unique ID. */
let nextUniqueId = 0;

/** The default config for newly created overlays. */
let defaultConfig = new OverlayConfig();


/**
 * Service to create Overlays. Overlays are dynamically added pieces of floating UI, meant to be
 * used as a low-level building building block for other components. Dialogs, tooltips, menus,
 * selects, etc. can all be built using overlays. The service should primarily be used by authors
 * of re-usable components rather than developers building end-user applications.
 *
 * An overlay *is* a PortalOutlet, so any kind of Portal can be loaded into one.
 */
@Injectable()
export class Overlay {
  constructor(
              /** Scrolling strategies that can be used when creating an overlay. */
              public scrollStrategies: ScrollStrategyOptions,
              private _overlayContainer: OverlayContainer,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _positionBuilder: OverlayPositionBuilder,
              private _keyboardDispatcher: OverlayKeyboardDispatcher,
              private _appRef: ApplicationRef,
              private _injector: Injector,
              private _ngZone: NgZone,
              @Inject(DOCUMENT) private _document: any) { }

  /**
   * Creates an overlay.
   * @param config Configuration applied to the overlay.
   * @returns Reference to the created overlay.
   */
  create(config: OverlayConfig = defaultConfig): OverlayRef {
    const pane = this._createPaneElement();
    const portalOutlet = this._createPortalOutlet(pane);
    return new OverlayRef(portalOutlet, pane, config, this._ngZone, this._keyboardDispatcher);
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
  private _createPaneElement(): HTMLElement {
    const pane = this._document.createElement('div');

    pane.id = `cdk-overlay-${nextUniqueId++}`;
    pane.classList.add('cdk-overlay-pane');
    this._overlayContainer.getContainerElement().appendChild(pane);

    return pane;
  }

  /**
   * Create a DomPortalOutlet into which the overlay content can be loaded.
   * @param pane The DOM element to turn into a portal outlet.
   * @returns A portal outlet for the given DOM element.
   */
  private _createPortalOutlet(pane: HTMLElement): DomPortalOutlet {
    return new DomPortalOutlet(pane, this._componentFactoryResolver, this._appRef, this._injector);
  }

}
