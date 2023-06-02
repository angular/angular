/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../../../src/output/output_ast';
import {ParseSourceSpan} from '../../../../../../src/parse_util';
import {OpKind} from '../enums';
import {Interpolation} from '../interpolation';
import {Op} from '../operations';
import {ConsumesVarsTrait, TRAIT_CONSUMES_VARS} from '../traits';

import {NEW_OP} from './shared';
import type {UpdateOp} from './update';


/**
 * Logical operation representing a host binding to a property.
 */
export interface HostPropertyOp extends Op<UpdateOp>, ConsumesVarsTrait {
  kind: OpKind.HostProperty;
  name: string;
  expression: o.Expression|Interpolation;
  isAnimationTrigger: boolean;

  sourceSpan: ParseSourceSpan|null;
}

export function createHostPropertyOp(
    name: string, expression: o.Expression|Interpolation, isAnimationTrigger: boolean,
    sourceSpan: ParseSourceSpan|null): HostPropertyOp {
  return {
    kind: OpKind.HostProperty,
    name,
    expression,
    isAnimationTrigger,
    sourceSpan,
    ...TRAIT_CONSUMES_VARS,
    ...NEW_OP,
  };
}
