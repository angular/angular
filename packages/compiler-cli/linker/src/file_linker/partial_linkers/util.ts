/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {R3Reference} from '@angular/compiler';
import * as o from '@angular/compiler/src/output/output_ast';
import {AstValue} from '../../ast/ast_value';
import {FatalLinkerError} from '../../fatal_linker_error';

export function wrapReference<TExpression>(wrapped: o.WrappedNodeExpr<TExpression>): R3Reference {
  return {value: wrapped, type: wrapped};
}

/**
 * Parses the value of an enum from the AST value's symbol name.
 */
export function parseEnum<TExpression, TEnum>(
    value: AstValue<unknown, TExpression>, Enum: TEnum): TEnum[keyof TEnum] {
  const symbolName = value.getSymbolName();
  if (symbolName === null) {
    throw new FatalLinkerError(value.expression, 'Expected value to have a symbol name');
  }
  const enumValue = Enum[symbolName as keyof typeof Enum];
  if (enumValue === undefined) {
    throw new FatalLinkerError(value.expression, `Unsupported enum value for ${Enum}`);
  }
  return enumValue;
}
