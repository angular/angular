/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../diagnostics/index.js';

import {TemplateCheckFactory} from './api/index.js';
import {factory as invalidBananaInBoxFactory} from './checks/invalid_banana_in_box/index.js';
import {factory as nullishCoalescingNotNullableFactory} from './checks/nullish_coalescing_not_nullable/index.js';

export {ExtendedTemplateCheckerImpl} from './src/extended_template_checker.js';

export const ALL_DIAGNOSTIC_FACTORIES:
    readonly TemplateCheckFactory<ErrorCode, ExtendedTemplateDiagnosticName>[] = [
      invalidBananaInBoxFactory,
      nullishCoalescingNotNullableFactory,
    ];
