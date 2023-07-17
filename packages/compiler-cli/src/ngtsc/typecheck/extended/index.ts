/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../diagnostics';

import {TemplateCheckFactory} from './api';
import {factory as invalidBananaInBoxFactory} from './checks/invalid_banana_in_box';
import {factory as missingControlFlowDirectiveFactory} from './checks/missing_control_flow_directive';
import {factory as missingNgForOfLetFactory} from './checks/missing_ngforof_let';
import {factory as nullishCoalescingNotNullableFactory} from './checks/nullish_coalescing_not_nullable';
import {factory as optionalChainNotNullableFactory} from './checks/optional_chain_not_nullable';
import {factory as suffixNotSupportedFactory} from './checks/suffix_not_supported';
import {factory as textAttributeNotBindingFactory} from './checks/text_attribute_not_binding';

export {ExtendedTemplateCheckerImpl} from './src/extended_template_checker';

export const ALL_DIAGNOSTIC_FACTORIES:
    readonly TemplateCheckFactory<ErrorCode, ExtendedTemplateDiagnosticName>[] = [
      invalidBananaInBoxFactory,
      nullishCoalescingNotNullableFactory,
      optionalChainNotNullableFactory,
      missingControlFlowDirectiveFactory,
      textAttributeNotBindingFactory,
      missingNgForOfLetFactory,
      suffixNotSupportedFactory,
    ];
