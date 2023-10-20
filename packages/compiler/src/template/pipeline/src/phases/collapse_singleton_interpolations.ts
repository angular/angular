/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import {Identifiers as R3} from '../../../../render3/r3_identifiers';
import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Attribute interpolations of the form `[attr.foo]="{{foo}}""` should be "collapsed" into a plain
 * attribute instruction, instead of an `attributeInterpolate` instruction. We should also do this
 * for property instructions, when not in compatibility mode.
 *
 * The reification step is also capable of performing this transformation, but doing it early in the
 * pipeline allows other phases to accurately know what instruction will be emitted.
 */
export function phaseCollapseSingletonInterpolations(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      const eligibleOpKind =
          op.kind === ir.OpKind.Attribute || (!job.compatibility && op.kind === ir.OpKind.Property);
      if (eligibleOpKind && op.expression instanceof ir.Interpolation &&
          op.expression.strings.length === 2 &&
          op.expression.strings.every((s: string) => s === '')) {
        op.expression = op.expression.expressions[0];
      }
    }
  }
}
