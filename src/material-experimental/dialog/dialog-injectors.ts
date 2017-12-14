/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {ComponentType, Overlay, ScrollStrategy, BlockScrollStrategy} from '@angular/cdk/overlay';
import {DialogRef} from './dialog-ref';
import {CdkDialogContainer} from './dialog-container';
import {DialogConfig} from './dialog-config';

/** Injection token for the Dialog's ScrollStrategy. */
export const DIALOG_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('DialogScrollStrategy');

/** Injection token for the Dialog's Data. */
export const DIALOG_DATA = new InjectionToken<any>('DialogData');

/** Injection token for the DialogRef constructor. */
export const DIALOG_REF = new InjectionToken<DialogRef<any>>('DialogRef');

/** Injection token for the DialogConfig. */
export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('DialogConfig');

/** Injection token for the Dialog's DialogContainer component. */
export const DIALOG_CONTAINER =
    new InjectionToken<ComponentType<CdkDialogContainer>>('DialogContainer');

/** @docs-private */
export function MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay):
    () => BlockScrollStrategy {
  return () => overlay.scrollStrategies.block();
}

/** @docs-private */
export const MAT_DIALOG_SCROLL_STRATEGY_PROVIDER = {
  provide: DIALOG_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MAT_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY,
};
