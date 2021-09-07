/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {VersionChanges} from '../../update-tool/version-changes';

export interface SymbolRemovalUpgradeData {
  /** Module that the symbol was removed from. */
  module: string;

  /** Name of the symbol being removed. */
  name: string;

  /** Message to log explaining why the symbol was removed. */
  message: string;
}

export const symbolRemoval: VersionChanges<SymbolRemovalUpgradeData> = {};
