/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../output/output_ast';

export const BINARY_OPERATORS = new Map([
  ['&&', o.BinaryOperator.And],
  ['>', o.BinaryOperator.Bigger],
  ['>=', o.BinaryOperator.BiggerEquals],
  ['&', o.BinaryOperator.BitwiseAnd],
  ['/', o.BinaryOperator.Divide],
  ['==', o.BinaryOperator.Equals],
  ['===', o.BinaryOperator.Identical],
  ['<', o.BinaryOperator.Lower],
  ['<=', o.BinaryOperator.LowerEquals],
  ['-', o.BinaryOperator.Minus],
  ['%', o.BinaryOperator.Modulo],
  ['*', o.BinaryOperator.Multiply],
  ['!=', o.BinaryOperator.NotEquals],
  ['!==', o.BinaryOperator.NotIdentical],
  ['??', o.BinaryOperator.NullishCoalesce],
  ['||', o.BinaryOperator.Or],
  ['+', o.BinaryOperator.Plus],
]);
