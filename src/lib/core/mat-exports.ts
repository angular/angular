/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MdCommonModule} from './common-behaviors/common-module';
import {
  MD_DATE_FORMATS,
  MD_NATIVE_DATE_FORMATS,
  MdDateFormats,
  MdNativeDateModule,
} from './datetime/index';
import {MD_ERROR_GLOBAL_OPTIONS} from './error/error-options';
import {MdLine, MdLineModule, MdLineSetter} from './line/line';
import {
  MdOptgroup,
  MdOptgroupBase,
  MdOption,
  MdOptionModule,
  MdOptionSelectionChange,
} from './option/index';
import {MD_PLACEHOLDER_GLOBAL_OPTIONS} from './placeholder/placeholder-options';
import {MD_RIPPLE_GLOBAL_OPTIONS, MdRipple, MdRippleModule} from './ripple/index';
import {MdPseudoCheckbox, MdPseudoCheckboxModule, MdPseudoCheckboxState} from './selection/index';

export {MD_DATE_FORMATS as MAT_DATE_FORMATS};
export {MD_RIPPLE_GLOBAL_OPTIONS as MAT_RIPPLE_GLOBAL_OPTIONS};
export {MD_NATIVE_DATE_FORMATS as MAT_NATIVE_DATE_FORMATS};
export {MD_PLACEHOLDER_GLOBAL_OPTIONS as MAT_PLACEHOLDER_GLOBAL_OPTIONS};
export {MD_ERROR_GLOBAL_OPTIONS as MAT_ERROR_GLOBAL_OPTIONS};
export {MdCommonModule as MatCommonModule};
export {MdDateFormats as MatDateFormats};
export {MdLine as MatLine};
export {MdLineModule as MatLineModule};
export {MdLineSetter as MatLineSetter};
export {MdOptgroup as MatOptgroup};
export {MdOptgroupBase as MatOptgroupBase};
export {MdOption as MatOption};
export {MdOptionModule as MatOptionModule};
export {MdOptionSelectionChange as MatOptionSelectionChange};
export {MdNativeDateModule as MatNativeDateModule};
export {MdPseudoCheckbox as MatPseudoCheckbox};
export {MdPseudoCheckboxModule as MatPseudoCheckboxModule};
export {MdPseudoCheckboxState as MatPseudoCheckboxState};
export {MdRipple as MatRipple};
export {MdRippleModule as MatRippleModule};
