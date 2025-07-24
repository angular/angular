/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {fixInvalidBananaInBoxMeta} from './fix_invalid_banana_in_box';
import {missingImportMeta} from './fix_missing_import';
import {missingMemberMeta} from './fix_missing_member';
import {fixUnusedStandaloneImportsMeta} from './fix_unused_standalone_imports';
import {fixMissingRequiredInput} from './fix_missing_required_inputs';
import {CodeActionMeta} from './utils';

export const ALL_CODE_FIXES_METAS: CodeActionMeta[] = [
  missingMemberMeta,
  fixInvalidBananaInBoxMeta,
  missingImportMeta,
  fixUnusedStandaloneImportsMeta,
  fixMissingRequiredInput,
];
