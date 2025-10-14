/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {OpKind} from '../enums';
import {TRAIT_CONSUMES_VARS} from '../traits';
import {NEW_OP} from './shared';
export function createDomPropertyOp(
  name,
  expression,
  bindingKind,
  i18nContext,
  securityContext,
  sourceSpan,
) {
  return {
    kind: OpKind.DomProperty,
    name,
    expression,
    bindingKind,
    i18nContext,
    securityContext,
    sanitizer: null,
    sourceSpan,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}
//# sourceMappingURL=host.js.map
