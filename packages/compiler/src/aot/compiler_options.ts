/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy} from '../core';

export interface AotCompilerOptions {
  locale?: string;
  i18nFormat?: string;
  translations?: string;
  missingTranslation?: MissingTranslationStrategy;
  enableLegacyTemplate?: boolean;
  /** TODO(tbosch): remove this flag as it is always on in the new ngc */
  enableSummariesForJit?: boolean;
  preserveWhitespaces?: boolean;
  fullTemplateTypeCheck?: boolean;
  allowEmptyCodegenFiles?: boolean;
  strictInjectionParameters?: boolean;
}
