/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './dialog-module';
export * from './dialog';
export * from './dialog-container';
export * from './dialog-content-directives';
export * from './dialog-ref';
export {
  _MatDialogBase as _MatLegacyDialogBase,
  _MatDialogContainerBase as _MatLegacyDialogContainerBase,
  AutoFocusTarget as LegacyAutoFocusTarget,
  DialogRole as LegacyDialogRole,
  DialogPosition as LegacyDialogPosition,
  MatDialogConfig as MatLegacyDialogConfig,
  _closeDialogVia as _closeLegacyDialogVia,
  MatDialogState as MatLegacyDialogState,
  matDialogAnimations as matLegacyDialogAnimations,
  MAT_DIALOG_SCROLL_STRATEGY_FACTORY as MAT_LEGACY_DIALOG_SCROLL_STRATEGY_FACTORY,
} from '@angular/material/dialog';
