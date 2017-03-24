/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseSourceSpan} from '../parse_util';

import * as o from './output_ast';


/**
 * Create a new class stmts based on the given data.
 */
export function createClassStmt(config: {
  name: string,
  parent?: o.Expression,
  parentArgs?: o.Expression[],
  ctorParams?: o.FnParam[],
  builders: ClassBuilderPart | ClassBuilderPart[],
  modifiers?: o.StmtModifier[],
  sourceSpan?: ParseSourceSpan
}): o.ClassStmt {
  const parentArgs = config.parentArgs || [];
  const superCtorStmts = config.parent ? [o.SUPER_EXPR.callFn(parentArgs).toStmt()] : [];
  const builder =
      concatClassBuilderParts(Array.isArray(config.builders) ? config.builders : [config.builders]);
  const ctor =
      new o.ClassMethod(null, config.ctorParams || [], superCtorStmts.concat(builder.ctorStmts));

  return new o.ClassStmt(
      config.name, config.parent || null, builder.fields, builder.getters, ctor, builder.methods,
      config.modifiers || [], config.sourceSpan);
}

function concatClassBuilderParts(builders: ClassBuilderPart[]) {
  return {
    fields: [].concat(...(builders.map((builder => builder.fields || [])) as any)),
    methods: [].concat(...(builders.map(builder => builder.methods || []) as any)),
    getters: [].concat(...(builders.map(builder => builder.getters || []) as any)),
    ctorStmts: [].concat(...(builders.map(builder => builder.ctorStmts || []) as any)),
  };
}

/**
 * Collects data for a generated class.
 */
export interface ClassBuilderPart {
  fields?: o.ClassField[];
  methods?: o.ClassMethod[];
  getters?: o.ClassGetter[];
  ctorStmts?: o.Statement[];
}

/**
 * Collects data for a generated class.
 */
export interface ClassBuilder {
  fields: o.ClassField[];
  methods: o.ClassMethod[];
  getters: o.ClassGetter[];
  ctorStmts: o.Statement[];
}
