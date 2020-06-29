/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy} from '../core';

export interface AotCompilerOptions {
  locale?: string;
  i18nFormat?: string;
  i18nUseExternalIds?: boolean;
  translations?: string;
  missingTranslation?: MissingTranslationStrategy;
  enableSummariesForJit?: boolean;
  preserveWhitespaces?: boolean;
  fullTemplateTypeCheck?: boolean;
  allowEmptyCodegenFiles?: boolean;
  strictInjectionParameters?: boolean;
  enableIvy?: boolean|'ngtsc';
  createExternalSymbolFactoryReexports?: boolean;
}
