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
import {fixCssPropertyMeta} from './fix_css_property';
import {fixCssShorthandConflictMeta} from './fix_css_shorthand_conflict';
import {fixCssUnitValueMeta} from './fix_css_unit_value';
import {fixCssValueMeta} from './fix_css_value';
import {CodeActionMeta} from './utils';

export const ALL_CODE_FIXES_METAS: CodeActionMeta[] = [
  missingMemberMeta,
  fixInvalidBananaInBoxMeta,
  missingImportMeta,
  fixUnusedStandaloneImportsMeta,
  fixMissingRequiredInput,
  fixCssPropertyMeta,
  fixCssShorthandConflictMeta,
  fixCssUnitValueMeta,
  fixCssValueMeta,
];
