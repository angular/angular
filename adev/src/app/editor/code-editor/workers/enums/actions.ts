/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const enum TsVfsWorkerActions {
  INIT_DEFAULT_FILE_SYSTEM_MAP = 'default-fs-ready',
  CREATE_VFS_ENV_REQUEST = 'create-vfs-env-request',
  CREATE_VFS_ENV_RESPONSE = 'create-vfs-env-response',
  CODE_CHANGED = 'code-changed',
  UPDATE_VFS_ENV_REQUEST = 'update-vfs-env-request',
  AUTOCOMPLETE_REQUEST = 'autocomplete-request',
  AUTOCOMPLETE_RESPONSE = 'autocomplete-response',
  DIAGNOSTICS_REQUEST = 'diagnostics-request',
  DIAGNOSTICS_RESPONSE = 'diagnostics-response',
  DEFINE_TYPES_REQUEST = 'define-types-request',
  DISPLAY_TOOLTIP_REQUEST = 'display-tooltip-request',
  DISPLAY_TOOLTIP_RESPONSE = 'display-tooltip-response',
}
