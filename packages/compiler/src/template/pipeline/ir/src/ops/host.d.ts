/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../../../../../src/output/output_ast';
import { ParseSourceSpan } from '../../../../../../src/parse_util';
import { SecurityContext } from '../../../../../core';
import { BindingKind, OpKind } from '../enums';
import { Op, XrefId } from '../operations';
import { ConsumesVarsTrait } from '../traits';
import type { Interpolation, UpdateOp } from './update';
/**
 * Logical operation representing a binding to a native DOM property.
 */
export interface DomPropertyOp extends Op<UpdateOp>, ConsumesVarsTrait {
    kind: OpKind.DomProperty;
    name: string;
    expression: o.Expression | Interpolation;
    bindingKind: BindingKind;
    i18nContext: XrefId | null;
    securityContext: SecurityContext | SecurityContext[];
    sanitizer: o.Expression | null;
    sourceSpan: ParseSourceSpan;
}
export declare function createDomPropertyOp(name: string, expression: o.Expression | Interpolation, bindingKind: BindingKind, i18nContext: XrefId | null, securityContext: SecurityContext | SecurityContext[], sourceSpan: ParseSourceSpan): DomPropertyOp;
