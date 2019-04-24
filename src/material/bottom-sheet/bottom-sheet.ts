/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal, ComponentType, PortalInjector, TemplatePortal} from '@angular/cdk/portal';
import {
  ComponentRef,
  Injectable,
  Injector,
  Optional,
  SkipSelf,
  TemplateRef,
  InjectionToken,
  Inject,
  OnDestroy,
} from '@angular/core';
import {Location} from '@angular/common';
import {of as observableOf} from 'rxjs';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetConfig} from './bottom-sheet-config';
import {MatBottomSheetContainer} from './bottom-sheet-container';
import {MatBottomSheetModule} from './bottom-sheet-module';
import {MatBottomSheetRef} from './bottom-sheet-ref';


/** Injection token that can be used to specify default bottom sheet options. */
export const MAT_BOTTOM_SHEET_DEFAULT_OPTIONS =
    new InjectionToken<MatBottomSheetConfig>('mat-bottom-sheet-default-options');

/**
 * Service to trigger Material Design bottom sheets.
 */
@Injectable({providedIn: MatBottomSheetModule})
export class MatBottomSheet implements OnDestroy {
  private _bottomSheetRefAtThisLevel: MatBottomSheetRef<any> | null = null;

  /** Reference to the currently opened bottom sheet. */
  get _openedBottomSheetRef(): MatBottomSheetRef<any> | null {
    const parent = this._parentBottomSheet;
    return parent ? parent._openedBottomSheetRef : this._bottomSheetRefAtThisLevel;
  }

  set _openedBottomSheetRef(value: MatBottomSheetRef<any> | null) {
    if (this._parentBottomSheet) {
      this._parentBottomSheet._openedBottomSheetRef = value;
    } else {
      this._bottomSheetRefAtThisLevel = value;
    }
  }

  constructor(
      private _overlay: Overlay,
      private _injector: Injector,
      @Optional() @SkipSelf() private _parentBottomSheet: MatBottomSheet,
      @Optional() private _location?: Location,
      @Optional() @Inject(MAT_BOTTOM_SHEET_DEFAULT_OPTIONS)
          private _defaultOptions?: MatBottomSheetConfig) {}

  open<T, D = any, R = any>(component: ComponentType<T>,
                   config?: MatBottomSheetConfig<D>): MatBottomSheetRef<T, R>;
  open<T, D = any, R = any>(template: TemplateRef<T>,
                   config?: MatBottomSheetConfig<D>): MatBottomSheetRef<T, R>;

  open<T, D = any, R = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
                   config?: MatBottomSheetConfig<D>): MatBottomSheetRef<T, R> {

    const _config =
        _applyConfigDefaults(this._defaultOptions || new MatBottomSheetConfig(), config);
    const overlayRef = this._createOverlay(_config);
    const container = this._attachContainer(overlayRef, _config);
    const ref = new MatBottomSheetRef<T, R>(container, overlayRef, this._location);

    if (componentOrTemplateRef instanceof TemplateRef) {
      container.attachTemplatePortal(new TemplatePortal<T>(componentOrTemplateRef, null!, {
        $implicit: _config.data,
        bottomSheetRef: ref
      } as any));
    } else {
      const portal = new ComponentPortal(componentOrTemplateRef, undefined,
            this._createInjector(_config, ref));
      const contentRef = container.attachComponentPortal(portal);
      ref.instance = contentRef.instance;
    }

    // When the bottom sheet is dismissed, clear the reference to it.
    ref.afterDismissed().subscribe(() => {
      // Clear the bottom sheet ref if it hasn't already been replaced by a newer one.
      if (this._openedBottomSheetRef == ref) {
        this._openedBottomSheetRef = null;
      }
    });

    if (this._openedBottomSheetRef) {
      // If a bottom sheet is already in view, dismiss it and enter the
      // new bottom sheet after exit animation is complete.
      this._openedBottomSheetRef.afterDismissed().subscribe(() => ref.containerInstance.enter());
      this._openedBottomSheetRef.dismiss();
    } else {
      // If no bottom sheet is in view, enter the new bottom sheet.
      ref.containerInstance.enter();
    }

    this._openedBottomSheetRef = ref;

    return ref;
  }

  /**
   * Dismisses the currently-visible bottom sheet.
   */
  dismiss(): void {
    if (this._openedBottomSheetRef) {
      this._openedBottomSheetRef.dismiss();
    }
  }

  ngOnDestroy() {
    if (this._bottomSheetRefAtThisLevel) {
      this._bottomSheetRefAtThisLevel.dismiss();
    }
  }

  /**
   * Attaches the bottom sheet container component to the overlay.
   */
  private _attachContainer(overlayRef: OverlayRef,
                           config: MatBottomSheetConfig): MatBottomSheetContainer {

    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const injector = new PortalInjector(userInjector || this._injector, new WeakMap([
      [MatBottomSheetConfig, config]
    ]));

    const containerPortal =
        new ComponentPortal(MatBottomSheetContainer, config.viewContainerRef, injector);
    const containerRef: ComponentRef<MatBottomSheetContainer> = overlayRef.attach(containerPortal);
    return containerRef.instance;
  }

  /**
   * Creates a new overlay and places it in the correct location.
   * @param config The user-specified bottom sheet config.
   */
  private _createOverlay(config: MatBottomSheetConfig): OverlayRef {
    const overlayConfig = new OverlayConfig({
      direction: config.direction,
      hasBackdrop: config.hasBackdrop,
      disposeOnNavigation: config.closeOnNavigation,
      maxWidth: '100%',
      scrollStrategy: this._overlay.scrollStrategies.block(),
      positionStrategy: this._overlay.position()
        .global()
        .centerHorizontally()
        .bottom('0')
    });

    if (config.backdropClass) {
      overlayConfig.backdropClass = config.backdropClass;
    }

    return this._overlay.create(overlayConfig);
  }

  /**
   * Creates an injector to be used inside of a bottom sheet component.
   * @param config Config that was used to create the bottom sheet.
   * @param bottomSheetRef Reference to the bottom sheet.
   */
  private _createInjector<T>(config: MatBottomSheetConfig,
                             bottomSheetRef: MatBottomSheetRef<T>): PortalInjector {

    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const injectionTokens = new WeakMap<any, any>([
      [MatBottomSheetRef, bottomSheetRef],
      [MAT_BOTTOM_SHEET_DATA, config.data]
    ]);

    if (config.direction &&
        (!userInjector || !userInjector.get<Directionality | null>(Directionality, null))) {
      injectionTokens.set(Directionality, {
        value: config.direction,
        change: observableOf()
      });
    }

    return new PortalInjector(userInjector || this._injector, injectionTokens);
  }
}

/**
 * Applies default options to the bottom sheet config.
 * @param defaults Object containing the default values to which to fall back.
 * @param config The configuration to which the defaults will be applied.
 * @returns The new configuration object with defaults applied.
 */
function _applyConfigDefaults(defaults: MatBottomSheetConfig,
                              config?: MatBottomSheetConfig): MatBottomSheetConfig {
  return {...defaults, ...config};
}
