/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SchemaMetadata} from '@angular/compiler';
import ts from 'typescript';

import {Reference} from '../../../imports';
import {PartialEvaluator} from '../../../partial_evaluator';

import {createValueHasWrongTypeError} from './diagnostics';

export function extractSchemas(
  rawExpr: ts.Expression,
  evaluator: PartialEvaluator,
  context: string,
): SchemaMetadata[] {
  const schemas: SchemaMetadata[] = [];
  const result = evaluator.evaluate(rawExpr);
  if (!Array.isArray(result)) {
    throw createValueHasWrongTypeError(rawExpr, result, `${context}.schemas must be an array`);
  }

  for (const schemaRef of result) {
    if (!(schemaRef instanceof Reference)) {
      throw createValueHasWrongTypeError(
        rawExpr,
        result,
        `${context}.schemas must be an array of schemas`,
      );
    }
    const id = schemaRef.getIdentityIn(schemaRef.node.getSourceFile());
    if (id === null || schemaRef.ownedByModuleGuess !== '@angular/core') {
      throw createValueHasWrongTypeError(
        rawExpr,
        result,
        `${context}.schemas must be an array of schemas`,
      );
    }
    // Since `id` is the `ts.Identifier` within the schema ref's declaration file, it's safe to
    // use `id.text` here to figure out which schema is in use. Even if the actual reference was
    // renamed when the user imported it, these names will match.
    switch (id.text) {
      case 'CUSTOM_ELEMENTS_SCHEMA':
        schemas.push(CUSTOM_ELEMENTS_SCHEMA);
        break;
      case 'NO_ERRORS_SCHEMA':
        schemas.push(NO_ERRORS_SCHEMA);
        break;
      default:
        throw createValueHasWrongTypeError(
          rawExpr,
          schemaRef,
          `'${schemaRef.debugName}' is not a valid ${context} schema`,
        );
    }
  }
  return schemas;
}
