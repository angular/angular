/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {MatLegacyDialogModule} from './dialog-module';
export {
  MAT_LEGACY_DIALOG_DATA,
  MAT_LEGACY_DIALOG_DEFAULT_OPTIONS,
  MAT_LEGACY_DIALOG_SCROLL_STRATEGY,
  MAT_LEGACY_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_LEGACY_DIALOG_SCROLL_STRATEGY_PROVIDER,
  MatLegacyDialog,
} from './dialog';
export {MatLegacyDialogContainer} from './dialog-container';
export {
  MatLegacyDialogClose,
  MatLegacyDialogTitle,
  MatLegacyDialogContent,
  MatLegacyDialogActions,
} from './dialog-content-directives';
export {MatLegacyDialogRef} from './dialog-ref';
export {MatLegacyDialogConfig} from './dialog-config';
export {
  _MatDialogBase as _MatLegacyDialogBase,
  _MatDialogContainerBase as _MatLegacyDialogContainerBase,
  AutoFocusTarget as LegacyAutoFocusTarget,
  DialogRole as LegacyDialogRole,
  DialogPosition as LegacyDialogPosition,
  _closeDialogVia as _closeLegacyDialogVia,
  MatDialogState as MatLegacyDialogState,
  matDialogAnimations as matLegacyDialogAnimations,
  MAT_DIALOG_SCROLL_STRATEGY_FACTORY as MAT_LEGACY_DIALOG_SCROLL_STRATEGY_FACTORY,
} from '@angular/material/dialog';
