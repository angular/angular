/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {missingMemberMeta} from './fix_missing_member';
import {CodeActionMeta} from './utils';

export const ALL_CODE_FIXES_METAS: CodeActionMeta[] = [missingMemberMeta];
