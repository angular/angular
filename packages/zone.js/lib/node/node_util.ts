/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  bindArguments,
  patchMacroTask,
  patchMethod,
  patchOnProperties,
  setShouldCopySymbolProperties,
} from '../common/utils';
import {ZoneType} from '../zone-impl';

export function patchNodeUtil(Zone: ZoneType): void {
  Zone.__load_patch('node_util', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
    api.patchOnProperties = patchOnProperties;
    api.patchMethod = patchMethod;
    api.bindArguments = bindArguments;
    api.patchMacroTask = patchMacroTask;
    setShouldCopySymbolProperties(true);
  });
}
