/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '@angular/compiler';
import * as ts from 'typescript';

/**
 * Converts a directive metadata object into a TypeScript expression. Throws
 * if metadata cannot be cleanly converted.
 */
export function convertDirectiveMetadataToExpression(
    metadata: any, resolveSymbolImport: (symbol: StaticSymbol) => string | null,
    createImport: (moduleName: string, name: string) => ts.Expression,
    convertProperty?: (key: string, value: any) => ts.Expression | null): ts.Expression {
  if (typeof metadata === 'string') {
    return ts.createStringLiteral(metadata);
  } else if (Array.isArray(metadata)) {
    return ts.createArrayLiteral(metadata.map(
        el => convertDirectiveMetadataToExpression(
            el, resolveSymbolImport, createImport, convertProperty)));
  } else if (typeof metadata === 'number') {
    return ts.createNumericLiteral(metadata.toString());
  } else if (typeof metadata === 'boolean') {
    return metadata ? ts.createTrue() : ts.createFalse();
  } else if (typeof metadata === 'undefined') {
    return ts.createIdentifier('undefined');
  } else if (typeof metadata === 'bigint') {
    return ts.createBigIntLiteral(metadata.toString());
  } else if (typeof metadata === 'object') {
    // In case there is a static symbol object part of the metadata, try to resolve
    // the import expression of the symbol. If no import path could be resolved, an
    // error will be thrown as the symbol cannot be converted into TypeScript AST.
    if (metadata instanceof StaticSymbol) {
      const resolvedImport = resolveSymbolImport(metadata);
      if (resolvedImport === null) {
        throw new UnexpectedMetadataValueError();
      }
      return createImport(resolvedImport, metadata.name);
    }

    const literalProperties: ts.PropertyAssignment[] = [];

    for (const key of Object.keys(metadata)) {
      const metadataValue = metadata[key];
      let propertyValue: ts.Expression|null = null;

      // Allows custom conversion of properties in an object. This is useful for special
      // cases where we don't want to store the enum values as integers, but rather use the
      // real enum symbol. e.g. instead of `2` we want to use `ViewEncapsulation.None`.
      if (convertProperty) {
        propertyValue = convertProperty(key, metadataValue);
      }

      // In case the property value has not been assigned to an expression, we convert
      // the resolved metadata value into a TypeScript expression.
      if (propertyValue === null) {
        propertyValue = convertDirectiveMetadataToExpression(
            metadataValue, resolveSymbolImport, createImport, convertProperty);
      }

      literalProperties.push(ts.createPropertyAssignment(key, propertyValue));
    }

    return ts.createObjectLiteral(literalProperties, true);
  }

  throw new UnexpectedMetadataValueError();
}

/** Error that will be thrown if a unexpected value needs to be converted. */
export class UnexpectedMetadataValueError extends Error {}
