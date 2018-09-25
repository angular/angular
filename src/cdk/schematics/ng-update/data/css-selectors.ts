/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TargetVersion} from '../target-version';
import {VersionChanges} from '../upgrade-data';

export interface CssSelectorUpgradeData {
  /** The CSS selector to replace. */
  replace: string;
  /** The new CSS selector. */
  replaceWith: string;
  /** Whitelist where this replacement is made. If omitted it is made in all files. */
  whitelist?: {
    /** Replace this name in stylesheet files. */
    stylesheet?: boolean,
    /** Replace this name in HTML files. */
    html?: boolean,
    /** Replace this name in TypeScript strings. */
    strings?: boolean
  };
}

export const cssSelectors: VersionChanges<CssSelectorUpgradeData> = {
  [TargetVersion.V6]: []
};
