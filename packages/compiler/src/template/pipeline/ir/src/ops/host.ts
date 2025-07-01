/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../../../src/output/output_ast';
import {ParseSourceSpan} from '../../../../../../src/parse_util';
import {SecurityContext} from '../../../../../core';
import {OpKind} from '../enums';
import {Op, XrefId} from '../operations';
import {ConsumesVarsTrait, TRAIT_CONSUMES_VARS} from '../traits';

import {NEW_OP} from './shared';

import type {Interpolation, UpdateOp} from './update';

/**
 * Logical operation representing a binding to a native DOM property.
 */
export interface DomPropertyOp extends Op<UpdateOp>, ConsumesVarsTrait {
  kind: OpKind.DomProperty;
  name: string;
  expression: o.Expression | Interpolation;
  isLegacyAnimationTrigger: boolean;

  i18nContext: XrefId | null;

  securityContext: SecurityContext | SecurityContext[];

  sanitizer: o.Expression | null;

  sourceSpan: ParseSourceSpan;
}

export function createDomPropertyOp(
  name: string,
  expression: o.Expression | Interpolation,
  isLegacyAnimationTrigger: boolean,
  i18nContext: XrefId | null,
  securityContext: SecurityContext | SecurityContext[],
  sourceSpan: ParseSourceSpan,
): DomPropertyOp {
  return {
    kind: OpKind.DomProperty,
    name,
    expression,
    isLegacyAnimationTrigger,
    i18nContext,
    securityContext,
    sanitizer: null,
    sourceSpan,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}
