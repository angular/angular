/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Overlay, OverlayContainer, ScrollStrategy} from '@angular/cdk/overlay';
import {Location} from '@angular/common';
import {Inject, Injectable, InjectionToken, Injector, Optional, SkipSelf} from '@angular/core';
import {MatLegacyDialogContainer} from './dialog-container';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {_MatDialogBase, MatDialogConfig} from '@angular/material/dialog';
import {MatLegacyDialogRef} from './dialog-ref';

/** Injection token that can be used to access the data that was passed in to a dialog. */
export const MAT_LEGACY_DIALOG_DATA = new InjectionToken<any>('MatDialogData');

/** Injection token that can be used to specify default dialog options. */
export const MAT_LEGACY_DIALOG_DEFAULT_OPTIONS = new InjectionToken<MatDialogConfig>(
  'mat-dialog-default-options',
);

/** Injection token that determines the scroll handling while the dialog is open. */
export const MAT_LEGACY_DIALOG_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
  'mat-dialog-scroll-strategy',
);

/** @docs-private */
export function MAT_LEGACY_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(
  overlay: Overlay,
): () => ScrollStrategy {
  return () => overlay.scrollStrategies.block();
}

/** @docs-private */
export const MAT_LEGACY_DIALOG_SCROLL_STRATEGY_PROVIDER = {
  provide: MAT_LEGACY_DIALOG_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MAT_LEGACY_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY,
};

/**
 * Service to open Material Design modal dialogs.
 */
@Injectable()
export class MatLegacyDialog extends _MatDialogBase<MatLegacyDialogContainer> {
  constructor(
    overlay: Overlay,
    injector: Injector,
    /**
     * @deprecated `_location` parameter to be removed.
     * @breaking-change 10.0.0
     */
    @Optional() _location: Location,
    @Optional() @Inject(MAT_LEGACY_DIALOG_DEFAULT_OPTIONS) defaultOptions: MatDialogConfig,
    @Inject(MAT_LEGACY_DIALOG_SCROLL_STRATEGY) scrollStrategy: any,
    @Optional() @SkipSelf() parentDialog: MatLegacyDialog,
    /**
     * @deprecated No longer used. To be removed.
     * @breaking-change 15.0.0
     */
    overlayContainer: OverlayContainer,
    /**
     * @deprecated No longer used. To be removed.
     * @breaking-change 14.0.0
     */
    @Optional()
    @Inject(ANIMATION_MODULE_TYPE)
    animationMode?: 'NoopAnimations' | 'BrowserAnimations',
  ) {
    super(
      overlay,
      injector,
      defaultOptions,
      parentDialog,
      overlayContainer,
      scrollStrategy,
      MatLegacyDialogRef,
      MatLegacyDialogContainer,
      MAT_LEGACY_DIALOG_DATA,
      animationMode,
    );
  }
}
