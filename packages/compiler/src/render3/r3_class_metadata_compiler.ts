/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../output/output_ast';

import {Identifiers as R3} from './r3_identifiers';
import {devOnlyGuardedExpression} from './util';

export type CompileClassMetadataFn = (metadata: R3ClassMetadata) => o.Expression;

/**
 * Metadata of a class which captures the original Angular decorators of a class. The original
 * decorators are preserved in the generated code to allow TestBed APIs to recompile the class
 * using the original decorator with a set of overrides applied.
 */
export interface R3ClassMetadata {
  /**
   * The class type for which the metadata is captured.
   */
  type: o.Expression;

  /**
   * An expression representing the Angular decorators that were applied on the class.
   */
  decorators: o.Expression;

  /**
   * An expression representing the Angular decorators applied to constructor parameters, or `null`
   * if there is no constructor.
   */
  ctorParameters: o.Expression|null;

  /**
   * An expression representing the Angular decorators that were applied on the properties of the
   * class, or `null` if no properties have decorators.
   */
  propDecorators: o.Expression|null;
}

export function compileClassMetadata(metadata: R3ClassMetadata): o.Expression {
  // Generate an ngDevMode guarded call to setClassMetadata with the class identifier and its
  // metadata.
  const fnCall = o.importExpr(R3.setClassMetadata).callFn([
    metadata.type,
    metadata.decorators,
    metadata.ctorParameters ?? o.literal(null),
    metadata.propDecorators ?? o.literal(null),
  ]);
  const iife = o.fn([], [devOnlyGuardedExpression(fnCall).toStmt()]);
  return iife.callFn([]);
}
