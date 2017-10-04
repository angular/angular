/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LiveAnnouncer} from '@angular/cdk/a11y';
import {Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal, ComponentType, PortalInjector} from '@angular/cdk/portal';
import {ComponentRef, Injectable, Injector, Optional, SkipSelf} from '@angular/core';
import {extendObject} from '@angular/material/core';
import {SimpleSnackBar} from './simple-snack-bar';
import {MAT_SNACK_BAR_DATA, MatSnackBarConfig} from './snack-bar-config';
import {MatSnackBarContainer} from './snack-bar-container';
import {MatSnackBarRef} from './snack-bar-ref';


/**
 * Service to dispatch Material Design snack bar messages.
 */
@Injectable()
export class MatSnackBar {
  /**
   * Reference to the current snack bar in the view *at this level* (in the Angular injector tree).
   * If there is a parent snack-bar service, all operations should delegate to that parent
   * via `_openedSnackBarRef`.
   */
  private _snackBarRefAtThisLevel: MatSnackBarRef<any> | null = null;

  /** Reference to the currently opened snackbar at *any* level. */
  get _openedSnackBarRef(): MatSnackBarRef<any> | null {
    const parent = this._parentSnackBar;
    return parent ? parent._openedSnackBarRef : this._snackBarRefAtThisLevel;
  }

  set _openedSnackBarRef(value: MatSnackBarRef<any> | null) {
    if (this._parentSnackBar) {
      this._parentSnackBar._openedSnackBarRef = value;
    } else {
      this._snackBarRefAtThisLevel = value;
    }
  }

  constructor(
      private _overlay: Overlay,
      private _live: LiveAnnouncer,
      private _injector: Injector,
      @Optional() @SkipSelf() private _parentSnackBar: MatSnackBar) {}

  /**
   * Creates and dispatches a snack bar with a custom component for the content, removing any
   * currently opened snack bars.
   *
   * @param component Component to be instantiated.
   * @param config Extra configuration for the snack bar.
   */
  openFromComponent<T>(component: ComponentType<T>, config?: MatSnackBarConfig): MatSnackBarRef<T> {
    const _config = _applyConfigDefaults(config);
    const snackBarRef = this._attach(component, _config);

    // When the snackbar is dismissed, clear the reference to it.
    snackBarRef.afterDismissed().subscribe(() => {
      // Clear the snackbar ref if it hasn't already been replaced by a newer snackbar.
      if (this._openedSnackBarRef == snackBarRef) {
        this._openedSnackBarRef = null;
      }
    });

    if (this._openedSnackBarRef) {
      // If a snack bar is already in view, dismiss it and enter the
      // new snack bar after exit animation is complete.
      this._openedSnackBarRef.afterDismissed().subscribe(() => {
        snackBarRef.containerInstance.enter();
      });
      this._openedSnackBarRef.dismiss();
    } else {
      // If no snack bar is in view, enter the new snack bar.
      snackBarRef.containerInstance.enter();
    }

    // If a dismiss timeout is provided, set up dismiss based on after the snackbar is opened.
    if (_config.duration && _config.duration > 0) {
      snackBarRef.afterOpened().subscribe(() => snackBarRef._dismissAfter(_config!.duration!));
    }

    if (_config.announcementMessage) {
      this._live.announce(_config.announcementMessage, _config.politeness);
    }

    this._openedSnackBarRef = snackBarRef;
    return this._openedSnackBarRef;
  }

  /**
   * Opens a snackbar with a message and an optional action.
   * @param message The message to show in the snackbar.
   * @param action The label for the snackbar action.
   * @param config Additional configuration options for the snackbar.
   */
  open(message: string, action: string = '', config?: MatSnackBarConfig):
      MatSnackBarRef<SimpleSnackBar> {
    const _config = _applyConfigDefaults(config);

    // Since the user doesn't have access to the component, we can
    // override the data to pass in our own message and action.
    _config.data = {message, action};
    _config.announcementMessage = message;

    return this.openFromComponent(SimpleSnackBar, _config);
  }

  /**
   * Dismisses the currently-visible snack bar.
   */
  dismiss(): void {
    if (this._openedSnackBarRef) {
      this._openedSnackBarRef.dismiss();
    }
  }

  /**
   * Attaches the snack bar container component to the overlay.
   */
  private _attachSnackBarContainer(overlayRef: OverlayRef,
                                   config: MatSnackBarConfig): MatSnackBarContainer {
    const containerPortal = new ComponentPortal(MatSnackBarContainer, config.viewContainerRef);
    const containerRef: ComponentRef<MatSnackBarContainer> = overlayRef.attach(containerPortal);
    containerRef.instance.snackBarConfig = config;
    return containerRef.instance;
  }

  /**
   * Places a new component as the content of the snack bar container.
   */
  private _attach<T>(component: ComponentType<T>, config: MatSnackBarConfig): MatSnackBarRef<T> {
    const overlayRef = this._createOverlay(config);
    const container = this._attachSnackBarContainer(overlayRef, config);
    const snackBarRef = new MatSnackBarRef<T>(container, overlayRef);
    const injector = this._createInjector(config, snackBarRef);
    const portal = new ComponentPortal(component, undefined, injector);
    const contentRef = container.attachComponentPortal(portal);

    // We can't pass this via the injector, because the injector is created earlier.
    snackBarRef.instance = contentRef.instance;

    return snackBarRef;
  }

  /**
   * Creates a new overlay and places it in the correct location.
   * @param config The user-specified snack bar config.
   */
  private _createOverlay(config: MatSnackBarConfig): OverlayRef {
    const overlayConfig = new OverlayConfig();
    overlayConfig.direction = config.direction;

    let positionStrategy = this._overlay.position().global();
    // Set horizontal position.
    const isRtl = config.direction === 'rtl';
    const isLeft = (
      config.horizontalPosition === 'left' ||
      (config.horizontalPosition === 'start' && !isRtl) ||
      (config.horizontalPosition === 'end' && isRtl));
    const isRight = !isLeft && config.horizontalPosition !== 'center';
    if (isLeft) {
      positionStrategy.left('0');
    } else if (isRight) {
      positionStrategy.right('0');
    } else {
      positionStrategy.centerHorizontally();
    }
    // Set horizontal position.
    if (config.verticalPosition === 'top') {
      positionStrategy.top('0');
    } else {
      positionStrategy.bottom('0');
    }

    overlayConfig.positionStrategy = positionStrategy;
    return this._overlay.create(overlayConfig);
  }

  /**
   * Creates an injector to be used inside of a snack bar component.
   * @param config Config that was used to create the snack bar.
   * @param snackBarRef Reference to the snack bar.
   */
  private _createInjector<T>(
      config: MatSnackBarConfig,
      snackBarRef: MatSnackBarRef<T>): PortalInjector {

    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const injectionTokens = new WeakMap();

    injectionTokens.set(MatSnackBarRef, snackBarRef);
    injectionTokens.set(MAT_SNACK_BAR_DATA, config.data);

    return new PortalInjector(userInjector || this._injector, injectionTokens);
  }
}

/**
 * Applies default options to the snackbar config.
 * @param config The configuration to which the defaults will be applied.
 * @returns The new configuration object with defaults applied.
 */
function _applyConfigDefaults(config?: MatSnackBarConfig): MatSnackBarConfig {
  return extendObject(new MatSnackBarConfig(), config);
}
