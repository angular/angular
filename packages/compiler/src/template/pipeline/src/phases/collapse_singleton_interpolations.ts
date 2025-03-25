/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Attribute interpolations of the form `[attr.foo]="{{foo}}""` should be "collapsed" into a plain
 * attribute instruction, instead of an `attributeInterpolate` instruction.
 *
 * (We cannot do this for singleton property interpolations, because `propertyInterpolate`
 * stringifies its expression.)
 *
 * The reification step is also capable of performing this transformation, but doing it early in the
 * pipeline allows other phases to accurately know what instruction will be emitted.
 */
export function collapseSingletonInterpolations(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      const eligibleOpKind = op.kind === ir.OpKind.Attribute;
      if (
        eligibleOpKind &&
        op.expression instanceof ir.Interpolation &&
        op.expression.strings.length === 2 &&
        op.expression.strings.every((s: string) => s === '')
      ) {
        op.expression = op.expression.expressions[0];
      }
    }
  }
}
